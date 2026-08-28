import React from 'react';
import { LEARNING_PATHS } from '../data/learningPaths';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { ToolCard } from '../components/ToolCard';
import { Sparkles, Compass } from 'lucide-react';

export const LearningPathsPage: React.FC = () => {
  return (
    <div className="container">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', marginBottom: '36px', textAlign: 'center' }}>
        <div className="hero-badge" style={{ marginBottom: '12px' }}>
          <Sparkles size={13} /> GUIDED LEARNING JOURNEYS
        </div>
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '32px', color: '#fff', marginBottom: '8px' }}>
          Recommended Persona Learning Paths
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
          Not sure where to start? Follow step-by-step learning sequences tailored for faculty, students, researchers, content creators, and developers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {LEARNING_PATHS.map(path => (
          <div key={path.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>{path.icon}</span>
              <div>
                <span className="badge badge-open-source">{path.badge}</span>
                <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', color: '#fff', marginTop: '2px' }}>
                  {path.title}
                </h2>
              </div>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              Target Audience: <strong style={{ color: 'var(--text)' }}>{path.targetAudience}</strong> — {path.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {path.modules.map(mod => (
                <div key={mod.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '17px', color: 'var(--accent2)', marginBottom: '4px' }}>
                    {mod.title}
                  </h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
                    {mod.description}
                  </p>

                  <div className="tools-grid">
                    {mod.recommendedToolSlugs.map(slug => {
                      const tool = ALL_TOOLS.find(t => t.slug === slug);
                      if (!tool) return null;
                      return <ToolCard key={tool.id} tool={tool} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
