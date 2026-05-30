'use client'
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, X, Users, BookOpen, RefreshCw, AlertCircle, Loader2, Pencil, Trash2, CheckCircle } from 'lucide-react';

type RawSubject = string | { _id: string; name?: string }

interface RawClass {
  _id?: string
  id?: string
  name: string
  section?: string
  fullName?: string
  roomNumber?: string
  session?: string
  classTeacher?: string | { _id: string; name?: string } | null
  subjects?: RawSubject[]
  maxStudents?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  __v?: number
}

interface DisplayClass {
  id: string
  name: string
  teacher: string
  room: string
  students: number
  subjects: string[]
  isActive: boolean
}

interface ClassForm {
  name: string
  section: string
  roomNumber: string
  session: string
  classTeacher: string
  maxStudents: string
}

interface CreateClassBody {
  name: string
  section?: string
  roomNumber?: string
  session?: string
  classTeacher?: string
  maxStudents?: number
}

interface ApiResponse<T> {
  success?: boolean
  message?: string
  data?: T
}

type ModalMode = 'add' | 'edit' | null

const API_BASE = 'https://edumanagebackend-1.onrender.com/api/v1'

const COLORS: string[] = [
  '#1e3a5f', '#7c3aed', '#0891b2',
  '#059669', '#d97706', '#db2777',
]

const EMPTY_FORM: ClassForm = {
  name: '',
  section: '',
  roomNumber: '',
  session: '',
  classTeacher: '',
  maxStudents: '',
}

function getSubjectLabel(s: RawSubject): string {
  if (typeof s === 'object' && s !== null) return s.name ?? s._id
  return s
}

function toDisplayClass(raw: RawClass): DisplayClass {
  const teacher =
    typeof raw.classTeacher === 'object' && raw.classTeacher !== null
      ? (raw.classTeacher.name ?? raw.classTeacher._id)
      : (raw.classTeacher ?? '—')
  return {
    id: raw._id ?? raw.id ?? '',
    name: raw.fullName ?? `${raw.name}${raw.section ? '-' + raw.section : ''}`,
    teacher,
    room: raw.roomNumber ?? '—',
    students: raw.maxStudents ?? 0,
    subjects: (raw.subjects ?? []).map(getSubjectLabel),
    isActive: raw.isActive ?? true,
  }
}

async function fetchClasses(): Promise<DisplayClass[]> {
  const res = await fetch(`${API_BASE}/classes`)
  if (!res.ok) throw new Error(`Server responded ${res.status}`)
  const json: ApiResponse<RawClass[]> | RawClass[] = await res.json()
  const list: RawClass[] = Array.isArray(json)
    ? json
    : Array.isArray((json as ApiResponse<RawClass[]>).data)
      ? (json as ApiResponse<RawClass[]>).data!
      : []
  return list.map(toDisplayClass)
}

async function createClass(form: ClassForm): Promise<DisplayClass> {
  const body: CreateClassBody = {
    name: form.name,
    ...(form.section && { section: form.section }),
    ...(form.roomNumber && { roomNumber: form.roomNumber }),
    ...(form.session && { session: form.session }),
    ...(form.classTeacher && { classTeacher: form.classTeacher }),
    ...(form.maxStudents && { maxStudents: Number(form.maxStudents) }),
  }
  const res = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: ApiResponse<RawClass> = await res.json()
  if (!res.ok) throw new Error(json.message ?? `Server responded ${res.status}`)
  const raw: RawClass = json.data ?? (json as unknown as RawClass)
  return toDisplayClass(raw)
}

async function updateClass(id: string, form: ClassForm): Promise<DisplayClass> {
  const body: CreateClassBody = {
    name: form.name,
    ...(form.section && { section: form.section }),
    ...(form.roomNumber && { roomNumber: form.roomNumber }),
    ...(form.session && { session: form.session }),
    ...(form.classTeacher && { classTeacher: form.classTeacher }),
    ...(form.maxStudents && { maxStudents: Number(form.maxStudents) }),
  }
  const res = await fetch(`${API_BASE}/classes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: ApiResponse<RawClass> = await res.json()
  if (!res.ok) throw new Error(json.message ?? `Server responded ${res.status}`)
  const raw: RawClass = json.data ?? (json as unknown as RawClass)
  return toDisplayClass(raw)
}

async function deleteClass(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/classes/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const json: ApiResponse<unknown> = await res.json().catch(() => ({}))
    throw new Error((json as ApiResponse<unknown>).message ?? `Server responded ${res.status}`)
  }
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<DisplayClass[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ClassForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchClasses()
      setClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  const handleAdd = async (): Promise<void> => {
    if (!form.name.trim()) { setFormError('Class name is required.'); return }
    setSubmitting(true)
    setFormError(null)
    try {
      const created = await createClass(form)
      setClasses(prev => [...prev, created])
      closeModal()
      showToast('Class created successfully!')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }
  const openEdit = (c: DisplayClass): void => {
    const dashIdx = c.name.lastIndexOf('-')
    const parsedName = dashIdx > -1 ? c.name.slice(0, dashIdx) : c.name
    const parsedSection = dashIdx > -1 ? c.name.slice(dashIdx + 1) : ''
    setForm({
      name: parsedName,
      section: parsedSection,
      roomNumber: c.room === '—' ? '' : c.room,
      session: '',
      classTeacher: c.teacher === '—' ? '' : c.teacher,
      maxStudents: c.students > 0 ? String(c.students) : '',
    })
    setEditingId(c.id)
    setModalMode('edit')
    setFormError(null)
  }

  const handleUpdate = async (): Promise<void> => {
    if (!form.name.trim()) { setFormError('Class name is required.'); return }
    if (!editingId) return
    setSubmitting(true)
    setFormError(null)
    try {
      const updated = await updateClass(editingId, form)
      setClasses(prev => prev.map(c => c.id === editingId ? updated : c))
      closeModal()
      showToast('Class updated successfully!')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }
  const handleDelete = async (id: string): Promise<void> => {
    setDeleting(true)
    try {
      await deleteClass(id)
      setClasses(prev => prev.filter(c => c.id !== id))
      setDeleteConfirmId(null)
      showToast('Class deleted successfully!')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete class', 'error')
      setDeleteConfirmId(null)
    } finally {
      setDeleting(false)
    }
  }
  const closeModal = (): void => {
    setModalMode(null)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }
  const patch = (key: keyof ClassForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const isModalOpen = modalMode !== null

  return (
    <AppLayout title="Classes & Subjects" subtitle="Manage class sections and subject assignments">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#022c22' : '#450a0a',
          border: `1px solid ${toast.type === 'success' ? '#16a34a' : '#dc2626'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'slideInRight 0.25s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading} title="Refresh">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormError(null); setModalMode('add') }}>
          <Plus size={16} /> Add Class
        </button>
      </div>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, gap: 10, color: '#64748b' }}>
          <Loader2 size={20} className="spin" /> Loading classes…
        </div>
      )}
      {!loading && error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start', color: '#dc2626' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Failed to load classes</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>{error}</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={load}>Retry</button>
          </div>
        </div>
      )}
      {!loading && !error && classes.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 20px' }}>
          <BookOpen size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 15 }}>No classes yet. Add your first class to get started.</p>
        </div>
      )}
      {!loading && !error && classes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {classes.map((c, i) => (
            <div key={c.id} className="card" style={{ overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 5, background: COLORS[i % COLORS.length] }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 17, marginBottom: 3 }}>{c.name}</h3>
                    <p style={{ fontSize: 12.5, color: '#64748b' }}>Room: {c.room} · Teacher: {c.teacher}</p>
                  </div>
                  <div style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length], borderRadius: 8, padding: '6px 12px', textAlign: 'center', flexShrink: 0, marginLeft: 10 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>{c.students}</div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>Max</div>
                  </div>
                </div>
                {c.subjects.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subjects</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {c.subjects.map(s => (
                        <span key={s} className="badge badge-info" style={{ fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, background: '#f0f4f8', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color="#64748b" />
                    <span style={{ fontSize: 12, color: '#64748b' }}>{c.students} Max</span>
                  </div>
                  <div style={{ flex: 1, background: '#f0f4f8', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={14} color="#64748b" />
                    <span style={{ fontSize: 12, color: '#64748b' }}>{c.subjects.length} Subjects</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => openEdit(c)}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  {deleteConfirmId === c.id ? (
                    <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-sm"
                        style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting}
                      >
                        {deleting ? <Loader2 size={12} className="spin" /> : <><Trash2 size={12} /> Confirm</>}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#dc2626', borderColor: '#fecaca' }}
                      onClick={() => setDeleteConfirmId(c.id)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === 'edit' ? '✏️ Edit Class' : '➕ Add New Class'}</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#dc2626', fontSize: 13, display: 'flex', gap: 8 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {formError}
                </div>
              )}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Class Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input className="form-control" placeholder="e.g. 10" value={form.name} onChange={patch('name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-control" placeholder="e.g. A" value={form.section} onChange={patch('section')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input className="form-control" placeholder="e.g. 101" value={form.roomNumber} onChange={patch('roomNumber')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Session</label>
                  <input className="form-control" placeholder="e.g. 2024-25" value={form.session} onChange={patch('session')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Class Teacher ID</label>
                  <input className="form-control" placeholder="MongoDB ObjectId" value={form.classTeacher} onChange={patch('classTeacher')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Students</label>
                  <input className="form-control" type="number" placeholder="e.g. 60" value={form.maxStudents} onChange={patch('maxStudents')} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={modalMode === 'edit' ? handleUpdate : handleAdd}
                disabled={submitting}
              >
                {submitting
                  ? <><Loader2 size={14} className="spin" />{modalMode === 'edit' ? 'Saving…' : 'Creating…'}</>
                  : modalMode === 'edit' ? 'Save Changes' : 'Add Class'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .spin { animation: spin 1s linear infinite }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>
    </AppLayout>
  )
}