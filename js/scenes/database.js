FD.add({
  id: 'database',
  title: 'Databases',
  tab: 'Databases',
  icon: 'database',
  color: '--c5',
  section: true,
  interactive: true,
  vocab: [
    ['Database management system (DBMS)', 'Software used to enter, edit and search data.'],
    ['Data entry form', 'A screen that lets users input data, one record at a time.'],
    ['Query', 'A search that selects all the data that meets certain criteria.'],
    ['Report', 'Data displayed in a more readable format.'],
  ],
  mount(el) {
    const RIDES = ['Looper', 'Shuttle', 'Slider', 'Velocity'];
    const START = [
      ['Looper', 'Nadia', 'Hassan', 2008], ['Shuttle', 'Leo', 'Martin', 1977], ['Velocity', 'Aisha', 'Khan', 2010],
      ['Looper', 'Tom', 'Price', 1984], ['Slider', 'Mei', 'Chen', 1999], ['Velocity', 'Oscar', 'Reed', 2005],
      ['Shuttle', 'Priya', 'Shah', 2011], ['Looper', 'Jack', 'Ward', 1998],
    ];
    const NEW = [['Slider', 'Zara', 'Ali', 2009], ['Looper', 'Ben', 'Cole', 2012], ['Velocity', 'Lucy', 'Hart', 1990]];
    el.innerHTML = `
      <div class="sim db-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="form">📝 Data entry form</button><button data-p="query">🔍 Query editor</button><button data-p="report">📄 Report builder</button><button data-p="cli">⌨️ Command line</button>
        </div>
        <div class="db-main">
          <div class="db-left">
            <div data-panel="form" class="sim-box db-form">
              <h5 class="mw-h">New ticket</h5>
              <label>Ride<select id="fRide">${RIDES.map((r) => `<option>${r}</option>`).join('')}</select></label>
              <label>First name<input id="fFirst" type="text" maxlength="20"></label>
              <label>Surname<input id="fLast" type="text" maxlength="20"></label>
              <label>Year of birth<input id="fYear" type="number" min="1920" max="2020"></label>
              <div class="chk-btns"><button class="btn primary" id="bAdd">＋ Save record</button><button class="btn" id="bNext">Fill in the next ticket</button></div>
              <p class="note" id="fMsg">A form lets users input data one record at a time.</p>
            </div>
            <div data-panel="query" class="sim-box db-q" hidden>
              <h5 class="mw-h">Query: select all data that meets these criteria</h5>
              <label>Ride is<select id="qRide"><option value="">(any)</option>${RIDES.map((r) => `<option>${r}</option>`).join('')}</select></label>
              <label>Born<select id="qOp"><option value="">(any year)</option><option value="lt">before</option><option value="ge">in or after</option></select><input id="qYear" type="number" value="2000" min="1920" max="2020"></label>
              <button class="btn primary" id="bRun">▶ Run query</button>
              <p class="note mono" id="qSql"></p>
            </div>
            <div data-panel="report" class="sim-box db-rep" hidden>
              <div class="db-rep-h">Tickets sold in September</div>
              <div id="rep"></div>
              <p class="note">This report updates as soon as the data changes: add a record on the <b>form</b> and look again.</p>
            </div>
            <div data-panel="cli" class="db-cli" hidden>
              <div class="db-term mono" id="term"></div>
              <div class="chk-btns"><button class="btn" data-c="0">show tables;</button><button class="btn" data-c="1">describe tickets;</button><button class="btn" data-c="2">select * from tickets where ride='Looper';</button></div>
              <p class="note">This DBMS uses a <b>command line interface</b> and contains fewer features (Figure 2.12). An example is Oracle MySQL.</p>
            </div>
          </div>
          <div class="sim-box db-tbl"><h5 class="mw-h">🗃️ Table: tickets <small class="note" id="tN"></small></h5>
            <div class="tbl-wrap"><table class="tbl" id="tbl"></table></div></div>
        </div>
      </div>`;
    const root = el.querySelector('.db-s'), $ = (s) => root.querySelector(s);
    let rows = [], hits = null, nextNew = 0, dead = false, cli = [];
    const show = FD.panels(root, (p) => { if (p === 'report') report(); if (p !== 'query') { hits = null; table(); } });

    function table(newIdx) {
      $('#tbl').innerHTML = `<thead><tr><th>ID</th><th>Ride</th><th>First name</th><th>Surname</th><th>Born</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${hits ? (hits.includes(i) ? 'hit' : 'miss') : ''} ${i === newIdx ? 'new' : ''}"><td>${i + 1}</td><td>${r[0]}</td><td>${FD.esc(r[1])}</td><td>${FD.esc(r[2])}</td><td>${r[3]}</td></tr>`).join('')}</tbody>`;
      $('#tN').textContent = hits ? `${hits.length} of ${rows.length} records match` : `${rows.length} records`;
    }
    function fillNext() {
      const [r, f, l, y] = NEW[nextNew % NEW.length];
      $('#fRide').value = r; $('#fFirst').value = f; $('#fLast').value = l; $('#fYear').value = y;
    }
    function add() {
      const rec = [$('#fRide').value, $('#fFirst').value.trim(), $('#fLast').value.trim(), +$('#fYear').value];
      if (!rec[1] || !rec[2] || !(rec[3] >= 1920 && rec[3] <= 2020)) {
        $('#fMsg').innerHTML = '<span class="bad-t">Fill in every box (year 1920–2020) before saving.</span>';
        return false;
      }
      rows.push(rec); nextNew++;
      $('#fMsg').innerHTML = `<span class="good-t">✓ Record ${rows.length} saved.</span>`;
      ['#fFirst', '#fLast', '#fYear'].forEach((s) => { $(s).value = ''; });
      hits = null; table(rows.length - 1);
      return true;
    }
    $('#bAdd').addEventListener('click', add);
    $('#bNext').addEventListener('click', fillNext);

    function query(ride, op, year) {
      if (ride !== undefined) { $('#qRide').value = ride; $('#qOp').value = op || ''; if (year) $('#qYear').value = year; }
      const R = $('#qRide').value, O = $('#qOp').value, Y = +$('#qYear').value;
      hits = rows.map((r, i) => i).filter((i) => (!R || rows[i][0] === R) && (!O || (O === 'lt' ? rows[i][3] < Y : rows[i][3] >= Y)));
      const w = [R && `ride = '${R}'`, O && `born ${O === 'lt' ? '<' : '>='} ${Y}`].filter(Boolean);
      $('#qSql').textContent = `Criteria: ${w.length ? w.join(' AND ') : 'none (all records)'}`;
      table();
    }
    $('#bRun').addEventListener('click', () => query());

    function report() {
      $('#rep').innerHTML = `<table class="db-rt"><thead><tr><th>Ride name</th><th>First name</th><th>Surname</th><th>Born</th></tr></thead>${RIDES.map((ride) => {
        const rs = rows.filter((r) => r[0] === ride);
        return rs.length ? `<tbody><tr class="g"><td colspan="4">${ride} <small>(${rs.length})</small></td></tr>${rs.map((r) => `<tr><td></td><td>${FD.esc(r[1])}</td><td>${FD.esc(r[2])}</td><td>${r[3]}</td></tr>`).join('')}</tbody>` : '';
      }).join('')}</table>`;
    }

    const CMDS = [
      ['show tables;', ['+------------------+', '| Tables_in_park   |', '+------------------+', '| tickets          |', '+------------------+', '1 row in set (0.00 sec)']],
      ['describe tickets;', ['+------------+-------------+------+-----+', '| Field      | Type        | Null | Key |', '+------------+-------------+------+-----+', '| id         | int         | NO   | PRI |', '| ride       | varchar(20) | NO   |     |', '| first_name | varchar(20) | NO   |     |', '| surname    | varchar(20) | NO   |     |', '| born       | year        | NO   |     |', '+------------+-------------+------+-----+']],
      ["select * from tickets where ride='Looper';", null],
    ];
    function command(k) {
      const [c, out] = CMDS[k];
      const res = out || (() => { const L = rows.map((r, i) => [i + 1, ...r]).filter((r) => r[1] === 'Looper'); return [...L.map((r) => `| ${String(r[0]).padEnd(3)}| ${r[1].padEnd(9)}| ${r[2].padEnd(8)}| ${r[3].padEnd(8)}| ${r[4]} |`), `${L.length} rows in set (0.01 sec)`]; })();
      cli.push('mysql> ' + c, ...res, '');
      cli = cli.slice(-28);
      $('#term').textContent = cli.join('\n') + 'mysql> █';
      $('#term').scrollTop = 1e6;
    }
    root.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => command(+b.dataset.c)));

    function reset() { rows = START.map((r) => [...r]); hits = null; nextNew = 0; cli = []; $('#term').textContent = 'mysql> █'; table(); report(); $('#qSql').textContent = ''; }
    show('form'); reset();
    return {
      show, fillNext, add, query, command, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Database management systems',
      text: `<p><b>Database management systems</b> (DBMS) are used to <b>enter, edit and search</b> data. This database stores the tickets sold for the rides at a theme park.</p>`,
      async on(a) { a.show('form'); a.reset(); },
    },
    {
      title: 'Data entry forms',
      text: `<p>DBMS software features include <b>data entry forms</b> so that users can input data. Each form fills in one <b>record</b> (one row of the table).</p>`,
      tip: 'Try it: fill in the form and save a record.',
      async on(a, ctx) { a.show('form'); a.fillNext(); if (!(await ctx.sleep(1400))) return; a.add(); },
    },
    {
      title: 'Query editors',
      text: `<p><b>Query editors</b> let users select <b>all data that meets certain criteria</b>, for example every ticket for the Looper ride, or everyone born in or after 2000.</p>`,
      tip: 'Try it: change the criteria and run the query.',
      async on(a, ctx) { a.show('query'); a.query('Looper', '', 0); if (!(await ctx.sleep(1800))) return; a.query('', 'ge', 2000); },
    },
    {
      title: 'Report builders',
      text: `<p><b>Report builders</b> let users display data in a <b>more readable format</b> (Figure 2.13). Some systems produce reports that <b>dynamically display real-time changes</b> to the data as it updates.</p>`,
      tip: 'Try it: add a record on the form, then open the report again.',
      async on(a, ctx) { a.show('report'); if (!(await ctx.sleep(1500))) return; a.show('form'); a.fillNext(); a.add(); if (!(await ctx.sleep(800))) return; a.show('report'); },
    },
    {
      title: 'A command line DBMS',
      text: `<p>Some DBMS software uses a <b>command line interface</b> and contains fewer features (Figure 2.12). Users type commands instead of using forms. An example of DBMS software is Oracle MySQL.</p>`,
      tip: 'Try it: run the three commands.',
      async on(a, ctx) { a.show('cli'); for (const k of [0, 2]) { a.command(k); if (!(await ctx.sleep(1500))) return; } },
    },
  ],
});

FD.check({
  section: 'database',
  items: [
    { type: 'mcq', q: 'What is a DBMS used for?', opts: ['Entering, editing and searching data', 'Editing sound files', 'Designing web pages', 'Moving a robotic arm'], why: 'DBMS = database management system.' },
    { type: 'sort', q: 'Match each DBMS feature to what it does.', bins: ['Form', 'Query', 'Report'], rows: [['Lets users input data', 0], ['Selects all data that meets certain criteria', 1], ['Displays data in a more readable format', 2]], why: 'Data entry forms, query editors and report builders.' },
    { type: 'tf', q: 'Some database reports can display real-time changes to the data as it updates.', a: true, why: 'They update dynamically.' },
  ],
});
