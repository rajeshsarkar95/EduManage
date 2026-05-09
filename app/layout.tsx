import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EduManage – School Management System',
  description: 'Complete School Management System with SMS Integration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
