import fs from "fs";
import Groq from "groq-sdk";
import { config } from "../config";
import { TranscriptSegment, AppError } from "../types";

const groq = new Groq({ apiKey: config.groqApiKey });

/**
 * Transcribe an audio file using Groq's Whisper API (free tier).
 * Returns timestamped transcript segments.
 * Cleans up the uploaded file after processing.
 */
export async function transcribeAudio(
  filePath: string
): Promise<TranscriptSegment[]> {
  try {
    const fileStream = fs.createReadStream(filePath);

    const response = await groq.audio.transcriptions.create({
      model: "whisper-large-v3",
      file: fileStream,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    // Groq Whisper returns segments with start/end timestamps
    const rawSegments = (response as any).segments || [];

    const segments: TranscriptSegment[] = rawSegments.map(
      (seg: any, index: number) => ({
        // Whisper doesn't provide speaker diarization —
        // assign alternating speakers as a baseline heuristic.
        // The segmentation module refines this further.
        speaker: `Speaker ${(index % 2) + 1}`,
        text: (seg.text || "").trim(),
        start: seg.start ?? 0,
        end: seg.end ?? 0,
      })
    );

    return segments;
  } catch (err: any) {
    const message = err?.message || "Failed to transcribe audio file.";
    throw new AppError(502, "TRANSCRIPTION_FAILED", message);
  } finally {
    // Clean up uploaded file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error(`Failed to delete uploaded file ${filePath}:`, unlinkErr);
      }
    });
  }
}
