import React from 'react';
import { Sparkles, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { getProgressMap } from '../lib/storage';

export const Hero: React.FC = () => {
  const progressMap = getProgressMap();
  const completedCount = Object.values(progressMap).filter(p => p.assessmentPassed).length;
  const inProgressCount = Object.values(progressMap).filter(p => p.started && !p.assessmentPassed).length;

  return (
    <section className="hero">
      <div className="hero-badge">
        <Sparkles size={13} /> AI Tools Learning & Assessment Platform 2026
      </div>

      <h1>Master 1,500+ AI Tools Step-by-Step</h1>

      <p>
        Designed specifically for faculty, educators, and beginners. Discover verified free & open-source AI tools, watch tutorials, complete practical exercises, and earn certificates through 50-mark assessments.
      </p>

      <div className="stats-row">
        <div className="stat">
          <span className="stat-num">{ALL_TOOLS.length.toLocaleString()}+</span>
          <span className="stat-label">Unique AI Tools</span>
        </div>

        <div className="stat">
          <span className="stat-num">12</span>
          <span className="stat-label">Categories</span>
        </div>

        <div className="stat">
          <span className="stat-num" style={{ color: 'var(--accent5)' }}>100% FREE</span>
          <span className="stat-label">Usable Free Tiers</span>
        </div>

        <div className="stat">
          <span className="stat-num" style={{ color: 'var(--accent1)' }}>{completedCount}</span>
          <span className="stat-label">Tools Mastered</span>
        </div>

        <div className="stat">
          <span className="stat-num" style={{ color: 'var(--accent4)' }}>50 MARKS</span>
          <span className="stat-label">Assessments</span>
        </div>
      </div>
    </section>
  );
};
