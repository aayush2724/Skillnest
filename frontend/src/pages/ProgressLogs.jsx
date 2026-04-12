import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LogCard from '../components/LogCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ProgressLogs.css';

const MOODS = ['great', 'good', 'okay', 'tough'];
const MOOD_EMOJIS = { great: '🚀', good: '😊', okay: '😐', tough: '😓' };

const ProgressLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', skill: '', hoursSpent: 1, mood: 'good' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([api.get('/logs'), api.get('/logs/stats')]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'hoursSpent' ? Number(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.content || !form.skill)
      return showToast('Please fill in all required fields', 'error');
    setSubmitting(true);
    try {
      const { data } = await api.post('/logs', form);
      setLogs(prev => [data, ...prev]);
      setForm({ title: '', content: '', skill: '', hoursSpent: 1, mood: 'good' });
      setShowForm(false);
      fetchData(); // refresh stats + badges
      showToast('✍️ Entry saved!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/logs/${id}`);
      setLogs(prev => prev.filter(l => l._id !== id));
      showToast('Log deleted');
      fetchData();
    } catch { showToast('Failed to delete', 'error'); }
  };

  const topSkill = stats?.skillBreakdown
    ? Object.entries(stats.skillBreakdown).sort((a, b) => b[1] - a[1])[0]
    : null;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header fade-in">
          <h1>📓 Learning <span className="gradient-text">Journal</span></h1>
          <p>Track every session, log your progress, and celebrate growth.</p>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="logs-stats fade-in">
            <div className="stat-card">
              <div className="stat-value">{stats.totalLogs}</div>
              <div className="stat-label">Total Entries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalHours?.toFixed(1) || 0}h</div>
              <div className="stat-label">Hours Logged</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{topSkill ? topSkill[0] : '—'}</div>
              <div className="stat-label">Top Skill</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.moodBreakdown
                  ? MOOD_EMOJIS[Object.entries(stats.moodBreakdown).sort((a,b) => b[1]-a[1])[0]?.[0]] || '😊'
                  : '😊'}
              </div>
              <div className="stat-label">Prevailing Mood</div>
            </div>
          </div>
        )}

        {/* Add Entry Button / Form */}
        <div className="fade-in-delay-1">
          {!showForm ? (
            <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginBottom: 24 }}>
              ✍️ Add Journal Entry
            </button>
          ) : (
            <div className="log-form-card glass-card fade-in">
              <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700 }}>New Entry</h3>
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Session Title *</label>
                  <input name="title" className="input" placeholder="e.g. First React hooks session"
                    value={form.title} onChange={handleChange} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group">
                    <label>Skill *</label>
                    <input name="skill" className="input" placeholder="e.g. React"
                      value={form.skill} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>Hours Spent</label>
                    <input name="hoursSpent" type="number" min="0.5" max="24" step="0.5" className="input"
                      value={form.hoursSpent} onChange={handleChange} />
                  </div>
                </div>
                <div className="input-group">
                  <label>How did it go? *</label>
                  <textarea name="content" className="input" rows={3}
                    placeholder="What did you learn? What was challenging? Any breakthroughs?"
                    value={form.content} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Session Mood</label>
                  <div className="mood-picker">
                    {MOODS.map(m => (
                      <button key={m} type="button"
                        className={`mood-btn ${form.mood === m ? 'active' : ''}`}
                        onClick={() => setForm(p => ({ ...p, mood: m }))}>
                        {MOOD_EMOJIS[m]} {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : '💾 Save Entry'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Log list */}
        {loading ? (
          <div className="spinner" />
        ) : logs.length > 0 ? (
          <div className="grid-2 fade-in-delay-2">
            {logs.map(l => <LogCard key={l._id} log={l} onDelete={handleDelete} />)}
          </div>
        ) : (
          <div className="empty-state glass-card fade-in">
            <div className="empty-icon">📓</div>
            <h3>No journal entries yet</h3>
            <p>Start logging your learning sessions to track your progress and earn badges.</p>
          </div>
        )}

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </main>
    </div>
  );
};

export default ProgressLogs;
