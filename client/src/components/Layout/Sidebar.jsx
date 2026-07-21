import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Search, UserPlus, FileText,
  ShieldCheck, Scale, ChevronRight, UserCircle
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', exact: true },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Add Client', icon: UserPlus, path: '/clients/new' },
  { label: 'Search', icon: Search, path: '/search' },
  { label: 'My Profile', icon: UserCircle, path: '/profile' },
]

const ADMIN_ITEMS = [
  { label: 'User Management', icon: ShieldCheck, path: '/users' },
  { label: 'Audit Log', icon: FileText, path: '/audit' },
]

export default function Sidebar() {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{
      width: '240px',
      flexShrink: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      backdropFilter: 'blur(12px)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid var(--border-sidebar)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--blue-500), #1a5fbf)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(30, 111, 217, 0.4)',
          }}>
            <Scale size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-heading)', lineHeight: 1.2 }}>CIMS</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--slate-400)', letterSpacing: '0.08em' }}>CLIENT MANAGEMENT</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--slate-400)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
          Main
        </div>
        {NAV_ITEMS.map(({ label, icon: Icon, path, exact }) => (
          <NavLink
            key={path}
            to={path}
            className={`nav-item ${isActive(path, exact) ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span style={{ flex: 1 }}>{label}</span>
            {isActive(path, exact) && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--slate-400)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.5rem 0.25rem', marginTop: '0.5rem' }}>
              Admin
            </div>
            {ADMIN_ITEMS.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                className={`nav-item ${isActive(path) ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive(path) && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div style={{
        padding: '1rem 0.75rem',
        borderTop: '1px solid var(--border-sidebar)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--blue-500), var(--gold-500))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 700, color: 'white',
        }}>
          {user?.full_name?.[0] || 'U'}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.full_name}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', textTransform: 'capitalize' }}>
            {user?.role}
          </div>
        </div>
      </div>
    </div>
  )
}
