import "dotenv/config";

import pool from "../config/database";
import elasticClient from "../config/elasticsearch";
import { createEmailIndex } from "../services/elasticsearch.service";

import type { RowDataPacket } from "mysql2";

interface EmailRow extends RowDataPacket {
  id: number;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
}

async function syncEmails() {
  try {
    // Step 1: Create index
    await createEmailIndex();

    // Step 2: Get emails from MySQL
    const [emails] = await pool.query<EmailRow[]>(
      `SELECT id, recipient, subject, body, status,
              scheduled_at, sent_at, created_at
       FROM emails`
    );

    console.log("MySQL Emails Found:", emails.length);

    if (emails.length === 0) {
      console.log("No emails available to synchronize.");
      return;
    }

    // Step 3: Prepare Elasticsearch bulk operations
    const operations = emails.flatMap((email) => [
      {
        index: {
          _index: "emails",
          _id: String(email.id),
        },
      },
      {
        id: String(email.id),
        recipient: email.recipient,
        subject: email.subject,
        body: email.body,
        status: email.status,
        scheduled_at: email.scheduled_at,
        sent_at: email.sent_at,
        created_at: email.created_at,
      },
    ]);

    // Step 4: Insert into Elasticsearch
    const result = await elasticClient.bulk({
      operations,
      refresh: true,
    });

    if (result.errors) {
      console.error(
        "Some emails failed to synchronize:",
        result.items.filter((item) => item.index?.error)
      );
    } else {
      console.log("All emails synchronized successfully!");
    }

  } catch (error) {
    console.error("Email synchronization failed:", error);
  } finally {
    await pool.end();
    await elasticClient.close();
  }
}

void syncEmails();