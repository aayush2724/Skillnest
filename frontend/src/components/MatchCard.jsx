import SkillTag from './SkillTag';
import './MatchCard.css';

const STATUS_COLORS = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: '⏳ Pending' },
  accepted: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: '✅ Accepted' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: '❌ Rejected' },
};

const MatchCard = ({ match, currentUserId, onAccept, onReject, onCancel }) => {
  const isRequester = match.requester?._id === currentUserId;
  const other = isRequester ? match.receiver : match.requester;
  const status = STATUS_COLORS[match.status];
  const initials = other?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="match-card glass-card fade-in">
      {/* Status badge */}
      <div
        className="match-status-badge"
        style={{ color: status.color, background: status.bg, borderColor: status.color + '33' }}
      >
        {status.label}
      </div>

      {/* User info */}
      <div className="match-card-header">
        <div className="avatar" style={{ background: other?.avatarColor || '#7C3AED' }}>
          {initials}
        </div>
        <div>
          <h3 className="match-card-name">{other?.name}</h3>
          <p className="match-card-role">
            {isRequester ? 'You proposed to them' : 'They proposed to you'}
          </p>
        </div>
      </div>

      {/* Exchange details */}
      <div className="match-exchange">
        <div className="exchange-item">
          <span className="exchange-label">You teach</span>
          <SkillTag label={match.teachSkill} type="teach" />
        </div>
        <div className="exchange-arrow">⇄</div>
        <div className="exchange-item">
          <span className="exchange-label">You learn</span>
          <SkillTag label={match.learnSkill} type="learn" />
        </div>
      </div>

      {/* Message */}
      {match.message && (
        <div className="match-message">
          <span className="exchange-label">Message</span>
          <p>"{match.message}"</p>
        </div>
      )}

      {/* Actions */}
      {match.status === 'pending' && (
        <div className="match-actions">
          {!isRequester && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => onAccept(match._id)}>
                ✅ Accept
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onReject(match._id)}>
                ❌ Reject
              </button>
            </>
          )}
          {isRequester && (
            <button className="btn btn-secondary btn-sm" onClick={() => onCancel(match._id)}>
              🗑 Cancel
            </button>
          )}
        </div>
      )}

      {/* Time */}
      <p className="match-time">
        {new Date(match.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
};

export default MatchCard;
