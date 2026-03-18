import { Request, Response, NextFunction } from "express";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { AppError, successResponse } from "../types";
import { getReport, listReports } from "../storage/store";

/**
 * GET /api/v1/reports/:id
 * Return the full interview report.
 */
export function getReportById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): void {
  try {
    const { id } = req.params;
    const report = getReport(id);

    if (!report) {
      throw new AppError(404, "NOT_FOUND", "Report not found.");
    }

    res.json(successResponse(report));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reports/:id/pdf
 * Generate and return a PDF of the interview report.
 */
export function getReportPdf(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): void {
  const { id } = req.params;
  const report = getReport(id);

  if (!report) {
    next(new AppError(404, "NOT_FOUND", "Report not found."));
    return;
  }

  if (report.status !== "completed") {
    next(new AppError(400, "NOT_READY", "Report is not yet completed."));
    return;
  }

  const tmpJson = path.join(os.tmpdir(), `hr-report-${id}.json`);
  const tmpPdf = path.join(os.tmpdir(), `hr-report-${id}.pdf`);
  const scriptPath = path.resolve(__dirname, "../../scripts/generate_pdf.py");

  fs.writeFileSync(tmpJson, JSON.stringify(report), "utf-8");

  execFile("py", [scriptPath, tmpJson, tmpPdf], (err) => {
    // Clean up JSON temp file
    try { fs.unlinkSync(tmpJson); } catch (_) { /* ignore */ }

    if (err) {
      try { fs.unlinkSync(tmpPdf); } catch (_) { /* ignore */ }
      next(new AppError(500, "PDF_ERROR", "Failed to generate PDF: " + err.message));
      return;
    }

    const safeName = report.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-${safeName}.pdf"`);

    const stream = fs.createReadStream(tmpPdf);
    stream.pipe(res);
    stream.on("end", () => {
      try { fs.unlinkSync(tmpPdf); } catch (_) { /* ignore */ }
    });
    stream.on("error", (streamErr) => {
      try { fs.unlinkSync(tmpPdf); } catch (_) { /* ignore */ }
      next(new AppError(500, "PDF_ERROR", "Failed to stream PDF: " + streamErr.message));
    });
  });
}

/**
 * GET /api/v1/reports
 * Return a summary list of all reports.
 */
export function getReportList(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const reports = listReports();

    const summaries = reports.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      uploadedAt: r.uploadedAt,
      status: r.status,
      overallScore: r.overallScore,
      recommendation: r.recommendation,
    }));

    res.json(successResponse(summaries));
  } catch (err) {
    next(err);
  }
}
