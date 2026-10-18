import { useState } from 'react'
import './UrbanGeneratorPages.css'

const wasteTypes = [
  'Food scraps',
  'Garden waste',
  'Fruit peels',
  'Leaf litter',
  'Other organic waste',
]

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="urban-page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function LoadingMessage({ children = 'Loading data…' }) {
  return <p className="urban-page-message" role="status">{children}</p>
}

function ErrorMessage({ children }) {
  return <p className="urban-page-message urban-page-error" role="alert">{children}</p>
}

export function FindCooperativesPage({ cooperatives, loading, error }) {
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [wasteTypeFilter, setWasteTypeFilter] = useState('')

  const locations = [...new Set(cooperatives.map((cooperative) => cooperative.location).filter(Boolean))].sort()
  const filteredCooperatives = cooperatives.filter((cooperative) => {
    const searchText = `${cooperative.name || ''} ${cooperative.location || ''}`.toLowerCase()
    const matchesSearch = searchText.includes(search.trim().toLowerCase())
    const matchesLocation = !locationFilter || cooperative.location === locationFilter
    const acceptedTypes = cooperative.acceptedWasteTypes || []
    const matchesWasteType = !wasteTypeFilter || acceptedTypes.includes(wasteTypeFilter)
    return matchesSearch && matchesLocation && matchesWasteType
  })

  return (
    <section className="screen-shell urban-page-shell">
      <PageHeading
        eyebrow="Local collection partners"
        title="Find Cooperatives"
        description="Explore registered cooperatives and their service information."
      />

      <div className="urban-filter-panel panel-card">
        <label>
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or location"
          />
        </label>
        <label>
          Location
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="">All locations</option>
            {locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>
        </label>
        <label>
          Waste type
          <select value={wasteTypeFilter} onChange={(event) => setWasteTypeFilter(event.target.value)}>
            <option value="">All waste types</option>
            {wasteTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </div>

      {loading && <LoadingMessage>Loading registered cooperatives…</LoadingMessage>}
      {!loading && !error && cooperatives.length === 0 && (
        <div className="empty-state panel-card">
          <span aria-hidden="true">🌾</span>
          <h2>No cooperatives are registered yet</h2>
          <p>Registered cooperative profiles will appear here when available.</p>
        </div>
      )}
      {!loading && !error && cooperatives.length > 0 && filteredCooperatives.length === 0 && (
        <div className="empty-state panel-card">
          <span aria-hidden="true">🔎</span>
          <h2>No matching cooperatives</h2>
          <p>Try changing your search or filters.</p>
        </div>
      )}
      {!loading && !error && filteredCooperatives.length > 0 && (
        <div className="cooperative-grid">
          {filteredCooperatives.map((cooperative) => (
            <article className="panel-card cooperative-card" key={cooperative.id}>
              <div className="cooperative-card-heading">
                <span className="role-icon" aria-hidden="true">🌾</span>
                <div>
                  <h2>{cooperative.name}</h2>
                  <p>{cooperative.location || 'Location not provided'}</p>
                </div>
              </div>
              <dl className="cooperative-details">
                <div>
                  <dt>Accepted organic waste</dt>
                  <dd>{cooperative.acceptedWasteTypes?.length ? cooperative.acceptedWasteTypes.join(', ') : 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Collection capacity</dt>
                  <dd>{cooperative.capacityKg != null ? `${cooperative.capacityKg} kg` : 'Not provided'}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{cooperative.availability || 'Not tracked'}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const guideSections = [
  {
    icon: '🍎',
    title: 'Accepted organic waste',
    items: [
      'Fruit and vegetable peels',
      'Leftover plant-based food',
      'Garden leaves',
      'Grass clippings',
    ],
  },
  {
    icon: '🚫',
    title: 'Keep these separate',
    items: [
      'Plastic and packaging',
      'Glass and metal',
      'Chemicals and hazardous materials',
      'Other non-organic materials',
    ],
  },
  {
    icon: '🧺',
    title: 'Prepare waste for pickup',
    items: [
      'Separate organic waste from other materials',
      'Remove packaging',
      'Drain excess water',
      'Use a suitable, easy-to-handle container',
    ],
  },
  {
    icon: '🧼',
    title: 'Storage and hygiene tips',
    items: [
      'Keep waste in a covered container',
      'Store it in a cool, shaded place',
      'Empty and rinse the container regularly',
      'Wash your hands after handling waste',
    ],
  },
]

const wasteFaqs = [
  {
    question: 'Can I include cooked food leftovers?',
    answer: 'Plant-based food leftovers are suitable. Keep them separate from meat, dairy, and non-organic materials unless your receiving cooperative confirms it accepts them.',
  },
  {
    question: 'Should I include packaging with the waste?',
    answer: 'No. Remove plastic, paper packaging, ties, and other non-organic materials before placing waste in the pickup container.',
  },
  {
    question: 'How should I store waste before collection?',
    answer: 'Use a covered, suitable container and keep it in a cool shaded place. Drain excess water to help reduce odor and leakage.',
  },
  {
    question: 'What should I do with glass, metal, or chemicals?',
    answer: 'Keep them out of organic waste. Store and dispose of them through the appropriate recycling or hazardous-waste service.',
  },
]

export function WasteGuidePage() {
  return (
    <section className="screen-shell urban-page-shell">
      <PageHeading
        eyebrow="Sort it right"
        title="Organic Waste Guide"
        description="A few simple steps help keep organic waste clean, safe, and ready for processing."
      />

      <div className="guide-grid">
        {guideSections.map((section) => (
          <article className="panel-card guide-card" key={section.title}>
            <span className="guide-icon" aria-hidden="true">{section.icon}</span>
            <h2>{section.title}</h2>
            <ul>
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>

      <section className="faq-section">
        <div className="section-heading">
          <p className="eyebrow">Frequently asked questions</p>
          <h2>Quick answers for better pickups.</h2>
        </div>
        <div className="faq-grid">
          {wasteFaqs.map((faq) => (
            <article className="panel-card faq-card" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

function getCollectedListings(listings) {
  return listings.filter((listing) => String(listing.status || '').toUpperCase() === 'COLLECTED')
}

export function ImpactReportsPage({ listings, loading, error }) {
  const collectedListings = getCollectedListings(listings)
  const totalKilograms = collectedListings.reduce((total, listing) => total + Number(listing.quantityKg || 0), 0)
  const breakdown = collectedListings.reduce((totals, listing) => {
    const wasteType = listing.wasteType || 'Unspecified'
    totals[wasteType] = (totals[wasteType] || 0) + Number(listing.quantityKg || 0)
    return totals
  }, {})
  const breakdownRows = Object.entries(breakdown).sort((first, second) => second[1] - first[1])
  const maxWasteTypeQuantity = Math.max(...breakdownRows.map(([, quantity]) => quantity), 0)

  return (
    <section className="screen-shell urban-page-shell">
      <PageHeading
        eyebrow="Your contribution"
        title="Impact & Reports"
        description="A summary of organic waste from your listings that has been marked as collected."
      />

      {loading && <LoadingMessage>Loading your impact data…</LoadingMessage>}
      {!loading && !error && (
        <>
          <div className="impact-metric-grid">
            <article className="panel-card impact-metric-card">
              <span className="guide-icon" aria-hidden="true">♻️</span>
              <p>Total waste collected</p>
              <strong>{totalKilograms.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</strong>
            </article>
            <article className="panel-card impact-metric-card">
              <span className="guide-icon" aria-hidden="true">📦</span>
              <p>Completed pickups</p>
              <strong>{collectedListings.length}</strong>
            </article>
          </div>

          <section className="impact-breakdown panel-card">
            <div className="section-heading">
              <p className="eyebrow">Collected waste</p>
              <h2>Breakdown by waste type</h2>
            </div>
            {breakdownRows.length === 0 ? (
              <div className="urban-empty-inline">
                <strong>No completed pickups yet</strong>
                <p>Once a cooperative marks one of your pickups as collected, your contribution will appear here.</p>
              </div>
            ) : (
              <div className="impact-bars">
                {breakdownRows.map(([type, quantity]) => (
                  <div className="impact-bar-row" key={type}>
                    <div className="impact-bar-label">
                      <span>{type}</span>
                      <strong>{quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</strong>
                    </div>
                    <div className="impact-bar-track" aria-label={`${type}: ${quantity} kg collected`}>
                      <span style={{ width: `${(quantity / maxWasteTypeQuantity) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}

const statusLabels = {
  AVAILABLE: 'Awaiting pickup',
  PENDING: 'Awaiting pickup',
  ACCEPTED: 'Accepted',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COLLECTED: 'Collected',
  COMPLETED: 'Collected',
}

export function PickupHistoryPage({ listings, loading, error, onBack }) {
  return (
    <section className="screen-shell urban-page-shell pickup-history-page">
      <PageHeading
        eyebrow="Your collection activity"
        title="Pickup History"
        description="Track the current status of the waste listings you have submitted."
      />

      {loading && <LoadingMessage>Loading your pickup history…</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!loading && !error && listings.length === 0 && (
        <div className="empty-state panel-card">
          <span aria-hidden="true">📋</span>
          <h2>No pickup records yet</h2>
          <p>Your waste listings and their pickup progress will appear here.</p>
        </div>
      )}
      {!loading && !error && listings.length > 0 && (
        <div className="pickup-history-list">
          {listings.map((listing) => {
            const status = String(listing.status || '').toUpperCase()
            const label = statusLabels[status] || status.replaceAll('_', ' ') || 'Status unavailable'
            return (
              <article className="panel-card pickup-history-card" key={listing.id}>
                <div className="pickup-history-title">
                  <div>
                    <span className="listing-tag">{listing.wasteType || 'Organic waste'}</span>
                    <h2>{listing.quantityKg ?? 0} kg</h2>
                  </div>
                  <span className={`status-pill status-${status.toLowerCase()}`}>{label}</span>
                </div>
                <dl className="pickup-history-details">
                  <div><dt>Cooperative</dt><dd>{listing.cooperativeName || 'Not assigned'}</dd></div>
                  <div><dt>Pickup date</dt><dd>{listing.pickupDate || 'Not recorded'}</dd></div>
                  <div><dt>Location</dt><dd>{listing.location || 'Not provided'}</dd></div>
                </dl>
              </article>
            )
          })}
        </div>
      )}

      <button className="secondary-button urban-back-button" type="button" onClick={onBack}>← Back to Dashboard</button>
    </section>
  )
}

export function UrbanProfilePage({ user, onLogout }) {
  return (
    <section className="screen-shell urban-page-shell">
      <PageHeading
        eyebrow="Account details"
        title="Profile"
        description="Review the details associated with your EcoConnect account."
      />
      <article className="panel-card urban-profile-card">
        <div className="urban-profile-avatar" aria-hidden="true">
          {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <dl className="cooperative-details">
          <div><dt>Full name</dt><dd>{user?.fullName || 'Not provided'}</dd></div>
          <div><dt>Email</dt><dd>{user?.email || 'Not provided'}</dd></div>
          <div><dt>Role</dt><dd>Urban Waste Generator</dd></div>
          <div><dt>Location</dt><dd>{user?.location || 'Not provided'}</dd></div>
        </dl>
        <button className="secondary-button urban-logout-button" type="button" onClick={onLogout}>Log out</button>
      </article>
    </section>
  )
}
