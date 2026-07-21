import { useState } from 'react'
import { X, KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function ChangePasswordModal({ onClose }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(30,111,217,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <KeyRound size={20} color="var(--blue-400)" />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Change Password</h2>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.375rem' }}>Current Password</label>
            <input type="password" className={`input-base ${errors.current_password ? 'input-error' : ''}`} {...register('current_password', { required: 'Required' })} />
            {errors.current_password && <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)' }}>{errors.current_password.message}</span>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.375rem' }}>New Password</label>
            <input type="password" className={`input-base ${errors.new_password ? 'input-error' : ''}`} {...register('new_password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
            {errors.new_password && <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)' }}>{errors.new_password.message}</span>}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.375rem' }}>Confirm New Password</label>
            <input type="password" className={`input-base ${errors.confirm ? 'input-error' : ''}`} {...register('confirm', { required: 'Required', validate: v => v === watch('new_password') || 'Passwords do not match' })} />
            {errors.confirm && <span style={{ fontSize: '0.75rem', color: 'var(--rose-500)' }}>{errors.confirm.message}</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
