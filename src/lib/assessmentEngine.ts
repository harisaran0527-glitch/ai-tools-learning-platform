// IMPORTANT: For secure institutional exams, assessment scoring should be moved to a backend/server API.
import { AssessmentAttempt } from '../types/assessment';
import { getPublicQuestionsForTool, getAnswerKeyMapForTool, getFullQuestionsForTool } from '../data/questions/questionPool';
import { getAttemptsForTool } from './storage';

export interface GeneratedAssessment {
  toolId: string;
  attemptNumber: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    originalIndexMap: number[]; // maps shuffled option index -> original option index
    type: string;
    difficulty: string;
  }[];
}

/**
 * Utility to shuffle array randomly
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate 25 questions for an assessment attempt out of 100 total questions per tool.
 * Guarantees 0 overlap across Attempt 1, Attempt 2, Attempt 3, and Attempt 4 (25 + 25 + 25 + 25 = 100).
 * Uses controlled Least-Recently-Used (LRU) fallback for Attempt 5+ when inventory is exhausted.
 */
export function generateAssessmentForTool(toolId: string): GeneratedAssessment {
  const publicQuestions = getPublicQuestionsForTool(toolId);
  const pastAttempts = getAttemptsForTool(toolId);
  const attemptNumber = pastAttempts.length + 1;

  // Track question usage frequency across past attempts
  const usageCountMap = new Map<string, number>();
  pastAttempts.forEach(attempt => {
    attempt.questionIds.forEach(id => {
      usageCountMap.set(id, (usageCountMap.get(id) || 0) + 1);
    });
  });

  // Filter pool for unused questions first (0 usage count)
  let eligibleQuestions = publicQuestions.filter(q => (usageCountMap.get(q.id) || 0) === 0);

  // If eligible unused questions < 25 (e.g. Attempt 5+ when all 100 questions used), sort by least recently used
  if (eligibleQuestions.length < 25) {
    const sortedByLRU = [...publicQuestions].sort((a, b) => {
      const countA = usageCountMap.get(a.id) || 0;
      const countB = usageCountMap.get(b.id) || 0;
      return countA - countB;
    });
    eligibleQuestions = sortedByLRU;
  }

  // Shuffle and pick 25 questions
  const selectedRaw = shuffleArray(eligibleQuestions).slice(0, 25);

  // Format questions and shuffle option order (stripping answer keys)
  const formattedQuestions = selectedRaw.map(q => {
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    const shuffledOptions = shuffledIndices.map(idx => q.options[idx]);

    return {
      id: q.id,
      question: q.question,
      options: shuffledOptions,
      originalIndexMap: shuffledIndices,
      type: q.type,
      difficulty: q.difficulty
    };
  });

  return {
    toolId,
    attemptNumber,
    questions: formattedQuestions
  };
}

/**
 * Grade an assessment attempt securely.
 * Each question is worth 2 marks. 25 questions * 2 = 50 total marks.
 * Pass mark = 25 / 50 (>= 25 PASS, < 25 FAIL).
 */
export function gradeAssessment(
  toolId: string,
  attemptNumber: number,
  questions: GeneratedAssessment['questions'],
  userAnswers: Record<string, number> // questionId -> selectedShuffledOptionIndex
): AssessmentAttempt {
  const answerKeyMap = getAnswerKeyMapForTool(toolId);

  let score = 0;
  const totalMarks = 50;

  questions.forEach(q => {
    const selectedShuffledIndex = userAnswers[q.id];
    if (selectedShuffledIndex !== undefined && selectedShuffledIndex !== null) {
      // Convert shuffled index back to original index
      const originalOptionIndex = q.originalIndexMap[selectedShuffledIndex];
      const answerKey = answerKeyMap.get(q.id);

      if (answerKey && originalOptionIndex === answerKey.correctAnswer) {
        score += 2; // 2 marks per correct answer
      }
    }
  });

  const passed = score >= 25;

  return {
    id: `attempt-${toolId}-${Date.now()}`,
    toolId,
    attemptNumber,
    questionIds: questions.map(q => q.id),
    answers: userAnswers,
    score,
    totalMarks,
    passed,
    completedAt: new Date().toISOString()
  };
}

