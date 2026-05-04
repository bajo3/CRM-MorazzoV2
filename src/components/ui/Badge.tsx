import type { EstadoComercial, EstadoPresupuesto, EstadoTrabajo, FabricaAsignada, PrioridadTrabajo, RubroTrabajo } from "../../types";
import { fabricaLabels, priorityLabels, rubroLabels, stateLabels } from "../../lib/workflow";

const colorMap: Record<string, string> = {
  // Presupuesto states
  borrador: "bg-slate-100 text-slate-600 ring-slate-200",
  enviado: "bg-brand-700 text-white ring-brand-700",
  aprobado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rechazado: "bg-red-50 text-red-700 ring-red-200",
  vencido: "bg-zinc-200 text-zinc-600 ring-zinc-300",
  // Trabajo production states - PVC
  recibido: "bg-slate-100 text-slate-600 ring-slate-200",
  medicion: "bg-brand-50 text-brand-700 ring-brand-200",
  preparacion: "bg-amber-50 text-amber-700 ring-amber-200",
  corte: "bg-amber-50 text-amber-700 ring-amber-200",
  armado: "bg-orange-50 text-orange-700 ring-orange-200",
  control: "bg-violet-50 text-violet-700 ring-violet-200",
  listo: "bg-emerald-100 text-emerald-700 ring-emerald-300",
  entregado: "bg-slate-200 text-slate-600 ring-slate-300",
  // Vidrios states
  lavado: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  armado_dvh: "bg-sky-50 text-sky-700 ring-sky-200",
  sellado: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  terminado: "bg-emerald-100 text-emerald-700 ring-emerald-300",
  // Legacy/archived states
  pendiente: "bg-slate-100 text-slate-600 ring-slate-200",
  coordinado: "bg-brand-50 text-brand-700 ring-brand-200",
  en_camino: "bg-amber-50 text-amber-700 ring-amber-200",
  colocado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cerrado: "bg-slate-200 text-slate-600 ring-slate-300",
  cancelado: "bg-red-50 text-red-600 ring-red-200",
  // Fabrica (shown as Aberturas/Cristales)
  pvc: "bg-brand-900 text-white ring-brand-900",
  vidrios: "bg-cyan-100 text-cyan-800 ring-cyan-300",
  // Rubros
  vidrio: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  // Prioridad
  alta: "bg-red-50 text-red-700 ring-red-200",
  urgente: "bg-red-600 text-white ring-red-700",
  media: "bg-amber-50 text-amber-700 ring-amber-200",
  normal: "bg-slate-100 text-slate-600 ring-slate-200",
  // Estado comercial
  consulta: "bg-slate-100 text-slate-600 ring-slate-200",
  presupuestado: "bg-brand-50 text-brand-700 ring-brand-200",
  en_produccion: "bg-brand-700 text-white ring-brand-700",
};

const labels: Record<string, string> = {
  ...stateLabels,
  ...rubroLabels,
  ...priorityLabels,
  ...fabricaLabels,
  consulta: "Consulta",
  presupuestado: "Presupuestado",
  en_produccion: "En produccion",
};

export const Badge = ({
  value,
}: {
  value: EstadoPresupuesto | EstadoTrabajo | RubroTrabajo | FabricaAsignada | PrioridadTrabajo | EstadoComercial | string;
}) => (
  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${colorMap[value] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    {labels[value] || value}
  </span>
);
