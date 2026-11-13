// IMPORTANT: For secure institutional exams, assessment scoring should be moved to a backend/server API.
import { AssessmentAttempt } from '../types/assessment';
import { getPublicQuestionsForTool, getAnswerKeyMapForTool } from '../data/questions/questionPool';
import { AITool } from '../types/tool';
import { getAttemptsForTool } from './storage';
import { api } from './platform';

export interface GeneratedAssessment {
  managed?: boolean;
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
export async function generateAssessmentForTool(tool: AITool): Promise<GeneratedAssessment> {
  let managed: { id: string; question: string; options: string[]; type: string; difficulty: string }[] | null = null;
  try { managed = await api('assessment', undefined, undefined, tool.slug); } catch { /* Existing bundled assessments remain available. */ }
  if (managed?.length === 50) return { managed: true, toolId: tool.id, attemptNumber: getAttemptsForTool(tool.id).length + 1, questions: shuffleArray(managed).slice(0, 25).map(q => ({ ...q, originalIndexMap: [0,1,2,3] })) };
  if (tool.manualAssessmentOnly) return { toolId: tool.id, attemptNumber: 1, questions: [] };
  const toolId = tool.id;
  const publicQuestions = getPublicQuestionsForTool(tool);
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
export async function gradeAssessment(
  toolId: string,
  tool: AITool,
  attemptNumber: number,
  questions: GeneratedAssessment['questions'],
  userAnswers: Record<string, number> // questionId -> selectedShuffledOptionIndex
): Promise<AssessmentAttempt> {
  if (questions[0]?.id.startsWith(`${tool.id}-manual-`)) return api('grade', { ids: questions.map(q => q.id), answers: userAnswers, attemptNumber }, undefined, tool.slug);
  const answerKeyMap = getAnswerKeyMapForTool(toolId, tool);

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

