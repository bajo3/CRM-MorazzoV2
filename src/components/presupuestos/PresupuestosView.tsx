import { useMemo, useState } from "react";
import { formatDate } from "../../lib/dates";
import { formatMoney, roundMoney } from "../../lib/money";
import type { Cliente, CrmDataSnapshot, EstadoPresupuesto, Presupuesto, PresupuestoItem } from "../../types";
import { downloadPresupuesto, printPresupuesto, viewPresupuesto } from "../pdf/print";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Form";
import { Modal } from "../ui/Modal";

const todayStr = () => new Date().toISOString().split("T")[0];

const estadoLabels: Record<EstadoPresupuesto | "todos", string> = {
  todos: "Todos",
  borrador: "Borrador",
  enviado: "Enviado",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  vencido: "Vencido",
};

const emptyItem = (): PresupuestoItem => ({
  id: "",
  descripcion: "",
  tipo: "",
  alto: 0,
  ancho: 0,
  cantidad: 1,
  precioUnitario: 0,
  subtotal: 0,
});

export const PresupuestosView = ({
  snapshot,
  onSave,
  onDelete,
  onConvert,
}: {
  snapshot: CrmDataSnapshot;
  onSave: (draft: Omit<Presupuesto, "id" | "createdAt" | "updatedAt" | "saldo" | "subtotal" | "total" | "senaSugerida">, existingId?: string) => void;
  onDelete: (id: string) => void;
  onConvert: (id: string) => void;
}) => {
  const [statusFilter, setStatusFilter] = useState<EstadoPresupuesto | "todos">("todos");
  const [editing, setEditing] = useState<Presupuesto | null>(null);
  const [open, setOpen] = useState(false);

  const quotes = useMemo(
    () => snapshot.presupuestos.filter((item) => statusFilter === "todos" || item.estado === statusFilter),
    [snapshot.presupuestos, statusFilter],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(["todos", "borrador", "enviado", "aprobado", "rechazado", "vencido"] as const).map((status) => (
            <button
              key={status}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${statusFilter === status ? "bg-brand-700 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              onClick={() => setStatusFilter(status)}
            >
              {estadoLabels[status]}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo presupuesto
        </Button>
      </div>

      <Card className="overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Saldo</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const client = snapshot.clientes.find((item) => item.id === quote.clienteId);
              return (
                <tr key={quote.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-medium text-slate-900">{quote.id}</td>
                  <td className="px-4 py-4">{client?.nombre}</td>
                  <td className="px-4 py-4">{formatDate(quote.fecha)}</td>
                  <td className="px-4 py-4"><Badge value={quote.estado} /></td>
                  <td className="px-4 py-4 text-right font-display font-bold">{formatMoney(quote.total)}</td>
                  <td className="px-4 py-4 text-right font-display font-bold text-orange-600">{formatMoney(quote.saldo)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setEditing(quote);
                          setOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button variant="success" onClick={() => client && printPresupuesto({ company: snapshot.company, presupuesto: quote, cliente: client })}>
                        Imprimir
                      </Button>
                      <Button onClick={() => client && viewPresupuesto({ company: snapshot.company, presupuesto: quote, cliente: client })}>
                        Ver
                      </Button>
                      <Button onClick={() => client && downloadPresupuesto({ company: snapshot.company, presupuesto: quote, cliente: client })}>
                        Descargar
                      </Button>
                      {!quote.trabajoId ? (
                        <Button variant="primary" onClick={() => onConvert(quote.id)}>
                          {quote.estado === "aprobado" ? "Crear trabajo" : "Aprobar y crear trabajo"}
                        </Button>
                      ) : null}
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Eliminar presupuesto ${quote.id}?`)) {
                            onDelete(quote.id);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <PresupuestoModal
        key={editing?.id || "new-quote"}
        open={open}
        presupuesto={editing}
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

const PresupuestoModal = ({
  open,
  presupuesto,
  clients,
  onClose,
  onSubmit,
}: {
  open: boolean;
  presupuesto: Presupuesto | null;
  clients: Cliente[];
  onClose: () => void;
  onSubmit: (draft: Omit<Presupuesto, "id" | "createdAt" | "updatedAt" | "saldo" | "subtotal" | "total" | "senaSugerida">) => void;
}) => {
  const [form, setForm] = useState<Omit<Presupuesto, "id" | "createdAt" | "updatedAt" | "saldo" | "subtotal" | "total" | "senaSugerida">>({
    clienteId: presupuesto?.clienteId || "",
    fecha: presupuesto?.fecha || todayStr(),
    estado: presupuesto?.estado || "borrador",
    descuento: presupuesto?.descuento || 0,
    sena: presupuesto?.sena || presupuesto?.senaSugerida || 0,
    observaciones: presupuesto?.observaciones || "",
    items: presupuesto?.items || [emptyItem()],
    trabajoId: presupuesto?.trabajoId,
  });
  const [clientSearch, setClientSearch] = useState("");
  const filteredClients = clients
    .filter((client) => `${client.nombre} ${client.telefono} ${client.localidad}`.toLowerCase().includes(clientSearch.toLowerCase()))
    .slice(0, 40);
  const subtotal = roundMoney(form.items.reduce((sum, item) => sum + item.subtotal, 0));
  const descuentoMonto = roundMoney(subtotal * (Math.max(form.descuento, 0) / 100));
  const total = roundMoney(Math.max(subtotal - descuentoMonto, 0));
  const sena = roundMoney(Math.min(Math.max(form.sena || 0, 0), total));

  const updateItem = (index: number, patch: Partial<PresupuestoItem>) =>
    setForm((current) => {
      const next = [...current.items];
      const merged = { ...next[index], ...patch };
      merged.subtotal = roundMoney(merged.cantidad * merged.precioUnitario);
      next[index] = merged;
      return { ...current, items: next };
    });

  return (
    <Modal open={open} title={presupuesto ? "Editar presupuesto" : "Nuevo presupuesto"} onClose={onClose}>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.clienteId) {
            window.alert("No permitir presupuesto sin cliente.");
            return;
          }
          if (form.items.some((item) => !item.descripcion.trim() || item.cantidad <= 0 || item.precioUnitario <= 0)) {
            window.alert("Cada item necesita descripción, cantidad y precio.");
            return;
          }
          if (!["Aberturas", "Cristales"].includes(form.items[0]?.tipo || "")) {
            window.alert("El rubro del presupuesto debe ser Aberturas o Cristales.");
            return;
          }
          onSubmit({ ...form, sena });
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Cliente">
            <Input value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} placeholder="Buscar por nombre, telefono o localidad" />
            <Select value={form.clienteId} onChange={(event) => setForm((current) => ({ ...current, clienteId: event.target.value }))}>
              <option value="">Seleccionar cliente</option>
              {filteredClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fecha">
            <Input type="date" value={form.fecha} onChange={(event) => setForm((current) => ({ ...current, fecha: event.target.value }))} />
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as EstadoPresupuesto }))}>
              {["borrador", "enviado", "aprobado", "rechazado", "vencido"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="space-y-3">
          {form.items.map((item, index) => (
            <Card key={`${item.id}-${index}`} className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Descripción">
                  <Input value={item.descripcion} onChange={(event) => updateItem(index, { descripcion: event.target.value })} />
                </Field>
                <Field label={index === 0 ? "Rubro para trabajo" : "Tipo"}>
                  {index === 0 ? (
                    <Select value={item.tipo} onChange={(event) => updateItem(index, { tipo: event.target.value })}>
                      <option value="">Seleccionar rubro</option>
                      <option value="Aberturas">Aberturas</option>
                      <option value="Cristales">Cristales</option>
                    </Select>
                  ) : (
                    <Input value={item.tipo} onChange={(event) => updateItem(index, { tipo: event.target.value })} />
                  )}
                </Field>
                <Field label="Cantidad">
                  <Input type="number" value={item.cantidad} onChange={(event) => updateItem(index, { cantidad: Number(event.target.value) })} />
                </Field>
                <Field label="Ancho">
                  <Input type="number" value={item.ancho} onChange={(event) => updateItem(index, { ancho: Number(event.target.value) })} />
                </Field>
                <Field label="Alto">
                  <Input type="number" value={item.alto} onChange={(event) => updateItem(index, { alto: Number(event.target.value) })} />
                </Field>
                <Field label="Precio unitario">
                  <Input type="number" value={item.precioUnitario} onChange={(event) => updateItem(index, { precioUnitario: Number(event.target.value) })} />
                </Field>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">Subtotal item: {formatMoney(item.subtotal)}</span>
                <Button
                  variant="danger"
                  onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}
                >
                  Quitar
                </Button>
              </div>
            </Card>
          ))}
          <Button variant="secondary" onClick={() => setForm((current) => ({ ...current, items: [...current.items, emptyItem()] }))}>
            Agregar item
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Descuento (%)">
            <Input type="number" min={0} max={100} value={form.descuento} onChange={(event) => setForm((current) => ({ ...current, descuento: Number(event.target.value) }))} />
          </Field>
          <Field label="Seña a solicitar">
            <Input type="number" min={0} step="0.01" value={form.sena} onChange={(event) => setForm((current) => ({ ...current, sena: Number(event.target.value) }))} />
          </Field>
          <Field label="Observaciones">
            <Textarea value={form.observaciones} onChange={(event) => setForm((current) => ({ ...current, observaciones: event.target.value }))} />
          </Field>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <p><span className="text-slate-500">Subtotal</span><br /><strong>{formatMoney(subtotal)}</strong></p>
            <p><span className="text-slate-500">Descuento</span><br /><strong>{formatMoney(descuentoMonto)}</strong></p>
            <p><span className="text-slate-500">Total</span><br /><strong>{formatMoney(total)}</strong></p>
            <p><span className="text-slate-500">Saldo luego de seña</span><br /><strong>{formatMoney(Math.max(total - sena, 0))}</strong></p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
