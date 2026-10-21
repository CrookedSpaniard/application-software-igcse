FD.add({
  id: 'office',
  title: 'Word processing and desktop publishing',
  tab: 'Word / DTP',
  icon: 'office',
  color: '--c3',
  section: true,
  interactive: true,
  vocab: [
    ['Office productivity software', 'Any application that can carry out work-related tasks.'],
    ['Application suite', 'A collection of application software that share the same look and user interface; they can share data and some functionality.'],
    ['Hyperlink', 'A link that can be clicked in order to go to another location (often a web page on the internet).'],
    ['Font', 'The size and style of text.'],
  ],
  mount(el) {
    const SUITE = [['📝', 'Word processor'], ['📊', 'Spreadsheet'], ['📽️', 'Presentation'], ['🗃️', 'Database']];
    const FONTS = [['Georgia, serif', 'Georgia'], ['Arial, sans-serif', 'Arial'], ['"Comic Sans MS", cursive', 'Comic Sans'], ['ui-monospace, Menlo, monospace', 'Courier']];
    const LAYOUTS = {
      one: [['h', 6, 6, 88, 12], ['img', 6, 22, 88, 30], ['t', 6, 56, 88, 38]],
      two: [['h', 6, 6, 88, 12], ['t', 6, 22, 42, 72], ['img', 52, 22, 42, 30], ['t', 52, 56, 42, 38]],
      mag: [['img', 0, 0, 100, 46], ['h', 6, 50, 88, 12], ['t', 6, 66, 27, 28], ['t', 37, 66, 27, 28], ['t', 68, 66, 26, 28]],
    };
    el.innerHTML = `
      <div class="sim of-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="suite">🧰 Application suite</button><button data-p="wp">📝 Word processing</button><button data-p="team">👥 Working together</button><button data-p="dtp">📰 DTP</button>
        </div>

        <div data-panel="suite" class="sim">
          <div class="of-suite">${SUITE.map(([e, n], i) => `<div class="win of-app" data-i="${i}"><div class="win-bar">${e} ${n}</div><div class="of-rib"><span>File</span><span>Home</span><span>Insert</span><span>View</span></div><div class="of-body" id="sb${i}"></div></div>`).join('')}</div>
          <div class="chk-btns"><button class="btn" id="bShare">📊 → 📝 Copy the chart into the report</button></div>
          <p class="note" id="sMsg">The apps in a suite share the <b>same look and user interface</b>, so once you know one you can find your way around the others.</p>
        </div>

        <div data-panel="wp" class="sim" hidden>
          <div class="win of-wp">
            <div class="win-bar">📝 Letter.odt</div>
            <div class="of-tools">
              <select id="fFam" aria-label="Font">${FONTS.map(([f, n]) => `<option value='${f}'>${n}</option>`).join('')}</select>
              <select id="fSize" aria-label="Font size"><option>11</option><option selected>12</option><option>16</option><option>20</option></select>
              <button class="mini-btn" id="bTbl">▦ Table</button><button class="mini-btn" id="bLink">🔗 Hyperlink</button><button class="mini-btn" id="bEq">∑ Equation</button><button class="mini-btn" id="bChart">📊 Chart</button>
              <span class="seg" id="view"><button data-v="print">Print layout</button><button data-v="web">Web layout</button></span>
              <button class="mini-btn" id="bSpell">ABC ✓ Spelling</button>
            </div>
            <div class="of-paper" id="paper" data-view="print"><div class="of-page" id="page">
              <p class="of-txt" id="txt">Dear Ms Patel,</p>
              <p class="of-txt">Thank you for the <span class="sp" data-ok="information">infromation</span> about the work experience week. I would <span class="sp" data-ok="receive">recieve</span> the forms by Friday and I am <span class="sp" data-ok="definitely">definately</span> interested.</p>
              <div id="extras"></div>
            </div></div>
          </div>
          <p class="note" id="wMsg">Documents mostly include <b>words</b>, but also images, tables, hyperlinks, equations, simple drawings, shapes and charts.</p>
        </div>

        <div data-panel="team" class="sim" hidden>
          <div class="win"><div class="win-bar">📝 Report.odt · shared with 2 people</div>
            <div class="of-team">
              <div class="of-page of-tc" id="tc"></div>
              <div class="of-cmts" id="cmts"></div>
            </div></div>
          <div class="chk-btns"><button class="btn" id="bCmt">💬 Add a comment</button><button class="btn" id="bEdit">✏️ Make a tracked change</button><button class="btn" id="bAcc">✓ Accept all</button><button class="btn" id="bRej">✗ Reject all</button></div>
        </div>

        <div data-panel="dtp" class="sim" hidden>
          <div class="seg" id="lay"><button data-v="one">One column</button><button data-v="two">Two columns</button><button data-v="mag">Magazine</button></div>
          <div class="of-dtp"><div class="of-spread" id="spread"><div class="of-pg" id="pg1"></div><div class="of-pg" id="pg2"></div></div>
            <div class="of-pal"><b>Frames</b><span>🔤 Heading</span><span>🖼️ Image</span><span>¶ Text</span><small>Each part sits in its own frame that you can move and resize.</small></div></div>
          <p class="note">DTP shows the page layout so the designer can see <b>what the final version will look like when printed</b> (Figure 2.9).</p>
        </div>
      </div>`;
    const root = el.querySelector('.of-s'), $ = (s) => root.querySelector(s);
    let dead = false;
    const show = FD.panels(root);

    // ---- suite ----
    const fillSuite = () => {
      $('#sb0').innerHTML = '<p class="of-l w70"></p><p class="of-l"></p><p class="of-l w50"></p>';
      $('#sb1').innerHTML = '<div class="of-mini-grid">' + Array.from({ length: 12 }, () => '<i></i>').join('') + '</div><div class="of-bars"><i style="height:40%"></i><i style="height:75%"></i><i style="height:55%"></i></div>';
      $('#sb2').innerHTML = '<div class="of-slide">Slide 1</div>';
      $('#sb3').innerHTML = '<p class="of-l w50"></p><p class="of-l w70"></p>';
    };
    async function share() {
      fillSuite();
      const bars = $('#sb1 .of-bars');
      bars.classList.add('hot');
      await FD.wait(700);
      if (dead) return;
      bars.classList.remove('hot');
      $('#sb0').insertAdjacentHTML('beforeend', '<div class="of-bars new"><i style="height:40%"></i><i style="height:75%"></i><i style="height:55%"></i></div>');
      $('#sMsg').innerHTML = '<span class="good-t">✓ The chart moved from the spreadsheet into the report.</span> Apps in a suite can often <b>share data</b> with each other and share some functionality.';
    }
    $('#bShare').addEventListener('click', share);

    // ---- word processing ----
    const page = $('#page');
    function font(f, size) {
      if (f) $('#fFam').value = f;
      if (size) $('#fSize').value = size;
      page.style.fontFamily = $('#fFam').value;
      page.style.fontSize = (+$('#fSize').value / 12) + 'rem';
    }
    $('#fFam').addEventListener('change', () => font());
    $('#fSize').addEventListener('change', () => font());
    function view(v) { FD.segSet($('#view'), v); $('#paper').dataset.view = v; }
    $('#view').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) view(b.dataset.v); });
    const EXTRA = {
      bTbl: '<table class="of-tbl"><tr><th>Day</th><th>Task</th></tr><tr><td>Mon</td><td>Induction</td></tr><tr><td>Tue</td><td>Office work</td></tr></table>',
      bLink: '<p class="of-txt">Find out more: <a href="#" class="of-a" onclick="return false">www.example.com/work-experience</a></p>',
      bEq: '<p class="of-txt of-eq">Total hours = 5 × 7 = 35</p>',
      bChart: '<div class="of-bars"><i style="height:40%"></i><i style="height:75%"></i><i style="height:55%"></i></div>',
    };
    const insert = (k) => { if (!$('#extras').querySelector(`[data-k="${k}"]`)) { const d = FD.h(`<div data-k="${k}" class="new">${EXTRA[k]}</div>`); $('#extras').appendChild(d); } };
    Object.keys(EXTRA).forEach((k) => $('#' + k).addEventListener('click', () => insert(k)));
    function spell(on = true) {
      page.classList.toggle('checking', on);
      $('#wMsg').innerHTML = on ? 'Spelling and grammar checking tools <b>identify errors</b> as the user types. Click a red word to correct it.' : $('#wMsg').innerHTML;
    }
    $('#bSpell').addEventListener('click', () => spell(true));
    page.addEventListener('click', (e) => {
      const w = e.target.closest('.sp');
      if (!w || !page.classList.contains('checking')) return;
      w.textContent = w.dataset.ok; w.classList.add('fixed');
    });
    async function fixAll(ctx) {
      for (const w of page.querySelectorAll('.sp:not(.fixed)')) {
        if (!(await ctx.sleep(700))) return;
        w.textContent = w.dataset.ok; w.classList.add('fixed');
      }
    }
    function resetWp() {
      $('#extras').innerHTML = ''; page.classList.remove('checking');
      page.querySelectorAll('.sp').forEach((w) => { w.classList.remove('fixed'); w.textContent = { information: 'infromation', receive: 'recieve', definitely: 'definately' }[w.dataset.ok]; });
      font(FONTS[0][0], '12'); view('print');
    }

    // ---- comments and track changes ----
    let tcState = 0;
    function resetTeam() {
      tcState = 0;
      $('#tc').innerHTML = '<p class="of-txt">Our school recycles <span id="tcA">paper</span> every week. <span id="tcB"></span>Last year we saved 2 tonnes of waste.</p>';
      $('#cmts').innerHTML = '<p class="note">Comments appear here.</p>';
    }
    function comment() {
      if ($('#cmts .of-cmt')) return;
      $('#tcA').classList.add('of-hl');
      $('#cmts').innerHTML = '<div class="of-cmt new"><b>👩 Ms Lopez</b><p>Which other materials? Add plastic and cans.</p></div>';
    }
    function edit() {
      if (tcState) return;
      tcState = 1;
      $('#tcA').innerHTML = '<del>paper</del><ins>paper, plastic and cans</ins>';
      $('#tcB').innerHTML = '<ins>We also compost food waste. </ins>';
      $('#cmts').insertAdjacentHTML('beforeend', '<div class="of-cmt new tc"><b>✏️ Tracked changes · Sam</b><p>2 insertions, 1 deletion. Others can accept or reject them.</p></div>');
    }
    function decide(acc) {
      if (tcState !== 1) return;
      tcState = 2;
      root.querySelectorAll('#tc del').forEach((d) => (acc ? d.remove() : d.replaceWith(d.textContent)));
      root.querySelectorAll('#tc ins').forEach((d) => (acc ? d.replaceWith(d.textContent) : d.remove()));
      const c = $('#cmts .tc'); if (c) c.innerHTML = acc ? '<b class="good-t">✓ Changes accepted</b>' : '<b class="bad-t">✗ Changes rejected</b>';
    }
    $('#bCmt').addEventListener('click', comment);
    $('#bEdit').addEventListener('click', edit);
    $('#bAcc').addEventListener('click', () => decide(true));
    $('#bRej').addEventListener('click', () => decide(false));

    // ---- DTP ----
    function layout(k) {
      FD.segSet($('#lay'), k);
      ['pg1', 'pg2'].forEach((id, p) => {
        $('#' + id).innerHTML = LAYOUTS[p ? (k === 'mag' ? 'two' : k) : k].map(([t, x, y, w, h]) => `<div class="of-fr of-${t}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%">${t === 'h' ? 'HEADLINE' : t === 'img' ? '🖼️' : ''}</div>`).join('');
      });
    }
    $('#lay').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) layout(b.dataset.v); });

    function reset() { fillSuite(); resetWp(); resetTeam(); layout('one'); $('#sMsg').innerHTML = 'The apps in a suite share the <b>same look and user interface</b>, so once you know one you can find your way around the others.'; }
    show('suite'); reset();
    return {
      show, share, font, view, insert, spell, fixAll, comment, edit, decide, layout, reset, resetTeam,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Office productivity software',
      text: `<p><b>Office productivity software</b> is any application that can carry out work-related tasks.</p>
             <p>These apps are often available as an <strong>application suite</strong>: a collection of apps that share the same look and user interface. They can often share data and some functionality.</p>`,
      tip: 'Try it: copy the chart from the spreadsheet into the report.',
      async on(a, ctx) { a.show('suite'); a.reset(); if (!(await ctx.sleep(1200))) return; await a.share(); },
    },
    {
      title: 'Word processing',
      text: `<p>Word processing software lets users create documents that mostly include <b>words</b>, but also some images. They can also include tables, <b>hyperlinks</b>, equations, simple drawings and shapes, and charts.</p>
             <p>It is a good choice for <b>letters, reports, essays and books</b>. An example is Writer from the LibreOffice application suite.</p>`,
      tip: 'Try it: insert a table, a hyperlink, an equation and a chart.',
      async on(a, ctx) { a.show('wp'); for (const k of ['bTbl', 'bLink', 'bEq', 'bChart']) { if (!(await ctx.sleep(800))) return; a.insert(k); } },
    },
    {
      title: 'Fonts, layout views and spelling',
      text: `<p>Word processors let users change the <b>font</b> (the size and style of text) and provide different <b>layout views</b> to position text and images on the page.</p>
             <p>They usually come with <b>spelling and grammar checking</b> tools that identify errors as the user types.</p>`,
      tip: 'Try it: change the font, switch view, then click Spelling.',
      async on(a, ctx) {
        a.show('wp'); a.font('Arial, sans-serif', '16'); if (!(await ctx.sleep(1000))) return;
        a.view('web'); if (!(await ctx.sleep(1000))) return; a.view('print');
        a.spell(true); await a.fixAll(ctx);
      },
    },
    {
      title: 'Working together',
      text: `<p>Some word processing applications allow people to <b>work together</b> on a document. <b>Comments</b> can be added so others understand the writer’s intention and give feedback.</p>
             <p>The software can also <b>track any changes</b>, giving others the option to <b>accept or reject</b> them.</p>`,
      tip: 'Try it: add a comment, make a tracked change, then accept or reject it.',
      async on(a, ctx) { a.show('team'); a.resetTeam(); if (!(await ctx.sleep(900))) return; a.comment(); if (!(await ctx.sleep(1400))) return; a.edit(); if (!(await ctx.sleep(1800))) return; a.decide(true); },
    },
    {
      title: 'Desktop publishing (DTP)',
      text: `<p>DTP software has many features similar to word processing. The main difference is that it lets users work with <b>complicated page layouts</b>. An example is Adobe InDesign.</p>`,
      tip: 'Try it: switch between the three layouts.',
      async on(a, ctx) { a.show('dtp'); for (const k of ['one', 'two', 'mag']) { a.layout(k); if (!(await ctx.sleep(1300))) return; } },
    },
  ],
});

FD.check({
  section: 'office',
  items: [
    { type: 'mcq', q: 'What is an <b>application suite</b>?', opts: ['A collection of application software that share the same look and user interface', 'One app that does every task', 'A folder of documents', 'The operating system and its utilities'], why: 'They can often share data and some functionality.' },
    { type: 'multi', q: 'Which are good uses of word processing software? Choose <b>three</b>.', need: 3, opts: [['Letters', true], ['Essays', true], ['Reports', true], ['Calculating a budget', false], ['Editing a soundtrack', false]], why: 'Also books: this book was written using word processing software.' },
    { type: 'mcq', q: 'Which feature lets others <b>accept or reject</b> edits to a document?', opts: ['Track changes', 'Spell check', 'Layout view', 'Font'], why: 'Comments explain the writer’s intention; tracked changes can be accepted or rejected.' },
    { type: 'mcq', q: 'What is the main difference between DTP and word processing software?', opts: ['DTP lets users work with complicated page layouts', 'DTP cannot include images', 'DTP is only for calculations', 'DTP cannot print'], why: 'Figure 2.9: the layout shows what the printed version will look like.' },
  ],
});
