import React, { useState } from 'react';
import { AlertCircle, Play, Video } from 'lucide-react';
import { TutorialVideo } from '../types/tool';

interface VideoPlayerProps {
  video?: TutorialVideo;
  toolName: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, toolName }) => {
  const [hasError, setHasError] = useState(false);

  // Helper to extract Youtube Embed URL
  const getEmbedUrl = (url?: string, embedUrl?: string): string | null => {
    if (embedUrl && embedUrl.startsWith('http')) return embedUrl;
    if (!url) return null;

    try {
      if (url.includes('youtube.com/embed/')) return url;
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const calculatedEmbedUrl = getEmbedUrl(video?.url, video?.embedUrl);

  if (!video || !video.url || hasError || !calculatedEmbedUrl) {
    return (
      <div
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '36px 24px',
          textAlign: 'center',
          margin: '20px 0'
        }}
      >
        <AlertCircle size={40} color="var(--accent4)" style={{ marginBottom: '14px', margin: '0 auto 14px', display: 'block' }} />
        <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Tutorial Video Currently Unavailable
        </h4>
        <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.5 }}>
          Use the step-by-step written guide below to learn {toolName}.
        </p>
      </div>
    );
  }

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
          <Video size={18} color="var(--accent1)" /> {video.title || `${toolName} Video Tutorial`}
        </h4>
        {video.source && (
          <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Source: {video.source}
          </span>
        )}
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#090d16', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <iframe
          src={calculatedEmbedUrl}
          title={video.title || `${toolName} Tutorial`}
          onError={() => setHasError(true)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        />
      </div>

      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', fontStyle: 'italic' }}>
        Watch this tutorial and complete the learning sections before starting the assessment.
      </p>
    </div>
  );
};

