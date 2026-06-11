'use client'
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { COLORS } from '@/lib/data';
import { Plus, Search, Edit, Trash2, Eye, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const isObjectId = (v: string) => /^[a-f\d]{24}$/i.test(v);

type Address = {
  street: string
  city: string
  state: string
  pincode: string
}
type Guardian = {
  name: string
  relation: string
  phone: string
  email: string
  occupation: string
  annualIncome: number
}
type PopulatedClass = {
  _id: string
  name: string
  section?: string
}
type Student = {
  _id: string
  studentNumber: string
  name: string
  rollNumber: string
  admissionNumber: string
  dateOfBirth: string
  gender: string
  photo: string | null
  bloodGroup: string
  religion: string
  category: string
  address: Address | null
  phone: string
  guardian: Guardian
  class: string | PopulatedClass | null
  section: string
  session: string
  feeStatus: 'paid' | 'pending' | 'overdue'
  status: 'active' | 'inactive' | 'transferred' | 'graduated'
  previousSchool: string
  notes: string
  isDeleted: boolean
  admissionDate: string
  age?: number
  createdAt: string
  updatedAt: string
}
type ApiResponse = {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  data: Student[]
}
type ClassOption = {
  _id: string
  name: string
}

const BASE_URL = 'https://edumanagebackend-1.onrender.com/api/v1/students';
const CLASSES_URL = 'https://edumanagebackend-1.onrender.com/api/v1/classes';
const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const CATEGORY_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const SESSION_OPTIONS = ['2024-25', '2025-26', '2026-27'];
const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GUARDIAN_RELATION_OPTIONS = ['Father', 'Mother', 'Guardian'];
const STATUS_OPTIONS = ['active', 'inactive', 'transferred', 'graduated'] as const;

const EMPTY_ADDRESS: Address = { street: '', city: '', state: '', pincode: '' };
const EMPTY_GUARDIAN: Guardian = {
  name: '', relation: 'Father', phone: '', email: '', occupation: '', annualIncome: 0
};

const initForm = {
  studentNumber: '',
  name: '',
  rollNumber: '',
  admissionNumber: '',
  class: '',
  section: 'A',
  dateOfBirth: '',
  gender: 'Male',
  phone: '',
  bloodGroup: '',
  religion: '',
  category: 'General',
  session: '2024-25',
  feeStatus: 'pending' as 'paid' | 'pending' | 'overdue',
  status: 'active' as 'active' | 'inactive' | 'transferred' | 'graduated',
  previousSchool: '',
  notes: '',
  address: EMPTY_ADDRESS,
  guardian: EMPTY_GUARDIAN,
}

type FormState = typeof initForm

const feeColor = (f: string) =>
  f === 'paid' ? 'success' : f === 'overdue' ? 'danger' : 'warning'

const statusColor = (s: string) =>
  s === 'active' ? 'success' : s === 'graduated' ? 'info' : s === 'transferred' ? 'warning' : 'danger'

const formatDate = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const classLabel = (classVal: string | PopulatedClass | null, classes: ClassOption[]): string => {
  if (!classVal) return '—'
  if (typeof classVal === 'object') return classVal.name
  return classes.find(c => c._id === classVal)?.name ?? classVal
}

const classId = (classVal: string | PopulatedClass | null): string => {
  if (!classVal) return ''
  if (typeof classVal === 'object') return classVal._id
  return classVal
}

const toPayload = (form: FormState) => ({
  studentNumber: form.studentNumber || undefined,
  name: form.name,
  rollNumber: form.rollNumber,
  admissionNumber: form.admissionNumber || undefined,
  ...(isObjectId(form.class) ? { class: form.class } : {}),
  section: form.section,
  dateOfBirth: form.dateOfBirth || undefined,
  gender: form.gender,
  phone: form.phone || undefined,
  bloodGroup: form.bloodGroup || undefined,
  religion: form.religion || undefined,
  category: form.category,
  session: form.session,
  feeStatus: form.feeStatus,
  status: form.status,
  previousSchool: form.previousSchool || undefined,
  notes: form.notes || undefined,
  address: form.address,
  guardian: {
    ...form.guardian,
    annualIncome: Number(form.guardian.annualIncome),
  },
})

const toForm = (s: Student): FormState => ({
  studentNumber: s.studentNumber ?? '',
  name: s.name ?? '',
  rollNumber: s.rollNumber ?? '',
  admissionNumber: s.admissionNumber ?? '',
  class: classId(s.class),
  section: s.section ?? 'A',
  dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
  gender: s.gender ?? 'Male',
  phone: s.phone ?? '',
  bloodGroup: s.bloodGroup ?? '',
  religion: s.religion ?? '',
  category: s.category ?? 'General',
  session: s.session ?? '2024-25',
  feeStatus: s.feeStatus ?? 'pending',
  status: s.status ?? 'active',
  previousSchool: s.previousSchool ?? '',
  notes: s.notes ?? '',
  address: s.address ?? EMPTY_ADDRESS,
  guardian: {
    ...EMPTY_GUARDIAN,
    ...(s.guardian ?? {}),
    annualIncome: s.guardian?.annualIncome ?? 0,
  },
});

// ── Label helper ──────────────────────────────────────────────
const InfoCard = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{value || '—'}</div>
  </div>
)

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classesError, setClassesError] = useState(false);
  const [search, setSearch] = useState('');
  const [filterFee, setFilterFee] = useState('All');
  const [filterStudentStatus, setFilterStudentStatus] = useState('All');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(initForm);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setClassesError(false);
    try {
      const [studRes, classRes] = await Promise.all([
        fetch(BASE_URL),
        fetch(CLASSES_URL).catch(() => null),
      ]);
      if (!studRes.ok) throw new Error(`Server error: ${studRes.status}`);
      const studJson: ApiResponse = await studRes.json();
      setStudents(studJson.data ?? []);

      if (classRes?.ok) {
        const classJson = await classRes.json();
        const list: ClassOption[] = Array.isArray(classJson) ? classJson : (classJson.data ?? []);
        const validClasses = list.filter((item: any) => item._id && item.name && !item.rollNumber);
        setClasses(validClasses);
        if (validClasses.length === 0) setClassesError(true);
      } else {
        setClassesError(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleSave = async () => {
    if (!form.name.trim() || !form.rollNumber.trim()) {
      alert('Name and Roll Number are required.'); return;
    }
    if (!form.guardian.name.trim() || !form.guardian.phone.trim()) {
      alert('Guardian name and phone are required.'); return;
    }
    setSaving(true)
    try {
      if (modal === 'add') {
        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toPayload(form)),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? `Server error: ${res.status}`) }
        const json = await res.json()
        setStudents(prev => [...prev, json.data ?? json])
      } else if (modal === 'edit' && selected) {
        const res = await fetch(`${BASE_URL}/${selected._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toPayload(form)),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.message ?? `Server error: ${res.status}`) }
        const json = await res.json()
        const updated: Student = json.data ?? json
        setStudents(prev => prev.map(s => s._id === selected._id ? updated : s))
      }
      setModal(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      (s.admissionNumber ?? '').toLowerCase().includes(q) ||
      (s.studentNumber ?? '').toLowerCase().includes(q)
    const matchFee = filterFee === 'All' || s.feeStatus === filterFee
    const matchStatus = filterStudentStatus === 'All' || s.status === filterStudentStatus
    return matchSearch && matchFee && matchStatus
  })

  const openAdd = () => { setForm(initForm); setModal('add') }
  const openEdit = (s: Student) => { setSelected(s); setForm(toForm(s)); setModal('edit') }
  const openView = (s: Student) => { setSelected(s); setModal('view') }

  const setField = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }))
  const setAddress = (key: keyof Address, val: string) =>
    setForm(f => ({ ...f, address: { ...f.address, [key]: val } }))
  const setGuardian = (key: keyof Guardian, val: string | number) =>
    setForm(f => ({ ...f, guardian: { ...f.guardian, [key]: val } }))

  const sectionLabel = (title: string, mt = false) => (
    <p style={{ fontWeight: 700, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: mt ? '16px 0 10px' : '0 0 10px' }}>{title}</p>
  )

  return (
    <AppLayout title="Students" subtitle="Manage all student records">

      {/* ── Summary Cards ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: students.length, color: '#1e3a5f', bg: '#e0e7ff' },
          { label: 'Active', value: students.filter(s => s.status === 'active').length, color: '#059669', bg: '#d1fae5' },
          { label: 'Graduated', value: students.filter(s => s.status === 'graduated').length, color: '#0284c7', bg: '#e0f2fe' },
          { label: 'Fee Paid', value: students.filter(s => s.feeStatus === 'paid').length, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Pending', value: students.filter(s => s.feeStatus === 'pending').length, color: '#d97706', bg: '#fef3c7' },
          { label: 'Overdue', value: students.filter(s => s.feeStatus === 'overdue').length, color: '#dc2626', bg: '#fee2e2' },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, borderRadius: 10, padding: '12px 20px', textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Search name, roll no, adm no, student no…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filterStudentStatus} onChange={e => setFilterStudentStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(v => (
            <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
          ))}
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filterFee} onChange={e => setFilterFee(e.target.value)}>
          {['All', 'paid', 'pending', 'overdue'].map(v => (
            <option key={v} value={v}>{v === 'All' ? 'All Fees' : v.charAt(0).toUpperCase() + v.slice(1)}</option>
          ))}
        </select>
        <button className="btn btn-outline btn-sm" onClick={fetchStudents} title="Refresh" disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add Student</button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchStudents}>Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px 0', color: '#94a3b8' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading students…</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Stu No</th>
                  <th>Roll No</th>
                  <th>Adm No</th>
                  <th>Class</th>
                  <th>Guardian</th>
                  <th>Phone</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: COLORS[i % COLORS.length] }}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                            {s.gender ?? '—'}{s.age != null ? ` · ${s.age}y` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ background: '#fef9c3', color: '#92400e', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                        {s.studentNumber || '—'}
                      </code>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                        {s.rollNumber}
                      </code>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                        {s.admissionNumber || '—'}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {classLabel(s.class, classes)}{s.section ? ` · ${s.section}` : ''}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{s.guardian?.name ?? '—'}</td>
                    <td style={{ fontSize: 13 }}>{s.phone ?? '—'}</td>
                    <td><span className={`badge badge-${feeColor(s.feeStatus)}`}>{s.feeStatus}</span></td>
                    <td><span className={`badge badge-${statusColor(s.status)}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openView(s)} title="View"><Eye size={14} /></button>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit"><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No students found</h3>
                        <p>Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>{modal === 'add' ? '➕ Add New Student' : '✏️ Edit Student'}</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

              {sectionLabel('Identity Numbers')}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Student Number</label>
                  <input
                    className="form-control"
                    value={form.studentNumber}
                    onChange={e => setField('studentNumber', e.target.value)}
                    placeholder="e.g. STN-2024-001"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input className="form-control" value={form.rollNumber} onChange={e => setField('rollNumber', e.target.value)} placeholder="e.g. STU101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Admission Number</label>
                  <input className="form-control" value={form.admissionNumber} onChange={e => setField('admissionNumber', e.target.value)} placeholder="e.g. ADM2024001" />
                </div>
              </div>

              {sectionLabel('Personal Info', true)}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Student name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => setField('dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => setField('gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-control" value={form.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)}>
                    <option value="">— Select —</option>
                    {BLOOD_GROUP_OPTIONS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Religion</label>
                  <input className="form-control" value={form.religion} onChange={e => setField('religion', e.target.value)} placeholder="e.g. Hindu, Muslim, Christian" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={e => setField('category', e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="10-digit number" />
                </div>
              </div>

              {sectionLabel('Academic Info', true)}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select className="form-control" value={form.class} onChange={e => setField('class', e.target.value)}>
                    <option value="">— No Class Assigned —</option>
                    {classes.length > 0
                      ? classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                      : <option disabled>No classes available</option>
                    }
                  </select>
                  {classesError && (
                    <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>⚠ Classes could not be loaded.</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select className="form-control" value={form.section} onChange={e => setField('section', e.target.value)}>
                    {SECTION_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Session</label>
                  <select className="form-control" value={form.session} onChange={e => setField('session', e.target.value)}>
                    {SESSION_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Previous School</label>
                  <input className="form-control" value={form.previousSchool} onChange={e => setField('previousSchool', e.target.value)} placeholder="Previous school name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fee Status</label>
                  <select className="form-control" value={form.feeStatus} onChange={e => setField('feeStatus', e.target.value as FormState['feeStatus'])}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setField('status', e.target.value as FormState['status'])}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {sectionLabel('Address', true)}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Street</label>
                  <input className="form-control" value={form.address.street} onChange={e => setAddress('street', e.target.value)} placeholder="Street / Mohalla" />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-control" value={form.address.city} onChange={e => setAddress('city', e.target.value)} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" value={form.address.state} onChange={e => setAddress('state', e.target.value)} placeholder="State" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-control" value={form.address.pincode} onChange={e => setAddress('pincode', e.target.value)} placeholder="6-digit pincode" />
                </div>
              </div>

              {sectionLabel('Guardian', true)}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={form.guardian.name} onChange={e => setGuardian('name', e.target.value)} placeholder="Guardian name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation</label>
                  <select className="form-control" value={form.guardian.relation} onChange={e => setGuardian('relation', e.target.value)}>
                    {GUARDIAN_RELATION_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-control" value={form.guardian.phone} onChange={e => setGuardian('phone', e.target.value)} placeholder="Guardian phone" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={form.guardian.email} onChange={e => setGuardian('email', e.target.value)} placeholder="Guardian email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input className="form-control" value={form.guardian.occupation} onChange={e => setGuardian('occupation', e.target.value)} placeholder="e.g. Farmer, Teacher" />
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Income (₹)</label>
                  <input className="form-control" type="number" min="0" value={form.guardian.annualIncome} onChange={e => setGuardian('annualIncome', e.target.value)} placeholder="e.g. 200000" />
                </div>
              </div>

              {sectionLabel('Notes', true)}
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  placeholder="Any additional notes about the student…"
                  style={{ resize: 'vertical' }}
                />
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                  : modal === 'add' ? 'Add Student' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>👤 Student Profile</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="avatar" style={{ width: 64, height: 64, fontSize: 28, background: '#1e3a5f', margin: '0 auto 12px' }}>
                  {selected.name.charAt(0)}
                </div>
                <h3 style={{ marginBottom: 6 }}>{selected.name}</h3>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">
                    {selected.class ? `Class ${classLabel(selected.class, classes)}` : 'No Class'}
                    {selected.section ? ` · ${selected.section}` : ''}
                    {` · ${selected.session}`}
                  </span>
                  <span className={`badge badge-${statusColor(selected.status)}`}>{selected.status}</span>
                  <span className={`badge badge-${feeColor(selected.feeStatus)}`}>{selected.feeStatus}</span>
                </div>
              </div>

              <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Identity Numbers</p>
              <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
                <InfoCard label="Student No" value={selected.studentNumber} />
                <InfoCard label="Roll No" value={selected.rollNumber} />
                <InfoCard label="Admission No" value={selected.admissionNumber} />
              </div>

              <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Personal Details</p>
              <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
                <InfoCard label="Date of Birth" value={formatDate(selected.dateOfBirth)} />
                <InfoCard label="Age" value={selected.age != null ? `${selected.age} years` : null} />
                <InfoCard label="Gender" value={selected.gender} />
                <InfoCard label="Blood Group" value={selected.bloodGroup} />
                <InfoCard label="Religion" value={selected.religion} />
                <InfoCard label="Category" value={selected.category} />
                <InfoCard label="Phone" value={selected.phone} />
                <InfoCard label="Admission Date" value={formatDate(selected.admissionDate)} />
                <InfoCard label="Previous School" value={selected.previousSchool} />
              </div>

              {selected.address && Object.values(selected.address).some(Boolean) && (
                <>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Address</p>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                    {[selected.address.street, selected.address.city, selected.address.state, selected.address.pincode].filter(Boolean).join(', ')}
                  </div>
                </>
              )}

              {selected.guardian && (
                <>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Guardian</p>
                  <div className="grid-2" style={{ gap: 10, marginBottom: 16 }}>
                    <InfoCard label="Name" value={selected.guardian.name} />
                    <InfoCard label="Relation" value={selected.guardian.relation} />
                    <InfoCard label="Phone" value={selected.guardian.phone} />
                    <InfoCard label="Email" value={selected.guardian.email} />
                    <InfoCard label="Occupation" value={selected.guardian.occupation} />
                    <InfoCard
                      label="Annual Income"
                      value={selected.guardian.annualIncome ? `₹${selected.guardian.annualIncome.toLocaleString('en-IN')}` : null}
                    />
                  </div>
                </>
              )}

              {selected.notes && (
                <>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Notes</p>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', fontSize: 13, lineHeight: 1.6 }}>
                    {selected.notes}
                  </div>
                </>
              )}

            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setForm(toForm(selected)); setModal('edit') }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  )
}