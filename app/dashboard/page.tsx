'use client'
import AppLayout from '@/components/layout/AppLayout';
import {STUDENTS, TEACHERS, CLASSES, NOTICES, ATTENDANCE, FEES } from '@/lib/data';
import {Users,GraduationCap,BookOpen,ClipboardList,CreditCard,Bell,TrendingUp,AlertCircle} from 'lucide-react';
import Link from 'next/link'

const stats = [
  { label: 'Total Students',value: '248',  icon: '🎓', color: '#1e3a5f',bg:'#e0e7ff', change: '+12 this month',up: true },
  { label: 'Teachers',value: '24',   icon: '👩‍🏫', color: '#7c3aed', bg: '#ede9fe', change: '+2 this month',up: true },
  { label: 'Classes',value: '18',   icon: '📚', color: '#0891b2', bg: '#e0f2fe', change: 'All active',up: true },
  { label: 'Present Today',value: '221',  icon: '✅', color: '#059669', bg: '#d1fae5', change: '89.1% attendance',up: true },
  { label: 'Absent Today',value: '27',   icon: '❌', color: '#dc2626', bg: '#fee2e2', change: '10.9% absent',up: false },
  { label: 'Fee Pending',value: '₹2.4L',icon: '💰', color: '#d97706', bg: '#fef3c7', change: '38 students',up: false },
  { label: 'Notices',value: '4',    icon: '📢', color: '#db2777', bg: '#fce7f3', change: '2 urgent',up: false },
  { label: 'SMS Sent Today',value: '142',  icon: '📱', color: '#0284c7', bg: '#e0f2fe', change: '+28 alerts',up: true },
]

const recentActivity = [
  { icon: '🔴', text: 'Priya Patel marked ABSENT – SMS sent to parent',time: '8:46 AM', color: '#fee2e2' },
  { icon: '🔴', text: 'Kabir Khan marked ABSENT – SMS alert failed',time: '8:47 AM', color: '#fee2e2' },
  { icon: '📢', text: 'New notice: Annual Sports Day published',time: '9:00 AM', color: '#e0f2fe' },
  { icon: '💰', text: 'Fee received: Arjun Singh – ₹10,000',                  time: '10:15 AM', color: '#d1fae5' },
  { icon: '📱', text: 'Bulk SMS sent to Class 10 parents (PTM reminder)',      time: '10:30 AM', color: '#e0f2fe' },
  { icon: '✏️', text: 'Exam schedule added: Unit Test 1 – Class 10-A Math',   time: '11:00 AM', color: '#ede9fe' },
]

export default function Dashboard(){
  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back! Today is ${new Date().toDateString()}`}>
      <div className="stats-grid">
        {stats.map((s,i)=>(
          <div key={i} className="stat-card fade-in" style={{animationDelay:`${i * 0.05}s`}}>
            <div className="stat-icon" style={{background:s.bg}}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <h3 style={{ color: s.color }}>{s.value}</h3>
              <p>{s.label}</p>
              <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                {s.up ? '↑' : '↓'} {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{gap:20}}>
        <div className="card">
          <div className="card-header">
            <h3>📋 Recent Activity</h3>
            <span className="badge badge-info">Today</span>
          </div>
          <div className="card-body" style={{padding:'16px 24px'}}>
            <div className="timeline">
              {recentActivity.map((a,i)=>(
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{background:a.color,fontSize:16}}>{a.icon}</div>
                  <div className="timeline-content">
                    <h4>{a.text}</h4>
                    <p>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div className="card">
            <div className="card-header"><h3>⚡Quick Actions</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',gap:10}}>
                {[
                  { href: '/attendance', label: 'Mark Attendance', icon: '✅', color: '#059669', bg: '#d1fae5' },
                  { href: '/sms',        label: 'Send SMS',        icon: '📱', color: '#0284c7', bg: '#e0f2fe' },
                  { href: '/students',   label: 'Add Student',     icon: '➕', color: '#7c3aed', bg: '#ede9fe' },
                  { href: '/notices',    label: 'Post Notice',     icon: '📢', color: '#db2777', bg: '#fce7f3' },
                  { href: '/fees',       label: 'Collect Fee',     icon: '💰', color: '#d97706', bg: '#fef3c7' },
                  { href: '/exams',      label: 'Add Exam',        icon: '📝', color: '#1e3a5f', bg: '#e0e7ff' },
                ].map(a =>(
                  <Link key={a.href} href={a.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: a.bg, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: a.color }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>📢 Latest Notices</h3>
              <Link href="/notices" style={{fontSize: 12, color: '#1e3a5f', fontWeight: 600 }}>View all</Link>
            </div>
            <div className="card-body" style={{padding: '12px 24px' }}>
              {NOTICES.slice(0, 3).map(n =>(
                <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:'1px solid #f1f5f9'}}>
                  <span className={`badge badge-${n.priority === 'urgent' ? 'danger' : n.priority === 'high' ? 'warning' : 'info'}`} style={{ fontSize:10,whiteSpace:'nowrap'}}>
                    {n.priority}
                  </span>
                  <div>
                    <p style={{fontWeight:600,fontSize: 13 }}>{n.title}</p>
                    <p style={{fontSize:11.5,color: '#64748b' }}>{n.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 20 }} className="card">
        <div className="card-header">
          <h3>💰 Fee Collection Overview</h3>
          <Link href="/fees" className="btn btn-outline btn-sm">Manage Fees</Link>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',gap:16}}>
            {[
              { label: 'Total Collected',  value: '₹44,500', color: '#059669', bg: '#d1fae5'},
              { label: 'Pending',          value: '₹10,500', color: '#d97706', bg: '#fef3c7' },
              { label: 'Overdue',          value: '₹10,000', color: '#dc2626', bg: '#fee2e2' },
              { label: 'Collection Rate',  value: '68%',      color: '#1e3a5f', bg: '#e0e7ff' },
            ].map((f, i) => (
              <div key={i} style={{ background: f.bg, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: f.color, fontFamily: 'Syne, sans-serif' }}>{f.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{f.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
              <span>Collection Progress</span><span>68%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '68%', background: 'linear-gradient(90deg,#1e3a5f,#3b82f6)' }} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
