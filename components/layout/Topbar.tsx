'use client'
import { Bell, Search, Settings } from 'lucide-react'

interface TopbarProps {
  title: string
  subtitle?: string
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <button className="topbar-btn notif-dot" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="topbar-btn" title="Settings">
          <Settings size={18} />
        </button>
        <div className="user-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a5f,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          A
        </div>
      </div>
    </header>
  )
}
