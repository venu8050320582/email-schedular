
import type {
    Request,
    Response,
    NextFunction
} from "express";

import * as EmailService from "../services/email.service";

// CREATE EMAIL
export const createEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const email = await EmailService.createEmailService(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Email created successfully",
            data: email
        });

    } catch (error) {

        next(error);

    }
};

// GET ALL EMAILS
export const getAllEmails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const status = typeof req.query.status === "string"
            ? req.query.status.toUpperCase()
            : undefined;

        const search = typeof req.query.search === "string"
            ? req.query.search.trim()
            : undefined;

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 20;

        const result = await EmailService.getAllEmailsService(
            status,
            search,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);

    }
};

// GET EMAIL BY ID
export const getEmailById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid email ID"
            });
            return;
        }

        const email = await EmailService.getEmailByIdService(id);

        res.status(200).json({
            success: true,
            data: email
        });

    } catch (error) {

        next(error);

    }
};

// UPDATE EMAIL
export const updateEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid email ID"
            });
            return;
        }

        const email = await EmailService.updateEmailService(
            id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Email updated successfully",
            data: email
        });

    } catch (error) {

        next(error);

    }
};

// CANCEL EMAIL
export const cancelEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid email ID"
            });
            return;
        }

        const email = await EmailService.cancelEmailService(id);

        res.status(200).json({
            success: true,
            message: "Email cancelled successfully",
            data: email
        });

    } catch (error) {

        next(error);

    }
};

// DELETE EMAIL
export const deleteEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid email ID"
            });
            return;
        }

        const result = await EmailService.deleteEmailService(id);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        next(error);

    }
};

// EMAIL STATISTICS
export const getEmailStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const stats = await EmailService.getEmailStatsService();

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {

        next(error);

    }
};
