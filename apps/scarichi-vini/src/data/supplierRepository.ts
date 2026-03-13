import type { Wine } from '@/domain/types';

const SUPPLIER_STORAGE_KEY = 'scarichi.suppliers.v1';

function normalizeSupplier(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function loadManagedSuppliers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SUPPLIER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === 'string' ? normalizeSupplier(item) : ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveManagedSuppliers(suppliers: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SUPPLIER_STORAGE_KEY, JSON.stringify(suppliers));
}

export function listSupplierOptions(wines: Wine[], managedSuppliers: string[]): string[] {
  const entries: string[] = [...managedSuppliers];
  wines.forEach((wine) => {
    if (wine.supplier?.trim()) entries.push(wine.supplier.trim());
  });

  const seen = new Map<string, string>();
  entries.forEach((entry) => {
    const normalized = normalizeSupplier(entry);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) seen.set(key, normalized);
  });

  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, 'it', { sensitivity: 'base' })
  );
}

export function upsertManagedSupplier(
  rawValue: string,
  existingSuppliers: string[],
  managedSuppliers: string[]
) {
  const normalized = normalizeSupplier(rawValue);
  if (!normalized) {
    return { created: null as string | null, managedNext: managedSuppliers, changed: false };
  }

  const existing = existingSuppliers.find((item) => item.toLowerCase() === normalized.toLowerCase());
  if (existing) {
    return { created: existing, managedNext: managedSuppliers, changed: false };
  }

  const managedNext = [...managedSuppliers, normalized];
  saveManagedSuppliers(managedNext);
  return { created: normalized, managedNext, changed: true };
}
