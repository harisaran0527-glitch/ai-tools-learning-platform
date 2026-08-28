export type PricingType = 'free' | 'free-tier' | 'open-source' | 'free-trial';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ToolFeature {
  title: string;
  description: string;
  whenToUse?: string;
}

export interface UsageStep {
  title: string;
  description: string;
}

export interface PracticalExercise {
  objective: string;
  input?: string;
  examplePrompt?: string;
  expectedResult: string;
  skillsLearned: string[];
}

export interface TutorialVideo {
  title: string;
  url: string;
  source: string;
  sourceType?: string;
  embedUrl?: string;
}

export interface AITool {
  id: string;
  slug: string;
  name: string;
  logo?: string;

  category: string;
  subcategory: string;

  pricingType: PricingType;
  freePlanDetails: string;
  signupRequired: boolean;
  installationRequired: boolean;

  platforms: string[];

  shortDescription: string;
  fullDescription: string;

  superpower: string;

  difficulty: DifficultyLevel;
  learningTime: number; // in minutes

  whyLearn: string[];
  useCases: string[];

  features: ToolFeature[];
  steps: UsageStep[];

  practicalExercise: PracticalExercise;

  officialUrl: string;
  officialStatus?: 'verified' | 'unavailable';
  docsUrl?: string;
  docsStatus?: 'verified' | 'unavailable';

  tutorialVideo?: TutorialVideo;
  tutorialVideoStatus?: 'verified' | 'unavailable';

  keywords: string[];

  lastVerified?: string;
  verifiedAt?: string;
  iconBgGradient?: string;
  badge?: string;
}
