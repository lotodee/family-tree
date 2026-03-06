"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, EyeOff, User, Camera } from "lucide-react";
import { toast } from "sonner";
import type { FamilyTreeNode } from "@/types";
import { Avatar } from "@/components/ui/avatar";

interface AnswerWithQuestion {
  id: string;
  answer_text: string | null;
  question_id: string;
  subject_id: string;
  question: {
    text: string;
    category: string;
  };
  subject?: {
    display_name: string;
  };
}

interface ProfileClientProps {
  viewedNode: FamilyTreeNode;
  isOwnProfile: boolean;
  currentUserName: string;
  answersAboutSelf: AnswerWithQuestion[];
  answersAboutOthers: AnswerWithQuestion[];
  avatarUrl: string | null;
}

export function ProfileClient({
  viewedNode,
  isOwnProfile,
  currentUserName,
  answersAboutSelf,
  answersAboutOthers,
  avatarUrl,
}: ProfileClientProps) {
  if (isOwnProfile) {
    return <OwnProfileTrick name={currentUserName} answersAboutSelf={answersAboutSelf} answersAboutOthers={answersAboutOthers} avatarUrl={avatarUrl} />;
  }

  // Viewing someone else's profile - show normal view
  return (
    <div className="px-6 py-8">
      <Link
        href="/tree"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-burgundy)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Tree
      </Link>

      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--color-burgundy)]">
        {viewedNode.display_name}
      </h1>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        Family member profile coming soon...
      </p>
    </div>
  );
}

function OwnProfileTrick({
  name,
  answersAboutSelf,
  answersAboutOthers,
  avatarUrl,
}: {
  name: string;
  answersAboutSelf: AnswerWithQuestion[];
  answersAboutOthers: AnswerWithQuestion[];
  avatarUrl: string | null;
}) {
  const firstName = name.split(" ")[0];
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const { avatarUrl: newUrl } = await response.json();
      setCurrentAvatarUrl(newUrl);
      toast.success("Photo updated!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Group answers by subject for the tabs
  const answersBySubject = useMemo(() => {
    const grouped: Record<string, { name: string; answers: AnswerWithQuestion[] }> = {};

    answersAboutOthers.forEach((answer) => {
      const subjectId = answer.subject_id;
      const subjectName = answer.subject?.display_name || "Someone";

      if (!grouped[subjectId]) {
        grouped[subjectId] = { name: subjectName, answers: [] };
      }
      grouped[subjectId].answers.push(answer);
    });

    return grouped;
  }, [answersAboutOthers]);

  const subjectIds = Object.keys(answersBySubject);
  const [selectedTab, setSelectedTab] = useState<string | "self">("self");

  const currentAnswers =
    selectedTab === "self"
      ? answersAboutSelf
      : answersBySubject[selectedTab]?.answers || [];

  const currentSubjectName =
    selectedTab === "self" ? "Yourself" : answersBySubject[selectedTab]?.name || "";

  const hasAnyAnswers = answersAboutSelf.length > 0 || answersAboutOthers.length > 0;

  return (
    <div className="px-6 py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-burgundy)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Avatar with upload button */}
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <Avatar avatarPath={currentAvatarUrl} name={name} size={80} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-ivory)",
              border: "2px solid var(--color-ivory)",
            }}
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* The Trick - Funny Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 rounded-2xl border-2 border-dashed border-[var(--color-gold)] bg-[var(--color-gold-light)] p-6 text-center"
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <EyeOff className="mx-auto h-12 w-12 text-[var(--color-burgundy)]" />
        </motion.div>

        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-bold text-[var(--color-burgundy)]">
          {firstName}, you were told not to look!
        </h1>

        <p className="mt-2 font-[family-name:var(--font-dm-sans)] text-[var(--color-text-secondary)]">
          We knew you&apos;d click this anyway... but nice try! What the family said about you is a surprise for the big day.
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-sm italic text-[var(--color-text-secondary)]"
        >
          But since you&apos;re here, here&apos;s what YOU shared...
        </motion.p>
      </motion.div>

      {/* No answers yet */}
      {!hasAnyAnswers && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-[var(--color-ivory)] p-6 text-center"
        >
          <p className="text-[var(--color-text-secondary)]">
            You haven&apos;t shared any stories yet!
          </p>
          <Link
            href="/questions"
            className="mt-4 inline-block rounded-full bg-[var(--color-gold)] px-6 py-2 font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gold-dark)]"
          >
            Share Your Stories
          </Link>
        </motion.div>
      )}

      {/* Tabs */}
      {hasAnyAnswers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Tab Buttons */}
          <div className="mb-4 flex flex-wrap gap-2">
            {/* About Me tab */}
            {answersAboutSelf.length > 0 && (
              <button
                onClick={() => setSelectedTab("self")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedTab === "self"
                    ? "bg-[var(--color-burgundy)] text-white"
                    : "bg-[var(--color-ivory)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gold-light)]"
                }`}
              >
                <User className="h-4 w-4" />
                About Me
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  {answersAboutSelf.length}
                </span>
              </button>
            )}

            {/* Tabs for each person they talked about */}
            {subjectIds.map((subjectId) => {
              const subject = answersBySubject[subjectId];
              return (
                <button
                  key={subjectId}
                  onClick={() => setSelectedTab(subjectId)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedTab === subjectId
                      ? "bg-[var(--color-burgundy)] text-white"
                      : "bg-[var(--color-ivory)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gold-light)]"
                  }`}
                >
                  {subject.name}
                  <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {subject.answers.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[var(--color-text-primary)]">
                What you said about {currentSubjectName}
              </h2>

              {currentAnswers.length === 0 ? (
                <p className="text-[var(--color-text-secondary)]">
                  No answers in this category.
                </p>
              ) : (
                currentAnswers.map((answer, index) => (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl bg-[var(--color-ivory)] p-4 shadow-sm"
                  >
                    <p className="text-sm font-medium text-[var(--color-burgundy)]">
                      {answer.question.text}
                    </p>
                    <p className="mt-2 text-[var(--color-text-primary)]">
                      {answer.answer_text || "No answer provided"}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
