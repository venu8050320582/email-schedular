
import nodemailer from "nodemailer";

async function createEtherealAccount() {

    try {

        const account = await nodemailer.createTestAccount();

        console.log("\nEthereal Account Created!\n");

        console.log("Username:", account.user);

        console.log("Password:", account.pass);

        console.log("SMTP Host:", account.smtp.host);

        console.log("SMTP Port:", account.smtp.port);

        console.log("Secure:", account.smtp.secure);

    } catch (error) {

        console.error("Ethereal account creation failed:", error);

    }

}

void createEtherealAccount();
