import { useState } from "react";
import { formatDate } from "../../lib/dates";
import type { AgendaEvento, CrmDataSnapshot } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Form";
import { Modal } from "../ui/Modal";

const todayStr = () => new Date().toISOString().split("T")[0];

export const AgendaView = ({
  snapshot,
  onSave,
  onDelete,
}: {
  snapshot: CrmDataSnapshot;
  onSave: (draft: Omit<AgendaEvento, "id" | "createdAt" | "updatedAt">, existingId?: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [editing, setEditing] = useState<AgendaEvento | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo evento
        </Button>
      </div>
      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.agenda.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <p className="text-sm font-semibold text-slate-500">Sin eventos programados</p>
                  <p className="mt-1 text-xs text-slate-400">Creá el primero con el botón "Nuevo evento".</p>
                </td>
              </tr>
            )}
            {snapshot.agenda.map((event) => (
              <tr key={event.id} className="border-t border-slate-100">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{event.titulo}</p>
                  <p className="text-xs text-slate-500">{event.tipo}</p>
                </td>
                <td className="px-4 py-4">{formatDate(event.fecha)} · {event.hora}</td>
                <td className="px-4 py-4">{snapshot.clientes.find((item) => item.id === event.clienteId)?.nombre || "-"}</td>
                <td className="px-4 py-4"><Badge value={event.estado === "cancelado" ? "cancelado" : "listo"} /></td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditing(event);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Eliminar evento ${event.titulo}?`)) {
                          onDelete(event.id);
                        }
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <AgendaModal
        key={editing?.id || "new-event"}
        open={open}
        event={editing}
        snapshot={snapshot}
        onClose={() => setOpen(false)}
        onSubmit={(draft) => {
          onSave(draft, editing?.id);
          setOpen(false);
        }}
      />
    </div>
  );
};

const AgendaModal = ({
  open,
  event,
  snapshot,
  onClose,
  onSubmit,
}: {
  open: boolean;
  event: AgendaEvento | null;
  snapshot: CrmDataSnapshot;
  onClose: () => void;
  onSubmit: (draft: Omit<AgendaEvento, "id" | "createdAt" | "updatedAt">) => void;
}) => {
  const [form, setForm] = useState<Omit<AgendaEvento, "id" | "createdAt" | "updatedAt">>({
    tipo: event?.tipo || "medicion",
    estado: event?.estado || "pendiente",
    clienteId: event?.clienteId,
    trabajoId: event?.trabajoId,
    fecha: event?.fecha || todayStr(),
    hora: event?.hora || "09:00",
    titulo: event?.titulo || "",
    descripcion: event?.descripcion || "",
  });

  return (
    <Modal open={open} title={event ? "Editar evento" : "Nuevo evento"} onClose={onClose}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(submitted) => {
          submitted.preventDefault();
          onSubmit(form);
        }}
      >
        <Field label="Tipo">
          <Select value={form.tipo} onChange={(input) => setForm((current) => ({ ...current, tipo: input.target.value as AgendaEvento["tipo"] }))}>
            {["medicion", "instalacion", "entrega", "retiro", "reunion"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estado">
          <Select value={form.estado} onChange={(input) => setForm((current) => ({ ...current, estado: input.target.value as AgendaEvento["estado"] }))}>
            {["pendiente", "confirmado", "realizado", "cancelado"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cliente">
          <Select value={form.clienteId || ""} onChange={(input) => setForm((current) => ({ ...current, clienteId: input.target.value || undefined }))}>
            <option value="">Sin cliente</option>
            {snapshot.clientes.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Trabajo">
          <Select value={form.trabajoId || ""} onChange={(input) => setForm((current) => ({ ...current, trabajoId: input.target.value || undefined }))}>
            <option value="">Sin trabajo</option>
            {snapshot.trabajos.map((job) => (
              <option key={job.id} value={job.id}>
                {job.titulo}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={form.fecha} onChange={(input) => setForm((current) => ({ ...current, fecha: input.target.value }))} />
        </Field>
        <Field label="Hora">
          <Input type="time" value={form.hora} onChange={(input) => setForm((current) => ({ ...current, hora: input.target.value }))} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Título">
            <Input value={form.titulo} onChange={(input) => setForm((current) => ({ ...current, titulo: input.target.value }))} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Descripción">
            <Textarea value={form.descripcion} onChange={(input) => setForm((current) => ({ ...current, descripcion: input.target.value }))} />
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
