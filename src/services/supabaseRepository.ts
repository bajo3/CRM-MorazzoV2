import { isSupabaseEnabled, supabase } from "../lib/supabase";
import type {
  AgendaEvento,
  CategoriaCaja,
  Cliente,
  CrmDataSnapshot,
  MetodoPago,
  Pago,
  Presupuesto,
  PresupuestoItem,
  TipoMovimiento,
  Trabajo,
  TrabajoHistorialItem,
  ArchivoAdjunto,
  Usuario,
} from "../types";
import { defaultCompanyConfig } from "../lib/company";
import { normalizeFactory, normalizeRubroTrabajo } from "../lib/workflow";
import type { CrmRepository } from "./crmRepository";
import { normalizeSnapshot } from "./crmRepository";

interface SupabaseSetup {
  isEnabled: boolean;
  repository: CrmRepository;
}

// ── Mappers DB → TypeScript ──────────────────────────────────────────────────

function toCliente(row: Record<string, unknown>): Cliente {
  return {
    id: row.id as string,
    nombre: (row.nombre as string) || "",
    telefono: (row.telefono as string) || "",
    whatsapp: (row.whatsapp as string) || "",
    email: (row.email as string) || "",
    direccion: (row.direccion as string) || "",
    localidad: (row.localidad as string) || "",
    cuit: (row.cuit as string) || "",
    observaciones: (row.observaciones as string) || "",
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function fromCliente(c: Cliente) {
  return {
    id: c.id,
    nombre: c.nombre,
    telefono: c.telefono || null,
    whatsapp: c.whatsapp || null,
    email: c.email || null,
    direccion: c.direccion || null,
    localidad: c.localidad || null,
    cuit: c.cuit || null,
    observaciones: c.observaciones || null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function toPresupuesto(row: Record<string, unknown>): Presupuesto {
  const sena = row.sena ?? row.senia ?? row.seña ?? 0;
  return {
    id: row.id as string,
    clienteId: (row.client_id as string) || "",
    fecha: (row.fecha as string) || "",
    estado: (row.estado as Presupuesto["estado"]) || "borrador",
    descuento: Number(row.descuento) || 0,
    sena: Number(sena) || 0,
    subtotal: 0,
    total: 0,
    senaSugerida: 0,
    saldo: 0,
    observaciones: (row.observaciones as string) || "",
    items: (row.items as PresupuestoItem[]) || [],
    trabajoId: (row.trabajo_id as string) || undefined,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function fromPresupuesto(p: Presupuesto) {
  return {
    id: p.id,
    client_id: p.clienteId || null,
    fecha: p.fecha || null,
    estado: p.estado,
    descuento: p.descuento,
    sena: p.sena || 0,
    observaciones: p.observaciones || null,
    items: p.items,
    trabajo_id: p.trabajoId || null,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function toTrabajo(row: Record<string, unknown>): Trabajo {
  const rubro = normalizeRubroTrabajo(row.rubro);
  const fabricaAsignada = normalizeFactory(row.fabrica_asignada, rubro);
  return {
    id: row.id as string,
    clienteId: (row.client_id as string) || "",
    presupuestoId: (row.quote_id as string) || undefined,
    titulo: (row.titulo as string) || "",
    rubro,
    fabricaAsignada,
    descripcion: (row.descripcion as string) || "",
    medidas: (row.medidas as string) || "",
    cantidad: Number(row.cantidad) || 1,
    colorMaterial: (row.color_material as string) || "",
    estadoComercial: (row.estado_comercial as Trabajo["estadoComercial"]) || "aprobado",
    estadoProduccion: (row.estado_produccion as Trabajo["estadoProduccion"]) || "recibido",
    prioridad: (row.prioridad as Trabajo["prioridad"]) || "normal",
    fechaIngreso: (row.fecha_ingreso as string) || "",
    fechaPrometida: (row.fecha_prometida as string) || "",
    total: Number(row.total) || 0,
    sena: Number(row.sena) || 0,
    saldo: Number(row.saldo) || 0,
    observacionesInternas: (row.observaciones_internas as string) || "",
    historial: (row.historial as TrabajoHistorialItem[]) || [],
    archivosAdjuntos: (row.archivos_adjuntos as ArchivoAdjunto[]) || [],
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function fromTrabajo(t: Trabajo) {
  const rubro = normalizeRubroTrabajo(t.rubro);
  const fabricaAsignada = normalizeFactory(t.fabricaAsignada, rubro);
  return {
    id: t.id,
    client_id: t.clienteId || null,
    quote_id: t.presupuestoId || null,
    titulo: t.titulo,
    rubro,
    fabrica_asignada: fabricaAsignada,
    descripcion: t.descripcion || null,
    medidas: t.medidas || null,
    cantidad: t.cantidad,
    color_material: t.colorMaterial || null,
    estado_comercial: t.estadoComercial,
    estado_produccion: t.estadoProduccion,
    prioridad: t.prioridad,
    fecha_ingreso: t.fechaIngreso || null,
    fecha_prometida: t.fechaPrometida || null,
    total: t.total,
    sena: t.sena,
    saldo: t.saldo,
    observaciones_internas: t.observacionesInternas || null,
    historial: t.historial,
    archivos_adjuntos: t.archivosAdjuntos,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function toAgenda(row: Record<string, unknown>): AgendaEvento {
  return {
    id: row.id as string,
    tipo: (row.tipo as AgendaEvento["tipo"]) || "reunion",
    estado: (row.estado as AgendaEvento["estado"]) || "pendiente",
    clienteId: (row.client_id as string) || undefined,
    trabajoId: (row.job_id as string) || undefined,
    fecha: (row.fecha as string) || "",
    hora: (row.hora as string) || "",
    titulo: (row.titulo as string) || "",
    descripcion: (row.descripcion as string) || "",
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  };
}

function fromAgenda(a: AgendaEvento) {
  return {
    id: a.id,
    tipo: a.tipo,
    estado: a.estado,
    client_id: a.clienteId || null,
    job_id: a.trabajoId || null,
    fecha: a.fecha || null,
    hora: a.hora || null,
    titulo: a.titulo,
    descripcion: a.descripcion || null,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function toPago(row: Record<string, unknown>): Pago {
  return {
    id: row.id as string,
    tipo: ((row.tipo as string) || "ingreso") as TipoMovimiento,
    concepto: (row.concepto as string) || "",
    categoria: ((row.categoria as string) || "cobro_cliente") as CategoriaCaja,
    clienteId: (row.client_id as string) || undefined,
    presupuestoId: (row.quote_id as string) || undefined,
    trabajoId: (row.job_id as string) || undefined,
    fecha: (row.fecha as string) || "",
    monto: Number(row.monto) || 0,
    metodo: ((row.metodo as string) || "transferencia") as MetodoPago,
    observaciones: (row.observaciones as string) || "",
    createdAt: (row.created_at as string) || new Date().toISOString(),
  };
}

function fromPago(p: Pago) {
  return {
    id: p.id,
    tipo: p.tipo || "ingreso",
    concepto: p.concepto || "",
    categoria: p.categoria || "cobro_cliente",
    client_id: p.clienteId || null,
    quote_id: p.presupuestoId || null,
    job_id: p.trabajoId || null,
    fecha: p.fecha,
    monto: p.monto,
    metodo: p.metodo,
    observaciones: p.observaciones || null,
    created_at: p.createdAt,
  };
}

function toUsuario(row: Record<string, unknown>): Usuario {
  return {
    id: row.id as string,
    nombre: (row.nombre as string) || "",
    rol: (row.rol as Usuario["rol"]) || "vendedor",
    activo: Boolean(row.activo),
  };
}

function fromUsuario(u: Usuario) {
  return { id: u.id, nombre: u.nombre, rol: u.rol, activo: u.activo };
}

// ── Sync helper: upsert + delete removed items ───────────────────────────────

const isMissingSenaColumn = (error: { message?: string; code?: string } | null): boolean =>
  Boolean(
    error &&
      (error.code === "PGRST204" || error.message?.toLowerCase().includes("schema cache")) &&
      error.message?.toLowerCase().includes("sena"),
  );

const missingSenaMessage =
  "No se pudo guardar presupuestos porque Supabase no reconoce la columna 'sena'. Aplica docs/migrations/2026-05-04_add_presupuestos_sena_and_rubros.sql y refresca el schema cache de PostgREST/Supabase.";

async function syncTable<T extends { id: string }>(
  table: string,
  items: T[],
  mapper: (item: T) => object,
) {
  if (!supabase) return;

  const { data: existing, error: selectError } = await supabase.from(table).select("id");
  if (selectError) {
    throw new Error(`No se pudo leer ${table}: ${selectError.message}`);
  }
  const currentIds = new Set(items.map((i) => i.id));
  const toDelete = (existing || [])
    .map((r: Record<string, unknown>) => r.id as string)
    .filter((id) => !currentIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await supabase.from(table).delete().in("id", toDelete);
    if (error) {
      throw new Error(`No se pudo borrar en ${table}: ${error.message}`);
    }
  }
  if (items.length > 0) {
    const rows = items.map(mapper);
    const { error } = await supabase.from(table).upsert(rows);
    if (table === "presupuestos" && isMissingSenaColumn(error)) {
      throw new Error(missingSenaMessage);
    }
    if (error) {
      throw new Error(`No se pudo guardar ${table}: ${error.message}`);
    }
  }
}

// ── Repository ───────────────────────────────────────────────────────────────

const buildSupabaseRepository = (): CrmRepository => ({
  async getSnapshot(): Promise<CrmDataSnapshot> {
    if (!supabase) throw new Error("Supabase client not initialized");

    const [
      { data: clientes, error: eC },
      { data: presupuestos, error: eP },
      { data: trabajos, error: eT },
      { data: agenda, error: eA },
      { data: pagos, error: ePag },
      { data: usuarios, error: eU },
    ] = await Promise.all([
      supabase.from("clientes").select("*"),
      supabase.from("presupuestos").select("*"),
      supabase.from("trabajos").select("*"),
      supabase.from("agenda_eventos").select("*"),
      supabase.from("pagos").select("*"),
      supabase.from("usuarios").select("*"),
    ]);

    const errors = [eC, eP, eT, eA, ePag, eU].filter(Boolean);
    if (errors.length > 0) {
      throw new Error(`No se pudo cargar Supabase: ${errors.map((e) => e?.message).join(", ")}`);
    }

    const snapshot: CrmDataSnapshot = {
      company: defaultCompanyConfig,
      clientes: (clientes || []).map(toCliente),
      presupuestos: (presupuestos || []).map(toPresupuesto),
      trabajos: (trabajos || []).map(toTrabajo),
      agenda: (agenda || []).map(toAgenda),
      pagos: (pagos || []).map(toPago),
      usuarios: (usuarios || []).map(toUsuario),
    };

    return normalizeSnapshot(snapshot);
  },

  async saveSnapshot(snapshot: CrmDataSnapshot): Promise<CrmDataSnapshot> {
    if (!supabase) throw new Error("Supabase client not initialized");

    // Sync each table (upsert new/changed + delete removed)
    // Order matters: clientes first (referenced by others)
    await syncTable("clientes", snapshot.clientes, fromCliente);
    await syncTable("presupuestos", snapshot.presupuestos, fromPresupuesto);
    await syncTable("trabajos", snapshot.trabajos, fromTrabajo);
    await syncTable("agenda_eventos", snapshot.agenda, fromAgenda);
    await syncTable("pagos", snapshot.pagos, fromPago);
    await syncTable("usuarios", snapshot.usuarios, fromUsuario);

    return snapshot;
  },
});

export const createSupabaseRepository = (): SupabaseSetup => ({
  isEnabled: isSupabaseEnabled,
  repository: isSupabaseEnabled ? buildSupabaseRepository() : (null as unknown as CrmRepository),
});
