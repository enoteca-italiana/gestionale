import { ConfirmModal } from '@/components/ConfirmModal';

export function SessionConfirmModal({
  open,
  sessionCount,
  onCancel,
  onConfirm
}: {
  open: boolean;
  sessionCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      open={open}
      title="Confermare sessione?"
      description={
        <div>
          <div>
            Confermi l’invio di <strong>{sessionCount}</strong> bottiglie?
          </div>
        </div>
      }
      confirmLabel="Conferma"
      cancelLabel="Annulla"
      onConfirm={() => {
        onConfirm();
      }}
      onCancel={onCancel}
    />
  );
}
