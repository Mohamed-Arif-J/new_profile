import { ArrowUpRight, Download, Github, Sparkles } from 'lucide-react';
import { portfolio } from '../data/portfolio.js';

function ProjectCard({ project, index }) {
  const liveLink = project.links?.find((l) => l.type === 'external');
  const sourceLink = project.links?.find((l) => l.type === 'github');
  const downloadLink = project.links?.find((l) => l.type === 'download');

  return (
    <article className="project-card reveal-card">
      <div className="project-card-media">
        <img
          src={project.image}
          alt={project.title}
          loading={index < 4 ? 'eager' : 'lazy'}
        />
        <span className="project-card-number">0{index + 1}</span>
      </div>

      <div className="project-card-body">
        <div className="project-card-kicker">
          <span style={{ backgroundColor: project.accent }} />
          <p>{project.category}</p>
        </div>

        <div>
          <h3>{project.title}</h3>
          <p className="project-card-tagline">{project.tagline}</p>
        </div>

        <ul className="project-card-features">
          {project.features?.slice(0, 2).map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <div className="project-card-tech">
          {project.tech?.slice(0, 5).map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>

        <div className="project-card-actions">
          {liveLink && (
            <a href={liveLink.href} target="_blank" rel="noreferrer">
              <span>Live</span>
              <ArrowUpRight size={15} />
            </a>
          )}
          {sourceLink && (
            <a href={sourceLink.href} target="_blank" rel="noreferrer">
              <Github size={15} />
              <span>Code</span>
            </a>
          )}
          {downloadLink && (
            <a href={downloadLink.href} target="_blank" rel="noreferrer">
              <Download size={15} />
              <span>Download</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="section-intro projects-intro">
        <p className="eyebrow reveal-line">
          <Sparkles size={15} className="sparkle-icon" />
          Selected Works
        </p>
        <h2 className="section-title reveal-title">Projects built across AI, product, and systems.</h2>
      </div>

      <div className="projects-grid">
        {portfolio.projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
