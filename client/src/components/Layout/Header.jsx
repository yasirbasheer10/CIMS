import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Search, LogOut, KeyRound, Sun, Moon } from 'lucide-react'
import ChangePasswordModal from '../ChangePasswordModal'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const handleSearch = (e) => {
    e.preventDefault()
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`)
      setQuickSearch('')
    }
  }

  return (
    <>
      <header style={{
        height: '62px',
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-sidebar)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1rem',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        {/* Quick search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="input-base"
              placeholder="Quick search clients by name, CNIC, mobile..."
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', background: 'var(--bg-input)', fontSize: '0.8rem' }}
            />
          </div>
        </form>

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn-ghost"
            onClick={toggleTheme}
            style={{ padding: '0.375rem', borderRadius: '50%' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div style={{ position: 'relative' }}>
            <button
              className="btn-ghost"
              onClick={() => setShowMenu(!showMenu)}
              style={{ padding: '0.375rem 0.75rem', gap: '0.5rem' }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue-500), var(--gold-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'white',
              }}>
                {user?.full_name?.[0] || 'U'}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{user?.full_name}</span>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--bg-dropdown)', border: '1px solid rgba(30, 111, 217, 0.2)',
                borderRadius: '10px', padding: '0.5rem', minWidth: '180px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)', zIndex: 100,
                animation: 'fadeIn 0.15s ease-out',
              }}>
                <button
                  className="btn-ghost"
                  onClick={() => { setShowChangePassword(true); setShowMenu(false) }}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem' }}
                >
                  <KeyRound size={14} />
                  Change Password
                </button>
                <div style={{ borderTop: '1px solid rgba(30,111,217,0.1)', margin: '0.25rem 0' }} />
                <button
                  className="btn-ghost"
                  onClick={logout}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', color: '#f87171' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </>
  )
}
