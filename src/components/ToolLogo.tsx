import React, { useState } from 'react';
import { getToolLogoUrl } from '../data/officialLogos';
import { Sparkles } from 'lucide-react';

interface ToolLogoProps {
  slug?: string;
  name?: string;
  logo?: string;
  size?: number;
  className?: string;
  category?: string;
}

export const ToolLogo: React.FC<ToolLogoProps> = ({
  slug,
  name = 'AI Tool',
  logo,
  size = 32,
  className = '',
  category
}) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getToolLogoUrl(slug, logo);

  // Generate a consistent gradient based on name/slug
  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 45) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 45%), hsl(${hue2}, 75%, 35%))`;
  };

  const initials = (name || 'AI')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: size > 40 ? '12px' : '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#12172b',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
    flexShrink: 0,
  };

  if (!logoUrl || hasError) {
    return (
      <div
        className={`tool-logo-fallback ${className}`}
        style={{
          ...containerStyle,
          background: getGradient(slug || name),
          color: '#ffffff',
          fontWeight: 700,
          fontSize: `${Math.max(10, Math.floor(size * 0.38))}px`,
          letterSpacing: '-0.5px',
          fontFamily: 'Sora, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
        title={name}
      >
        {initials || <Sparkles size={Math.floor(size * 0.5)} />}
      </div>
    );
  }

  return (
    <div className={`tool-logo-container ${className}`} style={containerStyle} title={name}>
      <img
        src={logoUrl}
        alt={name}
        onError={() => setHasError(true)}
        style={{
          width: '72%',
          height: '72%',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
        }}
        loading="lazy"
      />
    </div>
  );
};
