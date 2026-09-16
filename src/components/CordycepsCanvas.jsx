import { useEffect, useRef } from 'react';

export default function CordycepsCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = Math.min(180, window.innerWidth * 0.2));
    let height = (canvas.height = window.innerHeight);

    let scrollProgress = 0;
    let targetProgress = 0;

    const handleResize = () => {
      width = canvas.width = Math.min(180, window.innerWidth * 0.2);
      height = canvas.height = window.innerHeight;
    };

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = total > 0 ? window.scrollY / total : 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Procedural Tendril Branches Generation
    const branchCount = 28;
    const branches = [];

    for (let i = 0; i < branchCount; i++) {
      const normY = i / branchCount;
      const angle = (Math.random() - 0.5) * 1.2;
      const length = 30 + Math.random() * 60;
      branches.push({
        normY,
        angle,
        length,
        subBranches: [
          { angleOffset: 0.5, lengthFactor: 0.6 },
          { angleOffset: -0.4, lengthFactor: 0.5 },
        ],
        sporeSize: 2 + Math.random() * 3,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Floating Spores
    const spores = Array.from({ length: 20 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
    }));

    let time = 0;

    const render = () => {
      time += 0.03;
      scrollProgress += (targetProgress - scrollProgress) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const maxGrowthY = scrollProgress * height + 120;

      // Draw Main Trunk Tendril along left edge
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 3;

      const trunkGradient = ctx.createLinearGradient(0, 0, 0, height);
      trunkGradient.addColorStop(0, '#ff1744');
      trunkGradient.addColorStop(0.5, '#d50000');
      trunkGradient.addColorStop(1, '#990000');

      ctx.strokeStyle = trunkGradient;
      ctx.shadowColor = 'rgba(255, 23, 68, 0.75)';
      ctx.shadowBlur = 12;

      let currentX = 24;
      ctx.moveTo(currentX, 0);

      const stepHeight = 12;
      const steps = Math.min(Math.floor(maxGrowthY / stepHeight), Math.floor(height / stepHeight));

      for (let s = 1; s <= steps; s++) {
        const y = s * stepHeight;
        const wiggle = Math.sin(y * 0.02 + time * 0.8) * 14 + Math.cos(y * 0.04) * 6;
        currentX = 24 + wiggle;
        ctx.lineTo(currentX, y);
      }
      ctx.stroke();

      // Draw Tendril Branches & Glowing Red Spore Nodes
      branches.forEach((b) => {
        const bY = b.normY * height;
        if (bY <= maxGrowthY) {
          const trunkWiggle = Math.sin(bY * 0.02 + time * 0.8) * 14 + Math.cos(bY * 0.04) * 6;
          const startX = 24 + trunkWiggle;

          // Main branch
          const endX = startX + Math.cos(b.angle) * b.length;
          const endY = bY + Math.sin(b.angle) * b.length;

          ctx.beginPath();
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = 'rgba(255, 45, 85, 0.75)';
          ctx.moveTo(startX, bY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Sub branches
          b.subBranches.forEach((sub) => {
            const subEndX = endX + Math.cos(b.angle + sub.angleOffset) * (b.length * sub.lengthFactor);
            const subEndY = endY + Math.sin(b.angle + sub.angleOffset) * (b.length * sub.lengthFactor);

            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 90, 115, 0.55)';
            ctx.moveTo(endX, endY);
            ctx.lineTo(subEndX, subEndY);
            ctx.stroke();

            // Tip Spore Node
            const pulse = Math.sin(time * 2 + b.pulsePhase) * 0.5 + 1;
            ctx.beginPath();
            ctx.arc(subEndX, subEndY, b.sporeSize * pulse, 0, Math.PI * 2);
            ctx.fillStyle = '#ff2a5f';
            ctx.shadowColor = '#ff2a5f';
            ctx.shadowBlur = 10;
            ctx.fill();
          });

          // Branch Tip Glow Node
          const pulse = Math.sin(time * 3 + b.pulsePhase) * 0.4 + 1;
          ctx.beginPath();
          ctx.arc(endX, endY, (b.sporeSize + 1) * pulse, 0, Math.PI * 2);
          ctx.fillStyle = '#ff1744';
          ctx.shadowColor = '#ff1744';
          ctx.shadowBlur = 12;
          ctx.fill();
        }
      });

      // Render Floating Red Spores
      spores.forEach((sp) => {
        sp.y += sp.vy;
        sp.x += sp.vx;

        if (sp.y < 0) sp.y = height;
        if (sp.x < 0 || sp.x > width) sp.x = Math.random() * width;

        if (sp.y <= maxGrowthY + 50) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 35, 70, ${sp.alpha})`;
          ctx.shadowColor = 'rgba(255, 35, 70, 0.9)';
          ctx.shadowBlur = 8;
          ctx.fill();
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="cordyceps-canvas" />;
}
