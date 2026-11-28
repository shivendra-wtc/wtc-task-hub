// Pure helpers for the Projects module (dates, progress, health, workload, reports).

export const EFFORT_POINTS = { S: 1, M: 2, L: 4, XL: 8 };
export const EFFORT_HOURS = { S: 2, M: 4, L: 8, XL: 16 };
export const DAY_CAPACITY_H = 8;

export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseYmd = (s) => (s ? new Date(String(s).slice(0, 10) + 'T12:00:00') : null);
export const todayYmd = () => ymd(new Date());
export const addDaysYmd = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
export const diffDays = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
export const fmtShort = (s) => (s ? parseYmd(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—');
export const fmtLong = (s) => (s ? parseYmd(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const timeAgo = (iso) => {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.round(h / 24);
  return d < 30 ? d + 'd ago' : new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
export const splitNames = (v) => String(v || '').split(',').map(s => s.trim()).filter(Boolean);
export const isDone = (t) => t.status === 'Completed';

export function taskStart(t) {
  return t.start || t.assignedDate || t.targetDate;
}

export function projectProgress(tasks) {
  let total = 0, done = 0;
  tasks.forEach(t => { const p = EFFORT_POINTS[t.effort] || 2; total += p; if (isDone(t)) done += p; });
  return total ? done / total : 0;
}

export function projectEnd(project, tasks) {
  let end = project.keyDate || '';
  tasks.forEach(t => { if (t.targetDate && (!end || t.targetDate > end)) end = t.targetDate; });
  return end || project.keyDate;
}

// 'ok' | 'risk' | 'delayed' | 'done' | 'hold'
export function autoHealth(project, tasks) {
  if (project.status === 'Completed') return 'done';
  if (project.status === 'On hold') return 'hold';
  const today = todayYmd();
  const progress = projectProgress(tasks);
  const start = project.start || today;
  const end = projectEnd(project, tasks) || today;
  const span = Math.max(1, diffDays(start, end));
  const expected = Math.min(1, Math.max(0, diffDays(start, today) / span));
  const overdue = tasks.filter(t => !isDone(t) && t.targetDate && t.targetDate < today).length;
  if (tasks.length && end < today && progress < 1) return 'delayed';
  if (progress < expected - 0.25 || overdue >= 3) return 'delayed';
  if (progress < expected - 0.1 || overdue > 0) return 'risk';
  return 'ok';
}

export const HEALTH = {
  ok: { label: 'On track', dot: '🟢', cls: 'h-ok' },
  risk: { label: 'At risk', dot: '🟡', cls: 'h-risk' },
  delayed: { label: 'Delayed', dot: '🔴', cls: 'h-bad' },
  done: { label: 'Completed', dot: '✅', cls: 'h-done' },
  hold: { label: 'On hold', dot: '⏸', cls: 'h-hold' },
};

// The Lead's latest status (if posted in the last 8 days) wins over the automatic one.
export function displayHealth(project, tasks, updates) {
  const auto = autoHealth(project, tasks);
  if (auto === 'done' || auto === 'hold') return { health: auto, auto, byLead: null };
  const last = updates.find(u => u.projectId === project.id && u.type === 'status');
  if (last && (Date.now() - new Date(last.at).getTime()) < 8 * 86400000) return { health: last.health, auto, byLead: last };
  return { health: auto, auto, byLead: null };
}

export function latestReview(reviews, taskId) {
  let best = null;
  reviews.forEach(r => {
    if (String(r.taskId) !== String(taskId) || r.status === 'Superseded') return;
    if (!best || r.version > best.version) best = r;
  });
  return best;
}

// Board column for a task: todo | doing | review | approved | done
export function boardColumn(t, reviews) {
  if (isDone(t)) return 'done';
  const r = latestReview(reviews, t.id);
  if (r && r.status === 'Pending') return 'review';
  if (r && r.status === 'Approved') return 'approved';
  if (t.status === 'Not Started' && !r) return 'todo';
  return 'doing';
}

export function blockedBy(t, allTasks) {
  return (t.deps || []).map(d => allTasks.find(x => String(x.id) === String(d))).filter(x => x && !isDone(x));
}

export function nextMilestone(project, tasks) {
  const today = todayYmd();
  const open = tasks.filter(t => !isDone(t) && t.targetDate).sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  const phaseEnds = (project.phases || []).map(ph => {
    const pts = tasks.filter(t => t.phase === ph.id);
    if (!pts.length || pts.every(isDone)) return null;
    const end = pts.reduce((m, t) => (t.targetDate > m ? t.targetDate : m), '');
    return { label: ph.name, date: end };
  }).filter(Boolean);
  (project.milestones || []).forEach(m => { if (m.date >= today) phaseEnds.push({ label: '◆ ' + m.label, date: m.date }); });
  phaseEnds.sort((a, b) => a.date.localeCompare(b.date));
  if (phaseEnds.length) return phaseEnds[0];
  if (open.length) return { label: open[0].taskDetails, date: open[0].targetDate };
  if (project.keyDate && project.keyDate >= today) return { label: project.keyDateLabel || 'Key date', date: project.keyDate };
  return null;
}

// ---------- Workload (attendance-aware) ----------
// offInfo(userId, date) → { off: bool, half: bool, label }
export function makeOffInfo(leaves, holidays) {
  const leaveMap = {};
  (leaves || []).forEach(l => { leaveMap[l.date + '|' + l.userId] = l.type; });
  const hol = {};
  (holidays || []).forEach(h => { const d = String(h.date || '').slice(0, 10); if (d) hol[d] = h.name || 'Holiday'; });
  return (userId, date) => {
    const day = parseYmd(date).getDay();
    if (day === 0) return { off: true, label: 'Sunday' };
    if (hol[date]) return { off: true, label: hol[date] };
    const lt = leaveMap[date + '|' + userId];
    if (lt === 'Half Day') return { off: false, half: true, label: 'Half day' };
    if (lt === 'Saturday Off') return { off: true, label: 'Sat off' };
    if (lt && lt !== 'Work From Home' && lt !== 'Official Duty') return { off: true, label: 'Leave' };
    return { off: false };
  };
}

// Spreads each open task's hours across its assignees' working days (start→due).
// Returns { [name]: { [date]: { hours, tasks:[{task, hours}] } } }
export function buildWorkload(tasks, people, days, offInfo) {
  const today = todayYmd();
  const byName = {};
  people.forEach(p => { byName[p.name] = {}; });
  const dayIndex = new Set(days);
  tasks.forEach(t => {
    if (isDone(t) || !t.targetDate) return;
    const names = splitNames(t.assignedTo).filter(n => byName[n]);
    if (!names.length) return;
    const hours = (t.projectId ? (EFFORT_HOURS[t.effort] || 4) : 2) / names.length;
    names.forEach(n => {
      const person = people.find(p => p.name === n);
      let from = taskStart(t);
      if (!from || from < today) from = today;
      let to = t.targetDate < today ? today : t.targetDate;
      if (from > to) from = to;
      const work = [];
      for (let d = from; d <= to; d = addDaysYmd(d, 1)) { if (!offInfo(person.id, d).off) work.push(d); if (work.length > 60) break; }
      if (!work.length) work.push(to);
      const per = hours / work.length;
      work.forEach(d => {
        if (!dayIndex.has(d)) return;
        const cell = byName[n][d] || (byName[n][d] = { hours: 0, tasks: [] });
        cell.hours += per;
        cell.tasks.push({ task: t, hours: per });
      });
    });
  });
  return byName;
}

export function loadLevel(hours, cap) {
  if (cap <= 0) return hours > 0 ? 'over' : 'off';
  const r = hours / cap;
  if (r > 1.0001) return 'over';
  if (r >= 0.7) return 'busy';
  if (r > 0) return 'ok';
  return 'free';
}

// ---------- Reports ----------
export function burnSeries(project, tasks) {
  let start = project.start || todayYmd();
  tasks.forEach(t => {
    const c = isDone(t) && t.completionDate ? t.completionDate.slice(0, 10) : '';
    if (c && c < start) start = c;
  });
  const end = projectEnd(project, tasks) || todayYmd();
  const total = tasks.reduce((s, t) => s + (EFFORT_POINTS[t.effort] || 2), 0);
  const today = todayYmd();
  const last = end > today ? end : today;
  const span = Math.max(1, diffDays(start, last));
  const step = Math.max(1, Math.ceil(span / 40));
  const pts = [];
  for (let i = 0; i <= span; i += step) {
    const d = addDaysYmd(start, i);
    const doneUpTo = d <= today ? tasks.reduce((s, t) => s + (isDone(t) && t.completionDate && t.completionDate.slice(0, 10) <= d ? (EFFORT_POINTS[t.effort] || 2) : 0), 0) : null;
    const ideal = total * Math.min(1, diffDays(start, d) / Math.max(1, diffDays(start, end)));
    pts.push({ date: d, done: doneUpTo, ideal, total });
  }
  if (pts[pts.length - 1].date !== last) {
    const doneNow = tasks.reduce((s, t) => s + (isDone(t) ? (EFFORT_POINTS[t.effort] || 2) : 0), 0);
    pts.push({ date: last, done: last <= today ? doneNow : null, ideal: total, total });
  }
  return { points: pts, total };
}

export function onTimeRate(tasks) {
  const done = tasks.filter(t => isDone(t) && t.completionDate && t.targetDate);
  if (!done.length) return null;
  const onTime = done.filter(t => t.completionDate.slice(0, 10) <= t.targetDate).length;
  return { rate: onTime / done.length, onTime, total: done.length };
}

export function projectSnapshot(project, tasks, reviews) {
  const today = todayYmd();
  const weekAgo = addDaysYmd(today, -7);
  return {
    progress: Math.round(projectProgress(tasks) * 100),
    total: tasks.length,
    done: tasks.filter(isDone).length,
    doneThisWeek: tasks.filter(t => isDone(t) && (t.completionDate || '').slice(0, 10) >= weekAgo).map(t => t.taskDetails).slice(0, 12),
    overdue: tasks.filter(t => !isDone(t) && t.targetDate && t.targetDate < today).map(t => t.taskDetails).slice(0, 12),
    inReview: reviews.filter(r => r.projectId === project.id && r.status === 'Pending').length,
    auto: autoHealth(project, tasks),
  };
}
