import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Clock, CheckCircle2, Award, Zap, GitCompare } from 'lucide-react';
import { ToolSummary } from '../types/tool';
import { getToolProgress, toggleBookmark } from '../lib/storage';

interface ToolCardProps {
  tool: ToolSummary;
  isCompared?: boolean;
  onToggleCompare?: (slug: string) => void;
  onBookmarkChange?: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isCompared = false,
  onToggleCompare,
  onBookmarkChange
}) => {
  const navigate = useNavigate();
  const progress = getToolProgress(tool.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if user clicks bookmark or compare checkbox
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-btn')) return;
    navigate(`/tools/${tool.slug}`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(tool.id);
    if (onBookmarkChange) onBookmarkChange();
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCompare) onToggleCompare(tool.slug);
  };

  const badgeClass =
    tool.pricingType === 'free' ? 'badge-free' :
    tool.pricingType === 'open-source' ? 'badge-open-source' :
    tool.pricingType === 'free-tier' ? 'badge-free-tier' : 'badge-free-trial';

  return (
    <div className="tool-card" onClick={handleCardClick}>
      <div>
        {/* Top Header */}
        <div className="tool-card-header">
          <div className="tool-logo-box">
            {tool.logo ? (
              <img src={tool.logo} alt={tool.name} onError={e => (e.currentTarget.style.display = 'none')} />
            ) : (
              <span>⚡</span>
            )}
          </div>

          <div className="tool-card-title">
            <h3>{tool.name}</h3>
            <div className="tool-category-subtitle">
              {tool.category} • <span style={{ color: 'var(--text)' }}>{tool.subcategory}</span>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            className="interactive-btn"
            onClick={handleBookmarkClick}
            style={{
              background: 'none',
              border: 'none',
              color: progress.bookmarked ? 'var(--accent4)' : 'var(--muted)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'transform 0.2s'
            }}
            title={progress.bookmarked ? 'Remove Bookmark' : 'Bookmark Tool'}
          >
            <Bookmark size={18} fill={progress.bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Pricing Badge & Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span className={`badge ${badgeClass}`}>{tool.badge || tool.pricingType.toUpperCase()}</span>
          <span className="badge badge-difficulty">{tool.difficulty}</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            <Clock size={12} /> {tool.learningTime} mins
          </span>
        </div>

        {/* Short Description */}
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '10px', lineHeight: 1.4 }}>
          {tool.shortDescription}
        </p>

        {/* Superpower block */}
        <div className="superpower-box">
          <strong style={{ color: 'var(--accent2)', display: 'block', fontSize: '11px', letterSpacing: '0.5px' }}>
            ⚡ SUPERPOWER
          </strong>
          {tool.superpower}
        </div>
      </div>

      {/* Footer Status & Compare action */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Status indicator */}
        <div>
          {progress.assessmentPassed ? (
            <span className="status-pill passed">
              <Award size={14} color="var(--accent2)" /> Assessment Passed ({progress.highestScore}/50)
            </span>
          ) : progress.learningCompleted ? (
            <span className="status-pill passed">
              <CheckCircle2 size={14} color="var(--accent5)" /> Learning Completed
            </span>
          ) : progress.started ? (
            <span className="status-pill learning">
              ◔ Learning ({progress.learningProgress}%)
            </span>
          ) : (
            <span className="status-pill">
              ○ Not Started
            </span>
          )}
        </div>

        {/* Compare Checkbox */}
        {onToggleCompare && (
          <button
            className="interactive-btn"
            onClick={handleCompareClick}
            style={{
              background: isCompared ? 'rgba(108,99,255,0.2)' : 'none',
              border: '1px solid ' + (isCompared ? 'var(--accent1)' : 'var(--border)'),
              color: isCompared ? 'var(--accent1)' : 'var(--muted)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <GitCompare size={12} /> {isCompared ? 'Comparing' : 'Compare'}
          </button>
        )}
      </div>
    </div>
  );
};
