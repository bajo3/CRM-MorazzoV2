import type { Obra, ObraInput } from "../types/obra";

const apiUrl = (import.meta.env.VITE_OBRAS_API_URL as string | undefined)?.trim();

interface ObrasResponse {
  ok: boolean;
  obras?: Obra[];
  error?: string;
}

const parseResponse = async (response: Response): Promise<ObrasResponse> => {
  const payload = (await response.json()) as ObrasResponse;
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "No se pudo conectar con Google Sheets.");
  }
  return payload;
};

const requireApiUrl = () => {
  if (!apiUrl) {
    throw new Error("Falta configurar VITE_OBRAS_API_URL con la URL del Google Apps Script.");
  }
  return apiUrl;
};

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const post = async (body: Record<string, unknown>) => {
  await fetch(requireApiUrl(), {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
    redirect: "follow",
  });
  await wait(300);
};

const list = async (): Promise<Obra[]> => {
  const response = await fetch(`${requireApiUrl()}?action=list&_=${Date.now()}`, {
    cache: "no-store",
    redirect: "follow",
  });
  const payload = await parseResponse(response);
  return payload.obras || [];
};

export const obrasApi = {
  isConfigured: Boolean(apiUrl),
  list,

  async create(obra: ObraInput): Promise<Obra> {
    await post({ action: "create", obra });
    const obras = await list();
    const created = [...obras].reverse().find((item) => item.nombre === obra.nombre);
    if (!created) throw new Error("La obra se envió, pero no se pudo confirmar en Google Sheets.");
    return created;
  },

  async update(id: string, obra: ObraInput): Promise<Obra> {
    await post({ action: "update", id, obra });
    const obras = await list();
    const updated = obras.find((item) => item.id === id);
    if (!updated) throw new Error("La obra se envió, pero no se pudo confirmar en Google Sheets.");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await post({ action: "delete", id });
  },
};
