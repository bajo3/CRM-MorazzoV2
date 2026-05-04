/* GlassFlow CRM — Cobranzas + Agenda */

/* ═══════════════════════════ COBRANZAS ═══════════════════════════ */
const Cobranzas = () => {
  const { presupuestos, trabajos, clientes, kpis } = GF_DATA;

  const conSaldo = clientes.filter(c => c.saldo > 0).sort((a, b) => b.saldo - a.saldo);
  const listosConSaldo = trabajos.filter(t =>
    ['Listo','Listo ✓','Listo para entregar'].includes(t.estadoFabrica) && t.saldo > 0
  );
  const totalPresupuestado = presupuestos.filter(p => ['Aprobado','Enviado','Esperando respuesta'].includes(p.estado)).reduce((s, p) => s + p.total, 0);
  const totalSenado = presupuestos.reduce((s, p) => s + p.sena, 0);
  const totalPendiente = kpis.saldoTotal;
  const pct = Math.round(kpis.cobradoMes / (kpis.cobradoMes + kpis.saldoTotal) * 100);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.slate, overflow: 'hidden' }}>
      <TopBar title="Cobranzas" subtitle="Resumen financiero del período" />

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Top KPIs */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Total presupuestado', value: money(totalPresupuestado), accent: C.blue, icon: '◈' },
            { label: 'Total señado', value: money(totalSenado), accent: C.green, icon: '✓' },
            { label: 'Total pendiente de cobro', value: money(totalPendiente), accent: C.orange, icon: '◉' },
            { label: 'Cobrado este mes', value: money(kpis.cobradoMes), accent: C.purple, icon: '▲' },
          ].map(k => <StatCard key={k.label} {...k} />)}
        </div>

        {/* Progress bar */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, color: C.text }}>Avance de cobro del mes</span>
            <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, color: C.blue }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: C.slate, borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, borderRadius: 5, transition: 'width .5s' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted }}>Cobrado: {money(kpis.cobradoMes)}</span>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted }}>Pendiente: {money(totalPendiente)}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Clientes con saldo */}
          <div>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>
              Clientes con saldo pendiente
              <span style={{ marginLeft: 8, background: C.orange, color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>{conSaldo.length}</span>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {conSaldo.map((c, i) => {
                const misTrab = trabajos.filter(t => t.clienteId === c.id);
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < conSaldo.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.orange + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>◉</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, color: C.text }}>{c.nombre}</div>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub }}>{misTrab.length} trabajo{misTrab.length !== 1 ? 's' : ''} · {c.localidad}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 15, fontWeight: 700, color: C.orange }}>{money(c.saldo)}</div>
                      <WABtn text={`Hola ${c.nombre}, le recordamos que tiene un saldo pendiente de ${money(c.saldo)}. Quedamos a disposición. GlassFlow`} phone={c.whatsapp} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Listos con saldo */}
          <div>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>
              Trabajos listos con saldo
              {listosConSaldo.length > 0 && <span style={{ marginLeft: 8, background: C.red, color: '#fff', borderRadius: 10, padding: '1px 8px', fontSize: 11 }}>{listosConSaldo.length}</span>}
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {listosConSaldo.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: C.textMuted, fontFamily: 'DM Sans,sans-serif', fontSize: 13 }}>✓ Sin trabajos listos con saldo pendiente</div>
              ) : listosConSaldo.map((t, i) => {
                const cl = clientes.find(c => c.id === t.clienteId);
                return (
                  <div key={t.id} style={{ padding: '13px 16px', borderBottom: i < listosConSaldo.length - 1 ? `1px solid ${C.border}` : 'none', background: '#fef2f2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: C.textMuted }}>#{t.id}</div>
                      <Badge label="Listo ✓" type="estado" />
                    </div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 2 }}>{cl?.nombre}</div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub, marginBottom: 8 }}>{t.descripcion.slice(0, 50)}…</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, color: C.orange }}>{money(t.saldo)}</span>
                      <WABtn text={`Hola ${cl?.nombre}, su trabajo #${t.id} está LISTO para retirar/instalar. Le recordamos que tiene un saldo de ${money(t.saldo)}. GlassFlow`} phone={cl?.whatsapp} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desglose por rubro */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>Saldo por rubro</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {['PVC','Vidrio','DVH','Espejo'].map((rubro, i) => {
                  const rc = rubroColors[rubro] || rubroColors.Mixto;
                  const tot = trabajos.filter(t => t.rubro === rubro).reduce((s, t) => s + t.saldo, 0);
                  return (
                    <div key={rubro} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: rc.text, flexShrink: 0 }}></div>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, flex: 1 }}>{rubro}</span>
                      <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: tot > 0 ? C.orange : C.green }}>{money(tot)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════ AGENDA ═══════════════════════════ */
const TIPOS_AGENDA = ['Medición','Instalación','Entrega','Retiro'];
const ESTADO_AGENDA = ['Pendiente','Confirmado','Realizado','Reprogramado'];
const tipoColor = { Medición: C.blue, Instalación: C.green, Entrega: C.purple, Retiro: C.orange };
const estadoAgColor = { Pendiente: C.yellow, Confirmado: C.green, Realizado: C.textMuted, Reprogramado: C.orange };

const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

/* ── CALENDAR VIEW ── */
const CalendarioAgenda = ({ estadosMap, setEstadosMap, onShowCreate }) => {
  const { agenda, trabajos, clientes } = GF_DATA;
  const hoy = new Date(2026, 3, 29); // mock "today" = 29 Apr 2026
  const [mes, setMes] = React.useState(hoy.getMonth());
  const [anio, setAnio] = React.useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = React.useState(null);

  const prevMes = () => { if (mes === 0) { setMes(11); setAnio(a => a-1); } else setMes(m => m-1); setDiaSeleccionado(null); };
  const nextMes = () => { if (mes === 11) { setMes(0); setAnio(a => a+1); } else setMes(m => m+1); setDiaSeleccionado(null); };

  // Build calendar days grid
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const celdas = [];
  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  // Index events by date string
  const pad = n => String(n).padStart(2,'0');
  const keyFor = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;

  const eventsByDay = {};
  agenda.forEach(ev => {
    if (!eventsByDay[ev.fecha]) eventsByDay[ev.fecha] = [];
    eventsByDay[ev.fecha].push({ ...ev, _kind: 'agenda' });
  });
  trabajos.forEach(t => {
    if (!t.fechaPromesa) return;
    if (!eventsByDay[t.fechaPromesa]) eventsByDay[t.fechaPromesa] = [];
    eventsByDay[t.fechaPromesa].push({ ...t, _kind: 'obra' });
  });

  const selKey = diaSeleccionado ? keyFor(anio, mes, diaSeleccionado) : null;
  const selEvents = selKey ? (eventsByDay[selKey] || []) : [];
  const todayKey = keyFor(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return (
    <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
      {/* Calendar grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '16px 20px', minWidth: 0 }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={prevMes} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.textSub }}>‹</button>
          <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 16, color: C.text }}>{MESES[mes]} {anio}</span>
          <button onClick={nextMes} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.textSub }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 3 }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={{ textAlign: 'center', fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textMuted, padding: '4px 0', letterSpacing: .5 }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, flex: 1 }}>
          {celdas.map((dia, idx) => {
            if (!dia) return <div key={`e-${idx}`} style={{ borderRadius: 8, background: 'transparent' }} />;
            const key = keyFor(anio, mes, dia);
            const evs = eventsByDay[key] || [];
            const agendaEvs = evs.filter(e => e._kind === 'agenda');
            const obraEvs = evs.filter(e => e._kind === 'obra');
            const isToday = key === todayKey;
            const isSel = diaSeleccionado === dia;
            const hasAlert = agendaEvs.some(e => e.tecnico === 'Sin asignar') || obraEvs.some(o => o.prioridad === 'Alta' && ['⚠ Atrasado','Pendiente material'].includes(o.estadoFabrica));

            return (
              <div key={key} onClick={() => setDiaSeleccionado(isSel ? null : dia)}
                style={{ borderRadius: 8, border: `1.5px solid ${isSel ? C.blue : isToday ? C.blueLight : evs.length > 0 ? C.borderDark : C.border}`, background: isSel ? C.bluePale : isToday ? '#f0f9ff' : C.white, cursor: evs.length > 0 ? 'pointer' : 'default', padding: '6px 7px', minHeight: 68, display: 'flex', flexDirection: 'column', gap: 3, transition: 'all .12s', boxShadow: isSel ? `0 0 0 2px ${C.blue}40` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? C.blue : isSel ? C.blue : C.text, width: 22, height: 22, borderRadius: '50%', background: isToday ? C.blue + '18' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{dia}</span>
                  {hasAlert && <span style={{ fontSize: 9, color: C.red }}>●</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {agendaEvs.slice(0,2).map((ev,i) => {
                    const tc = tipoColor[ev.tipo] || C.blue;
                    return <div key={i} style={{ borderRadius: 3, background: tc + '22', padding: '1px 4px', fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: tc, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.tipo.slice(0,3)} · {clientes.find(c=>c.id===ev.clienteId)?.nombre.split(' ')[0]}</div>;
                  })}
                  {obraEvs.slice(0, 2 - Math.min(agendaEvs.length,2)).map((t,i) => (
                    <div key={`o${i}`} style={{ borderRadius: 3, background: '#f1f5f9', border: `1px solid ${C.borderDark}`, padding: '1px 4px', fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: C.textSub, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>#{t.id}</div>
                  ))}
                  {evs.length > 2 && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 9, color: C.textMuted }}>+{evs.length - 2} más</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {Object.entries(tipoColor).map(([t,col]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: col }}></div>
              <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted }}>{t}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: C.borderDark, border: `1px solid ${C.borderDark}` }}></div>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted }}>Entrega obra</span>
          </div>
        </div>
      </div>

      {/* Side panel — selected day */}
      <div style={{ width: 280, borderLeft: `1px solid ${C.border}`, background: C.white, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        {diaSeleccionado ? (
          <>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 15, fontWeight: 700, color: C.text }}>{diaSeleccionado} de {MESES[mes]}</div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>{selEvents.length} evento{selEvents.length !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setDiaSeleccionado(null)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', color: C.textMuted, fontSize: 14 }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selEvents.length === 0 && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>Sin eventos este día</div>}
              {selEvents.filter(e => e._kind === 'agenda').map(ev => {
                const cl = clientes.find(c => c.id === ev.clienteId);
                const tc = tipoColor[ev.tipo] || C.blue;
                const est = estadosMap[ev.id] || ev.estado;
                return (
                  <div key={ev.id} style={{ borderRadius: 10, border: `1px solid ${ev.tecnico === 'Sin asignar' ? '#fecaca' : C.border}`, background: ev.tecnico === 'Sin asignar' ? '#fef9f9' : C.slate, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tc, background: tc + '18', borderRadius: 4, padding: '2px 6px', fontFamily: 'DM Sans,sans-serif' }}>{ev.tipo}</span>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: estadoAgColor[est] || C.textSub, marginLeft: 'auto' }}>● {est}</span>
                    </div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{cl?.nombre}</div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub, marginBottom: ev.obs ? 5 : 0 }}>⏰ {ev.hora} · 👤 {ev.tecnico === 'Sin asignar' ? <span style={{ color: C.red, fontWeight: 600 }}>⚠ Sin asignar</span> : ev.tecnico}</div>
                    {ev.obs && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#78350f', background: '#fffbeb', borderRadius: 5, padding: '3px 6px', marginTop: 4 }}>{ev.obs}</div>}
                    <div style={{ marginTop: 6 }}>
                      <select value={est} onChange={e => setEstadosMap(prev => ({ ...prev, [ev.id]: e.target.value }))}
                        style={{ width: '100%', height: 28, borderRadius: 6, border: `1px solid ${C.border}`, padding: '0 6px', fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.text, background: C.white, cursor: 'pointer' }}>
                        {ESTADO_AGENDA.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
              {selEvents.filter(e => e._kind === 'obra').map(t => {
                const cl = clientes.find(c => c.id === t.clienteId);
                const rc = rubroColors[t.rubro] || rubroColors.Mixto;
                const isAlerta = t.prioridad === 'Alta';
                return (
                  <div key={t.id} style={{ borderRadius: 10, border: `1px solid ${isAlerta ? '#fed7aa' : C.border}`, background: isAlerta ? '#fff7ed' : C.slate, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: rc.text, background: rc.bg, borderRadius: 4, padding: '2px 6px', fontFamily: 'DM Sans,sans-serif', border: `1px solid ${rc.border}` }}>{t.rubro}</span>
                      <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>#{t.id}</span>
                    </div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{cl?.nombre}</div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub, marginBottom: 3, lineHeight: 1.4 }}>{t.descripcion.slice(0,60)}{t.descripcion.length > 60 ? '…' : ''}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: isAlerta ? C.orange : C.textSub, background: isAlerta ? '#fed7aa' : C.border + '60', borderRadius: 4, padding: '2px 6px', fontWeight: isAlerta ? 700 : 400 }}>Prioridad {t.prioridad}</span>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: C.textSub, background: C.border + '60', borderRadius: 4, padding: '2px 6px' }}>{t.estadoFabrica}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.bluePale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📅</div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 1.5 }}>Seleccioná un día para ver los eventos y obras programadas</div>
            <Btn variant="primary" size="sm" onClick={onShowCreate} icon="+">Nuevo evento</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── AGENDA MAIN ── */
const Agenda = () => {
  const { agenda, clientes } = GF_DATA;
  const [vista, setVista] = React.useState('calendario');
  const [filtroTipo, setFiltroTipo] = React.useState('Todos');
  const [estadosMap, setEstadosMap] = React.useState({});
  const [showCreate, setShowCreate] = React.useState(false);

  const filtered = agenda.filter(ev => filtroTipo === 'Todos' || ev.tipo === filtroTipo);
  const sinTecnico = agenda.filter(ev => ev.tecnico === 'Sin asignar');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.slate, overflow: 'hidden' }}>
      <TopBar title="Agenda / Instalaciones" subtitle={`${agenda.length} eventos · ${sinTecnico.length} sin técnico asignado`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Vista toggle */}
            <div style={{ display: 'flex', background: C.slate, border: `1px solid ${C.border}`, borderRadius: 8, padding: 2, gap: 2 }}>
              {[{id:'calendario', label:'Calendario'}, {id:'lista', label:'Lista'}].map(v => (
                <button key={v.id} onClick={() => setVista(v.id)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: vista === v.id ? C.white : 'transparent', boxShadow: vista === v.id ? '0 1px 3px rgba(0,0,0,.1)' : 'none', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: vista === v.id ? 600 : 400, color: vista === v.id ? C.text : C.textSub, cursor: 'pointer', transition: 'all .15s' }}>{v.label}</button>
              ))}
            </div>
            <Btn onClick={() => setShowCreate(true)} variant="primary" icon="+" size="sm">Nuevo evento</Btn>
          </div>
        }
      />

      {sinTecnico.length > 0 && (
        <div style={{ background: '#fef2f2', borderBottom: `1px solid #fecaca`, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚠</span>
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.red, fontWeight: 600 }}>
            {sinTecnico.length} evento{sinTecnico.length > 1 ? 's' : ''} sin técnico asignado: {sinTecnico.map(e => { const cl = clientes.find(c => c.id === e.clienteId); return `${cl?.nombre} (${fdate(e.fecha)})`; }).join(' · ')}
          </span>
        </div>
      )}

      {vista === 'calendario' ? (
        <CalendarioAgenda estadosMap={estadosMap} setEstadosMap={setEstadosMap} onShowCreate={() => setShowCreate(true)} />
      ) : (
        <>
          {/* Tipo filter */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 20px', background: C.white, borderBottom: `1px solid ${C.border}` }}>
            {['Todos', ...TIPOS_AGENDA].map(t => {
              const tc = tipoColor[t] || C.blue;
              return (
                <button key={t} onClick={() => setFiltroTipo(t)} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filtroTipo === t ? tc : C.border}`, background: filtroTipo === t ? tc + '18' : C.white, color: filtroTipo === t ? tc : C.textSub, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: filtroTipo === t ? 600 : 400, cursor: 'pointer' }}>{t}</button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(ev => {
              const cl = clientes.find(c => c.id === ev.clienteId);
              const tc = tipoColor[ev.tipo] || C.blue;
              const est = estadosMap[ev.id] || ev.estado;
              const ecColor = estadoAgColor[est] || C.textSub;
              const sinTec = ev.tecnico === 'Sin asignar';

              return (
                <div key={ev.id} style={{ background: C.white, border: `1px solid ${sinTec ? '#fecaca' : C.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: tc + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: tc, fontFamily: 'DM Sans,sans-serif', textAlign: 'center', lineHeight: 1.2 }}>{ev.tipo.slice(0,3).toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 700, color: C.text }}>{cl?.nombre}</span>
                      <span style={{ fontSize: 11, color: tc, background: tc + '18', borderRadius: 4, padding: '1px 7px', fontFamily: 'DM Sans,sans-serif', fontWeight: 500 }}>{ev.tipo}</span>
                      <span style={{ fontSize: 11, color: ecColor, fontFamily: 'DM Sans,sans-serif', fontWeight: 500 }}>● {est}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: ev.obs ? 6 : 0 }}>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>📅 {fdate(ev.fecha)} · {ev.hora}</span>
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: sinTec ? C.red : C.textSub, fontWeight: sinTec ? 600 : 400 }}>
                        {sinTec ? '⚠ Sin técnico asignado' : `👤 ${ev.tecnico}`}
                      </span>
                    </div>
                    {ev.obs && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#78350f', background: '#fffbeb', borderRadius: 6, padding: '4px 8px', marginTop: 4 }}>{ev.obs}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                    <select value={est} onChange={e => setEstadosMap(prev => ({ ...prev, [ev.id]: e.target.value }))} onClick={e => e.stopPropagation()}
                      style={{ height: 30, borderRadius: 6, border: `1px solid ${C.border}`, padding: '0 6px', fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.text, cursor: 'pointer', background: C.white }}>
                      {ESTADO_AGENDA.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <WABtn text={`Hola ${cl?.nombre}, le confirmamos su ${ev.tipo.toLowerCase()} para el ${fdate(ev.fecha)} a las ${ev.hora}. GlassFlow`} phone={cl?.whatsapp} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo evento" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Tipo" required>
              <Select options={TIPOS_AGENDA} placeholder="Seleccionar..." value="" onChange={() => {}} />
            </Field>
            <Field label="Cliente" required>
              <Select options={clientes.map(c => ({ value: c.id, label: c.nombre }))} placeholder="Seleccionar..." value="" onChange={() => {}} />
            </Field>
            <Field label="Fecha" required><Input type="date" value="" onChange={() => {}} /></Field>
            <Field label="Hora" required><Input type="time" value="" onChange={() => {}} /></Field>
            <Field label="Técnico">
              <Select options={['Pablo M.','Gustavo F.','Sin asignar']} value="" onChange={() => {}} />
            </Field>
            <Field label="Estado">
              <Select options={ESTADO_AGENDA} value="" onChange={() => {}} />
            </Field>
          </div>
          <Field label="Observaciones">
            <textarea placeholder="Instrucciones, datos de acceso, etc." style={{ height: 70, borderRadius: 7, border: `1px solid ${C.border}`, padding: '8px 10px', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, outline: 'none', width: '100%', resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <Btn variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Btn>
            <Btn variant="primary">Guardar evento</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { Cobranzas, Agenda });
