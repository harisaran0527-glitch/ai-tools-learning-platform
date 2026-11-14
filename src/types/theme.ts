export type PageTarget =
  | 'global'
  | 'home'
  | 'catalog'
  | 'tool_detail'
  | 'prompting'
  | 'prompting_practice'
  | 'admin'
  | 'admin_login'
  | 'assessment';

export type BackgroundType =
  | 'solid'
  | 'gradient'
  | 'image'
  | 'preset'
  | 'cinematic'
  | 'cosmic'
  | 'transparent'
  | 'video';

export type MotionType =
  | 'none'
  | 'starfield'
  | 'cosmic_galaxy'
  | 'aurora_lights'
  | 'floating_particles'
  | 'neon_waves'
  | 'animated_gradients'
  | 'glowing_orbs'
  | 'parallax'
  | 'interactive_particles'
  | 'video'
  | 'lightweight_3d';

export type Preset3D =
  | 'rotating_galaxy'
  | 'orbital_particles'
  | 'floating_geometry'
  | 'glowing_spheres';

export type LayerType = 'background' | 'motion' | 'particles' | 'overlay' | 'glow';

export interface GradientStop {
  color: string;
  position: number; // 0 to 100
}

export interface GradientConfig {
  angle: number; // 0 to 360
  stops: GradientStop[];
}

export interface ImageSettings {
  size: 'cover' | 'contain' | 'auto';
  position: string; // e.g. "center", "top center"
  zoom: number; // percentage 50 - 200
  brightness: number; // percentage 0 - 200
  contrast: number; // percentage 0 - 200
  blur: number; // px 0 - 30
  opacity: number; // percentage 0 - 100
}

export interface VideoMetadata {
  width?: number;
  height?: number;
  duration?: number;
  fileSize?: number;
  fileName?: string;
  orientation?: 'landscape' | 'portrait' | 'square' | 'auto';
  aspectRatio?: string;
}

export interface VideoSettings {
  loop: boolean;
  autoplay: boolean;
  muted: boolean;
  speed: number; // 0.25 - 2.0
  staticFallbackUrl: string;
  darkOverlay: number; // 0 - 1
  position?: string; // e.g. "85% 50%" (character right), "center", "left center", etc.
  fit?: 'cover' | 'contain'; // default 'cover'
  orientation?: 'landscape' | 'portrait' | 'square' | 'auto';
  aspectRatio?: string;
  metadata?: VideoMetadata;
}

export interface MotionSettings {
  speed: number; // 0.1 - 5.0
  direction: 'up' | 'down' | 'left' | 'right' | 'radial';
  intensity: number; // 1 - 100
  particleCount: number; // 10 - 300
  particleSize: number; // 1 - 10
  particleColor: string;
  particleOpacity: number; // 0.1 - 1.0
  glowIntensity: number; // 0 - 100
  blur: number; // 0 - 30
  duration: number; // seconds for cycle
  smoothness: number; // 1 - 100
  parallaxDepth: number; // 0 - 100
  mouseInteraction: boolean;
  mouseIntensity: number; // 0 - 100
  preset3d: Preset3D;
}

export interface OverlayConfig {
  enabled: boolean;
  color: string;
  opacity: number; // 0 - 1
  blur: number; // 0 - 20
}

export interface LayerConfig {
  id: string;
  type: LayerType;
  name: string;
  enabled: boolean;
  opacity: number; // 0 - 1
  blendMode: 'normal' | 'screen' | 'multiply' | 'overlay' | 'plus-lighter';
}

export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  isPreset?: boolean;
  pageTarget: PageTarget;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  bgType: BackgroundType;
  solidColor: string;
  gradient: GradientConfig;
  imageUrl: string;
  imageSettings: ImageSettings;
  videoUrl: string;
  videoSettings: VideoSettings;
  motionType: MotionType;
  motionSettings: MotionSettings;
  overlay: OverlayConfig;
  layers: LayerConfig[];
}

export interface ThemeBinding {
  pageTarget: PageTarget;
  themeId: string;
  publishedConfig: ThemeConfig;
  previousConfig?: ThemeConfig | null;
  publishedAt: string;
  publishedBy?: string;
}
