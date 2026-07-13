// ============================================================
// SABIFIN ERP — Tipos TypeScript globales
// ============================================================

// ── Sesión ────────────────────────────────────────────────
export interface SessionPayload {
  userId:    string
  email:     string
  userName:  string
  empresaId: string | null   // null para admins Sabifin
  rol:       Rol
  isAdmin:   boolean
  expiresAt: Date
}

export type Rol = 'vendedor' | 'gerente' | 'admin_sabifin'

// ── Empresa ───────────────────────────────────────────────
export type Industria = 'textil' | 'importador' | 'repuestos' | 'otro'

export interface Empresa {
  id:        string
  nombre:    string
  industria: Industria
  activa:    boolean
  creadaEn:  string
}

// ── Usuario (dentro de una empresa) ───────────────────────
export interface Usuario {
  uid:       string
  email:     string
  nombre:    string
  rol:       'vendedor' | 'gerente'
  empresaId: string
  activo:    boolean
  creadoEn:  string
}

// ── Producto / Stock ──────────────────────────────────────
export type UnidadMedida = 'unidad' | 'kg' | 'm' | 'm2' | 'caja' | 'rollo' | 'par'

export interface Producto {
  id:           string
  nombre:       string
  sku:          string
  categoria:    string
  stockActual:  number
  stockMinimo:  number
  precioCompra: number
  precioVenta:  number
  unidad:       UnidadMedida
  activo:       boolean
  creadoEn:     string
}

// ── Venta ─────────────────────────────────────────────────
export type EstadoVenta = 'pendiente' | 'confirmada' | 'entregada' | 'cancelada'

export interface ItemVenta {
  productoId:     string
  productoNombre: string
  cantidad:       number
  precioUnitario: number
  subtotal:       number
}

export interface Venta {
  id:              string
  fecha:           string
  clienteNombre:   string
  items:           ItemVenta[]
  total:           number
  vendedorId:      string
  vendedorNombre:  string
  estado:          EstadoVenta
  notas:           string
  creadaEn:        string
}

// ── Gasto ─────────────────────────────────────────────────
export type CategoriaGasto =
  | 'sueldos' | 'alquiler' | 'servicios' | 'logistica'
  | 'marketing' | 'impuestos' | 'compras' | 'otros'

export interface Gasto {
  id:              string
  fecha:           string
  categoria:       CategoriaGasto
  descripcion:     string
  monto:           number
  registradoPor:   string
  creadoEn:        string
}

// ── Tránsito ──────────────────────────────────────────────
export type TipoTransito = 'fabricacion' | 'importacion' | 'compra'
export type EstadoTransito =
  | 'en_produccion' | 'listo_embarque' | 'en_transito'
  | 'en_aduana' | 'en_deposito' | 'recibido'

export interface ItemTransito {
  productoNombre: string
  cantidad:       number
  unidad:         UnidadMedida
}

export interface Transito {
  id:               string
  tipo:             TipoTransito
  proveedor:        string
  descripcion:      string
  items:            ItemTransito[]
  estado:           EstadoTransito
  fechaEstimada:    string
  notas:            string
  creadoEn:         string
  actualizadoEn:    string
}

// ── KPIs del dashboard ────────────────────────────────────
export interface DashboardKpis {
  ventasHoy:        number
  ventasMes:        number
  cantVentasMes:    number
  gastosMes:        number
  margenMes:        number
  productosConStock: number
  productosSinStock: number
  transitoActivo:   number
}

// ── Legacy (portal Google Sheets — se eliminará en v2) ────
export interface SheetRow { [key: string]: string | number | null }
export interface SheetData { headers: string[]; rows: SheetRow[]; lastUpdated: string }
export interface ClientConfig { uid: string; email: string; clientName: string; sheetId: string; sheetName?: string }
export interface AlertConfig {
  id: string; clientId: string; column: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'changed'
  threshold?: number; email: string; active: boolean
  createdAt?: string; lastSentAt?: string; lastValue?: number
}

