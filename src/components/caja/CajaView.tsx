import { useMemo, useState } from "react";
import { formatDate } from "../../lib/dates";
import { formatMoney } from "../../lib/money";
import type { CategoriaCaja, CrmDataSnapshot, MetodoPago, Pago, TipoMovimiento } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Field, Input, Select, Textarea } from "../ui/Form";
import { Modal } from "../ui/Modal";

const todayStr = () => new Date().toISOString().split("T")[0];
const currentMonth = () => new Date().toISOString().slice(0, 7);

const metodoPagoLabels: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  cheque: "Cheque",
  tarjeta: "Tarjeta",
  mercado_pago: "Mercado Pago",
  otro: "Otro",
};

const categoriaLabels: Record<CategoriaCaja, string> = {
  cobro_cliente: "Cobro cliente",
  sena: "Seña",
  saldo_cobrado: "Saldo cobrado",
  gasto_operativo: "Gasto operativo",
  gasto_materiales: "Gasto materiales",
  pago_proveedor: "Pago proveedor",
  otro: "Otro",
};

export const CajaView = ({
  snapshot,
  onSave,
}: {
  snapshot: CrmDataSnapshot;
  onSave: (draft: Omit<Pago, "id" | "createdAt">) => Promise<unknown> | void;
}) => {
  const [open, setOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState<TipoMovimiento | "todos">("todos");
  const [filterCategoria, setFilterCategoria] = useState<CategoriaCaja | "todas">("todas");
  const [search, setSearch] = useState("");

  const month = currentMonth();

  const stats = useMemo(() => {
    const ingresos = snapshot.pagos.filter((p) => !p.tipo || p.tipo === "ingreso");
    const egresos = snapshot.pagos.filter((p) => p.tipo === "egreso");
    const ingresosTotal = ingresos.reduce((s, p) => s + p.monto, 0);
    const egresosTotal = egresos.reduce((s, p) => s + p.monto, 0);
    const ingresosMes = ingresos.filter((p) => p.fecha.startsWith(month)).reduce((s, p) => s + p.monto, 0);
    const egresosMes = egresos.filter((p) => p.fecha.startsWith(month)).reduce((s, p) => s + p.monto, 0);
    const pendienteTotal = snapshot.trabajos.reduce((s, t) => s + t.saldo, 0);
    return {
      ingresosTotal,
      egresosTotal,
      saldoTotal: ingresosTotal - egresosTotal,
      ingresosMes,
      egresosMes,
      balanceMes: ingresosMes - egresosMes,
      pendienteTotal,
    };
  }, [snapshot.pagos, snapshot.trabajos, month]);

  const movimientos = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = filterTipo === "todos"
      ? snapshot.pagos
      : snapshot.pagos.filter((p) => (filterTipo === "ingreso" ? !p.tipo || p.tipo === "ingreso" : p.tipo === "egreso"));
    return list
      .filter((p) => filterCategoria === "todas" || p.categoria === filterCategoria)
      .filter((p) => {
        if (!query) return true;
        const cliente = snapshot.clientes.find((c) => c.id === p.clienteId);
        const trabajo = snapshot.trabajos.find((t) => t.id === p.trabajoId);
        return `${p.concepto} ${p.observaciones} ${cliente?.nombre || ""} ${trabajo?.titulo || ""} ${p.presupuestoId || ""}`.toLowerCase().includes(query);
      })
      .sort((a, b) => `${b.fecha} ${b.createdAt}`.localeCompare(`${a.fecha} ${a.createdAt}`));
  }, [snapshot.pagos, snapshot.clientes, snapshot.trabajos, filterTipo, filterCategoria, search]);

  return (
    <div className="space-y-6 p-6">
      {/* KPIs principales */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Ingresos del mes"
          value={formatMoney(stats.ingresosMes)}
          tone="income"
          sub="Solo este mes"
        />
        <KpiCard
          label="Salidas del mes"
          value={formatMoney(stats.egresosMes)}
          tone="expense"
          sub="Solo este mes"
        />
        <KpiCard
          label="Balance del mes"
          value={formatMoney(stats.balanceMes)}
          tone={stats.balanceMes >= 0 ? "income" : "expense"}
          sub="Ingresos - Salidas"
        />
        <KpiCard
          label="Pendiente por cobrar"
          value={formatMoney(stats.pendienteTotal)}
          tone="pending"
          sub="Saldo de trabajos"
        />
      </div>

      {/* Saldo total */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-base text-emerald-700">↑</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ingresos totales</p>
            <p className="font-display text-xl font-bold text-emerald-700">{formatMoney(stats.ingresosTotal)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <span className="text-base text-red-600">↓</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Salidas totales</p>
            <p className="font-display text-xl font-bold text-red-600">{formatMoney(stats.egresosTotal)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
            <span className="text-base text-brand-700">=</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo total</p>
            <p className={`font-display text-xl font-bold ${stats.saldoTotal >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {formatMoney(stats.saldoTotal)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filtros + Accion */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["todos", "ingreso", "egreso"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterTipo(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filterTipo === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "todos" ? "Todos" : f === "ingreso" ? "Ingresos" : "Salidas"}
            </button>
          ))}
          <Select value={filterCategoria} onChange={(event) => setFilterCategoria(event.target.value as CategoriaCaja | "todas")} className="!h-9 w-48">
            <option value="todas">Todas las categorias</option>
            {Object.entries(categoriaLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Input className="!h-9 w-72" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente, concepto o trabajo" />
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}>
          + Registrar movimiento
        </Button>
      </div>

      {/* Tabla de movimientos */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3">
          <h3 className="font-display text-sm font-semibold text-slate-700">Movimientos de caja</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Método</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Referencia</th>
                <th className="px-5 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    Sin movimientos registrados
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => {
                  const isIngreso = !mov.tipo || mov.tipo === "ingreso";
                  const cliente = snapshot.clientes.find((c) => c.id === mov.clienteId);
                  const presupuesto = mov.presupuestoId ? snapshot.presupuestos.find((q) => q.id === mov.presupuestoId) : undefined;
                  const trabajo = mov.trabajoId ? snapshot.trabajos.find((t) => t.id === mov.trabajoId) : undefined;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(mov.fecha)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isIngreso ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {isIngreso ? "↑ Ingreso" : "↓ Salida"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{mov.concepto || mov.observaciones || "-"}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {mov.categoria ? categoriaLabels[mov.categoria] || mov.categoria : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {mov.metodo ? metodoPagoLabels[mov.metodo] || mov.metodo : "-"}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{cliente?.nombre || "-"}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {presupuesto?.id || trabajo?.id ? (
                          <span>{[presupuesto?.id, trabajo?.id].filter(Boolean).join(" / ")}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-display text-base font-bold ${isIngreso ? "text-emerald-700" : "text-red-600"}`}>
                        {isIngreso ? "+" : "-"}{formatMoney(mov.monto)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <MovimientoModal
        key={open ? "open" : "closed"}
        open={open}
        snapshot={snapshot}
        onClose={() => setOpen(false)}
        onSubmit={async (draft) => {
          if (draft.monto <= 0) {
            window.alert("El monto debe ser mayor a cero.");
            return;
          }
          await onSave(draft);
          setOpen(false);
        }}
      />
    </div>
  );
};

const KpiCard = ({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "pending" | "neutral";
  sub?: string;
}) => {
  const accent = {
    income: "text-emerald-700",
    expense: "text-red-600",
    pending: "text-amber-600",
    neutral: "text-slate-900",
  }[tone];
  const bg = {
    income: "from-emerald-50 to-white",
    expense: "from-red-50 to-white",
    pending: "from-amber-50 to-white",
    neutral: "from-slate-50 to-white",
  }[tone];
  return (
    <Card className={`bg-gradient-to-br p-5 ${bg}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${accent}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
    </Card>
  );
};

const MovimientoModal = ({
  open,
  snapshot,
  onClose,
  onSubmit,
}: {
  open: boolean;
  snapshot: CrmDataSnapshot;
  onClose: () => void;
  onSubmit: (draft: Omit<Pago, "id" | "createdAt">) => Promise<unknown> | void;
}) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Pago, "id" | "createdAt">>({
    tipo: "ingreso",
    concepto: "",
    categoria: "cobro_cliente",
    clienteId: undefined,
    presupuestoId: undefined,
    trabajoId: undefined,
    fecha: todayStr(),
    monto: 0,
    metodo: "transferencia",
    observaciones: "",
  });
  const presupuestos = snapshot.presupuestos.filter((quote) => !form.clienteId || quote.clienteId === form.clienteId);
  const trabajos = snapshot.trabajos.filter((job) => !form.clienteId || job.clienteId === form.clienteId);

  return (
    <Modal open={open} title="Registrar movimiento de caja" onClose={onClose}>
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await onSubmit(form);
          } finally {
            setSaving(false);
          }
        }}
      >
        <Field label="Tipo">
          <Select
            value={form.tipo}
            onChange={(e) => {
              const tipo = e.target.value as TipoMovimiento;
              setForm((c) => ({
                ...c,
                tipo,
                categoria: tipo === "ingreso" ? "cobro_cliente" : "gasto_operativo",
              }));
            }}
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Salida / Egreso</option>
          </Select>
        </Field>
        <Field label="Concepto">
          <Input
            placeholder="Breve descripcion"
            value={form.concepto}
            onChange={(e) => setForm((c) => ({ ...c, concepto: e.target.value }))}
          />
        </Field>
        <Field label="Categoría">
          <Select value={form.categoria} onChange={(e) => setForm((c) => ({ ...c, categoria: e.target.value as CategoriaCaja }))}>
            {form.tipo === "ingreso" ? (
              <>
                <option value="cobro_cliente">Cobro cliente</option>
                <option value="sena">Seña</option>
                <option value="saldo_cobrado">Saldo cobrado</option>
                <option value="otro">Otro ingreso</option>
              </>
            ) : (
              <>
                <option value="gasto_operativo">Gasto operativo</option>
                <option value="gasto_materiales">Gasto materiales</option>
                <option value="pago_proveedor">Pago proveedor</option>
                <option value="otro">Otro gasto</option>
              </>
            )}
          </Select>
        </Field>
        <Field label="Método de pago">
          <Select value={form.metodo} onChange={(e) => setForm((c) => ({ ...c, metodo: e.target.value as MetodoPago }))}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cheque">Cheque</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="otro">Otro</option>
          </Select>
        </Field>
        <Field label="Fecha">
          <Input type="date" value={form.fecha} onChange={(e) => setForm((c) => ({ ...c, fecha: e.target.value }))} />
        </Field>
        <Field label="Monto">
          <Input type="number" min={0} step="0.01" value={form.monto} onChange={(e) => setForm((c) => ({ ...c, monto: Number(e.target.value) }))} />
        </Field>
        <Field label="Cliente (opcional)">
          <Select
            value={form.clienteId || ""}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                clienteId: e.target.value || undefined,
                presupuestoId: undefined,
                trabajoId: undefined,
              }))
            }
          >
            <option value="">Sin cliente</option>
            {snapshot.clientes.map((cl) => (
              <option key={cl.id} value={cl.id}>{cl.nombre}</option>
            ))}
          </Select>
        </Field>
        <Field label="Presupuesto (opcional)">
          <Select
            value={form.presupuestoId || ""}
            onChange={(e) => {
              const presupuesto = snapshot.presupuestos.find((q) => q.id === e.target.value);
              setForm((c) => ({
                ...c,
                presupuestoId: presupuesto?.id,
                clienteId: presupuesto?.clienteId || c.clienteId,
                trabajoId: presupuesto?.trabajoId || c.trabajoId,
              }));
            }}
          >
            <option value="">Sin presupuesto</option>
            {presupuestos.map((quote) => {
              const cliente = snapshot.clientes.find((cl) => cl.id === quote.clienteId);
              return (
                <option key={quote.id} value={quote.id}>
                  {quote.id} - {cliente?.nombre || "Cliente"}
                </option>
              );
            })}
          </Select>
        </Field>
        <Field label="Trabajo (opcional)">
          <Select
            value={form.trabajoId || ""}
            onChange={(e) => {
              const trabajo = snapshot.trabajos.find((t) => t.id === e.target.value);
              setForm((c) => ({
                ...c,
                trabajoId: trabajo?.id,
                clienteId: trabajo?.clienteId || c.clienteId,
                presupuestoId: trabajo?.presupuestoId || c.presupuestoId,
              }));
            }}
          >
            <option value="">Sin trabajo</option>
            {trabajos.map((t) => (
              <option key={t.id} value={t.id}>{t.titulo}</option>
            ))}
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Observaciones">
            <Textarea value={form.observaciones} onChange={(e) => setForm((c) => ({ ...c, observaciones: e.target.value }))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar movimiento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
