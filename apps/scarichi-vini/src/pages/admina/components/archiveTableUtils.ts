import type { Wine } from '@/domain/types';

export const TOTAL_COLUMNS = 11;
export const BASE_ROWS = 14;
export const ROW_HEIGHT_ESTIMATE = 33;
export const TABLE_OFFSET = 340;
export const TABLE_RENDER_BATCH = 40;
export const TABLE_SORT_COLLATOR = new Intl.Collator('it', { sensitivity: 'base' });
export const MONEY_FORMATTER = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR'
});

export type SortKey = 'category' | 'name' | 'producer' | 'origin';
export type SortDir = 'az' | 'za';
export type InlineSelectField = 'category' | 'producer' | 'origin';
export const DEFAULT_SORT_STATE: { key: SortKey; dir: SortDir } = { key: 'name', dir: 'az' };

export function formatMoney(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return MONEY_FORMATTER.format(value);
}

export function formatText(value?: string) {
  return value && value.trim().length > 0 ? value : '—';
}

export function hasTextValue(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

export function formatYear(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  if (!normalized) return '';
  if (normalized.toUpperCase() === 'NV') return '';
  return normalized;
}

export function computeWarehouse(wine: Wine) {
  if (wine.purchasePrice === undefined) return undefined;
  return Number((wine.purchasePrice * Math.max(0, wine.qty)).toFixed(2));
}

export function computeMargin(wine: Wine) {
  if (wine.purchasePrice === undefined || wine.salePrice === undefined) return undefined;
  return Number((wine.salePrice - wine.purchasePrice).toFixed(2));
}

export function formatPriceInput(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '';
  return String(value).replace('.', ',');
}

export function normalizePriceInput(rawValue: string): string {
  const cleaned = rawValue.replace(/[^\d.,]/g, '');
  if (!cleaned) return '';
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const separatorIndex = Math.max(lastComma, lastDot);
  if (separatorIndex === -1) return cleaned.replace(/[.,]/g, '');

  const intPart = cleaned.slice(0, separatorIndex).replace(/[.,]/g, '');
  const decimalPart = cleaned
    .slice(separatorIndex + 1)
    .replace(/[.,]/g, '')
    .slice(0, 2);
  return `${intPart},${decimalPart}`;
}

export function parsePriceInput(rawValue: string): number | undefined {
  const normalized = rawValue.replace(',', '.').trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Number(parsed.toFixed(2));
}
