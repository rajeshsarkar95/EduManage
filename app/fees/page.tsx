'use client'
import {useState,useEffect,useCallback} from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {Search,CheckCircle,X,Plus,Pencil,Trash2,AlertTriangle,Loader2} from 'lucide-react';

const BASE   = 'https://edumanagebackend-1.onrender.com/api/v1'

const FEES_API     = `${BASE}/fees`
const STUDENTS_API = `${BASE}/students`
const CLASSES_API  = `${BASE}/classes`

type FeeStatus = 'paid' | 'pending' | 'overdue';
type ModalMode = 'add' | 'edit' | 'delete' | null;

interface Student {
  _id:string
  name:string
  rollNumber?:string
  className?:string | {name:string}
}

interface Class{
  _id:string
  name:string
  section?:string
}

interface FeeRecord {
  id:string
  _id: string
  student:string | {_id:string;name:string}
  class:string | {_id:string;name:string}
  session:string
  feeType:string
  totalAmount:number
  paidAmount:number
  discountAmount:number
  fineAmount:number
  balanceDue:number
  dueDate:string
  status:FeeStatus
  payments:unknown[]
}

interface FeeForm {
  student:string
  class:string
  session:string
  feeType:string
  totalAmount:string
  paidAmount:string
  discountAmount:string
  fineAmount:string
  dueDate:string
}

const STATUS_COLOR:Record<FeeStatus,string>={
  paid:'success',
  pending:'warning',
  overdue:'danger',
}

const EMPTY_FORM:FeeForm = {
  student:'',
  class:'',
  session:new Date().getFullYear().toString(),
  feeType:'tuition',
  totalAmount:'',
  paidAmount:'0',
  discountAmount:'0',
  fineAmount:'0',
  dueDate:'',
}

const FEE_TYPES = ['tuition','exam','transport','hostel','library','sports','other']

function studentName(f:FeeRecord):string{
  if (typeof f.student === 'object' && f.student !== null) return f.student.name ?? ''
  return (f.student as string) ?? ''
}

function className(f: FeeRecord):string{
  if (typeof f.class === 'object' && f.class !== null) return f.class.name ?? ''
  return (f.class as string) ?? ''
}

function studentId(f: FeeRecord):string{
  if (typeof f.student === 'object' && f.student !== null) return f.student._id ?? ''
  return (f.student as string) ?? ''
}

function classId(f: FeeRecord):string{
  if (typeof f.class === 'object' && f.class !== null) return f.class._id ?? ''
  return (f.class as string) ?? ''
}

function recordToForm(f:FeeRecord):FeeForm {
  return {
    student:        studentId(f),
    class:          classId(f),
    session:        f.session,
    feeType:        f.feeType,
    totalAmount:    String(f.totalAmount),
    paidAmount:     String(f.paidAmount),
    discountAmount: String(f.discountAmount),
    fineAmount:     String(f.fineAmount),
    dueDate:        f.dueDate ? f.dueDate.slice(0, 10) : '',
  }
}

async function apiFetch<T>(url:string,options?:RequestInit):Promise<T>{
  const res  = await fetch(url,options)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `Request failed: ${res.status}`)
  return json
}

const labelStyle: React.CSSProperties = {
  display: 'block',fontSize:12.5,fontWeight:600,
  color: '#374151',marginBottom:5,
}
const dialogStyle: React.CSSProperties = {
  position: 'fixed', top: '50%', left:'50%',
  transform: 'translate(-50%,-50%)',
  background: '#fff', borderRadius: 18,
  padding: '28px 28px 24px', width: '100%',maxWidth:520,
  boxShadow: '0 32px 72px rgba(0,0,0,0.2)',zIndex:1001,
  maxHeight: '90vh', overflowY:'auto',
}

interface ModalHeaderProps {
  icon:string;title:string;subtitle:string
  onClose:()=> void;accentBg?:string
}

function ModalHeader({icon,title,subtitle,onClose,accentBg = '#e0e7ff'}: ModalHeaderProps){
  return (
    <>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
            <div style={{background:accentBg,borderRadius:8,padding:'6px 8px',fontSize:18,lineHeight:1}}>{icon}</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin:0 }}>{title}</h2>
          </div>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, paddingLeft: 2 }}>{subtitle}</p>
        </div>
        <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', marginLeft: 12, flexShrink:0}}>
          <X size={17} color="#64748b"/>
        </button>
      </div>
      <div style={{borderTop:'1px solid #f1f5f9',marginBottom:20}}/>
    </>
  )
}
interface ModalFooterProps {
  onCancel: () => void; onConfirm: () => void
  confirmLabel: string; confirmIcon: React.ReactNode
  confirmColor: string; loading?: boolean
}

function ModalFooter({onCancel,onConfirm,confirmLabel,confirmIcon,confirmColor,loading}:ModalFooterProps){
  return (
    <div style={{display:'flex',gap:10,marginTop:20}}>
      <button className="btn btn-outline" style={{flex:1}} onClick={onCancel} disabled={loading}>Cancel</button>
      <button
        onClick={onConfirm} disabled={loading}
        style={{ flex: 1,display:'flex',alignItems:'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: confirmColor, color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> : confirmIcon}
        {loading ? 'Please wait…' : confirmLabel}
      </button>
    </div>
  )
}
export default function FeesPage(){
  const [fees, setFees]         = useState<FeeRecord[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses]   = useState<Class[]>([])
  const [loading, setLoading]   = useState(true)
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected]   = useState<FeeRecord | null>(null)
  const [form, setForm]           = useState<FeeForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchFees = useCallback(async ()=>{
    setLoading(true)
    setApiError('')
    try {
      const json = await apiFetch<{ data: FeeRecord[] | { docs?: FeeRecord[];fees?:FeeRecord[] } }>(FEES_API)
      const raw: FeeRecord[] = Array.isArray(json.data)
        ? json.data
        : ((json.data as { docs?: FeeRecord[]; fees?: FeeRecord[] })?.docs
          ?? (json.data as { docs?: FeeRecord[]; fees?: FeeRecord[] })?.fees
          ?? [])
      setFees(raw.map((f) => ({ ...f, id: f._id ?? f.id})))
    } catch (err: unknown){
      setApiError(err instanceof Error ? err.message : 'Failed to load fee records.')
    } finally {
      setLoading(false)
    }
  }, [])
  function extractList<T>(json: unknown):T[]{
    if (Array.isArray(json)) return json as T[]
    if (json && typeof json === 'object'){
      const obj = json as Record<string,unknown>
      for (const key of ['data', 'students', 'classes', 'result', 'docs', 'items', 'records']){
        const val = obj[key]
        if (Array.isArray(val)) return val as T[]
        if (val && typeof val === 'object'){
          const inner = val as Record<string, unknown>
          for (const k of ['docs', 'data', 'items', 'records', 'students', 'classes']){
            if (Array.isArray(inner[k])) return inner[k] as T[]
          }
        }
      }
    }
    return []
  }
  const fetchDropdownData = useCallback(async ()=>{
  setDropdownLoading(true)
  try {
    const [studentsRes, classesRes] = await Promise.allSettled([
      fetch(STUDENTS_API).then((r) => r.json()),
      fetch(CLASSES_API).then((r) => r.json()),
    ])

    if (studentsRes.status === 'fulfilled') {
      const json = studentsRes.value
      const list: Student[] =
        Array.isArray(json)              ? json           :  
        Array.isArray(json?.data)        ? json.data      :  
        Array.isArray(json?.students)    ? json.students  :  
        Array.isArray(json?.data?.students) ? json.data.students : 
        Array.isArray(json?.data?.docs)  ? json.data.docs :  
        Array.isArray(json?.docs)        ? json.docs      :  
        []

      console.log('[Fees] Students parsed:', list.length,'items')
      if (list.length === 0) {
        console.warn('[Fees] Could not parse students from:',json)
      }
      setStudents(list)
    }
    if (classesRes.status === 'fulfilled'){
      const json = classesRes.value
      const list: Class[] =
        Array.isArray(json)             ? json          :
        Array.isArray(json?.data)       ? json.data     :
        Array.isArray(json?.classes)    ? json.classes  :
        Array.isArray(json?.data?.classes) ? json.data.classes :
        Array.isArray(json?.data?.docs) ? json.data.docs :
        Array.isArray(json?.docs)       ? json.docs     :
        []
      console.log('[Fees] Classes parsed:',list.length,'items')
      if (list.length === 0){
        console.warn('[Fees] Could not parse classes from:',json)
      }
      setClasses(list)
    }
  } finally {
    setDropdownLoading(false)
  }
}, [])

  useEffect(() => { fetchFees()},[fetchFees])

  const total     = fees.reduce((a, f) => a + f.totalAmount, 0)
  const collected = fees.reduce((a, f) => a + f.paidAmount,  0)
  const pending   = fees.reduce((a, f) => a + f.balanceDue,  0)
  const collPct   = total > 0 ? Math.round((collected / total) * 100) : 0

  const filtered = fees.filter((f) => {
    const matchSearch = (studentName(f) ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || f.status === filter
    return matchSearch && matchFilter
  })

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setSelected(null)
    setModalMode('add')
    fetchDropdownData()  
  }
  const openEdit = (f: FeeRecord) => {
    setSelected(f)
    setForm(recordToForm(f))
    setFormError('')
    setModalMode('edit')
    fetchDropdownData()
  }
  const openDelete = (f: FeeRecord) => { setSelected(f); setFormError(''); setModalMode('delete') }
  const closeModal = () => { setModalMode(null); setSelected(null); setForm(EMPTY_FORM); setFormError('') }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  function buildPayload(): Record<string, unknown> | null {
    const { student, class: cls, session, feeType, totalAmount, paidAmount, discountAmount, fineAmount, dueDate } = form
    if (!student || !cls || !session.trim() || !feeType || !totalAmount || !dueDate) {
      setFormError('Please fill in all required fields.'); return null
    }
    const tot  = parseFloat(totalAmount)
    const paid = parseFloat(paidAmount     || '0')
    const disc = parseFloat(discountAmount || '0')
    const fine = parseFloat(fineAmount     || '0')
    if (isNaN(tot) || tot <= 0)     { setFormError('Total amount must be a positive number.'); return null }
    if (paid < 0 || paid > tot)     { setFormError('Paid amount cannot exceed total amount.'); return null }
    if (disc < 0)                   { setFormError('Discount cannot be negative.'); return null }
    if (fine < 0)                   { setFormError('Fine cannot be negative.'); return null }
    return { student, class: cls, session, feeType, totalAmount: tot, paidAmount: paid, discountAmount: disc, fineAmount: fine, dueDate }
  }

  const handleAdd = async () => {
    const payload = buildPayload()
    if (!payload) return
    setSubmitting(true)
    try {
      const json = await apiFetch<{ data: FeeRecord }>(FEES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setFees((prev) => [{ ...json.data, id: json.data._id }, ...prev])
      closeModal()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create fee record.')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleEdit = async () => {
    const payload = buildPayload()
    if (!payload || !selected) return
    setSubmitting(true)
    try {
      const json = await apiFetch<{ data: FeeRecord }>(`${FEES_API}/${selected._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const updated = { ...json.data, id: json.data._id }
      setFees((prev) => prev.map((f) => f._id === updated._id ? updated : f))
      closeModal()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update fee record.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async ()=>{
    if (!selected) return
    setSubmitting(true)
    try {
      await apiFetch(`${FEES_API}/${selected._id}`, { method: 'DELETE' })
      setFees((prev) => prev.filter((f) => f._id !== selected._id))
      closeModal()
    } catch (err: unknown){
      setFormError(err instanceof Error ? err.message : 'Failed to delete fee record.')
    } finally {
      setSubmitting(false)
    }
  }

  const markPaid = async (fee:FeeRecord)=>{
    try {
      let updated: FeeRecord
      const markRes = await fetch(`${FEES_API}/${fee._id}/mark-paid`,{
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ paidAmount: fee.totalAmount }),
      })
      if (markRes.status === 404 || markRes.status === 405) {
        const json = await apiFetch<{ data: FeeRecord }>(`${FEES_API}/${fee._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
            student:        studentId(fee),
            class:          classId(fee),
            session:        fee.session,
            feeType:        fee.feeType,
            totalAmount:    fee.totalAmount,
            paidAmount:     fee.totalAmount,   
            discountAmount: fee.discountAmount,
            fineAmount:     fee.fineAmount,
            dueDate:        fee.dueDate,
          }),
        })
        updated = {...json.data, id: json.data._id}
      } else {
        const json = await markRes.json()
        if (!markRes.ok) throw new Error(json.message || 'Failed to mark as paid.')
        updated = { ...json.data, id: json.data._id}
      }
      setFees((prev) => prev.map((f) => f._id === updated._id ? updated : f))
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to mark as paid.')
    }
  }
  const selectedStudentName = students.find((s) => s._id === form.student)?.name ?? ''
  const selectedClassName   = classes.find((c) => c._id === form.class)?.name ?? ''

  const renderForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle}>
          Student <span style={{ color: '#dc2626' }}>*</span>
        </label>
        {dropdownLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, color: '#94a3b8', fontSize: 13 }}>
            <Loader2 size={14} style={{ animation:'spin 1s linear infinite'}}/> Loading students…
          </div>
        ) : students.length > 0 ? (
          <select
            className="form-control"
            name="student"
            value={form.student}
            onChange={handleFormChange}
            style={{ width: '100%'}}
          >
            <option value="">— Select Student —</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}{s.rollNumber ? ` (${s.rollNumber})` : ''}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              className="form-control"
              name="student"
              placeholder="Student ObjectId"
              value={form.student}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: 11, color: '#f59e0b' }}>
              ⚠️ Could not load student list — check console for API response shape, then enter ObjectId manually
            </span>
          </>
        )}
        {selectedStudentName && (
          <span style={{ fontSize: 11, color: '#059669', marginTop: 3, display: 'block' }}>
            ✓ {selectedStudentName}
          </span>
        )}
      </div>
      <div>
        <label style={labelStyle}>
          Class <span style={{ color: '#dc2626' }}>*</span>
        </label>
        {dropdownLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, color: '#94a3b8', fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading classes…
          </div>
        ) : classes.length > 0 ? (
          <select
            className="form-control"
            name="class"
            value={form.class}
            onChange={handleFormChange}
            style={{ width: '100%' }}
          >
            <option value="">— Select Class —</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}{c.section ? ` — ${c.section}` : ''}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              className="form-control"
              name="class"
              placeholder="Class ObjectId"
              value={form.class}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            />
            <span style={{ fontSize: 11, color: '#f59e0b' }}>
              ⚠️ Could not load class list — check console for API response shape, then enter ObjectId manually
            </span>
          </>
        )}
        {selectedClassName && (
          <span style={{ fontSize: 11, color: '#059669', marginTop: 3, display: 'block' }}>
            ✓ {selectedClassName}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Session <span style={{ color: '#dc2626' }}>*</span></label>
          <input
            className="form-control"
            name="session"
            placeholder="e.g. 2025"
            value={form.session}
            onChange={handleFormChange}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Fee Type <span style={{ color: '#dc2626' }}>*</span></label>
          <select className="form-control" name="feeType" value={form.feeType} onChange={handleFormChange} style={{ width: '100%' }}>
            {FEE_TYPES.map((t) => (
              <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Total Amount (₹) <span style={{ color: '#dc2626' }}>*</span></label>
          <input className="form-control" name="totalAmount" type="number" min="0"
            placeholder="e.g. 5000" value={form.totalAmount} onChange={handleFormChange} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={labelStyle}>Amount Paid (₹)</label>
          <input className="form-control" name="paidAmount" type="number" min="0"
            placeholder="0" value={form.paidAmount} onChange={handleFormChange} style={{ width: '100%' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Discount (₹)</label>
          <input className="form-control" name="discountAmount" type="number" min="0"
            placeholder="0" value={form.discountAmount} onChange={handleFormChange} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={labelStyle}>Fine (₹)</label>
          <input className="form-control" name="fineAmount" type="number" min="0"
            placeholder="0" value={form.fineAmount} onChange={handleFormChange} style={{ width: '100%' }} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Due Date <span style={{ color: '#dc2626' }}>*</span></label>
        <input className="form-control" name="dueDate" type="date"
          value={form.dueDate} onChange={handleFormChange} style={{ width: '100%' }} />
      </div>
      {form.totalAmount && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#475569', display: 'flex', gap: 16 }}>
          <span>Balance Due: <strong style={{ color: '#dc2626' }}>
            ₹{Math.max(0,
              parseFloat(form.totalAmount    || '0')
              - parseFloat(form.paidAmount     || '0')
              - parseFloat(form.discountAmount || '0')
              + parseFloat(form.fineAmount     || '0')
            ).toLocaleString()}
          </strong></span>
        </div>
      )}
      {formError && (
        <div style={{background: '#fee2e2', color: '#dc2626', padding: '9px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: 500 }}>
          ⚠️ {formError}
        </div>
      )}
    </div>
  )
  return (
    <AppLayout title="Fee Management" subtitle="Track fee collection and pending payments">
      {apiError && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
          <span>⚠️ {apiError}</span>
          <button onClick={() => setApiError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 16 }}>×</button>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Fees',   value: `₹${total.toLocaleString()}`,     color: '#1e3a5f', bg: '#e0e7ff', icon: '💼' },
          { label: 'Collected',    value: `₹${collected.toLocaleString()}`, color: '#059669', bg: '#d1fae5', icon: '✅' },
          { label: 'Pending',      value: `₹${pending.toLocaleString()}`,   color: '#d97706', bg: '#fef3c7', icon: '⏳' },
          { label: 'Collection %', value: `${collPct}%`,                    color: '#7c3aed', bg: '#ede9fe', icon: '📊' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b', marginBottom: 8 }}>
            <span>Overall Fee Collection Progress</span><strong>{collPct}%</strong>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${collPct}%`, background: 'linear-gradient(90deg,#1e3a5f,#3b82f6)' }} />
          </div>
        </div>
      </div>
      <div className="toolbar" style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search student…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={fetchFees} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          🔄 Refresh
        </button>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }} onClick={openAdd}>
          <Plus size={15} /> Add Fee Record
        </button>
      </div>
      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
              <div>Loading fee records…</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Student</th><th>Class</th><th>Fee Type</th>
                  <th>Total</th><th>Paid</th><th>Balance</th>
                  <th>Discount</th><th>Fine</th>
                  <th>Due Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No records found.</td>
                  </tr>
                ) : filtered.map((f, i) => (
                  <tr key={f._id}>
                    <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{studentName(f)}</td>
                    <td><span className="badge badge-info">{className(f)}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{f.feeType}</td>
                    <td>₹{f.totalAmount.toLocaleString()}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>₹{f.paidAmount.toLocaleString()}</td>
                    <td style={{ color: f.balanceDue > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>₹{f.balanceDue.toLocaleString()}</td>
                    <td style={{ color: '#7c3aed' }}>{f.discountAmount > 0 ? `₹${f.discountAmount.toLocaleString()}` : '—'}</td>
                    <td style={{ color: '#d97706' }}>{f.fineAmount > 0 ? `₹${f.fineAmount.toLocaleString()}` : '—'}</td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[f.status]}`}>{f.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {f.status !== 'paid' ? (
                          <button className="btn btn-success btn-sm" onClick={() => markPaid(f)} title="Mark as Paid" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={12} /> Paid
                          </button>
                        ) : (
                          <span style={{ color: '#059669', fontSize: 12 }}>✅</span>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => openDelete(f)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: '1px solid #fca5a5', borderRadius: 6, background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#fff5f5' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modalMode && (
        <>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }} />
          {modalMode === 'add' && (
            <div style={dialogStyle}>
              <ModalHeader icon="💰" title="Add Fee Record" subtitle="Fill in the details to create a new fee record." onClose={closeModal} />
              {renderForm()}
              <ModalFooter onCancel={closeModal} onConfirm={handleAdd} confirmLabel="Add Fee Record" confirmIcon={<Plus size={14} />} confirmColor="#1e3a5f" loading={submitting} />
            </div>
          )}
          {modalMode === 'edit' && selected && (
            <div style={dialogStyle}>
              <ModalHeader icon="✏️" title="Edit Fee Record" subtitle={`Editing record for ${studentName(selected)}`} onClose={closeModal} accentBg="#fef3c7" />
              {renderForm()}
              <ModalFooter onCancel={closeModal} onConfirm={handleEdit} confirmLabel="Save Changes" confirmIcon={<Pencil size={14} />} confirmColor="#d97706" loading={submitting} />
            </div>
          )}
          {modalMode === 'delete' && selected && (
            <div style={{ ...dialogStyle, maxWidth: 420 }}>
              <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertTriangle size={26} color="#dc2626" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>Delete Fee Record?</h2>
                <p style={{ fontSize: 13.5, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  You are about to permanently delete the fee record for{' '}
                  <strong style={{ color: '#1e293b' }}>{studentName(selected)}</strong>{' '}
                  ({selected.feeType} — {selected.session}). This action cannot be undone.
                </p>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                {[
                  { label: 'Total Amount', value: `₹${selected.totalAmount.toLocaleString()}` },
                  { label: 'Paid',         value: `₹${selected.paidAmount.toLocaleString()}` },
                  { label: 'Balance Due',  value: `₹${selected.balanceDue.toLocaleString()}` },
                  { label: 'Discount',     value: `₹${selected.discountAmount.toLocaleString()}` },
                  { label: 'Fine',         value: `₹${selected.fineAmount.toLocaleString()}` },
                  { label: 'Status',       value: selected.status },
                  { label: 'Due Date',     value: selected.dueDate ? new Date(selected.dueDate).toLocaleDateString('en-IN') : '—' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <strong style={{ color: '#1e293b', textTransform: 'capitalize' }}>{row.value}</strong>
                  </div>
                ))}
              </div>
              {formError && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '9px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, marginBottom: 12 }}>
                  ⚠️ {formError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal} disabled={submitting}>Cancel</button>
                <button
                  onClick={handleDelete} disabled={submitting}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                  {submitting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </AppLayout>
  )
}