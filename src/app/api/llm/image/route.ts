import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini/client";
import {
  buildContextForSubject,
  buildContextForMultipleSubjects,
} from "@/lib/gemini/context";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const { prompt, subjectIds } = await request.json();

    // Build context
    let context: string;
    if (subjectIds && subjectIds.length > 0) {
      if (subjectIds.length === 1) {
        const result = await buildContextForSubject(subjectIds[0]);
        context = result.contextText;
      } else {
        context = await buildContextForMultipleSubjects(subjectIds);
      }
    } else {
      context = "";
    }

    // Use Gemini to create a detailed image description from the family data
    const imagePromptResult = await generateContent(
      `Based on the following family data, create a detailed image generation prompt that visually captures the essence of this request: "${prompt}".

       The image should be: warm, colorful, celebratory, family-friendly.
       Style: vibrant digital art, festive, Nigerian cultural elements where appropriate.
       DO NOT include any text or words in the image.
       Respond with ONLY the image prompt, nothing else.

       Family data:\n${context}`
    );

    const imageDescription = imagePromptResult.text || prompt;

    // For now, we use Tier 2 (text description) since Vertex AI image generation
    // requires Imagen API which has different setup requirements.
    // The image description can be used with external image generators if needed.
    let imageUrl: string | null = null;

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
