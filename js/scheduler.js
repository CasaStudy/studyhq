// ===== SCHEDULER =====

function doGenerate(prevOverride) {
  const prev = prevOverride || JSON.parse(JSON.stringify(sched));
  sched = {};
  const today = new Date(); today.setHours(0,0,0,0);
  const BLOCK = 45;

  // Place exams
  S.forEach(s => {
    if (s.exam) {
      if (!sched[s.exam]) sched[s.exam] = [];
      sched[s.exam].push({ type:'exam', subj:s.name, label:`EXAM: ${s.name} ${s.examTime}` });
    }
  });

  // Find last exam date
  let latest = new Date(today);
  S.forEach(s => { if (s.exam) { const d = new Date(s.exam); if (d > latest) latest = d; } });
  if (latest <= today) latest = new Date(today.getTime() + 42 * 86400000);

  // Build topic pool (active, non-green)
  const pool = [];
  S.forEach(s => {
    s.topics.filter(t => t.on && t.rag !== 'G').forEach(t => {
      pool.push({
        subj: s.name, topic: t.name, rag: t.rag,
        pri: t.pri || s.pri || 3, sPri: s.pri || 3,
        exam: s.exam ? new Date(s.exam) : null
      });
    });
  });

  const revQ = [];
  const done = new Set();
  const cur  = new Date(today);

  while (cur <= latest) {
    const d = dstr(cur);
    if (!sched[d]) sched[d] = [];
    const isExam = sched[d].some(e => e.type === 'exam');
    const mins   = availMins(d);
    const slots  = Math.max(0, Math.floor(mins / BLOCK));
    const hol    = getHoliday(d);

    if (isAwayHol(d) || isManBlocked(d)) {
      sched[d].push({ type:'blocked', label: hol ? hol.name : 'Unavailable' });

    } else if (!isExam && slots > 0) {
      let left = slots;
      const isHH = isHomeHol(d);

      // Due reviews — sorted by exam urgency
      const dueRev = revQ
        .filter(r => r.rd <= d)
        .sort((a,b) => {
          const da = a.ed ? Math.max(1, Math.ceil((new Date(a.ed)-cur)/86400000)) : 999;
          const db = b.ed ? Math.max(1, Math.ceil((new Date(b.ed)-cur)/86400000)) : 999;
          return da - db;
        });

      dueRev.slice(0, Math.min(isHH ? 3 : 2, left)).forEach(r => {
        const dLeft = r.ed ? Math.ceil((new Date(r.ed)-cur)/86400000) : null;
        const urgent = dLeft !== null && dLeft <= 2;
        sched[d].push({
          type: urgent ? 'urgent' : 'review',
          subj: r.subj, topic: r.topic,
          label: (urgent ? 'URGENT review: ' : 'Review: ') + r.topic + ' (' + r.subj + ')',
          homeHol: isHH
        });
        revQ.splice(revQ.indexOf(r), 1);
        left--;
      });

      // Urgent: exam tomorrow
      const tmrw = new Date(cur); tmrw.setDate(tmrw.getDate() + 1);
      S.filter(s => s.exam && dstr(tmrw) === s.exam).forEach(s => {
        pool
          .filter(t => t.subj === s.name && !done.has(t.subj+'::'+t.topic))
          .slice(0, Math.min(2, left))
          .forEach(t => {
            sched[d].push({ type:'urgent', subj:t.subj, topic:t.topic, label:`URGENT: ${t.topic} (${t.subj})` });
            done.add(t.subj+'::'+t.topic);
            left--;
          });
      });

      // New topics — urgency-weighted sort
      const unseen = pool
        .filter(t => !done.has(t.subj+'::'+t.topic))
        .sort((a,b) => {
          const rs = {R:3, A:2, G:0};
          const da = a.exam ? Math.max(1, Math.ceil((a.exam-cur)/86400000)) : 999;
          const db = b.exam ? Math.max(1, Math.ceil((b.exam-cur)/86400000)) : 999;
          return (rs[b.rag]+b.pri+b.sPri)/db - (rs[a.rag]+a.pri+a.sPri)/da;
        });

      unseen.slice(0, left).forEach(t => {
        const dLeft = t.exam ? Math.ceil((t.exam-cur)/86400000) : null;
        const urgent = dLeft !== null && dLeft <= 3;
        sched[d].push({
          type: urgent ? 'urgent' : 'study',
          subj: t.subj, topic: t.topic,
          label: `${t.topic} (${t.subj})`,
          homeHol: isHH
        });
        done.add(t.subj+'::'+t.topic);
        const rd = new Date(cur.getTime() + 3*86400000);
        revQ.push({ subj:t.subj, topic:t.topic, rd:dstr(rd), ed: t.exam ? dstr(t.exam) : null });
        left--;
      });

      // Note active patterns on this day (they reduce available time)
      const activePats = getActivePatsForDay(d);
      if (activePats.length && !isHH) {
        activePats.forEach(({p}) => {
          sched[d].push({ type:'blocked', label:`${p.name} (${p.from}–${p.to})` });
        });
      }
    }

    cur.setDate(cur.getDate() + 1);
  }

  saveState();
  showSummary(prev, sched);
  showNudge();
  go('cal');
}

function showSummary(prev, next) {
  const today = dstr(new Date());
  const changes = [];

  const homeHolDays = Object.keys(next).filter(d =>
    d >= today && (next[d]||[]).some(e => e.homeHol)
  );
  if (homeHolDays.length) {
    changes.push(`Home holiday days scheduled with full study windows (${homeHolDays.length} days)`);
  }

  Object.keys(next).filter(d => d >= today).forEach(d => {
    const pN = (prev[d]||[]).filter(e => e.type !== 'blocked').length;
    const nN = (next[d]||[]).filter(e => e.type !== 'blocked').length;
    if (pN > 0 && nN === 0) changes.push(`${fd(d)} — sessions removed (now blocked)`);
    else if (nN > pN) changes.push(`${fd(d)} — ${nN-pN} session${nN-pN>1?'s':''} added`);
  });

  const el = document.getElementById('summary-area');
  if (!changes.length) { el.innerHTML = ''; return; }

  const shown = changes.slice(0,6);
  el.innerHTML = `
    <div class="summary-box">
      <p style="font-weight:600;font-size:13px;margin-bottom:6px;">What changed in your schedule</p>
      ${shown.map(c => `<div class="change-item">• ${c}</div>`).join('')}
      ${changes.length>6 ? `<div class="change-item">...and ${changes.length-6} more changes</div>` : ''}
      <button class="btn btn-sm" style="margin-top:8px;" onclick="this.closest('.summary-box').remove()">Got it</button>
    </div>`;
}

function showNudge() {
  const today = new Date(); today.setHours(0,0,0,0);
  let totalSlots = 0;
  for (let i=0; i<7; i++) {
    const d = dstr(new Date(today.getTime() + i*86400000));
    totalSlots += (sched[d]||[]).filter(e => e.type!=='blocked' && e.type!=='exam').length;
  }
  const upcomingHomeHols = holidays.filter(h => h.type==='home' && h.to >= dstr(today));
  const busy = totalSlots < 4;

  const msgs = busy ? [
    "Looks like a busy stretch coming up — even a short session here and there keeps everything ticking over. No pressure at all.",
    "Things look fairly packed this week. Just do what you can — the schedule quietly adjusts around you."
  ] : upcomingHomeHols.length ? [
    "There's a home holiday coming up — great chance to get a bit ahead at a relaxed pace. No rush.",
    "A home holiday is on the horizon. The scheduler has given those days plenty of breathing room."
  ] : [
    "All set — everything's nicely on track. Keep it up.",
    "The schedule is sorted. Small consistent sessions are all it takes.",
    "Looking good. Just take it one block at a time and it'll all come together."
  ];

  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  document.getElementById('nudge-area').innerHTML =
    `<div class="nudge${busy?' amber':''}">${msg}</div>`;
}
