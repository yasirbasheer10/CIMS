import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, RefreshCw, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div className="stat-card" style={{ '--glow': color }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', borderRadius: '50%', background: gradient, opacity: 0.08, transform: 'translate(20px, -20px)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color="white" />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.5rem', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function ClientRow({ client, onClick }) {
  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td>
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{client.full_name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{client.cnic || 'No CNIC'}</div>
      </td>
      <td style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>{client.mobile || '—'}</td>
      <td style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>{client.city || '—'}</td>
      <td style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
        {client.created_at ? format(new Date(client.created_at), 'dd MMM yyyy') : '—'}
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/clients/stats').then(res => {
      setStats(res.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span>
        </h1>
        <p className="section-subtitle">Here's an overview of your client database</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          icon={Users}
          label="Total Active Clients"
          value={loading ? '...' : stats?.total_clients}
          gradient="linear-gradient(135deg, var(--blue-500), #1a5fbf)"
        />
        <StatCard
          icon={UserPlus}
          label="Recently Added"
          value={loading ? '...' : stats?.recent_clients?.length}
          gradient="linear-gradient(135deg, var(--emerald-500), #059669)"
        />
        <StatCard
          icon={RefreshCw}
          label="Recently Updated"
          value={loading ? '...' : stats?.recent_updates?.length}
          gradient="linear-gradient(135deg, var(--gold-500), #d97706)"
        />
        <StatCard
          icon={TrendingUp}
          label="Archived Clients"
          value={loading ? '...' : stats?.archived_clients}
          gradient="linear-gradient(135deg, #7c3aed, #5b21b6)"
        />
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recently Added */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={16} color="var(--emerald-500)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Recently Added</span>
            </div>
            <button className="btn-ghost" onClick={() => navigate('/clients')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>Loading...</td></tr>
              ) : stats?.recent_clients?.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>No clients yet</td></tr>
              ) : stats?.recent_clients?.map(c => (
                <ClientRow key={c.id} client={c} onClick={() => navigate(`/clients/${c.id}`)} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Recently Updated */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--gold-500)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Recently Updated</span>
            </div>
            <button className="btn-ghost" onClick={() => navigate('/clients')} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>Loading...</td></tr>
              ) : stats?.recent_updates?.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '2rem' }}>No updates yet</td></tr>
              ) : stats?.recent_updates?.map(c => (
                <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{c.cnic || 'No CNIC'}</div>
                  </td>
                  <td style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>{c.mobile || '—'}</td>
                  <td style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>{c.city || '—'}</td>
                  <td style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
                    {c.updated_at ? format(new Date(c.updated_at), 'dd MMM yyyy') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.875rem' }}>
        <button className="btn-primary" onClick={() => navigate('/clients/new')}>
          <UserPlus size={16} />
          Add New Client
        </button>
        <button className="btn-secondary" onClick={() => navigate('/search')}>
          Search Clients
        </button>
        <button className="btn-secondary" onClick={() => navigate('/clients')}>
          View All Clients
        </button>
      </div>
    </div>
  )
}
