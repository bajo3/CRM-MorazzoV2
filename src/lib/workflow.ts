import type { EstadoTrabajo, FabricaAsignada, RubroTrabajo, Trabajo } from "../types";

export const pvcFlow: EstadoTrabajo[] = ["recibido", "medicion", "preparacion", "terminado"];
export const vidrioFlow: EstadoTrabajo[] = ["recibido", "preparacion", "terminado"];

export const getFactoryForRubro = (rubro: RubroTrabajo): FabricaAsignada => {
  if (rubro === "pvc") return "pvc";
  return "vidrios";
};

export const getFlowForFactory = (factory: FabricaAsignada): EstadoTrabajo[] => {
  if (factory === "pvc") return pvcFlow;
  return vidrioFlow;
};

export const normalizeRubroTrabajo = (rubro: unknown): RubroTrabajo => {
  const value = String(rubro || "").toLowerCase();
  if (value === "vidrio" || value === "cristales" || value === "cristal" || value === "dvh" || value === "espejo") {
    return "vidrio";
  }
  return "pvc";
};

export const normalizeFactory = (factory: unknown, rubro: RubroTrabajo): FabricaAsignada => {
  const value = String(factory || "").toLowerCase();
  if (value === "vidrios") return "vidrios";
  if (value === "pvc") return "pvc";
  return getFactoryForRubro(rubro);
};

export const getWorkflowForJob = (job: Pick<Trabajo, "fabricaAsignada">): EstadoTrabajo[] =>
  getFlowForFactory(job.fabricaAsignada);

export const canMoveToStatus = (
  job: Pick<Trabajo, "fabricaAsignada" | "estadoProduccion">,
  targetStatus: EstadoTrabajo,
): boolean => {
  const flow = getFlowForFactory(job.fabricaAsignada);
  return flow.includes(targetStatus);
};

export const getNextStatus = (job: Pick<Trabajo, "fabricaAsignada" | "estadoProduccion">): EstadoTrabajo | null => {
  const flow = getFlowForFactory(job.fabricaAsignada);
  const index = flow.indexOf(job.estadoProduccion);
  return index >= 0 && index < flow.length - 1 ? flow[index + 1] : null;
};

export const getPreviousStatus = (job: Pick<Trabajo, "fabricaAsignada" | "estadoProduccion">): EstadoTrabajo | null => {
  const flow = getFlowForFactory(job.fabricaAsignada);
  const index = flow.indexOf(job.estadoProduccion);
  return index > 0 ? flow[index - 1] : null;
};

export const getNextEstado = (factory: FabricaAsignada, current: EstadoTrabajo): EstadoTrabajo | null => {
  const flow = getFlowForFactory(factory);
  const index = flow.indexOf(current);
  return index >= 0 && index < flow.length - 1 ? flow[index + 1] : null;
};

export const ensureEstadoForFactory = (factory: FabricaAsignada, state: EstadoTrabajo): EstadoTrabajo => {
  const flow = getFlowForFactory(factory);
  if (state === "corte" || state === "armado" || state === "control" || state === "lavado" || state === "armado_dvh" || state === "sellado") {
    return "preparacion";
  }
  if (state === "listo" || state === "entregado") {
    return "terminado";
  }
  if (state === "colocado") return "terminado";
  if (state === "cerrado" || state === "cancelado") return state;
  return flow.includes(state) ? state : flow[0];
};

export const activeProductionStates: EstadoTrabajo[] = [
  "recibido",
  "medicion",
  "preparacion",
  "pendiente",
  "coordinado",
  "en_camino",
];

export const terminalStates: EstadoTrabajo[] = ["cerrado", "cancelado"];
export const archivedProductionStates: EstadoTrabajo[] = ["cerrado", "cancelado"];

export const stateLabels: Record<EstadoTrabajo, string> = {
  recibido: "Recibido",
  medicion: "Medicion",
  preparacion: "Preparacion",
  corte: "Corte",
  armado: "Armado",
  control: "Control",
  listo: "Listo",
  entregado: "Entregado",
  lavado: "Lavado",
  armado_dvh: "Armado DVH",
  sellado: "Sellado",
  terminado: "Terminado",
  pendiente: "Pendiente",
  coordinado: "Coordinado",
  en_camino: "En camino",
  colocado: "Terminado",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export const rubroLabels: Record<RubroTrabajo, string> = {
  pvc: "Aberturas",
  vidrio: "Cristales",
};

export const fabricaLabels: Record<FabricaAsignada, string> = {
  pvc: "Aberturas",
  vidrios: "Cristales",
};

export const priorityLabels = {
  normal: "Normal",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
} as const;
