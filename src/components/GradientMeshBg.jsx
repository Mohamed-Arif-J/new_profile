import { useEffect, useRef } from 'react';

/**
 * Lando Norris–inspired gradient mesh background.
 * Subtle noise-textured radial gradient orbs that float slowly.
 */
export default function GradientMeshBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Soft floating gradient orbs
    const orbs = [
      { x: 0.2, y: 0.3, r: 0.45, color: [170, 139, 255], speed: 0.0003 },
      { x: 0.7, y: 0.6, r: 0.4, color: [84, 224, 214], speed: 0.00025 },
      { x: 0.5, y: 0.8, r: 0.35, color: [255, 122, 159], speed: 0.00035 },
    ];

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        const cx = (orb.x + Math.sin(time * orb.speed) * 0.08) * width;
        const cy = (orb.y + Math.cos(time * orb.speed * 1.3) * 0.06) * height;
        const radius = orb.r * Math.min(width, height);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, `rgba(${orb.color.join(',')}, 0.08)`);
        gradient.addColorStop(0.5, `rgba(${orb.color.join(',')}, 0.03)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="gradient-mesh-bg" />;
}
