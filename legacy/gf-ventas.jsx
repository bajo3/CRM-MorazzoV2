/* GlassFlow — Presupuesto Calculadora + Clientes (v2) */

/* ─── PRECIOS BASE ─── */
const PRECIOS = {
  vidrio: {
    'Float 4mm': 42000, 'Float 5mm': 52000, 'Float 6mm': 65000,
    'Float 8mm': 88000, 'Templado 6mm': 115000, 'Templado 8mm': 148000,
    'Templado 10mm': 190000, 'Laminado 3+3': 95000, 'Laminado 4+4': 128000,
    'Laminado 5+5': 158000,
  },
  dvh: {
    'DVH 4+9+4': 175000, 'DVH 6+9+6': 195000, 'DVH 4+12+4': 188000,
    'DVH 6+12+6': 215000, 'DVH 4+16+4 Bajo Emisivo': 295000,
    'DVH 6+16+6 Bajo Emisivo': 345000,
  },
  espejo: {
    'Espejo plata 4mm': 48000, 'Espejo plata 6mm': 72000,
    'Espejo bronce 4mm': 55000, 'Espejo antiguo 4mm': 68000,
  },
  pvc: {
    'Ventana corrediza': 165000, 'Ventana oscilobatiente': 195000,
    'Puerta batiente': 248000, 'Paño fijo': 125000,
    'Puerta corrediza doble': 320000,
  },
};

const EXTRA_PRECIOS = {
  colocacion: 15000, biselado_ml: 8500, pulido_ml: 2800,
  perforacion: 3500, mosquitero: 18000, premarco: 12000, templado_extra: 45000,
};

/* ─── CALCULADORA DE PRESUPUESTO ─── */
const CreatePresupuesto = ({ onClose, clientes, onSave, clienteIdInicial }) => {
  const [step, setStep] = React.useState(1);
  const [clienteId, setClienteId] = React.useState(clienteIdInicial || '');
  const [rubro, setRubro] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [currentItem, setCurrentItem] = React.useState({ tipo: '', ancho: '', alto: '', cantidad: 1 });
  const [extras, setExtras] = React.useState({});
  const [senaPct, setSenaPct] = React.useState(50);
  const [vendedor, setVendedor] = React.useState('Lucía R.');
  const [fechaEntrega, setFechaEntrega] = React.useState('');
  const [obs, setObs] = React.useState('');

  const set = (k, v) => setCurrentItem(p => ({ ...p, [k]: v }));
  const toggleExtra = (k) => setExtras(p => ({ ...p, [k]: !p[k] }));

  /* ── m² calculation ── */
  const ancho = parseFloat(currentItem.ancho) || 0;
  const alto = parseFloat(currentItem.alto) || 0;
  const m2Unit = (ancho * alto) / 1000000;
  const m2Total = m2Unit * (parseInt(currentItem.cantidad) || 1);
  const perimetro = ancho && alto ? 2 * (ancho + alto) / 1000 : 0; // metros

  /* ── price calculation ── */
  const precioBase = (() => {
    const cat = { PVC: 'pvc', Vidrio: 'vidrio', DVH: 'dvh', Espejo: 'espejo' }[rubro];
    if (!cat || !currentItem.tipo) return 0;
    const base = PRECIOS[cat]?.[currentItem.tipo] || 0;
    if (rubro === 'PVC') return base * (parseInt(currentItem.cantidad) || 1);
    return base * m2Total;
  })();

  const precioExtras = (() => {
    let sum = 0;
    if (extras.colocacion) sum += EXTRA_PRECIOS.colocacion * (parseInt(currentItem.cantidad) || 1);
    if (extras.biselado) sum += EXTRA_PRECIOS.biselado_ml * perimetro;
    if (extras.pulido) sum += EXTRA_PRECIOS.pulido_ml * perimetro;
    if (extras.perforaciones) sum += EXTRA_PRECIOS.perforacion * (parseInt(currentItem.cantidad) || 1);
    if (extras.mosquitero) sum += EXTRA_PRECIOS.mosquitero * (parseInt(currentItem.cantidad) || 1);
    if (extras.premarco) sum += EXTRA_PRECIOS.premarco * (parseInt(currentItem.cantidad) || 1);
    return sum;
  })();

  const subtotal = precioBase + precioExtras;
  const totalItems = items.reduce((s, it) => s + it.total, 0) + subtotal;
  const sena = Math.round(totalItems * senaPct / 100);
  const saldo = totalItems - sena;

  const addItem = () => {
    if (!currentItem.tipo) return;
    const newItem = { ...currentItem, m2: m2Total, extras: { ...extras }, total: subtotal, rubro };
    setItems(p => [...p, newItem]);
    setCurrentItem({ tipo: '', ancho: '', alto: '', cantidad: 1 });
    setExtras({});
  };

  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  const rubroOptions = { PVC: PRECIOS.pvc, Vidrio: PRECIOS.vidrio, DVH: PRECIOS.dvh, Espejo: PRECIOS.espejo };
  const tipoOptions = rubro ? Object.keys(rubroOptions[rubro] || {}) : [];

  const extrasByRubro = {
    Vidrio: [['colocacion','Colocación'], ['pulido','Pulido de canto'], ['templado','Templado (extra)']],
    DVH:    [['colocacion','Colocación']],
    Espejo: [['colocacion','Colocación'], ['biselado','Biselado'], ['perforaciones','Perforaciones']],
    PVC:    [['mosquitero','Mosquitero'], ['premarco','Premarco'], ['colocacion','Colocación']],
    Mixto:  [['colocacion','Colocación']],
  };

  /* ── STEPS ── */
  const stepTitles = ['Cliente y rubro', 'Detalle del producto', 'Revisión y totales'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: 420 }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: C.slate, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        {stepTitles.map((t, i) => (
          <div key={i} style={{ flex: 1, padding: '8px 12px', textAlign: 'center', background: step === i+1 ? C.blue : 'transparent', transition: 'background .2s' }}>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, color: step === i+1 ? '#fff' : step > i+1 ? C.green : C.textMuted }}>{i+1}. {t}</div>
          </div>
        ))}
      </div>

      {/* ── STEP 1: Cliente + Rubro ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Cliente" required>
              <Select value={clienteId} onChange={e => setClienteId(e.target.value)}
                options={clientes.map(c => ({ value: c.id, label: c.nombre }))} placeholder="Seleccionar cliente..." />
            </Field>
            <Field label="Vendedor">
              <Select value={vendedor} onChange={e => setVendedor(e.target.value)}
                options={['Lucía R.', 'Martín G.', 'Facundo M.']} />
            </Field>
          </div>
          <Field label="Rubro" required>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['PVC', 'Vidrio', 'DVH', 'Espejo', 'Mixto'].map(r => {
                const rc = rubroColors[r] || rubroColors.Mixto;
                return (
                  <button key={r} onClick={() => { setRubro(r); setCurrentItem({ tipo: '', ancho: '', alto: '', cantidad: 1 }); }}
                    style={{ padding: '8px 18px', borderRadius: 8, border: `2px solid ${rubro === r ? rc.text : C.border}`, background: rubro === r ? rc.bg : C.white, color: rubro === r ? rc.text : C.textSub, fontSize: 13, fontFamily: 'DM Sans,sans-serif', fontWeight: rubro === r ? 700 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                    {r}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Fecha de entrega prometida">
            <Input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
          </Field>
        </div>
      )}

      {/* ── STEP 2: Detalle del producto ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Items ya agregados */}
          {items.length > 0 && (
            <div style={{ background: C.slate, borderRadius: 8, padding: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>Ítems agregados</div>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: C.white, borderRadius: 6, marginBottom: 4, border: `1px solid ${C.border}` }}>
                  <Badge label={it.rubro} type="rubro" />
                  <span style={{ flex: 1, fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.text }}>{it.tipo} {it.ancho && `· ${it.ancho}×${it.alto}mm`} {it.cantidad > 1 ? `· ×${it.cantidad}` : ''}</span>
                  <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 700, color: C.text }}>{money(it.total)}</span>
                  <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Nuevo ítem */}
          <div style={{ background: C.bluePale, borderRadius: 8, padding: 14, border: `1px solid #bfdbfe` }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 10 }}>+ Agregar {rubro === 'Mixto' ? 'ítem' : rubro}</div>
            {rubro === 'Mixto' && (
              <Field label="Rubro del ítem" required>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {['PVC','Vidrio','DVH','Espejo'].map(r => (
                    <button key={r} onClick={() => setRubro(r)} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`, background: C.white, color: C.textSub, fontSize:11, fontFamily:'DM Sans,sans-serif', cursor:'pointer' }}>{r}</button>
                  ))}
                </div>
              </Field>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <Field label="Tipo" required>
                <Select value={currentItem.tipo} onChange={e => set('tipo', e.target.value)}
                  options={tipoOptions} placeholder="Seleccionar tipo..." />
              </Field>
              <Field label="Cantidad">
                <Input type="number" value={currentItem.cantidad} onChange={e => set('cantidad', e.target.value)} placeholder="1" />
              </Field>
              {rubro !== 'PVC' && (
                <>
                  <Field label="Ancho (mm)" required>
                    <Input type="number" value={currentItem.ancho} onChange={e => set('ancho', e.target.value)} placeholder="Ej: 1500" />
                  </Field>
                  <Field label="Alto (mm)" required>
                    <Input type="number" value={currentItem.alto} onChange={e => set('alto', e.target.value)} placeholder="Ej: 1100" />
                  </Field>
                </>
              )}
              {rubro === 'PVC' && (
                <>
                  <Field label="Ancho (mm)"><Input type="number" value={currentItem.ancho} onChange={e => set('ancho', e.target.value)} placeholder="1500" /></Field>
                  <Field label="Alto (mm)"><Input type="number" value={currentItem.alto} onChange={e => set('alto', e.target.value)} placeholder="1100" /></Field>
                  <Field label="Color">
                    <Select value={currentItem.color||''} onChange={e => set('color', e.target.value)}
                      options={['Blanco RAL 9016','Gris pizarra RAL 7015','Negro RAL 9005','Madera roble','Personalizado']} placeholder="Seleccionar..." />
                  </Field>
                  <Field label="Apertura">
                    <Select value={currentItem.apertura||''} onChange={e => set('apertura', e.target.value)}
                      options={['Derecha','Izquierda','Corrediza izq → der','Corrediza der → izq']} placeholder="Seleccionar..." />
                  </Field>
                </>
              )}
            </div>

            {/* Extras */}
            {(extrasByRubro[rubro] || []).length > 0 && (
              <div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>Adicionales</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(extrasByRubro[rubro] || []).map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: '5px 10px', borderRadius: 6, border: `1px solid ${extras[key] ? C.blue : C.border}`, background: extras[key] ? C.bluePale : C.white, transition: 'all .15s' }}>
                      <input type="checkbox" checked={!!extras[key]} onChange={() => toggleExtra(key)} style={{ cursor: 'pointer', accentColor: C.blue }} />
                      <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: extras[key] ? C.blue : C.text, fontWeight: extras[key] ? 600 : 400 }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Live calculation */}
            {currentItem.tipo && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: C.white, borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {m2Total > 0 && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>📐 <strong>{m2Total.toFixed(2)} m²</strong></div>}
                {precioBase > 0 && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>Base: <strong>{money(Math.round(precioBase))}</strong></div>}
                {precioExtras > 0 && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>Extras: <strong>{money(Math.round(precioExtras))}</strong></div>}
                <div style={{ marginLeft: 'auto', fontFamily: 'Space Grotesk,sans-serif', fontSize: 16, fontWeight: 700, color: C.blue }}>= {money(Math.round(subtotal))}</div>
                <Btn variant="primary" onClick={addItem} disabled={!currentItem.tipo || subtotal === 0}>+ Agregar ítem</Btn>
              </div>
            )}
          </div>
          <Field label="Observaciones">
            <textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Instrucciones especiales, detalles de instalación, referencia del cliente..." style={{ height: 60, borderRadius: 7, border: `1px solid ${C.border}`, padding: '8px 10px', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, outline: 'none', width: '100%', resize: 'vertical', background: C.white }} />
          </Field>
        </div>
      )}

      {/* ── STEP 3: Revisión y totales ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.slate, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Resumen del presupuesto</div>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontFamily: 'DM Sans,sans-serif', fontSize: 13 }}>
                <span style={{ color: C.textSub }}>{it.tipo} {it.ancho ? `${it.ancho}×${it.alto}mm` : ''} {it.cantidad > 1 ? `×${it.cantidad}` : ''}</span>
                <span style={{ fontWeight: 600, color: C.text }}>{money(it.total)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 16, fontWeight: 700 }}>
              <span>Total</span><span style={{ color: C.blue }}>{money(Math.round(totalItems))}</span>
            </div>
          </div>
          <div style={{ background: C.white, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 8 }}>Seña sugerida: {senaPct}%</div>
            <input type="range" min={10} max={80} step={5} value={senaPct} onChange={e => setSenaPct(Number(e.target.value))}
              style={{ width: '100%', accentColor: C.blue, marginBottom: 10 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['Total', money(Math.round(totalItems)), C.text], ['Seña', money(sena), C.green], ['Saldo', money(saldo), C.orange]].map(([l, v, col]) => (
                <div key={l} style={{ background: C.slate, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 15, fontWeight: 700, color: col }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {obs && (
            <div style={{ background: '#fffbeb', border: `1px solid #fde68a`, borderRadius: 8, padding: '10px 12px', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#78350f' }}>
              <strong>Obs:</strong> {obs}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <div>
          {step > 1 && <Btn variant="ghost" onClick={() => setStep(s => s - 1)}>← Anterior</Btn>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          {step < 3
            ? <Btn variant="primary" onClick={() => setStep(s => s + 1)} disabled={step === 1 && (!clienteId || !rubro) || step === 2 && items.length === 0}>Siguiente →</Btn>
            : <Btn variant="success" onClick={() => { onSave && onSave({ clienteId, rubro, items, total: totalItems, sena, saldo, vendedor, obs }); onClose(); }}>✓ Guardar presupuesto</Btn>
          }
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════ PRESUPUESTOS ═══════════════════════════ */
const ESTADOS_PRES = ['Consulta recibida','En armado','Enviado','Esperando respuesta','Aprobado','Rechazado','Vencido'];

const Presupuestos = () => {
  const { presupuestos, clientes } = GF_DATA;
  const [filtroEst, setFiltroEst] = React.useState('Todos');
  const [pdfPres, setPdfPres] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [showCreate, setShowCreate] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [estadosMap, setEstadosMap] = React.useState({});
  const [savedPres, setSavedPres] = React.useState([]);

  const allPres = [...presupuestos, ...savedPres];

  const filtrados = allPres.filter(p => {
    if (filtroEst !== 'Todos' && (estadosMap[p.id] || p.estado) !== filtroEst) return false;
    if (search) {
      const cl = clientes.find(c => c.id === p.clienteId);
      if (!`${p.id} ${cl?.nombre} ${p.rubro}`.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const updateEstado = (id, est) => setEstadosMap(prev => ({ ...prev, [id]: est }));

  const handleSave = (data) => {
    const newId = `P${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setSavedPres(p => [...p, {
      id: newId, clienteId: data.clienteId, fecha: new Date().toISOString().slice(0,10),
      rubro: data.rubro, estado: 'En armado', total: data.total, sena: data.sena,
      saldo: data.saldo, vendedor: data.vendedor, items: data.items,
    }]);
  };

  const tabCounts = {};
  ESTADOS_PRES.forEach(e => { tabCounts[e] = allPres.filter(p => (estadosMap[p.id] || p.estado) === e).length; });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.slate, overflow: 'hidden' }}>
      <TopBar title="Presupuestos" subtitle={`${filtrados.length} presupuestos`} search={search} onSearch={setSearch}
        actions={<Btn onClick={() => setShowCreate(true)} variant="primary" icon="+" size="sm">Nuevo presupuesto</Btn>}
      />
      <div style={{ display: 'flex', gap: 0, padding: '0 20px', background: C.white, borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
        {['Todos', ...ESTADOS_PRES].map(est => {
          const count = est === 'Todos' ? allPres.length : tabCounts[est];
          const active = filtroEst === est;
          return (
            <button key={est} onClick={() => setFiltroEst(est)} style={{ padding: '12px 14px', border: 'none', borderBottom: active ? `2px solid ${C.blue}` : '2px solid transparent', background: 'transparent', color: active ? C.blue : C.textSub, fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
              {est}{count > 0 && <span style={{ background: active ? C.blue : C.border, color: active ? '#fff' : C.textSub, borderRadius: 10, padding: '0 6px', fontSize: 10, fontWeight: 700 }}>{count}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 110px 90px 90px 80px 80px 180px', background: C.slate, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
            {['#','CLIENTE','RUBRO','ESTADO','FECHA','TOTAL','SEÑA','SALDO','ACCIONES'].map((h,i) => (
              <div key={i} style={{ padding: '10px 8px 10px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6 }}>{h}</div>
            ))}
          </div>
          {filtrados.map((p, i) => {
            const cl = clientes.find(c => c.id === p.clienteId);
            const est = estadosMap[p.id] || p.estado;
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 110px 90px 90px 80px 80px 180px', padding: '0 16px', borderBottom: i < filtrados.length-1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background .1s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.slate}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelected(p)}>
                <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: C.textMuted }}>{p.id}</div>
                <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 500, color: C.text }}>{cl?.nombre}</div>
                <div style={{ padding: '8px 8px 8px 0' }}><Badge label={p.rubro} type="rubro" /></div>
                <div style={{ padding: '8px 8px 8px 0' }}><Badge label={est} type="estado" /></div>
                <div style={{ padding: '11px 8px 11px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub }}>{fdate(p.fecha)}</div>
                <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600 }}>{money(p.total)}</div>
                <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: C.green }}>{money(p.sena)}</div>
                <div style={{ padding: '11px 8px 11px 0', fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, fontWeight: 600, color: p.saldo > 0 ? C.orange : C.green }}>{money(p.saldo)}</div>
                <div style={{ padding: '8px 8px 8px 0', display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <Btn size="sm" onClick={() => setSelected(p)}>Ver</Btn>
                  {est === 'Aprobado' && <Btn size="sm" variant="success">→ Trabajo</Btn>}
                  <Btn size="sm" variant="whatsapp" icon="💬"></Btn>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo presupuesto" width={640}>
        <CreatePresupuesto onClose={() => setShowCreate(false)} clientes={clientes} onSave={handleSave} />
      </Modal>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 420, height: '100%', background: C.white, boxShadow: '-8px 0 40px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700 }}>{selected.id}</div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{clientes.find(c=>c.id===selected.clienteId)?.nombre} · {fdate(selected.fecha)}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}><Badge label={selected.rubro} type="rubro" /><Badge label={estadosMap[selected.id] || selected.estado} type="estado" /></div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.textMuted }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6 }}>Cambiar estado</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {ESTADOS_PRES.map(est => {
                  const cur = estadosMap[selected.id] || selected.estado;
                  return <button key={est} onClick={() => updateEstado(selected.id, est)} style={{ padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${cur===est?C.blue:C.border}`, background: cur===est?C.bluePale:C.white, color: cur===est?C.blue:C.textSub, fontSize: 11, fontFamily: 'DM Sans,sans-serif', fontWeight: cur===est?600:400, cursor: 'pointer' }}>{est}</button>;
                })}
              </div>
              <div style={{ background: C.slate, borderRadius: 8, overflow: 'hidden' }}>
                {[['Total', money(selected.total), C.text], ['Seña', money(selected.sena), C.green], ['Saldo', money(selected.saldo), selected.saldo>0?C.orange:C.green]].map(([k,v,col]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 12px', borderBottom:`1px solid ${C.border}`, fontFamily:'DM Sans,sans-serif', fontSize:13 }}>
                    <span style={{ color:C.textSub }}>{k}</span><span style={{ fontWeight:700, color:col }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(estadosMap[selected.id]||selected.estado) === 'Aprobado' && <Btn variant="success" icon="→">Convertir en trabajo</Btn>}
              <WABtn text={`Hola, le enviamos el presupuesto ${selected.id} por ${money(selected.total)}. GlassFlow`} phone={clientes.find(c=>c.id===selected.clienteId)?.whatsapp} />
              <Btn variant="default" icon="📄" onClick={() => setPdfPres(selected)}>PDF</Btn>
            </div>
          </div>
        </div>
      )}
      {pdfPres && <PresupuestoPDF presupuesto={pdfPres} onClose={() => setPdfPres(null)} />}
    </div>
  );
};

/* ═══════════════════════════ CLIENTES ═══════════════════════════ */

const TIPO_COLORS = { particular: C.blue, arquitecto: C.purple, constructor: C.orange, empresa: C.green };
const TIPOS_CLIENTE = ['particular','arquitecto','constructor','empresa'];

/* ── Modal Nuevo / Editar Cliente ── */
const ClienteForm = ({ cliente, onClose, onSave }) => {
  const empty = { nombre:'', tipo:'particular', tel:'', whatsapp:'', direccion:'', localidad:'', obs:'' };
  const [form, setForm] = React.useState(cliente ? { ...cliente } : empty);
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }));
  const esEdicion = !!cliente;

  return (
    <Modal open={true} onClose={onClose} title={esEdicion ? `Editar — ${cliente.nombre}` : 'Nuevo cliente'} width={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Nombre completo / Razón social" required>
              <Input value={form.nombre} onChange={v => set('nombre', v)} placeholder="Ej: Juan Pérez" />
            </Field>
          </div>
          <Field label="Tipo de cliente" required>
            <Select options={TIPOS_CLIENTE} value={form.tipo} onChange={v => set('tipo', v)} />
          </Field>
          <Field label="Localidad">
            <Input value={form.localidad} onChange={v => set('localidad', v)} placeholder="Córdoba" />
          </Field>
          <Field label="Teléfono">
            <Input value={form.tel} onChange={v => set('tel', v)} placeholder="351-0000000" />
          </Field>
          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={v => set('whatsapp', v)} placeholder="3510000000" />
          </Field>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Dirección">
              <Input value={form.direccion} onChange={v => set('direccion', v)} placeholder="Av. Colón 1240" />
            </Field>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Observaciones internas">
              <textarea value={form.obs} onChange={e => set('obs', e.target.value)} placeholder="Notas, preferencias, datos de contacto extra..." rows={3}
                style={{ width:'100%', borderRadius:7, border:`1px solid ${C.border}`, padding:'8px 10px', fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, outline:'none', resize:'vertical' }} />
            </Field>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={() => { onSave(form); onClose(); }}>
            {esEdicion ? '✓ Guardar cambios' : '✓ Crear cliente'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

/* ── Ficha de cliente con tabs ── */
const FichaCliente = ({ cliente, presupuestos, trabajos, agenda, onEdit, onNuevoPres, onNuevoEvento }) => {
  const [tab, setTab] = React.useState('resumen');
  const tc = TIPO_COLORS[cliente.tipo] || C.blue;

  const misPres  = presupuestos.filter(p => p.clienteId === cliente.id);
  const misTrab  = trabajos.filter(t => t.clienteId === cliente.id);
  const misEv    = (agenda||[]).filter(a => a.clienteId === cliente.id);
  const totalFact = misPres.reduce((s,p) => s + p.total, 0);

  const tabs = [
    { id: 'resumen',      label: 'Resumen',      count: null },
    { id: 'presupuestos', label: 'Presupuestos', count: misPres.length },
    { id: 'trabajos',     label: 'Trabajos',     count: misTrab.length },
    { id: 'agenda',       label: 'Agenda',       count: misEv.length },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Header del cliente ── */}
      <div style={{ padding: '20px 24px 0', background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: tc+'18', border:`1.5px solid ${tc}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:18, fontWeight:700, color:tc }}>
                {cliente.nombre.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:20, fontWeight:700, color:C.text, lineHeight:1.1 }}>{cliente.nombre}</div>
              <div style={{ display:'flex', gap:8, marginTop:5, alignItems:'center' }}>
                <span style={{ fontSize:11, color:tc, background:tc+'18', borderRadius:20, padding:'2px 9px', fontFamily:'DM Sans,sans-serif', fontWeight:600, textTransform:'capitalize' }}>{cliente.tipo}</span>
                <span style={{ fontSize:12, color:C.textSub, fontFamily:'DM Sans,sans-serif' }}>📍 {cliente.localidad}</span>
                {cliente.saldo > 0 && <span style={{ fontSize:11, color:C.orange, background:C.orangePale, borderRadius:20, padding:'2px 9px', fontFamily:'Space Grotesk,sans-serif', fontWeight:700 }}>Saldo: {money(cliente.saldo)}</span>}
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
            <WABtn text={`Hola ${cliente.nombre}, le contactamos desde Facundo Morazzo Aberturas y Cristales.`} phone={cliente.whatsapp} />
            {cliente.tel && (
              <a href={`tel:${cliente.tel}`} style={{ textDecoration:'none' }}>
                <button style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.textSub, fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:500, cursor:'pointer' }}>📞 Llamar</button>
              </a>
            )}
            <Btn variant="primary" icon="+" size="sm" onClick={onNuevoPres}>Nuevo presupuesto</Btn>
            <Btn variant="default" size="sm" onClick={() => onNuevoEvento(cliente)}>Agendar</Btn>
            <Btn variant="ghost" size="sm" onClick={onEdit}>Editar</Btn>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:'9px 18px', border:'none', background:'transparent', borderBottom:`2.5px solid ${tab===t.id ? C.blue : 'transparent'}`, color:tab===t.id ? C.blue : C.textSub, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:tab===t.id?700:400, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all .15s' }}>
              {t.label}
              {t.count !== null && t.count > 0 && <span style={{ background:tab===t.id?C.blue:C.borderDark, color:tab===t.id?'#fff':C.textSub, borderRadius:10, padding:'0 6px', fontSize:10, fontWeight:700 }}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'18px 24px', display:'flex', flexDirection:'column', gap:14 }}>

        {tab === 'resumen' && (
          <>
            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {[
                { label:'Presupuestos', value:misPres.length, color:C.blue, icon:'◈' },
                { label:'Trabajos', value:misTrab.length, color:C.purple, icon:'◉' },
                { label:'Facturado total', value:money(totalFact), color:C.green, icon:'▲' },
                { label:'Saldo pendiente', value:money(cliente.saldo), color:cliente.saldo>0?C.orange:C.green, icon:'◎' },
              ].map(k => (
                <div key={k.label} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:C.textMuted, textTransform:'uppercase', letterSpacing:.8, marginBottom:6 }}>{k.icon} {k.label}</div>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:18, fontWeight:700, color:k.color }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Contacto + Obs */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.textSub, textTransform:'uppercase', letterSpacing:.8, marginBottom:12 }}>Datos de contacto</div>
                {[['📞','Teléfono',cliente.tel],['💬','WhatsApp',cliente.whatsapp],['📍','Dirección',cliente.direccion],['🏙','Localidad',cliente.localidad]].filter(([,,v])=>v).map(([ic,k,v]) => (
                  <div key={k} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom:`1px solid ${C.border}`, fontFamily:'DM Sans,sans-serif', fontSize:13, alignItems:'center' }}>
                    <span style={{ fontSize:14, width:22, textAlign:'center' }}>{ic}</span>
                    <span style={{ color:C.textSub, minWidth:80, fontSize:12 }}>{k}</span>
                    <span style={{ color:C.text, fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {cliente.obs && (
                  <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:.8, marginBottom:8 }}>Observaciones internas</div>
                    <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:'#78350f', lineHeight:1.5 }}>{cliente.obs}</div>
                  </div>
                )}

                {/* Último trabajo */}
                {misTrab.length > 0 && (() => {
                  const t = misTrab[0];
                  const sc = estadoColors[t.estadoFabrica] || estadoColors['Recibido'];
                  return (
                    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}>
                      <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.textSub, textTransform:'uppercase', letterSpacing:.8, marginBottom:8 }}>Último trabajo activo</div>
                      <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:C.text, marginBottom:5 }}>#{t.id} — {t.rubro}</div>
                      <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textSub, marginBottom:8 }}>{t.descripcion.slice(0,80)}{t.descripcion.length>80?'…':''}</div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontSize:11, color:sc.text, background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:6, padding:'2px 8px', fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>{t.estadoFabrica}</span>
                        <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:13, fontWeight:700, color:t.saldo>0?C.orange:C.green }}>{money(t.saldo)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Próximos eventos */}
            {misEv.length > 0 && (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.textSub, textTransform:'uppercase', letterSpacing:.8, marginBottom:10 }}>Próximos eventos</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {misEv.slice(0,3).map(ev => {
                    const tc2 = { Medición:C.blue, Instalación:C.green, Entrega:C.purple, Retiro:C.orange }[ev.tipo] || C.blue;
                    return (
                      <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:C.slate, borderRadius:8 }}>
                        <span style={{ fontSize:11, color:tc2, background:tc2+'18', borderRadius:4, padding:'2px 7px', fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>{ev.tipo}</span>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.text, flex:1 }}>📅 {fdate(ev.fecha)} · {ev.hora}</span>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textSub }}>👤 {ev.tecnico}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'presupuestos' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, fontWeight:700, color:C.text }}>{misPres.length} presupuesto{misPres.length!==1?'s':''}</div>
              <Btn variant="primary" icon="+" size="sm" onClick={onNuevoPres}>Nuevo presupuesto</Btn>
            </div>
            {misPres.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontFamily:'DM Sans,sans-serif', fontSize:13 }}>Sin presupuestos aún</div>
            ) : (
              <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
                {misPres.map((p,i) => (
                  <div key={p.id} style={{ display:'grid', gridTemplateColumns:'70px 80px 120px 1fr 90px 90px 80px', alignItems:'center', gap:8, padding:'12px 16px', borderBottom:i<misPres.length-1?`1px solid ${C.border}`:'none' }}>
                    <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, color:C.textMuted, fontWeight:600 }}>{p.id}</span>
                    <Badge label={p.rubro} type="rubro" />
                    <Badge label={p.estado} type="estado" />
                    <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textSub }}>{fdate(p.fecha)} · {p.vendedor}</span>
                    <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:13, fontWeight:700, color:C.text, textAlign:'right' }}>{money(p.total)}</span>
                    <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, color:C.green, textAlign:'right' }}>{money(p.sena)}</span>
                    <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:700, color:p.saldo>0?C.orange:C.green, textAlign:'right' }}>{money(p.saldo)}</span>
                  </div>
                ))}
                {/* Totales */}
                <div style={{ display:'grid', gridTemplateColumns:'70px 80px 120px 1fr 90px 90px 80px', alignItems:'center', gap:8, padding:'10px 16px', background:C.slate, borderTop:`2px solid ${C.border}` }}>
                  <span></span><span></span><span></span>
                  <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:700, color:C.textSub, textAlign:'right' }}>TOTALES</span>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:13, fontWeight:700, color:C.text, textAlign:'right' }}>{money(misPres.reduce((s,p)=>s+p.total,0))}</span>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, color:C.green, fontWeight:700, textAlign:'right' }}>{money(misPres.reduce((s,p)=>s+p.sena,0))}</span>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, fontWeight:700, color:C.orange, textAlign:'right' }}>{money(misPres.reduce((s,p)=>s+p.saldo,0))}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'trabajos' && (
          <div>
            <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, fontWeight:700, color:C.text, marginBottom:12 }}>{misTrab.length} trabajo{misTrab.length!==1?'s':''}</div>
            {misTrab.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontFamily:'DM Sans,sans-serif', fontSize:13 }}>Sin trabajos aún</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {misTrab.map(t => {
                  const sc = estadoColors[t.estadoFabrica] || estadoColors['Recibido'];
                  const rc = rubroColors[t.rubro] || rubroColors.Mixto;
                  const pc = prioridadColors[t.prioridad] || prioridadColors.Normal;
                  return (
                    <div key={t.id} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'flex-start' }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                          <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, color:C.textMuted, fontWeight:600 }}>#{t.id}</span>
                          <Badge label={t.rubro} type="rubro" />
                          <Badge label={t.estadoFabrica} type="estado" />
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}><PriorityDot level={t.prioridad} /><span style={{ fontSize:11, color:pc.dot, fontFamily:'DM Sans,sans-serif' }}>{t.prioridad}</span></div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:15, fontWeight:700, color:t.saldo>0?C.orange:C.green }}>{money(t.saldo)}</div>
                          <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.textSub }}>saldo</div>
                        </div>
                      </div>
                      <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, marginBottom:6 }}>{t.descripcion}</div>
                      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textSub }}>📐 {t.medidas} · ×{t.cantidad}</span>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textSub }}>📅 Entrega: {fdate(t.fechaPromesa)}</span>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textSub }}>👤 {t.vendedor}</span>
                      </div>
                      {t.obs && <div style={{ marginTop:8, fontFamily:'DM Sans,sans-serif', fontSize:12, color:'#78350f', background:'#fffbeb', borderRadius:6, padding:'5px 8px' }}>{t.obs}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'agenda' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, fontWeight:700, color:C.text }}>{misEv.length} evento{misEv.length!==1?'s':''}</div>
              <Btn variant="primary" icon="+" size="sm" onClick={() => onNuevoEvento(cliente)}>Agendar evento</Btn>
            </div>
            {misEv.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:C.textMuted, fontFamily:'DM Sans,sans-serif', fontSize:13 }}>Sin eventos agendados</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {misEv.map(ev => {
                  const tc2 = { Medición:C.blue, Instalación:C.green, Entrega:C.purple, Retiro:C.orange }[ev.tipo] || C.blue;
                  const ecColor = { Pendiente:C.yellow, Confirmado:C.green, Realizado:C.textMuted, Reprogramado:C.orange }[ev.estado] || C.textSub;
                  const sinTec = ev.tecnico === 'Sin asignar';
                  return (
                    <div key={ev.id} style={{ background:C.white, border:`1px solid ${sinTec?'#fecaca':C.border}`, borderRadius:12, padding:'13px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
                      <div style={{ width:40, height:40, borderRadius:9, background:tc2+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:9, fontWeight:700, color:tc2, textAlign:'center', lineHeight:1.2 }}>{ev.tipo.slice(0,3).toUpperCase()}</span>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap', alignItems:'center' }}>
                          <span style={{ fontSize:11, color:tc2, background:tc2+'18', borderRadius:4, padding:'1px 7px', fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>{ev.tipo}</span>
                          <span style={{ fontSize:11, color:ecColor, fontFamily:'DM Sans,sans-serif' }}>● {ev.estado}</span>
                        </div>
                        <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.textSub }}>📅 {fdate(ev.fecha)} · {ev.hora} · {sinTec ? <span style={{ color:C.red, fontWeight:600 }}>⚠ Sin técnico</span> : `👤 ${ev.tecnico}`}</div>
                        {ev.obs && <div style={{ marginTop:5, fontFamily:'DM Sans,sans-serif', fontSize:11, color:'#78350f', background:'#fffbeb', borderRadius:5, padding:'3px 7px' }}>{ev.obs}</div>}
                      </div>
                      <WABtn text={`Hola ${cliente.nombre}, le confirmamos su ${ev.tipo.toLowerCase()} para el ${fdate(ev.fecha)} a las ${ev.hora}. Facundo Morazzo Aberturas.`} phone={cliente.whatsapp} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Componente principal Clientes ── */
const Clientes = () => {
  const { clientes, presupuestos, trabajos, agenda } = GF_DATA;
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [filtroTipo, setFiltroTipo] = React.useState('Todos');
  const [showForm, setShowForm] = React.useState(false);
  const [editando, setEditando] = React.useState(null);
  const [showPres, setShowPres] = React.useState(false);
  const [showEvento, setShowEvento] = React.useState(false);
  const [clientesLocales, setClientesLocales] = React.useState(clientes);

  const tipos = ['Todos', ...TIPOS_CLIENTE];

  const filtrados = clientesLocales.filter(c => {
    if (filtroTipo !== 'Todos' && c.tipo !== filtroTipo) return false;
    if (search && !`${c.nombre} ${c.localidad}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleGuardar = (form) => {
    if (editando) {
      setClientesLocales(prev => prev.map(c => c.id === editando.id ? { ...c, ...form } : c));
      setSelected(prev => prev?.id === editando.id ? { ...prev, ...form } : prev);
    } else {
      const nuevo = { ...form, id: `C${String(Date.now()).slice(-3)}`, saldo: 0 };
      setClientesLocales(prev => [...prev, nuevo]);
      setSelected(nuevo);
    }
    setEditando(null);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.slate, overflow:'hidden' }}>
      <TopBar title="Clientes" subtitle={`${clientesLocales.length} clientes`} search={search} onSearch={setSearch}
        actions={<Btn variant="primary" icon="+" size="sm" onClick={() => { setEditando(null); setShowForm(true); }}>Nuevo cliente</Btn>}
      />
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Lista lateral */}
        <div style={{ width:290, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', background:C.white, overflow:'hidden', flexShrink:0 }}>
          <div style={{ padding:'8px 10px', borderBottom:`1px solid ${C.border}`, display:'flex', gap:4, flexWrap:'wrap' }}>
            {tipos.map(t => {
              const tc = TIPO_COLORS[t] || C.blue;
              return (
                <button key={t} onClick={() => setFiltroTipo(t)}
                  style={{ padding:'3px 10px', borderRadius:20, border:`1px solid ${filtroTipo===t ? tc : C.border}`, background:filtroTipo===t ? tc+'18' : 'transparent', color:filtroTipo===t ? tc : C.textSub, fontSize:11, fontFamily:'DM Sans,sans-serif', fontWeight:filtroTipo===t?600:400, cursor:'pointer', textTransform:'capitalize' }}>
                  {t}
                </button>
              );
            })}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {filtrados.length === 0 && (
              <div style={{ padding:'24px', textAlign:'center', color:C.textMuted, fontFamily:'DM Sans,sans-serif', fontSize:13 }}>Sin resultados</div>
            )}
            {filtrados.map(c => {
              const isActive = selected?.id === c.id;
              const tc = TIPO_COLORS[c.tipo] || C.blue;
              const nPres = presupuestos.filter(p => p.clienteId === c.id).length;
              const nTrab = trabajos.filter(t => t.clienteId === c.id).length;
              return (
                <div key={c.id} onClick={() => setSelected(c)}
                  style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, cursor:'pointer', background:isActive?C.bluePale:'transparent', borderLeft:`3px solid ${isActive?C.blue:'transparent'}`, transition:'all .1s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:13, color:isActive?C.blue:C.text }}>{c.nombre}</div>
                    {c.saldo > 0 && <span style={{ fontSize:10, color:C.orange, fontFamily:'Space Grotesk,sans-serif', fontWeight:700 }}>{money(c.saldo)}</span>}
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <span style={{ fontSize:10, color:tc, fontFamily:'DM Sans,sans-serif', fontWeight:500, background:tc+'18', borderRadius:4, padding:'1px 5px', textTransform:'capitalize' }}>{c.tipo}</span>
                    <span style={{ fontSize:11, color:C.textMuted }}>{c.localidad}</span>
                    <span style={{ fontSize:10, color:C.textMuted, marginLeft:'auto' }}>{nPres}p · {nTrab}t</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ficha */}
        {selected ? (
          <FichaCliente
            cliente={clientesLocales.find(c => c.id === selected.id) || selected}
            presupuestos={presupuestos}
            trabajos={trabajos}
            agenda={agenda}
            onEdit={() => { setEditando(clientesLocales.find(c=>c.id===selected.id)||selected); setShowForm(true); }}
            onNuevoPres={() => setShowPres(true)}
            onNuevoEvento={() => setShowEvento(true)}
          />
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, color:C.textMuted }}>
            <div style={{ width:52, height:52, borderRadius:14, background:C.bluePale, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>👤</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.textSub }}>Seleccioná un cliente para ver su ficha</div>
            <Btn variant="primary" icon="+" onClick={() => { setEditando(null); setShowForm(true); }}>Nuevo cliente</Btn>
          </div>
        )}
      </div>

      {/* Modal crear/editar cliente */}
      {showForm && (
        <ClienteForm
          cliente={editando}
          onClose={() => { setShowForm(false); setEditando(null); }}
          onSave={handleGuardar}
        />
      )}

      {/* Modal nuevo presupuesto pre-cargado con cliente */}
      {showPres && selected && (
        <Modal open={true} onClose={() => setShowPres(false)} title="Nuevo presupuesto" width={640}>
          <CreatePresupuesto
            onClose={() => setShowPres(false)}
            clientes={clientesLocales}
            clienteIdInicial={selected.id}
            onSave={() => {}}
          />
        </Modal>
      )}

      {/* Modal agendar evento */}
      {showEvento && selected && (
        <Modal open={true} onClose={() => setShowEvento(false)} title={`Agendar evento — ${selected.nombre}`} width={480}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Tipo" required>
                <Select options={['Medición','Instalación','Entrega','Retiro']} placeholder="Seleccionar..." value="" onChange={() => {}} />
              </Field>
              <Field label="Cliente">
                <div style={{ padding:'8px 10px', background:C.slate, borderRadius:7, fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, fontWeight:500 }}>{selected.nombre}</div>
              </Field>
              <Field label="Fecha" required><Input type="date" value="" onChange={() => {}} /></Field>
              <Field label="Hora" required><Input type="time" value="" onChange={() => {}} /></Field>
              <Field label="Técnico">
                <Select options={['Pablo M.','Gustavo F.','Sin asignar']} value="" onChange={() => {}} />
              </Field>
              <Field label="Estado">
                <Select options={['Pendiente','Confirmado']} value="Pendiente" onChange={() => {}} />
              </Field>
            </div>
            <Field label="Observaciones">
              <textarea rows={3} placeholder="Instrucciones de acceso, materiales necesarios..." style={{ width:'100%', borderRadius:7, border:`1px solid ${C.border}`, padding:'8px 10px', fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.text, outline:'none', resize:'vertical' }} />
            </Field>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, paddingTop:8, borderTop:`1px solid ${C.border}` }}>
              <Btn variant="ghost" onClick={() => setShowEvento(false)}>Cancelar</Btn>
              <Btn variant="primary" onClick={() => setShowEvento(false)}>✓ Guardar evento</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

Object.assign(window, { Presupuestos, Clientes, CreatePresupuesto });
