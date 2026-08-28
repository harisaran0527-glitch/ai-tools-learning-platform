import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getToolBySlug } from '../lib/searchIndex';
import { generateAssessmentForTool, gradeAssessment, GeneratedAssessment } from '../lib/assessmentEngine';
import { saveAttempt } from '../lib/storage';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const tool = slug ? getToolBySlug(slug) : undefined;

  const [assessmentData, setAssessmentData] = useState<GeneratedAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tool) {
      // Generate 25 questions (excludes used IDs for retests!)
      const data = generateAssessmentForTool(tool.id);
      setAssessmentData(data);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
    }
    window.scrollTo(0, 0);
  }, [slug]);

  if (!tool || !assessmentData) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Loading Assessment...</h2>
      </div>
    );
  }

  const questions = assessmentData.questions;
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleSubmitAssessment = () => {
    setIsSubmitting(true);
    const attemptResult = gradeAssessment(tool.id, assessmentData.attemptNumber, questions, userAnswers);
    saveAttempt(attemptResult);
    setIsSubmitting(false);

    // Navigate to results page
    navigate(`/results/${attemptResult.id}`, { state: { attempt: attemptResult, tool } });
  };

  return (
    <div>
      {/* Top Banner */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={tool.logo} alt={tool.name} style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', color: '#fff' }}>
                {tool.name} Assessment
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Attempt #{assessmentData.attemptNumber} • 25 Questions × 2 Marks = 50 Total Marks
              </span>
            </div>
          </div>

          <Link to={`/tools/${tool.slug}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <ArrowLeft size={14} /> Back to Learning Material
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '900px', padding: '32px 20px' }}>
        {/* Progress Bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--muted)' }}>
              Question <strong style={{ color: 'var(--text)' }}>{currentQuestionIndex + 1}</strong> of {questions.length}
            </span>
            <span style={{ color: 'var(--accent2)', fontWeight: 600 }}>
              Answered: {answeredCount} / {questions.length}
            </span>
          </div>

          <div style={{ background: 'var(--surface2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent1), var(--accent2))',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Current Question Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span className="badge badge-open-source" style={{ textTransform: 'uppercase' }}>
              {currentQ.type} • 2 MARKS
            </span>
            <span className="badge badge-difficulty">{currentQ.difficulty}</span>
          </div>

          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', color: '#fff', lineHeight: 1.4, marginBottom: '24px' }}>
            {currentQ.question}
          </h3>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((opt, idx) => {
              const isSelected = userAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(108,99,255,0.18)' : 'var(--surface2)',
                    border: isSelected ? '1px solid var(--accent1)' : '1px solid var(--border)',
                    color: isSelected ? '#ffffff' : 'var(--text)',
                    fontSize: '15px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--accent1)' : '2px solid var(--muted)',
                      background: isSelected ? 'var(--accent1)' : 'transparent',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft size={16} /> Previous Question
          </button>

          {isLastQuestion ? (
            <button
              className="btn-success"
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
              style={{ padding: '12px 28px', fontSize: '16px' }}
            >
              <ShieldCheck size={18} /> Submit Assessment for Grading
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next Question <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
