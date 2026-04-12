import { Link } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  { icon: '🔁', title: 'Dual Skill Profiles', desc: 'Tell the world what you teach and what you want to learn. Your profile is your launchpad.' },
  { icon: '⚡', title: 'Smart Matching', desc: 'Our algorithm surfaces users with perfectly complementary skills — scored by compatibility.' },
  { icon: '🤝', title: 'Exchange Proposals', desc: 'Send a personalized proposal. Accept or reject incoming ones. Build real learning partnerships.' },
  { icon: '📓', title: 'Learning Journal', desc: 'Log every session. Track hours, mood, and progress across all your active exchanges.' },
  { icon: '🏅', title: 'Earn Badges', desc: 'Unlock achievements as you teach, learn, match, and journal. Show off your dedication.' },
  { icon: '🌍', title: 'Community Driven', desc: 'No money, no gatekeeping — just people sharing what they know with people who care.' },
];

const SKILLS_DEMO = ['React', 'Python', 'Guitar', 'Spanish', 'UI Design', 'Machine Learning', 'Photography', 'Chess', 'Yoga', 'Data Science'];

const LandingPage = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <header className="landing-header">
        <div className="landing-logo">🌿 <span>SkillNest</span></div>
        <div className="landing-header-actions">
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge fade-in">✨ Peer-to-peer skill exchange</div>
        <h1 className="hero-title fade-in">
          Trade Skills.<br />
          <span className="gradient-text">Grow Together.</span>
        </h1>
        <p className="hero-subtitle fade-in-delay-1">
          SkillNest matches you with people who teach what you want to learn — and want to learn what you teach. No money. Just knowledge.
        </p>
        <div className="hero-cta fade-in-delay-2">
          <Link to="/register" className="btn btn-primary btn-lg">Start Exchanging →</Link>
          <Link to="/login" className="btn btn-secondary btn-lg">I have an account</Link>
        </div>

        {/* Floating skill chips */}
        <div className="hero-skills fade-in-delay-3">
          {SKILLS_DEMO.map((s, i) => (
            <span key={s} className="hero-skill-chip" style={{ animationDelay: `${i * 0.1}s` }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats fade-in">
        <div className="landing-stat"><span>100%</span><p>Free forever</p></div>
        <div className="landing-stat-divider" />
        <div className="landing-stat"><span>∞</span><p>Skills to explore</p></div>
        <div className="landing-stat-divider" />
        <div className="landing-stat"><span>🌍</span><p>Global community</p></div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2 className="section-title">Everything you need to <span className="gradient-text">skill up</span></h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <h2 className="section-title">How it <span className="gradient-text">works</span></h2>
        <div className="steps">
          {[
            { n: '01', title: 'Create your profile', desc: 'Add skills you can teach and skills you want to learn.' },
            { n: '02', title: 'Discover matches', desc: 'Browse smart-matched users scored by skill compatibility.' },
            { n: '03', title: 'Propose an exchange', desc: 'Send a proposal specifying what you\'ll teach and learn.' },
            { n: '04', title: 'Track your journey', desc: 'Log sessions, earn badges, and watch yourself grow.' },
          ].map((step, i) => (
            <div key={step.n} className="step-card glass-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="step-number">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-glow" />
        <h2>Ready to start learning?</h2>
        <p>Join SkillNest and find your perfect skill partner today.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create Free Account →</Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>🌿 SkillNest</span>
        <span>Built with ❤️ using MERN stack</span>
      </footer>
    </div>
  );
};

export default LandingPage;
