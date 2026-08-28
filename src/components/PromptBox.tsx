import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface PromptBoxProps {
  promptText: string;
  label?: string;
}

export const PromptBox: React.FC<PromptBoxProps> = ({ promptText, label = 'Example Prompt' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          💡 {label}
        </span>

        <button
          className="btn-secondary"
          onClick={handleCopy}
          style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
        >
          {copied ? (
            <>
              <Check size={12} color="var(--accent2)" /> Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy size={12} /> Copy Prompt
            </>
          )}
        </button>
      </div>

      <div className="prompt-box">
        {promptText}
      </div>
    </div>
  );
};
