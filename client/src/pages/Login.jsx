import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Scale, Eye, EyeOff, Lock, User } from 'lucide-react'

export default function Login() {
  const { login, loading } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data) => {
    setError('')
    const result = await login(data.username, data.password)
    if (!result.success) setError(result.error)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-900)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 111, 217, 0.08) 0%, transparent 70%)',
        top: '-100px', left: '-100px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 166, 35, 0.05) 0%, transparent 70%)',
        bottom: '-80px', right: '-80px', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--blue-500), #1a5fbf)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 32px rgba(30, 111, 217, 0.4)',
          }}>
            <Scale size={32} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-heading)' }}>
            CIMS
          </h1>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.9rem', color: 'var(--slate-400)' }}>
            Client Information Management System
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#f87171',
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.375rem' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  type="text"
                  className={`input-base ${errors.username ? 'input-error' : ''}`}
                  placeholder="Enter your username"
                  autoComplete="username"
                  style={{ paddingLeft: '2.25rem' }}
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
              {errors.username && <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)', marginTop: '0.25rem', display: 'block' }}>{errors.username.message}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.375rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-base ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)', marginTop: '0.25rem', display: 'block' }}>{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--slate-400)' }}>
          Secure access · Encrypted data · Audit logged
        </p>
      </div>
    </div>
  )
}
