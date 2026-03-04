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
    <div className="flex items-end gap-3">
      {/* Text Input */}
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type your prompt..."}
          disabled={isDisabled}
          rows={2}
          className="w-full resize-none rounded-xl border border-[#2A2118] bg-[#1A1410] px-5 py-4 text-lg text-[#FFF8F0] placeholder-[#A89885] transition focus:border-[#C4973B] focus:outline-none disabled:opacity-50"
          style={{ minHeight: "60px" }}
        />
        <p className="mt-1 text-xs text-[#A89885]">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Image Generation Button */}
        <button
          onClick={onGenerateImage}
          disabled={isDisabled}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2118] bg-[#1A1410] text-[#A89885] transition hover:border-[#C4973B] hover:text-[#C4973B] disabled:opacity-50"
          title="Generate Image"
        >
          <Image size={18} />
        </button>

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={isDisabled || !value.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C4973B] text-[#0F0A07] transition hover:bg-[#D4A74B] disabled:opacity-50"
          title="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
