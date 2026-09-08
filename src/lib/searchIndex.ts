import { ToolSummary, PricingType, DifficultyLevel } from '../types/tool';
import { catalogSummaries } from '../data/catalog/summaryData';
import { loadToolBySlug } from '../data/catalog/toolLoaders';
import { getProgressMap } from './storage';

export interface FilterOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  pricingType?: PricingType | 'all';
  difficulty?: DifficultyLevel | 'all';
  learningStatus?: 'all' | 'not-started' | 'learning' | 'completed' | 'passed' | 'bookmarked';
  sortBy?: 'a-z' | 'z-a' | 'beginner-first' | 'popular' | 'shortest-time';
}

export function filterTools(options: FilterOptions): ToolSummary[] {
  const {
    query = '',
    category = 'all',
    subcategory = 'all',
    pricingType = 'all',
    difficulty = 'all',
    learningStatus = 'all',
    sortBy = 'popular'
  } = options;

  const progressMap = getProgressMap();
  const q = query.trim().toLowerCase();

  let results = catalogSummaries.filter(tool => {
    // 1. Category filter
    if (category !== 'all' && tool.category.toLowerCase() !== category.toLowerCase()) {
      // Check category ID match or name match
      if (!tool.category.toLowerCase().includes(category.toLowerCase())) {
        return false;
      }
    }

    // 2. Subcategory filter
    if (subcategory !== 'all' && tool.subcategory.toLowerCase() !== subcategory.toLowerCase()) {
      return false;
    }

    // 3. Pricing type filter
    if (pricingType !== 'all' && tool.pricingType !== pricingType) {
      return false;
    }

    // 4. Difficulty filter
    if (difficulty !== 'all' && tool.difficulty !== difficulty) {
      return false;
    }

    // 5. Learning status filter
    const prog = progressMap[tool.id];
    if (learningStatus === 'bookmarked') {
      if (!prog || !prog.bookmarked) return false;
    } else if (learningStatus === 'not-started') {
      if (prog && (prog.started || prog.learningCompleted || prog.assessmentPassed)) return false;
    } else if (learningStatus === 'learning') {
      if (!prog || !prog.started || prog.assessmentPassed) return false;
    } else if (learningStatus === 'completed') {
      if (!prog || !prog.learningCompleted) return false;
    } else if (learningStatus === 'passed') {
      if (!prog || !prog.assessmentPassed) return false;
    }

    // 6. Query search across multiple fields
    if (q) {
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.shortDescription.toLowerCase().includes(q);
      const matchCat = tool.category.toLowerCase().includes(q) || tool.subcategory.toLowerCase().includes(q);
      const matchSuper = tool.superpower.toLowerCase().includes(q);
      const matchKeywords = tool.keywords.some(k => k.toLowerCase().includes(q));

      if (!matchName && !matchDesc && !matchCat && !matchSuper && !matchKeywords) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  results.sort((a, b) => {
    if (sortBy === 'a-z') return a.name.localeCompare(b.name);
    if (sortBy === 'z-a') return b.name.localeCompare(a.name);
    if (sortBy === 'beginner-first') {
      const rank: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
      return rank[a.difficulty] - rank[b.difficulty];
    }
    if (sortBy === 'shortest-time') return a.learningTime - b.learningTime;
    // default popular
    return 0;
  });

  return results;
}

export function getToolSummaryBySlug(slug: string): ToolSummary | undefined {
  return catalogSummaries.find(t => t.slug === slug || t.id === slug);
}

export { loadToolBySlug };
