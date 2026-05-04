/* GlassFlow CRM — Monitor TV — Full Screen, No Scroll */

const MON_COLORS = {
  'Recibido':           { bg: '#0f1a2e', text: '#64748b', border: '#1e293b',  accent: '#334155' },
  'Pendiente material': { bg: '#2d0a0a', text: '#fca5a5', border: '#7f1d1d',  accent: '#ef4444' },
  'En corte':           { bg: '#2a1500', text: '#fdba74', border: '#7c2d12',  accent: '#f97316' },
  'En armado':          { bg: '#1a1060', text: '#a5b4fc', border: '#3730a3',  accent: '#6366f1' },
  'En lavado':          { bg: '#0c2240', text: '#93c5fd', border: '#1d4ed8',  accent: '#3b82f6' },
  'Armado DVH':         { bg: '#042f3a', text: '#67e8f9', border: '#0e7490',  accent: '#06b6d4' },
  'Sellado':            { bg: '#1e0442', text: '#d8b4fe', border: '#6b21a8',  accent: '#a855f7' },
  'Control':            { bg: '#1f1200', text: '#fcd34d', border: '#92400e',  accent: '#eab308' },
  'Listo':              { bg: '#012615', text: '#86efac', border: '#166534',  accent: '#22c55e' },
  'Listo ✓':            { bg: '#012615', text: '#86efac', border: '#166534',  accent: '#22c55e' },
  'Listo para entregar':{ bg: '#012615', text: '#86efac', border: '#166534',  accent: '#22c55e' },
  'Preparando':         { bg: '#2a1500', text: '#fdba74', border: '#7c2d12',  accent: '#f97316' },
  'Armando':            { bg: '#1a1060', text: '#a5b4fc', border: '#3730a3',  accent: '#6366f1' },
  'Colocacion':         { bg: '#042f3a', text: '#67e8f9', border: '#0e7490',  accent: '#06b6d4' },
  '⚠ Atrasado':        { bg: '#2d0a0a', text: '#fca5a5', border: '#7f1d1d',  accent: '#ef4444' },
  'Entregado':          { bg: '#0a0f1a', text: '#334155', border: '#1e293b',  accent: '#334155' },
};

const FLUJO_PVC     = ['Recibido','Preparando','Armando','Listo','Entregado'];
const FLUJO_VIDRIOS = ['Recibido','Preparando','Colocacion','Listo','Entregado'];
const FLUJO_TODOS   = ['Recibido','Preparando','Armando','Colocacion','Listo'];

/* map legacy GF_DATA states → simplified monitor states */
const mapEstado = (estado, fabrica) => {
  if (fabrica === 'PVC') {
    if (['Pendiente material','En corte'].includes(estado)) return 'Preparando';
    if (['En armado','Control'].includes(estado))           return 'Armando';
    if (['Listo ✓','Listo para entregar'].includes(estado)) return 'Listo';
    return estado; // Recibido, Listo, Entregado pass through
  } else {
    if (['En corte','En lavado'].includes(estado))               return 'Preparando';
    if (['Armado DVH','Sellado','Control'].includes(estado))     return 'Colocacion';
    if (['Listo ✓','Listo para entregar'].includes(estado))      return 'Listo';
    return estado;
  }
};

const diasRest = (f) => {
  if (!f) return null;
  const h = new Date(); h.setHours(0,0,0,0);
  return Math.round((new Date(f+'T00:00:00') - h) / 86400000);
};

/* ── Mini card para pipeline ── */
const PipeCard = ({ t, clientes, onEstado, flujo }) => {
  const [open, setOpen] = React.useState(false);
  const cl  = clientes.find(c => c.id === t.clienteId);
  const mc  = MON_COLORS[t.estadoFabrica] || MON_COLORS['Recibido'];
  const pc  = prioridadColors[t.prioridad] || prioridadColors.Normal;
  const d   = diasRest(t.fechaPromesa);
  const dl  = d === null ? null : d < 0 ? { label: `${Math.abs(d)}d tarde`, color: '#ef4444' } : d === 0 ? { label: 'HOY', color: '#f97316' } : d === 1 ? { label: 'Mañana', color: '#eab308' } : { label: `${d}d`, color: '#22c55e' };
  const idx = flujo.indexOf(t.estadoFabrica);
  const sig = idx >= 0 && idx < flujo.length - 1 ? flujo[idx + 1] : null;
  const pct = idx < 0 ? 0 : Math.round(idx / (flujo.length - 1) * 100);
  const isAlert = t.estadoFabrica.includes('Atrasado') || t.estadoFabrica === 'Pendiente material' || d < 0;

  return (
    <div style={{ background: isAlert ? '#2d0a0a' : '#0d1629', border: `1px solid ${isAlert ? '#7f1d1d' : '#1e293b'}`, borderLeft: `4px solid ${mc.accent}`, borderRadius: 10, padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10, animation: isAlert ? 'pulse 2s infinite' : 'none', position: 'relative' }}>

      {/* Row 1: ID + cliente + prioridad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: '#475569', fontWeight: 600, flexShrink: 0 }}>#{t.id}</span>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 16, fontWeight: 700, color: '#f1f5f9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl?.nombre}</span>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: pc.dot, boxShadow: `0 0 8px ${pc.dot}`, flexShrink: 0 }}></div>
      </div>

      {/* Row 2: descripcion breve */}
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#64748b', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.descripcion}</div>

      {/* Row 3: medidas + deadline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: '#64748b' }}>{t.medidas} · ×{t.cantidad}</span>
        {dl && <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, color: dl.color, background: dl.color+'22', borderRadius: 6, padding: '3px 9px' }}>{dl.label}</span>}
      </div>

      {/* Row 4: progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: mc.accent, borderRadius: 3, transition: 'width .5s' }}></div>
      </div>

      {/* Row 5: action buttons */}
      <div style={{ display: 'flex', gap: 5, position: 'relative' }}>
        {sig && sig !== 'Entregado' && (
          <button onClick={() => onEstado(t.id, sig)}
            style={{ flex: 1, padding: '10px 6px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg,#1d4ed8,#2563eb)'}>
            → {sig}
          </button>
        )}
        {t.estadoFabrica === 'Listo' && (
          <button onClick={() => onEstado(t.id, 'Entregado')}
            style={{ flex: 1, padding: '10px 6px', borderRadius: 7, border: 'none', background: '#15803d', color: '#fff', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ✓ Entregar
          </button>
        )}
        <button onClick={() => setOpen(o => !o)}
          style={{ width: 34, height: 34, borderRadius: 7, border: '1px solid #1e293b', background: open ? '#334155' : 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ⋮
        </button>
        {open && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', right: 0, width: 180, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden', boxShadow: '0 -8px 24px rgba(0,0,0,.6)', marginBottom: 4, zIndex: 200 }}>
            {flujo.filter(e => e !== 'Entregado').map(est => {
              const isCur = t.estadoFabrica === est;
              const mc2 = MON_COLORS[est] || MON_COLORS['Recibido'];
              return (
                <button key={est} onClick={() => { onEstado(t.id, est); setOpen(false); }}
                  style={{ width: '100%', padding: '9px 12px', border: 'none', background: isCur ? mc2.bg : 'transparent', color: isCur ? mc2.text : '#94a3b8', fontFamily: isCur ? 'Space Grotesk,sans-serif' : 'DM Sans,sans-serif', fontSize: 12, fontWeight: isCur ? 700 : 400, cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #0f172a', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => { if (!isCur) e.currentTarget.style.background = '#334155'; }}
                  onMouseLeave={e => { if (!isCur) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: mc2.accent, flexShrink: 0, display: 'inline-block' }}></span>
                  {est}
                  {isCur && <span style={{ marginLeft: 'auto', fontSize: 9, color: mc2.text }}>●</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Toast ── */
const MonToast = ({ msg, color, onDone }) => {
  React.useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: 'fixed', bottom: 52, left: '50%', transform: 'translateX(-50%)', background: '#0f172a', border: `1px solid ${color}`, borderRadius: 10, padding: '10px 22px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 4px 24px ${color}44`, animation: 'toastIn .25s ease' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }}></div>
      <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{msg}</span>
    </div>
  );
};

/* ══════════════ MONITOR PRINCIPAL ══════════════ */
const Monitor = ({ onClose }) => {
  const { trabajos, clientes, agenda } = GF_DATA;
  const [filtro, setFiltro] = React.useState('Todas');
  const [time,   setTime]   = React.useState(new Date());
  const [toast,  setToast]  = React.useState(null);
  const [estadosMap, setEstadosMap] = React.useState(
    () => Object.fromEntries(trabajos.map(t => [t.id, mapEstado(t.estadoFabrica, t.fabrica)]))
  );

  React.useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const onEstado = (id, est) => {
    setEstadosMap(p => ({ ...p, [id]: est }));
    const t  = trabajos.find(t => t.id === id);
    const cl = clientes.find(c => c.id === t?.clienteId);
    const mc = MON_COLORS[est] || MON_COLORS['Recibido'];
    setToast({ msg: `#${id} ${cl?.nombre?.split(' ')[0]} → ${est}`, color: mc.accent });
  };

  const flujo = filtro === 'PVC' ? FLUJO_PVC : filtro === 'Vidrios' ? FLUJO_VIDRIOS : FLUJO_TODOS;

  const tActivos = trabajos
    .map(t => ({ ...t, estadoFabrica: estadosMap[t.id] || t.estadoFabrica }))
    .filter(t => t.estadoFabrica !== 'Entregado')
    .filter(t => filtro === 'Todas' || t.fabrica === filtro);

  // Always show all pipeline columns (except Entregado)
  const visibleCols = flujo.filter(e => e !== 'Entregado').map(estado => ({
    estado,
    mc: MON_COLORS[estado] || MON_COLORS['Recibido'],
    items: tActivos.filter(t => t.estadoFabrica === estado),
  }));

  const urgentes = tActivos.filter(t => t.estadoFabrica.includes('Atrasado') || t.estadoFabrica === 'Pendiente material' || diasRest(t.fechaPromesa) < 0);
  const listos   = tActivos.filter(t => ['Listo','Listo ✓','Listo para entregar'].includes(t.estadoFabrica));

  const pad = n => String(n).padStart(2,'0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = time.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

  // Ticker
  const tickerParts = [
    ...urgentes.map(t => { const cl = clientes.find(c=>c.id===t.clienteId); return `🚨 URGENTE › #${t.id} ${cl?.nombre} — ${t.estadoFabrica}`; }),
    ...listos.map(t => { const cl = clientes.find(c=>c.id===t.clienteId); return `✅ LISTO › #${t.id} ${cl?.nombre}`; }),
    ...(agenda||[]).filter(a => { const d = diasRest(a.fecha); return d !== null && d >= 0 && d <= 1; }).map(a => { const cl = clientes.find(c=>c.id===a.clienteId); return `📅 HOY/MAÑANA › ${a.tipo} ${cl?.nombre} ${a.hora}`; }),
    `⏱ ${tActivos.length} órdenes activas · ${urgentes.length} urgentes · ${listos.length} listos`,
  ];
  const ticker = tickerParts.join('    ·    ');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060c18', display: 'flex', flexDirection: 'column', zIndex: 2000, overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse   { 0%,100%{opacity:1}  50%{opacity:.65} }
        @keyframes blink   { 0%,100%{opacity:1}  50%{opacity:.25} }
        @keyframes ticker  { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 8px #3b82f644} 50%{box-shadow:0 0 20px #3b82f688} }
      `}</style>

      {/* ══ TOP BAR ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 18px', background: '#0a1122', borderBottom: '1px solid #1e293b', flexShrink: 0, height: 56 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 8 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, animation: 'glow 3s infinite' }}>◇</div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>GlassFlow</div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 8, color: '#334155', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>Monitor de producción</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 30, background: '#1e293b' }}></div>

        {/* Fábrica pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[['Todas','⬡'],['PVC','🏭'],['Vidrios','🪟']].map(([f,ic]) => (
            <button key={f} onClick={() => setFiltro(f)}
              style={{ padding: '5px 12px', borderRadius: 16, border: `1px solid ${filtro===f ? '#3b82f6' : '#1e293b'}`, background: filtro===f ? '#1d4ed8' : 'transparent', color: filtro===f ? '#fff' : '#64748b', fontSize: 11, fontFamily: 'DM Sans,sans-serif', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 4 }}>
              {ic} {f}
            </button>
          ))}
        </div>

        {/* KPI chips */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          {[
            { l: 'Activos',   v: tActivos.length,  c: '#3b82f6' },
            { l: 'Urgentes',  v: urgentes.length,  c: '#ef4444' },
            { l: 'Listos',    v: listos.length,    c: '#22c55e' },
          ].map(k => (
            <div key={k.l} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: k.c+'18', border: `1px solid ${k.c}44`, borderRadius: 8 }}>
              <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700, color: k.c, lineHeight: 1 }}>{k.v}</span>
              <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, color: k.c+'bb', textTransform: 'uppercase', letterSpacing: .5 }}>{k.l}</span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Urgentes alerta inline */}
        {urgentes.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, animation: 'blink 2.5s infinite', maxWidth: 320, overflow: 'hidden' }}>
            <span style={{ fontSize: 12 }}>🚨</span>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#fca5a5', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {urgentes.map(t => { const cl = clientes.find(c=>c.id===t.clienteId); return `#${t.id} ${cl?.nombre?.split(' ')[0]}`; }).join(' · ')}
            </span>
          </div>
        )}

        {/* Clock */}
        <div style={{ textAlign: 'right', borderLeft: '1px solid #1e293b', paddingLeft: 12 }}>
          <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 20, fontWeight: 700, color: '#3b82f6', letterSpacing: 2, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
          <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, color: '#334155', textTransform: 'capitalize', marginTop: 1, textAlign: 'right' }}>{dateStr}</div>
        </div>

        <button onClick={onClose} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #1e293b', background: 'transparent', color: '#334155', fontSize: 11, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer', flexShrink: 0 }}>✕</button>
      </div>

      {/* ══ PIPELINE ══ */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', padding: '10px 12px', paddingBottom: 0 }}>
        {visibleCols.map((col, ci) => {
          const maxCards = col.items.length;
          return (
            <div key={col.estado} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: ci < visibleCols.length - 1 ? '1px solid #111827' : 'none', padding: '0 6px' }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: col.mc.bg, border: `1px solid ${col.mc.border}`, marginBottom: 8, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: col.mc.accent, boxShadow: col.items.length > 0 ? `0 0 8px ${col.mc.accent}` : 'none' }}></div>
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: col.mc.text, letterSpacing: .5, textTransform: 'uppercase' }}>{col.estado}</span>
                </div>
                {col.items.length > 0 && (
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 16, fontWeight: 700, color: col.mc.accent }}>{col.items.length}</span>
                )}
              </div>

              {/* Cards — fill available height evenly */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
                {col.items.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1px dashed #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 14, color: '#1e293b' }}>—</span>
                    </div>
                  </div>
                ) : col.items.map(t => (
                  <div key={t.id} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <PipeCard t={t} clientes={clientes} onEstado={onEstado} flujo={flujo} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ TICKER ══ */}
      <div style={{ flexShrink: 0, height: 32, background: '#0a1122', borderTop: '1px solid #1e293b', overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(90deg,#0a1122,transparent)', zIndex: 1 }}></div>
        <div style={{ whiteSpace: 'nowrap', animation: 'ticker 35s linear infinite', fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#334155', letterSpacing: .3 }}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ticker}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ticker}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg,transparent,#0a1122)', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', right: 12, zIndex: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 8, color: '#22c55e', letterSpacing: 1.5, textTransform: 'uppercase' }}>vivo</span>
        </div>
      </div>

      {toast && <MonToast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
    </div>
  );
};

Object.assign(window, { Monitor });
