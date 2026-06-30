# CRM conectado con Google Sheets

Google Sheets es la única fuente de datos del CRM. Los cambios realizados desde la web se guardan en la planilla y los cambios manuales quedan disponibles al volver a cargar el CRM.

## Publicar la API

1. Abrir la planilla **Control de obras - Facundo Morazzo**.
2. Ir a **Extensiones → Apps Script**.
3. Copiar `google-apps-script/Code.gs` al archivo `Code.gs`.
4. Crear otro archivo de secuencia llamado `CRM` y copiar `google-apps-script/CRM.gs`.
5. Activar la visualización del manifiesto y reemplazar `appsscript.json` con el archivo incluido.
6. Elegir **Implementar → Nueva implementación → Aplicación web**.
7. Configurar:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
8. Autorizar y copiar la URL que termina en `/exec`.

## Conectar el CRM

Crear `.env.local` en la raíz:

```env
VITE_OBRAS_API_URL=https://script.google.com/macros/s/ID_DEL_DESPLIEGUE/exec
```

Reiniciar el servidor o volver a desplegar el CRM.

## Pestañas

- `Clientes`
- `Presupuestos`
- `Trabajos CRM`
- `Agenda`
- `Caja`
- `Usuarios`
- `Configuración`
- `Obras`, `Resumen`, `Listas` e `Historial`

Los campos anidados de presupuestos y trabajos se conservan en columnas JSON para no multiplicar pestañas técnicas.

## Seguridad de la beta

La aplicación web permite lectura y escritura sin inicio de sesión. No expone credenciales de Google, pero cualquier persona con acceso al CRM puede modificar los datos. Antes de abrirlo a terceros conviene agregar autenticación.

## Historial de obras

- La web registra altas, ediciones y bajas con origen `Web beta`.
- Las ediciones manuales de `Obras` se registran con origen `Google Sheets`.
- Como la beta no tiene usuarios, se identifica el origen pero no una persona concreta.
