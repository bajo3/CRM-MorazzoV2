export type Screen =
  | "dashboard"
  | "ventas"
  | "presupuestos"
  | "trabajos"
  | "fabrica-pvc"
  | "fabrica-vidrios"
  | "monitor"
  | "agenda"
  | "caja";

type NavItem = { id: Screen; label: string; icon: string; group: "gestion" | "produccion" | "admin" };

const items: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "◈", group: "gestion" },
  { id: "ventas", label: "Clientes", icon: "⬡", group: "gestion" },
  { id: "presupuestos", label: "Presupuestos", icon: "◻", group: "gestion" },
  { id: "trabajos", label: "Trabajos", icon: "⬧", group: "gestion" },
  { id: "fabrica-pvc", label: "Aberturas", icon: "⬜", group: "produccion" },
  { id: "fabrica-vidrios", label: "Cristales", icon: "◇", group: "produccion" },
  { id: "monitor", label: "Monitor TV", icon: "▣", group: "produccion" },
  { id: "agenda", label: "Agenda", icon: "◻", group: "admin" },
  { id: "caja", label: "Caja", icon: "◈", group: "admin" },
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

export const Sidebar = ({
  current,
  onChange,
}: {
  current: Screen;
  onChange: (screen: Screen) => void;
}) => (
  <aside className="flex w-full flex-col bg-slate-900 text-white md:w-[248px]">
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

    <nav className="flex-1 space-y-4 p-3 pt-4">
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
                    <span className="text-base leading-none opacity-70">{item.icon}</span>
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
  </aside>
);
