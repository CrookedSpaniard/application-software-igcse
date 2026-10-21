FD.add({
  id: 'apps',
  title: 'Apps and app stores',
  tab: 'Apps',
  icon: 'apps',
  color: '--c4',
  section: true,
  interactive: true,
  vocab: [
    ['Application software (apps)', 'Software that lets users produce a digital product, such as a presentation or an image, or carry out specific tasks that are not related to the operating system.'],
    ['App store', 'A service, provided by some operating systems, where users find and download apps.'],
  ],
  mount(el) {
    // [emoji, name, type, harmful?]
    const SUBMIT = [['🎵', 'BeatMaker', 'Sound editing', false], ['🔦', 'Super Torch', 'Utility', true], ['📒', 'NoteBook', 'Word processing', false]];
    const NEEDS = [
      ['Write a letter to a local business', 'Word processing'],
      ['Work out the cost of a school trip', 'Spreadsheet'],
      ['Design a magazine page with columns', 'Desktop publishing (DTP)'],
      ['Remove red-eye from a photo', 'Photo editing'],
      ['Support a talk to your class', 'Presentation'],
      ['Search the records of 2000 library books', 'Database'],
    ];
    const TYPES = [...new Set(NEEDS.map((n) => n[1]))];
    el.innerHTML = `
      <div class="sim ap-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="what">📱 What apps do</button><button data-p="store">🛒 App store</button><button data-p="os">🖥️ Versions</button><button data-p="type">🎯 Choose the type</button>
        </div>

        <div data-panel="what" class="sim">
          <div class="two-col">
            <div class="sim-box"><h5 class="mw-h">Produce a digital product</h5>
              <div class="ap-prods">${[['📽️', 'Presentation'], ['🖼️', 'Image'], ['📄', 'Report'], ['🎬', 'Video'], ['🌐', 'Website'], ['🎵', 'Soundtrack']].map(([e, n]) => `<button class="ap-prod" data-n="${n}"><span>${e}</span>${n}</button>`).join('')}</div>
              <p class="note" id="wMsg">Click a product to see which app could make it.</p></div>
            <div class="sim-box"><h5 class="mw-h">Not related to the operating system</h5>
              <div class="ap-layers"><span class="ap-l on">📝 Apps · <small>your work</small></span><span class="ap-l">⚙️ Operating system · <small>controls the hardware</small></span><span class="ap-l">🖥️ Hardware</span></div>
              <p class="note">Apps run <b>on top of</b> the operating system. They do the user’s task; the operating system manages the computer.</p></div>
          </div>
        </div>

        <div data-panel="store" class="sim" hidden>
          <div class="ap-store">
            <div class="sim-box"><h5 class="mw-h">👩‍💻 Developers send apps</h5>
              <div class="ap-sub">${SUBMIT.map(([e, n, t, bad], i) => `<button class="btn" data-s="${i}">${e} Send ${n}</button>`).join('')}</div>
              <p class="note">One of these apps hides <b>harmful code</b>.</p></div>
            <div class="sim-box ap-check"><h5 class="mw-h">🔍 The store checks the app</h5>
              <div class="ap-scan" id="scan"><span class="note">Waiting for an app…</span></div>
              <div class="rm-meter"><i id="scanBar"></i></div></div>
            <div class="sim-box"><h5 class="mw-h">🛒 App store</h5>
              <div class="ap-shelf" id="shelf"></div></div>
          </div>
          <div class="ap-phone sim-box"><h5 class="mw-h">📱 Your smartphone</h5><div class="ap-home" id="home"><span class="ap-ic">⚙️<small>Settings</small></span></div>
            <p class="note" id="dMsg">Install an app from the store. It is <b>downloaded from a server</b> on the internet.</p>
            <div class="rm-meter"><i id="dlBar"></i></div>
            <button class="btn" id="bDvd">💿 Install from a DVD instead</button></div>
        </div>

        <div data-panel="os" class="sim" hidden>
          <div class="seg" id="osSeg"><button data-v="mac">🍎 macOS version</button><button data-v="win">🪟 Windows version</button></div>
          <div class="win ap-win" id="osWin" data-os="mac">
            <div class="win-bar"><span id="osTitle">Spreadsheet · macOS</span></div>
            <div class="ap-ribbon"><span>Home</span><span>Insert</span><span>Formulas</span><span>Data</span></div>
            <div class="ap-grid">${Array.from({ length: 24 }, (_, i) => `<i>${i === 0 ? 'A1' : ''}</i>`).join('')}</div>
            <div class="ap-task" id="osTask"></div>
          </div>
          <p class="note">Some developers provide versions of their apps for <b>different types of computer and operating systems</b> (Figure 2.8). The features are the same; the window looks like the rest of that operating system.</p>
        </div>

        <div data-panel="type" class="sim" hidden>
          <p class="note">For each need, choose the <b>type</b> of application software that is most suitable.</p>
          <div class="sort-rows">${NEEDS.map(([n], r) => `<div class="sort-row" data-r="${r}"><span class="sort-t">${n}</span><select data-r="${r}" aria-label="Type for: ${n}"><option value="">Choose a type…</option>${TYPES.map((t) => `<option>${t}</option>`).join('')}</select></div>`).join('')}</div>
          <p class="verdict" id="tMsg"></p>
          <p class="note ap-hint">💡 <b>Exam hint:</b> write the <b>type</b> (‘word processing software’), not the brand name of one product.</p>
        </div>
      </div>`;
    const root = el.querySelector('.ap-s'), $ = (s) => root.querySelector(s);
    let dead = false, gen = 0;
    const show = FD.panels(root);

    const MAKES = { Presentation: 'presentation software', Image: 'image editing software', Report: 'word processing software', Video: 'video editing software', Website: 'web authoring software', Soundtrack: 'sound editing software' };
    function product(n) {
      root.querySelectorAll('.ap-prod').forEach((b) => b.classList.toggle('on', b.dataset.n === n));
      $('#wMsg').innerHTML = `${n} → made with <b>${MAKES[n]}</b>.`;
    }
    root.querySelectorAll('.ap-prod').forEach((b) => b.addEventListener('click', () => product(b.dataset.n)));

    // ---- app store: check, publish, download ----
    let busy = false;
    async function submit(i) {
      if (busy) return;
      busy = true;
      const g = gen, [e, n, t, bad] = SUBMIT[i];
      const steps = ['Checking the quality…', 'Looking for code that could harm a device…', 'Looking for code that could harm data…'];
      for (let k = 0; k < steps.length; k++) {
        $('#scan').innerHTML = `<span class="ap-app">${e} ${n}</span><span class="note">${steps[k]}</span>`;
        await FD.tween(700, (x) => { if (g === gen) $('#scanBar').style.width = (100 * (k + x) / steps.length) + '%'; });
        if (dead || g !== gen) return;
      }
      $('#scanBar').style.width = '0';
      if (bad) {
        $('#scan').innerHTML = `<span class="ap-app bad-t">${e} ${n}</span><span class="verdict bad">✗ Rejected: harmful code found. Users will not see it.</span>`;
      } else {
        $('#scan').innerHTML = `<span class="ap-app">${e} ${n}</span><span class="verdict good">✓ Approved: now available in the store.</span>`;
        if (!$(`#shelf [data-a="${i}"]`)) $('#shelf').insertAdjacentHTML('beforeend', `<div class="ap-item new" data-a="${i}"><span>${e}</span><b>${n}</b><small>${t}</small><button class="mini-btn" data-i="${i}">Install</button></div>`);
      }
      root.querySelector(`[data-s="${i}"]`).disabled = true;
      busy = false;
    }
    async function install(i, dvd) {
      const g = gen, [e, n] = dvd ? ['💿', 'Photo Studio'] : SUBMIT[i];
      if ($(`#home [data-n="${n}"]`)) return;
      $('#dMsg').innerHTML = dvd ? 'Installing from the <b>DVD</b> (storage media)…' : `Downloading <b>${n}</b> from the store’s <b>server</b> on the internet…`;
      await FD.tween(1300, (x) => { if (g === gen) $('#dlBar').style.width = 100 * x + '%'; });
      if (dead || g !== gen) return;
      $('#dlBar').style.width = '0';
      $('#home').insertAdjacentHTML('beforeend', `<span class="ap-ic new" data-n="${n}">${e}<small>${n}</small></span>`);
      $('#dMsg').innerHTML = `<span class="good-t">✓ ${n} installed.</span>`;
    }
    root.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => submit(+b.dataset.s)));
    $('#shelf').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) install(+b.dataset.i); });
    $('#bDvd').addEventListener('click', () => install(0, true));

    // ---- versions for different operating systems ----
    function os(v) {
      FD.segSet($('#osSeg'), v);
      $('#osWin').dataset.os = v;
      $('#osTitle').textContent = v === 'mac' ? 'Spreadsheet · macOS' : 'Spreadsheet · Windows';
      $('#osTask').innerHTML = v === 'mac' ? '<span>Sheet1</span><span class="note">Dock at the bottom of the screen</span>' : '<span>Sheet1</span><span class="note">Taskbar · ⊞ Start</span>';
    }
    $('#osSeg').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) os(b.dataset.v); });

    // ---- choose the type ----
    const sels = [...root.querySelectorAll('.sort-row select')];
    function markTypes() {
      let got = 0, chosen = 0;
      sels.forEach((s) => {
        const ok = s.value === NEEDS[s.dataset.r][1];
        chosen += !!s.value; got += ok;
        s.classList.toggle('right', !!s.value && ok); s.classList.toggle('wrong', !!s.value && !ok);
      });
      const m = $('#tMsg');
      m.className = 'verdict' + (got === NEEDS.length ? ' good' : '');
      m.innerHTML = chosen ? (got === NEEDS.length ? '✓ All suitable. Each type has features that make it suitable for a particular function.' : `${got} / ${NEEDS.length} correct so far.`) : '';
    }
    sels.forEach((s) => s.addEventListener('change', markTypes));
    function fillTypes() { sels.forEach((s) => { s.value = NEEDS[s.dataset.r][1]; }); markTypes(); }

    function reset() {
      gen++; busy = false;
      $('#shelf').innerHTML = '';
      $('#home').innerHTML = '<span class="ap-ic">⚙️<small>Settings</small></span>';
      $('#scan').innerHTML = '<span class="note">Waiting for an app…</span>';
      $('#scanBar').style.width = '0'; $('#dlBar').style.width = '0';
      root.querySelectorAll('[data-s]').forEach((b) => { b.disabled = false; });
      $('#dMsg').innerHTML = 'Install an app from the store. It is <b>downloaded from a server</b> on the internet.';
    }
    show('what'); os('mac'); reset();
    return {
      show, product, submit, install, os, fillTypes, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'What is application software?',
      text: `<p>Software applications (<b>apps</b>) allow users to <b>produce a digital product</b>, such as a presentation or an image, or <b>carry out specific tasks</b> that are not related to the operating system.</p>`,
      tip: 'Try it: click a product to see which app could make it.',
      async on(a, ctx) { a.show('what'); for (const n of ['Presentation', 'Image', 'Report']) { a.product(n); if (!(await ctx.sleep(1300))) return; } },
    },
    {
      title: 'Downloaded from servers',
      text: `<p>Apps are usually <b>downloaded from servers</b> on the internet. Smartphones and tablets use operating systems that give access to <b>app stores</b>.</p>
             <p>Some stores only make an app available after they have <b>checked its quality</b> and made sure it does not include code that will <b>harm</b> a user’s device or data.</p>`,
      tip: 'Try it: send each app to the store, then install one.',
      async on(a, ctx) { a.show('store'); a.reset(); await a.submit(0); if (!(await ctx.sleep(500))) return; await a.submit(1); },
    },
    {
      title: 'Installing an app',
      text: `<p>The approved app is downloaded from the store’s server and installed on the device.</p>
             <p>Apps can also be installed from <b>storage media</b> like DVDs.</p>`,
      async on(a, ctx) { a.show('store'); await a.submit(2); if (!(await ctx.sleep(300))) return; await a.install(0); if (!(await ctx.sleep(400))) return; await a.install(0, true); },
    },
    {
      title: 'Versions for different systems',
      text: `<p>Some developers provide versions of their apps for <b>different types of computer and operating systems</b>. Figure 2.8 shows the same spreadsheet app on Apple macOS and on Microsoft Windows.</p>`,
      tip: 'Try it: switch between the two versions.',
      async on(a, ctx) { a.show('os'); a.os('mac'); if (!(await ctx.sleep(1600))) return; a.os('win'); },
    },
    {
      title: 'Choose the most suitable type',
      text: `<p>You need to be able to identify the <b>type of software</b> that meets specific needs. Each type has features that make it suitable for a particular function.</p>
             <p>Sometimes more than one type can do the task, so think about which one is <b>most suitable</b>.</p>`,
      tip: 'Exam hint: write ‘word processing software’, not a brand name.',
      async on(a) { a.show('type'); },
    },
  ],
});

FD.check({
  section: 'apps',
  items: [
    { type: 'mcq', q: 'What is <b>application software</b>?', opts: ['Software that lets users produce a digital product or carry out specific tasks not related to the operating system', 'Software that maintains or operates the computer system', 'The hardware inside a computer', 'Software that controls the processor'], why: 'For example, a presentation or an image.' },
    { type: 'mcq', q: 'Why do some app stores check apps before making them available?', opts: ['To make sure of the quality and that the app has no code that will harm a device or data', 'To make the app smaller', 'To translate the app into other languages', 'To make the app free'], why: 'Only then is the app made available to users.' },
    { type: 'tf', q: 'Apps can only be installed by downloading them from the internet.', a: false, why: 'Apps can also be installed from storage media like DVDs.' },
    { type: 'mcq', q: 'In an exam answer, which is the best way to name software for writing a letter?', opts: ['Word processing software', 'Microsoft Word', 'Writer', 'A document'], why: 'Refer to the type of application, not the brand name.' },
  ],
});
