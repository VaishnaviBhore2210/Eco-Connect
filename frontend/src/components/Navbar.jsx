
import { useEffect, useRef, useState } from 'react';
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
    { label: 'Pickup Schedule', href: '#pickup-schedule' },
    { label: 'Waste Processing', href: '#waste-processing' },
    { label: 'Inventory', href: '#inventory' },
    { label: 'Collection History', href: '#collection-history' },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Approvals', href: '#approvals' },
    { label: 'Pickups', href: '#pickups' },
    { label: 'Complaints', href: '#complaints' },
    { label: 'Impact', href: '#impact' },
  ],
};

const roleLabels = {
  URBAN_WASTE_GENERATOR: 'Urban Waste Generator',
  COOPERATIVE_COORDINATOR: 'Cooperative Coordinator',
  ADMIN: 'EcoConnect Administrator',
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
  const profileRef = useRef(null);
 

  const normalizedRole = String(role).toUpperCase();
  const isPublic = !user || normalizedRole === 'PUBLIC';
  const isAdmin = normalizedRole === 'ADMIN';
  const isCoordinator = normalizedRole === 'COOPERATIVE_COORDINATOR';

  const links = isPublic
    ? [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'How It Works', href: '#how-it-works' },
      ]
    : navigationByRole[normalizedRole] || [];

  const userName =
    user?.fullName || user?.name || user?.email || 'User';
  const firstName = userName.trim().split(/\s+/)[0] || 'User';
  const roleName = roleLabels[normalizedRole] || 'EcoConnect member';

  useEffect(() => {
    if (!profileOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileOpen]);

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
    <header className={`eco-navbar${isAdmin ? ' admin-navbar' : ''}${isCoordinator ? ' cooperative-navbar' : ''}`}>
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
          <div className="eco-profile-wrap" ref={profileRef}>
            <button
              type="button"
              className="eco-profile-button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label={`Open profile menu for ${userName}`}
            >
              <span className="eco-avatar">
                {firstName.charAt(0).toUpperCase()}
              </span>
              <span className="eco-profile-name">{firstName}</span>
              <span className="eco-profile-chevron" aria-hidden="true">⌄</span>
            </button>

            {profileOpen && (
              <div className="eco-dropdown eco-profile-dropdown" role="menu">
                <div className="eco-profile-summary">
                  <strong>{userName}</strong>
                  <span>{roleName}</span>
                  <span>{user?.email || 'Email not provided'}</span>
                </div>
                 
              {isAdmin && (
  <button
    type="button"
    role="menuitem"
    onClick={() => navigate('#platform-users', 'Platform Users')}
  >
    Platform Users
  </button>
)}   

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigate('#profile', 'Profile')}
                >
                  My Profile
                </button>

                {onLogout && (
                  <button
                    type="button"
                    className="eco-logout-button"
                    role="menuitem"
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
