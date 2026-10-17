
import { useState } from 'react';
import './Navbar.css';

const navigationByRole = {
  urban: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'My Listings', href: '#my-listings' },
    { label: 'Requests', href: '#requests' },
    { label: 'Profile', href: '#profile' },
  ],
  cooperative: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Available Requests', href: '#available-requests' },
    { label: 'Accepted Pickups', href: '#accepted-pickups' },
    { label: 'Profile', href: '#profile' },
  ],
  admin: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Users', href: '#users' },
    { label: 'Listings', href: '#listings' },
    { label: 'Reports', href: '#reports' },
  ],
};

function normalizeRole(role = '') {
  const value = role.toLowerCase();

  if (value.includes('admin')) return 'admin';
  if (value.includes('cooperative') || value.includes('coordinator')) {
    return 'cooperative';
  }

  return 'urban';
}

export default function Navbar({
  role = 'public',
  user = null,
  onLogout,
  onNavigate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const normalizedRole = normalizeRole(role);
  const isPublic = !user || role.toLowerCase() === 'public';

  const links = isPublic
    ? [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'How It Works', href: '#how-it-works' },
      ]
    : navigationByRole[normalizedRole];

  const userName =
    user?.name || user?.fullName || user?.username || user?.email || 'User';

  const userRoleLabel = {
    urban: 'Urban Waste Generator',
    cooperative: 'Cooperative Coordinator',
    admin: 'Administrator',
  }[normalizedRole];

  const navigate = (href, label) => {
    setMenuOpen(false);
    setProfileOpen(false);
    setJoinOpen(false);

    if (onNavigate) {
      onNavigate(label, href);
    } else if (href.startsWith('#')) {
      window.location.hash = href;
    }
  };

  return (
    <header className="eco-navbar">
      <div className="eco-nav-inner">
        <a
          className="eco-brand"
          href="/"
          onClick={(event) => {
            if (onNavigate) {
              event.preventDefault();
              navigate('#home', 'Home');
            }
          }}
        >
          <span className="eco-brand-icon">🌱</span>
          <span className="eco-brand-copy">
            <strong>EcoConnect</strong>
            <small>Waste less. Empower more.</small>
          </span>
        </a>

        <nav className={`eco-nav-links ${menuOpen ? 'is-open' : ''}`}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                navigate(link.href, link.label);
              }}
            >
              {link.label}
            </a>
          ))}

          {isPublic && (
            <div className="eco-nav-action-wrap">
              <button
                className="eco-join-button"
                onClick={() => setJoinOpen((open) => !open)}
                aria-expanded={joinOpen}
              >
                Join Now 
              </button>

              {joinOpen && (
                <div className="eco-dropdown eco-join-dropdown">
                  <button onClick={() => navigate('/login', 'Login')}>
                    Login
                  </button>
                  <button onClick={() => navigate('/register', 'Register')}>
                    Register
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {!isPublic && (
          <div className="eco-profile-wrap">
            <button
              className="eco-profile-button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-label="Open user profile menu"
            >
              <span className="eco-avatar">
                {userName.charAt(0).toUpperCase()}
              </span>
              <span className="eco-profile-name">{userName}</span>
              <span aria-hidden="true">⌄</span>
            </button>

            {profileOpen && (
              <div className="eco-dropdown eco-profile-dropdown">
                <div className="eco-profile-summary">
                  <strong>{userName}</strong>
                  <span>{userRoleLabel}</span>
                </div>

                <button onClick={() => navigate('#profile', 'Profile')}>
                  My Profile
                </button>

                {onLogout && (
                  <button
                    className="eco-logout-button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className="eco-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
