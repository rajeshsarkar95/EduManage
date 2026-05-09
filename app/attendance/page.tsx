'use client'
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {STUDENTS} from '@/lib/data';
import {Save,Send} from 'lucide-react';

type Status = 'present' | 'absent' | 'late';

export default function AttendancePage(){
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [date,setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved,setSaved] = useState(false);
  const classStudents = STUDENTS.filter(s => s.class === selectedClass);
  const [attendance, setAttendance] = useState<Record<number, Status>>(()=>
    Object.fromEntries(classStudents.map(s => [s.id, 'present' as Status]))
  )
  const setStatus = (id:number,status:Status)=>{
    setAttendance(prev =>({...prev,[id]:status}));
    setSaved(false);
  }
  
  const handleClassChange = (cls:string) =>{
    setSelectedClass(cls);
    setSaved(false);
    const newStudents = STUDENTS.filter(s => s.class === cls);
    setAttendance(Object.fromEntries(newStudents.map(s => [s.id,'present' as Status])));
  }
  const counts = {
    present: Object.values(attendance).filter(v => v === 'present').length,
    absent:  Object.values(attendance).filter(v => v === 'absent').length,
    late:    Object.values(attendance).filter(v => v === 'late').length,
  }
  const absentStudents = STUDENTS.filter(s => attendance[s.id] === 'absent' && s.class === selectedClass)
  const handleSave =()=>{
    setSaved(true);
    alert(`✅ Attendance saved!\nSMS sent to ${absentStudents.length} parent(s) for absent students.`)
  }
  const classes = ['10-A','10-B','9-A','9-B','8-A','8-B','7-A','7-B']
  const students = STUDENTS.filter(s => s.class === selectedClass);

  return (
    <AppLayout title="Attendance" subtitle="Mark daily class attendance">
      <div className="card" style={{marginBottom:20}}>
        <div className="card-body">
          <div className="grid-2" style={{ alignItems:'end'}}>
            <div className="form-group" style={{ marginBottom:0}}>
              <label className="form-label">Select Class</label>
              <select className="form-control" value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={date} onChange={e => setDate(e.target.value)}/>
            </div>
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:14,marginBottom:20}}>
        {[
          { label:'Present',value:counts.present,color:'#059669',bg:'#d1fae5'},
          { label:'Absent',value:counts.absent,color:'#dc2626',bg:'#fee2e2'},
          { label: 'Late',value: counts.late,color: '#d97706', bg: '#fef3c7'},
          { label: 'Total',value: students.length,color: '#1e3a5f', bg: '#e0e7ff'},
        ].map((c,i)=>(
          <div key={i} style={{background:c.bg,borderRadius:10,padding:'12px 24px',textAlign:'center', flex:1}}>
            <div style={{fontSize:28,fontWeight:800,color:c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}</div>
            <div style={{fontSize:12,color:'#64748b'}}>{c.label}</div>
          </div>
        ))}
        <div style={{background:'#f0f4f8',borderRadius:10,padding:'12px 24px', textAlign: 'center', flex:1}}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed', fontFamily: 'Syne, sans-serif' }}>
            {students.length ? Math.round((counts.present / students.length) * 100) : 0}%
          </div>
          <div style={{fontSize:12,color:'#64748b'}}>Attendance %</div>
        </div>
      </div>
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header">
          <h3>📋 Class {selectedClass} — {date}</h3>
          <div style={{ display:'flex',gap:8 }}>
            <button className="btn btn-outline btn-sm" onClick={()=>{
              const all: Record<number,Status> = {}
              students.forEach(s => all[s.id] = 'present');
              setAttendance(all); setSaved(false);
            }}>✅ All Present</button>
          </div>
        </div>
        <div className="card-body">
          <div className="attendance-grid">
            {students.map((s, i) => {
              const status = attendance[s.id] || 'present'
              return (
                <div key={s.id} className={`attendance-item ${status}`}>
                  <div className="student-name">{s.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{s.roll}</div>
                  <div className="attendance-toggle">
                    <button className={status === 'present' ? 'active-p' : ''} onClick={() => setStatus(s.id, 'present')}>P</button>
                    <button className={status === 'absent'  ? 'active-a' : ''} onClick={() => setStatus(s.id, 'absent')}>A</button>
                    <button className={status === 'late'    ? 'active-l' : ''} onClick={() => setStatus(s.id, 'late')}>L</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {counts.absent > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <h4 style={{ color: '#dc2626', marginBottom: 10, fontSize: 14 }}>
            🔴 {counts.absent} Absent Student(s) — SMS will be sent to parents
          </h4>
          <div style={{ display:'flex',flexWrap:'wrap',gap: 8 }}>
            {absentStudents.map(s => (
              <div key={s.id} style={{ background: '#fee2e2', borderRadius: 8, padding: '6px 12px', fontSize: 12.5 }}>
                <strong>{s.name}</strong> → {s.guardian} ({s.phone})
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display:'flex',justifyContent: 'flex-end',gap: 12 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saved}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Attendance & Send SMS'}
        </button>
      </div>
    </AppLayout>
  )
}
