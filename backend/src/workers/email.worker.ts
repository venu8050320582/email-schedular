
import "dotenv/config";

import { verifySMTP } from "../config/mailer";
import { syncEmailToSearch } from "../services/elasticsearch.service";

import { Worker } from "bullmq";

import type { RowDataPacket } from "mysql2";

import redisConnection from "../config/redis";

import pool from "../config/database";

import { sendEmail } from "../services/mailer.service";

interface EmailRow extends RowDataPacket {
    id: number;
    recipient: string;
    subject: string;
    body: string;
    status: string;
}

const emailWorker = new Worker(

    "email-queue",

    async (job) => {

        console.log("--------------------------------");

        console.log("Processing Email Job");

        const emailId = Number(job.data.emailId);

        console.log("Email ID:", emailId);

        // Step 1: Get email from MySQL
        const [rows] = await pool.execute<EmailRow[]>(
            "SELECT * FROM emails WHERE id = ?",
            [emailId]
        );

        const email = rows[0];

        if (!email) {
            throw new Error("Email record not found");
        }

        // Step 2: Check email status
        if (email.status === "CANCELLED") {
            return {
                success: false,
                message: "Email was cancelled"
            };
        }

        if (email.status === "SENT") {
            return {
                success: true,
                message: "Email already sent"
            };
        }

        // Step 3: Mark as processing
        const [claim] = await pool.execute(
            `UPDATE emails
             SET status = 'PROCESSING'
             WHERE id = ?
             AND status IN ('SCHEDULED', 'PROCESSING')`,
            [emailId]
        );

        // Step 4: Send email through SMTP
        const result = await sendEmail({

            recipient: email.recipient,

            subject: email.subject,

            body: email.body

        });

        // Step 5: Update MySQL after successful send
        await pool.execute(
            `UPDATE emails
             SET status = 'SENT',
                 sent_at = UTC_TIMESTAMP(3),
                 last_error = NULL
             WHERE id = ?
             AND status = 'PROCESSING'`,
            [emailId]
        );
        try {
    await syncEmailToSearch(Number(job.data.emailId));
    console.log("FAILED status synced to Elasticsearch!");
} catch (syncError) {
    console.error("Failed to sync FAILED status:", syncError);
}

        console.log("Email sent successfully!");// Sync SENT status to Elasticsearch
try {
    await syncEmailToSearch(emailId);
    console.log("Email synced to Elasticsearch!");
} catch (error) {
    console.error("Elasticsearch sync failed:", error);
}

        console.log("Message ID:", result.messageId);

        console.log("Preview:", result.previewUrl);

        console.log("--------------------------------");

        return {
            success: true,
            emailId,
            messageId: result.messageId,
            previewUrl: result.previewUrl
        };

    },

    {
        connection: redisConnection,
        concurrency: 5
    }

);

// Completed event
emailWorker.on("completed", (job) => {

    console.log(
        `Email job ${job.id} completed`
    );

});

// Failed event
emailWorker.on("failed", async (job, error) => {

    console.error(
        `Email job ${job?.id} failed:`,
        error.message
    );

    // Only mark FAILED after the final retry
    if (
        job?.data?.emailId &&
        job.attemptsMade >= (job.opts.attempts ?? 1)
    ) {

        try {

            await pool.execute(
                `UPDATE emails
                 SET status = 'FAILED',
                     last_error = ?
                 WHERE id = ?
                 AND status <> 'SENT'`,
                [error.message, job.data.emailId]
            );

        } catch (dbError) {

            console.error(
                "Unable to update failed email:",
                dbError
            );

        }

    }

});

emailWorker.on("error", (error) => {

    console.error("Worker Error:", error);

});

console.log("Email Worker Started!");
