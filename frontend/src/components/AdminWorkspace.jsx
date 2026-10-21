import { useEffect, useMemo, useState } from 'react'
import './AdminWorkspace.css'

const completedStatuses = new Set(['COLLECTED', 'COMPLETED'])

async function readApiList(url, signal) {
  const response = await fetch(url, { credentials: 'same-origin', signal })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Could not load this section.')
  if (!Array.isArray(data)) throw new Error('The API returned an unexpected response.')
  return data
}

function displayDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleDateString()
}

function AdminHeading({ title, description }) {
  return (
    <header className="admin-page-heading">
      <p className="eyebrow">Administrator workspace</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

export default function AdminWorkspace({ section }) {
  const [approvals, setApprovals] = useState([])
  const [listings, setListings] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const urls = {
      approvals: ['/api/admin/cooperative-approvals'],
      pickups: ['/api/admin/pickups'],
      complaints: ['/api/complaints'],
      impact: ['/api/admin/pickups'],
    }
    const url = urls[section]?.[0]
    if (!url) return () => controller.abort()

    readApiList(url, controller.signal)
      .then((records) => {
        if (controller.signal.aborted) return
        if (section === 'approvals') setApprovals(records)
        else if (section === 'complaints') setComplaints(records)
        else setListings(records)
      })
      .catch((loadError) => {
        if (!controller.signal.aborted) setError(loadError.message || 'Unable to reach the EcoConnect API.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [section])

  const filteredApprovals = useMemo(() => approvals.filter((request) =>
    filter === 'ALL' || String(request.approvalStatus || 'PENDING').toUpperCase() === filter), [approvals, filter])
  const filteredPickups = useMemo(() => listings.filter((listing) => {
    const status = String(listing.status || '').toUpperCase()
    const matchesStatus = filter === 'ALL' || status === filter
    const searchable = `${listing.id} ${listing.wasteType || ''} ${listing.createdByEmail || ''} ${listing.cooperativeName || ''}`.toLowerCase()
    return matchesStatus && searchable.includes(search.trim().toLowerCase())
  }), [filter, listings, search])
  const filteredComplaints = useMemo(() => complaints.filter((complaint) =>
    filter === 'ALL' || String(complaint.status || 'OPEN').toUpperCase() === filter), [complaints, filter])

  const updateRecordStatus = async (kind, record, status) => {
    setSavingId(record.id)
    setActionError('')
    try {
      const endpoint = kind === 'approval'
        ? `/api/admin/cooperative-approvals/${record.id}`
        : `/api/complaints/${record.id}/status`
      const response = await fetch(endpoint, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const updated = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(updated.message || 'Could not update this record.')
      if (kind === 'approval') {
        setApprovals((items) => items.map((item) => item.id === record.id ? updated : item))
      } else {
        setComplaints((items) => items.map((item) => item.id === record.id ? updated : item))
        setSelectedRecord(updated)
      }
      try {
        const url = kind === 'approval' ? '/api/admin/cooperative-approvals' : '/api/complaints'
        const refreshed = await readApiList(url)
        if (kind === 'approval') setApprovals(refreshed)
        else setComplaints(refreshed)
      } catch {
        setActionError('The status was saved, but the list could not be refreshed. Reload this section to verify the latest data.')
      }
    } catch (updateError) {
      setActionError(updateError.message || 'Unable to reach the EcoConnect API.')
    } finally {
      setSavingId(null)
    }
  }

  if (section === 'approvals') {
    return (
      <section className="screen-shell admin-workspace">
        <AdminHeading title="Cooperative Approvals" description="Review and manage cooperative coordinator registrations." />
        <label className="admin-filter">
          Approval status
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="ALL">All requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>
        {loading && <p className="admin-state" role="status">Loading cooperative requests…</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {actionError && <p className="admin-error" role="alert">{actionError}</p>}
        {!loading && !error && filteredApprovals.length === 0 && <p className="admin-empty">No cooperative requests match this filter.</p>}
        <div className="admin-record-list">
          {filteredApprovals.map((request) => {
            const status = String(request.approvalStatus || 'PENDING').toUpperCase()
            return (
              <article className="panel-card admin-record" key={request.id}>
                <div className="admin-record-heading">
                  <h2>{request.organizationName || 'Cooperative registration'}</h2>
                  <span className={`admin-status admin-status-${status.toLowerCase()}`}>{status.replaceAll('_', ' ')}</span>
                </div>
                <p><strong>Coordinator:</strong> {request.coordinatorEmail}</p>
                <p><strong>Location:</strong> {request.location || 'Not provided'}</p>
                <p><strong>Registered:</strong> {displayDate(request.createdAt)}</p>
                {status === 'PENDING' && (
                  <div className="admin-record-actions">
                    <button className="primary-button" disabled={savingId === request.id} onClick={() => updateRecordStatus('approval', request, 'APPROVED')}>Approve</button>
                    <button className="admin-subtle-danger" disabled={savingId === request.id} onClick={() => updateRecordStatus('approval', request, 'REJECTED')}>Reject</button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    )
  }

  if (section === 'pickups') {
    return (
      <section className="screen-shell admin-workspace">
        <AdminHeading title="Pickup Tracking" description="Search existing waste listings and inspect their pickup progress." />
        <div className="admin-filter-row">
          <label className="admin-filter">Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, waste, generator, cooperative" /></label>
          <label className="admin-filter">Status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All statuses</option>{[...new Set(listings.map((listing) => String(listing.status || 'UNKNOWN').toUpperCase()))].sort().map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></label>
        </div>
        {loading && <p className="admin-state" role="status">Loading pickup records…</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {!loading && !error && filteredPickups.length === 0 && <p className="admin-empty">No pickup records match this search.</p>}
        <div className="admin-record-list">
          {filteredPickups.map((listing) => (
            <article className="panel-card admin-record" key={listing.id}>
              <div className="admin-record-heading">
                <h2>Listing #{listing.id} · {listing.wasteType}</h2>
                <span className={`admin-status admin-status-${String(listing.status || 'unknown').toLowerCase()}`}>{String(listing.status || 'Unknown').replaceAll('_', ' ')}</span>
              </div>
              <p><strong>Quantity:</strong> {listing.quantityKg} kg</p>
              <p><strong>Generator:</strong> {listing.createdByEmail || 'Not recorded'}</p>
              <p><strong>Cooperative:</strong> {listing.cooperativeName || 'Not assigned'}</p>
              <button className="secondary-button" type="button" onClick={() => setSelectedRecord(listing)}>View details</button>
            </article>
          ))}
        </div>
        {selectedRecord && (
          <div className="admin-modal-backdrop" role="presentation" onClick={() => setSelectedRecord(null)}>
            <section className="panel-card admin-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-pickup-detail" onClick={(event) => event.stopPropagation()}>
              <h2 id="admin-pickup-detail">Listing #{selectedRecord.id} details</h2>
              <p><strong>Waste type:</strong> {selectedRecord.wasteType}</p>
              <p><strong>Quantity:</strong> {selectedRecord.quantityKg} kg</p>
              <p><strong>Status:</strong> {selectedRecord.status}</p>
              <p><strong>Generator:</strong> {selectedRecord.createdByEmail || 'Not recorded'}</p>
              <p><strong>Cooperative:</strong> {selectedRecord.cooperativeName || 'Not assigned'}</p>
              <p><strong>Location:</strong> {selectedRecord.location || 'Not provided'}</p>
              <p><strong>Description:</strong> {selectedRecord.description || 'No additional details.'}</p>
              <p><strong>Created:</strong> {displayDate(selectedRecord.createdAt)}</p>
              <button className="secondary-button" onClick={() => setSelectedRecord(null)}>Close</button>
            </section>
          </div>
        )}
      </section>
    )
  }

  if (section === 'complaints') {
    return (
      <section className="screen-shell admin-workspace">
        <AdminHeading title="Complaints" description="Review submitted complaints and track their resolution." />
        <label className="admin-filter">Complaint status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All complaints</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option></select></label>
        {loading && <p className="admin-state" role="status">Loading complaints…</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {actionError && <p className="admin-error" role="alert">{actionError}</p>}
        {!loading && !error && filteredComplaints.length === 0 && <p className="admin-empty">No complaints have been submitted.</p>}
        <div className="admin-record-list">
          {filteredComplaints.map((complaint) => (
            <article className="panel-card admin-record" key={complaint.id}>
              <div className="admin-record-heading"><h2>#{complaint.id} · {complaint.subject}</h2><span className={`admin-status admin-status-${String(complaint.status).toLowerCase()}`}>{String(complaint.status).replaceAll('_', ' ')}</span></div>
              <p><strong>Reporter:</strong> {complaint.reporterName} ({complaint.reporterEmail})</p>
              <p><strong>Date:</strong> {displayDate(complaint.createdAt)}</p>
              <div className="admin-record-actions">
                <button className="secondary-button" onClick={() => setSelectedRecord(complaint)}>View details</button>
                <select aria-label={`Update status for complaint ${complaint.id}`} value={complaint.status} disabled={savingId === complaint.id} onChange={(event) => updateRecordStatus('complaint', complaint, event.target.value)}>
                  <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </article>
          ))}
        </div>
        {selectedRecord && (
          <div className="admin-modal-backdrop" role="presentation" onClick={() => setSelectedRecord(null)}>
            <section className="panel-card admin-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-complaint-detail" onClick={(event) => event.stopPropagation()}>
              <h2 id="admin-complaint-detail">{selectedRecord.subject}</h2>
              <p><strong>Complaint #{selectedRecord.id}</strong></p>
              <p><strong>Reporter:</strong> {selectedRecord.reporterName} ({selectedRecord.reporterEmail})</p>
              <p><strong>Date:</strong> {displayDate(selectedRecord.createdAt)}</p>
              <p>{selectedRecord.details}</p>
              <button className="secondary-button" onClick={() => setSelectedRecord(null)}>Close</button>
            </section>
          </div>
        )}
      </section>
    )
  }

  const collected = listings.filter((listing) => completedStatuses.has(String(listing.status || '').toUpperCase()))
  const totalKg = collected.reduce((total, listing) => total + Number(listing.quantityKg || 0), 0)
  const byType = Object.entries(collected.reduce((totals, listing) => {
    const category = listing.wasteType || 'Unspecified'
    totals[category] = (totals[category] || 0) + Number(listing.quantityKg || 0)
    return totals
  }, {})).sort((a, b) => b[1] - a[1])
  const monthMap = collected.reduce((totals, listing) => {
    const date = new Date(listing.createdAt)
    if (!Number.isNaN(date.getTime())) {
      const month = date.toISOString().slice(0, 7)
      totals[month] = (totals[month] || 0) + Number(listing.quantityKg || 0)
    }
    return totals
  }, {})
  const months = Object.entries(monthMap)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6)
  const maxMonth = Math.max(1, ...months.map(([, kg]) => kg))

  return (
    <section className="screen-shell admin-workspace">
      <AdminHeading title="Environmental Impact" description="Collection totals calculated from actual listings marked collected or completed." />
      {loading && <p className="admin-state" role="status">Loading impact data…</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
      {!loading && !error && (
        <>
          <div className="admin-impact-metrics">
            <article className="panel-card"><span>Total waste collected</span><strong>{totalKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</strong></article>
            <article className="panel-card"><span>Completed pickups</span><strong>{collected.length}</strong></article>
          </div>
          <div className="admin-impact-columns">
            <section className="panel-card admin-impact-panel">
              <h2>Collected by category</h2>
              {byType.length === 0 ? <p className="admin-empty">No completed collection data is available yet.</p> : byType.map(([category, kg]) => <p className="admin-impact-row" key={category}><span>{category}</span><strong>{kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</strong></p>)}
            </section>
            <section className="panel-card admin-impact-panel">
              <h2>Completed waste by listing month</h2>
              <p className="admin-chart-note">Grouped by listing creation month; the records do not include a separate collection timestamp.</p>
              {months.length === 0 ? <p className="admin-empty">No dated completed collections are available.</p> : <div className="admin-month-chart">{months.map(([month, kg]) => <div className="admin-month-column" key={month}><div className="admin-month-bar" style={{ height: `${Math.max(5, (kg / maxMonth) * 100)}%` }} title={`${kg} kg`} /><span>{new Date(`${month}-01T00:00:00`).toLocaleString(undefined, { month: 'short', year: '2-digit' })}</span></div>)}</div>}
            </section>
          </div>
        </>
      )}
    </section>
  )
}
