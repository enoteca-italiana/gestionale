import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type InlineStickyAddSelectProps = {
  value: string;
  options: string[];
  addLabel: string;
  onChange: (nextValue: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  ariaLabel: string;
  disabled?: boolean;
};

export function InlineStickyAddSelect({
  value,
  options,
  addLabel,
  onChange,
  onAdd,
  onCancel,
  ariaLabel,
  disabled
}: InlineStickyAddSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
      onCancel();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      onCancel();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onCancel, open]);

  return (
    <div className="archiveInlineSelectRoot" ref={rootRef}>
      <button
        className="archiveInlineCategorySelect archiveInlineSelectButton"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span className="archiveInlineSelectText">{value || '—'}</span>
        <ChevronDown size={14} strokeWidth={2} />
      </button>
      {open ? (
        <div className="archiveInlineSelectMenu" role="listbox" aria-label={ariaLabel}>
          <button
            className="archiveInlineSelectAdd"
            type="button"
            onClick={() => {
              setOpen(false);
              onAdd();
            }}
            disabled={disabled}
          >
            {addLabel}
          </button>
          <div className="archiveInlineSelectOptions">
            <button
              className={`archiveInlineSelectOption ${value === '' ? 'archiveInlineSelectOptionActive' : ''}`}
              type="button"
              onClick={() => {
                setOpen(false);
                onChange('');
              }}
              disabled={disabled}
            >
              —
            </button>
            {options.map((option) => (
              <button
                key={option}
                className={`archiveInlineSelectOption ${
                  value === option ? 'archiveInlineSelectOptionActive' : ''
                }`}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onChange(option);
                }}
                disabled={disabled}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
