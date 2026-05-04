-- GlassFlow CRM - Schema Supabase
-- Para produccion: activar Auth/RLS real y policies por usuario/rol.
-- Para MVP controlado: puede usarse anon key con permisos abiertos mientras la URL/key
-- no se publiquen fuera del entorno de la empresa.

-- ============================================================
-- CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  telefono text DEFAULT '',
  whatsapp text DEFAULT '',
  email text DEFAULT '',
  direccion text DEFAULT '',
  localidad text DEFAULT '',
  cuit text DEFAULT '',
  observaciones text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PRESUPUESTOS (items embebidos en JSONB para MVP)
-- ============================================================
CREATE TABLE IF NOT EXISTS presupuestos (
  id text PRIMARY KEY,
  client_id text REFERENCES clientes(id) ON DELETE SET NULL,
  fecha date,
  estado text DEFAULT 'borrador',
  descuento numeric DEFAULT 0,
  sena numeric DEFAULT 0,
  observaciones text DEFAULT '',
  items jsonb DEFAULT '[]',
  trabajo_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS sena numeric DEFAULT 0;
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- TRABAJOS (historial embebido en JSONB para MVP)
-- ============================================================
CREATE TABLE IF NOT EXISTS trabajos (
  id text PRIMARY KEY,
  client_id text REFERENCES clientes(id) ON DELETE SET NULL,
  quote_id text REFERENCES presupuestos(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  rubro text,
  fabrica_asignada text,
  descripcion text DEFAULT '',
  medidas text DEFAULT '',
  cantidad numeric DEFAULT 1,
  color_material text DEFAULT '',
  estado_comercial text DEFAULT 'aprobado',
  estado_produccion text DEFAULT 'recibido',
  prioridad text DEFAULT 'normal',
  fecha_ingreso date,
  fecha_prometida date,
  total numeric DEFAULT 0,
  sena numeric DEFAULT 0,
  saldo numeric DEFAULT 0,
  observaciones_internas text DEFAULT '',
  historial jsonb DEFAULT '[]',
  archivos_adjuntos jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

UPDATE trabajos
SET rubro = CASE
  WHEN lower(coalesce(rubro, '')) IN ('vidrio', 'cristales', 'cristal', 'dvh', 'espejo') THEN 'vidrio'
  ELSE 'pvc'
END;

UPDATE trabajos
SET fabrica_asignada = CASE
  WHEN rubro = 'vidrio' THEN 'vidrios'
  ELSE 'pvc'
END;

UPDATE trabajos
SET estado_produccion = 'preparacion'
WHERE estado_produccion IN ('corte', 'armado', 'control', 'lavado', 'armado_dvh', 'sellado');

UPDATE trabajos
SET estado_produccion = 'terminado'
WHERE estado_produccion IN ('listo', 'entregado', 'colocado');

-- ============================================================
-- AGENDA
-- ============================================================
CREATE TABLE IF NOT EXISTS agenda_eventos (
  id text PRIMARY KEY,
  tipo text,
  estado text DEFAULT 'pendiente',
  client_id text REFERENCES clientes(id) ON DELETE SET NULL,
  job_id text REFERENCES trabajos(id) ON DELETE SET NULL,
  fecha date,
  hora text DEFAULT '',
  titulo text NOT NULL,
  descripcion text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- CAJA / MOVIMIENTOS (reemplaza tabla pagos)
-- tipo: ingreso | egreso
-- categoria: cobro_cliente | sena | saldo_cobrado | gasto_operativo | gasto_materiales | pago_proveedor | otro
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  id text PRIMARY KEY,
  tipo text DEFAULT 'ingreso',
  concepto text DEFAULT '',
  categoria text DEFAULT 'cobro_cliente',
  client_id text REFERENCES clientes(id) ON DELETE SET NULL,
  quote_id text REFERENCES presupuestos(id) ON DELETE SET NULL,
  job_id text REFERENCES trabajos(id) ON DELETE SET NULL,
  fecha date NOT NULL,
  monto numeric NOT NULL DEFAULT 0,
  metodo text DEFAULT 'transferencia',
  observaciones text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  rol text DEFAULT 'vendedor',
  activo boolean DEFAULT true
);

-- ============================================================
-- PERMISOS MVP / LOCAL
-- Advertencia: esto deja lectura/escritura abierta para anon/authenticated.
-- Es aceptable solo para un MVP interno/controlado. No usar asi en produccion publica.
-- ============================================================
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos DISABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos DISABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_eventos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clientes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON presupuestos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trabajos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON agenda_eventos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pagos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON usuarios TO anon, authenticated;

-- Alternativa si se quiere mantener RLS activado durante el MVP:
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "mvp_anon_all_clientes" ON clientes FOR ALL TO anon USING (true) WITH CHECK (true);
-- Repetir una policy equivalente para presupuestos, trabajos, agenda_eventos, pagos y usuarios.

-- ============================================================
-- INDICES utiles
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_presupuestos_client ON presupuestos(client_id);
CREATE INDEX IF NOT EXISTS idx_trabajos_client ON trabajos(client_id);
CREATE INDEX IF NOT EXISTS idx_trabajos_fabrica ON trabajos(fabrica_asignada);
CREATE INDEX IF NOT EXISTS idx_trabajos_estado ON trabajos(estado_produccion);
CREATE INDEX IF NOT EXISTS idx_pagos_client ON pagos(client_id);
CREATE INDEX IF NOT EXISTS idx_agenda_fecha ON agenda_eventos(fecha);
