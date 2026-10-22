import { useCallback, useEffect, useRef, useState } from 'react'
import RegisterPage from './RegisterPage.jsx'
import './App.css'
import Navbar from './components/Navbar';
import Footer from './components/footer';
import AdminWorkspace from './components/AdminWorkspace.jsx'
import CooperativeWorkspace from './components/cooperative/CooperativeWorkspace.jsx'
import {
  FindCooperativesPage,
  ImpactReportsPage,
  PickupHistoryPage,
  UrbanProfilePage,
  WasteGuidePage,
} from './components/UrbanGeneratorPages.jsx'
import PlatformUsersPage from './components/Admin/PlatformUsersPage.jsx';


const roleLabels = {
  URBAN_WASTE_GENERATOR: 'Urban Waste Generator',
  COOPERATIVE_COORDINATOR: 'Cooperative Coordinator',
  ADMIN: 'EcoConnect Administrator',
}
const completedListingStatuses = new Set(['COLLECTED', 'COMPLETED'])
const pendingListingStatuses = new Set(['AVAILABLE', 'PENDING'])
const cooperativeSections = [
  'dashboard',
  'pickup-schedule',
  'waste-processing',
  'inventory',
  'collection-history',
  'profile',
]

function getListingCreationTime(listing) {
  const timestamp = Date.parse(listing.createdAt || '')
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function sortGeneratorListings(listings) {
  return [...listings].sort((first, second) => {
    const firstStatus = String(first.status || '').toUpperCase()
    const secondStatus = String(second.status || '').toUpperCase()
    const firstCompleted = completedListingStatuses.has(firstStatus)
    const secondCompleted = completedListingStatuses.has(secondStatus)

    if (firstCompleted !== secondCompleted) return firstCompleted ? 1 : -1

    if (!firstCompleted) {
      const firstPending = pendingListingStatuses.has(firstStatus)
      const secondPending = pendingListingStatuses.has(secondStatus)
      if (firstPending !== secondPending) return firstPending ? -1 : 1
    }

    return getListingCreationTime(second) - getListingCreationTime(first)
      || Number(second.id || 0) - Number(first.id || 0)
  })
}

function sortAdminListings(listings) {
  return [...listings].sort((first, second) => {
    const getGroup = (listing) => {
      const status = String(listing.status || '').toUpperCase()
      if (completedListingStatuses.has(status)) return 2
      if (pendingListingStatuses.has(status)) return 0
      return 1
    }
    return getGroup(first) - getGroup(second)
      || getListingCreationTime(second) - getListingCreationTime(first)
      || Number(second.id || 0) - Number(first.id || 0)
  })
}

const workflow = [
  { number: '01', title: 'Create a waste listing', text: 'Urban users add waste type, quantity, and pickup location in minutes.' },
  { number: '02', title: 'Match with a cooperative', text: 'EcoConnect helps coordinators find available waste listings that fit their location and capacity.' },
  { number: '03', title: 'Schedule and track pickup', text: 'Cooperatives accept requests and update collection progress from their dashboard.' },
  { number: '04', title: 'Measure impact', text: 'Generators and administrators track collection progress and community impact.' },
]
function HomePage({ onJoin, onListWaste }) {
  return <>
    <section className="hero-section" id="about">
      <div className="hero-copy">
        <p className="eyebrow">Sustainable waste coordination</p>
        <h1>Turn organic waste into community impact.</h1>
        <p className="lead">EcoConnect connects urban waste generators with rural women-led cooperatives to collect, process, and repurpose organic waste into valuable resources.</p>
        <div className="cta-row"><button className="primary-button" onClick={onListWaste}>List waste</button><button className="secondary-button" onClick={onJoin}>Join EcoConnect</button></div>
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

function AccountProfilePage({ user, onLogout }) {
  const name = user?.fullName || 'Not provided'
  const role = roleLabels[user?.role] || 'EcoConnect member'

  return (
    <section className="screen-shell urban-page-shell">
      <div className="urban-page-heading">
        <p className="eyebrow">Account details</p>
        <h1>My Profile</h1>
        <p>Review the details associated with your EcoConnect account.</p>
      </div>
      <article className="panel-card urban-profile-card">
        <div className="urban-profile-avatar" aria-hidden="true">
          {(name === 'Not provided' ? user?.email || 'U' : name).charAt(0).toUpperCase()}
        </div>
        <dl className="cooperative-details">
          <div><dt>Full name</dt><dd>{name}</dd></div>
          <div><dt>Email</dt><dd>{user?.email || 'Not provided'}</dd></div>
          <div><dt>Role</dt><dd>{role}</dd></div>
          {user?.organizationName && <div><dt>Organization</dt><dd>{user.organizationName}</dd></div>}
          {user?.location && <div><dt>Location</dt><dd>{user.location}</dd></div>}
        </dl>
        <button className="secondary-button urban-logout-button" type="button" onClick={onLogout}>Log out</button>
      </article>
    </section>
  )
}

function RoleDashboard({ user, listings, onCreate, onChangeStatus, onPickupHistory, onEditListing, onDeleteListing, deletingListingId, onRetry, busy, error }) {
  const role = user?.role || 'URBAN_WASTE_GENERATOR'
  const isAdmin = role === 'ADMIN'
  const isCoordinator = role === 'COOPERATIVE_COORDINATOR'
  const isUrbanGenerator = role === 'URBAN_WASTE_GENERATOR'
  const ownHeading = isAdmin ? 'Administrator dashboard' : isCoordinator ? 'Cooperative dashboard' : 'Urban generator dashboard'
  const visibleListings = isUrbanGenerator
    ? sortGeneratorListings(listings)
    : isAdmin ? sortAdminListings(listings) : listings
  const completedListings = isUrbanGenerator
    ? visibleListings.filter((listing) => completedListingStatuses.has(String(listing.status || '').toUpperCase()))
    : []
  const activeListings = isUrbanGenerator
    ? visibleListings.filter((listing) => !completedListingStatuses.has(String(listing.status || '').toUpperCase()))
    : visibleListings
  const count = (status) => visibleListings.filter((item) => String(item.status || '').toUpperCase() === status).length
  const completed = isUrbanGenerator
    ? completedListings.length
    : count('COLLECTED') + count('COMPLETED')
  const showStatistics = !busy && !error
  const renderListingCards = (group) => (
    <div className="listing-grid">{group.map((item) => {
      const status = String(item.status || '').toUpperCase()
      const canManage = isUrbanGenerator && (status === 'AVAILABLE' || status === 'PENDING')
      return (
        <article className="panel-card listing-card" key={item.id}>
          <div className="listing-topline">
            <span className="listing-tag">{item.wasteType || 'Waste type not provided'}</span>
            <span className={`status-pill status-${(status || 'unknown').toLowerCase()}`}>{status ? status.replaceAll('_', ' ') : 'Status not recorded'}</span>
          </div>
          <h3>{item.quantityKg != null ? `${item.quantityKg} kg` : 'Quantity not recorded'}</h3>
          <p>{item.location || 'Location not provided'}</p>
          {item.description && <p>{item.description}</p>}
          {isAdmin && <div className="listing-meta"><span>Listing ID</span><strong>#{item.id}</strong></div>}
          <div className="listing-meta"><span>Contact</span><strong>{item.contactName || 'Not provided'}</strong></div>
          {isAdmin && (
            <>
              <div className="listing-meta"><span>Contact phone</span><strong>{item.contactPhone || 'Not provided'}</strong></div>
              <div className="listing-meta"><span>Generator account</span><strong>{item.createdByEmail || 'Not recorded'}</strong></div>
              <div className="listing-meta"><span>Created</span><strong>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Not recorded'}</strong></div>
            </>
          )}
          {(isCoordinator || isAdmin) && <div className="listing-status-actions">{status === 'AVAILABLE' && <button className="secondary-button" onClick={() => onChangeStatus(item.id, 'ACCEPTED')}>Accept pickup</button>}{['ACCEPTED', 'SCHEDULED'].includes(status) && <button className="secondary-button" onClick={() => onChangeStatus(item.id, 'IN_PROGRESS')}>Start pickup</button>}{status === 'IN_PROGRESS' && <button className="primary-button" onClick={() => onChangeStatus(item.id, 'COLLECTED')}>Mark collected</button>}</div>}
          {isUrbanGenerator && (
            <div className="listing-owner-actions">
              {canManage ? (
                <>
                  <button type="button" className="secondary-button" onClick={() => onEditListing(item)}>Edit</button>
                  <button type="button" className="listing-delete-button" onClick={() => onDeleteListing(item)} disabled={deletingListingId !== null}>
                    {deletingListingId === item.id ? 'Deleting…' : 'Delete'}
                  </button>
                </>
              ) : <p className="listing-edit-restriction">Editing and deletion are unavailable after pickup processing starts.</p>}
            </div>
          )}
        </article>
      )
    })}</div>
  )
  const listingContent = busy
    ? <p className="form-intro" role="status">Loading waste listings…</p>
    : visibleListings.length === 0
      ? <div className="empty-state panel-card"><span>♻️</span><h3>No waste listings yet</h3><p>{isCoordinator ? 'New listings from generators will appear here.' : isAdmin ? 'Waste listings from EcoConnect users will appear here.' : 'Create the first listing to start the collection process.'}</p></div>
      : <>
          {isUrbanGenerator ? (
            <>
              {activeListings.length > 0 && <section className="dashboard-listing-group"><h3>Active &amp; Recent Listings</h3>{renderListingCards(activeListings)}</section>}
              {completedListings.length > 0 && <section className="dashboard-listing-group"><h3>Completed Listings</h3>{renderListingCards(completedListings)}</section>}
            </>
          ) : renderListingCards(visibleListings)}
        </>
  return <><section className="screen-shell role-dashboard-shell"><div className="dashboard-welcome">
  <div>
    <p className="eyebrow">Your EcoConnect workspace</p>
    <h1>{ownHeading}</h1>
    <p>Welcome, {user?.fullName || 'EcoConnect member'}.</p>

    {isCoordinator && user?.organizationName && (
      <p className="organization-name">
        Organization: {user.organizationName}
      </p>
    )}
  </div>
</div>

    {isUrbanGenerator && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          type="button"
          className="primary-button"
          onClick={onCreate}
        >
          + Create listing
        </button>
      </div>
    )}

    {listingContent}
  </section><Footer /></>
}

function UrbanGeneratorWorkspace({
  section,
  user,
  listings,
  loadingListings,
  listingsError,
  cooperatives,
  loadingCooperatives,
  cooperativesError,
  onCreate,
  onChangeStatus,
  onPickupHistory,
  onEditListing,
  onDeleteListing,
  deletingListingId,
  onRetry,
  onNavigate,
  onLogout,
}) {
  let page

  if (section === 'cooperatives') {
    page = <FindCooperativesPage cooperatives={cooperatives} loading={loadingCooperatives} error={cooperativesError} />
  } else if (section === 'waste-guide') {
    page = <WasteGuidePage />
  } else if (section === 'impact-reports') {
    page = <ImpactReportsPage listings={listings} loading={loadingListings} error={listingsError} />
  } else if (section === 'pickup-history') {
    page = <PickupHistoryPage listings={listings} loading={loadingListings} error={listingsError} onBack={() => onNavigate('dashboard')} />
  } else if (section === 'profile') {
    page = <UrbanProfilePage user={user} onLogout={onLogout} />
  } else {
    page = <RoleDashboard user={user} listings={listings} onCreate={onCreate} onChangeStatus={onChangeStatus} onPickupHistory={onPickupHistory} onEditListing={onEditListing} onDeleteListing={onDeleteListing} deletingListingId={deletingListingId} onRetry={onRetry} busy={loadingListings} error={listingsError} />
  }

  return <>{page}{section === 'dashboard' ? null : <Footer />}</>
}

function CreateListing({ user, listing, onCancel, onSubmit, saving, error }) {
  const editing = Boolean(listing)
  const supportedWasteTypes = ['Food scraps', 'Garden waste', 'Fruit peels', 'Leaf litter', 'Other organic waste']
  return <section className="auth-page-centered"><div className="auth-card-centered listing-form-centered"><p className="eyebrow">{editing ? 'Update your listing' : 'Step 01 · Share organic waste'}</p><h2>{editing ? 'Edit waste listing' : 'Create a waste listing'}</h2><form className="auth-form" onSubmit={onSubmit}><label>Waste type<select name="wasteType" required defaultValue={listing?.wasteType || ''}><option value="" disabled>Select waste type</option>{listing?.wasteType && !supportedWasteTypes.includes(listing.wasteType) && <option>{listing.wasteType}</option>}{supportedWasteTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>Quantity (kg)<input name="quantityKg" type="number" min="0.1" step="0.1" required defaultValue={listing?.quantityKg ?? ''} placeholder="e.g. 25" /></label><label>Pickup location<input name="location" required defaultValue={listing?.location || user?.location || ''} placeholder="Area, city" /></label><label>Contact name<input name="contactName" required defaultValue={listing?.contactName || user?.fullName || ''} placeholder="Your full name" /></label><label>Contact phone<input name="contactPhone" type="tel" required minLength="8" maxLength="20" defaultValue={listing?.contactPhone || ''} placeholder="Enter a contact number" /></label><label>Additional details<textarea name="description" rows="3" maxLength="1000" defaultValue={listing?.description || ''} placeholder="Add handling or pickup notes" /></label>{error && <p className="form-message error-message" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? (editing ? 'Saving…' : 'Submitting…') : (editing ? 'Save Changes' : 'Submit listing')}</button></div></form></div></section>
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ecoconnect-user') || 'null') } catch { return null }
  })
  const [screen, setScreen] = useState(() => user ? 'dashboard' : 'home')
  const [selectedRole, setSelectedRole] = useState('URBAN_WASTE_GENERATOR')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registrationError, setRegistrationError] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [savingRegistration, setSavingRegistration] = useState(false)
  const [savingLogin, setSavingLogin] = useState(false)
  const [savingListing, setSavingListing] = useState(false)
  const [listingError, setListingError] = useState('')
  const [listingToEdit, setListingToEdit] = useState(null)
  const [deletingListingId, setDeletingListingId] = useState(null)
  const [listings, setListings] = useState([])
  const [loadingListings, setLoadingListings] = useState(Boolean(user))
  const [listingsError, setListingsError] = useState('')
  const [cooperatives, setCooperatives] = useState([])
  const [loadingCooperatives, setLoadingCooperatives] = useState(false)
  const [cooperativesError, setCooperativesError] = useState('')
  const listingsRequest = useRef(null)
  const [dashboardSection, setDashboardSection] = useState(() => {
    if (user?.role !== 'COOPERATIVE_COORDINATOR' || typeof window === 'undefined') return 'dashboard'
    const section = window.location.hash.slice(1)
    return cooperativeSections.includes(section) ? section : 'dashboard'
  })
  const [notice, setNotice] = useState('')

  useEffect(() => {
  const pageTitles = {
    home: 'Home',
    'auth-choice': 'Join EcoConnect',
    'role-select': 'Choose Your Role',
    register: registrationSuccess
      ? 'Registration Successful'
      : 'Register',
    login: 'Login',
    'create-listing': 'Create Waste Listing',
    'edit-listing': 'Edit Waste Listing',
  }

  const dashboardTitles = {
    URBAN_WASTE_GENERATOR: 'Urban Waste Generator Dashboard',
    COOPERATIVE_COORDINATOR: 'Cooperative Dashboard',
    ADMIN: 'Admin Dashboard',
  }

  let title

  if (screen === 'dashboard' && user) {
    title = dashboardTitles[user.role] || 'Dashboard'
  } else {
    title = pageTitles[screen] || 'EcoConnect'
  }

  document.title = `${title} | EcoConnect`
}, [screen, user?.role, registrationSuccess])

  const fetchListings = useCallback(async (role = user?.role) => {
    listingsRequest.current?.abort()
    const request = new AbortController()
    listingsRequest.current = request
    setLoadingListings(true)
    setListingsError('')
    try {
      const endpoint = role === 'URBAN_WASTE_GENERATOR'
        ? '/api/waste-listings/mine'
        : role === 'ADMIN'
          ? '/api/admin/pickups'
        : '/api/waste-listings'
      const response = await fetch(endpoint, { credentials: 'same-origin', signal: request.signal })
      const data = await response.json().catch(() => ({}))
      const apiMessage = typeof data.message === 'string' ? data.message : ''
      if (!response.ok) {
        if (/\bregistration\b|\bregister\b/i.test(apiMessage)) {
          console.error('Listings API returned a legacy registration error response:', response.status)
          throw new Error('Could not load waste listings. Please try again.')
        }
        if (response.status >= 500) {
          console.error('Listings API request failed:', response.status)
          throw new Error('Could not load waste listings. Please try again.')
        }
        throw new Error(apiMessage || 'Could not load listings.')
      }
      if (!Array.isArray(data)) throw new Error('The listings API returned an unexpected response.')
      if (request.signal.aborted) return null
      setListings(data)
      return data
    } catch (error) {
      if (request.signal.aborted) return null
      console.error(error)
      setListings([])
      const message = error.message || 'Could not connect to the listings API. Make sure the Spring Boot backend is running.'
      setListingsError(message)
      return null
    } finally {
      if (listingsRequest.current === request) {
        listingsRequest.current = null
        setLoadingListings(false)
      }
    }
  }, [user?.role])

  const loadUrbanPageData = async (section) => {
    if (section === 'cooperatives') {
      setLoadingCooperatives(true)
      setCooperativesError('')
      try {
        const response = await fetch('/api/cooperatives')
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Could not load cooperatives.')
        setCooperatives(data)
      } catch (error) {
        console.error('Failed to load cooperative directory:', error)
        setCooperativesError(error.message || 'Unable to reach the cooperative directory.')
      } finally {
        setLoadingCooperatives(false)
      }
    }

  }

  useEffect(() => {
    if (
      user &&
      screen === 'dashboard' &&
      (user.role !== 'ADMIN' || dashboardSection === 'dashboard')
    ) {
      void fetchListings(user.role)
    }
  }, [dashboardSection, fetchListings, screen, user])
  useEffect(() => {
    if (user?.role !== 'COOPERATIVE_COORDINATOR') return undefined
    const syncSectionFromLocation = () => {
      const section = window.location.hash.slice(1)
      setDashboardSection(cooperativeSections.includes(section) ? section : 'dashboard')
    }
    window.addEventListener('popstate', syncSectionFromLocation)
    window.addEventListener('hashchange', syncSectionFromLocation)
    return () => {
      window.removeEventListener('popstate', syncSectionFromLocation)
      window.removeEventListener('hashchange', syncSectionFromLocation)
    }
  }, [user?.role])
  useEffect(() => {
    const handleLoginShortcut = (event) => { setLoginEmail(event.detail?.email || ''); setLoginError(''); setRegistrationError(''); setRegistrationSuccess(false); setNotice(''); setScreen('login') }
    window.addEventListener('ecoconnect-open-login', handleLoginShortcut)
    return () => window.removeEventListener('ecoconnect-open-login', handleLoginShortcut)
  }, [])

  const navigate = (next) => { setScreen(next); setNotice(''); setLoginError(''); setRegistrationError(''); setListingError(''); if (next === 'login' || next === 'role-select' || next === 'register') setRegistrationSuccess(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const navigateUrbanSection = (section) => {
    if (user?.role !== 'URBAN_WASTE_GENERATOR') return
    void loadUrbanPageData(section)
    setDashboardSection(section)
    if (screen !== 'dashboard') navigate('dashboard')
    else setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
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
      'cooperatives',
      'waste-guide',
      'impact-reports',
      'profile',
    ],
    COOPERATIVE_COORDINATOR: [
      'dashboard',
      'pickup-schedule',
      'waste-processing',
      'inventory',
      'collection-history',
      'profile',
    ],
   ADMIN: [
  'dashboard',
  'approvals',
  'pickups',
  'complaints',
  'impact',
  'profile',
  'platform-users',
],
  };

  const section = href?.replace('#', '') || 'dashboard';

  if (!allowedSections[user.role]?.includes(section)) {
    setNotice('This navigation option is not available for your account.');
    return;
  }

  if (user.role === 'COOPERATIVE_COORDINATOR') {
    window.history.pushState(null, '', `#${section}`)
  }
  if (user.role === 'URBAN_WASTE_GENERATOR') void loadUrbanPageData(section)
  setDashboardSection(section);

  // Keep the existing screen-based application structure.
  if (screen !== 'dashboard') {
    navigate('dashboard');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  const handleLogin = async (event) => {
    event.preventDefault(); setSavingLogin(true); setLoginError(''); setRegistrationError(''); setNotice('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not sign in. Check your email and password.')
      const signedInUser = { id: data.id, fullName: data.fullName, email: data.email, role: data.role, organizationName: data.organizationName, location: data.location }
      listingsRequest.current?.abort(); listingsRequest.current = null
      sessionStorage.setItem('ecoconnect-user', JSON.stringify(signedInUser)); setListings([]); setListingToEdit(null); setLoadingListings(true); setUser(signedInUser); setLoginEmail(data.email); setDashboardSection('dashboard'); if (signedInUser.role === 'COOPERATIVE_COORDINATOR') window.history.pushState(null, '', '#dashboard'); navigate('dashboard')
    } catch (error) { setLoginError(error.message || 'Unable to reach the EcoConnect API.') }
    finally { setSavingLogin(false) }
  }
  const handleRegister = async (event) => {
    event.preventDefault(); setSavingRegistration(true); setRegistrationError(''); setLoginError(''); setNotice(''); setRegistrationSuccess(false)
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
      setListings((current) => [data, ...current.filter((listing) => listing.id !== data.id)])
      const refreshedListings = await fetchListings(user?.role)
      navigate('dashboard')
      setNotice(refreshedListings
        ? 'Your waste listing has been created successfully.'
        : 'Your waste listing was saved, but the dashboard could not refresh. Reload the dashboard to retry.')
    } catch (error) { setListingError(error.message || 'Unable to reach the listings API.') }
    finally { setSavingListing(false) }
  }
  const openEditListing = (listing) => {
    setListingToEdit(listing)
    setListingError('')
    navigate('edit-listing')
  }
  const handleUpdateListing = async (event) => {
    event.preventDefault()
    if (!listingToEdit) return
    setSavingListing(true)
    setListingError('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    payload.quantityKg = Number(payload.quantityKg)
    try {
      const response = await fetch(`/api/waste-listings/${listingToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not update this listing.')
      setListings((current) => current.map((item) => item.id === data.id ? data : item))
      const refreshedListings = await fetchListings(user?.role)
      setListingToEdit(null)
      navigate('dashboard')
      setNotice(refreshedListings
        ? 'Your waste listing has been updated successfully.'
        : 'Your listing was updated, but the dashboard could not refresh. Reload the dashboard to retry.')
    } catch (error) {
      setListingError(error.message || 'Unable to reach the listings API.')
    } finally {
      setSavingListing(false)
    }
  }
  const handleDeleteListing = async (listing) => {
    const confirmed = window.confirm('Are you sure you want to delete this waste listing? This action cannot be undone.')
    if (!confirmed) return
    setDeletingListingId(listing.id)
    try {
      const response = await fetch(`/api/waste-listings/${listing.id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not delete this listing.')
      setListings((current) => current.filter((item) => item.id !== listing.id))
      const refreshedListings = await fetchListings(user?.role)
      setNotice(refreshedListings
        ? 'Your waste listing has been deleted.'
        : 'Your listing was deleted, but the dashboard could not refresh. Reload the dashboard to retry.')
    } catch (error) {
      setNotice(error.message || 'Unable to reach the listings API.')
    } finally {
      setDeletingListingId(null)
    }
  }
  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`/api/waste-listings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.message || 'Could not update listing status.')
      setListings((current) => current.map((item) => item.id === id ? data : item))
      const refreshedListings = await fetchListings(user?.role)
      setNotice(refreshedListings
        ? `Listing status updated to ${status.replaceAll('_', ' ').toLowerCase()}.`
        : 'The listing status was updated, but the dashboard could not refresh. Reload to verify the latest data.')
    } catch (error) { setNotice(error.message || 'Could not update listing status.') }
  }
  const logout = async () => { const email = user?.email || ''; try { await fetch('/api/users/logout', { method: 'POST' }) } catch (error) { console.error(error) } listingsRequest.current?.abort(); listingsRequest.current = null; sessionStorage.removeItem('ecoconnect-user'); setListings([]); setListingToEdit(null); setLoadingListings(false); setListingsError(''); setUser(null); setDashboardSection('dashboard'); setLoginEmail(email); navigate('login') }

  let content
  if (screen === 'home') content = <HomePage onJoin={() => navigate('auth-choice')} onListWaste={() => user ? navigate('create-listing') : navigate('auth-choice')} />
  else if (screen === 'auth-choice') content = <AuthChoice onLogin={() => { setLoginEmail(''); navigate('login') }} onRegister={() => navigate('role-select')} />
  else if (screen === 'role-select') content = <RoleChooser onChoose={(role) => { setSelectedRole(role); setRegistrationSuccess(false); navigate('register') }} onBack={() => navigate('auth-choice')} />
  else if (screen === 'register' && registrationSuccess) content = <section className="registration-success-wrap"><div className="registration-success-card" role="status"><div className="registration-success-icon">✓</div><p className="registration-success-eyebrow">ACCOUNT CREATED</p><h2>Registration Successful!</h2><p className="registration-success-message">Your EcoConnect account has been created successfully. You can now log in to continue.</p><p className="success-email-line">Registered email: <strong>{loginEmail}</strong></p><button className="go-to-login-button" onClick={() => navigate('login')}>Go to Login <span>→</span></button></div></section>
  else if (screen === 'register') content = <RegisterPage onSubmit={handleRegister} saving={savingRegistration} error={registrationError} selectedRole={selectedRole} onChangeRole={setSelectedRole} />
  else if (screen === 'login') content = <LoginPage onSubmit={handleLogin} error={loginError} busy={savingLogin} email={loginEmail} onEmailChange={setLoginEmail} onGoRegister={() => navigate('role-select')} />
  else if (screen === 'dashboard' && user?.role === 'URBAN_WASTE_GENERATOR') content = <UrbanGeneratorWorkspace section={dashboardSection} user={user} listings={listings} loadingListings={loadingListings} listingsError={listingsError} cooperatives={cooperatives} loadingCooperatives={loadingCooperatives} cooperativesError={cooperativesError} onCreate={() => navigate('create-listing')} onChangeStatus={handleStatusChange} onPickupHistory={() => navigateUrbanSection('pickup-history')} onEditListing={openEditListing} onDeleteListing={handleDeleteListing} deletingListingId={deletingListingId} onRetry={() => void fetchListings(user.role)} onNavigate={navigateUrbanSection} onLogout={logout} />
  else if (screen === 'dashboard' && user && dashboardSection === 'profile') content = <><AccountProfilePage user={user} onLogout={logout} /><Footer /></>
  else if (
  screen === 'dashboard' &&
  user?.role === 'ADMIN' &&
  dashboardSection === 'platform-users'
) content = <><PlatformUsersPage /><Footer /></>
  else if (screen === 'dashboard' && user?.role === 'ADMIN' && dashboardSection !== 'dashboard') content = <><AdminWorkspace key={dashboardSection} section={dashboardSection} /><Footer /></>
  else if (screen === 'dashboard' && user?.role === 'COOPERATIVE_COORDINATOR' && dashboardSection !== 'dashboard') content = <CooperativeWorkspace key={dashboardSection} section={dashboardSection} />
  else if (screen === 'dashboard' && user) content = <RoleDashboard user={user} listings={listings} onCreate={() => navigate('create-listing')} onChangeStatus={handleStatusChange} onRetry={() => void fetchListings(user.role)} busy={loadingListings} error={listingsError} />
  else if (screen === 'create-listing' && user?.role === 'URBAN_WASTE_GENERATOR') content = <><CreateListing user={user} onCancel={() => navigate('dashboard')} onSubmit={handleCreateListing} saving={savingListing} error={listingError} /><Footer /></>
  else if (screen === 'edit-listing' && user?.role === 'URBAN_WASTE_GENERATOR' && listingToEdit) content = <><CreateListing key={listingToEdit.id} user={user} listing={listingToEdit} onCancel={() => { setListingToEdit(null); navigate('dashboard') }} onSubmit={handleUpdateListing} saving={savingListing} error={listingError} /><Footer /></>
  else if (screen === 'dashboard' || screen === 'create-listing' || screen === 'edit-listing') content = <HomePage onJoin={() => navigate('auth-choice')} onListWaste={() => navigate('auth-choice')} />
  else content = <HomePage onJoin={() => navigate('auth-choice')} onListWaste={() => navigate('auth-choice')} />

  const showDashboardNavbar = Boolean(user) && (screen === 'dashboard' || screen === 'create-listing' || screen === 'edit-listing')
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
        {notice && screen === 'dashboard' && <p className="app-notice" role="status">{notice}</p>}
        {content}
      </main>
    </div>
  )
}
