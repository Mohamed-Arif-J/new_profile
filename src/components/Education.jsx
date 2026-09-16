import { useRef } from 'react';
import { Award, GraduationCap, MapPin } from 'lucide-react';
import { portfolio } from '../data/portfolio.js';
import StickerCursorTrail from './StickerCursorTrail.jsx';

export default function Education() {
  const sectionRef = useRef(null);

  return (
    <section className="section education" id="education" ref={sectionRef}>
      <div className="section-intro align-center">
        <p className="eyebrow reveal-line">Academic Journey</p>
        <h2 className="section-title reveal-title">Foundations built with momentum.</h2>
      </div>

      <div className="timeline-container">
        <div className="timeline-line" />

        {portfolio.education.map((item) => (
          <article className="timeline-card reveal-card" key={item.title}>
            <div className="timeline-node">
              <GraduationCap size={20} />
            </div>

            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-period">{item.period}</span>
                <span className="timeline-score">
                  <Award size={14} />
                  <span>
                    {item.scoreLabel}: <strong>{item.score}</strong>
                  </span>
                </span>
              </div>

              <h3>{item.title}</h3>

              <div className="institution-row">
                <MapPin size={14} />
                <span>{item.institution}</span>
              </div>

              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Retro sticker cursor trail active strictly inside Education section */}
      <StickerCursorTrail containerRef={sectionRef} />
    </section>
  );
}
