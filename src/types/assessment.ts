export type QuestionType = 'mcq' | 'scenario' | 'workflow' | 'feature' | 'use-case';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Public Question Data (safe to render in UI components)
 * Does NOT include correctAnswer or explanation.
 */
export interface PublicQuestion {
  id: string;
  toolId: string;
  type: QuestionType;
  question: string;
  options: string[];
  difficulty: QuestionDifficulty;
}

/**
 * Answer Key Data (used exclusively by assessment scoring service)
 */
export interface QuestionAnswerKey {
  questionId: string;
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface Question {
  id: string;
  toolId: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  difficulty: QuestionDifficulty;
}

export interface AssessmentAttempt {
  id: string;
  toolId: string;
  attemptNumber: number;
  questionIds: string[];
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  score: number; // out of 50
  totalMarks: number; // 50
  passed: boolean;
  completedAt: string;
}

export interface QuestionPool {
  toolId: string;
  questions: Question[];
}

