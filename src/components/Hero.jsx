import { useEffect, useRef } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import gsap from 'gsap';
import { portfolio } from '../data/portfolio.js';

export default function Hero({ lenis }) {
  const heroSectionRef = useRef(null);
  const heroStageRef = useRef(null);
  const heroImgRef = useRef(null);
  const nameBlockRef = useRef(null);
  const bottomLeftRef = useRef(null);
  const bottomRightRef = useRef(null);

  useEffect(() => {
    const container = heroSectionRef.current;
    if (!container) return undefined;

    const ctx = gsap.context(() => {
      // 1. Entrance Reveal Animation (synced on load)
      const entranceTl = gsap.timeline({ delay: 0.15 });

      entranceTl
        .fromTo(
          heroImgRef.current,
          { scale: 1.12, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out' }
        )
        .fromTo(
          '.siena-name-line',
          { y: 100, opacity: 0, skewY: 4 },
          { y: 0, opacity: 1, skewY: 0, duration: 1.1, stagger: 0.16, ease: 'power4.out' },
          '-=1.0'
        )
        .fromTo(
          bottomLeftRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          '-=0.7'
        )
        .fromTo(
          bottomRightRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          '-=0.8'
        );

      // 2. Siena Parallax Scroll Animation (Skiper UI inspired)
      const sienaScrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      });

      // Multi-layered depth parallax:
      // - Background image scales up and sinks with cinematic velocity
      // - Left-center name accelerates upward and fades
      // - Bottom left & bottom right drift down and fade out
      sienaScrollTl
        .to(heroImgRef.current, {
          scale: 1.2,
          yPercent: 18,
          ease: 'none',
        }, 0)
        .to('.siena-hero-overlay', {
          opacity: 0.9,
          ease: 'none',
        }, 0)
        .to(nameBlockRef.current, {
          yPercent: -55,
          xPercent: -10,
          opacity: 0,
          ease: 'power1.in',
        }, 0)
        .to(bottomLeftRef.current, {
          yPercent: 45,
          xPercent: -8,
          opacity: 0,
          ease: 'power1.in',
        }, 0)
        .to(bottomRightRef.current, {
          yPercent: 45,
          xPercent: 8,
          opacity: 0,
          ease: 'power1.in',
        }, 0);

    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  const navigateToProjects = (e) => {
    e.preventDefault();
    const el = document.querySelector('#projects');
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="siena-hero-section" id="home" ref={heroSectionRef}>
      {/* Screen-Filling Cinematic Stage (Skiper UI Siena Parallax) */}
      <div className="siena-hero-stage" ref={heroStageRef}>
        <img
          ref={heroImgRef}
          src={portfolio.identity.profileImage}
          alt="Mohamed Arif J"
          className="siena-hero-img"
        />

        {/* Ambient Film Vignette & Shadow Scrim */}
        <div className="siena-hero-overlay" />
      </div>

      {/* Hero Interactive UI Layer */}
      <div className="siena-hero-ui">
        {/* Left Center: Name */}
        <div className="siena-hero-name-block" ref={nameBlockRef}>
          <h1 className="siena-hero-name">
            <span className="siena-name-line">Mohamed</span>
            <span className="siena-name-line siena-name-accent">Arif J</span>
          </h1>
        </div>

        {/* Left Bottom Corner: Tagline + Buttons */}
        <div className="siena-hero-bottom-left" ref={bottomLeftRef}>
          <p className="siena-hero-tagline">
            Building intelligent applications from backend architectures to deep learning models.
          </p>

          <div className="siena-hero-actions">
            <a
              className="siena-btn-primary magnetic-btn"
              href="#projects"
              onClick={navigateToProjects}
              data-magnetic
              data-cursor="WORK"
            >
              <span>Explore Works</span>
              <ArrowRight size={17} />
            </a>

            <a
              className="siena-btn-secondary magnetic-btn"
              href={portfolio.identity.resume}
              target="_blank"
              rel="noreferrer"
              data-magnetic
              data-cursor="PDF"
            >
              <Download size={17} />
              <span>Resume</span>
            </a>
          </div>
        </div>

        {/* Right Bottom Corner: Role Tag */}
        <div className="siena-hero-bottom-right" ref={bottomRightRef}>
          <div className="siena-role-badge">
            <span className="siena-role-dot" />
            <span className="siena-role-text">
              AI Software Engineer & Full-Stack Architect
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
