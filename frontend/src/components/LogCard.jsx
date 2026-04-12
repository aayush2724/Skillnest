import './LogCard.css';

const MOOD_MAP = {
  great: { emoji: '🚀', label: 'Great', cls: 'mood-great' },
  good:  { emoji: '😊', label: 'Good',  cls: 'mood-good'  },
  okay:  { emoji: '😐', label: 'Okay',  cls: 'mood-okay'  },
  tough: { emoji: '😓', label: 'Tough', cls: 'mood-tough'  },
};

const LogCard = ({ log, onDelete }) => {
  const mood = MOOD_MAP[log.mood] || MOOD_MAP.good;

  return (
    <div className="log-card glass-card fade-in">
      {/* Header row */}
      <div className="log-card-header">
        <div className="log-skill-chip">📖 {log.skill}</div>
        <div className={`log-mood ${mood.cls}`} title={`Mood: ${mood.label}`}>
          {mood.emoji} {mood.label}
        </div>
      </div>

      <h3 className="log-title">{log.title}</h3>
      <p className="log-content">{log.content}</p>

      {/* Footer */}
      <div className="log-footer">
        <span className="log-hours">⏱ {log.hoursSpent}h</span>
        <span className="log-date">
          {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {onDelete && (
          <button className="log-delete-btn" onClick={() => onDelete(log._id)} title="Delete log">
            🗑
          </button>
        )}
      </div>
    </div>
  );
};

export default LogCard;
