import { useEffect, useMemo, useState } from 'react'
import './AdminDashboard.css'

const statusLabel = (status) =>
  String(status || 'UNKNOWN').replaceAll('_', ' ')

const assignedCooperativeLabel = (listing) => {
  const status = String(listing.status || '').trim().toUpperCase()

  if (['AVAILABLE', 'PENDING'].includes(status)) return 'Not Assigned'

  return listing.cooperativeName || 'Assignment details unavailable'
}

const getStatusGroup = (status) => {
  const value = String(status || '').toUpperCase()

  if (['AVAILABLE', 'PENDING'].includes(value)) return 'AWAITING PICKUP'
  if (['ACCEPTED', 'SCHEDULED'].includes(value)) return 'SCHEDULED'
  if (['IN_PROGRESS'].includes(value)) return 'IN PROGRESS'
  if (['COLLECTED', 'COMPLETED'].includes(value)) return 'COLLECTED'

  return value
}

const formatDate = (value) => {
  if (!value) return '—'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

const formatQuantity = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? `${number} kg` : '—'
}

export default function AdminDashboard({ user, listings = [], busy = false, error = '' }) {
  const [platformUsers, setPlatformUsers] = useState({
    totalUrbanGenerators: 0,
    totalCooperatives: 0,
    urbanGenerators: [],
    cooperatives: [],
  })
  const [usersError, setUsersError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortOrder, setSortOrder] = useState('LATEST')
  const [page, setPage] = useState(1)
  const [selectedListing, setSelectedListing] = useState(null)

  const pageSize = 8

  useEffect(() => {
    let active = true

    async function loadPlatformUsers() {
      try {
        const response = await fetch('/api/admin/users', {
          credentials: 'same-origin',
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data.message || 'Could not load platform users.')
        }

        if (active) {
          setPlatformUsers({
            totalUrbanGenerators: data.totalUrbanGenerators ?? 0,
            totalCooperatives: data.totalCooperatives ?? 0,
            urbanGenerators: data.urbanGenerators ?? [],
            cooperatives: data.cooperatives ?? [],
          })
          setUsersError('')
        }
      } catch (err) {
        if (active) setUsersError(err.message || 'Could not load platform users.')
      }
    }

    loadPlatformUsers()

    return () => {
      active = false
    }
  }, [])

  const totals = useMemo(() => {
    const count = (statuses) =>
      listings.filter((item) =>
        statuses.includes(String(item.status || '').toUpperCase()),
      ).length

    return {
      all: listings.length,
      awaiting: count(['AVAILABLE', 'PENDING']),
      inProgress: count(['IN_PROGRESS']),
      collected: count(['COLLECTED', 'COMPLETED']),
    }
  }, [listings])

  const activeCooperatives = useMemo(() => {
    const emails = new Set(
      listings
        .filter((item) =>
          ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS'].includes(
            String(item.status || '').toUpperCase(),
          ),
        )
        .map((item) => String(item.assignedCoordinatorEmail || '').toLowerCase())
        .filter(Boolean),
    )

    return emails.size
  }, [listings])

  const categoryData = useMemo(() => {
    const counts = new Map()

    listings.forEach((item) => {
      const category = item.wasteType || 'Other'
      counts.set(category, (counts.get(category) || 0) + 1)
    })

    const colors = ['#078653', '#84d69a', '#ffcc45', '#66a3f5', '#a278e5']

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        count,
        percentage: listings.length
          ? Math.round((count / listings.length) * 100)
          : 0,
        color: colors[index],
      }))
  }, [listings])

  const collectedByMonth = useMemo(() => {
    const now = new Date()
    const months = []

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)

      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-IN', { month: 'short' }),
        quantity: 0,
      })
    }

    const monthMap = new Map(months.map((month) => [month.key, month]))

    listings.forEach((item) => {
      if (!['COLLECTED', 'COMPLETED'].includes(String(item.status || '').toUpperCase())) {
        return
      }

      const date = item.collectedAt ? new Date(item.collectedAt) : null
      if (!date || Number.isNaN(date.getTime())) return

      const key = `${date.getFullYear()}-${date.getMonth()}`
      const month = monthMap.get(key)

      if (month) month.quantity += Number(item.quantityKg) || 0
    })

    return months
  }, [listings])

  const maxMonthlyQuantity = Math.max(
    ...collectedByMonth.map((item) => item.quantity),
    1,
  )

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...listings]
      .filter((item) => {
        const group = getStatusGroup(item.status)
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'AWAITING PICKUP'
            ? group === 'AWAITING PICKUP'
            : statusFilter === group)

        const searchable = [
          item.id,
          item.wasteType,
          item.location,
          item.contactName,
          item.createdByEmail,
          item.cooperativeName,
          item.assignedCoordinatorEmail,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return matchesStatus && searchable.includes(query)
      })
      .sort((a, b) => {
        const first = new Date(a.createdAt || 0).getTime()
        const second = new Date(b.createdAt || 0).getTime()

        return sortOrder === 'LATEST' ? second - first : first - second
      })
  }, [listings, search, statusFilter, sortOrder])

  const pageCount = Math.max(1, Math.ceil(filteredListings.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleListings = filteredListings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const donutBackground = categoryData.length
    ? `conic-gradient(${categoryData
        .reduce(
          (result, item) => {
            result.parts.push(
              `${item.color} ${result.start}% ${result.start + item.percentage}%`,
            )
            result.start += item.percentage
            return result
          },
          { parts: [], start: 0 },
        )
        .parts.join(', ')})`
    : '#e8eee9'

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-heading">
        <div>
          <div className="admin-dashboard-title">
            <span aria-hidden="true">🌱</span>
            <h1>Admin Dashboard</h1>
          </div>
          <p>Manage the platform, monitor activities, and track community impact.</p>
        </div>

        <div className="admin-date-card">
          <span aria-hidden="true">▦</span>
          <div>
            <small>Today</small>
            <strong>
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                weekday: 'long',
              })}
            </strong>
          </div>
        </div>
      </header>

      {error && <p className="admin-inline-error">{error}</p>}

      <section className="admin-summary-grid" aria-label="Listing summary">
        <SummaryCard icon="▤" title="Total Listings" value={totals.all} tone="green" />
        <SummaryCard icon="◷" title="Awaiting Pickup" value={totals.awaiting} tone="orange" />
        <SummaryCard icon="🚚" title="In Progress" value={totals.inProgress} tone="blue" />
        <SummaryCard icon="♻" title="Collected" value={totals.collected} tone="green" />
      </section>

      <section className="admin-analytics-grid">
        <article className="admin-panel admin-platform-panel">
          <PanelHeading icon="▥" title="Platform Overview" subtitle="Key metrics and insights" />

          <div className="admin-platform-metrics">
            <MetricCard
              icon="♙"
              label="Total Users"
              value={
                usersError
                  ? '—'
                  : platformUsers.totalUrbanGenerators + platformUsers.totalCooperatives
              }
              tone="green"
            />
            <MetricCard
              icon="⌂"
              label="Urban Generators"
              value={usersError ? '—' : platformUsers.totalUrbanGenerators}
              tone="blue"
            />
            <MetricCard
              icon="♟"
              label="Cooperatives"
              value={usersError ? '—' : platformUsers.totalCooperatives}
              tone="purple"
            />
            <MetricCard
              icon="✓"
              label="Cooperatives with Active Pickups"
              value={activeCooperatives}
              tone="green"
            />
          </div>

          {usersError && <p className="admin-inline-error">{usersError}</p>}
        </article>

        <article className="admin-panel admin-monthly-panel">
          <PanelHeading icon="▥" title="Waste Collected (Last 6 Months)" />

          <div className="admin-chart">
            <div className="admin-chart-axis">
              <span>{Math.round(maxMonthlyQuantity).toLocaleString()}</span>
              <span>{Math.round(maxMonthlyQuantity * 0.66).toLocaleString()}</span>
              <span>{Math.round(maxMonthlyQuantity * 0.33).toLocaleString()}</span>
              <span>0</span>
            </div>

            <div className="admin-bar-chart">
              {collectedByMonth.map((month) => (
                <div className="admin-bar-column" key={month.key}>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar"
                      style={{
                        height: `${(month.quantity / maxMonthlyQuantity) * 100}%`,
                      }}
                      title={`${month.label}: ${month.quantity} kg`}
                    />
                  </div>
                  <span>{month.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="admin-chart-note">Quantity recorded from collected listings (kg).</p>
        </article>

        <article className="admin-panel admin-category-panel">
          <PanelHeading icon="♻" title="Waste by Category" />

          <div className="admin-donut-layout">
            <div className="admin-donut" style={{ background: donutBackground }}>
              <div className="admin-donut-hole">
                <strong>{listings.length}</strong>
                <span>listings</span>
              </div>
            </div>

            <div className="admin-category-legend">
              {categoryData.map((category) => (
                <div key={category.name}>
                  <span className="admin-legend-dot" style={{ background: category.color }} />
                  <span>{category.name}</span>
                  <strong>{category.percentage}%</strong>
                </div>
              ))}

              {categoryData.length === 0 && <p>No category data yet.</p>}
            </div>
          </div>
        </article>
      </section>

      <section className="admin-panel admin-listings-panel">
        <div className="admin-listings-heading">
          <PanelHeading
            icon="▤"
            title="All Waste Listings"
            subtitle="View and manage all waste listings on the platform."
          />

          <div className="admin-listing-controls">
            <input
              aria-label="Search listings"
              placeholder="Search by ID, waste type, location or user..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AWAITING PICKUP">Awaiting Pickup</option>
              <option value="SCHEDULED">Scheduled / Accepted</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="COLLECTED">Collected</option>
            </select>

            <select
              aria-label="Sort listings"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="LATEST">Sort by Latest</option>
              <option value="OLDEST">Sort by Oldest</option>
            </select>
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-listings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Waste Type</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Generator</th>
                <th>Assigned Cooperative</th>
                <th>Status</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {busy ? (
                <tr><td colSpan="9" className="admin-table-message">Loading listings…</td></tr>
              ) : visibleListings.length === 0 ? (
                <tr><td colSpan="9" className="admin-table-message">No matching waste listings found.</td></tr>
              ) : (
                visibleListings.map((item) => (
                  <tr key={item.id}>
                    <td>WL-{String(item.id ?? '').padStart(3, '0')}</td>
                    <td><span className="admin-waste-leaf">♻</span> {item.wasteType || '—'}</td>
                    <td>{formatQuantity(item.quantityKg)}</td>
                    <td>{item.location || '—'}</td>
                    <td>{item.contactName || item.createdByEmail || '—'}</td>
                    <td>{assignedCooperativeLabel(item)}</td>
                    <td>
                      <span
                        className={`admin-status-badge ${getStatusGroup(item.status)
                          .toLowerCase()
                          .replaceAll(' ', '-')}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-view-button"
                        onClick={() => setSelectedListing(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="admin-table-footer">
          <span>
            Showing {filteredListings.length ? (currentPage - 1) * pageSize + 1 : 0}
            {'–'}
            {Math.min(currentPage * pageSize, filteredListings.length)} of {filteredListings.length} listings
          </span>

          <div className="admin-pagination">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              ‹
            </button>
            <span>Page {currentPage} of {pageCount}</span>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            >
              ›
            </button>
          </div>
        </footer>
      </section>

      {selectedListing && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedListing(null)}>
          <section
            className="admin-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-modal-close"
              aria-label="Close listing details"
              onClick={() => setSelectedListing(null)}
            >
              ×
            </button>

            <h2 id="admin-detail-title">Waste Listing Details</h2>
            <dl>
              <dt>Listing ID</dt><dd>WL-{String(selectedListing.id ?? '').padStart(3, '0')}</dd>
              <dt>Waste type</dt><dd>{selectedListing.wasteType || '—'}</dd>
              <dt>Quantity</dt><dd>{formatQuantity(selectedListing.quantityKg)}</dd>
              <dt>Location</dt><dd>{selectedListing.location || '—'}</dd>
              <dt>Generator</dt><dd>{selectedListing.contactName || '—'}</dd>
              <dt>Generator account</dt><dd>{selectedListing.createdByEmail || '—'}</dd>
              <dt>Cooperative</dt><dd>{assignedCooperativeLabel(selectedListing)}</dd>
              <dt>Status</dt><dd>{statusLabel(selectedListing.status)}</dd>
              <dt>Description</dt><dd>{selectedListing.description || '—'}</dd>
              <dt>Created</dt><dd>{formatDate(selectedListing.createdAt)}</dd>
            </dl>
          </section>
        </div>
      )}
    </main>
  )
}

function SummaryCard({ icon, title, value, tone }) {
  return (
    <article className={`admin-summary-card ${tone}`}>
      <span className="admin-summary-icon">{icon}</span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <small>Based on current platform records</small>
      </div>
    </article>
  )
}

function PanelHeading({ icon, title, subtitle }) {
  return (
    <div className="admin-panel-heading">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, tone }) {
  return (
    <div className={`admin-metric-card ${tone}`}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}