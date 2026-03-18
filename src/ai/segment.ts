import Groq from "groq-sdk";
import { config } from "../config";
import { TranscriptSegment, QAPair } from "../types";

const groq = new Groq({ apiKey: config.groqApiKey });

// Patterns that indicate a question or interviewer turn
const QUESTION_PATTERNS = [
  /\?\s*$/,
  /^(what|how|why|where|when|who|which|tell me|describe|explain|can you|could you|would you|have you|do you|did you|are you|were you|walk me through|give me an example|share)/i,
];

const INTERVIEW_PHRASES = [
  /walk me through/i,
  /give me an example/i,
  /tell me about/i,
  /what do you think/i,
  /how would you/i,
  /in your experience/i,
  /can you describe/i,
];

interface Utterance {
  text: string;
  start: number;
  end: number;
}

/**
 * Merge consecutive transcript segments into logical utterances
 * based on time gaps. A gap > 1.5 seconds suggests a speaker turn.
 */
function mergeIntoUtterances(segments: TranscriptSegment[]): Utterance[] {
  if (segments.length === 0) return [];

  const GAP_THRESHOLD = 1.5; // seconds
  const utterances: Utterance[] = [];
  let current: Utterance = {
    text: segments[0].text,
    start: segments[0].start,
    end: segments[0].end,
  };

  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].start - current.end;

    if (gap > GAP_THRESHOLD) {
      utterances.push(current);
      current = {
        text: segments[i].text,
        start: segments[i].start,
        end: segments[i].end,
      };
    } else {
      current.text += " " + segments[i].text;
      current.end = segments[i].end;
    }
  }

  utterances.push(current);
  return utterances;
}

/** Check if an utterance is likely a question */
function isQuestion(text: string): boolean {
  for (const pattern of QUESTION_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  for (const phrase of INTERVIEW_PHRASES) {
    if (phrase.test(text)) return true;
  }
  return false;
}

/**
 * Pattern-based segmentation: detect questions and pair them with answers.
 */
function patternBasedSegmentation(utterances: Utterance[]): QAPair[] {
  const pairs: QAPair[] = [];
  let questionNumber = 0;

  for (let i = 0; i < utterances.length; i++) {
    if (isQuestion(utterances[i].text)) {
      questionNumber++;

      // Collect all subsequent non-question utterances as the answer
      const answerParts: Utterance[] = [];
      let j = i + 1;
      while (j < utterances.length && !isQuestion(utterances[j].text)) {
        answerParts.push(utterances[j]);
        j++;
      }

      if (answerParts.length > 0) {
        pairs.push({
          questionNumber,
          question: utterances[i].text,
          answer: answerParts.map((u) => u.text).join(" "),
          questionStart: utterances[i].start,
          questionEnd: utterances[i].end,
          answerStart: answerParts[0].start,
          answerEnd: answerParts[answerParts.length - 1].end,
        });
      }

      // Skip past the answer utterances
      i = j - 1;
    }
  }

  return pairs;
}

/** Extract JSON from a string that might contain markdown fences */
function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

/**
 * LLM-assisted segmentation fallback using Groq (Llama 3.3).
 * Used when pattern-based detection yields fewer than 2 Q&A pairs.
 */
async function llmSegmentation(fullText: string): Promise<QAPair[]> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert at analyzing interview transcripts. Extract question-answer pairs from the transcript. Return JSON with a 'pairs' array where each item has: question (string), answer (string).",
      },
      {
        role: "user",
        content: `Segment this interview transcript into question-answer pairs. Identify interviewer questions and candidate answers.\n\nTranscript:\n${fullText}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(extractJson(content));
  const rawPairs = parsed.pairs || [];

  return rawPairs.map((p: any, idx: number) => ({
    questionNumber: idx + 1,
    question: p.question || "",
    answer: p.answer || "",
    questionStart: 0,
    questionEnd: 0,
    answerStart: 0,
    answerEnd: 0,
  }));
}

/**
 * Segment transcript into Q&A pairs.
 * Tries pattern-based approach first, falls back to LLM if needed.
 */
export async function segmentTranscript(
  segments: TranscriptSegment[]
): Promise<QAPair[]> {
  const utterances = mergeIntoUtterances(segments);

  // Try pattern-based segmentation first
  const pairs = patternBasedSegmentation(utterances);

  // If we got meaningful results, use them
  if (pairs.length >= 2) {
    return pairs;
  }

  // Fallback: use LLM to segment
  console.log(
    "Pattern-based segmentation found fewer than 2 Q&A pairs. Falling back to LLM segmentation."
  );

  const fullText = segments.map((s) => s.text).join(" ");
  if (fullText.trim().length === 0) {
    return [];
  }

  return llmSegmentation(fullText);
}
