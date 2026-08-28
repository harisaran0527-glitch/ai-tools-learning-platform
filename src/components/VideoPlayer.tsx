import React, { useState } from 'react';
import { Video, ExternalLink, BookOpen, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TutorialVideo, InteractiveTutorialStep } from '../types/tool';

interface VideoPlayerProps {
  video?: TutorialVideo;
  toolName: string;
  category?: string;
  subcategory?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, toolName, subcategory }) => {
  const [hasError, setHasError] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Default 10 Interactive Platform Tutorial Steps when YouTube video is unavailable
  const defaultSteps: InteractiveTutorialStep[] = video?.steps && video.steps.length > 0 ? video.steps : [
    { stepNumber: 1, title: 'Step 1 — Access the Tool Workspace', description: `Launch the official web interface or workspace for ${toolName}.` },
    { stepNumber: 2, title: 'Step 2 — Account Setup & Authentication', description: `Review authentication requirements (free email account, local setup, or API configuration) for ${toolName}.` },
    { stepNumber: 3, title: 'Step 3 — Interface Overview & Layout', description: `Explore the main dashboard, prompt input bar, parameter sliders, and workspace canvas in ${toolName}.` },
    { stepNumber: 4, title: 'Step 4 — Execute Your First Task', description: `Initiate a basic ${subcategory || 'AI'} task by entering an initial context objective.` },
    { stepNumber: 5, title: 'Step 5 — Formulate Effective Prompts', description: `Formulate structured prompt inputs with clear role definitions, target audience constraints, and formatting directives.` },
    { stepNumber: 6, title: 'Step 6 — Initiate Model Generation', description: `Click generate or execute the command to process your prompt parameters.` },
    { stepNumber: 7, title: 'Step 7 — Evaluate Generated Output', description: `Critically review generated responses or media assets for quality, relevance, and factual accuracy.` },
    { stepNumber: 8, title: 'Step 8 — Refine Parameters & Outputs', description: `Iteratively refine your input parameters, tone, or style settings to achieve optimal output.` },
    { stepNumber: 9, title: 'Step 9 — Export & Share Workflow', description: `Download, export, or integrate your finalized outputs into your project repository.` },
    { stepNumber: 10, title: 'Step 10 — Apply in Educational / Faculty Context', description: `Incorporate ${toolName} into classroom preparation, lesson planning, student assignments, or academic research.` }
  ];

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

  const isYouTube = video?.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'));
  const calculatedEmbedUrl = getEmbedUrl(video?.url, video?.embedUrl);

  // Render YouTube Video Player if YouTube URL exists and no loading error
  if (isYouTube && calculatedEmbedUrl && !hasError) {
    return (
      <div style={{ margin: '24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-open-source" style={{ background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.3)', fontSize: '11px' }}>
              YOUTUBE TUTORIAL
            </span>
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', color: '#fff', margin: 0 }}>
              {video.title || `${toolName} Video Tutorial`}
            </h4>
          </div>

          <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Watch on YouTube <ExternalLink size={13} />
          </a>
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
          Watch this official tutorial and complete the learning sections before starting the assessment.
        </p>
      </div>
    );
  }

  // Render Interactive Platform Tutorial Wizard when external video is unavailable
  const currentStep = defaultSteps[activeStepIndex] || defaultSteps[0];

  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', margin: '24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-free" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent1)', border: '1px solid rgba(108,99,255,0.3)', fontSize: '11px' }}>
            PLATFORM TUTORIAL
          </span>
          <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '17px', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={18} color="var(--accent1)" /> Interactive Platform Tutorial
          </h4>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--accent2)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
          Step {activeStepIndex + 1} of {defaultSteps.length}
        </span>
      </div>

      {/* Step Progress Dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {defaultSteps.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setActiveStepIndex(idx)}
            style={{
              flexGrow: 1,
              height: '5px',
              borderRadius: '3px',
              background: idx === activeStepIndex ? 'var(--accent1)' : idx < activeStepIndex ? 'var(--accent2)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          />
        ))}
      </div>

      {/* Step Content Card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h5 style={{ fontFamily: 'Sora, sans-serif', fontSize: '16px', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="var(--accent2)" /> {currentStep.title}
        </h5>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
          {currentStep.description}
        </p>

        {currentStep.examplePrompt && (
          <div style={{ marginTop: '12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#e8eaf0' }}>
            💡 <strong>Prompt Example:</strong> <code>{currentStep.examplePrompt}</code>
          </div>
        )}
      </div>

      {/* Navigation Wizard Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn-secondary"
          disabled={activeStepIndex === 0}
          onClick={() => setActiveStepIndex(prev => prev - 1)}
          style={{ opacity: activeStepIndex === 0 ? 0.4 : 1, padding: '8px 14px', fontSize: '13px' }}
        >
          <ChevronLeft size={16} /> Previous Step
        </button>

        <button
          className="btn-primary"
          disabled={activeStepIndex === defaultSteps.length - 1}
          onClick={() => setActiveStepIndex(prev => prev + 1)}
          style={{ opacity: activeStepIndex === defaultSteps.length - 1 ? 0.4 : 1, padding: '8px 14px', fontSize: '13px' }}
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};


