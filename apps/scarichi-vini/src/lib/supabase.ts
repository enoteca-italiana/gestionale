import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function decodeJwtRef(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload?.ref === 'string' ? payload.ref : null;
  } catch {
    return null;
  }
}

if (supabaseUrl && supabaseAnonKey) {
  const urlRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/i)?.[1] ?? null;
  const keyRef = decodeJwtRef(supabaseAnonKey);
  if (urlRef && keyRef && urlRef !== keyRef) {
    console.error(
      `[supabase] ERRORE CONFIGURAZIONE: la chiave anon appartiene al progetto "${keyRef}" ` +
        `ma VITE_SUPABASE_URL punta a "${urlRef}". ` +
        `Tutte le chiamate REST falliranno con 401. ` +
        `Aggiorna SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY con la chiave del progetto "${urlRef}".`
    );
  } else if (urlRef && keyRef && import.meta.env.DEV) {
    console.warn(`[supabase] Client inizializzato — progetto: ${urlRef}`);
  }
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
