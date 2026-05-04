import type { AppDomain } from '@/app/appDomainContext';

export function StartSessionDomainModal({
  open,
  activeDomain,
  onSelect,
  onClose
}: {
  open: boolean;
  activeDomain: AppDomain;
  onSelect: (domain: AppDomain) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard homeStartDomainModal">
        <div className="modalTitle">Nuovo Scarico</div>
        <div className="homeStartDomainChoices mt14">
          <button
            className={`homeStartDomainChoice homeStartDomainChoiceWine ${
              activeDomain === 'wine' ? 'homeStartDomainChoiceCurrent' : ''
            }`}
            type="button"
            onClick={() => onSelect('wine')}
          >
            <span className="homeStartDomainChoiceTitle">Vini</span>
          </button>
          <button
            className={`homeStartDomainChoice homeStartDomainChoiceSpirits ${
              activeDomain === 'spirits' ? 'homeStartDomainChoiceCurrent' : ''
            }`}
            type="button"
            onClick={() => onSelect('spirits')}
          >
            <span className="homeStartDomainChoiceTitle">Spirits</span>
          </button>
        </div>
        <div className="modalActions">
          <button className="button buttonSecondary buttonCancel" type="button" onClick={onClose}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
