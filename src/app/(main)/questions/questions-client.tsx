"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Check, User, Users } from "lucide-react";
import { QuestionCard } from "@/components/questions/question-card";
import { SubjectPicker } from "@/components/questions/subject-picker";
import { CompletionCard } from "@/components/questions/completion-card";
import type { Question, Answer, FamilyTreeNode, Profile } from "@/types";

type Phase = "self" | "about_other";

interface QuestionsPageClientProps {
  userId: string;
  profile: Profile & { tree_node: FamilyTreeNode };
  questions: Question[];
  existingAnswers: Answer[];
  treeNodes: FamilyTreeNode[];
}

export function QuestionsPageClient({
  userId,
  profile,
  questions,
  existingAnswers,
  treeNodes,
}: QuestionsPageClientProps) {
  const [phase, setPhase] = useState<Phase>("self");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [answers, setAnswers] = useState<Answer[]>(existingAnswers);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Split questions by type
  const selfQuestions = useMemo(
    () => questions.filter((q) => q.type === "self"),
    [questions]
  );
  const aboutOtherQuestions = useMemo(
    () => questions.filter((q) => q.type === "about_other"),
    [questions]
  );

  // Current questions based on phase
  const currentQuestions =
    phase === "self" ? selfQuestions : aboutOtherQuestions;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Current subject ID
  const currentSubjectId =
    phase === "self" ? profile.tree_node_id! : selectedSubjectId;

  // Find existing answer for current question + subject
  const existingAnswer = useMemo(() => {
    if (!currentSubjectId || !currentQuestion) return null;
    return answers.find(
      (a) =>
        a.question_id === currentQuestion.id &&
        a.subject_id === currentSubjectId
    );
  }, [answers, currentQuestion, currentSubjectId]);

  // Get self answers with question text
  const selfAnswersWithQuestions = useMemo(() => {
    return answers
      .filter(
        (a) =>
          a.subject_id === profile.tree_node_id &&
          selfQuestions.some((q) => q.id === a.question_id)
      )
      .map((a) => ({
        ...a,
        question: selfQuestions.find((q) => q.id === a.question_id),
      }))
      .filter((a) => a.question);
  }, [answers, profile.tree_node_id, selfQuestions]);

  // Get about_other answers grouped by subject
  const otherAnswersBySubject = useMemo(() => {
    const grouped: Record<
      string,
      { subjectName: string; answers: (Answer & { question?: Question })[] }
    > = {};

    answers
      .filter(
        (a) =>
          a.subject_id !== profile.tree_node_id &&
          aboutOtherQuestions.some((q) => q.id === a.question_id)
      )
      .forEach((a) => {
        if (!grouped[a.subject_id]) {
          const node = treeNodes.find((n) => n.id === a.subject_id);
          grouped[a.subject_id] = {
            subjectName: node?.display_name || "Unknown",
            answers: [],
          };
        }
        grouped[a.subject_id].answers.push({
          ...a,
          question: aboutOtherQuestions.find((q) => q.id === a.question_id),
        });
      });

    return grouped;
  }, [answers, profile.tree_node_id, aboutOtherQuestions, treeNodes]);

  // Calculate progress
  const selfAnsweredCount = selfAnswersWithQuestions.length;

  const peopleAnsweredAbout = Object.keys(otherAnswersBySubject).length;

  // Check if all self questions are answered
  const allSelfAnswered = selfAnsweredCount >= selfQuestions.length;

  // Handlers
  const handleAnswerSaved = (answer: Answer, isNewAnswer: boolean) => {
    setAnswers((prev) => {
      const existing = prev.findIndex(
        (a) =>
          a.question_id === answer.question_id &&
          a.subject_id === answer.subject_id
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = answer;
        return updated;
      }
      return [...prev, answer];
    });

    // Auto-skip to next question on new answer
    if (isNewAnswer && currentQuestionIndex < currentQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((i) => i + 1);
      }, 500);
    }
  };

  const handleAnswerDeleted = (questionId: string, subjectId: string) => {
    setAnswers((prev) =>
      prev.filter(
        (a) => !(a.question_id === questionId && a.subject_id === subjectId)
      )
    );
  };

  const handleSelectSubject = (nodeId: string) => {
    setSelectedSubjectId(nodeId);
    setCurrentQuestionIndex(0);
  };

  const handleChangePerson = () => {
    setSelectedSubjectId(null);
    setCurrentQuestionIndex(0);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handleTalkAboutOthers = () => {
    setPhase("about_other");
    setSelectedSubjectId(null);
    setCurrentQuestionIndex(0);
  };

  const handleReviewAnswers = () => {
    setCurrentQuestionIndex(0);
  };

  // Get selected subject name
  const selectedSubjectName = useMemo(() => {
    if (!selectedSubjectId) return "";
    const node = treeNodes.find((n) => n.id === selectedSubjectId);
    return node?.display_name || "this person";
  }, [selectedSubjectId, treeNodes]);

  // Side Panel Component
  const AnswerPanel = ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children,
    count,
  }: {
    title: string;
    icon: typeof User;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    count: number;
  }) => (
    <div className="rounded-xl border border-[var(--color-gold-light)] bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[var(--color-burgundy)]" />
          <span className="font-medium text-[var(--color-text-primary)]">
            {title}
          </span>
          <span className="rounded-full bg-[var(--color-gold-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-burgundy)]">
            {count}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-[var(--color-text-secondary)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="border-t border-[var(--color-gold-light)] p-4">{children}</div>}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 pb-8">
      {/* Desktop Layout with Side Panels */}
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Left Panel - Your Answers (Desktop only) */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <User className="h-5 w-5 text-[var(--color-burgundy)]" />
              <h3 className="font-medium text-[var(--color-text-primary)]">
                Your Answers
              </h3>
              <span className="rounded-full bg-[var(--color-gold-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-burgundy)]">
                {selfAnsweredCount}/{selfQuestions.length}
              </span>
            </div>
            <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto rounded-xl border border-[var(--color-gold-light)] bg-white p-3">
              {selfAnswersWithQuestions.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
                  No answers yet
                </p>
              ) : (
                selfAnswersWithQuestions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      setPhase("self");
                      const idx = selfQuestions.findIndex(
                        (q) => q.id === a.question_id
                      );
                      if (idx >= 0) setCurrentQuestionIndex(idx);
                    }}
                    className="w-full rounded-lg bg-[var(--color-cream)] p-3 text-left transition-all hover:bg-[var(--color-gold-light)]/50"
                  >
                    <p className="mb-1 text-xs font-medium text-[var(--color-burgundy)]">
                      {a.question?.text}
                    </p>
                    <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                      {a.answer_text}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Tab Bar */}
          <div className="mb-4 flex rounded-xl bg-white/80 p-1 shadow-sm backdrop-blur md:mb-6">
            <button
              onClick={() => {
                setPhase("self");
                setCurrentQuestionIndex(0);
              }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                phase === "self"
                  ? "bg-[var(--color-gold)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              About You
              <span className="ml-1 text-xs opacity-80">
                ({selfAnsweredCount}/{selfQuestions.length})
              </span>
            </button>
            <button
              onClick={() => {
                setPhase("about_other");
                setCurrentQuestionIndex(0);
              }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                phase === "about_other"
                  ? "bg-[var(--color-gold)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              About Others
              {peopleAnsweredAbout > 0 && (
                <span className="ml-1 text-xs opacity-80">
                  ({peopleAnsweredAbout}{" "}
                  {peopleAnsweredAbout === 1 ? "person" : "people"})
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-lg">
            {phase === "self" && allSelfAnswered ? (
              <CompletionCard
                onTalkAboutOthers={handleTalkAboutOthers}
                onReviewAnswers={handleReviewAnswers}
              />
            ) : phase === "about_other" && !selectedSubjectId ? (
              <SubjectPicker
                treeNodes={treeNodes}
                userTreeNodeId={profile.tree_node_id!}
                existingAnswers={answers}
                onSelectSubject={handleSelectSubject}
              />
            ) : currentQuestion && currentSubjectId ? (
              <>
                {/* Change person button for "about others" */}
                {phase === "about_other" && selectedSubjectId && (
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Talking about{" "}
                      <span className="font-medium text-[var(--color-burgundy)]">
                        {selectedSubjectName}
                      </span>
                    </span>
                    <button
                      onClick={handleChangePerson}
                      className="text-sm text-[var(--color-gold)] hover:underline"
                    >
                      Change person
                    </button>
                  </div>
                )}

                {/* Question Card */}
                <QuestionCard
                  question={currentQuestion}
                  subjectId={currentSubjectId}
                  subjectName={
                    phase === "self" ? profile.full_name : selectedSubjectName
                  }
                  userId={userId}
                  existingAnswer={existingAnswer || null}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={currentQuestions.length}
                  onAnswerSaved={handleAnswerSaved}
                  onAnswerDeleted={handleAnswerDeleted}
                />

                {/* Navigation */}
                <div className="mt-4 flex items-center justify-between gap-2 md:mt-6">
                  <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-2 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-cream)] disabled:opacity-30 md:gap-1 md:px-4"
                  >
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Progress Dots - scrollable on mobile if many questions */}
                  <div className="flex min-w-0 flex-1 justify-center overflow-x-auto px-2">
                    <div className="flex gap-1.5">
                      {currentQuestions.map((_, index) => {
                        const questionId = currentQuestions[index].id;
                        const isAnswered = answers.some(
                          (a) =>
                            a.question_id === questionId &&
                            a.subject_id === currentSubjectId
                        );
                        const isCurrent = index === currentQuestionIndex;

                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`shrink-0 rounded-full transition-all ${
                              isCurrent
                                ? "h-2.5 w-2.5 bg-[var(--color-burgundy)] md:h-3 md:w-3"
                                : isAnswered
                                  ? "h-2 w-2 bg-[var(--color-gold)]"
                                  : "h-2 w-2 bg-[var(--color-gold-light)]"
                            }`}
                            aria-label={`Go to question ${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={goToNext}
                    disabled={currentQuestionIndex === currentQuestions.length - 1}
                    className="flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-2 text-sm text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-cream)] disabled:opacity-30 md:gap-1 md:px-4"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* Mobile Panels - Below Main Content */}
          <div className="mt-8 space-y-4 lg:hidden">
            <AnswerPanel
              title="Your Answers"
              icon={User}
              isOpen={showLeftPanel}
              onToggle={() => setShowLeftPanel(!showLeftPanel)}
              count={selfAnsweredCount}
            >
              {selfAnswersWithQuestions.length === 0 ? (
                <p className="py-2 text-center text-sm text-[var(--color-text-secondary)]">
                  No answers yet
                </p>
              ) : (
                <div className="space-y-2">
                  {selfAnswersWithQuestions.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setPhase("self");
                        const idx = selfQuestions.findIndex(
                          (q) => q.id === a.question_id
                        );
                        if (idx >= 0) setCurrentQuestionIndex(idx);
                        setShowLeftPanel(false);
                      }}
                      className="w-full rounded-lg bg-[var(--color-cream)] p-3 text-left"
                    >
                      <p className="mb-1 flex items-center gap-1 text-xs font-medium text-[var(--color-burgundy)]">
                        <Check className="h-3 w-3" />
                        {a.question?.text}
                      </p>
                      <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                        {a.answer_text}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </AnswerPanel>

            <AnswerPanel
              title="About Others"
              icon={Users}
              isOpen={showRightPanel}
              onToggle={() => setShowRightPanel(!showRightPanel)}
              count={Object.values(otherAnswersBySubject).reduce(
                (sum, g) => sum + g.answers.length,
                0
              )}
            >
              {Object.keys(otherAnswersBySubject).length === 0 ? (
                <p className="py-2 text-center text-sm text-[var(--color-text-secondary)]">
                  No answers yet
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(otherAnswersBySubject).map(
                    ([subjectId, { subjectName, answers: subjectAnswers }]) => (
                      <div key={subjectId}>
                        <p className="mb-2 text-sm font-medium text-[var(--color-burgundy)]">
                          About {subjectName}
                        </p>
                        <div className="space-y-2">
                          {subjectAnswers.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => {
                                setPhase("about_other");
                                setSelectedSubjectId(subjectId);
                                const idx = aboutOtherQuestions.findIndex(
                                  (q) => q.id === a.question_id
                                );
                                if (idx >= 0) setCurrentQuestionIndex(idx);
                                setShowRightPanel(false);
                              }}
                              className="w-full rounded-lg bg-[var(--color-cream)] p-3 text-left"
                            >
                              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-[var(--color-gold)]">
                                <Check className="h-3 w-3" />
                                {a.question?.text?.replace(
                                  "this person",
                                  subjectName
                                )}
                              </p>
                              <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                                {a.answer_text}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </AnswerPanel>
          </div>
        </div>

        {/* Right Panel - About Others (Desktop only) */}
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Users className="h-5 w-5 text-[var(--color-burgundy)]" />
              <h3 className="font-medium text-[var(--color-text-primary)]">
                About Others
              </h3>
              <span className="rounded-full bg-[var(--color-gold-light)] px-2 py-0.5 text-xs font-medium text-[var(--color-burgundy)]">
                {Object.values(otherAnswersBySubject).reduce(
                  (sum, g) => sum + g.answers.length,
                  0
                )}
              </span>
            </div>
            <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto rounded-xl border border-[var(--color-gold-light)] bg-white p-3">
              {Object.keys(otherAnswersBySubject).length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--color-text-secondary)]">
                  No answers yet
                </p>
              ) : (
                Object.entries(otherAnswersBySubject).map(
                  ([subjectId, { subjectName, answers: subjectAnswers }]) => (
                    <div key={subjectId}>
                      <p className="mb-2 text-sm font-medium text-[var(--color-burgundy)]">
                        About {subjectName}
                      </p>
                      <div className="space-y-2">
                        {subjectAnswers.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => {
                              setPhase("about_other");
                              setSelectedSubjectId(subjectId);
                              const idx = aboutOtherQuestions.findIndex(
                                (q) => q.id === a.question_id
                              );
                              if (idx >= 0) setCurrentQuestionIndex(idx);
                            }}
                            className="w-full rounded-lg bg-[var(--color-cream)] p-3 text-left transition-all hover:bg-[var(--color-gold-light)]/50"
                          >
                            <p className="mb-1 text-xs font-medium text-[var(--color-gold)]">
                              {a.question?.text?.replace(
                                "this person",
                                subjectName
                              )}
                            </p>
                            <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                              {a.answer_text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
