"use client";

import { useCallback, KeyboardEvent } from "react";
import { Send, Image } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onGenerateImage: () => void;
  isStreaming: boolean;
  isLoadingImage: boolean;
  placeholder?: string;
}

export function PromptInput({
  value,
  onChange,
  onSend,
  onGenerateImage,
  isStreaming,
  isLoadingImage,
  placeholder,
}: PromptInputProps) {
  const isDisabled = isStreaming || isLoadingImage;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isDisabled && value.trim()) {
          onSend();
        }
      }
    },
    [onSend, isDisabled, value]
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* Text Input */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your prompt..."}
          disabled={isDisabled}
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-[#2A2118] bg-[#1A1410] px-4 py-3 text-sm text-[#FFF8F0] placeholder-[#A89885] transition focus:border-[#C4973B] focus:outline-none disabled:opacity-50"
        />

        {/* Image Button */}
        <button
          onClick={onGenerateImage}
          disabled={isDisabled}
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg border border-[#2A2118] bg-[#1A1410] text-[#A89885] transition hover:border-[#C4973B] hover:text-[#C4973B] disabled:opacity-50"
          title="Generate Image"
        >
          <Image size={18} />
        </button>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={isDisabled || !value.trim()}
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg bg-[#C4973B] text-[#0F0A07] transition hover:bg-[#D4A74B] disabled:opacity-50"
          title="Send"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-1.5 text-xs text-[#A89885]">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
