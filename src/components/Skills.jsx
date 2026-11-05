import { useEffect, useState, useRef, useMemo } from 'react';
import {
  ArrowUpRight,
  Code2,
  Github,
  GitCommit,
  Cpu,
  Database,
  Globe,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolio } from '../data/portfolio.js';
import GitHubContributionChart from './GitHubContributionChart.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Mobile category filter state (for screens <= 860px)
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'AI & Machine Learning', 'Web Development', 'Systems & Databases'];

  const filteredSkills = useMemo(() => {
    if (activeCategory === 'All') return portfolio.skills;
    return portfolio.skills.filter((skill) => {
      if (activeCategory === 'AI & Machine Learning') {
        return skill.category.includes('AI') || skill.category.includes('Machine Learning');
      }
      if (activeCategory === 'Web Development') {
        return skill.category.includes('Web') || skill.category.includes('Mobile');
      }
      if (activeCategory === 'Systems & Databases') {
        return (
          skill.category.includes('Systems') ||
          skill.category.includes('Databases') ||
          skill.category.includes('Enterprise')
        );
      }
      return true;
    });
  }, [activeCategory]);

  // Group skills by domain for desktop horizontal panels
  const aiSkills = useMemo(
    () =>
      portfolio.skills.filter(
        (s) => s.category.includes('AI') || s.category.includes('Machine Learning')
      ),
    []
  );

  const systemsSkills = useMemo(
    () =>
      portfolio.skills.filter(
        (s) =>
          s.category.includes('Systems') ||
          s.category.includes('Databases') ||
          s.category.includes('Enterprise')
      ),
    []
  );

  const webSkills = useMemo(
    () =>
      portfolio.skills.filter(
        (s) => s.category.includes('Web') || s.category.includes('Mobile')
      ),
    []
  );

  // GSAP Horizontal Scroll Pinning (Desktop > 860px)
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return undefined;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 861px)', () => {
      // Calculate total horizontal scroll distance
      const getScrollDistance = () => {
        return Math.max(0, track.scrollWidth - window.innerWidth + 80);
      };

      const tween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 0.85,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      return () => {
        tween.kill();
        if (tween.scrollTrigger) {
          tween.scrollTrigger.kill();
        }
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  // Card reveal animation on category change for mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      gsap.fromTo(
        '.skills-mobile-grid .skill-card',
        { opacity: 0, y: 16, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.04,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    }
  }, [activeCategory]);

  return (
    <section
      className="section skills horizontal-skills-section"
      id="skills"
      ref={sectionRef}
      aria-label="Engineering Tech Stack and Architectures"
    >
      {/* ==============================================================
          DESKTOP HORIZONTAL SCROLL TRACK (> 860px)
          Pins immediately after Projects, glides from left to right,
          and cleanly unpins returning to normal vertical scroll.
          ============================================================== */}
      <div className="horizontal-skills-viewport">
        <div className="horizontal-skills-track" ref={trackRef}>
          {/* Panel 1: Command Hub & GitHub Profile */}
          <div className="skills-horizontal-panel intro-hub-panel">
            <div className="panel-header-block">
              <p className="eyebrow">
                <Sparkles size={14} className="sparkle-icon" />
                <span>Tech Stack & Architectures</span>
              </p>
              <h2 className="panel-headline">
                Tools & Systems I use to build scalable software.
              </h2>
              <p className="panel-subtext">
                Explore the engineering foundation spanning deep neural networks,
                low-level WASM database engines, and fluid reactive client interfaces.
              </p>

              <div className="horizontal-scroll-hint" aria-hidden="true">
                <span className="hint-pulse-dot" />
                <span>Scroll to explore full stack</span>
                <ArrowRight size={14} className="hint-arrow" />
              </div>
            </div>

            <div className="hub-profile-container">
              <div className="github-panel" data-magnetic>
                <div className="github-icon-row">
                  <Github size={36} className="github-svg" />
                  <span className="live-status-pill">Active Developer</span>
                </div>

                <h3>GitHub Engineering Profile</h3>
                <p>{portfolio.githubProfileCopy}</p>

                <a
                  href={portfolio.contact.github}
                  target="_blank"
                  rel="noreferrer"
                  className="github-btn"
                  data-magnetic
                  data-cursor="GIT"
                >
                  <span>Visit @Mohamed-Arif-J</span>
                  <ArrowUpRight size={16} />
                </a>

                <div className="github-stats-row">
                  <div>
                    <strong>15+</strong>
                    <span>Public Repos</span>
                  </div>
                  <div>
                    <strong>ResNet / WASM / ML</strong>
                    <span>Core Architectures</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Live GitHub Contribution Activity & Velocity */}
          <div className="skills-horizontal-panel github-activity-panel">
            <div className="activity-panel-header">
              <span className="activity-tag">
                <GitCommit size={14} />
                <span>LIVE ACTIVITY MATRIX</span>
              </span>
              <h3 className="activity-title">GitHub Contribution History & Velocity</h3>
              <p className="activity-desc">
                Verified commit telemetry and development cadence across open-source architectures.
              </p>
            </div>

            <div className="activity-chart-wrap">
              <GitHubContributionChart />
            </div>
          </div>

          {/* Panel 2: Artificial Intelligence & Machine Learning */}
          <div className="skills-horizontal-panel domain-panel ai-domain">
            <div className="domain-panel-header">
              <span className="domain-tag">
                <Cpu size={14} />
                <span>01 · AI & MACHINE LEARNING</span>
              </span>
              <h3 className="domain-title">Neural Networks & Intelligent Vision</h3>
              <p className="domain-desc">
                Deep learning models, custom vision backbones, and local fine-tuned LLM inference.
              </p>
            </div>

            <div className="domain-cards-grid">
              {aiSkills.map((skill) => (
                <article className="skill-card" key={skill.name}>
                  <div className="skill-card-top">
                    <div className="skill-icon-box">
                      <i className={skill.iconClass} />
                      {!skill.iconClass && <Code2 size={24} />}
                    </div>
                    <span className="skill-category-tag">{skill.category}</span>
                  </div>

                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>

                  <div className="skill-level-bar">
                    <div className="skill-level-track">
                      <div
                        className="skill-level-fill"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <span className="skill-level-num">{skill.level}%</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Panel 3: Low-Level Systems & Database Architectures */}
          <div className="skills-horizontal-panel domain-panel systems-domain">
            <div className="domain-panel-header">
              <span className="domain-tag">
                <Database size={14} />
                <span>02 · SYSTEMS & DATABASES</span>
              </span>
              <h3 className="domain-title">Low-Level Systems & WASM Engines</h3>
              <p className="domain-desc">
                Relational engines, memory-efficient data structures, and zero-server client storage.
              </p>
            </div>

            <div className="domain-cards-grid">
              {systemsSkills.map((skill) => (
                <article className="skill-card" key={skill.name}>
                  <div className="skill-card-top">
                    <div className="skill-icon-box">
                      <i className={skill.iconClass} />
                      {!skill.iconClass && <Code2 size={24} />}
                    </div>
                    <span className="skill-category-tag">{skill.category}</span>
                  </div>

                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>

                  <div className="skill-level-bar">
                    <div className="skill-level-track">
                      <div
                        className="skill-level-fill"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <span className="skill-level-num">{skill.level}%</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Panel 4: Modern Web & Cross-Platform Mobile */}
          <div className="skills-horizontal-panel domain-panel web-domain">
            <div className="domain-panel-header">
              <span className="domain-tag">
                <Globe size={14} />
                <span>03 · WEB & MOBILE CLIENTS</span>
              </span>
              <h3 className="domain-title">Reactive Interfaces & Mobile Apps</h3>
              <p className="domain-desc">
                Modern component architectures, fluid kinetic animations, and native mobile apps.
              </p>
            </div>

            <div className="domain-cards-grid">
              {webSkills.map((skill) => (
                <article className="skill-card" key={skill.name}>
                  <div className="skill-card-top">
                    <div className="skill-icon-box">
                      <i className={skill.iconClass} />
                      {!skill.iconClass && <Code2 size={24} />}
                    </div>
                    <span className="skill-category-tag">{skill.category}</span>
                  </div>

                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>

                  <div className="skill-level-bar">
                    <div className="skill-level-track">
                      <div
                        className="skill-level-fill"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <span className="skill-level-num">{skill.level}%</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          MOBILE TOUCH-OPTIMIZED VIEW (<= 860px)
          Normal vertical scroll with categorized tabs to prevent touch trapping
          ============================================================== */}
      <div className="skills-mobile-view">
        <div className="section-intro">
          <p className="eyebrow">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Tech Stack</span>
          </p>
          <h2 className="section-title">Tools I use to build scalable software.</h2>
        </div>

        <div className="skills-mobile-wrap">
          <div className="github-panel" data-magnetic>
            <div className="github-icon-row">
              <Github size={36} className="github-svg" />
              <span className="live-status-pill">Active Developer</span>
            </div>

            <h3>GitHub Engineering Profile</h3>
            <p>{portfolio.githubProfileCopy}</p>

            <a
              href={portfolio.contact.github}
              target="_blank"
              rel="noreferrer"
              className="github-btn"
            >
              <span>Visit @Mohamed-Arif-J</span>
              <ArrowUpRight size={16} />
            </a>

            <div className="github-stats-row">
              <div>
                <strong>15+</strong>
                <span>Public Repos</span>
              </div>
              <div>
                <strong>ResNet / WASM / ML</strong>
                <span>Core Architectures</span>
              </div>
            </div>
          </div>

          <GitHubContributionChart />

          <div className="category-filter-bar" data-lenis-prevent="true">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-tab ${activeCategory === cat ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="skills-grid skills-mobile-grid">
            {filteredSkills.map((skill) => (
              <article className="skill-card" key={skill.name}>
                <div className="skill-card-top">
                  <div className="skill-icon-box">
                    <i className={skill.iconClass} />
                    {!skill.iconClass && <Code2 size={24} />}
                  </div>
                  <span className="skill-category-tag">{skill.category}</span>
                </div>

                <h4>{skill.name}</h4>
                <p>{skill.description}</p>

                <div className="skill-level-bar">
                  <div className="skill-level-track">
                    <div
                      className="skill-level-fill"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  <span className="skill-level-num">{skill.level}%</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}