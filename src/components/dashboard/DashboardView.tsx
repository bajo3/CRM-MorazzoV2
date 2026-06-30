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
    .filter((event) => event.tipo === "instalacion" && event.estado !== "cancelado")
    .sort((a, b) => compareByDateAsc(a.fecha, b.fecha))
    .slice(0, 4);
  const urgentJobs = snapshot.trabajos
    .filter((job) => activeProductionStates.includes(job.estadoProduccion))
    .sort((a, b) => {
      const score = { urgente: 0, alta: 1, media: 2, normal: 3 };
      return score[a.prioridad] - score[b.prioridad] || a.fechaPrometida.localeCompare(b.fechaPrometida);
    })
    .slice(0, 8);

  const byFactory: Record<string, number> = {};
  snapshot.trabajos.forEach((job) => {
    byFactory[job.fabricaAsignada] = (byFactory[job.fabricaAsignada] || 0) + 1;
  });

  return (
    <div className="space-y-5 p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Presupuestos abiertos" value={String(stats.presupuestosPendientes)} tone="default" />
        <KpiCard label="Trabajos en curso" value={String(stats.trabajosEnProduccion)} tone="default" />
        <KpiCard label="Atrasados" value={String(stats.trabajosAtrasados)} tone="danger" />
        <KpiCard label="Terminados" value={String(stats.trabajosListos)} tone="success" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CashCard label="Entro este mes" value={formatMoney(stats.ingresosDelMes)} tone="income" />
        <CashCard label="Salio este mes" value={formatMoney(stats.egresosDelMes)} tone="expense" />
        <CashCard label="Caja actual" value={formatMoney(stats.saldoCaja)} tone={stats.saldoCaja >= 0 ? "income" : "expense"} />
        <CashCard label="Por cobrar" value={formatMoney(stats.saldoPendienteTotal)} tone="pending" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">Mirar primero</h2>
              <p className="mt-0.5 text-sm text-slate-500">Trabajos activos ordenados por urgencia.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">{urgentJobs.length}</span>
          </div>

          {urgentJobs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No hay trabajos activos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-2.5">Cliente</th>
                    <th className="pb-2.5">Trabajo</th>
                    <th className="pb-2.5">Estado</th>
                    <th className="pb-2.5">Fecha</th>
                    <th className="pb-2.5">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {urgentJobs.map((job) => {
                    const delayed = isPastDate(job.fechaPrometida);
                    const client = snapshot.clientes.find((item) => item.id === job.clienteId);
                    return (
                      <tr key={job.id} className="hover:bg-slate-50/60">
                        <td className="py-3 font-medium text-slate-900">{client?.nombre || "-"}</td>
                        <td className="max-w-[260px] py-3 text-slate-600">
                          <p className="line-clamp-1">{job.descripcion || job.titulo}</p>
                        </td>
                        <td className="py-3"><Badge value={job.estadoProduccion} /></td>
                        <td className={`py-3 text-xs font-semibold ${delayed ? "text-red-600" : "text-slate-600"}`}>
                          {delayed ? "Atrasado: " : ""}{formatDate(job.fechaPrometida)}
                        </td>
                        <td className="py-3"><Badge value={job.prioridad} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-bold text-slate-900">Taller</h2>
            <div className="space-y-2">
              {Object.entries(byFactory).map(([factory, count]) => (
                <div key={factory} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-slate-700">{fabricaLabels[factory as keyof typeof fabricaLabels] || factory}</span>
                  <span className="font-display text-lg font-bold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-bold text-slate-900">Proximas colocaciones</h2>
            {nextInstallations.length === 0 ? (
              <p className="text-sm text-slate-400">No hay colocaciones programadas.</p>
            ) : (
              <div className="space-y-2.5">
                {nextInstallations.map((event) => (
                  <div key={event.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-sm font-semibold text-slate-900">{event.titulo}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatDate(event.fecha)} - {event.hora}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "success";
}) => {
  const valueClass = tone === "danger" ? "text-red-600" : tone === "success" ? "text-emerald-600" : "text-slate-900";
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-slate-400">{label}</p>
      <p className={`mt-3 font-display text-3xl font-bold ${valueClass}`}>{value}</p>
    </Card>
  );
};

const CashCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "pending" | "neutral";
}) => {
  const valueClass = {
    income: "text-emerald-700",
    expense: "text-red-600",
    pending: "text-amber-700",
    neutral: "text-slate-900",
  }[tone];
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-slate-400">{label}</p>
      <p className={`mt-3 font-display text-2xl font-bold ${valueClass}`}>{value}</p>
    </Card>
  );
};
