/* Caladan Worlds — capabilities brief, 16:9 slide deck.
   Everything is built in its finished state, so the static export (?pdf=1), print and
   reduced-motion viewers get complete slides. Entering a slide rewinds and plays it.
   Motion: entrances, race chart, counters.  Anime.js: mission map story, icon drawing. */
(() => {
  const M = window.Motion || {};
  const { animate: mAnimate, stagger: mStagger } = M;
  const A = window.anime;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pdfMode = new URLSearchParams(location.search).has('pdf');
  if (pdfMode) document.documentElement.classList.add('pdf');
  const animOK = !pdfMode && !reduce && !!mAnimate && !!A;

  const EASE = [0.22, 1, 0.36, 1];
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, attrs = {}, parent, text) => {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const setT = (n, t) => { if (n && n.textContent !== t) n.textContent = t; };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ═══════════ BUILD (finished state) ═══════════ */

  /* ── race: four lanes over 26 weeks, and who keeps up ── */
  const race = $('#race');
  const WEEKS = 26, LAG = 0.7, RW = 1400, wx = (w) => (w / WEEKS) * RW;
  const front = [], ours = [];
  let raceBar, raceHead, raceTT, raceFlag, totals = {};
  if (race) {
    race.innerHTML = '';
    [[0, 'start', 'Week 0'], [8, 'middle', 'Week 8'], [16, 'middle', 'Week 16'], [26, 'end', 'Week 26']].forEach(([w, anchor, t]) => {
      el('line', { class: 'tick', x1: wx(w), x2: wx(w), y1: 40, y2: 404 }, race);
      el('text', { class: 'axis', x: wx(w), y: 440, 'text-anchor': anchor }, race, t);
    });
    el('text', { class: 'total-head', x: 1728, y: 16, 'text-anchor': 'end' }, race, 'Changes in 26 weeks');
    // lane 1: the front, lane 2: Caladan answering each change
    el('text', { x: 0, y: 30 }, race, 'At the front: a new tactic or drone design');
    el('rect', { class: 'track', x: 0, y: 46, width: RW, height: 44, rx: 2 }, race);
    el('rect', { class: 'track us', x: 0, y: 156, width: RW, height: 44, rx: 2 }, race);
    for (let w = 2; w <= WEEKS; w += 2) {
      const fx = wx(w) - (w === WEEKS ? 12 : 6), ox = Math.min(RW - 12, wx(w + LAG) - 6);
      const link = el('path', { class: 'link', d: `M${fx + 6},90 C${fx + 6},124 ${ox + 6},122 ${ox + 6},156` }, race);
      front.push({ at: w / WEEKS, node: el('rect', { class: 'mark lit', x: fx.toFixed(1), y: 46, width: 12, height: 44, rx: 2 }, race) });
      ours.push({ at: Math.min(1, (w + LAG) / WEEKS), node: el('rect', { class: 'mark us lit', x: ox.toFixed(1), y: 156, width: 12, height: 44, rx: 2 }, race), link });
    }
    // drawn after the links, with a paper-coloured outline, so the links pass behind the label
    el('text', { class: 'lane-us', x: 0, y: 140 }, race, 'Caladan: your rehearsal world, rebuilt after each change');
    // lane 3: one fix, the whole 26 weeks
    el('text', { x: 0, y: 250 }, race, 'A fix from the manufacturer');
    el('rect', { class: 'track', x: 0, y: 266, width: RW, height: 28, rx: 2 }, race);
    raceBar = el('rect', { class: 'bar', x: 0, y: 266, width: RW, height: 28, rx: 2 }, race);
    raceFlag = el('text', { class: 'flag', x: RW - 12, y: 286, 'text-anchor': 'end' }, race, 'Fix fielded');
    // lane 4: the standard
    el('text', { x: 0, y: 350 }, race, 'NATO drone-operator training standard');
    el('rect', { class: 'track hatch', x: 0, y: 366, width: RW, height: 28, rx: 2 }, race);
    el('text', { class: 'inbar', x: 14, y: 386 }, race, 'No update in 7 years');
    totals.front = el('text', { class: 'total num', x: 1728, y: 88, 'text-anchor': 'end' }, race, '13');
    totals.ours = el('text', { class: 'total us num', x: 1728, y: 198, 'text-anchor': 'end' }, race, '13');
    totals.fix = el('text', { class: 'total dim num', x: 1728, y: 300, 'text-anchor': 'end' }, race, '1');
    totals.std = el('text', { class: 'total dim num', x: 1728, y: 400, 'text-anchor': 'end' }, race, '0');
    raceHead = el('g', { opacity: 0 }, race);
    el('line', { class: 'head-line', x1: 0, x2: 0, y1: 40, y2: 404 }, raceHead);
    el('rect', { class: 'r-tt', x: -52, y: 4, width: 104, height: 34, rx: 3 }, raceHead);
    raceTT = el('text', { class: 'r-tt-text num', x: 0, y: 27, 'text-anchor': 'middle' }, raceHead, 'Week 0');
  }
  const raceRender = (p) => {
    if (!race) return;
    const done = p >= 1;
    let nf = 0, no = 0;
    front.forEach((m) => { const lit = p >= m.at - 1e-6; m.node.classList.toggle('lit', lit); if (lit) nf++; });
    ours.forEach((m) => { const lit = p >= m.at - 1e-6; m.node.classList.toggle('lit', lit); m.link.classList.toggle('lit', lit); if (lit) no++; });
    setT(totals.front, String(nf)); setT(totals.ours, String(no)); setT(totals.fix, done ? '1' : '0');
    raceBar.setAttribute('width', (p * RW).toFixed(1));
    raceFlag.style.opacity = done ? 1 : 0;
    raceHead.setAttribute('transform', `translate(${(p * RW).toFixed(1)},0)`);
    raceHead.setAttribute('opacity', p > 0 && !done ? 1 : 0);
    setT(raceTT, 'Week ' + Math.round(p * WEEKS));
  };

  /* ── comparison matrix (from the pitch deck, by category of tool) ── */
  const matrix = $('#matrix');
  const MARK = {
    yes: '<svg class="mk yes" viewBox="0 0 40 40"><circle class="disc" cx="20" cy="20" r="18"/><path class="tick" d="M12 20.5l5.5 5.5L28.5 14.5"/></svg>',
    part: '<svg class="mk part" viewBox="0 0 40 40"><circle class="ring" cx="20" cy="20" r="17"/><path class="half" d="M20 3a17 17 0 0 0 0 34z"/></svg>',
    no: '<svg class="mk no" viewBox="0 0 40 40"><path class="dash" d="M12 20h16"/></svg>',
  };
  if (matrix) {
    const cols = ['Caladan Worlds', 'Drone flight trainers', 'Legacy training systems', 'Command wargaming', 'AI training arenas', 'Autonomy stack vendors'];
    const rows = [
      ['You fly it yourself', 'yes', 'yes', 'yes', ['part', 'Staff only'], 'no', 'no'],
      ['Your whole team rehearses the mission', 'yes', 'no', 'part', ['part', 'Command level'], 'no', 'no'],
      ['Built from frontline data', 'yes', 'part', 'no', ['no', 'Unverified'], 'yes', 'no'],
      ['Works with any maker\'s drone', 'yes', 'no', 'part', 'yes', 'yes', ['no', 'Own stack only']],
    ];
    let html = '<div class="col row"></div>' + cols.map((c, i) => `<div class="col${i ? '' : ' us'}">${c}</div>`).join('');
    rows.forEach((r) => {
      html += `<div class="row">${r[0]}</div>`;
      r.slice(1).forEach((v, i) => { const [k, label] = Array.isArray(v) ? v : [v, '']; html += `<div class="cell${i ? '' : ' us'}">${MARK[k]}${label ? `<span>${label}</span>` : ''}</div>`; });
    });
    matrix.innerHTML = html;
  }

  /* ── mission map terrain ── */
  const smooth = (pts) => {
    const n = pts.length; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  };
  const blob = (cx, cy, r, s, sx = 1, sy = 1, wob = 1) => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const k = 1 + wob * (0.14 * Math.sin(3 * a + s) + 0.07 * Math.sin(5 * a + 2 * s) + 0.04 * Math.sin(7 * a + 3 * s));
      pts.push([cx + Math.cos(a) * r * k * sx, cy + Math.sin(a) * r * k * sy]);
    }
    return smooth(pts);
  };
  const openSmooth = (pts) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
  };
  const terrain = $('#terrain');
  if (terrain) {
    [[150, 130, 70, 0.9], [560, 330, 60, 1.6]].forEach(([x, y, r, s]) => el('path', { class: 'treeline', d: blob(x, y, r, s, 1.2, 0.6, 1.4) }, terrain));
    [[190, 150, 130, 7, 1.0], [470, 300, 100, 6, 2.3], [530, 120, 64, 4, 4.1], [70, 70, 56, 3, 5.2]].forEach(([cx, cy, rmax, levels, s]) => {
      for (let i = 0; i < levels; i++) el('path', { class: 'contour' + (i % 3 === 0 ? ' major' : ''), d: blob(cx + i * 3, cy - i * 1.8, rmax * (1 - i / levels), s + i * 0.35, 1.25, 0.85) }, terrain);
    });
    const grid = $('#grid');
    'ABCDEFGH'.split('').forEach((c, i) => { if (i) el('line', { x1: i * 75, x2: i * 75, y1: 0, y2: 400 }, grid); el('text', { x: i * 75 + 6, y: 14 }, grid, c); });
    for (let j = 1; j < 6; j++) { el('line', { x1: 0, x2: 600, y1: j * 75, y2: j * 75 }, grid); el('text', { x: 592, y: j * 75 - 5, 'text-anchor': 'end' }, grid, String(j).padStart(2, '0')); }
  }

  /* ── operators graphic: the same route flown again, with link quality underneath ── */
  const runs = $('#runs');
  const RUN = { t: [], l: [], ends: [] };
  if (runs) {
    runs.innerHTML = '<defs><linearGradient id="run-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0672a" stop-opacity="0.36"/><stop offset="1" stop-color="#b0672a" stop-opacity="0"/></linearGradient></defs>';
    // flight trace
    el('circle', { class: 'jamzone', cx: 260, cy: 58, r: 34 }, runs);
    el('text', { class: 'threat', x: 260, y: 16, 'text-anchor': 'middle' }, runs, 'Jamming');
    el('circle', { class: 'dot', cx: 40, cy: 70, r: 4 }, runs);
    el('circle', { class: 'target', cx: 480, cy: 45, r: 8 }, runs);
    el('circle', { class: 'dot', cx: 480, cy: 45, r: 2.5 }, runs);
    const traces = ['M40,70 C120,66 190,62 246,60', 'M40,70 C120,74 200,72 268,64', 'M40,70 C140,98 300,114 360,92 S450,56 480,45'];
    const stops = [[246, 60], [268, 64]];
    // link-quality chart
    el('rect', { class: 'band', x: 226, y: 124, width: 68, height: 91 }, runs);
    el('text', { x: 40, y: 116 }, runs, 'Link quality');
    el('line', { class: 'base', x1: 40, x2: 480, y1: 215, y2: 215 }, runs);
    el('line', { class: 'thr', x1: 40, x2: 480, y1: 200, y2: 200 }, runs);
    el('text', { class: 'threat', x: 480, y: 195, 'text-anchor': 'end' }, runs, 'Link lost');
    [['Run 1', 318, ''], ['Run 2', 378, ''], ['Run 4', 438, ' good']].forEach(([t, x, c]) => { el('line', { class: 'ln' + c, x1: x, x2: x + 14, y1: 112, y2: 112 }, runs); el('text', { x: x + 19, y: 116 }, runs, t); });
    const lines = [
      [[40, 132], [120, 133], [190, 132], [218, 136], [236, 170], [250, 215]],
      [[40, 133], [120, 131], [200, 133], [232, 138], [254, 176], [272, 215]],
      [[40, 132], [120, 131], [200, 133], [250, 150], [290, 162], [340, 150], [400, 136], [480, 132]],
    ];
    RUN.area = el('path', { id: 'run-area', d: openSmooth(lines[2]) + 'L480,215L40,215Z', fill: 'url(#run-fill)' }, runs);
    traces.forEach((d, i) => {
      const good = i === 2 ? ' good' : '';
      RUN.t.push(el('path', { class: 'tr' + good, id: 'run-t' + i, d }, runs));
      RUN.l.push(el('path', { class: 'ln' + good, d: openSmooth(lines[i]) }, runs));
      const g = el('g', {}, runs);
      if (i < 2) {
        el('path', { class: 'x', d: `M${stops[i][0] - 5},${stops[i][1] - 5} l10,10 m0,-10 l-10,10` }, g);
        const lx = lines[i][5][0]; el('path', { class: 'x', d: `M${lx - 5},205 l10,10 m0,-10 l-10,10` }, g);
      } else { el('circle', { class: 'hit', cx: 480, cy: 45, r: 5 }, g); el('circle', { class: 'hit', cx: 480, cy: 132, r: 4 }, g); }
      RUN.ends.push(g);
    });
    RUN.drone = el('circle', { class: 'dot', id: 'run-drone', r: 4.5, opacity: 0 }, runs);
  }

  /* ── instructors graphic: a roster, operator by operator ── */
  const roster = $('#roster'), readyCount = $('#ready-count');
  const OPS = [
    { name: 'Operator 1', p: 1, data: [0.2, 0.35, 0.3, 0.55, 0.7, 0.85, 0.95] },
    { name: 'Operator 2', p: 1, data: [0.3, 0.28, 0.5, 0.6, 0.72, 0.8, 0.92] },
    { name: 'Operator 3', p: 0.7, data: [0.15, 0.25, 0.22, 0.4, 0.38, 0.55, 0.66], note: '2 runs to go' },
    { name: 'Operator 4', p: 1, data: [0.25, 0.4, 0.55, 0.5, 0.75, 0.9, 0.96] },
    { name: 'Operator 5', p: 1, data: [0.1, 0.3, 0.45, 0.6, 0.58, 0.8, 0.9] },
  ];
  const RING_C = 2 * Math.PI * 11;
  if (roster) OPS.forEach((o, i) => {
    const y = 30 + i * 40, g = el('g', { class: 'op' }, roster);
    el('circle', { class: 'op-head', cx: 26, cy: y - 6, r: 5 }, g);
    el('path', { class: 'op-body', d: `M16,${y + 10} a10,9 0 0 1 20,0` }, g);
    el('text', { class: 'op-name', x: 50, y: y + 5 }, g, o.name);
    const pts = o.data.map((v, k) => [150 + k * 30, +(y + 12 - v * 24).toFixed(1)]);
    o.line = el('path', { class: 'sp-line' + (o.p >= 1 ? ' ok' : ''), d: openSmooth(pts) }, g);
    o.dot = el('circle', { class: 'sp-dot' + (o.p >= 1 ? ' ok' : ''), cx: pts[6][0], cy: pts[6][1], r: 3.5 }, g);
    el('circle', { class: 'ring-track', cx: 378, cy: y, r: 11 }, g);
    o.ring = el('circle', { class: 'ring-fill' + (o.p >= 1 ? ' ok' : ''), cx: 378, cy: y, r: 11, transform: `rotate(-90 378 ${y})`, 'stroke-dasharray': `${(RING_C * o.p).toFixed(1)} ${RING_C.toFixed(1)}` }, g);
    o.status = el('text', { class: 'op-status' + (o.p >= 1 ? ' ok' : ''), x: 402, y: y + 5 }, g, o.p >= 1 ? 'Ready' : o.note);
    o.g = g;
  });

  /* ── performance over rehearsal runs (illustrative) ── */
  const meas = $('#meas');
  const MV = [22, 31, 28, 44, 52, 49, 63, 70, 76, 74, 83, 88];       // run-by-run, with the odd bad run
  const mx = (i) => 130 + i * (1160 / 11), my = (v) => 330 - v * 2.9;
  const MISSION_X = 1470, READY_LINE = 60;
  const MP = MV.map((v, i) => [+mx(i).toFixed(1), +my(v).toFixed(1)]);
  let measLine, measRuns = [], measLen = 0;
  if (meas) {
    meas.innerHTML = '<defs><linearGradient id="meas-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="meas-clip"><rect id="meas-clip-rect" x="0" y="0" width="1640" height="400"/></clipPath></defs>';
    el('line', { class: 'm-axis', x1: 100, x2: 1580, y1: 330, y2: 330 }, meas);
    MP.forEach((p, i) => el('text', { class: 'm-tick', x: p[0], y: 358, 'text-anchor': 'middle' }, meas, String(i + 1)));
    el('text', { class: 'm-label', x: 100, y: 392 }, meas, 'Rehearsal runs');
    el('text', { class: 'm-label', x: 100, y: 28 }, meas, 'Mission performance · illustrative');
    el('line', { class: 'm-sep', x1: 1370, x2: 1370, y1: 40, y2: 330 }, meas);
    el('text', { class: 'm-mission', x: MISSION_X, y: 362, 'text-anchor': 'middle' }, meas, 'The mission');
    el('line', { class: 'm-ready', x1: 100, x2: 1580, y1: my(READY_LINE), y2: my(READY_LINE) }, meas);
    el('text', { class: 'm-ready-label', x: 104, y: my(READY_LINE) - 10 }, meas, 'Mission-ready');
    const d = openSmooth(MP);
    el('path', { id: 'meas-area', d: d + `L${MP[11][0]},330L${MP[0][0]},330Z`, fill: 'url(#meas-fill)', 'clip-path': 'url(#meas-clip)' }, meas);
    measLine = el('path', { class: 'm-line', id: 'meas-line', d }, meas);
    MP.forEach((p) => measRuns.push(el('circle', { class: 'm-run lit', cx: p[0], cy: p[1], r: 5 }, meas)));
    el('path', { class: 'm-link', id: 'meas-link', d: `M${MP[11][0]},${MP[11][1]} L${MISSION_X},${my(92)}` }, meas);
    el('line', { class: 'm-gap', id: 'meas-gap', x1: MISSION_X, x2: MISSION_X, y1: my(92) + 22, y2: my(24) - 18 }, meas);
    const cold = el('g', { id: 'meas-cold' }, meas);
    el('circle', { class: 'm-cold', cx: MISSION_X, cy: my(24), r: 12 }, cold);
    el('text', { class: 'm-note', x: MISSION_X + 26, y: my(24) + 6 }, cold, 'Unrehearsed');
    const hot = el('g', { id: 'meas-hot' }, meas);
    el('circle', { class: 'm-hot', cx: MISSION_X, cy: my(92), r: 15 }, hot);
    el('text', { class: 'm-note strong', x: MISSION_X + 28, y: my(92) + 7 }, hot, 'Rehearsed');
    const tip = el('g', { id: 'meas-tip', opacity: 0 }, meas);
    el('circle', { class: 'm-tipdot', r: 8 }, tip);
    el('rect', { class: 'm-tt', x: -46, y: -52, width: 92, height: 32, rx: 3 }, tip);
    el('text', { class: 'm-tt-text', id: 'meas-tt', x: 0, y: -30, 'text-anchor': 'middle' }, tip, 'Run 1');
    measLen = measLine.getTotalLength();
  }

  /* ── swarm (canvas): hostile drones inbound, friendly interceptors launching against them ── */
  const sw = $('#swarm'), swCount = $('#swarm-count');
  const SW = { ctx: sw && sw.getContext('2d'), w: 0, h: 0, drones: [], friends: [], rings: [], engaged: 0, running: false, last: 0, t: 0, cool: 0 };
  const swHome = () => ({ x: 34, y: SW.h / 2 });
  const swR = () => Math.min(SW.h * 0.4, 110);
  const swResize = () => { SW.w = sw.clientWidth; SW.h = sw.clientHeight; sw.width = SW.w * 2; sw.height = SW.h * 2; SW.ctx.setTransform(2, 0, 0, 2, 0, 0); };
  const swDraw = () => {
    const c = SW.ctx, h = swHome(), R = swR();
    c.clearRect(0, 0, SW.w, SW.h);
    // range rings
    c.lineWidth = 1;
    [1, 2.1, 3.3, 4.6].forEach((k, i) => { c.strokeStyle = `rgba(40,30,15,${i ? 0.1 : 0.55})`; c.setLineDash(i ? [] : [3, 5]); c.beginPath(); c.arc(h.x, h.y, R * k, -Math.PI * 0.46, Math.PI * 0.46); c.stroke(); });
    c.setLineDash([]);
    // friendly interceptors: a line back to the launch point, then the drone
    SW.friends.forEach((f) => {
      c.strokeStyle = 'rgba(40,30,15,0.22)'; c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(f.x, f.y); c.stroke();
      c.fillStyle = '#1b1915'; c.beginPath(); c.moveTo(f.x + f.ux * 6, f.y + f.uy * 6); c.lineTo(f.x - f.ux * 4 - f.uy * 4, f.y - f.uy * 4 + f.ux * 4); c.lineTo(f.x - f.ux * 4 + f.uy * 4, f.y - f.uy * 4 - f.ux * 4); c.closePath(); c.fill();
    });
    // hostile drones with a short tail
    SW.drones.forEach((d) => {
      c.strokeStyle = 'rgba(168,71,47,0.3)'; c.lineWidth = d.r; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - (d.vx || -1) * 0.16, d.y - (d.vy || 0) * 0.16); c.stroke();
      c.fillStyle = '#a8472f'; c.beginPath(); c.arc(d.x, d.y, d.r, 0, 7); c.fill();
    });
    c.lineWidth = 1.5;
    SW.rings.forEach((g) => { const k = g.t / 0.5; c.strokeStyle = `rgba(40,30,15,${((1 - k) * 0.8).toFixed(2)})`; c.beginPath(); c.arc(g.x, g.y, 3 + k * 14, 0, 7); c.stroke(); });
    // defended position and legend
    c.fillStyle = '#7f5c34'; c.beginPath(); c.arc(h.x, h.y, 7, 0, 7); c.fill();
    c.font = '13px "Helvetica Neue", Helvetica, Arial, sans-serif'; c.textBaseline = 'middle';
    c.fillStyle = '#a8472f'; c.beginPath(); c.arc(SW.w - 196, 18, 3.5, 0, 7); c.fill();
    c.fillStyle = 'rgba(40,30,15,0.75)'; c.fillText('Hostile', SW.w - 186, 19);
    c.fillStyle = '#1b1915'; c.beginPath(); c.moveTo(SW.w - 108, 18); c.lineTo(SW.w - 118, 13); c.lineTo(SW.w - 118, 23); c.closePath(); c.fill();
    c.fillStyle = 'rgba(40,30,15,0.75)'; c.fillText('Your drones', SW.w - 100, 19);
  };
  const swSpawn = (r = Math.random, anywhere = false) => {
    const edge = r(); let x, y;
    if (anywhere) { x = SW.w * (0.4 + r() * 0.6); y = r() * SW.h; }
    else if (edge < 0.7) { x = SW.w + 8; y = r() * SW.h; }
    else if (edge < 0.85) { x = SW.w * (0.5 + r() * 0.5); y = -8; }
    else { x = SW.w * (0.5 + r() * 0.5); y = SW.h + 8; }
    SW.drones.push({ x, y, r: 1.8 + r() * 2, v: 32 + r() * 48, ph: r() * 6.28, f: 1.5 + r() * 2.5, vx: -40, vy: 0 });
  };
  const swLaunch = (target, at = 0) => {
    const h = swHome(); target.claimed = true;
    const dx = target.x - h.x, dy = target.y - h.y, dist = Math.hypot(dx, dy) || 1;
    SW.friends.push({ x: h.x + dx * at, y: h.y + dy * at, ux: dx / dist, uy: dy / dist, target });
  };
  const swStatic = () => {
    swResize(); SW.drones = []; SW.friends = []; SW.rings = []; SW.cool = 0;
    const r = rng(7); for (let i = 0; i < 40; i++) swSpawn(r, true);
    [3, 11, 19, 27, 34].forEach((i, k) => swLaunch(SW.drones[i], 0.3 + k * 0.12));
    swDraw();
  };
  const swStep = (now) => {
    if (!SW.running) return;
    const dt = Math.min(0.05, (now - SW.last) / 1000 || 0); SW.last = now; SW.t += dt; SW.cool -= dt;
    const h = swHome(), R = swR();
    if (SW.drones.length < 46 && Math.random() < dt * 12) swSpawn();
    // launch an interceptor at the nearest unclaimed hostile inside the outer ring
    if (SW.cool <= 0 && SW.friends.length < 9) {
      let best = null, bd = R * 4.4;
      SW.drones.forEach((d) => { if (d.claimed) return; const dd = Math.hypot(d.x - h.x, d.y - h.y); if (dd < bd) { bd = dd; best = d; } });
      if (best) { swLaunch(best); SW.cool = 0.32; }
    }
    const hit = (x, y) => { SW.rings.push({ x, y, t: 0 }); SW.engaged++; };
    SW.friends = SW.friends.filter((f) => {
      const t = f.target; if (t.dead) return false;
      const dx = t.x - f.x, dy = t.y - f.y, dist = Math.hypot(dx, dy) || 1;
      f.ux = dx / dist; f.uy = dy / dist; f.x += f.ux * 190 * dt; f.y += f.uy * 190 * dt;
      if (dist < 8) { t.dead = true; hit(t.x, t.y); return false; }
      return true;
    });
    SW.drones = SW.drones.filter((d) => {
      if (d.dead) return false;
      const dx = h.x - d.x, dy = h.y - d.y, dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist, uy = dy / dist, wob = Math.sin(SW.t * d.f + d.ph) * 0.45;
      d.vx = (ux - uy * wob) * d.v; d.vy = (uy + ux * wob) * d.v;
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (dist <= R + 3) { d.dead = true; hit(d.x, d.y); return false; }
      return true;
    });
    SW.rings = SW.rings.filter((g) => (g.t += dt) < 0.5);
    setT(swCount, String(SW.engaged));
    swDraw();
    requestAnimationFrame(swStep);
  };
  if (sw) swStatic();

  /* ── option 3: the same ground regenerated, AI-filled seats, the security boundary ── */
  const gen = $('#gen'), genChips = $('#gen-chips');
  const GEN = { k: 0, cur: null, ghosts: null };
  const G_TIME = ['Dawn', 'Night', 'Dusk', 'Midday'], G_WX = ['Gusting 30 kt', 'Low cloud', 'Rain', 'Clear'], G_THREAT = ['Jammer moved', 'GPS spoofing', 'Two enemy teams', 'Decoy drones'];
  const genVariant = (k) => {
    const r = rng(k * 97 + 5), L = [60, 240], O = [540, 56], m = [300, 148], n = [0.358, 0.934];
    const jx = 200 + r() * 200, jy = 86 + r() * 116, jr = 38 + r() * 22;
    const s = (jx - m[0]) * n[0] + (jy - m[1]) * n[1], sign = s >= 0 ? 1 : -1;
    const T = [Math.max(90, Math.min(510, jx - sign * n[0] * (jr + 46))), Math.max(30, Math.min(258, jy - sign * n[1] * (jr + 46)))];
    const c = [2 * T[0] - m[0], 2 * T[1] - m[1]];
    const enemies = [0, 1, 2].map(() => [O[0] - 20 - r() * 110, O[1] + 4 + r() * 84]);
    return { jx, jy, jr, d: `M${L[0]},${L[1]} Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${O[0]},${O[1]}`, enemies, show: 2 + Math.floor(r() * 2),
      chips: ['Run ' + (12 + k), G_TIME[Math.floor(r() * 4)], G_WX[Math.floor(r() * 4)], G_THREAT[Math.floor(r() * 4)]] };
  };
  const genSet = (v) => {
    GEN.jam.setAttribute('cx', v.jx.toFixed(1)); GEN.jam.setAttribute('cy', v.jy.toFixed(1)); GEN.jam.setAttribute('r', v.jr.toFixed(1));
    GEN.jamT.setAttribute('x', v.jx.toFixed(1)); GEN.jamT.setAttribute('y', (v.jy - v.jr - 8).toFixed(1));
    GEN.en.forEach((e, i) => { e.setAttribute('transform', `translate(${v.enemies[i][0].toFixed(1)},${v.enemies[i][1].toFixed(1)})`); e.style.opacity = i < v.show ? 1 : 0; });
  };
  const genChipsSet = (v) => [...genChips.children].forEach((c, i) => (c.textContent = v.chips[i]));
  const genGhost = (d) => { const p = el('path', { class: 'ghost', d }, GEN.ghosts); while (GEN.ghosts.children.length > 5) GEN.ghosts.removeChild(GEN.ghosts.firstChild); return p; };
  if (gen) {
    for (let i = 1; i < 8; i++) el('line', { class: 'gl', x1: i * 75, x2: i * 75, y1: 0, y2: 288 }, gen);
    for (let i = 1; i < 4; i++) el('line', { class: 'gl', x1: 0, x2: 600, y1: i * 72, y2: i * 72 }, gen);
    [[170, 110, 110, 6, 1.0], [450, 220, 90, 5, 2.3], [520, 90, 56, 3, 4.1]].forEach(([cx, cy, rmax, levels, s]) => {
      for (let i = 0; i < levels; i++) el('path', { class: 'contour' + (i % 3 === 0 ? ' major' : ''), d: blob(cx + i * 3, cy - i * 1.8, rmax * (1 - i / levels), s + i * 0.35, 1.25, 0.8) }, gen);
    });
    GEN.ghosts = el('g', {}, gen);
    GEN.jam = el('circle', { class: 'jam' }, gen);
    GEN.jamT = el('text', { class: 'label threat', 'text-anchor': 'middle' }, gen, 'Jamming');
    GEN.en = [0, 1, 2].map(() => el('path', { class: 'enemy', d: 'M0,-6 l6,6 -6,6 -6,-6z' }, gen));
    GEN.route = el('path', { class: 'route-new', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 0 }, gen);
    el('circle', { class: 'marker', cx: 60, cy: 240, r: 4 }, gen); el('text', { class: 'label', x: 48, y: 262 }, gen, 'Launch');
    el('circle', { class: 'marker-ring', cx: 540, cy: 56, r: 9 }, gen); el('circle', { class: 'marker', cx: 540, cy: 56, r: 3 }, gen);
    el('text', { class: 'label', x: 540, y: 34, 'text-anchor': 'middle' }, gen, 'Objective');
    [101, 102, 103].forEach((k) => genGhost(genVariant(k).d));
    GEN.cur = genVariant(0); genSet(GEN.cur); GEN.route.setAttribute('d', GEN.cur.d);
  }

  const seatsSvg = $('#seats'), seatsCap = $('#seats-cap'), SEATS = [];
  const seatsSet = (mask) => {
    let on = 0;
    SEATS.forEach((s, i) => { const human = !!mask[i]; if (human) on++; s.person.style.opacity = human ? 1 : 0; s.bot.style.opacity = human ? 0 : 1; s.box.classList.toggle('ai', !human); s.label.textContent = human ? 'Operator' : 'AI'; });
    if (seatsCap) seatsCap.textContent = `${on} of 6 online · AI flying ${6 - on} seat${6 - on === 1 ? '' : 's'}`;
  };
  if (seatsSvg) {
    for (let i = 0; i < 6; i++) {
      const x = 14 + (i % 3) * 94, y = 14 + Math.floor(i / 3) * 84, g = el('g', { transform: `translate(${x},${y})` }, seatsSvg);
      const box = el('rect', { class: 'seat', width: 84, height: 74, rx: 4 }, g);
      const person = el('g', { class: 'seat-person' }, g);
      el('circle', { cx: 42, cy: 22, r: 9 }, person); el('path', { d: 'M25,48 a17,15 0 0 1 34,0z' }, person);
      const bot = el('g', { class: 'seat-bot' }, g);
      el('rect', { x: 27, y: 16, width: 30, height: 24, rx: 5 }, bot); el('path', { d: 'M42,16 v-7 M38,9 h8' }, bot);
      el('circle', { class: 'eye', cx: 36, cy: 28, r: 2.5 }, bot); el('circle', { class: 'eye', cx: 48, cy: 28, r: 2.5 }, bot);
      const label = el('text', { x: 42, y: 65, 'text-anchor': 'middle' }, g, 'Operator');
      SEATS.push({ box, person, bot, label });
    }
    seatsSet([1, 1, 0, 1, 0, 1]);
  }

  const vault = $('#vault'), VAULT = {};
  if (vault) {
    el('rect', { class: 'wall', x: 92, y: 30, width: 116, height: 124, rx: 6 }, vault);
    el('rect', { class: 'lock', x: 134, y: 78, width: 32, height: 26, rx: 3 }, vault);
    el('path', { class: 'lock-arc', d: 'M140,78 v-9 a10,10 0 0 1 20,0 v9' }, vault);
    el('text', { class: 'strong', x: 150, y: 132, 'text-anchor': 'middle' }, vault, 'Your unit');
    el('text', { x: 46, y: 70, 'text-anchor': 'middle' }, vault, 'Signed'); el('text', { x: 46, y: 86, 'text-anchor': 'middle' }, vault, 'updates');
    el('path', { class: 'flow in', d: 'M8,104 H86 m-8,-6 l8,6 -8,6' }, vault);
    el('text', { x: 254, y: 70, 'text-anchor': 'middle' }, vault, 'Your'); el('text', { x: 254, y: 86, 'text-anchor': 'middle' }, vault, 'data');
    el('path', { class: 'flow out', d: 'M214,104 H292' }, vault);
    VAULT.ok = el('path', { class: 'ok', d: 'M70,124 l6,6 12,-13' }, vault);
    VAULT.no = el('path', { class: 'no', d: 'M222,96 l16,16 m0,-16 l-16,16' }, vault);
    VAULT.inDot = el('circle', { class: 'pk in', cx: 8, cy: 104, r: 5, opacity: 0 }, vault);
    VAULT.outDot = el('circle', { class: 'pk out', cx: 180, cy: 104, r: 5, opacity: 0 }, vault);
  }

  /* ── page numbers ── */
  const slides = $$('.slide');
  slides.forEach((s, i) => { const n = $('.foot .num', s); if (n) n.textContent = i + 1; });

  if (pdfMode) return;      // static export: all slides stacked, finished

  /* ═══════════ SLIDE ANIMATIONS (each rewinds, then plays) ═══════════ */
  const plays = {}, leaves = {};
  const enterGeneric = (s) => {
    const els = $$('[data-in]', s);
    els.forEach((n) => { n.style.opacity = 0; n.style.transform = 'translateY(18px)'; });
    mAnimate(els, { opacity: [0, 1], y: [18, 0] }, { duration: 0.6, ease: EASE, delay: mStagger(0.07, { startDelay: 0.15 }) });
  };

  if (animOK) {
    /* cover: one slow push-in on the photo */
    plays.cover = () => mAnimate('#cover .bg', { scale: [1.08, 1] }, { duration: 6, ease: EASE });

    /* race */
    let raceAnim = null;
    plays.problem = () => {
      if (raceAnim) raceAnim.stop();
      raceRender(0);
      raceAnim = mAnimate(0, 1, { duration: 6, delay: 0.9, ease: 'linear', onUpdate: raceRender, onComplete: () => raceRender(1) });
    };
    const rr = $('#race-replay'); if (rr) { rr.hidden = false; rr.addEventListener('click', plays.problem); }

    /* matrix: columns fill in left to right, ours first */
    plays.different = () => {
      const cells = $$('#matrix .cell');
      cells.forEach((c) => { c.style.opacity = 0; c.style.transform = 'scale(0.8)'; });
      const byCol = cells.map((c, i) => ({ c, col: i % 6, row: Math.floor(i / 6) })).sort((a, b) => a.col - b.col || a.row - b.row).map((x) => x.c);
      mAnimate(byCol, { opacity: [0, 1], scale: [0.8, 1] }, { duration: 0.4, ease: EASE, delay: mStagger(0.07, { startDelay: 0.7 }) });
    };

    /* mission map: one rehearsal, start to finish */
    const mapEl = $('#map'), chip = $('#run-chip'), capsEl = $('#msgs'), capEls = $$('#msgs .msg');
    const CAP = { ground: 0, drone: 0, jam: 1, rewind: 2, team: 3, deploy: 4, next: 5 };
    const setChip = (t, live) => { chip.textContent = t; chip.classList.toggle('live', !!live); };
    const setCap = (k) => { capsEl.classList.toggle('story', k != null); capEls.forEach((c, i) => c.classList.toggle('is-active', i === k)); };
    let mapTl = null;
    const buildMap = () => {
      const D = (s) => A.svg.createDrawable(s);
      const contD = D('#terrain .contour'), planD = D('#plan-mask-path'), newD = D('#route-new'), altD = D('#route-alt');
      [contD, planD, newD, altD].forEach((d) => A.utils.set(d, { draw: '0 0' }));
      A.utils.set(['#jam', '#lost', '#enemy', '#ally', '#ontarget'], { opacity: 0 });
      const leg = A.svg.createMotionPath('#plan-leg'), back = A.svg.createMotionPath('#plan-back'), fresh = A.svg.createMotionPath('#route-new');
      return A.createTimeline({ defaults: { ease: 'inOut(2)' } })
        .call(() => { setCap(CAP.ground); setChip('Building the ground'); mapEl.classList.remove('glitch'); }, 0)
        .add(contD, { draw: ['0 0', '0 1'], duration: 900, delay: A.stagger(22), ease: 'out(2)' }, 0)
        .call(() => { setCap(CAP.drone); setChip('Run 1 · your quad, your route'); }, 1700)
        .add(planD, { draw: ['0 0', '0 1'], duration: 800 }, 1700)
        .add('#drone', { opacity: [0, 1], duration: 150 }, 2500)
        .add('#drone', { ...leg, duration: 1300, ease: 'in(1.6)' }, 2500)
        .call(() => { setCap(CAP.jam); setChip('Run 1 · jamming'); }, 3000)
        .add('#jam', { opacity: [0, 1], duration: 400, ease: 'out(3)' }, 3000)
        .call(() => { setChip('Run 1 · link lost'); mapEl.classList.add('glitch'); setTimeout(() => mapEl.classList.remove('glitch'), 800); }, 3800)
        .add('#lost', { opacity: [0, 1], duration: 200 }, 3800)
        .call(() => { setCap(CAP.rewind); setChip('Rewind · fly it again'); }, 4900)
        .add('#rewind', { opacity: [0, 1], duration: 200 }, 4900)
        .add('#drone', { ...back, duration: 700 }, 4900)
        .add('#rewind', { opacity: [1, 0], duration: 200 }, 5700)
        .call(() => { setCap(CAP.team); setChip('Run 4 · AI enemy and wingman join'); }, 5900)
        .add('#enemy', { opacity: [0, 1], duration: 300 }, 5900)
        .add('#ally', { opacity: [0, 1], duration: 300 }, 6200)
        .call(() => setChip('Run 4 · rehearsed route'), 7000)
        .add(newD, { draw: ['0 0', '0 1'], duration: 1900 }, 7000)
        .add('#drone', { ...fresh, duration: 1900 }, 7000)
        .call(() => { setCap(CAP.deploy); setChip('Run 4 · on target', true); }, 8900)
        .add('#ontarget', { opacity: [0, 1], duration: 400 }, 8900)
        .add('#drone', { opacity: [1, 0], duration: 300 }, 9100)
        // next run: the jammer and the enemy have moved, so the route changes
        .call(() => { setCap(CAP.next); setChip('Run 5 · everything has moved'); }, 10500)
        .add('#jam', { translateX: [0, 70], translateY: [0, 74], duration: 900 }, 10500)
        .add('#enemy', { translateX: [0, -84], translateY: [0, 46], duration: 900 }, 10500)
        .add(['#lost', '#ontarget'], { opacity: [1, 0], duration: 300 }, 10500)
        .add('#route-new', { opacity: [1, 0.22], duration: 500 }, 10500)
        .add('#route-alt', { opacity: [0, 1], duration: 10 }, 11400)
        .add(altD, { draw: ['0 0', '0 1'], duration: 1600 }, 11400)
        .call(() => { setCap(null); setChip('Run 5 · new route, on target', true); }, 13600)
        .add({}, { duration: 10 }, 13600);
    };
    const playMap = () => {
      if (!mapTl) { mapTl = buildMap(); return; }
      A.utils.set(['#jam', '#enemy'], { translateX: 0, translateY: 0 }); A.utils.set('#route-new', { opacity: 1 }); A.utils.set('#route-alt', { opacity: 0 });
      mapTl.restart();
    };
    const rp = $('#replay'); if (rp) { rp.hidden = false; rp.addEventListener('click', playMap); }

    // instructor control: press and hold to cut the link (also J)
    const hold = $('#jam-hold');
    let holdTimer = 0, restore = 0;
    const cutLink = () => {
      const prev = [chip.textContent, chip.classList.contains('live')];
      clearTimeout(restore);
      setChip('Instructor cut the link');
      mapEl.classList.add('glitch'); setTimeout(() => mapEl.classList.remove('glitch'), 800);
      restore = setTimeout(() => { if (chip.textContent === 'Instructor cut the link') setChip(prev[0], prev[1]); }, 1800);
    };
    const holdEnd = () => { clearTimeout(holdTimer); holdTimer = 0; hold.classList.remove('holding'); };
    const holdStart = () => { if (holdTimer) return; hold.classList.add('holding'); holdTimer = setTimeout(() => { holdEnd(); cutLink(); }, 900); };
    hold.hidden = false;
    hold.addEventListener('pointerdown', holdStart);
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((ev) => hold.addEventListener(ev, holdEnd));
    hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); e.stopPropagation(); holdStart(); } });
    hold.addEventListener('keyup', holdEnd);
    plays.cutLink = cutLink;

    /* option 3: the ground regenerates, seats change hands, the boundary holds */
    let o3 = [];
    leaves.rehearsal = () => { o3.forEach(clearInterval); o3 = []; };
    const genNext = () => {
      const prev = GEN.cur, next = genVariant(++GEN.k);
      genGhost(prev.d); GEN.cur = next;
      mAnimate(0, 1, { duration: 0.8, ease: EASE, onUpdate: (t) => genSet({ jx: prev.jx + (next.jx - prev.jx) * t, jy: prev.jy + (next.jy - prev.jy) * t, jr: prev.jr + (next.jr - prev.jr) * t, enemies: next.enemies.map((e, i) => [prev.enemies[i][0] + (e[0] - prev.enemies[i][0]) * t, prev.enemies[i][1] + (e[1] - prev.enemies[i][1]) * t]), show: next.show }) });
      genChipsSet(next);
      mAnimate(genChips, { opacity: [0.3, 1] }, { duration: 0.5 });
      GEN.route.setAttribute('d', next.d); GEN.route.setAttribute('stroke-dashoffset', 1);
      mAnimate(1, 0, { duration: 1.3, delay: 0.6, ease: [0.4, 0, 0.2, 1], onUpdate: (v) => GEN.route.setAttribute('stroke-dashoffset', v.toFixed(3)) });
    };
    const seatsNext = () => { const mask = SEATS.map(() => (Math.random() < 0.6 ? 1 : 0)); if (!mask.includes(1)) mask[0] = 1; seatsSet(mask); };
    const vaultNext = () => {
      mAnimate(VAULT.inDot, { cx: [8, 92], opacity: [0, 1, 1, 0] }, { duration: 1.1, ease: 'linear' });
      mAnimate(VAULT.ok, { opacity: [0.25, 1, 0.25] }, { duration: 0.9, delay: 0.9 });
      mAnimate(VAULT.outDot, { cx: [176, 206, 176], opacity: [0, 1, 0] }, { duration: 1.1, delay: 1.5, ease: 'easeOut' });
      mAnimate(VAULT.no, { opacity: [0.35, 1, 0.35], scale: [1, 1.25, 1] }, { duration: 0.7, delay: 1.9 });
    };
    plays.rehearsal = () => { leaves.rehearsal(); playMap();
    };

    /* roles: three graphics play, lines arrive one by one */
    let runD = null, readyTimers = [];
    plays.better = () => {
      // operators: three attempts at the same route, trace and link quality together
      if (!runD) runD = { t: RUN.t.map((p) => A.svg.createDrawable(p)), l: RUN.l.map((p) => A.svg.createDrawable(p)), path: A.svg.createMotionPath('#run-t2') };
      runD.t.concat(runD.l).forEach((d) => A.utils.set(d, { draw: '0 0' }));
      RUN.ends.forEach((n) => (n.style.opacity = 0)); RUN.area.style.opacity = 0;
      A.utils.set(RUN.drone, { opacity: 0 });
      [0.7, 2.0, 3.3].forEach((t0, i) => {
        const dur = i === 2 ? 1700 : 950, ease = i === 2 ? 'inOut(2)' : 'in(1.5)';
        A.animate(runD.t[i], { draw: ['0 0', '0 1'], duration: dur, delay: t0 * 1000, ease });
        A.animate(runD.l[i], { draw: ['0 0', '0 1'], duration: dur, delay: t0 * 1000, ease });
        mAnimate(RUN.ends[i], { opacity: [0, 1] }, { duration: 0.25, delay: t0 + dur / 1000 });
      });
      A.animate(RUN.drone, { opacity: [0, 1], duration: 150, delay: 3300 });
      A.animate(RUN.drone, { ...runD.path, duration: 1700, delay: 3300, ease: 'inOut(2)' });
      mAnimate(RUN.area, { opacity: [0, 1] }, { duration: 0.6, delay: 4.6 });
      // commanders: the swarm
      SW.engaged = 0; swStatic(); SW.running = true; SW.last = performance.now(); requestAnimationFrame(swStep);
      // instructors: the roster fills in, operator by operator
      readyTimers.forEach(clearTimeout); readyTimers = [];
      readyCount.textContent = '0';
      let readyN = 0;
      OPS.forEach((o, i) => {
        const t0 = 0.8 + i * 0.6;
        o.g.style.opacity = 0; o.dot.style.opacity = 0; o.status.style.opacity = 0;
        o.ring.setAttribute('stroke-dasharray', `0 ${RING_C.toFixed(1)}`);
        const d = A.svg.createDrawable(o.line); A.utils.set(d, { draw: '0 0' });
        mAnimate(o.g, { opacity: [0, 1] }, { duration: 0.3, delay: t0 });
        A.animate(d, { draw: ['0 0', '0 1'], duration: 700, delay: t0 * 1000 + 150, ease: 'inOut(2)' });
        mAnimate(o.dot, { opacity: [0, 1] }, { duration: 0.2, delay: t0 + 0.85 });
        mAnimate(0, o.p, { duration: 0.8, delay: t0 + 0.3, ease: EASE, onUpdate: (v) => o.ring.setAttribute('stroke-dasharray', `${(RING_C * v).toFixed(1)} ${RING_C.toFixed(1)}`) });
        mAnimate(o.status, { opacity: [0, 1] }, { duration: 0.3, delay: t0 + 1.0 });
        if (o.p >= 1) readyTimers.push(setTimeout(() => { readyN++; readyCount.textContent = String(readyN); }, (t0 + 1.0) * 1000));
      });
      // bullets
      const lis = $$('.role li'); lis.forEach((n) => { n.style.opacity = 0; n.style.transform = 'translateX(-14px)'; });
      mAnimate(lis, { opacity: [0, 1], x: [-14, 0] }, { duration: 0.5, ease: EASE, delay: mStagger(0.12, { startDelay: 0.9 }) });
    };

    /* measure: the line, then the chart draws itself run by run */
    const sl = $('#statement-line');
    const words = sl.textContent.trim().split(/\s+/); sl.textContent = '';
    words.forEach((w, i) => { const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; sl.appendChild(sp); if (i < words.length - 1) sl.appendChild(document.createTextNode(' ')); });
    const ws = $$('.w', sl), card = $('#meas-card'), tip = $('#meas-tip'), tt = $('#meas-tt'), clip = $('#meas-clip-rect');
    const late = ['#meas-link', '#meas-hot', '#meas-cold', '#meas-gap'].map((q) => $(q));
    let measAnim = null, measTimers = [];
    const measRender = (p) => {
      const pt = measLine.getPointAtLength(measLen * p);
      measLine.style.strokeDasharray = measLen; measLine.style.strokeDashoffset = measLen * (1 - p);
      clip.setAttribute('width', pt.x.toFixed(1));
      tip.setAttribute('transform', `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
      let n = 0; measRuns.forEach((c, i) => { const lit = MP[i][0] <= pt.x + 0.5; c.classList.toggle('lit', lit); if (lit) n = i + 1; });
      setT(tt, 'Run ' + Math.max(1, n));
    };
    plays.measure = () => {
      if (measAnim) measAnim.stop();
      measTimers.forEach(clearTimeout); measTimers = [];
      ws.forEach((n) => { n.style.opacity = 0; n.style.transform = 'translateY(16px)'; });
      card.style.opacity = 0; late.forEach((n) => (n.style.opacity = 0));
      measRender(0); tip.setAttribute('opacity', 0);
      mAnimate(ws, { opacity: [0, 1], y: [16, 0] }, { duration: 0.55, ease: EASE, delay: mStagger(0.07, { startDelay: 0.4 }) });
      mAnimate(card, { opacity: [0, 1] }, { duration: 0.6, delay: 1.3 });
      measTimers.push(setTimeout(() => {
        tip.setAttribute('opacity', 1);
        measAnim = mAnimate(0, 1, { duration: 4.2, ease: [0.3, 0, 0.3, 1], onUpdate: measRender, onComplete: () => {
          measRender(1); tip.setAttribute('opacity', 0);
          mAnimate(late[0], { opacity: [0, 1] }, { duration: 0.4 });
          mAnimate(late[1], { opacity: [0, 1] }, { duration: 0.5, delay: 0.35 });
          mAnimate(late[2], { opacity: [0, 1] }, { duration: 0.5, delay: 1.0 });
          mAnimate(late[3], { opacity: [0, 1] }, { duration: 0.5, delay: 1.3 });
        } });
      }, 1900));
    };
  }

  /* ═══════════ DECK ═══════════ */
  const stage = $('#stage'), progress = $('#progress'), counter = $('#counter');
  const fit = () => { stage.style.transform = `scale(${Math.min(innerWidth / 1920, innerHeight / 1080)})`; };
  fit(); window.addEventListener('resize', fit);

  let cur = -1;
  const play = (i) => { if (!animOK) return; const s = slides[i]; enterGeneric(s); if (plays[s.id]) plays[s.id](); };
  const show = (i) => {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) { slides[cur].classList.remove('active'); if (leaves[slides[cur].id]) leaves[slides[cur].id](); }
    SW.running = false;
    cur = i;
    slides[i].classList.add('active');
    counter.textContent = `${i + 1} / ${slides.length}`;
    progress.style.transform = `scaleX(${(i + 1) / slides.length})`;
    try { history.replaceState(null, '', '#s' + (i + 1)); } catch (_) { /* not allowed here */ }
    play(i);
  };
  const fromHash = () => { const m = /^#s(\d+)$/.exec(location.hash); return m ? +m[1] - 1 : 0; };
  show(fromHash());
  window.addEventListener('hashchange', () => show(fromHash()));

  $('#next').addEventListener('click', () => show(cur + 1));
  $('#prev').addEventListener('click', () => show(cur - 1));
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onControl = e.target.closest && e.target.closest('button, a, input');
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey && !onControl)) { e.preventDefault(); show(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey && !onControl)) { e.preventDefault(); show(cur - 1); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(slides.length - 1);
    else if (k === 'r' || k === 'R') play(cur);
    else if ((k === 'j' || k === 'J') && slides[cur].id === 'rehearsal' && plays.cutLink) plays.cutLink();
    else if (k === 'f' || k === 'F') {
      try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); } catch (_) { /* not available here */ }
    }
  });
  // swipe on touch screens
  let tx = null;
  window.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend', (e) => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
})();
