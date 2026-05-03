import { ConfirmModal } from '@/components/ConfirmModal';

type Props = {
  reset1: boolean;
  reset2: boolean;
  resetPin: string;
  resetPinError: string | null;
  resetBusy: boolean;
  onConfirmReset1: () => void;
  onCancelReset1: () => void;
  onResetPinChange: (v: string) => void;
  onConfirmWithPin: () => void;
  onCancelReset2: () => void;
};

export function ResetModal({
  reset1,
  reset2,
  resetPin,
  resetPinError,
  resetBusy,
  onConfirmReset1,
  onCancelReset1,
  onResetPinChange,
  onConfirmWithPin,
  onCancelReset2
}: Props) {
  return (
    <>
      <ConfirmModal
        open={reset1}
        cardClassName="adminSettingsModalCard"
        overlayClassName="adminSettingsOverlay"
        title="Reset archivio?"
        description="Verrà cancellato l'archivio vini su Supabase. Lo storico sessioni non verrà modificato."
        confirmLabel="Continua"
        cancelLabel="Annulla"
        onConfirm={onConfirmReset1}
        onCancel={onCancelReset1}
      />

      {reset2 ? (
        <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminSettingsModalCard">
            <div className="modalTitle">Conferma reset archivio</div>
            <div className="modalDescription">
              Inserisci il PIN admin per confermare l&apos;eliminazione definitiva
              dell&apos;archivio vini. Lo storico sessioni non verrà toccato.
            </div>
            <div className="mt12">
              <input
                className="input adminInput"
                type="password"
                inputMode="numeric"
                placeholder="Inserisci PIN admin"
                value={resetPin}
                onChange={(e) => onResetPinChange(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  onConfirmWithPin();
                }}
              />
            </div>
            {resetPinError ? <div className="errorText mt10">{resetPinError}</div> : null}
            <div className="modalActions">
              <button
                className="button"
                type="button"
                disabled={resetBusy || resetPin.trim().length === 0}
                onClick={onConfirmWithPin}
              >
                {resetBusy ? 'Verifica…' : 'Sì, reset archivio'}
              </button>
              <button
                className="button buttonSecondary buttonCancel"
                type="button"
                onClick={onCancelReset2}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
