import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { loadDb } from '@/data/localDb';
import { sha256Base64 } from '@/pages/admin/crypto';
import { storageKeys } from '@/pages/admin/storage';
import {
  deleteSupabaseCategory,
  listCategoryOptions,
  listSupabaseCategories,
  loadManagedCategories,
  removeManagedCategory,
  renameManagedCategory,
  renameSupabaseCategory,
  upsertManagedCategory,
  upsertSupabaseCategory
} from '@/data/categoryRepository';
import {
  listOriginOptions,
  loadManagedOrigins,
  removeManagedOrigin,
  renameManagedOrigin,
  upsertManagedOrigin
} from '@/data/originRepository';
import {
  listProducerOptions,
  loadManagedProducers,
  removeManagedProducer,
  renameManagedProducer,
  upsertManagedProducer
} from '@/data/producerRepository';
import { normalizeOrigin } from '@/domain/normalizeOrigin';
import { normalizeWineCategory, normalizeWineProducer } from '@/domain/normalizeWineText';
import { listWines, renameWineRegistryValue, type WineRegistryField } from '@/data/wineRepository';
import type { Wine } from '@/domain/types';

export type RegistryKind = WineRegistryField;
export type RegistrySortDir = 'az' | 'za';

export type DeleteTarget = { kind: RegistryKind; value: string } | null;
export type EditingState = { kind: RegistryKind; original: string; draft: string } | null;
export type CreatingState = { kind: RegistryKind; draft: string } | null;
export type DeletePinState = { open: boolean; pin: string; error: string | null };

type RegistryManagerCacheSnapshot = {
  wines: Wine[];
  managedCategories: string[];
  managedOrigins: string[];
  managedProducers: string[];
  supabaseCategories: string[];
  updatedAt: number;
};

export const LIST_RENDER_BATCH = 180;
export const REGISTRY_KINDS: RegistryKind[] = ['category', 'producer', 'origin'];

export const KIND_LABEL: Record<RegistryKind, string> = {
  category: 'Categorie',
  producer: 'Produttori',
  origin: 'Provenienze'
};

export const KIND_PLACEHOLDER: Record<RegistryKind, string> = {
  category: 'Nuova categoria',
  producer: 'Nuovo produttore',
  origin: 'Nuova provenienza'
};

const DELETED_REGISTRY_VALUE = '';
const REGISTRY_MANAGER_CACHE_TTL_MS = 60_000;
let registryManagerCache: RegistryManagerCacheSnapshot | null = null;

export function normalizeByKind(kind: RegistryKind, value: string): string {
  if (kind === 'category') return normalizeWineCategory(value);
  if (kind === 'producer') return normalizeWineProducer(value);
  return normalizeOrigin(value);
}

function readFieldByKind(wine: Wine, kind: RegistryKind): string {
  if (kind === 'category') return wine.category ?? '';
  if (kind === 'producer') return wine.producer ?? '';
  return wine.origin ?? '';
}

const INITIAL_QUERY_BY_KIND: Record<RegistryKind, string> = {
  category: '',
  producer: '',
  origin: ''
};

const INITIAL_VISIBLE_BY_KIND: Record<RegistryKind, number> = {
  category: LIST_RENDER_BATCH,
  producer: LIST_RENDER_BATCH,
  origin: LIST_RENDER_BATCH
};

const INITIAL_SORT_BY_KIND: Record<RegistryKind, RegistrySortDir> = {
  category: 'az',
  producer: 'az',
  origin: 'az'
};

export function useRegistryManager() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [managedCategories, setManagedCategories] = useState<string[]>([]);
  const [managedOrigins, setManagedOrigins] = useState<string[]>([]);
  const [managedProducers, setManagedProducers] = useState<string[]>([]);
  const [supabaseCategories, setSupabaseCategories] = useState<string[]>([]);
  const [activeKind, setActiveKind] = useState<RegistryKind | null>(null);
  const [queryByKind, setQueryByKind] =
    useState<Record<RegistryKind, string>>(INITIAL_QUERY_BY_KIND);
  const [visibleByKind, setVisibleByKind] =
    useState<Record<RegistryKind, number>>(INITIAL_VISIBLE_BY_KIND);
  const [sortByKind, setSortByKind] =
    useState<Record<RegistryKind, RegistrySortDir>>(INITIAL_SORT_BY_KIND);
  const [editing, setEditing] = useState<EditingState>(null);
  const [renameConfirmOpen, setRenameConfirmOpen] = useState(false);
  const [creating, setCreating] = useState<CreatingState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [deletePin, setDeletePin] = useState<DeletePinState>({
    open: false,
    pin: '',
    error: null
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const applyRegistrySnapshot = useCallback((snapshot: RegistryManagerCacheSnapshot) => {
    setWines(snapshot.wines);
    setManagedCategories(snapshot.managedCategories);
    setManagedOrigins(snapshot.managedOrigins);
    setManagedProducers(snapshot.managedProducers);
    setSupabaseCategories(snapshot.supabaseCategories);
  }, []);

  const loadManagedRegistries = useCallback(() => {
    return {
      managedCategories: loadManagedCategories(),
      managedOrigins: loadManagedOrigins(),
      managedProducers: loadManagedProducers()
    };
  }, []);

  const refreshRegistries = useCallback(async () => {
    const nextManaged = loadManagedRegistries();
    setManagedCategories(nextManaged.managedCategories);
    setManagedOrigins(nextManaged.managedOrigins);
    setManagedProducers(nextManaged.managedProducers);
    const nextSupabaseCategories = await listSupabaseCategories();
    setSupabaseCategories(nextSupabaseCategories);
    return { ...nextManaged, supabaseCategories: nextSupabaseCategories };
  }, [loadManagedRegistries]);

  const refreshPageData = useCallback(async () => {
    setError(null);
    const now = Date.now();
    const localInventory = loadDb().inventory;
    const localManaged = loadManagedRegistries();
    const hasWarmLocalData =
      localInventory.length > 0 ||
      localManaged.managedCategories.length > 0 ||
      localManaged.managedOrigins.length > 0 ||
      localManaged.managedProducers.length > 0;

    const hasFreshCache =
      registryManagerCache !== null &&
      now - registryManagerCache.updatedAt <= REGISTRY_MANAGER_CACHE_TTL_MS;

    if (hasFreshCache && registryManagerCache) {
      applyRegistrySnapshot(registryManagerCache);
      setLoading(false);
      return;
    } else {
      setWines(localInventory);
      setManagedCategories(localManaged.managedCategories);
      setManagedOrigins(localManaged.managedOrigins);
      setManagedProducers(localManaged.managedProducers);
      if (hasWarmLocalData) setLoading(false);
    }

    try {
      const [remoteRegistries, remoteWines] = await Promise.all([refreshRegistries(), listWines()]);
      setWines(remoteWines);
      registryManagerCache = {
        wines: remoteWines,
        managedCategories: remoteRegistries.managedCategories,
        managedOrigins: remoteRegistries.managedOrigins,
        managedProducers: remoteRegistries.managedProducers,
        supabaseCategories: remoteRegistries.supabaseCategories,
        updatedAt: Date.now()
      };
    } catch (err) {
      console.error('[AdminRegistryManager] refresh failed', err);
      if (!hasWarmLocalData) setError('Impossibile caricare i dati. Riprova.');
    } finally {
      setLoading(false);
    }
  }, [applyRegistrySnapshot, loadManagedRegistries, refreshRegistries]);

  useEffect(() => {
    void refreshPageData();
  }, [refreshPageData]);

  useEffect(() => {
    if (
      wines.length === 0 &&
      managedCategories.length === 0 &&
      managedOrigins.length === 0 &&
      managedProducers.length === 0 &&
      supabaseCategories.length === 0
    ) {
      return;
    }
    registryManagerCache = {
      wines,
      managedCategories,
      managedOrigins,
      managedProducers,
      supabaseCategories,
      updatedAt: Date.now()
    };
  }, [wines, managedCategories, managedOrigins, managedProducers, supabaseCategories]);

  const categories = useMemo(
    () => listCategoryOptions(wines, [...managedCategories, ...supabaseCategories]),
    [managedCategories, supabaseCategories, wines]
  );
  const producers = useMemo(
    () => listProducerOptions(wines, managedProducers),
    [managedProducers, wines]
  );
  const origins = useMemo(() => listOriginOptions(wines, managedOrigins), [managedOrigins, wines]);

  const optionsByKind = useMemo(
    () =>
      ({
        category: categories,
        producer: producers,
        origin: origins
      }) satisfies Record<RegistryKind, string[]>,
    [categories, origins, producers]
  );

  const usageByKind = useMemo(() => {
    const output: Record<RegistryKind, Map<string, number>> = {
      category: new Map(),
      producer: new Map(),
      origin: new Map()
    };
    for (const wine of wines) {
      for (const kind of REGISTRY_KINDS) {
        const normalized = normalizeByKind(kind, readFieldByKind(wine, kind));
        if (!normalized) continue;
        const key = normalized.toLowerCase();
        output[kind].set(key, (output[kind].get(key) ?? 0) + 1);
      }
    }
    return output;
  }, [wines]);

  const getUsageCount = useCallback(
    (kind: RegistryKind, value: string) => {
      const normalized = normalizeByKind(kind, value);
      if (!normalized) return 0;
      return usageByKind[kind].get(normalized.toLowerCase()) ?? 0;
    },
    [usageByKind]
  );

  const activeQuery = useDeferredValue(activeKind ? queryByKind[activeKind] : '');
  const activeValues = useMemo(() => {
    if (!activeKind) return [];
    const query = activeQuery.trim().toLowerCase();
    const source = optionsByKind[activeKind];
    if (!query) return source;
    return source.filter((value) => value.toLowerCase().includes(query));
  }, [activeKind, activeQuery, optionsByKind]);

  const activeSortedValues = useMemo(() => {
    if (!activeKind) return [];
    if (sortByKind[activeKind] === 'az') return activeValues;
    return [...activeValues].reverse();
  }, [activeKind, activeValues, sortByKind]);

  const activeVisibleCount = activeKind ? visibleByKind[activeKind] : 0;
  const renderedValues = useMemo(
    () => activeSortedValues.slice(0, activeVisibleCount),
    [activeSortedValues, activeVisibleCount]
  );
  const hasMoreRows = renderedValues.length < activeSortedValues.length;

  useEffect(() => {
    if (!activeKind || !hasMoreRows) return;
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setVisibleByKind((prev) => ({
          ...prev,
          [activeKind]: prev[activeKind] + LIST_RENDER_BATCH
        }));
      },
      { rootMargin: '180px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [activeKind, hasMoreRows, renderedValues.length, activeSortedValues.length]);

  const openKindDetail = (kind: RegistryKind) => {
    setEditing(null);
    setRenameConfirmOpen(false);
    setCreating(null);
    setDeleteTarget(null);
    setDeletePin({ open: false, pin: '', error: null });
    setError(null);
    setActiveKind(kind);
    setVisibleByKind((prev) => ({ ...prev, [kind]: LIST_RENDER_BATCH }));
  };

  const closeKindDetail = () => {
    setEditing(null);
    setRenameConfirmOpen(false);
    setCreating(null);
    setDeleteTarget(null);
    setDeletePin({ open: false, pin: '', error: null });
    setError(null);
    setActiveKind(null);
  };

  const toggleVoiceSort = useCallback(() => {
    if (!activeKind) return;
    setSortByKind((prev) => ({
      ...prev,
      [activeKind]: prev[activeKind] === 'az' ? 'za' : 'az'
    }));
    setVisibleByKind((prev) => ({ ...prev, [activeKind]: LIST_RENDER_BATCH }));
  }, [activeKind]);

  const startCreate = useCallback((kind: RegistryKind) => {
    setEditing(null);
    setError(null);
    setCreating({ kind, draft: '' });
  }, []);

  const saveCreate = useCallback(async () => {
    if (!creating || actionBusy) return;
    const kind = creating.kind;
    const normalized = normalizeByKind(kind, creating.draft);
    if (!normalized) {
      setError('Inserisci un valore valido.');
      return;
    }
    const alreadyExists = optionsByKind[kind].some(
      (entry) => normalizeByKind(kind, entry).toLowerCase() === normalized.toLowerCase()
    );
    if (alreadyExists) {
      setError('Voce già presente.');
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      if (kind === 'category') {
        upsertManagedCategory(normalized, optionsByKind.category, loadManagedCategories());
        await upsertSupabaseCategory(normalized);
      } else if (kind === 'producer') {
        upsertManagedProducer(normalized, optionsByKind.producer, loadManagedProducers());
      } else {
        upsertManagedOrigin(normalized, optionsByKind.origin, loadManagedOrigins());
      }
      await refreshRegistries();
      setCreating(null);
      setQueryByKind((prev) => ({ ...prev, [kind]: '' }));
      setVisibleByKind((prev) => ({ ...prev, [kind]: LIST_RENDER_BATCH }));
    } catch (err) {
      console.error('[AdminRegistryManager] saveCreate failed', err);
      setError('Inserimento non riuscito. Riprova.');
    } finally {
      setActionBusy(false);
    }
  }, [actionBusy, creating, optionsByKind, refreshRegistries]);

  const saveRename = useCallback(async () => {
    if (!editing || actionBusy) return;
    const normalizedOriginal = normalizeByKind(editing.kind, editing.original);
    const normalizedDraft = normalizeByKind(editing.kind, editing.draft);
    if (!normalizedDraft) {
      setError('Inserisci un valore valido.');
      return;
    }
    if (normalizedOriginal.toLowerCase() === normalizedDraft.toLowerCase()) {
      setRenameConfirmOpen(false);
      setEditing(null);
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      await renameWineRegistryValue(editing.kind, normalizedOriginal, normalizedDraft);
      if (editing.kind === 'category') {
        renameManagedCategory(normalizedOriginal, normalizedDraft, loadManagedCategories());
        await renameSupabaseCategory(normalizedOriginal, normalizedDraft);
      } else if (editing.kind === 'producer') {
        renameManagedProducer(normalizedOriginal, normalizedDraft, loadManagedProducers());
      } else {
        renameManagedOrigin(normalizedOriginal, normalizedDraft, loadManagedOrigins());
      }
      await refreshRegistries();
      setWines(loadDb().inventory);
      setRenameConfirmOpen(false);
      setEditing(null);
    } catch (err) {
      console.error('[AdminRegistryManager] saveRename failed', err);
      setError('Modifica non riuscita. Riprova.');
    } finally {
      setActionBusy(false);
    }
  }, [actionBusy, editing, refreshRegistries]);

  const requestRenameConfirm = useCallback(() => {
    if (!editing || actionBusy) return;
    const normalizedDraft = normalizeByKind(editing.kind, editing.draft);
    if (!normalizedDraft) {
      setError('Inserisci un valore valido.');
      return;
    }
    setRenameConfirmOpen(true);
  }, [actionBusy, editing]);

  const requestDelete = useCallback(
    (kind: RegistryKind, value: string) => {
      if (actionBusy) return;
      setEditing(null);
      setCreating(null);
      setDeletePin({ open: false, pin: '', error: null });
      setDeleteTarget({ kind, value });
    },
    [actionBusy]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || actionBusy) return;
    setActionBusy(true);
    setError(null);
    try {
      const normalizedDeleteValue = normalizeByKind(deleteTarget.kind, deleteTarget.value);
      const normalizedZeroValue = normalizeByKind(deleteTarget.kind, DELETED_REGISTRY_VALUE);
      if (
        normalizedDeleteValue &&
        normalizedDeleteValue.toLowerCase() !== normalizedZeroValue.toLowerCase()
      ) {
        await renameWineRegistryValue(
          deleteTarget.kind,
          normalizedDeleteValue,
          DELETED_REGISTRY_VALUE
        );
      }
      if (deleteTarget.kind === 'category') {
        removeManagedCategory(deleteTarget.value, loadManagedCategories());
        await deleteSupabaseCategory(deleteTarget.value);
      } else if (deleteTarget.kind === 'producer') {
        removeManagedProducer(deleteTarget.value, loadManagedProducers());
      } else {
        removeManagedOrigin(deleteTarget.value, loadManagedOrigins());
      }
      await refreshRegistries();
      setWines(loadDb().inventory);
      setDeleteTarget(null);
      setDeletePin({ open: false, pin: '', error: null });
      if (creating && creating.kind === deleteTarget.kind) setCreating(null);
    } catch (err) {
      console.error('[AdminRegistryManager] confirmDelete failed', err);
      setError('Eliminazione non riuscita. Riprova.');
    } finally {
      setActionBusy(false);
    }
  }, [actionBusy, creating, deleteTarget, refreshRegistries]);

  const confirmDeleteWithPin = useCallback(async () => {
    if (!deleteTarget || actionBusy) return;
    setDeletePin((prev) => ({ ...prev, error: null }));
    const storedHash = localStorage.getItem(storageKeys.adminPasswordHash);
    if (!storedHash) {
      setDeletePin((prev) => ({ ...prev, error: 'PIN admin non disponibile' }));
      return;
    }
    const pinHash = await sha256Base64(deletePin.pin.trim());
    if (pinHash !== storedHash) {
      setDeletePin((prev) => ({ ...prev, error: 'PIN non corretto' }));
      return;
    }
    await confirmDelete();
  }, [actionBusy, confirmDelete, deletePin.pin, deleteTarget]);

  const handleSearchChange = useCallback(
    (next: string) => {
      if (!activeKind) return;
      setQueryByKind((prev) => ({ ...prev, [activeKind]: next }));
      setVisibleByKind((prev) => ({ ...prev, [activeKind]: LIST_RENDER_BATCH }));
    },
    [activeKind]
  );

  const handleCreatingDraftChange = useCallback((next: string) => {
    setCreating((prev) => (prev ? { ...prev, draft: next } : prev));
  }, []);

  const handleEditingDraftChange = useCallback((next: string) => {
    setEditing((prev) => (prev ? { ...prev, draft: next } : prev));
  }, []);

  const cancelRename = useCallback(() => {
    if (actionBusy) return;
    setRenameConfirmOpen(false);
    setEditing(null);
  }, [actionBusy]);

  const cancelRenameConfirm = useCallback(() => {
    if (actionBusy) return;
    setRenameConfirmOpen(false);
  }, [actionBusy]);

  const cancelCreating = useCallback(() => setCreating(null), []);

  const handlePinChange = useCallback((next: string) => {
    setDeletePin((prev) => ({ ...prev, pin: next, error: null }));
  }, []);

  const cancelDeletePin = useCallback(
    () => setDeletePin({ open: false, pin: '', error: null }),
    []
  );

  const proceedToDeletePin = useCallback(() => {
    if (actionBusy) return;
    setDeletePin({ open: true, pin: '', error: null });
  }, [actionBusy]);

  const cancelDeleteWarning = useCallback(() => {
    if (actionBusy) return;
    setDeleteTarget(null);
  }, [actionBusy]);

  const startEditValue = useCallback(
    (value: string) => {
      if (!activeKind || actionBusy) return;
      setRenameConfirmOpen(false);
      setEditing({ kind: activeKind, original: value, draft: value });
    },
    [actionBusy, activeKind]
  );

  return {
    activeKind,
    queryByKind,
    sortByKind,
    editing,
    renameConfirmOpen,
    creating,
    deleteTarget,
    deletePin,
    error,
    loading,
    actionBusy,
    loadMoreRef,
    renderedValues,
    hasMoreRows,
    getUsageCount,
    openKindDetail,
    closeKindDetail,
    toggleVoiceSort,
    startCreate,
    saveCreate,
    saveRename,
    requestRenameConfirm,
    requestDelete,
    confirmDeleteWithPin,
    handleSearchChange,
    handleCreatingDraftChange,
    handleEditingDraftChange,
    cancelRename,
    cancelRenameConfirm,
    cancelCreating,
    handlePinChange,
    cancelDeletePin,
    proceedToDeletePin,
    cancelDeleteWarning,
    startEditValue
  };
}
