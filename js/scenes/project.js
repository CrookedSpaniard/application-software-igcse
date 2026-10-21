FD.add({
  id: 'project',
  title: 'Project management',
  tab: 'Projects',
  icon: 'project',
  color: '--c4',
  section: true,
  interactive: true,
  vocab: [
    ['Timeline', 'A linear graphical representation of events and the time and order in which they occur.'],
    ['Critical path', 'The shortest time a project will take to complete (if no problems or failures are experienced).'],
    ['Milestone', 'A time or date by which a task must be completed.'],
    ['Gantt chart', 'A chart often used to visualise the timelines and milestones for the tasks in a project (Figure 2.19).'],
  ],
  mount(el) {
    const PEOPLE = ['Ana', 'Ben', 'Builders', 'Roofers', 'Electrician'];
    const BASE = [
      { id: 'P', n: 'Plans and permission', d: 3, dep: [], who: ['Ana'], cost: 200 },
      { id: 'M', n: 'Order materials', d: 2, dep: ['P'], who: ['Ben'], cost: 150 },
      { id: 'F', n: 'Foundations', d: 4, dep: ['P'], who: ['Builders'], cost: 900 },
      { id: 'W', n: 'Walls', d: 5, dep: ['F', 'M'], who: ['Builders'], cost: 1000 },
      { id: 'R', n: 'Roof', d: 3, dep: ['W'], who: ['Roofers'], cost: 800 },
      { id: 'E', n: 'Electrics', d: 2, dep: ['W'], who: ['Electrician'], cost: 400 },
      { id: 'D', n: 'Decorate', d: 2, dep: ['R', 'E'], who: ['Ana', 'Ben'], cost: 300 },
    ];
    const DAYS = 24, BUDGET = 15000;
    el.innerHTML = `
      <div class="sim pj-s">
        <div class="pj-top">
          <span class="seg" id="opt"><button data-v="deps">↳ Dependencies</button><button data-v="crit">🔴 Critical path</button></span>
          <label class="rng">Today <input type="range" id="today" min="0" max="${DAYS}" value="0"><b id="todayV">Day 0</b></label>
        </div>
        <div class="pj-wrap"><svg class="pj-g" id="g" role="img" aria-label="Gantt chart of the building project"></svg></div>
        <div class="pj-side">
          <div class="sim-box pj-task" id="task"></div>
          <div class="readout">
            <span class="ro"><small>Finish</small><b id="fin">Day 0</b></span>
            <span class="ro"><small>Cost so far</small><b id="cost">£0</b></span>
            <span class="ro"><small>Budget</small><b>£${BUDGET.toLocaleString('en-GB')}</b></span>
          </div>
        </div>
        <p class="verdict" id="pMsg"></p>
      </div>`;
    const root = el.querySelector('.pj-s'), $ = (s) => root.querySelector(s);
    let T = [], sel = 'W', opt = { deps: true, crit: false }, today = 0, dead = false;

    function plan() {
      const by = Object.fromEntries(T.map((t) => [t.id, t]));
      T.forEach((t) => { t.es = Math.max(0, ...t.dep.map((d) => by[d].ef)); t.ef = t.es + t.d; });
      const end = Math.max(...T.map((t) => t.ef));
      [...T].reverse().forEach((t) => { const next = T.filter((x) => x.dep.includes(t.id)); t.lf = next.length ? Math.min(...next.map((x) => x.ls)) : end; t.ls = t.lf - t.d; t.slack = t.ls - t.es; });
      return end;
    }
    const X0 = 170, CW = 22, RH = 30, Y0 = 34;
    function draw(flash) {
      const end = plan(), by = Object.fromEntries(T.map((t) => [t.id, t]));
      const H = Y0 + (T.length + 1) * RH + 10, W = X0 + DAYS * CW + 10;
      const g = $('#g');
      g.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const cols = Array.from({ length: DAYS }, (_, d) => `<rect x="${X0 + d * CW}" y="${Y0 - 6}" width="${CW}" height="${H - Y0}" class="pj-col ${d % 7 >= 5 ? 'we' : ''}"/><text x="${X0 + d * CW + CW / 2}" y="${Y0 - 12}" class="pj-d">${d + 1}</text>`).join('');
      const rows = T.map((t, i) => {
        const y = Y0 + i * RH, done = FD.clamp((today - t.es) / t.d, 0, 1);
        const crit = opt.crit && t.slack === 0;
        return `<g class="pj-row ${t.id === sel ? 'sel' : ''}" data-id="${t.id}">
          <rect x="0" y="${y}" width="${W}" height="${RH}" class="pj-hit"/>
          <text x="8" y="${y + 19}" class="pj-n">${t.n}</text><text x="${X0 - 8}" y="${y + 19}" class="pj-pc" text-anchor="end">${Math.round(done * 100)}%</text>
          <rect x="${X0 + t.es * CW + 1}" y="${y + 7}" width="${t.d * CW - 2}" height="${RH - 14}" rx="4" class="pj-bar ${crit ? 'crit' : ''} ${flash === t.id ? 'flash' : ''}"/>
          <rect x="${X0 + t.es * CW + 1}" y="${y + 7}" width="${Math.max(0, (t.d * CW - 2) * done)}" height="${RH - 14}" rx="4" class="pj-done"/>
          ${!opt.crit && t.slack ? `<rect x="${X0 + t.ef * CW}" y="${y + 13}" width="${t.slack * CW}" height="4" class="pj-slack"/>` : ''}
        </g>`;
      }).join('');
      const arrows = opt.deps ? T.flatMap((t, i) => t.dep.map((d) => {
        const a = by[d], ai = T.indexOf(a), x1 = X0 + a.ef * CW - 2, y1 = Y0 + ai * RH + RH / 2, x2 = X0 + t.es * CW + 2, y2 = Y0 + i * RH + RH / 2;
        return `<path d="M${x1} ${y1} H${x1 + 6} V${y2} H${x2}" class="pj-arr ${opt.crit && a.slack === 0 && t.slack === 0 ? 'crit' : ''}" marker-end="url(#pjA)"/>`;
      })).join('') : '';
      const mY = Y0 + T.length * RH, wall = by.W.ef;
      const ms = `<text x="8" y="${mY + 19}" class="pj-n">◆ Milestones</text>
        <path d="M${X0 + wall * CW} ${mY + 8} l7 7 -7 7 -7 -7z" class="pj-ms"/><text x="${X0 + wall * CW + 10}" y="${mY + 19}" class="pj-msl">Walls done</text>
        <path d="M${X0 + 17 * CW} ${mY + 8} l7 7 -7 7 -7 -7z" class="pj-ms ${end > 17 ? 'late' : ''}"/><text x="${X0 + 17 * CW + 10}" y="${mY + 19}" class="pj-msl">Handover (day 17)</text>`;
      g.innerHTML = `<defs><marker id="pjA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" class="pj-arrh"/></marker></defs>
        ${cols}${rows}${arrows}${ms}
        <line x1="${X0 + today * CW}" y1="${Y0 - 6}" x2="${X0 + today * CW}" y2="${H}" class="pj-today"/><text x="${X0 + today * CW + 3}" y="${H - 2}" class="pj-tl">today</text>`;
      $('#fin').textContent = `Day ${end}`;
      $('#fin').classList.toggle('bad-t', end > 17);
      const spent = T.reduce((s, t) => s + t.cost * t.who.length * FD.clamp(today - t.es, 0, t.d), 0);
      $('#cost').textContent = '£' + spent.toLocaleString('en-GB');
      taskBox();
      return end;
    }
    function taskBox() {
      const t = T.find((x) => x.id === sel);
      $('#task').innerHTML = `<h5 class="mw-h">${t.n}</h5>
        <p class="note">Days ${t.es + 1}–${t.ef} · depends on: <b>${t.dep.length ? t.dep.map((d) => T.find((x) => x.id === d).n).join(', ') : 'nothing'}</b> · ${t.slack ? `can slip <b>${t.slack}</b> day${t.slack > 1 ? 's' : ''}` : '<b class="bad-t">on the critical path</b>'}</p>
        <div class="chk-btns"><button class="mini-btn" data-dd="-1">− 1 day</button><span class="pill">${t.d} days</span><button class="mini-btn" data-dd="1">+ 1 day (delay)</button></div>
        <div class="pj-who">${PEOPLE.map((p) => `<label class="tgl"><input type="checkbox" data-p="${p}" ${t.who.includes(p) ? 'checked' : ''}> ${p}</label>`).join('')}</div>`;
      $('#task').querySelectorAll('[data-dd]').forEach((b) => b.addEventListener('click', () => change(sel, +b.dataset.dd)));
      $('#task').querySelectorAll('[data-p]').forEach((c) => c.addEventListener('change', () => allocate(sel, c.dataset.p, c.checked)));
    }
    function select(id) { sel = id; draw(); }
    $('#g').addEventListener('click', (e) => { const r = e.target.closest('[data-id]'); if (r) select(r.dataset.id); });
    function change(id, dd) {
      const t = T.find((x) => x.id === id), before = plan();
      t.d = FD.clamp(t.d + dd, 1, 8); sel = id;
      const after = draw(id), m = $('#pMsg');
      if (dd > 0) {
        m.className = 'verdict ' + (after > before ? 'bad' : 'good');
        m.innerHTML = after > before ? `${t.n} is on the <b>critical path</b>: the whole project now finishes on day ${after}.` : `${t.n} has spare time, so the finish date does not change (day ${after}).`;
      } else { m.className = 'verdict'; m.innerHTML = `${t.n} now takes ${t.d} days. Finish: day ${after}.`; }
    }
    function allocate(id, p, on) {
      const t = T.find((x) => x.id === id);
      t.who = on ? [...new Set([...t.who, p])] : t.who.filter((x) => x !== p);
      const busy = PEOPLE.filter((q) => T.filter((x) => x.who.includes(q)).length > 1);
      $('#pMsg').className = 'verdict';
      $('#pMsg').innerHTML = `${t.n}: ${t.who.length ? t.who.join(' and ') : '<span class="bad-t">nobody yet</span>'}. ${busy.length ? `${busy.join(', ')} ${busy.length > 1 ? 'are' : 'is'} allocated to more than one task.` : ''}`;
      draw();
    }
    function setOpt(k, on) { opt[k] = on; root.querySelectorAll('#opt [data-v]').forEach((b) => { b.classList.toggle('on', opt[b.dataset.v]); b.setAttribute('aria-pressed', opt[b.dataset.v]); }); draw(); }
    $('#opt').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setOpt(b.dataset.v, !opt[b.dataset.v]); });
    function setToday(d) { today = d; $('#today').value = d; $('#todayV').textContent = `Day ${d}`; draw(); }
    $('#today').addEventListener('input', (e) => setToday(+e.target.value));
    async function track(to) {
      const from = today;
      for (let d = from; d <= to; d++) { setToday(d); await FD.wait(180); if (dead) return; }
    }
    function reset() { T = BASE.map((t) => ({ ...t, dep: [...t.dep], who: [...t.who] })); sel = 'W'; opt = { deps: true, crit: false }; setOpt('deps', true); setToday(0); $('#pMsg').innerHTML = ''; }
    reset();
    return {
      select, change, allocate, setOpt, setToday, track, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Plan and track tasks',
      text: `<p><b>Project management</b> applications help to plan and track the individual tasks in a project, so that project managers can make the most efficient use of the available resources.</p>
             <p>This building company is planning a house extension.</p>`,
      tip: 'Try it: drag “Today” to track the progress of each task.',
      async on(a) { a.reset(); await a.track(9); },
    },
    {
      title: 'Dependent tasks',
      text: `<p>Some tasks cannot be started until a previous task is completed or partly completed. The arrows show which tasks are <b>dependent</b> on others: the walls cannot start until the foundations are done and the materials have arrived.</p>`,
      tip: 'Try it: click a task to see what it depends on.',
      async on(a, ctx) { a.setOpt('crit', false); for (const id of ['F', 'W', 'D']) { a.select(id); if (!(await ctx.sleep(1300))) return; } },
    },
    {
      title: 'Timeline and critical path',
      text: `<p>When the dependent tasks are combined into a <strong>timeline</strong>, it is easy to see the <strong>critical path</strong>: the shortest time the project will take to complete, if there are no problems or failures.</p>`,
      tip: 'Try it: delay a red task, then delay “Order materials”.',
      async on(a, ctx) { a.setOpt('crit', true); if (!(await ctx.sleep(1500))) return; a.change('F', 1); if (!(await ctx.sleep(2200))) return; a.change('F', -1); a.change('M', 1); },
    },
    {
      title: 'Milestones',
      text: `<p>Project management applications can also set <strong>milestones</strong>: a time or date by which a task must be completed. Figure 2.19 shows a Gantt chart, often used to visualise timelines and milestones.</p>`,
      async on(a) { a.change('M', -1); a.select('D'); },
    },
    {
      title: 'People, costs and resources',
      text: `<p>Tasks can be allocated to individual people or groups of people, who can be allocated to <b>more than one task</b>. Some applications also track the <b>costs</b> and arrange for resources to be <b>delivered on time</b>.</p>`,
      tip: 'Try it: tick people for the selected task and drag “Today” to see the cost.',
      async on(a, ctx) { a.select('E'); a.allocate('E', 'Ben', true); if (!(await ctx.sleep(1200))) return; await a.track(17); },
    },
  ],
});

FD.check({
  section: 'project',
  items: [
    { type: 'mcq', q: 'What is the <b>critical path</b>?', opts: ['The shortest time a project will take to complete, if no problems or failures are experienced', 'The most expensive task', 'The first task in a project', 'A list of the people in the team'], why: 'A delay on the critical path delays the whole project.' },
    { type: 'mcq', q: 'What is a <b>milestone</b>?', opts: ['A time or date by which a task must be completed', 'A task with no dependencies', 'A type of chart', 'The budget for a project'], why: 'Milestones are shown on the timeline.' },
    { type: 'mcq', q: 'Why is it important for a project manager to see which tasks are dependent on others?', opts: ['Some tasks cannot start until a previous task is completed or partly completed', 'Dependent tasks are always free', 'Dependent tasks can be skipped', 'So the tasks can be printed'], why: 'Combined into a timeline, this shows the critical path.' },
    { type: 'tf', q: 'In project management software, one person can be allocated to more than one task.', a: true, why: 'Tasks can be allocated to individuals or groups.' },
  ],
});
