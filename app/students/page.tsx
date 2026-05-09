'use client'
import { useState,useEffect,useCallback} from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {COLORS} from '@/lib/data';
import { Plus,Search,Edit,Trash2,Eye,X,Loader2,AlertCircle,RefreshCw} from 'lucide-react';

const isObjectId = (v:string) => /^[a-f\d]{24}$/i.test(v);

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

type Student = {
  _id: string
  name: string
  rollNumber: string
  dateOfBirth: string
  gender: string
  photo: string | null
  category: string
  address: Address
  phone: string
  guardian: Guardian
  class: string | null
  section: string
  session: string
  feeStatus: 'paid' | 'pending' | 'overdue'
  status: 'active' | 'inactive'
  isDeleted: boolean
  admissionDate: string
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
const BASE_URL = 'http://localhost:5000/api/v1/students';
const CLASSES_URL = 'http://localhost:5000/api/v1/classes';

const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const CATEGORY_OPTIONS = ['General', 'OBC', 'SC', 'ST'];
const SESSION_OPTIONS = ['2024-25', '2025-26', '2026-27'];

const initForm = {
  name:'',
  rollNumber:'',
  class:'',
  section:'A',
  dateOfBirth:'',
  gender:'Male',
  phone:'',
  category:'General',
  session:'2024-25',
  feeStatus:'pending' as const,
  status:'active' as const,
  address: {street:'',city:'',state:'',pincode:'' },
  guardian: {name: '',relation:'Father',phone:'',email:'',occupation:'',annualIncome:0},
}

type FormState = typeof initForm

const feeColor = (f: string) =>
  f === 'paid' ? 'success' : f === 'overdue' ? 'danger' : 'warning'
const formatDate = (iso: string)=>{
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const classLabel = (classId: string | null, classes: ClassOption[]) =>{
  if (!classId) return '—'
  return classes.find(c => c._id === classId)?.name ?? classId
}

const toPayload = (form: FormState) =>({
  name: form.name,
  rollNumber: form.rollNumber,
  ...(isObjectId(form.class) ? { class: form.class } : {}),
  section: form.section,
  dateOfBirth: form.dateOfBirth || undefined,
  gender: form.gender,
  phone: form.phone,
  category: form.category,
  session: form.session,
  feeStatus: form.feeStatus,
  status: form.status,
  address: form.address,
  guardian:{
    ...form.guardian,
    annualIncome: Number(form.guardian.annualIncome),
  },
})

const toForm = (s:Student): FormState => ({
  name:s.name,
  rollNumber:s.rollNumber,
  class:s.class ?? '',
  section:s.section,
  dateOfBirth:s.dateOfBirth ? s.dateOfBirth.split('T')[0] : '',
  gender:s.gender,
  phone:s.phone,
  category:s.category,
  session:s.session,
  feeStatus:s.feeStatus,
  status:s.status,
  address:s.address ?? {street:'',city:'',state:'',pincode:''},
  guardian:s.guardian ?? {name:'',relation:'Father',phone:'',email:'',occupation:'',annualIncome:0},
});


export default function StudentsPage(){
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(initForm);
  
  const fetchStudents = useCallback(async()=>{
    setLoading(true);
    setError(null);
    try {
      const [studRes,classRes] = await Promise.all([
        fetch(BASE_URL),
        fetch(CLASSES_URL).catch(() =>null),   
      ]);
      if (!studRes.ok) throw new Error(`Server error: ${studRes.status}`);
      const studJson: ApiResponse = await studRes.json();
      setStudents(studJson.data);
      if (classRes?.ok){
        const classJson = await classRes.json();
        const list: ClassOption[] = Array.isArray(classJson) ? classJson : (classJson.data ?? []);
        setClasses(list);
      }
    } catch (err: unknown){
      setError(err instanceof Error ? err.message : 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  },[])

  useEffect(() => {fetchStudents()},[fetchStudents])

  const handleSave = async ()=>{
    if (!form.name.trim() || !form.rollNumber.trim()){
      alert('Name and Roll Number are required.')
      return
    }
    setSaving(true)
    try {
      if (modal === 'add'){
        const res = await fetch(BASE_URL,{
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(toPayload(form)),
        })
        if (!res.ok){
          const err = await res.json()
          throw new Error(err.message ?? `Server error: ${res.status}`)
        }
        const json = await res.json()
        const newStudent: Student = json.data ?? json
        setStudents(prev => [...prev, newStudent])
      } else if (modal === 'edit' && selected){
        const res = await fetch(`${BASE_URL}/${selected._id}`,{
          method: 'PUT',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(toPayload(form)),
        })
        if (!res.ok){
          const err = await res.json()
          throw new Error(err.message ?? `Server error: ${res.status}`)
        }
        const json = await res.json()
        const updated: Student = json.data ?? json
        setStudents(prev => prev.map(s => s._id === selected._id ? updated : s))
      }
      setModal(null)
    } catch (err: unknown){
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string)=>{
    if (!confirm('Delete this student?')) return;
    try {
      const res = await fetch(`${BASE_URL}/${id}`,{method:'DELETE'});
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setStudents(prev => prev.filter(s => s._id !== id));
    } catch (err: unknown){
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const filtered = students.filter(s =>{
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.includes(search)
    const matchStatus = filterStatus === 'All' || s.feeStatus === filterStatus
    return matchSearch && matchStatus
  })

  const openAdd = () => { setForm(initForm); setModal('add')}
  const openEdit = (s: Student) => {setSelected(s);setForm(toForm(s)); setModal('edit')}
  const openView = (s: Student) => {setSelected(s);setModal('view')}

  const setField = (key: keyof FormState, val: string)=>
    setForm(f => ({ ...f, [key]:val}))

  const setAddress = (key: keyof Address, val: string) =>
    setForm(f => ({...f, address: { ...f.address, [key]: val }}))

  const setGuardian = (key: keyof Guardian, val: string | number) =>
    setForm(f => ({...f, guardian: { ...f.guardian, [key]: val }}))

  return ( 
    <AppLayout title="Students" subtitle="Manage all student records">
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        {[
          { label: 'Total', value: students.length, color: '#1e3a5f', bg: '#e0e7ff'},
          { label: 'Active', value: students.filter(s => s.status === 'active').length,color:'#059669',bg:'#d1fae5'},
          { label: 'Fee Paid', value: students.filter(s => s.feeStatus === 'paid').length, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Fee Pending', value: students.filter(s => s.feeStatus === 'pending').length, color: '#d97706', bg: '#fef3c7' },
          { label: 'Overdue', value: students.filter(s => s.feeStatus === 'overdue').length, color: '#dc2626', bg: '#fee2e2' },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, borderRadius: 10, padding: '12px 20px', textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>{c.label}</div>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search students…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {['All', 'paid', 'pending', 'overdue'].map(v => <option key={v}>{v}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={fetchStudents} title="Refresh" disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add Student</button>
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchStudents}>Retry</button>
        </div>
      )}
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
                  <th>#</th><th>Student</th><th>Roll No</th><th>Class</th>
                  <th>Gender</th><th>Guardian</th><th>Phone</th><th>Fee</th><th>Actions</th>
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
                          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{formatDate(s.dateOfBirth)}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{s.rollNumber}</code></td>
                    <td>
                      <span className="badge badge-info">
                        {classLabel(s.class, classes)} · {s.section}
                      </span>
                    </td>
                    <td>{s.gender}</td>
                    <td style={{ fontSize: 13 }}>{s.guardian?.name ?? '—'}</td>
                    <td style={{ fontSize: 13 }}>{s.phone}</td>
                    <td><span className={`badge badge-${feeColor(s.feeStatus)}`}>{s.feeStatus}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openView(s)} title="View"><Eye size={14} /></button>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit"><Edit size={14} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No students found</h3>
                        <p>Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3>{modal === 'add' ? '➕ Add New Student' : '✏️ Edit Student'}</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Basic Info</p>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Student name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input className="form-control" value={form.rollNumber} onChange={e => setField('rollNumber', e.target.value)} placeholder="e.g. R101" />
                </div>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select className="form-control" value={form.class} onChange={e => setField('class', e.target.value)}>
                    <option value="">— No Class Assigned —</option>
                    {classes.length > 0
                      ? classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)
                      : <option disabled>No classes loaded</option>
                    }
                  </select>
                  {classes.length === 0 && (
                    <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>
                      ⚠ Could not load classes from server — class will not be saved.
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select className="form-control" value={form.section} onChange={e => setField('section', e.target.value)}>
                    {SECTION_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
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
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="10-digit number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={e => setField('category', e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Session</label>
                  <select className="form-control" value={form.session} onChange={e => setField('session', e.target.value)}>
                    {SESSION_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fee Status</label>
                  <select className="form-control" value={form.feeStatus} onChange={e => setField('feeStatus', e.target.value)}>
                    <option value="paid">Paid</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setField('status', e.target.value)}>
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <p style={{ fontWeight: 700, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 10px' }}>Address</p>
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
              <p style={{ fontWeight: 700, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 10px' }}>Guardian</p>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={form.guardian.name} onChange={e => setGuardian('name', e.target.value)} placeholder="Guardian name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation</label>
                  <select className="form-control" value={form.guardian.relation} onChange={e => setGuardian('relation', e.target.value)}>
                    {['Father', 'Mother', 'Uncle', 'Aunt', 'Grandparent', 'Other'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
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
                  <input className="form-control" type="number" value={form.guardian.annualIncome} onChange={e => setGuardian('annualIncome', e.target.value)} placeholder="e.g. 200000" />
                </div>
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

      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3>👤 Student Profile</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{maxHeight:'65vh',overflowY:'auto'}}>
              <div style={{ textAlign: 'center',marginBottom:20}}>
                <div className="avatar" style={{width:64,height:64,fontSize:28,background: '#1e3a5f', margin: '0 auto 12px' }}>
                  {selected.name.charAt(0)}
                </div>
                <h3 style={{ marginBottom:4}}>{selected.name}</h3>
                <span className="badge badge-info">
                  {selected.class ? `Class ${classLabel(selected.class, classes)}` : 'No Class'} · {selected.section} · {selected.session}
                </span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Student Details</p>
              <div className="grid-2" style={{gap:10,marginBottom:16}}>
                {[
                  ['Roll No', selected.rollNumber],
                  ['DOB', formatDate(selected.dateOfBirth)],
                  ['Gender', selected.gender],
                  ['Category', selected.category],
                  ['Phone', selected.phone],
                  ['Fee Status', selected.feeStatus],
                  ['Status', selected.status],
                  ['Admission', formatDate(selected.admissionDate)],
                ].map(([k,v])=>(
                  <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              {selected.address && (
                <>
                  <p style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Address</p>
                  <div style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:16}}>
                    {[selected.address.street, selected.address.city, selected.address.state, selected.address.pincode].filter(Boolean).join(',')}
                  </div>
                </>
              )}
              {selected.guardian && (
                <>
                  <p style={{fontWeight:700,fontSize:11,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Guardian</p>
                  <div className="grid-2" style={{gap:10}}>
                    {[
                      ['Name', selected.guardian.name],
                      ['Relation', selected.guardian.relation],
                      ['Phone', selected.guardian.phone],
                      ['Email', selected.guardian.email],
                      ['Occupation', selected.guardian.occupation],
                      ['Annual Income', selected.guardian.annualIncome ? `₹${selected.guardian.annualIncome.toLocaleString('en-IN')}` : '—'],
                    ].map(([k, v])=>(
                      <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v || '—'}</div>
                      </div>
                    ))}
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