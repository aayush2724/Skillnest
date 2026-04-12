import { useState } from 'react';
import SkillTag from './SkillTag';
import './SkillCard.css';

const SkillCard = ({ user, onPropose, alreadyMatched = false }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const matchPct = Math.min(100, ((user.matchScore || 0) / 6) * 100);

  return (
    <div className={`skill-card glass-card fade-in ${expanded ? 'expanded' : ''}`}>
      {/* Match score badge */}
      {user.matchScore > 0 && (
        <div className="match-score-badge">
          ⚡ {Math.round(matchPct)}% match
        </div>
      )}

      {/* Header */}
      <div className="skill-card-header">
        <div className="avatar" style={{ background: user.avatarColor || '#7C3AED' }}>
          {initials}
        </div>
        <div>
          <h3 className="skill-card-name">{user.name}</h3>
          {user.bio && <p className="skill-card-bio">{user.bio.slice(0, 60)}{user.bio.length > 60 ? '...' : ''}</p>}
        </div>
      </div>

      {/* Match bar */}
      {user.matchScore > 0 && (
        <div className="match-score-bar" title={`${Math.round(matchPct)}% skill match`}>
          <div className="match-score-fill" style={{ width: `${matchPct}%` }} />
        </div>
      )}

      {/* Skills */}
      <div className="skill-card-skills">
        <div className="skill-section">
          <span className="skill-label">Teaches</span>
          <div className="tag-wrap">
            {user.skillsToTeach?.length > 0
              ? user.skillsToTeach.map(s => <SkillTag key={s} label={s} type="teach" />)
              : <span className="no-skills">Nothing listed</span>}
          </div>
        </div>
        <div className="skill-section">
          <span className="skill-label">Wants to learn</span>
          <div className="tag-wrap">
            {user.skillsToLearn?.length > 0
              ? user.skillsToLearn.map(s => <SkillTag key={s} label={s} type="learn" />)
              : <span className="no-skills">Nothing listed</span>}
          </div>
        </div>
      </div>

      {/* Badges */}
      {user.badges?.length > 0 && (
        <div className="skill-card-badges">
          {user.badges.map((b, i) => (
            <span key={i} className="badge-pill" title={b.name}>{b.icon}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      {onPropose && (
        <button
          className={`btn btn-primary btn-sm ${alreadyMatched ? 'btn-disabled' : ''}`}
          onClick={() => !alreadyMatched && onPropose(user)}
          disabled={alreadyMatched}
          style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
        >
          {alreadyMatched ? '✅ Already Proposed' : '🤝 Propose Exchange'}
        </button>
      )}
    </div>
  );
};

export default SkillCard;
