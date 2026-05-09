'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { SMS_LOGS, STUDENTS } from '@/lib/data'
import { Send, MessageSquare } from 'lucide-react'

export default function SMSPage() {
  const [logs, setLogs] = useState(SMS_LOGS)
  const [form, setForm] = useState({ to: 'all', class: 'All', message: '' })
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'compose'|'logs'>('compose')

  const templates = [
    { label: '🔴 Absent Alert',      msg: '{student} was ABSENT today ({date}). Please check with the school if needed.' },
    { label: '📢 Notice Alert',      msg: 'Important Notice from school: Please check the school portal for updates.' },
    { label: '💰 Fee Reminder',      msg: 'Dear Parent, fee submission deadline is approaching. Kindly pay the due amount.' },
    { label: '📅 PTM Reminder',      msg: 'Parent-Teacher Meeting is scheduled on {date}. Please attend at 10:00 AM.' },
    { label: '🎉 Holiday Notice',    msg: 'School will remain closed on {date} for a public holiday. Enjoy the break!' },
  ]

  const handleSend = async () => {
    if (!form.message.trim()) return alert('Please write a message!')
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    const newLog = {
      id: Date.now(),
      to: form.to === 'all' ? 'All Parents' : `Class ${form.class} Parents`,
      message: form.message,
      type: 'general',
      status: 'sent',
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }
    setLogs([newLog, ...logs])
    setForm({ ...form, message: '' })
    setSending(false)
    alert('✅ SMS sent successfully!')
  }

  const statusColor: Record<string, string> = { sent: 'success', failed: 'danger', pending: 'warning' }
  const typeColor:   Record<string, string> = { attendance: 'info', absent: 'danger', notice: 'warning', general: 'purple' }

  return (
    <AppLayout title="SMS System" subtitle="Send SMS alerts to parents">

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Sent Today',   value: logs.filter(l=>l.status==='sent').length,   color: '#059669', bg: '#d1fae5', icon: '✅' },
          { label: 'Failed',       value: logs.filter(l=>l.status==='failed').length,  color: '#dc2626', bg: '#fee2e2', icon: '❌' },
          { label: 'Absent Alerts',value: logs.filter(l=>l.type==='absent').length,    color: '#d97706', bg: '#fef3c7', icon: '🔴' },
          { label: 'Total Sent',   value: logs.length,                                 color: '#1e3a5f', bg: '#e0e7ff', icon: '📱' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '14px 20px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f0f4f8', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {(['compose', 'logs'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '8px 22px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              background: activeTab === tab ? '#1e3a5f' : 'transparent',
              color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
            {tab === 'compose' ? '✍️ Compose SMS' : '📋 SMS Logs'}
          </button>
        ))}
      </div>

      {activeTab === 'compose' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Composer */}
          <div>
            <div className="sms-composer">
              <h3>📱 Compose SMS</h3>
              <p>Send SMS to parents manually or use a template</p>
              <textarea rows={5} placeholder="Type your message here…"
                value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    value={form.to} onChange={e => setForm({...form, to: e.target.value})}>
                    <option value="all">📢 All Parents</option>
                    <option value="class">📚 Specific Class</option>
                    <option value="individual">👤 Individual</option>
                  </select>
                  {form.to === 'class' && (
                    <select style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      value={form.class} onChange={e => setForm({...form, class: e.target.value})}>
                      {['10-A','10-B','9-A','9-B','8-A','8-B'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.6 }}>{form.message.length} / 160 chars</span>
                <button className="btn btn-accent" onClick={handleSend} disabled={sending}>
                  <Send size={15} /> {sending ? 'Sending…' : 'Send SMS'}
                </button>
              </div>
            </div>

            {/* Templates */}
            <div className="card">
              <div className="card-header"><h3>⚡ Quick Templates</h3></div>
              <div className="card-body" style={{ padding: '14px 20px' }}>
                {templates.map((t, i) => (
                  <button key={i} onClick={() => setForm({...form, message: t.msg})}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 6, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.background = '#f0f4f8' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent logs preview */}
          <div className="card">
            <div className="card-header"><h3>📋 Recent SMS Logs</h3></div>
            <div style={{ padding: '0 4px' }}>
              {logs.slice(0, 6).map(l => (
                <div key={l.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge badge-${typeColor[l.type] || 'gray'}`} style={{ fontSize: 10 }}>{l.type}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{l.to}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge badge-${statusColor[l.status]}`} style={{ fontSize: 10 }}>{l.status}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{l.time}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{l.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <div className="card-header"><h3>📋 All SMS Logs</h3>
            <span className="badge badge-info">{logs.length} total</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Recipient</th><th>Message</th><th>Type</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={l.id}>
                    <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{l.to}</td>
                    <td style={{ maxWidth: 260, color: '#475569' }}>{l.message}</td>
                    <td><span className={`badge badge-${typeColor[l.type] || 'gray'}`}>{l.type}</span></td>
                    <td><span className={`badge badge-${statusColor[l.status]}`}>{l.status}</span></td>
                    <td style={{ color: '#94a3b8' }}>{l.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
