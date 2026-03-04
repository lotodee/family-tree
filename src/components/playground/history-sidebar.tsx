"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { LLMSession } from "@/types";

interface HistorySidebarProps {
  sessions: LLMSession[];
  onSelectSession: (session: LLMSession) => void;
}

export function HistorySidebar({
  sessions,
  onSelectSession,
}: HistorySidebarProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[#2A2118] p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#A89885]">
          <Clock size={14} />
          Session History
        </h2>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="p-4 text-center text-sm text-[#A89885]">
            No sessions yet. Start a conversation!
          </p>
        ) : (
          <div className="space-y-1">
            {sessions.map((session, index) => (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectSession(session)}
                className="w-full rounded-lg p-3 text-left transition hover:bg-[#2A2118]"
              >
                <p className="text-sm text-[#FFF8F0]">
                  {truncateText(session.prompt)}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-[#A89885]">
                    {formatTime(session.created_at)}
                  </span>
                  {session.image_url && (
                    <span className="rounded bg-[#C4973B]/20 px-2 py-0.5 text-xs text-[#C4973B]">
                      Image
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
