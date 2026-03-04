import { create } from "zustand";
import type { Question, Answer } from "@/types";

type Phase = "self" | "about_other";

interface QuestionState {
  phase: Phase;
  currentSubjectId: string | null;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  isRecording: boolean;
  isTranscribing: boolean;
  setPhase: (phase: Phase) => void;
  setCurrentSubject: (subjectId: string | null) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswers: (answers: Answer[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setRecording: (recording: boolean) => void;
  setTranscribing: (transcribing: boolean) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

export const useQuestionStore = create<QuestionState>((set) => ({
  phase: "self",
  currentSubjectId: null,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  isRecording: false,
  isTranscribing: false,
  setPhase: (phase) => set({ phase, currentQuestionIndex: 0 }),
  setCurrentSubject: (currentSubjectId) => set({ currentSubjectId }),
  setQuestions: (questions) => set({ questions }),
  setAnswers: (answers) => set({ answers }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setRecording: (isRecording) => set({ isRecording }),
  setTranscribing: (isTranscribing) => set({ isTranscribing }),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    })),
  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),
}));
