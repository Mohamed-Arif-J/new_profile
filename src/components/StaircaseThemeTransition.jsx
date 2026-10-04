import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';

/**
 * Skipper UI-inspired Staircase Theme Transition.
 *
 * Sweeps a solid layer of the TARGET theme color across the viewport
 * with a crisp, 90-degree stepped / staircase geometric edge.
 *
 * No diagonal wipe, no radial mask, no blur, no shadows, no rounded corners.
 * Sharp horizontal and vertical segments only.
 */
const NUM_STEPS = 11; // 11 rectangular steps across viewport height

const StaircaseThemeTransition = forwardRef(function StaircaseThemeTransition(
  { onThemeSwitch },
  ref
) {
  const [active, setActive] = useState(false);
  const [targetColor, setTargetColor] = useState('#07090c');
  const overlayRef = useRef(null);
  const isTransitioningRef = useRef(false);

  const startTransition = useCallback(
    (currentTheme, targetTheme) => {
      if (isTransitioningRef.current) return;

      // Respect prefers-reduced-motion: instantaneous theme change without transition
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        if (onThemeSwitch) onThemeSwitch(targetTheme);
        return;
      }

      isTransitioningRef.current = true;

      // Solid color of the incoming (target) theme
      const nextBgColor = targetTheme === 'dark' ? '#07090c' : '#ffffff';
      setTargetColor(nextBgColor);
      setActive(true);

      // Give React one frame to mount the overlay
      requestAnimationFrame(() => {
        const overlay = overlayRef.current;
        if (!overlay) {
          if (onThemeSwitch) onThemeSwitch(targetTheme);
          isTransitioningRef.current = false;
          setActive(false);
          return;
        }

        const stepHeight = 100 / NUM_STEPS;
        const spread = 0.32; // Diagonal stagger width across steps

        const buildStaircasePolygon = (t) => {
          const points = ['0% 0%'];

          for (let i = 0; i < NUM_STEPS; i++) {
            const frac = i / (NUM_STEPS - 1);
            // Linear progress for this individual step
            const stepProgress = t * (1 + spread) - frac * spread;
            const x = Math.max(0, Math.min(100, stepProgress * 100));
            const yTop = (i * stepHeight).toFixed(3);
            const yBottom = ((i + 1) * stepHeight).toFixed(3);

            // Step horizontal and vertical boundaries (strictly 90-degree corners)
            points.push(`${x.toFixed(2)}% ${yTop}%`);
            points.push(`${x.toFixed(2)}% ${yBottom}%`);
          }

          points.push('0% 100%');
          return `polygon(${points.join(', ')})`;
        };

        // Start off-screen (0% coverage)
        overlay.style.clipPath = buildStaircasePolygon(0);

        const animState = { progress: 0 };

        gsap.to(animState, {
          progress: 1,
          duration: 0.82,
          ease: 'power3.inOut',
          onUpdate: () => {
            if (overlay) {
              overlay.style.clipPath = buildStaircasePolygon(animState.progress);
            }
          },
          onComplete: () => {
            // Step 5: Switch actual application theme at full coverage to prevent flash
            if (onThemeSwitch) onThemeSwitch(targetTheme);

            // Small buffer to guarantee DOM theme repaint is painted under the solid overlay
            setTimeout(() => {
              if (overlay) {
                overlay.style.clipPath = '';
              }
              setActive(false);
              isTransitioningRef.current = false;
            }, 40);
          },
        });
      });
    },
    [onThemeSwitch]
  );

  useImperativeHandle(ref, () => ({
    startTransition,
  }));

  if (!active) return null;

  return (
    <div
      ref={overlayRef}
      className="skipper-staircase-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: targetColor,
        zIndex: 99999,
        pointerEvents: 'none',
        willChange: 'clip-path',
      }}
      aria-hidden="true"
    />
  );
});

export default StaircaseThemeTransition;
