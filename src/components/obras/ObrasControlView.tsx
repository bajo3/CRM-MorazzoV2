import { ExternalLink, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { obrasApi } from "../../services/obrasApi";
import { etapasObra, type EtapaObra, type Obra, type ObraInput } from "../../types/obra";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Form";
import { Modal } from "../ui/Modal";

const spreadsheetUrl =
  "https://docs.google.com/spreadsheets/d/1JP5cSguDRcPA74iN8-kIid6CScgWbGH_suxY7scmTX8/edit?gid=980659866";

const emptyObra = (): ObraInput => ({
  fechaInicio: new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }),
  nombre: "",
  etapa: "Pendiente",
  proximaAccion: "",
  responsable: "",
  fechaFinalizacion: "",
  notas: "",
});

const stageClasses: Record<EtapaObra, string> = {
  Pendiente: "bg-amber-50 text-amber-800 ring-amber-200",
  "En curso": "bg-blue-50 text-blue-700 ring-blue-200",
  Terminada: "bg-lime-50 text-lime-800 ring-lime-200",
  Finalizada: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const rowClasses: Record<EtapaObra, string> = {
  Pendiente: "bg-amber-50/30",
  "En curso": "bg-blue-50/30",
  Terminada: "bg-lime-50/30",
  Finalizada: "bg-emerald-50/30",
};

const formatDate = (value: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export const ObrasControlView = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(obrasApi.isConfigured);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<EtapaObra | "Todas">("Todas");
  const [editing, setEditing] = useState<Obra | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const next = await obrasApi.list();
      setObras(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las obras.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!obrasApi.isConfigured) {
      return;
    }
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(true), 15_000);
    const refreshOnFocus = () => void load(true);
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return obras.filter((obra) => {
      const matchesStage = stage === "Todas" || obra.etapa === stage;
      const matchesQuery =
        !normalizedQuery ||
        [obra.id, obra.nombre, obra.responsable, obra.proximaAccion]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery);
      return matchesStage && matchesQuery;
    });
  }, [obras, query, stage]);

  const stats = useMemo(
    () => ({
      total: obras.length,
      activas: obras.filter((obra) => obra.etapa !== "Finalizada").length,
      vencidas: obras.filter((obra) => obra.vencida).length,
      finalizadas: obras.filter((obra) => obra.etapa === "Finalizada").length,
    }),
    [obras],
  );

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const save = async (draft: ObraInput) => {
    setSaving(true);
    try {
      if (editing) await obrasApi.update(editing.id, draft);
      else await obrasApi.create(draft);
      setModalOpen(false);
      setEditing(null);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la obra.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (obra: Obra) => {
    if (!window.confirm(`¿Eliminar la obra “${obra.nombre}”? Esta acción quedará en el historial.`)) return;
    try {
      await obrasApi.remove(obra.id);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la obra.");
    }
  };

  if (!obrasApi.isConfigured) {
    return (
      <div className="p-5">
        <Card className="mx-auto max-w-2xl p-8 text-center">
          <h2 className="font-display text-xl font-bold text-slate-900">Falta conectar Google Sheets</h2>
          <p className="mt-2 text-sm text-slate-600">
            Publicá el Apps Script incluido en el proyecto y configurá <code>VITE_OBRAS_API_URL</code>.
          </p>
          <a className="mt-5 inline-flex text-sm font-semibold text-brand-700 hover:underline" href={spreadsheetUrl} target="_blank" rel="noreferrer">
            Abrir la planilla <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total de obras" value={stats.total} />
        <Metric label="Obras activas" value={stats.activas} />
        <Metric label="Vencidas" value={stats.vencidas} alert={stats.vencidas > 0} />
        <Metric label="Finalizadas" value={stats.finalizadas} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <label className="relative min-w-56 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar obra, responsable o acción"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <Select className="w-40" value={stage} onChange={(event) => setStage(event.target.value as EtapaObra | "Todas")}>
            <option value="Todas">Todas las etapas</option>
            {etapasObra.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <a
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            href={spreadsheetUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Planilla
          </a>
          <Button variant="primary" onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva obra
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      ) : null}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Cargando obras desde Google Sheets…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {obras.length === 0 ? "Todavía no hay obras cargadas." : "No hay resultados para estos filtros."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Inicio</th>
                  <th className="px-4 py-3">Obra</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Próxima acción</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Días</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((obra) => (
                  <tr key={obra.id} className={`${rowClasses[obra.etapa]} transition hover:brightness-[0.98]`}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{obra.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(obra.fechaInicio)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{obra.nombre}</p>
                      {obra.notas ? <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{obra.notas}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${stageClasses[obra.etapa]}`}>
                        {obra.etapa}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-700">{obra.proximaAccion || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{obra.responsable || "—"}</td>
                    <td className={`px-4 py-3 font-semibold ${obra.vencida ? "text-red-700" : "text-slate-600"}`}>
                      {obra.diasAbiertos ?? "—"}
                      {obra.vencida ? <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-[10px] uppercase">Vencida</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button onClick={() => { setEditing(obra); setModalOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar {obra.nombre}</span>
                        </Button>
                        <Button variant="danger" onClick={() => void remove(obra)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar {obra.nombre}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ObraModal
        key={editing?.id || "new"}
        open={modalOpen}
        obra={editing}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSave={(draft) => void save(draft)}
      />
    </div>
  );
};

const Metric = ({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) => (
  <Card className="p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-1 font-display text-3xl font-bold ${alert ? "text-red-700" : "text-slate-900"}`}>{value}</p>
  </Card>
);

const ObraModal = ({
  open,
  obra,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  obra: Obra | null;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: ObraInput) => void;
}) => {
  const [form, setForm] = useState<ObraInput>(() =>
    obra
      ? {
          fechaInicio: obra.fechaInicio,
          nombre: obra.nombre,
          etapa: obra.etapa,
          proximaAccion: obra.proximaAccion,
          responsable: obra.responsable,
          fechaFinalizacion: obra.fechaFinalizacion,
          notas: obra.notas,
        }
      : emptyObra(),
  );

  const updateStage = (etapa: EtapaObra) => {
    setForm((current) => ({
      ...current,
      etapa,
      fechaFinalizacion:
        etapa === "Finalizada" && !current.fechaFinalizacion
          ? new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
          : current.fechaFinalizacion,
    }));
  };

  return (
    <Modal open={open} title={obra ? `Editar obra ${obra.id}` : "Nueva obra"} onClose={onClose}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <Field label="Fecha de inicio">
          <Input required type="date" value={form.fechaInicio} onChange={(event) => setForm((current) => ({ ...current, fechaInicio: event.target.value }))} />
        </Field>
        <Field label="Nombre de obra">
          <Input required autoFocus value={form.nombre} onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))} />
        </Field>
        <Field label="Etapa">
          <Select value={form.etapa} onChange={(event) => updateStage(event.target.value as EtapaObra)}>
            {etapasObra.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Responsable">
          <Input required value={form.responsable} onChange={(event) => setForm((current) => ({ ...current, responsable: event.target.value }))} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Próxima acción">
            <Input value={form.proximaAccion} onChange={(event) => setForm((current) => ({ ...current, proximaAccion: event.target.value }))} />
          </Field>
        </div>
        <Field label="Fecha de finalización">
          <Input type="date" value={form.fechaFinalizacion} onChange={(event) => setForm((current) => ({ ...current, fechaFinalizacion: event.target.value }))} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notas">
            <Textarea value={form.notas} onChange={(event) => setForm((current) => ({ ...current, notas: event.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
        </div>
      </form>
    </Modal>
  );
};
