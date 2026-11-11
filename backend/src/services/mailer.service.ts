
import nodemailer from "nodemailer";

import transporter from "../config/mailer";

interface SendEmailInput {
    recipient: string;
    subject: string;
    body: string;
}

const escapeHtml = (value: string): string => {

    return value.replace(/[&<>"']/g, character => {

        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

};

export const sendEmail = async (data: SendEmailInput) => {

    const info = await transporter.sendMail({

        from: `"Email Scheduler" <${process.env.SMTP_USER}>`,

        to: data.recipient,

        subject: data.subject,

        text: data.body,

        html: `
            <div style="font-family:Arial;padding:20px">
                <h2>${escapeHtml(data.subject)}</h2>
                <p>${escapeHtml(data.body).replace(/\n/g, "<br>")}</p>
                <hr/>
                <p>Email sent using Email Scheduler.</p>
            </div>
        `

    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log("Email sent successfully!");

    console.log("Message ID:", info.messageId);

    console.log("Preview URL:", previewUrl);

    return {
        messageId: info.messageId,
        previewUrl: previewUrl || null
    };

};
