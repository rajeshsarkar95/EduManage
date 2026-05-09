'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { TRANSPORT_ROUTES } from '@/lib/data'
import { Bus, MapPin, Users, Plus, X } from 'lucide-react'

export default function TransportPage() {
  const [routes, setRoutes] = useState(TRANSPORT_ROUTES)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ route: '', bus: '', driver: '', students: 0, status: 'active', stops: '' })

  const handleAdd = () => {
    setRoutes([...routes, { ...form, id: Date.now(), students: +form.students, stops: form.stops.split(',').map(s=>s.trim()) }])
    setModal(false)
  }

  return (
    <AppLayout title="Transport Management" subtitle="Manage school bus routes and drivers">

      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Routes',  value: routes.length,                                   color:'#1e3a5f', bg:'#e0e7ff', icon:'🚌' },
          { label: 'Active',        value: routes.filter(r=>r.status==='active').length,    color:'#059669', bg:'#d1fae5', icon:'✅' },
          { label: 'Maintenance',   value: routes.filter(r=>r.status==='maintenance').length, color:'#d97706', bg:'#fef3c7', icon:'🔧' },
          { label: 'Students',      value: routes.reduce((a,r)=>a+r.students,0),            color:'#7c3aed', bg:'#ede9fe', icon:'👦' },
        ].map((s,i)=>(
          <div key={i} style={{ background:s.bg, borderRadius:10, padding:'14px 20px', flex:1, textAlign:'center' }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontSize:26, fontWeight:800, color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="toolbar">
        <div style={{ flex:1 }} />
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={16}/> Add Route</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:18 }}>
        {routes.map((r,i)=>(
          <div key={r.id} className="card" style={{ overflow:'hidden' }}>
            <div style={{ height:5, background: r.status==='active'?'#059669':'#d97706' }} />
            <div style={{ padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:44, height:44, background:'#e0e7ff', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bus size={22} color="#1e3a5f" />
                  </div>
                  <div>
                    <h4 style={{ fontSize:14, marginBottom:2 }}>{r.route}</h4>
                    <p style={{ fontSize:12, color:'#64748b' }}>Bus: {r.bus}</p>
                  </div>
                </div>
                <span className={`badge badge-${r.status==='active'?'success':'warning'}`}>{r.status}</span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                <div style={{ fontSize:13, color:'#475569' }}>👨‍✈️ Driver: <strong>{r.driver}</strong></div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#475569' }}>
                  <Users size={14}/> {r.students} Students
                </div>
              </div>

              <div>
                <div style={{ fontSize:11.5, fontWeight:700, color:'#94a3b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  <MapPin size={12} style={{ display:'inline', marginRight:4 }} />Stops
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {r.stops.map((s,j)=>(
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:18, height:18, background:'#1e3a5f', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700 }}>{j+1}</span>
                      <span style={{ fontSize:12.5, color:'#475569' }}>{s}</span>
                      {j<r.stops.length-1 && <span style={{ color:'#cbd5e1' }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>🚌 Add New Route</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Route Name</label>
                  <input className="form-control" placeholder="e.g. Route 4 – West Zone" value={form.route} onChange={e=>setForm({...form,route:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Bus Number</label>
                  <input className="form-control" placeholder="e.g. DL-1C-3456" value={form.bus} onChange={e=>setForm({...form,bus:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Driver Name</label>
                  <input className="form-control" placeholder="Driver name" value={form.driver} onChange={e=>setForm({...form,driver:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Total Students</label>
                  <input className="form-control" type="number" value={form.students} onChange={e=>setForm({...form,students:+e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    <option value="active">Active</option><option value="maintenance">Maintenance</option>
                  </select></div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Stops (comma separated)</label>
                  <input className="form-control" placeholder="Stop 1, Stop 2, Stop 3" value={form.stops} onChange={e=>setForm({...form,stops:e.target.value})} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Route</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
