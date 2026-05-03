-- =============================================================
-- Fix Supabase Security Advisor Warnings + Grant Mancanti
-- Progetto: aezqtgadyaxdcptwlpci (gestionale)
-- Data: 03/05/2026
--
-- Stato: APPLICATO DIRETTAMENTE VIA PSQL il 03/05/2026
--
-- Come eseguire (se necessario su nuovo progetto):
--   Dashboard Supabase → SQL Editor → incolla ed esegui
--   Oppure: psql "$SUPABASE_DB_URL" -f scripts/fix_security_warnings.sql
-- =============================================================

-- Fix 1: wines_before_write — Function Search Path Mutable
-- Aggiunge SET search_path per prevenire SQL injection via schema hijacking.
ALTER FUNCTION public.wines_before_write()
  SET search_path = public, pg_temp;

-- Fix 2: submit_discharge_session — SECURITY DEFINER search_path
-- La funzione resta SECURITY DEFINER (necessario per eseguire UPDATE su
-- discharge_sessions con privilegi elevati). Il search_path fisso
-- risolve il warning senza cambiare il comportamento.
ALTER FUNCTION public.submit_discharge_session(p_session_id uuid)
  SET search_path = public, pg_temp;

-- Fix 3: GRANT UPDATE mancante su discharge_sessions per ruolo anon
-- Le RLS policy UPDATE esistevano ma il GRANT a livello tabella era assente,
-- causando "permission denied" (error 42501) su PATCH via REST API.
GRANT UPDATE ON public.discharge_sessions TO anon;
GRANT UPDATE ON public.discharge_session_items TO anon;
GRANT UPDATE ON public.categories TO anon;

-- Verifica: funzioni con search_path configurato
SELECT
  p.proname AS function_name,
  p.prosecdef AS security_definer,
  p.proconfig AS config_settings
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('wines_before_write', 'submit_discharge_session')
ORDER BY p.proname;

-- Verifica: grants anon completi
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('wines', 'discharge_sessions', 'discharge_session_items', 'categories')
  AND grantee = 'anon'
ORDER BY table_name, privilege_type;
