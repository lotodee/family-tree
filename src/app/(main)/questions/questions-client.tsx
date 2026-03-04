"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  // Calculate progress
  const selfAnsweredCount = useMemo(() => {
    return answers.filter(
      (a) =>
        a.subject_id === profile.tree_node_id &&
        selfQuestions.some((q) => q.id === a.question_id)
    ).length;
  }, [answers, profile.tree_node_id, selfQuestions]);

  const peopleAnsweredAbout = useMemo(() => {
    const subjectIds = new Set(
      answers
        .filter(
          (a) =>
            a.subject_id !== profile.tree_node_id &&
            aboutOtherQuestions.some((q) => q.id === a.question_id)
        )
        .map((a) => a.subject_id)
    );
    return subjectIds.size;
  }, [answers, profile.tree_node_id, aboutOtherQuestions]);

  // Check if all self questions are answered
  const allSelfAnswered = selfAnsweredCount >= selfQuestions.length;

  // Handlers
  const handleAnswerSaved = (answer: Answer) => {
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

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Tab Bar */}
      <div className="sticky top-0 z-10 mb-6 flex rounded-xl bg-white/80 p-1 shadow-sm backdrop-blur">
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
              ({peopleAnsweredAbout} {peopleAnsweredAbout === 1 ? "person" : "people"})
            </span>
          )}
        </button>
      </div>

      {/* Content */}
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
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-cream)] disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {/* Progress Dots */}
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
                    className={`rounded-full transition-all ${
                      isCurrent
                        ? "h-3 w-3 bg-[var(--color-burgundy)]"
                        : isAnswered
                          ? "h-2 w-2 bg-[var(--color-gold)]"
                          : "h-2 w-2 bg-[var(--color-gold-light)]"
                    }`}
                    aria-label={`Go to question ${index + 1}`}
                  />
                );
              })}
            </div>

            <button
              onClick={goToNext}
              disabled={currentQuestionIndex === currentQuestions.length - 1}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-cream)] disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
