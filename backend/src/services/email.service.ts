
import { emailQueue } from "../queues/email.queues";
import * as EmailModel from "../models/email.model";
import {
  syncEmailToSearch,
  removeEmailFromSearch,
} from "./elasticsearch.service";

// Custom error
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Validate email input
const emailSchema = {
  parse(data: unknown) {
    if (typeof data !== "object" || data === null) {
      throw new AppError("Invalid email data", 400);
    }

    const input = data as Record<string, unknown>;

    const recipient =
      typeof input.recipient === "string"
        ? input.recipient.trim()
        : "";

    const subject =
      typeof input.subject === "string"
        ? input.subject.trim()
        : "";

    const body =
      typeof input.body === "string"
        ? input.body.trim()
        : "";

    const scheduledAt = input.scheduledAt;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      throw new AppError("Invalid email address", 400);
    }

    if (!subject) {
      throw new AppError("Subject is required", 400);
    }

    if (subject.length > 255) {
      throw new AppError(
        "Subject must contain at most 255 characters",
        400
      );
    }

    if (!body) {
      throw new AppError("Email body is required", 400);
    }

    if (
      typeof scheduledAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(scheduledAt) ||
      !Number.isFinite(Date.parse(scheduledAt))
    ) {
      throw new AppError("Invalid scheduled date", 400);
    }

    return {
      recipient,
      subject,
      body,
      scheduledAt,
    };
  },
};

// Convert ISO date into UTC MySQL DATETIME
const convertToMySQLDate = (date: string) => {
  return new Date(date)
    .toISOString()
    .slice(0, 23)
    .replace("T", " ");
};

// Validate future date
const validateFutureDate = (date: string) => {
  const scheduledTime = new Date(date).getTime();

  if (!Number.isFinite(scheduledTime)) {
    throw new AppError("Invalid scheduled date", 400);
  }

  if (scheduledTime <= Date.now()) {
    throw new AppError(
      "Scheduled time must be in the future",
      400
    );
  }
};

// Elasticsearch sync helper
const safeSyncEmail = async (id: number) => {
  try {
    await syncEmailToSearch(id);
  } catch (error) {
    console.error(
      `Elasticsearch synchronization failed for email ${id}:`,
      error
    );
  }
};

// CREATE EMAIL SERVICE
export const createEmailService = async (data: unknown) => {
  const validatedData = emailSchema.parse(data);

  validateFutureDate(validatedData.scheduledAt);

  const scheduledAt = convertToMySQLDate(
    validatedData.scheduledAt
  );

  // Step 1: Save email in MySQL
  const id = await EmailModel.createEmail({
    ...validatedData,
    scheduledAt,
  });

  // Step 2: Calculate delay
  const delay =
    new Date(validatedData.scheduledAt).getTime() -
    Date.now();

  // Step 3: Create BullMQ job
  const jobId = `email-${id}`;

  try {
    await emailQueue.add(
      "send-email",
      { emailId: id },
      {
        jobId,
        delay: Math.max(0, delay),
      }
    );

    // Step 4: Save job ID in MySQL
    await EmailModel.updateEmailJobId(id, jobId);
  } catch (error) {
    console.error("Queue scheduling failed:", error);

    throw new AppError(
      "Email saved, but scheduling failed. Please retry after checking the queue.",
      503
    );
  }

  // Step 5: Synchronize with Elasticsearch
  await safeSyncEmail(id);

  return await EmailModel.getEmailById(id);
};

// GET ALL EMAILS SERVICE
export const getAllEmailsService = async (
  status?: string,
  search?: string,
  page = 1,
  limit = 20
) => {
  const allowedStatuses = [
    "SCHEDULED",
    "PROCESSING",
    "SENT",
    "FAILED",
    "CANCELLED",
  ];

  if (status && !allowedStatuses.includes(status)) {
    throw new AppError("Invalid email status", 400);
  }

  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  const offset = (validPage - 1) * validLimit;

  const emails = await EmailModel.getAllEmails(
    status,
    search,
    validLimit,
    offset
  );

  return {
    emails,
    pagination: {
      page: validPage,
      limit: validLimit,
      count: emails.length,
    },
  };
};

// GET EMAIL BY ID SERVICE
export const getEmailByIdService = async (id: number) => {
  const email = await EmailModel.getEmailById(id);

  if (!email) {
    throw new AppError("Email not found", 404);
  }

  return email;
};

// UPDATE EMAIL SERVICE
export const updateEmailService = async (
  id: number,
  data: unknown
) => {
  const validatedData = emailSchema.parse(data);

  validateFutureDate(validatedData.scheduledAt);

  const email = await EmailModel.getEmailById(id);

  if (!email) {
    throw new AppError("Email not found", 404);
  }

  if (email.status !== "SCHEDULED") {
    throw new AppError(
      "Only scheduled emails can be updated",
      409
    );
  }

  // Update MySQL
  await EmailModel.updateEmail(id, {
    ...validatedData,
    scheduledAt: convertToMySQLDate(
      validatedData.scheduledAt
    ),
  });

  // Update BullMQ delayed job
  if (email.job_id) {
    const job = await emailQueue.getJob(email.job_id);

    if (job) {
      const state = await job.getState();

      if (state === "delayed" || state === "waiting") {
        await job.remove();

        const delay =
          new Date(validatedData.scheduledAt).getTime() -
          Date.now();

        await emailQueue.add(
          "send-email",
          { emailId: id },
          {
            jobId: email.job_id,
            delay: Math.max(0, delay),
          }
        );
      }
    }
  }

  // Synchronize updated email
  await safeSyncEmail(id);

  return await EmailModel.getEmailById(id);
};

// CANCEL EMAIL SERVICE
export const cancelEmailService = async (id: number) => {
  const email = await EmailModel.getEmailById(id);

  if (!email) {
    throw new AppError("Email not found", 404);
  }

  if (email.status !== "SCHEDULED") {
    throw new AppError(
      "Only scheduled emails can be cancelled",
      409
    );
  }

  // Find BullMQ job
  if (email.job_id) {
    const job = await emailQueue.getJob(email.job_id);

    if (job) {
      const state = await job.getState();

      if (state === "active") {
        throw new AppError(
          "Email is already being processed",
          409
        );
      }

      await job.remove();
    }
  }

  // Update MySQL status
  await EmailModel.cancelEmail(id);

  // Synchronize cancellation with Elasticsearch
  await safeSyncEmail(id);

  return await EmailModel.getEmailById(id);
};

// DELETE EMAIL SERVICE
export const deleteEmailService = async (id: number) => {
  const email = await EmailModel.getEmailById(id);

  if (!email) {
    throw new AppError("Email not found", 404);
  }

  if (email.status === "PROCESSING") {
    throw new AppError(
      "Cannot delete an email being processed",
      409
    );
  }

  // Delete from MySQL
  await EmailModel.deleteEmail(id);

  // Remove from Elasticsearch
  try {
    await removeEmailFromSearch(id);
  } catch (error) {
    console.error(
      `Elasticsearch deletion failed for email ${id}:`,
      error
    );
  }

  return {
    message: "Email deleted successfully",
  };
};

// STATISTICS SERVICE
export const getEmailStatsService = async () => {
  return await EmailModel.getEmailStats();
};
