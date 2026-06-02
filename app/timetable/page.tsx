'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'

const CLASS_GROUPS = [
  {label: 'Pre-Primary', classes: ['NC', 'LKG', 'UKG']},
  {label: 'Primary (1–5)', classes: ['1-A','1-B','2-A','2-B','3-A','3-B','4-A','4-B','5-A','5-B']},
  {label: 'Middle (6–8)', classes: ['6-A','6-B','7-A','7-B','8-A','8-B']},
  {label: 'Secondary (9–10)', classes: ['9-A','9-B','10-A','10-B']},
]

const PERIODS_FULL = [
  'Period 1\n8:00–8:45',
  'Period 2\n8:45–9:30',
  'Period 3\n9:45–10:30',
  'Period 4\n10:30–11:15',
  'Period 5\n11:30–12:15',
  'Period 6\n12:15–1:00',
]

const PERIODS_SHORT = [
  'Period 1\n8:00–8:45',
  'Period 2\n8:45–9:30',
  'Period 3\n9:45–10:30',
  'Period 4\n10:30–11:15',
]

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const SUBJECT_COLORS: Record<string, string> = {
  Math:        '#e0e7ff',
  Science:     '#d1fae5',
  English:     '#fce7f3',
  Hindi:       '#fef3c7',
  Social:      '#e0f2fe',
  Computer:    '#ede9fe',
  PE:          '#dcfce7',
  Library:     '#f1f5f9',
  Assembly:    '#fef9c3',
  Activities:  '#fce7f3',
  Drawing:     '#ffedd5',
  Music:       '#f0fdf4',
  Dance:       '#fdf4ff',
  EVS:         '#ecfdf5',
  GK:          '#eff6ff',
  Rhymes:      '#fdf2f8',
  Stories:     '#fefce8',
  Play:        '#f0fdf4',
  'Moral Sc.': '#fff7ed',
  Sanskrit:    '#fef2f2',
  '—':         '#f8fafc',
}
type DaySchedule = Record<string, string[]>
const NC_TIMETABLE: DaySchedule = {
  Monday:    ['Rhymes','Drawing','Play','Stories'],
  Tuesday:   ['English','Play','Music','Activities'],
  Wednesday: ['Rhymes','Drawing','PE','Play'],
  Thursday:  ['Stories','Activities','Dance','Play'],
  Friday:    ['English','Music','Drawing','Activities'],
  Saturday:  ['Assembly','Play','Activities','—'],
}
const LKG_TIMETABLE: DaySchedule = {
  Monday:    ['English','Drawing','Play','Rhymes'],
  Tuesday:   ['Math','English','Music','Activities'],
  Wednesday: ['Hindi','Drawing','PE','Play'],
  Thursday:  ['English','Stories','Dance','Activities'],
  Friday:    ['Math','Music','Drawing','Hindi'],
  Saturday:  ['Assembly','GK','Activities','—'],
}
const UKG_TIMETABLE: DaySchedule = {
  Monday:    ['English','Math','Drawing','EVS'],
  Tuesday:   ['Math','Hindi','Music','Activities'],
  Wednesday: ['English','EVS','PE','Drawing'],
  Thursday:  ['Hindi','GK','Dance','Activities'],
  Friday:    ['Math','English','Drawing','Hindi'],
  Saturday:  ['Assembly','GK','Activities','—'],
}
const PRIMARY_TIMETABLE = (section: string): DaySchedule => ({
  Monday:    ['English','Math','Hindi','EVS','Drawing','PE'],
  Tuesday:   ['Math','English','Hindi','GK','Library','Activities'],
  Wednesday: ['Hindi','Math','English','EVS','Music','Computer'],
  Thursday:  ['English','Hindi','Math','GK','Dance','EVS'],
  Friday:    ['Math','English','Hindi','Drawing','PE','Activities'],
  Saturday:  ['Assembly','Hindi','English','Math','Activities','—'],
})

const MIDDLE_TIMETABLE = (section: string): DaySchedule => ({
  Monday:    ['Math','Science','English','Hindi','Social','Computer'],
  Tuesday:   ['English','Math','Science','Social','Hindi','PE'],
  Wednesday: ['Hindi','Science','Math','English','Computer','Library'],
  Thursday:  ['Social','English','Hindi','Math','Science','Activities'],
  Friday:    ['Math','Hindi','English','Science','PE','Social'],
  Saturday:  ['Assembly','Math','Hindi','English','Activities','—'],
})
const SECONDARY_TIMETABLE = (section: string): DaySchedule => ({
  Monday:    ['Math','Science','English','Hindi','Social','Computer'],
  Tuesday:   ['English','Math','Science','Sanskrit','Hindi','PE'],
  Wednesday: ['Hindi','Science','Math','English','Computer','Library'],
  Thursday:  ['Social','English','Sanskrit','Math','Science','Activities'],
  Friday:    ['Math','Hindi','English','Science','PE','Social'],
  Saturday:  ['Assembly','Math','Hindi','English','Activities','—'],
})
function resolveClass(cls: string): { timetable: DaySchedule; periods: string[] } {
  if (cls === 'NC')  return { timetable: NC_TIMETABLE,  periods: PERIODS_SHORT }
  if (cls === 'LKG') return { timetable: LKG_TIMETABLE, periods: PERIODS_SHORT }
  if (cls === 'UKG') return { timetable: UKG_TIMETABLE, periods: PERIODS_SHORT }
  const num = parseInt(cls.split('-')[0], 10)
  const sec = cls.split('-')[1] || 'A'
  if (num <= 5) return { timetable: PRIMARY_TIMETABLE(sec),   periods: PERIODS_FULL }
  if (num <= 8) return { timetable: MIDDLE_TIMETABLE(sec),    periods: PERIODS_FULL }
  return            { timetable: SECONDARY_TIMETABLE(sec), periods: PERIODS_FULL }
}
export default function TimetablePage() {
  const [cls, setCls] = useState('10-A')
  const { timetable, periods } = resolveClass(cls)

  return (
    <AppLayout title="Timetable" subtitle="View weekly class schedules">
      <div className="toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Class:</label>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={cls}
            onChange={e => setCls(e.target.value)}
          >
            {CLASS_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <span className="badge badge-info" style={{ fontSize: 12 }}>📅 Current Week</span>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>📅 Class {cls} — Weekly Timetable</h3>
        </div>
        <div style={{ overflowX: 'auto', padding: 20 }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px', minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{
                  background: '#0f1e30', color: '#fff',
                  padding: '10px 14px', borderRadius: 8,
                  textAlign: 'left', fontSize: 12
                }}>
                  Day / Period
                </th>
                {periods.map((p, i) => (
                  <th key={i} style={{
                    background: '#1e3a5f', color: '#fff',
                    padding: '10px 12px', borderRadius: 8,
                    textAlign: 'center', fontSize: 11,
                    whiteSpace: 'pre-line', lineHeight: 1.4
                  }}>
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td style={{
                    background: '#f0f4f8', fontWeight: 700, fontSize: 13,
                    padding: '10px 14px', borderRadius: 8,
                    color: '#1e3a5f', whiteSpace: 'nowrap'
                  }}>
                    {day}
                  </td>
                  {(timetable[day] || []).slice(0, periods.length).map((subj, pi) => (
                    <td key={pi} style={{
                      padding: '8px', textAlign: 'center', borderRadius: 8,
                      background: SUBJECT_COLORS[subj] || '#f8fafc',
                      fontWeight: 600, fontSize: 12.5, color: '#1a202c'
                    }}>
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
            {Object.entries(SUBJECT_COLORS)
              .filter(([k]) => k !== '—')
              .map(([subj, color]) => (
                <span key={subj} style={{
                  background: color, padding: '3px 10px',
                  borderRadius: 6, fontSize: 12, fontWeight: 600
                }}>
                  {subj}
                </span>
              ))
            }
          </div>
        </div>
      </div>
    </AppLayout>
  )
}