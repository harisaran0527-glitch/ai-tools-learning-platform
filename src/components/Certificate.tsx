import React from 'react';
import { Award, Printer, Download, Sparkles } from 'lucide-react';
import { CertificateData } from '../types/progress';

interface CertificateProps {
  cert: CertificateData;
  onClose?: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({ cert, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#0e1220', padding: '32px', borderRadius: '20px', border: '2px solid var(--accent1)', boxShadow: '0 0 40px rgba(108,99,255,0.25)', maxWidth: '750px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      {/* Decorative Border */}
      <div style={{ border: '1px dashed rgba(108,99,255,0.4)', padding: '24px', borderRadius: '14px' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(108,99,255,0.15)', borderRadius: '50%', color: 'var(--accent1)', marginBottom: '16px' }}>
          <Award size={48} />
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent2)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
          PLATFORM LEARNING COMPLETION CERTIFICATE
        </div>

        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', color: '#fff', marginBottom: '16px' }}>
          Certificate of Mastery
        </h2>

        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          This is to certify that
        </p>

        <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', color: 'var(--accent2)', margin: '12px 0', borderBottom: '1px solid var(--border)', display: 'inline-block', paddingBottom: '4px' }}>
          {cert.learnerName || 'Faculty Educator'}
        </h3>

        <p style={{ color: 'var(--text)', fontSize: '15px', maxWidth: '500px', margin: '16px auto' }}>
          has successfully completed all required modules, practical exercises, and passed 50-mark assessments for the learning path:
        </p>

        <div style={{ background: 'var(--surface2)', padding: '12px 24px', borderRadius: '12px', display: 'inline-block', color: 'var(--accent1)', fontWeight: 700, fontSize: '18px', margin: '12px 0' }}>
          <Sparkles size={16} style={{ display: 'inline', marginRight: '6px' }} />
          {cert.pathName}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
          <div>
            <span style={{ display: 'block', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>{cert.totalToolsLearned}</span>
            Tools Mastered
          </div>
          <div>
            <span style={{ display: 'block', color: 'var(--accent2)', fontWeight: 600, fontSize: '14px' }}>{cert.averageScore} / 50</span>
            Average Assessment Score
          </div>
          <div>
            <span style={{ display: 'block', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>{new Date(cert.issuedAt).toLocaleDateString()}</span>
            Issue Date
          </div>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print / Save PDF
          </button>
          {onClose && (
            <button className="btn-secondary" onClick={onClose}>
              Close Certificate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
