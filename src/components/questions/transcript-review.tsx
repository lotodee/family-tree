"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Trash2 } from "lucide-react";

interface TranscriptReviewProps {
  rawTranscription: string;
  voiceUrl: string;
  onSave: (editedText: string) => void;
  onReRecord: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

export function TranscriptReview({
  rawTranscription,
  onSave,
  onReRecord,
  onDelete,
  isSaving,
}: TranscriptReviewProps) {
  const [editedText, setEditedText] = useState(rawTranscription);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 120), 300)}px`;
    }
  }, [editedText]);

  const handleSave = () => {
    const trimmed = editedText.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  const handleDelete = () => {
    if (
      confirm("Are you sure? This will delete your recording and answer.")
    ) {
      onDelete();
    }
  };

  const canSave = editedText.trim().length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-burgundy)]">
          Review your answer
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          We transcribed your voice recording. Edit anything that doesn&apos;t
          look right, then save.
        </p>
      </div>

      <textarea
        ref={textareaRef}
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        className="w-full resize-none rounded-xl border border-[var(--color-gold-light)] bg-white p-4 text-[var(--color-text-primary)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
        style={{ minHeight: "120px" }}
        disabled={isSaving}
      />

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="w-full rounded-xl bg-[var(--color-gold)] px-4 py-3 font-medium text-white transition-all hover:bg-[var(--color-gold)]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Answer"}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onReRecord}
            disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-burgundy)] px-4 py-3 text-[var(--color-burgundy)] transition-all hover:bg-[var(--color-burgundy)]/5"
          >
            <Mic className="h-4 w-4" />
            Re-record
          </button>

          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-red-500 transition-all hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
