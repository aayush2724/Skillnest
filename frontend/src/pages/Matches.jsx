import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MatchCard from '../components/MatchCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get('/matches')
      .then(r => setMatches(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateMatchStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/matches/${id}`, { status });
      setMatches(prev => prev.map(m => m._id === id ? data : m));
      showToast(status === 'accepted' ? '✅ Exchange accepted!' : '❌ Exchange rejected');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const cancelMatch = async (id) => {
    try {
      await api.delete(`/matches/${id}`);
      setMatches(prev => prev.filter(m => m._id !== id));
      showToast('Match cancelled');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const pending   = matches.filter(m => m.status === 'pending');
  const accepted  = matches.filter(m => m.status === 'accepted');
  const rejected  = matches.filter(m => m.status === 'rejected');

  const tabData = { pending, accepted, rejected };
  const currentList = tabData[tab] || [];

  const TAB_LABELS = [
    { key: 'pending',  label: `⏳ Pending (${pending.length})` },
    { key: 'accepted', label: `✅ Active (${accepted.length})` },
    { key: 'rejected', label: `❌ Rejected (${rejected.length})` },
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header fade-in">
          <h1>🤝 My <span className="gradient-text">Matches</span></h1>
          <p>Manage your skill exchange proposals and active partnerships.</p>
        </div>

        {/* Tabs */}
        <div className="tab-group fade-in">
          {TAB_LABELS.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : currentList.length > 0 ? (
          <div className="grid-2 fade-in">
            {currentList.map(m => (
              <MatchCard
                key={m._id}
                match={m}
                currentUserId={user?._id}
                onAccept={(id) => updateMatchStatus(id, 'accepted')}
                onReject={(id) => updateMatchStatus(id, 'rejected')}
                onCancel={cancelMatch}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card fade-in">
            <div className="empty-icon">
              {tab === 'pending' ? '⏳' : tab === 'accepted' ? '🌱' : '📭'}
            </div>
            <h3>
              {tab === 'pending' ? 'No pending requests' :
               tab === 'accepted' ? 'No active exchanges yet' : 'No rejected requests'}
            </h3>
            <p>
              {tab === 'pending' ? 'Head to Discover to propose skill exchanges with others.' :
               tab === 'accepted' ? 'Accept a proposal to start your first skill exchange!' : 'Clean slate!'}
            </p>
          </div>
        )}

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </main>
    </div>
  );
};

export default Matches;
