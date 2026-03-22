// ===== UI RENDERING =====

function go(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const names = ['avail','topics','exams','cal','today','progress'];
  const idx = names.indexOf(tab);
  if (idx >= 0) {
    document.querySelectorAll('.tab')[idx].classList.add('active');
    document.getElementById('panel-'+tab).classList.add('active');
  }
  if (tab === 'cal')      renderCal();
  if (tab === 'today')    renderToday();
  if (tab === 'progress') renderProg();
  if (tab === 'exams')    renderExams();
  if (tab === 'topics')   renderTopics();
}

// ===== SCHOOL DAYS =====
function initScDays() {
  const el = document.getElementById('sc-days');
  const lb = ['Su','M','T','W','Th','F','Sa'];
  el.innerHTML = [0,1,2,3,4,5,6].map(d =>
    `<span class="daytog${scDays.includes(d)?' on':''}" data-d="${d}" onclick="togScDay(this)">${lb[d]}</span>`
  ).join('');
}
function togScDay(el) {
  const d = parseInt(el.dataset.d);
  scDays.includes(d) ? scDays = scDays.filter(x => x!==d) : scDays.push(d);
  el.classList.toggle('on');
  saveState();
}
function saveSchool() {
  saveState();
  const e = document.getElementById('sc-saved');
  e.style.display = 'inline';
  setTimeout(() => e.style.display = 'none', 2000);
}

// ===== HOLIDAYS =====
function addHoliday() {
  const name = document.getElementById('hol-name').value.trim() || 'Holiday';
  const from = document.getElementById('hol-from').value;
  const to   = document.getElementById('hol-to').value;
  const type = document.getElementById('hol-type').value;
  if (!from || !to) return;
  const h = {name, from, to, type};
  if (type === 'home') { h.studyStart = '09:00'; h.studyEnd = '17:00'; }
  holidays.push(h);
  holidays.sort((a,b) => a.from.localeCompare(b.from));
  document.getElementById('hol-name').value = '';
  document.getElementById('hol-from').value = '';
  document.getElementById('hol-to').value = '';
  saveState(); renderHolidays();
}
function delHoliday(i) { holidays.splice(i,1); saveState(); renderHolidays(); }
function updHolTime(i, f, v) { holidays[i][f] = v; saveState(); }

function renderHolidays() {
  const away = holidays.filter(h => h.type === 'away');
  const home = holidays.filter(h => h.type === 'home');

  document.getElementById('away-list').innerHTML = !away.length
    ? '<p class="hint" style="margin-top:4px;">None added yet.</p>'
    : away.map(h => {
        const i = holidays.indexOf(h);
        return `<div class="list-row">
          <div><strong>${h.name}</strong> <span class="badge b-gray">${fd(h.from)} — ${fd(h.to)}</span></div>
          <button class="btn btn-sm btn-del" onclick="delHoliday(${i})">Remove</button>
        </div>`;
      }).join('');

  document.getElementById('home-list').innerHTML = !home.length
    ? '<p class="hint" style="margin-top:4px;">None added yet.</p>'
    : home.map(h => {
        const i = holidays.indexOf(h);
        return `<div class="list-row">
          <div style="flex:1;min-width:150px;">
            <strong>${h.name}</strong> <span class="badge b-teal">${fd(h.from)} — ${fd(h.to)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:12px;color:#888;">Study:</span>
            <input type="time" value="${h.studyStart||'09:00'}" onchange="updHolTime(${i},'studyStart',this.value)" style="width:95px;margin-bottom:0;font-size:12px;">
            <span style="font-size:12px;color:#888;">to</span>
            <input type="time" value="${h.studyEnd||'17:00'}" onchange="updHolTime(${i},'studyEnd',this.value)" style="width:95px;margin-bottom:0;font-size:12px;">
            <button class="btn btn-sm btn-del" onclick="delHoliday(${i})">Remove</button>
          </div>
        </div>`;
      }).join('');
}

// ===== PATTERNS =====
function addPat() {
  const n = document.getElementById('pat-name').value.trim();
  if (!n) return;
  pats.push({
    name: n,
    day: document.getElementById('pat-day').value,
    from: document.getElementById('pat-from').value,
    to: document.getElementById('pat-to').value
  });
  document.getElementById('pat-name').value = '';
  saveState(); renderPats();
}
function delPat(i) { pats.splice(i,1); delete patSkips[i]; saveState(); renderPats(); }
function togglePatSkip(pi, date) {
  if (!patSkips[pi]) patSkips[pi] = [];
  patSkips[pi].includes(date)
    ? patSkips[pi] = patSkips[pi].filter(d => d !== date)
    : patSkips[pi].push(date);
  saveState(); renderPats();
}

function renderPats() {
  const el = document.getElementById('pat-list');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  if (!pats.length) {
    el.innerHTML = '<p class="hint" style="margin-top:6px;">None added yet.</p>';
    return;
  }
  el.innerHTML = pats.map((p,i) => {
    const skips = (patSkips[i] || []).sort();
    const chips = skips.map(d =>
      `<span class="exc-chip">${fd(d)} <span onclick="togglePatSkip(${i},'${d}')">&#215;</span></span>`
    ).join('');

    const today = new Date(); today.setHours(0,0,0,0);
    const upcoming = [];
    for (let w=0; w<8; w++) {
      const base = new Date(today.getTime() + w*7*86400000);
      const diff = (parseInt(p.day) - base.getDay() + 7) % 7;
      const nd   = new Date(base.getTime() + diff*86400000);
      const ds   = dstr(nd);
      if (ds >= dstr(today) && !upcoming.includes(ds)) upcoming.push(ds);
    }
    const opts = upcoming.slice(0,6).map(d =>
      `<option value="${d}">${fd(d)}${isPatSkipped(i,d)?' (skipped)':''}</option>`
    ).join('');

    return `<div class="pat-block">
      <div class="list-row" style="border:none;padding-bottom:6px;">
        <div>
          <strong>${p.name}</strong>
          <span class="badge b-purple">Every ${days[p.day]}</span>
          <span style="font-size:12px;color:#888;margin-left:4px;">${p.from}–${p.to}</span>
        </div>
        <button class="btn btn-sm btn-del" onclick="delPat(${i})">Remove</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
        <span style="font-size:12px;color:#888;">Skip a date:</span>
        <select id="skip-sel-${i}" style="width:130px;margin-bottom:0;font-size:12px;">${opts}</select>
        <button class="btn btn-sm" onclick="togglePatSkip(${i},document.getElementById('skip-sel-${i}').value)">Skip / unskip</button>
      </div>
      ${chips ? `<div>${chips}</div>` : ''}
    </div>`;
  }).join('');
}

// ===== EVENTS =====
function addEvent() {
  const n = document.getElementById('ev-name').value.trim() || 'Event';
  const d = document.getElementById('ev-date').value;
  if (!d) return;
  evs.push({ name:n, date:d, from:document.getElementById('ev-from').value, to:document.getElementById('ev-to').value });
  document.getElementById('ev-name').value = '';
  document.getElementById('ev-date').value = '';
  saveState(); renderEvs();
}
function delEv(i) { evs.splice(i,1); saveState(); renderEvs(); }
function renderEvs() {
  const el = document.getElementById('ev-list');
  if (!evs.length) { el.innerHTML = '<p class="hint" style="margin-top:6px;">None added yet.</p>'; return; }
  el.innerHTML = evs.map((e,i) =>
    `<div class="list-row">
      <div><strong>${e.name}</strong> <span class="badge b-gray">${fd(e.date)}</span>
      <span style="font-size:12px;color:#888;margin-left:4px;">${e.from}–${e.to}</span></div>
      <button class="btn btn-sm btn-del" onclick="delEv(${i})">Remove</button>
    </div>`
  ).join('');
}

// ===== QUICK BLOCK =====
function addQuickBlock(wholeDay) {
  const name = document.getElementById('quick-name').value.trim() || 'Event';
  const date = document.getElementById('quick-date').value;
  if (!date) return;
  if (wholeDay) {
    if (!manBlocks.includes(date)) manBlocks.push(date);
  } else {
    evs.push({ name, date, from:document.getElementById('quick-from').value, to:document.getElementById('quick-to').value });
  }
  document.getElementById('quick-name').value = '';
  document.getElementById('quick-date').value = '';
  const prev = JSON.parse(JSON.stringify(sched));
  saveState();
  doGenerate(prev);
}

// ===== TOPICS =====
function renderTopics() {
  const el = document.getElementById('topic-area');
  el.innerHTML = S.map((s,si) => {
    const active = s.topics.filter(t => t.on).length;
    return `<div style="margin-bottom:8px;">
      <div class="subj-hd" onclick="togSubj(${si})">
        <div>
          <span class="subj-name">${s.name}</span>
          <span class="subj-code">${s.code}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:12px;color:#888;">${active}/${s.topics.length} active</span>
          <span style="font-size:12px;color:#aaa;">${s.open ? '▲' : '▼'}</span>
        </div>
      </div>
      ${s.open ? `<div style="padding:0 2px;">
        <div class="topic-controls">
          <button class="btn btn-sm" onclick="allOn(${si},event)">Select all</button>
          <button class="btn btn-sm" onclick="allOff(${si},event)">Deselect all</button>
          <span class="hint" style="margin:0;">Click topic to toggle · tap RAG to cycle</span>
        </div>
        <div class="topic-grid">
          ${s.topics.map((t,ti) => {
            const [bg,fg] = t.rag==='R'?['#FCEBEB','#A32D2D']:t.rag==='A'?['#FAEEDA','#854F0B']:['#EAF3DE','#3B6D11'];
            return `<div class="topic-item${t.on?'':' off'}" onclick="togTopic(${si},${ti})">
              <div class="tcheck${t.on?' on':''}"></div>
              <span style="flex:1;">${t.name}</span>
              <span class="rag-pill" style="background:${bg};color:${fg};" onclick="cycRag(event,${si},${ti})">${t.rag}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
}
function togSubj(i)          { S[i].open = !S[i].open; renderTopics(); }
function allOn(si,e)         { e.stopPropagation(); S[si].topics.forEach(t => t.on=true);  saveState(); renderTopics(); }
function allOff(si,e)        { e.stopPropagation(); S[si].topics.forEach(t => t.on=false); saveState(); renderTopics(); }
function togTopic(si,ti)     { S[si].topics[ti].on = !S[si].topics[ti].on; saveState(); renderTopics(); }
function cycRag(e,si,ti) {
  e.stopPropagation();
  const r = ['R','A','G'];
  S[si].topics[ti].rag = r[(r.indexOf(S[si].topics[ti].rag)+1)%3];
  saveState(); renderTopics();
}

// ===== EXAMS =====
function renderExams() {
  document.getElementById('exam-inputs').innerHTML = S.map((s,si) =>
    `<div class="exam-row">
      <div class="exam-name">
        <div style="font-weight:600;font-size:13px;">${s.name}</div>
        <div style="font-size:11px;color:#888;">${s.code}</div>
      </div>
      <div>
        <label>Date</label>
        <input type="date" value="${s.exam}" onchange="S[${si}].exam=this.value;saveState();" style="margin-bottom:0;">
      </div>
      <div>
        <label>Time (24hr)</label>
        <input type="time" value="${s.examTime}" onchange="S[${si}].examTime=this.value;saveState();" style="margin-bottom:0;">
      </div>
    </div>`
  ).join('');
}

// ===== CALENDAR =====
function prevMo() { vm--; if (vm < 0) { vm=11; vy--; } renderCal(); }
function nextMo() { vm++; if (vm > 11) { vm=0; vy++; } renderCal(); }

function renderCal() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('mo-title').textContent = `${months[vm]} ${vy}`;
  document.getElementById('cal-hd').innerHTML =
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="cal-hd">${d}</div>`).join('');

  const first = new Date(vy,vm,1), last = new Date(vy,vm+1,0);
  const startDow = (first.getDay()+6)%7;
  const today = new Date(); today.setHours(0,0,0,0);
  let cells = '';

  for (let i=0; i<startDow; i++) cells += '<div></div>';

  for (let d=1; d<=last.getDate(); d++) {
    const dt  = new Date(vy,vm,d);
    const ds  = dstr(dt);
    const isToday = dt.getTime() === today.getTime();
    const evts = sched[ds] || [];
    const isExam  = evts.some(e => e.type==='exam');
    const away    = isAwayHol(ds);
    const homeHol = isHomeHol(ds);
    const manBl   = isManBlocked(ds);

    let cls = 'cal-day' + (isToday?' today':'') +
      (isExam?' is-exam' : away||manBl?' is-away' : homeHol?' is-home-hol':'');

    const visible = evts.filter(e => e.type !== 'blocked');
    const blEv    = evts.find(e => e.type === 'blocked');

    let pills = '';
    if (away || manBl) {
      pills = `<span class="cpill cp-blocked">${blEv ? blEv.label : 'Away'}</span>`;
    } else if (homeHol && !visible.length) {
      pills = `<span class="cpill cp-homehol">Home holiday</span>`;
    } else {
      if (blEv) pills += `<span class="cpill cp-blocked">${blEv.label}</span>`;
      visible.slice(0,3).forEach(e => {
        const pc = e.type==='exam'?'cp-exam':e.type==='urgent'?'cp-urgent':e.type==='review'?'cp-review':'cp-study';
        pills += `<span class="cpill ${pc}">${e.label}</span>`;
      });
    }
    const more = visible.length > 3 ? `<span style="font-size:9px;color:#aaa;">+${visible.length-3} more</span>` : '';

    cells += `<div class="${cls}" onclick="showDay('${ds}')">
      <div class="dn">${d}</div>${pills}${more}
    </div>`;
  }
  document.getElementById('cal-bd').innerHTML = cells;
}

function showDay(d) {
  selDay = d;
  const card = document.getElementById('day-card');
  card.style.display = 'block';
  document.getElementById('day-title').textContent = fd(d);
  const isMB = isManBlocked(d);
  const btn  = document.getElementById('day-block-btn');
  btn.textContent  = isMB ? 'Unblock this day' : 'Block this day';
  btn.className    = 'btn btn-sm ' + (isMB ? 'btn-green' : 'btn-del');

  const hol    = getHoliday(d);
  const evts   = sched[d] || [];
  let extra = '';
  if (hol) {
    extra = `<div style="font-size:12px;padding:5px 0;color:${hol.type==='home'?'#085041':'#666'};">
      ${hol.type==='home'
        ? `Home holiday — study window ${hol.studyStart} to ${hol.studyEnd}`
        : `Away — ${hol.name}`}
    </div>`;
  }
  const skipped = pats.map((p,i)=>({p,i})).filter(({p,i})=>parseInt(p.day)===dow(d)&&isPatSkipped(i,d));
  if (skipped.length) {
    extra += skipped.map(({p}) =>
      `<div style="font-size:12px;color:#854F0B;padding:2px 0;">Skipped today: ${p.name} (${p.from}–${p.to})</div>`
    ).join('');
  }

  const rows = evts.length
    ? evts.map(e => {
        const pc = e.type==='exam'?'b-red':e.type==='urgent'?'b-amber':e.type==='review'?'b-green':e.type==='blocked'?'b-gray':'b-blue';
        const tag = {exam:'Exam',urgent:'Urgent',review:'Review',blocked:'Blocked',study:'Study'}[e.type]||'Study';
        return `<div class="day-event-row">
          <span class="badge ${pc}">${tag}</span>
          <span>${e.label}</span>
        </div>`;
      }).join('')
    : '<p class="hint">Nothing scheduled — add exam dates and generate a schedule first.</p>';

  document.getElementById('day-body').innerHTML = extra + rows;
}

function toggleDayBlock() {
  if (!selDay) return;
  isManBlocked(selDay)
    ? manBlocks = manBlocks.filter(d => d !== selDay)
    : manBlocks.push(selDay);
  saveState();
  doGenerate();
}

// ===== TODAY =====
function renderToday() {
  const d    = dstr(new Date());
  const evts = (sched[d]||[]).filter(e => e.type !== 'blocked');
  const allT = S.flatMap(s => s.topics.filter(t => t.on));

  document.getElementById('st-study').textContent  = evts.filter(e=>e.type==='study'||e.type==='urgent').length;
  document.getElementById('st-review').textContent = evts.filter(e=>e.type==='review').length;
  document.getElementById('st-green').textContent  = allT.filter(t=>t.rag==='G').length;
  document.getElementById('st-total').textContent  = allT.length;
  document.getElementById('today-hd').textContent  = 'Today — ' + fd(d);

  const hol   = getHoliday(d);
  const isHH  = hol && hol.type === 'home';
  const away  = isAwayHol(d);

  const todayMsgs = away
    ? ["You're away today — enjoy it! The schedule picks back up when you're home."]
    : isHH
    ? ["Holiday study day — lots of time, no rush. Pick what feels most useful.",
       "Home holiday today — great chance to get comfortable with trickier topics at your own pace."]
    : evts.length
    ? ["Good luck today — you've got this!",
       "One session at a time. That's all it takes.",
       "Every topic you cover today is one less thing to worry about later.",
       "Take it steady — short focused sessions beat long exhausting ones every time."]
    : ["A free day today — well earned. The schedule continues tomorrow."];

  const msg = todayMsgs[Math.floor(Math.random() * todayMsgs.length)];
  document.getElementById('today-nudge').innerHTML =
    `<div class="nudge${away?'':isHH?' blue':evts.length?'':''}">${msg}</div>`;

  const el = document.getElementById('today-list');
  if (!evts.length) {
    el.innerHTML = '<p class="hint">Nothing scheduled today — generate a schedule first, or enjoy the break!</p>';
    return;
  }
  el.innerHTML = evts.map(e => {
    const si  = S.findIndex(s => s.name === e.subj);
    const ti  = si>=0 ? S[si].topics.findIndex(t => t.name === e.topic) : -1;
    const rag = si>=0 && ti>=0 ? S[si].topics[ti].rag : 'R';
    const ragCol = rag==='R'?'#E24B4A':rag==='A'?'#EF9F27':'#639922';
    const pc  = e.type==='urgent'?'b-amber':e.type==='review'?'b-green':'b-blue';
    const tag = e.type==='urgent'?'Urgent':e.type==='review'?'Review':'Study';
    return `<div class="qrow">
      <div class="rdot" style="background:${ragCol};"></div>
      <span style="flex:1;">${e.label}</span>
      <span class="badge ${pc}">${tag}</span>
      ${si>=0&&ti>=0 ? `<button class="btn btn-sm btn-green" onclick="markDone('${e.subj.replace(/'/g,"\\'")}','${e.topic.replace(/'/g,"\\'")}',this)">Done</button>` : ''}
    </div>`;
  }).join('');
}

function markDone(subj, topic, btn) {
  const si = S.findIndex(s => s.name === subj);
  if (si < 0) return;
  const ti = S[si].topics.findIndex(t => t.name === topic);
  if (ti < 0) return;
  S[si].topics[ti].lastStudied = dstr(new Date());
  S[si].topics[ti].revCount = (S[si].topics[ti].revCount||0) + 1;
  if (S[si].topics[ti].revCount >= 3 && S[si].topics[ti].rag === 'R') S[si].topics[ti].rag = 'A';
  saveState();
  btn.textContent = 'Done!';
  btn.disabled = true;
  btn.style.opacity = '0.5';
}

// ===== PROGRESS =====
function renderProg() {
  document.getElementById('prog-list').innerHTML = S.map(s => {
    const inc  = s.topics.filter(t => t.on);
    const g    = inc.filter(t => t.rag==='G').length;
    const a    = inc.filter(t => t.rag==='A').length;
    const r    = inc.filter(t => t.rag==='R').length;
    const excl = s.topics.length - inc.length;
    const pct  = inc.length ? Math.round(g/inc.length*100) : 0;
    const d    = daysUntil(s.exam);
    const dl   = d===null?'No exam':d<0?'Passed':d===0?'Today!':d+' days';
    const dc   = d!==null&&d<=7&&d>=0?'#A32D2D':'#888';
    return `<div class="prog-row">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;flex-wrap:wrap;gap:4px;">
        <span style="font-weight:600;font-size:13px;">${s.name}
          <span style="font-weight:400;font-size:11px;color:#888;margin-left:4px;">${s.code}</span>
        </span>
        <span style="font-size:12px;color:${dc};">${dl}</span>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px;">
        <span class="badge b-red">${r} R</span>
        <span class="badge b-amber">${a} A</span>
        <span class="badge b-green">${g} G</span>
        ${excl ? `<span class="badge b-muted">${excl} excluded</span>` : ''}
      </div>
      <div class="progbar"><div class="progfill" style="width:${pct}%;"></div></div>
      <div style="font-size:11px;color:#888;margin-top:3px;">${pct}% mastered · ${inc.length} active topics</div>
    </div>`;
  }).join('');
}
