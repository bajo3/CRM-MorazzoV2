import { useEffect, useMemo, useRef, useState } from "react";
import { AgendaView } from "./components/agenda/AgendaView";
import { CajaView } from "./components/caja/CajaView";
import { ClientesView } from "./components/clientes/ClientesView";
import { DashboardView } from "./components/dashboard/DashboardView";
import { FabricaView } from "./components/fabrica/FabricaView";
import { Sidebar, type Screen } from "./components/layout/Sidebar";
import { PageHeader } from "./components/layout/PageHeader";
import { MonitorView } from "./components/monitor/MonitorView";
import { ObrasControlView } from "./components/obras/ObrasControlView";
import { PresupuestosView } from "./components/presupuestos/PresupuestosView";
import { TrabajosView } from "./components/trabajos/TrabajosView";
import { createId } from "./lib/ids";
import { roundMoney } from "./lib/money";
import { ensureEstadoForFactory, getFactoryForRubro, normalizeRubroTrabajo } from "./lib/workflow";
import { createCrmRepository, normalizeSnapshot } from "./services/crmRepository";
import type { AgendaEvento, Cliente, CrmDataSnapshot, EstadoTrabajo, Pago, Presupuesto, RubroTrabajo, Trabajo } from "./types";

const repository = createCrmRepository();
const nowIso = () => new Date().toISOString();

const inferRubroFromQuote = (quote: Presupuesto): RubroTrabajo => {
  const tipo = `${quote.items[0]?.tipo || ""} ${quote.items[0]?.descripcion || ""}`.toLowerCase();
  if (tipo.includes("cristal") || tipo.includes("vidrio") || tipo.includes("templado") || tipo.includes("mampara") || tipo.includes("dvh") || tipo.includes("espejo")) return "vidrio";
  return "pvc";
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [snapshot, setSnapshot] = useState<CrmDataSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const snapshotRef = useRef<CrmDataSnapshot | null>(null);
  const saveQueueRef = useRef<Promise<unknown>>(Promise.resolve());
  const persistVersionRef = useRef(0);

  useEffect(() => {
    repository.getSnapshot().then((data) => {
      snapshotRef.current = data;
      setSnapshot(data);
      setError(null);
    }).catch((err) => {
      console.error("Error loading snapshot:", err);
      setError(err instanceof Error ? err.message : "No se pudo cargar la informacion del CRM.");
    });
  }, []);

  const persist = async (next: CrmDataSnapshot) => {
    const previous = snapshotRef.current;
    const normalized = normalizeSnapshot(next);
    const version = persistVersionRef.current + 1;
    persistVersionRef.current = version;
    snapshotRef.current = normalized;
    setSnapshot(normalized);
    try {
      setError(null);
      const saveOperation = saveQueueRef.current.then(() => repository.saveSnapshot(normalized));
      saveQueueRef.current = saveOperation.catch(() => undefined);
      const saved = await saveOperation;
      if (persistVersionRef.current === version) {
        snapshotRef.current = saved;
        setSnapshot(saved);
      }
      return true;
    } catch (err) {
      console.error("Error saving snapshot:", err);
      setError(err instanceof Error ? err.message : "No se pudo guardar. Revisa la conexion y volve a intentar.");
      if (previous && persistVersionRef.current === version) {
        snapshotRef.current = previous;
        setSnapshot(previous);
      }
      return false;
    }
  };

  const content = useMemo(() => {
    if (screen === "obras") {
      return (
        <div className="flex min-h-screen flex-col">
          <PageHeader title="Control de obras" subtitle="Seguimiento compartido con Google Sheets" />
          <div className="flex-1"><ObrasControlView /></div>
        </div>
      );
    }

    if (!snapshot) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="text-sm text-slate-500">Cargando el sistema...</p>
            {error ? <p className="mt-3 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
          </div>
        </div>
      );
    }

    const latestSnapshot = () => snapshotRef.current ?? snapshot;

    const saveCliente = (draft: Omit<Cliente, "id" | "createdAt" | "updatedAt">, existingId?: string) => {
      const baseSnapshot = latestSnapshot();
      const current = nowIso();
      const clientes = existingId
        ? baseSnapshot.clientes.map((item) => (item.id === existingId ? { ...item, ...draft, updatedAt: current } : item))
        : [...baseSnapshot.clientes, { ...draft, id: createId("CLI"), createdAt: current, updatedAt: current }];
      void persist({ ...baseSnapshot, clientes });
    };

    const savePresupuesto = (
      draft: Omit<Presupuesto, "id" | "createdAt" | "updatedAt" | "saldo" | "subtotal" | "total" | "senaSugerida">,
      existingId?: string,
    ) => {
      const baseSnapshot = latestSnapshot();
      const current = nowIso();
      const items = draft.items.map((item) => ({
        ...item,
        id: item.id || createId("ITE"),
        subtotal: roundMoney(item.cantidad * item.precioUnitario),
      }));
      const base = { ...draft, items, subtotal: 0, total: 0, saldo: 0, senaSugerida: 0 };
      const presupuestos = existingId
        ? baseSnapshot.presupuestos.map((item) => (item.id === existingId ? { ...item, ...base, updatedAt: current } : item))
        : [...baseSnapshot.presupuestos, { ...base, id: createId("PRE"), createdAt: current, updatedAt: current }];
      void persist({ ...baseSnapshot, presupuestos });
    };

    const saveTrabajo = (
      draft: Omit<Trabajo, "id" | "createdAt" | "updatedAt" | "historial">,
      existingId?: string,
    ) => {
      const baseSnapshot = latestSnapshot();
      const current = nowIso();
      const rubro = normalizeRubroTrabajo(draft.rubro);
      const fabricaAsignada = getFactoryForRubro(rubro);
      const normalizedDraft = {
        ...draft,
        rubro,
        fabricaAsignada,
        estadoProduccion: ensureEstadoForFactory(fabricaAsignada, draft.estadoProduccion),
        saldo: roundMoney(Math.max(draft.total - draft.sena, 0)),
      };
      const trabajos = existingId
        ? baseSnapshot.trabajos.map((item) => (item.id === existingId ? { ...item, ...normalizedDraft, updatedAt: current } : item))
        : [
            ...baseSnapshot.trabajos,
            {
              ...normalizedDraft,
              id: createId("TRA"),
              historial: [{ id: createId("HIS"), estado: normalizedDraft.estadoProduccion, fecha: current, nota: "Trabajo creado manualmente." }],
              createdAt: current,
              updatedAt: current,
            },
          ];
      void persist({ ...baseSnapshot, trabajos });
    };

    const updateTrabajoState = (id: string, estado: EstadoTrabajo) => {
      const baseSnapshot = latestSnapshot();
      const current = nowIso();
      if (!baseSnapshot.trabajos.some((item) => item.id === id)) return;
      const trabajos = baseSnapshot.trabajos.map((item) => {
        if (item.id !== id) return item;
        const safeState = ensureEstadoForFactory(item.fabricaAsignada, estado);
        const estadoComercial: Trabajo["estadoComercial"] =
          safeState === "terminado" || safeState === "colocado"
            ? "listo"
            : safeState === "entregado" || safeState === "cerrado"
            ? "entregado"
            : "en_produccion";
        return {
          ...item,
          estadoProduccion: safeState,
          estadoComercial,
          updatedAt: current,
          historial: [...item.historial, { id: createId("HIS"), estado: safeState, fecha: current, nota: "Estado actualizado." }],
        };
      });
      void persist({ ...baseSnapshot, trabajos });
    };

    const archiveTrabajo = (id: string) => {
      updateTrabajoState(id, "cerrado");
    };

    const saveAgenda = (draft: Omit<AgendaEvento, "id" | "createdAt" | "updatedAt">, existingId?: string) => {
      const baseSnapshot = latestSnapshot();
      const current = nowIso();
      const agenda = existingId
        ? baseSnapshot.agenda.map((item) => (item.id === existingId ? { ...item, ...draft, updatedAt: current } : item))
        : [...baseSnapshot.agenda, { ...draft, id: createId("AGE"), createdAt: current, updatedAt: current }];
      void persist({ ...baseSnapshot, agenda });
    };

    const savePago = (draft: Omit<Pago, "id" | "createdAt">) => {
      const baseSnapshot = latestSnapshot();
      const pagos = [...baseSnapshot.pagos, { ...draft, id: createId("PAG"), createdAt: nowIso() }];
      return persist({ ...baseSnapshot, pagos });
    };

    const convertPresupuesto = (id: string) => {
      const baseSnapshot = latestSnapshot();
      const quote = baseSnapshot.presupuestos.find((item) => item.id === id);
      if (!quote || quote.trabajoId) return;
      const current = nowIso();
      const trabajoId = createId("TRA");
      const rubro = inferRubroFromQuote(quote);
      const fabricaAsignada = getFactoryForRubro(rubro);
      const trabajos: Trabajo[] = [
        ...baseSnapshot.trabajos,
        {
          id: trabajoId,
          clienteId: quote.clienteId,
          presupuestoId: quote.id,
          titulo: `Trabajo ${quote.id}`,
          rubro,
          fabricaAsignada,
          descripcion: quote.items.map((item) => item.descripcion).join(" / "),
          medidas: quote.items
            .map((item) => (item.ancho && item.alto ? `${item.ancho} x ${item.alto} mm` : "Medidas varias"))
            .join(" / "),
          cantidad: quote.items.reduce((sum, item) => sum + item.cantidad, 0),
          colorMaterial: quote.items[0]?.tipo || "A definir",
          estadoComercial: "aprobado",
          estadoProduccion: ensureEstadoForFactory(fabricaAsignada, "recibido"),
          prioridad: "normal",
          fechaIngreso: quote.fecha,
          fechaPrometida: quote.fecha,
          total: quote.total,
          sena: quote.senaSugerida,
          saldo: quote.saldo,
          observacionesInternas: quote.observaciones,
          historial: [{ id: createId("HIS"), estado: ensureEstadoForFactory(fabricaAsignada, "recibido"), fecha: current, nota: "Generado desde presupuesto aprobado." }],
          archivosAdjuntos: [],
          createdAt: current,
          updatedAt: current,
        },
      ];
      const presupuestos = baseSnapshot.presupuestos.map((item) =>
        item.id === id ? { ...item, estado: "aprobado" as const, trabajoId, updatedAt: current } : item,
      );
      void persist({ ...baseSnapshot, presupuestos, trabajos });
    };

    const remove = <T extends { id: string }>(collection: T[], id: string) =>
      collection.filter((item) => item.id !== id);

    const deleteCliente = (id: string) => {
      const baseSnapshot = latestSnapshot();
      void persist({
        ...baseSnapshot,
        clientes: remove(baseSnapshot.clientes, id),
        presupuestos: baseSnapshot.presupuestos.map((item) => (item.clienteId === id ? { ...item, clienteId: "" } : item)),
        trabajos: baseSnapshot.trabajos.map((item) => (item.clienteId === id ? { ...item, clienteId: "" } : item)),
        agenda: baseSnapshot.agenda.map((item) => (item.clienteId === id ? { ...item, clienteId: undefined } : item)),
        pagos: baseSnapshot.pagos.map((item) => (item.clienteId === id ? { ...item, clienteId: undefined } : item)),
      });
    };

    const deletePresupuesto = (id: string) => {
      const baseSnapshot = latestSnapshot();
      void persist({
        ...baseSnapshot,
        presupuestos: remove(baseSnapshot.presupuestos, id),
        trabajos: baseSnapshot.trabajos.map((item) => (item.presupuestoId === id ? { ...item, presupuestoId: undefined } : item)),
        pagos: baseSnapshot.pagos.filter((item) => item.presupuestoId !== id),
      });
    };

    const deleteTrabajo = (id: string) => {
      const baseSnapshot = latestSnapshot();
      void persist({
        ...baseSnapshot,
        presupuestos: baseSnapshot.presupuestos.map((item) => (item.trabajoId === id ? { ...item, trabajoId: undefined } : item)),
        trabajos: remove(baseSnapshot.trabajos, id),
        agenda: baseSnapshot.agenda.filter((item) => item.trabajoId !== id),
        pagos: baseSnapshot.pagos.filter((item) => item.trabajoId !== id),
      });
    };

    const deleteAgenda = (id: string) => {
      const baseSnapshot = latestSnapshot();
      void persist({ ...baseSnapshot, agenda: remove(baseSnapshot.agenda, id) });
    };

    const titles: Record<Screen, { title: string; subtitle: string }> = {
      dashboard: { title: "Inicio", subtitle: "Lo importante para trabajar hoy" },
      ventas: { title: "Clientes", subtitle: "Datos, contactos y trabajos de cada cliente" },
      presupuestos: { title: "Presupuestos", subtitle: "Precios, senas y aprobaciones" },
      trabajos: { title: "Trabajos", subtitle: "Pedidos activos y estado de avance" },
      obras: { title: "Control de obras", subtitle: "Seguimiento compartido con Google Sheets" },
      "fabrica-pvc": { title: "Aberturas", subtitle: "Trabajos de PVC y aluminio" },
      "fabrica-vidrios": { title: "Cristales", subtitle: "Vidrios, DVH, espejos y templados" },
      "fabrica-colocaciones": { title: "Colocar", subtitle: "Instalaciones pendientes y coordinadas" },
      monitor: { title: "TV taller", subtitle: "Vista simple para produccion" },
      agenda: { title: "Agenda", subtitle: "Visitas, mediciones y colocaciones" },
      caja: { title: "Caja", subtitle: "Entradas, salidas y saldos" },
    };

      const page = (() => {
      switch (screen) {
        case "dashboard":
          return <DashboardView snapshot={snapshot} />;
        case "ventas":
          return (
            <ClientesView
              snapshot={snapshot}
              onSave={saveCliente}
              onDelete={deleteCliente}
            />
          );
        case "presupuestos":
          return (
            <PresupuestosView
              snapshot={snapshot}
              onSave={savePresupuesto}
              onConvert={convertPresupuesto}
              onDelete={deletePresupuesto}
            />
          );
        case "trabajos":
          return (
            <TrabajosView
              snapshot={snapshot}
              onSave={saveTrabajo}
              onUpdateState={updateTrabajoState}
              onDelete={deleteTrabajo}
            />
          );
        case "fabrica-pvc":
          return <FabricaView snapshot={snapshot} factory="pvc" title="Aberturas" onAdvance={updateTrabajoState} onArchive={archiveTrabajo} />;
        case "fabrica-vidrios":
          return <FabricaView snapshot={snapshot} factory="vidrios" title="Cristales" onAdvance={updateTrabajoState} onArchive={archiveTrabajo} />;
        case "fabrica-colocaciones":
          return <FabricaView snapshot={snapshot} factory="colocaciones" title="Colocaciones" onAdvance={updateTrabajoState} onArchive={archiveTrabajo} />;
        case "monitor":
          return <MonitorView snapshot={snapshot} onAdvance={updateTrabajoState} onArchive={archiveTrabajo} />;
        case "agenda":
          return (
            <AgendaView
              snapshot={snapshot}
              onSave={saveAgenda}
              onDelete={deleteAgenda}
            />
          );
        case "caja":
          return <CajaView snapshot={snapshot} onSave={savePago} />;
      }
    })();

    if (screen === "monitor") return page;

    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title={titles[screen].title} subtitle={titles[screen].subtitle} />
        {error ? (
          <div className="mx-5 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        <div className="flex-1">{page}</div>
      </div>
    );
  }, [screen, snapshot, error]);

  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-[248px_1fr]">
      <Sidebar current={screen} onChange={setScreen} />
      <main className="min-h-screen overflow-auto">{content}</main>
    </div>
  );
}
