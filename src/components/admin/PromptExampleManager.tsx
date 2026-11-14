import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Plus, Edit2, Trash2, Eye, ArrowUp, ArrowDown, Search,
  Filter, Check, X, Copy, Lightbulb, AlertTriangle, Layers, Target,
  FileText, CheckSquare, Lock, Code, Zap, ShieldCheck, Globe, Image as ImageIcon
} from 'lucide-react';
import { api } from '../../lib/platform';
import { CRITERIA } from '../../lib/practice';
import { SEED_PROMPT_EXAMPLES, PromptExample } from '../../data/promptLearningData';

interface PromptExampleManagerProps {
  token: string;
}

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

export const PromptExampleManager: React.FC<PromptExampleManagerProps> = ({ token }) => {
  const [examples, setExamples] = useState<PromptExample[]>(SEED_PROMPT_EXAMPLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Filters
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [modalTab, setModalTab] = useState<'edit' | 'preview'>('edit');
  const [previewExample, setPreviewExample] = useState<PromptExample | null>(null);

  // Form State
  const [editId, setEditId] = useState<string>('');
  const [formComponent, setFormComponent] = useState<string>(CRITERIA[0][0]);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formWeakPrompt, setFormWeakPrompt] = useState<string>('');
  const [formImprovedPrompt, setFormImprovedPrompt] = useState<string>('');
  const [formWhyBetter, setFormWhyBetter] = useState<string>('');
  const [formTips, setFormTips] = useState<string>('');
  const [formCommonMistakes, setFormCommonMistakes] = useState<string>('');
  const [formDifficulty, setFormDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [formLanguage, setFormLanguage] = useState<'english' | 'tamil' | 'tanglish'>('english');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch all examples (published & drafts) using admin token
  const loadExamples = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ examples: PromptExample[] }>('prompt_examples', undefined, token);
      if (Array.isArray(res.examples) && res.examples.length > 0) {
        setExamples(res.examples);
      }
    } catch (e) {
      // Keep existing examples if offline or migration pending
      console.warn('Using local seed examples:', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamples();
  }, [token]);

  const openCreateModal = () => {
    setModalMode('create');
    setModalTab('edit');
    setEditId(`example-${Date.now()}`);
    setFormComponent(filterComponent !== 'all' ? filterComponent : CRITERIA[0][0]);
    setFormTitle('');
    setFormExplanation('');
    setFormWeakPrompt('');
    setFormImprovedPrompt('');
    setFormWhyBetter('');
    setFormTips('');
    setFormCommonMistakes('');
    setFormDifficulty('beginner');
    setFormLanguage('english');
    setFormImageUrl('');
    setFormDisplayOrder(examples.length + 1);
    setIsEditorOpen(true);
  };

  const openEditModal = (ex: PromptExample) => {
    setModalMode('edit');
    setModalTab('edit');
    setEditId(ex.id);
    setFormComponent(ex.component);
    setFormTitle(ex.title);
    setFormExplanation(ex.explanation);
    setFormWeakPrompt(ex.weakPrompt);
    setFormImprovedPrompt(ex.improvedPrompt);
    setFormWhyBetter(ex.whyBetter);
    setFormTips(ex.tips.join('\n'));
    setFormCommonMistakes(ex.commonMistakes.join('\n'));
    setFormDifficulty(ex.difficulty);
    setFormLanguage(ex.language);
    setFormImageUrl(ex.imageUrl || '');
    setFormDisplayOrder(ex.displayOrder || 0);
    setIsEditorOpen(true);
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!formTitle.trim()) { alert('Please enter a title.'); return; }
    if (!formExplanation.trim()) { alert('Please enter an explanation.'); return; }
    if (!formWeakPrompt.trim()) { alert('Please enter a weak prompt example.'); return; }
    if (!formImprovedPrompt.trim()) { alert('Please enter an improved prompt example.'); return; }
    if (!formWhyBetter.trim()) { alert('Please explain why the improved prompt is better.'); return; }

    setIsSubmitting(true);
    const examplePayload: PromptExample = {
      id: editId,
      component: formComponent,
      title: formTitle.trim(),
      explanation: formExplanation.trim(),
      weakPrompt: formWeakPrompt.trim(),
      improvedPrompt: formImprovedPrompt.trim(),
      whyBetter: formWhyBetter.trim(),
      tips: formTips.split('\n').map(t => t.trim()).filter(Boolean),
      commonMistakes: formCommonMistakes.split('\n').map(m => m.trim()).filter(Boolean),
      difficulty: formDifficulty,
      language: formLanguage,
      imageUrl: formImageUrl.trim() || undefined,
      status,
      displayOrder: Number(formDisplayOrder) || 0
    };

    try {
      await api('save_prompt_example', { example: examplePayload }, token);
      showToast(status === 'published' ? 'Example published successfully!' : 'Saved as draft!');
      setIsEditorOpen(false);
      await loadExamples();
    } catch (e) {
      alert(`Save error: ${(e as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (ex: PromptExample) => {
    const newStatus = ex.status === 'published' ? 'draft' : 'published';
    try {
      await api('save_prompt_example', { example: { ...ex, status: newStatus } }, token);
      showToast(newStatus === 'published' ? 'Published!' : 'Unpublished (Draft)');
      await loadExamples();
    } catch (e) {
      alert(`Status update error: ${(e as Error).message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api('delete_prompt_example', { id }, token);
      showToast('Example deleted.');
      await loadExamples();
    } catch (e) {
      alert(`Delete error: ${(e as Error).message}`);
    }
  };

  const handleMoveOrder = async (ex: PromptExample, direction: 'up' | 'down') => {
    const list = [...examples].filter(e => e.component === ex.component);
    const idx = list.findIndex(e => e.id === ex.id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === list.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const currentOrder = ex.displayOrder || idx + 1;
    const targetOrder = list[targetIdx].displayOrder || targetIdx + 1;

    try {
      await api('save_prompt_example', { example: { ...ex, displayOrder: targetOrder } }, token);
      await api('save_prompt_example', { example: { ...list[targetIdx], displayOrder: currentOrder } }, token);
      showToast('Display order updated.');
      await loadExamples();
    } catch (e) {
      // fallback
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return examples.filter(ex => {
      if (filterComponent !== 'all' && ex.component !== filterComponent) return false;
      if (filterDifficulty !== 'all' && ex.difficulty !== filterDifficulty) return false;
      if (filterLanguage !== 'all' && ex.language !== filterLanguage) return false;
      if (filterStatus !== 'all' && ex.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ex.title.toLowerCase().includes(q);
        const matchesComp = ex.component.toLowerCase().includes(q);
        const matchesPrompt = ex.improvedPrompt.toLowerCase().includes(q);
        if (!matchesTitle && !matchesComp && !matchesPrompt) return false;
      }
      return true;
    });
  }, [examples, filterComponent, filterDifficulty, filterLanguage, filterStatus, searchQuery]);

  // Metrics
  const totalCount = examples.length;
  const publishedCount = examples.filter(e => e.status === 'published').length;
  const draftCount = examples.filter(e => e.status === 'draft').length;
  const componentsCovered = new Set(examples.map(e => e.component)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">Prompt Learning Content & Example Manager</h1>
          <p className="admin-header-sub">
            Add, curate, edit, and publish section-by-section prompting examples across all 8 rubrics and multiple languages.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn-admin-action"
        >
          <Plus size={16} />
          <span>Add Prompt Example</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="admin-metrics-row">
        <div className="admin-metric-card">
          <div className="metric-squircle cyan">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="metric-val">{totalCount}</div>
            <div className="metric-label">Total Examples</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-squircle green">
            <Check size={20} />
          </div>
          <div>
            <div className="metric-val" style={{ color: '#34d399' }}>{publishedCount}</div>
            <div className="metric-label">Published (Live to Students)</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-squircle amber">
            <Edit2 size={20} />
          </div>
          <div>
            <div className="metric-val" style={{ color: '#fbbf24' }}>{draftCount}</div>
            <div className="metric-label">Drafts (Unpublished)</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-squircle blue">
            <Target size={20} />
          </div>
          <div>
            <div className="metric-val">{componentsCovered} / 8</div>
            <div className="metric-label">Rubrics Covered</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--surface-navy)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
          <Filter size={15} color="#a78bfa" />
          <span>Filter:</span>
        </div>

        {/* Component */}
        <select
          value={filterComponent}
          onChange={e => setFilterComponent(e.target.value)}
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '12.5px', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
        >
          <option value="all">All 8 Components</option>
          {CRITERIA.map(([label, max]) => (
            <option key={label} value={label}>{label} ({max} pts)</option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          value={filterDifficulty}
          onChange={e => setFilterDifficulty(e.target.value)}
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '12.5px', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        {/* Language */}
        <select
          value={filterLanguage}
          onChange={e => setFilterLanguage(e.target.value)}
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '12.5px', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
        >
          <option value="all">All Languages</option>
          <option value="english">English</option>
          <option value="tamil">தமிழ் (Tamil)</option>
          <option value="tanglish">Tanglish</option>
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '12.5px', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search examples by title or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 12px 6px 32px', fontSize: '12.5px', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      {/* Examples Table / Cards */}
      <div style={{ background: 'var(--surface-navy)', border: '1px solid var(--border-subtle)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
            Showing {filteredList.length} of {totalCount} prompt examples
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No examples match your current filter. Click "Add Prompt Example" to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredList.map((ex, idx) => {
              const compStyle = CRITERION_COLORS[ex.component] || { color: '#a78bfa', bg: 'rgba(124,58,237,0.15)' };
              const isPublished = ex.status === 'published';
              return (
                <div
                  key={ex.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx < filteredList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  {/* Top Bar of item */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: compStyle.bg, color: compStyle.color, border: `1px solid ${compStyle.color}40` }}>
                        {ex.component}
                      </span>
                      <strong style={{ fontSize: '14px', color: '#fff' }}>{ex.title}</strong>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {ex.language}
                      </span>
                      <span style={{ fontSize: '10px', textTransform: 'capitalize', padding: '1px 6px', borderRadius: '4px', background: 'rgba(124,58,237,0.15)', color: '#c4b5fd' }}>
                        {ex.difficulty}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 8px', borderRadius: '10px', background: isPublished ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', color: isPublished ? '#34d399' : '#fbbf24', border: `1px solid ${isPublished ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                        {isPublished ? '● Published' : '○ Draft'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(ex, 'up')}
                        title="Move Up"
                        className="btn-table-icon"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(ex, 'down')}
                        title="Move Down"
                        className="btn-table-icon"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(ex)}
                        className="btn-compact-secondary"
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                      >
                        {isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(ex)}
                        title="Edit Example"
                        className="btn-table-icon"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ex.id, ex.title)}
                        title="Delete Example"
                        className="btn-table-icon danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Text previews */}
                  <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.4 }}>
                    {ex.explanation}
                  </div>

                  {/* Weak vs Improved previews */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '2px' }}>
                    <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#fca5a5', fontFamily: 'monospace' }}>
                      <strong style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>Weak:</strong>
                      {ex.weakPrompt}
                    </div>
                    <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '6px', padding: '8px 10px', fontSize: '11.5px', color: '#a7f3d0', fontFamily: 'monospace' }}>
                      <strong style={{ color: '#34d399', display: 'block', marginBottom: '2px' }}>Improved:</strong>
                      {ex.improvedPrompt}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* ADD / EDIT MODAL                                              */}
      {/* ============================================================= */}
      {isEditorOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#0e1222',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {modalMode === 'create' ? 'Create New Prompt Example' : 'Edit Prompt Example'}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Targeted section learning guide with comparative weak vs improved prompts.
                </p>
              </div>

              {/* Tab Switcher: Form vs Preview */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-input)', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalTab('edit')}
                  style={{
                    background: modalTab === 'edit' ? '#7c3aed' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('preview')}
                  style={{
                    background: modalTab === 'preview' ? '#7c3aed' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Eye size={12} />
                  <span>Student Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {modalTab === 'preview' ? (
                /* LIVE STUDENT VIEW PREVIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#c4b5fd', background: 'rgba(124,58,237,0.15)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)' }}>
                    👁️ This is exactly how students will see this example in the Interactive Prompt Builder:
                  </div>

                  <div style={{ background: 'var(--surface-navy)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(124,58,237,0.2)', color: '#c4b5fd' }}>
                          {formComponent}
                        </span>
                        <strong style={{ fontSize: '14px', color: '#fff' }}>{formTitle || 'Untitled Example'}</strong>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          {formLanguage}
                        </span>
                        <span style={{ fontSize: '10px', textTransform: 'capitalize', padding: '1px 6px', borderRadius: '4px', background: 'rgba(124,58,237,0.15)', color: '#c4b5fd' }}>
                          {formDifficulty}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#e2e8f0' }}>
                      {formExplanation || 'No explanation provided.'}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '10px' }}>
                      <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>❌ WEAK PROMPT:</div>
                        <div style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          "{formWeakPrompt || 'Weak prompt text...'}"
                        </div>
                      </div>

                      <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>✓ IMPROVED PROMPT:</div>
                        <div style={{ fontSize: '12px', color: '#a7f3d0', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          "{formImprovedPrompt || 'Improved prompt text...'}"
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                      <strong style={{ color: '#cbd5e1' }}>Why better: </strong>{formWhyBetter || 'Explanation of why improved prompt is better.'}
                    </div>

                    {formTips.trim() && (
                      <div style={{ background: 'rgba(52,211,153,0.05)', borderRadius: '6px', padding: '8px 12px', fontSize: '11.5px', color: '#34d399' }}>
                        <strong>Tips:</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
                          {formTips.split('\n').filter(Boolean).map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Row 1: Component, Language, Difficulty */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                        Prompting Component *
                      </label>
                      <select
                        value={formComponent}
                        onChange={e => setFormComponent(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                      >
                        {CRITERIA.map(([label, max]) => (
                          <option key={label} value={label}>{label} ({max} pts)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                        Language *
                      </label>
                      <select
                        value={formLanguage}
                        onChange={e => setFormLanguage(e.target.value as any)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                      >
                        <option value="english">English</option>
                        <option value="tamil">தமிழ் (Tamil)</option>
                        <option value="tanglish">Tanglish</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                        Difficulty Level *
                      </label>
                      <select
                        value={formDifficulty}
                        onChange={e => setFormDifficulty(e.target.value as any)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                      Example Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beginner Python Script Goal"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Explanation */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                      Purpose / Explanation *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain the purpose of this component in simple language..."
                      value={formExplanation}
                      onChange={e => setFormExplanation(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Weak vs Improved Prompts */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#f87171', display: 'block', marginBottom: '4px' }}>
                        Weak Prompt Example *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Write something about Python."
                        value={formWeakPrompt}
                        onChange={e => setFormWeakPrompt(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid rgba(239,68,68,0.3)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', fontFamily: 'monospace', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '4px' }}>
                        Improved Prompt Example *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Write a comprehensive 5-step tutorial teaching complete beginners..."
                        value={formImprovedPrompt}
                        onChange={e => setFormImprovedPrompt(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid rgba(52,211,153,0.4)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', fontFamily: 'monospace', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Why Better */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                      Why Improved Example is Better *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain what specific details make the improved prompt work..."
                      value={formWhyBetter}
                      onChange={e => setFormWhyBetter(e.target.value)}
                      style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  {/* Tips & Common Mistakes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '4px' }}>
                        Practical Tips (one per line)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Tip 1&#10;Tip 2"
                        value={formTips}
                        onChange={e => setFormTips(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#f87171', display: 'block', marginBottom: '4px' }}>
                        Common Mistakes (one per line)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Mistake 1&#10;Mistake 2"
                        value={formCommonMistakes}
                        onChange={e => setFormCommonMistakes(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Optional Image URL and Display Order */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                        Optional Explanatory Image URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://... or /storage/..."
                        value={formImageUrl}
                        onChange={e => setFormImageUrl(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: '4px' }}>
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formDisplayOrder}
                        onChange={e => setFormDisplayOrder(Number(e.target.value))}
                        style={{ width: '100%', background: 'var(--surface-input)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="btn-compact-secondary"
                style={{ padding: '0 16px', height: '36px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('draft')}
                className="btn-compact-secondary"
                style={{ padding: '0 16px', height: '36px', color: '#fbbf24', borderColor: 'rgba(251,191,36,0.4)' }}
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('published')}
                className="btn-compact-primary"
                style={{ padding: '0 20px', height: '36px' }}
              >
                <Check size={14} />
                <span>{isSubmitting ? 'Saving...' : 'Publish Example'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
