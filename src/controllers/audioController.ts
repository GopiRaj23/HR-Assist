import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { AppError, successResponse, InterviewReport } from "../types";
import { setReport } from "../storage/store";
import { processInterview } from "../services/pipelineService";

/**
 * POST /api/v1/upload-audio
 * Accept an audio file, create a report stub, and trigger async processing.
 */
export function uploadAudio(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    if (!req.file) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        'No audio file provided. Upload a file with field name "audio".'
      );
    }

    const id = uuidv4();
    const { path: filePath, originalname: fileName } = req.file;

    // Create initial report stub in storage
    const stub: InterviewReport = {
      id,
      fileName,
      uploadedAt: new Date().toISOString(),
      status: "processing",
      duration: null,
      overallScore: null,
      summary: null,
      strengths: [],
      weaknesses: [],
      recommendation: null,
      questionAnalyses: [],
      transcript: [],
      error: null,
    };
    setReport(stub);

    // Fire-and-forget: process asynchronously
    processInterview(id, filePath, fileName).catch((err) => {
      console.error(`[Controller] Unhandled pipeline error for ${id}:`, err);
    });

    res.status(202).json(
      successResponse({ id, status: "processing" })
    );
  } catch (err) {
    next(err);
  }
}
