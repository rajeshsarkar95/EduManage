'use client'
import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { COLORS } from '@/lib/data'
import {Plus,Search,Edit,Trash2,X,Mail,Phone,Loader2} from 'lucide-react'

const API_BASE = 'http://localhost:5000/api/v1'

interface Teacher {
  _id: string
  name: string
  subject: string
  classes: string[]
  phone: string
  email: string
  qualification: string
  experience: string
  status: string
  createdAt?: string
  updatedAt?: string
}

interface TeacherForm {
  name: string
  subject: string
  classes: string
  phone: string
  email: string
  qualification: string
  experience: string
  status: string
}

const initForm: TeacherForm = {
  name: '', subject: '', classes: '', phone: '',
  email: '', qualification: '', experience: '', status: 'Active',
}

const toClassArray = (raw: string): string[] =>
  raw.split(',').map(s => s.trim()).filter(Boolean)

const toClassString = (arr: string[]): string => arr.join(',')

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Teacher | null>(null)
  const [form, setForm] = useState<TeacherForm>(initForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/teachers`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const json = await res.json()
      setTeachers(Array.isArray(json) ? json : json.data ?? [])
    } catch (err: any) {
      setError(err.message || 'Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTeachers() }, [fetchTeachers])
  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  )
  const openAdd = () => {
    setForm(initForm)
    setSelected(null)
    setModal('add')
  }
  const openEdit = (t: Teacher) => {
    setSelected(t)
    setForm({
      name: t.name,
      subject: t.subject,
      classes: toClassString(t.classes ?? []),
      phone: t.phone,
      email: t.email,
      qualification: t.qualification,
      experience: t.experience,
      status: t.status,
    })
    setModal('edit')
  }
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const payload = {
      name: form.name,
      subject: form.subject,
      classes: toClassArray(form.classes),
      phone: form.phone,
      email: form.email,
      qualification: form.qualification,
      experience: form.experience,
      status: form.status,
    }

    try {
      let res: Response
      if (modal === 'add') {
        res = await fetch(`${API_BASE}/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${API_BASE}/teachers/${selected!._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Server error: ${res.status}`)
      }
      await fetchTeachers()
      setModal(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save teacher')
    } finally {
      setSaving(false)
    }
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this teacher?')) return
    try {
      const res = await fetch(`${API_BASE}/teachers/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setTeachers(prev => prev.filter(t => t._id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete teacher')
    }
  }
  return (
    <AppLayout title="Teachers" subtitle="Manage teaching staff records">
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
          padding: '10px 16px', marginBottom: 16, color: '#dc2626',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 13,
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
            <X size={14} />
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total', value: teachers.length, color: '#1e3a5f', bg: '#e0e7ff' },
          { label: 'Active', value: teachers.filter(t => t.status?.toLowerCase() === 'active').length, color: '#059669', bg: '#d1fae5' },
          { label: 'On Leave', value: teachers.filter(t => t.status?.toLowerCase() === 'on-leave').length, color: '#d97706', bg: '#fef3c7' },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, borderRadius: 10, padding: '12px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search teachers…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Teacher
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <div>Loading teachers…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          {search ? 'No teachers match your search.' : 'No teachers yet. Click "Add Teacher" to get started.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {filtered.map((t, i) => (
            <div key={t._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 6, background: COLORS[i % COLORS.length] }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 48, height: 48, fontSize: 18, background: COLORS[i % COLORS.length] }}>
                      {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.name}</div>
                      <div style={{ fontSize: 12.5, color: '#7c3aed', fontWeight: 600 }}>{t.subject}</div>
                    </div>
                  </div>
                  <span className={`badge ${t.status?.toLowerCase() === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {t.status}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#64748b' }}>
                    <Mail size={13} /> {t.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#64748b' }}>
                    <Phone size={13} /> {t.phone}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b' }}>
                    📚 Classes: <strong style={{ color: '#1e3a5f' }}>{(t.classes ?? []).join(', ')}</strong>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b' }}>
                    🎓 {t.qualification} · {t.experience}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(t)}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{modal === 'add' ? '➕ Add Teacher' : '✏️ Edit Teacher'}</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '8px 12px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>
                  {error}
                </div>
              )}
              <div className="grid-2">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Teacher name' },
                  { label: 'Subject', key: 'subject', type: 'text', placeholder: 'e.g. Mathematics' },
                  { label: 'Classes', key: 'classes', type: 'text', placeholder: 'e.g. 9-A, 10-B (comma-separated)' },
                  { label: 'Phone', key: 'phone', type: 'text', placeholder: '10-digit number' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'teacher@school.edu' },
                  { label: 'Qualification', key: 'qualification', type: 'text', placeholder: 'e.g. M.Sc. Math' },
                  { label: 'Experience', key: 'experience', type: 'text', placeholder: 'e.g. 5 years' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      className="form-control"
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : modal === 'add' ? 'Add Teacher' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  )
}