import React, { useState, useEffect } from 'react';
import { ToolCard } from './ToolCard';
import { ToolSummary } from '../types/tool';
import { ChevronLeft, ChevronRight, SearchX, RotateCcw } from 'lucide-react';

interface ToolGridProps {
  tools: ToolSummary[];
  comparedSlugs: string[];
  onToggleCompare: (slug: string) => void;
  onBookmarkChange: () => void;
  onResetFilters: () => void;
}

const ITEMS_PER_PAGE = 24;

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  comparedSlugs,
  onToggleCompare,
  onBookmarkChange,
  onResetFilters
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when tools change
  useEffect(() => {
    setCurrentPage(1);
  }, [tools.length]);

  if (tools.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <SearchX size={48} color="var(--muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', marginBottom: '8px' }}>
          No AI tools found for your search
        </h3>
        <p style={{ color: 'var(--muted)', maxWidth: '400px', margin: '0 auto 20px', fontSize: '14px' }}>
          Try clearing your active filters or searching for another keyword like "presentation", "research", or "video".
        </p>
        <button className="btn-primary" onClick={onResetFilters}>
          <RotateCcw size={16} /> Reset All Filters
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(tools.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleTools = tools.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      {/* Grid of Tool Cards */}
      <div className="tools-grid">
        {visibleTools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isCompared={comparedSlugs.includes(tool.slug)}
            onToggleCompare={onToggleCompare}
            onBookmarkChange={onBookmarkChange}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-row">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={18} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 7 && currentPage > 4) {
              pageNum = currentPage - 3 + i;
              if (pageNum > totalPages) pageNum = totalPages - (6 - i);
            }
            if (pageNum <= 0) return null;

            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={18} />
          </button>

          <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};
