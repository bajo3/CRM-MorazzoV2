const SPREADSHEET_ID = "1JP5cSguDRcPA74iN8-kIid6CScgWbGH_suxY7scmTX8";
const OBRAS_SHEET = "Obras";
const HISTORY_SHEET = "Historial";
const TIME_ZONE = "America/Argentina/Buenos_Aires";
const STAGES = ["Pendiente", "En curso", "Terminada", "Finalizada"];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "list";
    if (action === "list") return jsonResponse_({ ok: true, obras: listObras_() });
    if (action === "snapshot") return jsonResponse_({ ok: true, snapshot: getCrmSnapshot_() });
    throw new Error("Acción no válida.");
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.action === "create") {
      const obra = createObra_(body.obra || {});
      return jsonResponse_({ ok: true, obra: obra });
    }
    if (body.action === "update") {
      const obra = updateObra_(String(body.id || ""), body.obra || {});
      return jsonResponse_({ ok: true, obra: obra });
    }
    if (body.action === "delete") {
      deleteObra_(String(body.id || ""));
      return jsonResponse_({ ok: true });
    }
    if (body.action === "saveSnapshot") {
      const snapshot = saveCrmSnapshot_(body.snapshot || {});
      return jsonResponse_({ ok: true, snapshot: snapshot });
    }
    throw new Error("Acción no válida.");
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function listObras_() {
  const sheet = getSpreadsheet_().getSheetByName(OBRAS_SHEET);
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const values = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  const displays = sheet.getRange(2, 1, lastRow - 1, 10).getDisplayValues();

  return values
    .map(function (row, index) {
      if (!String(row[2] || "").trim()) return null;
      return mapObra_(row, displays[index]);
    })
    .filter(Boolean);
}

function createObra_(input) {
  validateObra_(input);
  const sheet = getSpreadsheet_().getSheetByName(OBRAS_SHEET);
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const values = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
  let offset = values.findIndex(function (row) { return !String(row[2] || "").trim(); });

  if (offset < 0) {
    sheet.insertRowAfter(lastRow);
    offset = lastRow - 1;
    sheet.getRange(2, 4).copyTo(sheet.getRange(lastRow + 1, 4), SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    sheet.getRange(2, 8, 1, 2).copyTo(sheet.getRange(lastRow + 1, 8, 1, 2), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
  }

  const rowNumber = offset + 2;
  const id = String(nextId_());
  writeObra_(sheet, rowNumber, id, input);
  appendHistory_("Alta", id, input.nombre, "Obra creada", "Web beta");
  SpreadsheetApp.flush();
  return getObraById_(id);
}

function updateObra_(id, input) {
  validateObra_(input);
  const sheet = getSpreadsheet_().getSheetByName(OBRAS_SHEET);
  const rowNumber = findRowById_(sheet, id);
  const before = getObraById_(id);
  writeObra_(sheet, rowNumber, id, input);
  const changes = describeChanges_(before, input);
  appendHistory_("Edición", id, input.nombre, changes || "Sin cambios visibles", "Web beta");
  SpreadsheetApp.flush();
  return getObraById_(id);
}

function deleteObra_(id) {
  const sheet = getSpreadsheet_().getSheetByName(OBRAS_SHEET);
  const rowNumber = findRowById_(sheet, id);
  const before = getObraById_(id);
  sheet.getRange(rowNumber, 1, 1, 7).clearContent();
  sheet.getRange(rowNumber, 10).clearContent();
  appendHistory_("Baja", id, before.nombre, "Obra eliminada", "Web beta");
}

function writeObra_(sheet, rowNumber, id, input) {
  const finalDate = input.etapa === "Finalizada" && !input.fechaFinalizacion
    ? Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd")
    : input.fechaFinalizacion;
  sheet.getRange(rowNumber, 1, 1, 7).setValues([[
    Number(id),
    parseDate_(input.fechaInicio),
    clean_(input.nombre),
    input.etapa,
    clean_(input.proximaAccion),
    clean_(input.responsable),
    finalDate ? parseDate_(finalDate) : "",
  ]]);
  sheet.getRange(rowNumber, 10).setValue(clean_(input.notas));
  sheet.getRange(rowNumber, 2).setNumberFormat("dd/MM/yyyy");
  sheet.getRange(rowNumber, 7).setNumberFormat("dd/MM/yyyy");
}

function validateObra_(input) {
  if (!clean_(input.fechaInicio)) throw new Error("La fecha de inicio es obligatoria.");
  if (!clean_(input.nombre)) throw new Error("El nombre de obra es obligatorio.");
  if (!clean_(input.responsable)) throw new Error("El responsable es obligatorio.");
  if (STAGES.indexOf(input.etapa) < 0) throw new Error("La etapa no es válida.");
}

function getObraById_(id) {
  const obras = listObras_();
  const obra = obras.find(function (item) { return item.id === String(id); });
  if (!obra) throw new Error("No se encontró la obra " + id + ".");
  return obra;
}

function findRowById_(sheet, id) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
  const offset = ids.findIndex(function (row) { return String(row[0]) === String(id); });
  if (offset < 0) throw new Error("No se encontró la obra " + id + ".");
  return offset + 2;
}

function nextId_() {
  const spreadsheet = getSpreadsheet_();
  const sheet = spreadsheet.getSheetByName(OBRAS_SHEET);
  const history = spreadsheet.getSheetByName(HISTORY_SHEET);
  const dataRows = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 3).getValues();
  const dataIds = dataRows
    .filter(function (row) { return String(row[2] || "").trim(); })
    .map(function (row) { return row[0]; });
  const historyIds = history && history.getLastRow() > 1
    ? history.getRange(2, 3, history.getLastRow() - 1, 1).getValues().flat()
    : [];
  const used = dataIds.concat(historyIds).map(Number).filter(function (value) { return Number.isFinite(value); });
  return used.length ? Math.max.apply(null, used) + 1 : 1;
}

function mapObra_(row, display) {
  return {
    id: String(display[0] || row[0]),
    fechaInicio: formatDate_(row[1]),
    nombre: String(row[2] || ""),
    etapa: String(row[3] || "Pendiente"),
    proximaAccion: String(row[4] || ""),
    responsable: String(row[5] || ""),
    fechaFinalizacion: formatDate_(row[6]),
    diasAbiertos: display[7] === "" ? null : Number(row[7]),
    vencida: String(display[8]).toLocaleLowerCase() === "sí",
    notas: String(row[9] || ""),
  };
}

function describeChanges_(before, after) {
  const labels = {
    fechaInicio: "Fecha de inicio",
    nombre: "Nombre",
    etapa: "Etapa",
    proximaAccion: "Próxima acción",
    responsable: "Responsable",
    fechaFinalizacion: "Fecha de finalización",
    notas: "Notas",
  };
  return Object.keys(labels)
    .filter(function (key) { return String(before[key] || "") !== String(after[key] || ""); })
    .map(function (key) { return labels[key] + ": " + String(before[key] || "—") + " → " + String(after[key] || "—"); })
    .join(" | ");
}

function appendHistory_(action, id, name, detail, origin) {
  const sheet = getSpreadsheet_().getSheetByName(HISTORY_SHEET);
  if (!sheet) return;
  sheet.appendRow([new Date(), action, id, name, detail, origin]);
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat("dd/MM/yyyy HH:mm:ss");
}

function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== OBRAS_SHEET || e.range.getRow() < 2 || e.range.getColumn() > 10) return;
  normalizeEditedDate_(e);
  const row = e.range.getRow();
  const id = sheet.getRange(row, 1).getDisplayValue();
  const name = sheet.getRange(row, 3).getDisplayValue();
  if (!id && !name) return;
  const header = sheet.getRange(1, e.range.getColumn()).getDisplayValue();
  const detail = header + ": " + String(e.oldValue || "—") + " → " + String(e.value || "—");
  appendHistory_("Edición", id, name, detail, "Google Sheets");
}

function normalizeEditedDate_(e) {
  const column = e.range.getColumn();
  if ((column !== 2 && column !== 7) || typeof e.value !== "string") return;
  const match = e.value.trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!match) return;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12, 0, 0);
  e.range.setValue(date).setNumberFormat("dd/MM/yyyy");
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function clean_(value) {
  return String(value == null ? "" : value).trim();
}

function parseDate_(value) {
  const parts = clean_(value).split("-");
  if (parts.length !== 3) throw new Error("Formato de fecha inválido.");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);
}

function formatDate_(value) {
  return value instanceof Date ? Utilities.formatDate(value, TIME_ZONE, "yyyy-MM-dd") : "";
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
