import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  KIND_LABEL,
  KIND_PLACEHOLDER,
  REGISTRY_KINDS,
  useRegistryManager
} from '@/pages/admin/useRegistryManager';

export function AdminRegistryManager() {
  const {
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
  } = useRegistryManager();

  return (
    <div
      className={`adminRegistrySection${!activeKind ? ' adminRegistrySectionHub' : ''}${
        activeKind ? ' adminRegistrySectionDetail' : ''
      }`}
    >
      <div className="title centered mt12">
        {activeKind ? KIND_LABEL[activeKind] : 'Gestione voci filtri'}
      </div>

      {error ? <div className="errorText centered mt10">{error}</div> : null}

      {loading ? (
        <div className="card mt12 centered">
          <div className="subtle">Caricamento...</div>
        </div>
      ) : activeKind ? (
        <div className="card adminRegistryDetailCard mt12">
          <div className="adminRegistryDetailBar">
            <button
              className="button buttonAuto adminRegistryBackButton"
              type="button"
              onClick={closeKindDetail}
            >
              Torna ai filtri
            </button>
            <button
              className="button buttonAuto"
              type="button"
              disabled={actionBusy}
              onClick={() => startCreate(activeKind)}
            >
              Nuova voce
            </button>
          </div>

          <div className="mt10">
            <input
              className="input adminRegistrySearchInput"
              value={queryByKind[activeKind]}
              placeholder="Cerca..."
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          {creating?.kind === activeKind ? (
            <div className="adminRegistryCreateBar mt10">
              <input
                className="input adminRegistrySearchInput"
                value={creating.draft}
                placeholder={KIND_PLACEHOLDER[activeKind]}
                onChange={(event) => handleCreatingDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  void saveCreate();
                }}
                autoFocus
              />
              <button
                className="adminRegistryActionButton adminRegistryActionButtonSave"
                type="button"
                disabled={actionBusy}
                onClick={() => void saveCreate()}
              >
                Aggiungi
              </button>
              <button
                className="adminRegistryActionButton"
                type="button"
                disabled={actionBusy}
                onClick={cancelCreating}
              >
                Annulla
              </button>
            </div>
          ) : null}

          <div className="adminRegistryTableWrap mt10">
            <div className="adminRegistryTableHead">
              <div className="adminRegistryVoiceHeader">
                <div className="archiveSortableHeaderCell">
                  <span>Voce</span>
                  <button
                    className="archiveSortButton"
                    type="button"
                    onClick={toggleVoiceSort}
                    aria-label={
                      sortByKind[activeKind] === 'az' ? 'Ordina da Z a A' : 'Ordina da A a Z'
                    }
                    title={sortByKind[activeKind] === 'za' ? 'Ordine Z-A' : 'Ordine A-Z'}
                  >
                    {sortByKind[activeKind] === 'za' ? (
                      <ArrowUpNarrowWide size={14} strokeWidth={2.2} />
                    ) : (
                      <ArrowDownWideNarrow size={14} strokeWidth={2.2} />
                    )}
                  </button>
                </div>
              </div>
              <div>Utilizzo</div>
              <div>Azioni</div>
            </div>

            <div className="adminRegistryTableBody">
              {renderedValues.length === 0 ? (
                <div className="subtle centered adminRegistryEmpty">Nessuna voce</div>
              ) : (
                renderedValues.map((value) => {
                  const usageCount = getUsageCount(activeKind, value);
                  return (
                    <div key={`${activeKind}_${value}`} className="adminRegistryTableRow">
                      <div className="adminRegistryCellValue">
                        <div className="adminRegistryValue">{value}</div>
                      </div>
                      <div className="adminRegistryCellUsage">{usageCount} vini</div>
                      <div className="adminRegistryCellActions">
                        <button
                          className="adminRegistryActionButton"
                          type="button"
                          disabled={actionBusy}
                          onClick={() => startEditValue(value)}
                        >
                          Modifica
                        </button>
                        <button
                          className="adminRegistryActionButton adminRegistryActionButtonDanger"
                          type="button"
                          disabled={actionBusy}
                          onClick={() => requestDelete(activeKind, value)}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              {hasMoreRows ? (
                <div ref={loadMoreRef} className="adminRegistryLoadMoreSentinel" />
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="list mt12">
          {REGISTRY_KINDS.map((kind) => (
            <button
              key={kind}
              className="button adminHomeAction"
              type="button"
              onClick={() => openKindDetail(kind)}
            >
              {KIND_LABEL[kind]}
            </button>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(editing)}
        title="Modifica voce"
        cardClassName="adminRegistryEditModalCard"
        description={
          editing ? (
            <div className="adminRegistryEditModalContent">
              <div className="errorText centered">
                La modifica verrà applicata a tutti i vini associati!
              </div>
              <input
                className="input adminRegistrySearchInput mt10"
                value={editing.draft}
                placeholder={KIND_PLACEHOLDER[editing.kind]}
                onChange={(event) => handleEditingDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  requestRenameConfirm();
                }}
                autoFocus
              />
            </div>
          ) : undefined
        }
        confirmLabel={actionBusy ? 'Salvataggio...' : 'Conferma'}
        cancelLabel="Annulla"
        onConfirm={requestRenameConfirm}
        onCancel={cancelRename}
      />

      <ConfirmModal
        open={Boolean(editing) && renameConfirmOpen}
        title="Confermare modifica?"
        description={
          editing ? (
            <div className="subtle centered">
              La modifica della voce verrà applicata a tutti i vini associati.
            </div>
          ) : undefined
        }
        confirmLabel={actionBusy ? 'Salvataggio...' : 'Sì, conferma'}
        cancelLabel="Annulla"
        onConfirm={() => void saveRename()}
        onCancel={cancelRenameConfirm}
      />

      <ConfirmModal
        open={Boolean(deleteTarget) && !deletePin.open}
        title="ATTENZIONE!"
        cardClassName="adminRegistryDeleteWarningCard"
        description={
          deleteTarget ? (
            <div className="adminRegistryDeleteWarningText">
              <div>Stai eliminando la voce dell&apos;archivio!</div>
              <div className="mt6 adminRegistryDeleteWarningBody">
                Eliminando la voce, i vini resteranno in archivio,
                <br />
                ma il valore del campo verrà impostato vuoto (-).
              </div>
            </div>
          ) : undefined
        }
        confirmLabel="Continua"
        cancelLabel="Annulla"
        onConfirm={proceedToDeletePin}
        onCancel={cancelDeleteWarning}
      />

      {deleteTarget && deletePin.open ? (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminRegistryDeletePinCard">
            <div className="modalTitle centered">Conferma eliminazione con PIN</div>
            <div className="modalDescription centered">
              Inserisci il PIN admin per confermare l&apos;eliminazione della voce{' '}
              <strong>{deleteTarget.value}</strong>.
            </div>
            <input
              className="input mt12 centered"
              type="password"
              inputMode="numeric"
              placeholder="Inserisci PIN admin"
              value={deletePin.pin}
              onChange={(event) => handlePinChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                void confirmDeleteWithPin();
              }}
            />
            {deletePin.error ? (
              <div className="errorText centered mt10">{deletePin.error}</div>
            ) : null}
            <div className="modalActions">
              <button
                className="button"
                type="button"
                disabled={actionBusy || deletePin.pin.trim().length === 0}
                onClick={() => void confirmDeleteWithPin()}
              >
                {actionBusy ? 'Eliminazione...' : 'Conferma eliminazione'}
              </button>
              <button
                className="button buttonSecondary buttonCancel"
                type="button"
                disabled={actionBusy}
                onClick={cancelDeletePin}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
