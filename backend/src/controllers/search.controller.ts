import type { Request, Response, NextFunction } from "express";
import { searchEmails } from "../services/elasticsearch.service";

export const searchEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const searchText = String(req.query.q || "").trim();

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "Please enter a search keyword",
      });
    }

    const emails = await searchEmails(searchText);

    return res.status(200).json({
      success: true,
      count: emails.length,
      emails,
    });
  } catch (error) {
    next(error);
  }
};