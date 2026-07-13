/**
 * setup-demo.mjs — Seed inicial del ERP Sabifin
 *
 * Crea en Firestore:
 *  - 1 empresa demo
 *  - 2 usuarios (gerente + vendedor) en Firebase Auth + Firestore
 *  - 5 productos de ejemplo
 *  - 3 ventas de ejemplo
 *  - 2 gastos de ejemplo
 *  - 1 tránsito activo de ejemplo
 *
 * Uso:
 *   node scripts/setup-demo.mjs
 *
 * Requiere .env.local con las variables de Firebase Admin.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Leer .env.local manualmente
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')

function parseEnv(content) {
  const vars = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let value = trimmed.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    vars[key] = value
  }
  return vars
}

const env = parseEnv(envContent)

const PROJECT_ID    = env.FIREBASE_PROJECT_ID
const CLIENT_EMAIL  = env.FIREBASE_CLIENT_EMAIL
const PRIVATE_KEY   = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error('❌ Faltan variables de entorno de Firebase Admin en .env.local')
  process.exit(1)
}

// Importar Firebase Admin dinámicamente
const { initializeApp, cert, getApps } = await import('firebase-admin/app')
const { getFirestore }  = await import('firebase-admin/firestore')
const { getAuth }       = await import('firebase-admin/auth')

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId: PROJECT_ID, clientEmail: CLIENT_EMAIL, privateKey: PRIVATE_KEY }) })
}

const db   = getFirestore()
const auth = getAuth()

// ════════════════════════════════════════════════
// EMPRESA DEMO
// ════════════════════════════════════════════════

console.log('🏢 Creando empresa demo...')
const empresaRef = db.collection('empresas').doc()
const empresaId  = empresaRef.id

await empresaRef.set({
  id:        empresaId,
  nombre:    'Demo Textiles SA',
  industria: 'textil',
  activa:    true,
  creadaEn:  new Date().toISOString(),
})
console.log(`   ✓ Empresa: ${empresaId}`)

// ════════════════════════════════════════════════
// USUARIOS
// ════════════════════════════════════════════════

console.log('👤 Creando usuarios...')

async function crearUsuario(email, password, nombre, rol) {
  let uid
  try {
    const existing = await auth.getUserByEmail(email)
    uid = existing.uid
    console.log(`   ℹ️  Usuario ${email} ya existe, reutilizando.`)
  } catch {
    const record = await auth.createUser({ email, password, displayName: nombre })
    uid = record.uid
    console.log(`   ✓ Auth creado: ${email}`)
  }

  await db.collection('usuarios').doc(uid).set({
    uid, email, nombre, rol, empresaId, activo: true,
    creadoEn: new Date().toISOString(),
  })
  return uid
}

const gerenteUid  = await crearUsuario('gerente@demo.com',  'demo1234', 'María García', 'gerente')
const vendedorUid = await crearUsuario('vendedor@demo.com', 'demo1234', 'Carlos López', 'vendedor')

// ════════════════════════════════════════════════
// PRODUCTOS
// ════════════════════════════════════════════════

console.log('📦 Creando productos...')

const productos = [
  { nombre: 'Remera algodón M',  sku: 'REM-ALG-M',  categoria: 'Remeras',  stockActual: 150, stockMinimo: 20, precioCompra: 2500,  precioVenta: 5500,  unidad: 'unidad' },
  { nombre: 'Remera algodón L',  sku: 'REM-ALG-L',  categoria: 'Remeras',  stockActual: 120, stockMinimo: 20, precioCompra: 2500,  precioVenta: 5500,  unidad: 'unidad' },
  { nombre: 'Jean slim 32',      sku: 'JEA-SL-32',  categoria: 'Pantalones', stockActual: 8,  stockMinimo: 15, precioCompra: 8000,  precioVenta: 18000, unidad: 'unidad' },
  { nombre: 'Buzo canguro XL',   sku: 'BUZ-CAN-XL', categoria: 'Buzos',    stockActual: 45, stockMinimo: 10, precioCompra: 5000,  precioVenta: 11000, unidad: 'unidad' },
  { nombre: 'Tela denim (metro)', sku: 'TEL-DEN-M',  categoria: 'Telas',    stockActual: 0,  stockMinimo: 50, precioCompra: 1200,  precioVenta: 2000,  unidad: 'm' },
]

const prodRefs = []
for (const p of productos) {
  const ref = db.collection('empresas').doc(empresaId).collection('productos').doc()
  await ref.set({ id: ref.id, ...p, activo: true, creadoEn: new Date().toISOString() })
  prodRefs.push({ id: ref.id, ...p })
  console.log(`   ✓ ${p.nombre}`)
}

// ════════════════════════════════════════════════
// VENTAS
// ════════════════════════════════════════════════

console.log('💰 Creando ventas...')

const hoy   = new Date()
const fecha = (d) => {
  const dt = new Date(hoy)
  dt.setDate(dt.getDate() - d)
  return dt.toISOString().slice(0, 10)
}

const ventas = [
  {
    fecha: fecha(0), clienteNombre: 'Boutique Sol',
    items: [
      { productoId: prodRefs[0].id, productoNombre: prodRefs[0].nombre, cantidad: 10, precioUnitario: 5500, subtotal: 55000 },
      { productoId: prodRefs[3].id, productoNombre: prodRefs[3].nombre, cantidad: 5,  precioUnitario: 11000, subtotal: 55000 },
    ],
    total: 110000, estado: 'confirmada', notas: 'Entrega en local',
  },
  {
    fecha: fecha(2), clienteNombre: 'Moda Express',
    items: [
      { productoId: prodRefs[1].id, productoNombre: prodRefs[1].nombre, cantidad: 20, precioUnitario: 5500, subtotal: 110000 },
    ],
    total: 110000, estado: 'entregada', notas: '',
  },
  {
    fecha: fecha(5), clienteNombre: 'Trendy Store',
    items: [
      { productoId: prodRefs[0].id, productoNombre: prodRefs[0].nombre, cantidad: 5, precioUnitario: 5500, subtotal: 27500 },
      { productoId: prodRefs[2].id, productoNombre: prodRefs[2].nombre, cantidad: 3, precioUnitario: 18000, subtotal: 54000 },
    ],
    total: 81500, estado: 'pendiente', notas: 'Pago 30 días',
  },
]

for (const v of ventas) {
  const ref = db.collection('empresas').doc(empresaId).collection('ventas').doc()
  await ref.set({
    id: ref.id, ...v,
    vendedorId: vendedorUid, vendedorNombre: 'Carlos López',
    creadaEn: new Date().toISOString(),
  })
  console.log(`   ✓ Venta → ${v.clienteNombre} ($${v.total.toLocaleString()})`)
}

// ════════════════════════════════════════════════
// GASTOS
// ════════════════════════════════════════════════

console.log('💸 Creando gastos...')

const gastos = [
  { fecha: fecha(10), categoria: 'alquiler',  descripcion: 'Alquiler depósito', monto: 85000 },
  { fecha: fecha(8),  categoria: 'sueldos',   descripcion: 'Sueldos julio',     monto: 420000 },
  { fecha: fecha(3),  categoria: 'servicios', descripcion: 'Electricidad',       monto: 12500 },
]

for (const g of gastos) {
  const ref = db.collection('empresas').doc(empresaId).collection('gastos').doc()
  await ref.set({
    id: ref.id, ...g,
    registradoPor: 'María García',
    creadoEn: new Date().toISOString(),
  })
  console.log(`   ✓ Gasto → ${g.descripcion} ($${g.monto.toLocaleString()})`)
}

// ════════════════════════════════════════════════
// TRÁNSITO
// ════════════════════════════════════════════════

console.log('🚢 Creando tránsito...')

const fechaEst = new Date(hoy)
fechaEst.setDate(fechaEst.getDate() + 21)

const transitoRef = db.collection('empresas').doc(empresaId).collection('transito').doc()
await transitoRef.set({
  id:             transitoRef.id,
  tipo:           'fabricacion',
  proveedor:      'Fábrica Norte SRL',
  descripcion:    'Producción temporada invierno',
  items: [
    { productoNombre: 'Remera algodón varios colores', cantidad: 500, unidad: 'unidad' },
    { productoNombre: 'Buzo canguro varios talles',    cantidad: 200, unidad: 'unidad' },
  ],
  estado:         'en_produccion',
  fechaEstimada:  fechaEst.toISOString().slice(0, 10),
  notas:          'Confirmar colores antes del día 15',
  creadoEn:       new Date().toISOString(),
  actualizadoEn:  new Date().toISOString(),
})
console.log('   ✓ Tránsito → Fábrica Norte SRL (en producción)')

// ════════════════════════════════════════════════
// RESUMEN
// ════════════════════════════════════════════════

console.log('\n✅ Setup demo completado exitosamente!')
console.log('\n📋 Datos de acceso:')
console.log('   Empresa: Demo Textiles SA')
console.log('   Gerente: gerente@demo.com / demo1234')
console.log('   Vendedor: vendedor@demo.com / demo1234')
console.log('\n💡 Para crear el admin Sabifin, creá un usuario en Firebase Auth')
console.log('   y guardá su UID en la colección "admins/{uid}" con { isAdmin: true }')
console.log('\n🌐 Portal: https://sabifin-portal.vercel.app')

process.exit(0)
