import { useEffect, useMemo, useRef, useState } from 'react';
import {
  isDone, splitNames, fmtShort, fmtLong, todayYmd, addDaysYmd, diffDays, timeAgo, taskStart, projectProgress, displayHealth, HEALTH,
  latestReview, boardColumn, blockedBy, nextMilestone, makeOffInfo, buildWorkload, loadLevel, DAY_CAPACITY_H, burnSeries, onTimeRate,
  projectSnapshot, projectEnd, parseYmd, EFFORT_HOURS,
} from './pmUtils';
import { FORMATS, EFFORTS, PROJECT_ICONS, PROJECT_COLORS } from './templates';
import { ProgressRing, BurnUpChart, StackedBars, Donut, KpiChart } from './Charts';
import { projectToDefinition } from './NewProject';
import DateField from './DateField';

const COLS = [
  { id: 'todo', label: 'To do', hint: 'Not started' },
  { id: 'doing', label: 'In progress', hint: 'Being worked on' },
  { id: 'review', label: 'In review', hint: 'Waiting for approval' },
  { id: 'approved', label: 'Approved', hint: 'Ready to publish' },
  { id: 'done', label: 'Done', hint: 'Completed' },
];
const COL_COLORS = { todo: '#94a3b8', doing: '#2563eb', review: '#d97706', approved: '#7c3aed', done: '#059669' };
const TABS = [
  ['overview', 'Overview'], ['board', 'Board'], ['list', 'List'], ['timeline', 'Timeline'], ['workload', 'Workload'],
  ['reviews', 'Reviews'], ['reports', 'Reports'], ['updates', 'Updates'], ['brief', 'Brief'], ['files', 'Files & links'], ['team', 'Team'],
];

function Av({ name, team, size = 26, ring }) {
  const m = team.find(x => x.name === name);
  const txt = (m && m.avatar) || String(name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  return <span className={`pm-av ${ring ? 'ring' : ''}`} style={{ width: size, height: size, fontSize: size * 0.38 }} title={name}>{txt}</span>;
}
function Avatars({ names, team, max = 4, size = 24 }) {
  const list = names.slice(0, max);
  return (
    <span className="pm-avs">
      {list.map(n => <Av key={n} name={n} team={team} size={size} />)}
      {names.length > max && <span className="pm-av more" style={{ width: size, height: size, fontSize: size * 0.36 }}>+{names.length - max}</span>}
    </span>
  );
}
export function HealthPill({ health, small }) {
  const h = HEALTH[health] || HEALTH.ok;
  return <span className={`pm-health ${h.cls} ${small ? 'sm' : ''}`}><i />{h.label}</span>;
}
function DueChip({ t }) {
  if (!t.targetDate) return null;
  const today = todayYmd();
  const late = !isDone(t) && t.targetDate < today;
  const soon = !isDone(t) && !late && diffDays(today, t.targetDate) <= 2;
  return <span className={`pm-due ${late ? 'late' : soon ? 'soon' : ''}`}>{late ? '🔥 ' : ''}{fmtShort(t.targetDate)}</span>;
}

// ============================================================
export default function ProjectWorkspace(props) {
  const { project, tasks, reviews, updates, team, me, role, isOwner, api, apiUrl, reload, notify, initialTab, onBack, holidays, leaves, allTasks, allProjectTasks, channels, onSaved } = props;
  const [tab, setTab] = useState(initialTab || 'overview');
  const [openTaskId, setOpenTaskId] = useState(null);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const canManage = role === 'owner' || role === 'lead' || role === 'colead';
  const canChooseCoLeads = role === 'owner' || role === 'lead';
  const canWork = canManage || role === 'member';
  const pReviews = reviews.filter(r => r.projectId === project.id);
  const pUpdates = updates.filter(u => u.projectId === project.id);
  const dh = displayHealth(project, tasks, updates);
  const progress = projectProgress(tasks);
  const leadName = (team.find(m => m.id === project.leadId) || {}).name || '—';
  const coLeadNames = (project.members || []).filter(m => m.role === 'colead').map(m => (team.find(x => x.id === m.id) || {}).name).filter(Boolean);
  const memberNames = (project.members || []).filter(m => m.role !== 'colead').map(m => (team.find(x => x.id === m.id) || {}).name).filter(Boolean);
  const daysLeft = project.keyDate ? diffDays(todayYmd(), project.keyDate) : null;
  const pendingMine = pReviews.filter(r => r.status === 'Pending' && ((r.stage === 'lead' && canManage) || (r.stage === 'qc' && isOwner))).length;
  const openTask = openTaskId ? tasks.find(t => String(t.id) === String(openTaskId)) : null;

  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  useEffect(() => { if (openTaskId && !openTask) setOpenTaskId(null); }, [openTaskId, openTask]);

  const ctx = { canChooseCoLeads, coLeadNames, apiUrl, project, tasks, reviews: pReviews, updates: pUpdates, team, me, role, isOwner, canManage, canWork, api, reload, notify, openTask: setOpenTaskId, holidays, leaves, allTasks, allProjectTasks, channels, leadName };

  const setStatus = async (t, status) => {
    if (!(canManage || splitNames(t.assignedTo).includes(me.name))) { notify('Only the people on this task or the Lead can move it.'); return; }
    const r = await api('updateStatus', { taskId: t.id, status });
    if (r.status === 'ok') { notify(status === 'Completed' ? '✅ Task completed' : 'Moved to ' + status); reload(); } else notify(r.message || 'Could not update.');
  };
  ctx.setStatus = setStatus;

  return (
    <div className="pw" style={{ '--pc': project.color }}>
      <div className="pw-head">
        <button className="pm-back" onClick={onBack} aria-label="All projects">←</button>
        <span className="pw-icon">{project.icon}</span>
        <div className="pw-title">
          <h2>{project.name}</h2>
          <div className="pw-sub">
            {project.brand && <span className="pm-chip">{project.brand}</span>}
            <HealthPill health={dh.health} />
            {dh.byLead && <span className="pw-bylead" title={dh.byLead.note}>set by {dh.byLead.by} · {timeAgo(dh.byLead.at)}</span>}
            {(project.milestones || []).filter(m => m.date >= todayYmd()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2).map(m => (
              <span key={m.id} className="pw-key ms">◆ {m.label}: <b>{fmtShort(m.date)}</b><em className={diffDays(todayYmd(), m.date) <= 7 ? 'soon' : ''}>{diffDays(todayYmd(), m.date) === 0 ? 'today' : `${diffDays(todayYmd(), m.date)}d`}</em></span>
            ))}
            {project.keyDate && <span className="pw-key">{project.keyDateLabel || 'Key date'}: <b>{fmtShort(project.keyDate)}</b>{project.status !== 'Completed' && daysLeft !== null && <em className={daysLeft < 0 ? 'late' : daysLeft <= 7 ? 'soon' : ''}>{daysLeft < 0 ? `${-daysLeft}d past` : daysLeft === 0 ? 'today' : `${daysLeft}d left`}</em>}</span>}
          </div>
        </div>
        <div className="pw-people"><Av name={leadName} team={team} size={30} ring />{coLeadNames.map(n => <Av key={n} name={n} team={team} size={28} ring />)}<Avatars names={memberNames} team={team} max={4} size={28} /></div>
        <div className="pw-actions">
          {canManage && project.status !== 'Completed' && <button className="pm-btn primary sm" onClick={() => setTab('updates')}>📊 Post status</button>}
          <div className="pm-menu-wrap">
            <button className="pm-btn ghost sm" onClick={() => setMenu(m => !m)} aria-label="More">⋯</button>
            {menu && (
              <div className="pm-menu" onMouseLeave={() => setMenu(false)}>
                {canManage && <button onClick={() => { setMenu(false); setModal('edit'); }}>✏️ Edit project details</button>}
                {(canManage) && <button onClick={() => { setMenu(false); setModal('template'); }}>📋 Save as template</button>}
                <button onClick={() => { setMenu(false); setModal('report'); }}>📄 Final / project report</button>
                {canManage && project.status !== 'Completed' && <button onClick={() => { setMenu(false); setModal('close'); }}>🏁 Close project</button>}
                {canManage && project.status === 'Completed' && <button onClick={async () => { setMenu(false); const r = await api('updateProject', { projectId: project.id, updates: { status: 'Active' } }); if (r.status === 'ok') { notify('Project reopened'); reload(); } }}>↩️ Reopen project</button>}
                {canManage && project.status === 'Active' && <button onClick={async () => { setMenu(false); const r = await api('updateProject', { projectId: project.id, updates: { status: 'On hold' } }); if (r.status === 'ok') { notify('Project on hold'); reload(); } }}>⏸ Put on hold</button>}
                {canManage && project.status === 'On hold' && <button onClick={async () => { setMenu(false); const r = await api('updateProject', { projectId: project.id, updates: { status: 'Active' } }); if (r.status === 'ok') { notify('Project resumed'); reload(); } }}>▶️ Resume project</button>}
                {isOwner && <button className="danger" onClick={async () => { setMenu(false); if (!window.confirm(`Archive “${project.name}”? It disappears from the list (tasks are kept).`)) return; const r = await api('updateProject', { projectId: project.id, updates: { status: 'Archived' } }); if (r.status === 'ok') { notify('Project archived'); onBack(); reload(); } }}>🗄 Archive project</button>}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pw-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      <nav className="pw-tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}{id === 'reviews' && pendingMine > 0 && <span className="pm-badge">{pendingMine}</span>}
          </button>
        ))}
      </nav>
      <div className="pw-body">
        {tab === 'overview' && <Overview ctx={ctx} setTab={setTab} dh={dh} progress={progress} />}
        {tab === 'board' && <Board ctx={ctx} />}
        {tab === 'list' && <ListView ctx={ctx} />}
        {tab === 'timeline' && <Timeline ctx={ctx} />}
        {tab === 'workload' && <Workload ctx={ctx} />}
        {tab === 'reviews' && <Reviews ctx={ctx} />}
        {tab === 'reports' && <Reports ctx={ctx} />}
        {tab === 'updates' && <Updates ctx={ctx} dh={dh} />}
        {tab === 'brief' && <Brief ctx={ctx} />}
        {tab === 'files' && <Files ctx={ctx} />}
        {tab === 'team' && <TeamTab ctx={ctx} />}
      </div>
      {openTask && <TaskDrawer ctx={ctx} task={openTask} onClose={() => setOpenTaskId(null)} />}
      {modal === 'edit' && <EditProject ctx={ctx} onClose={() => setModal(null)} />}
      {modal === 'template' && <SaveTemplate ctx={ctx} onClose={() => setModal(null)} onSaved={onSaved} />}
      {modal === 'close' && <CloseProject ctx={ctx} onClose={() => setModal(null)} />}
      {modal === 'report' && <FinalReport ctx={ctx} onClose={() => setModal(null)} />}
    </div>
  );
}

// ============================================================ OVERVIEW
function Overview({ ctx, setTab, dh, progress }) {
  const { project, tasks, reviews, updates, team, me, openTask, leadName } = ctx;
  const today = todayYmd();
  const overdue = tasks.filter(t => !isDone(t) && t.targetDate && t.targetDate < today);
  const blocked = tasks.filter(t => !isDone(t) && (taskStart(t) || t.targetDate) <= addDaysYmd(today, 1) && blockedBy(t, tasks).length);
  const mine = tasks.filter(t => !isDone(t) && splitNames(t.assignedTo).includes(me.name)).sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)));
  const inReview = reviews.filter(r => r.status === 'Pending');
  const ms = nextMilestone(project, tasks);
  const lastStatus = updates.find(u => u.type === 'status');
  const dueThisWeek = tasks.filter(t => !isDone(t) && t.targetDate >= today && t.targetDate <= addDaysYmd(today, 7));
  return (
    <div className="ov">
      <div className="ov-main">
        <div className="ov-hero">
          <ProgressRing value={progress} size={112} color={project.color} label="done" />
          <div className="ov-hero-stats">
            <div><b>{tasks.filter(isDone).length}<small>/{tasks.length}</small></b><span>tasks done</span></div>
            <div className={overdue.length ? 'bad' : ''}><b>{overdue.length}</b><span>overdue</span></div>
            <div><b>{inReview.length}</b><span>in review</span></div>
            <div><b>{dueThisWeek.length}</b><span>due this week</span></div>
          </div>
          <div className="ov-hero-side">
            <HealthPill health={dh.health} />
            {dh.byLead ? <p className="ov-note">“{dh.byLead.note || 'No note'}” — {dh.byLead.by}</p> : <p className="ov-note">Health is calculated from progress vs time and overdue tasks.</p>}
            {ms && <div className="ov-ms"><span>Next milestone</span><b>{ms.label}</b><em>{fmtLong(ms.date)}</em></div>}
          </div>
        </div>

        <section className="ov-card">
          <header><h4>Phases</h4><button className="pm-link" onClick={() => setTab('timeline')}>Timeline →</button></header>
          <div className="ov-phases">
            {(project.phases || []).map(ph => {
              const pts = tasks.filter(t => t.phase === ph.id);
              const p = pts.length ? projectProgress(pts) : 0;
              const s = pts.length ? pts.reduce((m, t) => (taskStart(t) < m ? taskStart(t) : m), taskStart(pts[0])) : '';
              const e = pts.length ? pts.reduce((m, t) => (t.targetDate > m ? t.targetDate : m), '') : '';
              const late = pts.some(t => !isDone(t) && t.targetDate < today);
              return (
                <div key={ph.id} className="ov-phase">
                  <span className="ov-phase-name"><i style={{ background: ph.color }} />{ph.name}</span>
                  <div className="ov-phase-bar"><span style={{ width: `${Math.round(p * 100)}%`, background: ph.color }} /></div>
                  <span className="ov-phase-meta">{Math.round(p * 100)}% · {pts.length ? `${fmtShort(s)} – ${fmtShort(e)}` : 'no tasks'}{late ? ' · 🔥' : ''}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="ov-two">
          <section className="ov-card">
            <header><h4>Needs attention</h4></header>
            {!overdue.length && !blocked.length && !inReview.length ? <p className="pm-empty-sm">Nothing stuck. 🎉</p> : (
              <ul className="ov-list">
                {overdue.slice(0, 6).map(t => <li key={'o' + t.id} onClick={() => openTask(t.id)}><span className="tag bad">Overdue {t.delayDays || diffDays(t.targetDate, today)}d</span>{t.taskDetails}<Avatars names={splitNames(t.assignedTo)} team={team} size={20} /></li>)}
                {blocked.slice(0, 4).map(t => <li key={'b' + t.id} onClick={() => openTask(t.id)}><span className="tag warn">🔒 Waiting</span>{t.taskDetails}<small>on {blockedBy(t, tasks).map(x => x.taskDetails).join(', ')}</small></li>)}
                {inReview.slice(0, 4).map(r => <li key={'r' + r.id} onClick={() => openTask(r.taskId)}><span className="tag info">Review v{r.version}</span>{r.taskTitle}<small>{r.stage === 'qc' ? 'final QC' : 'Lead review'} · {timeAgo(r.submittedAt)}</small></li>)}
              </ul>
            )}
          </section>
          <section className="ov-card">
            <header><h4>My tasks here</h4></header>
            {!mine.length ? <p className="pm-empty-sm">No open tasks for you in this project.</p> : (
              <ul className="ov-list">
                {mine.slice(0, 8).map(t => <li key={t.id} onClick={() => openTask(t.id)}><DueChip t={t} />{t.taskDetails}<small>{t.status}</small></li>)}
              </ul>
            )}
          </section>
        </div>
      </div>
      <aside className="ov-side">
        <section className="ov-card">
          <header><h4>Goal</h4><button className="pm-link" onClick={() => setTab('brief')}>Brief →</button></header>
          <p className="ov-goal">{project.brief?.objective || project.description || <span className="muted">No goal written yet.</span>}</p>
          {(project.kpis || []).length > 0 && (
            <div className="ov-kpis">
              {project.kpis.map(k => {
                const last = (k.history || []).slice().sort((a, b) => a.date.localeCompare(b.date)).pop();
                const v = last ? Number(last.value) : 0;
                const pct = k.target ? Math.min(1, v / k.target) : 0;
                return (
                  <div key={k.id || k.name} className="ov-kpi">
                    <span>{k.name}</span><b>{v.toLocaleString('en-IN')}{k.unit}</b><em>{k.target ? `of ${Number(k.target).toLocaleString('en-IN')}${k.unit || ''}` : 'no target set'}</em>
                    {k.target > 0 && <div className="ov-kpi-bar"><i style={{ width: `${pct * 100}%` }} /></div>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <section className="ov-card">
          <header><h4>Key dates</h4></header>
          <ul className="ov-keydates">
            {[...(project.milestones || []).map(m => ({ ...m, ms: true })), ...(project.keyDate ? [{ id: 'main', label: project.keyDateLabel || 'Key date', date: project.keyDate }] : [])]
              .sort((a, b) => a.date.localeCompare(b.date)).map(k => {
                const d = diffDays(todayYmd(), k.date);
                return <li key={k.id} className={d < 0 ? 'past' : ''}><i className={k.ms ? 'ms' : 'main'} /><span><b>{k.label}</b><small>{fmtLong(k.date)}</small></span><em>{d < 0 ? 'done' : d === 0 ? 'today' : d + 'd'}</em></li>;
              })}
          </ul>
        </section>
        <section className="ov-card">
          <header><h4>Team</h4><button className="pm-link" onClick={() => setTab('team')}>Manage →</button></header>
          <ul className="ov-team">
            <li><Av name={leadName} team={team} ring /><span><b>{leadName}</b><small>Project Lead</small></span></li>
            {(project.members || []).slice().sort((a, b) => (a.role === 'colead' ? 0 : 1) - (b.role === 'colead' ? 0 : 1)).map(m => { const t = team.find(x => x.id === m.id); return t ? <li key={m.id}><Av name={t.name} team={team} ring={m.role === 'colead'} /><span><b>{t.name}</b><small>{m.role === 'viewer' ? 'Viewer' : m.role === 'colead' ? 'Co-lead' : t.role || 'Member'}</small></span></li> : null; })}
          </ul>
        </section>
        {lastStatus && (
          <section className="ov-card">
            <header><h4>Latest status</h4><button className="pm-link" onClick={() => setTab('updates')}>All →</button></header>
            <HealthPill health={lastStatus.health} small /><p className="ov-note">{lastStatus.note}</p><small className="muted">{lastStatus.by} · {timeAgo(lastStatus.at)}</small>
          </section>
        )}
      </aside>
    </div>
  );
}

// ============================================================ TASK CARD + BOARD
function TaskCard({ t, ctx, draggable, onDragStart }) {
  const { tasks, reviews, team, project, openTask } = ctx;
  const ph = (project.phases || []).find(p => p.id === t.phase);
  const r = latestReview(reviews, t.id);
  const blocked = blockedBy(t, tasks);
  return (
    <div className={`pm-card ${isDone(t) ? 'done' : ''}`} draggable={draggable} onDragStart={onDragStart} onClick={() => openTask(t.id)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') openTask(t.id); }}>
      <div className="pm-card-top">
        {ph && <span className="pm-phase-dot" style={{ background: ph.color }} title={ph.name} />}
        {t.format && <span className="pm-fmt">{t.format}</span>}
        {t.priority === 'Urgent' || t.priority === 'High' ? <span className={`pm-pri ${t.priority.toLowerCase()}`}>{t.priority}</span> : null}
        {blocked.length > 0 && <span className="pm-lock" title={'Waiting for: ' + blocked.map(b => b.taskDetails).join(', ')}>🔒</span>}
      </div>
      <p className="pm-card-title">{t.taskDetails}</p>
      <div className="pm-card-foot">
        <Avatars names={splitNames(t.assignedTo)} team={team} size={22} max={3} />
        <span className="pm-eff" title={`Effort ${t.effort}`}>{t.effort}</span>
        {r && <span className={`pm-ver v-${r.status.toLowerCase()}`}>v{r.version}</span>}
        <DueChip t={t} />
      </div>
    </div>
  );
}

function Board({ ctx }) {
  const { tasks, reviews, canManage, me, setStatus, openTask, notify } = ctx;
  const [mineOnly, setMineOnly] = useState(false);
  const [over, setOver] = useState(null);
  const list = tasks.filter(t => !mineOnly || splitNames(t.assignedTo).includes(me.name));
  const cols = {};
  COLS.forEach(c => { cols[c.id] = []; });
  list.forEach(t => cols[boardColumn(t, reviews)].push(t));
  Object.values(cols).forEach(a => a.sort((x, y) => String(x.targetDate).localeCompare(String(y.targetDate))));
  const drop = (colId, e) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData('text/plain');
    const t = tasks.find(x => String(x.id) === id);
    if (!t) return;
    const from = boardColumn(t, reviews);
    if (from === colId) return;
    if (colId === 'review') { openTask(t.id); notify('Paste the link to your version to send it for review.'); return; }
    if (colId === 'approved') { notify('Approvals happen in Reviews — open the task to approve.'); return; }
    const status = colId === 'todo' ? 'Not Started' : colId === 'doing' ? 'In Progress' : 'Completed';
    if (!(canManage || splitNames(t.assignedTo).includes(me.name))) { notify('Only the people on this task or the Lead can move it.'); return; }
    setStatus(t, status);
  };
  return (
    <div className="bd-wrap">
      <div className="pm-toolbar"><label className="pm-switch"><input type="checkbox" checked={mineOnly} onChange={e => setMineOnly(e.target.checked)} /> Only my tasks</label><span className="muted">Drag cards between columns · drop on “In review” to submit a version</span></div>
      <div className="bd">
        {COLS.map(c => (
          <div key={c.id} className={`bd-col ${over === c.id ? 'over' : ''}`} onDragOver={e => { e.preventDefault(); setOver(c.id); }} onDragLeave={() => setOver(o => (o === c.id ? null : o))} onDrop={e => drop(c.id, e)}>
            <header style={{ '--cc': COL_COLORS[c.id] }}><i />{c.label}<span>{cols[c.id].length}</span></header>
            <div className="bd-cards">
              {cols[c.id].map(t => <TaskCard key={t.id} t={t} ctx={ctx} draggable onDragStart={e => e.dataTransfer.setData('text/plain', String(t.id))} />)}
              {!cols[c.id].length && <p className="bd-empty">{c.hint}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================ LIST
function QuickAdd({ ctx, phase }) {
  const { api, project, team, reload, notify, leadName } = ctx;
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: '', who: leadName, due: project.keyDate || todayYmd(), effort: 'M' });
  const save = async () => {
    if (!f.title.trim()) return;
    const r = await api('addProjectTask', { projectId: project.id, task: { taskDetails: f.title.trim(), assignedTo: [f.who], targetDate: f.due, start: todayYmd() < f.due ? todayYmd() : f.due, phase, effort: f.effort, priority: 'Medium', channel: 'Other' } });
    if (r.status === 'ok') { notify('Task added'); setF({ ...f, title: '' }); reload(); } else notify(r.message || 'Could not add the task.');
  };
  if (!open) return <button className="ls-add" onClick={() => setOpen(true)}>+ Add task</button>;
  return (
    <div className="ls-quick">
      <input autoFocus placeholder="Task name" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setOpen(false); }} />
      <select value={f.who} onChange={e => setF({ ...f, who: e.target.value })}>{team.filter(m => m.active !== false).map(m => <option key={m.id}>{m.name}</option>)}</select>
      <DateField value={f.due} onChange={v => setF({ ...f, due: v })} label="Due" />
      <select value={f.effort} onChange={e => setF({ ...f, effort: e.target.value })}>{EFFORTS.map(x => <option key={x.id} value={x.id}>{x.id}</option>)}</select>
      <button className="pm-btn primary sm" onClick={save}>Add</button><button className="pm-btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>
    </div>
  );
}

function ListView({ ctx }) {
  const { project, tasks, reviews, team, canManage, openTask, me } = ctx;
  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const today = todayYmd();
  const pass = (t) => filter === 'all' || (filter === 'open' && !isDone(t)) || (filter === 'mine' && splitNames(t.assignedTo).includes(me.name)) || (filter === 'late' && !isDone(t) && t.targetDate < today);
  const phases = [...(project.phases || []), ...(tasks.some(t => !(project.phases || []).find(p => p.id === t.phase)) ? [{ id: '__none', name: 'Other', color: '#94a3b8' }] : [])];
  return (
    <div className="ls">
      <div className="pm-toolbar">
        <div className="pm-seg">{[['all', 'All'], ['open', 'Open'], ['mine', 'Mine'], ['late', 'Overdue']].map(([id, l]) => <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{l}</button>)}</div>
      </div>
      {phases.map(ph => {
        const rows = tasks.filter(t => (ph.id === '__none' ? !(project.phases || []).find(p => p.id === t.phase) : t.phase === ph.id)).filter(pass)
          .sort((a, b) => String(a.targetDate).localeCompare(String(b.targetDate)));
        const all = tasks.filter(t => t.phase === ph.id);
        return (
          <section key={ph.id} className="ls-phase" style={{ '--pc': ph.color }}>
            <header onClick={() => setCollapsed(c => ({ ...c, [ph.id]: !c[ph.id] }))}>
              <span className="ls-caret">{collapsed[ph.id] ? '▸' : '▾'}</span><i />{ph.name}
              <small>{all.filter(isDone).length}/{all.length} done</small>
            </header>
            {!collapsed[ph.id] && (
              <div className="ls-rows">
                {rows.length > 0 && <div className="ls-row ls-th"><span>Task</span><span>People</span><span>Status</span><span>Review</span><span>Effort</span><span>Due</span></div>}
                {rows.map(t => {
                  const r = latestReview(reviews, t.id);
                  return (
                    <div key={t.id} className={`ls-row ${isDone(t) ? 'done' : ''}`} onClick={() => openTask(t.id)} role="button" tabIndex={0}>
                      <span className="ls-title">{isDone(t) ? '✓ ' : ''}{t.taskDetails}{blockedBy(t, tasks).length > 0 && <em title="Waiting for another task"> 🔒</em>}</span>
                      <span><Avatars names={splitNames(t.assignedTo)} team={team} size={22} max={3} /></span>
                      <span><span className={`pm-status s-${t.status.replace(/\s/g, '').toLowerCase()}`}>{t.status}</span></span>
                      <span>{r ? <span className={`pm-ver v-${r.status.toLowerCase()}`}>v{r.version} {r.status === 'Pending' ? (r.stage === 'qc' ? 'QC' : 'review') : r.status.toLowerCase()}</span> : <span className="muted">—</span>}</span>
                      <span className="pm-eff">{t.effort}</span>
                      <span><DueChip t={t} /></span>
                    </div>
                  );
                })}
                {!rows.length && <p className="pm-empty-sm">No tasks{filter !== 'all' ? ' match this filter' : ' yet'}.</p>}
                {canManage && ph.id !== '__none' && <QuickAdd ctx={ctx} phase={ph.id} />}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

// ============================================================ TIMELINE (Gantt)
function Timeline({ ctx }) {
  const { project, tasks, reviews, openTask, team } = ctx;
  const [zoom, setZoom] = useState('week');
  const scrollRef = useRef(null);
  const todayXRef = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = Math.max(0, todayXRef.current - 160);
  }, [zoom]);
  const dayW = zoom === 'day' ? 34 : zoom === 'week' ? 15 : 6;
  const LABEL_W = 250, ROW_H = 36, HEAD_H = 46;
  const today = todayYmd();
  const starts = tasks.map(taskStart).filter(Boolean);
  const ends = tasks.map(t => t.targetDate).filter(Boolean);
  const rangeStart = addDaysYmd([project.start, ...starts, today].filter(Boolean).sort()[0], -2);
  const rangeEnd = addDaysYmd([project.keyDate, ...(project.milestones || []).map(m => m.date), ...ends, today].filter(Boolean).sort().pop(), 5);
  const nDays = Math.max(7, diffDays(rangeStart, rangeEnd) + 1);
  const xOf = (d) => diffDays(rangeStart, d) * dayW;
  const rows = [];
  const phases = [...(project.phases || [])];
  if (tasks.some(t => !phases.find(p => p.id === t.phase))) phases.push({ id: '__none', name: 'Other', color: '#94a3b8' });
  phases.forEach(ph => {
    const ts = tasks.filter(t => (ph.id === '__none' ? !(project.phases || []).find(p => p.id === t.phase) : t.phase === ph.id))
      .sort((a, b) => String(taskStart(a)).localeCompare(String(taskStart(b))) || String(a.targetDate).localeCompare(String(b.targetDate)));
    if (!ts.length) return;
    rows.push({ kind: 'phase', ph, ts });
    ts.forEach(t => rows.push({ kind: 'task', t, ph }));
  });
  const rowIndex = {};
  rows.forEach((r, i) => { if (r.kind === 'task') rowIndex[String(r.t.id)] = i; });
  const width = nDays * dayW;
  const height = rows.length * ROW_H;
  todayXRef.current = xOf(today);

  const fillOf = (t) => {
    if (isDone(t)) return 1;
    const r = latestReview(reviews, t.id);
    if (r && r.status === 'Approved') return 0.9;
    if (r && r.status === 'Pending') return 0.7;
    return t.status === 'In Progress' ? 0.4 : t.status === 'On Hold' ? 0.2 : 0;
  };
  // header ticks
  const months = [];
  const days = [];
  for (let i = 0; i < nDays; i++) {
    const d = addDaysYmd(rangeStart, i);
    const dt = parseYmd(d);
    if (i === 0 || dt.getDate() === 1) {
      const daysInMonth = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
      const room = (daysInMonth - dt.getDate() + 1) * dayW;
      if (room >= 110 || dt.getDate() === 1) months.push({ x: i * dayW, label: dt.toLocaleDateString('en-IN', room >= 110 ? { month: 'long', year: 'numeric' } : { month: 'short' }) });
    }
    days.push({ d, x: i * dayW, dow: dt.getDay(), n: dt.getDate() });
  }
  const arrows = [];
  rows.forEach((r, i) => {
    if (r.kind !== 'task') return;
    (r.t.deps || []).forEach(dep => {
      const j = rowIndex[String(dep)];
      if (j === undefined) return;
      const pre = rows[j].t;
      const x1 = xOf(pre.targetDate) + dayW, y1 = j * ROW_H + ROW_H / 2;
      const x2 = xOf(taskStart(r.t) || r.t.targetDate), y2 = i * ROW_H + ROW_H / 2;
      const d = x2 >= x1 + 14
        ? `M${x1},${y1} H${x1 + 7} V${y2} H${x2 - 2}`
        : `M${x1},${y1} H${x1 + 7} V${y2 - (y2 > y1 ? ROW_H / 2 : -ROW_H / 2)} H${x2 - 9} V${y2} H${x2 - 2}`;
      arrows.push({ key: dep + '-' + r.t.id, d, late: !isDone(pre) && pre.targetDate < today });
    });
  });
  return (
    <div className="tl-wrap">
      <div className="pm-toolbar">
        <div className="pm-seg">{[['day', 'Days'], ['week', 'Weeks'], ['month', 'Months']].map(([id, l]) => <button key={id} className={zoom === id ? 'on' : ''} onClick={() => setZoom(id)}>{l}</button>)}</div>
        <button className="pm-btn ghost sm" onClick={() => { const el = scrollRef.current; if (el) el.scrollLeft = Math.max(0, xOf(today) - 160); }}>Today</button>
        <span className="tl-legend"><i className="lg-done" />Done <i className="lg-prog" />Progress <i className="lg-late" />Overdue <i className="lg-key" />{project.keyDateLabel || 'Key date'}</span>
      </div>
      {!rows.length ? <p className="pm-empty">No tasks to show yet.</p> : (
        <div className="tl" ref={scrollRef}>
          <div className="tl-inner" style={{ width: LABEL_W + width, height: HEAD_H + height }}>
            <div className="tl-head" style={{ height: HEAD_H }}>
              <div className="tl-corner" style={{ width: LABEL_W }}>Task</div>
              <div className="tl-scale" style={{ width }}>
                {months.map(m => <span key={m.x} className="tl-month" style={{ left: m.x }}>{m.label}</span>)}
                {[...(project.keyDate ? [{ id: 'main', label: project.keyDateLabel || 'Key date', date: project.keyDate, main: true }] : []), ...(project.milestones || [])].filter(m => m.date >= rangeStart && m.date <= rangeEnd).map(m => (
                  <span key={'k' + m.id} className={`tl-kflag ${m.main ? 'main' : ''}`} style={{ left: xOf(m.date) + dayW / 2 }}>◆ {m.label}</span>
                ))}
                {days.map(d => (zoom === 'day' || (zoom === 'week' && d.dow === 1) || (zoom === 'month' && (d.n === 1 || d.n === 15))) && (
                  <span key={d.d} className={`tl-day ${d.d === today ? 'today' : ''}`} style={{ left: d.x, width: zoom === 'day' ? dayW : 'auto' }}>{zoom === 'day' ? d.n : fmtShort(d.d)}</span>
                ))}
              </div>
            </div>
            <div className="tl-rows" style={{ height }}>
              <div className="tl-grid" style={{ left: LABEL_W, width, height }}>
                {zoom !== 'month' && days.filter(d => d.dow === 0).map(d => <span key={d.d} className="tl-sun" style={{ left: d.x, width: dayW }} />)}
                <span className="tl-today" style={{ left: xOf(today) + dayW / 2 }} title="Today" />
                {project.keyDate && <span className="tl-keyline" style={{ left: xOf(project.keyDate) + dayW / 2 }} title={project.keyDateLabel} />}
                {(project.milestones || []).filter(m => m.date >= rangeStart && m.date <= rangeEnd).map(m => <span key={m.id} className="tl-msline" style={{ left: xOf(m.date) + dayW / 2 }} title={m.label} />)}
              </div>
              {rows.map((r, i) => {
                if (r.kind === 'phase') {
                  const s = r.ts.reduce((m, t) => (taskStart(t) < m ? taskStart(t) : m), taskStart(r.ts[0]));
                  const e = r.ts.reduce((m, t) => (t.targetDate > m ? t.targetDate : m), '');
                  const p = projectProgress(r.ts);
                  return (
                    <div key={'ph' + r.ph.id} className="tl-row tl-phase-row" style={{ top: i * ROW_H, height: ROW_H }}>
                      <div className="tl-label phase" style={{ width: LABEL_W }}><i style={{ background: r.ph.color }} />{r.ph.name}<small>{Math.round(p * 100)}%</small></div>
                      <div className="tl-phasebar" style={{ left: LABEL_W + xOf(s), width: Math.max(dayW, xOf(e) - xOf(s) + dayW), background: r.ph.color }}><span style={{ width: `${p * 100}%` }} /></div>
                    </div>
                  );
                }
                const t = r.t;
                const s = taskStart(t) || t.targetDate;
                const late = !isDone(t) && t.targetDate < today;
                const w = Math.max(dayW, xOf(t.targetDate) - xOf(s) + dayW);
                const fill = fillOf(t);
                const names = splitNames(t.assignedTo);
                return (
                  <div key={t.id} className="tl-row" style={{ top: i * ROW_H, height: ROW_H }}>
                    <div className="tl-label" style={{ width: LABEL_W }} onClick={() => openTask(t.id)} title={t.taskDetails}>
                      <span className="tl-tname">{isDone(t) ? '✓ ' : ''}{t.taskDetails}</span><Avatars names={names} team={team} size={18} max={2} />
                    </div>
                    <button className={`tl-bar ${isDone(t) ? 'done' : ''} ${late ? 'late' : ''}`} style={{ left: LABEL_W + xOf(s), width: w, '--bc': r.ph.color }} onClick={() => openTask(t.id)} title={`${t.taskDetails}\n${fmtShort(s)} → ${fmtShort(t.targetDate)} · ${names.join(', ')}`}>
                      <span className="tl-fill" style={{ width: `${fill * 100}%` }} />
                      {w > 70 && <span className="tl-bar-txt">{t.taskDetails}</span>}
                      {late && <span className="tl-fire">🔥</span>}
                    </button>
                  </div>
                );
              })}
              <svg className="tl-arrows" style={{ left: LABEL_W, width, height }} width={width} height={height}>
                <defs><marker id="tl-arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#64748b" /></marker>
                  <marker id="tl-arr-late" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#d93025" /></marker></defs>
                {arrows.map(a => <path key={a.key} d={a.d} className={`tl-arrow ${a.late ? 'late' : ''}`} markerEnd={`url(#${a.late ? 'tl-arr-late' : 'tl-arr'})`} />)}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================ WORKLOAD
function Workload({ ctx }) {
  const { project, tasks, team, holidays, leaves, allTasks, allProjectTasks, canManage, api, reload, notify, openTask } = ctx;
  const [scope, setScope] = useState('all');
  const [span, setSpan] = useState(14);
  const [cell, setCell] = useState(null);
  const offInfo = useMemo(() => makeOffInfo(leaves, holidays), [leaves, holidays]);
  const people = [project.leadId, ...(project.members || []).filter(m => m.role !== 'viewer').map(m => m.id)]
    .map(id => team.find(m => m.id === id)).filter(Boolean);
  const days = [];
  for (let i = 0; i < span; i++) days.push(addDaysYmd(todayYmd(), i));
  const source = scope === 'project' ? tasks : [...(allTasks || []).filter(t => !t.projectId), ...(allProjectTasks || [])];
  const wl = useMemo(() => buildWorkload(source, people, days, offInfo), [source, people.map(p => p.id).join(), days.join(), offInfo]);
  const capOf = (p, d) => { const o = offInfo(p.id, d); return o.off ? 0 : o.half ? DAY_CAPACITY_H / 2 : DAY_CAPACITY_H; };
  const move = async (t, from, to) => {
    const names = splitNames(t.assignedTo).map(n => (n === from ? to : n)).filter((n, i, a) => a.indexOf(n) === i);
    const r = await api('updateProjectTasks', { projectId: project.id, items: [{ taskId: t.id, updates: { assignedTo: names } }] });
    if (r.status === 'ok') { notify(`Moved to ${to}`); setCell(null); reload(); } else notify(r.message || 'Could not move it.');
  };
  return (
    <div className="wl">
      <div className="pm-toolbar">
        <div className="pm-seg">{[['all', 'All their work'], ['project', 'This project only']].map(([id, l]) => <button key={id} className={scope === id ? 'on' : ''} onClick={() => setScope(id)}>{l}</button>)}</div>
        <div className="pm-seg">{[[7, '1 week'], [14, '2 weeks'], [28, '4 weeks']].map(([n, l]) => <button key={n} className={span === n ? 'on' : ''} onClick={() => setSpan(n)}>{l}</button>)}</div>
        <span className="wl-legend"><i className="wl-ok" />Comfortable <i className="wl-busy" />Busy (70%+) <i className="wl-over" />Overloaded <i className="wl-off" />Off / leave</span>
      </div>
      <p className="muted wl-note">Each person has {DAY_CAPACITY_H}h a day. Sundays, holidays, leaves and Saturday-offs from attendance are taken out automatically. Effort: S≈2h · M≈4h · L≈1 day · XL≈2 days{scope === 'all' ? ' · regular tasks ≈2h' : ''}.</p>
      <div className="wl-scroll">
        <table className="wl-table">
          <thead>
            <tr><th className="wl-name">Person</th>{days.map(d => { const dt = parseYmd(d); return <th key={d} className={dt.getDay() === 0 ? 'sun' : ''}><small>{dt.toLocaleDateString('en-IN', { weekday: 'narrow' })}</small>{dt.getDate()}</th>; })}<th>Total</th></tr>
          </thead>
          <tbody>
            {people.map(p => {
              let tot = 0, cap = 0;
              return (
                <tr key={p.id}>
                  <th className="wl-name"><Av name={p.name} team={team} size={24} /><span>{p.name}<small>{p.id === project.leadId ? 'Lead' : p.role}</small></span></th>
                  {days.map(d => {
                    const c = (wl[p.name] || {})[d];
                    const h = c ? c.hours : 0;
                    const capD = capOf(p, d);
                    tot += h; cap += capD;
                    const off = offInfo(p.id, d);
                    const lvl = off.off ? (h > 0 ? 'over' : 'off') : loadLevel(h, capD);
                    return (
                      <td key={d} className={`wl-cell l-${lvl}`} onClick={() => c && setCell({ p, d, c })} title={off.label || ''}>
                        {off.off && !h ? <span className="wl-offtxt">{off.label === 'Sunday' ? '' : off.label}</span> : h ? <b>{h < 10 ? h.toFixed(1).replace('.0', '') : Math.round(h)}h</b> : ''}
                      </td>
                    );
                  })}
                  <td className={`wl-total ${tot > cap ? 'over' : ''}`}>{Math.round(tot)}h<small>/{cap}h</small></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {cell && (
        <div className="pm-pop-overlay" onClick={() => setCell(null)}>
          <div className="pm-pop" onClick={e => e.stopPropagation()}>
            <header><b>{cell.p.name}</b> · {fmtLong(cell.d)}<button className="pm-x" onClick={() => setCell(null)}>✕</button></header>
            <p className="muted">{cell.c.hours.toFixed(1)}h planned of {capOf(cell.p, cell.d)}h</p>
            <ul className="wl-pop-list">
              {cell.c.tasks.map(({ task: t, hours }) => (
                <li key={t.id}>
                  <span className="wl-pop-t" onClick={() => { if (t.projectId === project.id) { openTask(t.id); setCell(null); } }}>{t.taskDetails}<small>{t.projectId ? (t.projectId === project.id ? 'this project' : 'another project') : 'regular task'} · due {fmtShort(t.targetDate)} · {hours.toFixed(1)}h today</small></span>
                  {canManage && t.projectId === project.id && (
                    <select defaultValue="" onChange={e => e.target.value && move(t, cell.p.name, e.target.value)} aria-label="Move to">
                      <option value="">Move to…</option>
                      {people.filter(x => x.name !== cell.p.name).map(x => <option key={x.id} value={x.name}>{x.name}</option>)}
                    </select>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================ REVIEWS
function Reviews({ ctx }) {
  const { reviews, tasks, openTask, canManage, isOwner, team } = ctx;
  const pending = reviews.filter(r => r.status === 'Pending').sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const changes = reviews.filter(r => r.status === 'Changes' && !reviews.some(x => x.taskId === r.taskId && x.version > r.version)).sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
  const approved = reviews.filter(r => r.status === 'Approved').sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
  const rounds = approved.length ? (approved.reduce((s, r) => s + r.version, 0) / approved.length) : 0;
  const Row = ({ r, kind }) => {
    const mine = (r.stage === 'lead' && canManage) || (r.stage === 'qc' && isOwner);
    return (
      <li className={`rv-row ${kind}`} onClick={() => openTask(r.taskId)} role="button" tabIndex={0}>
        <Av name={r.submittedBy} team={team} size={30} />
        <div className="rv-main"><b>{r.taskTitle || (tasks.find(t => String(t.id) === String(r.taskId)) || {}).taskDetails}</b>
          <small>v{r.version} by {r.submittedBy} · {timeAgo(kind === 'pending' ? r.submittedAt : r.decidedAt || r.submittedAt)}{r.comments.length ? ` · 💬 ${r.comments.length}` : ''}</small></div>
        {kind === 'pending' && <span className={`rv-stage ${mine ? 'me' : ''}`}>{r.stage === 'qc' ? 'Final QC' : 'Lead review'}{mine ? ' · you' : ''}</span>}
        {kind === 'changes' && <span className="rv-stage warn">Changes asked</span>}
        {kind === 'approved' && <span className="rv-stage ok">Approved{r.decidedBy ? ` by ${r.decidedBy}` : ''}</span>}
      </li>
    );
  };
  return (
    <div className="rv">
      <div className="rv-stats">
        <div><b>{pending.length}</b><span>waiting</span></div><div><b>{changes.length}</b><span>changes asked</span></div>
        <div><b>{approved.length}</b><span>approved</span></div><div><b>{rounds ? rounds.toFixed(1) : '—'}</b><span>avg. rounds</span></div>
      </div>
      <p className="muted">Flow: assignee submits a version (link) → Project Lead reviews → {ctx.project.settings?.qc === false ? 'approved' : 'final QC by PC / Shivendra → approved'}{ctx.project.settings?.autoCalendar === false ? '' : ' → added to the Content Calendar'}.</p>
      <h4 className="rv-h">Waiting for approval</h4>
      {pending.length ? <ul className="rv-list">{pending.map(r => <Row key={r.id} r={r} kind="pending" />)}</ul> : <p className="pm-empty-sm">Nothing waiting. 👌</p>}
      {changes.length > 0 && <><h4 className="rv-h">Changes requested</h4><ul className="rv-list">{changes.map(r => <Row key={r.id} r={r} kind="changes" />)}</ul></>}
      {approved.length > 0 && <><h4 className="rv-h">Approved</h4><ul className="rv-list">{approved.slice(0, 30).map(r => <Row key={r.id} r={r} kind="approved" />)}</ul></>}
    </div>
  );
}

// ============================================================ TASK DRAWER
function TaskDrawer({ ctx, task: t, onClose }) {
  const { project, tasks, reviews, team, me, canManage, isOwner, api, reload, notify, setStatus, openTask, channels } = ctx;
  const mine = splitNames(t.assignedTo).includes(me.name);
  const canEdit = canManage;
  const [f, setF] = useState(null);
  const [sub, setSub] = useState({ link: '', note: '' });
  const [cmt, setCmt] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setF({ taskDetails: t.taskDetails, assignedTo: splitNames(t.assignedTo), start: taskStart(t) || '', targetDate: t.targetDate || '', effort: t.effort || 'M', phase: t.phase || '',
      priority: t.priority || 'Medium', format: t.format || '', channel: t.channel && t.channel !== 'Other' ? t.channel : '', deps: (t.deps || []).map(String), remarks: t.remarks || '' });
  }, [t.id]);
  const versions = reviews.filter(r => String(r.taskId) === String(t.id)).sort((a, b) => b.version - a.version);
  const blocked = blockedBy(t, tasks);
  const dependents = tasks.filter(x => (x.deps || []).map(String).includes(String(t.id)));
  if (!f) return null;

  const save = async () => {
    if (!f.taskDetails.trim()) { notify('Task name is empty.'); return; }
    if (f.start && f.targetDate && f.targetDate < f.start) { notify('Due date is before the start date.'); return; }
    setBusy(true);
    const items = [{ taskId: t.id, updates: { taskDetails: f.taskDetails.trim(), assignedTo: f.assignedTo, start: f.start, targetDate: f.targetDate, effort: f.effort, phase: f.phase, priority: f.priority, format: f.format, channel: f.channel || 'Other', deps: f.deps, remarks: f.remarks } }];
    const shift = t.targetDate && f.targetDate ? diffDays(t.targetDate, f.targetDate) : 0;
    // Moving a task later can push the tasks that wait for it.
    if (shift > 0) {
      const chain = [];
      const seen = new Set([String(t.id)]);
      const walk = (id) => tasks.filter(x => (x.deps || []).map(String).includes(String(id)) && !isDone(x)).forEach(x => { if (!seen.has(String(x.id))) { seen.add(String(x.id)); chain.push(x); walk(x.id); } });
      walk(t.id);
      if (chain.length && window.confirm(`${chain.length} task${chain.length > 1 ? 's wait' : ' waits'} for this one (${chain.slice(0, 3).map(x => x.taskDetails).join(', ')}${chain.length > 3 ? '…' : ''}).\n\nMove ${chain.length > 1 ? 'them' : 'it'} ${shift} day${shift > 1 ? 's' : ''} later too?`)) {
        chain.forEach(x => items.push({ taskId: x.id, updates: { start: addDaysYmd(taskStart(x) || x.targetDate, shift), targetDate: addDaysYmd(x.targetDate, shift) } }));
      }
    }
    const r = await api('updateProjectTasks', { projectId: project.id, items });
    setBusy(false);
    if (r.status === 'ok') { notify(items.length > 1 ? `Saved · ${items.length - 1} dependent task${items.length > 2 ? 's' : ''} moved` : 'Saved'); reload(); } else notify(r.message || 'Could not save.');
  };
  const submit = async () => {
    setBusy(true);
    const r = await api('submitReview', { projectId: project.id, taskId: t.id, link: sub.link.trim(), note: sub.note.trim(), reviewId: 'r' + Date.now().toString(36) });
    setBusy(false);
    if (r.status === 'ok') { notify(r.stage === 'final' ? '✅ Version saved and approved' : `v${r.version || ''} sent for ${r.stage === 'qc' ? 'final QC' : 'review'}`); setSub({ link: '', note: '' }); reload(); } else notify(r.message || 'Could not submit.');
  };
  const decide = async (rv, decision) => {
    const comment = cmt[rv.id] || '';
    if (decision === 'changes' && !comment.trim()) { notify('Write what needs to change.'); return; }
    setBusy(true);
    const r = await api('decideReview', { reviewId: rv.id, decision, comment });
    setBusy(false);
    if (r.status === 'ok') { notify(decision === 'changes' ? 'Changes requested' : r.result === 'qc' ? 'Approved — sent for final QC' : '✅ Approved'); setCmt({ ...cmt, [rv.id]: '' }); reload(); } else notify(r.message || 'Could not save.');
  };
  const comment = async (rv) => {
    const text = (cmt[rv.id] || '').trim();
    if (!text) return;
    const m = text.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
    setBusy(true);
    const r = await api('commentReview', { reviewId: rv.id, text: m ? m[2] : text, at: m ? m[1] : '' });
    setBusy(false);
    if (r.status === 'ok') { setCmt({ ...cmt, [rv.id]: '' }); reload(); } else notify(r.message || 'Could not comment.');
  };
  const remind = async () => {
    try {
      const res = await fetch(ctx.apiUrl + '?action=remindTask&taskId=' + encodeURIComponent(t.id) + '&from=' + encodeURIComponent(me.name));
      const d = await res.json();
      notify(d.status === 'ok' ? '⏰ Reminder sent' : d.message || 'Could not remind.');
    } catch (e) { notify('Could not reach the server.'); }
  };
  const del = async () => {
    if (!window.confirm(`Delete “${t.taskDetails}”?`)) return;
    const r = await api('deleteProjectTask', { projectId: project.id, taskId: t.id });
    if (r.status === 'ok') { notify('Task deleted'); onClose(); reload(); } else notify(r.message || 'Could not delete.');
  };
  const canDecide = (rv) => rv.status === 'Pending' && ((rv.stage === 'lead' && canManage) || (rv.stage === 'qc' && isOwner));
  const allChannels = [];
  (channels?.groupOrder || []).forEach(g => (channels.groups[g] || []).forEach(c => allChannels.push(c)));

  return (
    <div className="dr-overlay" onClick={onClose}>
      <aside className="dr" onClick={e => e.stopPropagation()} role="dialog" aria-label="Task details">
        <header className="dr-head">
          <span className={`pm-status s-${t.status.replace(/\s/g, '').toLowerCase()}`}>{t.status}</span>
          <DueChip t={t} />
          <button className="pm-x" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="dr-body">
          {canEdit ? <textarea className="dr-title" rows={2} value={f.taskDetails} onChange={e => setF({ ...f, taskDetails: e.target.value })} /> : <h3 className="dr-title-ro">{t.taskDetails}</h3>}
          {(mine || canManage) && !isDone(t) && (
            <div className="dr-quick">
              {t.status === 'Not Started' && <button className="pm-btn ghost sm" onClick={() => setStatus(t, 'In Progress')}>▶ Start</button>}
              {t.status !== 'On Hold' && <button className="pm-btn ghost sm" onClick={() => setStatus(t, 'On Hold')}>⏸ Hold</button>}
              {t.status === 'On Hold' && <button className="pm-btn ghost sm" onClick={() => setStatus(t, 'In Progress')}>▶ Resume</button>}
              <button className="pm-btn ok sm" onClick={() => setStatus(t, 'Completed')}>✓ Mark done</button>
            </div>
          )}
          {isDone(t) && canManage && <div className="dr-quick"><button className="pm-btn ghost sm" onClick={() => setStatus(t, 'In Progress')}>↩ Reopen</button></div>}
          {blocked.length > 0 && <div className="dr-blocked">🔒 Waiting for: {blocked.map(b => <button key={b.id} className="pm-link" onClick={() => openTask(b.id)}>{b.taskDetails}</button>)}</div>}

          <div className="dr-grid">
            <label>People
              {canEdit ? (
                <div className="dr-people">
                  {f.assignedTo.map(n => <span key={n} className="dr-pchip">{n}<button onClick={() => setF({ ...f, assignedTo: f.assignedTo.filter(x => x !== n) })} aria-label={'Remove ' + n}>✕</button></span>)}
                  <select value="" onChange={e => e.target.value && setF({ ...f, assignedTo: [...f.assignedTo, e.target.value] })} aria-label="Add person">
                    <option value="">+ Add</option>{team.filter(m => m.active !== false && !f.assignedTo.includes(m.name)).map(m => <option key={m.id}>{m.name}</option>)}
                  </select>
                </div>
              ) : <span className="dr-people">{splitNames(t.assignedTo).map(n => <span key={n} className="dr-pchip ro"><Av name={n} team={team} size={20} />{n}</span>)}</span>}
            </label>
            <label>Phase
              {canEdit ? <select value={f.phase} onChange={e => setF({ ...f, phase: e.target.value })}>{(project.phases || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                : <span>{((project.phases || []).find(p => p.id === t.phase) || {}).name || '—'}</span>}
            </label>
            <label>Start{canEdit ? <DateField value={f.start} onChange={v => setF({ ...f, start: v })} label="Start" /> : <span>{fmtShort(taskStart(t))}</span>}</label>
            <label>Due{canEdit ? <DateField value={f.targetDate} onChange={v => setF({ ...f, targetDate: v })} label="Due" invalid={f.start && f.targetDate < f.start} /> : <span>{fmtShort(t.targetDate)}</span>}</label>
            <label>Effort{canEdit ? <select value={f.effort} onChange={e => setF({ ...f, effort: e.target.value })}>{EFFORTS.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select> : <span>{t.effort} · ~{EFFORT_HOURS[t.effort] || 4}h</span>}</label>
            <label>Priority{canEdit ? <select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>{['Low', 'Medium', 'High', 'Urgent'].map(x => <option key={x}>{x}</option>)}</select> : <span>{t.priority}</span>}</label>
            <label>Format{canEdit ? <select value={f.format} onChange={e => setF({ ...f, format: e.target.value })}><option value="">—</option>{FORMATS.map(x => <option key={x}>{x}</option>)}</select> : <span>{t.format || '—'}</span>}</label>
            <label>Channel{canEdit ? <select value={f.channel} onChange={e => setF({ ...f, channel: e.target.value })}><option value="">—</option>{allChannels.map(x => <option key={x}>{x}</option>)}</select> : <span>{t.channel && t.channel !== 'Other' ? t.channel : '—'}</span>}</label>
          </div>
          <label className="dr-full">Waits for (dependencies)
            {canEdit ? (
              <div className="dr-people">
                {f.deps.map(d => { const x = tasks.find(y => String(y.id) === d); return x ? <span key={d} className="dr-pchip">{x.taskDetails}<button onClick={() => setF({ ...f, deps: f.deps.filter(z => z !== d) })} aria-label="Remove dependency">✕</button></span> : null; })}
                <select value="" onChange={e => e.target.value && setF({ ...f, deps: [...f.deps, e.target.value] })} aria-label="Add dependency">
                  <option value="">+ Add</option>{tasks.filter(x => String(x.id) !== String(t.id) && !f.deps.includes(String(x.id))).map(x => <option key={x.id} value={String(x.id)}>{x.taskDetails}</option>)}
                </select>
              </div>
            ) : <span>{(t.deps || []).map(d => (tasks.find(y => String(y.id) === String(d)) || {}).taskDetails).filter(Boolean).join(', ') || '—'}</span>}
          </label>
          {dependents.length > 0 && <p className="dr-meta">Next up after this: {dependents.map(d => d.taskDetails).join(', ')}</p>}
          <label className="dr-full">Notes{canEdit ? <textarea rows={2} value={f.remarks} onChange={e => setF({ ...f, remarks: e.target.value })} /> : <span>{t.remarks || '—'}</span>}</label>
          {canEdit && (
            <div className="dr-actions">
              <button className="pm-btn primary" disabled={busy} onClick={save}>Save changes</button>
              {!isDone(t) && <button className="pm-btn ghost" onClick={remind}>⏰ Remind</button>}
              <button className="pm-btn ghost danger" onClick={del}>Delete</button>
            </div>
          )}

          <section className="dr-reviews">
            <h4>Versions & approvals</h4>
            {(mine || canManage) && !isDone(t) && (
              <div className="dr-submit">
                <input placeholder="Paste link to the new version (Drive, Frame.io, Canva…)" value={sub.link} onChange={e => setSub({ ...sub, link: e.target.value })} />
                <input placeholder="What changed? (optional)" value={sub.note} onChange={e => setSub({ ...sub, note: e.target.value })} />
                <button className="pm-btn primary sm" disabled={busy || !sub.link.trim()} onClick={submit}>Submit v{(versions[0]?.version || 0) + 1} for review</button>
              </div>
            )}
            {!versions.length && <p className="pm-empty-sm">No versions submitted yet.</p>}
            {versions.map(rv => (
              <div key={rv.id} className={`dr-ver st-${rv.status.toLowerCase()}`}>
                <div className="dr-ver-head">
                  <b>v{rv.version}</b>
                  <span className={`pm-ver v-${rv.status.toLowerCase()}`}>{rv.status === 'Pending' ? (rv.stage === 'qc' ? 'Final QC' : 'Lead review') : rv.status === 'Changes' ? 'Changes asked' : rv.status}</span>
                  <a href={rv.link} target="_blank" rel="noopener noreferrer">Open ↗</a>
                  <small>{rv.submittedBy} · {timeAgo(rv.submittedAt)}</small>
                </div>
                {rv.note && <p className="dr-ver-note">{rv.note}</p>}
                {rv.comments.length > 0 && (
                  <ul className="dr-cmts">{rv.comments.map((c, i) => <li key={i}><b>{c.by}</b>{c.ts && <span className="dr-ts">{c.ts}</span>}{c.kind === 'changes' && <span className="dr-kind">changes</span>}{c.text}<small>{timeAgo(c.at)}</small></li>)}</ul>
                )}
                {rv.status !== 'Superseded' && (
                  <div className="dr-cmt-box">
                    <input placeholder={canDecide(rv) ? 'Feedback — start with a time like 0:12 for a video moment' : 'Comment (start with 0:12 for a video moment)'} value={cmt[rv.id] || ''} onChange={e => setCmt({ ...cmt, [rv.id]: e.target.value })} onKeyDown={e => { if (e.key === 'Enter' && !canDecide(rv)) comment(rv); }} />
                    {canDecide(rv) ? (
                      <>
                        <button className="pm-btn ok sm" disabled={busy} onClick={() => decide(rv, 'approve')}>✓ Approve</button>
                        <button className="pm-btn warn sm" disabled={busy} onClick={() => decide(rv, 'changes')}>✎ Request changes</button>
                      </>
                    ) : <button className="pm-btn ghost sm" disabled={busy} onClick={() => comment(rv)}>Comment</button>}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </aside>
    </div>
  );
}

// ============================================================ REPORTS
function Reports({ ctx }) {
  const { project, tasks, reviews, team, api, reload, notify, canWork } = ctx;
  const today = todayYmd();
  const progress = projectProgress(tasks);
  const ot = onTimeRate(tasks);
  const burn = burnSeries(project, tasks);
  const overdue = tasks.filter(t => !isDone(t) && t.targetDate < today);
  const approved = reviews.filter(r => r.status === 'Approved');
  const rounds = approved.length ? approved.reduce((s, r) => s + r.version, 0) / approved.length : 0;
  const cols = { todo: 0, doing: 0, review: 0, approved: 0, done: 0 };
  tasks.forEach(t => { cols[boardColumn(t, reviews)]++; });
  const people = {};
  tasks.forEach(t => splitNames(t.assignedTo).forEach(n => {
    const p = people[n] || (people[n] = { done: 0, open: 0, late: 0 });
    if (isDone(t)) p.done++; else if (t.targetDate < today) p.late++; else p.open++;
  }));
  const fmt = {};
  tasks.filter(t => t.format).forEach(t => { const f = fmt[t.format] || (fmt[t.format] = { done: 0, open: 0 }); if (isDone(t)) f.done++; else f.open++; });
  const [kpiIn, setKpiIn] = useState({});
  const logKpi = async (k) => {
    const v = Number(kpiIn[k.id || k.name]);
    if (!kpiIn[k.id || k.name] || isNaN(v)) return;
    const kpis = (project.kpis || []).map(x => ((x.id || x.name) === (k.id || k.name) ? { ...x, history: [...(x.history || []).filter(h => h.date !== today), { date: today, value: v }] } : x));
    const r = await api('updateProject', { projectId: project.id, updates: { kpis } });
    if (r.status === 'ok') { notify('Number saved'); setKpiIn({ ...kpiIn, [k.id || k.name]: '' }); reload(); } else notify(r.message || 'Could not save.');
  };
  const end = projectEnd(project, tasks);
  return (
    <div className="rp">
      <div className="rp-kpis">
        <div><span>Progress</span><b>{Math.round(progress * 100)}%</b><em>{tasks.filter(isDone).length} of {tasks.length} tasks</em></div>
        <div><span>On-time delivery</span><b>{ot ? Math.round(ot.rate * 100) + '%' : '—'}</b><em>{ot ? `${ot.onTime} of ${ot.total} done on time` : 'no finished tasks yet'}</em></div>
        <div className={overdue.length ? 'bad' : ''}><span>Overdue now</span><b>{overdue.length}</b><em>{overdue.length ? 'oldest ' + Math.max(...overdue.map(t => diffDays(t.targetDate, today))) + 'd late' : 'all on schedule'}</em></div>
        <div><span>Review rounds</span><b>{rounds ? rounds.toFixed(1) : '—'}</b><em>avg. versions until approved</em></div>
        <div><span>{project.keyDateLabel || 'Key date'}</span><b>{project.keyDate ? (diffDays(today, project.keyDate) >= 0 ? diffDays(today, project.keyDate) + 'd' : 'passed') : '—'}</b><em>{fmtShort(project.keyDate)} · plan ends {fmtShort(end)}</em></div>
      </div>
      <div className="rp-grid">
        <section className="ov-card rp-wide">
          <header><h4>Burn-up — work done vs plan</h4><span className="rp-legend"><i className="lg-done" />Done <i className="lg-ideal" />Planned pace</span></header>
          <BurnUpChart points={burn.points} total={burn.total} />
          <p className="muted sm">Measured in effort points (S=1, M=2, L=4, XL=8). Above the dashed line = ahead of plan.</p>
        </section>
        <section className="ov-card">
          <header><h4>Where the work is</h4></header>
          <Donut label="tasks" parts={COLS.map(c => ({ label: c.label, value: cols[c.id], color: COL_COLORS[c.id] }))} />
        </section>
        <section className="ov-card">
          <header><h4>By person</h4><span className="rp-legend"><i style={{ background: '#059669' }} />Done <i style={{ background: '#93c5fd' }} />Open <i style={{ background: '#ef4444' }} />Overdue</span></header>
          <StackedBars rows={Object.keys(people).sort((a, b) => (people[b].done + people[b].open + people[b].late) - (people[a].done + people[a].open + people[a].late)).map(n => ({ label: n, parts: [{ value: people[n].done, color: '#059669', title: 'Done' }, { value: people[n].open, color: '#93c5fd', title: 'Open' }, { value: people[n].late, color: '#ef4444', title: 'Overdue' }] }))} />
        </section>
        <section className="ov-card">
          <header><h4>Output by format</h4></header>
          <StackedBars rows={Object.keys(fmt).map(k => ({ label: k, parts: [{ value: fmt[k].done, color: project.color, title: 'Published / done' }, { value: fmt[k].open, color: '#e2e8f0', title: 'Planned' }] }))} />
        </section>
        <section className="ov-card">
          <header><h4>Phases</h4></header>
          <StackedBars unit="%" rows={(project.phases || []).map(ph => { const pts = tasks.filter(t => t.phase === ph.id); const p = Math.round(projectProgress(pts) * 100); return { label: ph.name, parts: [{ value: pts.length ? p : 0, color: ph.color, title: 'Done' }] }; })} />
        </section>
        {(project.kpis || []).length > 0 && (
          <section className="ov-card rp-wide">
            <header><h4>Growth KPIs vs target</h4></header>
            <div className="rp-kpi-grid">
              {project.kpis.map(k => {
                const hist = (k.history || []).slice().sort((a, b) => a.date.localeCompare(b.date));
                const last = hist[hist.length - 1];
                const prev = hist[hist.length - 2];
                const v = last ? Number(last.value) : 0;
                const growth = prev && Number(prev.value) ? ((v - Number(prev.value)) / Number(prev.value)) * 100 : null;
                return (
                  <div key={k.id || k.name} className="rp-kpi">
                    <div className="rp-kpi-top"><span>{k.name}</span><b>{v.toLocaleString('en-IN')}{k.unit}</b><em>{k.target ? `target ${Number(k.target).toLocaleString('en-IN')}${k.unit || ''} · ${Math.round((v / k.target) * 100)}%` : 'no target set'}</em>
                      {growth !== null && <i className={growth >= 0 ? 'up' : 'down'}>{growth >= 0 ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}%</i>}</div>
                    <KpiChart kpi={k} />
                    {canWork && <div className="rp-kpi-in"><input type="number" placeholder="Today's number" value={kpiIn[k.id || k.name] || ''} onChange={e => setKpiIn({ ...kpiIn, [k.id || k.name]: e.target.value })} /><button className="pm-btn ghost sm" onClick={() => logKpi(k)}>Log</button></div>}
                  </div>
                );
              })}
            </div>
          </section>
        )}
        <section className="ov-card rp-wide">
          <header><h4>People on this project</h4></header>
          <div className="rp-people">
            {Object.keys(people).map(n => {
              const p = people[n];
              const ts = tasks.filter(t => splitNames(t.assignedTo).includes(n));
              const o = onTimeRate(ts);
              return <div key={n}><Av name={n} team={team} size={30} /><b>{n}</b><span>{p.done} done · {p.open + p.late} open{p.late ? ` · ${p.late} late` : ''}</span><em>{o ? `${Math.round(o.rate * 100)}% on time` : '—'}</em></div>;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================ UPDATES (status + activity)
function Updates({ ctx, dh }) {
  const { project, tasks, reviews, updates, canManage, api, reload, notify, team } = ctx;
  const snap = projectSnapshot(project, tasks, reviews);
  const [health, setHealth] = useState(dh.auto === 'done' || dh.auto === 'hold' ? 'ok' : dh.auto);
  const [note, setNote] = useState('');
  const [view, setView] = useState('status');
  const [busy, setBusy] = useState(false);
  const post = async () => {
    if (!note.trim()) { notify('Add a short note — what happened and what is next.'); return; }
    setBusy(true);
    const r = await api('postProjectUpdate', { projectId: project.id, health, note: note.trim(), snapshot: snap });
    setBusy(false);
    if (r.status === 'ok') { notify('Status posted — PC, Shivendra and the team are notified'); setNote(''); reload(); } else notify(r.message || 'Could not post.');
  };
  const statuses = updates.filter(u => u.type === 'status');
  const acts = updates.filter(u => u.type === 'activity');
  return (
    <div className="up">
      {canManage && project.status !== 'Completed' && (
        <section className="ov-card up-compose">
          <header><h4>Post this week's status</h4><span className="muted">Auto-suggested: <HealthPill health={snap.auto === 'done' || snap.auto === 'hold' ? 'ok' : snap.auto} small /></span></header>
          <div className="up-health">
            {['ok', 'risk', 'delayed'].map(h => <button key={h} className={`${HEALTH[h].cls} ${health === h ? 'on' : ''}`} onClick={() => setHealth(h)}><i />{HEALTH[h].label}</button>)}
          </div>
          <div className="up-auto">
            <span><b>{snap.progress}%</b> done</span><span><b>{snap.doneThisWeek.length}</b> finished this week</span><span className={snap.overdue.length ? 'bad' : ''}><b>{snap.overdue.length}</b> overdue</span><span><b>{snap.inReview}</b> in review</span>
          </div>
          <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="2 lines: what moved this week, what's blocked, what's next." />
          <div className="np-foot"><span className="muted">The numbers above are attached automatically.</span><button className="pm-btn primary" disabled={busy} onClick={post}>Post status</button></div>
        </section>
      )}
      <div className="pm-seg up-seg">{[['status', `Status updates (${statuses.length})`], ['activity', 'Activity log']].map(([id, l]) => <button key={id} className={view === id ? 'on' : ''} onClick={() => setView(id)}>{l}</button>)}</div>
      {view === 'status' && (!statuses.length ? <p className="pm-empty-sm">No status updates yet{canManage ? ' — post the first one above.' : '.'}</p> : (
        <div className="up-feed">
          {statuses.map(u => (
            <article key={u.id} className="up-item">
              <header><Av name={u.by} team={team} size={30} /><b>{u.by}</b><HealthPill health={u.health} small /><small>{new Date(u.at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {timeAgo(u.at)}</small></header>
              <p>{u.note}</p>
              {u.snapshot && (
                <div className="up-snap">
                  <span>{u.snapshot.progress}% done</span><span>{(u.snapshot.doneThisWeek || []).length} finished that week</span><span>{(u.snapshot.overdue || []).length} overdue</span>
                  {(u.snapshot.overdue || []).length > 0 && <small>Overdue: {u.snapshot.overdue.slice(0, 4).join(', ')}</small>}
                </div>
              )}
            </article>
          ))}
        </div>
      ))}
      {view === 'activity' && (
        <ul className="up-acts">
          {acts.slice(0, 200).map(a => <li key={a.id}><Av name={a.by} team={team} size={22} /><span><b>{a.by}</b> {a.note}</span><small>{timeAgo(a.at)}</small></li>)}
          {!acts.length && <li className="muted">No activity yet.</li>}
        </ul>
      )}
    </div>
  );
}

// ============================================================ BRIEF
const BRIEF_FIELDS = [
  ['objective', 'Objective', 'What does success look like? One or two lines.'],
  ['audience', 'Audience', 'Who are we talking to?'],
  ['keyMessage', 'Key message', 'The one thing people should remember.'],
  ['deliverables', 'Deliverables', 'e.g. 6 reels, 1 long-form, 10 carousels, 2 collab posts'],
  ['budget', 'Budget', 'e.g. ₹40,000 ads + ₹15,000 influencers'],
  ['dos', "Do's", 'Tone, words, visual style to use'],
  ['donts', "Don'ts", 'What to avoid'],
  ['references', 'References', 'Links to reference posts, mood boards…'],
];
function Brief({ ctx }) {
  const { project, canManage, api, reload, notify } = ctx;
  const [edit, setEdit] = useState(false);
  const [b, setB] = useState(project.brief || {});
  useEffect(() => { if (!edit) setB(project.brief || {}); }, [project.brief, edit]);
  const save = async () => {
    const r = await api('updateProject', { projectId: project.id, updates: { brief: b } });
    if (r.status === 'ok') { notify('Brief saved'); setEdit(false); reload(); } else notify(r.message || 'Could not save.');
  };
  const linkify = (txt) => String(txt || '').split(/(\s+)/).map((w, i) => (/^https?:\/\/\S+$/i.test(w) ? <a key={i} href={w} target="_blank" rel="noopener noreferrer">{w.replace(/^https?:\/\//, '').slice(0, 40)}↗</a> : w));
  const filled = BRIEF_FIELDS.filter(([k]) => String((project.brief || {})[k] || '').trim()).length;
  return (
    <div className="br">
      <div className="br-head">
        <div><h3>Project brief</h3><p className="muted">One page everyone works from · {filled}/{BRIEF_FIELDS.length} sections filled</p></div>
        {canManage && !edit && <button className="pm-btn primary sm" onClick={() => setEdit(true)}>✏️ Edit brief</button>}
      </div>
      <div className="br-grid">
        {BRIEF_FIELDS.map(([k, label, ph]) => (
          <section key={k} className={`br-sec ${k === 'objective' ? 'wide' : ''}`}>
            <h5>{label}</h5>
            {edit ? <textarea rows={k === 'objective' ? 2 : 3} value={b[k] || ''} placeholder={ph} onChange={e => setB({ ...b, [k]: e.target.value })} />
              : <p>{String((project.brief || {})[k] || '').trim() ? linkify(project.brief[k]) : <span className="muted">{ph}</span>}</p>}
          </section>
        ))}
      </div>
      {edit && <div className="np-foot"><button className="pm-btn ghost" onClick={() => setEdit(false)}>Cancel</button><button className="pm-btn primary" onClick={save}>Save brief</button></div>}
    </div>
  );
}

// ============================================================ FILES & LINKS
const LINK_CATS = ['Brand kit', 'References', 'Final deliverables', 'Other'];
function Files({ ctx }) {
  const { project, reviews, canWork, canManage, api, reload, notify, me } = ctx;
  const [f, setF] = useState({ label: '', url: '', cat: 'Brand kit' });
  const links = project.links || [];
  const add = async () => {
    const url = f.url.trim();
    if (!/^https?:\/\//i.test(url)) { notify('Paste a full link starting with https://'); return; }
    const r = await api('updateProject', { projectId: project.id, updates: { links: [...links, { id: 'l' + Date.now().toString(36), label: f.label.trim() || url.replace(/^https?:\/\//, '').slice(0, 50), url, cat: f.cat, by: me.name, at: new Date().toISOString() }] } });
    if (r.status === 'ok') { notify('Link added'); setF({ ...f, label: '', url: '' }); reload(); } else notify(r.message || 'Could not add.');
  };
  const remove = async (l) => {
    if (!window.confirm('Remove this link?')) return;
    const r = await api('updateProject', { projectId: project.id, updates: { links: links.filter(x => x.id !== l.id) } });
    if (r.status === 'ok') reload(); else notify(r.message || 'Could not remove.');
  };
  const approved = reviews.filter(r => r.status === 'Approved');
  return (
    <div className="fl">
      {canWork && (
        <div className="fl-add">
          <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })}>{LINK_CATS.map(c => <option key={c}>{c}</option>)}</select>
          <input placeholder="Name (e.g. Book cover — high-res)" value={f.label} onChange={e => setF({ ...f, label: e.target.value })} />
          <input placeholder="https://drive.google.com/…" value={f.url} onChange={e => setF({ ...f, url: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') add(); }} />
          <button className="pm-btn primary sm" onClick={add}>Add link</button>
        </div>
      )}
      <div className="fl-grid">
        {LINK_CATS.map(c => {
          const ls = links.filter(l => (l.cat || 'Other') === c);
          return (
            <section key={c} className="ov-card">
              <header><h4>{c === 'Brand kit' ? '🎨' : c === 'References' ? '🔖' : c === 'Final deliverables' ? '📦' : '🔗'} {c}</h4><span className="muted">{ls.length}</span></header>
              {!ls.length ? <p className="pm-empty-sm">Nothing here yet.</p> : (
                <ul className="fl-list">{ls.map(l => <li key={l.id}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a><small>{l.by}</small>{(canManage || l.by === me.name) && <button className="pm-x" onClick={() => remove(l)} aria-label="Remove">✕</button>}</li>)}</ul>
              )}
            </section>
          );
        })}
        <section className="ov-card">
          <header><h4>✅ Approved versions</h4><span className="muted">{approved.length}</span></header>
          {!approved.length ? <p className="pm-empty-sm">Approved deliverables appear here automatically.</p> : (
            <ul className="fl-list">{approved.map(r => <li key={r.id}><a href={r.link} target="_blank" rel="noopener noreferrer">{r.taskTitle} · v{r.version}</a><small>{fmtShort((r.decidedAt || '').slice(0, 10))}</small></li>)}</ul>
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================ TEAM
function TeamTab({ ctx }) {
  const { project, tasks, team, canManage, canChooseCoLeads, isOwner, api, reload, notify } = ctx;
  const [addId, setAddId] = useState('');
  const [addRole, setAddRole] = useState('member');
  const today = todayYmd();
  const members = project.members || [];
  const inProject = new Set([project.leadId, ...members.map(m => m.id)]);
  const save = async (updates, msg) => {
    const r = await api('updateProject', { projectId: project.id, updates });
    if (r.status === 'ok') { notify(msg); reload(); } else notify(r.message || 'Could not save.');
  };
  const statsOf = (name) => {
    const ts = tasks.filter(t => splitNames(t.assignedTo).includes(name));
    return { open: ts.filter(t => !isDone(t)).length, done: ts.filter(isDone).length, late: ts.filter(t => !isDone(t) && t.targetDate < today).length };
  };
  const lead = team.find(m => m.id === project.leadId);
  const Row = ({ m, roleLabel, memberRole }) => {
    const s = statsOf(m.name);
    return (
      <li className="tm-row">
        <Av name={m.name} team={team} size={34} ring={!memberRole} />
        <span className="tm-name"><b>{m.name}</b><small>{m.role}</small></span>
        <span className="tm-role">{roleLabel}</span>
        <span className="tm-stats">{s.open} open · {s.done} done{s.late ? <em> · {s.late} late</em> : ''}</span>
        {canManage && memberRole && (
          <span className="tm-acts">
            <select value={memberRole} disabled={memberRole === 'colead' && !canChooseCoLeads} onChange={e => save({ members: members.map(x => (x.id === m.id ? { ...x, role: e.target.value } : x)) }, 'Role changed')} aria-label="Role">
              {(canChooseCoLeads || memberRole === 'colead') && <option value="colead">Co-lead</option>}<option value="member">Member</option><option value="viewer">Viewer</option>
            </select>
            {(memberRole !== 'colead' || canChooseCoLeads) && <button className="pm-x" onClick={() => { if (window.confirm(`Remove ${m.name} from the project? Their tasks stay.`)) save({ members: members.filter(x => x.id !== m.id) }, `${m.name} removed`); }} aria-label={'Remove ' + m.name}>✕</button>}
          </span>
        )}
      </li>
    );
  };
  return (
    <div className="tm">
      <div className="tm-roles">
        <div><b>Owner</b><span>PC & Shivendra — see and change everything</span></div>
        <div><b>Lead</b><span>Runs the project: people, tasks, dates, reviews, status</span></div>
        <div><b>Co-lead</b><span>The Lead's helping hand — same powers, except choosing the Lead or co-leads</span></div>
        <div><b>Member</b><span>Works on tasks, submits versions, comments</span></div>
        <div><b>Viewer</b><span>Sees progress only</span></div>
      </div>
      <ul className="tm-list">
        {lead && <Row m={lead} roleLabel="Project Lead" />}
        {members.slice().sort((a, b) => (a.role === 'colead' ? 0 : 1) - (b.role === 'colead' ? 0 : 1)).map(x => { const m = team.find(y => y.id === x.id); return m ? <Row key={x.id} m={m} roleLabel={x.role === 'viewer' ? 'Viewer' : x.role === 'colead' ? 'Co-lead' : 'Member'} memberRole={x.role === 'viewer' ? 'viewer' : x.role === 'colead' ? 'colead' : 'member'} /> : null; })}
      </ul>
      {canManage && (
        <div className="tm-add">
          <select value={addId} onChange={e => setAddId(e.target.value)} aria-label="Person"><option value="">+ Add someone to the project…</option>{team.filter(m => m.active !== false && !inProject.has(m.id)).map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}</select>
          <select value={addRole} onChange={e => setAddRole(e.target.value)} aria-label="Role">{canChooseCoLeads && <option value="colead">Co-lead</option>}<option value="member">Member</option><option value="viewer">Viewer</option></select>
          <button className="pm-btn primary sm" disabled={!addId} onClick={() => { save({ members: [...members, { id: addId, role: addRole }] }, 'Added — they have been notified'); setAddId(''); }}>Add</button>
        </div>
      )}
      {isOwner && (
        <div className="tm-lead">
          <span>Change Project Lead</span>
          <select value={project.leadId} onChange={e => { const id = e.target.value; if (window.confirm(`Make ${(team.find(m => m.id === id) || {}).name} the Lead?`)) save({ leadId: id, members: [...members.filter(m => m.id !== id), { id: project.leadId, role: 'member' }] }, 'Lead changed'); }}>
            {team.filter(m => m.active !== false).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

// ============================================================ MODALS
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="pm-modal-overlay" onClick={onClose}>
      <div className={`pm-modal ${wide ? 'wide' : ''}`} onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
        <header><h3>{title}</h3><button className="pm-x" onClick={onClose} aria-label="Close">✕</button></header>
        <div className="pm-modal-body">{children}</div>
      </div>
    </div>
  );
}

function EditProject({ ctx, onClose }) {
  const { project, api, reload, notify } = ctx;
  const [f, setF] = useState({ milestones: (project.milestones || []).map(m => ({ ...m })), name: project.name, icon: project.icon, color: project.color, brand: project.brand, start: project.start, keyDate: project.keyDate, keyDateLabel: project.keyDateLabel || 'Key date',
    description: project.description || '', qc: project.settings?.qc !== false, autoCalendar: project.settings?.autoCalendar !== false, phases: (project.phases || []).map(p => ({ ...p })) });
  const save = async () => {
    if (!f.name.trim()) { notify('Name is empty.'); return; }
    if (f.milestones.some(m => !m.label.trim() || !m.date)) { notify('Every key date needs a name and a date.'); return; }
    const r = await api('updateProject', { projectId: project.id, updates: { milestones: f.milestones.map(m => ({ id: m.id, label: m.label.trim(), date: m.date })), name: f.name.trim(), icon: f.icon, color: f.color, brand: f.brand, start: f.start, keyDate: f.keyDate, keyDateLabel: f.keyDateLabel, description: f.description,
      settings: { ...(project.settings || {}), qc: f.qc, autoCalendar: f.autoCalendar }, phases: f.phases.filter(p => p.name.trim()) } });
    if (r.status === 'ok') { notify('Project updated'); onClose(); reload(); } else notify(r.message || 'Could not save.');
  };
  const movePh = (i, d) => { const p = f.phases.slice(); const j = i + d; if (j < 0 || j >= p.length) return; [p[i], p[j]] = [p[j], p[i]]; setF({ ...f, phases: p }); };
  return (
    <Modal title="Edit project" onClose={onClose} wide>
      <div className="np-form">
        <div className="np-row"><label className="np-field grow">Name<input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label><label className="np-field">Brand<input value={f.brand} onChange={e => setF({ ...f, brand: e.target.value })} /></label></div>
        <div className="np-row">
          <div className="np-field">Icon<div className="np-icons">{PROJECT_ICONS.map(i => <button key={i} type="button" className={f.icon === i ? 'on' : ''} onClick={() => setF({ ...f, icon: i })}>{i}</button>)}</div></div>
          <div className="np-field">Colour<div className="np-colors">{PROJECT_COLORS.map(c => <button key={c} type="button" aria-label={c} className={f.color === c ? 'on' : ''} style={{ background: c }} onClick={() => setF({ ...f, color: c })} />)}</div></div>
        </div>
        <div className="np-row">
          <label className="np-field">Starts<DateField value={f.start} onChange={v => setF({ ...f, start: v })} label="Starts" /></label>
        </div>
        <div className="np-field">Key dates
          <div className="np-keydates">
            <div className="np-kd main"><span className="np-kd-tag">Main</span><input className="np-kd-name" value={f.keyDateLabel} onChange={e => setF({ ...f, keyDateLabel: e.target.value })} aria-label="Key date name" /><DateField value={f.keyDate} onChange={v => setF({ ...f, keyDate: v })} label={f.keyDateLabel} /></div>
            {f.milestones.map((m, i) => (
              <div key={m.id} className="np-kd"><span className="np-kd-tag">◆</span>
                <input className="np-kd-name" value={m.label} placeholder="e.g. Cover reveal" onChange={e => setF({ ...f, milestones: f.milestones.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} aria-label="Key date name" />
                <DateField value={m.date} onChange={v => setF({ ...f, milestones: f.milestones.map((x, j) => (j === i ? { ...x, date: v } : x)) })} label={m.label || 'Key date'} />
                <button type="button" className="pm-x" onClick={() => setF({ ...f, milestones: f.milestones.filter((_, j) => j !== i) })} aria-label="Remove key date">✕</button>
              </div>
            ))}
            <button type="button" className="pm-btn ghost sm np-kd-add" onClick={() => setF({ ...f, milestones: [...f.milestones, { id: 'm' + Date.now().toString(36), label: '', date: f.keyDate }] })}>+ Add key date</button>
          </div>
          <small className="muted">Changing a date here doesn't move tasks — move tasks from the Timeline or List.</small>
        </div>
        <label className="np-field">Goal<input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label>
        <div className="np-field">Phases
          <div className="ep-phases">
            {f.phases.map((p, i) => (
              <div key={p.id} className="ep-ph">
                <input type="color" value={p.color} onChange={e => setF({ ...f, phases: f.phases.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)) })} aria-label="Phase colour" />
                <input value={p.name} onChange={e => setF({ ...f, phases: f.phases.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
                <button className="pm-x" onClick={() => movePh(i, -1)} aria-label="Move up">↑</button><button className="pm-x" onClick={() => movePh(i, 1)} aria-label="Move down">↓</button>
              </div>
            ))}
            <button className="pm-btn ghost sm" onClick={() => setF({ ...f, phases: [...f.phases, { id: 'ph' + Date.now().toString(36), name: 'New phase', color: '#2563eb' }] })}>+ Add phase</button>
          </div>
        </div>
        <div className="np-toggles">
          <label><input type="checkbox" checked={f.qc} onChange={e => setF({ ...f, qc: e.target.checked })} /> Final QC by PC / Shivendra after the Lead approves</label>
          <label><input type="checkbox" checked={f.autoCalendar} onChange={e => setF({ ...f, autoCalendar: e.target.checked })} /> Add approved content to the Content Calendar automatically</label>
        </div>
        <div className="np-foot"><button className="pm-btn ghost" onClick={onClose}>Cancel</button><button className="pm-btn primary" onClick={save}>Save</button></div>
      </div>
    </Modal>
  );
}

function SaveTemplate({ ctx, onClose, onSaved }) {
  const { project, tasks, team, api, notify } = ctx;
  const [name, setName] = useState(project.template && !project.template.startsWith('Copy') ? `${project.template} — our way` : project.name + ' playbook');
  const [desc, setDesc] = useState('');
  const save = async () => {
    const definition = projectToDefinition(project, tasks, team);
    const r = await api('saveProjectTemplate', { template: { name: name.trim(), icon: project.icon, color: project.color, description: desc.trim(), definition } });
    if (r.status === 'ok') { notify('📋 Template saved — it now appears in New project'); onClose(); onSaved && onSaved(); } else notify(r.message || 'Could not save.');
  };
  return (
    <Modal title="Save as template" onClose={onClose}>
      <p className="muted">Saves the phases, tasks, timing (relative to the {(project.keyDateLabel || 'key date').toLowerCase()}), effort and dependencies — not dates, people or comments.</p>
      <label className="np-field">Template name<input value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="np-field">Short description<input value={desc} onChange={e => setDesc(e.target.value)} placeholder="When should the team use this?" /></label>
      <p className="muted">{tasks.length} tasks · {(project.phases || []).length} phases</p>
      <div className="np-foot"><button className="pm-btn ghost" onClick={onClose}>Cancel</button><button className="pm-btn primary" disabled={!name.trim()} onClick={save}>Save template</button></div>
    </Modal>
  );
}

function ReportBody({ ctx }) {
  const { project, tasks, reviews, updates, team, leadName } = ctx;
  const today = todayYmd();
  const ot = onTimeRate(tasks);
  const approved = reviews.filter(r => r.status === 'Approved');
  const late = tasks.filter(t => isDone(t) && t.completionDate && t.targetDate && t.completionDate.slice(0, 10) > t.targetDate);
  const people = {};
  tasks.filter(isDone).forEach(t => splitNames(t.assignedTo).forEach(n => { people[n] = (people[n] || 0) + 1; }));
  const top = Object.keys(people).sort((a, b) => people[b] - people[a]).slice(0, 5);
  const statuses = updates.filter(u => u.type === 'status');
  return (
    <div className="fr">
      <div className="fr-head" style={{ borderColor: project.color }}>
        <span className="pw-icon">{project.icon}</span>
        <div><h2>{project.name}</h2><p>{project.brand} · Lead: {leadName} · {fmtLong(project.start)} → {project.closedAt ? fmtLong(project.closedAt.slice(0, 10)) : fmtLong(today)}</p></div>
      </div>
      {project.brief?.objective && <p className="fr-goal"><b>Goal:</b> {project.brief.objective}</p>}
      <div className="rp-kpis">
        <div><span>Delivered</span><b>{tasks.filter(isDone).length}/{tasks.length}</b><em>tasks</em></div>
        <div><span>On time</span><b>{ot ? Math.round(ot.rate * 100) + '%' : '—'}</b><em>{late.length} late</em></div>
        <div><span>Approved deliverables</span><b>{approved.length}</b><em>{approved.length ? (approved.reduce((s, r) => s + r.version, 0) / approved.length).toFixed(1) + ' rounds avg.' : ''}</em></div>
        <div><span>Status updates</span><b>{statuses.length}</b><em>posted</em></div>
      </div>
      {(project.kpis || []).length > 0 && (
        <table className="fr-table"><thead><tr><th>KPI</th><th>Target</th><th>Result</th><th>%</th></tr></thead>
          <tbody>{project.kpis.map(k => { const h = (k.history || []).slice().sort((a, b) => a.date.localeCompare(b.date)); const v = h.length ? Number(h[h.length - 1].value) : 0; return <tr key={k.id || k.name}><td>{k.name}</td><td>{Number(k.target || 0).toLocaleString('en-IN')}{k.unit}</td><td>{v.toLocaleString('en-IN')}{k.unit}</td><td>{k.target ? Math.round((v / k.target) * 100) + '%' : '—'}</td></tr>; })}</tbody>
        </table>
      )}
      <div className="fr-two">
        <div><h4>Top contributors</h4><ol>{top.map(n => <li key={n}>{n} — {people[n]} tasks</li>)}{!top.length && <li className="muted">—</li>}</ol></div>
        <div><h4>Delays</h4>{late.length ? <ul>{late.slice(0, 8).map(t => <li key={t.id}>{t.taskDetails} — {diffDays(t.targetDate, t.completionDate.slice(0, 10))}d late</li>)}</ul> : <p className="muted">No late deliveries.</p>}</div>
      </div>
      {project.retro && (
        <div className="fr-retro">
          <h4>Retrospective {project.retro.rating ? '· ' + '★'.repeat(project.retro.rating) + '☆'.repeat(5 - project.retro.rating) : ''}</h4>
          <p><b>What worked:</b> {project.retro.worked || '—'}</p><p><b>What didn't:</b> {project.retro.didnt || '—'}</p><p><b>Change next time:</b> {project.retro.change || '—'}</p>
        </div>
      )}
      <p className="fr-foot">WTC Hub · project report · {fmtLong(today)}</p>
    </div>
  );
}

function FinalReport({ ctx, onClose }) {
  return (
    <Modal title="Project report" onClose={onClose} wide>
      <div className="fr-print"><ReportBody ctx={ctx} /></div>
      <div className="np-foot"><button className="pm-btn ghost" onClick={onClose}>Close</button><button className="pm-btn primary" onClick={() => { document.body.classList.add('pm-printing'); window.print(); setTimeout(() => document.body.classList.remove('pm-printing'), 500); }}>⬇ Download / print PDF</button></div>
    </Modal>
  );
}

function CloseProject({ ctx, onClose }) {
  const { project, tasks, api, reload, notify } = ctx;
  const open = tasks.filter(t => !isDone(t));
  const [r, setR] = useState({ worked: '', didnt: '', change: '', rating: 4 });
  const close = async () => {
    const res = await api('closeProject', { projectId: project.id, retro: r });
    if (res.status === 'ok') { notify('🏁 Project closed — final report ready'); onClose(); reload(); } else notify(res.message || 'Could not close.');
  };
  return (
    <Modal title={`Close “${project.name}”`} onClose={onClose} wide>
      {open.length > 0 && <p className="pm-warn">⚠️ {open.length} task{open.length > 1 ? 's are' : ' is'} still open. They stay in people's task lists.</p>}
      <p className="muted">Three quick questions — they're saved in the final report and help the next project.</p>
      <label className="np-field">What worked well?<textarea rows={2} value={r.worked} onChange={e => setR({ ...r, worked: e.target.value })} /></label>
      <label className="np-field">What didn't?<textarea rows={2} value={r.didnt} onChange={e => setR({ ...r, didnt: e.target.value })} /></label>
      <label className="np-field">What will we change next time?<textarea rows={2} value={r.change} onChange={e => setR({ ...r, change: e.target.value })} /></label>
      <div className="np-field">Overall<div className="cp-stars">{[1, 2, 3, 4, 5].map(n => <button key={n} className={n <= r.rating ? 'on' : ''} onClick={() => setR({ ...r, rating: n })} aria-label={n + ' stars'}>★</button>)}</div></div>
      <div className="np-foot"><button className="pm-btn ghost" onClick={onClose}>Cancel</button><button className="pm-btn primary" onClick={close}>Close project 🏁</button></div>
    </Modal>
  );
}
