import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const HIGHLIGHT_WORDS = new Set([
  'ai', 'neural', 'networks', 'generative', 'deep', 'learning',
  'algorithms', 'backend', 'architectures', 'systems', 'intelligence', 'models',
  'innovation', 'problem-solving', 'transformative', 'full-stack', 'pytorch',
  'growth', 'human-centric', 'impactful'
]);

function EditorialWord({ word, progress, index, total, isHighlight }) {
  // First 4 words are readable right away as specified
  const isInitialWord = index < 4;

  // Map scroll progress across the total word count
  const start = isInitialWord ? 0 : Math.max(0.01, ((index - 3) / (total - 3)) * 0.85);
  const end = isInitialWord ? 0.02 : Math.min(1, start + 0.07);
  const approachStart = isInitialWord ? 0 : Math.max(0, start - 0.14);
  const approachMid = isInitialWord ? 0 : Math.max(0, start - 0.06);

  // Word typography opacity & subtle blur
  const textOpacity = useTransform(
    progress,
    [0, approachStart, approachMid, start, end],
    isInitialWord ? [1, 1, 1, 1, 1] : [0, 0, 0.25, 0.55, 1]
  );

  const textBlur = useTransform(
    progress,
    [approachStart, start, end],
    isInitialWord ? ['blur(0px)', 'blur(0px)', 'blur(0px)'] : ['blur(1.5px)', 'blur(0.6px)', 'blur(0px)']
  );

  // Overlay rounded placeholder block opacity & reveal sweep
  const placeholderOpacity = useTransform(
    progress,
    [approachStart, start, end],
    isInitialWord ? [0, 0, 0] : [1, 1, 0]
  );

  const placeholderScaleX = useTransform(
    progress,
    [start, end],
    isInitialWord ? [0, 0] : [1, 0]
  );

  // Progressive grayscale transition:
  const placeholderBg = useTransform(
    progress,
    [approachStart, approachMid, start],
    [
      'rgba(156, 163, 175, 0.2)',
      'rgba(156, 163, 175, 0.45)',
      'rgba(107, 114, 128, 0.72)'
    ]
  );

  return (
    <span className="editorial-word-wrap">
      <motion.span
        style={{ opacity: textOpacity, filter: textBlur }}
        className={`editorial-word-text ${isHighlight ? 'editorial-highlight' : ''}`}
      >
        {word}
      </motion.span>
      <motion.span
        className="editorial-word-placeholder"
        style={{
          opacity: placeholderOpacity,
          scaleX: placeholderScaleX,
          backgroundColor: placeholderBg,
        }}
        aria-hidden="true"
      />
    </span>
  );
}

export default function TextBoxReveal({ paragraphs, className = '' }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 85%', 'end 30%'],
  });

  const wordsList = useMemo(() => {
    const list = [];
    paragraphs.forEach((p, pIdx) => {
      const words = p.split(/\s+/).filter(Boolean);
      words.forEach((w, wIdx) => {
        const clean = w.toLowerCase().replace(/[^a-z0-9-]/g, '');
        list.push({
          word: w,
          pIdx,
          wIdx,
          isHighlight: HIGHLIGHT_WORDS.has(clean),
        });
      });
    });
    return list;
  }, [paragraphs]);

  const total = wordsList.length || 1;

  if (isMobile) {
    return (
      <div ref={containerRef} className={`editorial-reveal-container ${className}`}>
        {paragraphs.map((p, pIdx) => {
          const words = p.split(/\s+/).filter(Boolean);
          return (
            <p key={pIdx} className="editorial-reveal-paragraph">
              {words.map((w, wIdx) => {
                const clean = w.toLowerCase().replace(/[^a-z0-9-]/g, '');
                const isHighlight = HIGHLIGHT_WORDS.has(clean);
                return (
                  <span
                    key={wIdx}
                    className={`editorial-word-text ${isHighlight ? 'editorial-highlight' : ''}`}
                  >
                    {w}{' '}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`editorial-reveal-container ${className}`}>
      {paragraphs.map((p, pIdx) => {
        const pWords = wordsList.filter((item) => item.pIdx === pIdx);
        return (
          <p key={pIdx} className="editorial-reveal-paragraph">
            {pWords.map((item) => {
              const globalIdx = wordsList.indexOf(item);
              return (
                <EditorialWord
                  key={`${pIdx}-${item.wIdx}`}
                  word={item.word}
                  progress={scrollYProgress}
                  index={globalIdx}
                  total={total}
                  isHighlight={item.isHighlight}
                />
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
