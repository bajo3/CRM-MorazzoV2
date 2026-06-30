import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { formatDate, isPastDate } from "../../lib/dates";
import { archivedProductionStates, canMoveToStatus, getFlowForFactory, getNextEstado, getPreviousStatus, stateLabels } from "../../lib/workflow";
import type { CrmDataSnapshot, EstadoTrabajo, FabricaAsignada, Trabajo } from "../../types";
import { Badge } from "../ui/Badge";

const todayStr = () => new Date().toISOString().split("T")[0];

const filters: { id: FabricaAsignada | "todas"; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "pvc", label: "Aberturas" },
  { id: "vidrios", label: "Cristales" },
];

export const MonitorView = ({
  snapshot,
  onAdvance,
  onArchive,
}: {
  snapshot: CrmDataSnapshot;
  onAdvance: (id: string, next: EstadoTrabajo) => void;
  onArchive: (id: string) => void;
}) => {
  const [clock, setClock] = useState(new Date());
  const [filter, setFilter] = useState<FabricaAsignada | "todas">("todas");
  const [activeJob, setActiveJob] = useState<Trabajo | null>(null);
  const [invalidDrop, setInvalidDrop] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 4 } }),
  );

  useEffect(() => {
    const interval = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const jobs = snapshot.trabajos
    .filter((item) => !archivedProductionStates.includes(item.estadoProduccion))
    .filter((item) => filter === "todas" || item.fabricaAsignada === filter);

  const visibleStates =
    filter === "todas"
      ? Array.from(new Set(jobs.flatMap((job) => getFlowForFactory(job.fabricaAsignada)))).filter(
          (state) => !archivedProductionStates.includes(state),
        )
      : getFlowForFactory(filter).filter((state) => !archivedProductionStates.includes(state));

  const today = todayStr();
  const dueToday = jobs.filter((job) => job.fechaPrometida === today).length;
  const delayed = jobs.filter((job) => isPastDate(job.fechaPrometida)).length;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      void rootRef.current?.requestFullscreen();
      return;
    }
    void document.exitFullscreen();
  };

  const handleDragStart = (event: DragStartEvent) => {
    setInvalidDrop(null);
    setActiveJob(jobs.find((job) => job.id === event.active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const job = jobs.find((item) => item.id === active.id);
    const targetState = over.id as EstadoTrabajo;
    if (!job) return;

    if (!canMoveToStatus(job, targetState)) {
      setInvalidDrop("Movimiento no valido para este tipo de trabajo.");
      return;
    }

    onAdvance(job.id, targetState);
  };

  return (
    <div ref={rootRef} className="min-h-screen bg-slate-950 p-4 text-white lg:p-6">
      <div className="mb-4 flex flex-col gap-4 border-b border-white/10 pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Facundo Morazzo</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white lg:text-4xl">Trabajos del taller</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilter(item.id);
                setInvalidDrop(null);
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                filter === item.id ? "bg-brand-500 text-white shadow-lg shadow-brand-950/30" : "bg-white/8 text-slate-300 hover:bg-white/14"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            className="rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/14"
            onClick={handleFullscreen}
          >
            Ver grande
          </button>
        </div>

        <div className="text-left xl:text-right">
          <p className="font-display text-4xl font-bold tabular-nums text-white lg:text-5xl">
            {clock.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-1 text-base capitalize text-slate-400">
            {clock.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatusBox label="En curso" value={String(jobs.length)} tone="default" />
        <StatusBox label="Para hoy" value={String(dueToday)} tone="warn" />
        <StatusBox label="Atrasados" value={String(delayed)} tone="danger" />
      </div>

      {invalidDrop ? (
        <div className="mb-4 rounded-lg border border-amber-300/40 bg-amber-950/60 px-5 py-3 text-base font-bold text-amber-200">
          {invalidDrop}
        </div>
      ) : null}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid auto-cols-[minmax(250px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-3">
          {visibleStates.map((state) => (
            <MonitorColumn
              key={state}
              state={state}
              jobs={jobs.filter((job) => job.estadoProduccion === state)}
              snapshot={snapshot}
              today={today}
              onAdvance={onAdvance}
              onArchive={onArchive}
            />
          ))}
        </div>
        <DragOverlay>{activeJob ? <MonitorDragOverlay job={activeJob} snapshot={snapshot} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};

const MonitorColumn = ({
  state,
  jobs,
  snapshot,
  today,
  onAdvance,
  onArchive,
}: {
  state: EstadoTrabajo;
  jobs: Trabajo[];
  snapshot: CrmDataSnapshot;
  today: string;
  onAdvance: (id: string, next: EstadoTrabajo) => void;
  onArchive: (id: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: state });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[52vh] min-w-[250px] rounded-xl border bg-slate-900/95 p-3 transition ${
        isOver ? "border-brand-300 ring-4 ring-brand-400/25" : "border-white/10"
      }`}
    >
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-sm font-black uppercase tracking-wide text-slate-100">{stateLabels[state]}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-sm font-black text-white">{jobs.length}</span>
      </div>

      <div className="space-y-2.5">
        {jobs.length === 0 ? (
          <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-white/10 text-sm font-semibold text-slate-600">
            Sin trabajos
          </div>
        ) : null}
        {jobs.map((job) => (
          <MonitorCard key={job.id} job={job} snapshot={snapshot} today={today} onAdvance={onAdvance} onArchive={onArchive} />
        ))}
      </div>
    </section>
  );
};

const MonitorCard = ({
  job,
  snapshot,
  today,
  onAdvance,
  onArchive,
}: {
  job: Trabajo;
  snapshot: CrmDataSnapshot;
  today: string;
  onAdvance: (id: string, next: EstadoTrabajo) => void;
  onArchive: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });
  const client = snapshot.clientes.find((item) => item.id === job.clienteId);
  const next = getNextEstado(job.fabricaAsignada, job.estadoProduccion);
  const prev = getPreviousStatus(job);
  const delayedJob = isPastDate(job.fechaPrometida);
  const dueTodayJob = job.fechaPrometida === today;

  return (
    <article
      ref={setNodeRef}
      className={`rounded-lg border border-l-4 bg-slate-950/80 p-3.5 shadow-sm transition ${
        isDragging
          ? "cursor-grabbing border-brand-300 border-l-brand-300 opacity-40"
          : delayedJob
          ? "cursor-grab border-red-500/50 border-l-red-500"
          : dueTodayJob
          ? "cursor-grab border-amber-400/50 border-l-amber-400"
          : "cursor-grab border-white/10 border-l-slate-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3" {...attributes} {...listeners}>
        <div className="min-w-0">
          <p className="truncate text-base font-black leading-tight text-white">{client?.nombre || "Sin cliente"}</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">{job.medidas || "Sin medidas"}</p>
        </div>
        <Badge value={job.prioridad} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-200">{job.descripcion || job.titulo}</p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-md bg-white/8 px-2 py-1 font-semibold text-slate-300">{job.colorMaterial || stateLabels[job.estadoProduccion]}</span>
        <span
          className={`rounded-md px-2 py-1 font-black ${
            delayedJob ? "bg-red-500 text-white" : dueTodayJob ? "bg-amber-300 text-slate-950" : "bg-white/10 text-slate-300"
          }`}
        >
          {delayedJob ? "Atrasado" : dueTodayJob ? "Vence hoy" : formatDate(job.fechaPrometida)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-xs font-black text-slate-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!prev}
          onClick={() => prev && onAdvance(job.id, prev)}
        >
          Volver
        </button>
        {job.estadoProduccion === "terminado" ? (
          <button
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-400"
            onClick={() => onArchive(job.id)}
          >
            Finalizar
          </button>
        ) : (
          <button
            className="rounded-lg bg-brand-500 px-3 py-2 text-xs font-black text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-30"
            disabled={!next}
            onClick={() => next && onAdvance(job.id, next)}
          >
            Avanzar
          </button>
        )}
      </div>
    </article>
  );
};

const MonitorDragOverlay = ({ job, snapshot }: { job: Trabajo; snapshot: CrmDataSnapshot }) => (
  <div className="w-[320px] rotate-1 rounded-lg border-2 border-brand-300 bg-slate-900 p-4 shadow-2xl">
    <p className="text-xl font-black text-white">{snapshot.clientes.find((item) => item.id === job.clienteId)?.nombre || "Sin cliente"}</p>
    <p className="mt-2 text-sm font-semibold text-slate-300">{job.descripcion || job.titulo}</p>
    <p className="mt-3 text-sm text-slate-400">{job.medidas}</p>
  </div>
);

const StatusBox = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn" | "danger";
}) => {
  const color = tone === "danger" ? "text-red-400" : tone === "warn" ? "text-amber-300" : "text-white";
  const border = tone === "danger" ? "border-red-500/30" : tone === "warn" ? "border-amber-400/30" : "border-white/8";
  return (
    <div className={`rounded-xl border bg-slate-900 px-5 py-4 ${border}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 font-display text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
};
