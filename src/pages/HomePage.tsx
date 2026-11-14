import React, { useState, useMemo } from 'react';
import { Hero } from '../components/Hero';
import { CategoryNav } from '../components/CategoryNav';
import { SearchAndFilter } from '../components/SearchAndFilter';
import { ToolGrid } from '../components/ToolGrid';
import { filterTools, FilterOptions } from '../lib/searchIndex';

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

  return (
    <div>
      <Hero />

      <div id="catalog-section">
        <CategoryNav
          selectedCategory={filters.category || 'all'}
          onSelectCategory={catId => handleFilterChange({ category: catId, subcategory: 'all' })}
        />
      </div>

      <div className="container">
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
