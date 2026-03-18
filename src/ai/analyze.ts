import Groq from "groq-sdk";
import { config } from "../config";
import { QAPair, AnswerAnalysis } from "../types";

const groq = new Groq({ apiKey: config.groqApiKey });

const SYSTEM_PROMPT = `You are an expert interview analyst. You evaluate candidate answers to interview questions.

For each question-answer pair, return ONLY valid JSON (no markdown, no code fences) with these fields:
- answerSummary: A concise 1-2 sentence summary of the candidate's answer
- relevanceScore: 1-10 score for how relevant the answer is to the question
- clarityScore: 1-10 score for how clearly the answer was communicated
- confidenceScore: 1-10 score for how confident the candidate appeared (based on language used — hedging words, filler words, definitive statements)
- strengths: Array of 1-3 specific strengths in the answer
- weaknesses: Array of 0-3 specific weaknesses or areas for improvement

Be fair and objective. Base scores only on the content and language used.
Do NOT attempt to detect deception or emotional states.`;

/** Clamp a number to a valid 1-10 range */
function clampScore(value: unknown): number {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return 5;
  return Math.max(1, Math.min(10, Math.round(num)));
}

/** Ensure a value is a string array */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "string").slice(0, 5);
}

/** Extract JSON from a string that might contain markdown fences */
function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

/**
 * Analyze a single Q&A pair using Groq (Llama 3.3).
 */
export async function analyzeQAPair(pair: QAPair): Promise<AnswerAnalysis> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this interview Q&A pair and return JSON:\n\nQuestion: ${pair.question}\n\nAnswer: ${pair.answer}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(extractJson(content));

    return {
      questionNumber: pair.questionNumber,
      question: pair.question,
      answerSummary: parsed.answerSummary || "Analysis unavailable.",
      relevanceScore: clampScore(parsed.relevanceScore),
      clarityScore: clampScore(parsed.clarityScore),
      confidenceScore: clampScore(parsed.confidenceScore),
      strengths: toStringArray(parsed.strengths),
      weaknesses: toStringArray(parsed.weaknesses),
    };
  } catch (err) {
    console.error(
      `Failed to analyze Q&A pair #${pair.questionNumber}:`,
      err
    );

    // Return a default analysis rather than crashing the pipeline
    return {
      questionNumber: pair.questionNumber,
      question: pair.question,
      answerSummary: "Analysis failed for this question.",
      relevanceScore: 5,
      clarityScore: 5,
      confidenceScore: 5,
      strengths: [],
      weaknesses: ["Analysis could not be completed"],
    };
  }
}

/**
 * Analyze all Q&A pairs sequentially to avoid rate limits.
 */
export async function analyzeAllPairs(
  pairs: QAPair[]
): Promise<AnswerAnalysis[]> {
  const analyses: AnswerAnalysis[] = [];

  for (const pair of pairs) {
    const analysis = await analyzeQAPair(pair);
    analyses.push(analysis);
  }

  return analyses;
}
