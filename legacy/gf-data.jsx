/* GlassFlow CRM — Mock Data */

const GF_DATA = (() => {

const clientes = [
  { id: 'C001', nombre: 'Juan Pérez', tipo: 'particular', tel: '351-4521890', whatsapp: '3514521890', direccion: 'Av. Colón 1240', localidad: 'Córdoba', saldo: 85000, obs: 'Cliente frecuente. Siempre pide entrega rápida.' },
  { id: 'C002', nombre: 'Constructora Las Sierras', tipo: 'constructor', tel: '351-7834200', whatsapp: '3517834200', direccion: 'Ruta 38 km 12', localidad: 'La Calera', saldo: 420000, obs: 'Obra gran escala. Requiere factura A.' },
  { id: 'C003', nombre: 'María Gómez', tipo: 'particular', tel: '351-3341122', whatsapp: '3513341122', direccion: 'San Martín 560', localidad: 'Córdoba', saldo: 45000, obs: '' },
  { id: 'C004', nombre: 'Estudio Arquitectura Norte', tipo: 'arquitecto', tel: '351-6671540', whatsapp: '3516671540', direccion: 'Fructuoso Rivera 890', localidad: 'Córdoba', saldo: 178000, obs: 'Manejar con discreción. Pagar siempre en tiempo.' },
  { id: 'C005', nombre: 'Hotel Centro', tipo: 'empresa', tel: '351-4230010', whatsapp: '3514230010', direccion: 'San Jerónimo 450', localidad: 'Córdoba', saldo: 290000, obs: 'Contacto: Ing. Rodrigo Salas.' },
  { id: 'C006', nombre: 'Apart. Roma', tipo: 'empresa', tel: '351-5120044', whatsapp: '3515120044', direccion: 'Chacabuco 1120', localidad: 'Córdoba', saldo: 0, obs: 'Proyecto terminado. Buen cliente.' },
  { id: 'C007', nombre: 'Farmacia del Norte', tipo: 'empresa', tel: '351-4981200', whatsapp: '3514981200', direccion: 'Av. Rafael Núñez 3400', localidad: 'Córdoba', saldo: 62000, obs: 'Urgente. Necesita las puertas para apertura.' },
  { id: 'C008', nombre: 'Casa Moderna SRL', tipo: 'constructor', tel: '3525-401200', whatsapp: '3525401200', direccion: 'Urquiza 220', localidad: 'Villa María', saldo: 95000, obs: '' },
];

const presupuestos = [
  { id: 'P0055', clienteId: 'C001', fecha: '2026-04-20', rubro: 'PVC', estado: 'Aprobado', total: 285000, sena: 100000, saldo: 185000, vendedor: 'Lucía R.', items: [{ tipo: 'Ventana corrediza', medidas: '1500×1100', cant: 1, color: 'Blanco', dvh: '4+9+4', mosquitero: true }] },
  { id: 'P0056', clienteId: 'C002', fecha: '2026-04-18', rubro: 'PVC', estado: 'Aprobado', total: 980000, sena: 400000, saldo: 580000, vendedor: 'Martín G.', items: [{ tipo: '12 aberturas varias', medidas: 'varios', cant: 12, color: 'Blanco', dvh: 'simple', mosquitero: true }] },
  { id: 'P0057', clienteId: 'C003', fecha: '2026-04-22', rubro: 'Espejo', estado: 'Enviado', total: 85000, sena: 40000, saldo: 45000, vendedor: 'Lucía R.', items: [{ tipo: 'Espejo biselado', medidas: '1800×900', cant: 1 }] },
  { id: 'P0058', clienteId: 'C004', fecha: '2026-04-21', rubro: 'DVH', estado: 'Esperando respuesta', total: 340000, sena: 0, saldo: 340000, vendedor: 'Martín G.', items: [{ tipo: 'DVH 4+9+4', medidas: '1200×1000', cant: 6 }] },
  { id: 'P0059', clienteId: 'C005', fecha: '2026-04-15', rubro: 'Vidrio', estado: 'Aprobado', total: 520000, sena: 230000, saldo: 290000, vendedor: 'Martín G.', items: [{ tipo: 'Mampara templada 10mm', medidas: '2000×900', cant: 4 }] },
  { id: 'P0060', clienteId: 'C007', fecha: '2026-04-23', rubro: 'PVC', estado: 'En armado', total: 142000, sena: 80000, saldo: 62000, vendedor: 'Lucía R.', items: [{ tipo: 'Puerta batiente', medidas: '900×2100', cant: 1, color: 'Blanco' }] },
  { id: 'P0061', clienteId: 'C008', fecha: '2026-04-24', rubro: 'DVH', estado: 'Consulta recibida', total: 195000, sena: 0, saldo: 195000, vendedor: 'Lucía R.', items: [{ tipo: 'DVH 6+12+6', medidas: '1400×1200', cant: 3 }] },
  { id: 'P0050', clienteId: 'C006', fecha: '2026-04-01', rubro: 'PVC', estado: 'Rechazado', total: 310000, sena: 0, saldo: 0, vendedor: 'Martín G.', items: [] },
  { id: 'P0049', clienteId: 'C004', fecha: '2026-03-28', rubro: 'Vidrio', estado: 'Vencido', total: 88000, sena: 0, saldo: 0, vendedor: 'Lucía R.', items: [] },
];

const trabajos = [
  {
    id: 'T0041', presupuestoId: 'P0055', clienteId: 'C001',
    rubro: 'PVC', descripcion: 'Ventana PVC corrediza blanca 1500×1100 con DVH 4+9+4 y mosquitero',
    medidas: '1500×1100 mm', cantidad: 1, color: 'Blanco RAL 9016',
    fechaPromesa: '2026-04-30', prioridad: 'Alta',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'En corte',
    fabrica: 'PVC', vendedor: 'Lucía R.',
    total: 285000, sena: 100000, saldo: 185000,
    obs: 'Cliente pide entrega antes del 1/5. Llamar para confirmar instalación. Premarco a cargo del cliente.',
    archivos: ['plano_ventana.pdf', 'foto_vano.jpg'],
  },
  {
    id: 'T0042', presupuestoId: 'P0056', clienteId: 'C002',
    rubro: 'PVC', descripcion: '12 aberturas PVC para obra Barrio Los Pinos — 8 ventanas + 4 puertas',
    medidas: 'varios', cantidad: 12, color: 'Blanco RAL 9016',
    fechaPromesa: '2026-05-05', prioridad: 'Media',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'Recibido',
    fabrica: 'PVC', vendedor: 'Martín G.',
    total: 980000, sena: 400000, saldo: 580000,
    obs: 'Obra en La Calera. Coordinación con maestro mayor. Entrega en obra.',
    archivos: ['plano_obra.pdf', 'lista_aberturas.xlsx'],
  },
  {
    id: 'T0043', presupuestoId: 'P0059', clienteId: 'C005',
    rubro: 'Vidrio', descripcion: 'Mamparas templadas 10mm para baños Hotel Centro — 4 paños',
    medidas: '2000×900 mm', cantidad: 4, color: '—',
    fechaPromesa: '2026-05-02', prioridad: 'Alta',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'En lavado',
    fabrica: 'Vidrios', vendedor: 'Martín G.',
    total: 520000, sena: 230000, saldo: 290000,
    obs: 'Coordinar horario de instalación con conserje del hotel. Ingreso por cochera.',
    archivos: ['plano_banos.pdf'],
  },
  {
    id: 'T0044', presupuestoId: 'P0057', clienteId: 'C003',
    rubro: 'Espejo', descripcion: 'Espejo biselado 1800×900 con perforaciones para luz',
    medidas: '1800×900 mm', cantidad: 1, color: '—',
    fechaPromesa: '2026-04-27', prioridad: 'Alta',
    estadoComercial: 'Seña cobrada', estadoFabrica: '⚠ Atrasado',
    fabrica: 'Vidrios', vendedor: 'Lucía R.',
    total: 85000, sena: 40000, saldo: 45000,
    obs: 'ATRASADO. Cliente ya llamó. Priorizar.',
    archivos: [],
  },
  {
    id: 'T0045', presupuestoId: 'P0058', clienteId: 'C004',
    rubro: 'DVH', descripcion: 'DVH 4+9+4 argón para vivienda unifamiliar — 6 unidades',
    medidas: '1200×1000 mm', cantidad: 6, color: '—',
    fechaPromesa: '2026-05-08', prioridad: 'Normal',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'Control',
    fabrica: 'Vidrios', vendedor: 'Martín G.',
    total: 340000, sena: 162000, saldo: 178000,
    obs: 'Vidrio doble bajo emisivo. Confirmar fecha de retiro con arquitecto.',
    archivos: ['especificaciones_dvh.pdf'],
  },
  {
    id: 'T0038', presupuestoId: 'P0060', clienteId: 'C007',
    rubro: 'PVC', descripcion: 'Puerta PVC batiente 900×2100 vidrio fijo lateral',
    medidas: '900×2100 mm', cantidad: 1, color: 'Blanco',
    fechaPromesa: '2026-04-28', prioridad: 'Alta',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'Pendiente material',
    fabrica: 'PVC', vendedor: 'Lucía R.',
    total: 142000, sena: 80000, saldo: 62000,
    obs: '⚠ Falta perfil 70mm. Proveedor entrega jueves. URGENTE.',
    archivos: [],
  },
  {
    id: 'T0035', presupuestoId: 'P0061', clienteId: 'C008',
    rubro: 'DVH', descripcion: 'DVH 6+12+6 bajo emisivo para casa moderna — 3 paños grandes',
    medidas: '1400×1200 mm', cantidad: 3, color: '—',
    fechaPromesa: '2026-04-30', prioridad: 'Alta',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'Armado DVH',
    fabrica: 'Vidrios', vendedor: 'Lucía R.',
    total: 195000, sena: 100000, saldo: 95000,
    obs: 'Vidrio bajo emisivo importado. Cuidado con el manipuleo.',
    archivos: ['plano_fachada.pdf'],
  },
  {
    id: 'T0034', presupuestoId: null, clienteId: 'C006',
    rubro: 'PVC', descripcion: 'Ventana oscilobatiente 800×1000 doble vidrio',
    medidas: '800×1000 mm', cantidad: 1, color: 'Blanco',
    fechaPromesa: '2026-04-27', prioridad: 'Normal',
    estadoComercial: 'Listo para entregar', estadoFabrica: 'Listo',
    fabrica: 'PVC', vendedor: 'Martín G.',
    total: 68000, sena: 68000, saldo: 0,
    obs: 'Listo. Coordinar retiro.',
    archivos: [],
  },
  {
    id: 'T0039', presupuestoId: null, clienteId: 'C004',
    rubro: 'PVC', descripcion: 'Paño fijo + batiente 1200×1400 vidrio templado',
    medidas: '1200×1400 mm', cantidad: 2, color: 'Gris pizarra',
    fechaPromesa: '2026-05-01', prioridad: 'Normal',
    estadoComercial: 'Seña cobrada', estadoFabrica: 'En armado',
    fabrica: 'PVC', vendedor: 'Martín G.',
    total: 185000, sena: 92000, saldo: 93000,
    obs: '',
    archivos: ['plano_paño.pdf'],
  },
  {
    id: 'T0033', presupuestoId: null, clienteId: 'C003',
    rubro: 'Espejo', descripcion: 'Espejo biselado 900×600 para baño',
    medidas: '900×600 mm', cantidad: 1, color: '—',
    fechaPromesa: '2026-04-27', prioridad: 'Normal',
    estadoComercial: 'Listo para entregar', estadoFabrica: 'Control',
    fabrica: 'Vidrios', vendedor: 'Lucía R.',
    total: 32000, sena: 32000, saldo: 0,
    obs: 'Listo para retirar.',
    archivos: [],
  },
];

const agenda = [
  { id: 'A001', tipo: 'Medición', clienteId: 'C001', fecha: '2026-04-29', hora: '10:00', tecnico: 'Pablo M.', estado: 'Confirmado', obs: 'Llevar laser y cinta' },
  { id: 'A002', tipo: 'Instalación', clienteId: 'C005', trabajoId: 'T0043', fecha: '2026-04-30', hora: '09:00', tecnico: 'Gustavo F.', estado: 'Pendiente', obs: 'Ingreso por cochera del hotel' },
  { id: 'A003', tipo: 'Entrega', clienteId: 'C006', trabajoId: 'T0034', fecha: '2026-04-29', hora: '14:00', tecnico: '—', estado: 'Pendiente', obs: 'Retira el cliente' },
  { id: 'A004', tipo: 'Instalación', clienteId: 'C003', trabajoId: 'T0044', fecha: '2026-05-02', hora: '11:00', tecnico: 'Sin asignar', estado: 'Pendiente', obs: '⚠ Sin técnico asignado' },
  { id: 'A005', tipo: 'Medición', clienteId: 'C008', fecha: '2026-04-30', hora: '16:00', tecnico: 'Pablo M.', estado: 'Confirmado', obs: 'Villa María. Salida 13hs.' },
  { id: 'A006', tipo: 'Instalación', clienteId: 'C002', trabajoId: 'T0042', fecha: '2026-05-06', hora: '08:00', tecnico: 'Gustavo F.', estado: 'Pendiente', obs: 'Obra en La Calera. Confirmar acceso.' },
];

const alertas = [
  { id: 'AL001', tipo: 'atraso', texto: 'Trabajo T0044 (María Gómez) lleva 2 días de retraso', nivel: 'alta', accion: 'Ver trabajo' },
  { id: 'AL002', tipo: 'material', texto: 'T0038 (Farmacia del Norte) — falta perfil 70mm PVC', nivel: 'alta', accion: 'Ver trabajo' },
  { id: 'AL003', tipo: 'saldo', texto: 'Presupuesto P0058 sin respuesta hace 7 días (Est. Arq. Norte)', nivel: 'media', accion: 'Enviar WhatsApp' },
  { id: 'AL004', tipo: 'tecnico', texto: 'Instalación T0044 sin técnico asignado (02 may)', nivel: 'media', accion: 'Asignar técnico' },
  { id: 'AL005', tipo: 'listo', texto: 'T0034 (Apart. Roma) listo — cliente no fue notificado', nivel: 'baja', accion: 'Avisar por WhatsApp' },
  { id: 'AL006', tipo: 'fabrica', texto: 'T0041 aprobado hace 3 días — confirmar estado en fábrica', nivel: 'baja', accion: 'Ver trabajo' },
];

const kpis = {
  presupuestosPendientes: 4,
  trabajosAprobados: 8,
  enFabrica: 7,
  listos: 2,
  instalacionesPendientes: 3,
  saldoTotal: 1175000,
  cobradoMes: 862000,
  alertasActivas: 6,
};

return { clientes, presupuestos, trabajos, agenda, alertas, kpis };
})();

Object.assign(window, { GF_DATA });
