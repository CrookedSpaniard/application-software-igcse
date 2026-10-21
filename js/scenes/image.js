FD.add({
  id: 'image',
  title: 'Image editing',
  tab: 'Images',
  icon: 'image',
  color: '--c6',
  section: true,
  interactive: true,
  vocab: [
    ['Bitmap', 'A computer image that is stored or printed as an arrangement of bits.'],
    ['Vector graphic', 'A graphical image made up of points and lines.'],
    ['Cropping', 'Using a photo editor to remove the edges of an image.'],
  ],
  mount(el) {
    const SW = ['#e03131', '#f08c00', '#2f9e44', '#1c7ed6', '#7048e8', '#18243B'];
    // A small photo drawn in SVG: seaside, a person with red eyes from the camera flash.
    const PHOTO = `
      <rect width="400" height="300" fill="#9cc9ee"/><rect y="150" width="400" height="60" fill="#5b8fb9"/><rect y="200" width="400" height="100" fill="#c9b48a"/>
      <circle cx="330" cy="60" r="28" fill="#ffd43b"/>
      <path d="M0 150 L40 90 L60 150 Z M50 150 L90 70 L120 150 Z" fill="#8a9bb0"/>
      <g transform="translate(200 175)"><path d="M-70 125 C-70 60 70 60 70 125Z" fill="#b84545"/>
        <circle r="52" fill="#f1c7a0"/><path d="M-54 -10 C-55 -70 55 -70 54 -10 C40 -40 -40 -40 -54 -10Z" fill="#6b4226"/>
        <circle class="ph-eye" cx="-19" cy="-2" r="8"/><circle class="ph-eye" cx="19" cy="-2" r="8"/>
        <circle cx="-17" cy="-4" r="2.2" fill="#fff"/><circle cx="21" cy="-4" r="2.2" fill="#fff"/>
        <path d="M-16 24 Q0 36 16 24" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;
    const LAND = `<rect width="400" height="300" fill="#7fb2e6"/><circle cx="312" cy="60" r="32" fill="#ffd43b"/>
      <path d="M0 210 Q120 150 240 198 Q320 225 400 180 V300 H0Z" fill="#5c940d"/><rect y="246" width="400" height="54" fill="#2b8a3e"/>
      <rect x="152" y="174" width="80" height="51" fill="#f1f3f5"/><path d="M140 177 L192 141 L244 177Z" fill="#c92a2a"/>
      <rect x="184" y="198" width="16" height="27" fill="#495057"/><rect x="160" y="186" width="16" height="11" fill="#74c0fc"/><rect x="208" y="186" width="16" height="11" fill="#74c0fc"/>`;
    el.innerHTML = `
      <div class="sim im-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="zoom">🔍 Bitmap or vector</button><button data-p="gfx">✒️ Graphics editor</button><button data-p="photo">📷 Photo editor</button>
        </div>

        <div data-panel="zoom" class="sim">
          <div class="two-col">
            <div class="sim-box"><h5 class="mw-h">Bitmap · an arrangement of bits (pixels)</h5><canvas id="bmp" width="400" height="300" class="im-view"></canvas></div>
            <div class="sim-box"><h5 class="mw-h">Vector graphic · points and lines</h5><svg id="vec" class="im-view" viewBox="0 0 400 300">${LAND}</svg></div>
          </div>
          <label class="rng">Zoom in <input type="range" id="zm" min="1" max="8" step="0.5" value="1"><b id="zmV">1×</b></label>
          <p class="note" id="zMsg">Zoom in: the bitmap becomes blocky; the vector graphic stays sharp because it is redrawn from its points and lines.</p>
        </div>

        <div data-panel="gfx" class="sim" hidden>
          <div class="im-gfx">
            <div class="im-tools">
              <button class="mini-btn" data-add="rect">▭ Shape</button><button class="mini-btn" data-add="circle">◯ Shape</button><button class="mini-btn" data-add="line">╱ Line</button><button class="mini-btn" data-add="text">T Text</button>
              <span class="im-sw">${SW.map((c) => `<button class="im-c" style="--c:${c}" data-c="${c}" aria-label="Colour ${c}"></button>`).join('')}</span>
              <label class="rng">Size <input type="range" id="gSize" min="40" max="200" value="100"></label>
              <button class="mini-btn" id="gAlign">⇔ Align centre</button><button class="mini-btn" id="gFront">⬆ Bring to front</button><button class="mini-btn" id="gBack">⬇ Send to back</button>
              <button class="mini-btn" id="gVec">✨ Vectorise the bitmap</button>
            </div>
            <svg class="im-board" id="board" viewBox="0 0 400 260"></svg>
            <div class="im-layers"><b>Layers</b><ol id="layers" reversed></ol><small>Top of the list = on top of the others.</small></div>
          </div>
          <p class="note" id="gMsg">Click an object to select it. Drag it to move it.</p>
        </div>

        <div data-panel="photo" class="sim" hidden>
          <div class="im-photo">
            <div class="im-stage" id="pStage"><svg id="ph" viewBox="0 0 400 300" class="im-view">
              <defs>
                <filter id="imSharp"><feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0"/></filter>
                <filter id="imWarp"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="22"/></filter>
              </defs><g id="phG">${PHOTO}</g></svg>
              <div class="im-crop" id="crop" hidden></div></div>
            <div class="im-ctrls">
              <label class="rng">Brightness <input type="range" id="pBri" min="40" max="180" value="100"></label>
              <label class="rng">Contrast <input type="range" id="pCon" min="40" max="200" value="100"></label>
              <label class="rng">Blur ← → Sharp <input type="range" id="pSh" min="-4" max="1" step="1" value="0"></label>
              <label class="rng">Resize <input type="range" id="pRes" min="20" max="100" value="100"><b id="pResV">4000 × 3000 px</b></label>
              <div class="im-fx"><b>Filters</b> <button class="mini-btn" data-f="none">None</button><button class="mini-btn" data-f="grey">Black and white</button><button class="mini-btn" data-f="sepia">Sepia</button><button class="mini-btn" data-f="warp">Distortion</button></div>
              <div class="chk-btns"><button class="btn" id="pRed">👁️ Red-eye removal</button><button class="btn" id="pCrop">✂️ Crop</button><button class="btn ghost" id="pReset">↺ Original</button></div>
            </div>
          </div>
          <p class="note" id="pMsg">Photo editors let users edit and enhance digital photographs. An example is GNU Image Manipulation Program (GIMP).</p>
        </div>
      </div>`;
    const root = el.querySelector('.im-s'), $ = (s) => root.querySelector(s);
    let dead = false, gen = 0;
    const show = FD.panels(root, (p) => { if (p === 'zoom') zoom(+$('#zm').value); });

    // ---- bitmap or vector ----
    function zoom(z) {
      $('#zm').value = z; $('#zmV').textContent = z + '×';
      const s = 1 / z, cx = 0.48 - s / 2, cy = 0.62 - s / 2;
      const vx = FD.clamp(cx, 0, 1 - s), vy = FD.clamp(cy, 0, 1 - s);
      FD.pic($('#bmp'), Math.max(4, Math.round(64 / z)), Math.max(3, Math.round(48 / z)), [vx, vy, s]);
      $('#vec').setAttribute('viewBox', `${vx * 400} ${vy * 300} ${s * 400} ${s * 300}`);
    }
    $('#zm').addEventListener('input', (e) => zoom(+e.target.value));

    // ---- graphics editor ----
    let objs = [], sel = -1, nid = 0;
    const mk = (type) => {
      const o = { id: ++nid, type, x: 120 + Math.random() * 160, y: 80 + Math.random() * 100, s: 100, fill: SW[nid % SW.length] };
      return o;
    };
    function shape(o) {
      const k = o.s / 100;
      const t = `transform="translate(${o.x} ${o.y}) scale(${k})"`;
      const cls = `class="im-obj ${objs[sel] === o ? 'sel' : ''}" data-id="${o.id}"`;
      if (o.type === 'rect') return `<g ${t} ${cls}><rect x="-45" y="-30" width="90" height="60" rx="6" fill="${o.fill}"/></g>`;
      if (o.type === 'circle') return `<g ${t} ${cls}><circle r="36" fill="${o.fill}"/></g>`;
      if (o.type === 'line') return `<g ${t} ${cls}><path d="M-50 20 L50 -20" stroke="${o.fill}" stroke-width="8" stroke-linecap="round"/><path d="M-50 20 L50 -20" stroke="transparent" stroke-width="22"/></g>`;
      if (o.type === 'text') return `<g ${t} ${cls}><text text-anchor="middle" dominant-baseline="middle" font-size="34" font-weight="800" fill="${o.fill}">ECO CLUB</text></g>`;
      if (o.type === 'bmp') return `<g ${t} ${cls}>${[[-2, -3], [-1, -3], [0, -3], [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2], [0, 3]].map(([x, y]) => `<rect x="${x * 12}" y="${y * 12}" width="12" height="12" fill="${o.fill}"/>`).join('')}</g>`;
      if (o.type === 'leaf') return `<g ${t} ${cls}><path d="M0 44 C-6 20 -44 6 -30 -22 C-20 -40 14 -44 26 -24 C40 0 10 18 0 44Z" fill="${o.fill}"/><path d="M0 40 C-2 10 -6 -10 -2 -30" stroke="#fff" stroke-width="3" fill="none"/></g>`;
      return '';
    }
    function drawBoard() {
      $('#board').innerHTML = `<line x1="200" y1="0" x2="200" y2="260" class="im-guide"/>` + objs.map(shape).join('');
      $('#layers').innerHTML = [...objs].reverse().map((o) => `<li class="${objs[sel] === o ? 'on' : ''}" data-id="${o.id}">${{ rect: '▭ Rectangle', circle: '◯ Circle', line: '╱ Line', text: 'T Text', bmp: '▦ Bitmap', leaf: '🍃 Vector leaf' }[o.type]}</li>`).join('');
      if (sel >= 0) $('#gSize').value = objs[sel].s;
    }
    const pick = (id) => { sel = objs.findIndex((o) => o.id === id); drawBoard(); };
    function add(type) { objs.push(mk(type)); sel = objs.length - 1; drawBoard(); $('#gMsg').innerHTML = type === 'text' ? '<b>Adding text.</b>' : '<b>Adding or drawing shapes and lines.</b>'; }
    root.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => add(b.dataset.add)));
    function colour(c) { if (sel < 0) return; objs[sel].fill = c; drawBoard(); $('#gMsg').innerHTML = '<b>Altering the colour</b> of shapes, lines and fill areas.'; }
    root.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => colour(b.dataset.c)));
    $('#gSize').addEventListener('input', (e) => { if (sel < 0) return; objs[sel].s = +e.target.value; drawBoard(); $('#gMsg').innerHTML = '<b>Resizing</b> shapes and lines. A vector graphic stays sharp at any size.'; });
    function align() { if (sel < 0) return; objs[sel].x = 200; drawBoard(); $('#gMsg').innerHTML = '<b>Aligning</b>: the object is now in the centre.'; }
    function layer(front) {
      if (sel < 0) return;
      const [o] = objs.splice(sel, 1);
      if (front) objs.push(o); else objs.unshift(o);
      sel = objs.indexOf(o); drawBoard();
      $('#gMsg').innerHTML = '<b>Layers</b>: you can place some graphics on top of others.';
    }
    $('#gAlign').addEventListener('click', align);
    $('#gFront').addEventListener('click', () => layer(true));
    $('#gBack').addEventListener('click', () => layer(false));
    async function vectorise() {
      let o = objs.find((x) => x.type === 'bmp');
      if (!o) { o = mk('bmp'); o.x = 300; o.y = 140; o.fill = '#2f9e44'; objs.push(o); sel = objs.length - 1; drawBoard(); await FD.wait(700); if (dead) return; }
      o.type = 'leaf'; sel = objs.indexOf(o); drawBoard();
      $('#gMsg').innerHTML = '<b>Vectorising</b>: the bitmap was traced and converted into a vector graphic made of points and lines.';
    }
    $('#gVec').addEventListener('click', vectorise);
    $('#layers').addEventListener('click', (e) => { const li = e.target.closest('[data-id]'); if (li) pick(+li.dataset.id); });
    // drag to move
    let drag = null;
    const pt = (e) => { const r = $('#board').getBoundingClientRect(); return [(e.clientX - r.left) * 400 / r.width, (e.clientY - r.top) * 260 / r.height]; };
    $('#board').addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.im-obj'); if (!g) { sel = -1; drawBoard(); return; }
      pick(+g.dataset.id);
      const [x, y] = pt(e); drag = { dx: objs[sel].x - x, dy: objs[sel].y - y };
      $('#board').setPointerCapture(e.pointerId);
    });
    $('#board').addEventListener('pointermove', (e) => {
      if (!drag || sel < 0) return;
      const [x, y] = pt(e); objs[sel].x = FD.clamp(x + drag.dx, 0, 400); objs[sel].y = FD.clamp(y + drag.dy, 0, 260); drawBoard();
      $('#gMsg').innerHTML = '<b>Moving</b> shapes and lines.';
    });
    $('#board').addEventListener('pointerup', () => { drag = null; });
    function resetGfx() { nid = 0; objs = [{ id: ++nid, type: 'rect', x: 140, y: 120, s: 120, fill: '#1c7ed6' }, { id: ++nid, type: 'circle', x: 180, y: 100, s: 100, fill: '#f08c00' }]; sel = 1; drawBoard(); $('#gMsg').innerHTML = 'Click an object to select it. Drag it to move it.'; }

    // ---- photo editor ----
    const P = { fx: 'none', red: true, crop: false };
    function photo() {
      const sh = +$('#pSh').value;
      const f = [sh > 0 ? 'url(#imSharp)' : '', P.fx === 'warp' ? 'url(#imWarp)' : '', `brightness(${$('#pBri').value}%)`, `contrast(${$('#pCon').value}%)`, sh < 0 ? `blur(${-sh * 0.8}px)` : '', P.fx === 'grey' ? 'grayscale(1)' : '', P.fx === 'sepia' ? 'sepia(.9)' : ''].filter(Boolean).join(' ');
      $('#phG').style.filter = f;
      root.querySelectorAll('.ph-eye').forEach((e) => e.setAttribute('fill', P.red ? '#e03131' : '#2b1d14'));
      const k = +$('#pRes').value / 100;
      $('#pResV').textContent = `${Math.round(4000 * k)} × ${Math.round(3000 * k)} px`;
      $('#pStage').style.setProperty('--k', k);
      $('#ph').setAttribute('viewBox', P.crop ? '100 70 200 150' : '0 0 400 300');
      root.querySelectorAll('[data-f]').forEach((b) => b.classList.toggle('on', b.dataset.f === P.fx));
    }
    const say = (h) => { $('#pMsg').innerHTML = h; };
    ['#pBri', '#pCon', '#pSh', '#pRes'].forEach((s) => $(s).addEventListener('input', () => {
      photo();
      say({ '#pBri': '<b>Adjusting brightness</b> and contrast.', '#pCon': 'Adjusting brightness and <b>contrast</b>.', '#pSh': '<b>Altering sharpness and blurring.</b>', '#pRes': '<b>Resizing the image</b>: fewer pixels make a smaller file.' }[s]);
    }));
    function filter(f) { P.fx = f; photo(); say(f === 'none' ? 'No filter.' : `<b>Applying filters and effects</b> such as ${f === 'warp' ? 'distortion' : f === 'grey' ? 'black and white' : 'sepia'}.`); }
    root.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => filter(b.dataset.f)));
    function redEye() { P.red = false; photo(); say('<b>Red-eye removal</b>: the red reflection from the camera flash has gone.'); }
    async function cropIt() {
      const g = ++gen;
      if (P.crop) return;
      $('#crop').hidden = false;
      say('The frame shows what will be kept. The dark <b>edges</b> will be removed…');
      await FD.wait(1300); if (dead || g !== gen) return;
      $('#crop').hidden = true; P.crop = true; photo();
      say('<b>Cropping</b>: the edges of the image have been removed.');
    }
    $('#pRed').addEventListener('click', redEye);
    $('#pCrop').addEventListener('click', cropIt);
    function set(id, v) { $('#' + id).value = v; photo(); }
    function resetPhoto() { gen++; Object.assign(P, { fx: 'none', red: true, crop: false }); set('pBri', 100); set('pCon', 100); set('pSh', 0); set('pRes', 100); $('#crop').hidden = true; photo(); say('Photo editors let users edit and enhance digital photographs. An example is GNU Image Manipulation Program (GIMP).'); }
    $('#pReset').addEventListener('click', resetPhoto);

    show('zoom'); zoom(1); resetGfx(); resetPhoto();
    return {
      show, zoom, add, colour, align, layer, vectorise, resetGfx, set, filter, redEye, cropIt, resetPhoto,
      say,
      destroy() { dead = true; },
    };
  },
  steps: [
    {
      title: 'Bitmap and vector images',
      text: `<p>Image editing applications let users create and change <strong>bitmap</strong> images, such as digital photographs, or <strong>vector graphics</strong>, such as drawings or logos.</p>
             <p>A bitmap is an arrangement of bits; a vector graphic is made up of points and lines.</p>`,
      tip: 'Try it: drag the zoom slider.',
      async on(a, ctx) { a.show('zoom'); for (const z of [1, 2, 4, 6]) { a.zoom(z); if (!(await ctx.sleep(900))) return; } },
    },
    {
      title: 'Graphics editors',
      text: `<p><b>Graphics editing</b> applications let users create or edit vector graphics. An example is Serif Affinity Designer. Features include:</p>
             <ul><li>adding text</li><li>adding or drawing shapes and lines</li><li>resizing, aligning or moving shapes and lines</li><li>altering the colour of shapes, lines and fill areas.</li></ul>`,
      tip: 'Try it: add text, change its colour, align it.',
      async on(a, ctx) { a.show('gfx'); a.resetGfx(); if (!(await ctx.sleep(700))) return; a.add('text'); if (!(await ctx.sleep(900))) return; a.colour('#7048e8'); if (!(await ctx.sleep(900))) return; a.align(); },
    },
    {
      title: 'Layers and vectorising',
      text: `<p><b>Layers</b> give the ability to place some graphics on top of others.</p>
             <p><b>Vectorising</b> converts or traces a bitmap graphic into a vector graphic.</p>`,
      tip: 'Try it: bring a shape to the front, then vectorise.',
      async on(a, ctx) { a.show('gfx'); a.layer(false); if (!(await ctx.sleep(1200))) return; await a.vectorise(); },
    },
    {
      title: 'Photo editors',
      text: `<p><b>Photo editors</b> let users edit and enhance digital photographs and images. An example is GIMP. Features include:</p>
             <ul><li>adjusting brightness and contrast</li><li>resizing the image</li><li>altering sharpness and blurring</li><li>applying filters and effects such as distortion.</li></ul>`,
      tip: 'Try it: move the sliders and try each filter.',
      async on(a, ctx) {
        a.show('photo'); a.resetPhoto();
        for (const [id, v] of [['pBri', 130], ['pCon', 140], ['pSh', -3], ['pSh', 0]]) { if (!(await ctx.sleep(800))) return; a.set(id, v); }
        if (!(await ctx.sleep(800))) return; a.filter('warp'); if (!(await ctx.sleep(1200))) return; a.filter('none');
      },
    },
    {
      title: 'Red-eye removal and cropping',
      text: `<p>Photo editors also offer <b>red-eye removal</b> and <strong>cropping</strong>: removing the edges of an image.</p>
             <p>There are many photo editing apps for smartphones; finished images can be stored to local storage or shared online (Figure 2.15).</p>`,
      tip: 'Try it: remove the red-eye, then crop.',
      async on(a, ctx) { a.show('photo'); if (!(await ctx.sleep(700))) return; a.redEye(); if (!(await ctx.sleep(1000))) return; await a.cropIt(); },
    },
  ],
});

FD.activities({
  section: 'image',
  items: [
    {
      id: 'image-dove',
      title: 'Editing images',
      task: '<p>Go to the website of the cosmetics company, Dove, and search for the key terms ‘evolution video’ to find the video <i>Evolution</i>, which is about the way in which the beauty industry uses image editing applications. Watch the video, then discuss the impact that image editing applications can have on society.</p>',
      fields: ['Image editing features you saw in the video'],
      lines: 6,
      hint: 'Write the main points of your discussion: positive and negative impacts on society.',
    },
  ],
});

FD.check({
  section: 'image',
  items: [
    { type: 'mcq', q: 'What is a <b>vector graphic</b>?', opts: ['A graphical image made up of points and lines', 'An image stored as an arrangement of bits', 'A photo taken on a smartphone', 'A sound file'], why: 'A bitmap is an arrangement of bits.' },
    { type: 'sort', q: 'Is each feature mainly found in a graphics editor or a photo editor?', bins: ['Graphics editor', 'Photo editor'], rows: [['Vectorising images', 0], ['Red-eye removal', 1], ['Layers', 0], ['Adjusting brightness and contrast', 1], ['Adding or drawing shapes and lines', 0], ['Cropping', 1]], why: 'Graphics editors work with vector graphics; photo editors enhance photographs.' },
    { type: 'mcq', q: 'What is <b>cropping</b>?', opts: ['Removing the edges of an image', 'Making an image brighter', 'Converting a bitmap to a vector graphic', 'Removing red-eye'], why: 'A photo editor feature.' },
  ],
});
