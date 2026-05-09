'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { FEES } from '@/lib/data'
import { Search,CreditCard,CheckCircle} from 'lucide-react'

export default function FeesPage() {
  const [fees, setFees] = useState(FEES)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const filtered = fees.filter(f => {
    const matchSearch = f.student.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || f.status === filter
    return matchSearch && matchFilter
  })
  const total      = fees.reduce((a,f) => a+f.amount, 0)
  const collected  = fees.reduce((a,f) => a+f.paid, 0)
  const pending    = fees.reduce((a,f) => a+f.due, 0)
  const markPaid = (id: number) => {
    setFees(fees.map(f => f.id === id ? { ...f, paid: f.amount, due: 0, status: 'paid' } : f))
  }
  const statusColor: Record<string,string> = { paid:'success', pending:'warning', overdue:'danger'}
  return (
    <AppLayout title="Fee Management" subtitle="Track fee collection and pending payments">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Fees',    value: `₹${total.toLocaleString()}`,color: '#1e3a5f', bg: '#e0e7ff', icon: '💼' },
          { label: 'Collected',     value: `₹${collected.toLocaleString()}`,color: '#059669', bg: '#d1fae5', icon: '✅' },
          { label: 'Pending',       value: `₹${pending.toLocaleString()}`,color: '#d97706', bg: '#fef3c7', icon: '⏳' },
          { label: 'Collection %',  value: `${Math.round((collected/total)*100)}%`, color: '#7c3aed', bg: '#ede9fe', icon: '📊'},
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#64748b',marginBottom:8}}>
            <span>Overall Fee Collection Progress</span>
            <strong>{Math.round((collected/total)*100)}%</strong>
          </div>
          <div className="progress-bar" style={{ height:10}}>
            <div className="progress-fill" style={{ width: `${(collected/total)*100}%`, background: 'linear-gradient(90deg,#1e3a5f,#3b82f6)'}}/>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option>All</option><option>paid</option><option>pending</option><option>overdue</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Student</th><th>Class</th><th>Total</th><th>Paid</th><th>Due</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((f,i)=>(
                <tr key={f.id}>
                  <td style={{color:'#94a3b8'}}>{i+1}</td>
                  <td style={{fontWeight:600}}>{f.student}</td>
                  <td><span className="badge badge-info">{f.class}</span></td>
                  <td>₹{f.amount.toLocaleString()}</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>₹{f.paid.toLocaleString()}</td>
                  <td style={{ color: f.due > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>₹{f.due.toLocaleString()}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{f.dueDate}</td>
                  <td><span className={`badge badge-${statusColor[f.status]}`}>{f.status}</span></td>
                  <td>
                    {f.status !== 'paid' ? (
                      <button className="btn btn-success btn-sm" onClick={()=> markPaid(f.id)}>
                        <CheckCircle size={13}/> Mark Paid
                      </button>
                    ) : (
                      <span style={{color:'#059669',fontSize:13}}>✅ Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
