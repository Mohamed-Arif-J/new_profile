import { useEffect, useRef } from 'react';
import { Brain, Cpu, Layout } from 'lucide-react';
import gsap from 'gsap';
import { portfolio } from '../data/portfolio.js';
import TextBoxReveal from './TextBoxReveal.jsx';

const iconMap = {
  Cpu: <Cpu size={24} />,
  Brain: <Brain size={24} />,
  Layout: <Layout size={24} />,
};

export default function About() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const cards = container.querySelectorAll('.focus-card');

    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(card, {
        rotateX: (-y / rect.height) * 12,
        rotateY: (x / rect.width) * 12,
        duration: 0.35,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    };

    const handleMouseLeave = (card) => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    };

    const cleanups = [];
    cards.forEach((card) => {
      const moveHandler = (e) => handleMouseMove(e, card);
      const leaveHandler = () => handleMouseLeave(card);

      card.addEventListener('mousemove', moveHandler);
      card.addEventListener('mouseleave', leaveHandler);

      cleanups.push(() => {
        card.removeEventListener('mousemove', moveHandler);
        card.removeEventListener('mouseleave', leaveHandler);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section className="section about" id="about" ref={containerRef}>
      <div className="section-intro">
        <p className="eyebrow reveal-line">About Me</p>
        <h2 className="section-title reveal-title">Systems, intelligence, and clean execution.</h2>
      </div>

      <div className="about-grid">
        <div className="about-copy">
          <TextBoxReveal paragraphs={portfolio.about.paragraphs} />

          <div className="about-details-row">
            {portfolio.about.details.map((item) => (
              <div className="detail-pill" key={item.label}>
                <span className="pill-label">{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.description}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="focus-grid">
          {portfolio.focus.map((item, index) => (
            <article className="focus-card reveal-card" key={item.title} data-magnetic>
              <div className="focus-header">
                <span className="focus-icon">{iconMap[item.icon] || <Cpu size={24} />}</span>
                <span className="focus-number">0{index + 1}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="focus-glow-line" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

