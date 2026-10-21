FD.add({
  id: 'sound',
  title: 'Sound editing',
  tab: 'Sound',
  icon: 'sound',
  color: '--c2',
  section: true,
  interactive: true,
  vocab: [
    ['Mute', 'Silence an audio track.'],
    ['Solo', 'Only play one particular audio track.'],
    ['Tempo', 'The speed at which a track is played.'],
    ['Reverberation', 'Prolonging a sound.'],
    ['Normalisation', 'Increasing the average volume of a piece of audio to a defined maximum level.'],
  ],
  mount(el) {
    const TR = [['🥁', 'Drums', '#e8590c'], ['🎸', 'Bass', '#7048e8'], ['🎹', 'Melody', '#1c7ed6']];
    const BASS = [0, 0, 7, 5], MEL = [12, 14, 16, 19, 16, 14, 12, 7];
    el.innerHTML = `
      <div class="sim sd-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="multi">🎚️ Multitrack</button><button data-p="clip">✂️ Edit a clip</button>
        </div>

        <div data-panel="multi" class="sim">
          <div class="sd-tracks" id="tracks">${TR.map(([e, n, c], i) => `
            <div class="sd-tr" data-t="${i}" style="--tc:${c}">
              <div class="sd-h"><b>${e} ${n}</b>
                <span><button class="sd-b" data-m="${i}" aria-pressed="false" title="Mute">M</button><button class="sd-b" data-so="${i}" aria-pressed="false" title="Solo">S</button></span>
                <label class="sd-vol">Vol <input type="range" min="0" max="100" value="80" data-v="${i}" aria-label="${n} volume"></label></div>
              <canvas class="sd-w" width="600" height="56" data-w="${i}"></canvas></div>`).join('')}
            <div class="sd-head" id="head"></div>
          </div>
          <div class="sd-ctl">
            <button class="btn primary" id="bPlay">▶ Play</button>
            <label class="rng">Tempo <input type="range" id="tempo" min="60" max="180" value="110"><b id="tempoV">110 BPM</b></label>
            <label class="rng">Low <input type="range" id="eqL" min="-12" max="12" value="0"><b id="eqLV">0 dB</b></label>
            <label class="rng">High <input type="range" id="eqH" min="-12" max="12" value="0"><b id="eqHV">0 dB</b></label>
            <label class="tgl"><input type="checkbox" id="rev"> Reverberation</label>
          </div>
          <p class="note" id="mMsg">Sound plays only when you press Play. An example of sound editing software is Audacity.</p>
        </div>

        <div data-panel="clip" class="sim" hidden>
          <div class="sim-box"><h5 class="mw-h">🎤 Voice clip <small class="note" id="cLen"></small></h5>
            <canvas class="sd-w sd-clip" id="clip" width="800" height="120"></canvas></div>
          <div class="sd-ops">
            <b>Clips</b><button class="mini-btn" data-op="cut">✂️ Cut the middle</button><button class="mini-btn" data-op="join">➕ Join another clip</button>
            <b>Processing</b><button class="mini-btn" data-op="reverse">⇆ Reverse</button><button class="mini-btn" data-op="noise">🔇 Noise reduction</button><button class="mini-btn" data-op="norm">📈 Normalisation</button><button class="mini-btn" data-op="fadein">◢ Fade in</button><button class="mini-btn" data-op="fadeout">◣ Fade out</button>
          </div>
          <div class="chk-btns"><button class="btn primary" id="bClip">▶ Play clip</button><button class="btn ghost" id="bOrig">↺ Original clip</button></div>
          <p class="note" id="cMsg">Choose an edit and watch the waveform change.</p>
        </div>
      </div>`;
    const root = el.querySelector('.sd-s'), $ = (s) => root.querySelector(s);
    let dead = false;
    const show = FD.panels(root, () => stopAll());
    const st = { mute: [false, false, false], solo: [false, false, false], vol: [80, 80, 80], tempo: 110, low: 0, high: 0, rev: false };

    // ---------- drawing the three tracks ----------
    const WAVES = TR.map((_, t) => Array.from({ length: 96 }, (_, i) => {
      if (t === 0) return i % 6 === 0 ? 1 : i % 6 === 3 ? .55 : .12;
      if (t === 1) return .5 + .3 * Math.sin(i / 3) * (i % 12 < 9 ? 1 : .3);
      return (.35 + .45 * Math.abs(Math.sin(i / 2.3))) * (i % 4 === 3 ? .4 : 1);
    }));
    const live = (t) => !st.mute[t] && (!st.solo.some(Boolean) || st.solo[t]);
    function drawTracks() {
      root.querySelectorAll('[data-w]').forEach((c) => {
        const t = +c.dataset.w, x = c.getContext('2d'), w = c.width, h = c.height, on = live(t);
        x.clearRect(0, 0, w, h);
        const col = getComputedStyle(c.closest('.sd-tr')).getPropertyValue('--tc');
        const eq = t === 0 ? 1 + st.high / 24 : t === 1 ? 1 + st.low / 24 : 1 + (st.low + st.high) / 48;
        const k = (st.vol[t] / 100) * eq;
        const bw = w / WAVES[t].length;
        x.fillStyle = on ? col : '#adb5bd';
        x.globalAlpha = on ? 1 : .35;
        WAVES[t].forEach((a, i) => {
          const len = Math.min(1, a * k) * (h / 2 - 3);
          x.fillRect(i * bw + 1, h / 2 - len, Math.max(1, bw - 2), len * 2);
          if (st.rev && on) { x.globalAlpha = .25; x.fillRect(i * bw + bw, h / 2 - len * .6, bw * 1.5, len * 1.2); x.globalAlpha = 1; }
        });
        x.globalAlpha = 1;
        c.closest('.sd-tr').classList.toggle('off', !on);
      });
      root.querySelectorAll('[data-m]').forEach((b) => { b.setAttribute('aria-pressed', st.mute[+b.dataset.m]); b.classList.toggle('on', st.mute[+b.dataset.m]); });
      root.querySelectorAll('[data-so]').forEach((b) => { b.setAttribute('aria-pressed', st.solo[+b.dataset.so]); b.classList.toggle('on', st.solo[+b.dataset.so]); });
      root.querySelectorAll('[data-v]').forEach((r) => { r.value = st.vol[+r.dataset.v]; });
      $('#tempo').value = st.tempo; $('#tempoV').textContent = st.tempo + ' BPM';
      $('#eqL').value = st.low; $('#eqLV').textContent = (st.low > 0 ? '+' : '') + st.low + ' dB';
      $('#eqH').value = st.high; $('#eqHV').textContent = (st.high > 0 ? '+' : '') + st.high + ' dB';
      $('#rev').checked = st.rev;
      applyAudio();
    }
    const say = (h) => { $('#mMsg').innerHTML = h; };

    // ---------- real sound (Web Audio), only after a click ----------
    let A = null, timer = null, step = 0, nextT = 0, raf = 0, t0 = 0;
    function build() {
      const ac = FD.audio(); if (!ac) return null;
      const master = ac.createGain(); master.gain.value = .5;
      const low = ac.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 250;
      const high = ac.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 3000;
      const conv = ac.createConvolver(), wet = ac.createGain();
      const len = ac.sampleRate * 1.8, ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
      conv.buffer = ir;
      low.connect(high); high.connect(master); high.connect(conv); conv.connect(wet); wet.connect(master); master.connect(ac.destination);
      const gains = TR.map(() => { const g = ac.createGain(); g.connect(low); return g; });
      const noise = ac.createBuffer(1, ac.sampleRate * .2, ac.sampleRate);
      const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      return { ac, master, low, high, wet, gains, noise };
    }
    function applyAudio() {
      if (!A) return;
      A.gains.forEach((g, t) => g.gain.setTargetAtTime(live(t) ? st.vol[t] / 100 : 0, A.ac.currentTime, .02));
      A.low.gain.value = st.low; A.high.gain.value = st.high;
      A.wet.gain.setTargetAtTime(st.rev ? .7 : 0, A.ac.currentTime, .05);
    }
    const hz = (n) => 110 * Math.pow(2, n / 12);
    function note(g, type, f, at, dur, vol) {
      const o = A.ac.createOscillator(), e = A.ac.createGain();
      o.type = type; o.frequency.value = f;
      e.gain.setValueAtTime(vol, at); e.gain.exponentialRampToValueAtTime(.0001, at + dur);
      o.connect(e); e.connect(g); o.start(at); o.stop(at + dur + .05);
    }
    function schedule() {
      const spb = 60 / st.tempo / 2; // eighth notes
      while (nextT < A.ac.currentTime + .12) {
        const s = step % 16;
        if (s % 4 === 0) { note(A.gains[0], 'sine', 120, nextT, .25, .9); }
        if (s % 4 === 2) { const n = A.ac.createBufferSource(), e = A.ac.createGain(); n.buffer = A.noise; e.gain.value = .35; n.connect(e); e.connect(A.gains[0]); n.start(nextT); }
        if (s % 2 === 0) note(A.gains[1], 'sine', hz(BASS[(s / 4) | 0] - 12), nextT, spb * 1.8, .7);
        note(A.gains[2], 'triangle', hz(MEL[s % 8] + 12), nextT, spb * .9, .25);
        nextT += spb; step++;
      }
    }
    function playhead() {
      if (!A || !timer) return;
      const beat = (A.ac.currentTime - t0) * st.tempo / 60 / 8;
      $('#head').style.left = `calc(${(beat % 1) * 100}% )`;
      raf = requestAnimationFrame(playhead);
    }
    function play() {
      if (timer) return stopAll();
      A = A || build(); if (!A) return;
      applyAudio();
      step = 0; nextT = A.ac.currentTime + .05; t0 = nextT;
      timer = setInterval(schedule, 25); schedule();
      $('#bPlay').innerHTML = '■ Stop'; $('#head').hidden = false; playhead();
    }
    function stopAll() {
      clearInterval(timer); timer = null; cancelAnimationFrame(raf);
      if ($('#bPlay')) $('#bPlay').innerHTML = '▶ Play';
      if ($('#head')) $('#head').hidden = true;
      if (src) { try { src.stop(); } catch (e) { /* ended */ } src = null; }
    }
    $('#bPlay').addEventListener('click', play);

    function mute(t, on = !st.mute[t]) { st.mute[t] = on; drawTracks(); say(`<b>Mute</b> silences a track: the ${TR[t][1].toLowerCase()} ${on ? 'is silent' : 'plays again'}.`); }
    function solo(t, on = !st.solo[t]) { st.solo = st.solo.map((_, i) => (i === t ? on : false)); drawTracks(); say(on ? `<b>Solo</b>: only the ${TR[t][1].toLowerCase()} plays.` : 'Solo is off: all the tracks play.'); }
    function vol(t, v) { st.vol[t] = v; drawTracks(); say('<b>Altering the volume</b> of one track does not change the others.'); }
    function tempo(v) { st.tempo = v; drawTracks(); say(`<b>Tempo</b>: the track now plays at ${v} beats per minute.`); }
    function eq(lo, hi) { st.low = lo; st.high = hi; drawTracks(); say('<b>Frequency equalisation</b>: changing the levels of high and low pitch frequencies.'); }
    function reverb(on) { st.rev = on; drawTracks(); say(on ? '<b>Reverberation</b> prolongs each sound, like playing in a large hall.' : 'Reverberation off.'); }
    root.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => mute(+b.dataset.m)));
    root.querySelectorAll('[data-so]').forEach((b) => b.addEventListener('click', () => solo(+b.dataset.so)));
    root.querySelectorAll('[data-v]').forEach((r) => r.addEventListener('input', () => vol(+r.dataset.v, +r.value)));
    $('#tempo').addEventListener('input', (e) => tempo(+e.target.value));
    $('#eqL').addEventListener('input', (e) => eq(+e.target.value, st.high));
    $('#eqH').addEventListener('input', (e) => eq(st.low, +e.target.value));
    $('#rev').addEventListener('change', (e) => reverb(e.target.checked));

    // ---------- the voice clip: real samples that each edit changes ----------
    const SR = 16000;
    const voice = () => {
      const n = SR * 2, sig = new Float32Array(n), hiss = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / SR, syl = Math.max(0, Math.sin(t * Math.PI * 3.2)) ** 2 * (t < 1.85 ? 1 : 0);
        sig[i] = .5 * syl * (Math.sin(2 * Math.PI * (180 + 40 * Math.sin(t * 5)) * t) + .4 * Math.sin(2 * Math.PI * 520 * t));
        hiss[i] = (Math.random() * 2 - 1) * .07;
      }
      return { sig, hiss };
    };
    const beep = () => { const n = SR * .6, sig = new Float32Array(n); for (let i = 0; i < n; i++) sig[i] = .5 * Math.sin(2 * Math.PI * 660 * i / SR) * Math.min(1, (n - i) / 2000); return { sig, hiss: new Float32Array(n).map(() => (Math.random() * 2 - 1) * .07) }; };
    let C = voice(), src = null;
    const mix = () => C.sig.map((v, i) => v + C.hiss[i]);
    function drawClip(mark) {
      const c = $('#clip'), x = c.getContext('2d'), w = c.width, h = c.height, s = mix();
      x.clearRect(0, 0, w, h);
      x.strokeStyle = 'rgba(128,128,128,.4)'; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();
      const per = s.length / w;
      x.fillStyle = getComputedStyle(root).getPropertyValue('--scene') || '#e8590c';
      for (let px = 0; px < w; px++) {
        let mx = 0;
        for (let i = Math.floor(px * per); i < Math.floor((px + 1) * per); i++) mx = Math.max(mx, Math.abs(s[i] || 0));
        const l = Math.min(1, mx) * (h / 2 - 2);
        x.fillRect(px, h / 2 - l, 1, l * 2 || 1);
      }
      if (mark) { x.fillStyle = 'rgba(246,201,76,.35)'; x.fillRect(mark[0] * w, 0, (mark[1] - mark[0]) * w, h); }
      $('#cLen').textContent = `${(s.length / SR).toFixed(1)} s`;
    }
    const OPS = {
      cut: () => { const n = C.sig.length, a = Math.floor(n * .4), b = Math.floor(n * .6); const f = (arr) => Float32Array.from([...arr.slice(0, a), ...arr.slice(b)]); C = { sig: f(C.sig), hiss: f(C.hiss) }; return '<b>Cut</b>: the middle part was removed and the two ends were joined.'; },
      join: () => { const B = beep(); C = { sig: Float32Array.from([...C.sig, ...B.sig]), hiss: Float32Array.from([...C.hiss, ...B.hiss]) }; return '<b>Join</b>: a second clip was added to the end.'; },
      reverse: () => { C = { sig: C.sig.slice().reverse(), hiss: C.hiss.slice().reverse() }; return '<b>Reverse</b>: the clip now plays backwards.'; },
      noise: () => { C.hiss = C.hiss.map((v) => v * .08); return '<b>Noise reduction</b>: the background hiss has almost gone.'; },
      norm: () => { const s = mix(); const pk = s.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1; const k = .98 / pk; C = { sig: C.sig.map((v) => v * k), hiss: C.hiss.map((v) => v * k) }; return `<b>Normalisation</b>: the volume was increased up to a defined maximum level (×${k.toFixed(2)}).`; },
      fadein: () => { const n = Math.floor(C.sig.length * .4); const f = (arr) => arr.map((v, i) => (i < n ? v * i / n : v)); C = { sig: f(C.sig), hiss: f(C.hiss) }; return '<b>Fade in</b>: the volume gets louder at the start.'; },
      fadeout: () => { const L = C.sig.length, n = Math.floor(L * .4); const f = (arr) => arr.map((v, i) => (i > L - n ? v * (L - i) / n : v)); C = { sig: f(C.sig), hiss: f(C.hiss) }; return '<b>Fade out</b>: the volume gets quieter at the end.'; },
    };
    function op(k) { if (src) { try { src.stop(); } catch (e) { /* ended */ } src = null; } $('#cMsg').innerHTML = OPS[k](); drawClip(); }
    root.querySelectorAll('[data-op]').forEach((b) => b.addEventListener('click', () => op(b.dataset.op)));
    function playClip() {
      const ac = FD.audio(); if (!ac) return;
      if (src) { try { src.stop(); } catch (e) { /* ended */ } }
      const s = mix(), buf = ac.createBuffer(1, s.length, SR);
      buf.getChannelData(0).set(s.map((v) => FD.clamp(v, -1, 1)));
      src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); src.start();
    }
    $('#bClip').addEventListener('click', playClip);
    function resetClip() { C = voice(); drawClip(); $('#cMsg').innerHTML = 'Choose an edit and watch the waveform change.'; }
    $('#bOrig').addEventListener('click', resetClip);

    function reset() { stopAll(); Object.assign(st, { mute: [false, false, false], solo: [false, false, false], vol: [80, 80, 80], tempo: 110, low: 0, high: 0, rev: false }); drawTracks(); say('Sound plays only when you press Play. An example of sound editing software is Audacity.'); }
    show('multi'); reset(); resetClip();
    return {
      show, mute, solo, vol, tempo, eq, reverb, op, resetClip, reset, drawClip,
      destroy() { dead = true; stopAll(); },
    };
  },
  steps: [
    {
      title: 'Sound editing software',
      text: `<p>Sound editing software lets users <b>edit audio files</b> or <b>join together</b> different audio files to create <b>multitrack</b> music or soundtracks for video. An example is Audacity.</p>`,
      tip: 'Try it: press Play to hear the three tracks together.',
      async on(a) { a.show('multi'); a.reset(); },
    },
    {
      title: 'Mute, solo and volume',
      text: `<p>Users can <strong>mute</strong> (silence) and <strong>solo</strong> (only play) some audio tracks, and alter the <b>volume levels</b> for individual tracks.</p>`,
      tip: 'Try it: press Play, then use M, S and the volume sliders.',
      async on(a, ctx) { a.show('multi'); a.mute(0, true); if (!(await ctx.sleep(1400))) return; a.mute(0, false); a.solo(2, true); if (!(await ctx.sleep(1400))) return; a.solo(2, false); a.vol(1, 35); },
    },
    {
      title: 'Tempo, equalisation and reverberation',
      text: `<p>Users can change the <strong>tempo</strong> (the speed at which a track is played), use <b>frequency equalisation</b> (changing the levels of high and low pitch frequencies) and add effects like <strong>reverberation</strong> (prolonging a sound).</p>`,
      tip: 'Try it while the music plays.',
      async on(a, ctx) { a.show('multi'); a.vol(1, 80); a.tempo(150); if (!(await ctx.sleep(1300))) return; a.eq(8, -6); if (!(await ctx.sleep(1300))) return; a.reverb(true); },
    },
    {
      title: 'Cut and join clips',
      text: `<p>Sound editors can <b>cut</b> and <b>join</b> audio clips.</p>`,
      tip: 'Try it: cut the middle, join another clip, then play it.',
      async on(a, ctx) { a.show('clip'); a.resetClip(); if (!(await ctx.sleep(1000))) return; a.op('cut'); if (!(await ctx.sleep(1300))) return; a.op('join'); },
    },
    {
      title: 'Audio processing',
      text: `<p>Users can also apply audio processing:</p>
             <ul><li><b>reverse</b></li><li><b>noise reduction</b></li><li><strong>normalisation</strong>: increasing the average volume to a defined maximum level</li><li><b>fade</b> the volume in, so that it gets louder, or out, so that it gets quieter.</li></ul>`,
      tip: 'Try each button and listen to the result.',
      async on(a, ctx) { a.show('clip'); a.resetClip(); for (const k of ['noise', 'norm', 'fadein', 'fadeout', 'reverse']) { if (!(await ctx.sleep(1100))) return; a.op(k); } },
    },
  ],
});

FD.check({
  section: 'sound',
  items: [
    { type: 'sort', q: 'Match each word to its meaning.', bins: ['Mute', 'Solo', 'Tempo'], rows: [['Only play one particular audio track', 1], ['Silence an audio track', 0], ['The speed at which a track is played', 2]], why: 'Mute, solo and tempo are features of sound editing software.' },
    { type: 'mcq', q: 'What is <b>normalisation</b>?', opts: ['Increasing the average volume of a piece of audio to a defined maximum level', 'Playing a track backwards', 'Removing background hiss', 'Changing the speed of a track'], why: 'Reverse and noise reduction are other kinds of audio processing.' },
    { type: 'mcq', q: 'What is <b>frequency equalisation</b>?', opts: ['Changing the levels of high and low pitch frequencies', 'Making every track the same length', 'Prolonging a sound', 'Joining two clips'], why: 'Reverberation is prolonging a sound.' },
    { type: 'tf', q: 'Fading the volume out makes it get quieter.', a: true, why: 'Fading in makes it get louder.' },
  ],
});
