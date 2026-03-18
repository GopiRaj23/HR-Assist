import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { AppError, errorResponse } from "../types";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.code, err.message));
    return;
  }

  // Multer file upload errors
  if (err instanceof MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE: "File too large. Maximum size is 100MB.",
      LIMIT_UNEXPECTED_FILE: 'Unexpected field name. Use "audio" as the field name.',
    };
    const message = messages[err.code] || `Upload error: ${err.message}`;
    res.status(400).json(errorResponse("UPLOAD_ERROR", message));
    return;
  }

  // Unexpected errors
  console.error("Unhandled error:", err);
  res.status(500).json(
    errorResponse("INTERNAL_ERROR", "An unexpected error occurred.")
  );
}
