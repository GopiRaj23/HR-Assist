import { setReport, getReport } from "../storage/store";
import { transcribeAudio } from "../transcription/transcribe";
import { segmentTranscript } from "../ai/segment";
import { analyzeAllPairs } from "../ai/analyze";
import { generateReport } from "../report/generateReport";
import { InterviewReport } from "../types";

/**
 * Run the full interview analysis pipeline asynchronously.
 * This is fire-and-forget — called from the controller without await.
 * Updates the report in storage as it progresses.
 */
export async function processInterview(
  id: string,
  filePath: string,
  fileName: string
): Promise<void> {
  const uploadedAt = new Date().toISOString();

  try {
    console.log(`[Pipeline] Starting processing for report ${id}`);

    // Step 1: Transcribe audio
    console.log(`[Pipeline] Transcribing audio...`);
    const transcript = await transcribeAudio(filePath);
    console.log(
      `[Pipeline] Transcription complete: ${transcript.length} segments`
    );

    // Step 2: Segment into Q&A pairs
    console.log(`[Pipeline] Segmenting transcript...`);
    const qaPairs = await segmentTranscript(transcript);
    console.log(`[Pipeline] Found ${qaPairs.length} Q&A pairs`);

    if (qaPairs.length === 0) {
      const report: InterviewReport = {
        id,
        fileName,
        uploadedAt,
        status: "completed",
        duration: null,
        overallScore: null,
        summary:
          "No question-answer pairs could be identified in the recording.",
        strengths: [],
        weaknesses: [],
        recommendation:
          "Unable to evaluate — no clear Q&A structure detected.",
        questionAnalyses: [],
        transcript,
        error: null,
      };
      setReport(report);
      console.log(`[Pipeline] No Q&A pairs found. Report ${id} complete.`);
      return;
    }

    // Step 3: Analyze each Q&A pair
    console.log(`[Pipeline] Analyzing ${qaPairs.length} Q&A pairs...`);
    const analyses = await analyzeAllPairs(qaPairs);

    // Step 4: Generate final report
    console.log(`[Pipeline] Generating report...`);
    const report = generateReport(
      id,
      fileName,
      uploadedAt,
      transcript,
      qaPairs,
      analyses
    );

    setReport(report);
    console.log(`[Pipeline] Report ${id} completed. Score: ${report.overallScore}/10`);
  } catch (err: any) {
    console.error(`[Pipeline] Failed for report ${id}:`, err);

    // Update report with failure status
    const existing = getReport(id);
    const failedReport: InterviewReport = {
      id,
      fileName,
      uploadedAt: existing?.uploadedAt || uploadedAt,
      status: "failed",
      duration: null,
      overallScore: null,
      summary: null,
      strengths: [],
      weaknesses: [],
      recommendation: null,
      questionAnalyses: [],
      transcript: [],
      error: err?.message || "An unknown error occurred during processing.",
    };
    setReport(failedReport);
  }
}
