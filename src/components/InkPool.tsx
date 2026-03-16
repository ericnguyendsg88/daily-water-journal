import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Platform } from '@/lib/platforms';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
  life: number;
  diffusion: number;
}

interface InkPoolProps {
  platforms: Platform[];
  values: Record<string, number>;
  width?: number;
  height?: number;
  className?: string;
  interactive?: boolean;
}

export interface InkPoolHandle {
  getSnapshot: () => string;
}

const InkPool = forwardRef<InkPoolHandle, InkPoolProps>(({ platforms, values, className, interactive = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const prevValuesRef = useRef<Record<string, number>>({});
  const timeRef = useRef(0);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL('image/png', 0.6) : '';
    }
  }));

  const spawnParticles = useCallback((cx: number, cy: number, color: string, count: number, canvas: HTMLCanvasElement) => {
    const particles = particlesRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.3;
      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        maxRadius: Math.random() * 30 + 15,
        color,
        opacity: Math.random() * 0.4 + 0.3,
        life: 1,
        diffusion: Math.random() * 0.02 + 0.005,
      });
    }
    // Cap particles
    if (particles.length > 800) {
      particlesRef.current = particles.slice(-800);
    }
  }, []);

  // Spawn particles when values change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    platforms.forEach((platform, idx) => {
      const val = values[platform.id] || 0;
      const prev = prevValuesRef.current[platform.id] || 0;
      const diff = val - prev;
      if (diff > 0) {
        // Spread drops across the canvas based on platform index
        const cols = 3;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = (col + 0.5) * (w / cols) + (Math.random() - 0.5) * 60;
        const cy = (row + 0.5) * (h / 2) + h * 0.2 + (Math.random() - 0.5) * 40;
        const count = Math.ceil(diff / 5) * 3;
        spawnParticles(cx, cy, platform.color, count, canvas);
      }
    });

    prevValuesRef.current = { ...values };
  }, [values, platforms, spawnParticles]);

  // Also seed initial particles based on current values
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    platforms.forEach((platform, idx) => {
      const val = values[platform.id] || 0;
      if (val > 0) {
        const cols = 3;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const cx = (col + 0.5) * (w / cols);
        const cy = (row + 0.5) * (h / 2) + h * 0.2;
        const count = Math.ceil(val / 10) * 2;
        spawnParticles(cx, cy, platform.color, count, canvas);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Mouse interaction
  useEffect(() => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouseRef.current = {
        x: (clientX - rect.left) * window.devicePixelRatio,
        y: (clientY - rect.top) * window.devicePixelRatio,
        active: true,
      };
    };
    const handleLeave = () => { mouseRef.current.active = false; };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('touchend', handleLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('touchend', handleLeave);
    };
  }, [interactive]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += 0.016;

      // Fade trail
      ctx.fillStyle = 'rgba(3, 7, 18, 0.03)';
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Mouse force
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150 * 0.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Subtle drift
        p.vx += Math.sin(timeRef.current + p.y * 0.01) * 0.02;
        p.vy += Math.cos(timeRef.current + p.x * 0.01) * 0.02;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;

        // Diffuse
        p.radius = Math.min(p.radius + p.diffusion, p.maxRadius);
        p.life -= 0.0008;
        p.opacity = Math.max(p.life * 0.5, 0.02);

        // Wrap
        if (p.x < -p.radius) p.x = w + p.radius;
        if (p.x > w + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = h + p.radius;
        if (p.y > h + p.radius) p.y = -p.radius;

        // Draw
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, p.color.replace(')', ` / ${p.opacity})`).replace('hsl(', 'hsl('));
        gradient.addColorStop(1, p.color.replace(')', ' / 0)').replace('hsl(', 'hsl('));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Remove dead particles
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial fill
    ctx.fillStyle = 'rgb(3, 7, 18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className || ''}`}
      style={{ background: 'rgb(3, 7, 18)' }}
    />
  );
});

InkPool.displayName = 'InkPool';
export default InkPool;
