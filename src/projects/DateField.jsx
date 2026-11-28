import { useEffect, useRef, useState } from 'react';

const valid = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '') && Number(v.slice(0, 4)) >= 2000 && Number(v.slice(0, 4)) <= 2100;

// Date input that:
//  • has a visible 📅 button that opens the calendar picker,
//  • never wipes what you're typing (the browser reports "" or year 0002 while a date is
//    half-typed — those are kept locally and only real dates are passed on).
export default function DateField({ value, onChange, label, className = '', min, max, invalid }) {
  const ref = useRef(null);
  const [local, setLocal] = useState(value || '');
  useEffect(() => { if (valid(value) && value !== local) setLocal(value); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const open = () => {
    const el = ref.current;
    if (!el) return;
    try { if (el.showPicker) { el.showPicker(); return; } } catch (e) { /* not allowed here */ }
    el.focus();
  };
  return (
    <span className={`pm-date ${invalid ? 'bad' : ''} ${className}`}>
      <input
        ref={ref}
        type="date"
        value={local}
        min={min}
        max={max}
        aria-label={label}
        onChange={(e) => { const v = e.target.value; setLocal(v); if (valid(v)) onChange(v); }}
        onBlur={() => { if (!valid(local) && valid(value)) setLocal(value); }}
      />
      <button type="button" className="pm-date-btn" onClick={open} aria-label={`Open calendar${label ? ' — ' + label : ''}`} tabIndex={-1}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
    </span>
  );
}
