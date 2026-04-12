import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/discover',  icon: '🔍', label: 'Discover' },
  { to: '/matches',   icon: '🤝', label: 'Matches' },
  { to: '/logs',      icon: '📓', label: 'My Journal' },
  { to: '/profile',   icon: '✨', label: 'Profile' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🌿</div>
        <span className="logo-text">SkillNest</span>
      </div>

      {/* User chip */}
      <div className="sidebar-user">
        <div className="avatar avatar-sm" style={{ background: user?.avatarColor || '#7C3AED' }}>
          {initials}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.name}</span>
          <span className="sidebar-user-sub">{user?.badges?.length || 0} badges</span>
        </div>
      </div>

      {/* Nav links */}
      <ul className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <span>🚪</span> Logout
      </button>
    </nav>
  );
};

export default Navbar;
