'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { TIMETABLE } from '@/lib/data'

const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const PERIODS = ['Period 1\n8:00–8:45','Period 2\n8:45–9:30','Period 3\n9:45–10:30','Period 4\n10:30–11:15','Period 5\n11:30–12:15','Period 6\n12:15–1:00']

const SUBJECT_COLORS: Record<string, string> = {
  Math: '#e0e7ff', Science: '#d1fae5', English: '#fce7f3', Hindi: '#fef3c7',
  Social: '#e0f2fe', Computer: '#ede9fe', PE: '#d1fae5', Library: '#f1f5f9',
  Assembly: '#fef3c7', Activities: '#fce7f3', '—': '#f8fafc',
}

export default function TimetablePage() {
  const [cls, setCls] = useState('10-A')
  const timetable = TIMETABLE['10-A'] as Record<string, string[]>

  return (
    <AppLayout title="Timetable" subtitle="View weekly class schedules">

      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Class:</label>
          <select className="form-control" style={{ width: 'auto' }} value={cls} onChange={e => setCls(e.target.value)}>
            {['10-A','10-B','9-A','9-B','8-A','8-B'].map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <span className="badge badge-info" style={{ fontSize: 12 }}>📅 Current Week</span>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📅 Class {cls} — Weekly Timetable</h3>
        </div>
        <div style={{ overflowX: 'auto', padding: 20 }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ background: '#0f1e30', color: '#fff', padding: '10px 14px', borderRadius: 8, textAlign: 'left', fontSize: 12 }}>Day / Period</th>
                {PERIODS.map((p, i) => (
                  <th key={i} style={{ background: '#1e3a5f', color: '#fff', padding: '10px 12px', borderRadius: 8, textAlign: 'center', fontSize: 11, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td style={{ background: '#f0f4f8', fontWeight: 700, fontSize: 13, padding: '10px 14px', borderRadius: 8, color: '#1e3a5f', whiteSpace: 'nowrap' }}>
                    {day}
                  </td>
                  {(timetable[day] || []).map((subj, pi) => (
                    <td key={pi} style={{ padding: '8px', textAlign: 'center', borderRadius: 8, background: SUBJECT_COLORS[subj] || '#f8fafc', fontWeight: 600, fontSize: 12.5, color: '#1a202c' }}>
                      {subj}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>Legend:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(SUBJECT_COLORS).filter(([k]) => k !== '—').map(([subj, color]) => (
              <span key={subj} style={{ background: color, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{subj}</span>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
