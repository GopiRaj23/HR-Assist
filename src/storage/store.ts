import { InterviewReport } from "../types";

const reports = new Map<string, InterviewReport>();

export function setReport(report: InterviewReport): void {
  reports.set(report.id, report);
}

export function getReport(id: string): InterviewReport | undefined {
  return reports.get(id);
}

export function listReports(): InterviewReport[] {
  return Array.from(reports.values());
}
