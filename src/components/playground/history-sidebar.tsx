"use client";

import { motion } from "framer-motion";
import { Clock, MessageSquare, ImageIcon, Sparkles } from "lucide-react";
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
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="flex h-full flex-col bg-[#0F0A07]">
      {/* Header */}
      <div className="border-b border-[#2A2118]/50 bg-gradient-to-b from-[#1A1410] to-transparent px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C4973B]/20 bg-[#C4973B]/10">
            <Clock size={14} className="text-[#C4973B]" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[#FFF8F0]">History</h2>
            <p className="text-xs text-[#A89885]">{sessions.length} sessions</p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="scrollbar-hide flex-1 overflow-y-auto p-3">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#2A2118] bg-[#1A1410]">
              <Sparkles size={20} className="text-[#A89885]" />
            </div>
            <p className="text-sm font-medium text-[#A89885]">No sessions yet</p>
            <p className="mt-1 text-xs text-[#A89885]/60">
              Start a conversation to see history
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, index) => (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                onClick={() => onSelectSession(session)}
                className="group w-full overflow-hidden rounded-xl border border-[#2A2118]/50 bg-[#1A1410]/50 p-3 text-left transition hover:border-[#C4973B]/30 hover:bg-[#1A1410]"
              >
                {/* Image preview if available */}
                {session.image_url && (
                  <div className="relative mb-2 aspect-video overflow-hidden rounded-lg bg-[#0F0A07]">
                    <img
                      src={session.image_url}
                      alt=""
                      className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                    />
                    <div className="absolute right-1.5 top-1.5 rounded-md bg-[#0F0A07]/80 px-1.5 py-0.5 text-[10px] font-medium text-[#C4973B]">
                      Image
                    </div>
                  </div>
                )}

                {/* Prompt text */}
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#2A2118]/50">
                    {session.image_url ? (
                      <ImageIcon size={10} className="text-[#C4973B]" />
                    ) : (
                      <MessageSquare size={10} className="text-[#A89885]" />
                    )}
                  </div>
                  <p className="flex-1 text-sm leading-snug text-[#FFF8F0]/90 group-hover:text-[#FFF8F0]">
                    {truncateText(session.prompt)}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="mt-2 flex items-center justify-between pl-7">
                  <span className="text-[10px] text-[#A89885]/60">
                    {formatTime(session.created_at)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
