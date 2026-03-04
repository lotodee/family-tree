"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpenIcon,
  LinkChainIcon,
  SparkleIcon,
  SmileIcon,
  MasksIcon,
  PaletteIcon,
  ThoughtBubbleIcon,
  RainbowIcon,
  NigeriaFlagIcon,
  FrameIcon,
} from "@/components/icons";

interface ThinkingAnimationProps {
  isThinking: boolean;
  type?: "text" | "image";
}

interface Phase {
  text: string;
  icon: ReactNode;
}

const TEXT_PHASES: Phase[] = [
  { text: "Reading family stories", icon: <BookOpenIcon size={36} /> },
  { text: "Connecting the memories", icon: <LinkChainIcon size={36} /> },
  { text: "Finding the perfect words", icon: <SparkleIcon size={36} /> },
  { text: "Adding a touch of humor", icon: <SmileIcon size={36} /> },
  { text: "Crafting your response", icon: <MasksIcon size={36} /> },
];

const IMAGE_PHASES: Phase[] = [
  { text: "Studying their personality", icon: <PaletteIcon size={36} /> },
  { text: "Imagining the perfect scene", icon: <ThoughtBubbleIcon size={36} /> },
  { text: "Mixing colors and vibes", icon: <RainbowIcon size={36} /> },
  { text: "Adding Nigerian flavor", icon: <NigeriaFlagIcon size={36} /> },
  { text: "Painting your masterpiece", icon: <FrameIcon size={36} /> },
];

export function ThinkingAnimation({ isThinking, type = "text" }: ThinkingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const phases = type === "image" ? IMAGE_PHASES : TEXT_PHASES;

  useEffect(() => {
    if (!isThinking) {
      setCurrentPhase(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isThinking, phases.length]);

  if (!isThinking) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {/* Central orb animation */}
      <div className="relative mb-8">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(196,151,59,0.3) 0%, transparent 70%)",
            width: 160,
            height: 160,
            left: -40,
            top: -40,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Middle ring */}
        <motion.div
          className="absolute rounded-full border-2 border-[#C4973B]/30"
          style={{
            width: 100,
            height: 100,
            left: -10,
            top: -10,
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />

        {/* Inner spinning ring */}
        <motion.div
          className="absolute rounded-full border-2 border-dashed border-[#C4973B]/50"
          style={{
            width: 60,
            height: 60,
            left: 10,
            top: 10,
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center icon */}
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#C4973B]/20 to-[#1A1410]"
          animate={{
            boxShadow: [
              "0 0 20px rgba(196,151,59,0.3)",
              "0 0 40px rgba(196,151,59,0.5)",
              "0 0 20px rgba(196,151,59,0.3)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center"
            >
              {phases[currentPhase].icon}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Phase text */}
      <div className="h-16 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-lg font-medium text-[#C4973B]">
              {phases[currentPhase].text}
            </p>

            {/* Animated dots */}
            <div className="mt-2 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-[#C4973B]/60"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 flex gap-2">
        {phases.map((_, index) => (
          <motion.div
            key={index}
            className={`h-1.5 w-8 rounded-full ${
              index <= currentPhase ? "bg-[#C4973B]" : "bg-[#2A2118]"
            }`}
            animate={
              index === currentPhase
                ? { opacity: [0.5, 1, 0.5] }
                : {}
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[#C4973B]/40"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
