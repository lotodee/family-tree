"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mic, Trash2 } from "lucide-react";
import { AnswerInput } from "./answer-input";
import { VoiceRecorder } from "./voice-recorder";
import { TranscriptReview } from "./transcript-review";
import type { Question, Answer } from "@/types";

type CardState = "empty" | "hasAnswer" | "recording" | "reviewing";

interface QuestionCardProps {
  question: Question;
  subjectId: string;
  subjectName: string;
  userId: string;
  existingAnswer: Answer | null;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSaved: (answer: Answer, isNewAnswer: boolean) => void;
  onAnswerDeleted: (questionId: string, subjectId: string) => void;
}

const categoryColors: Record<string, string> = {
  personality: "bg-purple-100 text-purple-700",
  memories: "bg-blue-100 text-blue-700",
  funny: "bg-yellow-100 text-yellow-700",
  heartfelt: "bg-pink-100 text-pink-700",
  general: "bg-gray-100 text-gray-700",
};

export function QuestionCard({
  question,
  subjectId,
  subjectName,
  userId,
  existingAnswer,
  questionNumber,
  totalQuestions,
  onAnswerSaved,
  onAnswerDeleted,
}: QuestionCardProps) {
  const [cardState, setCardState] = useState<CardState>(
    existingAnswer ? "hasAnswer" : "empty"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [rawTranscription, setRawTranscription] = useState<string | null>(null);
  const [supportsVoice, setSupportsVoice] = useState(false);

  // Check for voice support on mount
  useEffect(() => {
    setSupportsVoice(
      typeof window !== "undefined" &&
        "MediaRecorder" in window &&
        typeof navigator.mediaDevices?.getUserMedia === "function"
    );
  }, []);

  // Reset state when question/subject changes
  useEffect(() => {
    setCardState(existingAnswer ? "hasAnswer" : "empty");
    setVoiceUrl(null);
    setRawTranscription(null);
  }, [question.id, subjectId, existingAnswer]);

  const saveAnswer = async (
    text: string,
    inputMethod: "text" | "voice",
    voiceUrlParam?: string,
    rawTranscriptionParam?: string,
    isUpdate: boolean = false
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          questionId: question.id,
          answerText: text,
          inputMethod,
          voiceUrl: voiceUrlParam || null,
          rawTranscription: rawTranscriptionParam || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save answer");
        return;
      }

      toast.success(isUpdate ? "Answer updated!" : "Answer saved!");
      onAnswerSaved(data.answer, !isUpdate);
      setCardState("hasAnswer");
      setVoiceUrl(null);
      setRawTranscription(null);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAnswer = async () => {
    if (!existingAnswer) return;

    if (!confirm("Are you sure you want to delete this answer?")) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/answers?answerId=${existingAnswer.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to delete answer");
        return;
      }

      toast.success("Answer deleted");
      onAnswerDeleted(question.id, subjectId);
      setCardState("empty");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTranscriptionComplete = (data: {
    voiceUrl: string;
    rawTranscription: string;
  }) => {
    setVoiceUrl(data.voiceUrl);
    setRawTranscription(data.rawTranscription);
    setCardState("reviewing");
  };

  const handleReRecord = () => {
    setVoiceUrl(null);
    setRawTranscription(null);
    setCardState("empty");
  };

  const handleVoiceError = (message: string) => {
    toast.error(message);
  };

  // Format question text with subject name for "about other" questions
  const questionText =
    question.type === "about_other"
      ? question.text.replace("this person", subjectName)
      : question.text;

  return (
    <div className="rounded-2xl border border-[var(--color-gold-light)] bg-[var(--color-ivory)] p-4 shadow-sm md:p-6">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between md:mb-4">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize md:px-3 md:py-1 ${categoryColors[question.category] || categoryColors.general}`}
        >
          {question.category}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)] md:text-sm">
          {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <h2 className="mb-4 font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-burgundy)] md:mb-6 md:text-xl">
        {questionText}
      </h2>

      {/* Content based on state */}
      {cardState === "empty" && (
        <div className="space-y-6">
          <AnswerInput
            initialText=""
            onSave={(text) => saveAnswer(text, "text")}
            isEditing={false}
            isSaving={isSaving}
          />

          {supportsVoice && (
            <>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-[var(--color-gold-light)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  or
                </span>
                <div className="h-px flex-1 bg-[var(--color-gold-light)]" />
              </div>

              <VoiceRecorder
                userId={userId}
                questionId={question.id}
                subjectId={subjectId}
                onTranscriptionComplete={handleTranscriptionComplete}
                onError={handleVoiceError}
              />
            </>
          )}
        </div>
      )}

      {cardState === "hasAnswer" && existingAnswer && (
        <div className="space-y-4">
          <AnswerInput
            initialText={existingAnswer.answer_text || ""}
            onSave={(text) =>
              saveAnswer(
                text,
                existingAnswer.input_method as "text" | "voice",
                existingAnswer.voice_url || undefined,
                existingAnswer.raw_transcription || undefined,
                true // isUpdate
              )
            }
            isEditing={true}
            isSaving={isSaving}
          />

          {existingAnswer.input_method === "voice" && (
            <p className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
              <Mic className="h-3 w-3" />
              Originally recorded via voice
            </p>
          )}

          <button
            onClick={deleteAnswer}
            disabled={isSaving}
            className="flex items-center gap-1 text-sm text-red-500 hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            Delete answer
          </button>
        </div>
      )}

      {cardState === "reviewing" && rawTranscription && voiceUrl && (
        <TranscriptReview
          rawTranscription={rawTranscription}
          voiceUrl={voiceUrl}
          onSave={(text) => saveAnswer(text, "voice", voiceUrl, rawTranscription)}
          onReRecord={handleReRecord}
          onDelete={handleReRecord}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
