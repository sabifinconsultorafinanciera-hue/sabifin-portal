import LoginForm from '@/components/LoginForm'

export const metadata = {
  title: 'Iniciar sesión — Sabifin',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center rounded-xl mb-4"
            style={{
              background: '#2e2c2b',
              width: 80,
              height: 80,
            }}
          >
            <span
              className="font-black tracking-tight select-none"
              style={{
                color: '#e8e3d8',
                fontSize: '1.1rem',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              Sabi<br/>Fin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Sistema de Gestión</h1>
          <p className="text-sm text-text-secondary mt-1">Ingresá con tu cuenta Sabifin</p>
        </div>

        {/* Card del formulario */}
        <div className="card">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          ¿Problemas para ingresar?{' '}
          <a
            href="mailto:soporte@sabifin.com"
            className="text-brand-green font-medium hover:underline"
          >
            Contacta a Sabifin
          </a>
        </p>

      </div>
    </main>
  )
}
