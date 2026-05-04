/* GlassFlow CRM — Dashboard */

/* ── FACTURACIÓN CHART ── */
const FacturacionChart = () => {
  const meses = [
    { label: 'Nov', cobrado: 620000, pendiente: 180000 },
    { label: 'Dic', cobrado: 890000, pendiente: 240000 },
    { label: 'Ene', cobrado: 740000, pendiente: 310000 },
    { label: 'Feb', cobrado: 1050000, pendiente: 280000 },
    { label: 'Mar', cobrado: 980000, pendiente: 390000 },
    { label: 'Abr', cobrado: 862000, pendiente: 1175000 },
  ];
  const maxVal = Math.max(...meses.map(m => m.cobrado + m.pendiente));
  const barH = 120;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text }}>Facturación mensual</div>
          <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>Últimos 6 meses</div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }}></div><span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub }}>Cobrado</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#fed7aa' }}></div><span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub }}>Pendiente</span></div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: barH + 28 }}>
        {meses.map((m, i) => {
          const cobH = Math.round((m.cobrado / maxVal) * barH);
          const pendH = Math.round((m.pendiente / maxVal) * barH);
          const isLast = i === meses.length - 1;
          return (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: barH, gap: 1, width: '100%' }}>
                <div title={`Pendiente: ${money(m.pendiente)}`} style={{ background: isLast ? '#fed7aa' : '#e2e8f0', borderRadius: '3px 3px 0 0', height: pendH, transition: 'height .4s', minHeight: m.pendiente > 0 ? 3 : 0 }}></div>
                <div title={`Cobrado: ${money(m.cobrado)}`} style={{ background: isLast ? C.blue : '#93c5fd', borderRadius: pendH > 0 ? '0' : '3px 3px 0 0', height: cobH, transition: 'height .4s' }}></div>
              </div>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: isLast ? 700 : 400, color: isLast ? C.blue : C.textMuted }}>{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = ({ onNav }) => {
  const { kpis, alertas, trabajos, agenda, clientes } = GF_DATA;
  const [showAlerts, setShowAlerts] = React.useState(false);

  const proximosTrabajos = trabajos
    .filter(t => !['Listo','Entregado','Listo para entregar'].includes(t.estadoFabrica))
    .sort((a, b) => a.fechaPromesa.localeCompare(b.fechaPromesa))
    .slice(0, 5);

  const alertNiveles = { alta: C.red, media: C.yellow, baja: C.blue };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: C.slate }}>
      <TopBar
        title="Dashboard"
        subtitle="Resumen operativo del día — 28 abr 2026"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => setShowAlerts(true)} variant="default" icon="🔔" size="sm">
              Alertas
              <span style={{ background: C.red, color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: 10, marginLeft: 2 }}>{alertas.length}</span>
            </Btn>
            <Btn onClick={() => onNav('presupuestos')} variant="primary" icon="+" size="sm">Nuevo presupuesto</Btn>
          </div>
        }
      />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPIs row 1 */}

        <div style={{ display: 'flex', gap: 12 }}>
          <StatCard label="Presupuestos pendientes" value={kpis.presupuestosPendientes} sub="Sin respuesta del cliente" accent={C.yellow} icon="◈" onClick={() => onNav('presupuestos')} />
          <StatCard label="Trabajos en producción" value={kpis.enFabrica} sub="En fábricas PVC y Vidrios" accent={C.blue} icon="⬡" onClick={() => onNav('trabajos')} />
          <StatCard label="Listos para entregar" value={kpis.listos} sub="Esperando instalación/retiro" accent={C.green} icon="✓" onClick={() => onNav('trabajos')} />
          <StatCard label="Instalaciones pendientes" value={kpis.instalacionesPendientes} sub="Esta semana" accent={C.purple} icon="◷" onClick={() => onNav('agenda')} />
          <StatCard label="Presupuestos pendientes" value={money(kpis.saldoTotal)} sub="Total a cobrar" accent={C.orange} icon="◉" onClick={() => onNav('cobranzas')} />
        </div>

        {/* Facturación chart */}
        <FacturacionChart />

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

          {/* Left: Próximas entregas */}
          <div>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>Próximas entregas</div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {proximosTrabajos.map((t, i) => {
                const cliente = clientes.find(c => c.id === t.clienteId);
                const atrasado = t.estadoFabrica.includes('Atrasado');
                return (
                  <div key={t.id} onClick={() => onNav('trabajos')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < proximosTrabajos.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', background: atrasado ? '#fef2f2' : 'transparent', transition: 'background .1s' }}
                    onMouseEnter={e => { if (!atrasado) e.currentTarget.style.background = C.slate; }}
                    onMouseLeave={e => { e.currentTarget.style.background = atrasado ? '#fef2f2' : 'transparent'; }}>
                    <PriorityDot level={t.prioridad} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 600, color: C.textMuted }}>#{t.id}</span>
                        <Badge label={t.rubro} type="rubro" />
                        <Badge label={t.estadoFabrica} type="estado" />
                      </div>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, color: C.text }}>{cliente?.nombre}</div>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.descripcion}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, color: atrasado ? C.red : C.text }}>📅 {fdate(t.fechaPromesa)}</div>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted }}>{t.fabrica === 'PVC' ? '🏭 PVC' : '🪟 Vidrios'}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Producción por rubro */}
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, margin: '20px 0 12px' }}>Estado de producción</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Fábrica PVC', items: trabajos.filter(t => t.fabrica === 'PVC'), color: C.sky, icon: '🏭', nav: 'fabrica-pvc' },
                { label: 'Fábrica Vidrios', items: trabajos.filter(t => t.fabrica === 'Vidrios'), color: C.purple, icon: '🪟', nav: 'fabrica-vid' },
              ].map(fab => {
                const byEstado = {};
                fab.items.forEach(t => { byEstado[t.estadoFabrica] = (byEstado[t.estadoFabrica] || 0) + 1; });
                return (
                  <div key={fab.label} onClick={() => onNav(fab.nav)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', borderTop: `3px solid ${fab.color}` }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 10 }}>{fab.icon} {fab.label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(byEstado).map(([est, count]) => {
                        const ec = estadoColors[est] || { bg: '#f8fafc', text: C.textSub, border: C.border };
                        return (
                          <div key={est} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: ec.text, fontFamily: 'DM Sans,sans-serif' }}>{est}</span>
                            <span style={{ background: ec.bg, border: `1px solid ${ec.border}`, color: ec.text, borderRadius: 10, padding: '0 7px', fontSize: 11, fontWeight: 600 }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 11, color: fab.color, fontFamily: 'DM Sans,sans-serif', fontWeight: 500 }}>Ver panel →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Alertas + Agenda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Alertas */}
            <div>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>
                Alertas activas
                <span style={{ marginLeft: 8, background: C.red, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{alertas.length}</span>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {alertas.slice(0, 4).map((a, i) => {
                  const nivelColor = { alta: C.red, media: C.yellow, baja: C.blue }[a.nivel];
                  const nivelIcon = { alta: '🔴', media: '🟡', baja: '🔵' }[a.nivel];
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 10, padding: '11px 14px', borderBottom: i < Math.min(alertas.length, 4) - 1 ? `1px solid ${C.border}` : 'none', background: a.nivel === 'alta' ? '#fef2f2' : 'transparent' }}>
                      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{nivelIcon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>{a.texto}</div>
                        <button onClick={() => onNav('trabajos')} style={{ background: 'none', border: 'none', color: nivelColor, fontSize: 11, fontFamily: 'DM Sans,sans-serif', fontWeight: 600, cursor: 'pointer', padding: 0 }}>{a.accion} →</button>
                      </div>
                    </div>
                  );
                })}
                {alertas.length > 4 && (
                  <div style={{ padding: '10px 14px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
                    <button onClick={() => setShowAlerts(true)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, cursor: 'pointer' }}>Ver todas ({alertas.length}) →</button>
                  </div>
                )}
              </div>
            </div>

            {/* Agenda hoy */}
            <div>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 12 }}>Agenda — próximos días</div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {agenda.slice(0, 4).map((ev, i) => {
                  const cliente = clientes.find(c => c.id === ev.clienteId);
                  const tipoColors = { Medición: C.blue, Instalación: C.green, Entrega: C.purple, Retiro: C.orange };
                  const tc = tipoColors[ev.tipo] || C.textSub;
                  const sinTecnico = ev.tecnico === 'Sin asignar';
                  return (
                    <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '11px 14px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', background: sinTecnico ? '#fef2f2' : 'transparent' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: tc + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tc, fontFamily: 'DM Sans,sans-serif' }}>{ev.tipo.slice(0, 3).toUpperCase()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 12, color: C.text }}>{cliente?.nombre}</div>
                        <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub }}>{fdate(ev.fecha)} · {ev.hora} · {sinTecnico ? <span style={{ color: C.red, fontWeight: 600 }}>⚠ Sin técnico</span> : ev.tecnico}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ padding: '10px 14px', textAlign: 'center', borderTop: `1px solid ${C.border}` }}>
                  <button onClick={() => onNav('agenda')} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, cursor: 'pointer' }}>Ver agenda completa →</button>
                </div>
              </div>
            </div>

            {/* Saldo rápido */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy}, #1e3a5f)`, borderRadius: 12, padding: '16px 18px', color: '#fff' }}>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Cobranzas del mes</div>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{money(kpis.cobradoMes)}</div>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>cobrado · {money(kpis.saldoTotal)} pendiente</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(kpis.cobradoMes / (kpis.cobradoMes + kpis.saldoTotal) * 100)}%`, background: 'linear-gradient(90deg,#22d3ee,#3b82f6)', borderRadius: 3 }}></div>
              </div>
              <button onClick={() => onNav('cobranzas')} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, cursor: 'pointer', marginTop: 10, padding: 0 }}>Ver cobranzas →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas modal */}
      <Modal open={showAlerts} onClose={() => setShowAlerts(false)} title="Alertas activas" width={500}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alertas.map(a => {
            const nivelColor = { alta: C.red, media: C.yellow, baja: C.blue }[a.nivel];
            const nivelIcon = { alta: '🔴', media: '🟡', baja: '🔵' }[a.nivel];
            return (
              <div key={a.id} style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 8, background: a.nivel === 'alta' ? '#fef2f2' : C.slate, border: `1px solid ${a.nivel === 'alta' ? '#fecaca' : C.border}` }}>
                <span>{nivelIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, marginBottom: 6 }}>{a.texto}</div>
                  <Btn variant="default" size="sm">{a.accion}</Btn>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { Dashboard });
