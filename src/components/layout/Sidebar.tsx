import {
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  Layers,
  Gem,
  Tv2,
  CalendarDays,
  Wallet,
  Hammer,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export type Screen =
  | "dashboard"
  | "ventas"
  | "presupuestos"
  | "trabajos"
  | "fabrica-pvc"
  | "fabrica-vidrios"
  | "fabrica-colocaciones"
  | "monitor"
  | "agenda"
  | "caja";

type NavItem = { id: Screen; label: string; icon: React.ElementType; group: "gestion" | "produccion" | "admin" };

const items: NavItem[] = [
  { id: "dashboard",            label: "Dashboard",      icon: LayoutDashboard, group: "gestion" },
  { id: "ventas",               label: "Clientes",       icon: Users,           group: "gestion" },
  { id: "presupuestos",         label: "Presupuestos",   icon: FileText,        group: "gestion" },
  { id: "trabajos",             label: "Trabajos",       icon: Wrench,          group: "gestion" },
  { id: "fabrica-pvc",          label: "Aberturas",      icon: Layers,          group: "produccion" },
  { id: "fabrica-vidrios",      label: "Cristales",      icon: Gem,             group: "produccion" },
  { id: "fabrica-colocaciones", label: "Colocaciones",   icon: Hammer,          group: "produccion" },
  { id: "monitor",              label: "Monitor TV",     icon: Tv2,             group: "produccion" },
  { id: "agenda",               label: "Agenda",         icon: CalendarDays,    group: "admin" },
  { id: "caja",                 label: "Caja",           icon: Wallet,          group: "admin" },
];

const groupLabels = {
  gestion: "Gestion",
  produccion: "Produccion",
  admin: "Administracion",
};

const groupDot: Record<string, string> = {
  gestion: "bg-brand-400",
  produccion: "bg-amber-400",
  admin: "bg-emerald-400",
};

const NavContent = ({
  current,
  onChange,
}: {
  current: Screen;
  onChange: (screen: Screen) => void;
}) => (
  <>
    <div className="border-b border-white/8 px-5 py-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 shadow-sm">
          <span className="font-display text-xs font-bold text-white">FM</span>
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight text-white">Facundo Morazzo</p>
          <p className="text-[10px] leading-tight text-slate-400">Aberturas y Cristales</p>
        </div>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">GlassFlow CRM</p>
    </div>

    <nav className="flex-1 space-y-4 overflow-y-auto p-3 pt-4">
      {(["gestion", "produccion", "admin"] as const).map((group) => (
        <div key={group}>
          <div className="mb-1.5 flex items-center gap-1.5 px-2">
            <span className={`h-1.5 w-1.5 rounded-full ${groupDot[group]}`} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{groupLabels[group]}</p>
          </div>
          <div className="space-y-0.5">
            {items
              .filter((item) => item.group === group)
              .map((item) => {
                const active = item.id === current;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                      active
                        ? "bg-brand-600 font-semibold text-white shadow-sm"
                        : "text-slate-400 hover:bg-white/6 hover:text-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </nav>

    <div className="border-t border-white/8 px-4 py-3">
      <p className="text-[10px] text-slate-600">GlassFlow CRM · MVP</p>
    </div>
  </>
);

export const Sidebar = ({
  current,
  onChange,
}: {
  current: Screen;
  onChange: (screen: Screen) => void;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleChange = (screen: Screen) => {
    onChange(screen);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <span className="font-display text-[10px] font-bold text-white">FM</span>
          </div>
          <span className="font-display text-sm font-bold text-white">GlassFlow CRM</span>
        </div>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-slate-900 text-white transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent current={current} onChange={handleChange} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-[248px] flex-col bg-slate-900 text-white md:flex">
        <NavContent current={current} onChange={handleChange} />
      </aside>
    </>
  );
};
