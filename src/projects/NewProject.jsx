import { useMemo, useState } from 'react';
import { BUILTIN_TEMPLATES, PROJECT_ICONS, PROJECT_COLORS, FORMATS, EFFORTS, suggestAssignee } from './templates';
import { addDaysYmd, diffDays, fmtShort, todayYmd, parseYmd } from './pmUtils';

// Turns an existing project into a reusable template definition.
export function projectToDefinition(project, tasks, team) {
  const key = project.keyDate || tasks.reduce((m, t) => (t.targetDate > m ? t.targetDate : m), '') || todayYmd();
  const ordered = tasks.slice().sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.targetDate).localeCompare(String(b.targetDate)));
  const idx = {};
  ordered.forEach((t, i) => { idx[String(t.id)] = i; });
  const leadName = (team.find(m => m.id === project.leadId) || {}).name;
  const roleOf = (names) => {
    const first = String(names || '').split(',')[0].trim();
    if (!first || first === leadName) return 'lead';
    const m = team.find(x => x.name === first);
    const r = (m && m.role) || '';
    if (/video|edit/i.test(r)) return 'video';
    if (/design/i.test(r)) return 'design';
    if (/writer|script/i.test(r)) return 'writer';
    if (/\bpr\b/i.test(r)) return 'pr';
    if (/social/i.test(r)) return 'social';
    return 'lead';
  };
  return {
    keyDateLabel: project.keyDateLabel || 'Key date',
    phases: (project.phases || []).map(p => ({ id: p.id, name: p.name, color: p.color })),
    kpis: (project.kpis || []).map(k => ({ name: k.name, unit: k.unit || '' })),
    tasks: ordered.map(t => ({
      t: t.taskDetails, ph: t.phase, s: diffDays(key, t.start || t.targetDate), d: diffDays(key, t.targetDate), e: t.effort || 'M',
      dep: (t.deps || []).map(d => idx[String(d)]).filter(v => v !== undefined), role: roleOf(t.assignedTo), fmt: t.format || '', pr: t.priority || 'Medium',
      ch: t.channel && t.channel !== 'Other' ? t.channel : '',
    })),
  };
}

function templateFromCustom(c) {
  const d = c.definition || {};
  return { id: c.id, name: c.name, icon: c.icon || '📁', color: c.color || '#2563eb', accent: '#e8eefc', tagline: c.description || 'Saved from a real project',
    description: c.description || '', keyDateLabel: d.keyDateLabel || 'Key date', kpis: d.kpis || [], phases: d.phases || [], tasks: d.tasks || [], custom: true, createdBy: c.createdBy };
}

function spanOf(tpl) {
  if (!tpl.tasks.length) return 0;
  const min = Math.min(...tpl.tasks.map(t => t.s));
  const max = Math.max(...tpl.tasks.map(t => t.d));
  return max - min + 1;
}
const weeksLabel = (days) => (days >= 14 ? `${Math.round(days / 7)} weeks` : days ? `${days} days` : 'Flexible');

function PhaseStrip({ tpl, tall }) {
  if (!tpl.tasks.length) return <div className={`np-strip ${tall ? 'tall' : ''}`}>{tpl.phases.map(p => <span key={p.id} style={{ flex: 1, background: p.color }} />)}</div>;
  const min = Math.min(...tpl.tasks.map(t => t.s));
  const max = Math.max(...tpl.tasks.map(t => t.d));
  const span = Math.max(1, max - min + 1);
  return (
    <div className={`np-strip-abs ${tall ? 'tall' : ''}`}>
      {tpl.phases.map((p, i) => {
        const ts = tpl.tasks.filter(t => t.ph === p.id);
        if (!ts.length) return null;
        const a = Math.min(...ts.map(t => t.s)) - min, b = Math.max(...ts.map(t => t.d)) - min + 1;
        return <span key={p.id} title={p.name} style={{ left: `${(a / span) * 100}%`, width: `${Math.max(3, ((b - a) / span) * 100)}%`, top: tall ? i * 14 : 0, background: p.color }} />;
      })}
    </div>
  );
}

export default function NewProject({ me, team, channelGroups, customTemplates, pastProjects, pastTasks, onCancel, onCreate, busy }) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [tpl, setTpl] = useState(null);
  const [form, setForm] = useState(null);
  const [plan, setPlan] = useState([]);
  const [err, setErr] = useState('');

  const customs = useMemo(() => (customTemplates || []).map(templateFromCustom), [customTemplates]);
  const activeTeam = team.filter(m => m.active !== false);
  const brands = (channelGroups && channelGroups.groupOrder && channelGroups.groupOrder.length) ? channelGroups.groupOrder : ['AG', '7C', 'TFT'];
  const allChannels = useMemo(() => {
    const out = [];
    (channelGroups?.groupOrder || []).forEach(g => (channelGroups.groups[g] || []).forEach(c => out.push(c)));
    return out;
  }, [channelGroups]);

  const choose = (t) => {
    const key = addDaysYmd(todayYmd(), Math.max(14, t.tasks.length ? -Math.min(...t.tasks.map(x => x.s)) + 3 : 30));
    setTpl(t);
    setForm({
      name: '', icon: t.icon, color: t.color, brand: brands[0] || '', keyDate: key, keyDateLabel: t.keyDateLabel || 'Key date',
      start: t.tasks.length ? addDaysYmd(key, Math.min(...t.tasks.map(x => x.s))) : todayYmd(),
      description: '', leadId: me.id, members: [], kpis: (t.kpis || []).map(k => ({ ...k, target: '' })), qc: true, autoCalendar: true,
    });
    setPreview(null);
    setErr('');
    setStep(2);
  };

  const fromProject = (p) => {
    const def = projectToDefinition(p, pastTasks.filter(t => t.projectId === p.id), team);
    choose({ id: 'copy-' + p.id, name: p.name, icon: p.icon, color: p.color, accent: '#eef2ff', tagline: 'Copy of a past project', description: '', ...def, copiedFrom: p.name });
  };

  const people = useMemo(() => {
    if (!form) return [];
    const ids = [form.leadId, ...form.members.filter(m => m.role !== 'viewer').map(m => m.id)];
    return ids.map(id => activeTeam.find(m => m.id === id)).filter(Boolean);
  }, [form, activeTeam]);
  const leadName = form ? (activeTeam.find(m => m.id === form.leadId) || {}).name || me.name : me.name;

  const buildPlan = () => {
    const rows = tpl.tasks.map((t, i) => ({
      key: 'k' + i, title: t.t, phase: t.ph || (tpl.phases[0] && tpl.phases[0].id), s: t.s, d: t.d,
      start: addDaysYmd(form.keyDate, t.s), due: addDaysYmd(form.keyDate, t.d), effort: t.e || 'M', format: t.fmt || '',
      channel: t.ch || '', priority: t.pr || 'Medium', deps: (t.dep || []).map(j => 'k' + j), assignee: suggestAssignee(t.role, people, leadName), role: t.role,
    }));
    setPlan(rows);
  };

  const goStep3 = () => {
    if (!form.name.trim()) { setErr('Give the project a name.'); return; }
    if (!form.keyDate) { setErr(`Pick the ${form.keyDateLabel.toLowerCase()}.`); return; }
    setErr('');
    buildPlan();
    setStep(3);
  };

  // Moving the key date re-flows every task date (only on the plan step).
  const setKeyDate = (v) => {
    if (!v) return;
    const shift = form.keyDate ? diffDays(form.keyDate, v) : 0;
    setForm(f => ({ ...f, keyDate: v, start: f.start ? addDaysYmd(f.start, shift) : f.start }));
    if (step === 3) setPlan(p => p.map(r => ({ ...r, start: addDaysYmd(r.start, shift), due: addDaysYmd(r.due, shift) })));
  };

  const updRow = (key, patch) => setPlan(p => p.map(r => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = (phase) => setPlan(p => [...p, { key: 'n' + Date.now(), title: '', phase, start: form.keyDate, due: form.keyDate, effort: 'M', format: '', channel: '', priority: 'Medium', deps: [], assignee: leadName }]);

  const create = () => {
    const rows = plan.filter(r => r.title.trim());
    if (!rows.length && tpl.tasks.length) { setErr('Add at least one task.'); return; }
    const bad = rows.find(r => r.due < r.start);
    if (bad) { setErr(`“${bad.title}” ends before it starts.`); return; }
    setErr('');
    const id = 'p' + Date.now().toString(36);
    const project = {
      id, name: form.name.trim(), icon: form.icon, color: form.color, brand: form.brand, template: tpl.copiedFrom ? 'Copy of ' + tpl.copiedFrom : tpl.name,
      start: form.start, keyDate: form.keyDate, keyDateLabel: form.keyDateLabel, leadId: form.leadId,
      members: form.members.filter(m => m.id !== form.leadId), description: form.description.trim(),
      phases: tpl.phases, kpis: form.kpis.filter(k => k.name.trim()).map((k, i) => ({ id: 'k' + i, name: k.name.trim(), unit: k.unit || '', target: Number(k.target) || 0, history: [] })),
      brief: { objective: form.description.trim() }, links: [], settings: { qc: form.qc, autoCalendar: form.autoCalendar },
    };
    const tasks = rows.map(r => ({ key: r.key, taskDetails: r.title.trim(), assignedTo: [r.assignee], targetDate: r.due, start: r.start, phase: r.phase,
      effort: r.effort, deps: r.deps.filter(k => rows.some(x => x.key === k)), priority: r.priority, channel: r.channel || 'Other', format: r.format }));
    onCreate(project, tasks);
  };

  const toggleMember = (id) => setForm(f => {
    const has = f.members.find(m => m.id === id);
    return { ...f, members: has ? f.members.filter(m => m.id !== id) : [...f.members, { id, role: 'member' }] };
  });
  const setMemberRole = (id, role) => setForm(f => ({ ...f, members: f.members.map(m => (m.id === id ? { ...m, role } : m)) }));

  const steps = ['Choose a template', 'Project basics', 'Review the plan'];
  const planPeople = [...new Set(plan.map(r => r.assignee))].length;
  const planSpan = plan.length ? diffDays(plan.reduce((m, r) => (r.start < m ? r.start : m), plan[0].start), plan.reduce((m, r) => (r.due > m ? r.due : m), plan[0].due)) + 1 : 0;

  return (
    <div className="np">
      <div className="np-head">
        <div>
          <h2>New project</h2>
          <ol className="np-steps">
            {steps.map((s, i) => <li key={s} className={step === i + 1 ? 'on' : step > i + 1 ? 'done' : ''}><span>{step > i + 1 ? '✓' : i + 1}</span>{s}</li>)}
          </ol>
        </div>
        <button className="pm-btn ghost" onClick={onCancel}>Cancel</button>
      </div>

      {step === 1 && (
        <div className="np-body">
          <p className="np-lead">Start from a proven plan. Every template lays out phases and tasks backwards from your key date — you can change anything before creating.</p>
          <div className="np-grid">
            {BUILTIN_TEMPLATES.map(t => (
              <button key={t.id} className="np-card" onClick={() => setPreview(t)} style={{ '--tc': t.color, '--ta': t.accent }}>
                <div className="np-card-top"><span className="np-card-icon">{t.icon}</span><span className="np-card-key">📅 {t.keyDateLabel}</span><PhaseStrip tpl={t} /></div>
                <div className="np-card-body">
                  <h3>{t.name}</h3>
                  <p>{t.tagline}</p>
                  <div className="np-card-meta">
                    <span>{t.phases.length} phases</span><span>{t.tasks.length} tasks</span><span>{weeksLabel(spanOf(t))}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {customs.length > 0 && (
            <>
              <h4 className="np-sub">Your team's templates</h4>
              <div className="np-grid">
                {customs.map(t => (
                  <button key={t.id} className="np-card" onClick={() => setPreview(t)} style={{ '--tc': t.color, '--ta': '#eef2ff' }}>
                    <div className="np-card-top"><span className="np-card-icon">{t.icon}</span><PhaseStrip tpl={t} /></div>
                    <div className="np-card-body">
                      <h3>{t.name}</h3>
                      <p>{t.tagline}</p>
                      <div className="np-card-meta"><span>{t.phases.length} phases</span><span>{t.tasks.length} tasks</span>{t.createdBy && <span>by {t.createdBy}</span>}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
          {pastProjects.length > 0 && (
            <>
              <h4 className="np-sub">Copy a past project</h4>
              <div className="np-copy">
                {pastProjects.map(p => (
                  <button key={p.id} className="np-copy-item" onClick={() => fromProject(p)}>
                    <span className="np-copy-icon" style={{ background: p.color }}>{p.icon}</span>
                    <span><strong>{p.name}</strong><small>{p.status} · {pastTasks.filter(t => t.projectId === p.id).length} tasks</small></span>
                    <em>Copy →</em>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {preview && (
        <div className="np-preview-overlay" onClick={() => setPreview(null)}>
          <aside className="np-preview" onClick={(e) => e.stopPropagation()} style={{ '--tc': preview.color, '--ta': preview.accent }}>
            <div className="np-preview-head">
              <span className="np-card-icon big">{preview.icon}</span>
              <div><h3>{preview.name}</h3><p>{preview.description || preview.tagline}</p></div>
              <button className="pm-x" onClick={() => setPreview(null)} aria-label="Close">✕</button>
            </div>
            <div className="np-preview-stats">
              <div><b>{preview.phases.length}</b><span>phases</span></div>
              <div><b>{preview.tasks.length}</b><span>tasks</span></div>
              <div><b>{weeksLabel(spanOf(preview))}</b><span>timeline</span></div>
              <div><b>{preview.kpis.length}</b><span>KPIs</span></div>
            </div>
            {preview.tasks.length > 0 && <div className="np-preview-gantt"><PhaseStrip tpl={preview} tall /></div>}
            <div className="np-preview-list">
              {preview.phases.map(ph => {
                const ts = preview.tasks.filter(t => t.ph === ph.id);
                return (
                  <div key={ph.id} className="np-preview-phase">
                    <h5><i style={{ background: ph.color }} />{ph.name}<small>{ts.length} tasks</small></h5>
                    <ul>
                      {ts.map((t, i) => (
                        <li key={i}><span>{t.t}</span><em>{t.d === 0 ? `on ${preview.keyDateLabel.toLowerCase()}` : t.d < 0 ? `${-t.d}d before` : `${t.d}d after`}</em></li>
                      ))}
                      {!ts.length && <li className="muted">Add your own tasks</li>}
                    </ul>
                  </div>
                );
              })}
              {preview.kpis.length > 0 && <p className="np-kpi-line">Tracks: {preview.kpis.map(k => k.name).join(' · ')}</p>}
            </div>
            <div className="np-preview-foot"><button className="pm-btn primary" onClick={() => choose(preview)}>Use this template →</button></div>
          </aside>
        </div>
      )}

      {step === 2 && form && (
        <div className="np-body np-form">
          <div className="np-chosen" style={{ '--tc': tpl.color }}><span>{tpl.icon}</span>{tpl.copiedFrom ? `Copying “${tpl.copiedFrom}”` : `${tpl.name} template`}<button onClick={() => setStep(1)}>Change</button></div>
          <div className="np-row">
            <label className="np-field grow">Project name
              <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={tpl.id === 'book' ? 'e.g. The Other Indian – Book Promotion' : 'e.g. ' + tpl.name + ' — December'} />
            </label>
            <label className="np-field">Brand
              <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}>
                {brands.map(b => <option key={b}>{b}</option>)}<option>WTC</option><option>Other</option>
              </select>
            </label>
          </div>
          <div className="np-row">
            <div className="np-field">Icon
              <div className="np-icons">{PROJECT_ICONS.map(i => <button key={i} type="button" className={form.icon === i ? 'on' : ''} onClick={() => setForm({ ...form, icon: i })}>{i}</button>)}</div>
            </div>
            <div className="np-field">Colour
              <div className="np-colors">{PROJECT_COLORS.map(c => <button key={c} type="button" aria-label={c} className={form.color === c ? 'on' : ''} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />)}</div>
            </div>
          </div>
          <div className="np-row">
            <label className="np-field">{form.keyDateLabel}
              <input type="date" value={form.keyDate} onChange={e => setKeyDate(e.target.value)} />
            </label>
            <label className="np-field">Starts
              <input type="date" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
            </label>
            <label className="np-field">Key date name
              <input value={form.keyDateLabel} onChange={e => setForm({ ...form, keyDateLabel: e.target.value })} />
            </label>
          </div>
          <label className="np-field">Goal (one line everyone should know)
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. 5,000 pre-orders and 2M reel views by launch week" />
          </label>
          <div className="np-row">
            <label className="np-field">Project Lead
              <select value={form.leadId} onChange={e => setForm({ ...form, leadId: e.target.value, members: form.members.filter(m => m.id !== e.target.value) })}>
                {activeTeam.map(m => <option key={m.id} value={m.id}>{m.name}{m.role ? ` — ${m.role}` : ''}</option>)}
              </select>
            </label>
          </div>
          <div className="np-field">Team <small>tap to add · choose Member (works on tasks) or Viewer (sees progress)</small>
            <div className="np-people">
              {activeTeam.filter(m => m.id !== form.leadId).map(m => {
                const sel = form.members.find(x => x.id === m.id);
                return (
                  <div key={m.id} className={`np-person ${sel ? 'on' : ''}`}>
                    <button type="button" onClick={() => toggleMember(m.id)}><span className="pm-av">{(m.avatar || m.name.slice(0, 2)).slice(0, 2)}</span><span><b>{m.name}</b><small>{m.role}</small></span></button>
                    {sel && (
                      <div className="np-role">
                        <button type="button" className={sel.role !== 'viewer' ? 'on' : ''} onClick={() => setMemberRole(m.id, 'member')}>Member</button>
                        <button type="button" className={sel.role === 'viewer' ? 'on' : ''} onClick={() => setMemberRole(m.id, 'viewer')}>Viewer</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="np-field">KPI targets <small>the numbers the reports will track</small>
            <div className="np-kpis">
              {form.kpis.map((k, i) => (
                <div key={i} className="np-kpi">
                  <input value={k.name} placeholder="KPI name" onChange={e => setForm({ ...form, kpis: form.kpis.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                  <input type="number" min="0" value={k.target} placeholder="Target" onChange={e => setForm({ ...form, kpis: form.kpis.map((x, j) => (j === i ? { ...x, target: e.target.value } : x)) })} />
                  <button type="button" className="pm-x" onClick={() => setForm({ ...form, kpis: form.kpis.filter((_, j) => j !== i) })} aria-label="Remove KPI">✕</button>
                </div>
              ))}
              {form.kpis.length < 8 && <button type="button" className="pm-btn ghost sm" onClick={() => setForm({ ...form, kpis: [...form.kpis, { name: '', unit: '', target: '' }] })}>+ Add KPI</button>}
            </div>
          </div>
          <div className="np-toggles">
            <label><input type="checkbox" checked={form.qc} onChange={e => setForm({ ...form, qc: e.target.checked })} /> Final QC by PC / Shivendra after the Lead approves a deliverable</label>
            <label><input type="checkbox" checked={form.autoCalendar} onChange={e => setForm({ ...form, autoCalendar: e.target.checked })} /> Add approved content to the Content Calendar automatically</label>
          </div>
          {err && <p className="pm-err">{err}</p>}
          <div className="np-foot">
            <button className="pm-btn ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="pm-btn primary" onClick={goStep3}>Next: review the plan →</button>
          </div>
        </div>
      )}

      {step === 3 && form && (
        <div className="np-body np-plan">
          <div className="np-plan-bar">
            <div><b>{form.icon} {form.name}</b><small>{form.keyDateLabel}: {fmtShort(form.keyDate)} · Lead: {leadName}</small></div>
            <label className="np-inline">{form.keyDateLabel}<input type="date" value={form.keyDate} onChange={e => setKeyDate(e.target.value)} /></label>
            <div className="np-plan-stats"><span><b>{plan.filter(r => r.title.trim()).length}</b> tasks</span><span><b>{planPeople}</b> people</span><span><b>{planSpan}</b> days</span></div>
          </div>
          <p className="np-hint">Dates are set from the {form.keyDateLabel.toLowerCase()} — change it above and every task moves with it. People were suggested from their roles; change any of them.</p>
          {tpl.phases.map(ph => {
            const rows = plan.filter(r => r.phase === ph.id);
            return (
              <section key={ph.id} className="np-phase" style={{ '--pc': ph.color }}>
                <header><i />{ph.name}<small>{rows.length} tasks{rows.length ? ` · ${fmtShort(rows.reduce((m, r) => (r.start < m ? r.start : m), rows[0].start))} → ${fmtShort(rows.reduce((m, r) => (r.due > m ? r.due : m), rows[0].due))}` : ''}</small></header>
                <div className="np-table">
                  {rows.length > 0 && <div className="np-tr np-th"><span>Task</span><span>Who</span><span>Start</span><span>Due</span><span>Effort</span><span>Format</span><span></span></div>}
                  {rows.map(r => (
                    <div key={r.key} className="np-tr">
                      <input className="np-t" value={r.title} onChange={e => updRow(r.key, { title: e.target.value })} placeholder="Task name" aria-label="Task name" />
                      <select value={r.assignee} onChange={e => updRow(r.key, { assignee: e.target.value })} aria-label="Assignee">
                        {activeTeam.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                      </select>
                      <input type="date" value={r.start} onChange={e => updRow(r.key, { start: e.target.value })} aria-label="Start" />
                      <input type="date" value={r.due} onChange={e => updRow(r.key, { due: e.target.value })} aria-label="Due" className={r.due < r.start ? 'bad' : ''} />
                      <select value={r.effort} onChange={e => updRow(r.key, { effort: e.target.value })} aria-label="Effort">{EFFORTS.map(x => <option key={x.id} value={x.id}>{x.id}</option>)}</select>
                      <select value={r.format} onChange={e => updRow(r.key, { format: e.target.value })} aria-label="Format"><option value="">—</option>{FORMATS.map(f => <option key={f}>{f}</option>)}</select>
                      <button type="button" className="pm-x" onClick={() => setPlan(p => p.filter(x => x.key !== r.key))} aria-label="Remove task">✕</button>
                      {r.format && allChannels.length > 0 && (
                        <select className="np-ch" value={r.channel} onChange={e => updRow(r.key, { channel: e.target.value })} aria-label="Channel">
                          <option value="">Channel (for the Content Calendar)…</option>{allChannels.map(c => <option key={c}>{c}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                  <button type="button" className="np-add" onClick={() => addRow(ph.id)}>+ Add task to {ph.name}</button>
                </div>
              </section>
            );
          })}
          {err && <p className="pm-err">{err}</p>}
          <div className="np-foot sticky">
            <button className="pm-btn ghost" onClick={() => setStep(2)}>← Back</button>
            <span className="np-foot-note">{parseYmd(form.keyDate) < new Date() ? '⚠️ The key date is in the past.' : `${diffDays(todayYmd(), form.keyDate)} days to ${form.keyDateLabel.toLowerCase()}`}</span>
            <button className="pm-btn primary" disabled={busy} onClick={create}>{busy ? 'Creating…' : 'Create project ✓'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
