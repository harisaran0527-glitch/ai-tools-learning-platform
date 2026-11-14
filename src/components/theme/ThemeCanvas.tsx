import React, { useEffect, useRef } from 'react';
import { MotionType, MotionSettings } from '../../types/theme';

interface ThemeCanvasProps {
  motionType: MotionType;
  settings: MotionSettings;
  opacity?: number;
  paused?: boolean;
  interactive?: boolean;
}

export const ThemeCanvas: React.FC<ThemeCanvasProps> = ({
  motionType,
  settings,
  opacity = 0.8,
  paused = false,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || motionType === 'none' || motionType === 'video') return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReduced = mediaQuery.matches;

    let width = 0;
    let height = 0;
    let isVisible = !document.hidden;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR at 1.5 for performance
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracker
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (interactive && settings.mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    // Visibility change handler (pauses loop when tab is hidden)
    const handleVisibility = () => {
      cancelAnimationFrame(animFrameRef.current);
      isVisible = !document.hidden;
      if (isVisible && !paused && !prefersReduced) {
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    const handleReducedMotion = () => {
      prefersReduced = mediaQuery.matches;
      handleVisibility();
    };
    mediaQuery.addEventListener('change', handleReducedMotion);

    // =========================================================================
    // PARTICLES / STARS / GEOMETRY STATE
    // =========================================================================
    const count = Math.min(Math.max(settings.particleCount || 60, 10), 200);
    const speedMultiplier = (settings.speed || 1) * 0.5;

    // Starfield state
    const stars: { x: number; y: number; z: number; size: number; alpha: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 1,
        size: Math.random() * (settings.particleSize || 2) + 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.04 + 0.01)
      });
    }

    // Constellation / Floating particles state
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; baseAlpha: number }[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * (width || 1000),
        y: Math.random() * (height || 800),
        vx: (Math.random() - 0.5) * speedMultiplier * 1.2,
        vy: (Math.random() - 0.5) * speedMultiplier * 1.2,
        radius: (Math.random() * (settings.particleSize || 2.5) + 1),
        baseAlpha: Math.random() * 0.6 + 0.3
      });
    }

    // 3D Geometry vertices (for icosahedron / octahedron)
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const icoVertices: [number, number, number][] = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    const icoEdges: [number, number][] = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
      [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
      [4, 9], [2, 4], [6, 2], [8, 6], [9, 8],
      [4, 5], [4, 11], [2, 11], [2, 10], [6, 10],
      [6, 7], [8, 7], [8, 1], [9, 1], [9, 5]
    ];

    let lastTime = performance.now();
    let angle = 0;

    // =========================================================================
    // MAIN RENDER LOOP
    // =========================================================================
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      angle += dt * speedMultiplier * 0.8;

      ctx.clearRect(0, 0, width, height);

      const color = settings.particleColor || '#a78bfa';

      // 1. STARFIELD
      if (motionType === 'starfield') {
        const cx = width / 2;
        const cy = height / 2;
        const starSpeed = speedMultiplier * 300 * dt;

        stars.forEach(star => {
          star.z -= starSpeed;
          if (star.z <= 0) {
            star.z = 1000;
            star.x = (Math.random() - 0.5) * 2000;
            star.y = (Math.random() - 0.5) * 2000;
          }
          const k = 400 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const rad = Math.max(0.6, (1 - star.z / 1000) * star.size * 2);
            const a = Math.sin(time * 0.003 * star.twinkleSpeed) * 0.3 + 0.7;
            ctx.fillStyle = color;
            ctx.globalAlpha = star.alpha * a * (settings.particleOpacity || 0.7);
            ctx.beginPath();
            ctx.arc(px, py, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 2. COSMIC GALAXY
      else if (motionType === 'cosmic_galaxy') {
        const cx = width / 2;
        const cy = height / 2;
        const arms = 3;
        const armOffset = (Math.PI * 2) / arms;

        // Glowing Core
        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140);
        coreGradient.addColorStop(0, color);
        coreGradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.3)');
        coreGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = coreGradient;
        ctx.globalAlpha = (settings.glowIntensity || 40) / 100;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.fill();

        // Spiral Arms
        const spiralCount = Math.floor(count * 1.5);
        for (let i = 0; i < spiralCount; i++) {
          const arm = i % arms;
          const r = (i / spiralCount) * Math.min(width, height) * 0.42;
          const theta = r * 0.015 + arm * armOffset + angle * 0.6;
          const px = cx + Math.cos(theta) * r;
          const py = cy + Math.sin(theta) * r * 0.65; // Perspective squish

          const pSize = Math.max(1, (1 - r / (Math.min(width, height) * 0.5)) * 3.5);
          ctx.fillStyle = i % 2 === 0 ? color : '#38bdf8';
          ctx.globalAlpha = Math.max(0.15, (1 - r / 600) * (settings.particleOpacity || 0.7));
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. AURORA LIGHTS
      else if (motionType === 'aurora_lights') {
        const waveCount = 3;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          ctx.moveTo(0, height * 0.7);

          const grad = ctx.createLinearGradient(0, height * 0.2, 0, height);
          if (w === 0) {
            grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
            grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
            grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          } else if (w === 1) {
            grad.addColorStop(0, 'rgba(139, 92, 246, 0)');
            grad.addColorStop(0.5, 'rgba(139, 92, 246, 0.28)');
            grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          } else {
            grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
            grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.22)');
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
          }

          for (let x = 0; x <= width; x += 30) {
            const freq = 0.0025;
            const y = height * 0.45 +
              Math.sin(x * freq + angle * 1.5 + w * 2) * 65 +
              Math.cos(x * freq * 0.5 + angle) * 35;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.globalAlpha = (settings.intensity || 50) / 100 * 0.85;
          ctx.fill();
        }
      }

      // 4. FLOATING PARTICLES & CONNECTIVE CONSTELLATION
      else if (motionType === 'floating_particles' || motionType === 'interactive_particles') {
        const mouse = mouseRef.current;
        const connectDist = 110;

        nodes.forEach(node => {
          // Mouse interaction (repel / attract)
          if (interactive && settings.mouseInteraction && mouse.active) {
            const dx = node.x - mouse.x;
            const dy = node.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140 && dist > 0) {
              const force = (1 - dist / 140) * (settings.mouseIntensity || 30) * 0.06;
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
            }
          }

          node.x += node.vx;
          node.y += node.vy;

          // Wrap edges
          if (node.x < -20) node.x = width + 20;
          if (node.x > width + 20) node.x = -20;
          if (node.y < -20) node.y = height + 20;
          if (node.y > height + 20) node.y = -20;

          // Render node
          ctx.fillStyle = color;
          ctx.globalAlpha = node.baseAlpha * (settings.particleOpacity || 0.7);
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw connective lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectDist) {
              ctx.globalAlpha = (1 - dist / connectDist) * 0.25 * (settings.particleOpacity || 0.7);
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // 5. NEON WAVES
      else if (motionType === 'neon_waves') {
        const lines = 4;
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;

        for (let l = 0; l < lines; l++) {
          ctx.beginPath();
          const baseOffset = (l / lines) * 70;
          for (let x = 0; x <= width; x += 15) {
            const y = height * 0.5 +
              baseOffset +
              Math.sin(x * 0.004 + angle * 2 + l) * 50 +
              Math.sin(x * 0.008 - angle) * 25;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.globalAlpha = (1 - l / lines) * 0.6 * ((settings.intensity || 50) / 100);
          ctx.stroke();
        }
      }

      // 6. GLOWING ORBS
      else if (motionType === 'glowing_orbs') {
        const orbs = [
          { xRatio: 0.25, yRatio: 0.35, r: 240, color: color, speed: 1 },
          { xRatio: 0.75, yRatio: 0.65, r: 280, color: '#38bdf8', speed: 1.2 },
          { xRatio: 0.5, yRatio: 0.8, r: 200, color: '#ec4899', speed: 0.8 }
        ];

        orbs.forEach(orb => {
          const ox = width * orb.xRatio + Math.sin(angle * orb.speed) * 90;
          const oy = height * orb.yRatio + Math.cos(angle * orb.speed * 0.8) * 70;
          const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.r);
          grad.addColorStop(0, orb.color);
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.22 * ((settings.glowIntensity || 40) / 100);
          ctx.beginPath();
          ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 7. LIGHTWEIGHT 3D PERSPECTIVE GEOMETRY (Zero Three.js dependencies)
      else if (motionType === 'lightweight_3d') {
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) * 0.22;
        const preset = settings.preset3d || 'floating_geometry';

        if (preset === 'floating_geometry') {
          // 3D rotation angles
          const ax = angle * 0.6;
          const ay = angle * 0.8;
          const cosX = Math.cos(ax), sinX = Math.sin(ax);
          const cosY = Math.cos(ay), sinY = Math.sin(ay);

          // Project icosahedron vertices
          const projected: [number, number, number][] = icoVertices.map(([vx, vy, vz]) => {
            // Rotate Y
            const x1 = vx * cosY + vz * sinY;
            const y1 = vy;
            const z1 = -vx * sinY + vz * cosY;
            // Rotate X
            const x2 = x1;
            const y2 = y1 * cosX - z1 * sinX;
            const z2 = y1 * sinX + z1 * cosX;
            // Perspective divide
            const fov = 3.5;
            const pz = z2 + 4.5;
            const projScale = (fov / pz) * scale;
            return [cx + x2 * projScale, cy + y2 * projScale, z2];
          });

          // Draw edges
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.6;
          icoEdges.forEach(([i1, i2]) => {
            const p1 = projected[i1];
            const p2 = projected[i2];
            const avgZ = (p1[2] + p2[2]) / 2;
            ctx.globalAlpha = Math.max(0.15, Math.min(1, (avgZ + 2) / 4)) * (settings.particleOpacity || 0.7);
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
          });

          // Draw vertex glowing dots
          ctx.fillStyle = '#38bdf8';
          projected.forEach(([px, py, pz]) => {
            ctx.globalAlpha = Math.max(0.2, (pz + 2) / 3.5);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        } else {
          // Orbital 3D Spheres / Particles
          const sphereCount = Math.floor(count * 0.8);
          for (let i = 0; i < sphereCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / sphereCount);
            const theta = Math.sqrt(sphereCount * Math.PI) * phi + angle;
            const sx = Math.cos(theta) * Math.sin(phi);
            const sy = Math.sin(theta) * Math.sin(phi);
            const sz = Math.cos(phi);

            // Perspective projection
            const fov = 3.0;
            const pz = sz + 3.2;
            const projScale = (fov / pz) * scale * 1.3;
            const px = cx + sx * projScale;
            const py = cy + sy * projScale * 0.8;

            const rad = Math.max(1, (sz + 1.2) * 2.2);
            ctx.fillStyle = sz > 0 ? color : '#38bdf8';
            ctx.globalAlpha = Math.max(0.1, (sz + 1.2) / 2.4) * (settings.particleOpacity || 0.7);
            ctx.beginPath();
            ctx.arc(px, py, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Parallax / Interactive default
      else {
        // Fallback smooth ambient particles
        nodes.slice(0, Math.min(count, 40)).forEach(node => {
          node.x += node.vx * 0.5;
          node.y += node.vy * 0.5;
          if (node.x < 0) node.x = width;
          if (node.x > width) node.x = 0;
          if (node.y < 0) node.y = height;
          if (node.y > height) node.y = 0;

          ctx.fillStyle = color;
          ctx.globalAlpha = node.baseAlpha * 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (!paused && !prefersReduced && isVisible) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (!paused && !prefersReduced && isVisible) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      // Render static single frame for reduced motion or paused state
      render(0);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      mediaQuery.removeEventListener('change', handleReducedMotion);
    };
  }, [motionType, settings, paused, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="theme-canvas-surface"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: settings.mouseInteraction ? 'auto' : 'none',
        opacity,
        zIndex: 1,
      }}
    />
  );
};
