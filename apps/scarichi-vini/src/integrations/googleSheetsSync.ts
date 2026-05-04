import type { Wine } from '@/domain/types';

/**
 * Placeholder integration for Google Sheets synchronization.
 * In produzione dovrà chiamare le API/automation reali.
 */
export async function syncWineUpsert(_wine: Wine): Promise<void> {
  void _wine;
  // TODO: implementare chiamata reale alle API Google Sheets.
  return Promise.resolve();
}

export async function syncWineDelete(_wineId: string): Promise<void> {
  void _wineId;
  // TODO: implementare chiamata reale alle API Google Sheets.
  return Promise.resolve();
}

export async function syncSpiritUpsert(_spirit: Wine): Promise<void> {
  void _spirit;
  // TODO: implementare chiamata reale alle API Google Sheets per il tab Spirits.
  return Promise.resolve();
}

export async function syncSpiritDelete(_spiritId: string): Promise<void> {
  void _spiritId;
  // TODO: implementare chiamata reale alle API Google Sheets per il tab Spirits.
  return Promise.resolve();
}
