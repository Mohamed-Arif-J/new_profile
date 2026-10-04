import { useRef } from 'react';
import { portfolio } from '../data/portfolio.js';
import CrowdCanvas from './CrowdCanvas.jsx';
import CursorTrail from './CursorTrail.jsx';

export default function Footer() {
  const footerRef = useRef(null);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-crowd-stage">
        <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>

      <div className="footer-content">
        <div className="footer-brand">
          <strong>{portfolio.identity.name}</strong>
          <span>{portfolio.identity.role}</span>
        </div>

        <p>{portfolio.footer.copyright}</p>
        <span className="footer-note">{portfolio.footer.note}</span>
      </div>

      {/* Skipper UI kinetic cursor line trail active strictly inside Footer */}
      <CursorTrail containerRef={footerRef} subtle={true} />
    </footer>
  );
}
