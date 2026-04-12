import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [smartMatches, setSmartMatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [matchRes, logStatsRes, myMatchRes] = await Promise.all([
          api.get('/users/smart-matches'),
          api.get('/logs/stats'),
          api.get('/matches')
        ]);
        setSmartMatches(matchRes.data.slice(0, 6));
        setStats(logStatsRes.data);
        setMyMatches(myMatchRes.data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const alreadyMatchedIds = myMatches.map(m =>
    m.requester?._id === user?._id ? m.receiver?._id : m.requester?._id
  );

  const handlePropose = async (targetUser) => {
    try {
      const teach = user.skillsToTeach[0] || 'a skill';
      const learn = user.skillsToLearn[0] || 'a skill';
      await api.post('/matches', {
        receiverId: targetUser._id,
        teachSkill: teach,
        learnSkill: learn,
        message: `Hey! I'd love to exchange ${teach} for ${learn}.`
      });
      showToast(`Proposal sent to ${targetUser.name}! 🎉`);
      setMyMatches(prev => [...prev, { requester: { _id: user._id }, receiver: { _id: targetUser._id }, status: 'pending' }]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send proposal', 'error');
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const pendingReceived = myMatches.filter(m => m.receiver?._id === user?._id && m.status === 'pending');
  const acceptedMatches = myMatches.filter(m => m.status === 'accepted');

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">

        {/* Welcome */}
        <div className="dashboard-hero fade-in">
          <div className="dashboard-welcome">
            <div className="avatar avatar-lg" style={{ background: user?.avatarColor }}>
              {initials}
            </div>
            <div>
              <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋</h1>
              <p className="text-secondary">
                {user?.skillsToTeach?.length > 0
                  ? `You teach ${user.skillsToTeach.length} skill${user.skillsToTeach.length > 1 ? 's' : ''} · ${user.skillsToLearn.length} to learn`
                  : '👆 Head to Profile to add your skills and unlock matches'}
              </p>
            </div>
          </div>

          {/* Badges */}
          {user?.badges?.length > 0 && (
            <div className="dashboard-badges">
              {user.badges.map((b, i) => (
                <span key={i} className="badge-pill" title={b.name}>{b.icon} {b.name}</span>
              ))}
            </div>
          )}
        </div>

        {/* Stat row */}
        <div className="dash-stats fade-in-delay-1">
          <div className="stat-card">
            <div className="stat-value">{myMatches.filter(m => m.status === 'accepted').length}</div>
            <div className="stat-label">Active Exchanges</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pendingReceived.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalHours?.toFixed(1) || 0}</div>
            <div className="stat-label">Hours Logged</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalLogs || 0}</div>
            <div className="stat-label">Journal Entries</div>
          </div>
        </div>

        {/* Pending requests alert */}
        {pendingReceived.length > 0 && (
          <div className="dash-alert fade-in-delay-2">
            <span>🔔</span>
            <p>You have <strong>{pendingReceived.length}</strong> pending exchange request{pendingReceived.length > 1 ? 's' : ''} waiting for your response.</p>
            <Link to="/matches" className="btn btn-primary btn-sm">View Requests</Link>
          </div>
        )}

        {/* Smart Matches */}
        <div className="fade-in-delay-2">
          <div className="section-header">
            <h2>⚡ Smart Matches</h2>
            <Link to="/discover" className="btn btn-secondary btn-sm">Browse All</Link>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : smartMatches.length > 0 ? (
            <div className="grid-2">
              {smartMatches.map(u => (
                <SkillCard
                  key={u._id}
                  user={u}
                  onPropose={handlePropose}
                  alreadyMatched={alreadyMatchedIds.includes(u._id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <div className="empty-icon">🌱</div>
              <h3>No matches yet</h3>
              <p>Add skills to your profile and we'll surface your best matches here.</p>
              <Link to="/profile" className="btn btn-primary">Update Profile →</Link>
            </div>
          )}
        </div>

        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
