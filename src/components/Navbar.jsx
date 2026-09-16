import { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import gsap from 'gsap';
import { portfolio } from '../data/portfolio.js';

export default function Navbar({ lenis, theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const overlayRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const menuItemsRef = useRef([]);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 60);

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lando Norris-style full-screen menu animation
  useEffect(() => {
    if (!overlayRef.current) return;

    if (open) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, {
        clipPath: 'circle(150% at calc(100% - 50px) 40px)',
        duration: 0.75,
        ease: 'power4.inOut',
      });
      gsap.fromTo(
        menuItemsRef.current,
        { y: 80, opacity: 0, rotateX: -15 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.3,
        }
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef.current, {
        clipPath: 'circle(0% at calc(100% - 50px) 40px)',
        duration: 0.55,
        ease: 'power3.inOut',
      });
    }
  }, [open]);

  const navigateTo = (e, targetHref) => {
    e.preventDefault();
    setOpen(false);
    const targetEl = document.querySelector(targetHref);
    if (!targetEl) return;

    if (lenis) {
      lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const allLinks = [
    { label: 'Home', href: '#home' },
    ...portfolio.nav,
  ];

  return (
    <>
      <header className={`lando-nav ${scrolled ? 'is-scrolled' : ''}`}>
        {/* Left: Name */}
        <a
          className="lando-nav-name"
          href="#home"
          onClick={(e) => navigateTo(e, '#home')}
        >
          Mohamed Arif J
        </a>

        {/* Right: Theme Toggle + Menu Button */}
        <div className="lando-nav-right">
          <button
            type="button"
            className={`lando-theme-btn ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            <span className="theme-icon-rotator">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </span>
          </button>

          <button
            type="button"
            className="lando-menu-btn"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Full-Screen Overlay Menu (Lando Norris Inspired) */}
      <div className="lando-menu-overlay" ref={overlayRef}>
        <nav className="lando-menu-content">
          {allLinks.map((item, i) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <a
                href={item.href}
                key={item.label}
                className={`lando-menu-link ${isActive ? 'is-active' : ''}`}
                onClick={(e) => navigateTo(e, item.href)}
                ref={(el) => (menuItemsRef.current[i] = el)}
              >
                <span className="lando-menu-index">0{i + 1}</span>
                <span className="lando-menu-label">{item.label}</span>
              </a>
            );
          })}

          <div
            className="lando-menu-footer"
            ref={(el) => (menuItemsRef.current[allLinks.length] = el)}
          >
            <a
              href={portfolio.identity.resume}
              target="_blank"
              rel="noreferrer"
              className="lando-menu-resume"
            >
              <span>Resume</span>
              <ArrowUpRight size={16} />
            </a>
            <div className="lando-menu-socials">
              <a href={portfolio.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <a href={portfolio.contact.github} target="_blank" rel="noreferrer">GitHub</a>
              <a href={portfolio.contact.emailHref}>Email</a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
