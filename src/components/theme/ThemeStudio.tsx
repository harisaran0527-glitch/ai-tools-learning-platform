import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  Layers,
  Eye,
  RotateCcw,
  Save,
  Send,
  Copy,
  Trash2,
  Upload,
  Play,
  Pause,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Film,
  Image as ImageIcon,
  Activity,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Undo2,
  Volume2,
  VolumeX,
  Search,
  Compass,
  Repeat,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import {
  ThemeConfig,
  PageTarget,
  BackgroundType,
  MotionType,
  Preset3D,
  LayerConfig,
} from '../../types/theme';
import {
  BUILT_IN_PRESETS,
  ORIGINAL_AI_VERSE_PRESET,
} from '../../data/themePresets';
import { BackgroundLayer } from './BackgroundLayer';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/platform';

interface ThemeStudioProps {
  token: string;
}

export const ThemeStudio: React.FC<ThemeStudioProps> = ({ token }) => {
  const { setPreviewTheme, refreshThemes, publishedBindings } = useTheme();

  // Selected target page to customize
  const [selectedTarget, setSelectedTarget] = useState<PageTarget>('global');

  // Custom themes list & active working draft
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() =>
    structuredClone(ORIGINAL_AI_VERSE_PRESET)
  );

  // Studio UI states
  const [activeSection, setActiveSection] = useState<'bg' | 'media' | 'motion' | 'layers' | 'schedule'>('bg');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewPage, setPreviewPage] = useState<'home' | 'catalog' | 'tools' | 'practice' | 'login'>('home');
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [previewMuted, setPreviewMuted] = useState(true);
  const [previewLoop, setPreviewLoop] = useState(true);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    percent: number;
    stage: string;
    loadedBytes?: number;
    totalBytes?: number;
  } | null>(null);

  // File upload refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Client-side video metadata extractor
  const extractVideoMetadata = (file: File): Promise<{
    width: number;
    height: number;
    duration: number;
    aspectRatio: string;
    orientation: 'landscape' | 'portrait' | 'square';
  }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objUrl = URL.createObjectURL(file);
      video.src = objUrl;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objUrl);
        const width = video.videoWidth || 1920;
        const height = video.videoHeight || 1080;
        const duration = Math.round((video.duration || 0) * 10) / 10;
        const ratio = width / height;

        let orientation: 'landscape' | 'portrait' | 'square' = 'landscape';
        let aspectRatio = '16:9';

        if (Math.abs(ratio - 1) < 0.08) {
          orientation = 'square';
          aspectRatio = '1:1';
        } else if (ratio < 0.9) {
          orientation = 'portrait';
          aspectRatio = ratio < 0.6 ? '9:16' : '3:4';
        } else {
          orientation = 'landscape';
          aspectRatio = ratio > 2.0 ? '21:9' : (ratio > 1.6 ? '16:9' : '4:3');
        }

        resolve({ width, height, duration, aspectRatio, orientation });
      };

      video.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve({ width: 1920, height: 1080, duration: 0, aspectRatio: '16:9', orientation: 'landscape' });
      };
    });
  };

  useEffect(() => {
    let active = true;
    api<{ themes: ThemeConfig[] }>('themes', undefined, token).then(res => {
      if (active) setCustomThemes(res.themes.filter(t => !t.isPreset));
    }).catch(e => { if (active) setStatusMessage({text:(e as Error).message,type:'error'}); });
    return () => { active = false; };
  }, [token]);

  // Handle preset selection
  const selectPreset = (preset: ThemeConfig) => {
    const cloned = structuredClone(preset);
    cloned.id = `theme-${Date.now()}`;
    cloned.pageTarget = selectedTarget;
    cloned.status = 'draft';
    cloned.isPreset = false;
    setActiveTheme(cloned);
    setStatusMessage({ text: `Loaded "${preset.name}".`, type: 'success' });
  };

  // Restore immutable original default
  const handleRestoreDefault = async () => {
    if (busy || !window.confirm('Restore the original default background for this page?')) return;
    setBusy(true); setStatusMessage(null);
    try {
      await api('restore_theme', {target:selectedTarget}, token);
      await refreshThemes();
      setActiveTheme(structuredClone(ORIGINAL_AI_VERSE_PRESET));
      setStatusMessage({text:'Original default restored.',type:'success'});
    } catch(e) { setStatusMessage({text:(e as Error).message,type:'error'}); }
    finally { setBusy(false); }
  };

  // Create new custom theme from scratch
  const handleCreateNew = () => {
    const newTheme: ThemeConfig = {
      ...structuredClone(ORIGINAL_AI_VERSE_PRESET),
      id: `theme-${Date.now()}`,
      name: `Custom Theme ${customThemes.length + 1}`,
      description: 'Custom background created in Theme Studio',
      isPreset: false,
      pageTarget: selectedTarget,
      status: 'draft',
      bgType: 'gradient',
      motionType: 'floating_particles',
    };
    setActiveTheme(newTheme);
    setStatusMessage({ text: 'Created new theme draft.', type: 'success' });
  };

  // Duplicate current theme
  const handleDuplicate = () => {
    const duplicated: ThemeConfig = {
      ...structuredClone(activeTheme),
      id: `theme-${Date.now()}`,
      name: `${activeTheme.name} (Copy)`,
      isPreset: false,
      status: 'draft',
    };
    setActiveTheme(duplicated);
    setCustomThemes((prev) => [duplicated, ...prev]);
    setStatusMessage({ text: `Duplicated as "${duplicated.name}".`, type: 'success' });
  };

  // Save draft
  const handleSaveDraft = async () => {
    setBusy(true);
    setStatusMessage(null);
    try {
      const updatedTheme = {
        ...activeTheme,
        id: (activeTheme.isPreset || activeTheme.id.startsWith('preset-')) ? `custom-${Date.now()}` : activeTheme.id,
        isPreset: false,
        pageTarget: selectedTarget,
        status: 'draft' as const,
        updatedAt: new Date().toISOString(),
      };
      await api('save_theme', { theme: updatedTheme }, token);
      setActiveTheme(updatedTheme);

      setCustomThemes((prev) => {
        const filtered = prev.filter((t) => t.id !== updatedTheme.id);
        const updated = [updatedTheme, ...filtered];
        try {
          localStorage.setItem('ai_verse_custom_themes_v1', JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
      setStatusMessage({ text: `Draft "${updatedTheme.name}" saved securely.`, type: 'success' });
    } catch(e) {
      setStatusMessage({text:(e as Error).message,type:'error'});
    } finally {
      setBusy(false);
    }
  };

  // Publish theme to selected target
  const handlePublish = async () => {
    if (busy) return;

    if (activeTheme.bgType === 'cinematic' || activeTheme.bgType === 'video') {
      if (!activeTheme.videoUrl) {
        setStatusMessage({ text: 'Please upload or select a background video before publishing.', type: 'error' });
        return;
      }
      if (activeTheme.videoUrl.startsWith('blob:') || activeTheme.videoUrl.startsWith('file:') || activeTheme.videoUrl.startsWith('data:')) {
        setStatusMessage({ text: 'Temporary or browser-only URLs cannot be published. Please upload the video to storage first.', type: 'error' });
        return;
      }
    }

    setBusy(true);
    setStatusMessage({ text: 'Publishing theme to live website...', type: 'success' });

    try {
      const publishedTheme: ThemeConfig = {
        ...activeTheme,
        id: (activeTheme.isPreset || activeTheme.id.startsWith('preset-')) ? `custom-${Date.now()}` : activeTheme.id,
        isPreset: false,
        pageTarget: selectedTarget,
        status: 'published' as const,
        updatedAt: new Date().toISOString(),
      };

      await api('publish_theme', { theme: publishedTheme, target: selectedTarget }, token);
      await refreshThemes();

      setCustomThemes((prev) => {
        const idx = prev.findIndex((t) => t.id === publishedTheme.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = publishedTheme;
          return updated;
        }
        return [publishedTheme, ...prev];
      });

      setStatusMessage({
        text: `Theme published to ${selectedTarget === 'global' ? 'Entire Website (Global Default)' : selectedTarget.toUpperCase()} successfully! The video background is now live for all visitors.`,
        type: 'success',
      });
    } catch(e) {
      setStatusMessage({ text: `Publishing failed: ${(e as Error).message}`, type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  // Rollback to previous published version
  const handleRollback = async () => {
    if (window.confirm(`Rollback theme for ${selectedTarget.toUpperCase()} to the previous version?`)) {
      setBusy(true);
      try {
        const res = await api<{ rolledBack: boolean; restored?: string; revertedToDefault?: boolean }>('rollback_theme', { target: selectedTarget }, token);
        await refreshThemes();
        setStatusMessage({
          text: res.revertedToDefault
            ? 'Reverted to default background preset.'
            : `Rolled back to previous background (${res.restored || 'Previous version'}).`,
          type: 'success',
        });
      } catch(e) {
        setStatusMessage({text:(e as Error).message,type:'error'});
      } finally {
        setBusy(false);
      }
    }
  };

  // Direct signed upload helper: streams large files straight to Supabase Storage with real-time upload progress
  const uploadMediaDirect = async (file: File, isVideo = false): Promise<string> => {
    setUploadProgress({
      percent: 5,
      stage: 'Step 1/3: Requesting authorized storage token...',
      loadedBytes: 0,
      totalBytes: file.size,
    });

    // 1. Request signed upload permissions from backend
    const perm = await api<{
      uploadUrl: string;
      path: string;
      token: string;
      mimeType: string;
      maxSize: number;
      publicUrl: string;
    }>('request_theme_upload', {
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    }, token);

    // 2. Direct upload to Supabase Storage signed URL via XHR to stream progress
    setUploadProgress({
      percent: 15,
      stage: `Step 2/3: Uploading ${isVideo ? 'video' : 'image'} directly to storage (0 MB / ${(file.size / (1024 * 1024)).toFixed(1)} MB)...`,
      loadedBytes: 0,
      totalBytes: file.size,
    });

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', perm.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const rawPercent = (event.loaded / event.total) * 100;
          const scaledPercent = Math.min(92, Math.round(15 + (rawPercent * 0.77)));
          const loadedMb = (event.loaded / (1024 * 1024)).toFixed(1);
          const totalMb = (event.total / (1024 * 1024)).toFixed(1);
          setUploadProgress({
            percent: scaledPercent,
            stage: `Step 2/3: Uploading directly to storage (${loadedMb} MB / ${totalMb} MB — ${Math.round(rawPercent)}%)...`,
            loadedBytes: event.loaded,
            totalBytes: event.total,
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Storage server error (HTTP ${xhr.status}): upload could not be completed.`));
        }
      };

      xhr.onerror = () => reject(new Error('Network connection interrupted during upload. Please check your network and retry.'));
      xhr.ontimeout = () => reject(new Error('Upload timed out. Please check file size or network speed and try again.'));

      xhr.send(file);
    });

    // 3. Verify actual bytes, file size, and magic numbers on server before accepting
    setUploadProgress({
      percent: 95,
      stage: 'Step 3/3: Verifying media content and server integrity...',
      loadedBytes: file.size,
      totalBytes: file.size,
    });

    const verifyRes = await api<{
      verified: boolean;
      url: string;
      path: string;
    }>('verify_theme_media', {
      path: perm.path,
      token: perm.token,
      mimeType: file.type,
    }, token);

    setUploadProgress({
      percent: 100,
      stage: 'Ready! Video verified and saved in persistent storage.',
      loadedBytes: file.size,
      totalBytes: file.size,
    });

    return verifyRes.url;
  };

  // Handle custom image upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatusMessage({ text: 'Please upload a JPG, PNG, or WebP image.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ text: 'Image exceeds the 5MB limit. Choose a smaller image or use an HTTPS image URL.', type: 'error' });
      return;
    }

    setBusy(true);
    setStatusMessage({ text: `Uploading image (${(file.size / 1024).toFixed(0)} KB) directly to storage...`, type: 'success' });
    try {
      const publicUrl = await uploadMediaDirect(file, false);
      setActiveTheme((prev) => ({
        ...prev,
        bgType: 'image',
        imageUrl: publicUrl,
      }));
      setStatusMessage({ text: `Image uploaded and verified successfully (${(file.size / 1024).toFixed(0)} KB).`, type: 'success' });
    } catch (err) {
      setStatusMessage({ text: `Upload failed: ${(err as Error).message}`, type: 'error' });
    } finally {
      setBusy(false);
      setTimeout(() => setUploadProgress(null), 3000);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Handle custom video upload
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['video/mp4', 'video/webm'].includes(file.type)) {
      setStatusMessage({ text: 'Please upload an MP4 or WebM video file.', type: 'error' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({
        text: `Video file is ${(file.size / (1024 * 1024)).toFixed(1)} MB, exceeding the 15MB limit. Please compress the video or choose a smaller file.`,
        type: 'error',
      });
      return;
    }

    setBusy(true);
    setStatusMessage(null);

    try {
      // 1. Extract metadata
      const meta = await extractVideoMetadata(file);

      // 2. Upload direct to persistent storage
      const publicUrl = await uploadMediaDirect(file, true);

      // 3. Smart positioning: Landscape videos default to "85% 50%" (character right) to leave space for hero text
      const defaultPosition = meta.orientation === 'landscape' ? '85% 50%' : '50% 50%';

      setActiveTheme((prev) => ({
        ...prev,
        bgType: 'cinematic',
        videoUrl: publicUrl,
        videoSettings: {
          ...prev.videoSettings,
          loop: true,
          autoplay: true,
          muted: true,
          speed: prev.videoSettings?.speed || 1.0,
          darkOverlay: prev.videoSettings?.darkOverlay ?? 0.45,
          position: prev.videoSettings?.position || defaultPosition,
          fit: 'cover',
          orientation: meta.orientation,
          aspectRatio: meta.aspectRatio,
          staticFallbackUrl: prev.videoSettings?.staticFallbackUrl || prev.imageUrl || '/images/anime-ai-hero.jpg',
          metadata: {
            width: meta.width,
            height: meta.height,
            duration: meta.duration,
            fileSize: file.size,
            fileName: file.name,
            orientation: meta.orientation,
            aspectRatio: meta.aspectRatio,
          },
        },
      }));

      setStatusMessage({
        text: `Video "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB, ${meta.width}×${meta.height} ${meta.aspectRatio}) uploaded successfully! Preview below before publishing.`,
        type: 'success',
      });
    } catch (err) {
      setStatusMessage({ text: `Upload failed: ${(err as Error).message}`, type: 'error' });
    } finally {
      setBusy(false);
      setTimeout(() => setUploadProgress(null), 3000);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Helper to parse position string into percentages
  const parsePosition = (posStr?: string) => {
    if (!posStr || posStr === 'center' || posStr === 'center center') return { x: 50, y: 50 };
    if (posStr === 'right center' || posStr === 'right') return { x: 85, y: 50 };
    if (posStr === 'left center' || posStr === 'left') return { x: 15, y: 50 };
    if (posStr === 'top center' || posStr === 'top') return { x: 50, y: 20 };
    if (posStr === 'bottom center' || posStr === 'bottom') return { x: 50, y: 80 };

    const parts = posStr.split(' ');
    const x = parseInt(parts[0], 10);
    const y = parts[1] ? parseInt(parts[1], 10) : 50;
    return {
      x: Number.isFinite(x) ? x : 50,
      y: Number.isFinite(y) ? y : 50,
    };
  };

  // Helper to update activeTheme safely
  const updateActiveTheme = (updater: (prev: ThemeConfig) => ThemeConfig) => {
    setActiveTheme((prev) => updater(structuredClone(prev)));
  };

  return (
    <div className="theme-studio-root">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileChange}
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoFileChange}
        accept="video/mp4,video/webm"
        style={{ display: 'none' }}
      />

      {/* TOP HEADER & TARGET SELECTOR */}
      <div className="theme-studio-header">
        <div className="theme-studio-title-wrap">
          <Palette size={20} className="theme-studio-icon" />
          <div>
            <h2 className="theme-studio-title">Advanced Theme & Motion Studio</h2>
            <p className="theme-studio-sub">
              Customize, preview, and publish backgrounds, 3D particles, and motion styles in real time.
            </p>
          </div>
        </div>

        {/* Page Target Selector */}
        <div className="theme-target-selector-wrap">
          <label className="theme-label-sm">
            <Globe size={13} />
            <span>Customize For:</span>
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value as PageTarget)}
            className="theme-select-compact"
          >
            <option value="global">Entire Website (Global Default)</option>
            <option value="home">Public Homepage</option>
            <option value="catalog">AI Tool Catalog</option>
            <option value="tool_detail">Tool Detail Pages</option>
            <option value="prompting">Prompting Learning Page</option>
            <option value="prompting_practice">Prompting Practice Lab</option>
            <option value="admin">Admin Dashboard</option>
            <option value="admin_login">Admin Login Card</option>
            <option value="assessment">Assessment Pages</option>
          </select>
        </div>
      </div>

      {/* STATUS BANNER */}
      {statusMessage && (
        <div role={statusMessage.type === 'error' ? 'alert' : 'status'} className={`theme-status-banner ${statusMessage.type}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* MAIN 3-PANEL STUDIO GRID */}
      <div className="theme-studio-grid">
        {/* ===================================================================
            LEFT PANEL: THEME LIBRARY & PRESETS
            =================================================================== */}
        <div className="theme-panel theme-panel-library">
          <div className="theme-panel-header">
            <span className="theme-panel-title">Theme Presets</span>
            <button onClick={handleCreateNew} className="btn-theme-tiny">
              + New Custom
            </button>
          </div>

          <div className="theme-presets-list">
            {BUILT_IN_PRESETS.map((preset) => {
              const isSelected = activeTheme.name === preset.name;
              return (
                <div
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className={`theme-preset-card ${isSelected ? 'active' : ''}`}
                >
                  <div
                    className="theme-preset-thumb"
                    style={{
                      backgroundColor: preset.solidColor,
                      backgroundImage: preset.imageUrl
                        ? `url('${preset.imageUrl}')`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {preset.isPreset && <span className="theme-badge-preset">Preset</span>}
                  </div>
                  <div className="theme-preset-info">
                    <span className="theme-preset-name">{preset.name}</span>
                    <span className="theme-preset-desc">{preset.description}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Saved Custom Themes */}
          {customThemes.length > 0 && (
            <div className="theme-saved-section">
              <div className="theme-panel-header" style={{ marginTop: '16px' }}>
                <span className="theme-panel-title">Saved Custom Themes ({customThemes.length})</span>
              </div>
              <div className="theme-saved-list">
                {customThemes.map((saved) => (
                  <div
                    key={saved.id}
                    onClick={() => setActiveTheme(structuredClone(saved))}
                    className={`theme-saved-item ${activeTheme.id === saved.id ? 'active' : ''}`}
                  >
                    <div className="theme-saved-meta">
                      <span className="theme-saved-name">{saved.name}</span>
                      <span className={`theme-badge-status ${saved.status}`}>{saved.status}</span>
                    </div>
                    <div className="theme-saved-actions">
                      <button
                        title="Delete theme"
                        disabled={busy}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${saved.name}"?`)) {
                            setBusy(true);
                            try {
                              await api('delete_theme', {id:saved.id}, token);
                              setCustomThemes((prev) => prev.filter((t) => t.id !== saved.id));
                              setStatusMessage({text:'Theme deleted.',type:'success'});
                            } catch(error) { setStatusMessage({text:(error as Error).message,type:'error'}); }
                            finally { setBusy(false); }
                          }
                        }}
                        className="btn-theme-icon-danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================
            CENTER PANEL: INTERACTIVE LIVE PREVIEW
            =================================================================== */}
        <div className="theme-panel theme-panel-preview">
          <div className="theme-preview-toolbar">
            <div className="theme-preview-page-select">
              <Eye size={14} />
              <span>Preview:</span>
              <select
                value={previewPage}
                onChange={(e) => setPreviewPage(e.target.value as any)}
                className="theme-select-tiny"
              >
                <option value="home">Homepage Hero</option>
                <option value="catalog">Tool Catalog Cards</option>
                <option value="tools">Tool Details</option>
                <option value="practice">Prompting Lab</option>
                <option value="login">Admin Login</option>
              </select>
            </div>

            {/* Viewport switchers */}
            <div className="theme-viewport-controls">
              <button
                onClick={() => setViewport('desktop')}
                className={`theme-btn-vp ${viewport === 'desktop' ? 'active' : ''}`}
                title="Desktop 100%"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`theme-btn-vp ${viewport === 'tablet' ? 'active' : ''}`}
                title="Tablet 768px"
              >
                <Tablet size={14} />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`theme-btn-vp ${viewport === 'mobile' ? 'active' : ''}`}
                title="Mobile 375px"
              >
                <Smartphone size={14} />
              </button>
            </div>

            {/* Audio Mute / Unmute for Preview */}
            {activeTheme.videoUrl && (
              <button
                onClick={() => setPreviewMuted(!previewMuted)}
                className={`theme-btn-mute ${!previewMuted ? 'unmuted' : ''}`}
                title={previewMuted ? 'Unmute Audio Preview' : 'Mute Audio Preview'}
              >
                {previewMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{previewMuted ? 'Muted' : 'Sound On'}</span>
              </button>
            )}

            {/* Loop Toggle for Preview */}
            {activeTheme.videoUrl && (
              <button
                onClick={() => setPreviewLoop(!previewLoop)}
                className={`theme-btn-mute ${previewLoop ? 'unmuted' : ''}`}
                title={previewLoop ? 'Loop On' : 'Loop Off'}
              >
                <Repeat size={13} />
                <span>{previewLoop ? 'Loop' : 'No Loop'}</span>
              </button>
            )}

            {/* Replace Video Quick Trigger */}
            {activeTheme.videoUrl && (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="theme-btn-mute"
                title="Upload replacement video directly"
              >
                <RefreshCw size={13} />
                <span>Replace Video</span>
              </button>
            )}

            {/* Motion play / pause control */}
            <button
              onClick={() => setIsAnimationPaused(!isAnimationPaused)}
              className={`theme-btn-pause ${isAnimationPaused ? 'paused' : ''}`}
              title={isAnimationPaused ? 'Resume Motion' : 'Pause Motion'}
            >
              {isAnimationPaused ? <Play size={13} /> : <Pause size={13} />}
              <span>{isAnimationPaused ? 'Paused' : 'Playing'}</span>
            </button>
          </div>

          {/* Actual Live Preview Stage */}
          <div className={`theme-preview-stage viewport-${viewport}`}>
            <div className="theme-preview-canvas-holder">
              {/* Background Theme Rendered Live */}
              <BackgroundLayer
                theme={{
                  ...activeTheme,
                  videoSettings: {
                    ...activeTheme.videoSettings,
                    muted: previewMuted,
                    loop: previewLoop,
                  },
                }}
                paused={isAnimationPaused}
                isHeroOverlayOnly
              />

              {/* Mock Page Content for Context */}
              <div className="theme-preview-content-overlay">
                {previewPage === 'home' && (
                  <div className="preview-mock-home">
                    <div className="preview-mock-badge">Curated AI Learning Platform</div>
                    <h3 className="preview-mock-heading">
                      Master Practical AI Tools with <span className="hero-gradient-text">Confidence</span>
                    </h3>
                    <p className="preview-mock-sub">
                      Explore verified AI tools across 15 structured categories.
                    </p>
                    <div className="preview-mock-cta-row">
                      <div className="preview-mock-btn-primary">Explore Catalog</div>
                      <div className="preview-mock-btn-secondary">Prompting Practice</div>
                    </div>

                    {/* Realistic Search Bar Overlay */}
                    <div className="preview-mock-searchbar">
                      <Search size={13} />
                      <span>Search 768 verified AI tools across 15 categories...</span>
                      <kbd>⌘K</kbd>
                    </div>

                    {/* Realistic Hero Stats Deck */}
                    <div className="preview-mock-stats-deck">
                      <div className="preview-mock-stat-item">
                        <span className="preview-mock-stat-num">768</span>
                        <span className="preview-mock-stat-lbl">AI Tools</span>
                      </div>
                      <div className="preview-mock-stat-item">
                        <span className="preview-mock-stat-num">15</span>
                        <span className="preview-mock-stat-lbl">Categories</span>
                      </div>
                      <div className="preview-mock-stat-item">
                        <span className="preview-mock-stat-num">Guided</span>
                        <span className="preview-mock-stat-lbl">Learning</span>
                      </div>
                      <div className="preview-mock-stat-item">
                        <span className="preview-mock-stat-num">Hands-on</span>
                        <span className="preview-mock-stat-lbl">Practice</span>
                      </div>
                    </div>
                  </div>
                )}

                {previewPage === 'catalog' && (
                  <div className="preview-mock-catalog">
                    <div className="preview-mock-card">
                      <span className="preview-mock-tag">Chatbots / Assistants</span>
                      <h4>ChatGPT</h4>
                      <p>Verified conversational AI assistant.</p>
                    </div>
                    <div className="preview-mock-card">
                      <span className="preview-mock-tag">Audio / Voice</span>
                      <h4>ElevenLabs</h4>
                      <p>Realistic voice synthesis & cloning.</p>
                    </div>
                  </div>
                )}

                {previewPage === 'practice' && (
                  <div className="preview-mock-practice">
                    <div className="preview-mock-banner">Prompting Practice Lab</div>
                    <div className="preview-mock-weights-row">
                      <span>Task: 15</span>
                      <span>Context: 15</span>
                      <span>Reqs: 20</span>
                      <span>Format: 10</span>
                    </div>
                  </div>
                )}

                {previewPage === 'login' && (
                  <div className="preview-mock-login-card">
                    <img src="/images/ai-verse-logo.png" alt="Logo" style={{ width: '40px', height: '40px' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Admin Access</span>
                    <div className="preview-mock-input" />
                    <div className="preview-mock-input" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT PANEL: CUSTOMIZATION CONTROLS
            =================================================================== */}
        <div className="theme-panel theme-panel-controls">
          {/* Navigation Accordion Tabs */}
          <div className="theme-ctrl-tabs">
            <button
              onClick={() => setActiveSection('bg')}
              className={`theme-ctrl-tab ${activeSection === 'bg' ? 'active' : ''}`}
            >
              <Palette size={14} />
              <span>Background</span>
            </button>
            <button
              onClick={() => setActiveSection('media')}
              className={`theme-ctrl-tab ${activeSection === 'media' ? 'active' : ''}`}
            >
              <ImageIcon size={14} />
              <span>Media</span>
            </button>
            <button
              onClick={() => setActiveSection('motion')}
              className={`theme-ctrl-tab ${activeSection === 'motion' ? 'active' : ''}`}
            >
              <Activity size={14} />
              <span>Motion</span>
            </button>
            <button
              onClick={() => setActiveSection('layers')}
              className={`theme-ctrl-tab ${activeSection === 'layers' ? 'active' : ''}`}
            >
              <Layers size={14} />
              <span>Layers</span>
            </button>
            <button
              onClick={() => setActiveSection('schedule')}
              className={`theme-ctrl-tab ${activeSection === 'schedule' ? 'active' : ''}`}
            >
              <Clock size={14} />
              <span>Schedule</span>
            </button>
          </div>

          <div className="theme-ctrl-content">
            {/* 1. BACKGROUND & COLORS */}
            {activeSection === 'bg' && (
              <div className="theme-section-block">
                <label className="theme-field-label">Background Type</label>
                <div className="theme-type-pill-grid">
                  {[
                    { id: 'preset', label: 'Preset' },
                    { id: 'solid', label: 'Solid Color' },
                    { id: 'gradient', label: 'Gradient' },
                    { id: 'cosmic', label: 'Cosmic' },
                    { id: 'cinematic', label: 'Cinematic' },
                    { id: 'image', label: 'Image' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          bgType: t.id as BackgroundType,
                        }))
                      }
                      className={`theme-type-pill ${activeTheme.bgType === t.id ? 'active' : ''}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Solid Color Picker */}
                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Primary Solid Color</label>
                  <div className="theme-color-input-wrap">
                    <input
                      type="color"
                      value={activeTheme.solidColor || '#070913'}
                      onChange={(e) =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          solidColor: e.target.value,
                        }))
                      }
                      className="theme-color-picker"
                    />
                    <input
                      type="text"
                      value={activeTheme.solidColor || '#070913'}
                      onChange={(e) =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          solidColor: e.target.value,
                        }))
                      }
                      className="theme-text-input-compact"
                    />
                  </div>
                </div>

                {/* Gradient Stops & Angle */}
                <div className="theme-ctrl-row">
                  <div className="theme-ctrl-label-split">
                    <label className="theme-field-label">Gradient Angle ({activeTheme.gradient?.angle || 135}°)</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={activeTheme.gradient?.angle || 135}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        gradient: { ...prev.gradient, angle: Number(e.target.value) },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>

                {/* Overlay Vignette Control */}
                <div className="theme-ctrl-row">
                  <div className="theme-ctrl-label-split">
                    <label className="theme-field-label">
                      Readability Overlay Opacity ({Math.round((activeTheme.overlay?.opacity || 0.5) * 100)}%)
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((activeTheme.overlay?.opacity || 0.5) * 100)}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        overlay: { ...prev.overlay, opacity: Number(e.target.value) / 100 },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>
              </div>
            )}

            {/* 2. MEDIA (CUSTOM IMAGE / VIDEO) */}
            {activeSection === 'media' && (
              <div className="theme-section-block">
                <label className="theme-field-label">Custom Background Image</label>
                <div className="theme-upload-box" onClick={() => imageInputRef.current?.click()}>
                  <Upload size={22} className="theme-upload-icon" />
                  <span className="theme-upload-text">Upload JPG, PNG, WebP (Max 5MB)</span>
                  <span className="theme-upload-hint">Click to choose image file</span>
                </div>

                {activeTheme.imageUrl && (
                  <div className="theme-media-preview-box">
                    <img src={activeTheme.imageUrl} alt="Uploaded Background" className="theme-media-preview-img" />
                    <button
                      onClick={() =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          imageUrl: '',
                        }))
                      }
                      className="btn-theme-tiny-danger"
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                {/* Image adjustment sliders */}
                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Image Zoom ({activeTheme.imageSettings?.zoom || 100}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={activeTheme.imageSettings?.zoom || 100}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        imageSettings: { ...prev.imageSettings, zoom: Number(e.target.value) },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>

                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Brightness ({activeTheme.imageSettings?.brightness || 100}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    value={activeTheme.imageSettings?.brightness || 100}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        imageSettings: { ...prev.imageSettings, brightness: Number(e.target.value) },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>

                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Background Blur ({activeTheme.imageSettings?.blur || 0}px)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={activeTheme.imageSettings?.blur || 0}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        imageSettings: { ...prev.imageSettings, blur: Number(e.target.value) },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>

                {/* Custom Video Background Section */}
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="theme-field-label" style={{ margin: 0 }}>
                      Universal Video Background (MP4 / WebM $\le$ 15MB)
                    </label>
                    {activeTheme.videoUrl && (
                      <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={11} /> Video Loaded
                      </span>
                    )}
                  </div>

                  {/* Upload Dropzone */}
                  <div className="theme-upload-box" onClick={() => videoInputRef.current?.click()}>
                    <Film size={22} className="theme-upload-icon" />
                    <span className="theme-upload-text">
                      {activeTheme.videoUrl ? 'Click to Replace Video File' : 'Upload Background Video (MP4 / WebM)'}
                    </span>
                    <span className="theme-upload-hint">Direct from computer • Max 15MB • Persistent Storage</span>
                  </div>

                  {/* Real-time Upload Progress Bar */}
                  {uploadProgress && (
                    <div className="theme-upload-progress-box">
                      <div className="theme-upload-progress-header">
                        <span>Uploading Video File</span>
                        <span>{uploadProgress.percent}%</span>
                      </div>
                      <div className="theme-upload-progress-bar-bg">
                        <div
                          className="theme-upload-progress-bar-fill"
                          style={{ width: `${uploadProgress.percent}%` }}
                        />
                      </div>
                      <span className="theme-upload-progress-stage">{uploadProgress.stage}</span>
                    </div>
                  )}

                  {/* Active Video Settings & Positioning Controls */}
                  {activeTheme.videoUrl && (
                    <div className="theme-video-info-box">
                      {/* Video Metadata Badge */}
                      <div className="theme-video-meta-badge">
                        <Film size={12} />
                        <span>
                          {activeTheme.videoSettings?.orientation ? `${activeTheme.videoSettings.orientation.toUpperCase()} • ` : ''}
                          {activeTheme.videoSettings?.aspectRatio || '16:9'} •{' '}
                          {activeTheme.videoSettings?.metadata?.width || 1920}×{activeTheme.videoSettings?.metadata?.height || 1080}
                          {activeTheme.videoSettings?.metadata?.duration ? ` • ${activeTheme.videoSettings.metadata.duration}s` : ''}
                        </span>
                      </div>

                      {/* Character & Focal Alignment Presets */}
                      <div style={{ marginTop: '8px' }}>
                        <div className="theme-ctrl-label-split">
                          <label className="theme-field-label">Character & Focal Alignment</label>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {activeTheme.videoSettings?.position || '85% 50%'}
                          </span>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: 1.3 }}>
                          If your video features a character, align to the right to keep hero text readable.
                        </p>

                        <div className="theme-position-grid">
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveTheme((prev) => ({
                                ...prev,
                                videoSettings: { ...prev.videoSettings, position: '85% 50%' },
                              }))
                            }
                            className={`theme-btn-pos ${(activeTheme.videoSettings?.position || '85% 50%') === '85% 50%' ? 'active' : ''}`}
                          >
                            ⭐ Character Right (Hero)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveTheme((prev) => ({
                                ...prev,
                                videoSettings: { ...prev.videoSettings, position: '50% 50%' },
                              }))
                            }
                            className={`theme-btn-pos ${activeTheme.videoSettings?.position === '50% 50%' || activeTheme.videoSettings?.position === 'center' ? 'active' : ''}`}
                          >
                            Center (Balanced)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveTheme((prev) => ({
                                ...prev,
                                videoSettings: { ...prev.videoSettings, position: '15% 50%' },
                              }))
                            }
                            className={`theme-btn-pos ${activeTheme.videoSettings?.position === '15% 50%' ? 'active' : ''}`}
                          >
                            Character Left
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveTheme((prev) => ({
                                ...prev,
                                videoSettings: { ...prev.videoSettings, position: '50% 20%' },
                              }))
                            }
                            className={`theme-btn-pos ${activeTheme.videoSettings?.position === '50% 20%' ? 'active' : ''}`}
                          >
                            Top Focused
                          </button>
                        </div>
                      </div>

                      {/* Fine-Tuning Focal Point Sliders */}
                      <div className="theme-ctrl-row" style={{ marginTop: '6px' }}>
                        <div className="theme-ctrl-label-split">
                          <label className="theme-field-label">
                            Horizontal Offset ({parsePosition(activeTheme.videoSettings?.position).x}%)
                          </label>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parsePosition(activeTheme.videoSettings?.position).x}
                          onChange={(e) => {
                            const newX = Number(e.target.value);
                            const currentY = parsePosition(activeTheme.videoSettings?.position).y;
                            updateActiveTheme((prev) => ({
                              ...prev,
                              videoSettings: {
                                ...prev.videoSettings,
                                position: `${newX}% ${currentY}%`,
                              },
                            }));
                          }}
                          className="theme-range-input"
                        />
                      </div>

                      <div className="theme-ctrl-row">
                        <div className="theme-ctrl-label-split">
                          <label className="theme-field-label">
                            Vertical Offset ({parsePosition(activeTheme.videoSettings?.position).y}%)
                          </label>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parsePosition(activeTheme.videoSettings?.position).y}
                          onChange={(e) => {
                            const newY = Number(e.target.value);
                            const currentX = parsePosition(activeTheme.videoSettings?.position).x;
                            updateActiveTheme((prev) => ({
                              ...prev,
                              videoSettings: {
                                ...prev.videoSettings,
                                position: `${currentX}% ${newY}%`,
                              },
                            }));
                          }}
                          className="theme-range-input"
                        />
                      </div>

                      {/* Overlay Darkness Adjustment */}
                      <div className="theme-ctrl-row">
                        <div className="theme-ctrl-label-split">
                          <label className="theme-field-label">
                            Overlay Darkness ({Math.round((activeTheme.videoSettings?.darkOverlay ?? 0.45) * 100)}%)
                          </label>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round((activeTheme.videoSettings?.darkOverlay ?? 0.45) * 100)}
                          onChange={(e) =>
                            updateActiveTheme((prev) => ({
                              ...prev,
                              videoSettings: {
                                ...prev.videoSettings,
                                darkOverlay: Number(e.target.value) / 100,
                              },
                            }))
                          }
                          className="theme-range-input"
                        />
                      </div>

                      {/* Video Playback Speed */}
                      <div className="theme-ctrl-row">
                        <div className="theme-ctrl-label-split">
                          <label className="theme-field-label">
                            Playback Speed ({activeTheme.videoSettings?.speed || 1.0}x)
                          </label>
                        </div>
                        <input
                          type="range"
                          min="0.25"
                          max="2.0"
                          step="0.05"
                          value={activeTheme.videoSettings?.speed || 1.0}
                          onChange={(e) =>
                            updateActiveTheme((prev) => ({
                              ...prev,
                              videoSettings: {
                                ...prev.videoSettings,
                                speed: Number(e.target.value),
                              },
                            }))
                          }
                          className="theme-range-input"
                        />
                      </div>

                      {/* Video Action Buttons */}
                      <div className="theme-video-actions-row">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="btn-theme-tiny"
                          style={{ flex: 1 }}
                        >
                          <RefreshCw size={12} />
                          <span>Replace Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveTheme((prev) => ({
                              ...prev,
                              bgType: 'preset',
                              videoUrl: '',
                            }))
                          }
                          className="btn-theme-tiny-danger"
                          style={{ flex: 1 }}
                        >
                          <Trash2 size={12} />
                          <span>Remove Video</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. MOTION & ANIMATION STUDIO */}
            {activeSection === 'motion' && (
              <div className="theme-section-block">
                <label className="theme-field-label">Animated Motion Style</label>
                <select
                  value={activeTheme.motionType}
                  onChange={(e) =>
                    updateActiveTheme((prev) => ({
                      ...prev,
                      motionType: e.target.value as MotionType,
                    }))
                  }
                  className="theme-select-compact"
                >
                  <option value="none">None (Static Background)</option>
                  <option value="starfield">Moving Starfield</option>
                  <option value="cosmic_galaxy">Cosmic Spiral Galaxy</option>
                  <option value="aurora_lights">Aurora Borealis Lights</option>
                  <option value="floating_particles">Floating Connective Particles</option>
                  <option value="neon_waves">Neon Sine Waves</option>
                  <option value="glowing_orbs">Ambient Glowing Orbs</option>
                  <option value="interactive_particles">Interactive Mouse Particles</option>
                  <option value="lightweight_3d">Lightweight 3D Perspective Geometry</option>
                </select>

                {activeTheme.motionType === 'lightweight_3d' && (
                  <div className="theme-ctrl-row">
                    <label className="theme-field-label">3D Geometry Shape</label>
                    <select
                      value={activeTheme.motionSettings.preset3d}
                      onChange={(e) =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          motionSettings: {
                            ...prev.motionSettings,
                            preset3d: e.target.value as Preset3D,
                          },
                        }))
                      }
                      className="theme-select-compact"
                    >
                      <option value="floating_geometry">Floating 3D Polyhedron</option>
                      <option value="rotating_galaxy">3D Rotating Galaxy Disk</option>
                      <option value="orbital_particles">Orbital Spherical Particles</option>
                    </select>
                  </div>
                )}

                {/* Particle Count */}
                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Particle Density ({activeTheme.motionSettings.particleCount})</label>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    value={activeTheme.motionSettings.particleCount || 50}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        motionSettings: {
                          ...prev.motionSettings,
                          particleCount: Number(e.target.value),
                        },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>

                {/* Speed Slider */}
                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Animation Speed ({activeTheme.motionSettings.speed}x)</label>
                  <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={activeTheme.motionSettings.speed || 1}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        motionSettings: {
                          ...prev.motionSettings,
                          speed: Number(e.target.value),
                        },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>

                {/* Particle Color */}
                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Particle Accent Color</label>
                  <div className="theme-color-input-wrap">
                    <input
                      type="color"
                      value={activeTheme.motionSettings.particleColor || '#a78bfa'}
                      onChange={(e) =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          motionSettings: {
                            ...prev.motionSettings,
                            particleColor: e.target.value,
                          },
                        }))
                      }
                      className="theme-color-picker"
                    />
                    <input
                      type="text"
                      value={activeTheme.motionSettings.particleColor || '#a78bfa'}
                      onChange={(e) =>
                        updateActiveTheme((prev) => ({
                          ...prev,
                          motionSettings: {
                            ...prev.motionSettings,
                            particleColor: e.target.value,
                          },
                        }))
                      }
                      className="theme-text-input-compact"
                    />
                  </div>
                </div>

                {/* Glow Intensity */}
                <div className="theme-ctrl-row">
                  <label className="theme-field-label">Ambient Glow Intensity ({activeTheme.motionSettings.glowIntensity}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeTheme.motionSettings.glowIntensity || 40}
                    onChange={(e) =>
                      updateActiveTheme((prev) => ({
                        ...prev,
                        motionSettings: {
                          ...prev.motionSettings,
                          glowIntensity: Number(e.target.value),
                        },
                      }))
                    }
                    className="theme-range-input"
                  />
                </div>
              </div>
            )}

            {/* 4. LAYER MANAGEMENT */}
            {activeSection === 'layers' && (
              <div className="theme-section-block">
                <label className="theme-field-label">Visual Background Layers</label>
                <div className="theme-layers-list">
                  {activeTheme.layers.map((layer, idx) => (
                    <div key={layer.id} className="theme-layer-row">
                      <div className="theme-layer-title-wrap">
                        <input
                          type="checkbox"
                          checked={layer.enabled}
                          onChange={(e) =>
                            updateActiveTheme((prev) => {
                              const updatedLayers = [...prev.layers];
                              updatedLayers[idx] = { ...updatedLayers[idx], enabled: e.target.checked };
                              return { ...prev, layers: updatedLayers };
                            })
                          }
                          className="theme-checkbox"
                        />
                        <span className="theme-layer-name">{layer.name}</span>
                      </div>
                      <div className="theme-layer-opacity-wrap">
                        <span className="theme-text-xs">{Math.round(layer.opacity * 100)}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Math.round(layer.opacity * 100)}
                          onChange={(e) =>
                            updateActiveTheme((prev) => {
                              const updatedLayers = [...prev.layers];
                              updatedLayers[idx] = {
                                ...updatedLayers[idx],
                                opacity: Number(e.target.value) / 100,
                              };
                              return { ...prev, layers: updatedLayers };
                            })
                          }
                          className="theme-range-input-compact"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. THEME SCHEDULING */}
            {activeSection === 'schedule' && (
              <div className="theme-section-block">
                <label className="theme-field-label">Automated Theme Scheduling</label>
                <p className="theme-text-xs" style={{ marginBottom: '12px' }}>
                  Automatic scheduling is unavailable. Publish manually using the button below.
                </p>
                <input
                  type="datetime-local"
                  disabled
                  value={activeTheme.scheduledAt || ''}
                  onChange={(e) =>
                    updateActiveTheme((prev) => ({
                      ...prev,
                      scheduledAt: e.target.value || null,
                    }))
                  }
                  className="theme-datetime-input"
                />
                {activeTheme.scheduledAt && (
                  <span className="theme-badge-scheduled" style={{ marginTop: '8px', display: 'inline-block' }}>
                    Scheduled for: {new Date(activeTheme.scheduledAt).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================
          BOTTOM ACTIONS BAR
          =================================================================== */}
      <div className="theme-studio-bottom-bar">
        <div className="theme-bottom-left">
          <button disabled={busy} onClick={handleRestoreDefault} className="btn-theme-ghost">
            <RotateCcw size={14} />
            <span>Restore Default</span>
          </button>
          <button disabled={busy} onClick={handleRollback} className="btn-theme-ghost">
            <Undo2 size={14} />
            <span>Rollback</span>
          </button>
          <button onClick={handleDuplicate} className="btn-theme-ghost">
            <Copy size={14} />
            <span>Duplicate</span>
          </button>
        </div>

        <div className="theme-bottom-right">
          <button onClick={handleSaveDraft} disabled={busy} className="btn-theme-secondary">
            <Save size={14} />
            <span>Save Draft</span>
          </button>
          <button onClick={handlePublish} disabled={busy} className="btn-theme-publish">
            <Send size={14} />
            <span>Publish to {selectedTarget === 'global' ? 'Entire Site' : selectedTarget.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
