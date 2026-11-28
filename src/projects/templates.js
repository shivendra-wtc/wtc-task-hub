// Built-in project templates.
// Every task is placed relative to the project's KEY DATE (launch day, release day…):
//   s = start offset in days, d = due offset in days (negative = before the key date)
//   e = effort (S ≈ 2h, M ≈ 4h, L ≈ 8h, XL ≈ 16h), dep = indexes of tasks it waits for,
//   role = who usually does it (matched to the team by their role), fmt = content format.

const P = (id, name, color) => ({ id, name, color });

export const BUILTIN_TEMPLATES = [
  {
    id: 'book', name: 'Book Promotion', icon: '📕', color: '#b45309', accent: '#fef3c7',
    tagline: 'Launch a book with a 6-week buzz-to-reviews campaign',
    description: 'Teasers, cover reveal, author content, pre-order push, launch week and reader reviews — the full playbook for a book launch.',
    keyDateLabel: 'Launch date',
    milestones: [{ id: 'cover', label: 'Cover reveal', offset: -19, phase: 'reveal' }],
    kpis: [{ name: 'Pre-orders', unit: '' }, { name: 'Reel views', unit: '' }, { name: 'Followers gained', unit: '' }],
    phases: [P('plan', 'Plan & brief', '#475569'), P('buzz', 'Pre-launch buzz', '#7c3aed'), P('reveal', 'Cover reveal & pre-orders', '#d97706'), P('launch', 'Launch week', '#dc2626'), P('post', 'Post-launch & reviews', '#059669')],
    tasks: [
      { t: 'Finalise campaign brief & key messages', ph: 'plan', s: -42, d: -39, e: 'S', role: 'lead', pr: 'High' },
      { t: 'Collect assets — cover files, author photos, blurb', ph: 'plan', s: -41, d: -38, e: 'S', role: 'lead' },
      { t: 'Build the 6-week content calendar', ph: 'plan', s: -39, d: -35, e: 'M', dep: [0], role: 'social' },
      { t: 'Set KPI targets (pre-orders, views, followers)', ph: 'plan', s: -39, d: -37, e: 'S', role: 'lead' },
      { t: 'Teaser reel — the story hook', ph: 'buzz', s: -35, d: -30, e: 'M', dep: [2], role: 'video', fmt: 'Reel', pr: 'High' },
      { t: 'Author introduction carousel', ph: 'buzz', s: -33, d: -29, e: 'M', dep: [1], role: 'design', fmt: 'Carousel' },
      { t: 'Behind-the-book Shorts (3 parts)', ph: 'buzz', s: -30, d: -22, e: 'L', dep: [4], role: 'video', fmt: 'Short' },
      { t: 'Countdown & poll story series', ph: 'buzz', s: -28, d: -15, e: 'S', role: 'social', fmt: 'Story' },
      { t: 'Newsletter / blog announcement', ph: 'buzz', s: -30, d: -25, e: 'M', role: 'writer' },
      { t: 'Cover reveal reel', ph: 'reveal', s: -22, d: -19, e: 'M', dep: [1], role: 'video', fmt: 'Reel', pr: 'High' },
      { t: 'Cover reveal post + carousel', ph: 'reveal', s: -22, d: -19, e: 'S', dep: [1], role: 'design', fmt: 'Carousel' },
      { t: 'Pre-order links live + bio update', ph: 'reveal', s: -22, d: -20, e: 'S', role: 'lead', pr: 'High' },
      { t: 'Pre-order ad creatives', ph: 'reveal', s: -20, d: -16, e: 'M', dep: [10], role: 'design', fmt: 'Ad' },
      { t: 'Influencer & collab outreach', ph: 'reveal', s: -24, d: -14, e: 'M', role: 'pr' },
      { t: 'Author interview — YouTube long-form', ph: 'reveal', s: -20, d: -9, e: 'XL', role: 'video', fmt: 'Long Video', pr: 'High' },
      { t: 'Press note for media', ph: 'reveal', s: -14, d: -8, e: 'M', role: 'pr' },
      { t: '7-day launch countdown stories', ph: 'launch', s: -7, d: 0, e: 'S', role: 'social', fmt: 'Story' },
      { t: 'Launch-day reel + post', ph: 'launch', s: -6, d: 0, e: 'M', dep: [9], role: 'video', fmt: 'Reel', pr: 'Urgent' },
      { t: 'Launch-day live / premiere', ph: 'launch', s: -3, d: 0, e: 'M', role: 'lead', fmt: 'Live' },
      { t: 'Launch announcement on every channel', ph: 'launch', s: 0, d: 0, e: 'S', dep: [17], role: 'social', pr: 'Urgent' },
      { t: 'Thank-you & milestone posts', ph: 'post', s: 1, d: 4, e: 'S', role: 'design', fmt: 'Post' },
      { t: 'Reader review reels (compilation)', ph: 'post', s: 3, d: 14, e: 'L', role: 'video', fmt: 'Reel' },
      { t: 'Quote cards from the book (5)', ph: 'post', s: 2, d: 10, e: 'M', role: 'design', fmt: 'Carousel' },
      { t: 'Collab posts go live', ph: 'post', s: 2, d: 12, e: 'M', dep: [13], role: 'pr' },
      { t: 'Campaign wrap-up report', ph: 'post', s: 18, d: 21, e: 'S', role: 'lead' },
    ],
  },
  {
    id: 'yt', name: 'YouTube Series', icon: '🎬', color: '#dc2626', accent: '#fee2e2',
    tagline: 'Research to release for a multi-episode series',
    description: 'Topic research, scripts, shoots, edits, thumbnails and SEO, then a release plan with Shorts cut-downs.',
    keyDateLabel: 'Episode 1 release',
    milestones: [{ id: 'shoot', label: 'Shoot day', offset: -16, phase: 'shoot' }],
    kpis: [{ name: 'Views', unit: '' }, { name: 'Watch hours', unit: 'h' }, { name: 'Subscribers gained', unit: '' }],
    phases: [P('research', 'Research & scripts', '#475569'), P('shoot', 'Production', '#7c3aed'), P('edit', 'Post-production', '#2563eb'), P('release', 'Release & promotion', '#059669')],
    tasks: [
      { t: 'Topic research & episode list', ph: 'research', s: -28, d: -25, e: 'M', role: 'writer', pr: 'High' },
      { t: 'Scripts — episodes 1–3', ph: 'research', s: -25, d: -19, e: 'XL', dep: [0], role: 'writer' },
      { t: 'Script review & sign-off', ph: 'research', s: -19, d: -17, e: 'S', dep: [1], role: 'lead' },
      { t: 'Shoot plan, location & props', ph: 'shoot', s: -18, d: -16, e: 'S', role: 'lead' },
      { t: 'Shoot episodes 1–3', ph: 'shoot', s: -16, d: -13, e: 'XL', dep: [2, 3], role: 'video', pr: 'High' },
      { t: 'Edit episode 1', ph: 'edit', s: -13, d: -8, e: 'XL', dep: [4], role: 'video', fmt: 'Long Video', pr: 'High' },
      { t: 'Edit episodes 2–3', ph: 'edit', s: -10, d: -2, e: 'XL', dep: [4], role: 'video', fmt: 'Long Video' },
      { t: 'Thumbnails (3 options per episode)', ph: 'edit', s: -9, d: -4, e: 'M', dep: [2], role: 'design', fmt: 'Thumbnail' },
      { t: 'Titles, descriptions, tags (SEO)', ph: 'edit', s: -6, d: -3, e: 'M', dep: [2], role: 'writer' },
      { t: 'Episode 1 premiere', ph: 'release', s: -1, d: 0, e: 'S', dep: [5, 7, 8], role: 'lead', fmt: 'Long Video', pr: 'Urgent' },
      { t: 'Shorts cut-downs (3 per episode)', ph: 'release', s: -5, d: 5, e: 'L', dep: [5], role: 'video', fmt: 'Short' },
      { t: 'Community post & Insta teaser', ph: 'release', s: -2, d: 0, e: 'S', role: 'social', fmt: 'Reel' },
      { t: 'Episode 2 & 3 release', ph: 'release', s: 5, d: 14, e: 'S', dep: [6], role: 'lead', fmt: 'Long Video' },
      { t: 'Series performance report', ph: 'release', s: 18, d: 21, e: 'S', role: 'lead' },
    ],
  },
  {
    id: 'festival', name: 'Festival Campaign', icon: '🪔', color: '#ea580c', accent: '#ffedd5',
    tagline: 'Seasonal content and ads timed to the big day',
    description: 'Plan, produce and schedule festival content across channels, with ads and a same-day live moment.',
    keyDateLabel: 'Festival day',
    kpis: [{ name: 'Reach', unit: '' }, { name: 'Engagement', unit: '' }, { name: 'Shares', unit: '' }],
    phases: [P('plan', 'Plan', '#475569'), P('make', 'Creative production', '#7c3aed'), P('schedule', 'Schedule & ads', '#2563eb'), P('day', 'Festival day', '#dc2626'), P('wrap', 'Wrap-up', '#059669')],
    tasks: [
      { t: 'Campaign idea & content list', ph: 'plan', s: -21, d: -18, e: 'M', role: 'lead', pr: 'High' },
      { t: 'Story / mythology research', ph: 'plan', s: -20, d: -16, e: 'M', role: 'writer' },
      { t: 'Festival reel script', ph: 'make', s: -16, d: -13, e: 'M', dep: [1], role: 'writer' },
      { t: 'Festival reel edit', ph: 'make', s: -13, d: -7, e: 'L', dep: [2], role: 'video', fmt: 'Reel', pr: 'High' },
      { t: 'Greeting creatives (all brands)', ph: 'make', s: -12, d: -6, e: 'M', dep: [0], role: 'design', fmt: 'Post' },
      { t: 'Carousel — meaning & rituals', ph: 'make', s: -12, d: -6, e: 'M', dep: [1], role: 'design', fmt: 'Carousel' },
      { t: 'Schedule posts on every channel', ph: 'schedule', s: -5, d: -3, e: 'S', dep: [3, 4, 5], role: 'social' },
      { t: 'Boost / ad set-up', ph: 'schedule', s: -4, d: -2, e: 'S', dep: [3], role: 'lead', fmt: 'Ad' },
      { t: 'Festival-day posts go live', ph: 'day', s: 0, d: 0, e: 'S', dep: [6], role: 'social', pr: 'Urgent' },
      { t: 'Live stories & comment replies', ph: 'day', s: 0, d: 0, e: 'S', role: 'social', fmt: 'Story' },
      { t: 'Results summary', ph: 'wrap', s: 2, d: 5, e: 'S', role: 'lead' },
    ],
  },
  {
    id: 'collab', name: 'Brand Collaboration', icon: '🤝', color: '#0f766e', accent: '#ccfbf1',
    tagline: 'Brief to brand report for a paid partnership',
    description: 'Contract, script approval, shoot, brand review rounds, publishing and the results report for the brand.',
    keyDateLabel: 'Go-live date',
    milestones: [{ id: 'approval', label: 'Brand script approval', offset: -10, phase: 'script' }],
    kpis: [{ name: 'Views', unit: '' }, { name: 'Link clicks', unit: '' }, { name: 'Engagement rate', unit: '%' }],
    phases: [P('brief', 'Brief & contract', '#475569'), P('script', 'Script & approval', '#7c3aed'), P('produce', 'Shoot & edit', '#2563eb'), P('review', 'Brand review', '#d97706'), P('live', 'Publish & report', '#059669')],
    tasks: [
      { t: 'Brand brief & deliverables agreed', ph: 'brief', s: -21, d: -19, e: 'S', role: 'pr', pr: 'High' },
      { t: 'Contract & payment terms signed', ph: 'brief', s: -20, d: -16, e: 'S', role: 'lead' },
      { t: 'Concept & script draft', ph: 'script', s: -16, d: -13, e: 'M', dep: [0], role: 'writer' },
      { t: 'Brand script approval', ph: 'script', s: -13, d: -10, e: 'S', dep: [2], role: 'pr', pr: 'High' },
      { t: 'Shoot', ph: 'produce', s: -10, d: -8, e: 'L', dep: [3], role: 'video' },
      { t: 'Edit — first cut', ph: 'produce', s: -8, d: -5, e: 'L', dep: [4], role: 'video', fmt: 'Reel' },
      { t: 'Brand review & changes', ph: 'review', s: -5, d: -2, e: 'M', dep: [5], role: 'pr', pr: 'High' },
      { t: 'Caption, tags & disclosure', ph: 'review', s: -3, d: -1, e: 'S', role: 'writer' },
      { t: 'Publish on agreed channels', ph: 'live', s: 0, d: 0, e: 'S', dep: [6, 7], role: 'social', fmt: 'Reel', pr: 'Urgent' },
      { t: 'Results report to brand', ph: 'live', s: 5, d: 8, e: 'S', role: 'pr' },
      { t: 'Invoice raised', ph: 'live', s: 5, d: 7, e: 'S', role: 'lead' },
    ],
  },
  {
    id: 'event', name: 'Event / Live Launch', icon: '🎤', color: '#7c3aed', accent: '#ede9fe',
    tagline: 'Plan, promote and run a live event',
    description: 'Logistics, guests, promotion, the day itself and the follow-up content from it.',
    keyDateLabel: 'Event day',
    milestones: [{ id: 'reg', label: 'Registrations open', offset: -14, phase: 'promote' }],
    kpis: [{ name: 'Registrations', unit: '' }, { name: 'Live viewers', unit: '' }, { name: 'Content pieces', unit: '' }],
    phases: [P('plan', 'Plan', '#475569'), P('promote', 'Promotion', '#7c3aed'), P('day', 'Event day', '#dc2626'), P('follow', 'Follow-up', '#059669')],
    tasks: [
      { t: 'Event plan, run-sheet & budget', ph: 'plan', s: -28, d: -24, e: 'M', role: 'lead', pr: 'High' },
      { t: 'Venue / platform & tech check', ph: 'plan', s: -24, d: -18, e: 'M', dep: [0], role: 'lead' },
      { t: 'Guest invites & confirmations', ph: 'plan', s: -24, d: -14, e: 'M', role: 'pr' },
      { t: 'Announcement creative + reel', ph: 'promote', s: -18, d: -14, e: 'M', dep: [0], role: 'design', fmt: 'Reel' },
      { t: 'Registration link & reminders', ph: 'promote', s: -14, d: -1, e: 'S', role: 'social' },
      { t: 'Countdown content (5 pieces)', ph: 'promote', s: -7, d: -1, e: 'M', role: 'design', fmt: 'Story' },
      { t: 'Rehearsal', ph: 'day', s: -2, d: -1, e: 'S', dep: [1], role: 'lead' },
      { t: 'Run the event + live coverage', ph: 'day', s: 0, d: 0, e: 'L', role: 'lead', pr: 'Urgent' },
      { t: 'Photo & video capture', ph: 'day', s: 0, d: 0, e: 'M', role: 'video' },
      { t: 'Highlight reel', ph: 'follow', s: 1, d: 4, e: 'L', dep: [8], role: 'video', fmt: 'Reel' },
      { t: 'Thank-you posts & recap', ph: 'follow', s: 1, d: 3, e: 'S', role: 'social', fmt: 'Post' },
      { t: 'Event report', ph: 'follow', s: 5, d: 7, e: 'S', role: 'lead' },
    ],
  },
  {
    id: 'blank', name: 'Blank project', icon: '📄', color: '#334155', accent: '#e2e8f0',
    tagline: 'Start from scratch with three simple phases',
    description: 'Plan → Execute → Wrap up. Add your own tasks as you go.',
    keyDateLabel: 'Deadline',
    kpis: [],
    phases: [P('plan', 'Plan', '#475569'), P('do', 'Execute', '#2563eb'), P('wrap', 'Wrap up', '#059669')],
    tasks: [],
  },
];

// Tasks in a milestone's phase follow that milestone's date (e.g. every cover-reveal task
// moves when the Cover reveal date moves).
BUILTIN_TEMPLATES.forEach(t => {
  t.milestones = t.milestones || [];
  t.milestones.forEach(m => t.tasks.forEach(x => { if (x.ph === m.phase) x.anchor = m.id; }));
});

export const PROJECT_ICONS = ['📕', '🎬', '🪔', '🤝', '🎤', '📄', '📣', '🚀', '🎯', '📸', '🎙️', '🛍️', '📚', '🕉️', '✨', '🏆'];
export const PROJECT_COLORS = ['#b45309', '#dc2626', '#ea580c', '#0f766e', '#7c3aed', '#2563eb', '#db2777', '#059669', '#334155', '#16264a'];
export const FORMATS = ['Reel', 'Short', 'Long Video', 'Carousel', 'Post', 'Story', 'Thumbnail', 'Ad', 'Live', 'Podcast', 'Blog', 'Other'];
export const EFFORTS = [{ id: 'S', label: 'S · ~2h' }, { id: 'M', label: 'M · ~4h' }, { id: 'L', label: 'L · ~1 day' }, { id: 'XL', label: 'XL · ~2 days' }];

const ROLE_MATCH = {
  video: /video|editor|edit/i,
  design: /design/i,
  writer: /writer|script|content writer/i,
  pr: /\bpr\b|public relation|partnership/i,
  social: /social/i,
};

// Picks who should do a template task from the people on the project.
export function suggestAssignee(role, people, leadName) {
  if (!role || role === 'lead') return leadName;
  const re = ROLE_MATCH[role];
  const hit = re && people.find(p => re.test(p.role || ''));
  return hit ? hit.name : leadName;
}
