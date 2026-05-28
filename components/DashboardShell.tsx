'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'

interface DashboardShellProps {
  clientName: string
  email: string
  children: React.ReactNode
}

export default function DashboardShell({ clientName, email, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>

      {/* Sidebar — solo visible en desktop */}
      <div className="hidden lg:flex">
        <Sidebar clientName={clientName} email={email} />
      </div>

      {/* Columna derecha */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header móvil */}
        <MobileHeader
          clientName={clientName}
          open={mobileOpen}
          onToggle={() => setMobileOpen(v => !v)}
        />

        {/* Contenido con scroll */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  )
}
