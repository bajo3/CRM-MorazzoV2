/* GlassFlow CRM — Trabajos Kanban */

const KANBAN_COLS = [
  { id: 'aprobado',   title: 'Aprobados',         color: C.green,  estados: ['Seña cobrada', 'Aprobado'] },
  { id: 'fabrica',    title: 'En fábrica',         color: C.blue,   estados: ['Recibido','En corte','En armado','Pendiente material','En lavado','Armado DVH','Sellado'] },
  { id: 'control',    title: 'Control',            color: C.yellow, estados: ['Control'] },
  { id: 'listo',      title: 'Listos',             color: C.green,  estados: ['Listo','Listo para entregar','Listo ✓'] },
  { id: 'instalacion',title: 'Instalación',        color: C.purple, estados: [] },
  { id: 'entregado',  title: 'Entregados',         color: C.textMuted, estados: ['Entregado'] },
];

const ESTADOS_FABRICA_PVC = ['Recibido','Pendiente material','En corte','En armado','Control','Listo','Entregado'];
const ESTADOS_FABRICA_VID = ['Recibido','En corte','En lavado','Armado DVH','Sellado','Control','Listo','Entregado'];

const Trabajos = ({ onNav }) => {
  const { trabajos, clientes } = GF_DATA;
  const [view, setView] = React.useState('kanban');
  const [filtroRubro, setFiltroRubro] = React.useState('Todos');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [estadosMap, setEstadosMap] = React.useState(
    () => Object.fromEntries(trabajos.map(t => [t.id, t.estadoFabrica]))
  );

  const rubros = ['Todos', 'PVC', 'Vidrio', 'DVH', 'Espejo'];

  const filtered = trabajos.filter(t => {
    if (filtroRubro !== 'Todos' && t.rubro !== filtroRubro) return false;
    if (search) {
      const cl = clientes.find(c => c.id === t.clienteId);
      const haystack = `${t.id} ${cl?.nombre} ${t.descripcion}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  }).map(t => ({ ...t, estadoFabrica: estadosMap[t.id] || t.estadoFabrica }));

  const getCol = (t) => {
    const ef = estadosMap[t.id] || t.estadoFabrica;
    if (['Listo','Listo para entregar','Listo ✓'].includes(ef)) return 'listo';
    if (ef === 'Control') return 'control';
    if (ef === 'Entregado') return 'entregado';
    if (['Recibido','En corte','En armado','Pendiente material','En lavado','Armado DVH','Sellado'].includes(ef)) return 'fabrica';
    return 'aprobado';
  };

  const updateEstado = (id, nuevoEstado) => {
    setEstadosMap(prev => ({ ...prev, [id]: nuevoEstado }));
    if (selected?.id === id) setSelected(prev => ({ ...prev, estadoFabrica: nuevoEstado }));
  };

  const colCounts = {};
  KANBAN_COLS.forEach(col => { colCounts[col.id] = filtered.filter(t => getCol(t) === col.id).length; });

  const cliente = selected ? clientes.find(c => c.id === selected.clienteId) : null;
  const selectedEstado = selected ? (estadosMap[selected.id] || selected.estadoFabrica) : null;
  const estadoOpts = selected?.fabrica === 'PVC' ? ESTADOS_FABRICA_PVC : ESTADOS_FABRICA_VID;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.slate, overflow: 'hidden' }}>
      <TopBar
        title="Trabajos / Órdenes"
        subtitle={`${filtered.length} trabajos · ${filtered.filter(t => (estadosMap[t.id]||t.estadoFabrica).includes('Atrasado')).length} atrasados`}
        search={search} onSearch={setSearch}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 7, overflow: 'hidden' }}>
              {[['kanban','⬡ Kanban'],['tabla','☰ Tabla']].map(([v, l]) => (
                <button key={v} onClick={() => setView(v)} style={{ padding: '6px 12px', fontSize: 12, fontFamily: 'DM Sans,sans-serif', border: 'none', cursor: 'pointer', background: view === v ? C.blue : C.white, color: view === v ? '#fff' : C.textSub, fontWeight: view === v ? 600 : 400 }}>{l}</button>
              ))}
            </div>
            <Btn variant="primary" icon="+" size="sm">Nueva orden</Btn>
          </div>
        }
      />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 20px', background: C.white, borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
        {rubros.map(r => (
          <button key={r} onClick={() => setFiltroRubro(r)} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filtroRubro === r ? C.blue : C.border}`, background: filtroRubro === r ? C.bluePale : C.white, color: filtroRubro === r ? C.blue : C.textSub, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: filtroRubro === r ? 600 : 400, cursor: 'pointer' }}>{r}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'DM Sans,sans-serif' }}>Prioridad:</span>
          {['Alta','Media','Normal'].map(p => {
            const pc = prioridadColors[p];
            return <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: pc.dot, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: pc.dot, display: 'inline-block' }}></span>{p}</span>;
          })}
        </div>
      </div>

      {view === 'kanban' ? (
        /* ── KANBAN VIEW ── */
        <div style={{ flex: 1, display: 'flex', gap: 10, padding: '14px 16px', overflow: 'auto' }}>
          {KANBAN_COLS.map(col => (
            <KanbanCol key={col.id} title={col.title} color={col.color} count={colCounts[col.id]}
              items={filtered.filter(t => getCol(t) === col.id)}
              renderCard={(t) => (
                <TrabajoCard key={t.id} t={t} clientes={clientes} onClick={setSelected} />
              )}
            />
          ))}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px' }}>
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {/* thead */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1.8fr 80px 90px 120px 90px 130px', background: C.slate, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
              {['ORDEN','CLIENTE','DESCRIPCIÓN','RUBRO','ENTREGA','ESTADO FABR.','SALDO','ACCIONES'].map((h, i) => (
                <div key={i} style={{ padding: '10px 8px 10px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6 }}>{h}</div>
              ))}
            </div>
            {filtered.map((t, i) => {
              const cl = clientes.find(c => c.id === t.clienteId);
              const ef = estadosMap[t.id] || t.estadoFabrica;
              const atrasado = ef.includes('Atrasado');
              return (
                <div key={t.id} onClick={() => setSelected(t)} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1.8fr 80px 90px 120px 90px 130px', padding: '0 16px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', background: atrasado ? '#fef2f2' : 'transparent', transition: 'background .1s', alignItems: 'center' }}
                  onMouseEnter={e => { if (!atrasado) e.currentTarget.style.background = C.slate; }}
                  onMouseLeave={e => { e.currentTarget.style.background = atrasado ? '#fef2f2' : 'transparent'; }}>
                  <div style={{ padding: '11px 8px 11px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PriorityDot level={t.prioridad} /><span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: C.textSub }}>#{t.id}</span></div>
                  </div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 500, color: C.text }}>{cl?.nombre}</div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div>
                  <div style={{ padding: '11px 8px 11px 0' }}><Badge label={t.rubro} type="rubro" /></div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: atrasado ? C.red : C.text, fontWeight: atrasado ? 600 : 400 }}>📅 {fdate(t.fechaPromesa)}</div>
                  <div style={{ padding: '11px 8px 11px 0' }}><Badge label={ef} type="estado" /></div>
                  <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, color: t.saldo > 0 ? C.orange : C.green }}>{money(t.saldo)}</div>
                  <div style={{ padding: '11px 8px 11px 0', display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <Btn size="sm" onClick={() => setSelected(t)}>Ver</Btn>
                    <Btn size="sm" variant="whatsapp" icon="💬"></Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, height: '100%', background: C.white, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,.18)' }}>
            {/* header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, background: C.navy }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>Orden #{selected.id}</div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{cliente?.nombre} · {fdate(selected.fechaPromesa)}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', borderRadius: 6, padding: '2px 8px' }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge label={selected.rubro} type="rubro" />
                <Badge label={selectedEstado} type="estado" />
                <Badge label={selected.prioridad} type="prioridad" />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Descripcion */}
              <div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Descripción</div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, lineHeight: 1.5, background: C.slate, borderRadius: 8, padding: '10px 12px' }}>{selected.descripcion}</div>
              </div>

              {/* Specs */}
              <div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Especificaciones</div>
                <div style={{ background: C.slate, borderRadius: 8, overflow: 'hidden' }}>
                  {[['Medidas', selected.medidas], ['Cantidad', selected.cantidad], ['Color', selected.color || '—'], ['Fábrica', selected.fabrica === 'PVC' ? '🏭 Aberturas PVC' : '🪟 Vidrios / DVH'], ['Vendedor', selected.vendedor]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                      <span style={{ color: C.textSub }}>{k}</span>
                      <span style={{ fontWeight: 500, color: C.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cambiar estado */}
              <div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 8 }}>Estado de fábrica</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {estadoOpts.map(est => (
                    <button key={est} onClick={() => updateEstado(selected.id, est)} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${selectedEstado === est ? C.blue : C.border}`, background: selectedEstado === est ? C.bluePale : C.white, color: selectedEstado === est ? C.blue : C.textSub, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: selectedEstado === est ? 600 : 400, cursor: 'pointer', transition: 'all .1s' }}>{est}</button>
                  ))}
                </div>
              </div>

              {/* Cobranza */}
              <div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Cobranza</div>
                <div style={{ background: C.slate, borderRadius: 8, overflow: 'hidden' }}>
                  {[['Total', money(selected.total), C.text], ['Seña cobrada', money(selected.sena), C.green], ['Saldo pendiente', money(selected.saldo), selected.saldo > 0 ? C.orange : C.green]].map(([k, v, col]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'DM Sans,sans-serif' }}>
                      <span style={{ color: C.textSub }}>{k}</span>
                      <span style={{ fontWeight: 700, color: col }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              {selected.obs && (
                <div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Observaciones</div>
                  <div style={{ background: '#fffbeb', border: `1px solid #fde68a`, borderRadius: 8, padding: '10px 12px', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>{selected.obs}</div>
                </div>
              )}

              {/* Archivos */}
              {selected.archivos?.length > 0 && (
                <div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>Archivos adjuntos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selected.archivos.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: C.slate, borderRadius: 7, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 14 }}>{f.endsWith('.pdf') ? '📄' : '🖼'}</span>
                        <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.blue, flex: 1 }}>{f}</span>
                        <Btn size="sm">Ver</Btn>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <WABtn text={`Hola ${cliente?.nombre}, su trabajo ${selected.id} está en estado: ${selectedEstado}. Ante cualquier consulta estamos a disposición. GlassFlow CRM`} phone={cliente?.whatsapp} />
              {selected.saldo > 0 && (
                <WABtn text={`Hola ${cliente?.nombre}, le informamos que tiene un saldo pendiente de ${money(selected.saldo)} por la orden ${selected.id}. Muchas gracias. GlassFlow`} phone={cliente?.whatsapp} />
              )}
              <Btn variant="default" size="sm" icon="📄">PDF</Btn>
              <Btn variant="default" size="sm" icon="🖨">Imprimir</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Trabajos });
