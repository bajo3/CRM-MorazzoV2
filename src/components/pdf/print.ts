import { formatDate } from "../../lib/dates";
import { formatMoney } from "../../lib/money";
import { fabricaLabels, rubroLabels, stateLabels } from "../../lib/workflow";
import type { Cliente, CompanyConfig, Presupuesto, Trabajo } from "../../types";

const statusLabel: Record<string, string> = {
  borrador: "BORRADOR",
  enviado: "ENVIADO",
  aprobado: "APROBADO",
  rechazado: "RECHAZADO",
  vencido: "VENCIDO",
};

const statusColor: Record<string, string> = {
  borrador: "#64748b",
  enviado: "#0f766e",
  aprobado: "#16a34a",
  rechazado: "#dc2626",
  vencido: "#9ca3af",
};

const openPrintableWindow = (_title: string, html: string): void => {
  const popup = window.open("", "_blank", "width=960,height=800");
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
};

export const printPresupuesto = ({
  company,
  presupuesto,
  cliente,
}: {
  company: CompanyConfig;
  presupuesto: Presupuesto;
  cliente: Cliente;
}): void => {
  const quoteNumber = presupuesto.id.replace("PRE-", "#P");
  const validUntil = presupuesto.fecha
    ? new Date(new Date(presupuesto.fecha).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : "";
  const estado = presupuesto.estado || "borrador";
  const estColor = statusColor[estado] || "#64748b";
  const estLabel = statusLabel[estado] || estado.toUpperCase();

  const itemsHtml = presupuesto.items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}">
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0">${item.descripcion}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">${item.tipo || "-"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">${item.ancho && item.alto ? `${item.ancho} x ${item.alto} mm` : "-"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center">${item.cantidad}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right">${formatMoney(item.precioUnitario)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600">${formatMoney(item.subtotal)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Presupuesto ${quoteNumber} - ${company.nombre}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: #fff; padding: 0; font-size: 13px; }
    @page { size: A4; margin: 20mm; }
    @media print { body { padding: 0; } .no-print { display: none !important; } }

    .page { max-width: 800px; margin: 0 auto; padding: 32px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #0f766e; margin-bottom: 28px; }
    .company-name { font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .company-sub { font-size: 13px; color: #0f766e; font-weight: 600; margin-top: 2px; }
    .company-contact { font-size: 11px; color: #64748b; margin-top: 8px; line-height: 1.7; }
    .quote-block { text-align: right; }
    .quote-title { font-size: 28px; font-weight: 800; color: #0f766e; letter-spacing: -0.5px; }
    .quote-number { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .quote-status { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; margin-top: 6px; color: ${estColor}; border: 2px solid ${estColor}; }

    /* Dates row */
    .dates-row { display: flex; gap: 24px; margin-bottom: 24px; }
    .date-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; flex: 1; }
    .date-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; }
    .date-value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px; }

    /* Sections */
    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .section-box { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .section-head { background: #f1f5f9; padding: 8px 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
    .section-body { padding: 12px 14px; line-height: 1.8; }
    .section-body strong { font-weight: 600; color: #0f172a; }
    .section-body span { color: #475569; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #0f766e; }
    thead th { color: #fff; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    thead th:last-child, thead th:nth-last-child(2), thead th:nth-last-child(3) { text-align: right; }
    thead th:nth-child(4) { text-align: center; }
    tbody tr td:last-child, tbody tr td:nth-last-child(2) { text-align: right; }
    tbody tr td:nth-child(4) { text-align: center; }

    /* Totals */
    .totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals-box { width: 280px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .total-row { display: flex; justify-content: space-between; padding: 9px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .total-row:last-child { border-bottom: none; background: #0f766e; }
    .total-row:last-child .t-label { color: #fff; font-weight: 700; }
    .total-row:last-child .t-value { color: #fff; font-size: 16px; font-weight: 800; }
    .t-label { color: #64748b; }
    .t-value { font-weight: 600; color: #0f172a; }

    /* Payment conditions */
    .conditions { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; margin-bottom: 24px; }
    .conditions h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 10px; }
    .conditions ul { list-style: none; padding: 0; }
    .conditions ul li { font-size: 12px; color: #475569; padding: 3px 0; display: flex; gap: 8px; }
    .conditions ul li::before { content: "•"; color: #0f766e; font-weight: 700; }

    /* Signatures */
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    .sig-box { text-align: center; }
    .sig-line { border-top: 1.5px solid #334155; margin-bottom: 6px; }
    .sig-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }

    /* Footer */
    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 10px; color: #94a3b8; }
    .footer-right { font-size: 10px; color: #94a3b8; }

    /* Print button */
    .print-btn { display: block; margin: 16px auto; padding: 10px 28px; background: #0f766e; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
<div class="page">
  <!-- Print button (only visible on screen) -->
  <div class="no-print" style="text-align:center;margin-bottom:16px">
    <button class="print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="company-name">${company.nombre}</div>
      <div class="company-sub">${company.subtitulo}</div>
      <div class="company-contact">
        ${company.direccion}<br>
        Tel: ${company.telefono}<br>
        Email: ${company.email}
      </div>
    </div>
    <div class="quote-block">
      <div class="quote-title">PRESUPUESTO</div>
      <div class="quote-number">${quoteNumber}</div>
      <div class="quote-status">${estLabel}</div>
    </div>
  </div>

  <!-- Dates -->
  <div class="dates-row">
    <div class="date-item">
      <div class="date-label">Fecha</div>
      <div class="date-value">${formatDate(presupuesto.fecha)}</div>
    </div>
    <div class="date-item">
      <div class="date-label">Válido hasta</div>
      <div class="date-value">${validUntil ? formatDate(validUntil) : "15 días"}</div>
    </div>
    <div class="date-item">
      <div class="date-label">N° de referencia</div>
      <div class="date-value">${quoteNumber}</div>
    </div>
  </div>

  <!-- Client + Details -->
  <div class="section-grid">
    <div class="section-box">
      <div class="section-head">Cliente</div>
      <div class="section-body">
        <strong>${cliente.nombre}</strong><br>
        <span>${cliente.direccion}${cliente.localidad ? `, ${cliente.localidad}` : ""}</span><br>
        <span>Tel: ${cliente.telefono || "-"}</span><br>
        ${cliente.whatsapp ? `<span>WA: ${cliente.whatsapp}</span><br>` : ""}
        ${cliente.cuit ? `<span>CUIT: ${cliente.cuit}</span>` : ""}
      </div>
    </div>
    <div class="section-box">
      <div class="section-head">Detalles del presupuesto</div>
      <div class="section-body">
        <span>Rubro: </span><strong>${presupuesto.items[0]?.tipo || "General"}</strong><br>
        <span>Fecha: </span><strong>${formatDate(presupuesto.fecha)}</strong><br>
        <span>Validez: </span><strong>15 días hábiles</strong>
      </div>
    </div>
  </div>

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th style="width:35%">Descripción</th>
        <th style="width:12%;text-align:center">Tipo</th>
        <th style="width:16%;text-align:center">Medidas</th>
        <th style="width:8%;text-align:center">Cant.</th>
        <th style="width:14%;text-align:right">P. Unitario</th>
        <th style="width:15%;text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <!-- Totals -->
  <div class="totals-wrap">
    <div class="totals-box">
      <div class="total-row">
        <span class="t-label">Subtotal</span>
        <span class="t-value">${formatMoney(presupuesto.subtotal)}</span>
      </div>
      ${presupuesto.descuento > 0 ? `
      <div class="total-row">
        <span class="t-label">Descuento</span>
        <span class="t-value">${presupuesto.descuento}%</span>
      </div>` : ""}
      <div class="total-row">
        <span class="t-label">IVA / Impuestos</span>
        <span class="t-value">Incluido</span>
      </div>
      <div class="total-row">
        <span class="t-label">TOTAL</span>
        <span class="t-value">${formatMoney(presupuesto.total)}</span>
      </div>
    </div>
  </div>

  <!-- Payment conditions -->
  <div class="conditions">
    <h3>Condiciones de pago</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">
      <div>
        <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Seña (50%)</span>
        <p style="font-size:16px;font-weight:700;color:#0f766e">${formatMoney(presupuesto.senaSugerida)}</p>
      </div>
      <div>
        <span style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em">Saldo</span>
        <p style="font-size:16px;font-weight:700;color:#0f172a">${formatMoney(Math.max(presupuesto.total - presupuesto.senaSugerida, 0))}</p>
      </div>
    </div>
    <h3 style="margin-top:10px">Condiciones generales</h3>
    <ul>
      <li>Validez del presupuesto: 15 días hábiles desde la fecha de emisión.</li>
      <li>Precios expresados en pesos argentinos (ARS) con IVA incluido.</li>
      <li>El plazo de fabricación se confirma al recibir la seña.</li>
      <li>La instalación puede tener un costo adicional según la complejidad.</li>
      <li>Modificaciones posteriores pueden alterar el precio final.</li>
    </ul>
  </div>

  ${presupuesto.observaciones ? `
  <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:12px;color:#475569">
    <strong style="color:#0f172a">Observaciones:</strong> ${presupuesto.observaciones}
  </div>` : ""}

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-box">
      <div style="height:56px"></div>
      <div class="sig-line"></div>
      <div class="sig-label">Firma y aclaración del cliente</div>
    </div>
    <div class="sig-box">
      <div style="height:56px"></div>
      <div class="sig-line"></div>
      <div class="sig-label">Aclaración del vendedor</div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">${company.nombre} · ${company.subtitulo}</div>
    <div class="footer-right">GlassFlow CRM · ${quoteNumber}</div>
  </div>
</div>
<script>
  // Auto-print on load (comment out if you prefer manual)
  // window.onload = () => setTimeout(() => window.print(), 300);
</script>
</body>
</html>`;

  openPrintableWindow(`Presupuesto ${quoteNumber}`, html);
};

export const viewPresupuesto = printPresupuesto;

export const downloadPresupuesto = ({
  company,
  presupuesto,
  cliente,
}: {
  company: CompanyConfig;
  presupuesto: Presupuesto;
  cliente: Cliente;
}): void => {
  const quoteNumber = presupuesto.id.replace("PRE-", "#P");
  const rows = presupuesto.items
    .map(
      (item) => `
        <tr>
          <td>${item.descripcion}</td>
          <td>${item.tipo || "-"}</td>
          <td>${item.ancho && item.alto ? `${item.ancho} x ${item.alto} mm` : "-"}</td>
          <td>${item.cantidad}</td>
          <td>${formatMoney(item.precioUnitario)}</td>
          <td>${formatMoney(item.subtotal)}</td>
        </tr>`,
    )
    .join("");
  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Presupuesto ${quoteNumber}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#0f172a;margin:32px}
    h1{color:#0f766e;margin:0 0 4px}
    table{width:100%;border-collapse:collapse;margin-top:24px}
    th,td{border-bottom:1px solid #e2e8f0;padding:10px;text-align:left}
    th{background:#0f766e;color:white}
    .totals{margin-top:24px;margin-left:auto;width:320px}
    .totals div{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}
  </style>
</head>
<body>
  <h1>${company.nombre}</h1>
  <p>${company.subtitulo} · ${company.telefono}</p>
  <h2>Presupuesto ${quoteNumber}</h2>
  <p><strong>Cliente:</strong> ${cliente.nombre}</p>
  <p><strong>Fecha:</strong> ${formatDate(presupuesto.fecha)}</p>
  <table>
    <thead><tr><th>Descripcion</th><th>Tipo</th><th>Medidas</th><th>Cant.</th><th>Unitario</th><th>Subtotal</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><strong>${formatMoney(presupuesto.subtotal)}</strong></div>
    <div><span>Descuento</span><strong>${presupuesto.descuento}%</strong></div>
    <div><span>Total</span><strong>${formatMoney(presupuesto.total)}</strong></div>
    <div><span>Seña</span><strong>${formatMoney(presupuesto.senaSugerida)}</strong></div>
    <div><span>Saldo</span><strong>${formatMoney(Math.max(presupuesto.total - presupuesto.senaSugerida, 0))}</strong></div>
  </div>
</body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `presupuesto-${presupuesto.id}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const printTrabajo = ({
  company,
  trabajo,
  cliente,
}: {
  company: CompanyConfig;
  trabajo: Trabajo;
  cliente: Cliente;
}): void => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden ${trabajo.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; font-size: 13px; padding: 32px; }
    @page { size: A4; margin: 20mm; }
    h1 { font-size: 20px; font-weight: 700; color: #0f766e; }
    h2 { font-size: 14px; font-weight: 700; margin: 18px 0 6px; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .row span { color: #64748b; }
    .row strong { color: #0f172a; }
    .totals { margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .total-row { display: flex; justify-content: space-between; padding: 9px 14px; border-bottom: 1px solid #f1f5f9; }
    .total-row:last-child { border-bottom: none; background: #0f766e; color: #fff; font-weight: 700; }
    .print-btn { display: block; margin: 12px auto 24px; padding: 8px 24px; background: #0f766e; color: #fff; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Imprimir</button>
  <h1>${company.nombre}</h1>
  <p style="color:#64748b;font-size:12px;margin-top:2px">${company.subtitulo} · ${company.telefono}</p>

  <h2>Orden de Trabajo ${trabajo.id}</h2>
  <div class="row"><span>Cliente</span><strong>${cliente.nombre}</strong></div>
  <div class="row"><span>Título</span><strong>${trabajo.titulo}</strong></div>
  <div class="row"><span>Rubro</span><strong>${rubroLabels[trabajo.rubro]}</strong></div>
  <div class="row"><span>Fábrica</span><strong>${fabricaLabels[trabajo.fabricaAsignada]}</strong></div>
  <div class="row"><span>Estado</span><strong>${stateLabels[trabajo.estadoProduccion]}</strong></div>
  <div class="row"><span>Prioridad</span><strong>${trabajo.prioridad}</strong></div>
  <div class="row"><span>Fecha ingreso</span><strong>${formatDate(trabajo.fechaIngreso)}</strong></div>
  <div class="row"><span>Fecha prometida</span><strong>${formatDate(trabajo.fechaPrometida)}</strong></div>

  <h2>Especificaciones</h2>
  <div class="row"><span>Medidas</span><strong>${trabajo.medidas}</strong></div>
  <div class="row"><span>Cantidad</span><strong>${trabajo.cantidad} un.</strong></div>
  <div class="row"><span>Color / Material</span><strong>${trabajo.colorMaterial}</strong></div>
  <div class="row"><span>Descripción</span><strong>${trabajo.descripcion}</strong></div>
  ${trabajo.observacionesInternas ? `<div class="row"><span>Obs. internas</span><strong>${trabajo.observacionesInternas}</strong></div>` : ""}

  <h2>Valores</h2>
  <div class="totals">
    <div class="total-row"><span>Total</span><strong>${formatMoney(trabajo.total)}</strong></div>
    <div class="total-row"><span>Seña</span><strong>${formatMoney(trabajo.sena)}</strong></div>
    <div class="total-row"><span>Saldo pendiente</span><strong>${formatMoney(trabajo.saldo)}</strong></div>
  </div>
</body>
</html>`;

  openPrintableWindow(`Orden ${trabajo.id}`, html);
};
