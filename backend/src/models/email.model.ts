
import pool from "../config/database";

import {
    ResultSetHeader,
    RowDataPacket
} from "mysql2";

// Email interface
export interface Email {
    id: number;
    recipient: string;
    subject: string;
    body: string;
    scheduled_at: Date | string;
    status: string;
    job_id: string | null;
    sent_at: Date | string | null;
    last_error: string | null;
    created_at: Date | string;
}

// Create email input
export interface CreateEmailInput {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

// Update email input
export interface UpdateEmailInput {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

// Database row type
interface EmailRow extends Email, RowDataPacket {}

// CREATE EMAIL
export const createEmail = async (
    data: CreateEmailInput
) => {

    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO emails
        (recipient, subject, body, scheduled_at, status)
        VALUES (?, ?, ?, ?, ?)`,
        [
            data.recipient,
            data.subject,
            data.body,
            data.scheduledAt,
            "SCHEDULED"
        ]
    );

    return result.insertId;
};

// GET ALL EMAILS
export const getAllEmails = async (
    status?: string,
    search?: string,
    limit = 20,
    offset = 0
) => {

    let sql = "SELECT * FROM emails WHERE 1=1";

    const values: (string | number)[] = [];

    if (status) {
        sql += " AND status = ?";
        values.push(status);
    }

    if (search) {
        sql += " AND (recipient LIKE ? OR subject LIKE ?)";
        values.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

    values.push(limit, offset);

    const [rows] = await pool.execute<EmailRow[]>(
        sql,
        values
    );

    return rows;
};

// GET EMAIL BY ID
export const getEmailById = async (id: number) => {

    const [rows] = await pool.execute<EmailRow[]>(
        "SELECT * FROM emails WHERE id = ?",
        [id]
    );

    return rows[0] || null;
};

// UPDATE EMAIL
export const updateEmail = async (
    id: number,
    data: UpdateEmailInput
) => {

    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE emails
         SET recipient = ?,
             subject = ?,
             body = ?,
             scheduled_at = ?
         WHERE id = ?`,
        [
            data.recipient,
            data.subject,
            data.body,
            data.scheduledAt,
            id
        ]
    );

    return result.affectedRows;
};

// CANCEL EMAIL
export const cancelEmail = async (id: number) => {

    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE emails
         SET status = 'CANCELLED'
         WHERE id = ? AND status = 'SCHEDULED'`,
        [id]
    );

    return result.affectedRows;
};

// DELETE EMAIL
export const deleteEmail = async (id: number) => {

    const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM emails WHERE id = ?",
        [id]
    );

    return result.affectedRows;
};

// EMAIL STATISTICS
export const getEmailStats = async () => {

    const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT
            COUNT(*) AS total,
            SUM(status = 'SCHEDULED') AS scheduled,
            SUM(status = 'SENT') AS sent,
            SUM(status = 'FAILED') AS failed,
            SUM(status = 'CANCELLED') AS cancelled
         FROM emails`
    );

    return rows[0];
};

export const updateEmailJobId = async (
    id: number,
    jobId: string
) => {

    const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE emails
         SET job_id = ?
         WHERE id = ?`,
        [jobId, id]
    );

    return result.affectedRows;
};

