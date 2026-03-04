"use client";

import { useState, useRef, useEffect } from "react";

interface AnswerInputProps {
  initialText: string;
  onSave: (text: string) => void;
  onCancel?: () => void;
  isEditing: boolean;
  isSaving: boolean;
}

export function AnswerInput({
  initialText,
  onSave,
  onCancel,
  isEditing,
  isSaving,
}: AnswerInputProps) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 100), 300)}px`;
    }
  }, [text]);

  // Reset text when initialText changes (e.g., navigating between questions)
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  const canSave = text.trim().length > 0 && text !== initialText;

  return (
    <div className="space-y-3">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full resize-none rounded-xl border border-[var(--color-gold-light)] bg-white p-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
        style={{ minHeight: "100px" }}
        disabled={isSaving}
      />
      <p className="text-xs text-[var(--color-text-secondary)]">
        Aim for a few sentences — the more detail, the better!
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="flex-1 rounded-xl bg-[var(--color-gold)] px-4 py-3 font-medium text-white transition-all hover:bg-[var(--color-gold)]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
        </button>
        {isEditing && onCancel && (
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-xl border border-[var(--color-text-secondary)]/30 px-4 py-3 text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-cream)]"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
