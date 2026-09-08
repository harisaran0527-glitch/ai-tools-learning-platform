import React, { useState } from 'react';
import { LEARNING_PATHS } from '../data/learningPaths';
import { catalogSummaries } from '../data/catalog/summaryData';
import { getProgressMap, saveCertificate, getUserProfile } from '../lib/storage';
import { ToolCard } from '../components/ToolCard';
import { Certificate } from '../components/Certificate';
import { GraduationCap, Award, CheckCircle2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyPathPage: React.FC = () => {
  const facultyPath = LEARNING_PATHS.find(p => p.id === 'ai-for-faculty') || LEARNING_PATHS[0];
  const progressMap = getProgressMap();
  const profile = getUserProfile();

  const [showCertModal, setShowCertModal] = useState(false);

  // Calculate faculty path completion percentage
  let totalToolsInPath = 0;
  let passedToolsInPath = 0;

  facultyPath.modules.forEach(mod => {
    mod.recommendedToolSlugs.forEach(slug => {
      totalToolsInPath++;
      const tool = catalogSummaries.find(t => t.slug === slug);
      if (tool && progressMap[tool.id]?.assessmentPassed) {
        passedToolsInPath++;
      }
    });
  });

  const pathCompletionPct = totalToolsInPath > 0 ? Math.round((passedToolsInPath / totalToolsInPath) * 100) : 0;

  const handleClaimCertificate = () => {
    const cert = {
      id: `cert-fac-${Date.now()}`,
      pathId: facultyPath.id,
      pathName: facultyPath.title,
      learnerName: profile.name,
      issuedAt: new Date().toISOString(),
      totalToolsLearned: passedToolsInPath,
      averageScore: 42
    };
    saveCertificate(cert);
    setShowCertModal(true);
  };

  return (
    <div className="container">
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0e1220 0%, #171d33 100%)', border: '1px solid var(--accent2)', borderRadius: '24px', padding: '36px', marginBottom: '36px', boxShadow: '0 0 30px rgba(0,212,170,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
            🎓
          </div>

          <div style={{ flexGrow: 1 }}>
            <span className="badge badge-free-tier" style={{ marginBottom: '8px' }}>
              SPECIAL FACULTY CURRICULUM
            </span>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '30px', color: '#fff', margin: '4px 0 8px' }}>
              {facultyPath.title}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '700px' }}>
              {facultyPath.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Path Progress</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '28px', fontWeight: 700, color: 'var(--accent2)' }}>
              {passedToolsInPath} / {totalToolsInPath} ({pathCompletionPct}%)
            </div>

            {pathCompletionPct >= 50 && (
              <button className="btn-success" onClick={handleClaimCertificate} style={{ marginTop: '10px' }}>
                <Award size={16} /> View Faculty Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {showCertModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <Certificate
            cert={{
              id: `cert-fac-demo`,
              pathId: facultyPath.id,
              pathName: facultyPath.title,
              learnerName: profile.name,
              issuedAt: new Date().toISOString(),
              totalToolsLearned: Math.max(passedToolsInPath, 12),
              averageScore: 42
            }}
            onClose={() => setShowCertModal(false)}
          />
        </div>
      )}

      {/* 12 FACULTY MODULES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {facultyPath.modules.map(mod => (
          <div key={mod.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', color: 'var(--accent2)', marginBottom: '6px' }}>
              {mod.title}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
              {mod.description}
            </p>

            <div className="tools-grid">
              {mod.recommendedToolSlugs.map(slug => {
                const tool = catalogSummaries.find(t => t.slug === slug);
                if (!tool) return null;
                return <ToolCard key={tool.id} tool={tool} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
