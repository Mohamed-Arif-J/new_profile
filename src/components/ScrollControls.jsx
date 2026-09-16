import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollControls({ lenis }) {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="floating-controls">
      <button
        type="button"
        className={`floating-top-btn ${showTopBtn ? 'is-visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title="Scroll back to top"
      >
        <ArrowUp size={20} strokeWidth={2.5} className="floating-top-icon" />
      </button>
    </div>
  );
}
