'use client'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Rol } from '@/lib/types'

interface NavItem { href: string; label: string; icon: string; roles: Rol[] }

const navItems: NavItem[] = [
  { href: '/dashboard',          label: 'Inicio',      icon: '◇', roles: ['vendedor','gerente','admin_sabifin'] },
  { href: '/dashboard/ventas',   label: 'Ventas',      icon: '✦', roles: ['vendedor','gerente','admin_sabifin'] },
  { href: '/dashboard/stock',    label: 'Stock',       icon: '▦', roles: ['vendedor','gerente','admin_sabifin'] },
  { href: '/dashboard/transito', label: 'En tránsito', icon: '⇢', roles: ['vendedor','gerente','admin_sabifin'] },
  { href: '/dashboard/gastos',   label: 'Gastos',      icon: '▤', roles: ['gerente','admin_sabifin'] },
  { href: '/dashboard/balance',  label: 'Balance',     icon: '◎', roles: ['gerente','admin_sabifin'] },
]

interface MobileHeaderProps {
  userName:  string
  rol:       Rol
  empresa:   string
  open:      boolean
  onToggle:  () => void
}

export default function MobileHeader({ userName, rol, empresa, open, onToggle }: MobileHeaderProps) {
  const pathname = usePathname()
  const visible  = navItems.filter(i => i.roles.includes(rol))

  return (
    <>
      {/* Barra superior */}
      <header className="flex items-center justify-between px-4 py-3 lg:hidden sticky top-0 z-40"
        style={{ background: 'var(--color-bg-nav)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg" style={{ background: '#2e2c2b', width: 30, height: 30 }}>
            <span className="font-black text-xs leading-none" style={{ color: '#e8e3d8' }}>SF</span>
          </div>
          <span className="font-bold text-sm truncate max-w-[140px]" style={{ color: 'var(--color-brand-cream)' }}>
            {empresa}
          </span>
        </div>
        <button onClick={onToggle} className="flex flex-col gap-1.5 p-2 rounded-lg"
          style={{ color: 'var(--color-brand-cream)' }} aria-label="Menú">
          <span className="block w-5 h-0.5 transition-all duration-200" style={{ background: 'currentColor', transform: open ? 'rotate(45deg) translate(3px, 3px)' : 'none' }} />
          <span className="block w-5 h-0.5 transition-all duration-200" style={{ background: 'currentColor', opacity: open ? 0 : 1 }} />
          <span className="block w-5 h-0.5 transition-all duration-200" style={{ background: 'currentColor', transform: open ? 'rotate(-45deg) translate(3px, -3px)' : 'none' }} />
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onToggle} />
          <aside className="relative w-64 h-full flex flex-col z-10" style={{ background: 'var(--color-bg-nav)' }}>
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
              <div className="flex items-center justify-center rounded-lg shrink-0" style={{ background: '#2e2c2b', width: 36, height: 36 }}>
                <span className="font-black text-xs leading-none" style={{ color: '#e8e3d8' }}>SF</span>
              </div>
              <p className="text-sm font-bold leading-none truncate" style={{ color: 'var(--color-text-on-brand)' }}>{empresa}</p>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {visible.map(item => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href} onClick={onToggle}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                    style={{ background: isActive ? 'var(--color-bg-nav-active)' : 'transparent', color: isActive ? 'var(--color-brand-cream)' : 'rgba(245,240,232,0.65)' }}>
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="px-4 py-4 border-t border-white/10">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-on-brand)' }}>{userName}</p>
              <form action={logout} className="mt-2">
                <button type="submit" className="text-xs px-3 py-2 rounded-lg w-full text-left" style={{ color: 'rgba(245,240,232,0.6)' }}>
                  ↩ Cerrar sesión
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
