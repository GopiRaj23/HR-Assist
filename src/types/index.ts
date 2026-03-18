// ============================================================
// HR Assist MVP — Type Definitions
// ============================================================

/** A single segment from the Whisper transcription */
export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

/** A matched question-answer pair from the interview */
export interface QAPair {
  questionNumber: number;
  question: string;
  answer: string;
  questionStart: number;
  questionEnd: number;
  answerStart: number;
  answerEnd: number;
}

/** GPT's analysis of a single Q&A pair */
export interface AnswerAnalysis {
  questionNumber: number;
  question: string;
  answerSummary: string;
  relevanceScore: number;
  clarityScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
}

/** The complete interview report */
export interface InterviewReport {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: "processing" | "completed" | "failed";
  duration: number | null;
  overallScore: number | null;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  recommendation: string | null;
  questionAnalyses: AnswerAnalysis[];
  transcript: TranscriptSegment[];
  error: string | null;
}

/** Standardized API response wrapper (matches docs/api_contracts.md) */
export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details: string[];
  } | null;
  meta: {
    timestamp: string;
  };
}

/** Custom application error with HTTP status code */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** Helper to build a success API response */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    meta: { timestamp: new Date().toISOString() },
  };
}

/** Helper to build an error API response */
export function errorResponse(
  code: string,
  message: string,
  details: string[] = []
): ApiResponse<null> {
  return {
    data: null,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString() },
  };
}
