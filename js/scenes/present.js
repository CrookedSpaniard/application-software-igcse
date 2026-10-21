FD.add({
  id: 'present',
  title: 'Presentation software',
  tab: 'Presentations',
  icon: 'present',
  color: '--c1',
  section: true,
  interactive: true,
  vocab: [
    ['Slide', 'A single page of a presentation.'],
    ['Pathway', 'The sequence of or route through a series of slides.'],
    ['Speaker notes', 'Notes added to a presentation to remind and prompt the presenter.'],
  ],
  mount(el) {
    const SL = [
      { t: 'Our trip to the science museum', e: '🚌', b: 'Year 10 · March', n: 'Say hello. Introduce the group and the date of the trip.' },
      { t: 'The space gallery', e: '🚀', b: 'A real rocket engine', n: 'Mention the robotic arm used on the International Space Station.' },
      { t: 'Hands-on robots', e: '🤖', b: 'We programmed a robot', n: 'Explain the sensor, decision and output.' },
      { t: 'What we learnt', e: '💡', b: 'Three big ideas', n: 'Ask the audience one question. Thank them.' },
    ];
    // positions of each slide on the pathway canvas (percent)
    const POS = [[12, 18], [62, 12], [70, 62], [18, 66]];
    el.innerHTML = `
      <div class="sim pr-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="edit">🖊️ Create slides</button><button data-p="show">📽️ Give the talk</button><button data-p="path">🧭 Pathway</button>
        </div>

        <div data-panel="edit" class="sim">
          <div class="pr-ed">
            <ol class="pr-thumbs" id="thumbs"></ol>
            <div class="pr-main"><div class="pr-slide" id="slide"></div>
              <div class="pr-add"><button class="mini-btn" data-m="img">🖼️ Image</button><button class="mini-btn" data-m="anim">✨ Animation</button><button class="mini-btn" data-m="video">🎬 Video</button></div>
              <label class="pr-notes"><b>Speaker notes</b><textarea id="notes" rows="2"></textarea></label></div>
          </div>
        </div>

        <div data-panel="show" class="sim" hidden>
          <div class="seg" id="mode"><button data-v="cmd">On command</button><button data-v="auto">Automatically (3 s)</button><button data-v="rehearse">Practise timings</button></div>
          <div class="pr-presenter">
            <div class="pr-proj"><small>What the audience sees</small><div class="pr-slide big" id="aud"></div><span class="pr-nar" id="nar" hidden>🔊 Narration playing</span></div>
            <div class="pr-pv"><small>Presenter view</small>
              <div class="pr-next" id="nextS"></div>
              <div class="pr-pn" id="pNote"></div>
              <div class="readout"><span class="ro"><small>Slide</small><b id="sNo">1 / 4</b></span><span class="ro"><small>Time</small><b id="clock">0.0 s</b></span></div>
              <div class="chk-btns"><button class="btn primary" id="bNext">Next slide ▶</button><label class="tgl"><input type="checkbox" id="bNar"> Recorded narration</label></div>
              <ol class="pr-times" id="times"></ol>
            </div>
          </div>
        </div>

        <div data-panel="path" class="sim" hidden>
          <div class="pr-world"><div class="pr-canvas" id="cv">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="pr-route"><path d="M${POS.map(([x, y]) => `${x + 10} ${y + 10}`).join(' L')}" /></svg>
            ${SL.map((s, i) => `<div class="pr-node" style="left:${POS[i][0]}%;top:${POS[i][1]}%" data-i="${i}"><b>${i + 1}</b><span>${s.e}</span><small>${s.t}</small></div>`).join('')}
          </div></div>
          <div class="chk-btns"><button class="btn" id="bOver">🔭 Overview</button><button class="btn primary" id="bPath">▶ Follow the pathway</button></div>
          <p class="note">Instead of separate slides, some apps place everything on one big canvas and <b>zoom</b> along a route: the <b>pathway</b>. An example is Prezi.</p>
        </div>
      </div>`;
    const root = el.querySelector('.pr-s'), $ = (s) => root.querySelector(s);
    let cur = 0, media = SL.map(() => new Set()), dead = false, gen = 0;
    const show = FD.panels(root, (p) => { gen++; clearInterval(tick); if (p === 'show') startShow(); if (p === 'path') overview(); });

    const slideHtml = (i) => {
      const s = SL[i], m = media[i];
      return `<h4>${s.t}</h4><div class="pr-body"><span class="pr-e ${m.has('anim') ? 'anim' : ''}">${s.e}</span><p>${s.b}</p>${m.has('img') ? '<span class="pr-m">🖼️ photo</span>' : ''}${m.has('video') ? '<span class="pr-m">🎬 ▶ 0:12</span>' : ''}</div>`;
    };
    function edit(i) {
      cur = i;
      $('#thumbs').innerHTML = SL.map((s, k) => `<li class="${k === i ? 'on' : ''}" data-i="${k}"><span>${s.e}</span>${s.t}</li>`).join('');
      $('#slide').innerHTML = slideHtml(i);
      $('#notes').value = SL[i].n;
    }
    $('#thumbs').addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) edit(+li.dataset.i); });
    $('#notes').addEventListener('input', (e) => { SL[cur].n = e.target.value; });
    function addMedia(m) { media[cur].add(m); edit(cur); }
    root.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => addMedia(b.dataset.m)));

    // ---- giving the talk ----
    let mode = 'cmd', pos = 0, tick = null, tStart = 0, times = [];
    function render() {
      $('#aud').innerHTML = slideHtml(pos);
      $('#aud').classList.remove('in'); void $('#aud').offsetWidth; $('#aud').classList.add('in');
      $('#nextS').innerHTML = pos < SL.length - 1 ? `<small>Next:</small> ${SL[pos + 1].e} ${SL[pos + 1].t}` : '<small>Next:</small> end of the talk';
      $('#pNote').innerHTML = `📝 ${FD.esc(SL[pos].n)}`;
      $('#sNo').textContent = `${pos + 1} / ${SL.length}`;
      $('#nar').hidden = !$('#bNar').checked;
      $('#times').innerHTML = times.map((t, i) => `<li>Slide ${i + 1}: <b>${t.toFixed(1)} s</b></li>`).join('');
    }
    function setMode(m) { mode = m; FD.segSet($('#mode'), m); startShow(); }
    $('#mode').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) setMode(b.dataset.v); });
    function startShow() {
      clearInterval(tick); pos = 0; times = []; tStart = performance.now();
      FD.segSet($('#mode'), mode);
      $('#bNext').disabled = mode === 'auto';
      render();
      tick = setInterval(() => {
        if (dead) return clearInterval(tick);
        const s = (performance.now() - tStart) / 1000 * FD.speed;
        $('#clock').textContent = s.toFixed(1) + ' s';
        if (mode === 'auto' && s >= 3) advance();
      }, 100);
    }
    function advance() {
      const s = (performance.now() - tStart) / 1000 * FD.speed;
      if (mode === 'rehearse') times.push(s);
      if (pos >= SL.length - 1) {
        clearInterval(tick);
        $('#aud').innerHTML = '<h4>The end</h4><div class="pr-body"><span class="pr-e">👏</span><p>Thank you!</p></div>';
        $('#nar').hidden = true;
        $('#times').innerHTML = times.map((t, i) => `<li>Slide ${i + 1}: <b>${t.toFixed(1)} s</b></li>`).join('') + (mode === 'rehearse' ? '<li class="good-t">✓ Timings saved: the slides can now advance with these timings.</li>' : '');
        return;
      }
      pos++; tStart = performance.now(); render();
    }
    $('#bNext').addEventListener('click', advance);
    $('#bNar').addEventListener('change', render);
    function narration(on) { $('#bNar').checked = on; render(); }

    // ---- pathway ----
    function camera(i) {
      const cv = $('#cv');
      if (i < 0) { cv.style.transform = 'scale(1)'; root.querySelectorAll('.pr-node').forEach((n) => n.classList.remove('on')); return; }
      const [x, y] = POS[i];
      cv.style.transform = `scale(2.6) translate(${40 - x}%, ${40 - y}%)`;
      root.querySelectorAll('.pr-node').forEach((n) => n.classList.toggle('on', +n.dataset.i === i));
    }
    function overview() { gen++; camera(-1); }
    async function followPath() {
      const g = ++gen;
      for (let i = 0; i < SL.length; i++) { camera(i); await FD.wait(1500); if (dead || g !== gen) return; }
      camera(-1);
    }
    $('#bOver').addEventListener('click', overview);
    $('#bPath').addEventListener('click', followPath);

    function reset() { media = SL.map(() => new Set()); edit(0); mode = 'cmd'; }
    show('edit'); reset();
    return {
      show, edit, addMedia, setMode, advance, narration, followPath, overview, reset,
      destroy() { dead = true; clearInterval(tick); },
    };
  },
  steps: [
    {
      title: 'Engaging multimedia content',
      text: `<p>Presentation software allows users to create engaging <b>multimedia</b> content, including images, text, animation and video.</p>
             <p>This content is placed on <strong>slides</strong> or <strong>pathways</strong> that are used to illustrate and support the <b>spoken content of a talk</b> given to an audience.</p>`,
      tip: 'Try it: add an image, an animation and a video to a slide.',
      async on(a, ctx) { a.show('edit'); a.reset(); a.edit(1); for (const m of ['img', 'anim', 'video']) { if (!(await ctx.sleep(800))) return; a.addMedia(m); } },
    },
    {
      title: 'Slides or pathways',
      text: `<p>A <b>slide</b> is a single page of a presentation. A <b>pathway</b> is the sequence of, or route through, a series of slides. An example of presentation software is Prezi.</p>`,
      tip: 'Try it: follow the pathway.',
      async on(a) { a.show('path'); await a.followPath(); },
    },
    {
      title: 'Timings and narration',
      text: `<p>Some applications let users <b>practise timings</b> and add <b>narration</b> that automatically plays back on the appropriate slides.</p>`,
      tip: 'Try it: choose Practise timings and click Next slide at your own pace.',
      async on(a, ctx) { a.show('show'); a.setMode('rehearse'); a.narration(true); for (let i = 0; i < 4; i++) { if (!(await ctx.sleep(1300))) return; a.advance(); } },
    },
    {
      title: 'Automatically or on command',
      text: `<p>Slides can be set to advance <b>automatically after a set period of time</b>, or <b>on command</b> from the presenter.</p>`,
      tip: 'Try it: compare “On command” with “Automatically”.',
      async on(a) { a.show('show'); a.narration(false); a.setMode('auto'); },
    },
    {
      title: 'Speaker notes',
      text: `<p><b>Notes</b> can be added to the presentation to remind and prompt the presenter to speak about specific points. Only the presenter sees them.</p>`,
      tip: 'Try it: write a note on the Create slides tab, then give the talk.',
      async on(a) { a.show('show'); a.setMode('cmd'); },
    },
  ],
});

FD.check({
  section: 'present',
  items: [
    { type: 'mcq', q: 'What is a <b>pathway</b> in presentation software?', opts: ['The sequence of or route through a series of slides', 'A single page of a presentation', 'A recorded narration', 'A type of animation'], why: 'A slide is a single page.' },
    { type: 'multi', q: 'How can presentation software help a presenter to give a talk? Choose <b>three</b>.', need: 3, opts: [['Notes remind and prompt the presenter', true], ['Slides illustrate and support the spoken content', true], ['Slides can advance on command or automatically', true], ['It calculates the cost of tickets', false], ['It checks apps for harmful code', false]], why: 'This is chapter question 6.' },
    { type: 'tf', q: 'Narration can automatically play back on the appropriate slides.', a: true, why: 'Users can also practise timings.' },
  ],
});
