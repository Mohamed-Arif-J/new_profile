import { useRef, useState } from 'react';
import { ArrowRight, Check, Copy, Github, Linkedin, Mail, Phone, Send } from 'lucide-react';
import { portfolio } from '../data/portfolio.js';
import StickerCursorTrail from './StickerCursorTrail.jsx';

export default function Contact() {
  const containerRef = useRef(null);
  const [copiedField, setCopiedField] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  return (
    <section className="section contact" id="contact" ref={containerRef}>
      <div className="contact-info">
        <div className="section-intro">
          <p className="eyebrow reveal-line">{portfolio.contact.subtitle}</p>
          <h2 className="section-title reveal-title">{portfolio.contact.heading}</h2>
        </div>

        <p className="contact-copy reveal-fade">{portfolio.contact.copy}</p>

        <div className="contact-cards-grid reveal-fade">
          <div className="contact-card" data-magnetic>
            <div className="card-icon">
              <Mail size={20} />
            </div>
            <div className="card-details">
              <span>Email Address</span>
              <a href={portfolio.contact.emailHref}>{portfolio.contact.email}</a>
            </div>
            <button
              type="button"
              className="copy-btn"
              onClick={() => copyToClipboard(portfolio.contact.email, 'email')}
              aria-label="Copy Email"
              title="Copy Email to Clipboard"
            >
              {copiedField === 'email' ? <Check size={16} className="text-lime" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="contact-card" data-magnetic>
            <div className="card-icon">
              <Phone size={20} />
            </div>
            <div className="card-details">
              <span>Phone Number</span>
              <a href={portfolio.contact.phoneHref}>{portfolio.contact.phone}</a>
            </div>
            <button
              type="button"
              className="copy-btn"
              onClick={() => copyToClipboard(portfolio.contact.phone, 'phone')}
              aria-label="Copy Phone"
              title="Copy Phone to Clipboard"
            >
              {copiedField === 'phone' ? <Check size={16} className="text-lime" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="social-links-row reveal-fade">
          <a
            href={portfolio.contact.linkedin}
            target="_blank"
            rel="noreferrer"
            className="social-btn"
            data-magnetic
            data-cursor="LINKEDIN"
          >
            <Linkedin size={18} />
            <span>LinkedIn</span>
          </a>
          <a
            href={portfolio.contact.github}
            target="_blank"
            rel="noreferrer"
            className="social-btn"
            data-magnetic
            data-cursor="GITHUB"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      <div className="contact-form-container reveal-scale">
        <form
          className="contact-form"
          action={portfolio.contact.form.action}
          method="POST"
          onSubmit={handleFormSubmit}
        >
          <input type="text" name="_honey" className="hidden-field" tabIndex="-1" autoComplete="off" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_subject" value="New Portfolio Contact Submission!" />

          <div className="form-header">
            <h3>Send a Message</h3>
            <p>Directly notifies mohmedarifj@gmail.com</p>
          </div>

          <label className="form-label">
            <span>Your Name</span>
            <input type="text" name="name" placeholder="John Doe" required />
          </label>

          <label className="form-label">
            <span>Your Email</span>
            <input type="email" name="email" placeholder="john@example.com" required />
          </label>

          <label className="form-label">
            <span>Message</span>
            <textarea
              name="message"
              rows={4}
              placeholder="Hello Arif, I'd like to discuss an AI or software project..."
              required
            />
          </label>

          <button type="submit" className="primary-link submit-btn" data-magnetic data-cursor="SEND">
            <span>Send Message</span>
            <Send size={16} />
          </button>
        </form>
      </div>

      {copiedField && (
        <div className="toast-notification">
          <Check size={16} />
          <span>Copied {copiedField === 'email' ? 'Email' : 'Phone'} to clipboard!</span>
        </div>
      )}

      <StickerCursorTrail containerRef={containerRef} />
    </section>
  );
}
