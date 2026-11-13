import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();

  // Admin pages have their own dedicated sidebar navigation (Screens 2, 3, 4)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isExplore = pathname === '/' || pathname.startsWith('/tools');
  const isPrompting = pathname.startsWith('/prompting');

  return (
    <header className="main-header academy-header">
      <Link to="/" className="brand-link">
        <img
          src="/images/ai-verse-logo.png"
          alt="AI Verse"
          className="brand-logo-img"
        />
        <span className="brand-title">AI Verse</span>
      </Link>

      <nav className="public-nav-group" aria-label="Main Navigation">
        <Link
          to="/"
          className={`public-nav-link ${isExplore ? 'active' : ''}`}
        >
          Explore Catalog
        </Link>
        <Link
          to="/prompting"
          className={`public-nav-link ${isPrompting ? 'active' : ''}`}
        >
          Prompting
        </Link>
      </nav>

      <div>
        <Link to="/admin" className="admin-lock-btn" title="Admin Portal">
          <Lock size={14} />
          <span>Admin</span>
        </Link>
      </div>
    </header>
  );
};
