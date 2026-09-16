import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Authentic retro cartoon illustrated stickers (SVG decals)
const StickerSVGs = [
  // 1. Retro Alien Head
  function AlienSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="alien-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#alien-shadow)">
          {/* Antenna */}
          <path d="M50 24 L50 12" stroke="#18181b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="10" r="5" fill="#facc15" stroke="#18181b" strokeWidth="3" />
          {/* Alien Head */}
          <path
            d="M50 20 C24 20 18 42 22 64 C25 78 40 90 50 90 C60 90 75 78 78 64 C82 42 76 20 50 20 Z"
            fill="#a3e635"
            stroke="#18181b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Eyes */}
          <ellipse cx="36" cy="52" rx="8" ry="12" transform="rotate(-15 36 52)" fill="#18181b" />
          <circle cx="38" cy="48" r="2.5" fill="#ffffff" />
          <ellipse cx="64" cy="52" rx="8" ry="12" transform="rotate(15 64 52)" fill="#18181b" />
          <circle cx="62" cy="48" r="2.5" fill="#ffffff" />
          {/* Third Eye */}
          <circle cx="50" cy="38" r="5.5" fill="#f43f5e" stroke="#18181b" strokeWidth="2.5" />
          <circle cx="51" cy="36.5" r="1.5" fill="#ffffff" />
          {/* Smirk */}
          <path d="M44 72 Q50 77 56 72" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  },

  // 2. Melting Quirky Smiley Face
  function SmileySticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="smiley-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#smiley-shadow)">
          {/* Melting face body */}
          <path
            d="M50 15 C28 15 15 32 15 54 C15 72 26 86 36 86 C41 86 42 76 46 76 C50 76 52 89 59 89 C67 89 68 79 73 79 C78 79 81 87 86 82 C90 76 85 45 85 45 C85 28 72 15 50 15 Z"
            fill="#facc15"
            stroke="#18181b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Eyes */}
          <ellipse cx="35" cy="42" rx="4.5" ry="8" fill="#18181b" />
          <ellipse cx="65" cy="40" rx="4.5" ry="7" fill="#18181b" />
          {/* Dripping Smile */}
          <path
            d="M32 60 Q50 78 68 58"
            stroke="#18181b"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Rosy Cheeks */}
          <circle cx="26" cy="58" r="4" fill="#fb7185" />
          <circle cx="74" cy="56" r="4" fill="#fb7185" />
        </g>
      </svg>
    );
  },

  // 3. Cosmic Eyeball
  function EyeballSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="eye-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#eye-shadow)">
          {/* Eye Ball */}
          <circle cx="50" cy="50" r="35" fill="#f8fafc" stroke="#18181b" strokeWidth="4" />
          {/* Red squiggly veins */}
          <path d="M19 46 Q28 44 33 50" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 58 Q28 62 34 56" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          <path d="M81 48 Q72 52 67 46" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
          {/* Iris */}
          <circle cx="50" cy="50" r="18" fill="#a855f7" stroke="#18181b" strokeWidth="3" />
          {/* Pupil */}
          <circle cx="50" cy="50" r="9" fill="#18181b" />
          {/* Shine */}
          <circle cx="46" cy="45" r="3.5" fill="#ffffff" />
          <circle cx="53" cy="53" r="1.5" fill="#ffffff" />
        </g>
      </svg>
    );
  },

  // 4. Retro 70s Psychedelic Daisy Flower
  function FlowerSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="flower-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#flower-shadow)">
          {/* Petals */}
          <circle cx="50" cy="22" r="14" fill="#f472b6" stroke="#18181b" strokeWidth="3" />
          <circle cx="74" cy="36" r="14" fill="#38bdf8" stroke="#18181b" strokeWidth="3" />
          <circle cx="74" cy="64" r="14" fill="#4ade80" stroke="#18181b" strokeWidth="3" />
          <circle cx="50" cy="78" r="14" fill="#f472b6" stroke="#18181b" strokeWidth="3" />
          <circle cx="26" cy="64" r="14" fill="#38bdf8" stroke="#18181b" strokeWidth="3" />
          <circle cx="26" cy="36" r="14" fill="#4ade80" stroke="#18181b" strokeWidth="3" />
          {/* Center */}
          <circle cx="50" cy="50" r="17" fill="#facc15" stroke="#18181b" strokeWidth="4" />
          {/* Cute Face */}
          <circle cx="44" cy="48" r="2.5" fill="#18181b" />
          <circle cx="56" cy="48" r="2.5" fill="#18181b" />
          <path d="M46 54 Q50 58 54 54" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  },

  // 5. Comic Starburst / Bang
  function StarburstSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="star-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#star-shadow)">
          <path
            d="M50 10 L58 35 L84 25 L72 48 L96 60 L70 68 L74 94 L52 78 L34 94 L36 68 L10 60 L32 46 L20 22 L44 34 Z"
            fill="#06b6d4"
            stroke="#18181b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Core shine */}
          <circle cx="50" cy="52" r="10" fill="#fef08a" stroke="#18181b" strokeWidth="3" />
          <circle cx="48" cy="50" r="3" fill="#ffffff" />
        </g>
      </svg>
    );
  },

  // 6. Ringed Retro Planet
  function PlanetSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="planet-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#planet-shadow)">
          {/* Planet Back Arc */}
          <circle cx="50" cy="50" r="26" fill="#ec4899" stroke="#18181b" strokeWidth="4" />
          {/* Ring */}
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="14"
            transform="rotate(-22 50 50)"
            fill="none"
            stroke="#fde047"
            strokeWidth="7"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="14"
            transform="rotate(-22 50 50)"
            fill="none"
            stroke="#18181b"
            strokeWidth="3"
          />
          {/* Front Craters */}
          <circle cx="42" cy="46" r="4.5" fill="#be185d" />
          <circle cx="58" cy="58" r="3" fill="#be185d" />
          {/* Sparkles */}
          <path d="M78 22 L80 28 L86 30 L80 32 L78 38 L76 32 L70 30 L76 28 Z" fill="#ffffff" stroke="#18181b" strokeWidth="1.5" />
        </g>
      </svg>
    );
  },

  // 7. Golden Lightning Bolt
  function LightningSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="bolt-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="3" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#bolt-shadow)">
          {/* Drop shadow shape */}
          <path
            d="M58 8 L26 52 L48 52 L36 92 L76 44 L52 44 Z"
            fill="#18181b"
            transform="translate(4, 4)"
          />
          {/* Bolt */}
          <path
            d="M58 8 L26 52 L48 52 L36 92 L76 44 L52 44 Z"
            fill="#facc15"
            stroke="#18181b"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Inner highlight */}
          <path d="M54 18 L34 50 L46 50" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  },

  // 8. Retro Beetle / Bug
  function BeetleSticker() {
    return (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="retro-sticker-svg">
        <filter id="bug-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" floodOpacity="0.25" />
        </filter>
        <g filter="url(#bug-shadow)">
          {/* Antennae */}
          <path d="M42 26 Q36 14 30 18" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M58 26 Q64 14 70 18" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Head */}
          <circle cx="50" cy="30" r="10" fill="#18181b" />
          {/* Eyes */}
          <circle cx="45" cy="27" r="2.5" fill="#ffffff" />
          <circle cx="55" cy="27" r="2.5" fill="#ffffff" />
          {/* Body */}
          <ellipse cx="50" cy="58" rx="26" ry="28" fill="#f87171" stroke="#18181b" strokeWidth="4" />
          {/* Center line */}
          <path d="M50 36 L50 86" stroke="#18181b" strokeWidth="3" />
          {/* Spots */}
          <circle cx="38" cy="52" r="5" fill="#18181b" />
          <circle cx="62" cy="52" r="5" fill="#18181b" />
          <circle cx="40" cy="70" r="4" fill="#18181b" />
          <circle cx="60" cy="70" r="4" fill="#18181b" />
        </g>
      </svg>
    );
  },
];

const SingleSticker = memo(function SingleSticker({ item, onExpire }) {
  const StickerComp = StickerSVGs[item.stickerIndex % StickerSVGs.length];

  useEffect(() => {
    const timer = setTimeout(() => {
      onExpire(item.id);
    }, item.lifetime || 1400);
    return () => clearTimeout(timer);
  }, [item.id, item.lifetime, onExpire]);

  return (
    <motion.div
      className="retro-cursor-sticker"
      style={{
        left: item.x,
        top: item.y,
        width: item.size,
        height: item.size,
      }}
      initial={{
        scale: 0.2,
        opacity: 0,
        rotate: item.rotation - 12,
        x: '-50%',
        y: '-50%',
      }}
      animate={{
        scale: [0.2, 1.1, 1],
        opacity: 1,
        rotate: item.rotation,
        x: '-50%',
        y: '-50%',
      }}
      exit={{
        opacity: 0,
        scale: 0.82,
        y: '-65%',
        transition: { duration: 0.28, ease: 'easeOut' },
      }}
      transition={{
        duration: 0.32,
        ease: [0.34, 1.56, 0.64, 1], // Playful bouncy spring-pop
      }}
    >
      <StickerComp />
    </motion.div>
  );
});

export default function StickerCursorTrail({ containerRef }) {
  const [stickers, setStickers] = useState([]);
  const lastSpawnPos = useRef({ x: -999, y: -999 });
  const nextId = useRef(0);
  const MAX_STICKERS = 20;
  const MIN_DISTANCE = 42; // Euclidean pixels before next sticker spawn

  const handleExpire = (id) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    // Only disable on touch-only devices without a fine mouse pointer
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(pointer: fine)').matches
    ) {
      return undefined;
    }

    const container = containerRef.current;
    if (!container) return undefined;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Distance check from previous spawn
      const dx = x - lastSpawnPos.current.x;
      const dy = y - lastSpawnPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= MIN_DISTANCE) {
        lastSpawnPos.current = { x, y };

        // Varied sizes: small (32-40px), medium (46-64px), large (72-88px)
        const sizeCategory = Math.random();
        let size;
        if (sizeCategory < 0.35) {
          size = Math.floor(Math.random() * (40 - 32 + 1)) + 32;
        } else if (sizeCategory < 0.85) {
          size = Math.floor(Math.random() * (64 - 46 + 1)) + 46;
        } else {
          size = Math.floor(Math.random() * (88 - 72 + 1)) + 72; // Occasional hero sticker
        }

        const rotation = Math.floor(Math.random() * 41) - 20; // -20deg to +20deg
        const stickerIndex = Math.floor(Math.random() * StickerSVGs.length);
        const lifetime = Math.floor(Math.random() * (1800 - 1200 + 1)) + 1200;

        const newSticker = {
          id: nextId.current++,
          x,
          y,
          size,
          rotation,
          stickerIndex,
          lifetime,
        };

        setStickers((prev) => {
          const next = [...prev, newSticker];
          if (next.length > MAX_STICKERS) {
            return next.slice(next.length - MAX_STICKERS);
          }
          return next;
        });
      }
    };

    const handleMouseLeave = () => {
      // Reset spawn pos when leaving Education
      lastSpawnPos.current = { x: -999, y: -999 };
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  return (
    <div className="education-sticker-overlay" aria-hidden="true">
      <AnimatePresence>
        {stickers.map((item) => (
          <SingleSticker key={item.id} item={item} onExpire={handleExpire} />
        ))}
      </AnimatePresence>
    </div>
  );
}
