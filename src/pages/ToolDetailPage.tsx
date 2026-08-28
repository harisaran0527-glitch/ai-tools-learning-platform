import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getToolBySlug } from '../lib/searchIndex';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { getToolProgress, updateToolProgress, toggleBookmark } from '../lib/storage';
import { PromptBox } from '../components/PromptBox';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ExternalLink, Bookmark, Clock, CheckCircle2, Award, ArrowLeft, ArrowRight,
  Sparkles, HelpCircle, FileText, CheckSquare, Layers, ShieldCheck, PlayCircle, GraduationCap, BookOpen
} from 'lucide-react';

export const ToolDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  const tool = slug ? getToolBySlug(slug) : undefined;
  const [progress, setProgress] = useState(() => (tool ? getToolProgress(tool.id) : null));

  useEffect(() => {
    if (tool) {
      const current = getToolProgress(tool.id);
      setProgress(current);
      // Mark as started if not yet started
      if (!current.started) {
        updateToolProgress(tool.id, { started: true, learningProgress: Math.max(current.learningProgress || 20, 20) });
        setProgress(getToolProgress(tool.id));
      }
    }
    window.scrollTo(0, 0);
  }, [slug]);

  if (!tool || !progress) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', marginBottom: '16px' }}>404 — Tool Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>The requested AI tool slug does not exist in our 1500+ tool database.</p>
        <Link to="/" className="btn-primary">Return to Catalog Home</Link>
      </div>
    );
  }

  // Find Prev / Next tools
  const currentIndex = ALL_TOOLS.findIndex(t => t.id === tool.id);
  const prevTool = currentIndex > 0 ? ALL_TOOLS[currentIndex - 1] : ALL_TOOLS[ALL_TOOLS.length - 1];
  const nextTool = currentIndex < ALL_TOOLS.length - 1 ? ALL_TOOLS[currentIndex + 1] : ALL_TOOLS[0];

  const handleBookmarkToggle = () => {
    toggleBookmark(tool.id);
    setProgress(getToolProgress(tool.id));
  };

  const handleMarkComplete = () => {
    updateToolProgress(tool.id, { learningCompleted: true, learningProgress: 100 });
    setProgress(getToolProgress(tool.id));
  };

  const handleStartAssessment = () => {
    navigate(`/assessment/${tool.slug}`);
  };

  const badgeClass =
    tool.pricingType === 'free' ? 'badge-free' :
    tool.pricingType === 'open-source' ? 'badge-open-source' :
    tool.pricingType === 'free-tier' ? 'badge-free-tier' : 'badge-free-trial';

  return (
    <div>
      {/* Breadcrumbs Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 24px', fontSize: '13px', color: 'var(--muted)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to={`/?category=${encodeURIComponent(tool.category)}`} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{tool.category}</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{tool.name}</span>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* STICKY SIDEBAR NAVIGATION */}
        <aside style={{ position: 'sticky', top: '80px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '8px' }}>
            LEARNING SECTIONS
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'overview', label: '1. Tool Overview' },
              { id: 'what-is', label: '2. What Is This Tool?' },
              { id: 'why-learn', label: '3. Why Learn It?' },
              { id: 'use-cases', label: '4. What Can It Be Used For?' },
              { id: 'features', label: '5. Main Features' },
              { id: 'free-plan', label: '6. Free Plan Details' },
              { id: 'how-to-use', label: '7. How to Use (Step-by-Step)' },
              { id: 'practice', label: '8. Practical Exercise' },
              { id: 'video-tutorial', label: '9. Video Tutorial' },
              { id: 'assessment', label: '10. Take Assessment (50 Marks)' }
            ].map(sec => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  color: activeSection === sec.id ? 'var(--accent1)' : 'var(--muted)',
                  background: activeSection === sec.id ? 'rgba(108,99,255,0.12)' : 'transparent',
                  fontWeight: activeSection === sec.id ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                {sec.label}
              </a>
            ))}
          </nav>

          {/* Quick Assessment CTA in sidebar */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
              Learning Progress: <strong style={{ color: 'var(--accent2)' }}>{progress.learningProgress}%</strong>
            </div>
            <div style={{ background: 'var(--surface2)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ width: `${progress.learningProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent1), var(--accent2))' }} />
            </div>

            <button
              className="btn-success"
              onClick={handleStartAssessment}
              style={{ width: '100%', fontSize: '13px', padding: '10px' }}
            >
              <Award size={16} /> Start Assessment
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main>
          {/* SECTION 1 — Tool Introduction */}
          <section id="overview" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              <img src={tool.logo} alt={tool.name} style={{ width: '72px', height: '72px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface2)' }} />

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '30px', fontWeight: 800, color: '#fff' }}>{tool.name}</h1>
                  <span className={`badge ${badgeClass}`}>{tool.badge || tool.pricingType.toUpperCase()}</span>
                  <span className="badge badge-difficulty">{tool.difficulty}</span>
                </div>

                <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                  {tool.category} • <span style={{ color: 'var(--accent2)' }}>{tool.subcategory}</span>
                </div>
              </div>

              <button
                className="btn-secondary"
                onClick={handleBookmarkToggle}
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <Bookmark size={16} fill={progress.bookmarked ? 'var(--accent4)' : 'none'} color={progress.bookmarked ? 'var(--accent4)' : 'currentColor'} />
                {progress.bookmarked ? 'Bookmarked' : 'Bookmark Tool'}
              </button>
            </div>

            <p style={{ fontSize: '16px', color: 'var(--text)', marginTop: '20px', lineHeight: 1.6 }}>
              {tool.fullDescription}
            </p>

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '24px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              {tool.officialStatus === 'verified' && tool.officialUrl ? (
                <a href={tool.officialUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink size={16} /> {
                    tool.badge && tool.badge.includes('→')
                      ? tool.badge
                      : tool.officialUrl.includes('github.com')
                      ? 'Open Official GitHub →'
                      : tool.officialUrl.includes('huggingface.co')
                      ? 'Open Hugging Face →'
                      : tool.pricingType === 'open-source'
                      ? 'Open Official GitHub →'
                      : 'Try Tool for Free →'
                  }
                </a>
              ) : (
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'not-allowed'
                  }}
                  title="Official website has not been live-verified"
                >
                  <ExternalLink size={16} /> Website Currently Unavailable
                </span>
              )}

              {tool.docsStatus === 'verified' && tool.docsUrl ? (
                <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <FileText size={16} /> {
                    tool.docsUrl.includes('github.com')
                      ? 'Official GitHub Guide →'
                      : tool.docsUrl.includes('huggingface.co')
                      ? 'Hugging Face Guide →'
                      : 'Official Documentation →'
                  }
                </a>
              ) : (
                <a href="#platform-guide" className="btn-secondary" style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid var(--accent1)', color: 'var(--accent1)' }}>
                  <FileText size={16} /> Read Platform Learning Guide ↓
                </a>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> Est. Time: {tool.learningTime} mins
                </span>

                {progress.assessmentPassed ? (
                  <span style={{ color: 'var(--accent2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={14} /> Score: {progress.highestScore}/50 (Passed)
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {/* SECTION 2 — What Is This Tool? */}
          <section id="what-is" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={22} color="var(--accent1)" /> What is {tool.name}?
            </h2>
            <p style={{ fontSize: '15px', color: '#d1d5db', lineHeight: 1.6 }}>
              {tool.name} is an accessible {tool.pricingType} AI solution designed for {tool.subcategory.toLowerCase()} tasks. It converts complex computational algorithms into a clean user interface, enabling learners and faculty members to achieve high-quality results without requiring software engineering expertise.
            </p>
          </section>

          {/* SECTION 3 — Why Should I Learn It? */}
          <section id="why-learn" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={22} color="var(--accent2)" /> Why Should Teachers & Learners Master It?
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none' }}>
              {tool.whyLearn.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--surface2)', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', color: 'var(--text)' }}>
                  <CheckCircle2 size={18} color="var(--accent2)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* SECTION 4 — What Can It Be Used For? */}
          <section id="use-cases" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={22} color="var(--accent4)" /> Practical Use Cases
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {tool.useCases.map((useCase, idx) => (
                <div key={idx} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent4)', marginBottom: '4px' }}>USE CASE 0{idx + 1}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{useCase}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5 — Main Features */}
          <section id="features" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="var(--accent1)" /> Main Features & Functionalities
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {tool.features.map((feat, idx) => (
                <div key={idx} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', color: 'var(--accent2)', marginBottom: '6px' }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>{feat.description}</p>
                  {feat.whenToUse && (
                    <div style={{ fontSize: '12px', color: 'var(--accent4)', background: 'rgba(255,209,102,0.1)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                      💡 <strong>When to use:</strong> {feat.whenToUse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6 — Free Plan Details */}
          <section id="free-plan" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={22} color="var(--accent5)" /> Free Plan & Usage Limitations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface2)', padding: '14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Pricing Model</span>
                <strong style={{ color: 'var(--accent5)', fontSize: '15px' }}>{tool.pricingType.toUpperCase()}</strong>
              </div>
              <div style={{ background: 'var(--surface2)', padding: '14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Account Required</span>
                <strong style={{ color: '#fff', fontSize: '15px' }}>{tool.signupRequired ? 'Yes (Free Email)' : 'No Account Needed'}</strong>
              </div>
              <div style={{ background: 'var(--surface2)', padding: '14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Installation Required</span>
                <strong style={{ color: '#fff', fontSize: '15px' }}>{tool.installationRequired ? 'Yes (Local Setup)' : 'No (Browser Based)'}</strong>
              </div>
              <div style={{ background: 'var(--surface2)', padding: '14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Last Verified Date</span>
                <strong style={{ color: 'var(--accent2)', fontSize: '15px' }}>{tool.lastVerified || '2026-08-15'}</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', padding: '14px', borderRadius: '10px', fontSize: '14px', color: '#e8eaf0', marginBottom: '12px' }}>
              ℹ️ <strong>Free Tier Breakdown:</strong> {tool.freePlanDetails}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🕒 <strong>Last verified:</strong> {tool.lastVerified || '2026-08-28'}</span>
              <span>— Free plans and limits may change over time. Check the official source for current availability.</span>
            </div>
          </section>

          {/* SECTION 7 — How to Use */}
          <section id="how-to-use" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckSquare size={22} color="var(--accent1)" /> How to Use {tool.name} (Step-by-Step)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tool.steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '14px', background: 'var(--surface2)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', color: '#fff', marginBottom: '2px' }}>{step.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 8 — Practical Example */}
          <section id="practice" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚡ Try It Yourself — Practical Exercise
            </h2>

            <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <strong style={{ color: 'var(--accent2)', display: 'block', fontSize: '12px', letterSpacing: '0.5px' }}>OBJECTIVE</strong>
              <div style={{ fontSize: '15px', color: '#fff', marginTop: '4px' }}>{tool.practicalExercise.objective}</div>
            </div>

            {tool.practicalExercise.examplePrompt && (
              <PromptBox promptText={tool.practicalExercise.examplePrompt} label="Copy & Practice Prompt" />
            )}

            <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
              <strong style={{ color: 'var(--accent5)', display: 'block', fontSize: '12px', letterSpacing: '0.5px' }}>EXPECTED RESULT</strong>
              <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>{tool.practicalExercise.expectedResult}</div>
            </div>
          </section>

          {/* SECTION 9 — Video Tutorial */}
          <section id="video-tutorial" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', marginBottom: '12px' }}>
              🎬 Video Tutorial
            </h2>
            <VideoPlayer video={tool.tutorialVideo} toolName={tool.name} subcategory={tool.subcategory} />
          </section>

          {/* SECTION 9B — Documentation Resource */}
          {tool.docsStatus === 'verified' && tool.docsUrl ? (
            <section id="documentation" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-open-source" style={{ background: 'rgba(6,214,160,0.15)', color: 'var(--accent5)', border: '1px solid rgba(6,214,160,0.3)', fontSize: '11px' }}>
                    {tool.docsUrl.includes('github.com') ? 'GITHUB GUIDE' : tool.docsUrl.includes('huggingface.co') ? 'HUGGING FACE GUIDE' : 'OFFICIAL DOCS'}
                  </span>
                  <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={22} color="var(--accent2)" /> Official Documentation
                  </h2>
                </div>

                <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Open Official Documentation <ExternalLink size={14} />
                </a>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                Access official guides, API references, and user manuals directly from the tool developer.
              </p>
            </section>
          ) : (
            <section id="platform-guide" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-free" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent1)', border: '1px solid rgba(108,99,255,0.3)', fontSize: '11px' }}>
                    PLATFORM GUIDE
                  </span>
                  <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={22} color="var(--accent1)" /> Platform Learning Guide
                  </h2>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--accent1)', fontSize: '14px', marginBottom: '6px' }}>📌 Tool Overview & Purpose</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                    {tool.fullDescription}
                  </p>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--accent2)', fontSize: '14px', marginBottom: '6px' }}>🚀 Getting Started</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                    {tool.freePlanDetails} ({tool.signupRequired ? 'Account Required' : 'No Account Needed'}, {tool.installationRequired ? 'Local Setup' : 'Browser Based'}).
                  </p>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--accent4)', fontSize: '14px', marginBottom: '6px' }}>🎓 Educator & Student Benefits</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                    {tool.whyLearn[0] || 'Drastically reduces preparation time.'} {tool.whyLearn[1] || 'Empowers educators and learners.'}
                  </p>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h4 style={{ color: 'var(--accent5)', fontSize: '14px', marginBottom: '6px' }}>💡 Tips & Primary Source</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, marginBottom: '8px' }}>
                    Review AI outputs for factual accuracy. Access verified resources via the primary link below.
                  </p>
                  {tool.officialUrl && (
                    <a href={tool.officialUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent2)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Open Primary Source <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 10 — Take Assessment */}
          <section id="assessment" style={{ background: 'linear-gradient(135deg, #0e1220 0%, #161c32 100%)', border: '2px solid var(--accent1)', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 0 30px rgba(108,99,255,0.2)' }}>
            <Award size={48} color="var(--accent2)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '26px', color: '#fff', marginBottom: '8px' }}>
              Ready to Test Your Knowledge?
            </h2>
            <p style={{ color: 'var(--muted)', maxWidth: '500px', margin: '0 auto 24px', fontSize: '15px' }}>
              Complete the 50-mark assessment (25 questions × 2 marks). Score 25/50 or higher to pass and earn your completion record.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={handleMarkComplete}>
                <CheckCircle2 size={16} color="var(--accent5)" /> Mark Learning Complete
              </button>

              <button className="btn-success" onClick={handleStartAssessment} style={{ padding: '12px 28px', fontSize: '16px' }}>
                <Award size={18} /> Start Assessment (50 Marks)
              </button>
            </div>
          </section>

          {/* Next / Prev Tool Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '16px' }}>
            <Link to={`/tools/${prevTool.slug}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Previous: {prevTool.name}
            </Link>

            <Link to={`/tools/${nextTool.slug}`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              Next: {nextTool.name} <ArrowRight size={16} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};
