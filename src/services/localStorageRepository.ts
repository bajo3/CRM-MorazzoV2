import { readJson, writeJson } from "../lib/storage";
import type { CrmDataSnapshot } from "../types";
import type { CrmRepository } from "./crmRepository";
import { normalizeSnapshot } from "./crmRepository";

const STORAGE_KEY = "glassflow-crm-snapshot-v2";

export const createLocalStorageRepository = (seed: CrmDataSnapshot): CrmRepository => ({
  async getSnapshot() {
    const existing = readJson<CrmDataSnapshot>(STORAGE_KEY);
    if (!existing) {
      const normalizedSeed = normalizeSnapshot(seed);
      writeJson(STORAGE_KEY, normalizedSeed);
      return normalizedSeed;
    }
    return normalizeSnapshot(existing);
  },
  async saveSnapshot(snapshot) {
    const normalized = normalizeSnapshot(snapshot);
    writeJson(STORAGE_KEY, normalized);
    return normalized;
  },
});
