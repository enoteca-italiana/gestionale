import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const LS_KEY = 'supabase_keepalive_ts';
const INTERVAL_MS = 24 * 60 * 60 * 1000;

async function ping(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('wines').select('id').limit(1);
    localStorage.setItem(LS_KEY, String(Date.now()));
  } catch {
    // silenzioso — non interrompe mai l'app
  }
}

export function useSupabaseKeepalive(): void {
  useEffect(() => {
    if (!supabase) return;

    const lastTs = Number(localStorage.getItem(LS_KEY) ?? 0);
    if (Date.now() - lastTs >= INTERVAL_MS) {
      void ping();
    }

    const timer = setInterval(() => void ping(), INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
}
