import { Router } from "express";
import { uploadAudio as uploadMiddleware } from "../middleware/upload";
import { uploadAudio } from "../controllers/audioController";
import { getReportById, getReportList, getReportPdf } from "../controllers/reportController";

const router = Router();

// Interview audio upload — triggers full analysis pipeline
router.post("/upload-audio", uploadMiddleware, uploadAudio);

// Report retrieval
router.get("/reports", getReportList);
router.get("/reports/:id/pdf", getReportPdf);
router.get("/reports/:id", getReportById);

export default router;
