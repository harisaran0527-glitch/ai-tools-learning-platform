import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Copy, Check, ChevronDown, ChevronUp, Search, Filter,
  ArrowRight, RotateCcw, Target, FileText, CheckSquare, Lock,
  Layers, Code, Zap, ShieldCheck, HelpCircle, AlertTriangle, Lightbulb, Play
} from 'lucide-react';
import { api } from '../../lib/platform';
import { CRITERIA, Analysis, qualityBand } from '../../lib/practice';
import { COMPONENT_GUIDES, SEED_PROMPT_EXAMPLES, PromptExample } from '../../data/promptLearningData';

interface InteractivePromptBuilderProps {
  onAnalyzePrompt: (promptText: string) => Promise<void>;
  analysis?: Analysis;
  busy?: string;
  output?: string;
  onExecute?: () => Promise<void>;
  error?: string;
}

const CRITERION_ICONS: Record<string, React.ElementType> = {
  "Task / Goal": Target,
  "Context": FileText,
  "Requirements": CheckSquare,
  "Constraints": Lock,
  "Input / Reference": Layers,
  "Output Format": Code,
  "Style / Tone": Zap,
  "Validation / Success Criteria": ShieldCheck,
};

const CRITERION_COLORS: Record<string, { color: string; bg: string }> = {
  "Task / Goal": { color: "#c084fc", bg: "rgba(192,132,252,0.15)" },
  "Context": { color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
  "Requirements": { color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  "Constraints": { color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  "Input / Reference": { color: "#2dd4bf", bg: "rgba(45,212,191,0.15)" },
  "Output Format": { color: "#22d3ee", bg: "rgba(34,211,238,0.15)" },
  "Style / Tone": { color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
  "Validation / Success Criteria": { color: "#fb923c", bg: "rgba(251,146,60,0.15)" },
};

export const InteractivePromptBuilder: React.FC<InteractivePromptBuilderProps> = ({
  onAnalyzePrompt,
  analysis,
  busy,
  output,
  onExecute,
  error
}) => {
  // State for all 8 fields
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    CRITERIA.forEach(([label]) => { init[label] = ''; });
    return init;
  });

  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isCustomEdited, setIsCustomEdited] = useState(false);

  // Filters for learning examples
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'english' | 'tamil' | 'tanglish'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsible learning guide cards
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({
    "Task / Goal": true, // open first by default
  });

  // Dynamic examples from API with seed fallback
  const [examples, setExamples] = useState<PromptExample[]>(SEED_PROMPT_EXAMPLES);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch published examples from API on mount
  useEffect(() => {
    let cancelled = false;
    api<{ examples: PromptExample[] }>('prompt_examples')
      .then(res => {
        if (!cancelled && Array.isArray(res.examples) && res.examples.length > 0) {
          setExamples(res.examples);
        }
      })
      .catch(() => {
        // Safe fallback to built-in seed examples
      });
    return () => { cancelled = true; };
  }, []);

  // Helper to re-synthesize combined prompt when fields change
  const buildCombinedPrompt = (curFields: Record<string, string>) => {
    const parts = CRITERIA.map(([label]) => {
      const val = curFields[label]?.trim();
      if (!val) return '';
      return `### ${label}\n${val}`;
    }).filter(Boolean);
    return parts.join('\n\n');
  };

  const handleFieldChange = (label: string, value: string) => {
    const updated = { ...fields, [label]: value };
    setFields(updated);
    if (!isCustomEdited) {
      setCustomPrompt(buildCombinedPrompt(updated));
    }
  };

  const handleInsertExample = (component: string, text: string) => {
    const updated = { ...fields, [component]: text };
    setFields(updated);
    setCustomPrompt(buildCombinedPrompt(updated));
    setIsCustomEdited(false);
    triggerToast(`Inserted into ${component}!`);
  };

  const handleCopyText = async (text: string, id: string, label = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      triggerToast(label);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleGuide = (label: string) => {
    setExpandedGuides(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleReset = () => {
    const empty: Record<string, string> = {};
    CRITERIA.forEach(([label]) => { empty[label] = ''; });
    setFields(empty);
    setCustomPrompt('');
    setIsCustomEdited(false);
    triggerToast('Prompt builder reset.');
  };

  const handleLoadTemplate = () => {
    const template: Record<string, string> = {
      "Task / Goal": "Write a comprehensive 5-step tutorial teaching beginners how to use this tool.",
      "Context": "Audience: 10th-grade high school students learning practical AI workflows for the first time.",
      "Requirements": "1. Provide complete verified code/syntax with comments\n2. Include an ASCII flow diagram\n3. Include a common errors & troubleshooting section",
      "Constraints": "- Strict word ceiling: 300 words\n- Do not use paid third-party tools or external libraries\n- Avoid complex academic jargon",
      "Input / Reference": "Base answers solely on official documentation and verified benchmarks.",
      "Output Format": "Deliver as a clean Markdown guide with clear H2/H3 headers and a 3-column summary table.",
      "Style / Tone": "Empathetic, encouraging, and mentor-like, keeping explanations clear and concise.",
      "Validation / Success Criteria": "Before output, self-verify:\n1. Are all 3 requirements included?\n2. Is length under 300 words?\n3. Are all instructions executable?"
    };
    setFields(template);
    setCustomPrompt(buildCombinedPrompt(template));
    setIsCustomEdited(false);
    triggerToast('Loaded 8-part starter template!');
  };

  // Filtered examples for learning
  const filteredExamples = useMemo(() => {
    return examples.filter(ex => {
      if (selectedComponent !== 'all' && ex.component !== selectedComponent) return false;
      if (difficultyFilter !== 'all' && ex.difficulty !== difficultyFilter) return false;
      if (languageFilter !== 'all' && ex.language !== languageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ex.title.toLowerCase().includes(q);
        const matchesPrompt = ex.improvedPrompt.toLowerCase().includes(q) || ex.weakPrompt.toLowerCase().includes(q);
        const matchesComp = ex.component.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPrompt && !matchesComp) return false;
      }
      return true;
    });
  }, [examples, selectedComponent, difficultyFilter, languageFilter, searchQuery]);

  // Count filled fields
  const filledCount = Object.values(fields).filter(v => v.trim().length > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Sparkles size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Intro */}
      <div
        style={{
          background: 'var(--surface-navy)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(124,58,237,0.18)', color: '#c4b5fd', fontSize: '11px', fontWeight: 600, border: '1px solid rgba(124,58,237,0.4)', marginBottom: '8px' }}>
              <Sparkles size={12} />
              <span>Interactive 8-Component Prompt Builder & Learning Guide</span>
            </div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Craft Production-Ready Prompts with Guided Step-by-Step Examples
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '4px 0 0', maxWidth: '750px', lineHeight: 1.5 }}>
              Learn what makes each of the 8 prompt components effective. Study real weak vs. improved examples, copy or insert them directly into the builder, and test your combined prompt with live AI analysis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleLoadTemplate}
              className="btn-compact-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 12px', fontSize: '12.5px' }}
            >
              <Lightbulb size={14} color="#fbbf24" />
              <span>Load Starter Template</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-compact-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px', padding: '0 12px', fontSize: '12.5px' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 8-Component Progress Pill Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {CRITERIA.map(([label, max]) => {
            const isFilled = Boolean(fields[label]?.trim());
            const Icon = CRITERION_ICONS[label] || Target;
            const style = CRITERION_COLORS[label] || { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)' };
            return (
              <div
                key={label}
                onClick={() => setSelectedComponent(label === selectedComponent ? 'all' : label)}
                style={{
                  background: isFilled ? 'rgba(52,211,153,0.12)' : selectedComponent === label ? 'rgba(124,58,237,0.2)' : 'var(--surface-input)',
                  border: '1px solid ' + (isFilled ? 'rgba(52,211,153,0.4)' : selectedComponent === label ? 'rgba(124,58,237,0.5)' : 'var(--border-subtle)'),
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={12} />
                </div>
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: isFilled ? '#34d399' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {isFilled ? '✓ Filled' : `/${max} pts`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Layout: Left (8-Component Builder & Guides), Right (Live Prompt Preview & AI Analysis) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        {/* ========================================================= */}
        {/* LEFT COLUMN: 8 Component Cards with Guides & Examples     */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Filter Bar for Learning Examples */}
          <div
            style={{
              background: 'var(--surface-navy)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <Filter size={14} color="#a78bfa" />
              <span>Filter Guides & Examples:</span>
            </div>

            {/* Component Filter */}
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
              style={{
                background: 'var(--surface-input)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                outline: 'none'
              }}
            >
              <option value="all">All 8 Components</option>
              {CRITERIA.map(([label, max]) => (
                <option key={label} value={label}>{label} ({max} pts)</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value as any)}
              style={{
                background: 'var(--surface-input)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                outline: 'none'
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Language Filter */}
            <select
              value={languageFilter}
              onChange={e => setLanguageFilter(e.target.value as any)}
              style={{
                background: 'var(--surface-input)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                outline: 'none'
              }}
            >
              <option value="all">All Languages</option>
              <option value="english">English</option>
              <option value="tamil">தமிழ் (Tamil)</option>
              <option value="tanglish">Tanglish</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '160px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search examples..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '5px 10px 5px 30px',
                  fontSize: '12px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Render Component Sections */}
          {CRITERIA.map(([label, maxScore]) => {
            if (selectedComponent !== 'all' && selectedComponent !== label) return null;
            const guide = COMPONENT_GUIDES[label];
            const Icon = CRITERION_ICONS[label] || Target;
            const style = CRITERION_COLORS[label] || { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)' };
            const isExpanded = Boolean(expandedGuides[label]);
            const fieldValue = fields[label] || '';
            const matchingExamples = filteredExamples.filter(e => e.component === label);

            return (
              <div
                key={label}
                style={{
                  background: 'var(--surface-navy)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Section Header */}
                <div
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#ffffff' }}>{label}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: style.color, background: style.bg, padding: '2px 8px', borderRadius: '12px', border: `1px solid ${style.color}40` }}>
                          Weight: {maxScore} pts
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {guide?.shortDescription}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGuide(label)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <span>{isExpanded ? 'Hide Guide' : 'Show Guide & Examples'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Collapsible Learning Guide & Examples */}
                  {isExpanded && guide && (
                    <div
                      style={{
                        background: 'var(--surface-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Purpose & How to Write */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Lightbulb size={13} color="#fbbf24" />
                          <span>How to Write & Purpose</span>
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
                          {guide.howToWrite}
                        </p>
                      </div>

                      {/* Practical Tips & Common Mistakes in 2 columns */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', padding: '10px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} /> Practical Tips
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#d1d5db', lineHeight: 1.4 }}>
                            {guide.practicalTips.map((tip, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Common Mistakes to Avoid
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#d1d5db', lineHeight: 1.4 }}>
                            {guide.commonMistakes.map((mistake, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Matching Examples for this component */}
                      {matchingExamples.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa', marginBottom: '8px' }}>
                            Interactive Examples ({matchingExamples.length}):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {matchingExamples.map(ex => (
                              <div
                                key={ex.id}
                                style={{
                                  background: 'var(--surface-navy)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <strong style={{ fontSize: '12.5px', color: '#fff' }}>{ex.title}</strong>
                                    <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                                      {ex.language}
                                    </span>
                                    <span style={{ fontSize: '10px', textTransform: 'capitalize', padding: '2px 6px', borderRadius: '4px', background: 'rgba(124,58,237,0.15)', color: '#c4b5fd' }}>
                                      {ex.difficulty}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(ex.improvedPrompt, ex.id)}
                                      className="btn-compact-secondary"
                                      style={{ height: '24px', padding: '0 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      {copiedId === ex.id ? <Check size={11} color="#34d399" /> : <Copy size={11} />}
                                      <span>Copy</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleInsertExample(label, ex.improvedPrompt)}
                                      className="btn-compact-primary"
                                      style={{ height: '24px', padding: '0 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                      <span>Try This Example</span>
                                      <ArrowRight size={11} />
                                    </button>
                                  </div>
                                </div>

                                {/* Comparison Grid: Weak vs Improved */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '8px' }}>
                                  <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '8px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#f87171', marginBottom: '3px' }}>
                                      ❌ WEAK PROMPT:
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#fca5a5', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                      "{ex.weakPrompt}"
                                    </div>
                                  </div>

                                  <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '6px', padding: '8px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#34d399', marginBottom: '3px' }}>
                                      ✓ IMPROVED PROMPT:
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#a7f3d0', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                      "{ex.improvedPrompt}"
                                    </div>
                                  </div>
                                </div>

                                {/* Why Better */}
                                <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                                  <strong style={{ color: '#cbd5e1' }}>Why better: </strong>{ex.whyBetter}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input Field for this component */}
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
                      <span>Your {label} Specification:</span>
                      <span style={{ fontSize: '11px', color: fieldValue.trim() ? '#34d399' : 'var(--text-muted)' }}>
                        {fieldValue.trim().length} characters
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      value={fieldValue}
                      onChange={e => handleFieldChange(label, e.target.value)}
                      placeholder={guide?.placeholder || `Enter your ${label} details here...`}
                      style={{
                        width: '100%',
                        background: 'var(--surface-input)',
                        border: '1px solid ' + (fieldValue.trim() ? 'rgba(52,211,153,0.4)' : 'var(--border-subtle)'),
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '13px',
                        color: '#fff',
                        fontFamily: 'inherit',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Live Combined Prompt Preview & AI Analysis  */}
        {/* ========================================================= */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Combined Prompt Workspace Card */}
          <div
            style={{
              background: 'var(--surface-navy)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  STRUCTURED PROMPT PREVIEW
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '2px 0 0' }}>
                  Full Prompt ({filledCount}/8 Sections Filled)
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  disabled={!customPrompt.trim()}
                  onClick={() => handleCopyText(customPrompt, 'full-prompt', 'Full structured prompt copied!')}
                  className="btn-compact-secondary"
                  style={{ height: '30px', padding: '0 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedId === 'full-prompt' ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>Copy Prompt</span>
                </button>
              </div>
            </div>

            {/* Editable Combined Prompt Textarea */}
            <div style={{ position: 'relative' }}>
              <textarea
                rows={11}
                value={customPrompt}
                onChange={e => {
                  setCustomPrompt(e.target.value);
                  setIsCustomEdited(true);
                }}
                placeholder="Complete fields on the left or click 'Load Starter Template' to build your structured prompt automatically..."
                style={{
                  width: '100%',
                  background: 'var(--surface-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '12.5px',
                  color: '#f8fafc',
                  fontFamily: 'JetBrains Mono, monospace',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              {isCustomEdited && (
                <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '10px', color: '#fbbf24', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px' }}>
                  ✏️ Custom edits applied directly
                </div>
              )}
            </div>

            {/* Action Buttons: Run Analysis */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={!customPrompt.trim() || busy === 'analyze'}
                onClick={() => onAnalyzePrompt(customPrompt)}
                className="btn-hero-primary"
                style={{ flexGrow: 1, height: '40px', fontSize: '13.5px', justifyContent: 'center' }}
              >
                <Sparkles size={15} />
                <span>{busy === 'analyze' ? 'Analyzing 8 Rubrics...' : 'Run 100-Point AI Analysis'}</span>
              </button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#fca5a5' }}>
                {error}
              </div>
            )}
          </div>

          {/* AI Analysis Result Card */}
          {analysis && (
            <div
              style={{
                background: 'var(--surface-navy)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              {/* Score Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    EVALUATION SCORE
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: analysis.score >= 70 ? '#34d399' : '#fbbf24' }}>
                      {analysis.score}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: analysis.score >= 70 ? '#34d399' : '#fbbf24', background: analysis.score >= 70 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                      {qualityBand(analysis.score)}
                    </span>
                  </div>
                  {analysis.mode === 'rule-based' ? (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📋</span>
                      <span style={{ fontWeight: 600 }}>Rule-Based Review (Offline Mode — Free Quota Protected)</span>
                    </div>
                  ) : analysis.mode === 'ai' ? (
                    <div style={{ marginTop: '6px', fontSize: '11px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✨</span>
                      <span style={{ fontWeight: 600 }}>Evaluated by AI (Gemini Free-Tier)</span>
                    </div>
                  ) : null}
                </div>

                {/* Live Model Execution Gate */}
                <div>
                  {analysis.score >= 70 ? (
                    onExecute && (
                      <button
                        type="button"
                        disabled={busy === 'execute'}
                        onClick={onExecute}
                        className="btn-hero-primary"
                        style={{ height: '36px', padding: '0 16px', fontSize: '12.5px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <Play size={14} />
                        <span>{busy === 'execute' ? 'Executing...' : 'Execute Model Preview'}</span>
                      </button>
                    )
                  ) : (
                    <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Reach 70+ marks to unlock</span>
                      <div style={{ color: '#f87171', fontWeight: 600 }}>Needs +{70 - analysis.score} pts</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 8 Criteria Scoring Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>Component Score Breakdown:</span>
                {analysis.sections.map(sec => {
                  const isComplete = sec.status === 'Complete';
                  const isMissing = sec.status === 'Missing';
                  const pct = Math.round((sec.score / sec.max) * 100);
                  return (
                    <div
                      key={sec.label}
                      style={{
                        background: 'var(--surface-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '10px 12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>{sec.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: isComplete ? '#34d399' : isMissing ? '#f87171' : '#fbbf24' }}>
                            {sec.score} / {sec.max} pts
                          </span>
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: isComplete ? 'rgba(52,211,153,0.15)' : isMissing ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)', color: isComplete ? '#34d399' : isMissing ? '#f87171' : '#fbbf24' }}>
                            {sec.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: isComplete ? '#34d399' : isMissing ? '#f87171' : '#fbbf24' }} />
                      </div>
                      {sec.feedback && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {sec.feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Execution Output Preview */}
              {output && (
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Play size={12} /> Live AI Model Response Preview:
                  </span>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(52,211,153,0.2)',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace'
                    }}
                  >
                    {output}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
