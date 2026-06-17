"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "./avatar";

interface ProfileDropdownProps {
  displayName: string;
  avatarPath: string | null;
}

export function ProfileDropdown({ displayName, avatarPath }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger: avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
        aria-label="Profile menu"
      >
        <span className="hidden font-[family-name:var(--font-dm-sans)] text-sm text-[var(--color-text-secondary)] sm:block">
          {displayName}
        </span>
        <Avatar avatarPath={avatarPath} name={displayName} size={32} />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl shadow-lg"
            style={{
              backgroundColor: "var(--color-ivory)",
              border: "1px solid var(--color-gold-light)",
              zIndex: 100,
            }}
          >
            {/* User info header */}
            <div
              className="border-b px-4 py-3"
              style={{ borderColor: "var(--color-gold-light)" }}
            >
              <p
                className="truncate text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {displayName}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(232,213,163,0.2)]"
                style={{ color: "var(--color-text-primary)" }}
              >
                <Settings className="h-4 w-4" style={{ color: "var(--color-gold)" }} />
                Settings
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(232,213,163,0.2)]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
