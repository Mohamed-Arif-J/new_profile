import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return undefined;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const xDotSet = gsap.quickSetter(dot, 'x', 'px');
    const yDotSet = gsap.quickSetter(dot, 'y', 'px');
    const xRingSet = gsap.quickSetter(ring, 'x', 'px');
    const yRingSet = gsap.quickSetter(ring, 'y', 'px');
    const rotationRingSet = gsap.quickSetter(ring, 'rotation', 'deg');
    const scaleXRingSet = gsap.quickSetter(ring, 'scaleX');
    const scaleYRingSet = gsap.quickSetter(ring, 'scaleY');

    let velX = 0;
    let velY = 0;

    const handleMouseMove = (e) => {
      velX = e.clientX - mouse.x;
      velY = e.clientY - mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      xDotSet(mouse.x);
      yDotSet(mouse.y);

      // Handle magnetic pull elements
      const target = e.target.closest('[data-magnetic]');
      if (target) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        gsap.to(target, {
          x: distanceX * 0.28,
          y: distanceY * 0.28,
          duration: 0.35,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeaveMagnetic = (e) => {
      const target = e.target.closest('[data-magnetic]');
      if (target) {
        gsap.to(target, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1.2, 0.4)',
        });
      }
    };

    const handleMouseOver = (e) => {
      const hoverTarget = e.target.closest('a, button, [data-cursor], .project-card, .skill-card, .focus-card');
      if (hoverTarget) {
        setIsHovered(true);
        const customText = hoverTarget.getAttribute('data-cursor');
        setCursorText(customText || '');
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseLeaveMagnetic);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    const ticker = gsap.ticker.add(() => {
      const dt = 1 - (1 - 0.22) ** gsap.ticker.deltaRatio();
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      xRingSet(pos.x);
      yRingSet(pos.y);

      // Speed velocity deformation
      const speed = Math.sqrt(velX * velX + velY * velY);
      const angle = (Math.atan2(velY, velX) * 180) / Math.PI;
      const stretch = Math.min(speed * 0.02, 0.35);

      if (speed > 1) {
        rotationRingSet(angle);
        scaleXRingSet(1 + stretch);
        scaleYRingSet(1 - stretch);
      } else {
        scaleXRingSet(1);
        scaleYRingSet(1);
      }

      velX *= 0.8;
      velY *= 0.8;
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseLeaveMagnetic);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <div className="custom-cursor-wrapper">
      <div ref={dotRef} className={`cursor-dot ${isClicking ? 'is-clicking' : ''}`} />
      <div
        ref={ringRef}
        className={`cursor-ring ${isHovered ? 'is-hovered' : ''} ${cursorText ? 'has-text' : ''}`}
      >
        {cursorText && <span className="cursor-text">{cursorText}</span>}
      </div>
    </div>
  );
}
