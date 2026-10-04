import { useEffect, useRef } from 'react';

/**
 * CursorTrail - Minimal, elegant kinetic cursor-drawn line trail
 * Inspired by Skipper UI.
 *
 * - Only tracks within containerRef (Contact section or Footer)
 * - Kinetic path with smooth quadratic bezier curve interpolation through midpoints
 * - Automatically fades away when cursor stops moving or leaves the section
 * - Tapers smoothly from cursor head to fading tail
 * - Seamlessly adapts stroke color to light/dark themes
 * - Zero React re-renders during motion; rAF loop sleeps when idle
 */
export default function CursorTrail({ containerRef, subtle = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Accessibility & Pointer checks
    if (typeof window === 'undefined') return undefined;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReducedMotion || !canHover) return undefined;

    const canvas = canvasRef.current;
    const container = containerRef?.current;
    if (!canvas || !container) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    // Trail physics & configuration
    const TRAIL_LIFETIME = 520; // ms: lifespan of each trailing point
    const MIN_DISTANCE = 2.0; // px: minimum distance between recorded points
    const LINE_WIDTH = 1.4; // px: thin, crisp, understated line

    let points = [];
    let animId = null;
    let isAnimating = false;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // Theme detection
    const isDarkTheme = () =>
      document.documentElement.getAttribute('data-theme') === 'dark';

    // Resize canvas to match container bounds with devicePixelRatio for Retina/HiDPI sharpness
    const resizeCanvas = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation frame render loop
    const render = (now) => {
      // 1. Drop points older than TRAIL_LIFETIME
      const cutoff = now - TRAIL_LIFETIME;
      while (points.length > 0 && points[0].time < cutoff) {
        points.shift();
      }

      // 2. Clear canvas
      ctx.clearRect(0, 0, width, height);

      // If no points remain, sleep animation loop to save CPU
      if (points.length === 0) {
        isAnimating = false;
        animId = null;
        return;
      }

      // 3. Draw smooth continuous kinetic path
      if (points.length >= 2) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = LINE_WIDTH;

        const isDark = isDarkTheme();
        // Dark theme: soft white/light silver stroke; Light theme: dark slate/charcoal stroke
        const r = isDark ? 245 : 24;
        const g = isDark ? 248 : 28;
        const b = isDark ? 252 : 38;
        const maxAlpha = subtle ? (isDark ? 0.38 : 0.28) : (isDark ? 0.60 : 0.48);

        // Render each quadratic curve segment with interpolated opacity
        for (let i = 1; i < points.length; i++) {
          const pPrev = points[i - 1];
          const pCurr = points[i];

          const midX = (pPrev.x + pCurr.x) / 2;
          const midY = (pPrev.y + pCurr.y) / 2;

          let nextMidX = pCurr.x;
          let nextMidY = pCurr.y;
          if (i + 1 < points.length) {
            nextMidX = (pCurr.x + points[i + 1].x) / 2;
            nextMidY = (pCurr.y + points[i + 1].y) / 2;
          }

          // Age ratio: 0 (brand new point at cursor) to 1 (expiring point at tail)
          const ageRatio = Math.max(0, Math.min(1, (now - pCurr.time) / TRAIL_LIFETIME));
          // Non-linear organic fade out
          const alphaFactor = Math.pow(1 - ageRatio, 1.4);
          const segmentAlpha = maxAlpha * alphaFactor;

          if (segmentAlpha > 0.01) {
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${segmentAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.quadraticCurveTo(pCurr.x, pCurr.y, nextMidX, nextMidY);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // Continue animation if points remain
      animId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        animId = requestAnimationFrame(render);
      }
    };

    // Pointer event handlers on the container
    const handlePointerEnter = (e) => {
      // When cursor enters, clear old points so we NEVER draw a line connecting from outside
      points = [];
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      points.push({ x, y, time: performance.now() });
      startAnimation();
    };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      // Guard against events triggered outside bounds
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return;
      }

      // Check distance to prevent redundant clustered points
      if (points.length > 0) {
        const last = points[points.length - 1];
        const dx = x - last.x;
        const dy = y - last.y;
        if (dx * dx + dy * dy < MIN_DISTANCE * MIN_DISTANCE) {
          return;
        }
      }

      points.push({ x, y, time: now });
      startAnimation();
    };

    const handlePointerLeave = () => {
      // On leaving, do not wipe immediately; let remaining points age and fade out smoothly
      startAnimation();
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [containerRef, subtle]);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-kinetic-trail"
      aria-hidden="true"
    />
  );
}
