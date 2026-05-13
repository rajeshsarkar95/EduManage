'use client'
import {useState,useEffect} from 'react'
import AppLayout from '@/components/layout/AppLayout'
import {Bus,MapPin,Users,Plus,X,Clock} from 'lucide-react'

interface Stop {
  name:string
  time:string
  latitude:number
  longitude:number
}

interface Driver{
  name:string
  phone:string
  license:string
}

interface Conductor {
  name:string
  phone: string
}

type RouteStatus = 'active' | 'maintenance'

interface TransportRoute {
  _id: string
  routeName: string
  routeNumber: string
  busNumber: string
  busCapacity: number
  driver: Driver
  conductor: Conductor
  morningPickup: string
  afternoonDrop: string
  students: string[]    
  monthlyFee: number
  status: RouteStatus
  stops: Stop[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse{
  success: boolean
  count: number
  data: TransportRoute[]
  message?:string
}

interface FormState {
  routeName: string
  routeNumber: string
  busNumber: string
  busCapacity: string
  driver: Driver
  conductor: Conductor
  morningPickup: string
  afternoonDrop: string
  monthlyFee: string
  status: RouteStatus
  stops: string
}

interface Stat {
  label: string
  value: number
  color: string
  bg: string
  icon: string
}
const API_URL = 'https://edumanagebackend-1.onrender.com/api/v1/transport';

const EMPTY_FORM: FormState = {
  routeName:'',routeNumber:'',busNumber:'',busCapacity:'',
  driver:{name:'',phone:'',license:''},
  conductor:{name:'',phone:''},
  morningPickup:'',afternoonDrop:'',
  monthlyFee:'',status:'active',stops:'',
}

function parseStops(raw:string):Stop[]{
  return raw
    .split(',')
    .map((s):Stop =>{
      const parts   = s.trim().split('')
      const timeIdx = parts.findIndex(p => /^\d{1,2}:\d{2}/.test(p))
      const name    = timeIdx > -1 ? parts.slice(0, timeIdx).join(' ') : s.trim()
      const time    = timeIdx > -1 ? parts.slice(timeIdx).join(' ') : ''
      return {name,time,latitude:0,longitude:0}
    })
    .filter(s => s.name.length > 0)
}

export default function TransportPage(){
  const [routes,setRoutes]   = useState<TransportRoute[]>([])
  const [loading,setLoading] = useState<boolean>(true)
  const [error,setError]     = useState<string | null>(null)
  const [modal,setModal]     = useState<boolean>(false)
  const [saving,setSaving]   = useState<boolean>(false)
  const [form,setForm]       = useState<FormState>(EMPTY_FORM)

  const fetchRoutes = async ():Promise<void>=>{
    try {
      setLoading(true)
      setError(null)
      const res  = await fetch(API_URL)
      const json: ApiResponse = await res.json()
      if (!json.success) throw new Error('Failed to load routes')
      setRoutes(json.data)
    } catch (err){
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {fetchRoutes()},[])

  const handleAdd = async (): Promise<void>=>{
    if (!form.routeName.trim() || !form.busNumber.trim()) return
    const payload = {
      routeName:     form.routeName,
      routeNumber:   form.routeNumber,
      busNumber:     form.busNumber,
      busCapacity:   Number(form.busCapacity) || 0,
      driver:        form.driver,
      conductor:     form.conductor,
      morningPickup: form.morningPickup,
      afternoonDrop: form.afternoonDrop,
      monthlyFee:    Number(form.monthlyFee) || 0,
      status:        form.status,
      stops:         parseStops(form.stops),
    }
    try {
      setSaving(true)
      const res  = await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload),
      })
      const json: ApiResponse = await res.json()
      if (!json.success) throw new Error(json.message ?? 'Save failed')
      await fetchRoutes()
      closeModal()
    } catch (err){
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const setField = <K extends keyof FormState>(key:K,val:FormState[K]):void =>
  setForm(f =>({...f,[key]:val}))

  const setNested = <G extends 'driver' | 'conductor', K extends keyof FormState[G]>(
    group: G, key: K, val: FormState[G][K]
  ): void =>
  setForm(f => ({ ...f, [group]:{...f[group], [key]:val}}))

  const openModal  = (): void => { setForm(EMPTY_FORM); setModal(true)}

  const closeModal = (): void => setModal(false)

  const stats: Stat[] = [
    { label:'Total Routes',value: routes.length,color:'#1e3a5f',bg:'#e0e7ff',icon:'🚌'},
    { label:'Active',value: routes.filter(r => r.status === 'active').length,color:'#059669', bg:'#d1fae5', icon:'✅' },
    { label:'Maintenance',value: routes.filter(r => r.status === 'maintenance').length,  color:'#d97706', bg:'#fef3c7', icon:'🔧' },
    { label: 'Total Students', value: routes.reduce((a, r) => a + (r.students?.length ?? 0), 0), color:'#7c3aed', bg:'#ede9fe', icon:'👦'},
  ]
  return (
    <AppLayout title="Transport Management"  subtitle="Manage school bus routes and drivers">
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        {stats.map((s,i)=>(
          <div key={i} style={{background:s.bg,borderRadius:10,padding:'14px 20px',flex:1,minWidth:120,textAlign:'center'}}>
            <div style={{fontSize:22}}>{s.icon}</div>
            <div style={{fontSize:26,fontWeight:800,color:s.color,fontFamily:'Syne,sans-serif'}}>{s.value}</div>
            <div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <div style={{ flex:1 }}/>
        <button className="btn btn-primary" onClick={openModal}><Plus size={16}/> Add Route</button>
      </div>
      {loading && <p style={{ textAlign:'center', color:'#64748b', padding:40 }}>Loading routes…</p>}
      {error   && <p style={{ textAlign:'center', color:'#dc2626', padding:40 }}>⚠️ {error}</p>}
      {!loading && !error && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:18 }}>
          {routes.length === 0 && (
            <p style={{ color:'#94a3b8', gridColumn:'1/-1', textAlign:'center', padding:40 }}>
              No routes found. Add one!
            </p>
          )}
          {routes.map(r => (
            <div key={r._id} className="card" style={{overflow:'hidden'}}>
              <div style={{ height:5, background: r.status === 'active' ? '#059669' : '#d97706' }}/>
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                    <div style={{ width:44, height:44, background:'#e0e7ff', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Bus size={22} color="#1e3a5f" />
                    </div>
                    <div>
                      <h4 style={{ fontSize:14, marginBottom:2 }}>
                        {r.routeName}
                        <span style={{ color:'#94a3b8', fontWeight:400 }}> ({r.routeNumber})</span>
                      </h4>
                      <p style={{ fontSize:12, color:'#64748b' }}>Bus: {r.busNumber} · Capacity: {r.busCapacity}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${r.status === 'active' ? 'success' : 'warning'}`}>{r.status}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12, fontSize:13, color:'#475569' }}>
                  <div>
                    👨‍✈️ Driver: <strong>{r.driver?.name}</strong>
                    {r.driver?.phone && <span style={{ color:'#94a3b8' }}> · {r.driver.phone}</span>}
                  </div>
                  {r.conductor?.name && (
                    <div>
                      🎫 Conductor: <strong>{r.conductor.name}</strong>
                      {r.conductor?.phone && <span style={{ color:'#94a3b8' }}> · {r.conductor.phone}</span>}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:16 }}>
                    <span><Clock size={13} style={{ verticalAlign:'middle' }}/> 🌅 {r.morningPickup}</span>
                    <span><Clock size={13} style={{ verticalAlign:'middle' }}/> 🌇 {r.afternoonDrop}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center',gap:6}}>
                    <Users size={13}/> {r.students?.length ?? 0} Students enrolled
                    &nbsp;·&nbsp; 💰 ₹{r.monthlyFee}/mo
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11.5, fontWeight:700, color:'#94a3b8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    <MapPin size={12} style={{ display:'inline', marginRight:4 }}/>Stops
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {r.stops.map((s, j) => (
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ width:18, height:18, background:'#1e3a5f', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', fontWeight:700 }}>
                          {j + 1}
                        </span>
                        <span style={{ fontSize:12.5,color:'#475569'}}>
                          {s.name}{s.time ? ` (${s.time})` : ''}
                        </span>
                        {j < r.stops.length - 1 && <span style={{color:'#cbd5e1' }}>→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{maxWidth:560,width:'100%'}}>
            <div className="modal-header">
              <h3>🚌 Add New Route</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={closeModal}><X size={16}/></button>
            </div>
            <div className="modal-body" style={{ maxHeight:'65vh',overflowY:'auto'}}>
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn:'1/-1'}}>
                  <label className="form-label">Route Name *</label>
                  <input className="form-control" placeholder="e.g. City Route – North Zone"
                    value={form.routeName} onChange={e => setField('routeName', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Route Number</label>
                  <input className="form-control" placeholder="e.g. R101"
                    value={form.routeNumber} onChange={e => setField('routeNumber', e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Bus Number *</label>
                  <input className="form-control" placeholder="e.g. UP32AB1234"
                    value={form.busNumber} onChange={e => setField('busNumber', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Bus Capacity</label>
                  <input className="form-control" type="number" placeholder="50"
                    value={form.busCapacity} onChange={e => setField('busCapacity', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Fee (₹)</label>
                  <input className="form-control" type="number" placeholder="1500"
                    value={form.monthlyFee} onChange={e => setField('monthlyFee', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Morning Pickup</label>
                  <input className="form-control" placeholder="07:30 AM"
                    value={form.morningPickup} onChange={e => setField('morningPickup', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Afternoon Drop</label>
                  <input className="form-control" placeholder="03:00 PM"
                    value={form.afternoonDrop} onChange={e => setField('afternoonDrop', e.target.value)}/>
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Driver Name</label>
                  <input className="form-control" placeholder="Driver name"
                    value={form.driver.name} onChange={e => setNested('driver', 'name', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Phone</label>
                  <input className="form-control" placeholder="9876543210"
                    value={form.driver.phone} onChange={e => setNested('driver', 'phone', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Driver License</label>
                  <input className="form-control" placeholder="DL123456789"
                    value={form.driver.license} onChange={e => setNested('driver', 'license', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Conductor Name</label>
                  <input className="form-control" placeholder="Conductor name"
                    value={form.conductor.name} onChange={e => setNested('conductor', 'name', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Conductor Phone</label>
                  <input className="form-control" placeholder="9123456780"
                    value={form.conductor.phone} onChange={e => setNested('conductor', 'phone', e.target.value)}/>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status}
                    onChange={e => setField('status', e.target.value as RouteStatus)}>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Stops (comma-separated)</label>
                  <input className="form-control" placeholder="Stop 1 08:00 AM, Stop 2 08:30 AM"
                    value={form.stops} onChange={e => setField('stops', e.target.value)}/>
                  <small style={{ color:'#94a3b8' }}>Format: Stop Name HH:MM AM, … (time is optional)</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
                {saving ? 'Saving…' : 'Add Route'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}