export interface ToolProgress {
  toolId: string;
  learningProgress: number; // 0 to 100
  started: boolean;
  learningCompleted: boolean;
  assessmentPassed: boolean;
  highestScore: number;
  attempts: number;
  bookmarked: boolean;
  lastVisitedSection?: string;
  lastAttemptedAt?: string;
}

export interface UserProfile {
  name: string;
  role: 'Faculty' | 'Student' | 'Researcher' | 'Beginner' | 'Developer';
  streak: number;
  lastActiveDate: string;
  completedPaths: string[];
}

export interface CertificateData {
  id: string;
  pathId: string;
  pathName: string;
  learnerName: string;
  issuedAt: string;
  totalToolsLearned: number;
  averageScore: number;
}
