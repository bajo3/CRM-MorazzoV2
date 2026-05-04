/* GlassFlow CRM — Generador PDF Presupuesto */

const PresupuestoPDF = ({ presupuesto, onClose }) => {
  if (!presupuesto) return null;

  const { clientes } = GF_DATA;
  const cliente = clientes.find(c => c.id === presupuesto.clienteId);
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const vencimiento = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  })();

  const items = presupuesto.items || [];
  const total = presupuesto.total;
  const sena = presupuesto.sena;
  const saldo = presupuesto.saldo;
  const senaPct = total > 0 ? Math.round(sena / total * 100) : 50;

  const handlePrint = () => {
    const printContent = document.getElementById('pdf-presupuesto-content');
    const win = window.open('', '_blank', 'width=850,height=1100');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Presupuesto ${presupuesto.id} — Facundo Morazzo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; background: #fff; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; size: A4; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 600);
  };

  // Watermark badge color by estado
  const estadoColor = {
    'Aprobado': '#16a34a', 'Enviado': '#2563eb', 'Esperando respuesta': '#d97706',
    'En armado': '#ea580c', 'Rechazado': '#dc2626', 'Vencido': '#94a3b8',
    'Consulta recibida': '#7c3aed',
  }[presupuesto.estado] || '#64748b';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.75)', zIndex: 4000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', borderRadius: '12px 12px 0 0', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#94a3b8', marginLeft: 8 }}>Presupuesto {presupuesto.id} — Vista previa</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🖨 Imprimir / Guardar PDF
            </button>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', fontFamily: 'DM Sans,sans-serif', fontSize: 13, cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>

        {/* Document */}
        <div id="pdf-presupuesto-content" style={{ background: '#fff', borderRadius: '0 0 12px 12px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.4)' }}>
          <div style={{ padding: '44px 52px', fontFamily: 'DM Sans, sans-serif' }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, paddingBottom: 28, borderBottom: '2px solid #e2e8f0' }}>
              <div>
                {/* Logo area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#1a56db,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="3" y="3" width="10" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <rect x="15" y="3" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)"/>
                      <rect x="3" y="15" width="10" height="10" rx="2" fill="rgba(255,255,255,0.5)"/>
                      <rect x="15" y="15" width="10" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>Facundo Morazzo</div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#64748b', fontWeight: 500 }}>Aberturas y Cristales</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#94a3b8', lineHeight: 1.8 }}>
                  Córdoba, Argentina<br/>
                  Tel: (351) 000-0000 · WhatsApp: 351-0000000<br/>
                  info@facundomorazzo.com.ar
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 28, fontWeight: 700, color: '#1a56db', letterSpacing: -1, lineHeight: 1 }}>PRESUPUESTO</div>
                <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 22, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>#{presupuesto.id}</div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#94a3b8' }}>Fecha:</span>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{hoy}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#94a3b8' }}>Válido hasta:</span>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, color: '#ea580c' }}>{vencimiento}</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 700, color: estadoColor, background: estadoColor + '18', borderRadius: 20, padding: '3px 12px', border: `1px solid ${estadoColor}40` }}>{presupuesto.estado}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CLIENTE ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>Presupuesto para</div>
                <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{cliente?.nombre}</div>
                {cliente?.direccion && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#64748b', marginBottom: 3 }}>📍 {cliente.direccion}, {cliente.localidad}</div>}
                {cliente?.tel && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#64748b', marginBottom: 3 }}>📞 {cliente.tel}</div>}
                {cliente?.whatsapp && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#64748b' }}>💬 {cliente.whatsapp}</div>}
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 }}>Detalles</div>
                {[
                  ['Rubro', presupuesto.rubro],
                  ['Vendedor', presupuesto.vendedor],
                  ['Fecha presupuesto', (() => { const [y,m,d] = presupuesto.fecha.split('-'); return `${d}/${m}/${y}`; })()],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0', fontFamily: 'DM Sans,sans-serif', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ITEMS TABLE ── */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Detalle de artículos</div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 1fr 1fr', background: '#1a56db', padding: '10px 16px', gap: 8 }}>
                  {['Descripción / Tipo', 'Medidas', 'Cant.', 'Precio unit.', 'Subtotal'].map((h, i) => (
                    <div key={i} style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase', letterSpacing: .8, textAlign: i > 2 ? 'right' : 'left' }}>{h}</div>
                  ))}
                </div>

                {/* Items */}
                {items.length > 0 ? items.map((item, i) => {
                  const precioUnit = item.precioUnit || Math.round(total / (item.cant || 1));
                  const sub = precioUnit * (item.cant || 1);
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 1fr 1fr', padding: '13px 16px', gap: 8, borderBottom: i < items.length - 1 ? '1px solid #e2e8f0' : 'none', background: i % 2 === 0 ? '#fff' : '#f8fafc', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.tipo}</div>
                        {item.color && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#64748b', marginTop: 2 }}>Color: {item.color} {item.dvh ? `· DVH ${item.dvh}` : ''} {item.mosquitero ? '· Con mosquitero' : ''}</div>}
                      </div>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 12, color: '#64748b' }}>{item.medidas || '—'}</div>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.cant || 1}</div>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{money(precioUnit)}</div>
                      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{money(sub)}</div>
                    </div>
                  );
                }) : (
                  /* Fallback when no items detail — show description row */
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 1fr 1fr', padding: '16px 16px', gap: 8, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{presupuesto.rubro} — según detalle acordado</div>
                      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#64748b', marginTop: 2 }}>Ver especificaciones adjuntas</div>
                    </div>
                    <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: '#64748b' }}>—</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>1</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{money(total)}</div>
                    <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{money(total)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── TOTALES ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
              <div style={{ width: 300 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#64748b' }}>Subtotal</span>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{money(total)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '2px solid #e2e8f0', background: '#fff' }}>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#64748b' }}>IVA / Impuestos</span>
                    <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: '#94a3b8' }}>Incluido</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#1a56db' }}>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>TOTAL</span>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>{money(total)}</span>
                  </div>
                </div>

                {/* Condiciones de pago */}
                <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Condiciones de pago</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #bbf7d0', fontFamily: 'DM Sans,sans-serif', fontSize: 12 }}>
                    <span style={{ color: '#166534' }}>Seña ({senaPct}%) al confirmar</span>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, color: '#16a34a' }}>{money(sena)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 12 }}>
                    <span style={{ color: '#166534' }}>Saldo al retirar/instalar</span>
                    <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, color: '#16a34a' }}>{money(saldo)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── NOTAS ── */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 32 }}>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Condiciones generales</div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {[
                  `Este presupuesto tiene validez de 15 días a partir de la fecha de emisión (hasta el ${vencimiento}).`,
                  'Los precios están expresados en pesos argentinos e incluyen IVA.',
                  'El plazo de fabricación se confirma al momento de recibir la seña.',
                  'La instalación puede tener costo adicional según ubicación y complejidad.',
                  'Cualquier modificación posterior a la confirmación puede alterar el precio final.',
                ].map((note, i) => (
                  <li key={i} style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#78350f', marginBottom: 4, lineHeight: 1.5 }}>{note}</li>
                ))}
              </ul>
            </div>

            {/* ── FIRMA ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 32 }}>
              {['Firma y aclaración del cliente', 'Aclaración del vendedor'].map((label, i) => (
                <div key={i}>
                  <div style={{ height: 52, borderBottom: '1.5px solid #cbd5e1', marginBottom: 8 }}></div>
                  <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{label}</div>
                  {i === 1 && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 600, color: '#64748b', textAlign: 'center', marginTop: 4 }}>{presupuesto.vendedor}</div>}
                </div>
              ))}
            </div>

            {/* ── FOOTER ── */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: '#94a3b8' }}>Facundo Morazzo Aberturas y Cristales · Sistema GlassFlow CRM</div>
              <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Presupuesto #{presupuesto.id}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { PresupuestoPDF });
