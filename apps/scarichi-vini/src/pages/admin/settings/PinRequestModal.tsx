type Props = {
  open: boolean;
  appPinRequiredOnStart: boolean;
  appPinRequiredForSettings: boolean;
  onSetPinOnStart: (value: boolean) => void;
  onSetPinForSettings: (value: boolean) => void;
  onClose: () => void;
};

export function PinRequestModal({
  open,
  appPinRequiredOnStart,
  appPinRequiredForSettings,
  onSetPinOnStart,
  onSetPinForSettings,
  onClose
}: Props) {
  if (!open) return null;

  return (
    <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
      <div className="modalCard adminSettingsModalCard">
        <div className="modalTitle centered">Richiesta PIN</div>
        <div className="adminPinToggleBlock">
          <div className="modalDescription centered">Richiesta PIN all&apos;avvio App.</div>
          <div className="adminPinSegmented" role="group" aria-label="Richiesta PIN avvio app">
            <button
              className={`adminPinSegment adminPinSegmentOn ${appPinRequiredOnStart ? 'isActive' : ''}`}
              type="button"
              onClick={() => {
                if (appPinRequiredOnStart) return;
                onSetPinOnStart(true);
              }}
            >
              ON
            </button>
            <button
              className={`adminPinSegment adminPinSegmentOff ${!appPinRequiredOnStart ? 'isActive' : ''}`}
              type="button"
              onClick={() => {
                if (!appPinRequiredOnStart) return;
                onSetPinOnStart(false);
              }}
            >
              OFF
            </button>
          </div>
        </div>
        <div className="adminPinToggleBlock">
          <div className="modalDescription centered">Richiesta PIN pagina IMPOSTAZIONI.</div>
          <div
            className="adminPinSegmented"
            role="group"
            aria-label="Richiesta PIN accesso pagina impostazioni"
          >
            <button
              className={`adminPinSegment adminPinSegmentOn ${appPinRequiredForSettings ? 'isActive' : ''}`}
              type="button"
              onClick={() => {
                if (appPinRequiredForSettings) return;
                onSetPinForSettings(true);
              }}
            >
              ON
            </button>
            <button
              className={`adminPinSegment adminPinSegmentOff ${!appPinRequiredForSettings ? 'isActive' : ''}`}
              type="button"
              onClick={() => {
                if (!appPinRequiredForSettings) return;
                onSetPinForSettings(false);
              }}
            >
              OFF
            </button>
          </div>
        </div>
        <div className="modalActions adminPinModalActions">
          <button className="button adminPinCloseButton" type="button" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
