import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate('/profile');  // send new users to profile to add skills
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-box glass-card fade-in">
        <Link to="/" className="auth-back">← Back to home</Link>
        <div className="auth-logo">🌿 SkillNest</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join the community — it's free and always will be.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" className="input" placeholder="Alex Johnson"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
