'use client'
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

interface Exam {
  _id: string;
  name: string;
  class: string;
  subject: string;
  examDate: string;
  totalMarks: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface DashboardData {
  students: {
    total: number;
    presentToday: number;
    absentToday: number;
  };
  teachers: {
    total: number;
  };
  classes: {
    total: number;
  };
  fees: {
    totalAmount: number;
    paidAmount: number;
    pendingCount: number;
    collectionPct: number;
  };
  notices: {
    total: number;
  };
  sms: {
    sentToday: number;
  };
  upcomingExams: Exam[];
}

interface ApiResponse {
  success: boolean;
  data: DashboardData;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bg: string;
  change: string;
  up: boolean;
}

interface ActivityItem {
  icon: string;
  text: string;
  time: string;
  color: string;
}

interface QuickAction {
  href: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

interface FeeSummaryItem {
  label: string;
  value: string;
  color: string;
  bg: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { icon: '🔴', text: 'Priya Patel marked ABSENT – SMS sent to parent',    time: '8:46 AM',  color: '#fee2e2' },
  { icon: '🔴', text: 'Kabir Khan marked ABSENT – SMS alert failed',        time: '8:47 AM',  color: '#fee2e2' },
  { icon: '📢', text: 'New notice: Annual Sports Day published',             time: '9:00 AM',  color: '#e0f2fe' },
  { icon: '💰', text: 'Fee received: Arjun Singh – ₹10,000',                time: '10:15 AM', color: '#d1fae5' },
  { icon: '📱', text: 'Bulk SMS sent to Class 10 parents (PTM reminder)',    time: '10:30 AM', color: '#e0f2fe' },
  { icon: '✏️', text: 'Exam schedule added: Unit Test 1 – Class 10-A Math', time: '11:00 AM', color: '#ede9fe' },
];

const QUICK_ACTIONS: QuickAction[] = [
  { href: '/attendance', label: 'Mark Attendance', icon: '✅', color: '#059669', bg: '#d1fae5' },
  { href: '/sms',        label: 'Send SMS',        icon: '📱', color: '#0284c7', bg: '#e0f2fe' },
  { href: '/students',   label: 'Add Student',     icon: '➕', color: '#7c3aed', bg: '#ede9fe' },
  { href: '/notices',    label: 'Post Notice',     icon: '📢', color: '#db2777', bg: '#fce7f3' },
  { href: '/fees',       label: 'Collect Fee',     icon: '💰', color: '#d97706', bg: '#fef3c7' },
  { href: '/exams',      label: 'Add Exam',        icon: '📝', color: '#1e3a5f', bg: '#e0e7ff' },
];

function formatINR(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000)   return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount}`;
}

function deduplicateExams(exams: Exam[]): Exam[] {
  const seen = new Map<string, Exam>();
  for (const exam of exams) {
    const key = `${exam.name}-${exam.class}-${exam.subject}-${exam.examDate}`;
    if (!seen.has(key)) seen.set(key, exam);
  }
  return Array.from(seen.values());
}

export default function Dashboard() {
  const [dashData, setDashData]   = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/dashboard')
      .then<ApiResponse>(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.success) setDashData(json.data);
        else setError('Server returned an unsuccessful response.');
      })
      .catch((err: Error) => setError(`Could not reach the server: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const students      = dashData?.students    ?? { total: 0, presentToday: 0, absentToday: 0 };
  const teachers      = dashData?.teachers    ?? { total: 0 };
  const classes       = dashData?.classes     ?? { total: 0 };
  const fees          = dashData?.fees        ?? { totalAmount: 0, paidAmount: 0, pendingCount: 0, collectionPct: 0 };
  const notices       = dashData?.notices     ?? { total: 0 };
  const sms           = dashData?.sms         ?? { sentToday: 0 };
  const upcomingExams = dashData?.upcomingExams ?? [];

  const pendingFees   = fees.totalAmount - fees.paidAmount;
  const attendancePct = students.total > 0
    ? ((students.presentToday / students.total) * 100).toFixed(1)
    : '0.0';
  const absentPct = students.total > 0
    ? ((students.absentToday  / students.total) * 100).toFixed(1)
    : '0.0';

  const stats: StatCard[] = [
    { label: 'Total Students', value: students.total,      icon: '🎓', color: '#1e3a5f', bg: '#e0e7ff', change: 'Enrolled',                   up: true  },
    { label: 'Teachers',       value: teachers.total,      icon: '👩‍🏫', color: '#7c3aed', bg: '#ede9fe', change: 'On staff',                    up: true  },
    { label: 'Classes',        value: classes.total,       icon: '📚', color: '#0891b2', bg: '#e0f2fe', change: 'All active',                   up: true  },
    { label: 'Present Today',  value: students.presentToday, icon: '✅', color: '#059669', bg: '#d1fae5', change: `${attendancePct}% attendance`, up: true  },
    { label: 'Absent Today',   value: students.absentToday,  icon: '❌', color: '#dc2626', bg: '#fee2e2', change: `${absentPct}% absent`,         up: false },
    { label: 'Fee Pending',    value: formatINR(pendingFees), icon: '💰', color: '#d97706', bg: '#fef3c7', change: `${fees.pendingCount} students`, up: false },
    { label: 'Notices',        value: notices.total,        icon: '📢', color: '#db2777', bg: '#fce7f3', change: 'Published',                   up: false },
    { label: 'SMS Sent Today', value: sms.sentToday,        icon: '📱', color: '#0284c7', bg: '#e0f2fe', change: 'Alerts sent',                  up: true  },
  ];

  const feeSummary: FeeSummaryItem[] = [
    { label: 'Total Collected', value: formatINR(fees.paidAmount),  color: '#059669', bg: '#d1fae5' },
    { label: 'Pending',         value: formatINR(pendingFees),       color: '#d97706', bg: '#fef3c7' },
    { label: 'Overdue',         value: '₹0',                         color: '#dc2626', bg: '#fee2e2' },
    { label: 'Collection Rate', value: `${fees.collectionPct}%`,     color: '#1e3a5f', bg: '#e0e7ff' },
  ];

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back! Today is ${new Date().toDateString()}`}>
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          ⚠️ {error} — showing default / cached data.
        </div>
      )}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="stat-card" style={{ background: '#f1f5f9', minHeight: 90, opacity: 0.6 }} />
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="stat-icon" style={{ background: s.bg }}>
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
      )}
      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3>📋 Recent Activity</h3>
            <span className="badge badge-info">Today</span>
          </div>
          <div className="card-body" style={{ padding: '16px 24px' }}>
            <div className="timeline">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{ background: a.color, fontSize: 16 }}>{a.icon}</div>
                  <div className="timeline-content">
                    <h4>{a.text}</h4>
                    <p>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header"><h3>⚡ Quick Actions</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.href} href={a.href}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: a.bg, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: a.color }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>📝 Upcoming Exams</h3>
              <Link href="/exams" style={{ fontSize: 12, color: '#1e3a5f', fontWeight: 600 }}>View all</Link>
            </div>
            <div className="card-body" style={{ padding: '12px 24px' }}>
              {loading ? (
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>Loading…</p>
              ) : deduplicateExams(upcomingExams).length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>No upcoming exams</p>
              ) : (
                deduplicateExams(upcomingExams).map((exam) => (
                  <div key={exam._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span className="badge badge-info" style={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                      Class {exam.class}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{exam.name} – {exam.subject}</p>
                      <p style={{ fontSize: 11.5, color: '#64748b' }}>
                        {new Date(exam.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{exam.totalMarks} marks
                      </p>
                    </div>
                  </div>
                ))
              )}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {feeSummary.map((f, i) => (
              <div key={i} style={{ background: f.bg, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: f.color, fontFamily: 'Syne, sans-serif' }}>{f.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{f.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
              <span>Collection Progress</span>
              <span>{fees.collectionPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${fees.collectionPct}%`, background: 'linear-gradient(90deg,#1e3a5f,#3b82f6)' }} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}