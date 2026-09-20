import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ done }) {
  const [progress, setProgress] = useState(0);
  const [showNote1, setShowNote1] = useState(false);
  const [showNote2, setShowNote2] = useState(false);
  const [showNote3, setShowNote3] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 350);
      return () => clearTimeout(exitTimer);
    }

    // Step pacing keeps the splash visible for roughly 4 seconds total.
    const delays = [320, 330, 310, 330, 320, 310, 330, 320, 330, 300];
    const step = Math.floor(progress / 10);
    const delay = delays[step] || 850;

    const timer = setTimeout(() => {
      setProgress((p) => Math.min(100, p + 10));
    }, delay);

    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (progress >= 20) setShowNote1(true);
    if (progress >= 50) setShowNote2(true);
    if (progress >= 70) setShowNote3(true);
  }, [progress]);

  return (
    <AnimatePresence onExitComplete={done}>
      {!isExiting && (
        <motion.div
          key="skiper15-splash"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.55, ease: [0.785, 0.135, 0.15, 0.86] }}
          className="skiper15-overlay"
        >
          {/* Main Central Box Loader (Skiper15 Preloader) */}
          <div className="skiper15-card">
            <div className="skiper15-header">
              <p className="skiper15-title">LOADER</p>
              <div className="skiper15-dots">
                <div className="skiper15-dot" />
                <div className="skiper15-dot" />
              </div>
            </div>
            <hr className="skiper15-hr" />
            <div className="skiper15-body">
              <div className="skiper15-blocks-wrap">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`skiper15-block ${progress >= (i + 1) * 10 ? 'active' : ''}`}
                  />
                ))}
              </div>
              <p className="skiper15-pct">{progress}%</p>
            </div>
          </div>

          {/* Floating Side Note 1: Welcome & Have a nice day (at >= 20%) */}
          <AnimatePresence>
            {showNote1 && (
              <motion.div
                drag
                dragMomentum={false}
                dragConstraints={{ left: -120, right: 120, top: -140, bottom: 140 }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, bounce: 0.35, type: 'spring' }}
                className="skiper15-note skiper15-note-welcome"
              >
                <div className="skiper15-header">
                  <p className="skiper15-title">WELCOME NOTE</p>
                  <div className="skiper15-dots">
                    <div className="skiper15-dot" />
                    <div className="skiper15-dot" />
                  </div>
                </div>
                <hr className="skiper15-hr" />
                <div className="skiper15-note-content">
                  <p className="skiper15-note-title">Welcome, have a nice day! 👋</p>
                  <p>
                    Thank you for visiting my portfolio. Feel free to drag these notes around and enjoy exploring my works!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Side Note 2: About Arif Portfolio Info (at >= 50%) */}
          <AnimatePresence>
            {showNote2 && (
              <motion.div
                drag
                dragMomentum={false}
                dragConstraints={{ left: -120, right: 120, top: -140, bottom: 140 }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 6 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, bounce: 0.35, type: 'spring' }}
                className="skiper15-note skiper15-note-about"
              >
                <div className="skiper15-header">
                  <p className="skiper15-title">ABOUT ARIF</p>
                  <div className="skiper15-dots">
                    <div className="skiper15-dot" />
                    <div className="skiper15-dot" />
                  </div>
                </div>
                <hr className="skiper15-hr" />
                <div className="skiper15-note-content">
                  <p className="skiper15-note-title">Mohamed Arif J</p>
                  <p>
                    AI Software Engineer & Full-Stack Architect building intelligent applications and deep learning models.
                  </p>
                  <p className="skiper15-note-mono">B.Tech CSE</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Side Note 3: Stack & Location (at >= 70%) */}
          <AnimatePresence>
            {showNote3 && (
              <motion.div
                drag
                dragMomentum={false}
                dragConstraints={{ left: -120, right: 120, top: -140, bottom: 140 }}
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, bounce: 0.35, type: 'spring' }}
                className="skiper15-note skiper15-note-craft"
              >
                <div className="skiper15-header">
                  <p className="skiper15-title">ORIGIN & CRAFT</p>
                  <div className="skiper15-dots">
                    <div className="skiper15-dot" />
                    <div className="skiper15-dot" />
                  </div>
                </div>
                <hr className="skiper15-hr" />
                <div className="skiper15-note-content">
                  <p className="skiper15-note-title">Crafted with 💚 from Kerala, India</p>
                  <p>PyTorch • CUDA • React • GSAP • Lenis</p>
                  <p className="skiper15-note-mono">Collection Edition 2026</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
