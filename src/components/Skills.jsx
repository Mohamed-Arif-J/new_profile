import { useEffect, useState } from 'react';
import { ArrowUpRight, Code2, Github } from 'lucide-react';
import gsap from 'gsap';
import { portfolio } from '../data/portfolio.js';

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'AI & Backend', 'Web Development', 'Systems & Databases'];

  const filteredSkills =
    activeCategory === 'All'
      ? portfolio.skills
      : portfolio.skills.filter((skill) => {
          if (activeCategory === 'AI & Backend') {
            return skill.category.includes('AI') || skill.category.includes('Backend');
          }
          if (activeCategory === 'Web Development') {
            return skill.category.includes('Web') || skill.category.includes('Mobile');
          }
          if (activeCategory === 'Systems & Databases') {
            return skill.category.includes('Systems') || skill.category.includes('Databases');
          }
          return true;
        });

  useEffect(() => {
    gsap.fromTo(
      '.skills-grid .skill-card',
      { opacity: 0, y: 20, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.05,
        duration: 0.45,
        ease: 'power2.out',
      }
    );
  }, [activeCategory]);

  return (
    <section className="section skills" id="skills">
      <div className="section-intro">
        <p className="eyebrow reveal-line">Tech Stack</p>
        <h2 className="section-title reveal-title">Tools I use to build scalable software.</h2>
      </div>

      <div className="skills-wrap">
        <div className="github-panel reveal-fade" data-magnetic>
          <div className="github-icon-row">
            <Github size={40} className="github-svg" />
            <span className="live-status-pill">Active Developer</span>
          </div>

          <h3>GitHub Engineering Profile</h3>
          <p>{portfolio.githubProfileCopy}</p>

          <a
            href={portfolio.contact.github}
            target="_blank"
            rel="noreferrer"
            className="github-btn"
            data-magnetic
            data-cursor="GIT"
          >
            <span>Visit @Mohamed-Arif-J</span>
            <ArrowUpRight size={16} />
          </a>

          <div className="github-stats-row">
            <div>
              <strong>5+</strong>
              <span>Public Repos</span>
            </div>
            <div>
              <strong>ResNet / NLP / ML</strong>
              <span>Core Architectures</span>
            </div>
          </div>
        </div>

        <div className="skills-content">
          <div className="category-filter-bar reveal-fade">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-tab ${activeCategory === cat ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                data-magnetic
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="skills-grid">
            {filteredSkills.map((skill) => (
              <article className="skill-card reveal-card" key={skill.name} data-magnetic>
                <div className="skill-card-top">
                  <div className="skill-icon-box">
                    <i className={skill.iconClass} />
                    {!skill.iconClass && <Code2 size={24} />}
                  </div>
                  <span className="skill-category-tag">{skill.category}</span>
                </div>

                <h4>{skill.name}</h4>
                <p>{skill.description}</p>

                <div className="skill-level-bar">
                  <div className="skill-level-track">
                    <div className="skill-level-fill" style={{ width: `${skill.level}%` }} />
                  </div>
                  <span className="skill-level-num">{skill.level}%</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

