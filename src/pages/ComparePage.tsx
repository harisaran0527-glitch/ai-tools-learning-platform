import React from 'react';
import { ALL_TOOLS } from '../data/catalog/toolsData';
import { AITool } from '../types/tool';
import { Link } from 'react-router-dom';
import { GitCompare, ExternalLink, Trash2, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface ComparePageProps {
  comparedSlugs: string[];
  onRemoveCompare: (slug: string) => void;
  onClearCompare: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  comparedSlugs,
  onRemoveCompare,
  onClearCompare
}) => {
  const toolsToCompare: AITool[] = comparedSlugs
    .map(slug => ALL_TOOLS.find(t => t.slug === slug))
    .filter((t): t is AITool => t !== undefined)
    .slice(0, 3); // Max 3 tools

  return (
    <div className="container">
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GitCompare size={28} color="var(--accent1)" /> Side-by-Side Tool Comparison
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '14px' }}>
              Compare up to 3 AI tools across pricing, difficulty, features, free tier limits, and platforms.
            </p>
          </div>

          {toolsToCompare.length > 0 && (
            <button className="btn-secondary" onClick={onClearCompare} style={{ fontSize: '12px' }}>
              <Trash2 size={14} /> Clear Selection
            </button>
          )}
        </div>
      </div>

      {toolsToCompare.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <GitCompare size={48} color="var(--muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', marginBottom: '8px' }}>
            No Tools Selected for Comparison
          </h3>
          <p style={{ color: 'var(--muted)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '14px' }}>
            Browse the home catalog and click "Compare" on any tool card (up to 3 tools) to see a detailed side-by-side comparison matrix.
          </p>
          <Link to="/" className="btn-primary">
            Browse All 1,500+ Tools
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px', width: '220px', color: 'var(--muted)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>FEATURE</th>
                {toolsToCompare.map(t => (
                  <th key={t.id} style={{ padding: '20px', textAlign: 'center', width: '320px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <img src={t.logo} alt={t.name} style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                      <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', color: '#fff' }}>{t.name}</h3>
                      <button
                        onClick={() => onRemoveCompare(t.slug)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent3)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category & Subcategory */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Category & Subcategory</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#fff' }}>
                    <strong>{t.category}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--accent2)' }}>{t.subcategory}</div>
                  </td>
                ))}
              </tr>

              {/* Pricing Type */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Pricing Type</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '16px', textAlign: 'center' }}>
                    <span className={`badge ${t.pricingType === 'free' ? 'badge-free' : t.pricingType === 'open-source' ? 'badge-open-source' : 'badge-free-tier'}`}>
                      {t.pricingType.toUpperCase()}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Main Superpower */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Main Superpower</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '16px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>
                    {t.superpower}
                  </td>
                ))}
              </tr>

              {/* Difficulty & Time */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Difficulty & Time</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '16px', textAlign: 'center' }}>
                    <span className="badge badge-difficulty">{t.difficulty}</span>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} /> {t.learningTime} mins
                    </div>
                  </td>
                ))}
              </tr>

              {/* Free Tier Limits */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Free Tier Details</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '16px', fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>
                    {t.freePlanDetails}
                  </td>
                ))}
              </tr>

              {/* Platforms */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Supported Platforms</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '16px', textAlign: 'center' }}>
                    {t.platforms.map(p => (
                      <span key={p} style={{ display: 'inline-block', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', margin: '2px' }}>
                        {p}
                      </span>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Learn & Official Actions */}
              <tr>
                <td style={{ padding: '20px', fontWeight: 600, color: 'var(--muted)', fontSize: '13px' }}>Actions</td>
                {toolsToCompare.map(t => (
                  <td key={t.id} style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/tools/${t.slug}`} className="btn-primary" style={{ width: '100%', fontSize: '13px' }}>
                        Open Learning Page
                      </Link>
                      <a href={t.officialUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', fontSize: '12px' }}>
                        <ExternalLink size={12} /> Official Site
                      </a>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
