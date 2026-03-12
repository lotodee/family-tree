"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import type { Membership, Celebration } from "@/types";

interface CelebrationItem {
  membership: Membership;
  celebration: Celebration;
}

interface SidebarMobileProps {
  userName: string;
  celebrations: CelebrationItem[];
}

export function SidebarMobile({ userName, celebrations }: SidebarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg"
        style={{
          backgroundColor: "var(--color-ivory)",
          border: "1px solid var(--color-gold-light)",
        }}
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-1">
          <span className="block w-5 h-0.5" style={{ backgroundColor: "var(--color-text-primary)" }} />
          <span className="block w-5 h-0.5" style={{ backgroundColor: "var(--color-text-primary)" }} />
          <span className="block w-5 h-0.5" style={{ backgroundColor: "var(--color-text-primary)" }} />
        </span>
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60]"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full z-[70] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Sidebar userName={userName} initialCelebrations={celebrations} />
        </div>

        {/* Close button inside the sidebar area */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-[-48px] w-10 h-10 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>
    </>
  );
}
