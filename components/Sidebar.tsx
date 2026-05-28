'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

interface NavItem {
  href:  string
  label: string
  icon:  string
}

const navItems: NavItem[] = [
  { href: '/dashboard',              label: 'Inicio',       icon: '◇' },
  { href: '/dashboard/reportes',     label: 'Reportes',     icon: '▤' },
  { href: '/dashboard/ingresar',     label: 'Ingresar datos', icon: '✎' },
  { href: '/dashboard/alertas',      label: 'Alertas',      icon: '◉' },
]

interface SidebarProps {
  clientName: string
  email: string
}

export default function Sidebar({ clientName, email }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-full w-60 shrink-0"
      style={{ background: 'var(--color-bg-nav)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ background: '#2e2c2b', width: 36, height: 36 }}
        >
          <span
            className="font-black text-xs leading-none select-none"
            style={{ color: '#e8e3d8' }}
          >
            SF
          </span>
        </div>
        <div>
          <p className="text-sm font-bold text-text-on-brand leading-none">Sabifin</p>
          <p className="text-xs text-white/50 mt-0.5">Portal de Clientes</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: isActive ? 'var(--color-bg-nav-active)' : 'transparent',
                color: isActive ? 'var(--color-brand-cream)' : 'rgba(245,240,232,0.65)',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-nav-hover)'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="mb-3">
          <p className="text-sm font-semibold text-text-on-brand truncate">{clientName}</p>
          <p className="text-xs text-white/50 truncate">{email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'rgba(245,240,232,0.6)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-nav-hover)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--color-brand-cream)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(245,240,232,0.6)'
            }}
          >
            ↩ Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
