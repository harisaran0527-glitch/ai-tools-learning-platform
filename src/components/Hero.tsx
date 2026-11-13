import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Layers, Compass, BookOpen } from 'lucide-react';
import { catalogSummaries } from '../data/catalog/summaryData';

export const Hero: React.FC = () => {
  const totalTools = catalogSummaries.length || 768;
  const totalCategories = new Set(catalogSummaries.map(t => t.category)).size || 15;

  return (
    <section className="hero-reference">
      <div className="hero-reference-overlay" />

      <div className="hero-reference-content">
        <div className="hero-badge-pill">
          <Sparkles size={12} />
          <span>Curated AI Learning Platform</span>
        </div>

        <h1 className="hero-heading">
          Master Practical AI Tools with <span className="hero-gradient-text">Confidence</span>
        </h1>

        <p className="hero-subheading">
          Explore verified AI tools, learn through structured guidance, and practice
          real-world workflows across 15 essential categories.
        </p>

        <div className="hero-cta-group">
          <a href="#catalog-section" className="btn-hero-primary">
            <span>Explore Catalog</span>
            <ArrowRight size={15} />
          </a>
          <Link to="/prompting/practice" className="btn-hero-glass">
            <Zap size={14} color="#a78bfa" />
            <span>Prompting Practice</span>
          </Link>
        </div>

        <div className="hero-stats-deck">
          <div className="hero-stat-card">
            <div className="hero-stat-icon-wrap">
              <Compass size={15} />
            </div>
            <div>
              <div className="hero-stat-number">{totalTools}</div>
              <div className="hero-stat-label">AI Tools</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon-wrap">
              <Layers size={15} />
            </div>
            <div>
              <div className="hero-stat-number">{totalCategories}</div>
              <div className="hero-stat-label">Categories</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon-wrap">
              <BookOpen size={15} />
            </div>
            <div>
              <div className="hero-stat-number" style={{ fontSize: '13px' }}>Guided</div>
              <div className="hero-stat-label">Learning</div>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-icon-wrap">
              <Zap size={15} />
            </div>
            <div>
              <div className="hero-stat-number" style={{ fontSize: '13px' }}>Hands-on</div>
              <div className="hero-stat-label">Practice</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
