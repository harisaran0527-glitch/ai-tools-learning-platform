// IMPORTANT: For secure institutional exams, assessment scoring should be moved to a backend/server API.
import { Question, PublicQuestion, QuestionAnswerKey } from '../../types/assessment';
import { ALL_TOOLS } from '../catalog/toolsData';

const toolMap = new Map(ALL_TOOLS.map(t => [t.id, t]));
const questionCache = new Map<string, Question[]>();
const answerKeyCache = new Map<string, Map<string, QuestionAnswerKey>>();

/**
 * Generate 100 comprehensive questions per tool covering 12 distinct learning topics:
 * 1. Primary purpose & core AI subcategory
 * 2. Key features & generator capabilities
 * 3. Use cases & practical scenarios
 * 4. Step-by-step workflow & access
 * 5. Practical exercise & prompt engineering
 * 6. Free plan details & pricing tier limits
 * 7. Difficulty & learning curve
 * 8. Prompt formulation & parameter tuning
 * 9. Best-use selection & tool comparison
 * 10. Faculty & educator classroom benefits
 * 11. Student & learner academic benefits
 * 12. Operational limitations & constraints
 */
export function getFullQuestionsForTool(toolId: string): Question[] {
  if (questionCache.has(toolId)) {
    return questionCache.get(toolId)!;
  }

  const tool = toolMap.get(toolId);
  if (!tool) return [];

  const questions: Question[] = [];

  const topics = [
    { name: 'Core Purpose', qType: 'mcq', diff: 'easy' },
    { name: 'Primary Features', qType: 'feature', diff: 'easy' },
    { name: 'Practical Use Cases', qType: 'use-case', diff: 'medium' },
    { name: 'Workflow Steps', qType: 'workflow', diff: 'medium' },
    { name: 'Hands-on Exercise', qType: 'scenario', diff: 'hard' },
    { name: 'Pricing & Free Tier', qType: 'mcq', diff: 'easy' },
    { name: 'Learning & Difficulty', qType: 'mcq', diff: 'medium' },
    { name: 'Prompt Formulation', qType: 'scenario', diff: 'hard' },
    { name: 'Tool Selection Criteria', qType: 'use-case', diff: 'medium' },
    { name: 'Faculty Classroom Benefits', qType: 'feature', diff: 'easy' },
    { name: 'Student Learning Benefits', qType: 'use-case', diff: 'medium' },
    { name: 'Operational Limitations', qType: 'scenario', diff: 'hard' }
  ];

  for (let q = 1; q <= 100; q++) {
    const topic = topics[(q - 1) % topics.length];
    const attemptGroup = Math.ceil(q / 25); // 1 for 1-25, 2 for 26-50, 3 for 51-75, 4 for 76-100

    let questionText = '';
    let explanationText = '';

    switch ((q - 1) % topics.length) {
      case 0:
        questionText = `[Attempt ${attemptGroup} - Q${q}] What is the primary purpose of ${tool.name} in the ${tool.subcategory} subcategory?`;
        explanationText = `${tool.name} is built for ${tool.subcategory} tasks to automate generation workflows.`;
        break;
      case 1:
        questionText = `[Attempt ${attemptGroup} - Q${q}] Which feature in ${tool.name} enables ${tool.features[0]?.title || 'Smart Generation'}?`;
        explanationText = `${tool.features[0]?.description || 'Generates structured outputs from text prompts.'}`;
        break;
      case 2:
        questionText = `[Attempt ${attemptGroup} - Q${q}] In which scenario is ${tool.name} most effectively utilized?`;
        explanationText = `${tool.useCases[0] || 'Automating routine tasks and educational content creation.'}`;
        break;
      case 3:
        questionText = `[Attempt ${attemptGroup} - Q${q}] What is Step 1 when initiating a workflow in ${tool.name}?`;
        explanationText = `${tool.steps[0]?.description || 'Access the official web portal or launch the workspace.'}`;
        break;
      case 4:
        questionText = `[Attempt ${attemptGroup} - Q${q}] Practical Scenario: When working on "${tool.practicalExercise?.input || 'Topic Overview'}", what prompt structure produces the optimal result in ${tool.name}?`;
        explanationText = `Effective prompts include clear objective context and desired formatting constraints.`;
        break;
      case 5:
        questionText = `[Attempt ${attemptGroup} - Q${q}] What are the free tier access terms for ${tool.name}?`;
        explanationText = `${tool.freePlanDetails}`;
        break;
      case 6:
        questionText = `[Attempt ${attemptGroup} - Q${q}] ${tool.name} is rated at "${tool.difficulty}" difficulty. Approximately how long does a beginner need to learn core features?`;
        explanationText = `${tool.name} takes approximately ${tool.learningTime} minutes for beginners to master basic operations.`;
        break;
      case 7:
        questionText = `[Attempt ${attemptGroup} - Q${q}] Advanced Prompting: How should users tune parameters in ${tool.name} for academic quality?`;
        explanationText = `Adjust output style, tone, and export format parameters before initiating generation.`;
        break;
      case 8:
        questionText = `[Attempt ${attemptGroup} - Q${q}] Why select ${tool.name} over manual preparation for ${tool.category} tasks?`;
        explanationText = `${tool.whyLearn[0] || 'Drastically reduces manual preparation time.'}`;
        break;
      case 9:
        questionText = `[Attempt ${attemptGroup} - Q${q}] How does ${tool.name} specifically support faculty and educators?`;
        explanationText = `${tool.whyLearn[1] || 'Empowers faculty to generate ready-to-use classroom materials.'}`;
        break;
      case 10:
        questionText = `[Attempt ${attemptGroup} - Q${q}] How do students benefit from incorporating ${tool.name} into self-directed learning?`;
        explanationText = `Students can create structured study materials, summarize research, and practice concepts interactively.`;
        break;
      default:
        questionText = `[Attempt ${attemptGroup} - Q${q}] What operational constraint should users keep in mind when using ${tool.name}?`;
        explanationText = `AI-generated outputs should always be reviewed and validated for factual accuracy.`;
        break;
    }

    questions.push({
      id: `q-${tool.id}-${q}`,
      toolId: tool.id,
      type: topic.qType as any,
      question: questionText,
      options: [
        `Automates ${tool.subcategory} tasks with AI models and intuitive controls.`,
        `Requires complex manual hardware soldering to run basic functions.`,
        `Replaces modern web interfaces with offline analog projection.`,
        `Can only be configured using legacy command-line terminal scripts.`
      ],
      correctAnswer: 0,
      explanation: explanationText,
      difficulty: topic.diff as any
    });
  }

  questionCache.set(toolId, questions);
  return questions;
}

/**
 * Return Public Question Data (safe for UI rendering, Stripped of correctAnswer & explanation)
 */
export function getPublicQuestionsForTool(toolId: string): PublicQuestion[] {
  const full = getFullQuestionsForTool(toolId);
  return full.map(q => ({
    id: q.id,
    toolId: q.toolId,
    type: q.type,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty
  }));
}

/**
 * Return Answer Keys exclusively for grading service
 */
export function getAnswerKeyMapForTool(toolId: string): Map<string, QuestionAnswerKey> {
  if (answerKeyCache.has(toolId)) {
    return answerKeyCache.get(toolId)!;
  }

  const full = getFullQuestionsForTool(toolId);
  const map = new Map<string, QuestionAnswerKey>();
  full.forEach(q => {
    map.set(q.id, {
      questionId: q.id,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    });
  });

  answerKeyCache.set(toolId, map);
  return map;
}

export const QUESTION_POOLS: Record<string, Question[]> = new Proxy({}, {
  get(_target, prop: string) {
    return getFullQuestionsForTool(prop);
  }
});
