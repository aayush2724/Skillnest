import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SkillTag from '../components/SkillTag';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const SUGGESTED_TEACH = ['React', 'Python', 'Node.js', 'UI Design', 'Machine Learning', 'Guitar', 'Spanish', 'Chess', 'Photography', 'Yoga'];
const SUGGESTED_LEARN = ['JavaScript', 'Data Science', 'Public Speaking', 'Drawing', 'Video Editing', 'Cooking', 'French', 'Finance', 'Writing'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', bio: '', skillsToTeach: [], skillsToLearn: [] });
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skillsToTeach: user.skillsToTeach || [],
        skillsToLearn: user.skillsToLearn || [],
      });
    }
  }, [user]);

  const addSkill = (type, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = type === 'teach' ? 'skillsToTeach' : 'skillsToLearn';
    if (form[key].includes(trimmed)) return;
    setForm(prev => ({ ...prev, [key]: [...prev[key], trimmed] }));
    if (type === 'teach') setTeachInput('');
    else setLearnInput('');
  };

  const removeSkill = (type, skill) => {
    const key = type === 'teach' ? 'skillsToTeach' : 'skillsToLearn';
    setForm(prev => ({ ...prev, [key]: prev[key].filter(s => s !== skill) }));
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(type, type === 'teach' ? teachInput : learnInput);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data);
      showToast('✅ Profile saved!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header fade-in">
          <h1>✨ Your <span className="gradient-text">Profile</span></h1>
          <p>Define your skills — what you can teach and what you want to learn.</p>
        </div>

        <div className="profile-layout fade-in">
          {/* Left: avatar + badges */}
          <div className="profile-sidebar">
            <div className="profile-avatar-card glass-card">
              <div className="avatar avatar-lg" style={{ background: user?.avatarColor, margin: '0 auto 12px' }}>
                {initials}
              </div>
              <h3 style={{ textAlign: 'center', fontWeight: 700 }}>{user?.name}</h3>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>

              {user?.badges?.length > 0 && (
                <div className="profile-badges">
                  <p className="section-micro-label">Badges Earned</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {user.badges.map((b, i) => (
                      <span key={i} className="badge-pill">{b.icon} {b.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skill summary */}
            <div className="glass-card profile-summary-card">
              <p className="section-micro-label">Teaching</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {form.skillsToTeach.length > 0
                  ? form.skillsToTeach.map(s => <SkillTag key={s} label={s} type="teach" />)
                  : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None added yet</span>}
              </div>
              <p className="section-micro-label">Learning</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.skillsToLearn.length > 0
                  ? form.skillsToLearn.map(s => <SkillTag key={s} label={s} type="learn" />)
                  : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None added yet</span>}
              </div>
            </div>
          </div>

          {/* Right: edit form */}
          <div className="profile-form glass-card">
            <div className="input-group">
              <label>Display Name</label>
              <input className="input" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} id="profile-name" />
            </div>
            <div className="input-group">
              <label>Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(max 300 chars)</span></label>
              <textarea className="input" rows={3} maxLength={300}
                placeholder="Tell others about yourself, your experience, and what you're passionate about..."
                value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} id="profile-bio" />
            </div>

            {/* Teach skills */}
            <div className="input-group">
              <label>Skills I Can Teach 🎯</label>
              <div className="skill-input-row">
                <input
                  className="input"
                  placeholder="Type a skill and press Enter..."
                  value={teachInput}
                  onChange={e => setTeachInput(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, 'teach')}
                  id="teach-skills-input"
                />
                <button className="btn btn-primary btn-sm" onClick={() => addSkill('teach', teachInput)}>Add</button>
              </div>
              <div className="tag-wrap" style={{ marginTop: 8 }}>
                {form.skillsToTeach.map(s => (
                  <SkillTag key={s} label={s} type="teach" removable onRemove={() => removeSkill('teach', s)} />
                ))}
              </div>
              <div className="suggestions">
                <span className="suggestions-label">Suggestions:</span>
                {SUGGESTED_TEACH.filter(s => !form.skillsToTeach.includes(s)).slice(0, 5).map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => addSkill('teach', s)}>{s} +</button>
                ))}
              </div>
            </div>

            {/* Learn skills */}
            <div className="input-group">
              <label>Skills I Want to Learn 📖</label>
              <div className="skill-input-row">
                <input
                  className="input"
                  placeholder="Type a skill and press Enter..."
                  value={learnInput}
                  onChange={e => setLearnInput(e.target.value)}
                  onKeyDown={e => handleKeyDown(e, 'learn')}
                  id="learn-skills-input"
                />
                <button className="btn btn-secondary btn-sm" onClick={() => addSkill('learn', learnInput)}>Add</button>
              </div>
              <div className="tag-wrap" style={{ marginTop: 8 }}>
                {form.skillsToLearn.map(s => (
                  <SkillTag key={s} label={s} type="learn" removable onRemove={() => removeSkill('learn', s)} />
                ))}
              </div>
              <div className="suggestions">
                <span className="suggestions-label">Suggestions:</span>
                {SUGGESTED_LEARN.filter(s => !form.skillsToLearn.includes(s)).slice(0, 5).map(s => (
                  <button key={s} className="suggestion-chip suggestion-chip-learn" onClick={() => addSkill('learn', s)}>{s} +</button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-profile-btn">
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </main>
    </div>
  );
};

export default Profile;
