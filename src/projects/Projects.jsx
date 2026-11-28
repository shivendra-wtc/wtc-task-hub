import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './projects.css';
import NewProject from './NewProject';
import ProjectWorkspace, { HealthPill } from './ProjectWorkspace';
import {
  isDone, splitNames, fmtShort, fmtLong, todayYmd, addDaysYmd, diffDays, projectProgress, displayHealth, nextMilestone, onTimeRate,
  makeOffInfo, buildWorkload, DAY_CAPACITY_H,
} from './pmUtils';
import { Donut, StackedBars } from './Charts';

const OWNER_IDS = ['pcwtc45', 'shivendrawtc77'];
// Last loaded projects, kept on this device so Projects opens instantly next time.
export const pmCacheKey = (userId) => 'wtc_pm_v1_' + userId;
export function pmCacheRead(userId) {
  try { const raw = localStorage.getItem(pmCacheKey(userId)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
export function pmCacheWrite(userId, d) {
  try { localStorage.setItem(pmCacheKey(userId), JSON.stringify(d)); } catch (e) { /* storage full or blocked */ }
}

function roleIn(p, userId) {
  if (OWNER_IDS.includes(userId)) return 'owner';
  if (String(p.leadId) === String(userId)) return 'lead';
  const m = (p.members || []).find(x => String(x.id) === String(userId));
  return m ? (m.role === 'viewer' ? 'viewer' : m.role === 'colead' ? 'colead' : 'member') : '';
}

export default function Projects({ apiUrl, me, team, holidays, channels, allTasks, initial, onClose, notify, onChanged }) {
  const [data, setData] = useState(() => pmCacheRead(me.id));
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState(initial?.projectId ? { kind: 'project', id: initial.projectId, tab: initial.tab } : { kind: 'home' });
  const [homeTab, setHomeTab] = useState('projects');
  const [filter, setFilter] = useState('active');
  const [brand, setBrand] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const loadSeq = useRef(0);
  const isOwner = OWNER_IDS.includes(me.id);

  const hasData = useRef(!!pmCacheRead(me.id));
  const load = useCallback(async (attempt = 1) => {
    const seq = ++loadSeq.current;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(apiUrl + '?action=getProjectsData&userId=' + encodeURIComponent(me.id), { signal: ctrl.signal });
      const d = await res.json();
      if (seq !== loadSeq.current) return;
      if (d.status === 'ok' && !Array.isArray(d.projects)) { setError('Projects needs the latest server update. Shivendra: paste the new Code.gs in Apps Script and deploy a new version.'); return; }
      if (d.status === 'ok') { hasData.current = true; setData(d); setError(''); setRefreshing(false); pmCacheWrite(me.id, d); } else if (!hasData.current) setError(d.message || 'Could not load projects.');
    } catch (e) {
      if (seq !== loadSeq.current || hasData.current) return;
      if (attempt < 2) { load(attempt + 1); return; }
      setError('The server is taking too long to answer. Check the connection and try again.');
    } finally { clearTimeout(timer); if (seq === loadSeq.current) setRefreshing(false); }
  }, [apiUrl, me.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const iv = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 30000);
    return () => clearInterval(iv);
  }, [load]);
  useEffect(() => { if (initial?.projectId) setView({ kind: 'project', id: initial.projectId, tab: initial.tab }); }, [initial?.projectId, initial?.tab, initial?.at]);

  // POST that reads the reply (Apps Script answers through a CORS-enabled redirect).
  const api = useCallback(async (action, payload) => {
    const body = JSON.stringify({ action, userId: me.id, userName: me.name, ...payload });
    try {
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body });
      const d = await res.json();
      if (d.status === 'ok') onChanged && onChanged();
      return d;
    } catch (e) {
      try { await fetch(apiUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body }); onChanged && onChanged(); return { status: 'ok', unconfirmed: true }; }
      catch (e2) { return { status: 'error', message: 'Could not reach the server — try again.' }; }
    }
  }, [apiUrl, me.id, me.name, onChanged]);

  const reload = useCallback(() => { load(); setTimeout(load, 2500); }, [load]);

  const projects = data?.projects || [];
  const tasks = data?.tasks || [];
  const reviews = data?.reviews || [];
  const updates = data?.updates || [];
  const tasksOf = (id) => tasks.filter(t => t.projectId === id);
  const today = todayYmd();

  const cards = useMemo(() => projects.map(p => {
    const ts = tasks.filter(t => t.projectId === p.id);
    const dh = displayHealth(p, ts, updates);
    return { p, ts, dh, progress: projectProgress(ts), ms: nextMilestone(p, ts), role: roleIn(p, me.id),
      overdue: ts.filter(t => !isDone(t) && t.targetDate && t.targetDate < today).length,
      open: ts.filter(t => !isDone(t)).length, pending: reviews.filter(r => r.projectId === p.id && r.status === 'Pending').length };
  }), [projects, tasks, updates, reviews, me.id, today]);

  const filtered = cards.filter(c => {
    const st = c.p.status;
    if (filter === 'active' && st !== 'Active') return false;
    if (filter === 'hold' && st !== 'On hold') return false;
    if (filter === 'done' && st !== 'Completed') return false;
    if (brand && c.p.brand !== brand) return false;
    if (onlyMine && !['lead', 'colead', 'member', 'viewer'].includes(c.role) && !(c.p.createdBy === me.name)) return false;
    if (q && !(c.p.name.toLowerCase().includes(q.toLowerCase()) || (c.p.brand || '').toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }).sort((a, b) => (a.p.keyDate || '9999').localeCompare(b.p.keyDate || '9999'));

  const counts = {
    active: cards.filter(c => c.p.status === 'Active').length,
    hold: cards.filter(c => c.p.status === 'On hold').length,
    done: cards.filter(c => c.p.status === 'Completed').length,
  };
  const live = cards.filter(c => c.p.status === 'Active');
  const brands = [...new Set(projects.map(p => p.brand).filter(Boolean))];

  const createProject = async (project, newTasks) => {
    setBusy(true);
    const r = await api('createProject', { project, tasks: newTasks });
    setBusy(false);
    if (r.status === 'ok') {
      notify(`📁 “${project.name}” created — ${newTasks.length} tasks assigned`);
      await load();
      setView({ kind: 'project', id: project.id, tab: 'overview' });
      setTimeout(load, 3000);
    } else notify(r.message || 'Could not create the project.');
  };

  const current = view.kind === 'project' ? projects.find(p => p.id === view.id) : null;

  return (
    <div className="pm-shell" role="dialog" aria-label="Projects">
      <div className="pm-topbar">
        <div className="pm-brand"><span className="pm-logo">📁</span><div><h1>Projects</h1><small>{refreshing && data ? 'Updating…' : 'Plan · assign · review · report'}</small></div></div>
        <div className="pm-top-actions">
          {isOwner && view.kind === 'home' && <button className="pm-btn gold" onClick={() => setView({ kind: 'new' })}>+ New project</button>}
          <button className="pm-close" onClick={onClose} aria-label="Close Projects">✕</button>
        </div>
      </div>

      <div className="pm-main">
        {!data && !error && <div className="pm-loading"><span className="pm-spinner" />Loading projects…<small className="muted">The first open can take a few seconds.</small></div>}
        {error && !data && <div className="pm-loading"><p>{error}</p><button className="pm-btn primary" onClick={() => { setError(''); load(); }}>Try again</button></div>}

        {data && view.kind === 'new' && (
          <NewProject me={me} team={team} channelGroups={channels} customTemplates={data.templates} busy={busy}
            pastProjects={projects} pastTasks={tasks} onCancel={() => setView({ kind: 'home' })} onCreate={createProject} />
        )}

        {data && view.kind === 'project' && !current && (
          <div className="pm-loading"><p>This project isn't available — it may have been archived, or you're not on it.</p><button className="pm-btn primary" onClick={() => setView({ kind: 'home' })}>All projects</button></div>
        )}

        {data && current && (
          <ProjectWorkspace key={current.id} project={current} tasks={tasksOf(current.id)} reviews={reviews} updates={updates} team={team} me={me}
            role={roleIn(current, me.id)} isOwner={isOwner} api={api} apiUrl={apiUrl} reload={reload} notify={notify} initialTab={view.tab}
            onBack={() => setView({ kind: 'home' })} holidays={holidays} leaves={data.leaves || []} allTasks={allTasks} allProjectTasks={tasks}
            channels={channels} onSaved={load} />
        )}

        {data && view.kind === 'home' && (
          <div className="ph">
            {isOwner && (
              <div className="pm-seg ph-tabs">
                <button className={homeTab === 'projects' ? 'on' : ''} onClick={() => setHomeTab('projects')}>All projects</button>
                <button className={homeTab === 'portfolio' ? 'on' : ''} onClick={() => setHomeTab('portfolio')}>Portfolio dashboard</button>
              </div>
            )}
            {homeTab === 'portfolio' && isOwner ? (
              <Portfolio cards={cards} tasks={tasks} team={team} holidays={holidays} leaves={data.leaves || []} allTasks={allTasks} open={(id, tab) => setView({ kind: 'project', id, tab })} />
            ) : (
              <>
                <div className="ph-summary">
                  <div><b>{live.length}</b><span>active projects</span></div>
                  <div className="ok"><b>{live.filter(c => c.dh.health === 'ok').length}</b><span>on track</span></div>
                  <div className="risk"><b>{live.filter(c => c.dh.health === 'risk').length}</b><span>at risk</span></div>
                  <div className="bad"><b>{live.filter(c => c.dh.health === 'delayed').length}</b><span>delayed</span></div>
                  <div><b>{live.filter(c => c.p.keyDate && c.p.keyDate >= today && diffDays(today, c.p.keyDate) <= 14).length}</b><span>key dates in 14 days</span></div>
                </div>
                <div className="ph-filters">
                  <div className="pm-seg">
                    {[['active', 'Active'], ['hold', 'On hold'], ['done', 'Completed']].map(([id, l]) => (
                      <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{l}<span>{counts[id]}</span></button>
                    ))}
                  </div>
                  {brands.length > 1 && <select value={brand} onChange={e => setBrand(e.target.value)} aria-label="Brand"><option value="">All brands</option>{brands.map(b => <option key={b}>{b}</option>)}</select>}
                  {isOwner && <label className="pm-switch"><input type="checkbox" checked={onlyMine} onChange={e => setOnlyMine(e.target.checked)} /> Projects I'm in</label>}
                  <input className="ph-search" placeholder="Search projects…" value={q} onChange={e => setQ(e.target.value)} />
                </div>
                {!projects.length ? (
                  <div className="ph-empty">
                    <div className="ph-empty-art">📁</div>
                    <h3>{isOwner ? 'Start your first project' : 'No projects yet'}</h3>
                    <p>{isOwner ? 'Pick a template — Book Promotion, YouTube Series, Festival Campaign and more — set the key date and Lead, and the whole plan builds itself.' : "You'll see projects here as soon as you're added to one."}</p>
                    {isOwner && <button className="pm-btn gold" onClick={() => setView({ kind: 'new' })}>+ New project</button>}
                  </div>
                ) : !filtered.length ? <p className="pm-empty">No projects match these filters.</p> : (
                  <div className="ph-grid">
                    {filtered.map(c => <ProjectCard key={c.p.id} c={c} team={team} today={today} onOpen={(tab) => setView({ kind: 'project', id: c.p.id, tab })} />)}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ c, team, today, onOpen }) {
  const { p, ts, dh, progress, ms, overdue, open, pending, role } = c;
  const lead = team.find(m => m.id === p.leadId);
  const members = (p.members || []).map(m => team.find(x => x.id === m.id)).filter(Boolean);
  const daysLeft = p.keyDate ? diffDays(today, p.keyDate) : null;
  return (
    <article className="ph-card" style={{ '--pc': p.color }} onClick={() => onOpen()} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') onOpen(); }}>
      <div className="ph-card-band"><span className="ph-card-icon">{p.icon}</span>{p.brand && <span className="ph-card-brand">{p.brand}</span>}{p.status === 'Active' && p.start > today && <span className="ph-card-soon">Starts in {diffDays(today, p.start)}d</span>}<HealthPill health={dh.health} small /></div>
      <div className="ph-card-body">
        <h3>{p.name}</h3>
        <div className="ph-prog"><div><span style={{ width: `${Math.round(progress * 100)}%` }} /></div><b>{Math.round(progress * 100)}%</b></div>
        <dl className="ph-facts">
          <div><dt>Next</dt><dd>{p.status === 'Completed' ? 'Completed ✓' : ms ? <>{ms.label} · <b>{fmtShort(ms.date)}</b></> : '—'}</dd></div>
          <div><dt>{p.keyDateLabel || 'Key date'}</dt><dd>{fmtShort(p.keyDate)}{p.status !== 'Completed' && daysLeft !== null && <em className={daysLeft < 0 ? 'late' : daysLeft <= 7 ? 'soon' : ''}>{daysLeft < 0 ? `${-daysLeft}d past` : daysLeft === 0 ? 'today' : `${daysLeft}d left`}</em>}</dd></div>
        </dl>
      </div>
      <footer className="ph-card-foot">
        <span className="pm-avs">
          {lead && <span className="pm-av ring" title={`${lead.name} (Lead)`}>{(lead.avatar || lead.name.slice(0, 2)).slice(0, 2)}</span>}
          {members.slice(0, 4).map(m => <span key={m.id} className="pm-av" title={m.name}>{(m.avatar || m.name.slice(0, 2)).slice(0, 2)}</span>)}
          {members.length > 4 && <span className="pm-av more">+{members.length - 4}</span>}
        </span>
        <span className="ph-card-stats">
          <span title="Open tasks">{open}/{ts.length} open</span>
          {overdue > 0 && <span className="bad" title="Overdue">🔥 {overdue}</span>}
          {pending > 0 && <span className="rev" title="Waiting for review" onClick={e => { e.stopPropagation(); onOpen('reviews'); }}>🧐 {pending}</span>}
        </span>
        {role && role !== 'owner' && <span className="ph-role">{role === 'lead' ? 'You lead' : role === 'colead' ? 'Co-lead' : role === 'viewer' ? 'Viewer' : 'Member'}</span>}
      </footer>
    </article>
  );
}

function Portfolio({ cards, tasks, team, holidays, leaves, allTasks, open }) {
  const today = todayYmd();
  const live = cards.filter(c => c.p.status === 'Active');
  const in14 = addDaysYmd(today, 14);
  const milestones = [];
  live.forEach(c => {
    if (c.p.keyDate && c.p.keyDate >= today && c.p.keyDate <= in14) milestones.push({ date: c.p.keyDate, label: c.p.keyDateLabel || 'Key date', c, key: true });
    (c.p.milestones || []).forEach(m => { if (m.date >= today && m.date <= in14) milestones.push({ date: m.date, label: m.label, c, key: true }); });
    (c.p.phases || []).forEach(ph => {
      const pts = c.ts.filter(t => t.phase === ph.id);
      if (!pts.length || pts.every(isDone)) return;
      const end = pts.reduce((m, t) => (t.targetDate > m ? t.targetDate : m), '');
      if (end >= today && end <= in14) milestones.push({ date: end, label: ph.name + ' ends', c });
    });
  });
  milestones.sort((a, b) => a.date.localeCompare(b.date));
  // People load this week across ALL projects + regular tasks.
  const days = []; for (let i = 0; i < 7; i++) days.push(addDaysYmd(today, i));
  const offInfo = makeOffInfo(leaves, holidays);
  const people = team.filter(m => m.active !== false && tasks.some(t => splitNames(t.assignedTo).includes(m.name)));
  const wl = buildWorkload([...(allTasks || []).filter(t => !t.projectId), ...tasks], people, days, offInfo);
  const loads = people.map(p => {
    let h = 0, cap = 0;
    days.forEach(d => { h += ((wl[p.name] || {})[d] || { hours: 0 }).hours; const o = offInfo(p.id, d); cap += o.off ? 0 : o.half ? DAY_CAPACITY_H / 2 : DAY_CAPACITY_H; });
    return { p, h, cap, r: cap ? h / cap : (h ? 2 : 0) };
  }).sort((a, b) => b.r - a.r);
  const byLead = {};
  cards.forEach(c => {
    const lead = (team.find(m => m.id === c.p.leadId) || {}).name || '—';
    const o = onTimeRate(c.ts);
    const L = byLead[lead] || (byLead[lead] = { projects: 0, onTime: 0, total: 0 });
    L.projects++; if (o) { L.onTime += o.onTime; L.total += o.total; }
  });
  const H = { ok: '#0f9d58', risk: '#d99a00', delayed: '#d93025' };
  return (
    <div className="pf">
      <div className="pf-grid">
        <section className="ov-card">
          <header><h4>Health of active projects</h4></header>
          <Donut label="projects" parts={[{ label: 'On track', value: live.filter(c => c.dh.health === 'ok').length, color: H.ok }, { label: 'At risk', value: live.filter(c => c.dh.health === 'risk').length, color: H.risk }, { label: 'Delayed', value: live.filter(c => c.dh.health === 'delayed').length, color: H.delayed }]} />
        </section>
        <section className="ov-card pf-wide">
          <header><h4>Progress by project</h4></header>
          <div className="pf-projects">
            {live.length ? live.map(c => (
              <button key={c.p.id} className="pf-prow" onClick={() => open(c.p.id)}>
                <span className="pf-pname"><i>{c.p.icon}</i>{c.p.name}</span>
                <span className="pf-pbar"><span style={{ width: `${Math.round(c.progress * 100)}%`, background: c.p.color }} /></span>
                <b>{Math.round(c.progress * 100)}%</b>
                <HealthPill health={c.dh.health} small />
                <em>{c.p.keyDate ? fmtShort(c.p.keyDate) : '—'}</em>
              </button>
            )) : <p className="pm-empty-sm">No active projects.</p>}
          </div>
        </section>
        <section className="ov-card">
          <header><h4>Next 14 days</h4></header>
          {milestones.length ? (
            <ul className="pf-ms">{milestones.slice(0, 12).map((m, i) => <li key={i} onClick={() => open(m.c.p.id, 'timeline')}><span className={`pf-date ${m.key ? 'key' : ''}`}>{fmtShort(m.date)}</span><span><b>{m.label}</b><small>{m.c.p.icon} {m.c.p.name}</small></span></li>)}</ul>
          ) : <p className="pm-empty-sm">No milestones in the next two weeks.</p>}
        </section>
        <section className="ov-card">
          <header><h4>Team load this week</h4><span className="muted">all projects + regular tasks</span></header>
          <StackedBars unit="%" rows={loads.slice(0, 10).map(l => ({ label: l.p.name, parts: [{ value: Math.round(Math.min(l.r, 1.5) * 100), color: l.r > 1 ? '#d93025' : l.r >= 0.7 ? '#d99a00' : '#0f9d58', title: `${Math.round(l.h)}h of ${l.cap}h` }] }))} />
          {loads.some(l => l.r > 1) && <p className="pm-warn sm">Overloaded: {loads.filter(l => l.r > 1).map(l => l.p.name).join(', ')}</p>}
        </section>
        <section className="ov-card">
          <header><h4>Delivery by Lead</h4></header>
          <ul className="pf-leads">
            {Object.keys(byLead).map(n => <li key={n}><b>{n}</b><span>{byLead[n].projects} project{byLead[n].projects > 1 ? 's' : ''}</span><em>{byLead[n].total ? Math.round((byLead[n].onTime / byLead[n].total) * 100) + '% on time' : '—'}</em></li>)}
          </ul>
        </section>
        <section className="ov-card pf-wide">
          <header><h4>Needs your attention</h4></header>
          <ul className="ov-list">
            {live.filter(c => c.dh.health !== 'ok' || c.pending).map(c => (
              <li key={c.p.id} onClick={() => open(c.p.id, c.pending ? 'reviews' : 'overview')}>
                <HealthPill health={c.dh.health} small />{c.p.icon} {c.p.name}
                <small>{c.overdue ? `${c.overdue} overdue · ` : ''}{c.pending ? `${c.pending} waiting for review · ` : ''}{c.dh.byLead ? `“${c.dh.byLead.note}”` : 'auto'}</small>
              </li>
            ))}
            {!live.some(c => c.dh.health !== 'ok' || c.pending) && <li className="muted">Everything is on track. 🎉</li>}
          </ul>
        </section>
      </div>
      <p className="muted pf-foot">Updated {fmtLong(today)}</p>
    </div>
  );
}
