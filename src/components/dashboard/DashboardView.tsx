import { compareByDateAsc, formatDate, isPastDate } from "../../lib/dates";
import { formatMoney } from "../../lib/money";
import { activeProductionStates, fabricaLabels } from "../../lib/workflow";
import { getDashboardStats } from "../../services/crmRepository";
import type { CrmDataSnapshot } from "../../types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

export const DashboardView = ({ snapshot }: { snapshot: CrmDataSnapshot }) => {
  const stats = getDashboardStats(snapshot);
  const nextInstallations = snapshot.agenda
    .filter((e) => e.tipo === "instalacion" && e.estado !== "cancelado")
    .sort((a, b) => compareByDateAsc(a.fecha, b.fecha))
    .slice(0, 4);
  const urgentJobs = snapshot.trabajos
    .filter((j) => activeProductionStates.includes(j.estadoProduccion))
    .sort((a, b) => {
      const s = { urgente: 0, alta: 1, media: 2, normal: 3 };
      return s[a.prioridad] - s[b.prioridad] || a.fechaPrometida.localeCompare(b.fechaPrometida);
    })
    .slice(0, 8);

  const byFactory: Record<string, number> = {};
  snapshot.trabajos.forEach((j) => { byFactory[j.fabricaAsignada] = (byFactory[j.fabricaAsignada] || 0) + 1; });

  return (
    <div className="space-y-5 p-5">
      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Presupuestos pendientes" value={String(stats.presupuestosPendientes)} icon="📋" tone="default" />
        <KpiCard label="En producción" value={String(stats.trabajosEnProduccion)} icon="⚙️" tone="default" />
        <KpiCard label="Atrasados" value={String(stats.trabajosAtrasados)} icon="⚠️" tone="danger" />
        <KpiCard label="Listos" value={String(stats.trabajosListos)} icon="✓" tone="success" />
      </div>

      {/* Cash row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CashCard label="Ingresos del mes" value={formatMoney(stats.ingresosDelMes)} icon="↑" tone="income" />
        <CashCard label="Salidas del mes" value={formatMoney(stats.egresosDelMes)} icon="↓" tone="expense" />
        <CashCard label="Saldo de caja" value={formatMoney(stats.saldoCaja)} icon="=" tone={stats.saldoCaja >= 0 ? "income" : "expense"} />
        <CashCard label="Saldo por cobrar" value={formatMoney(stats.saldoPendienteTotal)} icon="$" tone="pending" />
      </div>

      {/* Main content */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        {/* Urgent jobs table */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">Trabajos activos</h2>
            <span className="text-xs text-slate-400">{urgentJobs.length} visibles</span>
          </div>
          {urgentJobs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Sin trabajos activos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-2.5">Orden</th>
                    <th className="pb-2.5">Cliente</th>
                    <th className="pb-2.5">Rubro</th>
                    <th className="pb-2.5">Estado</th>
                    <th className="pb-2.5">Prometida</th>
                    <th className="pb-2.5">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {urgentJobs.map((job) => {
                    const delayed = isPastDate(job.fechaPrometida);
                    return (
                      <tr key={job.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 font-mono text-xs text-slate-500">{job.id}</td>
                        <td className="py-2.5 font-medium text-slate-800">{snapshot.clientes.find((c) => c.id === job.clienteId)?.nombre || "-"}</td>
                        <td className="py-2.5"><Badge value={job.rubro} /></td>
                        <td className="py-2.5"><Badge value={job.estadoProduccion} /></td>
                        <td className={`py-2.5 text-xs font-semibold ${delayed ? "text-red-600" : "text-slate-600"}`}>
                          {delayed && "⚠ "}{formatDate(job.fechaPrometida)}
                        </td>
                        <td className="py-2.5"><Badge value={job.prioridad} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Sidebar panels */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-bold text-slate-900">Producción por área</h2>
            <div className="space-y-2">
              {Object.entries(byFactory).map(([factory, count]) => (
                <div key={factory} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${factory === "pvc" ? "bg-brand-600" : factory === "vidrios" ? "bg-cyan-500" : "bg-slate-400"}`} />
                    <span className="text-sm font-medium text-slate-700">{fabricaLabels[factory as keyof typeof fabricaLabels] || factory}</span>
                  </div>
                  <span className="font-display text-lg font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-bold text-slate-900">Próximas colocaciones</h2>
            {nextInstallations.length === 0 ? (
              <p className="text-sm text-slate-400">Sin colocaciones programadas</p>
            ) : (
              <div className="space-y-2.5">
                {nextInstallations.map((event) => (
                  <div key={event.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="font-semibold text-sm text-slate-900">{event.titulo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatDate(event.fecha)} · {event.hora}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Flow pipeline */}
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-bold text-slate-900">Flujo comercial</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { step: "01", label: "Cliente", desc: "Alta y seguimiento" },
            { step: "02", label: "Presupuesto", desc: "Cotización aprobada" },
            { step: "03", label: "Trabajo creado", desc: "Orden generada" },
            { step: "04", label: "Producción", desc: "Aberturas / Cristales" },
            { step: "05", label: "Listo", desc: "Control aprobado" },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex shrink-0 items-center gap-2">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-sm min-w-[120px]">
                <span className="text-xs font-bold text-brand-600">{item.step}</span>
                <p className="mt-0.5 font-semibold text-sm text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-400">{item.desc}</p>
              </div>
              {i < arr.length - 1 && (
                <span className="text-brand-300 text-lg font-light">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const KpiCard = ({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: string;
  tone?: "default" | "danger" | "success";
}) => {
  const valueClass = tone === "danger" ? "text-red-600" : tone === "success" ? "text-emerald-600" : "text-slate-900";
  const iconBg = tone === "danger" ? "bg-red-50 text-red-500" : tone === "success" ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 leading-tight">{label}</p>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${iconBg}`}>{icon}</span>
      </div>
      <p className={`mt-3 font-display text-3xl font-bold ${valueClass}`}>{value}</p>
    </Card>
  );
};

const CashCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: string;
  tone: "income" | "expense" | "pending" | "neutral";
}) => {
  const colors = {
    income: { val: "text-emerald-700", bg: "bg-emerald-50", icon: "text-emerald-600" },
    expense: { val: "text-red-600", bg: "bg-red-50", icon: "text-red-500" },
    pending: { val: "text-amber-700", bg: "bg-amber-50", icon: "text-amber-600" },
    neutral: { val: "text-slate-900", bg: "bg-slate-50", icon: "text-slate-500" },
  }[tone];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 leading-tight">{label}</p>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base font-bold ${colors.bg} ${colors.icon}`}>{icon}</span>
      </div>
      <p className={`mt-3 font-display text-2xl font-bold ${colors.val}`}>{value}</p>
    </Card>
  );
};
