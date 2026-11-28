// Small, dependency-free SVG charts for the Projects module.
import { useEffect, useRef, useState } from 'react';
import { fmtShort } from './pmUtils';

// Width of the chart's container, so text stays the same size at any screen width.
function useWidth(initial) {
  const ref = useRef(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => { const cw = Math.round(entries[0].contentRect.width); if (cw > 0) setW(cw); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export function ProgressRing({ value, size = 96, stroke = 9, color = '#16264a', label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <svg className="pm-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(v * 100)}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8edf5" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${c * v} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .6s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="pm-ring-val" style={{ fontSize: size * 0.24 }}>{Math.round(v * 100)}%</text>
      {label && <text x="50%" y={size / 2 + size * 0.2} textAnchor="middle" className="pm-ring-lbl">{label}</text>}
    </svg>
  );
}

// Burn-up: completed work vs the ideal pace vs total scope.
export function BurnUpChart({ points, total }) {
  const [ref, W] = useWidth(640);
  return <div ref={ref} className="pm-chart-box">{points && points.length >= 2 && total ? <BurnUpSvg points={points} total={total} W={Math.max(280, W)} /> : <div className="pm-chart-empty">Not enough data yet — the chart fills in as tasks get done.</div>}</div>;
}
function BurnUpSvg({ points, total, W }) {
  const H = 240, L = 40, R = 14, T = 14, B = 30;
  const x = (i) => L + (i / (points.length - 1)) * (W - L - R);
  const y = (v) => T + (1 - v / total) * (H - T - B);
  const ideal = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.ideal).toFixed(1)}`).join(' ');
  const doneIdx = points.map((p, i) => (p.done === null ? -1 : i)).filter(i => i >= 0);
  const done = doneIdx.map((i, k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(points[i].done).toFixed(1)}`).join(' ');
  const area = doneIdx.length ? `${done} L${x(doneIdx[doneIdx.length - 1]).toFixed(1)},${y(0)} L${x(doneIdx[0]).toFixed(1)},${y(0)} Z` : '';
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const lastDone = doneIdx.length ? points[doneIdx[doneIdx.length - 1]] : null;
  return (
    <svg className="pm-chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Burn-up chart">
      {ticks.map(t => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(total * t)} y2={y(total * t)} className="pm-grid" />
          <text x={L - 6} y={y(total * t)} className="pm-axis" textAnchor="end" dominantBaseline="central">{Math.round(t * 100)}%</text>
        </g>
      ))}
      {labelIdx.map(i => <text key={i} x={x(i)} y={H - 10} className="pm-axis" textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>{fmtShort(points[i].date)}</text>)}
      <path d={ideal} className="pm-line-ideal" />
      {area && <path d={area} className="pm-area-done" />}
      {done && <path d={done} className="pm-line-done" />}
      {lastDone && <circle cx={x(doneIdx[doneIdx.length - 1])} cy={y(lastDone.done)} r="4.5" className="pm-dot-done" />}
    </svg>
  );
}

// Horizontal stacked bars: rows = [{label, parts:[{value, color, title}]}]
export function StackedBars({ rows, unit = '' }) {
  const max = Math.max(1, ...rows.map(r => r.parts.reduce((s, p) => s + p.value, 0)));
  if (!rows.length) return <div className="pm-chart-empty">Nothing to show yet.</div>;
  return (
    <div className="pm-bars">
      {rows.map(r => {
        const sum = r.parts.reduce((s, p) => s + p.value, 0);
        return (
          <div key={r.label} className="pm-bar-row">
            <span className="pm-bar-lbl" title={r.label}>{r.label}</span>
            <div className="pm-bar-track">
              {r.parts.map((p, i) => p.value > 0 && (
                <span key={i} className="pm-bar-seg" title={`${p.title}: ${p.value}${unit}`} style={{ width: `${(p.value / max) * 100}%`, background: p.color }} />
              ))}
            </div>
            <span className="pm-bar-val">{sum}{unit}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Donut({ parts, size = 150, label }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const r = 54, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="pm-donut-wrap">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label={label || 'Breakdown'}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eef2f7" strokeWidth="18" />
        {total > 0 && parts.map((p, i) => {
          const len = (p.value / total) * c;
          const el = <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="18" strokeDasharray={`${Math.max(0, len - 1.5)} ${c}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />;
          acc += len;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" className="pm-donut-val">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="pm-donut-lbl">{label || 'tasks'}</text>
      </svg>
      <ul className="pm-legend">
        {parts.map(p => <li key={p.label}><i style={{ background: p.color }} />{p.label}<b>{p.value}</b></li>)}
      </ul>
    </div>
  );
}

// KPI line: actual history vs a target line.
export function KpiChart({ kpi }) {
  const W = 300, H = 120, L = 8, R = 8, T = 12, B = 20;
  const hist = (kpi.history || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const target = Number(kpi.target) || 0;
  if (!hist.length) return <div className="pm-chart-empty sm">No numbers logged yet.</div>;
  const max = Math.max(target, ...hist.map(h => Number(h.value) || 0)) * 1.08 || 1;
  const x = (i) => (hist.length === 1 ? W / 2 : L + (i / (hist.length - 1)) * (W - L - R));
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const path = hist.map((h, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(Number(h.value) || 0).toFixed(1)}`).join(' ');
  return (
    <svg className="pm-chart pm-kpi-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${kpi.name} over time`}>
      {target > 0 && <><line x1={L} x2={W - R} y1={y(target)} y2={y(target)} className="pm-line-target" /><text x={W - R} y={y(target) - 4} textAnchor="end" className="pm-axis">target</text></>}
      <path d={path} className="pm-line-done" />
      {hist.map((h, i) => <circle key={i} cx={x(i)} cy={y(Number(h.value) || 0)} r="3.5" className="pm-dot-done"><title>{fmtShort(h.date)}: {h.value}</title></circle>)}
      <text x={L} y={H - 5} className="pm-axis">{fmtShort(hist[0].date)}</text>
      {hist.length > 1 && <text x={W - R} y={H - 5} textAnchor="end" className="pm-axis">{fmtShort(hist[hist.length - 1].date)}</text>}
    </svg>
  );
}
