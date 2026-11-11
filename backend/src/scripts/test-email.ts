
import "dotenv/config";

import { verifySMTP } from "../config/mailer";

import { sendEmail } from "../services/mailer.service";

async function testEmail() {

    try {

        // Step 1: Verify SMTP
        await verifySMTP();

        // Step 2: Send test email
        const result = await sendEmail({

            recipient: "test@gmail.com",

            subject: "My First Email Scheduler Test",

            body: "Hello! My Nodemailer integration is working successfully."

        });

        console.log("\nEmail Result:");

        console.log(result);

        console.log("\nOpen the Ethereal preview URL to see your email.");

    } catch (error) {

        console.error("Email test failed:", error);

    }

}

void testEmail();
