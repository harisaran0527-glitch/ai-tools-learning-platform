export type PricingType = 'free' | 'free-tier' | 'open-source' | 'free-trial';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type TutorialResourceType = 'youtube' | 'platform';
export type DocumentationResourceType = 'official' | 'github' | 'huggingface' | 'platform';

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

export interface InteractiveTutorialStep {
  stepNumber: number;
  title: string;
  description: string;
  examplePrompt?: string;
  expectedOutcome?: string;
}

export interface TutorialVideo {
  type?: TutorialResourceType;
  title: string;
  url?: string;
  source?: string;
  sourceType?: string;
  embedUrl?: string;
  steps?: InteractiveTutorialStep[];
  verifiedAt?: string;
}

export interface DocumentationSection {
  title: string;
  content: string;
}

export interface DocumentationResource {
  type: DocumentationResourceType;
  title: string;
  url?: string;
  sections?: DocumentationSection[];
  verifiedAt?: string;
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
  tutorialResource?: TutorialVideo;
  documentationResource?: DocumentationResource;

  keywords: string[];

  lastVerified?: string;
  verifiedAt?: string;
  iconBgGradient?: string;
  badge?: string;
}

export type ToolSummary = Pick<AITool,
  'id' | 'slug' | 'name' | 'logo' | 'category' | 'subcategory' |
  'pricingType' | 'freePlanDetails' | 'platforms' | 'shortDescription' |
  'superpower' | 'difficulty' | 'learningTime' | 'officialUrl' | 'officialStatus' |
  'docsUrl' | 'docsStatus' | 'keywords' | 'badge'
>;

