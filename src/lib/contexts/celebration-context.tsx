"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Celebration, Membership } from "@/types";

interface CelebrationContextValue {
  celebration: Celebration;
  membership: Membership;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function CelebrationProvider({
  celebration,
  membership,
  children,
}: CelebrationContextValue & { children: ReactNode }) {
  return (
    <CelebrationContext.Provider value={{ celebration, membership }}>
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration(): CelebrationContextValue {
  const ctx = useContext(CelebrationContext);
  if (!ctx) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return ctx;
}
