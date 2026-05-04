import { useState } from 'react';
import type { AppDomain } from '@/app/appDomain';
import type { Wine } from '@/domain/types';

type UseStockEditorOptions = {
  domain: AppDomain;
  sessionOpen: boolean;
  onToast: (message: string) => void;
  onRefreshInventory: () => Promise<unknown>;
};

let wineRepositoryPromise: Promise<typeof import('@/data/wineRepository')> | null = null;
let spiritsRepositoryPromise: Promise<typeof import('@/data/spiritsRepository')> | null = null;

async function loadWineRepository() {
  wineRepositoryPromise ??= import('@/data/wineRepository');
  return wineRepositoryPromise;
}

async function loadSpiritsRepository() {
  spiritsRepositoryPromise ??= import('@/data/spiritsRepository');
  return spiritsRepositoryPromise;
}

export function useStockEditor({
  domain,
  sessionOpen,
  onToast,
  onRefreshInventory
}: UseStockEditorOptions) {
  const [editingStockWine, setEditingStockWine] = useState<Wine | null>(null);
  const [editingStockQty, setEditingStockQty] = useState(0);
  const [stockSaveBusy, setStockSaveBusy] = useState(false);

  const openStockEditor = (wine: Wine) => {
    if (sessionOpen) return;
    setEditingStockWine(wine);
    setEditingStockQty(Math.max(0, Math.round(Number(wine.qty) || 0)));
  };

  const closeStockEditor = () => {
    if (stockSaveBusy) return;
    setEditingStockWine(null);
  };

  const confirmStockSave = async () => {
    if (!editingStockWine || stockSaveBusy) return;
    const nextQty = Math.max(0, Math.min(999, Math.round(editingStockQty)));
    const currentQty = Math.max(0, Math.round(Number(editingStockWine.qty) || 0));
    if (nextQty === currentQty) {
      closeStockEditor();
      return;
    }
    setStockSaveBusy(true);
    try {
      if (domain === 'wine') {
        const wineRepository = await loadWineRepository();
        await wineRepository.updateWine({
          id: editingStockWine.id,
          category: editingStockWine.category ?? '',
          name: editingStockWine.name,
          age: editingStockWine.age ?? '',
          producer: editingStockWine.producer,
          origin: editingStockWine.origin,
          threshold: editingStockWine.threshold,
          purchasePrice: editingStockWine.purchasePrice,
          salePrice: editingStockWine.salePrice,
          vintage: editingStockWine.vintage ?? '',
          qty: nextQty,
          notes: editingStockWine.notes ?? ''
        });
      } else {
        const spiritsRepository = await loadSpiritsRepository();
        await spiritsRepository.updateSpirit({
          id: editingStockWine.id,
          category: editingStockWine.category ?? '',
          name: editingStockWine.name,
          producer: editingStockWine.producer,
          purchasePrice: editingStockWine.purchasePrice,
          salePrice: editingStockWine.salePrice,
          qty: nextQty
        });
      }
      await onRefreshInventory();
      onToast('Giacenza aggiornata');
      setEditingStockWine(null);
    } catch (error) {
      console.error('[HomePage] update stock qty failed', error);
      onToast('Errore aggiornamento giacenza');
    } finally {
      setStockSaveBusy(false);
    }
  };

  return {
    editingStockWine,
    editingStockQty,
    stockSaveBusy,
    openStockEditor,
    closeStockEditor,
    confirmStockSave,
    setEditingStockQty
  };
}
