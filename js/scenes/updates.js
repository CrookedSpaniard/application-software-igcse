FD.add({
  id: 'updates',
  title: 'Software updates',
  tab: 'Updates',
  icon: 'updates',
  color: '--c7',
  section: true,
  interactive: true,
  vocab: [
    ['Update', '(noun) a change or addition to a computer file so that it has the most recent information; (verb) to make such a change.'],
    ['Bugs', 'Errors in the program’s source code.'],
    ['Vulnerability', 'Weakness or exposure to harm.'],
    ['Compatibility', 'The ability of one device, system or application to work with other devices, systems and applications.'],
    ['Usability', 'The ease with which a device or application can be used.'],
  ],
  mount(el) {
    const R = {
      sec: ['🛡️', 'Fixes a security vulnerability'], bug: ['🐞', 'Fixes bugs'], comp: ['🧩', 'Works with the newer operating system'],
      perf: ['⚡', 'Better performance and efficiency'], feat: ['✨', 'New features'], use: ['👆', 'Easier to use (usability)'],
    };
    const APPS = [
      { id: 'br', e: '🌐', n: 'Web browser', v: '88', to: '89', why: ['sec'] },
      { id: 'ph', e: '📷', n: 'Photo editor', v: '2.1', to: '2.2', why: ['bug', 'use'] },
      { id: 'gm', e: '🎮', n: 'Maze game', v: '1.0', to: '1.1', why: ['comp', 'perf'] },
      { id: 'vd', e: '🎬', n: 'Video editor', v: '3.4', to: '4.0', why: ['feat', 'perf'], breaks: 'mu' },
      { id: 'mu', e: '🎵', n: 'Music player', v: '5.0', needs: true },
    ];
    el.innerHTML = `
      <div class="sim up-s">
        <div class="up-grid">
          <div class="sim-box up-dev"><h5 class="mw-h">💻 Your computer</h5>
            <ul class="up-apps" id="apps"></ul>
            <div class="chk-btns"><button class="btn" id="bBack">💾 Back up first</button><button class="btn ghost" id="bRest" disabled>↺ Restore the backup</button></div>
            <p class="note" id="bkMsg">No backup yet.</p></div>
          <div class="sim-box up-srv"><h5 class="mw-h">🗄️ Developers’ update server</h5>
            <button class="btn primary" id="bCheck">🔄 Check for updates</button>
            <div class="rm-meter"><i id="bar"></i></div>
            <ul class="up-list" id="list"></ul>
            <label class="tgl"><input type="checkbox" id="auto"> Install updates automatically at 03:00</label>
            <p class="up-clock" id="clock" hidden>🕒 <b id="time">22:00</b></p></div>
        </div>
        <p class="verdict" id="uMsg"></p>
      </div>`;
    const root = el.querySelector('.up-s'), $ = (s) => root.querySelector(s);
    let A = [], found = false, backup = null, dead = false, gen = 0;

    function draw() {
      $('#apps').innerHTML = A.map((a) => `<li class="${a.broken ? 'broken' : ''} ${a.fresh ? 'new' : ''}"><span>${a.e}</span><b>${a.n}</b><small>v${a.v}</small>${a.broken ? '<em class="bad-t">✗ will not open: a component it needs was removed</em>' : a.needs ? '<em class="note">uses the video editor’s codec component</em>' : ''}</li>`).join('');
      $('#list').innerHTML = found ? A.filter((a) => a.to && a.v !== a.to).map((a) => `<li><span>${a.e}</span><div><b>${a.n} ${a.v} → ${a.to}</b>${a.why.map((w) => `<span class="pill" title="${R[w][1]}">${R[w][0]} ${R[w][1]}</span>`).join('')}</div><button class="mini-btn" data-u="${a.id}">Install</button></li>`).join('') || '<li class="note">✓ Everything is up to date.</li>' : '<li class="note">Press “Check for updates”.</li>';
      A.forEach((a) => { a.fresh = false; });
      $('#bRest').disabled = !backup;
      $('#bkMsg').innerHTML = backup ? `<span class="good-t">✓ Backup saved (${backup.when}).</span>` : 'No backup yet.';
    }
    async function check() {
      const g = ++gen;
      $('#uMsg').className = 'verdict'; $('#uMsg').innerHTML = 'Contacting the server on the internet…';
      await FD.tween(1000, (t) => { if (g === gen) $('#bar').style.width = 100 * t + '%'; });
      if (dead || g !== gen) return;
      $('#bar').style.width = '0'; found = true; draw();
      $('#uMsg').innerHTML = 'Updates are made available for <b>download from a server</b> on the internet. Each one shows why it was released.';
    }
    async function install(id) {
      const a = A.find((x) => x.id === id); if (!a || a.v === a.to) return;
      const g = gen;
      $('#uMsg').className = 'verdict'; $('#uMsg').innerHTML = `Downloading and installing ${a.n} ${a.to}…`;
      await FD.tween(800, (t) => { if (g === gen) $('#bar').style.width = 100 * t + '%'; });
      if (dead || g !== gen) return;
      $('#bar').style.width = '0';
      a.v = a.to; a.fresh = true;
      if (a.breaks) {
        const b = A.find((x) => x.id === a.breaks); b.broken = true;
        $('#uMsg').className = 'verdict bad';
        $('#uMsg').innerHTML = `The update removed a component that the ${b.n.toLowerCase()} needs in order to function. ${backup ? 'Good thing you made a backup: restore it.' : 'There is no backup to go back to!'}`;
      } else {
        $('#uMsg').className = 'verdict good';
        $('#uMsg').innerHTML = `✓ ${a.n} updated: ${a.why.map((w) => R[w][1].toLowerCase()).join(' and ')}.`;
      }
      draw();
    }
    $('#list').addEventListener('click', (e) => { const b = e.target.closest('[data-u]'); if (b) install(b.dataset.u); });
    $('#bCheck').addEventListener('click', check);
    function doBackup() { backup = { apps: A.map((a) => ({ ...a })), when: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }; draw(); $('#uMsg').className = 'verdict'; $('#uMsg').innerHTML = 'The system and files are backed up <b>before</b> updating, in case the update introduces problems.'; }
    function restore() { if (!backup) return; A = backup.apps.map((a) => ({ ...a })); draw(); $('#uMsg').className = 'verdict good'; $('#uMsg').innerHTML = '✓ Backup restored: everything works again, as it was before the update.'; }
    $('#bBack').addEventListener('click', doBackup);
    $('#bRest').addEventListener('click', restore);
    async function night() {
      const g = ++gen;
      $('#auto').checked = true; $('#clock').hidden = false;
      for (let h = 22; h <= 27; h++) {
        $('#time').textContent = String(h % 24).padStart(2, '0') + ':00';
        await FD.wait(450); if (dead || g !== gen) return;
      }
      if (!found) { found = true; }
      for (const a of A.filter((x) => x.to && x.v !== x.to && !x.breaks)) { await install(a.id); if (dead || g !== gen) return; }
      $('#uMsg').className = 'verdict good';
      $('#uMsg').innerHTML = '✓ While you slept, the scheduled updates were installed <b>automatically</b>.';
    }
    $('#auto').addEventListener('change', (e) => { if (e.target.checked) night(); else { gen++; $('#clock').hidden = true; } });

    function reset() { gen++; A = APPS.map((a) => ({ ...a })); found = false; backup = null; $('#auto').checked = false; $('#clock').hidden = true; $('#bar').style.width = '0'; $('#uMsg').innerHTML = ''; draw(); }
    reset();
    return {
      check, install, doBackup, restore, night, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Why are updates released?',
      text: `<p><strong>Updates</strong> to software are released by software developers for these reasons:</p>
             <ul><li>fixing security <b>vulnerabilities</b> or <b>bugs</b></li><li>increasing <b>compatibility</b> with newer operating systems</li><li>improving performance and efficiency</li><li>introducing new features</li><li>improving <b>usability</b>.</li></ul>`,
      tip: 'Try it: check for updates and read the reason for each.',
      async on(a) { a.reset(); await a.check(); },
    },
    {
      title: 'Security vulnerabilities and bugs',
      text: `<p>A <b>vulnerability</b> is a weakness or exposure to harm. <b>Bugs</b> are errors in the program’s source code. Updates fix them.</p>`,
      tip: 'Try it: install the web browser and photo editor updates.',
      async on(a, ctx) { await a.install('br'); if (!(await ctx.sleep(600))) return; await a.install('ph'); },
    },
    {
      title: 'Compatibility, performance and features',
      text: `<p>Other updates make an app work with <b>newer operating systems</b> (compatibility), make it faster and more efficient, add <b>new features</b> or make it <b>easier to use</b> (usability).</p>`,
      async on(a) { await a.install('gm'); },
    },
    {
      title: 'Download or schedule',
      text: `<p>Software updates are usually made available for <b>download from a server</b> on the internet. Some updates can be <b>scheduled</b> to happen automatically when they are released.</p>`,
      tip: 'Try it: tick “Install updates automatically”.',
      async on(a) { a.reset(); await a.night(); },
    },
    {
      title: 'Back up before updating',
      text: `<p>It is important to <b>back up</b> a system and files before updating software, in case the update introduces problems, such as <b>removing components</b> that other software needs in order to function.</p>`,
      tip: 'Try it: update the video editor without a backup, then reset, back up first and try again.',
      async on(a, ctx) { a.reset(); await a.check(); a.doBackup(); if (!(await ctx.sleep(1200))) return; await a.install('vd'); if (!(await ctx.sleep(2200))) return; a.restore(); },
    },
  ],
});

FD.check({
  section: 'updates',
  items: [
    { type: 'multi', q: 'State <b>two</b> reasons for updating software.', need: 2, opts: [['Fixing security vulnerabilities or bugs', true], ['Introducing new features', true], ['Making the screen bigger', false], ['Removing the licence', false]], why: 'Also compatibility, performance and efficiency, and usability (chapter question 10).' },
    { type: 'mcq', q: 'What are <b>bugs</b>?', opts: ['Errors in the program’s source code', 'Viruses from the internet', 'New features', 'Weaknesses in the hardware'], why: 'A vulnerability is a weakness or exposure to harm.' },
    { type: 'mcq', q: 'Why should you back up before updating software?', opts: ['The update might introduce problems, such as removing components other software needs', 'Updates delete all your files', 'The update will not install without a backup', 'Backups make updates faster'], why: 'You can restore the backup if something goes wrong.' },
    { type: 'tf', q: 'Some updates can be scheduled to happen automatically when they are released.', a: true, why: 'They are usually downloaded from a server on the internet.' },
  ],
});
