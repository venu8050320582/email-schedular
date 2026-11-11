import elasticClient from "../config/elasticsearch";
import pool from "../config/database";
import type { RowDataPacket } from "mysql2";
const INDEX_NAME = "emails";

export const createEmailIndex = async () => {
  const exists = await elasticClient.indices.exists({
    index: INDEX_NAME,
  });

  if (exists) {
    console.log("Emails index already exists!");
    return;
  }

  await elasticClient.indices.create({
    index: INDEX_NAME,

    mappings: {
      properties: {
        id: { type: "keyword" },
        recipient: {
          type: "text",
          fields: {
            keyword: { type: "keyword" },
          },
        },
        subject: { type: "text" },
        body: { type: "text" },
        status: { type: "keyword" },
        scheduled_at: { type: "date" },
        sent_at: { type: "date" },
        created_at: { type: "date" },
      },
    },
  });

  console.log("Emails index created successfully!");
};
export const searchEmails = async (searchText: string) => {
  const result = await elasticClient.search({
    index: "emails",
    query: {
      bool: {
        should: [
          {
            match: {
              recipient: {
                query: searchText,
                boost: 3,
              },
            },
          },
          {
            match: {
              subject: {
                query: searchText,
                boost: 2,
              },
            },
          },
          {
            match: {
              body: searchText,
            },
          },
          {
            term: {
              status: searchText.toUpperCase(),
            },
          },
        ],
        minimum_should_match: 1,
      },
    },
  });

  return result.hits.hits.map((hit) => ({
    id: hit._id,
    ...((hit._source ?? {}) as Record<string, unknown>),
  }));
};
interface EmailSearchRow extends RowDataPacket {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
}

export const syncEmailToSearch = async (emailId: number) => {
  const [rows] = await pool.execute<EmailSearchRow[]>(
    `SELECT id, recipient, subject, body, status,
            scheduled_at, sent_at, created_at
     FROM emails
     WHERE id = ?`,
    [emailId]
  );

  const email = rows[0];

  if (!email) {
    throw new Error(`Email ${emailId} not found in MySQL`);
  }

  await elasticClient.index({
    index: "emails",
    id: String(email.id),
    document: {
      id: String(email.id),
      recipient: email.recipient,
      subject: email.subject,
      body: email.body,
      status: email.status,
      scheduled_at: email.scheduled_at,
      sent_at: email.sent_at,
      created_at: email.created_at,
    },
    refresh: true,
  });

  console.log(`Email ${emailId} synchronized with Elasticsearch`);
};

export const removeEmailFromSearch = async (emailId: number) => {
  await elasticClient.delete({
    index: "emails",
    id: String(emailId),
    refresh: true,
  });

  console.log(`Email ${emailId} removed from Elasticsearch`);
};