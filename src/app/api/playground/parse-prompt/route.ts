import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { parsePromptResponse, type ParsedPrompt } from "@/lib/playground/prompt-parser";

let _flashClient: GoogleGenAI | null = null;

/**
 * Get a dedicated client for fast Flash model parsing.
 * Uses the same credentials but explicitly targets gemini-2.0-flash.
 */
function getFlashClient(): GoogleGenAI {
  if (!_flashClient) {
    if (!process.env.VERTEX_CREDENTIALS_BASE64) {
      throw new Error("VERTEX_CREDENTIALS_BASE64 is not configured");
    }
    if (!process.env.VERTEX_PROJECT_ID) {
      throw new Error("VERTEX_PROJECT_ID is not configured");
    }

    const credentialsJson = Buffer.from(
      process.env.VERTEX_CREDENTIALS_BASE64,
      "base64"
    ).toString("utf-8");
    const credentials = JSON.parse(credentialsJson);

    const project = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_REGION || "us-central1";

    console.log("\x1b[36m[TEMP] 🔧 Initializing Flash client\x1b[0m");

    _flashClient = new GoogleGenAI({
      vertexai: true,
      project,
      location,
      googleAuthOptions: { credentials },
    });
  }
  return _flashClient;
}

const SYSTEM_PROMPT = `You are a JSON-only parser for a family celebration app. Your job is to extract structured data from a host's prompt.

You will receive:
1. A prompt typed by a host at a family event
2. A list of all family member names

Return ONLY valid JSON with this exact structure:
{
  "subjects": ["Name1", "Name2"],
  "mediaType": "text",
  "cleanedPrompt": "the prompt with context"
}

RULES for "subjects":
- Extract names that EXACTLY match names from the provided family list
- Handle variations: "Aunty Kemi" → "Kemi", "Uncle Wale" → "Wale", "Grandpa" → "Grandpa Michael"
- If the prompt says "everyone", "the whole family", "all of them", return ["ALL"]
- If no specific person is mentioned, return []
- Include ALL names mentioned, not just the first one

RULES for "mediaType":
- "image" if the prompt asks to: show, draw, paint, picture, visualize, create an image, what would they look like, portrait, photo, imagine visually
- "video" if the prompt asks to: make a video, animate, show a clip, create a video
- "text" for everything else: introduce, tell us about, describe, compare, roast, toast, what if, etc.

RULES for "cleanedPrompt":
- Keep the original prompt intent
- You can normalize names if needed

Respond with ONLY the JSON object. No markdown, no backticks, no explanation.`;

/**
 * POST /api/playground/parse-prompt
 *
 * Fast LLM call to extract subjects and media type from a prompt.
 * Uses Gemini 2.0 Flash for speed (<1 second).
 *
 * Input: { prompt: string, familyNames: string[] }
 * Output: { subjects: string[], mediaType: "text"|"image"|"video", cleanedPrompt: string }
 */
export async function POST(request: NextRequest) {
  console.log("\x1b[36m[TEMP] 🔍 Parsing prompt...\x1b[0m");

  try {
    const { prompt, familyNames } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const userPrompt = `FAMILY MEMBERS: ${(familyNames || []).join(", ")}

HOST'S PROMPT: "${prompt}"

Return the JSON object:`;

    console.log("\x1b[33m[TEMP] 📝 User prompt length:", prompt.length, "chars\x1b[0m");
    console.log("\x1b[33m[TEMP] 👨‍👩‍👧‍👦 Family names count:", (familyNames || []).length, "\x1b[0m");

    const client = getFlashClient();

    // Retry logic for rate limits
    let result;
    let retries = 2;
    while (retries >= 0) {
      try {
        result = await client.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });
        break; // Success, exit loop
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message?.includes("429") && retries > 0) {
          console.log("\x1b[33m[TEMP] ⏳ Rate limited, waiting 1s and retrying...\x1b[0m");
          await new Promise((r) => setTimeout(r, 1000));
          retries--;
        } else {
          throw err; // Re-throw if not rate limit or out of retries
        }
      }
    }

    if (!result) {
      throw new Error("Failed after retries");
    }

    const responseText = result.text || "{}";
    console.log("\x1b[35m[TEMP] 🎨 Raw LLM response:", responseText, "\x1b[0m");

    // Parse and validate the response
    const parsed: ParsedPrompt = parsePromptResponse(responseText, prompt);

    console.log(
      "\x1b[32m[TEMP] ✅ Parse result:",
      JSON.stringify({
        subjects: parsed.subjects,
        mediaType: parsed.mediaType,
      }),
      "\x1b[0m"
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.log("\x1b[31m[TEMP] ❌ Parse failed:", error, "\x1b[0m");

    // Graceful fallback - never fail hard
    // Return defaults so the main generation can still proceed
    const { prompt } = await request.json().catch(() => ({ prompt: "" }));

    return NextResponse.json({
      subjects: [],
      mediaType: "text",
      cleanedPrompt: prompt || "",
    } as ParsedPrompt);
  }
}
