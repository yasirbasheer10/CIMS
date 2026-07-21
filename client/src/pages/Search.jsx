import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, X, Filter } from 'lucide-react'
import api from '../services/api'
import { format } from 'date-fns'

export default function Search() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    name: '', cnic: '', mobile: '', email: '',
    city: '', province: '', employer: '', ntn: '', strn: '',
  })

  const handleChange = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }))

  const doSearch = async (page = 1) => {
    const hasFilter = Object.values(filters).some(v => v.trim())
    if (!hasFilter) return
    setLoading(true)
    try {
      const res = await api.get('/search', { params: { ...filters, page, limit: 20 } })
      setResults(res.data.results)
      setPagination(res.data.pagination)
      setSearched(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filters.q) doSearch()
  }, [])

  const clearAll = () => {
    setFilters({ q: '', name: '', cnic: '', mobile: '', email: '', city: '', province: '', employer: '', ntn: '', strn: '' })
    setResults([])
    setSearched(false)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title">Advanced Search</h1>
        <p className="section-subtitle">Search clients by any combination of fields</p>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Quick search */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              name="q"
              className="input-base"
              placeholder="Search by name, CNIC, mobile, email, city, NTN..."
              value={filters.q}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              style={{ paddingLeft: '2.5rem', fontSize: '0.95rem', padding: '0.75rem 0.875rem 0.75rem 2.5rem' }}
              autoFocus
            />
          </div>
          <button className="btn-primary" onClick={() => doSearch()} disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><SearchIcon size={16} /> Search</>}
          </button>
          <button className="btn-ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Filter size={16} /> Advanced
          </button>
          {searched && (
            <button className="btn-ghost" onClick={clearAll}><X size={16} /> Clear</button>
          )}
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div style={{ borderTop: '1px solid rgba(30,111,217,0.1)', paddingTop: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
              {[
                { name: 'name', label: 'Full Name' },
                { name: 'cnic', label: 'CNIC Number' },
                { name: 'mobile', label: 'Mobile Number' },
                { name: 'email', label: 'Email Address' },
                { name: 'city', label: 'City' },
                { name: 'province', label: 'Province' },
                { name: 'employer', label: 'Employer / Business' },
                { name: 'ntn', label: 'NTN' },
                { name: 'strn', label: 'STRN' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.3rem' }}>{f.label}</label>
                  <input
                    name={f.name}
                    className="input-base"
                    value={filters[f.name]}
                    onChange={handleChange}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              ))}
            </div>
            <button className="btn-primary" onClick={() => doSearch()} style={{ marginTop: '1rem' }}>
              <SearchIcon size={15} /> Search with Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>
              {pagination.total === 0 ? 'No results found' : `${pagination.total} result${pagination.total !== 1 ? 's' : ''} found`}
            </span>
          </div>

          {results.length > 0 && (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>CNIC</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Employer</th>
                    <th>NTN</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} onClick={() => navigate(`/clients/${r.id}`)} style={{ cursor: 'pointer' }}>
                      <td><div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{r.full_name}</div></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.cnic || '—'}</td>
                      <td>{r.mobile || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{r.email || '—'}</td>
                      <td>{r.city || '—'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--slate-400)' }}>{r.employer || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.ntn || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
                        {r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination.pages > 1 && (
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(30,111,217,0.08)', display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`pagination-btn ${p === pagination.page ? 'active' : ''}`} onClick={() => doSearch(p)}>{p}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--slate-400)' }}>
          <SearchIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p style={{ fontSize: '0.95rem' }}>Enter a search term above to find clients</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Supports partial matches for name, CNIC, mobile, and more</p>
        </div>
      )}
    </div>
  )
}
