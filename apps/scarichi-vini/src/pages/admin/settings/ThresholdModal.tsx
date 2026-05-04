import { ConfirmModal } from '@/components/ConfirmModal';

type Props = {
  entityLabelPlural: string;
  open: boolean;
  thresholdValue: string;
  thresholdError: string | null;
  thresholdConfirm1: boolean;
  thresholdConfirm2: boolean;
  thresholdPin: string;
  thresholdPinError: string | null;
  thresholdBusy: boolean;
  parsedThreshold: number | null;
  onThresholdValueChange: (v: string) => void;
  onRequestConfirm1: () => void;
  onConfirm1: () => void;
  onCancelConfirm1: () => void;
  onThresholdPinChange: (v: string) => void;
  onConfirmWithPin: () => void;
  onCancelConfirm2: () => void;
  onClose: () => void;
};

export function ThresholdModal({
  entityLabelPlural,
  open,
  thresholdValue,
  thresholdError,
  thresholdConfirm1,
  thresholdConfirm2,
  thresholdPin,
  thresholdPinError,
  thresholdBusy,
  parsedThreshold,
  onThresholdValueChange,
  onRequestConfirm1,
  onConfirm1,
  onCancelConfirm1,
  onThresholdPinChange,
  onConfirmWithPin,
  onCancelConfirm2,
  onClose
}: Props) {
  return (
    <>
      {open ? (
        <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminSettingsModalCard">
            <div className="modalTitle">Imposta soglia unica</div>
            <div className="modalDescription">
              {`Imposta un valore soglia uguale per tutti gli ${entityLabelPlural} in archivio.`}
            </div>
            <div className="mt12">
              <input
                className="input adminInput"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="Inserisci soglia"
                value={thresholdValue}
                onChange={(e) => onThresholdValueChange(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  onRequestConfirm1();
                }}
              />
            </div>
            {thresholdError ? <div className="errorText mt10">{thresholdError}</div> : null}
            <div className="modalActions">
              <button className="button" type="button" onClick={onRequestConfirm1}>
                Applica soglia
              </button>
              <button
                className="button buttonSecondary buttonCancel"
                type="button"
                onClick={onClose}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={thresholdConfirm1}
        cardClassName="adminSettingsModalCard"
        overlayClassName="adminSettingsOverlay"
        title="Confermare nuova soglia?"
        description={`Confermando, tutti gli ${entityLabelPlural} in archivio verranno aggiornati con la soglia ${
          parsedThreshold ?? 'selezionata'
        }.`}
        confirmLabel="Continua"
        cancelLabel="Annulla"
        onConfirm={onConfirm1}
        onCancel={onCancelConfirm1}
      />

      {thresholdConfirm2 ? (
        <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminSettingsModalCard">
            <div className="modalTitle">Conferma modifica soglie</div>
            <div className="modalDescription">
              {`Inserisci il PIN admin per applicare la soglia a tutti gli ${entityLabelPlural} in archivio.`}
            </div>
            <div className="mt12">
              <input
                className="input adminInput"
                type="password"
                inputMode="numeric"
                placeholder="Inserisci PIN admin"
                value={thresholdPin}
                onChange={(e) => onThresholdPinChange(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  onConfirmWithPin();
                }}
              />
            </div>
            {thresholdPinError ? <div className="errorText mt10">{thresholdPinError}</div> : null}
            <div className="modalActions">
              <button
                className="button"
                type="button"
                disabled={thresholdBusy || thresholdPin.trim().length === 0}
                onClick={onConfirmWithPin}
              >
                {thresholdBusy ? 'Verifica…' : 'Sì, applica soglia'}
              </button>
              <button
                className="button buttonSecondary buttonCancel"
                type="button"
                onClick={onCancelConfirm2}
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
