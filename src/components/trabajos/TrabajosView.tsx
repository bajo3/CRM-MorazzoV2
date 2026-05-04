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
import { useMemo, useState } from "react";
import { formatDate, isPastDate } from "../../lib/dates";
import { formatMoney } from "../../lib/money";
import { archivedProductionStates, canMoveToStatus, getFactoryForRubro, getFlowForFactory, getNextStatus, getPreviousStatus, rubroLabels, stateLabels } from "../../lib/workflow";
import type { Cliente, CrmDataSnapshot, EstadoTrabajo, RubroTrabajo, Trabajo } from "../../types";
import { printTrabajo } from "../pdf/print";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Form";
import { Modal } from "../ui/Modal";

type CategoryFilter = "todos" | "aberturas" | "cristales";

const aberturaRubros: RubroTrabajo[] = ["pvc"];
const cristalRubros: RubroTrabajo[] = ["vidrio"];
const allRubros: RubroTrabajo[] = ["pvc", "vidrio"];

const todayStr = () => new Date().toISOString().split("T")[0];
const futureDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

export const TrabajosView = ({
  snapshot,
  onSave,
  onDelete,
  onUpdateState,
}: {
  snapshot: CrmDataSnapshot;
  onSave: (draft: Omit<Trabajo, "id" | "createdAt" | "updatedAt" | "historial">, existingId?: string) => void;
  onDelete: (id: string) => void;
  onUpdateState: (id: string, state: EstadoTrabajo) => void;
}) => {
  const [view, setView] = useState<"tabla" | "kanban">("tabla");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("todos");
  const [editing, setEditing] = useState<Trabajo | null>(null);
  const [open, setOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<Trabajo | null>(null);
  const [invalidDrop, setInvalidDrop] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 4 } }),
  );

  const jobs = useMemo(() => {
    const visibleJobs = snapshot.trabajos.filter((j) => !archivedProductionStates.includes(j.estadoProduccion));
    if (categoryFilter === "aberturas") return visibleJobs.filter((j) => aberturaRubros.includes(j.rubro));
    if (categoryFilter === "cristales") return visibleJobs.filter((j) => cristalRubros.includes(j.rubro));
    return visibleJobs;
  }, [categoryFilter, snapshot.trabajos]);

  const kanbanStates = useMemo(
    () => Array.from(new Set(jobs.flatMap((job) => getFlowForFactory(job.fabricaAsignada)))),
    [jobs],
  );

  const categoryTabs: { id: CategoryFilter; label: string; count: number }[] = [
    { id: "todos", label: "Todos", count: snapshot.trabajos.filter((j) => !archivedProductionStates.includes(j.estadoProduccion)).length },
    {
      id: "aberturas",
      label: "Aberturas",
      count: snapshot.trabajos.filter((j) => aberturaRubros.includes(j.rubro) && !archivedProductionStates.includes(j.estadoProduccion)).length,
    },
    {
      id: "cristales",
      label: "Cristales",
      count: snapshot.trabajos.filter((j) => cristalRubros.includes(j.rubro) && !archivedProductionStates.includes(j.estadoProduccion)).length,
    },
  ];

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

    onUpdateState(job.id, targetState);
  };

  return (
    <div className="space-y-5 p-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition border-r border-slate-200 last:border-r-0 ${
                categoryFilter === tab.id
                  ? "bg-brand-700 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${categoryFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* View toggle + New */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setView("tabla")}
              className={`px-3 py-2 text-sm font-medium transition ${view === "tabla" ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Tabla
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-2 text-sm font-medium transition border-l border-slate-200 ${view === "kanban" ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              Kanban
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => { setEditing(null); setOpen(true); }}
          >
            + Nuevo trabajo
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {jobs.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-slate-500">
            {categoryFilter === "aberturas"
              ? "Sin trabajos de Aberturas (PVC)."
              : categoryFilter === "cristales"
              ? "Sin trabajos de Cristales."
              : "Sin trabajos registrados."}
          </p>
        </Card>
      )}
      {invalidDrop ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {invalidDrop}
        </div>
      ) : null}

      {/* Tabla */}
      {view === "tabla" && jobs.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Trabajo</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Rubro</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Prometida</th>
                  <th className="px-5 py-3">Prioridad</th>
                  <th className="px-5 py-3 text-right">Saldo</th>
                  <th className="px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => {
                  const client = snapshot.clientes.find((c) => c.id === job.clienteId);
                  const delayed = isPastDate(job.fechaPrometida) && !["listo", "entregado", "cerrado"].includes(job.estadoProduccion);
                  return (
                    <tr key={job.id} className={`transition hover:bg-slate-50/60 ${delayed ? "bg-red-50/40" : ""}`}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{job.titulo}</p>
                        <p className="text-xs text-slate-400">{job.id} · {job.medidas} · {job.cantidad} un.</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{client?.nombre || "-"}</td>
                      <td className="px-5 py-3.5"><Badge value={job.rubro} /></td>
                      <td className="px-5 py-3.5"><Badge value={job.estadoProduccion} /></td>
                      <td className={`px-5 py-3.5 font-medium text-sm ${delayed ? "text-red-600" : "text-slate-600"}`}>
                        {delayed && <span className="mr-1 text-red-500">⚠</span>}
                        {formatDate(job.fechaPrometida)}
                      </td>
                      <td className="px-5 py-3.5"><Badge value={job.prioridad} /></td>
                      <td className="px-5 py-3.5 text-right font-display font-bold text-red-600">{formatMoney(job.saldo)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          <Button onClick={() => { setEditing(job); setOpen(true); }}>Editar</Button>
                          <Button variant="success" onClick={() => client && printTrabajo({ company: snapshot.company, trabajo: job, cliente: client })}>
                            Imprimir
                          </Button>
                          <Button variant="danger" onClick={() => window.confirm(`Eliminar trabajo ${job.id}?`) && onDelete(job.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Kanban */}
      {view === "kanban" && jobs.length > 0 && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-3 xl:grid-cols-4 2xl:grid-cols-7">
            {kanbanStates.map((state) => (
              <TrabajoColumn
                key={state}
                state={state}
                jobs={jobs.filter((j) => j.estadoProduccion === state)}
                onUpdateState={onUpdateState}
              />
            ))}
          </div>
          <DragOverlay>
            {activeJob ? <TrabajoDragOverlay job={activeJob} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <TrabajoModal
        key={editing?.id || "new-job"}
        open={open}
        trabajo={editing}
        clients={snapshot.clientes}
        onClose={() => setOpen(false)}
        onSubmit={(draft) => {
          onSave(draft, editing?.id);
          setOpen(false);
        }}
      />
    </div>
  );
};

const TrabajoColumn = ({
  state,
  jobs,
  onUpdateState,
}: {
  state: EstadoTrabajo;
  jobs: Trabajo[];
  onUpdateState: (id: string, state: EstadoTrabajo) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: state });

  return (
    <Card className={`p-3 transition ${isOver ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <Badge value={state} />
        <span className="font-display text-xl font-bold text-slate-900">{jobs.length}</span>
      </div>
      <div ref={setNodeRef} className="min-h-[72px] space-y-2.5 rounded-lg">
        {jobs.map((job) => (
          <KanbanJobCard key={job.id} job={job} onUpdateState={onUpdateState} />
        ))}
        {jobs.length === 0 ? (
          <div className="flex h-14 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-300">
            Arrastrar aqui
          </div>
        ) : null}
      </div>
    </Card>
  );
};

const KanbanJobCard = ({
  job,
  onUpdateState,
}: {
  job: Trabajo;
  onUpdateState: (id: string, state: EstadoTrabajo) => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });
  const flow = getFlowForFactory(job.fabricaAsignada);
  const previous = getPreviousStatus(job);
  const next = getNextStatus(job);
  const delayed = isPastDate(job.fechaPrometida) && !["listo", "entregado", "cerrado"].includes(job.estadoProduccion);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border p-3 transition ${
        isDragging
          ? "cursor-grabbing border-brand-300 bg-brand-50 opacity-40 shadow-card-hover"
          : delayed
          ? "cursor-grab border-red-200 bg-red-50/50 hover:border-red-300 hover:shadow-card-hover"
          : "cursor-grab border-slate-100 bg-white hover:border-brand-200 hover:shadow-card-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-2" {...attributes} {...listeners}>
        <p className="font-semibold text-sm text-slate-900 leading-tight">{job.titulo}</p>
        <Badge value={job.prioridad} />
      </div>
      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{job.descripcion}</p>
      <p className="mt-1.5 text-xs text-slate-400">{job.medidas} · {formatDate(job.fechaPrometida)}</p>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {flow.map((s) => (
          <span
            key={s}
            className={`rounded px-1.5 py-0.5 text-xs ${job.estadoProduccion === s ? "bg-brand-700 text-white font-semibold" : "bg-slate-100 text-slate-500"}`}
          >
            {stateLabels[s]}
          </span>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        <Button disabled={!previous} onClick={() => previous && onUpdateState(job.id, previous)}>
          {previous ? `<- ${stateLabels[previous]}` : "Inicio"}
        </Button>
        {job.estadoProduccion === "terminado" ? (
          <Button variant="success" onClick={() => onUpdateState(job.id, "cerrado")}>
            Finalizado
          </Button>
        ) : (
          <Button variant="primary" disabled={!next} onClick={() => next && onUpdateState(job.id, next)}>
            {next ? `-> ${stateLabels[next]}` : "Final"}
          </Button>
        )}
      </div>
    </div>
  );
};

const TrabajoDragOverlay = ({ job }: { job: Trabajo }) => (
  <div className="w-64 rotate-1 rounded-lg border-2 border-brand-400 bg-white p-3 shadow-card-hover">
    <p className="font-semibold text-sm text-slate-900">{job.titulo}</p>
    <p className="mt-1 text-xs text-slate-500">{job.medidas}</p>
    <div className="mt-2 flex gap-2">
      <Badge value={job.estadoProduccion} />
      <Badge value={job.prioridad} />
    </div>
  </div>
);

const TrabajoModal = ({
  open,
  trabajo,
  clients,
  onClose,
  onSubmit,
}: {
  open: boolean;
  trabajo: Trabajo | null;
  clients: Cliente[];
  onClose: () => void;
  onSubmit: (draft: Omit<Trabajo, "id" | "createdAt" | "updatedAt" | "historial">) => void;
}) => {
  const [form, setForm] = useState<Omit<Trabajo, "id" | "createdAt" | "updatedAt" | "historial">>({
    clienteId: trabajo?.clienteId || "",
    presupuestoId: trabajo?.presupuestoId,
    titulo: trabajo?.titulo || "",
    rubro: trabajo?.rubro || "pvc",
    fabricaAsignada: trabajo?.fabricaAsignada || "pvc",
    descripcion: trabajo?.descripcion || "",
    medidas: trabajo?.medidas || "",
    cantidad: trabajo?.cantidad || 1,
    colorMaterial: trabajo?.colorMaterial || "",
    estadoComercial: trabajo?.estadoComercial || "aprobado",
    estadoProduccion: trabajo?.estadoProduccion || "recibido",
    prioridad: trabajo?.prioridad || "normal",
    fechaIngreso: trabajo?.fechaIngreso || todayStr(),
    fechaPrometida: trabajo?.fechaPrometida || futureDate(7),
    total: trabajo?.total || 0,
    sena: trabajo?.sena || 0,
    saldo: trabajo?.saldo || 0,
    observacionesInternas: trabajo?.observacionesInternas || "",
    archivosAdjuntos: trabajo?.archivosAdjuntos || [],
  });

  const flow = getFlowForFactory(getFactoryForRubro(form.rubro));

  return (
    <Modal open={open} title={trabajo ? "Editar trabajo" : "Nuevo trabajo"} onClose={onClose}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.clienteId) { window.alert("Seleccionar cliente."); return; }
          onSubmit({ ...form, fabricaAsignada: getFactoryForRubro(form.rubro) });
        }}
      >
        <Field label="Cliente">
          <Select value={form.clienteId} onChange={(e) => setForm((c) => ({ ...c, clienteId: e.target.value }))}>
            <option value="">Seleccionar cliente</option>
            {clients.map((cl) => <option key={cl.id} value={cl.id}>{cl.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Título">
          <Input value={form.titulo} onChange={(e) => setForm((c) => ({ ...c, titulo: e.target.value }))} />
        </Field>
        <Field label="Rubro">
          <Select
            value={form.rubro}
            onChange={(e) => {
              const rubro = e.target.value as RubroTrabajo;
              const factory = getFactoryForRubro(rubro);
              setForm((c) => ({ ...c, rubro, fabricaAsignada: factory, estadoProduccion: getFlowForFactory(factory)[0] }));
            }}
          >
            {allRubros.map((r) => <option key={r} value={r}>{rubroLabels[r]}</option>)}
          </Select>
        </Field>
        <Field label="Estado de producción">
          <Select value={form.estadoProduccion} onChange={(e) => setForm((c) => ({ ...c, estadoProduccion: e.target.value as EstadoTrabajo }))}>
            {flow.map((s) => <option key={s} value={s}>{stateLabels[s]}</option>)}
          </Select>
        </Field>
        <Field label="Prioridad">
          <Select value={form.prioridad} onChange={(e) => setForm((c) => ({ ...c, prioridad: e.target.value as Trabajo["prioridad"] }))}>
            {["normal", "media", "alta", "urgente"].map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>
        <Field label="Fecha prometida">
          <Input type="date" value={form.fechaPrometida} onChange={(e) => setForm((c) => ({ ...c, fechaPrometida: e.target.value }))} />
        </Field>
        <Field label="Medidas">
          <Input value={form.medidas} onChange={(e) => setForm((c) => ({ ...c, medidas: e.target.value }))} />
        </Field>
        <Field label="Cantidad">
          <Input type="number" value={form.cantidad} onChange={(e) => setForm((c) => ({ ...c, cantidad: Number(e.target.value) }))} />
        </Field>
        <Field label="Color / Material">
          <Input value={form.colorMaterial} onChange={(e) => setForm((c) => ({ ...c, colorMaterial: e.target.value }))} />
        </Field>
        <Field label="Total">
          <Input type="number" value={form.total} onChange={(e) => setForm((c) => ({ ...c, total: Number(e.target.value), saldo: Math.max(Number(e.target.value) - c.sena, 0) }))} />
        </Field>
        <Field label="Seña">
          <Input type="number" value={form.sena} onChange={(e) => setForm((c) => ({ ...c, sena: Number(e.target.value), saldo: Math.max(c.total - Number(e.target.value), 0) }))} />
        </Field>
        <Field label="Saldo">
          <Input type="number" value={form.saldo} onChange={(e) => setForm((c) => ({ ...c, saldo: Number(e.target.value) }))} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Descripción">
            <Textarea value={form.descripcion} onChange={(e) => setForm((c) => ({ ...c, descripcion: e.target.value }))} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Observaciones internas">
            <Textarea value={form.observacionesInternas} onChange={(e) => setForm((c) => ({ ...c, observacionesInternas: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
};
