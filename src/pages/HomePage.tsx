import React, { useState, useMemo } from 'react';
import { Hero } from '../components/Hero';
import { CategoryNav } from '../components/CategoryNav';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { ToolGrid } from '../components/ToolGrid';
import { filterTools, FilterOptions } from '../lib/searchIndex';
import { getProgressMap } from '../lib/storage';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { Link } from 'react-router-dom';
import { PlayCircle, Award, Sparkles } from 'lucide-react';

interface HomePageProps {
  comparedSlugs: string[];
  onToggleCompare: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ comparedSlugs, onToggleCompare }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    category: 'all',
    subcategory: 'all',
    pricingType: 'all',
    difficulty: 'all',
    learningStatus: 'all',
    sortBy: 'popular'
  });

  const [bookmarkRefresh, setBookmarkRefresh] = useState(0);

  const filteredTools = useMemo(() => {
    return filterTools(filters);
  }, [filters, bookmarkRefresh]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      subcategory: 'all',
      pricingType: 'all',
      difficulty: 'all',
      learningStatus: 'all',
      sortBy: 'popular'
    });
  };

  // Continue Learning Tools
  const progressMap = getProgressMap();
  const continueLearningTools = useMemo(() => {
    return ALL_TOOLS.filter(t => {
      const p = progressMap[t.id];
      return p && p.started && !p.assessmentPassed;
    }).slice(0, 3);
  }, [progressMap, bookmarkRefresh]);

  return (
    <div>
      <Hero />

      <CategoryNav
        selectedCategory={filters.category || 'all'}
        onSelectCategory={catId => handleFilterChange({ category: catId, subcategory: 'all' })}
      />

      <div className="container">
        {/* Continue Learning Widget */}
        {continueLearningTools.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--accent1)', borderRadius: '16px', padding: '20px', marginBottom: '32px', boxShadow: '0 8px 24px rgba(108,99,255,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent4)' }}>
                <PlayCircle size={20} /> Continue Learning In Progress ({continueLearningTools.length})
              </h3>
              <Link to="/dashboard" style={{ fontSize: '12px', color: 'var(--accent1)', textDecoration: 'none', fontWeight: 600 }}>
                View Full Dashboard →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {continueLearningTools.map(tool => {
                const prog = progressMap[tool.id];
                return (
                  <Link
                    key={tool.id}
                    to={`/tools/${tool.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <img src={tool.logo} alt={tool.name} style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{tool.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Progress: {prog.learningProgress || 50}%</div>
                    </div>
                    <span className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>Resume</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <SearchAndFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          totalMatches={filteredTools.length}
        />

        <ToolGrid
          tools={filteredTools}
          comparedSlugs={comparedSlugs}
          onToggleCompare={onToggleCompare}
          onBookmarkChange={() => setBookmarkRefresh(prev => prev + 1)}
          onResetFilters={handleClearFilters}
        />
      </div>
    </div>
  );
};
