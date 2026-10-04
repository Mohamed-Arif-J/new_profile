import { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GradientMeshBg from './components/GradientMeshBg.jsx';
import ScrollStroke from './components/ScrollStroke.jsx';
import ScrollProgress003 from './components/ScrollProgress003.jsx';
import ScrollControls from './components/ScrollControls.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Skills from './components/Skills.jsx';
import Education from './components/Education.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import StaircaseThemeTransition from './components/StaircaseThemeTransition.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [lenisInstance, setLenisInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const transitionRef = useRef(null);

  const handleThemeSwitch = (nextTheme) => {
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    if (transitionRef.current) {
      transitionRef.current.startTransition(theme, nextTheme);
    } else {
      handleThemeSwitch(nextTheme);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    setLenisInstance(lenis);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Section Titles Reveal
        gsap.utils.toArray('.reveal-title').forEach((title) => {
          gsap.fromTo(
            title,
            { y: 35, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
              scrollTrigger: { trigger: title, start: 'top 90%' },
            }
          );
        });

        // Eyebrow Lines Reveal
        gsap.utils.toArray('.reveal-line').forEach((line) => {
          gsap.fromTo(
            line,
            { x: -20, opacity: 0 },
            {
              x: 0, opacity: 1, duration: 0.75, ease: 'power3.out',
              scrollTrigger: { trigger: line, start: 'top 92%' },
            }
          );
        });

        // Fade Reveals
        gsap.utils.toArray('.reveal-fade').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 30, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 92%' },
            }
          );
        });

        // Card Reveals
        gsap.utils.toArray('.reveal-card').forEach((card) => {
          gsap.fromTo(
            card,
            { y: 35, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 92%' },
            }
          );
        });

        // Timeline
        const timelineLine = document.querySelector('.timeline-line');
        if (timelineLine) {
          gsap.fromTo(
            timelineLine,
            { scaleY: 0, transformOrigin: 'top center' },
            {
              scaleY: 1, ease: 'none',
              scrollTrigger: { trigger: '.timeline-container', start: 'top 80%', end: 'bottom 80%', scrub: true },
            }
          );
        }

        gsap.utils.toArray('.timeline-node').forEach((node) => {
          gsap.fromTo(
            node,
            { scale: 0, opacity: 0 },
            {
              scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)',
              scrollTrigger: { trigger: node, start: 'top 88%' },
            }
          );
        });

        // Skill Bars
        gsap.utils.toArray('.skill-level-fill').forEach((fill) => {
          const targetWidth = fill.style.width;
          gsap.fromTo(
            fill,
            { width: '0%' },
            {
              width: targetWidth, duration: 1.2, ease: 'power2.out',
              scrollTrigger: { trigger: fill, start: 'top 92%' },
            }
          );
        });

        // Metric Counters
        document.querySelectorAll('.metric-number').forEach((el) => {
          const valSpan = el.querySelector('.metric-val');
          const targetVal = parseFloat(el.getAttribute('data-target'));
          const isFloat = el.getAttribute('data-float') === 'true';
          if (valSpan && !Number.isNaN(targetVal)) {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: targetVal, duration: 2, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 92%', once: true },
              onUpdate: () => {
                valSpan.innerText = isFloat ? counter.val.toFixed(2) : Math.round(counter.val);
              },
            });
          }
        });

        ScrollTrigger.refresh();
      });

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && (
        <SplashScreen
          done={() => {
            setIsLoading(false);
            setTimeout(() => ScrollTrigger.refresh(), 200);
          }}
        />
      )}
      <GradientMeshBg />
      <StaircaseThemeTransition ref={transitionRef} onThemeSwitch={handleThemeSwitch} />
      <ScrollProgress003 lenis={lenisInstance} />
      <ScrollControls lenis={lenisInstance} />

      <div className="app" style={{ opacity: 1 }}>
        <Navbar lenis={lenisInstance} theme={theme} toggleTheme={toggleTheme} />

        <ScrollStroke lenis={lenisInstance} />

        <main>
          <Hero lenis={lenisInstance} />
          <About />
          <Projects lenis={lenisInstance} />
          <Skills />
          <Education />
          <Contact />
        </main>

        <Footer />
      </div>
    </>
  );
}
