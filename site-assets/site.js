'use strict';
// No networking, storage, HTML injection, trackers, or third-party scripts.
const walk = document.querySelector('[data-walk-calculator]');
if (walk) {
  const update = () => {
    const duration = walk.querySelector('#walk-duration').value;
    const count = Number(walk.querySelector('#walk-count').value);
    const each = duration === '60' ? 35 : 22;
    walk.querySelector('[data-total]').textContent = `$${(each * count).toFixed(0)} / week`;
    walk.querySelector('[data-estimate]').textContent = `${count} × ${duration}-minute walks at $${each} per walk. Planning estimate only; no package discount or booking implied.`;
  };
  walk.addEventListener('change', update);
  update();
}
const filters = document.querySelector('[data-filters]');
if (filters) {
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    document.querySelector('[data-filter-count]').textContent = `${visible} planning ${visible === 1 ? 'category' : 'categories'} shown. These are not venue listings.`;
  });
}
document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
const workflow = document.querySelector('[data-workflow]');
if (workflow) {
  const notes = {
    leads: 'Start with a lead intake checklist. Keep outreach drafts for human review; do not auto-send messages.',
    reports: 'Use approved sample evidence. Keep a human review before publishing or sharing a report.',
    scheduling: 'Start with availability suggestions. Confirm the appointment before making a calendar commitment.',
    bookkeeping: 'Suggest transaction categories. Reconcile against the original records and review before filing.'
  };
  const update = () => { workflow.querySelector('[data-workflow-output]').textContent = notes[workflow.querySelector('select').value]; };
  workflow.addEventListener('change', update); update();
}

// Photo wall: thumbnails load in batches; the viewer opens full-size copies. No autoplay or network calls.
const grid = document.querySelector('[data-gallery]');
if (grid) {
  const items = [...grid.querySelectorAll('.grid-item')];
  const batch = Number(grid.dataset.batch) || 36;
  const tools = document.querySelector('[data-gallery-tools]');
  const more = document.querySelector('[data-gallery-more]');
  const status = more.querySelector('[data-gallery-status]');
  const nextBatch = more.querySelector('[data-gallery-next]');
  let filter = 'all';
  let limit = batch;
  const matching = () => items.filter(item => filter === 'all' || item.dataset.kind === filter);
  const render = () => {
    const shown = matching();
    items.forEach(item => { item.hidden = true; });
    shown.slice(0, limit).forEach(item => { item.hidden = false; });
    const count = Math.min(limit, shown.length);
    status.textContent = `Showing ${count} of ${shown.length}`;
    nextBatch.textContent = `Show ${Math.min(batch, shown.length - count)} more`;
    more.querySelectorAll('button').forEach(button => { button.hidden = count >= shown.length; });
  };
  tools.addEventListener('click', event => {
    const button = event.target.closest('button[data-gallery-filter]');
    if (!button) return;
    tools.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filter = button.dataset.galleryFilter;
    limit = batch;
    render();
  });
  nextBatch.addEventListener('click', () => {
    const first = matching()[limit];
    limit += batch;
    render();
    if (first) first.querySelector('a').focus();
  });
  more.querySelector('[data-gallery-all]').addEventListener('click', () => { limit = items.length; render(); });

  const box = document.querySelector('[data-lightbox]');
  const stage = box.querySelector('[data-lightbox-stage]');
  const caption = box.querySelector('[data-lightbox-caption]');
  const counter = box.querySelector('[data-lightbox-count]');
  const original = box.querySelector('[data-lightbox-open]');
  let sequence = [];
  let index = 0;
  let opener = null;
  const show = target => {
    index = (target + sequence.length) % sequence.length;
    const link = sequence[index].querySelector('a');
    const thumb = link.querySelector('img');
    let media;
    if (link.dataset.type === 'video') {
      media = document.createElement('video');
      media.controls = true;
      media.playsInline = true;
      media.preload = 'metadata';
      media.poster = thumb.getAttribute('src');
      media.src = link.getAttribute('href');
      media.setAttribute('aria-label', thumb.alt);
    } else {
      media = document.createElement('img');
      media.src = link.getAttribute('href');
      media.alt = thumb.alt;
    }
    stage.replaceChildren(media);
    caption.textContent = link.dataset.caption;
    counter.textContent = `${index + 1} of ${sequence.length}`;
    original.href = link.getAttribute('href');
  };
  const open = item => {
    if (!matching().includes(item)) {
      filter = 'all';
      tools.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.galleryFilter === 'all')));
      render();
    }
    sequence = matching();
    opener = document.activeElement;
    show(sequence.indexOf(item));
    box.showModal();
  };
  grid.addEventListener('click', event => {
    const link = event.target.closest('a.grid-thumb');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    open(link.closest('.grid-item'));
  });
  // Photos placed elsewhere on the page open the same viewer.
  document.querySelectorAll('a[data-gallery-src]').forEach(link => link.addEventListener('click', event => {
    const item = items.find(entry => entry.querySelector('a').getAttribute('href') === link.dataset.gallerySrc);
    if (!item || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    open(item);
  }));
  box.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  box.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  box.querySelector('[data-lightbox-close]').addEventListener('click', () => box.close());
  box.addEventListener('click', event => { if (event.target === box) box.close(); });
  box.addEventListener('keydown', event => {
    if (event.target.closest('video')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
  });
  let startX = null;
  stage.addEventListener('pointerdown', event => { startX = event.target.closest('video') ? null : event.clientX; });
  stage.addEventListener('pointerup', event => {
    if (startX === null) return;
    const distance = event.clientX - startX;
    startX = null;
    if (Math.abs(distance) > 50) show(index + (distance < 0 ? 1 : -1));
  });
  box.addEventListener('close', () => {
    stage.replaceChildren();
    if (opener) opener.focus();
  });
  tools.hidden = false;
  more.hidden = false;
  render();
}

// Birdy's Zoomies: an original NES-style runner on a canvas. No network or storage; the best score lasts for the visit.
const arcade = document.querySelector('[data-arcade]');
if (arcade) {
  const canvas = arcade.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const status = arcade.querySelector('[data-arcade-status]');
  const soundButton = arcade.querySelector('[data-arcade-sound]');
  const W = 192, H = 168, GROUND = 146, BIRDY_X = 30;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ctx.imageSmoothingEnabled = false;

  // 3x5 pixel font: each digit is one row of three bits.
  const FONT = {A:'25755',B:'65656',C:'74447',D:'65556',E:'74647',F:'74644',G:'74557',H:'55755',I:'72227',J:'11157',
    K:'55655',L:'44447',M:'57755',N:'65555',O:'75557',P:'75744',Q:'75573',R:'75765',S:'74717',T:'72222',U:'55557',
    V:'55552',W:'55775',X:'55255',Y:'55222',Z:'71247',0:'75557',1:'26227',2:'71747',3:'71317',4:'55711',5:'74717',
    6:'74757',7:'71111',8:'75757',9:'75717',' ':'00000','!':'22202',':':'02020','-':'00700','.':'00002',
    x:'00525','?':'71202',"'":'22000','/':'11244','*':'05250','>':'42124','+':'02720'};
  const text = (value, x, y, color = '#fff', scale = 1, align = 'left', shadow = '#000') => {
    const chars = String(value).toUpperCase().split('');
    const width = chars.length * 4 * scale - scale;
    let left = align === 'center' ? Math.round(x - width / 2) : align === 'right' ? x - width : x;
    for (const char of chars) {
      const rows = FONT[char] || FONT[char.toLowerCase()] || FONT[' '];
      for (const [fill, offset] of [[shadow, scale], [color, 0]]) {
        if (!fill) continue;
        ctx.fillStyle = fill;
        for (let r = 0; r < 5; r += 1) {
          const bits = Number(rows[r]);
          for (let c = 0; c < 3; c += 1) {
            if (bits & (4 >> c)) ctx.fillRect(left + c * scale + offset, y + r * scale + offset, scale, scale);
          }
        }
      }
      left += 4 * scale;
    }
  };

  // Pixel sprites are pre-rendered once from character maps.
  const sprite = (rows, palette) => {
    const image = document.createElement('canvas');
    image.width = Math.max(...rows.map(row => row.length));
    image.height = rows.length;
    const draw = image.getContext('2d');
    rows.forEach((row, y) => [...row].forEach((key, x) => {
      if (palette[key]) { draw.fillStyle = palette[key]; draw.fillRect(x, y, 1, 1); }
    }));
    return image;
  };
  const DOG = {W: '#fbf7f2', b: '#9a5a34', d: '#5b2f1a', k: '#141414', p: '#ff3d8b', t: '#ff86b0'};
  const head = ['..............dd..', '.............dWWd.', '............WWWWWW', '............WkWWWW',
    '..b.........WWWWWk', '..b.........WWWtt.', '...bWWbWWWWpppp...', '...WWWWWbWWWWWW...', '...WbWWWWWWbWWW...', '...WWWbWWWWWWbW...'];
  const birdy = {
    run: [
      sprite(head.concat(['...WW.WW..WW.WW...', '...W...W..W...W...', '..bb..bb.bb..bb...']), DOG),
      sprite(head.concat(['....WWW....WWW....', '....W.W....W.W....', '...bb.bb..bb.bb...']), DOG)],
    jump: sprite(head.concat(['..WW.........WW...', '.WW...........WW..', 'bb.............bb.']), DOG),
    duck: sprite(['................dd.', '...............dWWd', '..b...........WWWWW', '...bWWbWWWWpppWkWWk',
      '...WWWWWbWWWWWWWWtt', '...WbWWWWWWbWWWWW..', '..bbWW.bb..bbWW.bb.'], DOG)
  };
  const art = {
    ball: sprite(['.yyyy.', 'yywyyy', 'ywyyyY', 'yyywyY', 'yyyyYY', '.YYYY.'], {y: '#d7f53c', Y: '#9fbf1a', w: '#ffffff'}),
    bone: sprite(['ww......ww', 'wwwwwwwwww', '.wwwwwwww.', 'wwwwwwwwww', 'oo......oo'], {w: '#fff6e0', o: '#d9c49a'}),
    gold: sprite(['ww......ww', 'wwwwwwwwww', '.wwwwwwww.', 'wwwwwwwwww', 'oo......oo'], {w: '#ffe04a', o: '#d89a12'}),
    pizza: sprite(['ccccccccc', '.yyyyyyy.', '.yryyyry.', '..yyyyy..', '..yyryy..', '...yyy...', '...yry...', '....y....'],
      {c: '#c9771f', y: '#ffd34d', r: '#e0362f'}),
    heart: sprite(['.pp.pp.', 'ppppppp', 'ppwpppp', '.ppppp.', '..ppp..', '...p...'], {p: '#ff3d8b', w: '#ffc2da'}),
    hydrant: sprite(['..rrrr..', '.rrrrrr.', '..RRRR..', '..rrrr..', 'srrrrrrs', 'srrrrrrs', '..rrrr..', '..rRrr..',
      '..rrrr..', '..rrrr..', '.RRRRRR.', '.RRRRRR.'], {r: '#ef3b36', R: '#a81a1a', s: '#d0d0d8'}),
    squirrel: [
      sprite(['......GGG.', '.....GgggG', '..gg.Gggg.', '.gkgg.ggG.', 'ggggggggG.', '.gwwgggg..', '.g..g.g...'],
        {g: '#a07a5a', G: '#6e4f37', w: '#f1e3cf', k: '#141414'}),
      sprite(['.....GGG..', '....GgggG.', '..gg.Gggg.', '.gkgg.ggG.', 'ggggggggG.', '.gwwgggg..', '..g.g..g..'],
        {g: '#a07a5a', G: '#6e4f37', w: '#f1e3cf', k: '#141414'})],
    bee: [
      sprite(['..ww.ww.', '..ww.ww.', '.ykyky..', 'yykykyk.', '.ykyky..'], {y: '#ffd23c', k: '#1b1b1b', w: '#cfefff'}),
      sprite(['........', '.ww.ww..', '.ykyky..', 'yykykyk.', '.ykyky..'], {y: '#ffd23c', k: '#1b1b1b', w: '#cfefff'})]
  };
  const STAGES = [
    {name: 'STAGE 1  DOG PARK', at: 0, sky: ['#3fb6ff', '#6fcbff', '#9bdcff', '#c8ecff'], hills: '#5fc96b', trees: '#2f9a4a',
      ground: '#7a4a2a', top: '#3ccf5a', flowers: ['#ffffff', '#ffd23c']},
    {name: 'STAGE 2  BLUEBONNET TRAIL', at: 1200, sky: ['#ff7a59', '#ff9a5c', '#ffbf69', '#ffe08a'], hills: '#8a6bd6', trees: '#5a3f9e',
      ground: '#6b3f2a', top: '#4caf50', flowers: ['#4f5fe8', '#7f8cff', '#ffffff']},
    {name: 'STAGE 3  LAKE DOCK AT NIGHT', at: 3000, sky: ['#0b0a2a', '#14124a', '#211a66', '#2e2380'], hills: '#1e1a4f', trees: '#16143a',
      ground: '#7a5532', top: '#a9774a', flowers: [], night: true},
    {name: 'BONUS  ZOOMIE ZONE', at: 5200, sky: ['#7a4cff', '#a070ff', '#ff8cc6', '#ffc2de'], hills: '#ffd23c', trees: '#ff8a3d',
      ground: '#5b2f1a', top: '#36d1c4', flowers: ['#ffffff', '#ffd23c', '#4f5fe8']}
  ];
  const stars = Array.from({length: 40}, (_, i) => ({x: (i * 97) % W, y: (i * 53) % 96, twinkle: i % 7}));

  let state = 'title', best = 0, frame = 0, last = 0, acc = 0, shake = 0;
  let game;
  const reset = () => {
    game = {frames: 0, score: 0, distance: 0, speed: 1.5, lives: 3, combo: 0, balls: 0, items: [], parts: [], pops: [],
      nextSpawn: 90, stage: 0, banner: 150, zoom: 0, invuln: 0, newBest: false,
      dog: {y: GROUND, vy: 0, ground: true, jumps: 0, hold: 0, duck: false, ledge: null}};
  };
  reset();
  const input = {jump: false, duck: false};

  // Tiny chiptune engine: square lead, triangle bass, short effects.
  let audio = null, soundOn = true, nextNote = 0, step = 0;
  const LEAD = [72, 0, 76, 79, 81, 79, 76, 0, 74, 0, 77, 81, 79, 0, 76, 74, 72, 0, 76, 79, 84, 83, 81, 79, 77, 76, 74, 76, 72, 0, 0, 0];
  const BASS = [48, 0, 55, 0, 53, 0, 55, 0, 50, 0, 57, 0, 55, 0, 55, 0, 48, 0, 55, 0, 57, 0, 53, 0, 50, 0, 55, 0, 48, 0, 55, 0];
  const hz = note => 440 * 2 ** ((note - 69) / 12);
  const tone = (freq, length, type = 'square', volume = 0.05, slide = 0, delay = 0, at = 0) => {
    if (!audio || !soundOn) return;
    const start = at || audio.currentTime + delay;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, start + length);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + length + 0.02);
  };
  const sfx = {
    jump: () => tone(330, 0.12, 'square', 0.04, 700),
    double: () => tone(520, 0.14, 'square', 0.04, 1200),
    ball: () => { tone(988, 0.06); tone(1319, 0.1, 'square', 0.05, 0, 0.06); },
    bone: () => [659, 784, 988].forEach((f, i) => tone(f, 0.08, 'square', 0.05, 0, i * 0.05)),
    gold: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.09, 'square', 0.05, 0, i * 0.06)),
    power: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.08, 'square', 0.05, 0, i * 0.07)),
    stomp: () => tone(700, 0.1, 'square', 0.05, 180),
    smash: () => tone(160, 0.12, 'square', 0.05, 900),
    hurt: () => tone(220, 0.35, 'sawtooth', 0.06, 55),
    life: () => [523, 784, 1047].forEach((f, i) => tone(f, 0.1, 'triangle', 0.08, 0, i * 0.08)),
    over: () => [523, 440, 349, 262].forEach((f, i) => tone(f, 0.22, 'square', 0.05, 0, i * 0.18))
  };
  const music = () => {
    if (!audio || !soundOn || state !== 'play') return;
    const beat = game.zoom ? 0.1 : 0.15;
    if (nextNote < audio.currentTime) nextNote = audio.currentTime + 0.05;
    while (nextNote < audio.currentTime + 0.12) {
      const i = step % LEAD.length;
      const lift = game.stage % 2 ? 2 : 0;
      if (LEAD[i]) tone(hz(LEAD[i] + lift), beat * 0.9, 'square', 0.025, 0, 0, nextNote);
      if (BASS[i]) tone(hz(BASS[i] + lift), beat * 1.8, 'triangle', 0.07, 0, 0, nextNote);
      if (i % 4 === 0) tone(90, 0.04, 'square', 0.015, 40, 0, nextNote);
      nextNote += beat;
      step += 1;
    }
  };
  const wakeAudio = () => {
    if (!audio) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audio = new Context();
    }
    if (audio && audio.state === 'suspended') audio.resume();
  };
  const setSound = on => {
    soundOn = on;
    soundButton.setAttribute('aria-pressed', String(on));
    soundButton.textContent = on ? '♪ Sound on' : '♪ Sound off';
  };
  soundButton.addEventListener('click', () => { wakeAudio(); setSound(!soundOn); });

  const announce = message => { status.textContent = message; };

  // Shared scoreboard: talks only to the one origin named on the page, which the page's CSP also allows.
  const boardUrl = arcade.dataset.scoreboard;
  const boardPanel = document.querySelector('[data-scoreboard-panel]');
  const boardList = boardPanel.querySelector('[data-scoreboard-list]');
  const boardNote = boardPanel.querySelector('[data-scoreboard-note]');
  const entry = arcade.querySelector('[data-initials]');
  const initialsInput = entry.querySelector('input');
  const saveButton = entry.querySelector('[data-initials-save]');
  const entryNote = entry.querySelector('[data-initials-note]');
  let leaders = [], highlight = -1, pending = null;
  const showBoard = () => {
    boardList.replaceChildren(...leaders.map((row, i) => {
      const item = document.createElement('li');
      if (i === highlight) item.className = 'is-you';
      const name = document.createElement('span');
      const points = document.createElement('span');
      name.textContent = row.initials;
      points.textContent = row.score.toLocaleString('en-US');
      item.append(name, points);
      return item;
    }));
    boardNote.textContent = leaders.length ? '' : 'No scores yet. Be the first good girl on the board!';
  };
  const loadBoard = () => {
    if (!boardUrl) return;
    fetch(boardUrl, {mode: 'cors', credentials: 'omit'})
      .then(response => (response.ok ? response.json() : Promise.reject(response.status)))
      .then(data => { leaders = data.scores || []; showBoard(); },
        () => { boardNote.textContent = 'The scoreboard is napping. Scores will show up again soon.'; });
  };
  const qualifies = score => Boolean(boardUrl) && score > 0 && (leaders.length < 10 || score > leaders[leaders.length - 1].score);
  const offerInitials = () => {
    const score = Math.floor(game.score);
    if (!qualifies(score)) return;
    pending = {score, balls: game.balls, frames: game.frames};
    initialsInput.value = '';
    entryNote.textContent = '';
    entry.hidden = false;
    window.setTimeout(() => { initialsInput.focus({preventScroll: true}); entry.scrollIntoView({block: 'nearest', behavior: calm ? 'auto' : 'smooth'}); }, 60);
  };
  const save = () => {
    const initials = initialsInput.value;
    if (!pending || initials.length !== 3) { entryNote.textContent = 'Three letters, please.'; return; }
    saveButton.disabled = true;
    fetch(boardUrl, {method: 'POST', mode: 'cors', credentials: 'omit', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(Object.assign({initials}, pending))})
      .then(response => response.json().then(data => (response.ok ? data : Promise.reject(data.error || 'error'))))
      .then(data => {
        leaders = data.scores;
        highlight = data.rank <= 10 ? data.rank - 1 : -1;
        showBoard();
        pending = null;
        entry.hidden = true;
        announce(`Saved! ${initials} is number ${data.rank} on the scoreboard. Press Space or tap to play again.`);
        canvas.focus({preventScroll: true});
      }, error => {
        entryNote.textContent = typeof error === 'string' ? `Couldn’t save: ${error}.` : 'Couldn’t reach the scoreboard. Try again in a moment.';
      })
      .finally(() => { saveButton.disabled = false; });
  };
  initialsInput.addEventListener('input', () => { initialsInput.value = initialsInput.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); });
  initialsInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); save(); } });
  saveButton.addEventListener('click', save);
  boardPanel.hidden = !boardUrl;
  loadBoard();
  const start = () => {
    wakeAudio();
    reset();
    pending = null;
    entry.hidden = true;
    highlight = -1;
    loadBoard();
    state = 'play';
    step = 0;
    announce('Game on. Space or tap to jump, twice for a double jump. Down arrow to duck.');
    canvas.focus({preventScroll: true});
  };
  const togglePause = () => {
    if (state === 'play') { state = 'pause'; announce('Paused.'); }
    else if (state === 'pause') { state = 'play'; announce('Back to the zoomies.'); }
  };
  const jump = () => {
    if (state === 'title' || state === 'over') { if (frame > 20) start(); return; }
    if (state === 'pause') { togglePause(); return; }
    const dog = game.dog;
    if (dog.ground) {
      dog.vy = -4.6; dog.ground = false; dog.jumps = 1; dog.hold = 12; dog.ledge = null; sfx.jump();
      dust(BIRDY_X + 6, GROUND, 5);
    } else if (dog.jumps < 2) {
      dog.vy = -4.2; dog.jumps = 2; dog.hold = 8; sfx.double();
      for (let i = 0; i < 8; i += 1) particle(BIRDY_X + 9, dog.y - 4, (Math.random() - 0.5) * 2, Math.random() * 1.5, '#ffffff', 18);
    }
  };

  const particle = (x, y, vx, vy, color, life) => game.parts.push({x, y, vx, vy, color, life});
  const dust = (x, y, count) => { for (let i = 0; i < count; i += 1) particle(x, y - 1, -Math.random() * 1.2 - 0.3, -Math.random() * 0.8, '#d9b38c', 16); };
  const sparkle = (x, y, color) => { for (let i = 0; i < 10; i += 1) { const a = i / 10 * Math.PI * 2; particle(x, y, Math.cos(a) * 1.4, Math.sin(a) * 1.4, color, 20); } };
  const pop = (x, y, label, color = '#fff') => game.pops.push({x, y, label, color, life: 40});
  const multiplier = () => Math.min(5, 1 + Math.floor(game.combo / 5));
  const add = (points, x, y, color) => {
    const total = points * multiplier();
    game.score += total;
    pop(x, y, '+' + total, color);
  };

  // Spawn patterns: each returns how much horizontal room it used.
  const put = (kind, x, y, extra = {}) => game.items.push(Object.assign({kind, x, y, born: frame}, extra));
  const size = {ball: [6, 6], bone: [10, 5], gold: [10, 5], pizza: [9, 8], heart: [7, 6], hydrant: [8, 12], squirrel: [10, 7], bee: [8, 5], puddle: [24, 3], bench: [44, 4]};
  const patterns = [
    {weight: 3, from: 0, make: x => { put('hydrant', x, GROUND - 12); return 10; }},
    {weight: 2, from: 0, make: x => { put('puddle', x, GROUND - 3); return 26; }},
    {weight: 3, from: 0, make: x => jumpArc(x)},
    {weight: 2, from: 0, make: x => { for (let i = 0; i < 4; i += 1) put('ball', x + i * 11, GROUND - 9); return 44; }},
    {weight: 2, from: 200, make: x => { put('squirrel', x, GROUND - 7, {vx: -0.7}); return 12; }},
    {weight: 2, from: 400, make: x => { put('bee', x, GROUND - 15, {phase: frame}); return 10; }},
    {weight: 2, from: 300, make: x => { put('bench', x, GROUND - 26); put('bone', x + 8, GROUND - 34); put('bone', x + 26, GROUND - 34); return 46; }},
    {weight: 1, from: 700, make: x => { put('hydrant', x, GROUND - 12); put('bee', x + 70, GROUND - 15, {phase: frame}); return 80; }},
    {weight: 1, from: 900, make: x => { put('hydrant', x, GROUND - 12); put('hydrant', x + 22, GROUND - 12); put('ball', x + 16, GROUND - 46); return 32; }},
    {weight: 1, from: 1100, make: x => { put('squirrel', x, GROUND - 7, {vx: -0.7}); put('squirrel', x + 34, GROUND - 7, {vx: -0.7}); return 46; }},
    {weight: 1, from: 500, make: x => { put('bench', x, GROUND - 26); put('gold', x + 17, GROUND - 74); for (let i = 0; i < 3; i += 1) put('ball', x + 8 + i * 12, GROUND - 34); return 46; }}
  ];
  // Ball arcs trace Birdy's real jump (a quick tap) at the current speed, so one good jump collects them all.
  const jumpArc = x => {
    const speed = game.speed * (game.zoom ? 1.4 : 1);
    const path = [];
    let y = GROUND, vy = -4.6;
    for (let t = 0; t < 120 && (t === 0 || y < GROUND); t += 1) {
      if (t < 6) vy -= 0.22;
      vy = Math.min(6, vy + 0.3);
      y += vy;
      path.push(Math.min(y, GROUND));
    }
    const span = path.length;
    for (let i = 0; i < 5; i += 1) {
      const t = Math.round(span * (0.18 + i * 0.16));
      put('ball', x + Math.round(t * speed), Math.round(path[t] - 9));
    }
    return Math.round(span * speed) + 6;
  };
  const spawn = () => {
    const x = W + 8;
    if (!game.zoom && game.score > 250 && Math.random() < 0.05) { put('pizza', x, GROUND - 40); return 30; }
    if (game.lives < 3 && game.score > 600 && Math.random() < 0.025) { put('heart', x, GROUND - 52); return 30; }
    const open = patterns.filter(p => game.score >= p.from);
    let roll = Math.random() * open.reduce((sum, p) => sum + p.weight, 0);
    const choice = open.find(p => (roll -= p.weight) < 0) || open[0];
    return choice.make(x);
  };

  const hurt = () => {
    const dog = game.dog;
    if (game.invuln || game.zoom) return;
    game.lives -= 1;
    game.combo = 0;
    game.invuln = 100;
    shake = 12;
    sfx.hurt();
    sparkle(BIRDY_X + 9, dog.y - 6, '#ff3d8b');
    if (game.lives <= 0) {
      state = 'over';
      frame = 0;
      game.newBest = game.score > best;
      best = Math.max(best, Math.floor(game.score));
      sfx.over();
      offerInitials();
      announce(`Game over.${pending ? ' New high score! Type your initials below to join the scoreboard.' : ''} Score ${Math.floor(game.score)}. Best ${best}. Birdy caught ${game.balls} tennis balls. Press Space or tap to play again.`);
    } else {
      announce(`Ouch! ${game.lives} ${game.lives === 1 ? 'heart' : 'hearts'} left.`);
    }
  };

  const update = () => {
    frame += 1;
    if (shake) shake -= 1;
    if (state !== 'play') return;
    game.frames += 1;
    const dog = game.dog;
    const speed = game.speed * (game.zoom ? 1.4 : 1);
    game.speed = Math.min(3.2, game.speed + 0.0004);
    game.distance += speed;
    game.score += speed * 0.08;
    if (game.zoom) game.zoom -= 1;
    if (game.invuln) game.invuln -= 1;
    if (game.banner) game.banner -= 1;
    const stage = STAGES.reduce((found, s, i) => (game.score >= s.at ? i : found), 0);
    if (stage !== game.stage) { game.stage = stage; game.banner = 150; sfx.life(); announce(STAGES[stage].name.replace(/\s+/g, ' ')); }

    // Birdy: variable-height jump, double jump, duck and bench landings.
    dog.duck = input.duck && dog.ground;
    if (input.jump && dog.hold > 0 && dog.vy < 0) { dog.vy -= 0.22; dog.hold -= 1; } else dog.hold = 0;
    dog.vy = Math.min(6, dog.vy + (input.duck && !dog.ground ? 0.6 : 0.3));
    const before = dog.y;
    dog.y += dog.vy;
    if (dog.ledge && (dog.ledge.x + size.bench[0] < BIRDY_X + 4 || dog.ledge.x > BIRDY_X + 14)) { dog.ledge = null; dog.ground = false; }
    if (!dog.ledge) {
      for (const bench of game.items) {
        if (bench.kind !== 'bench' || dog.vy < 0) continue;
        if (BIRDY_X + 14 > bench.x && BIRDY_X + 4 < bench.x + size.bench[0] && before <= bench.y && dog.y >= bench.y) {
          dog.y = bench.y; dog.vy = 0; dog.ground = true; dog.jumps = 0; dog.ledge = bench;
        }
      }
    } else dog.y = dog.ledge.y;
    if (dog.y >= GROUND) {
      if (!dog.ground) dust(BIRDY_X + 8, GROUND, 4);
      dog.y = GROUND; dog.vy = 0; dog.ground = true; dog.jumps = 0; dog.ledge = null;
    }
    if (dog.ground && frame % 6 === 0) dust(BIRDY_X + 2, dog.y, 1);
    if (game.zoom) {
      const colors = ['#ff3d3d', '#ff9a3d', '#ffe03d', '#3dd16b', '#3db8ff', '#8f5bff'];
      colors.forEach((color, i) => particle(BIRDY_X + 2, dog.y - 11 + i * 2, -speed, 0, color, 14));
    }

    game.nextSpawn -= speed;
    if (game.nextSpawn <= 0) {
      const used = spawn();
      const gap = Math.max(speed * 26, 110 - game.distance / 400) + Math.random() * 70;
      game.nextSpawn = used + gap;
    }

    const box = dog.duck ? {x: BIRDY_X + 4, y: dog.y - 6, w: 14, h: 6} : {x: BIRDY_X + 4, y: dog.y - 12, w: 11, h: 11};
    for (const item of game.items) {
      item.x -= speed + (item.vx ? -item.vx : 0);
      if (item.kind === 'bee') item.y = GROUND - 15 + Math.round(Math.sin((frame - item.phase) / 9) * 2);
      if (item.dead || item.kind === 'bench') continue;
      const [w, h] = size[item.kind];
      const hit = box.x < item.x + w - 1 && box.x + box.w > item.x + 1 && box.y < item.y + h && box.y + box.h > item.y + 1;
      if (!hit) continue;
      const cx = item.x + w / 2;
      if (item.kind === 'ball') { item.dead = true; game.combo += 1; game.balls += 1; add(10, cx, item.y, '#d7f53c'); sfx.ball(); sparkle(cx, item.y, '#d7f53c'); }
      else if (item.kind === 'bone') { item.dead = true; game.combo += 1; add(25, cx, item.y, '#fff6e0'); sfx.bone(); sparkle(cx, item.y, '#ffffff'); }
      else if (item.kind === 'gold') { item.dead = true; game.combo += 3; add(150, cx, item.y, '#ffe04a'); sfx.gold(); sparkle(cx, item.y, '#ffe04a'); }
      else if (item.kind === 'heart') { item.dead = true; game.lives = Math.min(3, game.lives + 1); pop(cx, item.y, '1UP', '#ff3d8b'); sfx.life(); }
      else if (item.kind === 'pizza') {
        item.dead = true; game.zoom = 420; pop(cx, item.y, 'ZOOMIES!', '#ffd34d'); sfx.power(); shake = 6;
        announce('Pizza! Zoomies mode: Birdy is unstoppable for a few seconds.');
      } else if (item.kind === 'squirrel' && dog.vy > 0 && box.y + box.h - item.y < 7) {
        item.dead = true; dog.vy = -3.6; dog.jumps = 1; game.combo += 1; add(50, cx, item.y, '#ffffff'); sfx.stomp(); sparkle(cx, item.y, '#a07a5a');
      } else if (item.kind === 'puddle' && !dog.ground) continue;
      else if (game.zoom) { item.dead = true; add(25, cx, item.y, '#ff86b0'); sfx.smash(); sparkle(cx, item.y, '#ffffff'); }
      else hurt();
      if (state !== 'play') return;
    }
    game.items = game.items.filter(item => !item.dead && item.x > -60);
    for (const p of game.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 1; }
    game.parts = game.parts.filter(p => p.life > 0);
    for (const p of game.pops) { p.y -= 0.5; p.life -= 1; }
    game.pops = game.pops.filter(p => p.life > 0);
  };

  // Scenery: banded NES sky, parallax hills and trees, tiled ground.
  const scenery = (scroll, theme) => {
    theme.sky.forEach((color, i) => { ctx.fillStyle = color; ctx.fillRect(0, i * 26, W, 26); });
    ctx.fillStyle = theme.sky[3];
    ctx.fillRect(0, 104, W, GROUND - 104);
    if (theme.night) {
      for (const star of stars) {
        ctx.fillStyle = (frame / 8 + star.twinkle) % 7 < 1 ? '#7f86ff' : '#ffffff';
        ctx.fillRect(((star.x - scroll * 0.05) % W + W) % W, star.y, 1, 1);
      }
      ctx.fillStyle = '#f4f0d0';
      for (let y = -9; y <= 9; y += 1) { const half = Math.floor(Math.sqrt(81 - y * y)); ctx.fillRect(W - 50 - half, 32 + y, half * 2, 1); }
      ctx.fillStyle = '#d6cfa8';
      [[-54, -4, 3], [-46, 4, 2], [-51, 6, 2], [-45, -5, 1]].forEach(([x, y, s]) => ctx.fillRect(W + x, 32 + y, s, s));
    } else {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i += 1) {
        const x = Math.round((i * 90 - scroll * 0.15) % (W + 60) + W + 60) % (W + 60) - 30;
        const y = 34 + (i % 2) * 18;
        ctx.fillRect(x, y, 26, 6); ctx.fillRect(x + 5, y - 4, 14, 4); ctx.fillRect(x + 4, y + 6, 20, 2);
      }
      if (theme.at === 1200) {
        ctx.fillStyle = '#fff3b0';
        for (let y = -11; y <= 11; y += 1) { const half = Math.floor(Math.sqrt(121 - y * y)); ctx.fillRect(W - 60 - half, GROUND - 60 + y, half * 2, 1); }
      }
    }
    ctx.fillStyle = theme.hills;
    for (let x = 0; x < W; x += 2) {
      const world = x + scroll * 0.25;
      const h = 18 + Math.round(Math.sin(world / 37) * 8 + Math.sin(world / 13) * 3);
      ctx.fillRect(x, GROUND - 26 - h, 2, h + 30);
    }
    if (theme.night) {
      ctx.fillStyle = '#18306e';
      ctx.fillRect(0, GROUND - 24, W, 24);
      ctx.fillStyle = '#3a5bb0';
      for (let x = 0; x < W; x += 16) ctx.fillRect((x - scroll * 0.5 % 16 + 16) % (W + 16) - 8, GROUND - 19 + (x / 16 % 3) * 5, 8, 1);
    } else {
      ctx.fillStyle = theme.trees;
      for (let i = -1; i < 7; i += 1) {
        const x = Math.round(i * 44 - (scroll * 0.55) % 44);
        ctx.fillRect(x + 8, GROUND - 36, 14, 6); ctx.fillRect(x + 4, GROUND - 30, 22, 12); ctx.fillRect(x + 2, GROUND - 20, 26, 10);
        ctx.fillStyle = '#5b3a24'; ctx.fillRect(x + 13, GROUND - 10, 4, 10); ctx.fillStyle = theme.trees;
      }
    }
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = theme.top;
    ctx.fillRect(0, GROUND, W, 4);
    const tile = Math.floor(scroll) % 16;
    for (let x = -tile; x < W; x += 16) {
      ctx.fillStyle = theme.night ? '#5d3f24' : 'rgba(0,0,0,.18)';
      if (theme.night) ctx.fillRect(x, GROUND + 4, 1, 24);
      else { ctx.fillRect(x + 3, GROUND + 9, 3, 2); ctx.fillRect(x + 11, GROUND + 17, 2, 2); }
      ctx.fillStyle = theme.top;
      ctx.fillRect(x + 5, GROUND - 2, 1, 2); ctx.fillRect(x + 12, GROUND - 1, 1, 1);
      if (theme.flowers.length) { ctx.fillStyle = theme.flowers[(Math.floor((x + scroll) / 16) % theme.flowers.length + theme.flowers.length) % theme.flowers.length]; ctx.fillRect(x + 8, GROUND - 2, 2, 2); }
    }
  };

  const drawItem = item => {
    const x = Math.round(item.x), y = Math.round(item.y);
    if (item.kind === 'puddle') {
      ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x + 2, y, 20, 3); ctx.fillRect(x, y + 1, 24, 2);
      ctx.fillStyle = '#8a6a44'; ctx.fillRect(x + 6, y + 1, 5, 1);
    } else if (item.kind === 'bench') {
      ctx.fillStyle = '#b5652b'; ctx.fillRect(x, y, 44, 3); ctx.fillRect(x, y - 6, 44, 2);
      ctx.fillStyle = '#7a3f17'; ctx.fillRect(x + 3, y + 3, 3, GROUND - y - 3); ctx.fillRect(x + 38, y + 3, 3, GROUND - y - 3); ctx.fillRect(x, y + 3, 44, 1);
    } else {
      const bob = ['ball', 'bone', 'gold', 'pizza', 'heart'].includes(item.kind) ? Math.round(Math.sin((frame + item.x) / 10)) : 0;
      const image = Array.isArray(art[item.kind]) ? art[item.kind][Math.floor(frame / 8) % 2] : art[item.kind];
      ctx.drawImage(image, x, y + bob);
    }
  };

  const hud = () => {
    text(String(Math.floor(game.score)).padStart(6, '0'), 8, 8, '#ffffff');
    text('BEST ' + String(Math.max(best, Math.floor(game.score))).padStart(6, '0'), W - 8, 8, '#ffd23c', 1, 'right');
    for (let i = 0; i < 3; i += 1) {
      if (i < game.lives) ctx.drawImage(art.heart, 8 + i * 9, 18);
      else { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(9 + i * 9, 19, 5, 4); }
    }
    if (multiplier() > 1) text('x' + multiplier() + ' COMBO', 40, 19, ['#d7f53c', '#ffd23c', '#ff9a3d', '#ff3d8b'][multiplier() - 2]);
    ctx.drawImage(art.ball, W - 46, 17);
    text('x' + game.balls, W - 38, 18, '#d7f53c');
    if (game.zoom) {
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(W / 2 - 40, 30, 80, 5);
      ctx.fillStyle = ['#ff3d3d', '#ff9a3d', '#ffe03d', '#3dd16b', '#3db8ff', '#8f5bff'][Math.floor(frame / 4) % 6];
      ctx.fillRect(W / 2 - 39, 31, Math.round(78 * game.zoom / 420), 3);
    }
  };

  const drawDog = (x, y, pose) => {
    const image = pose === 'duck' ? birdy.duck : pose === 'jump' ? birdy.jump : birdy.run[Math.floor(frame / 6) % 2];
    ctx.drawImage(image, x, y - image.height);
  };

  const render = () => {
    ctx.save();
    if (shake && !calm) ctx.translate(Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 4));
    const theme = STAGES[state === 'title' ? 0 : game.stage];
    const scroll = state === 'title' ? frame * 1.2 : game.distance;
    scenery(scroll, theme);
    if (state === 'title') {
      ctx.fillStyle = 'rgba(43,22,56,.55)'; ctx.fillRect(8, 16, W - 16, 106);
      text("BIRDY'S", W / 2, 24, '#ffd23c', 3, 'center', '#2b1638');
      text('ZOOMIES!', W / 2, 46, '#ff3d8b', 4, 'center', '#2b1638');
      if (leaders.length && Math.floor(frame / 300) % 2) {
        text('HIGH SCORES', W / 2, 74, '#d7f53c', 1, 'center');
        leaders.slice(0, 3).forEach((row, i) => text(`${i + 1}. ${row.initials}  ${String(row.score).padStart(6, '0')}`, W / 2, 82 + i * 7, ['#ffd23c', '#ffffff', '#ff9a3d'][i], 1, 'center'));
      } else {
        text('JUMP TWICE  DUCK BEES  STOMP SQUIRRELS', W / 2, 78, '#ffffff', 1, 'center');
        text('GRAB PIZZA FOR RAINBOW ZOOMIES', W / 2, 88, '#ffd34d', 1, 'center');
      }
      if (Math.floor(frame / 30) % 2 === 0) text('PRESS SPACE OR TAP TO PLAY', W / 2, 104, '#ffffff', 1, 'center');
      if (best) text('BEST ' + best, W / 2, 114, '#d7f53c', 1, 'center');
      drawDog(BIRDY_X + Math.round(Math.sin(frame / 40) * 20) + 50, GROUND, Math.floor(frame / 50) % 4 === 3 ? 'jump' : 'run');
      ctx.drawImage(art.ball, 140, GROUND - 12 - Math.abs(Math.round(Math.sin(frame / 12) * 14)));
      ctx.restore();
      return;
    }
    game.items.forEach(drawItem);
    for (const p of game.parts) { ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
    const dog = game.dog;
    if (!(game.invuln && Math.floor(frame / 4) % 2)) {
      if (game.zoom && Math.floor(frame / 3) % 2) ctx.globalAlpha = 0.75;
      drawDog(BIRDY_X, Math.round(dog.y), dog.duck ? 'duck' : dog.ground ? 'run' : 'jump');
      ctx.globalAlpha = 1;
    }
    for (const p of game.pops) text(p.label, Math.round(p.x), Math.round(p.y) - 8, p.color, 1, 'center');
    hud();
    if (game.banner && state === 'play') text(STAGES[game.stage].name, W / 2, 40, '#ffffff', 1, 'center');
    if (state === 'pause') {
      ctx.fillStyle = 'rgba(43,22,56,.6)'; ctx.fillRect(0, 0, W, H);
      text('PAUSED', W / 2, 62, '#ffd23c', 3, 'center');
      text('PRESS SPACE OR TAP', W / 2, 90, '#ffffff', 1, 'center');
    }
    if (state === 'over') {
      ctx.fillStyle = 'rgba(43,22,56,.72)'; ctx.fillRect(14, 30, W - 28, 104);
      text('GOOD GIRL!', W / 2, 38, '#ff3d8b', 3, 'center', '#000');
      text('SCORE ' + Math.floor(game.score), W / 2, 64, '#ffffff', 1, 'center');
      text('BALLS CAUGHT ' + game.balls, W / 2, 74, '#d7f53c', 1, 'center');
      text('BEST ' + best, W / 2, 84, '#ffd23c', 1, 'center');
      if (pending && Math.floor(frame / 15) % 2 === 0) text('HIGH SCORE! ENTER INITIALS', W / 2, 98, '#3db8ff', 1, 'center');
      else if (!pending && game.newBest && Math.floor(frame / 15) % 2 === 0) text('NEW BEST!', W / 2, 96, '#3db8ff', 2, 'center');
      if (frame > 20 && Math.floor(frame / 30) % 2 === 0) text('SPACE OR TAP TO PLAY AGAIN', W / 2, 120, '#ffffff', 1, 'center');
    }
    ctx.restore();
  };

  const loop = time => {
    acc = Math.min(acc + (time - last), 100);
    last = time;
    while (acc >= 1000 / 60) { update(); acc -= 1000 / 60; }
    music();
    render();
    window.requestAnimationFrame(loop);
  };

  // Controls: keys only while the game has focus, so the page still scrolls normally.
  const JUMP_KEYS = [' ', 'ArrowUp', 'w', 'W', 'z', 'Z', 'Enter'];
  const DUCK_KEYS = ['ArrowDown', 's', 'S'];
  arcade.addEventListener('keydown', event => {
    if (event.target.closest('input')) return;
    if (event.target.closest('button') && (event.key === ' ' || event.key === 'Enter')) return;
    if (JUMP_KEYS.includes(event.key)) { event.preventDefault(); if (!event.repeat) jump(); input.jump = true; }
    else if (DUCK_KEYS.includes(event.key)) { event.preventDefault(); input.duck = true; }
    else if (event.key === 'Escape' && arcade.classList.contains('is-big')) { setBig(false); if (state === 'play') togglePause(); }
    else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') togglePause();
    else if (event.key === 'f' || event.key === 'F') setBig(!isBig());
    else if (event.key === 'm' || event.key === 'M') { wakeAudio(); setSound(!soundOn); }
  });
  arcade.addEventListener('keyup', event => {
    if (event.target.closest('input')) return;
    if (JUMP_KEYS.includes(event.key)) input.jump = false;
    if (DUCK_KEYS.includes(event.key)) input.duck = false;
  });
  arcade.addEventListener('focusout', event => {
    if (arcade.contains(event.relatedTarget)) return;
    input.jump = false; input.duck = false;
    if (state === 'play') togglePause();
  });
  new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && state === 'play') togglePause(); }, {threshold: 0.3}).observe(canvas);
  canvas.addEventListener('pointerdown', event => { event.preventDefault(); canvas.focus({preventScroll: true}); jump(); input.jump = true; });
  canvas.addEventListener('pointerup', () => { input.jump = false; });
  canvas.addEventListener('pointercancel', () => { input.jump = false; });
  const hold = (selector, key, press) => {
    const button = arcade.querySelector(selector);
    button.addEventListener('pointerdown', event => { event.preventDefault(); input[key] = true; if (press) press(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(name => button.addEventListener(name, () => { input[key] = false; }));
    button.addEventListener('click', event => { if (event.detail === 0 && press) press(); });
  };
  // Big screen: real fullscreen where the browser allows it, otherwise the cabinet fills the window.
  const bigButton = arcade.querySelector('[data-arcade-big]');
  const isBig = () => document.fullscreenElement === arcade || arcade.classList.contains('is-big');
  const syncBig = () => {
    const big = isBig();
    bigButton.setAttribute('aria-pressed', String(big));
    bigButton.textContent = big ? '⛶ Exit big screen' : '⛶ Big screen';
    document.documentElement.classList.toggle('arcade-open', arcade.classList.contains('is-big'));
    canvas.focus({preventScroll: true});
  };
  const setBig = on => {
    if (on && document.fullscreenEnabled && arcade.requestFullscreen) {
      arcade.requestFullscreen().then(syncBig, () => { arcade.classList.add('is-big'); syncBig(); });
    } else if (!on && document.fullscreenElement === arcade) {
      document.exitFullscreen();
    } else {
      arcade.classList.toggle('is-big', on);
      syncBig();
    }
  };
  bigButton.addEventListener('click', () => setBig(!isBig()));
  document.addEventListener('fullscreenchange', syncBig);
  hold('[data-arcade-jump]', 'jump', jump);
  hold('[data-arcade-duck]', 'duck', null);
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') togglePause(); });
  arcade.querySelector('[data-arcade-pad]').hidden = false;
  announce('Press Space or tap the screen to start. Your best score lasts for this visit.');
  window.requestAnimationFrame(time => { last = time; loop(time); });
}
