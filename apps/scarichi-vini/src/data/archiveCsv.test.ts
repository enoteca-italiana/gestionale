import { describe, expect, it } from 'vitest';
import { parseArchiveCsv } from '@/data/archiveCsv';

describe('archiveCsv normalization', () => {
  it('normalizes case rules on csv import', () => {
    const raw = [
      'Categoria;Nome;Produttore;Provenienza;Fornitore;Quantita',
      'rossi;grenache amabile 00906;hugel;languedoc;import vini europa;12'
    ].join('\n');

    const rows = parseArchiveCsv(raw);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.category).toBe('ROSSI');
    expect(rows[0]?.name).toBe('GRENACHE AMABILE 00906');
    expect(rows[0]?.producer).toBe('Hugel');
    expect(rows[0]?.origin).toBe('LANGUEDOC');
    expect(rows[0]?.supplier).toBe('Import Vini Europa');
  });
});
