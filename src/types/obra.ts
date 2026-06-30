export const etapasObra = ["Pendiente", "En curso", "Terminada", "Finalizada"] as const;

export type EtapaObra = (typeof etapasObra)[number];

export interface Obra {
  id: string;
  fechaInicio: string;
  nombre: string;
  etapa: EtapaObra;
  proximaAccion: string;
  responsable: string;
  fechaFinalizacion: string;
  diasAbiertos: number | null;
  vencida: boolean;
  notas: string;
}

export type ObraInput = Omit<Obra, "id" | "diasAbiertos" | "vencida">;
