'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { FEES } from '@/lib/data'
import { Search, CheckCircle, X, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'

type FeeStatus = 'paid' | 'pending' | 'overdue';
type ModalMode = 'add' | 'edit' | 'delete' | null

interface FeeRecord {
  id: number
  student: string
  class: string
  amount: number
  paid: number
  due: number
  dueDate: string
  status: FeeStatus
}

interface FeeForm {
  student: string
  class: string
  amount: string
  paid: string
  dueDate: string
}

const STATUS_COLOR: Record<FeeStatus, string> ={
  paid:    'success',
  pending: 'warning',
  overdue: 'danger',
}

const EMPTY_FORM: FeeForm = {
  student: '',
  class:   '',
  amount:  '',
  paid:    '',
  dueDate: '',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 5,
}

const dialogStyle: React.CSSProperties ={
  position: 'fixed',
  top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)',
  background: '#fff',
  borderRadius: 18,
  padding: '28px 28px 24px',
  width: '100%',
  maxWidth: 490,
  boxShadow: '0 32px 72px rgba(0,0,0,0.2)',
  zIndex: 1001,
}

function deriveStatus(paid: number, amount: number, dueDate: string):FeeStatus{
  if (paid >= amount) return 'paid'
  const due = new Date(dueDate)
  if (!isNaN(due.getTime()) && due < new Date()) return 'overdue'
  return 'pending'
}

function recordToForm(f: FeeRecord): FeeForm {
  return {
    student: f.student,
    class:   f.class,
    amount:  String(f.amount),
    paid:    String(f.paid),
    dueDate: f.dueDate,
  }
}

function nextId(fees: FeeRecord[]):number{
  return fees.length ? Math.max(...fees.map((f) => f.id)) + 1 : 1
}

interface ModalHeaderProps {
  icon: string
  title: string
  subtitle: string
  onClose: () => void
  accentBg?: string
}

function ModalHeader({ icon, title, subtitle, onClose, accentBg = '#e0e7ff' }:ModalHeaderProps){
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom:4}}>
            <div style={{ background: accentBg, borderRadius: 8, padding: '6px 8px', fontSize: 18, lineHeight: 1 }}>{icon}</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', margin: 0 }}>{title}</h2>
          </div>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, paddingLeft: 2 }}>{subtitle}</p>
        </div>
        <button
          onClick={onClose}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', marginLeft: 12, flexShrink:0}}
        >
          <X size={17} color="#64748b"/>
        </button>
      </div>
      <div style={{borderTop:'1px solid #f1f5f9',marginBottom:20}}/>
    </>
  )
}

interface ModalFooterProps {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel: string
  confirmIcon: React.ReactNode
  confirmColor: string
}

function ModalFooter({onCancel,onConfirm,confirmLabel,confirmIcon,confirmColor}:ModalFooterProps){
  return (
    <div style={{ display:'flex',gap:10,marginTop:20}}>
      <button className="btn btn-outline" style={{flex:1}} onClick={onCancel}>Cancel</button>
      <button
        onClick={onConfirm}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none',
          background: confirmColor, color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
        }}
      >
        {confirmIcon} {confirmLabel}
      </button>
    </div>
  )
}

export default function FeesPage(){
  const [fees, setFees]           = useState<FeeRecord[]>(FEES as FeeRecord[])
  const [search, setSearch]       = useState<string>('')
  const [filter, setFilter]       = useState<string>('All')
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selected, setSelected]   = useState<FeeRecord | null>(null)
  const [form, setForm]           = useState<FeeForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string>('')

  const filtered = fees.filter((f) => {
    const matchSearch = f.student.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || f.status === filter
    return matchSearch && matchFilter
  })
  
  const total     = fees.reduce((a, f) => a + f.amount,0)
  const collected = fees.reduce((a, f) => a + f.paid,0)
  const pending   = fees.reduce((a, f) => a + f.due,0)
  const collPct   = total > 0 ? Math.round((collected / total) * 100) : 0

  const openAdd = (): void => {
    setForm(EMPTY_FORM); setFormError(''); setSelected(null); setModalMode('add')
  }
  const openEdit = (fee: FeeRecord): void =>{
    setSelected(fee); setForm(recordToForm(fee)); setFormError(''); setModalMode('edit')
  }
  const openDelete = (fee: FeeRecord): void =>{
    setSelected(fee); setFormError(''); setModalMode('delete')
  }
  const closeModal = (): void => {
    setModalMode(null); setSelected(null); setForm(EMPTY_FORM); setFormError('')
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  function validateForm(): FeeRecord | null {
    const { student, class: cls, amount, paid, dueDate } = form
    if (!student.trim() || !cls || !amount || !dueDate) {
      setFormError('Please fill in all required fields.'); return null
    }
    const amountNum = parseFloat(amount)
    const paidNum   = parseFloat(paid || '0')
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Amount must be a positive number.'); return null
    }
    if (paidNum < 0 || paidNum > amountNum) {
      setFormError('Paid amount cannot exceed total amount.'); return null
    }
    return {
      id:      selected?.id ?? nextId(fees),
      student: student.trim(),
      class:   cls,
      amount:  amountNum,
      paid:    paidNum,
      due:     amountNum - paidNum,
      dueDate,
      status:  deriveStatus(paidNum, amountNum, dueDate),
    }
  }

  const handleAdd = (): void => {
    const record = validateForm()
    if (!record) return
    setFees((prev) => [record, ...prev])
    closeModal()
  }

  const handleEdit = (): void => {
    const record = validateForm()
    if (!record) return
    setFees((prev) => prev.map((f) => (f.id === record.id ? record : f)))
    closeModal()
  }

  const handleDelete = (): void => {
    if (!selected) return
    setFees((prev) => prev.filter((f) => f.id !== selected.id))
    closeModal()
  }

  const markPaid = (id: number): void => {
    setFees((prev) =>
      prev.map((f) => f.id === id ? { ...f, paid: f.amount, due: 0, status: 'paid' } : f)
    )
  }

  const renderForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Student Name <span style={{ color: '#dc2626' }}>*</span></label>
        <input className="form-control" name="student" placeholder="e.g. Arjun Singh"
          value={form.student} onChange={handleFormChange} style={{ width: '100%' }} />
      </div>
      <div>
        <label style={labelStyle}>Class <span style={{ color: '#dc2626' }}>*</span></label>
        <select className="form-control" name="class" value={form.class}
          onChange={handleFormChange} style={{ width: '100%' }}>
          <option value="">Select class</option>
          {['1','2','3','4','5','6','7','8','9','10','11','12'].map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Total Amount (₹) <span style={{ color: '#dc2626' }}>*</span></label>
          <input className="form-control" name="amount" type="number" min="0"
            placeholder="e.g. 12000" value={form.amount} onChange={handleFormChange} style={{ width: '100%' }} />
        </div>
        <div>
          <label style={labelStyle}>Amount Paid (₹)</label>
          <input className="form-control" name="paid" type="number" min="0"
            placeholder="e.g. 6000" value={form.paid} onChange={handleFormChange} style={{ width: '100%' }} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Due Date <span style={{ color: '#dc2626' }}>*</span></label>
        <input className="form-control" name="dueDate" type="date"
          value={form.dueDate} onChange={handleFormChange} style={{ width: '100%' }} />
      </div>

      {form.amount && form.dueDate && (() => {
        const st = deriveStatus(parseFloat(form.paid || '0'), parseFloat(form.amount || '0'), form.dueDate)
        return (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#475569' }}>
            <strong>Status will be: </strong>
            <span className={`badge badge-${STATUS_COLOR[st]}`}>{st}</span>
          </div>
        )
      })()}

      {formError && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '9px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: 500 }}>
          ⚠️ {formError}
        </div>
      )}
    </div>
  )

  return (
    <AppLayout title="Fee Management" subtitle="Track fee collection and pending payments">
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
          <option>All</option><option>paid</option><option>pending</option><option>overdue</option>
        </select>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
          onClick={openAdd}
        >
          <Plus size={15} /> Add Student Fee
        </button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Student</th><th>Class</th><th>Total</th>
                <th>Paid</th><th>Due</th><th>Due Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No records found.</td>
                </tr>
              ) : filtered.map((f, i) => (
                <tr key={f.id}>
                  <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{f.student}</td>
                  <td><span className="badge badge-info">{f.class}</span></td>
                  <td>₹{f.amount.toLocaleString()}</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>₹{f.paid.toLocaleString()}</td>
                  <td style={{ color: f.due > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>₹{f.due.toLocaleString()}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{f.dueDate}</td>
                  <td><span className={`badge badge-${STATUS_COLOR[f.status]}`}>{f.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {f.status !== 'paid' ? (
                        <button className="btn btn-success btn-sm" onClick={() => markPaid(f.id)} title="Mark as Paid">
                          <CheckCircle size={12} /> Paid
                        </button>
                      ) : (
                        <span style={{ color: '#059669', fontSize: 12 }}>✅</span>
                      )}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(f)}
                        title="Edit"
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Pencil size={12} /> Edit
                      </button>
                      <button
                        onClick={() => openDelete(f)}
                        title="Delete"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 8px', border: '1px solid #fca5a5',
                          borderRadius: 6, background: '#fff5f5', color: '#dc2626',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
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
        </div>
      </div>
      {modalMode && (
        <>
          <div
            onClick={closeModal}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
          />
          {modalMode === 'add' && (
            <div style={dialogStyle}>
              <ModalHeader icon="💰" title="Add Student Fee" subtitle="Fill in the details to create a new fee record." onClose={closeModal} />
              {renderForm()}
              <ModalFooter onCancel={closeModal} onConfirm={handleAdd} confirmLabel="Add Fee Record" confirmIcon={<Plus size={14} />} confirmColor="#1e3a5f" />
            </div>
          )}
          {modalMode === 'edit' && selected && (
            <div style={dialogStyle}>
              <ModalHeader icon="✏️" title="Edit Fee Record" subtitle={`Editing record for ${selected.student}`} onClose={closeModal} accentBg="#fef3c7" />
              {renderForm()}
              <ModalFooter onCancel={closeModal} onConfirm={handleEdit} confirmLabel="Save Changes" confirmIcon={<Pencil size={14} />} confirmColor="#d97706" />
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
                  <strong style={{ color: '#1e293b' }}>{selected.student}</strong> (Class {selected.class}).
                  This action cannot be undone.
                </p>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                {[
                  { label: 'Total Amount', value: `₹${selected.amount.toLocaleString()}` },
                  { label: 'Paid',         value: `₹${selected.paid.toLocaleString()}` },
                  { label: 'Due',          value: `₹${selected.due.toLocaleString()}` },
                  { label: 'Status',       value: selected.status },
                  { label: 'Due Date',     value: selected.dueDate },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <strong style={{ color: '#1e293b' }}>{row.value}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
                <button
                  onClick={handleDelete}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
                >
                  <Trash2 size={14} /> Yes, Delete
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}