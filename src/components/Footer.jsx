import { portfolio } from '../data/portfolio.js';
import CrowdCanvas from './CrowdCanvas.jsx';

export default function Footer() {
  return (
    <footer className="footer">
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
    </footer>
  );
}
