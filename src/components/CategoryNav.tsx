import React from 'react';
import { CATEGORIES } from '../data/categories';
import { catalogSummaries } from '../data/catalog/summaryData';

interface CategoryNavProps {
  selectedCategory: string; // 'all' or category ID/name
  onSelectCategory: (catId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({ selectedCategory, onSelectCategory }) => {
  // Count tools per category
  const categoryCounts: Record<string, number> = {};
  catalogSummaries.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  return (
    <nav className="nav-tabs">
      <div className="nav-inner">
        <button
          className={`tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          ⚡ Curated Tools ({catalogSummaries.length.toLocaleString()})
        </button>

        {CATEGORIES.map(cat => {
          const count = categoryCounts[cat.name] || 0;
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase() || selectedCategory.toLowerCase() === cat.name.toLowerCase();

          return (
            <button
              key={cat.id}
              className={`tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.name)}
            >
              <span>{cat.icon}</span> {cat.name} ({count})
            </button>
          );
        })}
      </div>
    </nav>
  );
};
