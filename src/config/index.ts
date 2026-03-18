import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

export interface Config {
  port: number;
  nodeEnv: string;
  groqApiKey: string;
}

function loadConfig(): Config {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error(
      "GROQ_API_KEY is required. Get a free key at https://console.groq.com"
    );
  }

  return {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    groqApiKey,
  };
}

export const config = loadConfig();
