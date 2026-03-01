import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProjectStore } from "../store";
import ProjectCard from "../components/ProjectCard";
import "./Home.css";

const env = {
  name: import.meta.env.VITE_NAME || "Developer",
  role: import.meta.env.VITE_ROLE || "Full Stack Developer",
  tagline: import.meta.env.VITE_TAGLINE || "Building digital experiences",
  heroSubtitle:
    import.meta.env.VITE_HERO_SUBTITLE || "I build things for the web",
  heroCta: import.meta.env.VITE_HERO_CTA || "See my work",
  bio: import.meta.env.VITE_ABOUT_BIO || "Developer bio here.",
  skills: (import.meta.env.VITE_SKILLS || "React,Node.js").split(","),
  email: import.meta.env.VITE_EMAIL || "",
  github: import.meta.env.VITE_GITHUB || "",
  linkedin: import.meta.env.VITE_LINKEDIN || "",
};

const STATS = [
  { value: "4+", label: "Years coding" },
  { value: "3", label: "Major projects completed" },
  { value: "2", label: "Internships completed" },
  { value: "15+", label: "Technologies explored" },
];

export default function Home() {
  const { projects, fetchProjects } = useProjectStore();
  const heroRef = useRef();

  useEffect(() => {
    fetchProjects({ featured: "true" });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      hero.style.transform = `perspective(800px) rotateY(${x * 0.3}deg) rotateX(${-y * 0.2}deg)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="home page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero__inner" ref={heroRef}>
            <div className="hero__eyebrow">
              <div className="hero__status">
                <span className="hero__status-dot" />
                <span className="mono">Available for work</span>
              </div>
            </div>

            <h1 className="hero__name">
              {env.name.split(" ").map((word, i) => (
                <span
                  key={i}
                  className="hero__word"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {word}
                </span>
              ))}
            </h1>

            <div className="hero__role">
              <span className="hero__role-text">{env.role}</span>
              <div className="hero__role-line" />
            </div>

            <p className="hero__sub">{env.heroSubtitle}</p>
            <p className="hero__tagline">{env.tagline}</p>

            <div className="hero__actions">
              <Link to="/projects" className="btn btn--primary">
                {env.heroCta}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              {env.github && (
                <a
                  href={env.github}
                  target="_blank"
                  rel="noopener"
                  className="btn btn--ghost"
                >
                  GitHub
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              )}
            </div>

            <div className="hero__coords mono">
              LAT 41.9028° N — LON 12.4964° E — ALT ∞
            </div>
          </div>
        </div>

        <div className="hero__orbit hero__orbit--1" />
        <div className="hero__orbit hero__orbit--2" />
        <div className="hero__orbit hero__orbit--3" />

        <div className="hero__scroll-hint">
          <div className="hero__scroll-line" />
          <span className="mono">scroll</span>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {STATS.map(({ value, label }) => (
              <div key={label} className="stat">
                <div className="stat__value">{value}</div>
                <div className="stat__label mono">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="container">
          <div className="about__inner">
            <div className="about__left">
              <div className="section-label mono">// about.me</div>
              <h2 className="section-title">
                Building bridges between
                <br />
                <em>code</em> and <em>experience</em>
              </h2>
              <p className="about__bio">{env.bio}</p>
              {env.email && (
                <a href={`mailto:${env.email}`} className="btn btn--outline">
                  Get in touch →
                </a>
              )}
            </div>
            <div className="about__right">
              <div className="skills">
                <div className="section-label mono">// skills[]</div>
                <div className="skills__grid">
                  {env.skills.map((skill, i) => (
                    <div
                      key={skill}
                      className="skill-item"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <span className="skill-item__dot" />
                      {skill.trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      {featured.length > 0 && (
        <section className="featured">
          <div className="container">
            <div className="featured__header">
              <div className="section-label mono">// projects.featured</div>
              <h2 className="section-title">Selected work</h2>
            </div>
            <div className="featured__grid">
              {featured.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
            <div className="featured__cta">
              <Link to="/projects" className="btn btn--ghost">
                View all projects
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="contact-strip">
        <div className="container">
          <div className="contact-strip__inner">
            <div className="contact-strip__text">
              <span
                className="mono"
                style={{ color: "var(--plasma)", fontSize: "0.8rem" }}
              >
                Ready to launch?
              </span>
              <h3>
                Let's build something
                <br />
                out of this world.
              </h3>
            </div>
            <div className="contact-strip__links">
              {env.email && (
                <a href={`mailto:${env.email}`} className="contact-link">
                  {env.email}
                </a>
              )}
              {env.github && (
                <a
                  href={env.github}
                  target="_blank"
                  rel="noopener"
                  className="contact-link"
                >
                  GitHub
                </a>
              )}
              {env.linkedin && (
                <a
                  href={env.linkedin}
                  target="_blank"
                  rel="noopener"
                  className="contact-link"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
