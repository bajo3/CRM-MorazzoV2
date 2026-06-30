const CRM_SHEETS = {
  clientes: "Clientes",
  presupuestos: "Presupuestos",
  trabajos: "Trabajos CRM",
  agenda: "Agenda",
  pagos: "Caja",
  usuarios: "Usuarios",
  configuracion: "Configuración",
};

function getCrmSnapshot_() {
  return {
    company: readCompany_(),
    clientes: readClientes_(),
    presupuestos: readPresupuestos_(),
    trabajos: readTrabajos_(),
    agenda: readAgenda_(),
    pagos: readPagos_(),
    usuarios: readUsuarios_(),
  };
}

function saveCrmSnapshot_(snapshot) {
  validateSnapshot_(snapshot);

  writeRows_(CRM_SHEETS.clientes, 11, snapshot.clientes.map(function (item) {
    return [
      item.id, item.nombre, item.telefono, item.whatsapp, item.email,
      item.direccion, item.localidad, item.cuit, item.observaciones,
      item.createdAt, item.updatedAt,
    ];
  }));

  writeRows_(CRM_SHEETS.presupuestos, 11, snapshot.presupuestos.map(function (item) {
    return [
      item.id, item.clienteId, item.fecha, item.estado, number_(item.descuento),
      number_(item.sena), item.observaciones, JSON.stringify(item.items || []),
      item.trabajoId || "", item.createdAt, item.updatedAt,
    ];
  }));

  writeRows_(CRM_SHEETS.trabajos, 23, snapshot.trabajos.map(function (item) {
    return [
      item.id, item.clienteId, item.presupuestoId || "", item.titulo, item.rubro,
      item.fabricaAsignada, item.descripcion, item.medidas, number_(item.cantidad),
      item.colorMaterial, item.estadoComercial, item.estadoProduccion, item.prioridad,
      item.fechaIngreso, item.fechaPrometida, number_(item.total), number_(item.sena),
      number_(item.saldo), item.observacionesInternas,
      JSON.stringify(item.historial || []), JSON.stringify(item.archivosAdjuntos || []),
      item.createdAt, item.updatedAt,
    ];
  }));

  writeRows_(CRM_SHEETS.agenda, 11, snapshot.agenda.map(function (item) {
    return [
      item.id, item.tipo, item.estado, item.clienteId || "", item.trabajoId || "",
      item.fecha, item.hora, item.titulo, item.descripcion, item.createdAt, item.updatedAt,
    ];
  }));

  writeRows_(CRM_SHEETS.pagos, 12, snapshot.pagos.map(function (item) {
    return [
      item.id, item.tipo, item.concepto, item.categoria, item.clienteId || "",
      item.presupuestoId || "", item.trabajoId || "", item.fecha, number_(item.monto),
      item.metodo, item.observaciones, item.createdAt,
    ];
  }));

  writeRows_(CRM_SHEETS.usuarios, 4, snapshot.usuarios.map(function (item) {
    return [item.id, item.nombre, item.rol, Boolean(item.activo)];
  }));

  writeCompany_(snapshot.company);
  SpreadsheetApp.flush();
  return getCrmSnapshot_();
}

function readClientes_() {
  return readRows_(CRM_SHEETS.clientes, 11).map(function (row) {
    return {
      id: text_(row[0]),
      nombre: text_(row[1]),
      telefono: text_(row[2]),
      whatsapp: text_(row[3]),
      email: text_(row[4]),
      direccion: text_(row[5]),
      localidad: text_(row[6]),
      cuit: text_(row[7]),
      observaciones: text_(row[8]),
      createdAt: dateTime_(row[9]),
      updatedAt: dateTime_(row[10]) || dateTime_(row[9]),
    };
  });
}

function readPresupuestos_() {
  return readRows_(CRM_SHEETS.presupuestos, 11).map(function (row) {
    return {
      id: text_(row[0]),
      clienteId: text_(row[1]),
      fecha: dateOnly_(row[2]),
      estado: text_(row[3]) || "borrador",
      descuento: number_(row[4]),
      sena: number_(row[5]),
      subtotal: 0,
      total: 0,
      senaSugerida: 0,
      saldo: 0,
      observaciones: text_(row[6]),
      items: jsonArray_(row[7]),
      trabajoId: text_(row[8]) || undefined,
      createdAt: dateTime_(row[9]),
      updatedAt: dateTime_(row[10]) || dateTime_(row[9]),
    };
  });
}

function readTrabajos_() {
  return readRows_(CRM_SHEETS.trabajos, 23).map(function (row) {
    return {
      id: text_(row[0]),
      clienteId: text_(row[1]),
      presupuestoId: text_(row[2]) || undefined,
      titulo: text_(row[3]),
      rubro: text_(row[4]) || "pvc",
      fabricaAsignada: text_(row[5]) || "pvc",
      descripcion: text_(row[6]),
      medidas: text_(row[7]),
      cantidad: number_(row[8]) || 1,
      colorMaterial: text_(row[9]),
      estadoComercial: text_(row[10]) || "aprobado",
      estadoProduccion: text_(row[11]) || "recibido",
      prioridad: text_(row[12]) || "normal",
      fechaIngreso: dateOnly_(row[13]),
      fechaPrometida: dateOnly_(row[14]),
      total: number_(row[15]),
      sena: number_(row[16]),
      saldo: number_(row[17]),
      observacionesInternas: text_(row[18]),
      historial: jsonArray_(row[19]),
      archivosAdjuntos: jsonArray_(row[20]),
      createdAt: dateTime_(row[21]),
      updatedAt: dateTime_(row[22]) || dateTime_(row[21]),
    };
  });
}

function readAgenda_() {
  return readRows_(CRM_SHEETS.agenda, 11).map(function (row) {
    return {
      id: text_(row[0]),
      tipo: text_(row[1]) || "reunion",
      estado: text_(row[2]) || "pendiente",
      clienteId: text_(row[3]) || undefined,
      trabajoId: text_(row[4]) || undefined,
      fecha: dateOnly_(row[5]),
      hora: text_(row[6]),
      titulo: text_(row[7]),
      descripcion: text_(row[8]),
      createdAt: dateTime_(row[9]),
      updatedAt: dateTime_(row[10]) || dateTime_(row[9]),
    };
  });
}

function readPagos_() {
  return readRows_(CRM_SHEETS.pagos, 12).map(function (row) {
    return {
      id: text_(row[0]),
      tipo: text_(row[1]) || "ingreso",
      concepto: text_(row[2]),
      categoria: text_(row[3]) || "cobro_cliente",
      clienteId: text_(row[4]) || undefined,
      presupuestoId: text_(row[5]) || undefined,
      trabajoId: text_(row[6]) || undefined,
      fecha: dateOnly_(row[7]),
      monto: number_(row[8]),
      metodo: text_(row[9]) || "transferencia",
      observaciones: text_(row[10]),
      createdAt: dateTime_(row[11]),
    };
  });
}

function readUsuarios_() {
  return readRows_(CRM_SHEETS.usuarios, 4).map(function (row) {
    return {
      id: text_(row[0]),
      nombre: text_(row[1]),
      rol: text_(row[2]) || "vendedor",
      activo: boolean_(row[3]),
    };
  });
}

function readCompany_() {
  const rows = readRows_(CRM_SHEETS.configuracion, 2);
  const values = {};
  rows.forEach(function (row) { values[text_(row[0]).toLowerCase()] = text_(row[1]); });
  return {
    nombre: values["nombre"] || "Facundo Morazzo",
    subtitulo: values["subtítulo"] || values["subtitulo"] || "Aberturas y Cristales",
    telefono: values["teléfono"] || values["telefono"] || "",
    email: values["email"] || "",
    direccion: values["dirección"] || values["direccion"] || "",
  };
}

function writeCompany_(company) {
  const sheet = getSpreadsheet_().getSheetByName(CRM_SHEETS.configuracion);
  sheet.getRange(2, 1, 5, 2).setValues([
    ["Nombre", text_(company.nombre)],
    ["Subtítulo", text_(company.subtitulo)],
    ["Teléfono", text_(company.telefono)],
    ["Email", text_(company.email)],
    ["Dirección", text_(company.direccion)],
  ]);
}

function readRows_(sheetName, columnCount) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error("Falta la pestaña " + sheetName + ".");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, columnCount).getValues()
    .filter(function (row) { return text_(row[0]); });
}

function writeRows_(sheetName, columnCount, rows) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error("Falta la pestaña " + sheetName + ".");
  const existingRows = Math.max(sheet.getLastRow() - 1, 0);
  if (existingRows > 0) sheet.getRange(2, 1, existingRows, columnCount).clearContent();
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, columnCount).setValues(rows);
}

function validateSnapshot_(snapshot) {
  ["clientes", "presupuestos", "trabajos", "agenda", "pagos", "usuarios"].forEach(function (key) {
    if (!Array.isArray(snapshot[key])) throw new Error("Datos inválidos en " + key + ".");
  });
  if (!snapshot.company || typeof snapshot.company !== "object") {
    throw new Error("Falta la configuración de la empresa.");
  }
}

function text_(value) {
  return String(value == null ? "" : value).trim();
}

function number_(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean_(value) {
  if (typeof value === "boolean") return value;
  return ["true", "sí", "si", "1", "activo"].indexOf(text_(value).toLowerCase()) >= 0;
}

function jsonArray_(value) {
  if (Array.isArray(value)) return value;
  if (!text_(value)) return [];
  try {
    const parsed = JSON.parse(text_(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function dateOnly_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, TIME_ZONE, "yyyy-MM-dd");
  return text_(value);
}

function dateTime_(value) {
  if (value instanceof Date) return value.toISOString();
  return text_(value);
}
