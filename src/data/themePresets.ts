import { ThemeConfig } from '../types/theme';

export const ORIGINAL_AI_VERSE_PRESET: ThemeConfig = {
  id: 'preset-original-default',
  name: 'Original AI Verse Premium — Default',
  description: 'The approved immutable AI Verse dark navy theme with anime hero background and violet accents.',
  isPreset: true,
  pageTarget: 'global',
  status: 'published',
  bgType: 'preset',
  solidColor: '#070913',
  gradient: {
    angle: 135,
    stops: [
      { color: '#070913', position: 0 },
      { color: '#0d1224', position: 50 },
      { color: '#070913', position: 100 }
    ]
  },
  imageUrl: '/images/anime-ai-hero.jpg',
  imageSettings: {
    size: 'cover',
    position: 'center',
    zoom: 100,
    brightness: 100,
    contrast: 100,
    blur: 0,
    opacity: 100
  },
  videoUrl: '',
  videoSettings: {
    loop: true,
    autoplay: true,
    muted: true,
    speed: 1,
    staticFallbackUrl: '/images/anime-ai-hero.jpg',
    darkOverlay: 0.4
  },
  motionType: 'none',
  motionSettings: {
    speed: 1,
    direction: 'up',
    intensity: 50,
    particleCount: 50,
    particleSize: 2,
    particleColor: '#a78bfa',
    particleOpacity: 0.6,
    glowIntensity: 35,
    blur: 0,
    duration: 20,
    smoothness: 80,
    parallaxDepth: 25,
    mouseInteraction: true,
    mouseIntensity: 30,
    preset3d: 'rotating_galaxy'
  },
  overlay: {
    enabled: true,
    color: '#070913',
    opacity: 0.45,
    blur: 0
  },
  layers: [
    { id: 'layer-bg', type: 'background', name: 'Original Anime Background', enabled: true, opacity: 1, blendMode: 'normal' },
    { id: 'layer-motion', type: 'motion', name: 'Motion Effects', enabled: false, opacity: 0.8, blendMode: 'screen' },
    { id: 'layer-overlay', type: 'overlay', name: 'Readability Vignette', enabled: true, opacity: 0.5, blendMode: 'multiply' },
    { id: 'layer-glow', type: 'glow', name: 'Violet Ambient Glow', enabled: true, opacity: 0.35, blendMode: 'screen' }
  ]
};

export const COSMIC_UNIVERSE_PRESET: ThemeConfig = {
  id: 'preset-cosmic-universe',
  name: 'Cosmic Universe',
  description: 'Deep space cosmic background with moving starfield, spiral galaxy core, and cyan-violet cosmic dust.',
  isPreset: true,
  pageTarget: 'global',
  status: 'draft',
  bgType: 'cosmic',
  solidColor: '#050714',
  gradient: {
    angle: 145,
    stops: [
      { color: '#030511', position: 0 },
      { color: '#090e29', position: 50 },
      { color: '#040615', position: 100 }
    ]
  },
  imageUrl: '',
  imageSettings: {
    size: 'cover',
    position: 'center',
    zoom: 100,
    brightness: 90,
    contrast: 110,
    blur: 0,
    opacity: 100
  },
  videoUrl: '',
  videoSettings: {
    loop: true,
    autoplay: true,
    muted: true,
    speed: 1,
    staticFallbackUrl: '',
    darkOverlay: 0.5
  },
  motionType: 'cosmic_galaxy',
  motionSettings: {
    speed: 1.2,
    direction: 'radial',
    intensity: 75,
    particleCount: 120,
    particleSize: 2.2,
    particleColor: '#38bdf8',
    particleOpacity: 0.75,
    glowIntensity: 65,
    blur: 1,
    duration: 25,
    smoothness: 85,
    parallaxDepth: 45,
    mouseInteraction: true,
    mouseIntensity: 50,
    preset3d: 'rotating_galaxy'
  },
  overlay: {
    enabled: true,
    color: '#050714',
    opacity: 0.4,
    blur: 0
  },
  layers: [
    { id: 'layer-bg', type: 'background', name: 'Deep Space Field', enabled: true, opacity: 1, blendMode: 'normal' },
    { id: 'layer-motion', type: 'motion', name: 'Cosmic Galaxy & Stars', enabled: true, opacity: 0.85, blendMode: 'screen' },
    { id: 'layer-overlay', type: 'overlay', name: 'Vignette Darkening', enabled: true, opacity: 0.4, blendMode: 'multiply' },
    { id: 'layer-glow', type: 'glow', name: 'Cyan & Violet Nebula', enabled: true, opacity: 0.5, blendMode: 'screen' }
  ]
};

export const MIDNIGHT_LUXURY_PRESET: ThemeConfig = {
  id: 'preset-midnight-luxury',
  name: 'Midnight Luxury',
  description: 'Ultra-dark obsidian finish with drifting golden/amber light particles and subtle dark vignette.',
  isPreset: true,
  pageTarget: 'global',
  status: 'draft',
  bgType: 'cinematic',
  solidColor: '#050508',
  gradient: {
    angle: 180,
    stops: [
      { color: '#08080d', position: 0 },
      { color: '#030305', position: 100 }
    ]
  },
  imageUrl: '',
  imageSettings: {
    size: 'cover',
    position: 'center',
    zoom: 100,
    brightness: 85,
    contrast: 115,
    blur: 0,
    opacity: 100
  },
  videoUrl: '',
  videoSettings: {
    loop: true,
    autoplay: true,
    muted: true,
    speed: 0.8,
    staticFallbackUrl: '',
    darkOverlay: 0.6
  },
  motionType: 'floating_particles',
  motionSettings: {
    speed: 0.7,
    direction: 'up',
    intensity: 45,
    particleCount: 45,
    particleSize: 2.5,
    particleColor: '#f59e0b',
    particleOpacity: 0.55,
    glowIntensity: 50,
    blur: 0,
    duration: 30,
    smoothness: 90,
    parallaxDepth: 20,
    mouseInteraction: true,
    mouseIntensity: 25,
    preset3d: 'orbital_particles'
  },
  overlay: {
    enabled: true,
    color: '#030305',
    opacity: 0.5,
    blur: 0
  },
  layers: [
    { id: 'layer-bg', type: 'background', name: 'Obsidian Slate', enabled: true, opacity: 1, blendMode: 'normal' },
    { id: 'layer-motion', type: 'motion', name: 'Amber Dust Particles', enabled: true, opacity: 0.7, blendMode: 'screen' },
    { id: 'layer-overlay', type: 'overlay', name: 'Cinematic Shadows', enabled: true, opacity: 0.5, blendMode: 'multiply' },
    { id: 'layer-glow', type: 'glow', name: 'Warm Luxury Halo', enabled: true, opacity: 0.25, blendMode: 'screen' }
  ]
};

export const AURORA_GRADIENT_PRESET: ThemeConfig = {
  id: 'preset-aurora-gradient',
  name: 'Aurora Gradient',
  description: 'Undulating organic light ribbons with shimmering emerald, cyan, and violet waves.',
  isPreset: true,
  pageTarget: 'global',
  status: 'draft',
  bgType: 'gradient',
  solidColor: '#070a1a',
  gradient: {
    angle: 120,
    stops: [
      { color: '#060919', position: 0 },
      { color: '#0a1628', position: 40 },
      { color: '#081c20', position: 75 },
      { color: '#070a1a', position: 100 }
    ]
  },
  imageUrl: '',
  imageSettings: {
    size: 'cover',
    position: 'center',
    zoom: 100,
    brightness: 100,
    contrast: 100,
    blur: 0,
    opacity: 100
  },
  videoUrl: '',
  videoSettings: {
    loop: true,
    autoplay: true,
    muted: true,
    speed: 1,
    staticFallbackUrl: '',
    darkOverlay: 0.35
  },
  motionType: 'aurora_lights',
  motionSettings: {
    speed: 0.9,
    direction: 'radial',
    intensity: 65,
    particleCount: 70,
    particleSize: 3,
    particleColor: '#10b981',
    particleOpacity: 0.65,
    glowIntensity: 70,
    blur: 2,
    duration: 18,
    smoothness: 90,
    parallaxDepth: 35,
    mouseInteraction: true,
    mouseIntensity: 35,
    preset3d: 'glowing_spheres'
  },
  overlay: {
    enabled: true,
    color: '#070a1a',
    opacity: 0.35,
    blur: 0
  },
  layers: [
    { id: 'layer-bg', type: 'background', name: 'Polar Night Sky', enabled: true, opacity: 1, blendMode: 'normal' },
    { id: 'layer-motion', type: 'motion', name: 'Aurora Borealis Ribbons', enabled: true, opacity: 0.8, blendMode: 'screen' },
    { id: 'layer-overlay', type: 'overlay', name: 'Soft Contrast Mask', enabled: true, opacity: 0.35, blendMode: 'multiply' },
    { id: 'layer-glow', type: 'glow', name: 'Emerald Radiance', enabled: true, opacity: 0.45, blendMode: 'screen' }
  ]
};

export const GALAXY_NEBULA_PRESET: ThemeConfig = {
  id: 'preset-galaxy-nebula',
  name: 'Galaxy Nebula',
  description: 'Deep indigo multi-layered nebula clouds with rotating cosmic geometry and starry particles.',
  isPreset: true,
  pageTarget: 'global',
  status: 'draft',
  bgType: 'cosmic',
  solidColor: '#0a0d24',
  gradient: {
    angle: 160,
    stops: [
      { color: '#07091a', position: 0 },
      { color: '#131138', position: 55 },
      { color: '#09081f', position: 100 }
    ]
  },
  imageUrl: '',
  imageSettings: {
    size: 'cover',
    position: 'center',
    zoom: 100,
    brightness: 95,
    contrast: 105,
    blur: 0,
    opacity: 100
  },
  videoUrl: '',
  videoSettings: {
    loop: true,
    autoplay: true,
    muted: true,
    speed: 1,
    staticFallbackUrl: '',
    darkOverlay: 0.45
  },
  motionType: 'lightweight_3d',
  motionSettings: {
    speed: 1.1,
    direction: 'radial',
    intensity: 70,
    particleCount: 90,
    particleSize: 2,
    particleColor: '#c084fc',
    particleOpacity: 0.7,
    glowIntensity: 60,
    blur: 1,
    duration: 22,
    smoothness: 85,
    parallaxDepth: 40,
    mouseInteraction: true,
    mouseIntensity: 45,
    preset3d: 'floating_geometry'
  },
  overlay: {
    enabled: true,
    color: '#0a0d24',
    opacity: 0.4,
    blur: 0
  },
  layers: [
    { id: 'layer-bg', type: 'background', name: 'Interstellar Indigo', enabled: true, opacity: 1, blendMode: 'normal' },
    { id: 'layer-motion', type: 'motion', name: '3D Geometric Nebula', enabled: true, opacity: 0.85, blendMode: 'screen' },
    { id: 'layer-overlay', type: 'overlay', name: 'Deep Space Mask', enabled: true, opacity: 0.4, blendMode: 'multiply' },
    { id: 'layer-glow', type: 'glow', name: 'Purple Cosmic Glow', enabled: true, opacity: 0.5, blendMode: 'screen' }
  ]
};

export const DARK_MINIMAL_PRESET: ThemeConfig = {
  id: 'preset-dark-minimal',
  name: 'Dark Minimal',
  description: 'Understated, distraction-free slate navy designed for high productivity and zero motion.',
  isPreset: true,
  pageTarget: 'global',
  status: 'draft',
  bgType: 'solid',
  solidColor: '#080a14',
  gradient: {
    angle: 180,
    stops: [
      { color: '#090c18', position: 0 },
      { color: '#070912', position: 100 }
    ]
  },
  imageUrl: '',
  imageSettings: {
    size: 'cover',
    position: 'center',
    zoom: 100,
    brightness: 100,
    contrast: 100,
    blur: 0,
    opacity: 100
  },
  videoUrl: '',
  videoSettings: {
    loop: false,
    autoplay: false,
    muted: true,
    speed: 1,
    staticFallbackUrl: '',
    darkOverlay: 0.2
  },
  motionType: 'none',
  motionSettings: {
    speed: 0,
    direction: 'up',
    intensity: 0,
    particleCount: 0,
    particleSize: 1,
    particleColor: '#64748b',
    particleOpacity: 0.2,
    glowIntensity: 0,
    blur: 0,
    duration: 0,
    smoothness: 100,
    parallaxDepth: 0,
    mouseInteraction: false,
    mouseIntensity: 0,
    preset3d: 'rotating_galaxy'
  },
  overlay: {
    enabled: false,
    color: '#080a14',
    opacity: 0,
    blur: 0
  },
  layers: [
    { id: 'layer-bg', type: 'background', name: 'Solid Slate Base', enabled: true, opacity: 1, blendMode: 'normal' },
    { id: 'layer-motion', type: 'motion', name: 'Motion Disabled', enabled: false, opacity: 0, blendMode: 'normal' },
    { id: 'layer-overlay', type: 'overlay', name: 'Clean Overlay', enabled: false, opacity: 0, blendMode: 'normal' },
    { id: 'layer-glow', type: 'glow', name: 'Minimal Glow', enabled: false, opacity: 0, blendMode: 'normal' }
  ]
};

export const BUILT_IN_PRESETS: ThemeConfig[] = [
  ORIGINAL_AI_VERSE_PRESET,
  COSMIC_UNIVERSE_PRESET,
  MIDNIGHT_LUXURY_PRESET,
  AURORA_GRADIENT_PRESET,
  GALAXY_NEBULA_PRESET,
  DARK_MINIMAL_PRESET
];
