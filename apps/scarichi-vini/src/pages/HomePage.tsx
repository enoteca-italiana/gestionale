import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Logo } from '@/components/Logo';
import { Toast } from '@/components/Toast';
import type { AppDomain } from '@/app/appDomainContext';
import { ResultsList } from '@/pages/home/ResultsList';
import { SessionConfirmModal } from '@/pages/home/SessionConfirmModal';
import { StartSessionDomainModal } from '@/pages/home/StartSessionDomainModal';
import { StockEditorModal } from '@/pages/home/StockEditorModal';
import { SummaryList } from '@/pages/home/SummaryList';
import { useHomePage } from '@/pages/home/useHomePage';
import { useAppDomain } from '@/app/appDomainContext';
import { RefreshCcw } from 'lucide-react';

export function HomePage({
  onIntroVisibilityChange
}: {
  onIntroVisibilityChange?: (visible: boolean) => void;
}) {
  const { activeDomain, setActiveDomain } = useAppDomain();
  const [startDomainModalOpen, setStartDomainModalOpen] = useState(false);
  const [pendingStartDomain, setPendingStartDomain] = useState<AppDomain | null>(null);
  const {
    showIntro,
    introVisible,
    online,
    pendingQueueCount,
    sessionOpen,
    sessionCount,
    query,
    setQuery,
    stockFilter,
    setStockFilter,
    visibleWines,
    getSessionQty,
    showResults,
    forceRefreshBusy,
    sessionList,
    inventory,
    incrementItem,
    decrementItem,
    deleteItem,
    addToSession,
    editingStockWine,
    editingStockQty,
    stockSaveBusy,
    setEditingStockQty,
    closeStockEditor,
    confirmStockSave,
    openStockEditor,
    confirmOpen,
    setConfirmOpen,
    leaveSessionConfirmOpen,
    toast,
    setToast,
    confirmSubmit,
    startSession,
    submitSession,
    confirmLeaveSession,
    cancelLeaveSession,
    forceRefreshHome
  } = useHomePage({ onIntroVisibilityChange, domain: activeDomain });

  useEffect(() => {
    if (!pendingStartDomain) return;
    if (sessionOpen) {
      setPendingStartDomain(null);
      return;
    }
    if (activeDomain !== pendingStartDomain) return;
    startSession();
    setPendingStartDomain(null);
  }, [activeDomain, pendingStartDomain, sessionOpen, startSession]);

  const requestStartSession = () => {
    if (sessionOpen) return;
    setStartDomainModalOpen(true);
  };

  const handleSelectStartDomain = (domain: AppDomain) => {
    setStartDomainModalOpen(false);
    if (sessionOpen) return;
    if (activeDomain === domain) {
      startSession();
      return;
    }
    setPendingStartDomain(domain);
    setActiveDomain(domain);
  };

  if (showIntro) {
    return (
      <div className="container introLayout">
        <div className={`introCenter ${introVisible ? 'introVisible' : ''}`}>
          <Logo variant="intro" />
        </div>
      </div>
    );
  }

  return (
    <div className="container homeSessionContainer">
      <div className="homeHeader">
        <Logo variant="header" />
      </div>

      {!online ? (
        <div className="banner">
          Offline: {pendingQueueCount > 0 ? `${pendingQueueCount} sessioni in coda. ` : ''}
          Le conferme verranno inviate appena torni online.
        </div>
      ) : null}

      <div className="mt12 homeSessionActionRow">
        <button
          className="homeForceRefreshButton"
          type="button"
          aria-label="Refresh forzato app"
          title="Refresh forzato app"
          onClick={() => void forceRefreshHome()}
          disabled={forceRefreshBusy}
        >
          <RefreshCcw
            size={18}
            strokeWidth={2.2}
            className={forceRefreshBusy ? 'homeForceRefreshIconSpinning' : ''}
          />
        </button>
        {sessionOpen ? (
          <button
            className={`button homeSessionMainButton ${
              sessionCount > 0 ? 'buttonSessionConfirmActive' : 'buttonSessionConfirmInactive'
            }`}
            type="button"
            onClick={confirmSubmit}
            disabled={sessionCount <= 0}
          >
            Conferma Scarico
          </button>
        ) : (
          <button
            className="button homeSessionMainButton"
            type="button"
            onClick={requestStartSession}
          >
            Nuovo Scarico
          </button>
        )}
        {!sessionOpen ? (
          <div className="homeDomainSwitch" role="group" aria-label="Seleziona modalità">
            <button
              type="button"
              className={`homeDomainSwitchButton ${activeDomain === 'wine' ? 'homeDomainSwitchButtonActive' : ''}`}
              onClick={() => setActiveDomain('wine')}
              aria-pressed={activeDomain === 'wine'}
            >
              Vini
            </button>
            <button
              type="button"
              className={`homeDomainSwitchButton ${
                activeDomain === 'spirits' ? 'homeDomainSwitchButtonActive' : ''
              }`}
              onClick={() => setActiveDomain('spirits')}
              aria-pressed={activeDomain === 'spirits'}
            >
              Spirits
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt12 searchRow">
        <input
          className="input inputSearch inputSearchCompact"
          placeholder={activeDomain === 'wine' ? 'Cerca vino...' : 'Cerca spirit...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className={`searchStockButton searchStockButtonThreshold ${
            stockFilter === 'threshold' ? 'searchStockButtonActive' : ''
          }`}
          type="button"
          onClick={() => setStockFilter((prev) => (prev === 'threshold' ? 'all' : 'threshold'))}
          aria-pressed={stockFilter === 'threshold' ? 'true' : 'false'}
        >
          Soglia
        </button>
        <button
          className={`searchStockButton searchStockButtonOut ${
            stockFilter === 'out' ? 'searchStockButtonActive' : ''
          }`}
          type="button"
          onClick={() => setStockFilter((prev) => (prev === 'out' ? 'all' : 'out'))}
          aria-pressed={stockFilter === 'out' ? 'true' : 'false'}
        >
          Esaurito
        </button>
      </div>

      <div className={sessionOpen ? 'homeResultsArea homeResultsAreaSession' : 'homeResultsArea'}>
        {showResults ? (
          <ResultsList
            domain={activeDomain}
            wines={visibleWines}
            sessionOpen={sessionOpen}
            interactive={sessionOpen}
            onSelectWine={!sessionOpen ? openStockEditor : undefined}
            getSessionQty={sessionOpen ? getSessionQty : undefined}
            onIncrement={sessionOpen ? (wineId) => addToSession(wineId, 1) : undefined}
            onDecrement={sessionOpen ? (wineId) => decrementItem(wineId) : undefined}
          />
        ) : null}
      </div>

      {sessionOpen ? (
        <SummaryList
          domain={activeDomain}
          items={sessionList}
          wines={inventory}
          onIncrement={incrementItem}
          onDecrement={decrementItem}
          onDelete={deleteItem}
        />
      ) : null}

      {editingStockWine ? (
        <StockEditorModal
          wine={editingStockWine}
          qty={editingStockQty}
          busy={stockSaveBusy}
          onQtyChange={setEditingStockQty}
          onClose={closeStockEditor}
          onConfirm={() => void confirmStockSave()}
        />
      ) : null}

      <SessionConfirmModal
        open={confirmOpen}
        sessionCount={sessionCount}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => submitSession()}
      />

      <ConfirmModal
        open={leaveSessionConfirmOpen}
        title="Abbandonare sessione in corso?"
        description="Sei sicuro che vuoi abbandonare la sessione in corso?"
        confirmLabel="Conferma"
        cancelLabel="Annulla"
        onConfirm={confirmLeaveSession}
        onCancel={cancelLeaveSession}
      />

      <StartSessionDomainModal
        open={startDomainModalOpen}
        activeDomain={activeDomain}
        onSelect={handleSelectStartDomain}
        onClose={() => setStartDomainModalOpen(false)}
      />

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
