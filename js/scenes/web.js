FD.add({
  id: 'web',
  title: 'Web authoring',
  tab: 'Web authoring',
  icon: 'web',
  color: '--c8',
  section: true,
  interactive: true,
  vocab: [
    ['Hypertext Markup Language (HTML)', 'A computing language read by web browser software.'],
    ['Intranet', 'A computer network used for exchanging or seeing information within a company.'],
    ['Web server', 'A computer that stores web pages and sends them to other devices that request them (often using web browser software).'],
    ['WYSIWYG', '‘What You See Is What You Get’: the published page looks very similar to the page the user edits.'],
  ],
  mount(el) {
    const BLOCKS = {
      h1: { b: 'H1 Heading', d: (x) => `<h1 contenteditable="true" spellcheck="false">${FD.esc(x)}</h1>`, c: (x) => `<h1>${FD.esc(x)}</h1>`, v: 'Eco Club' },
      p: { b: '¶ Paragraph', d: (x) => `<p contenteditable="true" spellcheck="false">${FD.esc(x)}</p>`, c: (x) => `<p>${FD.esc(x)}</p>`, v: 'We meet every Tuesday in room 12.' },
      img: { b: '🖼️ Image', d: () => '<div class="wb-img">🌳🌍🌻</div>', c: () => '<img src="garden.jpg" alt="Our garden">' },
      a: { b: '🔗 Link', d: () => '<p><a class="of-a">Join the club</a></p>', c: () => '<p><a href="join.html">Join the club</a></p>' },
      table: { b: '▦ Table', d: () => '<table class="of-tbl"><tr><th>Day</th><th>Job</th></tr><tr><td>Tue</td><td>Watering</td></tr></table>', c: () => '<table>\n  <tr><th>Day</th><th>Job</th></tr>\n  <tr><td>Tue</td><td>Watering</td></tr>\n</table>' },
    };
    el.innerHTML = `
      <div class="sim wb-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="edit">✏️ Web authoring app</button><button data-p="browser">🌐 What the browser does</button><button data-p="publish">🗄️ Publish</button>
        </div>

        <div data-panel="edit" class="sim">
          <div class="wb-tools">${Object.entries(BLOCKS).map(([k, b]) => `<button class="mini-btn" data-b="${k}">${b.b}</button>`).join('')}
            <span class="seg" id="vw"><button data-v="design">Design</button><button data-v="split">Split</button><button data-v="code">Code</button></span></div>
          <div class="wb-views" id="views" data-v="split">
            <div class="wb-design"><small class="wb-lbl">Design view · click the text to edit it</small><div class="wb-page" id="dz"></div></div>
            <pre class="wb-code mono" id="code" aria-label="HTML code"></pre>
          </div>
        </div>

        <div data-panel="browser" class="sim" hidden>
          <div class="two-col">
            <div class="sim-box"><h5 class="mw-h">📄 index.html (HTML)</h5><pre class="wb-code mono wb-raw" id="raw"></pre></div>
            <div class="win"><div class="win-bar"><span class="url">🔒 www.ecoclub.example/index.html</span></div><div class="win-body"><div class="wb-page" id="shown"></div></div></div>
          </div>
          <div class="chk-btns"><button class="btn primary" id="bTr">🌐 Translate into a page</button>
            <span class="seg" id="brw"><button data-v="Chrome">Google Chrome</button><button data-v="Edge">Microsoft Edge</button><button data-v="Firefox">Mozilla Firefox</button></span></div>
          <p class="note" id="bMsg">HTML is read by <b>web browser</b> software, which translates it into a page people can see and read.</p>
        </div>

        <div data-panel="publish" class="sim" hidden>
          <div class="seg" id="dest"><button data-v="intranet">🏢 Intranet</button><button data-v="server">🌍 Web server</button></div>
          <svg viewBox="0 0 640 230" class="wb-net" id="net" role="img" aria-label="Publishing a website">
            <rect class="wb-zone" id="zone" x="8" y="8" width="404" height="214" rx="16"/>
            <text class="svg-lbl" x="24" y="32" style="text-anchor:start" id="zoneT">Company network</text>
            ${FD.dv.laptop(30, 80)}<text class="svg-sm" x="60" y="146" text-anchor="middle">Web designer</text>
            ${FD.dv.server(185, 70)}<text class="svg-sm" x="215" y="138" text-anchor="middle" id="srvT">Intranet server</text>
            ${FD.dv.desktop(320, 40)}<text class="svg-sm" x="350" y="98" text-anchor="middle">Staff</text>
            ${FD.dv.laptop(320, 130)}<text class="svg-sm" x="350" y="190" text-anchor="middle">Staff</text>
            ${FD.dv.phone(520, 40)}<text class="svg-sm" x="550" y="98" text-anchor="middle">Anyone</text>
            ${FD.dv.tablet(520, 130)}<text class="svg-sm" x="550" y="190" text-anchor="middle">Anyone</text>
            <g id="pk"></g>
          </svg>
          <button class="btn primary" id="bPub">⬆ Publish the website</button>
          <p class="note" id="pMsg"></p>
        </div>
      </div>`;
    const root = el.querySelector('.wb-s'), $ = (s) => root.querySelector(s);
    let page = [], dead = false, gen = 0, dest = 'intranet';
    const show = FD.panels(root, (p) => { if (p === 'browser') browserReset(); });

    const html = () => `<!DOCTYPE html>\n<html>\n<head>\n  <title>Eco Club</title>\n</head>\n<body>\n${page.map(([k, x]) => BLOCKS[k].c(x).split('\n').map((l) => '  ' + l).join('\n')).join('\n')}\n</body>\n</html>`;
    const hl = (s) => FD.esc(s).replace(/(&lt;\/?)([a-z0-9!]+)/gi, '$1<b class="wb-tg">$2</b>').replace(/(\w+)=(&quot;[^&]*&quot;)/g, '<i>$1</i>=<u>$2</u>');
    function render(flash) {
      $('#dz').innerHTML = page.map(([k, x], i) => `<div class="wb-blk ${i === flash ? 'new' : ''}" data-i="${i}">${BLOCKS[k].d(x)}</div>`).join('') || '<p class="note">Empty page: add something from the toolbar.</p>';
      $('#code').innerHTML = hl(html());
      if (flash != null) { const lines = $('#code'); lines.classList.remove('flash'); void lines.offsetWidth; lines.classList.add('flash'); }
    }
    $('#dz').addEventListener('input', (e) => {
      const b = e.target.closest('.wb-blk'); if (!b) return;
      page[+b.dataset.i][1] = e.target.textContent;
      $('#code').innerHTML = hl(html());
    });
    function addBlock(k) { page.push([k, BLOCKS[k].v || '']); render(page.length - 1); }
    root.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => addBlock(b.dataset.b)));
    function view(v) { FD.segSet($('#vw'), v); $('#views').dataset.v = v; }
    $('#vw').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) view(b.dataset.v); });
    function editHeading(text) { const i = page.findIndex((p) => p[0] === 'h1'); if (i < 0) return; page[i][1] = text; render(); }

    // ---- browser ----
    let brw = 'Chrome';
    function browserReset() { $('#raw').innerHTML = hl(html()); $('#shown').innerHTML = '<p class="note">Press “Translate”.</p>'; FD.segSet($('#brw'), brw); }
    async function translate() {
      const g = gen;
      $('#shown').innerHTML = '';
      for (const [k, x] of page) {
        $('#shown').insertAdjacentHTML('beforeend', `<div class="new">${BLOCKS[k].d(x).replace(/ contenteditable="true" spellcheck="false"/g, '')}</div>`);
        await FD.wait(350); if (dead || g !== gen) return;
      }
      $('#bMsg').innerHTML = `<b>${brw === 'Chrome' ? 'Google Chrome' : brw === 'Edge' ? 'Microsoft Edge' : 'Mozilla Firefox'}</b> translated the HTML into a page that people can see and read.`;
    }
    $('#bTr').addEventListener('click', translate);
    $('#brw').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { brw = b.dataset.v; FD.segSet($('#brw'), brw); translate(); } });

    // ---- publish ----
    function setDest(d) {
      dest = d; FD.segSet($('#dest'), d);
      $('#net').dataset.d = d;
      $('#srvT').textContent = d === 'intranet' ? 'Intranet server' : 'Web server';
      $('#zoneT').textContent = d === 'intranet' ? 'Company network (intranet)' : 'The internet';
      $('#pMsg').innerHTML = d === 'intranet' ? 'An <b>intranet</b> is used for exchanging or seeing information <b>within a company</b>: only staff can open the pages.' : 'A <b>web server</b> on the internet stores the pages and sends them to <b>any device</b> that requests them.';
    }
    $('#dest').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setDest(b.dataset.v); });
    const fly = async (from, to, cls, g) => {
      const c = FD.h(`<svg><circle r="7" class="wb-pk ${cls}"/></svg>`).firstElementChild;
      $('#pk').appendChild(c);
      await FD.tween(700, (t) => { const [x, y] = FD.along([from, to], t); c.setAttribute('cx', x); c.setAttribute('cy', y); });
      c.remove();
      return !dead && g === gen;
    };
    async function publish() {
      const g = ++gen;
      if (!(await fly([60, 100], [215, 95], 'up', g))) return;
      const users = dest === 'intranet' ? [[350, 60], [350, 150]] : [[350, 60], [350, 150], [550, 60], [550, 150]];
      await Promise.all(users.map(async (u) => { if (await fly(u, [215, 95], 'req', g)) await fly([215, 95], u, 'page', g); }));
      const blocked = dest === 'intranet';
      if (blocked && g === gen) {
        await Promise.all([[550, 60], [550, 150]].map((u) => fly(u, [430, 100], 'no', g)));
        if (g === gen) $('#pMsg').innerHTML = 'Staff inside the company see the pages. <b class="bad-t">Devices outside the company cannot reach the intranet.</b>';
      } else if (g === gen) $('#pMsg').innerHTML = '<span class="good-t">✓ Every device that requested the pages received them from the web server.</span>';
    }
    $('#bPub').addEventListener('click', publish);

    function reset() { gen++; page = [['h1', 'Eco Club'], ['p', 'We meet every Tuesday in room 12.']]; render(); view('split'); setDest('intranet'); $('#pk').innerHTML = ''; }
    show('edit'); reset();
    return {
      show, addBlock, view, editHeading, translate, setDest, publish, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Web authoring software',
      text: `<p>Web authoring software lets users create <b>web pages</b> that include text and images. The pages are output as <strong>Hypertext Markup Language</strong> (HTML).</p>`,
      tip: 'Try it: add an image, a link and a table.',
      async on(a, ctx) { a.show('edit'); a.reset(); for (const k of ['img', 'a', 'table']) { if (!(await ctx.sleep(900))) return; a.addBlock(k); } },
    },
    {
      title: 'Browsers translate HTML',
      text: `<p>HTML is read by <b>web browser</b> software such as Google Chrome, Microsoft Edge or Mozilla Firefox. Web browsers <b>translate HTML into pages</b> that people can see and read.</p>`,
      tip: 'Try it: press Translate, then choose another browser.',
      async on(a, ctx) { a.show('browser'); if (!(await ctx.sleep(900))) return; await a.translate(); },
    },
    {
      title: 'Intranet or web server',
      text: `<p>Web pages can be <b>linked together</b> to create a website. People view it on an <strong>intranet</strong> (inside a company) or on a <strong>web server</strong> on the internet.</p>`,
      tip: 'Try it: publish to the intranet, then to a web server.',
      async on(a, ctx) { a.show('publish'); a.setDest('intranet'); await a.publish(); if (!(await ctx.sleep(1200))) return; a.setDest('server'); await a.publish(); },
    },
    {
      title: 'WYSIWYG editors',
      text: `<p>Some people write their own HTML. Other applications let users produce complex websites with little or no experience of HTML coding.</p>
             <p>These are called <b>‘What You See Is What You Get’ (WYSIWYG)</b> editors, because the published page looks very similar to the page the user edits. An example is Adobe Dreamweaver.</p>`,
      tip: 'Try it: type in the design view. The code is written for you.',
      async on(a, ctx) { a.show('edit'); a.view('design'); if (!(await ctx.sleep(1000))) return; a.editHeading('Eco Club news'); },
    },
    {
      title: 'Code and design views',
      text: `<p>Some web authoring software can display the <b>code</b> and <b>design</b> views one after the other (Figure 2.14). A change in one view appears in the other.</p>`,
      tip: 'Try it: switch between Design, Split and Code.',
      async on(a, ctx) { a.show('edit'); a.view('split'); if (!(await ctx.sleep(1500))) return; a.view('code'); if (!(await ctx.sleep(1500))) return; a.view('split'); },
    },
  ],
});

FD.check({
  section: 'web',
  items: [
    { type: 'mcq', q: 'In which language are web pages output by web authoring software?', opts: ['HTML (Hypertext Markup Language)', 'SMS', 'FTP', 'DTP'], why: 'HTML is read by web browser software.' },
    { type: 'mcq', q: 'What does a web browser do with HTML?', opts: ['Translates it into pages that people can see and read', 'Compresses it', 'Prints it', 'Deletes the images'], why: 'For example Google Chrome, Microsoft Edge or Mozilla Firefox.' },
    { type: 'mcq', q: 'What is an <b>intranet</b>?', opts: ['A computer network used for exchanging or seeing information within a company', 'A web server that anyone can use', 'A type of web browser', 'A language for web pages'], why: 'A web server on the internet is open to other devices.' },
    { type: 'mcq', q: 'Why is a WYSIWYG editor given that name?', opts: ['The published page looks very similar to the page the user edits', 'It writes the page in a different language', 'It works without a computer', 'It only shows the code'], why: 'What You See Is What You Get.' },
  ],
});
