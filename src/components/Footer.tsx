import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer style={{ background: '#05070f', borderTop: '1px solid var(--border-subtle)', padding: '36px 24px 28px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <img src="/images/ai-verse-logo.png" alt="AI Verse" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
            <span style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '16px', fontWeight: 700 }}>
              AI Verse
            </span>
          </div>
          <p style={{ maxWidth: '420px', lineHeight: 1.5, fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Empowering students, faculty, developers, and educators to discover, practice, and master practical AI tools with structured guidance and real-world workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '36px' }}>
          <div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '10px', fontSize: '12.5px' }}>Explore</strong>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>AI Tools Catalog</Link></li>
              <li><Link to="/prompting" style={{ color: 'inherit', textDecoration: 'none' }}>Prompting Lab</Link></li>
              <li><Link to="/prompting/practice" style={{ color: 'inherit', textDecoration: 'none' }}>Guided Challenges</Link></li>
              <li><Link to="/learning-paths" style={{ color: 'inherit', textDecoration: 'none' }}>Learning Paths</Link></li>
            </ul>
          </div>

          <div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '10px', fontSize: '12.5px' }}>Platform</strong>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
              <li>768 Verified AI Tools</li>
              <li>15 Core Categories</li>
              <li>50-Question Assessments</li>
              <li><Link to="/admin" style={{ color: '#a78bfa', textDecoration: 'none' }}>Admin Access</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '24px auto 0', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--text-subtle)' }}>
        AI Verse © 2026 • Practical AI Tools Learning & Assessment Platform
      </div>
    </footer>
  );
};
