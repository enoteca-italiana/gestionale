import type { Wine } from '@/domain/types';

type StockEditorModalProps = {
  wine: Wine;
  qty: number;
  busy: boolean;
  onQtyChange: (updater: (prev: number) => number) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function StockEditorModal({
  wine,
  qty,
  busy,
  onQtyChange,
  onClose,
  onConfirm
}: StockEditorModalProps) {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard homeStockModalCard summaryEditModal">
        <button
          className="summaryEditClose"
          type="button"
          aria-label="Chiudi"
          onClick={onClose}
          disabled={busy}
        >
          ×
        </button>
        <div className="modalTitle centered">{wine.name}</div>
        <div className="subtle centered mt6 homeStockQtyLabel">
          GIACENZA ATTUALE: {Math.max(0, Math.round(Number(wine.qty) || 0))}
        </div>

        <div className="summaryEditControls mt14">
          <button
            className="resultControlButton resultControlButtonSecondary"
            type="button"
            disabled={busy || qty <= 0}
            onClick={() => onQtyChange((prev) => Math.max(0, prev - 1))}
          >
            -
          </button>
          <div className="resultControlValue">{Math.max(0, Math.round(qty))}</div>
          <button
            className="resultControlButton"
            type="button"
            disabled={busy || qty >= 999}
            onClick={() => onQtyChange((prev) => Math.min(999, prev + 1))}
          >
            +
          </button>
        </div>

        <div className="summaryEditActionsSingle mt14">
          <button
            className="button buttonConfirmSoft"
            type="button"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Salvataggio…' : 'Conferma Nuova Giacenza'}
          </button>
        </div>
      </div>
    </div>
  );
}
