FD.add({
  id: 'control',
  title: 'Control applications',
  tab: 'Control',
  icon: 'control',
  color: '--c9',
  section: true,
  interactive: true,
  vocab: [
    ['Control application', 'Software used to make something happen in the physical environment.'],
    ['Actuator', 'A control device that makes something move, such as a motor (see page 37).'],
    ['Home automation', 'Devices in a home that can be monitored and controlled, for example using a smartphone app.'],
  ],
  mount(el) {
    const ROOMS = [['Kitchen', 19, 8, 8, 34, 40], ['Hallway', 17, 44, 8, 16, 40], ['Bathroom', 19, 62, 8, 30, 40], ['Bedroom', 17, 8, 50, 22, 42], ['Living room', 20, 32, 50, 28, 42], ['Study', 22, 62, 50, 30, 42]];
    el.innerHTML = `
      <div class="sim ct-s">
        <div class="ptabs" role="group" aria-label="Simulations">
          <button data-p="lift">🛗 Lift doors</button><button data-p="home">🏠 Home heating</button><button data-p="garage">🚗 Garage door</button>
        </div>
        <div class="ct-ipo" id="ipo">
          <div class="ct-b" data-z="in"><small>INPUT · sensor</small><b id="iIn">–</b></div><span class="ct-ar">→</span>
          <div class="ct-b" data-z="dec"><small>DECISION · software</small><b id="iDec">–</b></div><span class="ct-ar">→</span>
          <div class="ct-b" data-z="out"><small>OUTPUT · command</small><b id="iOut">–</b></div>
        </div>

        <div data-panel="lift" class="sim">
          <div class="ct-lift">
            <div class="ct-shaft" id="shaft">${[3, 2, 1, 0].map((f) => `<div class="ct-floor" data-f="${f}"><span>Floor ${f}</span><button class="mini-btn" data-call="${f}">Call</button></div>`).join('')}
              <div class="ct-car" id="car"><div class="ct-door l"></div><div class="ct-door r"></div><span>🧍</span></div></div>
            <div class="sim-box ct-sens"><h5 class="mw-h">Sensors</h5>
              <p>📏 Level with the floor: <b id="sLevel">yes</b></p><p>⏸️ Lift stopped: <b id="sStop">yes</b></p><p>⚙️ Door motor and arm: <b id="sMotor">off</b></p>
              <p class="note">Figure 2.17: the doors are opened and closed automatically when a sensor detects that the lift is level with the floor and has stopped.</p></div>
          </div>
        </div>

        <div data-panel="home" class="sim" hidden>
          <div class="ct-home">
            <div class="ct-plan" id="plan">${ROOMS.map(([n, t, x, y, w, h], i) => `<div class="ct-room" data-r="${i}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"><small>${n}</small><b class="ct-t">${t}°C</b><span class="ct-fl"></span></div>`).join('')}</div>
            <div class="ct-phone"><div class="ct-scr"><small>Heating app</small><b id="tgt">20°C</b><span>target</span>
              <div class="ct-pb"><button class="btn" id="tDown">−</button><button class="btn" id="tUp">+</button></div>
              <label class="tgl"><input type="checkbox" id="away"> I am away</label></div></div>
          </div>
          <div class="chk-btns"><button class="btn primary" id="bHeat">▶ Run the heating system</button></div>
        </div>

        <div data-panel="garage" class="sim" hidden>
          <svg viewBox="0 0 640 170" class="ct-road" role="img" aria-label="A car driving home to a garage">
            <rect x="0" y="120" width="640" height="34" class="ct-tarmac"/>
            <path d="M0 137 H640" class="ct-lane"/>
            <g transform="translate(540 40)"><rect x="0" y="20" width="90" height="80" class="ct-house"/><path d="M-8 22 L45 -12 L98 22Z" class="ct-roof"/>
              <rect x="12" y="44" width="66" height="56" class="ct-gd"/><rect x="12" y="44" width="66" height="56" class="ct-gdoor" id="gdoor"/></g>
            <circle cx="585" cy="137" r="0" class="ct-zone" id="zone"/>
            <g id="carG"><text x="0" y="132" class="ct-carE">🚗</text><text x="14" y="98" class="ct-ph">📱</text></g>
            <text x="320" y="24" text-anchor="middle" class="svg-lbl" id="dist">Distance to the garage: 100 m</text>
          </svg>
          <label class="rng">Drive home <input type="range" id="gPos" min="0" max="100" value="0"></label>
        </div>
        <p class="note" id="cMsg"></p>
      </div>`;
    const root = el.querySelector('.ct-s'), $ = (s) => root.querySelector(s);
    let dead = false, gen = 0;
    const show = FD.panels(root, (p) => { gen++; clearInterval(heat); heat = null; ({ lift: liftIpo, home: homeIpo, garage: () => garage(+$('#gPos').value) })[p](); });
    const say = (h) => { $('#cMsg').innerHTML = h; };
    function ipo(a, b, c, hot) {
      $('#iIn').innerHTML = a; $('#iDec').innerHTML = b; $('#iOut').innerHTML = c;
      root.querySelectorAll('.ct-b').forEach((x) => x.classList.toggle('hot', x.dataset.z === hot));
    }

    // ---- lift ----
    let floor = 0, moving = false;
    const FH = 25; // % per floor
    function carAt(f) { $('#car').style.bottom = (f * FH) + '%'; }
    const doors = (open) => $('#car').classList.toggle('open', open);
    function liftIpo() { ipo(`level: ${moving ? 'no' : 'yes'} · stopped: ${moving ? 'no' : 'yes'}`, 'IF level AND stopped', $('#car').classList.contains('open') ? 'open the doors' : 'keep the doors closed'); }
    async function call(f) {
      if (moving) return;
      const g = gen;
      if (f === floor) { doors(true); liftIpo(); return; }
      moving = true; doors(false);
      $('#sMotor').textContent = 'closing doors'; ipo('call button pressed', 'close the doors first', 'door motor: close', 'out');
      await FD.wait(700); if (dead || g !== gen) return;
      $('#sLevel').textContent = 'no'; $('#sStop').textContent = 'no'; $('#sMotor').textContent = 'off';
      ipo('level: <span class="bad-t">no</span> · stopped: <span class="bad-t">no</span>', 'IF level AND stopped → <span class="bad-t">false</span>', 'keep the doors closed', 'dec');
      const from = floor;
      await FD.tween(900 * Math.abs(f - from), (t) => { if (g === gen) carAt(from + (f - from) * t); });
      if (dead || g !== gen) return;
      floor = f; moving = false;
      $('#sLevel').textContent = 'yes'; $('#sStop').textContent = 'yes';
      ipo('level: <span class="good-t">yes</span> · stopped: <span class="good-t">yes</span>', 'IF level AND stopped → <span class="good-t">true</span>', 'door motor: <b>open</b>', 'in');
      await FD.wait(500); if (dead || g !== gen) return;
      $('#sMotor').textContent = 'opening doors'; doors(true);
      root.querySelectorAll('.ct-b').forEach((x) => x.classList.toggle('hot', x.dataset.z === 'out'));
      say(`The lift is level with floor ${f} and has stopped, so the control software opens the doors.`);
      await FD.wait(700); if (g === gen) $('#sMotor').textContent = 'off';
    }
    root.querySelectorAll('[data-call]').forEach((b) => b.addEventListener('click', () => call(+b.dataset.call)));
    function resetLift() { gen++; floor = 0; moving = false; carAt(0); doors(true); $('#sLevel').textContent = 'yes'; $('#sStop').textContent = 'yes'; $('#sMotor').textContent = 'off'; liftIpo(); }

    // ---- home heating ----
    let temps = ROOMS.map((r) => r[1]), target = 20, heat = null;
    function drawHome() {
      const away = $('#away').checked, tg = away ? 15 : target;
      $('#tgt').textContent = tg + '°C';
      root.querySelectorAll('.ct-room').forEach((r) => {
        const i = +r.dataset.r, on = temps[i] < tg - .2;
        r.querySelector('.ct-t').textContent = temps[i].toFixed(1) + '°C';
        r.classList.toggle('on', on);
        r.style.setProperty('--h', FD.clamp((temps[i] - 14) / 10, 0, 1));
      });
      return tg;
    }
    function homeIpo() {
      const tg = drawHome(), cold = temps.filter((t) => t < tg - .2).length;
      ipo(`room temperatures · target ${tg}°C`, 'IF room &lt; target', cold ? `heating ON in ${cold} room${cold > 1 ? 's' : ''}` : 'heating off', heat ? 'out' : '');
    }
    function setTarget(t) { target = FD.clamp(t, 15, 25); homeIpo(); say('The smartphone app sends the new target to the heating system over the internet.'); }
    $('#tUp').addEventListener('click', () => setTarget(target + 1));
    $('#tDown').addEventListener('click', () => setTarget(target - 1));
    $('#away').addEventListener('change', () => { homeIpo(); say($('#away').checked ? 'Away mode: the app lowers every room to 15°C to save energy.' : 'Back home: the normal target is used again.'); });
    function runHeat() {
      if (heat) return;
      heat = setInterval(() => {
        if (dead) return clearInterval(heat);
        const tg = $('#away').checked ? 15 : target;
        temps = temps.map((t) => (t < tg - .2 ? t + .25 : t > tg + .2 ? t - .12 : t));
        homeIpo();
      }, 300 / FD.speed);
      say('Each room sensor sends its temperature; the software decides, and turns the heating on or off.');
    }
    $('#bHeat').addEventListener('click', runHeat);
    function resetHome() { clearInterval(heat); heat = null; temps = ROOMS.map((r) => r[1]); target = 20; $('#away').checked = false; homeIpo(); }

    // ---- garage door ----
    let opened = false;
    function garage(p) {
      $('#gPos').value = p;
      const d = Math.round(100 - p);
      $('#carG').setAttribute('transform', `translate(${10 + p * 4.6} 0)`);
      $('#dist').textContent = `Distance to the garage: ${d} m`;
      $('#zone').setAttribute('r', 46);
      const inside = d <= 10;
      if (inside && !opened) { opened = true; say('📱 The smartphone calculates it is within 10 metres, so it <b>sends an instruction via the internet</b> to the garage door motors.'); }
      if (!inside && opened && d > 30) opened = false;
      $('#gdoor').classList.toggle('open', opened);
      ipo(`📍 location: ${d} m away`, 'IF distance ≤ 10 m', opened ? 'garage door motors: <b>open</b>' : 'keep the door shut', inside ? 'out' : 'in');
    }
    $('#gPos').addEventListener('input', (e) => garage(+e.target.value));
    async function drive() {
      const g = ++gen, from = +$('#gPos').value;
      await FD.tween(2600, (t) => { if (g === gen) garage(from + (95 - from) * t); });
    }

    show('lift'); resetLift(); resetHome(); opened = false; garage(0); say('');
    return {
      show, call, resetLift, setTarget, runHeat, resetHome, garage, drive, say,
      destroy() { dead = true; clearInterval(heat); },
    };
  },
  steps: [
    {
      title: 'Making things happen',
      text: `<p><b>Control applications</b> are used to make something happen in the <b>physical environment</b>. This type of software is often used to automate the movement of control devices or <b>actuators</b>, such as motors.</p>
             <p>Astronauts on the International Space Station use control software to move a robotic arm into position to capture a supply capsule (Figure 2.16).</p>`,
      async on(a) { a.show('lift'); a.resetLift(); },
    },
    {
      title: 'Input, decision, output',
      text: `<p>Control software takes <b>input</b> from one or more sensors, makes a <b>decision</b> based on the input value, and then <b>outputs</b> something, such as a command, as a result.</p>
             <p>Lift doors are opened automatically when a sensor detects that the lift is level with the floor and has stopped (Figure 2.17).</p>`,
      tip: 'Try it: call the lift to another floor.',
      async on(a, ctx) { a.show('lift'); await a.call(2); if (!(await ctx.sleep(900))) return; await a.call(0); },
    },
    {
      title: 'Home automation',
      text: `<p>Control software is often used in engineering, vehicles and building control systems. A developing group is <b>home automation</b>: devices can be monitored and controlled using a <b>smartphone app</b> (Figure 2.18).</p>`,
      tip: 'Try it: run the heating, then change the target on the phone.',
      async on(a, ctx) { a.show('home'); a.resetHome(); a.runHeat(); if (!(await ctx.sleep(2500))) return; a.setTarget(22); },
    },
    {
      title: 'Did you know?',
      text: `<p>Some smartphone apps control internet-connected devices. If the smartphone calculates that its location is <b>within 10 metres</b> of a garage door, it sends an instruction <b>via the internet</b> to the garage door motors to turn on and open the door.</p>`,
      tip: 'Try it: drag the slider to drive home.',
      async on(a) { a.show('garage'); a.garage(0); await a.drive(); },
    },
    {
      title: 'Who makes control applications?',
      text: `<p>Control applications are often created by <b>programmers</b> rather than general users, and they are <b>not as easy to modify</b> as other application software.</p>`,
      async on(a) { a.say('The rule <b>IF distance ≤ 10 m</b> was written by a programmer. A general user cannot easily change it.'); },
    },
  ],
});

FD.activities({
  section: 'control',
  items: [
    {
      id: 'control-remote-1',
      title: 'Remote control · 1',
      task: '<p>Discuss the objects in your home that you think could be connected to the internet in order to be switched on or controlled remotely.</p>',
      lines: 4,
      hint: 'For example: lights, heating, … List as many as you can.',
    },
    {
      id: 'control-remote-2',
      title: 'Remote control · 2',
      task: '<p>Now discuss potential ways in which you could automatically control these connected things in your home based on changes in the environment that are detected by remote sensors or sensors in a smartphone. See Figure 2.19 and the Did you know? feature for some examples.</p>',
      lines: 5,
      hint: 'Use input → decision → output: which sensor, what rule, what happens?',
    },
    {
      id: 'control-iot',
      title: 'The internet of things',
      task: '<p>Do some research to find out what is meant by the term, ‘the internet of things’.</p>',
      lines: 4,
    },
  ],
});

FD.check({
  section: 'control',
  items: [
    { type: 'mcq', q: 'What are control applications used for?', opts: ['To make something happen in the physical environment', 'To write letters and reports', 'To search a database', 'To design web pages'], why: 'Often to automate the movement of actuators such as motors.' },
    { type: 'sort', q: 'For the lift doors (Figure 2.17), put each part in the right place.', bins: ['Input', 'Decision', 'Output'], rows: [['Sensor: the lift is level with the floor', 0], ['Are the lift level and stopped?', 1], ['Command to the door motor: open', 2]], why: 'Input from sensors → decision → output.' },
    { type: 'mcq', q: 'Which statement about control applications is true?', opts: ['They are often created by programmers and are not as easy to modify', 'They are easy for any user to change', 'They never use sensors', 'They only run on smartphones'], why: 'They are usually written by programmers.' },
    { type: 'tf', q: 'Home automation devices can be monitored and controlled using a smartphone app.', a: true, why: 'Figure 2.18: heating and cooling systems.' },
  ],
});
