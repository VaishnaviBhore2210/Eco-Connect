import { useEffect, useState } from 'react'
import RegisterPage from './RegisterPage.jsx'
import './App.css'
import Navbar from './components/Navbar';
import Footer from './components/footer';


const roleLabels = {
  URBAN_WASTE_GENERATOR: 'Urban Waste Generator',
  COOPERATIVE_COORDINATOR: 'Cooperative Coordinator',
  ADMIN: 'Administrator',
}
const workflow = [
  { number: '01', title: 'Create a waste listing', text: 'Urban users add waste type, quantity, and pickup location in minutes.' },
  { number: '02', title: 'Match with a cooperative', text: 'EcoConnect helps coordinators find available waste listings that fit their location and capacity.' },
  { number: '03', title: 'Schedule and track pickup', text: 'Cooperatives accept requests and update collection progress from their dashboard.' },
  { number: '04', title: 'Measure impact', text: 'Generators and administrators track collection progress and community impact.' },
]
const initialMetrics = [
  { value: '50', label: 'households connected' },
  { value: '10', label: 'cooperatives active' },
  { value: '12T', label: 'organic waste diverted' },
  { value: '96%', label: 'pickup success rate' },
]

function HomePage({ onJoin, onListWaste }) {
  return <>
    <section className="hero-section" id="about">
      <div className="hero-copy">
        <p className="eyebrow">Sustainable waste coordination</p>
        <h1>Turn organic waste into community impact.</h1>
        <p className="lead">EcoConnect connects urban waste generators with rural women-led cooperatives to collect, process, and repurpose organic waste into valuable resources.</p>
        <div className="cta-row"><button className="primary-button" onClick={onListWaste}>List waste</button><button className="secondary-button" onClick={onJoin}>Join EcoConnect</button></div>
        <div className="stats-grid">{initialMetrics.map((metric) => <div className="stat-card" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>
      </div>
      <div className="hero-visual"><div className="visual-card highlight-card"><span className="card-label">EcoConnect workflow</span><h3>Organic waste, put to good use</h3><ul><li>Connect generators with cooperatives</li><li>Coordinate pickups</li><li>Measure community impact</li></ul></div><div className="mini-dashboard"><div className="dashboard-item"><span className="dashboard-tag success">Connected</span><strong>Waste meets the right partner</strong></div><div className="dashboard-item"><span className="dashboard-tag neutral">Impact</span><strong>Cleaner communities</strong></div></div></div>
    </section>
    <section className="role-section"><div className="section-heading"><p className="eyebrow">Built for the full ecosystem</p><h2>One platform, roles with a purpose.</h2></div><div className="role-grid"><article className="role-card"><div className="role-icon">🏙️</div><h3>Urban Waste Generator</h3><p>Create waste listings, follow pickup progress, and see your contribution to a circular economy.</p></article><article className="role-card"><div className="role-icon">🌾</div><h3>Cooperative Coordinator</h3><p>Review available listings, accept pickup requests, and update collection status.</p></article><article className="role-card"><div className="role-icon">🛠️</div><h3>Administrator</h3><p>Review platform activity and oversee waste listings and collection progress.</p></article></div></section>
    <section className="workflow-section" id="how-it-works"><div className="section-heading"><p className="eyebrow">How it works</p><h2>From waste listing to impact creation.</h2></div><div className="workflow-grid">{workflow.map((step) => <article className="workflow-card" key={step.number}><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>
    <section className="impact-section"><div className="impact-copy"><p className="eyebrow">Why EcoConnect matters</p><h2>Turning everyday organic waste into cleaner cities and stronger livelihoods.</h2><p>EcoConnect helps reduce landfill waste, improve local processing, and support cooperatives through coordinated collection.</p><ul className="feature-list"><li>Smart waste matching across locations</li><li>Pickup tracking and status visibility</li><li>Environmental impact reporting</li><li>Capacity-aware cooperative management</li></ul></div><div className="impact-panel"><div className="panel-box"><span>Step 01</span><strong>List</strong><small>Generators post available organic waste</small></div><div className="panel-box muted"><span>Step 02–03</span><strong>Collect</strong><small>Cooperatives coordinate and track pickup</small></div><div className="panel-box highlight"><span>Step 04</span><strong>Measure</strong><small>Track collection and community impact</small></div></div></section>
    <Footer />
  </>
}

function LoginPage({ onSubmit, error, busy, email, onEmailChange, onGoRegister }) {
  return <section className="auth-page-centered"><div className="auth-card-centered login-card-centered"><p className="eyebrow">Welcome back</p><h2>Login to EcoConnect</h2><p className="form-intro">Sign in to open the dashboard for your account.</p><form className="auth-form" onSubmit={onSubmit}><label>Email address<input name="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => onEmailChange(event.target.value)} required /></label><label>Password<input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" minLength="8" required /></label>{error && <p className="form-message error-message" role="alert">{error}</p>}<button type="submit" className="primary-button full-width" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="auth-switch-line">New to EcoConnect? <button className="inline-link" type="button" onClick={onGoRegister}>Create an account</button></p></div></section>
}

function AuthChoice({ onLogin, onRegister }) {
  return <section className="auth-page-centered"><div className="auth-card-centered auth-choice-card"><p className="eyebrow">Welcome to EcoConnect</p><h2>How would you like to continue?</h2><p className="form-intro">Sign in to your account or create a new one to get started.</p><button className="primary-button full-width auth-choice-button" onClick={onLogin}>Login to your account <span>→</span></button><button className="secondary-button full-width auth-choice-button" onClick={onRegister}>Create a new account <span>→</span></button></div></section>
}

function RoleChooser({ onChoose, onBack }) {
  const options = [
    { value: 'URBAN_WASTE_GENERATOR', icon: '🏙️', title: 'Urban Waste Generator', description: 'List organic waste and track pickups.' },
    { value: 'COOPERATIVE_COORDINATOR', icon: '🌾', title: 'Cooperative Coordinator', description: 'Coordinate collections and manage pickup requests.' },
  ]
  return <section className="auth-page-centered"><div className="auth-card-centered role-chooser-card"><p className="eyebrow">Create your account</p><h2>Choose your role</h2><p className="form-intro">Choose how you will use EcoConnect. Administrator access is managed separately.</p><div className="role-choice-list">{options.map((item) => <button type="button" key={item.value} className="role-choice" onClick={() => onChoose(item.value)}><span className="role-choice-icon">{item.icon}</span><span className="role-choice-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="role-choice-arrow">→</span></button>)}</div><button type="button" className="text-button" onClick={onBack}>← Back</button></div></section>
}

function RoleDashboard({ user, listings, onCreate, onChangeStatus, busy }) {
  const role = user?.role || 'URBAN_WASTE_GENERATOR'
  const isAdmin = role === 'ADMIN'
  const isCoordinator = role === 'COOPERATIVE_COORDINATOR'
  const ownHeading = isAdmin ? 'Administrator dashboard' : isCoordinator ? 'Cooperative dashboard' : 'Urban generator dashboard'
  const visibleListings = role === 'URBAN_WASTE_GENERATOR' ? listings.filter((item) => item.createdByEmail && item.createdByEmail.toLowerCase() === String(user?.email || '').toLowerCase()) : listings
  const count = (status) => visibleListings.filter((item) => String(item.status || '').toUpperCase() === status).length
  const completed = count('COLLECTED') + count('COMPLETED')
  return <section className="screen-shell role-dashboard-shell"><div className="dashboard-welcome"><div><p className="eyebrow">Your EcoConnect workspace</p><h1>{ownHeading}</h1><p>Welcome, {user?.fullName || 'EcoConnect member'}.</p></div></div><div className="dashboard-role-pill">{roleLabels[role] || roleLabels.URBAN_WASTE_GENERATOR} · {user?.email}</div><div className="dashboard-grid"><div className="panel-card stat-panel"><span>Total listings</span><strong>{visibleListings.length}</strong></div><div className="panel-card stat-panel"><span>Awaiting pickup</span><strong>{count('AVAILABLE') + count('PENDING')}</strong></div><div className="panel-card stat-panel"><span>In progress</span><strong>{count('ACCEPTED') + count('SCHEDULED') + count('IN_PROGRESS')}</strong></div><div className="panel-card stat-panel"><span>Collected</span><strong>{completed}</strong></div></div>
    {role === 'URBAN_WASTE_GENERATOR' && <div className="dashboard-action-banner"><div><h3>Create a waste listing</h3><p>Tell nearby cooperatives what organic waste is ready for collection.</p></div><button className="primary-button" onClick={onCreate}>+ Create listing</button></div>}
    {isCoordinator && <div className="dashboard-action-banner"><div><h3>Steps 02–03 · Match, schedule and track</h3><p>Review available waste, accept a request, and mark collections as in progress or collected.</p></div><span className="workflow-mini-badge">Coordinator tools</span></div>}
    {isAdmin && <div className="dashboard-action-banner"><div><h3>Platform oversight</h3><p>Review all listings and oversee matching and collection status across the platform.</p></div><span className="workflow-mini-badge">Admin tools</span></div>}
    <div className="section-heading dashboard-list-heading"><div><p className="eyebrow">Live platform data</p><h2>{isCoordinator ? 'Requests to coordinate' : isAdmin ? 'All waste listings' : 'Your waste community'}</h2></div></div>
    {busy ? <p className="form-intro">Loading waste listings…</p> : visibleListings.length === 0 ? <div className="empty-state panel-card"><span>♻️</span><h3>No waste listings yet</h3><p>{isCoordinator ? 'New listings from generators will appear here.' : 'Create the first listing to start the collection process.'}</p>{role === 'URBAN_WASTE_GENERATOR' && <button className="primary-button" onClick={onCreate}>Create a listing</button>}</div> : <div className="listing-grid">{visibleListings.map((item) => <article className="panel-card listing-card" key={item.id}><div className="listing-topline"><span className="listing-tag">{item.wasteType}</span><span className={`status-pill status-${String(item.status).toLowerCase()}`}>{String(item.status).replaceAll('_', ' ')}</span></div><h3>{item.quantityKg} kg</h3><p>{item.location}</p>{item.description && <p>{item.description}</p>}<div className="listing-meta"><span>Contact</span><strong>{item.contactName || 'EcoConnect user'}</strong></div>{(isCoordinator || isAdmin) && <div className="listing-status-actions">{String(item.status).toUpperCase() === 'AVAILABLE' && <button className="secondary-button" onClick={() => onChangeStatus(item.id, 'ACCEPTED')}>Accept pickup</button>}{['ACCEPTED', 'SCHEDULED'].includes(String(item.status).toUpperCase()) && <button className="secondary-button" onClick={() => onChangeStatus(item.id, 'IN_PROGRESS')}>Start pickup</button>}{String(item.status).toUpperCase() === 'IN_PROGRESS' && <button className="primary-button" onClick={() => onChangeStatus(item.id, 'COLLECTED')}>Mark collected</button>}</div>}</article>)}</div>}
  </section>
}

function CreateListing({ user, onCancel, onSubmit, saving, error }) {
  return <section className="auth-page-centered"><div className="auth-card-centered listing-form-centered"><p className="eyebrow">Step 01 · Share organic waste</p><h2>Create a waste listing</h2><form className="auth-form" onSubmit={onSubmit}><label>Waste type<select name="wasteType" required defaultValue=""><option value="" disabled>Select waste type</option><option>Food scraps</option><option>Garden waste</option><option>Fruit peels</option><option>Leaf litter</option><option>Other organic waste</option></select></label><label>Quantity (kg)<input name="quantityKg" type="number" min="0.1" step="0.1" required placeholder="e.g. 25" /></label><label>Pickup location<input name="location" required defaultValue={user?.location || ''} placeholder="Area, city" /></label><label>Contact name<input name="contactName" required defaultValue={user?.fullName || ''} placeholder="Your full name" /></label><label>Contact phone<input name="contactPhone" type="tel" required minLength="8" maxLength="20" placeholder="Enter a contact number" /></label><label>Additional details<textarea name="description" rows="3" maxLength="1000" placeholder="Add handling or pickup notes" /></label>{error && <p className="form-message error-message" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Submitting…' : 'Submit listing'}</button></div></form></div></section>
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [selectedRole, setSelectedRole] = useState('URBAN_WASTE_GENERATOR')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registrationError, setRegistrationError] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [savingRegistration, setSavingRegistration] = useState(false)
  const [savingLogin, setSavingLogin] = useState(false)
  const [savingListing, setSavingListing] = useState(false)
  const [listingError, setListingError] = useState('')
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [dashboardSection, setDashboardSection] =
  useState('dashboard');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ecoconnect-user') || 'null') } catch { return null }
  })
  const [notice, setNotice] = useState('')

  const fetchListings = async () => {
    setLoadingListings(true)
    try {
      const response = await fetch('/api/waste-listings')
      if (!response.ok) throw new Error('Could not load listings')
      setListings(await response.json())
    } catch (error) {
      console.error(error)
      setNotice('Could not connect to the listings API. Make sure the Spring Boot backend is running.')
    } finally { setLoadingListings(false) }
    
  }

  useEffect(() => { if (user) fetchListings() }, [user?.email])
  useEffect(() => {
    const handleLoginShortcut = (event) => { setLoginEmail(event.detail?.email || ''); setLoginError(''); setScreen('login') }
    window.addEventListener('ecoconnect-open-login', handleLoginShortcut)
    return () => window.removeEventListener('ecoconnect-open-login', handleLoginShortcut)
  }, [])

  const navigate = (next) => { setScreen(next); setNotice(''); setLoginError(''); setRegistrationError(''); setListingError(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
 const handleNavbarNavigate = (label, href) => {
  setNotice('');
  setLoginError('');
  setRegistrationError('');
  setListingError('');

  // Public homepage navigation
  if (label === 'Home') {
    if (user) {
      navigate('dashboard');
      setDashboardSection('dashboard');
    } else {
      navigate('home');
    }
    return;
  }

  if (label === 'About' || label === 'How It Works') {
    navigate('home');

    window.setTimeout(() => {
      document
        .getElementById(
          label === 'About' ? 'about' : 'how-it-works'
        )
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 0);

    return;
  }

  // Authentication navigation
  if (label === 'Login') {
    setLoginEmail('');
    navigate('login');
    return;
  }

  if (label === 'Register') {
    setRegistrationSuccess(false);
    navigate('role-select');
    return;
  }

  // Dashboard navigation requires a signed-in user
  if (!user) {
    navigate('login');
    return;
  }

  const allowedSections = {
    URBAN_WASTE_GENERATOR: [
      'dashboard',
      'my-listings',
      'requests',
      'profile',
    ],
    COOPERATIVE_COORDINATOR: [
      'dashboard',
      'available-requests',
      'accepted-pickups',
      'profile',
    ],
    ADMIN: [
      'dashboard',
      'users',
      'listings',
      'reports',
    ],
  };

  const section = href?.replace('#', '') || 'dashboard';

  if (!allowedSections[user.role]?.includes(section)) {
    setNotice('This navigation option is not available for your account.');
    return;
  }

  setDashboardSection(section);

  // Keep the existing screen-based application structure.
  if (screen !== 'dashboard') {
    navigate('dashboard');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  const handleLogin = async (event) => {
    event.preventDefault(); setSavingLogin(true); setLoginError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not sign in. Check your email and password.')
      const signedInUser = { id: data.id, fullName: data.fullName, email: data.email, role: data.role, organizationName: data.organizationName, location: data.location }
      sessionStorage.setItem('ecoconnect-user', JSON.stringify(signedInUser)); setUser(signedInUser); setLoginEmail(data.email); navigate('dashboard'); await fetchListings()
    } catch (error) { setLoginError(error.message || 'Unable to reach the EcoConnect API.') }
    finally { setSavingLogin(false) }
  }
  const handleRegister = async (event) => {
    event.preventDefault(); setSavingRegistration(true); setRegistrationError(''); setRegistrationSuccess(false)
    const form = new FormData(event.currentTarget); const values = Object.fromEntries(form.entries())
    if (values.password !== values.confirmPassword) { setRegistrationError('The passwords do not match.'); setSavingRegistration(false); return }
    const payload = { fullName: values.fullName, email: values.email, password: values.password, role: values.role, organizationName: values.organizationName || null, location: values.location }
    try {
      const response = await fetch('/api/users/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Could not create your account.')
      setLoginEmail(values.email); setRegistrationSuccess(true); setNotice('')
    } catch (error) { setRegistrationError(error.message || 'Unable to reach the EcoConnect API.') }
    finally { setSavingRegistration(false) }
  }
  const handleCreateListing = async (event) => {
    event.preventDefault(); setSavingListing(true); setListingError('')
    const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries()); payload.quantityKg = Number(payload.quantityKg); payload.status = 'AVAILABLE'
    try {
      const response = await fetch('/api/waste-listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Could not submit this listing.')
      setListings((current) => [data, ...current]); navigate('dashboard'); setNotice('Your waste listing has been created successfully.')
    } catch (error) { setListingError(error.message || 'Unable to reach the listings API.') }
    finally { setSavingListing(false) }
  }
  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`/api/waste-listings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Could not update listing status.')
      setListings((current) => current.map((item) => item.id === id ? data : item)); setNotice(`Listing status updated to ${status.replaceAll('_', ' ').toLowerCase()}.`)
    } catch (error) { setNotice(error.message || 'Could not update listing status.') }
  }
  const logout = async () => { try { await fetch('/api/users/logout', { method: 'POST' }) } catch (error) { console.error(error) } sessionStorage.removeItem('ecoconnect-user'); setUser(null); navigate('home'); setNotice('You have been logged out.') }

  let content
  if (screen === 'home') content = <HomePage onJoin={() => navigate('auth-choice')} onListWaste={() => user ? navigate('create-listing') : navigate('auth-choice')} />
  else if (screen === 'auth-choice') content = <AuthChoice onLogin={() => { setLoginEmail(''); navigate('login') }} onRegister={() => navigate('role-select')} />
  else if (screen === 'role-select') content = <RoleChooser onChoose={(role) => { setSelectedRole(role); setRegistrationSuccess(false); navigate('register') }} onBack={() => navigate('auth-choice')} />
  else if (screen === 'register' && registrationSuccess) content = <section className="registration-success-wrap"><div className="registration-success-card" role="status"><div className="registration-success-icon">✓</div><p className="registration-success-eyebrow">ACCOUNT CREATED</p><h2>Registration Successful!</h2><p className="registration-success-message">Your EcoConnect account has been created successfully. You can now log in to continue.</p><p className="success-email-line">Registered email: <strong>{loginEmail}</strong></p><button className="go-to-login-button" onClick={() => navigate('login')}>Go to Login <span>→</span></button></div></section>
  else if (screen === 'register') content = <RegisterPage onSubmit={handleRegister} saving={savingRegistration} error={registrationError} selectedRole={selectedRole} onChangeRole={setSelectedRole} />
  else if (screen === 'login') content = <LoginPage onSubmit={handleLogin} error={loginError} busy={savingLogin} email={loginEmail} onEmailChange={setLoginEmail} onGoRegister={() => navigate('role-select')} />
  else if (screen === 'dashboard' && user) content = <RoleDashboard user={user} listings={listings} onCreate={() => navigate('create-listing')} onChangeStatus={handleStatusChange} busy={loadingListings} />
  else if (screen === 'create-listing' && user?.role === 'URBAN_WASTE_GENERATOR') content = <CreateListing user={user} onCancel={() => navigate('dashboard')} onSubmit={handleCreateListing} saving={savingListing} error={listingError} />
  else if (screen === 'dashboard' || screen === 'create-listing') content = <HomePage onJoin={() => navigate('auth-choice')} onListWaste={() => navigate('auth-choice')} />
  else content = <HomePage onJoin={() => navigate('auth-choice')} onListWaste={() => navigate('auth-choice')} />

  const showDashboardNavbar = Boolean(user) && (screen === 'dashboard' || screen === 'create-listing')
  const showPublicNavbar = !user && screen === 'home'

  return (
    <div className="eco-app">
      {showPublicNavbar && (
        <Navbar role="public" onNavigate={handleNavbarNavigate} />
      )}
      {showDashboardNavbar && (
        <Navbar
  role={user.role}
  user={user}
  onLogout={logout}
  onNavigate={handleNavbarNavigate}
  activeSection={dashboardSection}
/>
      )}
      <main>
        {notice && <p className="app-notice" role="status">{notice}</p>}
        {content}
      </main>
    </div>
  )
}
