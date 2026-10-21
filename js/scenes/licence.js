FD.add({
  id: 'licence',
  title: 'Software licensing',
  tab: 'Licences',
  icon: 'licence',
  color: '--c3',
  section: true,
  interactive: true,
  vocab: [
    ['Software licence', 'A legal arrangement that gives a user the right to install and use software.'],
    ['Free software', 'Software that can be modified or distributed by a user.'],
    ['Open-source software', 'Software for which the source code is made available to users.'],
    ['Source code', 'A collection of instructions that forms a piece of software.'],
    ['Proprietary software', 'Software that is marketed and distributed by its owner under a brand name.'],
    ['Freeware', 'Proprietary software provided free of charge to users.'],
  ],
  mount(el) {
    // [emoji, name, kind: 'free' | 'prop', price]
    const SW = [['🎨', 'GIMP', 'free', 0], ['🎚️', 'Audacity', 'free', 0], ['🦊', 'Mozilla Firefox', 'free', 0], ['📰', 'Adobe InDesign', 'prop', 1], ['📊', 'Microsoft Excel', 'prop', 1], ['🌐', 'Google Chrome', 'prop', 0]];
    const RIGHTS = [['study', '🔍 Study how it works'], ['modify', '✏️ Modify it'], ['copy', '📄 Copy it'], ['share', '📤 Distribute it'], ['src', '🧾 Source code available']];
    const HAS = { free: ['study', 'modify', 'copy', 'share', 'src'], prop: [] };
    el.innerHTML = `
      <div class="sim lc-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="two">⚖️ Two types</button><button data-p="pick">🔎 Look at a licence</button><button data-p="pirate">🏴‍☠️ No licence</button>
        </div>

        <div data-panel="two" class="sim">
          <div class="two-col">
            <div class="sim-box lc-col" data-k="free"><h5 class="mw-h">🕊️ Free or open-source</h5><ul class="lc-r">${RIGHTS.map(([k, t]) => `<li data-r="${k}" class="ok">${t}</li>`).join('')}</ul>
              <p class="note">The <b>user</b> can decide if, and how much, to charge for a copy or a service.</p></div>
            <div class="sim-box lc-col" data-k="prop"><h5 class="mw-h">™️ Proprietary</h5><ul class="lc-r">${RIGHTS.map(([k, t]) => `<li data-r="${k}">${t}</li>`).join('')}</ul>
              <p class="note">The <b>owner</b> decides the fee and whether the software can be distributed.</p></div>
          </div>
          <div class="sim-box lc-code"><div class="seg" id="srcSeg"><button data-v="exe">What users of proprietary software get</button><button data-v="src">What open-source users also get</button></div>
            <pre class="mono" id="code"></pre></div>
          <p class="note lc-key">🔑 <b>Key point:</b> ‘free’ does not refer to whether users have to pay. It means the software is <b>free from usage restrictions</b>. ‘Free’ describes the program; ‘open-source’ describes the source code.</p>
        </div>

        <div data-panel="pick" class="sim" hidden>
          <div class="lc-apps">${SW.map(([e, n], i) => `<button class="lc-app" data-i="${i}"><span>${e}</span>${n}</button>`).join('')}</div>
          <div class="lc-card" id="card"></div>
        </div>

        <div data-panel="pirate" class="sim" hidden>
          <div class="two-col">
            <div class="sim-box"><h5 class="mw-h">💿 Using software without a licence</h5><p class="note">You borrow a friend’s copy of a paid photo app and install it. You have no licence.</p><button class="btn" id="bUse">Install and use it</button><p class="note" id="useMsg"></p></div>
            <div class="sim-box"><h5 class="mw-h">📤 Distributing without the right</h5><p class="note">A website offers copies of a paid app for download, without the owner’s permission.</p><button class="btn" id="bDist">Share copies</button><p class="note" id="distMsg"></p></div>
          </div>
        </div>
      </div>`;
    const root = el.querySelector('.lc-s'), $ = (s) => root.querySelector(s);
    const show = FD.panels(root);

    const EXE = '0101 1100 0011 1010 1110 0001 0110 1011\n1001 0111 0100 1101 0010 1110 1000 0111\n(compiled program: people cannot read or change it)';
    const SRC = '// Make the photo brighter\nfunction brighten(photo, amount) {\n  for (const pixel of photo.pixels) {\n    pixel.red   = Math.min(255, pixel.red   + amount);\n    pixel.green = Math.min(255, pixel.green + amount);\n    pixel.blue  = Math.min(255, pixel.blue  + amount);\n  }\n}';
    function code(v) { FD.segSet($('#srcSeg'), v); $('#code').textContent = v === 'src' ? SRC : EXE; }
    $('#srcSeg').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) code(b.dataset.v); });
    function highlight(k) { root.querySelectorAll('.lc-col').forEach((c) => c.classList.toggle('hot', c.dataset.k === k)); }

    function pick(i) {
      const [e, n, k, paid] = SW[i];
      root.querySelectorAll('.lc-app').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
      const type = k === 'free' ? 'Free and open-source software' : paid ? 'Proprietary software' : 'Proprietary software · freeware';
      $('#card').innerHTML = `<div class="lc-doc ${k}">
        <p class="kick">Software licence</p><h4>${e} ${n}</h4><p class="lc-type">${type}</p>
        <ul class="lc-r">${RIGHTS.map(([r, t]) => `<li class="${HAS[k].includes(r) ? 'ok' : ''}">${t}</li>`).join('')}</ul>
        <p class="note">${k === 'free' ? 'Available free of charge, and the source code is available so users can change how it works.' : paid ? `Marketed by its owner under a brand name. The owner decides the fee. The source code is not made available.` : 'No fee is required, so it is called <b>freeware</b>. But it is still proprietary: the source code is not made available.'}</p>
        <p class="lc-fee">${paid ? '💷 Fee required' : '🆓 No fee'}</p></div>`;
    }
    root.querySelectorAll('.lc-app').forEach((b) => b.addEventListener('click', () => pick(+b.dataset.i)));

    function use() { $('#useMsg').innerHTML = '<span class="bad-t">⚠️ This is <b>software piracy</b>: using software without a required licence.</span>'; }
    function dist() { $('#distMsg').innerHTML = '<span class="bad-t">⚠️ These copies are <b>pirate software</b>: software distributed without the right to do so.</span>'; }
    $('#bUse').addEventListener('click', use);
    $('#bDist').addEventListener('click', dist);

    function reset() { code('exe'); highlight(''); pick(0); $('#useMsg').innerHTML = ''; $('#distMsg').innerHTML = ''; }
    show('two'); reset();
    return {
      show, code, highlight, pick, use, dist, reset,
      destroy() {},
    };
  },
  steps: [
    {
      title: 'Software licences',
      text: `<p>Sometimes users need a <strong>software licence</strong>: a legal arrangement that gives a user the right to install and use software.</p>
             <p>There are many types of licence, but you can think about two types of software: <b>free or open-source</b>, and <b>proprietary</b>.</p>`,
      async on(a) { a.show('two'); a.reset(); },
    },
    {
      title: 'Free software',
      text: `<p><strong>Free software</strong> licences give users the right to <b>study, modify, copy or distribute</b> a program. The user can decide if, and how much, to charge for a copy or a service. Free software can be available for a fee or free of charge.</p>
             <p>‘Free’ refers to the user’s <b>freedom</b>: there are no restrictions on the use of the software.</p>`,
      async on(a) { a.show('two'); a.highlight('free'); },
    },
    {
      title: 'Open-source software',
      text: `<p><strong>Open-source software</strong> licences make the <strong>source code</strong> available to users, so they can modify how the software works, or distribute the modified or unmodified software.</p>`,
      tip: 'Try it: compare what each type of user gets.',
      async on(a, ctx) { a.show('two'); a.highlight('free'); a.code('exe'); if (!(await ctx.sleep(1500))) return; a.code('src'); },
    },
    {
      title: 'Proprietary software and freeware',
      text: `<p><strong>Proprietary software</strong> is marketed and distributed by its <b>owner under a brand name</b>. The owner decides the fee and whether it can be distributed. It usually does not make its source code available.</p>
             <p>When no fee is required, it is called <strong>freeware</strong>.</p>`,
      tip: 'Try it: open each licence.',
      async on(a, ctx) { a.show('pick'); for (const i of [0, 3, 5]) { a.pick(i); if (!(await ctx.sleep(1700))) return; } },
    },
    {
      title: 'Software piracy',
      text: `<p>Using software without a required licence is called <b>software piracy</b>. Software distributed without the right to do so is called <b>pirate software</b>.</p>`,
      async on(a, ctx) { a.show('pirate'); a.use(); if (!(await ctx.sleep(1000))) return; a.dist(); },
    },
  ],
});

FD.activities({
  section: 'licence',
  items: [
    {
      id: 'licence-sort',
      type: 'table',
      title: 'Categorising software',
      task: '<p>Think about the examples of software types that you have read about in this chapter. Group these examples into the categories ‘free or open-source’ and ‘proprietary’.</p>',
      head: ['Software example', 'Category'],
      rows: [
        ['Writer (LibreOffice word processor)', [0]], ['Adobe InDesign (DTP)', [1]], ['Microsoft Excel (spreadsheet)', [1]],
        ['GIMP (photo editor)', [0]], ['Audacity (sound editor)', [0]], ['Adobe Dreamweaver (web authoring)', [1]],
        ['Serif Affinity Designer (graphics editor)', [1]], ['Mozilla Firefox (web browser)', [0]], ['Prezi (presentation)', [1]],
      ],
      opts: [['Free or open-source', 'Proprietary']],
      why: 'Proprietary software is sold under a brand name by its owner; free and open-source software can be studied, modified and shared.',
    },
  ],
});

FD.check({
  section: 'licence',
  items: [
    { type: 'mcq', q: 'In ‘free software’, what does the word <b>free</b> refer to?', opts: ['The software is free from usage restrictions', 'The software never costs any money', 'The software has no bugs', 'The software is free to download only'], why: 'Free software can be made available for a fee or free of charge.' },
    { type: 'mcq', q: 'What does an <b>open-source</b> licence make available to users?', opts: ['The source code', 'A free laptop', 'The owner’s brand name', 'A backup copy'], why: 'So users can modify how the software works.' },
    { type: 'mcq', q: 'What is <b>freeware</b>?', opts: ['Proprietary software provided free of charge', 'Software with its source code available', 'Software without a licence', 'Software distributed without the right to do so'], why: 'It usually does not make its source code available.' },
    { type: 'sort', q: 'Software piracy or pirate software?', bins: ['Software piracy', 'Pirate software'], rows: [['Using software without a required licence', 0], ['Software distributed without the right to do so', 1]], why: 'See the Did you know? feature on page 56.' },
  ],
});
