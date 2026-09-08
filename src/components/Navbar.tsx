import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Bookmark, GraduationCap, GitCompare, Compass, Flame } from 'lucide-react';
import { getProgressMap, getUserProfile } from '../lib/storage';
import { catalogSummaries } from '../data/catalog/summaryData';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const profile = getUserProfile();
  const progressMap = getProgressMap();

  const totalPassed = Object.values(progressMap).filter(p => p.assessmentPassed).length;
  const bookmarkedCount = Object.values(progressMap).filter(p => p.bookmarked).length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="main-header">
      <Link to="/" className="logo-brand">
        <div className="logo-brand-icon">⚡</div>
        <div>
          <span>AI Tools Academy</span>
          <span style={{ fontSize: '10px', color: 'var(--accent2)', display: 'block', fontWeight: 500, lineHeight: 1 }}>
            2026 EDITION • CURATED CATALOG
          </span>
        </div>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          to="/"
          className={`tab-btn ${isActive('/') ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <Compass size={16} /> Explore Catalog ({catalogSummaries.length})
        </Link>

        <Link
          to="/faculty-path"
          className={`tab-btn ${isActive('/faculty-path') ? 'active' : ''}`}
          style={{ textDecoration: 'none', color: '#00d4aa', border: '1px solid rgba(0,212,170,0.3)', background: isActive('/faculty-path') ? 'var(--accent2)' : 'rgba(0,212,170,0.1)' }}
        >
          <GraduationCap size={16} /> AI for Faculty
        </Link>

        <Link
          to="/learning-paths"
          className={`tab-btn ${isActive('/learning-paths') ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <Sparkles size={16} /> Persona Paths
        </Link>

        <Link
          to="/compare"
          className={`tab-btn ${isActive('/compare') ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <GitCompare size={16} /> Compare
        </Link>

        <Link
          to="/bookmarks"
          className={`tab-btn ${isActive('/bookmarks') ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
        >
          <Bookmark size={16} /> Saved ({bookmarkedCount})
        </Link>

        <Link
          to="/dashboard"
          className={`tab-btn ${isActive('/dashboard') ? 'active' : ''}`}
          style={{ textDecoration: 'none', background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <LayoutDashboard size={16} /> Dashboard ({totalPassed})
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', padding: '4px 10px', borderRadius: '16px', color: '#ff6b6b', fontSize: '12px', fontWeight: 600 }}>
          <Flame size={14} /> {profile.streak} Day Streak
        </div>
      </nav>
    </header>
  );
};
