import { ConfirmModal } from '@/components/ConfirmModal';
import type { ArchiveCsvWineInput } from '@/data/archiveCsv';

type ImportMode = 'replace' | 'append';

type Props = {
  open: boolean;
  importFile: File | null;
  importRows: ArchiveCsvWineInput[] | null;
  importBusy: boolean;
  importError: string | null;
  importOk: string | null;
  importConfirm: boolean;
  importPinConfirm: boolean;
  importPin: string;
  importPinError: string | null;
  importMode: ImportMode;
  onFileChange: (file: File | null) => void;
  onPrepareImport: () => void;
  onImportModeChange: (mode: ImportMode) => void;
  onConfirmImportMode: () => void;
  onCancelImportConfirm: () => void;
  onImportPinChange: (v: string) => void;
  onConfirmWithPin: () => void;
  onCancelPinConfirm: () => void;
  onClose: () => void;
};

export function ImportModal({
  open,
  importFile,
  importRows,
  importBusy,
  importError,
  importOk,
  importConfirm,
  importPinConfirm,
  importPin,
  importPinError,
  importMode,
  onFileChange,
  onPrepareImport,
  onImportModeChange,
  onConfirmImportMode,
  onCancelImportConfirm,
  onImportPinChange,
  onConfirmWithPin,
  onCancelPinConfirm,
  onClose
}: Props) {
  return (
    <>
      {open ? (
        <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminSettingsModalCard">
            <div className={`modalTitle ${importOk ? 'centered' : ''}`}>Importa archivio CSV</div>
            {!importOk ? (
              <div className="modalDescription">
                La scelta tra aggiunta o sostituzione completa verrà richiesta succesivamente.
              </div>
            ) : null}

            {!importOk ? (
              <>
                <div className="mt12">
                  <input
                    className="input adminInput"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      onFileChange(file);
                    }}
                  />
                </div>
                {importFile ? (
                  <div className="subtle mt8">File selezionato: {importFile.name}</div>
                ) : null}
              </>
            ) : null}
            {importError ? <div className="errorText mt10">{importError}</div> : null}
            {importOk ? <div className="okText mt10 centered">{importOk}</div> : null}

            <div className="modalActions">
              {importOk ? (
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    if (importBusy) return;
                    onClose();
                  }}
                >
                  Chiudi
                </button>
              ) : (
                <>
                  <button
                    className={`button adminImportArchiveButton ${
                      importFile && !importBusy
                        ? 'adminImportArchiveButtonReady'
                        : 'adminImportArchiveButtonIdle'
                    }`}
                    type="button"
                    disabled={!importFile || importBusy}
                    onClick={onPrepareImport}
                  >
                    Importa archivio
                  </button>
                  <button
                    className="button buttonSecondary buttonCancel"
                    type="button"
                    onClick={() => {
                      if (importBusy) return;
                      onClose();
                    }}
                  >
                    Annulla
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={importConfirm}
        cardClassName="adminSettingsModalCard adminImportModeConfirmCard"
        overlayClassName="adminSettingsOverlay"
        title="IMPORTANTE!"
        description={
          <div className="adminImportModeConfirmContent">
            <div className="adminImportModeConfirmMessage">
              Scegli come importare il file CSV
              {importRows ? ` (${importRows.length} record)` : ''}:
            </div>
            <div className="adminImportModeGroup" role="radiogroup" aria-label="Modalità import">
              <label className="adminImportModeOption">
                <input
                  type="radio"
                  name="admin-import-mode-confirm"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => onImportModeChange('append')}
                />
                <span>Aggiungi record ad archivio esistente</span>
              </label>
              <label className="adminImportModeOption">
                <input
                  type="radio"
                  name="admin-import-mode-confirm"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => onImportModeChange('replace')}
                />
                <span>Sostituisci intero archivio con il CSV</span>
              </label>
            </div>
          </div>
        }
        confirmLabel={importBusy ? 'Import in corso…' : 'Continua'}
        cancelLabel="Annulla"
        onConfirm={() => {
          if (importBusy) return;
          onConfirmImportMode();
        }}
        onCancel={() => {
          if (importBusy) return;
          onCancelImportConfirm();
        }}
      />

      {importPinConfirm ? (
        <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminSettingsModalCard">
            <div className="modalTitle">Conferma import archivio</div>
            <div className="modalDescription">
              Inserisci il PIN admin per confermare
              {importMode === 'append'
                ? " l'aggiunta del CSV all'archivio esistente."
                : " la sostituzione completa dell'archivio con il CSV."}
            </div>
            <div className="mt12">
              <input
                className="input adminInput"
                type="password"
                inputMode="numeric"
                placeholder="Inserisci PIN admin"
                value={importPin}
                onChange={(e) => onImportPinChange(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  onConfirmWithPin();
                }}
              />
            </div>
            {importPinError ? <div className="errorText mt10">{importPinError}</div> : null}
            <div className="modalActions">
              <button
                className="button"
                type="button"
                disabled={importBusy || importPin.trim().length === 0}
                onClick={onConfirmWithPin}
              >
                {importBusy ? 'Verifica…' : 'Conferma import'}
              </button>
              <button
                className="button buttonSecondary buttonCancel"
                type="button"
                onClick={() => {
                  if (importBusy) return;
                  onCancelPinConfirm();
                }}
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
