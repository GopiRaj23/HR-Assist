import {
  InterviewReport,
  TranscriptSegment,
  QAPair,
  AnswerAnalysis,
} from "../types";

/**
 * Compute the average score across all analyses.
 * Each pair's score = (relevance + clarity + confidence) / 3.
 */
function computeOverallScore(analyses: AnswerAnalysis[]): number {
  if (analyses.length === 0) return 0;

  const total = analyses.reduce((sum, a) => {
    const pairAvg =
      (a.relevanceScore + a.clarityScore + a.confidenceScore) / 3;
    return sum + pairAvg;
  }, 0);

  return Math.round((total / analyses.length) * 10) / 10;
}

/**
 * Aggregate strengths/weaknesses across all analyses.
 * Returns the most frequently mentioned items (top 5).
 */
function aggregateItems(
  analyses: AnswerAnalysis[],
  field: "strengths" | "weaknesses"
): string[] {
  const counts = new Map<string, number>();

  for (const analysis of analyses) {
    for (const item of analysis[field]) {
      const normalized = item.toLowerCase().trim();
      if (normalized) {
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([item]) => item.charAt(0).toUpperCase() + item.slice(1));
}

/**
 * Generate a hiring recommendation based on the overall score.
 */
function generateRecommendation(score: number): string {
  if (score >= 8)
    return "Strong Hire — Candidate demonstrated excellent performance across all areas.";
  if (score >= 6)
    return "Hire — Candidate performed well with some areas for improvement.";
  if (score >= 4)
    return "Maybe — Candidate showed mixed results; consider additional evaluation.";
  return "No Hire — Candidate did not meet expectations in key areas.";
}

/**
 * Generate a brief executive summary.
 */
function generateSummary(
  analyses: AnswerAnalysis[],
  overallScore: number
): string {
  const totalQuestions = analyses.length;
  const strongAnswers = analyses.filter(
    (a) => (a.relevanceScore + a.clarityScore + a.confidenceScore) / 3 >= 7
  ).length;

  return (
    `The candidate answered ${totalQuestions} questions with an overall score of ${overallScore}/10. ` +
    `${strongAnswers} out of ${totalQuestions} answers were rated as strong. ` +
    (overallScore >= 7
      ? "The candidate showed solid competency across most areas."
      : overallScore >= 5
        ? "Performance was mixed, with notable strengths and areas needing improvement."
        : "The candidate struggled with several key areas.")
  );
}

/**
 * Build the complete interview report from analyzed data.
 */
export function generateReport(
  id: string,
  fileName: string,
  uploadedAt: string,
  transcript: TranscriptSegment[],
  _qaPairs: QAPair[],
  analyses: AnswerAnalysis[]
): InterviewReport {
  const overallScore = computeOverallScore(analyses);
  const strengths = aggregateItems(analyses, "strengths");
  const weaknesses = aggregateItems(analyses, "weaknesses");

  const duration =
    transcript.length > 0
      ? transcript[transcript.length - 1].end - transcript[0].start
      : null;

  return {
    id,
    fileName,
    uploadedAt,
    status: "completed",
    duration,
    overallScore,
    summary: generateSummary(analyses, overallScore),
    strengths,
    weaknesses,
    recommendation: generateRecommendation(overallScore),
    questionAnalyses: analyses,
    transcript,
    error: null,
  };
}
