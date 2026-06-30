import { roundMoney } from "../lib/money";
import { activeProductionStates, archivedProductionStates, ensureEstadoForFactory, normalizeFactory, normalizeRubroTrabajo } from "../lib/workflow";
import type { Cliente, CrmDataSnapshot, DashboardStats, Pago, Presupuesto, Trabajo } from "../types";
import { createSheetsCrmRepository } from "./sheetsCrmRepository";

export interface CrmRepository {
  getSnapshot(): Promise<CrmDataSnapshot>;
  saveSnapshot(snapshot: CrmDataSnapshot): Promise<CrmDataSnapshot>;
}

const today = () => new Date().toISOString().split("T")[0];
const currentMonth = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

const sumPayments = (pagos: Pago[], filter: (pago: Pago) => boolean): number =>
  roundMoney(
    pagos
      .filter(filter)
      .filter((p) => !p.tipo || p.tipo === "ingreso")
      .reduce((sum, pago) => sum + pago.monto, 0),
  );

const itemSubtotal = (item: Presupuesto["items"][number]): number =>
  roundMoney(item.cantidad * item.precioUnitario);

const hydratePresupuesto = (presupuesto: Presupuesto, pagos: Pago[]): Presupuesto => {
  const subtotal = roundMoney(
    presupuesto.items.reduce((sum, item) => sum + itemSubtotal(item), 0),
  );
  const descuento = Math.max(Number(presupuesto.descuento) || 0, 0);
  const descuentoMonto = descuento <= 100 ? roundMoney(subtotal * (descuento / 100)) : descuento;
  const total = roundMoney(Math.max(subtotal - descuentoMonto, 0));
  const paid = sumPayments(
    pagos,
    (pago) =>
      pago.presupuestoId === presupuesto.id ||
      Boolean(presupuesto.trabajoId && pago.trabajoId === presupuesto.trabajoId),
  );
  return {
    ...presupuesto,
    items: presupuesto.items.map((item) => ({ ...item, subtotal: itemSubtotal(item) })),
    descuento,
    subtotal,
    total,
    sena: roundMoney(Math.max(presupuesto.sena || 0, 0)),
    senaSugerida: roundMoney(Math.max(presupuesto.sena || total * 0.5, 0)),
    saldo: roundMoney(Math.max(total - paid, 0)),
  };
};

const hydrateTrabajo = (trabajo: Trabajo, pagos: Pago[], presupuestos: Presupuesto[]): Trabajo => {
  const baseTotal = trabajo.presupuestoId
    ? presupuestos.find((item) => item.id === trabajo.presupuestoId)?.total ?? trabajo.total
    : trabajo.total;
  const paid = sumPayments(
    pagos,
    (pago) => pago.trabajoId === trabajo.id || Boolean(trabajo.presupuestoId && pago.presupuestoId === trabajo.presupuestoId),
  );
  const paidAsSena = sumPayments(
    pagos,
    (pago) =>
      pago.categoria === "sena" &&
      (pago.trabajoId === trabajo.id || Boolean(trabajo.presupuestoId && pago.presupuestoId === trabajo.presupuestoId)),
  );
  const sena = roundMoney(Math.max(trabajo.sena, paidAsSena));
  const manualSenaCredit = roundMoney(Math.max(sena - paidAsSena, 0));
  const rubro = normalizeRubroTrabajo(trabajo.rubro);
  const fabricaAsignada = normalizeFactory(trabajo.fabricaAsignada, rubro);
  const estadoProduccion = ensureEstadoForFactory(fabricaAsignada, trabajo.estadoProduccion);
  return {
    ...trabajo,
    rubro,
    fabricaAsignada,
    estadoProduccion,
    total: roundMoney(baseTotal),
    sena,
    saldo: roundMoney(Math.max(baseTotal - paid - manualSenaCredit, 0)),
  };
};

const hydrateCliente = (
  cliente: Cliente,
  presupuestos: Presupuesto[],
  trabajos: Trabajo[],
  pagos: Pago[],
): Cliente => {
  const presupuestoIds = presupuestos.filter((item) => item.clienteId === cliente.id).map((item) => item.id);
  const trabajoIds = trabajos.filter((item) => item.clienteId === cliente.id).map((item) => item.id);
  void sumPayments(
    pagos,
    (pago) =>
      pago.clienteId === cliente.id ||
      presupuestoIds.includes(pago.presupuestoId || "") ||
      trabajoIds.includes(pago.trabajoId || ""),
  );
  return {
    ...cliente,
    observaciones: cliente.observaciones || "",
    updatedAt: cliente.updatedAt || cliente.createdAt,
    createdAt: cliente.createdAt,
    telefono: cliente.telefono || "",
    whatsapp: cliente.whatsapp || "",
    email: cliente.email || "",
    direccion: cliente.direccion || "",
    localidad: cliente.localidad || "",
    cuit: cliente.cuit || "",
  };
};

export const normalizeSnapshot = (input: CrmDataSnapshot): CrmDataSnapshot => {
  const presupuestos = input.presupuestos.map((item) => hydratePresupuesto(item, input.pagos));
  const trabajos = input.trabajos.map((item) => hydrateTrabajo(item, input.pagos, presupuestos));
  return {
    ...input,
    clientes: input.clientes.map((item) => hydrateCliente(item, presupuestos, trabajos, input.pagos)),
    presupuestos,
    trabajos,
  };
};

export const getDashboardStats = (snapshot: CrmDataSnapshot): DashboardStats => {
  const todayStr = today();
  const monthStr = currentMonth();

  const pagosIngreso = snapshot.pagos.filter((p) => !p.tipo || p.tipo === "ingreso");
  const pagosEgreso = snapshot.pagos.filter((p) => p.tipo === "egreso");

  const ingresosDelMes = roundMoney(
    pagosIngreso
      .filter((p) => p.fecha.startsWith(monthStr))
      .reduce((sum, p) => sum + p.monto, 0),
  );
  const egresosDelMes = roundMoney(
    pagosEgreso
      .filter((p) => p.fecha.startsWith(monthStr))
      .reduce((sum, p) => sum + p.monto, 0),
  );
  const saldoCaja = roundMoney(
    pagosIngreso.reduce((sum, p) => sum + p.monto, 0) -
      pagosEgreso.reduce((sum, p) => sum + p.monto, 0),
  );

  return {
    totalClientes: snapshot.clientes.length,
    presupuestosPendientes: snapshot.presupuestos.filter((item) => ["borrador", "enviado"].includes(item.estado)).length,
    trabajosEnProduccion: snapshot.trabajos.filter((item) => activeProductionStates.includes(item.estadoProduccion)).length,
    trabajosAtrasados: snapshot.trabajos.filter(
      (item) => activeProductionStates.includes(item.estadoProduccion) && Boolean(item.fechaPrometida) && item.fechaPrometida < todayStr,
    ).length,
    trabajosListos: snapshot.trabajos.filter((item) => item.estadoProduccion === "terminado").length,
    colocacionesProximas: snapshot.trabajos.filter(
      (item) => item.fabricaAsignada === "pvc" && !archivedProductionStates.includes(item.estadoProduccion),
    ).length,
    saldoPendienteTotal: roundMoney(snapshot.trabajos.reduce((sum, item) => sum + item.saldo, 0)),
    ingresosDelMes,
    egresosDelMes,
    saldoCaja,
  };
};

export const createCrmRepository = (): CrmRepository => createSheetsCrmRepository();
