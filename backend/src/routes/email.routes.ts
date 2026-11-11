
import { Router } from "express";

import * as EmailController from "../controllers/email.controller";

const router = Router();

// 1. Get dashboard statistics
router.get(
    "/stats",
    EmailController.getEmailStats
);

// 2. Create a new email
router.post(
    "/",
    EmailController.createEmail
);

// 3. Get all emails
router.get(
    "/",
    EmailController.getAllEmails
);

// 4. Cancel a scheduled email
router.patch(
    "/:id/cancel",
    EmailController.cancelEmail
);

// 5. Update a scheduled email
router.patch(
    "/:id",
    EmailController.updateEmail
);

// 6. Delete an email
router.delete(
    "/:id",
    EmailController.deleteEmail
);

// 7. Get email by ID
router.get(
    "/:id",
    EmailController.getEmailById
);

export default router;
