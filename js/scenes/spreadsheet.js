FD.add({
  id: 'spreadsheet',
  title: 'Spreadsheets',
  tab: 'Spreadsheets',
  icon: 'spreadsheet',
  color: '--c7',
  section: true,
  interactive: true,
  vocab: [
    ['Formula', 'A calculation typed into a cell, for example =B7/B8. Its result updates automatically when values change.'],
    ['Function', 'A ready-made calculation used in a formula, such as ROUNDUP, VLOOKUP or IF.'],
    ['Financial model', 'A spreadsheet that answers ‘what if?’ questions about money.'],
  ],
  mount(el) {
    const PRICES = {
      Venue: { Gold: 3000, Silver: 2000, Bronze: 1200 },
      Catering: { Gold: 30, Silver: 22, Bronze: 15 },
      Entertainment: { Gold: 500, Silver: 300, Bronze: 150 },
      Decorations: { Gold: 450, Silver: 300, Bronze: 150 },
      Transport: { Gold: 400, Silver: 250, Bronze: 120 },
    };
    const STAFF_PAY = 60, LIMIT = 50;
    const ITEMS = ['Venue', 'Catering', 'Entertainment', 'Decorations', 'Transport'];
    const LABEL = { Catering: 'Catering (per guest)' };
    const v = { Venue: 'Gold', Catering: 'Gold', Entertainment: 'Bronze', Decorations: 'Silver', Transport: 'Gold', guests: 200, ratio: 10 };
    el.innerHTML = `
      <div class="sim ss-s">
        <div class="ss-bar"><span class="ss-name mono" id="cellName">C11</span><span class="ss-fx mono" id="fx">ƒx</span>
          <span class="seg" id="mode"><button data-v="val">Values</button><button data-v="fx">Show formulae</button></span></div>
        <div class="tbl-wrap"><table class="ss-grid mono" id="grid"></table></div>
        <div class="ss-scen">
          <button class="btn" id="bSave">📸 Save as scenario</button>
          <div class="ss-cards" id="scen"></div>
        </div>
        <p class="verdict" id="sMsg"></p>
      </div>`;
    const root = el.querySelector('.ss-s'), $ = (s) => root.querySelector(s);
    let mode = 'val', dead = false, scen = [];

    const calc = () => {
      const c = {};
      ITEMS.forEach((k) => { c[k] = PRICES[k][v[k]]; });
      c.staff = Math.ceil(v.guests / v.ratio);
      c.pay = c.staff * STAFF_PAY;
      c.ticket = (c.Venue + c.Entertainment + c.Decorations + c.Transport + c.pay) / v.guests + c.Catering;
      c.ok = c.ticket > LIMIT ? 'No' : 'Yes';
      return c;
    };
    const money = (n) => '£' + n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
    const FX = {
      C2: '=VLOOKUP(B2,Venue,2,FALSE)', C3: '=VLOOKUP(B3,Catering,2,FALSE)', C4: '=VLOOKUP(B4,Entertainment,2,FALSE)', C5: '=VLOOKUP(B5,Decorations,2,FALSE)', C6: '=VLOOKUP(B6,Transport,2,FALSE)',
      C9: '=ROUNDUP(B7/B8,0)', C10: `=C9*${STAFF_PAY}`, C11: '=(C2+C4+C5+C6+C10)/B7+C3', C12: `=IF(C11>${LIMIT},"No","Yes")`,
    };
    let last = {};
    function draw() {
      const c = calc();
      const rows = [
        ...ITEMS.map((k, i) => [i + 2, LABEL[k] || k, `<select data-k="${k}" aria-label="${k} package">${['Gold', 'Silver', 'Bronze'].map((o) => `<option ${o === v[k] ? 'selected' : ''}>${o}</option>`).join('')}</select>`, money(c[k])]),
        [7, 'Guests', `<input type="number" min="20" max="1000" step="10" data-k="guests" value="${v.guests}" aria-label="Guests">`, ''],
        [8, 'Guests per member of staff', `<input type="number" min="2" max="50" data-k="ratio" value="${v.ratio}" aria-label="Guests per member of staff">`, ''],
        [9, 'Number of staff required', '', String(c.staff)],
        [10, `Staff cost (£${STAFF_PAY} each)`, '', money(c.pay)],
        [11, 'Ticket price needed', '', money(Math.round(c.ticket * 100) / 100)],
        [12, `Meets requirements? (≤ £${LIMIT})`, '', c.ok],
      ];
      $('#grid').innerHTML = `<thead><tr><th></th><th>A</th><th>B</th><th>C</th></tr></thead><tbody>
        <tr><th>1</th><td><b>Item</b></td><td><b>Option</b></td><td><b>Cost</b></td></tr>
        ${rows.map(([r, a, b, cv]) => {
          const id = 'C' + r, f = FX[id];
          const changed = last[id] !== undefined && last[id] !== cv;
          return `<tr><th>${r}</th><td>${a}</td><td>${b}</td><td class="ss-c ${f ? 'f' : ''} ${changed ? 'flash' : ''} ${r === 12 ? (cv === 'Yes' ? 'good-t' : 'bad-t') : ''}" data-id="${id}">${mode === 'fx' && f ? f : cv}</td></tr>`;
        }).join('')}</tbody>`;
      last = Object.fromEntries(rows.map(([r, , , cv]) => ['C' + r, cv]));
      root.querySelectorAll('#grid [data-k]').forEach((x) => x.addEventListener('change', () => {
        const k = x.dataset.k;
        v[k] = x.tagName === 'SELECT' ? x.value : FD.clamp(Math.round(+x.value || 0), +x.min, +x.max);
        draw();
      }));
      const m = $('#sMsg');
      m.className = 'verdict ' + (c.ok === 'Yes' ? 'good' : 'bad');
      m.innerHTML = `Ticket price needed: <b>${money(Math.round(c.ticket * 100) / 100)}</b> · ${c.staff} staff · Meets requirements? <b>${c.ok}</b>`;
      return c;
    }
    function select(id) {
      root.querySelectorAll('.ss-c').forEach((x) => x.classList.toggle('sel', x.dataset.id === id));
      $('#cellName').textContent = id;
      $('#fx').textContent = 'ƒx  ' + (FX[id] || last[id] || '');
    }
    $('#grid').addEventListener('click', (e) => { const td = e.target.closest('.ss-c'); if (td) select(td.dataset.id); });
    function setMode(m) { mode = m; FD.segSet($('#mode'), m); draw(); select($('#cellName').textContent); }
    $('#mode').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setMode(b.dataset.v); });
    function set(k, val) { v[k] = val; draw(); select('C11'); }
    function save() {
      const c = calc();
      scen.push({ ratio: v.ratio, guests: v.guests, staff: c.staff, ticket: c.ticket, ok: c.ok });
      scen = scen.slice(-2);
      $('#scen').innerHTML = scen.map((s, i) => `<div class="mini ${i === scen.length - 1 ? 'new' : ''}"><h5>Scenario ${i + 1}</h5><p>${s.guests} guests · 1 staff per ${s.ratio} → <b>${s.staff} staff</b></p><p>Ticket <b>${money(Math.round(s.ticket * 100) / 100)}</b> · Meets? <b class="${s.ok === 'Yes' ? 'good-t' : 'bad-t'}">${s.ok}</b></p></div>`).join('');
    }
    $('#bSave').addEventListener('click', save);
    function reset() { Object.assign(v, { Venue: 'Gold', Catering: 'Gold', Entertainment: 'Bronze', Decorations: 'Silver', Transport: 'Gold', guests: 200, ratio: 10 }); scen = []; $('#scen').innerHTML = '<span class="note">Save two scenarios to compare them (Figure 2.10).</span>'; last = {}; setMode('val'); select('C11'); }
    reset();
    return {
      set, setMode, select, save, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Spreadsheets do calculations',
      text: `<p>Spreadsheet applications are used to <b>do calculations</b>. This one is a financial model for planning an event: each item has a Gold, Silver or Bronze package.</p>`,
      tip: 'Try it: change the venue package and watch the costs change.',
      async on(a, ctx) { a.reset(); if (!(await ctx.sleep(1200))) return; a.set('Venue', 'Silver'); if (!(await ctx.sleep(1400))) return; a.set('Venue', 'Gold'); },
    },
    {
      title: 'Formulae and functions',
      text: `<p>Users can use and create <b>formulae</b> and <b>functions</b> to perform automatic calculations on values that can be entered and changed later (Figure 2.11).</p>
             <p>Here VLOOKUP finds a price, ROUNDUP rounds the number of staff up and IF decides if the price meets the requirements.</p>`,
      tip: 'Try it: click a cell in column C to see its formula.',
      async on(a, ctx) { a.setMode('fx'); for (const id of ['C2', 'C9', 'C11', 'C12']) { a.select(id); if (!(await ctx.sleep(1300))) return; } },
    },
    {
      title: 'Automatic recalculation',
      text: `<p>When a value changes, every formula that uses it is <b>calculated again automatically</b>. The yellow cells have just changed.</p>`,
      tip: 'Try it: change the number of guests.',
      async on(a, ctx) { a.setMode('val'); a.set('guests', 150); if (!(await ctx.sleep(1500))) return; a.set('guests', 250); },
    },
    {
      title: '‘What if?’ questions',
      text: `<p>These features allow spreadsheets to model financial scenarios and answer <b>‘what if?’</b> questions, such as ‘<b>What</b> would the cost per ticket be <b>if</b> I changed the number of staff required at my event?’</p>
             <p>Figure 2.10 shows two scenarios from the same model.</p>`,
      tip: 'Try it: save a scenario, change the staff, save again and compare.',
      async on(a, ctx) {
        a.set('guests', 200); a.set('ratio', 10); a.save(); if (!(await ctx.sleep(1500))) return;
        a.set('ratio', 7); a.save();
      },
    },
  ],
});

FD.check({
  section: 'spreadsheet',
  items: [
    { type: 'mcq', q: 'What are spreadsheet applications mainly used for?', opts: ['Doing calculations', 'Designing page layouts', 'Editing photos', 'Sending emails'], why: 'Using formulae and functions.' },
    { type: 'mcq', q: 'A value in a spreadsheet is changed. What happens to the formulae that use it?', opts: ['They are recalculated automatically', 'They are deleted', 'They must all be typed again', 'Nothing until the file is printed'], why: 'Calculations are carried out automatically when values change (Figure 2.11).' },
    { type: 'mcq', q: 'What is a ‘what if?’ question in a spreadsheet model?', opts: ['Changing a value to see what the result would be', 'Searching the internet for an answer', 'Asking a teacher for help', 'Checking the spelling'], why: 'For example: what would the ticket price be if I changed the number of staff?' },
    { type: 'tf', q: 'Spreadsheets can be used to model financial scenarios.', a: true, why: 'Figure 2.10 shows two scenarios from a financial model.' },
  ],
});
