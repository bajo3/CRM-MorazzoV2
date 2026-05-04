/* GlassFlow CRM — Fábrica PVC + Fábrica Vidrios */

/* ─── SHARED FACTORY KANBAN CARD ─── */
const FabCard = ({ t, clientes, estados, onEstado }) => {
  const [open, setOpen] = React.useState(false);
  const cliente = clientes.find(c => c.id === t.clienteId);
  const p = prioridadColors[t.prioridad] || prioridadColors.Normal;
  const isUrgent = t.prioridad === 'Alta';
  const isPendMat = t.estadoFabrica === 'Pendiente material';
  const borderColor = isPendMat ? C.red : isUrgent ? '#f97316' : C.border;

  return (
    <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${borderColor}`, padding: '12px', marginBottom: 8, borderTop: `3px solid ${p.dot}`, transition: 'box-shadow .15s', position: 'relative' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      {isPendMat && (
        <div style={{ position: 'absolute', top: -1, right: 10, background: C.red, color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: '0 0 4px 4px', fontFamily: 'DM Sans,sans-serif', letterSpacing: .5 }}>⚠ FALTA MATERIAL</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 700, color: C.textMuted }}>#{t.id}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <PriorityDot level={t.prioridad} />
          <span style={{ fontSize: 10, color: p.dot, fontWeight: 600, fontFamily: 'DM Sans,sans-serif' }}>{t.prioridad}</span>
        </div>
      </div>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 3 }}>{cliente?.nombre}</div>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub, marginBottom: 6, lineHeight: 1.4 }}>{t.descripcion.length > 60 ? t.descripcion.slice(0, 60) + '…' : t.descripcion}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
        {[['📐 Medidas', t.medidas], ['×', `${t.cantidad} unid.`], ['🎨 Color', t.color || '—'], ['📅', fdate(t.fechaPromesa)]].map(([k, v]) => (
          <div key={k} style={{ background: C.slate, borderRadius: 6, padding: '4px 7px' }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, color: C.textMuted, marginBottom: 1 }}>{k}</div>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, color: C.text }}>{v}</div>
          </div>
        ))}
      </div>

      {t.obs && <div style={{ fontSize: 10, color: '#92400e', background: '#fffbeb', borderRadius: 5, padding: '4px 7px', marginBottom: 8, fontFamily: 'DM Sans,sans-serif', lineHeight: 1.4 }}>{t.obs.length > 70 ? t.obs.slice(0, 70) + '…' : t.obs}</div>}

      {t.archivos?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {t.archivos.map(f => <span key={f} style={{ fontSize: 10, color: C.blue, background: C.bluePale, borderRadius: 4, padding: '2px 6px', fontFamily: 'DM Sans,sans-serif' }}>{f.endsWith('.pdf') ? '📄' : '🖼'} {f.split('.')[0]}</span>)}
        </div>
      )}

      {/* Estado selector */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '6px 10px', borderRadius: 7, border: `1px solid ${C.blue}`, background: C.bluePale, color: C.blue, fontSize: 11, fontFamily: 'DM Sans,sans-serif', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>→ Cambiar estado</span>
          <span style={{ fontSize: 9 }}>▼</span>
        </button>
        {open && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.15)', zIndex: 100, overflow: 'hidden', marginBottom: 4 }}>
            {estados.map(est => (
              <button key={est} onClick={() => { onEstado(t.id, est); setOpen(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: t.estadoFabrica === est ? C.bluePale : C.white, color: t.estadoFabrica === est ? C.blue : C.text, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: t.estadoFabrica === est ? 600 : 400, cursor: 'pointer', textAlign: 'left', borderBottom: `1px solid ${C.border}`, transition: 'background .1s' }}
                onMouseEnter={e => { if (t.estadoFabrica !== est) e.currentTarget.style.background = C.slate; }}
                onMouseLeave={e => { if (t.estadoFabrica !== est) e.currentTarget.style.background = C.white; }}>
                {t.estadoFabrica === est ? '✓ ' : ''}{est}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── FACTORY PANEL COMPONENT ─── */
const FabricaPanel = ({ titulo, icono, fabrica, columnas, estados, accentColor, onMonitor }) => {
  const { trabajos, clientes } = GF_DATA;
  const [view, setView] = React.useState('kanban');
  const [estadosMap, setEstadosMap] = React.useState(
    () => Object.fromEntries(trabajos.filter(t => t.fabrica === fabrica).map(t => [t.id, t.estadoFabrica]))
  );
  const [filtro, setFiltro] = React.useState('Todos');

  const misTrab = trabajos.filter(t => t.fabrica === fabrica).map(t => ({ ...t, estadoFabrica: estadosMap[t.id] || t.estadoFabrica }));
  const filtrados = filtro === 'Todos' ? misTrab : misTrab.filter(t => t.rubro === filtro);

  const updateEstado = (id, est) => setEstadosMap(prev => ({ ...prev, [id]: est }));

  const rubros = ['Todos', ...Array.from(new Set(misTrab.map(t => t.rubro)))];
  const atrasados = misTrab.filter(t => t.estadoFabrica.includes('Atrasado') || t.estadoFabrica === 'Pendiente material');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.slate, overflow: 'hidden' }}>
      <TopBar
        title={`${icono} Panel Fábrica — ${titulo}`}
        subtitle={`${misTrab.length} órdenes activas · ${atrasados.length > 0 ? atrasados.length + ' con alerta' : 'Sin alertas'}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 7, overflow: 'hidden' }}>
              {[['kanban','⬡ Kanban'],['tabla','☰ Tabla']].map(([v, l]) => (
                <button key={v} onClick={() => setView(v)} style={{ padding: '6px 12px', fontSize: 12, fontFamily: 'DM Sans,sans-serif', border: 'none', cursor: 'pointer', background: view === v ? accentColor : C.white, color: view === v ? '#fff' : C.textSub, fontWeight: view === v ? 600 : 400 }}>{l}</button>
              ))}
            </div>
            <Btn onClick={onMonitor} variant="primary" icon="🖥" size="sm">Modo Monitor</Btn>
          </div>
        }
      />

      {/* Alertas banner */}
      {atrasados.length > 0 && (
        <div style={{ background: '#fef2f2', borderBottom: `1px solid #fecaca`, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14 }}>⚠</span>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.red, fontWeight: 600 }}>
            {atrasados.map(t => { const cl = clientes.find(c => c.id === t.clienteId); return `#${t.id} ${cl?.nombre}`; }).join(' · ')}
          </span>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 20px', background: C.white, borderBottom: `1px solid ${C.border}` }}>
        {rubros.map(r => (
          <button key={r} onClick={() => setFiltro(r)} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filtro === r ? accentColor : C.border}`, background: filtro === r ? accentColor + '18' : C.white, color: filtro === r ? accentColor : C.textSub, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: filtro === r ? 600 : 400, cursor: 'pointer' }}>{r}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {['Alta', 'Media', 'Normal'].map(p => {
            const count = filtrados.filter(t => t.prioridad === p).length;
            const pc = prioridadColors[p];
            return count > 0 ? <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'DM Sans,sans-serif', color: pc.dot }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: pc.dot, display: 'inline-block' }}></span>{p}: {count}</span> : null;
          })}
        </div>
      </div>

      {view === 'kanban' ? (
        <div style={{ flex: 1, display: 'flex', gap: 10, padding: '14px 16px', overflow: 'auto' }}>
          {columnas.map(col => {
            const items = filtrados.filter(t => t.estadoFabrica === col.estado || (col.extra || []).includes(t.estadoFabrica));
            return (
              <KanbanCol key={col.estado} title={col.titulo} color={col.color} count={items.length}
                items={items}
                renderCard={(t) => <FabCard key={t.id} t={t} clientes={clientes} estados={estados} onEstado={updateEstado} />}
              />
            );
          })}
        </div>
      ) : (
        /* TABLA */
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 2fr 90px 90px 60px 130px 100px', background: C.slate, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
              {['ORDEN','CLIENTE','DESCRIPCIÓN','MEDIDAS','ENTREGA','CANT','ESTADO','PRIOR.'].map((h, i) => (
                <div key={i} style={{ padding: '10px 8px 10px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6 }}>{h}</div>
              ))}
            </div>
            {filtrados.map((t, i) => {
              const cl = clientes.find(c => c.id === t.clienteId);
              const atrasado = t.estadoFabrica.includes('Atrasado') || t.estadoFabrica === 'Pendiente material';
              return (
                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 2fr 90px 90px 60px 130px 100px', padding: '0 16px', borderBottom: i < filtrados.length - 1 ? `1px solid ${C.border}` : 'none', background: atrasado ? '#fef2f2' : 'transparent', alignItems: 'center' }}>
                  <div style={{ padding: '11px 8px 11px 0' }}><span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: C.textSub }}>#{t.id}</span></div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 500, color: C.text }}>{cl?.nombre}</div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: C.textSub }}>{t.medidas}</div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: atrasado ? C.red : C.text, fontWeight: atrasado ? 600 : 400 }}>📅 {fdate(t.fechaPromesa)}</div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600, color: C.text }}>{t.cantidad}</div>
                  <div style={{ padding: '11px 8px 11px 0' }}><Badge label={t.estadoFabrica} type="estado" /></div>
                  <div style={{ padding: '11px 8px 11px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PriorityDot level={t.prioridad} /><span style={{ fontSize: 11, color: prioridadColors[t.prioridad]?.dot, fontFamily: 'DM Sans,sans-serif' }}>{t.prioridad}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── FÁBRICA PVC ─── */
const COL_PVC = [
  { estado: 'Recibido',           titulo: 'Recibidos',        color: C.textMuted },
  { estado: 'Pendiente material', titulo: 'Pend. material',   color: C.red },
  { estado: 'En corte',           titulo: 'En corte',         color: C.yellow },
  { estado: 'En armado',          titulo: 'En armado',        color: C.orange },
  { estado: 'Control',            titulo: 'Control',          color: '#8b5cf6' },
  { estado: 'Listo',              titulo: 'Listos',           color: C.green, extra: ['Listo ✓'] },
  { estado: 'Entregado',          titulo: 'Entregados',       color: C.textMuted },
];

const FabricaPVC = ({ onMonitor }) => (
  <FabricaPanel
    titulo="Aberturas PVC" icono="🏭" fabrica="PVC"
    columnas={COL_PVC}
    estados={['Recibido','Pendiente material','En corte','En armado','Control','Listo','Entregado']}
    accentColor={C.sky}
    onMonitor={onMonitor}
  />
);

/* ─── FÁBRICA VIDRIOS ─── */
const COL_VID = [
  { estado: 'Recibido',   titulo: 'Recibidos',    color: C.textMuted },
  { estado: 'En corte',   titulo: 'En corte',     color: C.yellow },
  { estado: 'En lavado',  titulo: 'En lavado',    color: C.blue },
  { estado: 'Armado DVH', titulo: 'Armado DVH',   color: C.cyan },
  { estado: 'Sellado',    titulo: 'Sellado',      color: C.purple },
  { estado: 'Control',    titulo: 'Control',      color: '#8b5cf6' },
  { estado: 'Listo',      titulo: 'Listos',       color: C.green, extra: ['Listo ✓', 'Listo para entregar'] },
  { estado: 'Entregado',  titulo: 'Entregados',   color: C.textMuted },
];

const FabricaVidrios = ({ onMonitor }) => (
  <FabricaPanel
    titulo="Vidrios / DVH / Espejos" icono="🪟" fabrica="Vidrios"
    columnas={COL_VID}
    estados={['Recibido','En corte','En lavado','Armado DVH','Sellado','Control','Listo','Entregado']}
    accentColor={C.purple}
    onMonitor={onMonitor}
  />
);

Object.assign(window, { FabricaPVC, FabricaVidrios });
