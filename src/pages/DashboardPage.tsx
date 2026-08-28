import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { CATEGORIES } from '../data/categories';
import { getProgressMap, getAttempts, getUserProfile, exportProgressJSON, importProgressJSON } from '../lib/storage';
import { LayoutDashboard, Award, CheckCircle2, PlayCircle, Flame, GraduationCap, Download, Upload, RotateCcw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const profile = getUserProfile();
  const progressMap = getProgressMap();
  const attempts = getAttempts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const jsonStr = exportProgressJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tools-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = importProgressJSON(content);
      if (res.success) {
        setImportStatus('Progress imported successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus(`Import Error: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  const allProgressValues = Object.values(progressMap);
  const startedCount = allProgressValues.filter(p => p.started).length;
  const completedCount = allProgressValues.filter(p => p.learningCompleted).length;
  const passedCount = allProgressValues.filter(p => p.assessmentPassed).length;
  const failedCount = attempts.filter(a => !a.passed).length;

  const totalScoreSum = attempts.reduce((acc, a) => acc + a.score, 0);
  const avgScore = attempts.length > 0 ? Math.round(totalScoreSum / attempts.length) : 0;
  const highestScoreOverall = attempts.reduce((max, a) => Math.max(max, a.score), 0);
  const overallPercentage = Math.round((passedCount / ALL_TOOLS.length) * 100);

  // Category progress breakdown
  const categoryProgress = CATEGORIES.map(cat => {
    const catTools = ALL_TOOLS.filter(t => t.category.toLowerCase() === cat.name.toLowerCase());
    const catPassed = catTools.filter(t => progressMap[t.id]?.assessmentPassed).length;
    const pct = catTools.length > 0 ? Math.round((catPassed / catTools.length) * 100) : 0;
    return {
      name: cat.name,
      icon: cat.icon,
      passed: catPassed,
      total: catTools.length,
      pct
    };
  });

  return (
    <div className="container">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Dashboard Top Header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent2)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              <LayoutDashboard size={16} /> FACULTY LEARNING DASHBOARD
            </div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', color: '#fff' }}>
              Welcome back, {profile.name}!
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
              Track your progress across 1,500+ AI tools, view assessment history, and complete specialized faculty modules.
            </p>
            {importStatus && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: importStatus.includes('Error') ? '#ff6b6b' : '#51cf66', fontWeight: 600 }}>
                {importStatus}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px' }}>
              <Download size={16} /> Export Progress (JSON)
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px' }}>
              <Upload size={16} /> Import Progress
            </button>
            <Link to="/faculty-path" className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '13px' }}>
              <GraduationCap size={16} /> Open Faculty Path
            </Link>
          </div>
        </div>
      </div>

      {/* STAT CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Catalog Tools</span>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '30px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
            {ALL_TOOLS.length.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Tools In Progress</span>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '30px', fontWeight: 700, color: 'var(--accent4)', marginTop: '4px' }}>
            {startedCount}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Assessments Passed</span>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '30px', fontWeight: 700, color: 'var(--accent2)', marginTop: '4px' }}>
            {passedCount}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Average Score</span>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '30px', fontWeight: 700, color: 'var(--accent1)', marginTop: '4px' }}>
            {avgScore} / 50
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Overall Mastery</span>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '30px', fontWeight: 700, color: 'var(--accent5)', marginTop: '4px' }}>
            {overallPercentage}%
          </div>
        </div>
      </div>

      {/* CATEGORY PROGRESS SECTION */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '36px' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', color: '#fff', marginBottom: '20px' }}>
          Category Mastery Progress (All 12 Categories)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {categoryProgress.map(cat => (
            <div key={cat.name} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                  {cat.icon} {cat.name}
                </span>
                <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent2)' }}>
                  {cat.passed} / {cat.total} ({cat.pct}%)
                </span>
              </div>

              <div style={{ background: 'var(--bg)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${cat.pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent1), var(--accent2))',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASSESSMENT HISTORY TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', color: '#fff', marginBottom: '16px' }}>
          Assessment Attempt History ({attempts.length})
        </h2>

        {attempts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            No assessment attempts logged yet. Select any AI tool card from the home page to start learning!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                  <th style={{ padding: '12px' }}>TOOL</th>
                  <th style={{ padding: '12px' }}>ATTEMPT</th>
                  <th style={{ padding: '12px' }}>DATE</th>
                  <th style={{ padding: '12px' }}>SCORE</th>
                  <th style={{ padding: '12px' }}>RESULT</th>
                  <th style={{ padding: '12px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(att => {
                  const tool = ALL_TOOLS.find(t => t.id === att.toolId);
                  return (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>
                        {tool ? tool.name : att.toolId}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                        #{att.attemptNumber}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--muted)', fontSize: '12px' }}>
                        {new Date(att.completedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: att.passed ? 'var(--accent2)' : 'var(--accent3)' }}>
                        {att.score} / 50
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${att.passed ? 'badge-free' : 'badge-free-trial'}`}>
                          {att.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {tool && (
                          <Link to={`/assessment/${tool.slug}`} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                            <RotateCcw size={12} /> {att.passed ? 'Retake' : 'Retest Required'}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
