import { useEffect, useState } from 'react'
import { FileText, Filter } from 'lucide-react'
import api from '../services/api'
import { format } from 'date-fns'

const ACTION_COLORS = {
  LOGIN: 'var(--blue-400)',
  CREATE_CLIENT: 'var(--emerald-500)',
  UPDATE_CLIENT: 'var(--gold-400)',
  DELETE_CLIENT: '#f87171',
  ARCHIVE_CLIENT: 'var(--slate-400)',
  RESTORE_CLIENT: 'var(--emerald-500)',
  UPLOAD_DOCUMENT: 'var(--blue-300)',
  DELETE_DOCUMENT: '#f87171',
  CREATE_USER: 'var(--emerald-500)',
  CHANGE_PASSWORD: 'var(--gold-400)',
  RESET_USER_PASSWORD: 'var(--gold-400)',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')

  const fetch = async (page = 1) => {
    setLoading(true)
    try {
      const res = await api.get('/audit', { params: { page, limit: 50, action: filterAction || undefined } })
      setLogs(res.data.logs)
      setPagination(res.data.pagination)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch(1) }, [filterAction])

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title">Audit Log</h1>
          <p className="section-subtitle">Complete activity trail — {pagination.total} total events</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--slate-400)' }} />
          <select className="input-base" style={{ width: 'auto', fontSize: '0.82rem' }} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            <option value="">All Actions</option>
            {Object.keys(ACTION_COLORS).map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>No activity found</td></tr>
            ) : logs.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.78rem', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                  {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss')}
                </td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{log.user_full_name || log.username}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{log.username}</div>
                </td>
                <td>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                    borderRadius: '999px', background: 'rgba(0,0,0,0.3)',
                    color: ACTION_COLORS[log.action] || 'var(--slate-400)',
                    border: `1px solid ${ACTION_COLORS[log.action] || 'var(--slate-400)'}33`,
                  }}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>
                  {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                  {log.details ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination.pages > 1 && (
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(30,111,217,0.08)', display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
            <button className="pagination-btn" disabled={pagination.page === 1} onClick={() => fetch(pagination.page - 1)}>‹</button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pagination-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => fetch(p)}>{p}</button>
            ))}
            <button className="pagination-btn" disabled={pagination.page === pagination.pages} onClick={() => fetch(pagination.page + 1)}>›</button>
          </div>
        )}
      </div>
    </div>
  )
}
