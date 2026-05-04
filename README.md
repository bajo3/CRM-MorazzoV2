# GlassFlow CRM MVP

MVP funcional para vidriería/aberturas construido con React + Vite + TypeScript + Tailwind. El prototipo original quedó preservado en [`legacy/`](./legacy) como referencia visual y handoff.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Estructura

```text
src/
  main.tsx
  App.tsx
  styles/
    index.css
  components/
    ui/
    layout/
    dashboard/
    clientes/
    presupuestos/
    trabajos/
    fabrica/
    monitor/
    agenda/
    caja/
    pdf/
  data/
    mockData.ts
  lib/
    storage.ts
    ids.ts
    money.ts
    dates.ts
    company.ts
  services/
    crmRepository.ts
    localStorageRepository.ts
    supabaseRepository.ts
  types/
    index.ts
legacy/
  GlassFlow CRM.html
  gf-*.jsx
```

## Qué resuelve hoy

- Clientes CRUD con ficha y asociados.
- Presupuestos CRUD con items, estados, cálculos, impresión y conversión a trabajo.
- Trabajos CRUD con tabla, kanban, historial básico e impresión.
- Pantallas separadas de fábrica PVC y Vidrios/DVH.
- Monitor TV de producción.
- Agenda CRUD.
- Caja simple con ingresos, salidas y referencias a cliente/presupuesto/trabajo.
- Persistencia real vía `CrmRepository` usando Supabase cuando hay variables de entorno; `localStorage` queda como fallback de desarrollo.

## Persistencia actual

- Con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, Supabase es la fuente principal de datos.
- Sin esas variables, la app guarda en `localStorage` bajo la clave `glassflow-crm-snapshot-v2`.
- Los datos seed iniciales sólo se cargan en modo fallback/local si no existe snapshot previo.
- Toda lectura/escritura pasa por `src/services/crmRepository.ts`.

## Supabase

1. Crear tablas en Supabase para `clientes`, `presupuestos`, `trabajos`, `agenda`, `pagos` y `usuarios`.
2. Definir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Ejecutar el esquema de [`docs/supabase-schema.sql`](./docs/supabase-schema.sql).
4. Iniciar la app. Toda lectura/escritura pasa por [`src/services/crmRepository.ts`](./src/services/crmRepository.ts).

Ejemplo de variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Notas

- La impresión de presupuesto y orden de trabajo usa `window.print()`.
- El monitor TV toma datos del estado global de la app y del snapshot persistido.
- No hay backend adicional en este MVP.

## Estado del build

- `npm install`: OK
- `npm run build`: OK
