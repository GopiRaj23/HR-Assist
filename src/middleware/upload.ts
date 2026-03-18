import multer from "multer";
import path from "path";
import { AppError } from "../types";

const ALLOWED_EXTENSIONS = [".mp3", ".mp4", ".m4a", ".wav", ".webm", ".ogg", ".flac"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAudioMime = file.mimetype.startsWith("audio/") || file.mimetype === "video/mp4";
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

  if (isAudioMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new AppError(400, "INVALID_FILE_TYPE", `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`));
  }
}

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("audio");
