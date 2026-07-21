import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Check } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'ICT']

function Field({ label, error, children, required }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--slate-400)', marginBottom: '0.375rem' }}>
        {label} {required && <span style={{ color: 'var(--rose-500)' }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: '0.73rem', color: 'var(--rose-500)', display: 'block', marginTop: '0.25rem' }}>{error}</span>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="form-section">
      <div className="form-section-title">{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>{children}</div>
    </div>
  )
}

export default function EditClient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    api.get(`/clients/${id}`).then(res => {
      const c = res.data
      reset({
        ...c,
        dob: c.dob ? c.dob.split('T')[0] : '',
      })
      setFetchLoading(false)
    }).catch(() => {
      toast.error('Client not found')
      navigate('/clients')
    })
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.put(`/clients/${id}`, data)
      toast.success('Client updated successfully')
      navigate(`/clients/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  return (
    <div className="animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: '0.375rem' }}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="section-title">Edit Client</h1>
          <p className="section-subtitle">Update client information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Section title="👤 Personal Information">
          <Field label="Full Name" required error={errors.full_name?.message}>
            <input className={`input-base ${errors.full_name ? 'input-error' : ''}`} {...register('full_name', { required: 'Required' })} />
          </Field>
          <Field label="Father's / Husband's Name">
            <input className="input-base" {...register('father_husband_name')} />
          </Field>
          <Field label="CNIC" error={errors.cnic?.message}>
            <input className={`input-base ${errors.cnic ? 'input-error' : ''}`} placeholder="XXXXX-XXXXXXX-X" {...register('cnic', {
              pattern: { value: /^[0-9\-]+$/, message: 'Only numbers and dashes allowed' }
            })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9-]/g, '')} />
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="input-base" {...register('dob')} />
          </Field>
          <Field label="Gender">
            <select className="input-base" {...register('gender')}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </Field>
          <Field label="Nationality">
            <input className="input-base" {...register('nationality')} />
          </Field>
        </Section>

        <Section title="📞 Contact Information">
          <Field label="Mobile" required error={errors.mobile?.message}>
            <input className={`input-base ${errors.mobile ? 'input-error' : ''}`} {...register('mobile', { 
              required: 'Required',
              pattern: { value: /^[0-9\-\+\s]+$/, message: 'Only numbers allowed' }
            })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9\-+\s]/g, '')} />
          </Field>
          <Field label="Alt Phone" error={errors.alt_phone?.message}>
            <input className={`input-base ${errors.alt_phone ? 'input-error' : ''}`} {...register('alt_phone', {
              pattern: { value: /^[0-9\-\+\s]+$/, message: 'Only numbers allowed' }
            })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9\-+\s]/g, '')} />
          </Field>
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" className={`input-base ${errors.email ? 'input-error' : ''}`} {...register('email', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
              })} />
            </Field>
          </div>
        </Section>

        <Section title="📍 Address">
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Current Address">
              <textarea className="input-base" rows={2} {...register('current_address')} style={{ resize: 'vertical' }} />
            </Field>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Permanent Address">
              <textarea className="input-base" rows={2} {...register('permanent_address')} style={{ resize: 'vertical' }} />
            </Field>
          </div>
          <Field label="City">
            <input className="input-base" {...register('city')} />
          </Field>
          <Field label="Province">
            <select className="input-base" {...register('province')}>
              <option value="">Select</option>
              {PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="💼 Professional">
          <Field label="Occupation">
            <input className="input-base" {...register('occupation')} />
          </Field>
          <Field label="Employer / Business">
            <input className="input-base" {...register('employer')} />
          </Field>
          <Field label="NTN">
            <input className="input-base" {...register('ntn')} />
          </Field>
          <Field label="STRN">
            <input className="input-base" {...register('strn')} />
          </Field>
        </Section>

        <div className="form-section">
          <div className="form-section-title">📝 Notes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field label="Tax Remarks">
              <textarea className="input-base" rows={3} {...register('tax_remarks')} style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Legal Remarks">
              <textarea className="input-base" rows={3} {...register('legal_remarks')} style={{ resize: 'vertical' }} />
            </Field>
            <Field label="Internal Comments">
              <textarea className="input-base" rows={2} {...register('internal_comments')} style={{ resize: 'vertical' }} />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.875rem' }}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Check size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  )
}
