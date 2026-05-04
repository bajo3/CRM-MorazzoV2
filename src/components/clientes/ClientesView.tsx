import { useMemo, useState } from "react";
import { formatDate } from "../../lib/dates";
import { formatMoney } from "../../lib/money";
import type { Cliente, CrmDataSnapshot } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field, Input, Textarea } from "../ui/Form";
import { Modal } from "../ui/Modal";

type ClienteDraft = Omit<Cliente, "id" | "createdAt" | "updatedAt">;

const emptyDraft: ClienteDraft = {
  nombre: "",
  telefono: "",
  whatsapp: "",
  email: "",
  direccion: "",
  localidad: "",
  cuit: "",
  observaciones: "",
};

const balanceByClient = (snapshot: CrmDataSnapshot, clientId: string): number =>
  snapshot.trabajos.filter((item) => item.clienteId === clientId).reduce((sum, item) => sum + item.saldo, 0);

export const ClientesView = ({
  snapshot,
  onSave,
  onDelete,
}: {
  snapshot: CrmDataSnapshot;
  onSave: (draft: ClienteDraft, existingId?: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(snapshot.clientes[0]?.id ?? null);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      snapshot.clientes.filter((client) =>
        `${client.nombre} ${client.localidad} ${client.email}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, snapshot.clientes],
  );

  const selected = snapshot.clientes.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const relatedQuotes = snapshot.presupuestos.filter((item) => item.clienteId === selected?.id);
  const relatedJobs = snapshot.trabajos.filter((item) => item.clienteId === selected?.id);
  const relatedPayments = snapshot.pagos.filter((item) => item.clienteId === selected?.id);
  const relatedEvents = snapshot.agenda.filter((item) => item.clienteId === selected?.id);

  return (
    <div className="grid gap-5 p-5 xl:grid-cols-[320px_1fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente..." />
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Nuevo
            </Button>
          </div>
        </div>
        <div className="max-h-[72vh] overflow-auto">
          {filtered.map((client) => {
            const active = client.id === selected?.id;
            return (
              <button
                key={client.id}
                onClick={() => setSelectedId(client.id)}
                className={`flex w-full flex-col gap-2 border-b border-zinc-100 px-4 py-4 text-left ${active ? "bg-zinc-100" : "bg-white"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-neutral-950">{client.nombre}</span>
                  <span className="font-display font-bold text-red-700">{formatMoney(balanceByClient(snapshot, client.id))}</span>
                </div>
                <p className="text-sm text-zinc-500">{client.localidad || "Sin localidad"}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-5">
        {selected ? (
          <>
            <Card className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold text-neutral-950">{selected.nombre}</h2>
                  <p className="mt-2 text-sm text-zinc-500">{selected.telefono || "Sin telefono"} · {selected.email || "Sin email"}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {selected.direccion || "Sin direccion"} {selected.localidad ? `· ${selected.localidad}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setEditing(selected);
                      setOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(`Eliminar cliente ${selected.nombre}?`)) {
                        onDelete(selected.id);
                        setSelectedId(null);
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
              {selected.observaciones ? <p className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">{selected.observaciones}</p> : null}
            </Card>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Presupuestos" value={String(relatedQuotes.length)} />
              <SummaryCard label="Trabajos" value={String(relatedJobs.length)} />
              <SummaryCard label="Pagos" value={formatMoney(relatedPayments.reduce((sum, item) => sum + item.monto, 0))} />
              <SummaryCard label="Saldo" value={formatMoney(balanceByClient(snapshot, selected.id))} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-display text-lg font-bold text-neutral-950">Presupuestos asociados</h3>
                <div className="mt-4 space-y-3">
                  {relatedQuotes.map((quote) => (
                    <div key={quote.id} className="rounded-lg bg-zinc-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-950">{quote.id}</span>
                        <Badge value={quote.estado} />
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{formatDate(quote.fecha)}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="font-display text-lg font-bold text-neutral-950">Trabajos y agenda</h3>
                <div className="mt-4 space-y-3">
                  {relatedJobs.map((job) => (
                    <div key={job.id} className="rounded-lg bg-zinc-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-neutral-950">{job.titulo}</span>
                        <Badge value={job.estadoProduccion} />
                      </div>
                      <p className="mt-1 text-sm text-zinc-500">{job.medidas} · {formatDate(job.fechaPrometida)}</p>
                    </div>
                  ))}
                  {relatedEvents.map((event) => (
                    <div key={event.id} className="rounded-lg border border-dashed border-zinc-200 p-4">
                      <p className="font-medium text-neutral-950">{event.titulo}</p>
                      <p className="mt-1 text-sm text-zinc-500">{formatDate(event.fecha)} · {event.hora}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : (
          <Card className="p-8 text-center text-zinc-500">Selecciona un cliente para ver su ficha.</Card>
        )}
      </div>

      <ClienteModal
        key={editing?.id || "new-client"}
        open={open}
        client={editing}
        onClose={() => setOpen(false)}
        onSubmit={(draft) => {
          onSave(draft, editing?.id);
          setOpen(false);
        }}
      />
    </div>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <Card className="p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
    <p className="mt-3 font-display text-2xl font-bold text-neutral-950">{value}</p>
  </Card>
);

const ClienteModal = ({
  open,
  client,
  onClose,
  onSubmit,
}: {
  open: boolean;
  client: Cliente | null;
  onClose: () => void;
  onSubmit: (draft: ClienteDraft) => void;
}) => {
  const [form, setForm] = useState<ClienteDraft>(client ? { ...client } : emptyDraft);
  const update = <K extends keyof ClienteDraft>(key: K, value: ClienteDraft[K]) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal open={open} title={client ? "Editar cliente" : "Nuevo cliente"} onClose={onClose}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.nombre.trim()) return;
          onSubmit(form);
        }}
      >
        <Field label="Nombre">
          <Input value={form.nombre} onChange={(event) => update("nombre", event.target.value)} required />
        </Field>
        <Field label="Telefono">
          <Input value={form.telefono} onChange={(event) => update("telefono", event.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <Input value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={form.email} onChange={(event) => update("email", event.target.value)} />
        </Field>
        <Field label="Direccion">
          <Input value={form.direccion} onChange={(event) => update("direccion", event.target.value)} />
        </Field>
        <Field label="Localidad">
          <Input value={form.localidad} onChange={(event) => update("localidad", event.target.value)} />
        </Field>
        <Field label="CUIT">
          <Input value={form.cuit} onChange={(event) => update("cuit", event.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Observaciones">
            <Textarea value={form.observaciones} onChange={(event) => update("observaciones", event.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-2 flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
