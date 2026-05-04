import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const looksLikeProjectUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && /^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) && parsed.pathname === "/";
  } catch {
    return false;
  }
};

const getJwtRole = (token: string): string | null => {
  const [, payload] = token.split(".");
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = JSON.parse(window.atob(normalized));
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
};

export const hasSupabaseEnv = Boolean(url || anonKey);

export const supabaseConfigError =
  url && !looksLikeProjectUrl(url)
    ? "La URL de Supabase debe tener formato https://PROJECT_REF.supabase.co. No uses la URL del dashboard."
    : anonKey && getJwtRole(anonKey) === "service_role"
    ? "La service_role key no puede usarse en frontend. Configura VITE_SUPABASE_ANON_KEY con la anon key."
    : url && !anonKey
    ? "Falta VITE_SUPABASE_ANON_KEY para usar Supabase."
    : anonKey && !url
    ? "Falta VITE_SUPABASE_URL para usar Supabase."
    : null;

export const isSupabaseEnabled = Boolean(url && anonKey && !supabaseConfigError);

export const supabase = isSupabaseEnabled
  ? createClient(url!, anonKey!)
  : null;
