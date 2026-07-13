'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import type { Rol } from '@/lib/types'

interface DashboardShellProps {
  userName:  string
  email:     string
  rol:       Rol
  empresa:   string
  children:  React.ReactNode
}

export default function DashboardShell({ userName, email, rol, empresa, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex">
        <Sidebar userName={userName} email={email} rol={rol} empresa={empresa} />
      </div>

      {/* Columna derecha */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader
          userName={userName}
          rol={rol}
          empresa={empresa}
          open={mobileOpen}
          onToggle={() => setMobileOpen(v => !v)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  )
}
