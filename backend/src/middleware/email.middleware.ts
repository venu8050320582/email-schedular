
import type { ErrorRequestHandler } from "express";

import { AppError } from "../services/email.service";

type ValidationError = {
    name: "ZodError";
    issues: Array<{
        path: Array<string | number>;
        message: string;
    }>;
};

const isValidationError = (error: unknown): error is ValidationError =>
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ZodError" &&
    "issues" in error &&
    Array.isArray(error.issues);

export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    next
) => {

    console.error(error);

    if (isValidationError(error)) {

        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });

        return;
    }

    if (error instanceof AppError) {

        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });

        return;
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

};
