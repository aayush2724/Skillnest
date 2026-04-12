import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Discover = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const [proposal, setProposal] = useState({ teachSkill: '', learnSkill: '', message: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const params = q ? { search: q } : {};
      const [usersRes, matchRes] = await Promise.all([
        api.get('/users', { params }),
        api.get('/matches')
      ]);
      setUsers(usersRes.data);
      setMyMatches(matchRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = e => {
    const v = e.target.value;
    setSearch(v);
    const timer = setTimeout(() => fetchUsers(v), 400);
    return () => clearTimeout(timer);
  };

  const alreadyMatchedIds = myMatches.map(m =>
    m.requester?._id === user?._id ? m.receiver?._id : m.requester?._id
  );

  const openModal = (targetUser) => {
    setModalUser(targetUser);
    setProposal({
      teachSkill: user?.skillsToTeach?.[0] || '',
      learnSkill: user?.skillsToLearn?.[0] || '',
      message: ''
    });
  };

  const submitProposal = async () => {
    if (!proposal.teachSkill || !proposal.learnSkill)
      return showToast('Please fill in both skills', 'error');
    try {
      await api.post('/matches', {
        receiverId: modalUser._id,
        teachSkill: proposal.teachSkill,
        learnSkill: proposal.learnSkill,
        message: proposal.message
      });
      showToast(`Exchange proposed to ${modalUser.name}! 🎉`);
      setMyMatches(prev => [...prev, { requester: { _id: user._id }, receiver: { _id: modalUser._id }, status: 'pending' }]);
      setModalUser(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page-content">
        <div className="page-header fade-in">
          <h1>🔍 Discover <span className="gradient-text">People</span></h1>
          <p>Find everyone on SkillNest — search by name or any skill.</p>
        </div>

        {/* Search */}
        <div className="search-bar fade-in" style={{ marginBottom: 28, maxWidth: 480 }}>
          <span className="search-icon">🔍</span>
          <input
            className="input"
            placeholder="Search by name or skill..."
            value={search}
            onChange={handleSearch}
            id="discover-search"
          />
        </div>

        {loading ? (
          <div className="spinner" />
        ) : users.length > 0 ? (
          <div className="grid-2 fade-in">
            {users.map(u => (
              <SkillCard
                key={u._id}
                user={u}
                onPropose={openModal}
                alreadyMatched={alreadyMatchedIds.includes(u._id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-card">
            <div className="empty-icon">🌐</div>
            <h3>No users found</h3>
            <p>Try a different search term or invite friends to join SkillNest!</p>
          </div>
        )}

        {/* Proposal Modal */}
        {modalUser && (
          <div className="modal-overlay" onClick={() => setModalUser(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h2>🤝 Propose Exchange</h2>
              <p>Send a skill swap request to <strong>{modalUser.name}</strong></p>

              <div className="input-group">
                <label>I will teach</label>
                <input
                  className="input"
                  placeholder="e.g. React, Guitar, Spanish..."
                  value={proposal.teachSkill}
                  onChange={e => setProposal(p => ({ ...p, teachSkill: e.target.value }))}
                  id="teach-skill-input"
                />
              </div>
              <div className="input-group">
                <label>I want to learn</label>
                <input
                  className="input"
                  placeholder="e.g. Python, Yoga, Chess..."
                  value={proposal.learnSkill}
                  onChange={e => setProposal(p => ({ ...p, learnSkill: e.target.value }))}
                  id="learn-skill-input"
                />
              </div>
              <div className="input-group">
                <label>Message (optional)</label>
                <textarea
                  className="input"
                  placeholder="Introduce yourself and why you'd like to exchange..."
                  value={proposal.message}
                  onChange={e => setProposal(p => ({ ...p, message: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={submitProposal}>Send Proposal 🚀</button>
                <button className="btn btn-secondary" onClick={() => setModalUser(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      </main>
    </div>
  );
};

export default Discover;
