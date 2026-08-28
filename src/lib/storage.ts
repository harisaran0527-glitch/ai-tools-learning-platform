import { ToolProgress, UserProfile, CertificateData } from '../types/progress';
import { AssessmentAttempt } from '../types/assessment';

const SCHEMA_VERSION = 1;
const PROGRESS_KEY = 'ai_tools_progress_v1';
const ATTEMPTS_KEY = 'ai_tools_attempts_v1';
const USER_KEY = 'ai_tools_user_v1';
const CERTS_KEY = 'ai_tools_certs_v1';

export function getProgressMap(): Record<string, ToolProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (e) {
    console.warn('Recovered from corrupted progress storage', e);
    return {};
  }
}

export function saveProgressMap(map: Record<string, ToolProgress>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save progress map', e);
  }
}

export function getToolProgress(toolId: string): ToolProgress {
  const map = getProgressMap();
  if (map[toolId]) {
    return map[toolId];
  }
  return {
    toolId,
    learningProgress: 0,
    started: false,
    learningCompleted: false,
    assessmentPassed: false,
    highestScore: 0,
    attempts: 0,
    bookmarked: false
  };
}

export function updateToolProgress(toolId: string, patch: Partial<ToolProgress>): ToolProgress {
  const map = getProgressMap();
  const current = getToolProgress(toolId);
  const updated = { ...current, ...patch };
  map[toolId] = updated;
  saveProgressMap(map);
  return updated;
}

export function toggleBookmark(toolId: string): boolean {
  const current = getToolProgress(toolId);
  const nextStatus = !current.bookmarked;
  updateToolProgress(toolId, { bookmarked: nextStatus });
  return nextStatus;
}

export function getBookmarkedToolIds(): string[] {
  const map = getProgressMap();
  return Object.values(map)
    .filter(p => p.bookmarked)
    .map(p => p.toolId);
}

// Assessment Attempts
export function getAttempts(): AssessmentAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Recovered from corrupted attempts storage', e);
    return [];
  }
}

export function saveAttempt(attempt: AssessmentAttempt): void {
  const attempts = getAttempts();
  attempts.unshift(attempt); // add to top
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.error('Failed to save attempt', e);
  }

  // Update tool progress
  const current = getToolProgress(attempt.toolId);
  const newAttemptsCount = (current.attempts || 0) + 1;
  const isPassed = current.assessmentPassed || attempt.passed;
  const highestScore = Math.max(current.highestScore || 0, attempt.score);

  updateToolProgress(attempt.toolId, {
    started: true,
    learningCompleted: true,
    assessmentPassed: isPassed,
    highestScore: highestScore,
    attempts: newAttemptsCount,
    lastAttemptedAt: attempt.completedAt,
    learningProgress: isPassed ? 100 : Math.max(current.learningProgress || 50, 75)
  });
}

export function getAttemptsForTool(toolId: string): AssessmentAttempt[] {
  return getAttempts().filter(a => a.toolId === toolId);
}

// User Profile & Streaks
export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Recovered from corrupted user profile storage', e);
  }

  const defaultUser: UserProfile = {
    name: 'Faculty Educator',
    role: 'Faculty',
    streak: 3,
    lastActiveDate: new Date().toISOString(),
    completedPaths: []
  };
  return defaultUser;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  } catch (e) {}
}

// Certificates
export function getCertificates(): CertificateData[] {
  try {
    const raw = localStorage.getItem(CERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveCertificate(cert: CertificateData): void {
  const list = getCertificates();
  if (!list.some(c => c.pathId === cert.pathId)) {
    list.push(cert);
    try {
      localStorage.setItem(CERTS_KEY, JSON.stringify(list));
    } catch (e) {}
  }
}

// Import / Export Backup Features
export interface LearnerProgressBackup {
  schemaVersion: number;
  exportedAt: string;
  progressMap: Record<string, ToolProgress>;
  attempts: AssessmentAttempt[];
  userProfile: UserProfile;
  certificates: CertificateData[];
}

export function exportProgressJSON(): string {
  const backup: LearnerProgressBackup = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    progressMap: getProgressMap(),
    attempts: getAttempts(),
    userProfile: getUserProfile(),
    certificates: getCertificates()
  };
  return JSON.stringify(backup, null, 2);
}

export function importProgressJSON(jsonString: string): { success: boolean; message: string } {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, message: 'Invalid file payload provided.' };
    }
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { success: false, message: 'Backup file must contain a valid JSON object structure.' };
    }

    if (data.progressMap && typeof data.progressMap === 'object' && !Array.isArray(data.progressMap)) {
      saveProgressMap(data.progressMap);
    }

    if (Array.isArray(data.attempts)) {
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data.attempts));
    }

    if (data.userProfile && typeof data.userProfile === 'object' && data.userProfile.name) {
      saveUserProfile(data.userProfile);
    }

    if (Array.isArray(data.certificates)) {
      localStorage.setItem(CERTS_KEY, JSON.stringify(data.certificates));
    }

    return { success: true, message: 'Progress backup restored successfully!' };
  } catch (e: any) {
    return { success: false, message: `Failed to import backup: ${e?.message || 'Invalid JSON format'}` };
  }
}

