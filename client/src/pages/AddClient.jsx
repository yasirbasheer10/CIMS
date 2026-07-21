import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { ArrowLeft, User, Phone, MapPin, Briefcase, FileText, Check } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Contact', icon: Phone },
  { id: 3, label: 'Address', icon: MapPin },
  { id: 4, label: 'Professional', icon: Briefcase },
  { id: 5, label: 'Notes', icon: FileText },
]

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

export default function AddClient() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, trigger, formState: { errors } } = useForm()

  const nextStep = async () => {
    const fieldsPerStep = {
      1: ['full_name'],
      2: ['mobile'],
      3: [],
      4: [],
    }
    const valid = await trigger(fieldsPerStep[step] || [])
    if (valid) setStep(s => Math.min(s + 1, 5))
  }

  const onSubmit = async (data) => {
    if (step < 5) {
      nextStep()
      return
    }
    
    setLoading(true)
    try {
      const res = await api.post('/clients', data)
      toast.success('Client added successfully!')
      navigate(`/clients/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: '0.375rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="section-title">Add New Client</h1>
          <p className="section-subtitle">Fill in the client's information below</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        {STEPS.map((s, idx) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
              <div className={`step-dot ${step === s.id ? 'active' : step > s.id ? 'completed' : 'inactive'}`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: step === s.id ? 'var(--blue-400)' : step > s.id ? 'var(--emerald-500)' : 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`step-line ${step > s.id ? 'completed' : ''}`} style={{ margin: '0 0.5rem', marginBottom: '1.25rem' }} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Personal */}
        {step === 1 && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><User size={14} /> Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Full Name" required error={errors.full_name?.message}>
                <input className={`input-base ${errors.full_name ? 'input-error' : ''}`} placeholder="e.g. Muhammad Ahmad Khan" {...register('full_name', { required: 'Full name is required' })} />
              </Field>
              <Field label="Father's / Husband's Name">
                <input className="input-base" placeholder="e.g. Muhammad Ali Khan" {...register('father_husband_name')} />
              </Field>
              <Field label="CNIC Number" error={errors.cnic?.message}>
                <input className={`input-base ${errors.cnic ? 'input-error' : ''}`} placeholder="XXXXX-XXXXXXX-X" {...register('cnic', {
                  pattern: { value: /^[0-9\-]+$/, message: 'Only numbers and dashes allowed' }
                })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9-]/g, '')} />
              </Field>
              <Field label="Date of Birth">
                <input type="date" className="input-base" {...register('dob')} />
              </Field>
              <Field label="Gender">
                <select className="input-base" {...register('gender')} style={{ cursor: 'pointer' }}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Nationality">
                <input className="input-base" defaultValue="Pakistani" {...register('nationality')} />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><Phone size={14} /> Contact Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Mobile Number" required error={errors.mobile?.message}>
                <input className={`input-base ${errors.mobile ? 'input-error' : ''}`} placeholder="03XX-XXXXXXX" {...register('mobile', { 
                  required: 'Mobile number is required',
                  pattern: { value: /^[0-9\-\+\s]+$/, message: 'Only numbers allowed' }
                })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9\-+\s]/g, '')} />
              </Field>
              <Field label="Alternate Phone" error={errors.alt_phone?.message}>
                <input className={`input-base ${errors.alt_phone ? 'input-error' : ''}`} placeholder="03XX-XXXXXXX" {...register('alt_phone', {
                  pattern: { value: /^[0-9\-\+\s]+$/, message: 'Only numbers allowed' }
                })} onInput={(e) => e.target.value = e.target.value.replace(/[^0-9\-+\s]/g, '')} />
              </Field>
              <Field label="Email Address" error={errors.email?.message} style={{ gridColumn: 'span 2' }}>
                <input type="email" className={`input-base ${errors.email ? 'input-error' : ''}`} placeholder="example@email.com" {...register('email', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })} style={{ gridColumn: 'span 2' }} />
              </Field>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><MapPin size={14} /> Address Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Current Address">
                  <textarea className="input-base" rows={2} placeholder="House #, Street, Area" {...register('current_address')} style={{ resize: 'vertical' }} />
                </Field>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Permanent Address">
                  <textarea className="input-base" rows={2} placeholder="House #, Street, Area" {...register('permanent_address')} style={{ resize: 'vertical' }} />
                </Field>
              </div>
              <Field label="City">
                <input className="input-base" placeholder="e.g. Lahore" {...register('city')} />
              </Field>
              <Field label="Province">
                <select className="input-base" {...register('province')} style={{ cursor: 'pointer' }}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 4: Professional */}
        {step === 4 && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><Briefcase size={14} /> Professional Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Occupation">
                <input className="input-base" placeholder="e.g. Business Owner" {...register('occupation')} />
              </Field>
              <Field label="Employer / Business Name">
                <input className="input-base" placeholder="e.g. ABC Pvt. Ltd." {...register('employer')} />
              </Field>
              <Field label="NTN (Optional)" error={errors.ntn?.message}>
                <input className="input-base" placeholder="National Tax Number" {...register('ntn')} />
              </Field>
              <Field label="STRN (Optional)">
                <input className="input-base" placeholder="Sales Tax Registration No." {...register('strn')} />
              </Field>
              <Field label="FBR Portal Password">
                <input type="text" className="input-base" placeholder="Optional — stored securely" {...register('fbr_password')} />
              </Field>
            </div>
          </div>
        )}

        {/* Step 5: Notes */}
        {step === 5 && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><FileText size={14} /> Additional Notes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Tax Remarks">
                <textarea className="input-base" rows={3} placeholder="Tax-related notes and observations..." {...register('tax_remarks')} style={{ resize: 'vertical' }} />
              </Field>
              <Field label="Legal Remarks">
                <textarea className="input-base" rows={3} placeholder="Legal notes and case information..." {...register('legal_remarks')} style={{ resize: 'vertical' }} />
              </Field>
              <Field label="Internal Comments">
                <textarea className="input-base" rows={2} placeholder="Internal staff notes (not shown to client)..." {...register('internal_comments')} style={{ resize: 'vertical' }} />
              </Field>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" className="btn-secondary" onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}>
            {step === 1 ? 'Cancel' : '← Previous'}
          </button>
          {step < 5 ? (
            <button type="button" className="btn-primary" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <><Check size={16} /> Save Client</>}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
