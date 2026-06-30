import type { CrmDataSnapshot } from "../types";
import type { CrmRepository } from "./crmRepository";
import { normalizeSnapshot } from "./crmRepository";

const apiUrl = (import.meta.env.VITE_OBRAS_API_URL as string | undefined)?.trim();

interface SnapshotResponse {
  ok: boolean;
  snapshot?: CrmDataSnapshot;
  error?: string;
}

const requireApiUrl = () => {
  if (!apiUrl) {
    throw new Error("Falta configurar VITE_OBRAS_API_URL para conectar el CRM con Google Sheets.");
  }
  return apiUrl;
};

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const parseResponse = async (response: Response): Promise<SnapshotResponse> => {
  const payload = (await response.json()) as SnapshotResponse;
  if (!response.ok || !payload.ok || !payload.snapshot) {
    throw new Error(payload.error || "Google Sheets no devolvió datos válidos.");
  }
  return payload;
};

const readSnapshot = async () => {
  const response = await fetch(`${requireApiUrl()}?action=snapshot&_=${Date.now()}`, {
    cache: "no-store",
    redirect: "follow",
  });
  const payload = await parseResponse(response);
  return normalizeSnapshot(payload.snapshot!);
};

export const createSheetsCrmRepository = (): CrmRepository => ({
  getSnapshot: readSnapshot,

  async saveSnapshot(snapshot) {
    const normalized = normalizeSnapshot(snapshot);

    await fetch(requireApiUrl(), {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "saveSnapshot", snapshot: normalized }),
      redirect: "follow",
    });

    await wait(300);
    return readSnapshot();
  },
});
