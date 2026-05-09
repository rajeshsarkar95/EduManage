'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [school, setSchool] = useState({ name: 'Delhi Public School', address: 'New Delhi, India', phone: '011-12345678', email: 'info@dps.edu', principal: 'Dr. Anand Kumar', established: '1990', board: 'CBSE' })
  const [sms, setSms] = useState({ provider: 'fast2sms', apiKey: '', senderId: 'SCHOOL', enabled: true })
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <AppLayout title="Settings" subtitle="Configure school and system settings">
      <div style={{ maxWidth: 700 }}>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>🏫 School Information</h3></div>
          <div className="card-body">
            <div className="grid-2">
              {[
                { label: 'School Name',    key: 'name',        placeholder: 'School name' },
                { label: 'Principal',      key: 'principal',   placeholder: 'Principal name' },
                { label: 'Phone',          key: 'phone',       placeholder: 'Contact number' },
                { label: 'Email',          key: 'email',       placeholder: 'School email' },
                { label: 'Board',          key: 'board',       placeholder: 'e.g. CBSE, ICSE' },
                { label: 'Est. Year',      key: 'established', placeholder: 'Year' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-control" placeholder={f.placeholder}
                    value={(school as any)[f.key]} onChange={e => setSchool({...school, [f.key]: e.target.value})} />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label">Address</label>
                <input className="form-control" value={school.address} onChange={e => setSchool({...school, address: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h3>📱 SMS Configuration</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">SMS Provider</label>
              <select className="form-control" value={sms.provider} onChange={e => setSms({...sms, provider: e.target.value})}>
                <option value="fast2sms">Fast2SMS</option>
                <option value="textlocal">Textlocal</option>
                <option value="msg91">MSG91</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">API Key</label>
              <input className="form-control" type="password" placeholder="Enter your SMS API key" value={sms.apiKey} onChange={e => setSms({...sms, apiKey: e.target.value})} />
              <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>Get your API key from the SMS provider dashboard</p>
            </div>
            <div className="form-group">
              <label className="form-label">Sender ID</label>
              <input className="form-control" placeholder="e.g. SCHOOL" value={sms.senderId} onChange={e => setSms({...sms, senderId: e.target.value})} />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
              <input type="checkbox" checked={sms.enabled} onChange={e => setSms({...sms, enabled: e.target.checked})} />
              <span style={{ fontSize:13.5 }}>Enable SMS notifications</span>
            </label>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: 160 }}>
          <Save size={16} /> {saved ? '✅ Saved!' : 'Save Settings'}
        </button>
      </div>
    </AppLayout>
  )
}
