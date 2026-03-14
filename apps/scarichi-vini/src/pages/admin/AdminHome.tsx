export type AdminRootSection = 'sessions' | 'password' | 'import' | 'reset';

export function AdminHome({ onOpen }: { onOpen: (section: AdminRootSection) => void }) {
  return (
    <div className="adminCenterSection">
      <div className="list mt12">
        <button className="button adminHomeAction" type="button" onClick={() => onOpen('sessions')}>
          Sessioni
        </button>
        <button className="button adminHomeAction" type="button" onClick={() => onOpen('password')}>
          Aggiorna password
        </button>
        <button className="button adminHomeAction" type="button" onClick={() => onOpen('import')}>
          Importa archivio
        </button>
        <button className="button adminHomeAction" type="button" onClick={() => onOpen('reset')}>
          Reset totale
        </button>
      </div>
    </div>
  );
}
