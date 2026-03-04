import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

/**
 * Lazily initialize Google GenAI client with Vertex AI.
 * Uses base64-encoded service account credentials from env.
 */
function getClient(): GoogleGenAI {
  if (!_client) {
    if (!process.env.VERTEX_CREDENTIALS_BASE64) {
      throw new Error("VERTEX_CREDENTIALS_BASE64 is not configured");
    }
    if (!process.env.VERTEX_PROJECT_ID) {
      throw new Error("VERTEX_PROJECT_ID is not configured");
    }

    // Decode base64 credentials
    const credentialsJson = Buffer.from(
      process.env.VERTEX_CREDENTIALS_BASE64,
      "base64"
    ).toString("utf-8");
    const credentials = JSON.parse(credentialsJson);

    const project = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_REGION || "us-central1";

    console.log("[GenAI] Initializing with:", {
      project,
      location,
      model: process.env.VERTEX_MODEL,
      credentialsEmail: credentials.client_email,
    });

    _client = new GoogleGenAI({
      vertexai: true,
      project,
      location,
      googleAuthOptions: { credentials },
    });
  }
  return _client;
}

/**
 * Get the model name from env or default.
 */
function getModelName(): string {
  return process.env.VERTEX_MODEL || "gemini-2.0-flash";
}

/**
 * Generate content with streaming.
 */
export async function generateContentStream(
  prompt: string,
  systemInstruction?: string
) {
  const client = getClient();
  const model = getModelName();

  console.log("[GenAI] Generating content with model:", model);

  const config: { systemInstruction?: string } = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  return client.models.generateContentStream({
    model,
    contents: prompt,
    config,
  });
}

/**
 * Generate content (non-streaming).
 */
export async function generateContent(
  prompt: string,
  systemInstruction?: string
) {
  const client = getClient();
  const model = getModelName();

  console.log("[GenAI] Generating content with model:", model);

  const config: { systemInstruction?: string } = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  return client.models.generateContent({
    model,
    contents: prompt,
    config,
  });
}
