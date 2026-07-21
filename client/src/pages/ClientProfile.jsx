import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Archive, RotateCcw, Trash2, Upload, Download, File, X, Printer } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const DOC_CATEGORIES = ['CNIC Copy', 'Tax Return', 'Notice', 'Legal Document', 'Agreement', 'Court Document', 'Other']

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', width: '160px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function ClientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [client, setClient] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [docCategory, setDocCategory] = useState('Other')
  const fileRef = useRef()

  const fetch = async () => {
    try {
      const [clientRes, docsRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/documents/${id}`),
      ])
      setClient(clientRes.data)
      setDocuments(docsRes.data)
    } catch {
      toast.error('Failed to load client')
      navigate('/clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [id])

  const handleArchive = async () => {
    try {
      await api.patch(`/clients/${id}/archive`, { archive: !client.is_archived })
      toast.success(client.is_archived ? 'Client restored' : 'Client archived')
      fetch()
    } catch { toast.error('Action failed') }
  }

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this client? This cannot be undone.')) return
    try {
      await api.delete(`/clients/${id}`)
      toast.success('Client deleted')
      navigate('/clients')
    } catch { toast.error('Delete failed') }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', docCategory)
    try {
      await api.post(`/documents/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded')
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}/${docId}`)
      toast.success('Document deleted')
      setDocuments(d => d.filter(x => x.id !== docId))
    } catch { toast.error('Delete failed') }
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  if (!client) return null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: '0.375rem' }}><ArrowLeft size={20} /></button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>{client.full_name}</h1>
              {client.is_archived && <span className="badge badge-archived">Archived</span>}
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              Added {format(new Date(client.created_at), 'dd MMM yyyy')} · Updated {format(new Date(client.updated_at), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button className="btn-ghost" onClick={handlePrint} style={{ fontSize: '0.8rem' }}><Printer size={15} /> Print</button>
          <button className="btn-secondary" onClick={() => navigate(`/clients/${id}/edit`)}><Edit2 size={15} /> Edit</button>
          {isAdmin && (
            <>
              <button className={client.is_archived ? 'btn-secondary' : 'btn-ghost'} onClick={handleArchive}>
                {client.is_archived ? <><RotateCcw size={15} /> Restore</> : <><Archive size={15} /> Archive</>}
              </button>
              <button className="btn-danger" onClick={handleDelete}><Trash2 size={15} /> Delete</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem', alignItems: 'start' }}>
        {/* Left column */}
        <div>
          <Section title="Personal Information">
            <InfoRow label="Full Name" value={client.full_name} />
            <InfoRow label="Father/Husband Name" value={client.father_husband_name} />
            <InfoRow label="CNIC" value={client.cnic} />
            <InfoRow label="Date of Birth" value={client.dob ? format(new Date(client.dob), 'dd MMM yyyy') : null} />
            <InfoRow label="Gender" value={client.gender} />
            <InfoRow label="Nationality" value={client.nationality} />
          </Section>

          <Section title="Contact Information">
            <InfoRow label="Mobile" value={client.mobile} />
            <InfoRow label="Alternate Phone" value={client.alt_phone} />
            <InfoRow label="Email" value={client.email} />
          </Section>

          <Section title="Address">
            <InfoRow label="Current Address" value={client.current_address} />
            <InfoRow label="Permanent Address" value={client.permanent_address} />
            <InfoRow label="City" value={client.city} />
            <InfoRow label="Province" value={client.province} />
          </Section>

          <Section title="Professional Information">
            <InfoRow label="Occupation" value={client.occupation} />
            <InfoRow label="Employer / Business" value={client.employer} />
            <InfoRow label="NTN" value={client.ntn} />
            <InfoRow label="STRN" value={client.strn} />
          </Section>

          {(client.tax_remarks || client.legal_remarks || client.internal_comments) && (
            <Section title="Remarks & Notes">
              {client.tax_remarks && (
                <div style={{ marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold-400)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Tax Remarks</div>
                  <div style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>{client.tax_remarks}</div>
                </div>
              )}
              {client.legal_remarks && (
                <div style={{ marginBottom: '0.875rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--rose-500)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Legal Remarks</div>
                  <div style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>{client.legal_remarks}</div>
                </div>
              )}
              {client.internal_comments && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Internal Comments</div>
                  <div style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>{client.internal_comments}</div>
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Right column - Documents */}
        <div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Documents ({documents.length})
            </div>

            {/* Upload area */}
            <div style={{ marginBottom: '1rem' }}>
              <select
                className="input-base"
                value={docCategory}
                onChange={e => setDocCategory(e.target.value)}
                style={{ marginBottom: '0.625rem', fontSize: '0.8rem' }}
              >
                {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx" />
              <button
                className="btn-secondary"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
              >
                {uploading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Upload size={14} /> Upload Document</>}
              </button>
            </div>

            {/* Document list */}
            {documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-400)', fontSize: '0.8rem' }}>
                No documents uploaded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {documents.map(doc => (
                  <div key={doc.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    background: 'var(--bg-input)', borderRadius: '8px', padding: '0.625rem',
                    border: '1px solid var(--border-sidebar)',
                  }}>
                    <File size={16} color="var(--blue-400)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.original_name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)' }}>
                        {doc.category} · {Math.round(doc.size / 1024)}KB
                      </div>
                    </div>
                    <a href={`/uploads/${doc.filename}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '0.25rem' }}>
                      <Download size={13} />
                    </a>
                    {isAdmin && (
                      <button className="btn-ghost" onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '0.25rem', color: '#f87171' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Record info */}
          <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Record Info
            </div>
            <InfoRow label="Created by" value={client.created_by_name} />
            <InfoRow label="Last updated by" value={client.updated_by_name} />
          </div>
        </div>
      </div>
    </div>
  )
}
