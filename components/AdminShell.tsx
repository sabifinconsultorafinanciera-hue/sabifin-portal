'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/admin/clientes', label: 'Clientes', icon: '◈' },
]

interface Props {
  adminName: string
  children: React.ReactNode
}

function SidebarContent({ adminName, onLinkClick }: { adminName: string; onLinkClick?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-nav)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ background: '#2e2c2b', width: 36, height: 36 }}
        >
          <span className="font-black text-xs leading-none" style={{ color: '#e8e3d8' }}>SF</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-none" style={{ color: 'var(--color-text-on-brand)' }}>
            Sabifin
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.5)' }}>
            Panel Admin
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
              style={{
                background: isActive ? 'var(--color-bg-nav-active)' : 'transparent',
                color: isActive ? 'var(--color-brand-cream)' : 'rgba(245,240,232,0.65)',
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Admin info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Admin</p>
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-on-brand)' }}>
          {adminName}
        </p>
        <form action={logout} className="mt-2">
          <button
            type="submit"
            className="text-xs px-3 py-2 rounded-lg w-full text-left"
            style={{ color: 'rgba(245,240,232,0.6)' }}
          >
            ↩ Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminShell({ adminName, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-page)' }}>

      {/* Sidebar desktop */}
      <div className="hidden lg:flex w-56 shrink-0">
        <div className="w-full">
          <SidebarContent adminName={adminName} />
        </div>
      </div>

      {/* Columna derecha */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header móvil */}
        <header
          className="flex items-center justify-between px-4 py-3 lg:hidden sticky top-0 z-40"
          style={{ background: 'var(--color-bg-nav)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ background: '#2e2c2b', width: 30, height: 30 }}
            >
              <span className="font-black text-xs" style={{ color: '#e8e3d8' }}>SF</span>
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--color-brand-cream)' }}>Admin</span>
          </div>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="flex flex-col gap-1.5 p-2 rounded-lg"
            style={{ color: 'var(--color-brand-cream)' }}
            aria-label="Menú"
          >
            <span className="block w-5 h-0.5" style={{ background: 'currentColor', transform: mobileOpen ? 'rotate(45deg) translate(3px,3px)' : 'none', transition: 'transform 0.2s' }} />
            <span className="block w-5 h-0.5" style={{ background: 'currentColor', opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span className="block w-5 h-0.5" style={{ background: 'currentColor', transform: mobileOpen ? 'rotate(-45deg) translate(3px,-3px)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </header>

        {/* Drawer móvil */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
            <aside className="relative w-56 h-full z-10">
              <SidebarContent adminName={adminName} onLinkClick={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  )
}
