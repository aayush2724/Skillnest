import { useState } from 'react';

const SkillTag = ({ label, type = 'teach', removable = false, onRemove }) => {
  const [hover, setHover] = useState(false);
  return (
    <span
      className={`tag tag-${type} ${removable ? 'tag-removable' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={removable ? onRemove : undefined}
      title={removable ? `Remove ${label}` : undefined}
    >
      {type === 'teach' ? '🎯' : '📖'} {label}
      {removable && <span style={{ marginLeft: 2, opacity: hover ? 1 : 0.5 }}>×</span>}
    </span>
  );
};

export default SkillTag;
