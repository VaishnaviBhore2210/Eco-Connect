
import { useState } from 'react';
import './Navbar.css';

const navigationByRole = {
  URBAN_WASTE_GENERATOR: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Find Cooperatives', href: '#cooperatives' },
    { label: 'Waste Guide', href: '#waste-guide' },
    { label: 'Impact & Reports', href: '#impact-reports' },
  ],
  COOPERATIVE_COORDINATOR: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Available Requests', href: '#available-requests' },
    { label: 'Accepted Pickups', href: '#accepted-pickups' },
    { label: 'Profile', href: '#profile' },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Users', href: '#users' },
    { label: 'Listings', href: '#listings' },
    { label: 'Reports', href: '#reports' },
  ],
};

const roleLabels = {
  URBAN_WASTE_GENERATOR: 'Urban Waste Generator',
  COOPERATIVE_COORDINATOR: 'Cooperative Coordinator',
  ADMIN: 'Administrator',
};

export default function Navbar({
  role = 'public',
  user = null,
  onLogout,
  onNavigate,
  activeSection = 'dashboard',
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const normalizedRole = String(role).toUpperCase();
  const isPublic = !user || normalizedRole === 'PUBLIC';

  const links = isPublic
    ? [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'How It Works', href: '#how-it-works' },
      ]
    : navigationByRole[normalizedRole] || [];

  const userName =
    user?.fullName || user?.name || user?.email || 'User';

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
              navigate('#dashboard', 'Dashboard');
            }
          }}
        >
          <span className="eco-brand-icon">🌱</span>
          <span className="eco-brand-copy">
            <strong>EcoConnect</strong>
            <small>Waste less. Empower more.</small>
          </span>
        </a>

        <nav
          className={`eco-nav-links ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          {links.map((link) => {
            const section = link.href.replace('#', '');

            return (
              <a
                key={link.label}
                href={link.href}
                className={
                  !isPublic && activeSection === section
                    ? 'active'
                    : ''
                }
                aria-current={
                  !isPublic && activeSection === section
                    ? 'page'
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  navigate(link.href, link.label);
                }}
              >
                {link.label}
              </a>
            );
          })}

          {isPublic && (
            <div className="eco-nav-action-wrap">
              <button
                type="button"
                className="eco-join-button"
                onClick={() => setJoinOpen((open) => !open)}
                aria-expanded={joinOpen}
              >
                Join Now
              </button>

              {joinOpen && (
                <div className="eco-dropdown eco-join-dropdown">
                  <button
                    type="button"
                    onClick={() => navigate('/login', 'Login')}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register', 'Register')}
                  >
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
              type="button"
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
                  <span>{roleLabels[normalizedRole] || 'User'}</span>
                  <span>{user?.email}</span>
                </div>

                {normalizedRole !== 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => navigate('#profile', 'Profile')}
                  >
                    My Profile
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    className="eco-logout-button"
                    onClick={() => {
                      setProfileOpen(false);
                      setMenuOpen(false);
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
          type="button"
          className="eco-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={
            menuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
