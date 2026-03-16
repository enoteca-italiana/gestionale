import { describe, expect, it } from 'vitest';
import { normalizeOrigin } from '@/domain/normalizeOrigin';
import {
  normalizeWineCategory,
  normalizeWineName,
  normalizeWineProducer,
  normalizeWineSupplier
} from '@/domain/normalizeWineText';

describe('normalizeWineText', () => {
  it('forces uppercase for categoria, nome e provenienza', () => {
    expect(normalizeWineCategory('  rossi  fermi ')).toBe('ROSSI FERMI');
    expect(normalizeWineName('  grenache amabile 00906 ')).toBe('GRENACHE AMABILE 00906');
    expect(normalizeOrigin('  Languedoc  france ')).toBe('LANGUEDOC FRANCE');
  });

  it('forces initial uppercase for produttore e fornitore', () => {
    expect(normalizeWineProducer('  hUgEL  ')).toBe('Hugel');
    expect(normalizeWineSupplier("  d'angelo  import  ")).toBe("D'Angelo Import");
  });
});
