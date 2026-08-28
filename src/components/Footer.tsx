import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#05070e', borderTop: '1px solid var(--border)', padding: '40px 24px 30px', color: 'var(--muted)', fontSize: '13px', marginTop: '60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ fontFamily: 'Sora, sans-serif', color: '#fff', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
            ⚡ AI Tools Learning & Assessment Platform
          </div>
          <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>
            Empowering faculty, educators, researchers, and beginners to discover, practice, and master 1,500+ verified free and open-source AI tools.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '10px' }}>Navigation</strong>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home Catalog</Link></li>
              <li><Link to="/faculty-path" style={{ color: 'inherit', textDecoration: 'none' }}>AI for Faculty</Link></li>
              <li><Link to="/learning-paths" style={{ color: 'inherit', textDecoration: 'none' }}>Persona Paths</Link></li>
              <li><Link to="/compare" style={{ color: 'inherit', textDecoration: 'none' }}>Compare Tools</Link></li>
              <li><Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Learner Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '10px' }}>Platform Features</strong>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>1,500+ Unique AI Tools</li>
              <li>Usable Free Tiers Focus</li>
              <li>50-Mark Assessments</li>
              <li>Non-Repeating Retests</li>
              <li>Printable Certificates</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '30px auto 0', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
        AI Tools Mega Guide 2026 Edition • Nexflow Studio Master Visual Style • All rights reserved.
      </div>
    </footer>
  );
};
