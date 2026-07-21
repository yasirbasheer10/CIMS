import { useEffect, useState } from 'react'
import { UserPlus, Edit2, ShieldCheck, ShieldOff, KeyRound, X } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(30,111,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [resetUser, setResetUser] = useState(null)

  const fetch = () => {
    api.get('/users').then(r => { setUsers(r.data); setLoading(false) })
  }
  useEffect(fetch, [])

  const { register: reg1, handleSubmit: hs1, reset: r1, formState: { errors: e1 } } = useForm()
  const { register: reg2, handleSubmit: hs2, reset: r2 } = useForm()

  const handleCreate = async (data) => {
    try {
      await api.post('/users', data)
      toast.success('User created')
      setShowAdd(false)
      r1()
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user')
    }
  }

  const handleToggle = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, is_active: !user.is_active })
      toast.success(user.is_active ? 'User deactivated' : 'User activated')
      fetch()
    } catch { toast.error('Action failed') }
  }

  const handleResetPassword = async (data) => {
    try {
      await api.patch(`/users/${resetUser.id}/reset-password`, { new_password: data.new_password })
      toast.success('Password reset successfully')
      setResetUser(null)
      r2()
    } catch { toast.error('Failed to reset password') }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage staff access and permissions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><UserPlus size={16} /> Add User</button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-500), var(--gold-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {u.full_name[0]}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.full_name}</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--slate-400)' }}>{u.username}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role === 'admin' ? 'Admin' : 'Regular User'}</span></td>
                <td><span className={`badge ${u.is_active ? 'badge-active' : 'badge-archived'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{format(new Date(u.created_at), 'dd MMM yyyy')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-ghost" onClick={() => setResetUser(u)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      <KeyRound size={12} /> Reset Password
                    </button>
                    <button className={u.is_active ? 'btn-ghost' : 'btn-secondary'} onClick={() => handleToggle(u)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                      {u.is_active ? <><ShieldOff size={12} /> Deactivate</> : <><ShieldCheck size={12} /> Activate</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)}>
          <form onSubmit={hs1(handleCreate)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'full_name', label: 'Full Name', required: true },
              { name: 'username', label: 'Username', required: true },
              { name: 'password', label: 'Password', required: true, type: 'password' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.3rem' }}>{f.label} {f.required && <span style={{ color: 'var(--rose-500)' }}>*</span>}</label>
                <input type={f.type || 'text'} className={`input-base ${e1[f.name] ? 'input-error' : ''}`} {...reg1(f.name, { required: f.required && 'Required', minLength: f.name === 'password' ? { value: 6, message: 'Min 6 chars' } : undefined })} />
                {e1[f.name] && <span style={{ fontSize: '0.73rem', color: 'var(--rose-500)' }}>{e1[f.name].message}</span>}
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.3rem' }}>Role <span style={{ color: 'var(--rose-500)' }}>*</span></label>
              <select className="input-base" {...reg1('role', { required: true })}>
                <option value="staff">Regular User</option>
                <option value="admin">Admin</option>
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.3rem', display: 'block' }}>
                Regular User can add/edit clients · Admin has full system access
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create User</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <Modal title={`Reset Password — ${resetUser.full_name}`} onClose={() => setResetUser(null)}>
          <form onSubmit={hs2(handleResetPassword)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.3rem' }}>New Password</label>
              <input type="password" className="input-base" {...reg2('new_password', { required: true, minLength: { value: 6, message: 'Min 6 chars' } })} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setResetUser(null)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>Reset Password</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
