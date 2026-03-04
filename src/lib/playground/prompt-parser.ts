/**
 * Types for prompt parsing.
 * The parse-prompt API extracts subjects and media type from raw prompts.
 */

export interface ParsedPrompt {
  /** Display names extracted from the prompt, or ["ALL"] for whole family */
  subjects: string[];
  /** Detected output type: text, image, or video */
  mediaType: "text" | "image" | "video";
  /** The prompt with names normalized (optional utility) */
  cleanedPrompt: string;
}

/**
 * Parse a JSON response from the LLM into a ParsedPrompt.
 * Handles malformed JSON gracefully.
 */
export function parsePromptResponse(jsonString: string, originalPrompt: string): ParsedPrompt {
  try {
    // Strip markdown code fences if present
    const cleaned = jsonString
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return {
      subjects: Array.isArray(parsed.subjects)
        ? parsed.subjects.map((s: string) => String(s).trim())
        : [],
      mediaType: ["text", "image", "video"].includes(parsed.mediaType)
        ? parsed.mediaType
        : "text",
      cleanedPrompt: typeof parsed.cleanedPrompt === "string"
        ? parsed.cleanedPrompt
        : originalPrompt,
    };
  } catch {
    // Fallback: return defaults if JSON parsing fails
    return {
      subjects: [],
      mediaType: "text",
      cleanedPrompt: originalPrompt,
    };
  }
}
