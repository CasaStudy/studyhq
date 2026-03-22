// ===== STATE MANAGEMENT =====

function initSubjects() {
  return SUBJECTS_TEMPLATE.map(t => ({
    name: t.name,
    code: t.code,
    pri: t.pri,
    exam: '',
    examTime: '09:00',
    open: false,
    topics: t.topics.map(n => ({
      name: n,
      rag: 'R',
      on: true,
      lastStudied: null,
      revCount: 0
    }))
  }));
}

const KEY = 'studyhq_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
}

function saveState() {
  const state = {
    subjects: S,
    scDays, holidays, pats, evs, sched, manBlocks, patSkips,
    scStart: document.getElementById('sc-start')?.value || '08:00',
    scEnd:   document.getElementById('sc-end')?.value || '15:30',
    revStart:document.getElementById('rev-start')?.value || '16:30',
    revEnd:  document.getElementById('rev-end')?.value || '20:30',
    wkStart: document.getElementById('wk-start')?.value || '10:00',
    wkEnd:   document.getElementById('wk-end')?.value || '17:00'
  };
  localStorage.setItem(KEY, JSON.stringify(state));
}

function restoreFormValues(state) {
  const set = (id, val) => { const el = document.getElementById(id); if(el && val) el.value = val; };
  set('sc-start',  state.scStart);
  set('sc-end',    state.scEnd);
  set('rev-start', state.revStart);
  set('rev-end',   state.revEnd);
  set('wk-start',  state.wkStart);
  set('wk-end',    state.wkEnd);
}

// ===== GLOBAL STATE =====
let saved = loadState();
let S          = saved?.subjects  || initSubjects();
let scDays     = saved?.scDays    || [1,2,3,4,5];
let holidays   = saved?.holidays  || [];
let pats       = saved?.pats      || [];
let evs        = saved?.evs       || [];
let sched      = saved?.sched     || {};
let manBlocks  = saved?.manBlocks || [];
let patSkips   = saved?.patSkips  || {};
let vy = new Date().getFullYear();
let vm = new Date().getMonth();
let selDay = '';

// ===== HELPERS =====
function dstr(d) { return d.toISOString().split('T')[0]; }
function fd(s) {
  if (!s) return '';
  const [y,m,d] = s.split('-');
  return `${d}/${m}/${y}`;
}
function daysUntil(s) {
  if (!s) return null;
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.ceil((new Date(s) - t) / 86400000);
}
function dow(s) { return new Date(s).getDay(); }
function toM(t) {
  if (!t) return 0;
  const [h,m] = t.split(':').map(Number);
  return h*60 + m;
}
function getVal(id, fallback) {
  return document.getElementById(id)?.value || fallback;
}

function getHoliday(s)   { return holidays.find(h => s >= h.from && s <= h.to) || null; }
function isAwayHol(s)    { const h = getHoliday(s); return !!(h && h.type === 'away'); }
function isHomeHol(s)    { const h = getHoliday(s); return !!(h && h.type === 'home'); }
function isManBlocked(s) { return manBlocks.includes(s); }
function isFullyBlocked(s){ return isAwayHol(s) || isManBlocked(s); }
function isSchDay(s)     { return scDays.includes(dow(s)) && !getHoliday(s); }
function isPatSkipped(pi, date) { return (patSkips[pi] || []).includes(date); }

function getActivePatsForDay(s) {
  return pats.map((p,i) => ({p,i})).filter(({p,i}) => {
    if (parseInt(p.day) !== dow(s)) return false;
    if (isPatSkipped(i, s)) return false;
    return true;
  });
}

function availMins(s) {
  if (isFullyBlocked(s)) return 0;
  const hol = getHoliday(s);
  if (hol && hol.type === 'home') {
    return Math.max(0, toM(hol.studyEnd || '17:00') - toM(hol.studyStart || '09:00'));
  }
  const isWknd = !isSchDay(s);
  const start = toM(isWknd ? getVal('wk-start','10:00') : getVal('rev-start','16:30'));
  const end   = toM(isWknd ? getVal('wk-end','17:00')   : getVal('rev-end','20:30'));
  let mins = Math.max(0, end - start);
  getActivePatsForDay(s).forEach(({p}) => {
    const ol = Math.min(toM(p.to), end) - Math.max(toM(p.from), start);
    if (ol > 0) mins -= ol;
  });
  evs.filter(e => e.date === s).forEach(e => {
    const ol = Math.min(toM(e.to), end) - Math.max(toM(e.from), start);
    if (ol > 0) mins -= ol;
  });
  return Math.max(0, mins);
}
