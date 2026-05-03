import { ConfirmModal } from '@/components/ConfirmModal';

type Props = {
  open: boolean;
  busy: boolean;
  pwdError: string | null;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  canChange: boolean;
  passwordConfirmOpen: boolean;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmNewPasswordChange: (v: string) => void;
  onClose: () => void;
  onRequestConfirm: () => void;
  onConfirm: () => void;
  onCancelConfirm: () => void;
};

export function PasswordModal({
  open,
  busy,
  pwdError,
  currentPassword,
  newPassword,
  confirmNewPassword,
  canChange,
  passwordConfirmOpen,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onClose,
  onRequestConfirm,
  onConfirm,
  onCancelConfirm
}: Props) {
  return (
    <>
      {open ? (
        <div className="modalOverlay adminSettingsOverlay" role="dialog" aria-modal="true">
          <div className="modalCard adminSettingsModalCard">
            <div className="modalTitle">Aggiorna password admin</div>
            <div className="modalDescription">Inserisci password attuale e nuova password.</div>

            <div className="mt12">
              <input
                className="input adminInput"
                type="password"
                placeholder="Password attuale"
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
              />
            </div>
            <div className="mt10">
              <input
                className="input adminInput"
                type="password"
                placeholder="Nuova password"
                value={newPassword}
                onChange={(e) => {
                  onNewPasswordChange(e.target.value);
                }}
              />
            </div>
            <div className="mt10">
              <input
                className="input adminInput"
                type="password"
                placeholder="Conferma nuova password"
                value={confirmNewPassword}
                onChange={(e) => {
                  onConfirmNewPasswordChange(e.target.value);
                }}
              />
            </div>

            {pwdError ? <div className="errorText mt10">{pwdError}</div> : null}

            <div className="modalActions">
              <button
                className="button"
                type="button"
                disabled={!canChange || busy}
                onClick={onRequestConfirm}
              >
                Conferma modifica
              </button>
              <button
                className="button buttonSecondary buttonCancel"
                type="button"
                onClick={() => {
                  if (busy) return;
                  onClose();
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={passwordConfirmOpen}
        cardClassName="adminSettingsModalCard"
        overlayClassName="adminSettingsOverlay"
        title="Confermare aggiornamento password?"
        description="La password admin verrà modificata con il nuovo valore inserito."
        confirmLabel={busy ? 'Aggiornamento…' : 'Sì, aggiorna password'}
        cancelLabel="Annulla"
        onConfirm={onConfirm}
        onCancel={onCancelConfirm}
      />
    </>
  );
}
