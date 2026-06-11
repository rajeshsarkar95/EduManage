'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'

const CLASS_GROUPS = [
  { label:'Pre-Primary',classes:['NC', 'LKG', 'UKG']},
  { label:'Primary (1–5)',classes:['1-A','1-B','2-A','2-B','3-A','3-B','4-A','4-B','5-A','5-B']},
  { label:'Middle (6–8)',classes:['6-A','6-B','7-A','7-B','8-A','8-B']},
  { label:'Secondary (9–10)',classes:['9-A','9-B','10-A','10-B']},
]

const PERIODS_PRE = [
  'Prayer\n8:30–9:00',
  'Period 1\n9:00–9:35',
  'Period 2\n9:35–10:10',
  'Period 3\n10:30–11:05',
  'Period 4\n11:05–11:40',
  'Rhymes+Story\n11:40–12:30',
]

const PERIODS_FULL = [
  'Prayer\n8:00–8:30',
  'Period 1\n8:30–9:15',
  'Period 2\n9:15–10:00',
  'Period 3\n10:00–10:45',
  'Period 4\n10:45–11:30',
  'Lunch\n11:30–11:50',
  'Period 5\n11:50–12:30',
  'Period 6\n12:30–1:10',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SUBJECT_COLORS: Record<string,string> = {
  'Prayer':              '#fef9c3',
  'Hindi':               '#fef3c7',
  'Hindi Writing Book':  '#fde68a',
  'Eng':                 '#fce7f3',
  'Eng Writing Book':    '#fbcfe8',
  'Math':                '#e0e7ff',
  'EVS':                 '#d1fae5',
  'G.K.':                '#e0f2fe',
  'Lunch':               '#f1f5f9',
  'Urdu/Sanskrit':       '#ede9fe',
  'Con':                 '#fff7ed',
  'Drawing':             '#ffedd5',
  'Hindi NB':            '#fef3c7',
  'English NB':          '#fce7f3',
  'Math NB':             '#e0e7ff',
  'English Reading':     '#e0f2fe',
  'Hindi Reading':       '#fde8d8',
  'Math Reading':        '#dbeafe',
  'Game Activity':       '#dcfce7',
  'Picture Dict.':       '#ede9fe',
  'Table Book':          '#fff7ed',
  'Writing':             '#f1f5f9',
  'Activity':            '#fce7f3',
  'Rhymes':              '#fdf2f8',
  'Science':             '#d1fae5',
  'English':             '#fce7f3',
  'Social':              '#e0f2fe',
  'Computer':            '#ede9fe',
  'PE':                  '#dcfce7',
  'Library':             '#f1f5f9',
  'Assembly':            '#fef9c3',
  'Activities':          '#fce7f3',
  'Music':               '#f0fdf4',
  'Dance':               '#fdf4ff',
  'GK':                  '#eff6ff',
  'Moral Sc.':           '#fff7ed',
  'Sanskrit':            '#fef2f2',
  '—':                   '#f8fafc',
}

type DaySchedule = Record<string,string[]>

const NC_TIMETABLE: DaySchedule = {
  Monday:    ['Prayer', 'Hindi NB',    'English NB', 'Math NB',      'Activity',        '—'],
  Tuesday:   ['Prayer', 'Hindi NB',    'English NB', 'Math NB',      'Hindi Reading',   '—'],
  Wednesday: ['Prayer', 'Hindi NB',    'English NB', 'Math NB',      'Math Reading',    'Game Activity'],
  Thursday:  ['Prayer', 'Hindi NB',    'English NB', 'Math Reading', 'Rhymes',          '—'],
  Friday:    ['Prayer', 'Drawing',     'Rhymes',     '—',            '—',               '—'],
  Saturday:  ['Prayer', 'Hindi NB',    'English NB', 'Math NB',      'Writing',         'Activity'],
}

const LKG_TIMETABLE: DaySchedule = {
  Monday:    ['Prayer', 'Hindi NB','English NB','Math NB','English Reading', 'Activity'],
  Tuesday:   ['Prayer', 'Hindi NB','English NB','Math NB','Hindi Reading',   '—'],
  Wednesday: ['Prayer', 'Hindi NB','English NB','Math NB','Math Reading',    'Game Activity'],
  Thursday:  ['Prayer', 'Hindi NB','English NB','Math Reading', 'Rhymes',          '—'],
  Friday:    ['Prayer', 'Drawing','Picture Dict.','Game Activity','—',               '—'],
  Saturday:  ['Prayer', 'Hindi NB','English NB',   'Math NB',      'Writing',         'Rhymes'],
}

const UKG_TIMETABLE: DaySchedule = {
  Monday:    ['Prayer', 'Hindi NB',    'English NB',   'Math NB',      'English Reading', 'Activity'],
  Tuesday:   ['Prayer', 'Hindi NB',    'English NB',   'Math NB',      'Hindi Reading',   '—'],
  Wednesday: ['Prayer', 'Hindi NB',    'English NB',   'Math NB',      'Game Activity',   'Rhymes'],
  Thursday:  ['Prayer', 'Hindi NB',    'English NB',   'Math Reading', 'Rhymes',          '—'],
  Friday:    ['Prayer', 'Drawing',     'Picture Dict.','Game Activity','—',               '—'],
  Saturday:  ['Prayer', 'Hindi NB',    'English NB',   'Math NB',      'Table Book',      'Rhymes'],
}

// Class 1 timetable from image (8 slots: Prayer, P1–P4, Lunch, P5, P6)
const CLASS1_TIMETABLE: DaySchedule = {
  Monday:    ['Prayer', 'Hindi',              'Eng',             'Math', 'EVS',   'Lunch', 'Urdu/Sanskrit', 'Con'],
  Tuesday:   ['Prayer', 'Hindi',              'Eng',             'Math', 'EVS',   'Lunch', 'Urdu/Sanskrit', 'Con'],
  Wednesday: ['Prayer', 'Hindi',              'Eng',             'Math', 'EVS',   'Lunch', 'Urdu/Sanskrit', 'Con'],
  Thursday:  ['Prayer', 'Hindi',              'Eng',             'Math', 'G.K.',  'Lunch', 'Urdu/Sanskrit', 'Con'],
  Friday:    ['Prayer', 'Hindi Writing Book', 'Eng Writing Book','Math', 'G.K.',  'Lunch', 'Urdu/Sanskrit', 'Con'],
  Saturday:  ['Prayer', 'Hindi',              'Eng',             'Math', 'G.K.',  'Lunch', 'Urdu/Sanskrit', 'Drawing'],
}

const PRIMARY_TIMETABLE = (cls: string): DaySchedule => {
  // Class 1 both sections use the same timetable from image
  if (cls === '1-A' || cls === '1-B') return CLASS1_TIMETABLE
  return {
    Monday:    ['Prayer', 'English',  'Math',    'Hindi',   'EVS',        'Lunch', 'Drawing',    'PE'],
    Tuesday:   ['Prayer', 'Math',     'English', 'Hindi',   'G.K.',       'Lunch', 'Library',    'Activities'],
    Wednesday: ['Prayer', 'Hindi',    'Math',    'English', 'EVS',        'Lunch', 'Music',      'Computer'],
    Thursday:  ['Prayer', 'English',  'Hindi',   'Math',    'G.K.',       'Lunch', 'Dance',      'EVS'],
    Friday:    ['Prayer', 'Math',     'English', 'Hindi',   'Drawing',    'Lunch', 'PE',         'Activities'],
    Saturday:  ['Prayer', 'Assembly', 'Hindi',   'English', 'Math',       'Lunch', 'Activities', '—'],
  }
}

const MIDDLE_TIMETABLE = (_section: string): DaySchedule => ({
  Monday:    ['Prayer', 'Math',     'Science', 'English', 'Hindi',      'Lunch', 'Social',     'Computer'],
  Tuesday:   ['Prayer', 'English',  'Math',    'Science', 'Social',     'Lunch', 'Hindi',      'PE'],
  Wednesday: ['Prayer', 'Hindi',    'Science', 'Math',    'English',    'Lunch', 'Computer',   'Library'],
  Thursday:  ['Prayer', 'Social',   'English', 'Hindi',   'Math',       'Lunch', 'Science',    'Activities'],
  Friday:    ['Prayer', 'Math',     'Hindi',   'English', 'Science',    'Lunch', 'PE',         'Social'],
  Saturday:  ['Prayer', 'Assembly', 'Math',    'Hindi',   'English',    'Lunch', 'Activities', '—'],
})

const SECONDARY_TIMETABLE = (_section: string): DaySchedule => ({
  Monday:    ['Prayer', 'Math',     'Science',  'English', 'Hindi',      'Lunch', 'Social',     'Computer'],
  Tuesday:   ['Prayer', 'English',  'Math',     'Science', 'Sanskrit',   'Lunch', 'Hindi',      'PE'],
  Wednesday: ['Prayer', 'Hindi',    'Science',  'Math',    'English',    'Lunch', 'Computer',   'Library'],
  Thursday:  ['Prayer', 'Social',   'English',  'Sanskrit','Math',       'Lunch', 'Science',    'Activities'],
  Friday:    ['Prayer', 'Math',     'Hindi',    'English', 'Science',    'Lunch', 'PE',         'Social'],
  Saturday:  ['Prayer', 'Assembly', 'Math',     'Hindi',   'English',    'Lunch', 'Activities', '—'],
})

function resolveClass(cls: string): {timetable: DaySchedule; periods: string[]} {
  if (cls === 'NC')  return { timetable: NC_TIMETABLE,  periods: PERIODS_PRE }
  if (cls === 'LKG') return { timetable: LKG_TIMETABLE, periods: PERIODS_PRE }
  if (cls === 'UKG') return { timetable: UKG_TIMETABLE, periods: PERIODS_PRE }
  const num = parseInt(cls.split('-')[0], 10)
  if (num <= 5) return { timetable: PRIMARY_TIMETABLE(cls),   periods: PERIODS_FULL }
  if (num <= 8) return { timetable: MIDDLE_TIMETABLE(cls),    periods: PERIODS_FULL }
  return             { timetable: SECONDARY_TIMETABLE(cls), periods: PERIODS_FULL }
}

export default function TimetablePage(){
  const [cls, setCls] = useState('1-A')
  const { timetable, periods } = resolveClass(cls)
  const isPrePrimary = ['NC', 'LKG', 'UKG'].includes(cls)
  const isClass1 = cls === '1-A' || cls === '1-B'

  return (
    <AppLayout title="Timetable" subtitle="View weekly class schedules">
      <div className="toolbar">
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <label className="form-label" style={{marginBottom:0}}>Class:</label>
          <select
            className="form-control"
            style={{width:'auto'}}
            value={cls}
            onChange={e => setCls(e.target.value)}
          >
            {CLASS_GROUPS.map(group =>(
              <optgroup key={group.label} label={group.label}>
                {group.classes.map(c =>(
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8}}>
          {isPrePrimary && (
            <span className="badge badge-warning" style={{fontSize:12}}>
              🕗 8:30 AM – 12:30 PM
            </span>
          )}
          {!isPrePrimary && (
            <span className="badge badge-info" style={{fontSize:12}}>
              🕗 8:00 AM – 1:10 PM
            </span>
          )}
          <span className="badge badge-info" style={{ fontSize:12}}>📅 Academic Year 2026-27</span>
        </div>
      </div>
      {isPrePrimary && (
        <div style={{
          background:'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          borderRadius:12,padding:'12px 20px',marginBottom:16,
          display:'flex',alignItems:'center',gap:10,
        }}>
          <span style={{fontSize:20}}>🏫</span>
          <div>
            <div style={{ color: '#fff',fontWeight:700,fontSize:15}}>
              A.R. Public School Bhikaripur — {cls} Weekly Timetable
            </div>
            <div style={{ color: '#93c5fd', fontSize: 12 }}>
              School Time: 8:30 AM to 12:30 PM &nbsp;|&nbsp; Lunch Break: 10:10 – 10:30 AM
            </div>
          </div>
        </div>
      )}

      {!isPrePrimary && (
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          borderRadius: 12, padding: '12px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🏫</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
              A.R. Public School Bhikaripur — Class {cls} Weekly Timetable
            </div>
            <div style={{ color: '#93c5fd', fontSize: 12 }}>
              School Time: 8:00 AM to 1:10 PM &nbsp;|&nbsp; Lunch Break: 11:30 – 11:50 AM &nbsp;|&nbsp; Academic Year 2026-27
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>📅 Class {cls} — Weekly Timetable</h3>
        </div>
        <div style={{ overflowX: 'auto', padding: 20 }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{
                  background: '#0f1e30', color: '#fff',
                  padding: '10px 14px', borderRadius: 8,
                  textAlign: 'left', fontSize: 12,
                }}>
                  Day / Period
                </th>
                {periods.map((p, i) => (
                  <th key={i} style={{
                    background: p.startsWith('Lunch') ? '#374151' : '#1e3a5f',
                    color: '#fff',
                    padding: '10px 12px', borderRadius: 8,
                    textAlign: 'center', fontSize: 11,
                    whiteSpace: 'pre-line', lineHeight: 1.4,
                    minWidth: 80,
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
                    color: '#1e3a5f', whiteSpace: 'nowrap',
                  }}>
                    {day}
                  </td>
                  {(timetable[day] || []).slice(0, periods.length).map((subj, pi) => (
                    <td key={pi} style={{
                      padding: '8px', textAlign: 'center', borderRadius: 8,
                      background: subj === 'Lunch'
                        ? '#e2e8f0'
                        : (SUBJECT_COLORS[subj] || '#f8fafc'),
                      fontWeight: subj === 'Lunch' ? 700 : 600,
                      fontSize: 12, color: subj === 'Lunch' ? '#475569' : '#1a202c',
                      whiteSpace: 'nowrap',
                      fontStyle: subj === 'Lunch' ? 'italic' : 'normal',
                    }}>
                      {subj === '—' ? (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      ) : subj}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isClass1 && (
          <div style={{
            margin: '0 20px 12px',
            background: '#fef9c3', borderRadius: 8,
            padding: '8px 14px', fontSize: 12,
            color: '#92400e', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            📝 Note: Con = Conversation &nbsp;|&nbsp; Fri: Writing Book work &nbsp;|&nbsp; All Days 5th Period: Urdu/Sanskrit &nbsp;|&nbsp; Thu/Fri/Sat 4th: G.K. &nbsp;|&nbsp; Sat 6th: Drawing
          </div>
        )}

        {isPrePrimary && (
          <div style={{
            margin: '0 20px 12px',
            background: '#fef9c3', borderRadius: 8,
            padding: '8px 14px', fontSize: 12,
            color: '#92400e', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🍱 Lunch Break: 10:10 AM – 10:30 AM (between Period 2 and Period 3)
          </div>
        )}

        <div style={{ padding: '0 20px 20px' }}>
          <div style={{fontSize:12,color:'#64748b',marginBottom: 8, fontWeight: 600 }}>
            Legend:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Array.from(
              new Set(
                DAYS.flatMap(d => timetable[d] || []).filter(s => s !== '—' && s !== 'Lunch')
              )
            ).map(subj => (
              <span key={subj} style={{
                background: SUBJECT_COLORS[subj] || '#f8fafc',
                padding: '3px 10px', borderRadius: 6,
                fontSize: 12, fontWeight: 600,
              }}>
                {subj}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}