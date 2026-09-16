import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  ExternalLink,
  Github,
  Download,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { portfolio } from '../data/portfolio.js';

function ProjectSlide({ project, index, total, progress, isActive }) {
  const N = total;
  const center = index / (N - 1);
  const span = 1 / (N - 1);

  // Partition the interval so each project has a rock-solid hold zone
  // and transitions cleanly without text ghosting
  const enterStart = index === 0 ? -0.1 : center - span * 0.65;
  const enterEnd = index === 0 ? 0 : center - span * 0.35;
  const exitStart = index === N - 1 ? 1 : center + span * 0.35;
  const exitEnd = index === N - 1 ? 1.1 : center + span * 0.65;

  const opacity = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [22, 0, 0, -22]
  );

  const scale = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [1.03, 1, 1, 0.97]
  );

  const filterBlur = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    ['blur(4px)', 'blur(0px)', 'blur(0px)', 'blur(4px)']
  );

  const contentY = useTransform(
    progress,
    [enterStart, enterEnd, exitStart, exitEnd],
    [14, 0, 0, -14]
  );

  const liveLink = project.links?.find((l) => l.type === 'external');
  const sourceLink = project.links?.find((l) => l.type === 'github');
  const downloadLink = project.links?.find((l) => l.type === 'download');

  return (
    <motion.div
      className="showcase-slide"
      style={{
        opacity,
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 2 : 1,
      }}
    >
      {/* Top: Project Eyebrow + Large Centered Title */}
      <motion.div
        className="showcase-title-wrap"
        style={{ y: contentY, filter: filterBlur }}
      >
        <div className="showcase-badge">
          <span
            className="showcase-badge-dot"
            style={{ backgroundColor: project.accent }}
          />
          <span className="showcase-badge-category">{project.category}</span>
          <span className="showcase-badge-num">
            0{index + 1} / 0{total}
          </span>
        </div>

        <h3 className="showcase-project-title">{project.title}</h3>
      </motion.div>

      {/* Center: Large Project Preview Card */}
      <motion.div
        className="showcase-preview-frame"
        style={{ scale, filter: filterBlur }}
      >
        <img
          src={project.image}
          alt={project.title}
          className="showcase-preview-img"
          draggable={false}
          loading={index < 2 ? 'eager' : 'lazy'}
        />
        <div
          className="showcase-glow-border"
          style={{
            borderColor: `${project.accent}33`,
            boxShadow: `0 20px 60px -15px ${project.accent}22`,
          }}
        />
      </motion.div>

      {/* Bottom: Project Details & Action Buttons */}
      <motion.div
        className="showcase-details-wrap"
        style={{ y: contentY }}
      >
        <div className="showcase-desc-col">
          <p className="showcase-tagline" style={{ color: project.accent }}>
            {project.tagline}
          </p>
          <p className="showcase-feature-highlight">
            {project.features?.[0] || ''}
          </p>
          <div className="showcase-tech-chips">
            {project.tech?.slice(0, 5).map((t) => (
              <span key={t} className="showcase-chip">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="showcase-actions-col">
          {liveLink && (
            <a
              href={liveLink.href}
              target="_blank"
              rel="noreferrer"
              className="showcase-btn showcase-btn-primary"
              style={{
                backgroundColor: project.accent,
                color: '#07090c',
              }}
            >
              <span>Live Demo</span>
              <ArrowUpRight size={15} />
            </a>
          )}
          {sourceLink && (
            <a
              href={sourceLink.href}
              target="_blank"
              rel="noreferrer"
              className="showcase-btn showcase-btn-secondary"
            >
              <Github size={15} />
              <span>Source Code</span>
            </a>
          )}
          {downloadLink && (
            <a
              href={downloadLink.href}
              target="_blank"
              rel="noreferrer"
              className="showcase-btn showcase-btn-secondary"
            >
              <Download size={15} />
              <span>Download</span>
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects({ lenis }) {
  const projects = useMemo(() => portfolio.projects, []);
  const total = projects.length;

  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure dedicated scroll progress across the projects section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Butter-smooth spring for scrubbed physics without jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    mass: 0.15,
    restDelta: 0.0005,
  });

  // Track active project index with minimal re-renders
  useEffect(() => {
    const unsub = smoothProgress.on('change', (val) => {
      const idx = Math.min(total - 1, Math.max(0, Math.round(val * (total - 1))));
      setActiveIndex((prev) => (prev !== idx ? idx : prev));
    });
    return () => unsub();
  }, [smoothProgress, total]);

  // Click navigation: smoothly scrolls to target project's scroll position
  const scrollToProject = useCallback(
    (idx) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const sectionTop = currentScrollY + rect.top;
      const sectionHeight = el.offsetHeight;
      const windowH = window.innerHeight;

      const scrollableDistance = sectionHeight - windowH;
      const targetScroll = sectionTop + (idx / (total - 1)) * scrollableDistance;

      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(targetScroll, { duration: 1.2 });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    },
    [lenis, total]
  );

  return (
    <section
      id="projects"
      ref={containerRef}
      className="projects-scroll-section"
      style={{
        height: `${Math.max(350, (total - 1) * 110 + 100)}vh`,
      }}
    >
      {/* Sticky Viewport Stage */}
      <div className="projects-sticky-viewport">
        {/* Editorial Section Eyebrow (top-left) */}
        <div className="showcase-top-bar">
          <div className="showcase-eyebrow">
            <Sparkles size={14} className="eyebrow-sparkle" />
            <span>SELECTED WORKS</span>
            <span className="showcase-counter">
              0{activeIndex + 1} / 0{total}
            </span>
          </div>
        </div>

        {/* Center Stage: Stack of Slides with Continuous Transitions */}
        <div className="showcase-center-stage">
          {projects.map((project, idx) => (
            <ProjectSlide
              key={project.id}
              project={project}
              index={idx}
              total={total}
              progress={smoothProgress}
              isActive={activeIndex === idx}
            />
          ))}
        </div>

        {/* Right-Side Editorial Project Index Navigation */}
        <nav
          className="showcase-right-index"
          aria-label="Projects navigation"
        >
          <div className="showcase-index-header">
            <span>MY PROJECTS</span>
            <div className="showcase-index-line" />
          </div>

          <ul className="showcase-index-list">
            {projects.map((proj, idx) => {
              const isActive = activeIndex === idx;
              return (
                <li key={proj.id}>
                  <button
                    type="button"
                    onClick={() => scrollToProject(idx)}
                    className={`showcase-index-btn ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className="showcase-index-num">0{idx + 1}</span>
                    <span className="showcase-index-name">{proj.title}</span>
                    {isActive && (
                      <motion.span
                        layoutId="active-indicator-dot"
                        className="showcase-index-dot"
                        style={{ backgroundColor: proj.accent }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
