# GlassFlow CRM

CRM para Facundo Morazzo, construido con React, Vite, TypeScript y Tailwind.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Módulos

- Clientes.
- Presupuestos e impresión.
- Trabajos con tabla, kanban e historial.
- Fábricas de aberturas, cristales y colocaciones.
- Monitor de taller.
- Agenda.
- Caja.
- Control de obras.

## Base de datos

Google Sheets es la única fuente de datos. El archivo incluye pestañas para:

- `Obras`, `Resumen`, `Listas` e `Historial`.
- `Clientes`.
- `Presupuestos`.
- `Trabajos CRM`.
- `Agenda`.
- `Caja`.
- `Usuarios`.
- `Configuración`.

La web se comunica con la planilla mediante el Google Apps Script incluido en `google-apps-script/`. Toda lectura y escritura del CRM pasa por `src/services/crmRepository.ts`.

Configurar la URL pública del Apps Script:

```env
VITE_OBRAS_API_URL=https://script.google.com/macros/s/ID_DEL_DESPLIEGUE/exec
```

Las instrucciones completas están en `docs/control-obras-google-sheets.md`.

## Estructura principal

```text
src/
  components/
  lib/
  services/
    crmRepository.ts
    sheetsCrmRepository.ts
    obrasApi.ts
  types/
google-apps-script/
  Code.gs
  CRM.gs
  appsscript.json
```
