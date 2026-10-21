FD.add({
  id: 'comms',
  title: 'Communication software',
  tab: 'Communication',
  icon: 'comms',
  color: '--c5',
  section: true,
  interactive: true,
  vocab: [
    ['File transfer protocol (FTP)', 'A method of exchanging data and files across a network.'],
    ['Filter', 'A computer program that only allows certain types of information to pass through it.'],
    ['Webmail', 'A web application for email, hosted on a web server and reached through a web browser.'],
  ],
  mount(el) {
    const MAIL = [
      ['Coach Davies', 'Football practice moved to Thursday', 'school'],
      ['Big Shoe Sale', '50% off trainers this weekend only!', 'offers'],
      ['Grandma', 'Photos from the beach 🏖️', ''],
      ['Mega Games', 'New levels are out now', 'offers'],
      ['Ms Lopez', 'ICT homework: application software', 'school'],
    ];
    el.innerHTML = `
      <div class="sim cm-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="web">🌐 Web browser</button><button data-p="mail">✉️ Email</button><button data-p="social">👥 Social media</button><button data-p="msg">💬 SMS, MMS and IM</button>
        </div>

        <div data-panel="web" class="sim">
          <div class="win"><div class="win-bar"><span class="url" id="url">https://www.museum.example</span></div>
            <div class="win-body" id="wb"></div></div>
          <div class="chk-btns"><button class="btn" data-w="site">🌐 Open a website</button><button class="btn" data-w="ftp">📁 Open an FTP server</button></div>
          <p class="note" id="wMsg"></p>
        </div>

        <div data-panel="mail" class="sim" hidden>
          <div class="cm-top">
            <span class="seg" id="mKind"><button data-v="client">💻 Installed email app</button><button data-v="web">🌐 Webmail</button></span>
            <label class="tgl"><input type="checkbox" id="online" checked> Internet connection</label>
            <label class="tgl" id="offL"><input type="checkbox" id="offline"> Store emails offline</label>
          </div>
          <div class="cm-mail">
            <div class="cm-fold"><b>Labels</b><button data-l="all" class="on">📥 Inbox</button><button data-l="school">🏫 School</button><button data-l="offers">🏷️ Offers</button>
              <b>Contacts</b><small>Coach Davies<br>Grandma<br>Ms Lopez</small></div>
            <div class="cm-inbox" id="inbox"></div>
          </div>
          <div class="sim-box cm-rule"><b>Filter rule</b> If the email is an <b>advert</b> → apply the label <b>Offers</b> and skip the inbox.
            <button class="btn" id="bFilter">Create filter</button></div>
          <p class="note" id="mMsg"></p>
        </div>

        <div data-panel="social" class="sim" hidden>
          <div class="seg" id="sKind"><button data-v="browser">🌐 In a web browser</button><button data-v="app">📱 Installed app</button><button data-v="multi">🗂️ Several accounts in one app</button></div>
          <div class="cm-soc" id="soc"></div>
          <p class="note" id="sMsg"></p>
        </div>

        <div data-panel="msg" class="sim" hidden>
          <div class="cm-msg">
            <div class="cm-phone">
              <div class="cm-bar"><span id="sig">📶 Mobile network</span><span id="net">🛜 Internet</span></div>
              <div class="cm-chat" id="chat"></div>
              <div class="cm-typing" id="typing" hidden>Alex is typing…</div>
              <div class="cm-att" id="att"></div>
              <div class="cm-comp"><textarea id="txt" rows="2" maxlength="400" aria-label="Message"></textarea><button class="btn primary" id="bSend">Send</button></div>
              <div class="cm-meta"><span id="kind" class="pill">SMS</span><span id="cnt">0 / 160</span></div>
            </div>
            <div class="cm-opts sim-box">
              <h5 class="mw-h">Message options</h5>
              <div class="seg" id="app"><button data-v="sms">SMS / MMS app</button><button data-v="im">Instant messaging app</button></div>
              <div class="chk-btns"><button class="mini-btn" data-a="🖼️ photo">🖼️ Add a photo</button><button class="mini-btn" data-a="🎤 audio">🎤 Add audio</button><button class="mini-btn" data-a="🎬 video">🎬 Add a video</button><button class="mini-btn" data-a="📍 location" id="bLoc">📍 Share location</button></div>
              <label class="tgl"><input type="checkbox" id="wifi" checked> Internet connection (Wi-Fi or data)</label>
              <label class="tgl" id="hideL"><input type="checkbox" id="hide"> Hide when I am typing</label>
              <p class="note" id="oMsg"></p>
            </div>
          </div>
        </div>
      </div>`;
    const root = el.querySelector('.cm-s'), $ = (s) => root.querySelector(s);
    let dead = false, gen = 0;
    const show = FD.panels(root, (p) => { gen++; ({ web: () => web('site'), mail: drawMail, social: () => social($('#sKind').dataset.v || 'browser'), msg: drawMsg })[p](); });

    // ---- browser ----
    function web(k) {
      if (k === 'site') {
        $('#url').innerHTML = '🔒 https://www.museum.example';
        $('#wb').innerHTML = '<div class="cm-site"><h4>🏛️ City Science Museum</h4><p>Opening times · Exhibitions · Visit</p><span class="pill">Server location: 🇯🇵 Japan</span></div>';
        $('#wMsg').innerHTML = 'Web browsers let users view web pages created in web authoring software and hosted on <b>servers</b> connected to the internet. The servers may be in <b>another country</b>.';
      } else {
        $('#url').innerHTML = '📁 ftp://files.school.example';
        $('#wb').innerHTML = `<table class="tbl cm-ftp"><tr><th>Name</th><th>Size</th><th></th></tr>${[['📄 timetable.pdf', '180 KB'], ['🖼️ trip-photos.zip', '24 MB'], ['📊 results.xlsx', '42 KB']].map(([n, s]) => `<tr><td>${n}</td><td>${s}</td><td><button class="mini-btn">⬇ Download</button></td></tr>`).join('')}</table>`;
        $('#wMsg').innerHTML = 'Browsers also give access to systems that use the internet but are <b>not on the World Wide Web</b>, such as <b>file transfer protocol</b> (FTP) servers.';
      }
      root.querySelectorAll('[data-w]').forEach((b) => b.classList.toggle('on', b.dataset.w === k));
    }
    root.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => web(b.dataset.w)));
    $('#wb').addEventListener('click', (e) => { const b = e.target.closest('.mini-btn'); if (b) { b.textContent = '✓ Saved'; b.disabled = true; } });

    // ---- email ----
    const M = { kind: 'client', label: 'all', filter: false, inbox: MAIL.slice(0, 3), arrived: 3 };
    function drawMail() {
      FD.segSet($('#mKind'), M.kind);
      const on = $('#online').checked, store = $('#offline').checked;
      $('#offL').hidden = M.kind !== 'web';
      root.querySelectorAll('[data-l]').forEach((b) => b.classList.toggle('on', b.dataset.l === M.label));
      let list = M.inbox.filter(([, , l]) => (M.label === 'all' ? !(M.filter && l === 'offers') : l === M.label));
      if (!on && M.kind === 'web' && !store) {
        $('#inbox').innerHTML = '<div class="cm-off">📵 No internet connection.<br><small>Webmail is hosted on a web server, so you cannot read your emails.</small></div>';
        $('#mMsg').innerHTML = 'Some webmail applications let users <b>store emails offline</b> for when they do not have an internet connection. Tick the box to try it.';
        return;
      }
      $('#inbox').innerHTML = `<div class="cm-hd">${M.kind === 'client' ? '💻 Email app · connected to the email server' : '🌐 webmail.example in a web browser'}${on ? '' : ' · <span class="bad-t">offline</span>'}</div>` +
        (list.map(([f, s, l], i) => `<div class="cm-em ${i === list.length - 1 && M.fresh ? 'new' : ''}"><b>${f}</b><span>${s}</span>${l ? `<span class="pill">${l === 'school' ? '🏫 School' : '🏷️ Offers'}</span>` : ''}</div>`).join('') || '<p class="note">No emails here.</p>');
      M.fresh = false;
      $('#mMsg').innerHTML = M.kind === 'client'
        ? 'The installed software acts as a <b>client</b> to an email server. It often stores a <b>database of contacts</b>.'
        : 'Webmail is a web application hosted on a web server and reached through a <b>web browser</b> using an internet connection.';
    }
    async function receive(n = 2) {
      const g = gen;
      for (let k = 0; k < n && M.arrived < MAIL.length; k++) {
        await FD.wait(900); if (dead || g !== gen || !$('#online').checked) return;
        M.inbox.push(MAIL[M.arrived++]); M.fresh = true; drawMail();
      }
    }
    function setKind(k) { M.kind = k; drawMail(); }
    $('#mKind').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setKind(b.dataset.v); });
    ['#online', '#offline'].forEach((s) => $(s).addEventListener('change', () => { drawMail(); if ($('#online').checked) receive(1); }));
    root.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('click', () => { M.label = b.dataset.l; drawMail(); }));
    function filter() { M.filter = true; $('#bFilter').textContent = '✓ Filter on'; $('#bFilter').disabled = true; drawMail(); $('#mMsg').innerHTML = 'The <b>filter</b> only lets certain emails through to the inbox; adverts get the <b>Offers</b> label. Labels help to <b>organise</b> emails.'; receive(2); }
    $('#bFilter').addEventListener('click', filter);
    function setOnline(on, store) { $('#online').checked = on; if (store != null) $('#offline').checked = store; drawMail(); }

    // ---- social media ----
    function social(k) {
      $('#sKind').dataset.v = k; FD.segSet($('#sKind'), k);
      const post = (a, t, e) => `<div class="cm-post"><b>${a}</b><p>${t}</p><span>${e}</span></div>`;
      if (k === 'browser') {
        $('#soc').innerHTML = `<div class="win"><div class="win-bar"><span class="url">🔒 https://social.example/pearsonschools</span></div><div class="win-body">${post('@pearsonschools', 'We teachers are rather good at magic, you know.', '💬 12 · 🔁 30 · ❤️ 210')}</div></div>`;
        $('#sMsg').innerHTML = 'Social media companies give access to their services through their <b>web pages</b> (Figure 2.20).';
      } else if (k === 'app') {
        $('#soc').innerHTML = `<div class="cm-sphone"><div class="cm-new">What’s happening?<span class="cm-tools">📷 GIF ☰ 📍 <b>140</b> <button class="mini-btn">Post</button></span></div>${post('@eco_club', 'Planting day on Friday 🌱', '❤️ 18')}</div>`;
        $('#sMsg').innerHTML = 'Social media can also be accessed using <b>locally installed apps</b>. Apps are available for mobile devices as well as PCs (Figure 2.21).';
      } else {
        $('#soc').innerHTML = `<div class="cm-cols">${[['@eco_club', 'Planting day on Friday 🌱'], ['@school_news', 'Sports day results are in!'], ['@ict_dept', 'Revision session after school']].map(([a, t]) => `<div class="cm-col"><h5>${a}</h5>${post(a, t, '❤️ 9')}${post(a, 'Thanks for coming!', '❤️ 4')}</div>`).join('')}</div>`;
        $('#sMsg').innerHTML = 'Some apps provide access to <b>multiple social media accounts</b> in one place. TweetDeck is an example of communication software used with social media.';
      }
    }
    $('#sKind').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) social(b.dataset.v); });

    // ---- SMS, MMS and instant messaging ----
    const S = { app: 'sms', att: [], chat: [] };
    function kindOf() {
      if (S.app === 'im') return 'IM';
      return S.att.length || $('#txt').value.length > 160 ? 'MMS' : 'SMS';
    }
    function drawMsg() {
      FD.segSet($('#app'), S.app);
      const k = kindOf(), n = $('#txt').value.length, wifi = $('#wifi').checked;
      $('#kind').textContent = k;
      $('#cnt').textContent = k === 'SMS' ? `${n} / 160` : `${n} characters`;
      $('#cnt').classList.toggle('bad-t', k === 'SMS' && n > 150);
      $('#net').classList.toggle('off', !wifi);
      $('#att').innerHTML = S.att.map((a) => `<span class="pill">${a}</span>`).join('');
      $('#bLoc').hidden = S.app !== 'im';
      $('#hideL').hidden = S.app !== 'im';
      $('#chat').innerHTML = S.chat.map(([me, t, k2]) => `<div class="cm-b ${me ? 'me' : ''}">${t}<small>${k2}</small></div>`).join('');
      $('#chat').scrollTop = 1e6;
      $('#oMsg').innerHTML = S.app === 'im'
        ? 'Instant messaging is very like MMS, but it needs a connection to the <b>internet</b>.'
        : 'SMS and MMS use the <b>mobile phone network</b>. They do not need an internet connection.';
    }
    function type(t) { $('#txt').value = t; drawMsg(); }
    function attach(a) { if (a.includes('location') && S.app !== 'im') return; if (!S.att.includes(a)) S.att.push(a); drawMsg(); }
    function setApp(a) { S.app = a; S.att = S.att.filter((x) => a === 'im' || !x.includes('location')); drawMsg(); }
    async function send() {
      const k = kindOf(), t = $('#txt').value.trim();
      if (!t && !S.att.length) return;
      if (k === 'IM' && !$('#wifi').checked) { $('#oMsg').innerHTML = '<span class="bad-t">✗ Not sent: instant messaging needs an internet connection.</span> Switch the app to SMS / MMS, which use the mobile phone network.'; return; }
      S.chat.push([true, FD.esc(t) + S.att.map((a) => ` <span class="pill">${a}</span>`).join(''), k === 'SMS' ? 'SMS · mobile network' : k === 'MMS' ? 'MMS · mobile network' : 'IM · internet']);
      S.att = []; $('#txt').value = ''; drawMsg();
      if (k === 'IM') {
        const g = gen;
        if (!$('#hide').checked) { await FD.wait(500); if (dead || g !== gen) return; $('#typing').hidden = false; }
        await FD.wait(1400); if (dead || g !== gen) return;
        $('#typing').hidden = true;
        S.chat.push([false, 'See you there! 👍', 'IM · internet']); drawMsg();
      }
    }
    $('#txt').addEventListener('input', drawMsg);
    $('#bSend').addEventListener('click', send);
    $('#app').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setApp(b.dataset.v); });
    root.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => attach(b.dataset.a)));
    $('#wifi').addEventListener('change', drawMsg);
    $('#hide').addEventListener('change', () => { $('#oMsg').innerHTML = $('#hide').checked ? 'Users can <b>prevent others from seeing</b> when they are typing.' : 'Users can see when other users are typing.'; });
    function setWifi(on) { $('#wifi').checked = on; drawMsg(); }

    function reset() {
      gen++;
      Object.assign(M, { kind: 'client', label: 'all', filter: false, inbox: MAIL.slice(0, 3), arrived: 3 });
      $('#bFilter').textContent = 'Create filter'; $('#bFilter').disabled = false; $('#online').checked = true; $('#offline').checked = false;
      Object.assign(S, { app: 'sms', att: [], chat: [] }); $('#txt').value = ''; $('#wifi').checked = true; $('#hide').checked = false; $('#typing').hidden = true;
      web('site'); drawMail(); social('browser'); drawMsg();
    }
    reset(); show('web');
    return {
      show, web, setKind, setOnline, filter, receive, social, type, attach, setApp, send, setWifi, reset,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Communication software',
      text: `<p>Communication software provides <b>remote access</b> to systems and allows users to <b>contact people</b> using the internet. It can be used to send files and messages as text, images, audio and video.</p>`,
      async on(a) { a.reset(); a.show('web'); },
    },
    {
      title: 'Web browsers',
      text: `<p><b>Web browsers</b> let users view web pages and websites hosted on servers connected to the internet. Different browsers have different features and compatibility with file types used on the World Wide Web.</p>
             <p>Browsers also give access to systems that are not on the World Wide Web, such as <strong>file transfer protocol</strong> (FTP) servers.</p>`,
      tip: 'Try it: open the website, then the FTP server.',
      async on(a, ctx) { a.show('web'); a.web('site'); if (!(await ctx.sleep(2000))) return; a.web('ftp'); },
    },
    {
      title: 'Email',
      text: `<p>Emails can be sent and received by <b>software installed on a computer</b>, which acts as a client to an email server. It often stores a database of contacts.</p>
             <p>Users can also use <b>webmail</b> through a web browser. Email applications provide features such as <b>labels</b> and <strong>filters</strong> to help organise emails.</p>`,
      tip: 'Try it: create the filter, switch to webmail and go offline.',
      async on(a, ctx) { a.show('mail'); a.filter(); if (!(await ctx.sleep(2600))) return; a.setKind('web'); if (!(await ctx.sleep(1200))) return; a.setOnline(false, false); if (!(await ctx.sleep(1600))) return; a.setOnline(false, true); },
    },
    {
      title: 'Social media',
      text: `<p>Social media can be accessed through a <b>web browser</b> or by using <b>locally installed apps</b>. Some apps provide access to multiple social media accounts; TweetDeck is an example.</p>`,
      tip: 'Try the three ways to use social media.',
      async on(a, ctx) { a.show('social'); for (const k of ['browser', 'app', 'multi']) { a.social(k); if (!(await ctx.sleep(1500))) return; } },
    },
    {
      title: 'SMS and MMS',
      text: `<p><b>SMS</b> (short messaging service) lets users send up to <b>160 text characters</b> per message using the mobile phone network.</p>
             <p><b>MMS</b> (multimedia messaging service) can deliver more than 160 characters and include video, animations, images and audio. Neither needs an internet connection.</p>`,
      tip: 'Try it: turn the internet off, type a message and add a photo.',
      async on(a, ctx) { a.show('msg'); a.setApp('sms'); a.setWifi(false); a.type('Running late, see you at the station at 5.'); if (!(await ctx.sleep(1300))) return; await a.send(); a.type('Look at this!'); a.attach('🖼️ photo'); if (!(await ctx.sleep(1300))) return; await a.send(); },
    },
    {
      title: 'Instant messaging',
      text: `<p><b>Instant messaging</b> is very similar to MMS, but it needs a connection to the <b>internet</b>. Users can see when others are typing, and can prevent others from seeing when they are typing. Messages can include <b>location</b> data.</p>`,
      tip: 'Try it: send an instant message with the internet off, then on.',
      async on(a, ctx) { a.show('msg'); a.setApp('im'); a.type('Are you coming to the match?'); await a.send(); if (!(await ctx.sleep(1500))) return; a.setWifi(true); a.attach('📍 location'); await a.send(); },
    },
  ],
});

FD.check({
  section: 'comms',
  items: [
    { type: 'multi', q: 'State <b>three</b> types of service provided by communication software.', need: 3, opts: [['Email', true], ['Instant messaging', true], ['Web browsing', true], ['Desktop publishing', false], ['Disk defragmentation', false]], why: 'Also social media, SMS and MMS (chapter question 9).' },
    { type: 'mcq', q: 'What is the maximum number of text characters in one SMS message?', opts: ['160', '140', '500', 'There is no limit'], why: 'MMS can deliver more than 160 characters.' },
    { type: 'sort', q: 'Does each service need an internet connection?', bins: ['Needs the internet', 'Mobile phone network only'], rows: [['SMS', 1], ['MMS', 1], ['Instant messaging', 0], ['Webmail', 0]], why: 'SMS and MMS use the mobile phone network.' },
    { type: 'mcq', q: 'What does an email <b>filter</b> do?', opts: ['Only allows certain types of information to pass through it', 'Deletes all emails', 'Makes emails smaller', 'Translates emails into HTML'], why: 'Labels and filters help to organise emails.' },
  ],
});
