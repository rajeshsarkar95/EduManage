'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { NOTICES } from '@/lib/data'
import { Plus, X, Trash2, Bell } from 'lucide-react'

const initForm = { title: '', content: '', priority: 'medium', target: 'All', sms: false }

export default function NoticesPage() {
  const [notices, setNotices] = useState(NOTICES)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(initForm)

  const priorityColor: Record<string, string> = {
    urgent: 'danger', high: 'warning', medium: 'info', low: 'gray'
  }

  const handleAdd = () => {
    setNotices([{ ...form, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...notices])
    setForm(initForm)
    setModal(false)
  }

  return (
    <AppLayout title="Notices & Announcements" subtitle="Post and manage school notices">
      <div className="toolbar">
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> New Notice</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {notices.map(n => (
          <div key={n.id} className="card" style={{ border: n.priority === 'urgent' ? '1.5px solid #fca5a5' : undefined }}>
            <div className="card-body" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <Bell size={16} color={n.priority === 'urgent' ? '#dc2626' : '#64748b'} />
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{n.title}</h3>
                    <span className={`badge badge-${priorityColor[n.priority]}`}>{n.priority}</span>
                    <span className="badge badge-purple">📍 {n.target}</span>
                    {n.sms && <span className="badge badge-success">📱 SMS Sent</span>}
                  </div>
                  <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 10 }}>{n.content}</p>
                  <span style={{ fontSize: 11.5, color: '#94a3b8' }}>📅 {n.date}</span>
                </div>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => setNotices(notices.filter(x => x.id !== n.id))}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h3>📢 New Notice / Announcement</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" placeholder="Notice title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="form-control" rows={4} placeholder="Write notice content…" value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ resize: 'vertical' }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                    <option value="low">Low</option><option value="medium">Medium</option>
                    <option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Target</label>
                  <select className="form-control" value={form.target} onChange={e => setForm({...form, target: e.target.value})}>
                    <option>All</option><option>10-A</option><option>10-B</option>
                    <option>9-A</option><option>9-B</option><option>8-A</option>
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
                <input type="checkbox" checked={form.sms} onChange={e => setForm({...form, sms: e.target.checked})} />
                <span>📱 Send SMS notification to parents</span>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Publish Notice</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
