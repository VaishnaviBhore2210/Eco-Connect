import { useEffect, useState } from 'react'
import './App.css'

const fallbackMetrics = [
  { value: '500+', label: 'households connected' },
  { value: '36', label: 'cooperatives active' },
  { value: '12T', label: 'organic waste diverted' },
  { value: '92%', label: 'pickup success rate' },
]

const userRoles = [
  {
    title: 'Urban Waste Generator',
    icon: '🏙️',
    description:
      'List organic waste, schedule pickups, and track environmental impact from one simple dashboard.',
  },
  {
    title: 'Cooperative Coordinator',
    icon: '🌾',
    description:
      'View ready-to-collect waste, manage capacity, and coordinate collection operations with nearby generators.',
  },
  {
    title: 'Admin',
    icon: '🛠️',
    description:
      'Monitor listings, pickup activity, and platform performance while keeping the ecosystem well organized.',
  },
]

const workflow = [
  {
    number: '01',
    title: 'Create a waste listing',
    text: 'Urban users add waste type, quantity, and pickup location in minutes.',
  },
  {
    number: '02',
    title: 'Match with a cooperative',
    text: 'The platform recommends nearby cooperatives based on capacity and location.',
  },
  {
    number: '03',
    title: 'Schedule and track pickup',
    text: 'Cooperatives accept requests, arrange pickup, and share real-time status updates.',
  },
  {
    number: '04',
    title: 'Measure impact',
    text: 'See how waste is transformed into compost, biofuel, and cleaner communities.',
  },
]

const features = [
  'Smart waste matching across locations',
  'Pickup tracking and status visibility',
  'Environmental and economic impact reporting',
  'Capacity-aware cooperative management',
]

const fallbackListingCards = [
  { id: 1, type: 'Food scraps', quantity: '180 kg', location: 'Bengaluru', status: 'Awaiting pickup', eta: 'Today, 4:30 PM' },
  { id: 2, type: 'Garden waste', quantity: '95 kg', location: 'Koramangala', status: 'Matched', eta: 'Tomorrow, 10:15 AM' },
  { id: 3, type: 'Fruit peels', quantity: '62 kg', location: 'Whitefield', status: 'Accepted', eta: 'Today, 6:00 PM' },
  { id: 4, type: 'Leaf litter', quantity: '120 kg', location: 'Indiranagar', status: 'In transit', eta: 'Thu, 9:00 AM' },
]

const fallbackDashboardStats = [
  { label: 'Active pickups', value: '24' },
  { label: 'Collections done', value: '178' },
  { label: 'Compost output', value: '3.4T' },
  { label: 'Impact score', value: '96%' },
]

const fallbackPriorities = [
  'Review 3 new listing requests',
  'Confirm pickup slots for tomorrow',
  'Track compost yield against target',
]

const fallbackTimeline = [
  { text: 'Kitchen waste collected from Bengaluru', state: 'active' },
  { text: 'Garden waste assigned to Green Valley', state: 'pending' },
  { text: 'Daily compost processing completed', state: 'success' },
]

const navItems = [
  { key: 'home', label: 'Home' },
  { key: 'login', label: 'Login' },
  { key: 'listings', label: 'Listings' },
  { key: 'cooperative', label: 'Cooperatives' },
  { key: 'dashboard', label: 'Dashboard' },
]

function HomePage({ metrics, onListWaste, onBecomeCooperative }) {
  return (
    <>
      <section className="hero-section" id="about">
        <div className="hero-copy">
          <p className="eyebrow">Sustainable waste coordination</p>
          <h1>Turn organic waste into community impact.</h1>
          <p className="lead">
            EcoConnect connects urban waste generators with rural women-led cooperatives
            to collect, process, and repurpose organic waste into valuable resources.
          </p>

          <div className="cta-row">
            <button type="button" className="primary-button" onClick={onListWaste}>
              List waste
            </button>
            <button type="button" className="secondary-button" onClick={onBecomeCooperative}>
              Become a cooperative
            </button>
          </div>

          <div className="stats-grid" aria-label="EcoConnect impact stats">
            {metrics.map((item) => (
              <div key={item.label} className="stat-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-label="EcoConnect platform preview">
          <div className="visual-card highlight-card">
            <span className="card-label">Live pickup request</span>
            <h3>Kitchen waste ready for collection</h3>
            <ul>
              <li>Food scraps • 180 kg</li>
              <li>Pickup window: 4:30 PM</li>
              <li>Matched to Green Valley Cooperative</li>
            </ul>
          </div>

          <div className="mini-dashboard">
            <div className="dashboard-item">
              <span className="dashboard-tag success">Accepted</span>
              <strong>Pickup scheduled</strong>
            </div>
            <div className="dashboard-item">
              <span className="dashboard-tag neutral">Today</span>
              <strong>Compost produced: 840 kg</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="role-section" id="roles">
        <div className="section-heading">
          <p className="eyebrow">Built for the full ecosystem</p>
          <h2>One platform, three key roles.</h2>
        </div>

        <div className="role-grid">
          {userRoles.map((role) => (
            <article key={role.title} className="role-card">
              <div className="role-icon" aria-hidden="true">
                {role.icon}
              </div>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>From waste listing to impact creation.</h2>
        </div>

        <div className="workflow-grid">
          {workflow.map((step) => (
            <article key={step.number} className="workflow-card">
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="impact-section" id="impact">
        <div className="impact-copy">
          <p className="eyebrow">Why EcoConnect matters</p>
          <h2>Turning everyday organic waste into cleaner cities and stronger livelihoods.</h2>
          <p>
            EcoConnect reduces landfill overflow, improves local waste processing,
            and helps cooperatives earn sustainable income while creating measurable
            environmental gains.
          </p>
          <ul className="feature-list">
            {features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="impact-panel">
          <div className="panel-box">
            <span>Impact this month</span>
            <strong>4.8 tons</strong>
            <small>organic waste collected</small>
          </div>
          <div className="panel-box muted">
            <span>Jobs created</span>
            <strong>124</strong>
            <small>across cooperative networks</small>
          </div>
          <div className="panel-box highlight">
            <span>CO₂ avoided</span>
            <strong>2.3 tons</strong>
            <small>estimated emissions reduction</small>
          </div>
        </div>
      </section>
    </>
  )
}

function LoginPage({ onSignIn }) {
  return (
    <section className="screen-shell login-shell">
      <div className="panel-card form-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Login to EcoConnect</h2>

        <form className="auth-form" onSubmit={onSignIn}>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <input type="password" name="password" placeholder="Enter your password" minLength="6" required />
          </label>

          <div className="form-row">
            <label className="checkbox-row">
              <input type="checkbox" defaultChecked />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="primary-button full-width">Sign in</button>
        </form>
      </div>

      <div className="panel-card info-card">
        <p className="eyebrow">Quick access</p>
        <h3>Platform access for every role</h3>
        <ul className="info-list">
          <li>Urban users can list waste and track pickup status.</li>
          <li>Cooperatives can accept pickup requests and manage capacity.</li>
          <li>Admins can monitor listings, schedules, and impact metrics.</li>
        </ul>
      </div>
    </section>
  )
}

function ListingsPage({ listingCards, onCreateListing, onViewDetails }) {
  return (
    <section className="screen-shell listings-shell">
      <div className="section-heading inline-heading">
        <div>
          <p className="eyebrow">Current demand</p>
          <h2>Waste listings</h2>
        </div>
        <button type="button" className="primary-button" onClick={onCreateListing}>+ New listing</button>
      </div>

      <div className="listing-grid">
        {listingCards.map((listing) => (
          <article key={listing.id} className="panel-card listing-card">
            <div className="listing-topline">
              <span className="listing-tag">{listing.type}</span>
              <span className="status-pill">{listing.status}</span>
            </div>

            <h3>{listing.quantity}</h3>
            <p>{listing.location}</p>

            <div className="listing-meta">
              <span>Pickup ETA</span>
              <strong>{listing.eta}</strong>
            </div>

            <button type="button" className="secondary-button full-width" onClick={() => onViewDetails(listing)}>View details</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function NewListingForm({ onSubmit, onCancel, saving, error }) {
  return (
    <section className="panel-card action-form-card" aria-labelledby="new-listing-title">
      <div className="section-heading inline-heading">
        <div>
          <p className="eyebrow">Share organic waste</p>
          <h2 id="new-listing-title">Create a listing</h2>
        </div>
        <button type="button" className="text-button" onClick={onCancel}>Cancel</button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          Waste type
          <select name="type" required defaultValue="">
            <option value="" disabled>Select waste type</option>
            <option>Food scraps</option>
            <option>Garden waste</option>
            <option>Fruit peels</option>
            <option>Leaf litter</option>
            <option>Other organic waste</option>
          </select>
        </label>
        <label>
          Quantity (kg)
          <input name="quantity" type="number" min="0.1" step="0.1" required placeholder="e.g. 25" />
        </label>
        <label>
          Pickup location
          <input name="location" required placeholder="Area, city" />
        </label>
        <label>
          Preferred pickup time
          <input name="eta" required placeholder="e.g. Tomorrow, 10:00 AM" />
        </label>
        <label>
          Additional details (optional)
          <textarea name="description" rows="3" placeholder="Add access or handling notes" />
        </label>
        {error && <p className="form-message error-message" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit listing'}
          </button>
        </div>
      </form>
    </section>
  )
}

function CooperativePage({ onSubmit, saving, error, success }) {
  return (
    <section className="screen-shell login-shell">
      <div className="panel-card form-card">
        <p className="eyebrow">Partner with EcoConnect</p>
        <h2>Register your cooperative</h2>
        <p className="form-intro">Tell us about your team and the amount of organic waste you can process.</p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Cooperative name
            <input name="name" required placeholder="e.g. Green Valley Cooperative" />
          </label>
          <label>
            Contact person
            <input name="contactName" required placeholder="Full name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label>
            Location
            <input name="location" required placeholder="Area, city" />
          </label>
          <label>
            Processing capacity (kg/day)
            <input name="capacity" type="number" min="1" step="1" required placeholder="e.g. 250" />
          </label>
          {error && <p className="form-message error-message" role="alert">{error}</p>}
          {success && <p className="form-message success-message" role="status">{success}</p>}
          <button type="submit" className="primary-button full-width" disabled={saving}>
            {saving ? 'Submitting…' : 'Submit registration'}
          </button>
        </form>
      </div>
      <div className="panel-card info-card">
        <p className="eyebrow">A shared mission</p>
        <h3>Grow a more circular local economy</h3>
        <ul className="info-list">
          <li>Receive nearby organic waste pickup requests.</li>
          <li>Share your processing capacity with generators.</li>
          <li>Help turn waste into compost and other useful products.</li>
        </ul>
      </div>
    </section>
  )
}

function ListingDetails({ listing, onClose }) {
  if (!listing) return null

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className="panel-card details-dialog" role="dialog" aria-modal="true" aria-labelledby="listing-details-title">
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close listing details">×</button>
        <p className="eyebrow">Waste listing details</p>
        <h2 id="listing-details-title">{listing.type}</h2>
        <div className="detail-list">
          <p><span>Quantity</span><strong>{listing.quantity}</strong></p>
          <p><span>Pickup location</span><strong>{listing.location}</strong></p>
          <p><span>Status</span><strong>{listing.status}</strong></p>
          <p><span>Preferred pickup</span><strong>{listing.eta}</strong></p>
        </div>
        <p className="detail-description">{listing.description || 'No additional handling details were provided.'}</p>
        <button type="button" className="primary-button full-width" onClick={onClose}>Done</button>
      </section>
    </div>
  )
}

function DashboardPage({ dashboardStats, timeline, priorities }) {
  return (
    <section className="screen-shell dashboard-shell">
      <div className="section-heading inline-heading">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h2>Cooperative dashboard</h2>
        </div>
        <button type="button" className="secondary-button">Export report</button>
      </div>

      <div className="dashboard-grid">
        {dashboardStats.map((item) => (
          <div key={item.label} className="panel-card stat-panel">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="dashboard-columns">
        <div className="panel-card">
          <h3>Pickup status</h3>
          <ul className="timeline-list">
            {timeline.map((item) => (
              <li key={item.text}><span className={`dot ${item.state}`}></span> {item.text}</li>
            ))}
          </ul>
        </div>

        <div className="panel-card">
          <h3>Top priorities</h3>
          <ul className="priority-list">
            {priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [screen, setScreen] = useState('home')
  const [metrics, setMetrics] = useState(fallbackMetrics)
  const [listingCards, setListingCards] = useState(fallbackListingCards)
  const [dashboardStats, setDashboardStats] = useState(fallbackDashboardStats)
  const [timeline, setTimeline] = useState(fallbackTimeline)
  const [priorities, setPriorities] = useState(fallbackPriorities)
  const [showListingForm, setShowListingForm] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [savingListing, setSavingListing] = useState(false)
  const [listingError, setListingError] = useState('')
  const [savingCooperative, setSavingCooperative] = useState(false)
  const [cooperativeError, setCooperativeError] = useState('')
  const [cooperativeSuccess, setCooperativeSuccess] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [impactRes, listingsRes, dashboardRes] = await Promise.all([
          fetch('/api/impact'),
          fetch('/api/listings'),
          fetch('/api/dashboard'),
        ])

        if (impactRes.ok) {
          const impactData = await impactRes.json()
          setMetrics(impactData.metrics || fallbackMetrics)
        }

        if (listingsRes.ok) {
          const data = await listingsRes.json()
          setListingCards(data || fallbackListingCards)
        }

        if (dashboardRes.ok) {
          const data = await dashboardRes.json()
          setDashboardStats(data.stats || fallbackDashboardStats)
          setTimeline(data.timeline || fallbackTimeline)
          setPriorities(data.priorities || fallbackPriorities)
        }
      } catch (error) {
        console.error('Failed to load EcoConnect API data:', error)
      }
    }

    loadData()
  }, [])

  const navigate = (destination) => {
    setScreen(destination)
    setNotice('')
    setListingError('')
    setCooperativeError('')
    setCooperativeSuccess('')
    setShowListingForm(false)
    setSelectedListing(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSignIn = (event) => {
    event.preventDefault()
    navigate('dashboard')
    setNotice('Demo access started. This prototype does not yet verify accounts or passwords.')
  }

  const handleCreateListing = async (event) => {
    event.preventDefault()
    setSavingListing(true)
    setListingError('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const listing = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not submit this listing.')

      setListingCards((current) => [data, ...current])
      setShowListingForm(false)
      setNotice('Your waste listing was submitted.')
      form.reset()
    } catch (error) {
      setListingError(error.message || 'Unable to reach the EcoConnect API. Check that the backend is running.')
    } finally {
      setSavingListing(false)
    }
  }

  const handleCooperativeRegistration = async (event) => {
    event.preventDefault()
    setSavingCooperative(true)
    setCooperativeError('')
    setCooperativeSuccess('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const cooperative = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/cooperatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cooperative),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not submit your registration.')
      setCooperativeSuccess(`${data.cooperative.name} is registered. Our team can follow up at ${data.cooperative.email}.`)
      form.reset()
    } catch (error) {
      setCooperativeError(error.message || 'Unable to reach the EcoConnect API. Check that the backend is running.')
    } finally {
      setSavingCooperative(false)
    }
  }

  const renderScreen = () => {
    if (screen === 'login') return <LoginPage onSignIn={handleSignIn} />
    if (screen === 'cooperative') {
      return (
        <CooperativePage
          onSubmit={handleCooperativeRegistration}
          saving={savingCooperative}
          error={cooperativeError}
          success={cooperativeSuccess}
        />
      )
    }
    if (screen === 'listings') {
      return (
        <section className="screen-shell listings-shell">
          {showListingForm ? (
            <NewListingForm
              onSubmit={handleCreateListing}
              onCancel={() => {
                setShowListingForm(false)
                setListingError('')
              }}
              saving={savingListing}
              error={listingError}
            />
          ) : (
            <ListingsPage
              listingCards={listingCards}
              onCreateListing={() => {
                setShowListingForm(true)
                setNotice('')
              }}
              onViewDetails={setSelectedListing}
            />
          )}
        </section>
      )
    }
    if (screen === 'dashboard') return <DashboardPage dashboardStats={dashboardStats} timeline={timeline} priorities={priorities} />
    return (
      <HomePage
        metrics={metrics}
        onListWaste={() => {
          navigate('listings')
          setShowListingForm(true)
        }}
        onBecomeCooperative={() => navigate('cooperative')}
      />
    )
  }

  return (
    <div className="eco-app">
      <header className="topbar">
        <button type="button" className="brand-button" onClick={() => navigate('home')} aria-label="EcoConnect home">
          <span className="brand-mark">♻️</span>
          <span>EcoConnect</span>
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={screen === item.key ? 'nav-button active' : 'nav-button'}
              onClick={() => navigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="primary-button" onClick={() => navigate('login')}>
          Join now
        </button>
      </header>

      <main>
        {notice && <p className="app-notice" role="status">{notice}</p>}
        {renderScreen()}
      </main>
      <ListingDetails listing={selectedListing} onClose={() => setSelectedListing(null)} />
    </div>
  )
}

export default App
