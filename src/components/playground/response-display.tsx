"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResponseDisplayProps {
  text: string;
  imageUrl: string | null;
  isStreaming: boolean;
  isLoadingImage: boolean;
}

export function ResponseDisplay({
  text,
  imageUrl,
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
      className="response-stage relative min-h-[50vh] overflow-y-auto rounded-2xl bg-[#1A1410] p-8 lg:p-12"
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
            className="flex h-full min-h-[40vh] items-center justify-center"
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

        {/* Loading Image State */}
        {isLoadingImage && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full min-h-[40vh] flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4 h-12 w-12 rounded-full border-4 border-[#2A2118] border-t-[#C4973B]"
            />
            <p className="text-lg text-[#A89885]">
              Creating something special...
            </p>
          </motion.div>
        )}

        {/* Image Display */}
        {imageUrl && (
          <motion.div
            key="image"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex justify-center"
          >
            <img
              src={imageUrl}
              alt="AI generated family art"
              className="max-h-[60vh] max-w-full rounded-2xl shadow-2xl"
              style={{ boxShadow: "0 0 40px rgba(196,151,59,0.3)" }}
            />
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
          <span>✦</span>
          <span className="h-px flex-1 bg-[#C4973B]/30" />
        </motion.div>
      )}
    </div>
  );
}
