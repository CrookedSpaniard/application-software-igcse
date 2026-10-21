FD.add({
  id: 'terms',
  title: 'Key terms',
  tab: 'Key terms',
  icon: 'terms',
  color: '--accent',
  page: true,
  mount(el) {
    const T = [
      ['apps', 'Application software (apps)', 'Software that lets users produce a digital product, such as a presentation or an image, or carry out specific tasks not related to the operating system.'],
      ['apps', 'App store', 'Where users download apps. Some stores check the quality and that the app has no code that will harm a device or data.'],
      ['office', 'Office productivity software', 'Any application that can carry out work-related tasks.'],
      ['office', 'Application suite', 'A collection of application software that share the same look and user interface; they can share data and some functionality.'],
      ['office', 'Hyperlink', 'A link that can be clicked in order to go to another location (often a web page on the internet).'],
      ['office', 'Font', 'The size and style of text.'],
      ['office', 'Desktop publishing (DTP)', 'Software like word processing, but designed for complicated page layouts.'],
      ['spreadsheet', 'Spreadsheet', 'Software used to do calculations with formulae and functions; it can model financial scenarios and answer ‘what if?’ questions.'],
      ['database', 'Database management system (DBMS)', 'Software used to enter, edit and search data: data entry forms, query editors and report builders.'],
      ['web', 'Hypertext Markup Language (HTML)', 'A computing language read by web browser software.'],
      ['web', 'Intranet', 'A computer network used for exchanging or seeing information within a company.'],
      ['web', 'Web server', 'A computer that stores web pages and sends them to other devices that request them (often using web browser software).'],
      ['web', 'WYSIWYG', '‘What You See Is What You Get’: the published page looks very similar to the page the user edits.'],
      ['image', 'Bitmap', 'A computer image that is stored or printed as an arrangement of bits.'],
      ['image', 'Vector graphic', 'A graphical image made up of points and lines.'],
      ['image', 'Cropping', 'Using a photo editor to remove the edges of an image.'],
      ['sound', 'Mute', 'Silence an audio track.'],
      ['sound', 'Solo', 'Only play one particular audio track.'],
      ['sound', 'Tempo', 'The speed at which a track is played.'],
      ['sound', 'Reverberation', 'Prolonging a sound.'],
      ['sound', 'Normalisation', 'Increasing the average volume of a piece of audio to a defined maximum level.'],
      ['present', 'Slide', 'A single page of a presentation.'],
      ['present', 'Pathway', 'The sequence of or route through a series of slides.'],
      ['control', 'Control application', 'Software that takes input from sensors, makes a decision and outputs a command to make something happen in the physical environment.'],
      ['project', 'Timeline', 'A linear graphical representation of events and the time and order in which they occur.'],
      ['project', 'Critical path', 'The shortest time a project will take to complete (if no problems or failures are experienced).'],
      ['project', 'Milestone', 'A time or date by which a task must be completed.'],
      ['comms', 'File transfer protocol (FTP)', 'A method of exchanging data and files across a network.'],
      ['comms', 'Filter', 'A computer program that only allows certain types of information to pass through it.'],
      ['comms', 'SMS / MMS', 'Messages sent on the mobile phone network without the internet: SMS up to 160 text characters; MMS more characters plus video, images and audio.'],
      ['comms', 'Instant messaging', 'Like MMS, but needs an internet connection; can show typing and include location data.'],
      ['licence', 'Software licence', 'A legal arrangement that gives a user the right to install and use software.'],
      ['licence', 'Free software', 'Software that can be modified or distributed by a user. ‘Free’ means free from usage restrictions.'],
      ['licence', 'Open-source software', 'Software for which the source code is made available to users.'],
      ['licence', 'Source code', 'A collection of instructions that forms a piece of software.'],
      ['licence', 'Proprietary software', 'Software that is marketed and distributed by its owner under a brand name.'],
      ['licence', 'Freeware', 'Proprietary software provided free of charge to users.'],
      ['licence', 'Software piracy', 'Using software without a required licence. Software distributed without the right to do so is pirate software.'],
      ['updates', 'Update', '(noun) a change or addition to a computer file so that it has the most recent information; (verb) to make such a change.'],
      ['updates', 'Bugs', 'Errors in the program’s source code.'],
      ['updates', 'Vulnerability', 'Weakness or exposure to harm.'],
      ['updates', 'Compatibility', 'Ability of one device, system or application to work with other devices, systems and applications.'],
      ['updates', 'Usability', 'The ease with which a device or application can be used.'],
    ];
    const colorOf = (id) => (FD.section(id) || { color: '--accent' }).color;
    el.innerHTML = `
      <h2>Key terms</h2>
      <div class="terms-tools"><input type="search" id="tq" placeholder="Search a term…" aria-label="Search terms">
        <span class="seg" id="tp"><button data-v="all">All</button><button data-v="A">Part A</button><button data-v="B">Part B</button></span>
        <span class="small muted" id="tn"></span></div>
      <div class="terms" id="terms">${T.map(([f, t, d]) => `
        <article class="term" data-part="${FD.section(f).part}" style="--c:var(${colorOf(f)})"><h3>${t}</h3><p>${d}</p><button class="link-btn" data-go="${f}">${FD.icon[f]} See it</button></article>`).join('')}</div>`;
    const cards = [...el.querySelectorAll('.term')];
    const q = el.querySelector('#tq'), n = el.querySelector('#tn');
    let part = 'all';
    const filter = () => {
      const s = q.value.trim().toLowerCase();
      let k = 0;
      cards.forEach((c) => { const show = (!s || c.textContent.toLowerCase().includes(s)) && (part === 'all' || c.dataset.part === part); c.hidden = !show; k += show; });
      n.textContent = `${k} of ${cards.length} terms`;
      FD.segSet(el.querySelector('#tp'), part);
    };
    q.addEventListener('input', filter);
    el.querySelector('#tp').addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b) { part = b.dataset.v; filter(); } });
    filter();
    el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => FD.goto(b.dataset.go)));
  },
});
