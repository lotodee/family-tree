import { NextRequest, NextResponse } from "next/server";
import { generateContent, generateImages } from "@/lib/gemini/client";
import {
  buildContextForSubject,
  buildContextForMultipleSubjects,
} from "@/lib/gemini/context";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { prompt, subjectIds, context: preBuiltContext } = await request.json();

    // Build context (use pre-built if provided, otherwise build server-side)
    let context: string;
    if (preBuiltContext) {
      // Use pre-built context from client (prefetch flow)
      console.log("\x1b[33m[TEMP] ⚡ Using pre-built context for image generation\x1b[0m");
      context = preBuiltContext;
    } else if (subjectIds && subjectIds.length > 0) {
      // Fall back to server-side context building (old flow)
      console.log("\x1b[33m[TEMP] 🔄 Building context server-side for image (fallback)\x1b[0m");
      if (subjectIds.length === 1) {
        const result = await buildContextForSubject(subjectIds[0]);
        context = result.contextText;
      } else {
        context = await buildContextForMultipleSubjects(subjectIds);
      }
    } else {
      context = "";
    }

    // Use Gemini to create a creative, witty image concept based on the person's data
    const imagePromptResult = await generateContent(
      `You are a creative director for a family celebration. Based on the family data below, create a WITTY and FUNNY image concept for this request: "${prompt}".

RULES:
1. DO NOT just show them "smiling" or "having fun" — that's boring and generic.
2. USE their actual personality traits, quirks, habits, and stories the family shared.
3. BE CREATIVE — if they're always late, show them racing against time. If they love food, show them in a food-related scenario. If they're dramatic, make it theatrical.
4. MAKE IT PERSONAL — the image should be instantly recognizable as "that's so [name]!" to anyone who knows them.
5. Keep it family-friendly but FUNNY. Think loving roast, not portrait.
6. Style: vibrant digital art, bold colors, Nigerian cultural elements where fitting.
7. NO TEXT OR WORDS in the image itself.

Family data:
${context}

Respond in this exact JSON format:
{
  "imagePrompt": "detailed image generation prompt here",
  "explanation": "1-2 sentence explanation of why this concept fits the person, referencing what the family said"
}

Be specific about the scene, action, expression, and visual elements in the imagePrompt.`
    );

    // Parse the JSON response
    let imagePrompt = prompt;
    let imageExplanation = "";

    try {
      const responseText = imagePromptResult.text || "{}";
      const cleaned = responseText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      imagePrompt = parsed.imagePrompt || prompt;
      imageExplanation = parsed.explanation || "";
    } catch {
      // Fallback: use raw text as prompt if JSON parsing fails
      imagePrompt = imagePromptResult.text || prompt;
    }

    console.log("\x1b[35m[TEMP] 🎨 Creative image concept:", imagePrompt, "\x1b[0m");
    console.log("\x1b[35m[TEMP] 💬 Explanation:", imageExplanation, "\x1b[0m");

    let imageUrl: string | null = null;
    let imageDescription = imagePrompt;

    // Generate image using Nano Banana
    try {
      const imageResult = await generateImages(imagePrompt);
      const generatedImage = imageResult.generatedImages?.[0];

      if (generatedImage?.image?.imageBytes) {
        // Upload to Supabase storage
        const imageBuffer = Buffer.from(generatedImage.image.imageBytes, "base64");
        const fileName = `generated-${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("generated-images")
          .upload(fileName, imageBuffer, {
            contentType: "image/png",
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabaseAdmin.storage
            .from("generated-images")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }
    } catch (imageError) {
      console.error("Image generation failed, falling back to description:", imageError);
    }

    // Save session
    await supabaseAdmin.from("llm_sessions").insert({
      prompt,
      response_text: imageDescription,
      image_url: imageUrl,
      subjects: subjectIds || [],
    });

    return NextResponse.json({
      imageUrl,
      imageDescription,
      imageExplanation,
      generated: !!imageUrl,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Image generation failed. Please try again." },
      { status: 500 }
    );
  }
}
