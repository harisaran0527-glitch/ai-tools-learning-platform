import React, { useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { AssessmentAttempt } from '../types/assessment';
import { AITool } from '../types/tool';
import { getToolBySlug } from '../lib/searchIndex';
import { getAttempts } from '../lib/storage';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

export const AssessmentResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();

  // Retrieve attempt state or find from storage
  let attempt: AssessmentAttempt | undefined = location.state?.attempt;
  let tool: AITool | undefined = location.state?.tool;

  if (!attempt && attemptId) {
    const attempts = getAttempts();
    attempt = attempts.find(a => a.id === attemptId);
    if (attempt) {
      tool = getToolBySlug(attempt.toolId);
    }
  }

  useEffect(() => {
    if (attempt && attempt.passed) {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    window.scrollTo(0, 0);
  }, [attempt?.id]);

  if (!attempt || !tool) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>No Result Found</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: '16px' }}>Return to Catalog</Link>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / attempt.totalMarks) * 100);

  const handleRetestClick = () => {
    // Navigate to assessment page for a new attempt with DIFFERENT questions
    navigate(`/assessment/${tool.slug}`);
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '2px solid ' + (attempt.passed ? 'var(--accent2)' : 'var(--accent3)'),
          borderRadius: '24px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 0 40px ' + (attempt.passed ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)')
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            borderRadius: '50%',
            background: attempt.passed ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)',
            color: attempt.passed ? 'var(--accent2)' : 'var(--accent3)',
            marginBottom: '20px'
          }}
        >
          {attempt.passed ? <Award size={56} /> : <XCircle size={56} />}
        </div>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '32px', color: '#fff', marginBottom: '8px' }}>
          {attempt.passed ? '🎉 Assessment Passed!' : 'Assessment Not Passed'}
        </h1>

        <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '28px' }}>
          {attempt.passed
            ? `Congratulations! You have demonstrated practical mastery of ${tool.name}.`
            : `You need at least 25 / 50 marks to pass. Review the material and take a retest.`}
        </p>

        {/* SCORE BOARD */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            background: 'var(--surface2)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            marginBottom: '32px'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Score Obtained</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '28px', fontWeight: 700, color: attempt.passed ? 'var(--accent2)' : 'var(--accent3)' }}>
              {attempt.score} / {attempt.totalMarks}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Percentage</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '28px', fontWeight: 700, color: '#fff' }}>
              {percentage}%
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Result Status</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '24px', fontWeight: 700, color: attempt.passed ? 'var(--accent2)' : 'var(--accent3)' }}>
              {attempt.passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Attempt Number</span>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '24px', fontWeight: 700, color: 'var(--accent1)' }}>
              #{attempt.attemptNumber}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to={`/tools/${tool.slug}`} className="btn-secondary">
            <BookOpen size={16} /> Review Learning Material
          </Link>

          {!attempt.passed ? (
            <button className="btn-success" onClick={handleRetestClick} style={{ padding: '12px 28px', fontSize: '16px' }}>
              <RotateCcw size={18} /> Retest Required (Fresh Questions)
            </button>
          ) : (
            <Link to="/dashboard" className="btn-primary" style={{ padding: '12px 28px', fontSize: '16px' }}>
              Go to Learner Dashboard <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
