import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { formatDate, isPastDate } from "../../lib/dates";
import { archivedProductionStates, canMoveToStatus, getFlowForFactory, getNextEstado, stateLabels } from "../../lib/workflow";
import type { CrmDataSnapshot, EstadoTrabajo, FabricaAsignada, Trabajo } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export const FabricaView = ({
  snapshot,
  factory,
  title,
  onAdvance,
  onArchive,
}: {
  snapshot: CrmDataSnapshot;
  factory: FabricaAsignada;
  title: string;
  onAdvance: (id: string, next: EstadoTrabajo) => void;
  onArchive: (id: string) => void;
}) => {
  const flow = getFlowForFactory(factory);
  const jobs = snapshot.trabajos.filter((item) => item.fabricaAsignada === factory && !archivedProductionStates.includes(item.estadoProduccion));
  const activeJobs = jobs.filter((job) => job.estadoProduccion !== "terminado");
  const delayed = activeJobs.filter((job) => isPastDate(job.fechaPrometida));
  const [activeJob, setActiveJob] = useState<Trabajo | null>(null);
  const [invalidDrop, setInvalidDrop] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 4 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job || null);
    setInvalidDrop(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const job = jobs.find((j) => j.id === active.id);
    const targetState = over.id as EstadoTrabajo;
    if (!job) return;

    if (!flow.includes(targetState)) return;
    if (!canMoveToStatus(job, targetState)) {
      setInvalidDrop("Movimiento no valido para este tipo de trabajo.");
      return;
    }
    onAdvance(job.id, targetState);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-5 p-5">
        {/* KPIs */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Área</p>
            <p className="mt-2 font-display text-2xl font-bold text-slate-900">{title}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Activos</p>
            <p className="mt-2 font-display text-2xl font-bold text-slate-900">{activeJobs.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Atrasados</p>
            <p className="mt-2 font-display text-2xl font-bold text-red-600">{delayed.length}</p>
          </Card>
        </div>
        {invalidDrop ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {invalidDrop}
          </div>
        ) : null}

        {/* Kanban con DnD */}
        <div className="grid gap-3 xl:grid-cols-4 2xl:grid-cols-7">
          {flow.map((state) => (
            <DroppableColumn
              key={state}
              state={state}
              jobs={jobs.filter((j) => j.estadoProduccion === state)}
              snapshot={snapshot}
              onAdvance={onAdvance}
              onArchive={onArchive}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeJob ? (
          <DraggingCard job={activeJob} snapshot={snapshot} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const DroppableColumn = ({
  state,
  jobs,
  snapshot,
  onAdvance,
  onArchive,
}: {
  state: EstadoTrabajo;
  jobs: Trabajo[];
  snapshot: CrmDataSnapshot;
  onAdvance: (id: string, next: EstadoTrabajo) => void;
  onArchive: (id: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: state });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border border-slate-200 bg-white shadow-card p-3 transition ${isOver ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge value={state} />
        <span className="font-display text-xl font-bold text-slate-900">{jobs.length}</span>
      </div>
      <div className="min-h-[60px] space-y-3">
        {jobs.map((job) => (
          <DraggableJobCard key={job.id} job={job} snapshot={snapshot} onAdvance={onAdvance} onArchive={onArchive} />
        ))}
        {jobs.length === 0 && (
          <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-300">
            Arrastrar aquí
          </div>
        )}
      </div>
    </div>
  );
};

const DraggableJobCard = ({
  job,
  snapshot,
  onAdvance,
  onArchive,
}: {
  job: Trabajo;
  snapshot: CrmDataSnapshot;
  onAdvance: (id: string, next: EstadoTrabajo) => void;
  onArchive: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });
  const next = getNextEstado(job.fabricaAsignada, job.estadoProduccion);
  const delayed = isPastDate(job.fechaPrometida) && !["listo", "entregado", "cerrado"].includes(job.estadoProduccion);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-lg border p-3 transition cursor-grab active:cursor-grabbing ${
        isDragging
          ? "opacity-40 shadow-card-hover border-brand-300"
          : delayed
          ? "border-red-200 bg-red-50"
          : "border-slate-100 bg-white hover:border-brand-200 hover:shadow-card-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm text-slate-900">{job.titulo}</p>
          <p className="text-xs text-slate-500 mt-0.5">{snapshot.clientes.find((c) => c.id === job.clienteId)?.nombre}</p>
        </div>
        <Badge value={job.prioridad} />
      </div>
      <p className="mt-2 text-xs text-slate-600 line-clamp-2">{job.descripcion}</p>
      <p className="mt-1.5 text-xs text-slate-400">{job.medidas} · {job.cantidad} un. · {formatDate(job.fechaPrometida)}</p>
      {!next ? (
        <Button
          variant="success"
          className="mt-3 w-full !text-xs !h-8"
          onClick={() => onArchive(job.id)}
        >
          Finalizado
        </Button>
      ) : next ? (
        <Button
          variant="primary"
          className="mt-3 w-full !text-xs !h-8"
          onClick={() => onAdvance(job.id, next)}
        >
          → {stateLabels[next]}
        </Button>
      ) : null}
    </div>
  );
};

const DraggingCard = ({
  job,
  snapshot,
}: {
  job: Trabajo;
  snapshot: CrmDataSnapshot;
}) => (
  <div className="w-48 rounded-lg border-2 border-brand-400 bg-white p-3 shadow-card-hover opacity-95 rotate-2">
    <p className="font-semibold text-sm text-slate-900">{job.titulo}</p>
    <p className="text-xs text-slate-500 mt-0.5">{snapshot.clientes.find((c) => c.id === job.clienteId)?.nombre}</p>
    <p className="mt-1 text-xs text-slate-400">{job.medidas}</p>
    <div className="mt-2">
      <Badge value={job.estadoProduccion} />
    </div>
  </div>
);
