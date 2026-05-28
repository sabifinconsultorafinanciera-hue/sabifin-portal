import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default:  'Sabifin — Portal de Clientes',
    template: '%s — Sabifin',
  },
  description: 'Accedé a tus informes financieros, registrá movimientos y gestioná tu información desde cualquier dispositivo.',
  robots:      { index: false, follow: false },
  icons: {
    icon: '/icon',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  )
}
