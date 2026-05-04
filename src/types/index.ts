export type EstadoPresupuesto = "borrador" | "enviado" | "aprobado" | "rechazado" | "vencido";

export type EstadoTrabajo =
  | "recibido"
  | "medicion"
  | "preparacion"
  | "corte"
  | "armado"
  | "control"
  | "listo"
  | "entregado"
  | "lavado"
  | "armado_dvh"
  | "sellado"
  | "terminado"
  | "pendiente"
  | "coordinado"
  | "en_camino"
  | "colocado"
  | "cerrado"
  | "cancelado";

export type RubroTrabajo = "pvc" | "vidrio";
export type FabricaAsignada = "pvc" | "vidrios";
export type TipoFabrica = RubroTrabajo;
export type PrioridadTrabajo = "normal" | "media" | "alta" | "urgente";
export type EstadoComercial = "consulta" | "presupuestado" | "aprobado" | "en_produccion" | "listo" | "entregado" | "cancelado";
export type AgendaTipo = "medicion" | "instalacion" | "entrega" | "retiro" | "reunion";
export type AgendaEstado = "pendiente" | "confirmado" | "realizado" | "cancelado";
export type MetodoPago = "efectivo" | "transferencia" | "cheque" | "tarjeta" | "mercado_pago" | "otro";
export type TipoMovimiento = "ingreso" | "egreso";
export type CategoriaCaja =
  | "cobro_cliente"
  | "sena"
  | "saldo_cobrado"
  | "gasto_operativo"
  | "gasto_materiales"
  | "pago_proveedor"
  | "otro";

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  url?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: "admin" | "vendedor" | "tecnico" | "fabrica";
  activo: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  whatsapp: string;
  email: string;
  direccion: string;
  localidad: string;
  cuit: string;
  observaciones: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresupuestoItem {
  id: string;
  descripcion: string;
  tipo: string;
  alto: number;
  ancho: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Presupuesto {
  id: string;
  clienteId: string;
  fecha: string;
  estado: EstadoPresupuesto;
  descuento: number;
  sena?: number;
  subtotal: number;
  total: number;
  senaSugerida: number;
  saldo: number;
  observaciones: string;
  items: PresupuestoItem[];
  trabajoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrabajoHistorialItem {
  id: string;
  estado: EstadoTrabajo;
  fecha: string;
  nota: string;
}

export interface Trabajo {
  id: string;
  clienteId: string;
  presupuestoId?: string;
  titulo: string;
  rubro: RubroTrabajo;
  fabricaAsignada: FabricaAsignada;
  descripcion: string;
  medidas: string;
  cantidad: number;
  colorMaterial: string;
  estadoComercial: EstadoComercial;
  estadoProduccion: EstadoTrabajo;
  prioridad: PrioridadTrabajo;
  fechaIngreso: string;
  fechaPrometida: string;
  total: number;
  sena: number;
  saldo: number;
  observacionesInternas: string;
  historial: TrabajoHistorialItem[];
  archivosAdjuntos: ArchivoAdjunto[];
  createdAt: string;
  updatedAt: string;
}

export interface AgendaEvento {
  id: string;
  tipo: AgendaTipo;
  estado: AgendaEstado;
  clienteId?: string;
  trabajoId?: string;
  fecha: string;
  hora: string;
  titulo: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pago {
  id: string;
  tipo: TipoMovimiento;
  concepto: string;
  categoria: CategoriaCaja;
  clienteId?: string;
  presupuestoId?: string;
  trabajoId?: string;
  fecha: string;
  monto: number;
  metodo: MetodoPago;
  observaciones: string;
  createdAt: string;
}

export interface CompanyConfig {
  nombre: string;
  subtitulo: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface DashboardStats {
  totalClientes: number;
  presupuestosPendientes: number;
  trabajosEnProduccion: number;
  trabajosAtrasados: number;
  trabajosListos: number;
  colocacionesProximas: number;
  saldoPendienteTotal: number;
  ingresosDelMes: number;
  egresosDelMes: number;
  saldoCaja: number;
}

export interface CrmDataSnapshot {
  clientes: Cliente[];
  presupuestos: Presupuesto[];
  trabajos: Trabajo[];
  agenda: AgendaEvento[];
  pagos: Pago[];
  usuarios: Usuario[];
  company: CompanyConfig;
}
