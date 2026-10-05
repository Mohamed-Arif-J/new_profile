import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Download,
  Sparkles,
  Layers,
  RotateCcw,
  Code2,
} from 'lucide-react';
import { portfolio } from '../data/portfolio.js';
import CursorTrail from './CursorTrail.jsx';
import Project3DOverview from './Project3DOverview.jsx';
import AnimeScrollbar from './AnimeScrollbar.jsx';

/**
 * CentralIdleFigure
 * The interactive artistic focal point displayed when NO project is active.
 * Reacts subtly to cursor movement with gentle parallax, rotation, and breathing scale.
 */
function CentralIdleFigure({ mousePos, isMobile }) {
  // Parallax transform values (clamped to 5-15px translate, 1-3deg rotate)
  const translateX = isMobile ? 0 : mousePos.x * 14;
  const translateY = isMobile ? 0 : mousePos.y * 14;
  const rotateDeg = isMobile ? 0 : mousePos.x * 2.5;
  const scaleVal = isMobile ? 1 : 1 + Math.min(0.03, (Math.abs(mousePos.x) + Math.abs(mousePos.y)) * 0.015);

  return (
    <motion.div
      className="editorial-idle-figure"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transform: `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) rotate(${rotateDeg.toFixed(2)}deg) scale(${scaleVal.toFixed(3)})`,
      }}
      aria-label="Interactive central figure. Hover or select a project to explore."
    >
      {/* Outer Rotating Celestial Orbit */}
      <div className="idle-orbit-ring" aria-hidden="true">
        <svg viewBox="0 0 360 360" className="idle-orbit-svg">
          <circle cx="180" cy="180" r="168" className="idle-orbit-circle-outer" />
          <circle cx="180" cy="180" r="144" className="idle-orbit-circle-dashed" />
          <circle cx="180" cy="180" r="110" className="idle-orbit-circle-inner" />
          {/* Degree Ticks */}
          <line x1="180" y1="6" x2="180" y2="18" className="idle-orbit-tick" />
          <line x1="180" y1="342" x2="180" y2="354" className="idle-orbit-tick" />
          <line x1="6" y1="180" x2="18" y2="180" className="idle-orbit-tick" />
          <line x1="342" y1="180" x2="354" y2="180" className="idle-orbit-tick" />
        </svg>
      </div>

      {/* Isometric Dimensional Crystalline Core */}
      <div className="idle-core-crystal" aria-hidden="true">
        <svg viewBox="0 0 200 200" className="idle-crystal-svg">
          <defs>
            <linearGradient id="crystalGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#aa8bff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#84cc16" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="crystalCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Center Glow */}
          <circle cx="100" cy="100" r="70" fill="url(#crystalCenterGlow)" />

          {/* Outer Isometric Hexagon */}
          <polygon
            points="100,28 162,64 162,136 100,172 38,136 38,64"
            className="idle-crystal-poly outer"
            stroke="url(#crystalGlow)"
          />
          {/* Inner Isometric Cube Lines */}
          <line x1="100" y1="28" x2="100" y2="100" className="idle-crystal-edge" />
          <line x1="162" y1="136" x2="100" y2="100" className="idle-crystal-edge" />
          <line x1="38" y1="136" x2="100" y2="100" className="idle-crystal-edge" />
          {/* Central Pulsing Beacon */}
          <circle cx="100" cy="100" r="5" className="idle-crystal-node" />
          <circle cx="100" cy="100" r="14" className="idle-crystal-pulse" />
        </svg>
      </div>

      {/* Central Editorial Typography & Status Prompt */}
      <div className="idle-text-block">
        <span className="idle-eyebrow">
          <Sparkles size={13} className="idle-sparkle-icon" />
          <span>PORTFOLIO EXHIBITION · 12 ARCHITECTURES</span>
        </span>
        <h3 className="idle-main-title">Mohamed Arif J</h3>
        <p className="idle-tagline">
          Systems · Deep Learning · Creative Software
        </p>

        <div className="idle-interactive-pill">
          <span className="idle-pulse-dot" />
          <span className="idle-pill-text">Select or hover a project from the index</span>
        </div>

        {/* Technical Coordinate Indicators */}
        <div className="idle-tech-coords">
          <span>INDEX 01—12</span>
          <span className="idle-coord-sep">/</span>
          <span>CUDA · PYTORCH · FASTAPI · REACT</span>
          <span className="idle-coord-sep">/</span>
          <span>LATENCY 0.8ms</span>
        </div>
      </div>

      {/* Floating Corner Crosshair Brackets */}
      <div className="idle-corner top-left" aria-hidden="true">+</div>
      <div className="idle-corner top-right" aria-hidden="true">+</div>
      <div className="idle-corner bottom-left" aria-hidden="true">+</div>
      <div className="idle-corner bottom-right" aria-hidden="true">+</div>
    </motion.div>
  );
}

/**
 * ProjectCollageShowcase
 * The editorial collage composition displayed when a project is active.
 * Recreates the feeling of the reference video:
 * - Large central title
 * - Multi-block art-directed image collage (hero, vertical macro crop, technical highlight card)
 * - Negative space allowing the background stroke animation to flow through
 * - Clear project narrative description, tech stack, and interactive action buttons
 */
function ProjectCollageShowcase({ project, index, total, onReset, mousePos, isMobile }) {
  const liveLink = project.links?.find((l) => l.type === 'external');
  const sourceLink = project.links?.find((l) => l.type === 'github');
  const downloadLink = project.links?.find((l) => l.type === 'download');

  // Subtle coordinate shift for collage depth layers
  const heroShiftX = isMobile ? 0 : mousePos.x * 12;
  const heroShiftY = isMobile ? 0 : mousePos.y * 12;
  const cropShiftX = isMobile ? 0 : mousePos.x * -16;
  const cropShiftY = isMobile ? 0 : mousePos.y * -16;

  return (
    <motion.div
      key={project.id}
      className="editorial-showcase-container"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18, transition: { duration: 0.35 } }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ==============================================================
          LAYER 2 — IMAGE COMPOSITION (Collage of art-directed blocks)
          Negative space between frames lets Layer 1 stroke show through
          ============================================================== */}
      <div className="editorial-collage-stage" aria-hidden="true">
        {/* Block 1: Main Primary Hero Visual */}
        <div
          className="collage-frame hero-frame"
          style={{
            transform: `translate3d(${heroShiftX.toFixed(1)}px, ${heroShiftY.toFixed(1)}px, 0)`,
            borderColor: `${project.accent}33`,
            boxShadow: `0 24px 70px -15px ${project.accent}22`,
          }}
        >
          <div className="collage-frame-header">
            <span className="frame-dot" style={{ backgroundColor: project.accent }} />
            <span className="frame-label">{project.category}</span>
            <span className="frame-id">0{index + 1} / 12</span>
          </div>

          <div className="collage-media-wrap">
            <img
              src={project.image}
              alt={project.title}
              className="collage-hero-img"
              loading="eager"
            />
            <div className="collage-media-overlay" />
          </div>

          <div className="frame-corner c-tl">+</div>
          <div className="frame-corner c-tr">+</div>
          <div className="frame-corner c-bl">+</div>
          <div className="frame-corner c-br">+</div>
        </div>

        {/* Block 2: Vertical Secondary Macro / Perspective Crop */}
        <div
          className="collage-frame macro-crop-frame"
          style={{
            transform: `translate3d(${cropShiftX.toFixed(1)}px, ${cropShiftY.toFixed(1)}px, 0)`,
            borderColor: `${project.accent}26`,
          }}
        >
          <div className="macro-media-wrap">
            <img
              src={project.image}
              alt={`${project.title} detailed architectural view`}
              className="macro-crop-img"
              loading="lazy"
            />
            <div className="macro-crop-scrim" />
          </div>
          <div className="macro-tag">
            <span className="macro-tag-num">P.{index + 1}</span>
            <span className="macro-tag-label">INTERFACE DETAIL</span>
          </div>
        </div>

        {/* Block 3: Technical Highlight Badge Floating Card */}
        <div
          className="collage-frame tech-spec-frame"
          style={{
            transform: `translate3d(${(heroShiftX * 0.7).toFixed(1)}px, ${(heroShiftY * 0.7).toFixed(1)}px, 0)`,
          }}
        >
          <div className="spec-badge-header">
            <Code2 size={13} style={{ color: project.accent }} />
            <span>CORE ARCHITECTURE</span>
          </div>
          <p className="spec-badge-text">
            {project.features?.[0] || project.tagline}
          </p>
          <div className="spec-badge-pills">
            {project.tech?.slice(0, 3).map((t) => (
              <span key={t} className="spec-pill">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ==============================================================
          LAYER 3 — TEXT / PROJECT INFORMATION & INTERACTIVE CONTROLS
          Sitting cleanly above the image composition
          ============================================================== */}
      <div className="editorial-info-overlay">
        {/* Large Central Project Title Header */}
        <div className="showcase-title-block">
          <div className="showcase-meta-row">
            <span
              className="showcase-accent-pill"
              style={{
                borderColor: `${project.accent}55`,
                color: project.accent,
                backgroundColor: `${project.accent}12`,
              }}
            >
              <span
                className="showcase-accent-dot"
                style={{ backgroundColor: project.accent }}
              />
              {project.category}
            </span>
            <span className="showcase-index-tag">
              ARCHITECTURE 0{index + 1} OF {total}
            </span>
          </div>

          <h3
            className="showcase-project-name"
            style={{
              textShadow: `0 0 35px ${project.accent}20`,
            }}
          >
            {project.title}
          </h3>

          <p className="showcase-tagline">{project.tagline}</p>
        </div>

        {/* Narrative Description & Action Card */}
        <div className="showcase-narrative-card">
          <div className="narrative-content">
            <h4 className="narrative-heading">System Overview</h4>
            <p className="narrative-description">
              {project.features?.[0]}{' '}
              {project.features?.[1] ? `${project.features[1]}` : ''}
            </p>

            {/* Tech Stack Chips */}
            <div className="showcase-tech-row">
              <span className="tech-row-label">TECH:</span>
              <div className="tech-chips-wrap">
                {project.tech?.map((tech) => (
                  <span key={tech} className="tech-chip">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Action Links */}
          <div className="showcase-actions-row">
            {liveLink && (
              <a
                href={liveLink.href}
                target="_blank"
                rel="noreferrer"
                className="showcase-action-btn primary"
                style={{
                  backgroundColor: project.accent,
                  borderColor: project.accent,
                  color: '#06080c',
                }}
                data-magnetic
              >
                <span>Live Project</span>
                <ArrowUpRight size={15} />
              </a>
            )}

            {sourceLink && (
              <a
                href={sourceLink.href}
                target="_blank"
                rel="noreferrer"
                className="showcase-action-btn secondary"
                data-magnetic
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
                className="showcase-action-btn secondary"
                data-magnetic
              >
                <Download size={15} />
                <span>Download</span>
              </a>
            )}

            {/* Return to Overview / Idle Figure Button */}
            <button
              type="button"
              className="showcase-action-btn reset"
              onClick={onReset}
              title="Return to central figure overview"
              aria-label="Return to central figure overview"
              data-magnetic
            >
              <RotateCcw size={14} />
              <span>Overview</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Projects
 * Main Section Component
 * Layer 1: Existing animated background stroke (ScrollStroke) runs behind
 * Layer 2: Project interaction & images (Collage + Central Idle Figure)
 * Layer 3: Text / Project Information
 * Interaction Layer: Cursor trail canvas
 */
export default function Projects({ lenis, theme: propsTheme }) {
  const sectionRef = useRef(null);
  const navRailListRef = useRef(null);
  const projectsList = portfolio.projects;

  // Track current active theme (Dark / Light)
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (propsTheme) return propsTheme;
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (propsTheme) {
      setCurrentTheme(propsTheme);
    } else {
      const observer = new MutationObserver(() => {
        const t = document.documentElement.getAttribute('data-theme') || 'light';
        setCurrentTheme(t);
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => observer.disconnect();
    }
  }, [propsTheme]);

  // Selection states:
  // selectedId: explicitly clicked project (null = idle state)
  // hoveredId: project currently hovered in index (null = not hovering)
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Smooth mouse tracking for Layer 2 parallax (rAF loop with damping)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);

  // Check viewport responsiveness
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // requestAnimationFrame lerp loop for butter-smooth cursor parallax without state overhead
  useEffect(() => {
    if (isMobile) return undefined;

    const lerp = (a, b, t) => a + (b - a) * t;

    const updateParallax = () => {
      mouseCurrentRef.current.x = lerp(
        mouseCurrentRef.current.x,
        mouseTargetRef.current.x,
        0.08
      );
      mouseCurrentRef.current.y = lerp(
        mouseCurrentRef.current.y,
        mouseTargetRef.current.y,
        0.08
      );

      // Only update state if delta is significant enough to prevent excessive renders
      const dx = Math.abs(mouseCurrentRef.current.x - mousePos.x);
      const dy = Math.abs(mouseCurrentRef.current.y - mousePos.y);
      if (dx > 0.005 || dy > 0.005) {
        setMousePos({
          x: mouseCurrentRef.current.x,
          y: mouseCurrentRef.current.y,
        });
      }

      rafIdRef.current = requestAnimationFrame(updateParallax);
    };

    rafIdRef.current = requestAnimationFrame(updateParallax);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isMobile, mousePos]);

  // Pointer move handler on section container
  const handlePointerMove = useCallback(
    (e) => {
      if (isMobile) return;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      // Normalize cursor coordinates from -1.0 (left/top) to +1.0 (right/bottom)
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      mouseTargetRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
    },
    [isMobile]
  );

  const handlePointerLeave = useCallback(() => {
    mouseTargetRef.current = { x: 0, y: 0 };
  }, []);

  // Determine active project to display:
  // Hover takes immediate preview priority; otherwise active selectedId; otherwise null (Idle state)
  const activeProjectId = hoveredId ?? selectedId;
  const activeIndex = useMemo(() => {
    if (!activeProjectId) return -1;
    return projectsList.findIndex((p) => p.id === activeProjectId);
  }, [activeProjectId, projectsList]);

  const activeProject = activeIndex >= 0 ? projectsList[activeIndex] : null;

  // Toggle selection on click
  const handleSelectProject = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // Keyboard navigation for accessible selection
  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectProject(id);
    }
  };

  // Mobile carousel navigation
  const mobileIndex = selectedId
    ? Math.max(0, projectsList.findIndex((p) => p.id === selectedId))
    : 0;

  const handleMobileNext = () => {
    const nextIdx = (mobileIndex + 1) % projectsList.length;
    setSelectedId(projectsList[nextIdx].id);
  };

  const handleMobilePrev = () => {
    const prevIdx = (mobileIndex - 1 + projectsList.length) % projectsList.length;
    setSelectedId(projectsList[prevIdx].id);
  };

  return (
    <section
      id="projects"
      className="section projects editorial-projects-section"
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Section Header */}
      <div className="section-intro projects-intro">
        <p className="eyebrow reveal-line">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Interactive Exhibition</span>
        </p>
        <h2 className="section-title reveal-title">
          Selected Works & Systems.
        </h2>
      </div>

      {/* Main Exhibition Workspace (Desktop/Tablet) */}
      <div className="editorial-exhibition-stage">
        {/* ==============================================================
            LEFT RAIL: Clean Project Navigation Index
            Preserves existing project names, keyboard accessible
            ============================================================== */}
        <aside className="editorial-nav-rail" aria-label="Project Selection Index">
          <div className="nav-rail-header">
            <span className="nav-rail-tag">
              <Layers size={12} />
              <span>PROJECT INDEX</span>
            </span>
            <span className="nav-rail-count">
              {projectsList.length} ARCHITECTURES
            </span>
          </div>

          <div className="nav-rail-scroller-wrap">
            <nav className="nav-rail-list" ref={navRailListRef} role="tablist">
              {projectsList.map((p, idx) => {
                const isSelected = selectedId === p.id;
                const isHovered = hoveredId === p.id;
                const isActive = isSelected || isHovered;

                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    tabIndex={0}
                    className={`editorial-nav-btn ${isActive ? 'is-active' : ''} ${isSelected ? 'is-locked' : ''}`}
                    onClick={() => handleSelectProject(p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onKeyDown={(e) => handleKeyDown(e, p.id)}
                    data-magnetic
                  >
                    <span className="nav-btn-index">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="nav-btn-text">
                      <span className="nav-btn-title">{p.title}</span>
                      <span className="nav-btn-cat">{p.category}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Anime.js / Skiper 1 Style Interactive Scrollbar */}
            <AnimeScrollbar
              containerRef={navRailListRef}
              items={projectsList}
              activeIndex={Math.max(0, activeIndex)}
            />
          </div>

          {/* Quick Clear / Reset prompt */}
          {selectedId && (
            <div className="nav-rail-footer">
              <button
                type="button"
                className="nav-rail-reset-btn"
                onClick={() => {
                  setSelectedId(null);
                  setHoveredId(null);
                }}
              >
                <RotateCcw size={12} />
                <span>Return to Central Overview</span>
              </button>
            </div>
          )}
        </aside>

        {/* ==============================================================
            CENTRAL CANVAS:
            Transitions smoothly between Idle State and Selected Project Collage
            ============================================================== */}
        <div className="editorial-canvas-viewport">
          <AnimatePresence mode="wait">
            {!activeProject ? (
              <Project3DOverview
                key="3d-overview"
                projects={projectsList}
                onSelectProject={handleSelectProject}
                theme={currentTheme}
                isMobile={isMobile}
              />
            ) : (
              <ProjectCollageShowcase
                key={activeProject.id}
                project={activeProject}
                index={activeIndex}
                total={projectsList.length}
                onReset={() => {
                  setSelectedId(null);
                  setHoveredId(null);
                }}
                mousePos={mousePos}
                isMobile={isMobile}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ==============================================================
          MOBILE TOUCH-OPTIMIZED CAROUSEL VIEW (< 768px)
          Provides a tactile, un-congested editorial experience
          ============================================================== */}
      <div className="editorial-mobile-showcase" aria-label="Mobile Project Showcase">
        {/* Horizontal Quick Select Tab Rail */}
        <div className="mobile-tabs-scroller">
          {projectsList.map((p, idx) => {
            const isCur = p.id === (activeProject?.id || projectsList[0].id);
            return (
              <button
                key={p.id}
                type="button"
                className={`mobile-tab-pill ${isCur ? 'is-active' : ''}`}
                onClick={() => setSelectedId(p.id)}
                style={{
                  borderColor: isCur ? p.accent : undefined,
                  color: isCur ? p.accent : undefined,
                }}
              >
                <span>{String(idx + 1).padStart(2, '0')}</span>
                <span>{p.title}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active Mobile Card */}
        {(() => {
          const cur = activeProject || projectsList[0];
          const curIdx = projectsList.findIndex((p) => p.id === cur.id);
          const liveLink = cur.links?.find((l) => l.type === 'external');
          const sourceLink = cur.links?.find((l) => l.type === 'github');

          return (
            <article className="mobile-project-card">
              <div className="mobile-card-media">
                <img
                  src={cur.image}
                  alt={cur.title}
                  className="mobile-card-img"
                  loading="lazy"
                />
                <div
                  className="mobile-card-badge"
                  style={{
                    backgroundColor: `${cur.accent}20`,
                    borderColor: `${cur.accent}44`,
                    color: cur.accent,
                  }}
                >
                  <span
                    className="mobile-badge-dot"
                    style={{ backgroundColor: cur.accent }}
                  />
                  <span>{cur.category}</span>
                </div>
                <span className="mobile-index-tag">
                  {curIdx + 1} / {projectsList.length}
                </span>
              </div>

              <div className="mobile-card-body">
                <h3 className="mobile-card-title">{cur.title}</h3>
                <p className="mobile-card-tagline">{cur.tagline}</p>
                <p className="mobile-card-desc">{cur.features?.[0]}</p>

                <div className="mobile-tech-tags">
                  {cur.tech?.slice(0, 4).map((t) => (
                    <span key={t} className="mobile-tech-tag">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mobile-card-actions">
                  {liveLink && (
                    <a
                      href={liveLink.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mobile-action-btn primary"
                      style={{
                        backgroundColor: cur.accent,
                        borderColor: cur.accent,
                        color: '#06080c',
                      }}
                    >
                      <span>Live Project</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {sourceLink && (
                    <a
                      href={sourceLink.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mobile-action-btn secondary"
                    >
                      <Github size={14} />
                      <span>Code</span>
                    </a>
                  )}
                </div>

                {/* Mobile Slider Controls */}
                <div className="mobile-slider-nav">
                  <button
                    type="button"
                    className="mobile-nav-arrow"
                    onClick={handleMobilePrev}
                    aria-label="Previous project"
                  >
                    <ChevronLeft size={18} />
                    <span>Prev</span>
                  </button>
                  <span className="mobile-slider-counter">
                    {curIdx + 1} of {projectsList.length}
                  </span>
                  <button
                    type="button"
                    className="mobile-nav-arrow"
                    onClick={handleMobileNext}
                    aria-label="Next project"
                  >
                    <span>Next</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </article>
          );
        })()}
      </div>

      {/* ==============================================================
          INTERACTION LAYER — Kinetic Cursor Trail
          Following real cursor across the Projects section
          pointer-events: none (does NOT block selection or links)
          ============================================================== */}
      {!isMobile && (
        <CursorTrail containerRef={sectionRef} subtle={false} />
      )}
    </section>
  );
}
