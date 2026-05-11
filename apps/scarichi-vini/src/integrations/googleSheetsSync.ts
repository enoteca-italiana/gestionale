import type { Wine } from '@/domain/types';

/**
 * Adapter neutro per la sincronizzazione con Google Sheets.
 *
 * STATO: non attivo nel flusso runtime principale.
 *
 * Il canale reale di sync DB → Google Sheet è gestito lato Supabase tramite
 * trigger AFTER INSERT/UPDATE/DELETE su `public.wines` e `public.spirits_products`
 * che invocano `integration.notify_google_sheets_wines()` e
 * `integration.notify_google_sheets_spirits()` via webhook HTTP verso Apps Script.
 *
 * Il canale Google Sheet → DB è manuale tramite menu Apps Script
 * (`syncWinesFromSheetToSupabase` / `syncSpiritsFromSheetToSupabase`).
 *
 * Questo file esiste come punto di estensione opzionale lato frontend.
 * Non va rimosso senza una decisione esplicita di prodotto.
 */

export async function syncWineUpsert(_wine: Wine): Promise<void> {
  void _wine;
}

export async function syncWineDelete(_wineId: string): Promise<void> {
  void _wineId;
}

export async function syncSpiritUpsert(_spirit: Wine): Promise<void> {
  void _spirit;
}

export async function syncSpiritDelete(_spiritId: string): Promise<void> {
  void _spiritId;
}
