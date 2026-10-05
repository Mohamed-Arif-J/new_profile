import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AnimeScrollbar
 * Inspired by Skiper UI (skiper1) and the iconic Anime.js landing page scrollbar:
 * - Capsule / pill track with micro tick marks (ladder rungs)
 * - Smooth animated pill thumb that glides with scroll position
 * - Draggable thumb & clickable track for instant navigation
 * - Floating snippet preview card on hover/drag showing current active project architecture
 * - Fully responsive, theme-adaptive (Dark & Light mode)
 */
export default function AnimeScrollbar({ containerRef, items = [], activeIndex = 0 }) {
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverSnippet, setHoverSnippet] = useState(null);
  const trackRef = useRef(null);
  const dragStartYRef = useRef(0);
  const dragStartProgressRef = useRef(0);

  // Sync scrollbar progress from container scroll event
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = Math.min(1, Math.max(0, container.scrollTop / maxScroll));
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Check again if content renders dynamically
    const ro = new ResizeObserver(handleScroll);
    ro.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      ro.disconnect();
    };
  }, [containerRef, items]);

  // Scroll container to a target progress (0 to 1)
  const scrollToRatio = useCallback(
    (ratio) => {
      const container = containerRef?.current;
      if (!container) return;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const targetScroll = Math.max(0, Math.min(maxScroll, ratio * maxScroll));
      container.scrollTo({ top: targetScroll, behavior: isDragging ? 'auto' : 'smooth' });
    },
    [containerRef, isDragging]
  );

  // Handle click on the track to jump to position
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, clickY / rect.height));
    scrollToRatio(ratio);
  };

  // Drag thumb handlers
  const handleThumbPointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartProgressRef.current = scrollProgress;

    const handlePointerMove = (moveEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const deltaY = moveEvent.clientY - dragStartYRef.current;
      const deltaRatio = deltaY / rect.height;
      const newRatio = Math.max(0, Math.min(1, dragStartProgressRef.current + deltaRatio));
      scrollToRatio(newRatio);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Determine current project under scroll
  const currentProjectIdx = Math.min(
    items.length - 1,
    Math.max(0, Math.round(scrollProgress * (items.length - 1)))
  );
  const currentProject = items[currentProjectIdx] || items[activeIndex] || items[0];

  // Number of tick marks (rungs) on the ladder
  const TICK_COUNT = 24;

  return (
    <div
      className={`anime-scrollbar-root ${isDragging ? 'is-dragging' : ''} ${isHovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (currentProject) setHoverSnippet(currentProject);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverSnippet(null);
      }}
      aria-label="Anime.js style interactive scrollbar"
    >
      {/* Floating Code/Snippet Card inspired by Skiper 1 */}
      <AnimatePresence>
        {(isHovered || isDragging) && currentProject && (
          <motion.div
            className="anime-scrollbar-card"
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              top: `${Math.max(12, Math.min(88, scrollProgress * 100))}%`,
            }}
          >
            <div className="anime-card-header">
              <span className="anime-card-tag">// Architecture</span>
              <span className="anime-card-num">
                {String(currentProjectIdx + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
              </span>
            </div>
            <div className="anime-card-code">
              <span className="code-keyword">const</span>{' '}
              <span className="code-var">{currentProject.title.replace(/\s+/g, '')}</span>{' '}
              <span className="code-op">=</span>{' '}
              <span className="code-fn">{`projects[${currentProjectIdx}]`}</span>;
            </div>
            <div className="anime-card-category">{currentProject.category}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track Container */}
      <div
        ref={trackRef}
        className="anime-scrollbar-track"
        onClick={handleTrackClick}
        title="Scroll project index"
      >
        {/* Ladder Tick Marks */}
        <div className="anime-scrollbar-ticks" aria-hidden="true">
          {Array.from({ length: TICK_COUNT }).map((_, i) => {
            const tickRatio = i / (TICK_COUNT - 1);
            const isNearThumb = Math.abs(tickRatio - scrollProgress) < 0.08;
            return (
              <span
                key={i}
                className={`anime-tick ${isNearThumb ? 'is-active' : ''}`}
                style={{
                  top: `${tickRatio * 100}%`,
                }}
              />
            );
          })}
        </div>

        {/* Animated Glow Pill Slider Thumb */}
        <div
          className="anime-scrollbar-thumb"
          style={{
            top: `${scrollProgress * 100}%`,
            transform: 'translateY(-50%)',
          }}
          onPointerDown={handleThumbPointerDown}
        >
          <div className="anime-thumb-pill" />
          <div className="anime-thumb-glow" />
        </div>
      </div>
    </div>
  );
}
