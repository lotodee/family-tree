"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThinkingAnimation } from "./thinking-animation";
import { StarIcon } from "@/components/icons";

interface ResponseDisplayProps {
  text: string;
  imageUrl: string | null;
  imageExplanation?: string | null;
  isStreaming: boolean;
  isLoadingImage: boolean;
}

export function ResponseDisplay({
  text,
  imageUrl,
  imageExplanation,
  isStreaming,
  isLoadingImage,
}: ResponseDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when text updates during streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  const isIdle = !text && !imageUrl && !isStreaming && !isLoadingImage;

  return (
    <div
      ref={containerRef}
      className="response-stage relative flex h-full flex-col overflow-y-auto rounded-2xl bg-[#1A1410] p-6 lg:p-8"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(196,151,59,0.05) 0%, transparent 70%), #1A1410",
      }}
    >
      <AnimatePresence mode="wait">
        {/* Idle State */}
        {isIdle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 items-center justify-center"
          >
            <motion.p
              animate={{
                textShadow: [
                  "0 0 20px rgba(196,151,59,0.3)",
                  "0 0 40px rgba(196,151,59,0.5)",
                  "0 0 20px rgba(196,151,59,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center font-serif text-2xl text-[#C4973B] lg:text-3xl"
            >
              Ask me anything about the Ademiluyi family...
            </motion.p>
          </motion.div>
        )}

        {/* Loading Image State - Beautiful thinking animation */}
        {isLoadingImage && (
          <motion.div
            key="loading-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1"
          >
            <ThinkingAnimation isThinking={true} type="image" />
          </motion.div>
        )}

        {/* Loading Text State - When streaming starts but no text yet */}
        {isStreaming && !text && !isLoadingImage && (
          <motion.div
            key="loading-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1"
          >
            <ThinkingAnimation isThinking={true} type="text" />
          </motion.div>
        )}

        {/* Image Display with Explanation */}
        {imageUrl && (
          <motion.div
            key="image"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <img
              src={imageUrl}
              alt="AI generated family art"
              className="max-h-[55vh] max-w-full rounded-2xl shadow-2xl"
              style={{ boxShadow: "0 0 40px rgba(196,151,59,0.3)" }}
            />
            {imageExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="max-w-2xl rounded-xl border border-[#C4973B]/20 bg-[#0F0A07]/50 px-6 py-4 text-center"
              >
                <p className="text-sm font-medium uppercase tracking-wider text-[#C4973B]">
                  Why this image?
                </p>
                <p className="mt-2 text-base leading-relaxed text-[#FFF8F0]/90">
                  {imageExplanation}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Text Display */}
        {text && !imageUrl && (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-invert max-w-none"
          >
            <p
              className="whitespace-pre-wrap text-xl leading-relaxed text-[#FFF8F0] lg:text-2xl"
              style={{ lineHeight: 1.7 }}
            >
              {text}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="ml-1 inline-block h-7 w-0.5 bg-[#C4973B]"
                />
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion indicator */}
      {text && !isStreaming && !imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-[#A89885]"
        >
          <span className="h-px flex-1 bg-[#C4973B]/30" />
          <StarIcon size={16} />
          <span className="h-px flex-1 bg-[#C4973B]/30" />
        </motion.div>
      )}
    </div>
  );
}
