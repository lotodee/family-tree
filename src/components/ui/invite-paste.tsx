"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function InvitePaste() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) {
      toast.error("Please paste your invite link");
      return;
    }

    setIsProcessing(true);

    // Extract invite code from various formats:
    // Full URL: https://app.com/invite/abc123xyz
    // Path only: /invite/abc123xyz
    // Just the code: abc123xyz
    const urlMatch = trimmed.match(/invite\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      router.push(`/invite/${urlMatch[1]}`);
      return;
    }

    // Raw code (alphanumeric, hyphens, underscores)
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      router.push(`/invite/${trimmed}`);
      return;
    }

    // Nothing matched
    setIsProcessing(false);
    toast.error("That doesn't look like a valid invite link. Check and try again.");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
        Have an invite link from a family member?
      </p>
      <div className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your invite link here..."
          className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-colors"
          style={{
            border: "1.5px solid var(--color-gold-light)",
            backgroundColor: "var(--color-ivory)",
            color: "var(--color-text-primary)",
          }}
          disabled={isProcessing}
        />
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !input.trim()}
          className="px-5 py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-text-primary)",
          }}
        >
          {isProcessing ? "..." : "Join"}
        </button>
      </div>
    </div>
  );
}
