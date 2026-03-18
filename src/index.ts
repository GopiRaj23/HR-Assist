import express from "express";
import path from "path";
import cors from "cors";
import { config } from "./config";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.resolve(__dirname, "../public")));

// API routes
app.use("/api/v1", routes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler (must be after routes)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(
    `HR Assist API running on http://localhost:${config.port} [${config.nodeEnv}]`
  );
});

export default app;
