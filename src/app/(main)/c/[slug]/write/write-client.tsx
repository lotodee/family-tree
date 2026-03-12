"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCelebration } from "@/lib/contexts/celebration-context";
import { toast } from "sonner";
import Link from "next/link";
import type { Letter } from "@/types";

export function WriteClient() {
  const { celebration, membership } = useCelebration();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [myLetters, setMyLetters] = useState<Letter[]>([]);
  const [showMyLetters, setShowMyLetters] = useState(false);

  const charCount = body.length;
  const maxChars = 10000;
  const isValid = body.trim().length >= 10;

  // Fetch user's existing letters
  useEffect(() => {
    async function fetchLetters() {
      try {
        const res = await fetch(`/api/letters?celebrationId=${celebration.id}`);
        if (res.ok) {
          const { letters } = await res.json();
          setMyLetters(letters);
        }
      } catch {
        // Silent
      }
    }
    fetchLetters();
  }, [celebration.id]);

  const handleSave = useCallback(async () => {
    if (!isValid) {
      toast.error("Your letter must be at least 10 characters.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          celebrationId: celebration.id,
          title: title.trim() || null,
          body: body.trim(),
          treeNodeId: membership.tree_node_id || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      toast.success("Letter saved!");

      setTimeout(() => {
        router.push(`/c/${celebration.slug}`);
      }, 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save letter");
      setIsSaving(false);
    }
  }, [celebration, membership, title, body, isValid, router]);

  const handleDelete = useCallback(async (letterId: string) => {
    if (!confirm("Delete this letter? This can't be undone.")) return;

    try {
      const res = await fetch(`/api/letters?id=${letterId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Letter deleted");
      setMyLetters((prev) => prev.filter((l) => l.id !== letterId));
    } catch {
      toast.error("Failed to delete");
    }
  }, []);

  return (
    <div className="min-h-screen px-6 py-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href={`/c/${celebration.slug}`}
        className="text-sm mb-6 inline-block"
        style={{ color: "var(--color-text-secondary)" }}
      >
        ← Back
      </Link>

      {/* Heading */}
      <h1
        className="text-xl font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
        }}
      >
        Write a letter
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
        For {celebration.name}
      </p>

      {/* Title input */}
      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., To my dearest Grandpa"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none"
          style={{
            border: "1.5px solid var(--color-gold-light)",
            backgroundColor: "var(--color-ivory)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-display)",
          }}
          maxLength={150}
          disabled={isSaving}
        />
      </div>

      {/* Body textarea */}
      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your message
        </label>
        <textarea
          value={body}
          onChange={(e) => {
            if (e.target.value.length <= maxChars) setBody(e.target.value);
          }}
          placeholder="Write your message here..."
          rows={12}
          className="w-full px-5 py-4 rounded-xl text-base outline-none resize-none leading-relaxed"
          style={{
            border: "1.5px solid var(--color-gold-light)",
            backgroundColor: "var(--color-ivory)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.8,
          }}
          disabled={isSaving}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: body.trim().length < 10 && body.length > 0 ? "var(--color-error)" : "var(--color-text-secondary)" }}>
            {body.trim().length < 10 && body.length > 0 ? "At least 10 characters needed" : ""}
          </span>
          <span className="text-xs" style={{ color: charCount > maxChars * 0.9 ? "var(--color-error)" : "var(--color-text-secondary)" }}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={handleSave}
          disabled={isSaving || !isValid}
          className="flex-1 px-6 py-3.5 rounded-xl text-sm font-medium disabled:opacity-40"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-text-primary)",
          }}
        >
          {isSaving ? "Saving..." : "Send Letter"}
        </button>
        <button
          onClick={() => {
            if (body.trim() && !confirm("Discard your letter?")) return;
            router.push(`/c/${celebration.slug}`);
          }}
          disabled={isSaving}
          className="px-6 py-3.5 rounded-xl text-sm font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Cancel
        </button>
      </div>

      {/* My letters */}
      {myLetters.length > 0 && (
        <div>
          <button
            onClick={() => setShowMyLetters(!showMyLetters)}
            className="text-sm font-medium mb-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Your letters ({myLetters.length}) {showMyLetters ? "▲" : "▼"}
          </button>

          {showMyLetters && (
            <div className="flex flex-col gap-3">
              {myLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="rounded-lg px-4 py-3"
                  style={{
                    border: "1px solid var(--color-gold-light)",
                    backgroundColor: "var(--color-ivory)",
                  }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                    {letter.title || "Untitled letter"}
                  </p>
                  <p
                    className="text-xs mb-2"
                    style={{
                      color: "var(--color-text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {letter.body}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      {new Date(letter.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="text-xs"
                      style={{ color: "var(--color-error)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
