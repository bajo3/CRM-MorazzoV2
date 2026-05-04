-- MVP fix 2026-05-04
-- Presupuestos: agrega la columna sena esperada por la app.
-- Trabajos: normaliza rubros activos a Aberturas/Cristales y conserva archivados como cerrado/cancelado.

ALTER TABLE presupuestos
  ADD COLUMN IF NOT EXISTS sena numeric DEFAULT 0;

UPDATE presupuestos
SET sena = 0
WHERE sena IS NULL;

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

ALTER TABLE trabajos
  DROP CONSTRAINT IF EXISTS trabajos_rubro_mvp_check,
  ADD CONSTRAINT trabajos_rubro_mvp_check CHECK (rubro IN ('pvc', 'vidrio'));

ALTER TABLE trabajos
  DROP CONSTRAINT IF EXISTS trabajos_fabrica_mvp_check,
  ADD CONSTRAINT trabajos_fabrica_mvp_check CHECK (fabrica_asignada IN ('pvc', 'vidrios'));

NOTIFY pgrst, 'reload schema';
