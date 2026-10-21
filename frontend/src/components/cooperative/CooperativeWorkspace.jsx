import { useCallback, useEffect, useMemo, useState } from 'react'
import Footer from '../footer'
import './CooperativeWorkspace.css'

const processingStages = ['RECEIVED', 'SORTING', 'PROCESSING', 'PROCESSED']
const pickupStatuses = ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'COLLECTED']

function formatDate(value, includeTime = false) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return date.toLocaleString(undefined, includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' })
}

function formatQuantity(value) {
  const quantity = Number(value)
  return Number.isFinite(quantity) ? quantity.toLocaleString() : 'Not recorded'
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <header className="cooperative-page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

function CsvExport({ records }) {
  const exportCsv = () => {
    const columns = [
      ['Listing reference', (record) => record.id],
      ['Waste type', (record) => record.wasteType],
      ['Quantity (kg)', (record) => record.quantityKg],
      ['Generator', (record) => record.contactName || record.createdByEmail],
      ['Location', (record) => record.location],
      ['Pickup date', (record) => record.collectedAt],
      ['Final status', () => 'COLLECTED'],
    ]
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [
      columns.map(([name]) => quote(name)).join(','),
      ...records.map((record) => columns.map(([, value]) => quote(value(record))).join(',')),
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'ecoconnect-collection-history.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <button className="secondary-button" type="button" onClick={exportCsv} disabled={!records.length}>Export CSV</button>
}

export default function CooperativeWorkspace({ section }) {
  const [pickups, setPickups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [scheduleValues, setScheduleValues] = useState({})

  const loadPickups = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/waste-listings/cooperative/pickups', {
        credentials: 'same-origin',
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not load cooperative pickups.')
      if (!Array.isArray(data)) throw new Error('The pickups API returned an unexpected response.')
      setPickups(data)
    } catch (loadError) {
      setError(loadError.message || 'Unable to reach the EcoConnect API.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPickups()
  }, [loadPickups])

  const uniqueTypes = useMemo(() => [...new Set(pickups.map((item) => item.wasteType).filter(Boolean))].sort(), [pickups])

  const collectedPickups = useMemo(() => pickups.filter((item) =>
    item.collectedAt || ['COLLECTED', 'COMPLETED'].includes(String(item.status || '').toUpperCase())), [pickups])

  const visibleRecords = useMemo(() => {
    const source = section === 'waste-processing' || section === 'inventory' || section === 'collection-history'
      ? collectedPickups
      : pickups
    return source.filter((item) => {
      const status = String(item.status || '').toUpperCase()
      const processingStatus = String(item.processingStatus || '').toUpperCase()
      const dateValue = section === 'collection-history'
        ? item.collectedAt
        : item.scheduledPickupAt || item.createdAt
      const searchText = `${item.id} ${item.wasteType || ''} ${item.contactName || ''} ${item.createdByEmail || ''} ${item.location || ''}`.toLowerCase()
      const statusValue = section === 'waste-processing' || section === 'inventory'
        ? processingStatus || 'NOT_STARTED'
        : status
      return (statusFilter === 'ALL' || statusValue === statusFilter)
        && (typeFilter === 'ALL' || item.wasteType === typeFilter)
        && (!search.trim() || searchText.includes(search.trim().toLowerCase()))
        && (section === 'collection-history'
          ? (!dateFrom || String(dateValue || '').slice(0, 10) >= dateFrom)
            && (!dateTo || String(dateValue || '').slice(0, 10) <= dateTo)
          : !dateFilter || String(dateValue || '').slice(0, 10) === dateFilter)
    }).sort((first, second) => {
      const firstDate = Date.parse(first.collectedAt || first.scheduledPickupAt || first.createdAt || '') || 0
      const secondDate = Date.parse(second.collectedAt || second.scheduledPickupAt || second.createdAt || '') || 0
      return section === 'collection-history' ? secondDate - firstDate : firstDate - secondDate
    })
  }, [collectedPickups, dateFilter, dateFrom, dateTo, pickups, search, section, statusFilter, typeFilter])

  const updatePickupStatus = async (listing, status) => {
    setSavingId(listing.id)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/waste-listings/${listing.id}/status`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const updated = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(updated.message || 'Could not update pickup status.')
      setPickups((records) => records.map((item) => item.id === listing.id ? updated : item))
      setNotice(`Pickup #${listing.id} updated to ${status.replaceAll('_', ' ').toLowerCase()}.`)
      await loadPickups(false)
    } catch (updateError) {
      setError(updateError.message || 'Unable to update this pickup.')
    } finally {
      setSavingId(null)
    }
  }

  const saveSchedule = async (listing) => {
    const scheduledPickupAt = scheduleValues[listing.id]
    if (!scheduledPickupAt || Date.parse(scheduledPickupAt) <= Date.now()) {
      setError('Choose a pickup date and time in the future.')
      return
    }
    setSavingId(listing.id)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/waste-listings/cooperative/pickups/${listing.id}/schedule`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledPickupAt }),
      })
      const updated = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(updated.message || 'Could not save the pickup schedule.')
      setPickups((records) => records.map((item) => item.id === listing.id ? updated : item))
      setNotice(`Pickup #${listing.id} schedule saved.`)
      await loadPickups(false)
    } catch (updateError) {
      setError(updateError.message || 'Unable to save the pickup schedule.')
    } finally {
      setSavingId(null)
    }
  }

  const updateProcessing = async (listing) => {
    const current = String(listing.processingStatus || '').toUpperCase()
    const next = current ? processingStages[processingStages.indexOf(current) + 1] : 'RECEIVED'
    if (!next) return
    setSavingId(listing.id)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/waste-listings/cooperative/pickups/${listing.id}/processing`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processingStatus: next }),
      })
      const updated = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(updated.message || 'Could not update processing status.')
      setPickups((records) => records.map((item) => item.id === listing.id ? updated : item))
      setNotice(`Listing #${listing.id} moved to ${next.toLowerCase()}.`)
      await loadPickups(false)
    } catch (updateError) {
      setError(updateError.message || 'Unable to update processing status.')
    } finally {
      setSavingId(null)
    }
  }

  const processingTotals = useMemo(() => {
    const totals = { RECEIVED: 0, SORTING: 0, PROCESSING: 0, PROCESSED: 0, UNKNOWN: 0 }
    for (const item of collectedPickups) {
      const status = String(item.processingStatus || '').toUpperCase() || 'UNKNOWN'
      if (Object.hasOwn(totals, status)) totals[status] += Number(item.quantityKg || 0)
    }
    return totals
  }, [collectedPickups])

  const typeTotals = useMemo(() => {
    const totals = new Map()
    for (const item of collectedPickups) {
      const type = item.wasteType || 'Unspecified'
      totals.set(type, (totals.get(type) || 0) + Number(item.quantityKg || 0))
    }
    return [...totals.entries()].sort(([left], [right]) => left.localeCompare(right))
  }, [collectedPickups])

  const filterPanel = (withDate) => (
    <div className="cooperative-filter-panel panel-card">
      <label>Search<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Listing, generator, or location" /></label>
      <label>Waste type<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="ALL">All waste types</option>{uniqueTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{(section === 'waste-processing' || section === 'inventory' ? ['ALL', 'NOT_STARTED', ...processingStages] : ['ALL', ...pickupStatuses]).map((status) => <option key={status} value={status}>{status === 'ALL' ? 'All statuses' : status.replaceAll('_', ' ')}</option>)}</select></label>
      {withDate && section === 'collection-history' && <>
        <label>Collected from<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
        <label>Collected through<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
      </>}
      {withDate && section !== 'collection-history' && <label>Scheduled / created date<input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>}
    </div>
  )

  const pickupActions = (listing) => {
    const status = String(listing.status || '').toUpperCase()
    if (status === 'ACCEPTED' || status === 'SCHEDULED') {
      return <button type="button" className="primary-button" disabled={savingId === listing.id} onClick={() => void updatePickupStatus(listing, 'IN_PROGRESS')}>Start pickup</button>
    }
    if (status === 'IN_PROGRESS') {
      return <button type="button" className="primary-button" disabled={savingId === listing.id} onClick={() => void updatePickupStatus(listing, 'COLLECTED')}>Mark collected</button>
    }
    return null
  }

  let page
  if (section === 'pickup-schedule') {
    page = (
      <>
        <PageHeading eyebrow="Cooperative operations" title="Pickup Schedule" description="Schedule accepted pickups and track their progress through collection." />
        {filterPanel(true)}
        <div className="cooperative-record-list">
          {visibleRecords.map((listing) => {
            const status = String(listing.status || '').toUpperCase()
            const scheduledDate = listing.scheduledPickupAt
              ? String(listing.scheduledPickupAt).slice(0, 16)
              : ''
            const overdue = listing.scheduledPickupAt && new Date(listing.scheduledPickupAt) < new Date()
              && !['COLLECTED', 'COMPLETED'].includes(status)
            const scheduleState = listing.scheduledPickupAt && !['COLLECTED', 'COMPLETED'].includes(status)
              ? overdue ? 'Overdue' : 'Upcoming'
              : ''
            return (
              <article className="panel-card cooperative-record-card" key={listing.id}>
                <div className="cooperative-record-title">
                  <div><p className="eyebrow">Listing #{listing.id}</p><h2>{listing.wasteType || 'Waste pickup'}</h2></div>
                  <span className={`cooperative-status cooperative-status-${status.toLowerCase()}`}>{status.replaceAll('_', ' ')}</span>
                </div>
                <dl className="cooperative-details">
                  <div><dt>Quantity</dt><dd>{formatQuantity(listing.quantityKg)} kg</dd></div>
                  <div><dt>Generator</dt><dd>{listing.contactName || 'Not recorded'}{listing.createdByEmail ? ` · ${listing.createdByEmail}` : ''}</dd></div>
                  <div><dt>Contact phone</dt><dd>{listing.contactPhone || 'Not provided'}</dd></div>
                  <div><dt>Pickup location</dt><dd>{listing.location || 'Not provided'}</dd></div>
                  <div><dt>Scheduled pickup</dt><dd>{formatDate(listing.scheduledPickupAt, true)}</dd></div>
                  {scheduleState && <div><dt>Schedule</dt><dd className={overdue ? 'cooperative-overdue' : ''}>{scheduleState}</dd></div>}
                </dl>
                {['ACCEPTED', 'SCHEDULED'].includes(status) && (
                  <div className="cooperative-record-actions">
                    <label>Pickup date and time<input type="datetime-local" min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} value={scheduleValues[listing.id] ?? scheduledDate} onChange={(event) => setScheduleValues((values) => ({ ...values, [listing.id]: event.target.value }))} /></label>
                    <button type="button" className="secondary-button" disabled={savingId === listing.id} onClick={() => void saveSchedule(listing)}>{savingId === listing.id ? 'Saving…' : 'Save schedule'}</button>
                    {pickupActions(listing)}
                  </div>
                )}
                {status === 'IN_PROGRESS' && <div className="cooperative-record-actions">{pickupActions(listing)}</div>}
              </article>
            )
          })}
        </div>
      </>
    )
  } else if (section === 'waste-processing') {
    page = (
      <>
        <PageHeading eyebrow="Post-collection workflow" title="Waste Processing" description="Track collected batches through receiving, sorting, processing, and completion." />
        {filterPanel(false)}
        <div className="cooperative-record-list">
          {visibleRecords.map((listing) => {
            const status = String(listing.processingStatus || '').toUpperCase()
            const nextStage = status ? processingStages[processingStages.indexOf(status) + 1] : 'RECEIVED'
            return (
              <article className="panel-card cooperative-record-card" key={listing.id}>
                <div className="cooperative-record-title"><div><p className="eyebrow">Listing #{listing.id}</p><h2>{listing.wasteType || 'Waste batch'}</h2></div><span className="cooperative-status">{status || 'NOT STARTED'}</span></div>
                <dl className="cooperative-details">
                  <div><dt>Quantity</dt><dd>{formatQuantity(listing.quantityKg)} kg</dd></div>
                  <div><dt>Collected</dt><dd>{formatDate(listing.collectedAt || listing.createdAt)}</dd></div>
                  <div><dt>Pickup status</dt><dd>{String(listing.status || 'COLLECTED').replaceAll('_', ' ')}</dd></div>
                  <div><dt>Processing updated</dt><dd>{formatDate(listing.processingUpdatedAt, true)}</dd></div>
                </dl>
                {nextStage && <button type="button" className="primary-button" disabled={savingId === listing.id} onClick={() => void updateProcessing(listing)}>{savingId === listing.id ? 'Saving…' : status ? `Move to ${nextStage.toLowerCase()}` : 'Record batch received'}</button>}
              </article>
            )
          })}
        </div>
      </>
    )
  } else if (section === 'inventory') {
    const totalQuantity = collectedPickups.reduce((total, item) => total + Number(item.quantityKg || 0), 0)
    page = (
      <>
        <PageHeading eyebrow="Collected batches" title="Inventory" description="Inventory is calculated from collected listings assigned to your cooperative; no separate stock entries are created." />
        <div className="cooperative-inventory-summary">
          <article className="panel-card"><span>Total collected</span><strong>{formatQuantity(totalQuantity)} kg</strong></article>
          <article className="panel-card"><span>Awaiting processing</span><strong>{formatQuantity(processingTotals.RECEIVED)} kg</strong></article>
          <article className="panel-card"><span>In processing</span><strong>{formatQuantity(processingTotals.SORTING + processingTotals.PROCESSING)} kg</strong></article>
          <article className="panel-card"><span>Processed</span><strong>{formatQuantity(processingTotals.PROCESSED)} kg</strong></article>
          {!!processingTotals.UNKNOWN && <article className="panel-card"><span>Processing stage not recorded</span><strong>{formatQuantity(processingTotals.UNKNOWN)} kg</strong></article>}
        </div>
        {filterPanel(false)}
        <div className="panel-card cooperative-inventory-breakdown">
          <h2>Collected quantity by waste type</h2>
          {typeTotals.length ? typeTotals.map(([type, quantity]) => <p key={type}><span>{type}</span><strong>{formatQuantity(quantity)} kg</strong></p>) : <p className="cooperative-empty">No collected inventory has been recorded.</p>}
        </div>
        <div className="cooperative-record-list">
          {visibleRecords.map((listing) => <article className="panel-card cooperative-record-card" key={listing.id}>
            <div className="cooperative-record-title"><div><p className="eyebrow">Listing #{listing.id}</p><h2>{listing.wasteType || 'Waste batch'}</h2></div><span className="cooperative-status">{String(listing.processingStatus || 'NOT RECORDED').replaceAll('_', ' ')}</span></div>
            <dl className="cooperative-details"><div><dt>Quantity</dt><dd>{formatQuantity(listing.quantityKg)} kg</dd></div><div><dt>Received</dt><dd>{formatDate(listing.collectedAt || listing.createdAt)}</dd></div><div><dt>Pickup status</dt><dd>{String(listing.status || 'COLLECTED').replaceAll('_', ' ')}</dd></div></dl>
          </article>)}
        </div>
      </>
    )
  } else {
    page = (
      <>
        <div className="cooperative-heading-with-action">
          <PageHeading eyebrow="Completed pickups" title="Collection History" description="Review your completed collections. History is derived from the original pickup records." />
          <CsvExport records={visibleRecords} />
        </div>
        {filterPanel(true)}
        <div className="cooperative-record-list">
          {visibleRecords.map((listing) => (
            <article className="panel-card cooperative-record-card" key={listing.id}>
              <div className="cooperative-record-title"><div><p className="eyebrow">Listing #{listing.id}</p><h2>{listing.wasteType || 'Waste collection'}</h2></div><span className="cooperative-status cooperative-status-collected">COLLECTED</span></div>
              <dl className="cooperative-details">
                <div><dt>Collected quantity</dt><dd>{formatQuantity(listing.quantityKg)} kg</dd></div>
                <div><dt>Generator</dt><dd>{listing.contactName || listing.createdByEmail || 'Not recorded'}</dd></div>
                <div><dt>Generator account</dt><dd>{listing.createdByEmail || 'Not recorded'}</dd></div>
                <div><dt>Location</dt><dd>{listing.location || 'Not provided'}</dd></div>
                <div><dt>Pickup date</dt><dd>{formatDate(listing.collectedAt, true)}</dd></div>
                <div><dt>Final status</dt><dd>Collected</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </>
    )
  }

  return (
    <section className="screen-shell cooperative-workspace">
      {page}
      {loading && <p className="cooperative-message" role="status">Loading cooperative records…</p>}
      {error && <p className="cooperative-message cooperative-error" role="alert">{error}<button type="button" className="inline-link" onClick={() => void loadPickups()}>Try again</button></p>}
      {notice && <p className="cooperative-message cooperative-success" role="status">{notice}</p>}
      {!loading && !error && visibleRecords.length === 0 && <div className="empty-state panel-card cooperative-empty-state"><span aria-hidden="true">♻️</span><h2>{section === 'pickup-schedule' ? 'No pickups match your filters' : section === 'waste-processing' ? 'No collected waste is ready for processing' : section === 'inventory' ? 'No collected inventory yet' : 'No completed collections match your filters'}</h2><p>{section === 'pickup-schedule' ? 'Accept a request from the Dashboard or adjust your filters.' : 'Collected batches assigned to your cooperative will appear here.'}</p></div>}
      <Footer />
    </section>
  )
}
