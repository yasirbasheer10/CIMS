import { useEffect, useState, useRef } from 'react'
import { UserPlus, ShieldCheck, ShieldOff, KeyRound, X, Camera, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={wide ? { maxWidth: '680px' } : {}}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(30,111,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  )
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.3rem' }}>
        {label} {required && <span style={{ color: 'var(--rose-500)' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: '0.73rem', color: 'var(--rose-500)', display: 'block', marginTop: '0.2rem' }}>{error}</span>}
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showFbrPassword, setShowFbrPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileRef = useRef()

  const fetchUsers = () => {
    api.get('/users').then(r => { setUsers(r.data); setLoading(false) })
  }
  useEffect(fetchUsers, [])

  const { register: reg1, handleSubmit: hs1, reset: r1, formState: { errors: e1 } } = useForm({ defaultValues: { role: 'staff' } })
  const { register: reg2, handleSubmit: hs2, reset: r2, formState: { errors: e2 } } = useForm()

  const handleCreate = async (data) => {
    try {
      const form = new FormData()
      Object.entries(data).forEach(([k, v]) => { if (v) form.append(k, v) })
      if (avatarFile) form.append('profile_image', avatarFile)

      await api.post('/users', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('User created successfully')
      setShowAdd(false)
      r1()
      setAvatarFile(null)
      setAvatarPreview(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user')
    }
  }

  const handleToggle = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, is_active: !user.is_active })
      toast.success(user.is_active ? 'User deactivated' : 'User activated')
      fetchUsers()
    } catch { toast.error('Action failed') }
  }

  const handleResetPassword = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    try {
      await api.patch(`/users/${resetUser.id}/reset-password`, { new_password: data.new_password })
      toast.success('Password reset successfully')
      setResetUser(null)
      r2()
    } catch { toast.error('Failed to reset password') }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title">User Management</h1>
          <p className="section-subtitle">Manage staff access and permissions</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowAdd(true); r1(); setAvatarFile(null); setAvatarPreview(null) }}>
          <UserPlus size={16} /> Add User
        </button>
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
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                      background: 'linear-gradient(135deg, var(--blue-500), var(--gold-500))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700, color: 'white',
                    }}>
                      {u.profile_image
                        ? <img src={`${API_BASE}${u.profile_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : u.full_name[0]
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.full_name}</div>
                      {u.designation && <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{u.designation}</div>}
                    </div>
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

      {/* ── Add User Modal ── */}
      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)} wide>
          <form onSubmit={hs1(handleCreate)} onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault()
          }}>
            {/* Avatar upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(30,111,217,0.05)', borderRadius: '10px', border: '1px solid rgba(30,111,217,0.1)' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--blue-500), var(--gold-500))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: 'white',
                  border: '2px solid rgba(30,111,217,0.3)',
                }}>
                  {avatarPreview ? <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '?'}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: 'var(--blue-500)', border: '2px solid var(--navy-800)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Camera size={11} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Profile Photo</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>Optional · JPG, PNG · Max 5MB</div>
                {avatarPreview && (
                  <button type="button" className="btn-ghost" onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                    style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', marginTop: '0.4rem', color: 'var(--rose-500)' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <FormField label="Full Name" required error={e1.full_name?.message}>
                <input className={`input-base ${e1.full_name ? 'input-error' : ''}`}
                  {...reg1('full_name', { required: 'Full name is required' })} />
              </FormField>
              <FormField label="Username" required error={e1.username?.message}>
                <input className={`input-base ${e1.username ? 'input-error' : ''}`}
                  {...reg1('username', {
                    required: 'Username is required',
                    pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers and underscores' }
                  })} />
              </FormField>
              <FormField label="Designation / Job Title">
                <input className="input-base" placeholder="e.g. Tax Consultant" {...reg1('designation')} />
              </FormField>
              <FormField label="Phone Number" error={e1.phone?.message}>
                <input className={`input-base ${e1.phone ? 'input-error' : ''}`}
                  placeholder="03XX-XXXXXXX"
                  {...reg1('phone', {
                    pattern: { value: /^[0-9\-\+\s]+$/, message: 'Only numbers allowed' }
                  })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9\-+\s]/g, '')} />
              </FormField>
              <FormField label="Password" required error={e1.password?.message}>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'}
                    className={`input-base ${e1.password ? 'input-error' : ''}`}
                    style={{ paddingRight: '2.5rem' }}
                    {...reg1('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
              <FormField label="FBR Portal Password" error={e1.fbr_password?.message}>
                <div style={{ position: 'relative' }}>
                  <input type={showFbrPassword ? 'text' : 'password'}
                    className="input-base"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Optional — stored securely"
                    {...reg1('fbr_password')} />
                  <button type="button" onClick={() => setShowFbrPassword(!showFbrPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}>
                    {showFbrPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
            </div>

            <FormField label="Role" required>
              <select className="input-base" {...reg1('role', { required: true })}>
                <option value="staff">Regular User — can add/edit clients</option>
                <option value="admin">Admin — full system access</option>
              </select>
            </FormField>

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.25rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}><UserPlus size={15} /> Create User</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Reset Password Modal ── */}
      {resetUser && (
        <Modal title={`Reset Password — ${resetUser.full_name}`} onClose={() => setResetUser(null)}>
          <form onSubmit={hs2(handleResetPassword)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormField label="New Password" required error={e2.new_password?.message}>
              <input type="password" className={`input-base ${e2.new_password ? 'input-error' : ''}`}
                {...reg2('new_password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            </FormField>
            <FormField label="Confirm New Password" required error={e2.confirm_password?.message}>
              <input type="password" className={`input-base ${e2.confirm_password ? 'input-error' : ''}`}
                {...reg2('confirm_password', { required: 'Required' })} />
            </FormField>
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
