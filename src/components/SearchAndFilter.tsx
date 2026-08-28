import React from 'react';
import { Search, Filter, RotateCcw, SortAsc } from 'lucide-react';
import { FilterOptions } from '../lib/searchIndex';
import { CATEGORIES } from '../data/categories';

interface SearchAndFilterProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
  totalMatches: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalMatches
}) => {
  // Find current category object to get subcategories
  const currentCatObj = CATEGORIES.find(
    c => c.name.toLowerCase() === (filters.category || '').toLowerCase() || c.id.toLowerCase() === (filters.category || '').toLowerCase()
  );
  const subcategories = currentCatObj ? currentCatObj.subcategories : [];

  return (
    <div className="search-box-container">
      {/* Search Input Row */}
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by tool name, prompt, superpower, feature, or use case... (e.g. presentation, lesson plan, remove background)"
          value={filters.query || ''}
          onChange={e => onFilterChange({ query: e.target.value })}
        />
      </div>

      {/* Multi-filter controls row */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Subcategory Select */}
        {subcategories.length > 0 && (
          <select
            value={filters.subcategory || 'all'}
            onChange={e => onFilterChange({ subcategory: e.target.value })}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '13px'
            }}
          >
            <option value="all">All Subcategories</option>
            {subcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        )}

        {/* Pricing Type Filter */}
        <select
          value={filters.pricingType || 'all'}
          onChange={e => onFilterChange({ pricingType: e.target.value as any })}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px'
          }}
        >
          <option value="all">All Pricing Types</option>
          <option value="free">FREE (100% Free)</option>
          <option value="free-tier">FREE TIER (Freemium)</option>
          <option value="open-source">OPEN SOURCE</option>
          <option value="free-trial">FREE TRIAL</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={filters.difficulty || 'all'}
          onChange={e => onFilterChange({ difficulty: e.target.value as any })}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px'
          }}
        >
          <option value="all">All Difficulty Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Learning Status Filter */}
        <select
          value={filters.learningStatus || 'all'}
          onChange={e => onFilterChange({ learningStatus: e.target.value as any })}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px'
          }}
        >
          <option value="all">All Learning Statuses</option>
          <option value="not-started">○ Not Started</option>
          <option value="learning">◔ Learning In Progress</option>
          <option value="completed">✓ Learning Completed</option>
          <option value="passed">★ Assessment Passed</option>
          <option value="bookmarked">🔖 Bookmarked Tools</option>
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy || 'popular'}
          onChange={e => onFilterChange({ sortBy: e.target.value as any })}
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px'
          }}
        >
          <option value="popular">Sort: Most Popular</option>
          <option value="a-z">Sort: Name (A to Z)</option>
          <option value="z-a">Sort: Name (Z to A)</option>
          <option value="beginner-first">Sort: Beginner First</option>
          <option value="shortest-time">Sort: Shortest Learning Time</option>
        </select>

        {/* Clear Filters Button */}
        <button
          className="btn-secondary"
          onClick={onClearFilters}
          style={{ padding: '8px 12px', fontSize: '12px' }}
        >
          <RotateCcw size={14} /> Clear Filters
        </button>

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          Showing <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>{totalMatches.toLocaleString()}</span> tools
        </div>
      </div>
    </div>
  );
};
