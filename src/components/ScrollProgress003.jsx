import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const BASE_SECTIONS = [
  { id: 'home', label: 'Home', offsetPct: 0 },
  { id: 'about', label: 'About', offsetPct: 0.11 },
  { id: 'projects', label: 'Projects', offsetPct: 0.33 },
  { id: 'skills', label: 'Skills', offsetPct: 0.6 },
  { id: 'education', label: 'Education', offsetPct: 0.78 },
  { id: 'contact', label: 'Contact', offsetPct: 0.98 },
];

export default function ScrollProgress003({ lenis }) {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  const [percentage, setPercentage] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolling, setIsScrolling] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [sections, setSections] = useState(BASE_SECTIONS);
  const scrollTimeout = useRef(null);

  const measureSections = useCallback(() => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    setSections(
      BASE_SECTIONS.map((section) => {
        const el = document.getElementById(section.id);
        if (!el) return section;

        return {
          ...section,
          offsetPct: Math.min(1, Math.max(0, el.offsetTop / maxScroll)),
        };
      })
    );
  }, []);

  useEffect(() => {
    measureSections();

    const timers = [
      setTimeout(measureSections, 500),
      setTimeout(measureSections, 1500),
      setTimeout(measureSections, 4200),
    ];

    window.addEventListener('resize', measureSections);

    return () => {
      window.removeEventListener('resize', measureSections);
      timers.forEach(clearTimeout);
    };
  }, [measureSections]);

  // Track scroll percentage and current active section
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const pct = Math.min(100, Math.max(0, Math.round(latest * 100)));
      setPercentage(pct);
      setIsScrolling(true);

      // Determine active section
      for (let i = sections.length - 1; i >= 0; i--) {
        if (latest >= sections[i].offsetPct - 0.04) {
          setActiveSection(sections[i].id);
          break;
        }
      }

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 700);
    });

    return () => {
      unsubscribe();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [scrollYProgress, sections]);

  // Navigate to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fillScaleY = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <aside
      className={`scroll-progress-003-container ${isScrolling ? 'is-scrolling' : ''}`}
      aria-label="Vertical scroll progress indicator"
    >
      <div className="sp003-wrapper">
        {/* Animated Percentage Display with smooth clip-path liquid reveal (Skipper UI) */}
        <div
          className="sp003-badge"
          onClick={() => scrollToSection('home')}
          title="Click to return to top"
        >
          {/* Base Layer: muted numerals */}
          <div className="sp003-badge-base" aria-hidden="true">
            <span className="sp003-number">{percentage}</span>
            <span className="sp003-symbol">%</span>
          </div>

          {/* Liquid Fill Layer with smooth clip-path wipe animation */}
          <div
            className="sp003-badge-fill"
            style={{
              clipPath: `inset(${100 - percentage}% 0% 0% 0%)`,
            }}
            aria-hidden="true"
          >
            <span className="sp003-number">{percentage}</span>
            <span className="sp003-symbol">%</span>
          </div>

          {/* Glow border ring */}
          <div className="sp003-badge-ring" />
        </div>

        {/* Vertical Rail & Progress Fill */}
        <div className="sp003-rail">
          {/* Background Track */}
          <div className="sp003-track-bg" />

          {/* Animated Fill Bar */}
          <motion.div
            className="sp003-track-fill"
            style={{
              scaleY: fillScaleY,
              transformOrigin: 'top',
            }}
          />

          {/* Milestone Section Markers */}
          <div className="sp003-milestones">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`sp003-milestone-btn ${isActive ? 'is-active' : ''}`}
                  style={{ top: `${sec.offsetPct * 100}%` }}
                  onClick={() => scrollToSection(sec.id)}
                  onMouseEnter={() => setHoveredSection(sec.label)}
                  onMouseLeave={() => setHoveredSection(null)}
                  aria-label={`Jump to ${sec.label} section`}
                >
                  <span className="sp003-milestone-dot" />
                  {hoveredSection === sec.label && (
                    <span className="sp003-tooltip">{sec.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
