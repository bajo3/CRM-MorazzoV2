/* GlassFlow CRM — Shared UI Components */

const { useState, useEffect, useRef, useCallback } = React;

/* ── TOKENS ── */
const C = {
  navy: '#0f172a', navyMid: '#1e293b', navyLight: '#334155',
  blue: '#2563eb', blueLight: '#3b82f6', bluePale: '#eff6ff',
  slate: '#f1f5f9', border: '#e2e8f0', borderDark: '#cbd5e1',
  text: '#0f172a', textSub: '#64748b', textMuted: '#94a3b8',
  white: '#ffffff',
  green: '#16a34a', greenPale: '#f0fdf4', greenLight: '#22c55e',
  yellow: '#d97706', yellowPale: '#fffbeb',
  red: '#dc2626', redPale: '#fef2f2',
  orange: '#ea580c', orangePale: '#fff7ed',
  purple: '#7c3aed', purplePale: '#f5f3ff',
  cyan: '#0891b2', cyanPale: '#ecfeff',
  pink: '#db2777', pinkPale: '#fdf2f8',
  sky: '#0284c7', skyPale: '#f0f9ff',
};

const rubroColors = {
  PVC:    { bg: C.skyPale,    text: C.sky,    border: '#bae6fd' },
  Vidrio: { bg: C.purplePale, text: C.purple, border: '#ddd6fe' },
  DVH:    { bg: C.cyanPale,   text: C.cyan,   border: '#a5f3fc' },
  Espejo: { bg: C.pinkPale,   text: C.pink,   border: '#fbcfe8' },
  Mixto:  { bg: '#f8fafc',    text: C.textSub,border: C.border  },
};

const estadoColors = {
  'Recibido':          { bg: '#f8fafc', text: C.textSub,   border: C.borderDark },
  'Pendiente material':{ bg: C.redPale, text: C.red,       border: '#fecaca' },
  'En corte':          { bg: C.yellowPale, text: C.yellow, border: '#fde68a' },
  'En armado':         { bg: '#fff7ed', text: C.orange,    border: '#fed7aa' },
  'En lavado':         { bg: C.bluePale, text: C.blue,     border: '#bfdbfe' },
  'Armado DVH':        { bg: C.cyanPale, text: C.cyan,     border: '#a5f3fc' },
  'Sellado':           { bg: C.purplePale, text: C.purple, border: '#ddd6fe' },
  'Control':           { bg: '#fef9c3', text: '#854d0e',   border: '#fef08a' },
  'Listo':             { bg: C.greenPale, text: C.green,   border: '#bbf7d0' },
  'Listo ✓':           { bg: C.greenPale, text: C.green,   border: '#bbf7d0' },
  'Entregado':         { bg: '#f8fafc', text: C.textMuted, border: C.border  },
  '⚠ Atrasado':       { bg: C.redPale,  text: C.red,      border: '#fecaca' },
  'Listo para entregar':{ bg: C.greenPale, text: C.green,  border: '#bbf7d0' },
  'Aprobado':          { bg: C.greenPale, text: C.green,   border: '#bbf7d0' },
  'Enviado':           { bg: C.bluePale, text: C.blue,     border: '#bfdbfe' },
  'En armado pres':    { bg: '#fff7ed', text: C.orange,    border: '#fed7aa' },
  'Esperando respuesta':{ bg: C.yellowPale, text: C.yellow, border: '#fde68a' },
  'Consulta recibida': { bg: '#f8fafc', text: C.textSub,   border: C.borderDark },
  'Rechazado':         { bg: C.redPale,  text: C.red,      border: '#fecaca' },
  'Vencido':           { bg: '#f8fafc',  text: C.textMuted, border: C.border },
  'Seña cobrada':      { bg: C.greenPale, text: C.green,   border: '#bbf7d0' },
};

const prioridadColors = {
  'Alta':   { dot: C.red,    bg: C.redPale,    text: C.red    },
  'Media':  { dot: C.yellow, bg: C.yellowPale, text: C.yellow },
  'Normal': { dot: C.textMuted, bg: '#f8fafc',  text: C.textMuted },
};

/* ── NAV ITEMS ── */
const NAV = [
  { id: 'dashboard',   icon: '▣', label: 'Dashboard' },
  { id: 'clientes',    icon: '◎', label: 'Clientes' },
  { id: 'presupuestos',icon: '◈', label: 'Presupuestos' },
  { id: 'trabajos',    icon: '⬡', label: 'Trabajos' },
  { id: 'fabrica-pvc', icon: '⬢', label: 'Fábrica PVC' },
  { id: 'fabrica-vid', icon: '◇', label: 'Fábrica Vidrios' },
  { id: 'monitor',     icon: '▶', label: 'Monitor TV' },
  { id: 'agenda',      icon: '◷', label: 'Agenda' },
  { id: 'cobranzas',   icon: '◉', label: 'Cobranzas' },
];

/* ── SIDEBAR ── */
const Sidebar = ({ active, onNav, alertCount = 0 }) => (
  <div style={{ width: 220, background: C.navy, display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
    {/* Logo */}
    <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
      <FMLogo size={34} showText={true} textSize="sm" />
    </div>
    {/* Nav */}
    <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(item => {
        const isActive = active === item.id;
        const isMonitor = item.id === 'monitor';
        return (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            background: isActive ? 'rgba(59,130,246,.15)' : isMonitor ? 'rgba(255,255,255,.04)' : 'transparent',
            borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all .15s',
          }}>
            <span style={{ fontSize: 14, color: isActive ? '#3b82f6' : '#64748b', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : '#94a3b8' }}>{item.label}</span>
            {item.id === 'dashboard' && alertCount > 0 && (
              <span style={{ marginLeft: 'auto', background: C.red, color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{alertCount}</span>
            )}
            {isMonitor && <span style={{ marginLeft: 'auto', background: 'rgba(59,130,246,.2)', color: '#60a5fa', borderRadius: 4, padding: '0 5px', fontSize: 9, fontWeight: 600 }}>TV</span>}
          </button>
        );
      })}
    </nav>
    {/* User */}
    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 }}>LR</div>
      <div>
        <div style={{ color: '#e2e8f0', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 500 }}>Lucía Rodríguez</div>
        <div style={{ color: '#64748b', fontSize: 10 }}>Showroom · Ventas</div>
      </div>
    </div>
  </div>
);

/* ── TOPBAR ── */
const TopBar = ({ title, subtitle, actions, search, onSearch }) => (
  <div style={{ height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 18, color: C.text, letterSpacing: -0.3 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.textSub, fontFamily: 'DM Sans,sans-serif' }}>{subtitle}</div>}
    </div>
    {onSearch && (
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.textMuted }}>⌕</span>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Buscar..." style={{ paddingLeft: 28, paddingRight: 12, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, outline: 'none', width: 200, background: C.slate }} />
      </div>
    )}
    {actions}
  </div>
);

/* ── BADGE ── */
const Badge = ({ label, type = 'estado', rubro, size = 'sm' }) => {
  let style = {};
  if (type === 'estado') {
    const c = estadoColors[label] || { bg: '#f8fafc', text: C.textSub, border: C.border };
    style = { background: c.bg, color: c.text, border: `1px solid ${c.border}` };
  } else if (type === 'rubro') {
    const c = rubroColors[label] || rubroColors.Mixto;
    style = { background: c.bg, color: c.text, border: `1px solid ${c.border}` };
  } else if (type === 'prioridad') {
    const c = prioridadColors[label] || prioridadColors.Normal;
    style = { background: c.bg, color: c.text, border: `1px solid ${c.bg}` };
  }
  const px = size === 'sm' ? '2px 8px' : '3px 10px';
  const fs = size === 'sm' ? 11 : 12;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 20, padding: px, fontSize: fs, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, whiteSpace: 'nowrap', ...style }}>{label}</span>;
};

/* ── PRIORITY DOT ── */
const PriorityDot = ({ level }) => {
  const c = prioridadColors[level] || prioridadColors.Normal;
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }}></span>;
};

/* ── STAT CARD ── */
const StatCard = ({ label, value, sub, accent, icon, onClick }) => (
  <div onClick={onClick} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', cursor: onClick ? 'pointer' : 'default', flex: 1, minWidth: 0, borderTop: `3px solid ${accent || C.blue}`, transition: 'box-shadow .15s' }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, color: C.textSub, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      {icon && <span style={{ fontSize: 20, opacity: .4 }}>{icon}</span>}
    </div>
  </div>
);

/* ── BTN ── */
const Btn = ({ children, onClick, variant = 'default', size = 'md', icon, disabled }) => {
  const varStyles = {
    primary: { background: C.blue, color: '#fff', border: `1px solid ${C.blue}` },
    danger:  { background: C.red, color: '#fff', border: `1px solid ${C.red}` },
    success: { background: C.green, color: '#fff', border: `1px solid ${C.green}` },
    default: { background: C.white, color: C.text, border: `1px solid ${C.border}` },
    ghost:   { background: 'transparent', color: C.textSub, border: 'none' },
    whatsapp:{ background: '#25d366', color: '#fff', border: '1px solid #25d366' },
  };
  const sizeStyles = { sm: { padding: '5px 10px', fontSize: 11 }, md: { padding: '7px 14px', fontSize: 13 }, lg: { padding: '10px 20px', fontSize: 14 } };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...varStyles[variant], ...sizeStyles[size], borderRadius: 7, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, opacity: disabled ? .5 : 1, transition: 'all .15s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  );
};

/* ── MODAL ── */
const Modal = ({ open, onClose, title, children, width = 560 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 16, width: Math.min(width, window.innerWidth - 40), maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontWeight: 700, fontSize: 17, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.textMuted, padding: '0 4px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
};

/* ── FIELD ── */
const Field = ({ label, children, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 500, color: C.textSub }}>{label}{required && <span style={{ color: C.red }}> *</span>}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ height: 36, borderRadius: 7, border: `1px solid ${C.border}`, padding: '0 10px', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, outline: 'none', width: '100%', background: C.white }}
    onFocus={e => e.target.style.borderColor = C.blue}
    onBlur={e => e.target.style.borderColor = C.border}
  />
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={onChange}
    style={{ height: 36, borderRadius: 7, border: `1px solid ${C.border}`, padding: '0 8px', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, outline: 'none', width: '100%', background: C.white, cursor: 'pointer' }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

/* ── TABLE ── */
const Table = ({ headers, rows, onRowClick }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
    <div style={{ display: 'grid', gridTemplateColumns: headers.map(h => h.w || '1fr').join(' '), background: C.slate, borderBottom: `1px solid ${C.border}`, padding: '0 16px' }}>
      {headers.map((h, i) => (
        <div key={i} style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, fontWeight: 600, color: C.textSub, textTransform: 'uppercase', letterSpacing: .6, padding: '10px 8px 10px 0' }}>{h.label}</div>
      ))}
    </div>
    {rows.map((row, i) => (
      <div key={i} onClick={() => onRowClick && onRowClick(row)} style={{ display: 'grid', gridTemplateColumns: headers.map(h => h.w || '1fr').join(' '), padding: '0 16px', borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none', cursor: onRowClick ? 'pointer' : 'default', transition: 'background .1s' }}
        onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = C.slate; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
        {headers.map((h, j) => (
          <div key={j} style={{ padding: '10px 8px 10px 0', fontFamily: 'DM Sans,sans-serif', fontSize: 13, color: C.text, display: 'flex', alignItems: 'center' }}>{row[h.key]}</div>
        ))}
      </div>
    ))}
  </div>
);

/* ── KANBAN CARD (trabajos) ── */
const TrabajoCard = ({ t, clientes, onClick }) => {
  const cliente = clientes.find(c => c.id === t.clienteId);
  const p = prioridadColors[t.prioridad] || prioridadColors.Normal;
  const isAtrasado = t.estadoFabrica.includes('Atrasado') || t.estadoFabrica.includes('Pendiente material');
  return (
    <div onClick={() => onClick && onClick(t)} style={{ background: C.white, borderRadius: 10, border: `1px solid ${isAtrasado ? '#fecaca' : C.border}`, padding: '12px', cursor: 'pointer', transition: 'all .15s', marginBottom: 8, borderLeft: `3px solid ${p.dot}` }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 6 }}>
        <span style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, fontWeight: 600, color: C.textMuted }}>#{t.id}</span>
        <Badge label={t.rubro} type="rubro" />
      </div>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, color: C.text, marginBottom: 3, lineHeight: 1.3 }}>{cliente?.nombre || '—'}</div>
      <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 11, color: C.textSub, marginBottom: 8, lineHeight: 1.4 }}>{t.descripcion.length > 55 ? t.descripcion.slice(0, 55) + '…' : t.descripcion}</div>
      {t.medidas && t.medidas !== 'varios' && (
        <div style={{ fontFamily: 'Space Grotesk,sans-serif', fontSize: 10, color: C.textMuted, marginBottom: 6 }}>📐 {t.medidas} · ×{t.cantidad}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
        <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 10, color: C.textMuted }}>📅 {t.fechaPromesa.slice(5).replace('-', '/')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <PriorityDot level={t.prioridad} />
          <span style={{ fontSize: 10, color: p.dot, fontWeight: 500 }}>{t.prioridad}</span>
        </div>
      </div>
    </div>
  );
};

/* ── KANBAN COL ── */
const KanbanCol = ({ title, items, renderCard, color = C.border, count }) => (
  <div style={{ flex: 1, minWidth: 200, maxWidth: 260, display: 'flex', flexDirection: 'column', background: C.slate, borderRadius: 12, border: `1px solid ${C.border}` }}>
    <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></div>
        <span style={{ fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 12, color: C.text }}>{title}</span>
      </div>
      <span style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '1px 8px', fontFamily: 'Space Grotesk,sans-serif', fontSize: 11, fontWeight: 700, color: C.textSub }}>{count !== undefined ? count : items.length}</span>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 4px' }}>
      {items.map((item, i) => renderCard(item, i))}
      {items.length === 0 && <div style={{ textAlign: 'center', padding: '20px 10px', color: C.textMuted, fontSize: 12, fontFamily: 'DM Sans,sans-serif' }}>Sin órdenes</div>}
    </div>
  </div>
);

/* ── WHATSAPP BUTTON ── */
const WABtn = ({ text, phone }) => (
  <a href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#25d366', color: '#fff', border: '1px solid #25d366', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}>
    <span>💬</span> WhatsApp
  </a>
);

/* ── MONEY FORMAT ── */
const money = n => '$' + n.toLocaleString('es-AR');

/* ── DATE FORMAT ── */
const fdate = d => {
  const [y, m, day] = d.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(day)} ${months[parseInt(m)-1]}`;
};

Object.assign(window, {
  C, rubroColors, estadoColors, prioridadColors, NAV,
  Sidebar, TopBar, Badge, PriorityDot, StatCard, Btn, Modal, Field, Input, Select,
  Table, TrabajoCard, KanbanCol, WABtn, money, fdate,
});
