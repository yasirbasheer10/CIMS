import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Download, Search, ChevronUp, ChevronDown, Archive, RotateCcw } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ClientList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [clients, setClients] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState('desc')
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')

  const fetchClients = async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/clients', {
        params: { page, limit: 20, sort, order, archived: showArchived },
      })
      setClients(res.data.clients)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients(1) }, [sort, order, showArchived])

  const handleSort = (col) => {
    if (sort === col) setOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSort(col); setOrder('asc') }
  }

  const SortIcon = ({ col }) => {
    if (sort !== col) return null
    return order === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  const handleArchive = async (client, e) => {
    e.stopPropagation()
    try {
      await api.patch(`/clients/${client.id}/archive`, { archive: !client.is_archived })
      toast.success(client.is_archived ? 'Client restored' : 'Client archived')
      fetchClients(pagination.page)
    } catch {
      toast.error('Action failed')
    }
  }

  const handleExport = async (format) => {
    try {
      const res = await api.get('/export/clients', { params: { format, archived: showArchived }, responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `clients.${format === 'csv' ? 'csv' : 'xlsx'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  const filtered = search
    ? clients.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.cnic?.includes(search) ||
        c.mobile?.includes(search)
      )
    : clients

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title">{showArchived ? 'Archived Clients' : 'All Clients'}</h1>
          <p className="section-subtitle">{pagination.total} total records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => setShowArchived(!showArchived)} style={{ fontSize: '0.8rem' }}>
            {showArchived ? <><RotateCcw size={14} /> Active</> : <><Archive size={14} /> Archived</>}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => handleExport('csv')} style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
              <Download size={14} /> CSV
            </button>
            <button className="btn-secondary" onClick={() => handleExport('excel')} style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
              <Download size={14} /> Excel
            </button>
          </div>
          <button className="btn-primary" onClick={() => navigate('/clients/new')}>
            <UserPlus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '380px' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
        <input
          className="input-base"
          placeholder="Filter by name, CNIC, mobile..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('full_name')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Client Name <SortIcon col="full_name" />
                  </span>
                </th>
                <th>CNIC</th>
                <th>Mobile</th>
                <th>Email</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('city')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    City <SortIcon col="city" />
                  </span>
                </th>
                <th>Employer</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Added <SortIcon col="created_at" />
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                  No clients found
                </td></tr>
              ) : filtered.map(client => (
                <tr key={client.id} onClick={() => navigate(`/clients/${client.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{client.full_name}</div>
                    {client.father_husband_name && (
                      <div style={{ fontSize: '0.73rem', color: 'var(--slate-400)' }}>S/O {client.father_husband_name}</div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--slate-300)' }}>{client.cnic || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-300)' }}>{client.mobile || '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>{client.email || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{client.city || '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>{client.employer || '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                    {client.created_at ? format(new Date(client.created_at), 'dd MMM yyyy') : '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-ghost" onClick={() => navigate(`/clients/${client.id}/edit`)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                        Edit
                      </button>
                      {isAdmin && (
                        <button className={client.is_archived ? 'btn-secondary' : 'btn-ghost'} onClick={e => handleArchive(client, e)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                          {client.is_archived ? 'Restore' : 'Archive'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(30,111,217,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className="pagination-btn" disabled={pagination.page === 1} onClick={() => fetchClients(pagination.page - 1)}>‹</button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetchClients(p)}>{p}</button>
              ))}
              <button className="pagination-btn" disabled={pagination.page === pagination.pages} onClick={() => fetchClients(pagination.page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
