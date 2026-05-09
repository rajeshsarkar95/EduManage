'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardList, Bell, MessageSquare, LogIn,
  FileText, CreditCard, Calendar, LibraryBig,
  Bus, Trophy, Settings, LogOut
} from 'lucide-react'

const NAV = [
  { label: 'MAIN', items: [
    { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'PEOPLE', items: [
    { href: '/students',   icon: Users,           label: 'Students',      badge: '248' },
    { href: '/teachers',   icon: GraduationCap,   label: 'Teachers' },
  ]},
  { label: 'ACADEMICS', items: [
    { href: '/classes',    icon: BookOpen,         label: 'Classes & Subjects' },
    { href: '/timetable',  icon: Calendar,         label: 'Timetable' },
    { href: '/exams',      icon: Trophy,           label: 'Exams & Results' },
  ]},
  { label: 'OPERATIONS', items: [
    { href: '/attendance', icon: ClipboardList,    label: 'Attendance' },
    { href: '/fees',       icon: CreditCard,       label: 'Fee Management' },
    { href: '/library',    icon: LibraryBig,       label: 'Library' },
    { href: '/transport',  icon: Bus,              label: 'Transport' },
  ]},
  { label: 'COMMUNICATION', items: [
    { href: '/notices',    icon: Bell,             label: 'Notices',       badge: '4' },
    { href: '/sms',        icon: MessageSquare,    label: 'SMS System' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏫</div>
        <div className="logo-text">
          <h2>EduManage</h2>
          <span>School Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon
              const active = path === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={`nav-link${active ? ' active' : ''}`}>
                  <Icon className="nav-icon" />
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}

        <div style={{ height: 16 }} />
        <Link href="/settings" className="nav-link">
          <Settings className="nav-icon" /> Settings
        </Link>
        <Link href="/login" className="nav-link" style={{ color: '#f87171' }}>
          <LogOut className="nav-icon" /> Logout
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <h4>Admin User</h4>
            <p>Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
