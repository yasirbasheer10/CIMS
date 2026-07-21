import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Camera, User, Lock, Phone, Briefcase, FileText, Save, Eye, EyeOff, Shield } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="form-section" style={{ marginBottom: '1.5rem' }}>
      <div className="form-section-title">
        <Icon size={14} />
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, error, fullWidth, children }) {
  return (
    <div style={fullWidth ? { gridColumn: 'span 2' } : {}}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.35rem' }}>
        {label}{required && <span style={{ color: 'var(--rose-500)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: '0.73rem', color: 'var(--rose-500)', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  )
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const fileRef = useRef()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { register: regPw, handleSubmit: hsPw, reset: resetPw, formState: { errors: errPw } } = useForm()

  useEffect(() => {
    api.get('/users/me').then(res => {
      setProfile(res.data)
      reset({
        full_name: res.data.full_name,
        phone: res.data.phone || '',
        designation: res.data.designation || '',
        bio: res.data.bio || '',
      })
    }).catch(() => toast.error('Could not load profile'))
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (data) => {
    setSaving(true)
    try {
      const form = new FormData()
      form.append('full_name', data.full_name)
      form.append('phone', data.phone || '')
      form.append('designation', data.designation || '')
      form.append('bio', data.bio || '')
      if (avatarFile) form.append('profile_image', avatarFile)

      const res = await api.patch('/users/me', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(res.data)
      await refreshUser()
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    setChangingPw(true)
    try {
      await api.post('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully!')
      resetPw()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  const avatarSrc = avatarPreview
    || (profile?.profile_image ? `${API_BASE}${profile.profile_image}` : null)

  return (
    <div className="animate-fade-in" style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your personal information and account settings</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, var(--blue-500), var(--gold-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 700, color: 'white',
            border: '3px solid rgba(30,111,217,0.3)', overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(30,111,217,0.2)',
          }}>
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (user?.full_name?.[0] || 'U')}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: 2, right: 2,
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--blue-500)', border: '2px solid var(--navy-800)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
            }}
            title="Change photo"
          >
            <Camera size={13} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-heading)' }}>{profile?.full_name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
            @{profile?.username} &nbsp;·&nbsp;
            <span className={`badge badge-${profile?.role}`} style={{ verticalAlign: 'middle' }}>
              {profile?.role === 'admin' ? 'Admin' : 'Regular User'}
            </span>
          </div>
          {profile?.designation && (
            <div style={{ fontSize: '0.82rem', color: 'var(--blue-400)', marginTop: '0.4rem' }}>{profile.designation}</div>
          )}
          {profile?.phone && (
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>{profile.phone}</div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={14} style={{ color: 'var(--emerald-500)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald-500)', fontWeight: 600 }}>Account Active</span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(handleSaveProfile)}>
        <Section title="Personal Information" icon={User}>
          <Field label="Full Name" required error={errors.full_name?.message}>
            <input className={`input-base ${errors.full_name ? 'input-error' : ''}`}
              {...register('full_name', { required: 'Full name is required' })} />
          </Field>
          <Field label="Phone Number" error={errors.phone?.message}>
            <input className={`input-base ${errors.phone ? 'input-error' : ''}`}
              placeholder="e.g. 03001234567"
              {...register('phone', {
                pattern: { value: /^[0-9\-\+\s]+$/, message: 'Only numbers allowed' }
              })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9\-+\s]/g, '')} />
          </Field>
        </Section>

        <Section title="Work Information" icon={Briefcase}>
          <Field label="Designation / Job Title">
            <input className="input-base" placeholder="e.g. Senior Tax Consultant"
              {...register('designation')} />
          </Field>
          <div /> {/* spacer */}
          <Field label="Bio / About" fullWidth>
            <textarea className="input-base" rows={3} placeholder="Write a short bio..."
              style={{ resize: 'vertical' }}
              {...register('bio')} />
          </Field>
        </Section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={hsPw(handleChangePassword)}>
        <div className="form-section">
          <div className="form-section-title"><Lock size={14} /> Change Password</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.35rem' }}>
                Current Password <span style={{ color: 'var(--rose-500)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showCurrentPw ? 'text' : 'password'}
                  className={`input-base ${errPw.current_password ? 'input-error' : ''}`}
                  style={{ paddingRight: '2.5rem' }}
                  {...regPw('current_password', { required: 'Required' })} />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}>
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errPw.current_password && <p style={{ fontSize: '0.73rem', color: 'var(--rose-500)', marginTop: '0.25rem' }}>{errPw.current_password.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.35rem' }}>
                New Password <span style={{ color: 'var(--rose-500)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showNewPw ? 'text' : 'password'}
                  className={`input-base ${errPw.new_password ? 'input-error' : ''}`}
                  style={{ paddingRight: '2.5rem' }}
                  {...regPw('new_password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}>
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errPw.new_password && <p style={{ fontSize: '0.73rem', color: 'var(--rose-500)', marginTop: '0.25rem' }}>{errPw.new_password.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.35rem' }}>
                Confirm New Password <span style={{ color: 'var(--rose-500)' }}>*</span>
              </label>
              <input type="password"
                className={`input-base ${errPw.confirm_password ? 'input-error' : ''}`}
                {...regPw('confirm_password', { required: 'Required' })} />
              {errPw.confirm_password && <p style={{ fontSize: '0.73rem', color: 'var(--rose-500)', marginTop: '0.25rem' }}>{errPw.confirm_password.message}</p>}
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-secondary" disabled={changingPw}>
              <Lock size={15} />
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
