"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RopeBoardProps {
  isOpen: boolean;
  onDismiss: () => void;
  children: ReactNode;
}

export function RopeBoard({ isOpen, onDismiss, children }: RopeBoardProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(45, 24, 16, 0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onDismiss}
          />

          {/* Board container */}
          <div
            className="pointer-events-none fixed inset-0 z-50 flex justify-center"
            style={{ paddingTop: "10vh" }}
          >
            <div className="pointer-events-auto relative">
              {/* Left rope */}
              <motion.div
                className="absolute"
                style={{
                  left: "15%",
                  top: 0,
                  width: 3,
                  transformOrigin: "top center",
                  backgroundColor: "var(--color-gold)",
                  borderRadius: 2,
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 60, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              {/* Right rope */}
              <motion.div
                className="absolute"
                style={{
                  right: "15%",
                  top: 0,
                  width: 3,
                  transformOrigin: "top center",
                  backgroundColor: "var(--color-gold)",
                  borderRadius: 2,
                }}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 60, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              {/* The board */}
              <motion.div
                className="relative mx-auto"
                style={{
                  marginTop: 60,
                  width: "min(360px, 90vw)",
                  backgroundColor: "var(--color-ivory)",
                  border: "2px solid var(--color-gold)",
                  borderRadius: 16,
                  boxShadow:
                    "0 12px 40px rgba(45, 24, 16, 0.2), 0 0 0 1px rgba(196, 151, 59, 0.1)",
                  overflow: "hidden",
                }}
                initial={{ y: -300, opacity: 0, rotate: -3 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -300, opacity: 0, rotate: 2 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 100,
                  mass: 1.2,
                  delay: 0.15,
                }}
              >
                {/* Gold top edge */}
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: "var(--color-gold)" }}
                />

                {/* Rope attachment dots */}
                <div
                  className="absolute h-3 w-3 rounded-full"
                  style={{
                    top: 0,
                    left: "15%",
                    transform: "translateX(-50%) translateY(-50%)",
                    backgroundColor: "var(--color-gold)",
                    border: "2px solid var(--color-burgundy)",
                  }}
                />
                <div
                  className="absolute h-3 w-3 rounded-full"
                  style={{
                    top: 0,
                    right: "15%",
                    transform: "translateX(50%) translateY(-50%)",
                    backgroundColor: "var(--color-gold)",
                    border: "2px solid var(--color-burgundy)",
                  }}
                />

                {/* Board content */}
                <div className="p-6">{children}</div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
