/* ===== script.js - ProcessViz Website ===== */

// ==================== CANVAS BACKGROUND ====================
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 60; i++) {
    particles.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, r: Math.random()*2+1 });
  }
  function draw() {
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(139,92,246,.25)'; ctx.fill();
    });
    particles.forEach((a,i) => {
      for(let j=i+1;j<particles.length;j++){
        const b=particles[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(139,92,246,${.08*(1-dist/120)})`;ctx.stroke();}
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ==================== NAVBAR ====================
(function initNavbar() {
  const nav = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
  if (hamburger && links) {
    hamburger.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => links.classList.remove('open')));
  }
  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
    navLinks.forEach(l => { l.classList.toggle('active', l.dataset.section === current); });
  });
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ==================== SCROLL ANIMATIONS ====================
(function initAOS() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }});
  }, { threshold: 0.1 });
  document.querySelectorAll('.about-card,.algo-card,.step-card,.glass-card').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
    observer.observe(el);
  });
})();

// ==================== SIMULATOR STATE ====================
let processes = [];
let nextPid = 1;
let animTimer = null;

// ==================== DOM REFS ====================
const inpPid = document.getElementById('inp-pid');
const inpArrival = document.getElementById('inp-arrival');
const inpBurst = document.getElementById('inp-burst');
const inpPriority = document.getElementById('inp-priority');
const inpQuantum = document.getElementById('inp-quantum');
const algoSelect = document.getElementById('algo-select');
const btnAdd = document.getElementById('btn-add');
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const chipsDiv = document.getElementById('process-chips');
const tableBody = document.getElementById('table-body');
const logBox = document.getElementById('log-box');
const ganttSection = document.getElementById('gantt-section');
const ganttChart = document.getElementById('gantt-chart');
const ganttTimeline = document.getElementById('gantt-timeline');
const statsSection = document.getElementById('stats-section');
const statsSummary = document.getElementById('stats-summary');
const statsBody = document.getElementById('stats-body');
const quantumRow = document.getElementById('quantum-row');
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const stateBoxes = {
  NEW: document.getElementById('box-new'),
  READY: document.getElementById('box-ready'),
  RUNNING: document.getElementById('box-running'),
  WAITING: document.getElementById('box-waiting'),
  TERMINATED: document.getElementById('box-terminated'),
};

// ==================== ADD PROCESS ====================
btnAdd.addEventListener('click', addProcess);
function addProcess() {
  const pid = inpPid.value ? parseInt(inpPid.value) : nextPid;
  const arrival = parseInt(inpArrival.value) || 0;
  const burst = parseInt(inpBurst.value) || 1;
  const priority = parseInt(inpPriority.value) || 1;
  if (processes.find(p => p.pid === pid)) { alert('PID ' + pid + ' already exists!'); return; }
  processes.push({ pid, arrival, burst, priority });
  nextPid = Math.max(nextPid, pid) + 1;
  renderChips(); renderTable();
  inpPid.value = ''; inpArrival.value = '0'; inpBurst.value = ''; inpPriority.value = '1'; inpBurst.focus();
}
function removeProcess(pid) { processes = processes.filter(p => p.pid !== pid); renderChips(); renderTable(); }
function renderChips() {
  chipsDiv.innerHTML = '';
  processes.forEach(p => {
    const chip = document.createElement('span'); chip.className = 'chip';
    chip.innerHTML = 'P' + p.pid + ' (A:' + p.arrival + ' B:' + p.burst + ' Pr:' + p.priority + ') <span class="remove-chip" onclick="removeProcess(' + p.pid + ')">x</span>';
    chipsDiv.appendChild(chip);
  });
}

// ==================== TABLE ====================
function renderTable() {
  tableBody.innerHTML = '';
  processes.forEach(p => {
    const r = document.createElement('tr');
    r.innerHTML = '<td>' + p.pid + '</td><td>' + p.arrival + '</td><td>' + p.burst + '</td><td>' + p.priority + '</td><td><span class="badge badge-new" id="badge-' + p.pid + '">NEW</span></td>';
    tableBody.appendChild(r);
  });
}

// ==================== LOG ====================
function addLog(txt, hl) {
  const d = document.createElement('div'); d.className = 'log-entry' + (hl ? ' highlight' : ''); d.textContent = txt;
  logBox.appendChild(d); logBox.scrollTop = logBox.scrollHeight;
}
function updateBadge(pid, state) {
  const b = document.getElementById('badge-' + pid);
  if (b) { b.textContent = state; b.className = 'badge badge-' + state.toLowerCase(); }
}
function highlightState(s) {
  Object.values(stateBoxes).forEach(b => b.classList.remove('active'));
  if (stateBoxes[s]) stateBoxes[s].classList.add('active');
}

// ==================== ALGORITHMS ====================
function algoFCFS(procs) {
  const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
  const events = [], gantt = [], results = []; let t = 0;
  sorted.forEach(p => {
    if (t < p.arrival) { gantt.push({ pid: -1, start: t, end: p.arrival }); t = p.arrival; }
    events.push({ pid: p.pid, state: 'NEW', time: p.arrival });
    events.push({ pid: p.pid, state: 'READY', time: p.arrival });
    events.push({ pid: p.pid, state: 'RUNNING', time: t });
    gantt.push({ pid: p.pid, start: t, end: t + p.burst }); t += p.burst;
    events.push({ pid: p.pid, state: 'TERMINATED', time: t });
    results.push({ pid: p.pid, arrival: p.arrival, burst: p.burst, completion: t, waiting: t - p.arrival - p.burst, turnaround: t - p.arrival });
  });
  return { events, gantt, results };
}

function algoSJF(procs) {
  const rem = procs.map(p => ({ ...p }));
  const events = [], gantt = [], results = [], done = []; let t = 0;
  while (done.length < procs.length) {
    const avail = rem.filter(p => p.arrival <= t && !done.includes(p.pid));
    if (!avail.length) { const na = Math.min(...rem.filter(p => !done.includes(p.pid)).map(p => p.arrival)); gantt.push({ pid: -1, start: t, end: na }); t = na; continue; }
    avail.sort((a, b) => a.burst - b.burst); const p = avail[0];
    events.push({ pid: p.pid, state: 'NEW', time: p.arrival }); events.push({ pid: p.pid, state: 'READY', time: p.arrival });
    events.push({ pid: p.pid, state: 'RUNNING', time: t }); gantt.push({ pid: p.pid, start: t, end: t + p.burst }); t += p.burst;
    events.push({ pid: p.pid, state: 'TERMINATED', time: t });
    results.push({ pid: p.pid, arrival: p.arrival, burst: p.burst, completion: t, waiting: t - p.arrival - p.burst, turnaround: t - p.arrival }); done.push(p.pid);
  }
  return { events, gantt, results };
}

function algoSRTF(procs) {
  const n = procs.length, rem = procs.map(p => ({ ...p, remaining: p.burst }));
  const events = [], gantt = [], results = [], completed = [];
  let t = 0, lastPid = -1, blockStart = 0; const arrived = new Set();
  const maxTime = Math.max(...procs.map(p => p.arrival)) + procs.reduce((s, p) => s + p.burst, 0) + 10;
  while (completed.length < n && t < maxTime) {
    rem.forEach(p => { if (p.arrival <= t && !arrived.has(p.pid)) { arrived.add(p.pid); events.push({ pid: p.pid, state: 'NEW', time: p.arrival }); events.push({ pid: p.pid, state: 'READY', time: p.arrival }); }});
    const avail = rem.filter(p => p.arrival <= t && p.remaining > 0);
    if (!avail.length) { if (lastPid !== -1) gantt.push({ pid: lastPid, start: blockStart, end: t }); lastPid = -1; blockStart = t; t++; continue; }
    avail.sort((a, b) => a.remaining - b.remaining); const p = avail[0];
    if (p.pid !== lastPid) {
      if (lastPid !== -1) { gantt.push({ pid: lastPid, start: blockStart, end: t }); events.push({ pid: lastPid, state: 'WAITING', time: t }); events.push({ pid: lastPid, state: 'READY', time: t }); }
      else if (t > blockStart) gantt.push({ pid: -1, start: blockStart, end: t });
      blockStart = t; lastPid = p.pid; events.push({ pid: p.pid, state: 'RUNNING', time: t });
    }
    p.remaining--; t++;
    if (p.remaining === 0) { gantt.push({ pid: p.pid, start: blockStart, end: t }); events.push({ pid: p.pid, state: 'TERMINATED', time: t }); results.push({ pid: p.pid, arrival: p.arrival, burst: p.burst, completion: t, waiting: t - p.arrival - p.burst, turnaround: t - p.arrival }); completed.push(p.pid); lastPid = -1; blockStart = t; }
  }
  return { events, gantt, results };
}

function algoRR(procs, quantum) {
  const q = [...procs].sort((a, b) => a.arrival - b.arrival).map(p => ({ ...p, remaining: p.burst }));
  const events = [], gantt = [], results = []; let t = 0, idx = 0; const rq = [];
  q.forEach(p => events.push({ pid: p.pid, state: 'NEW', time: p.arrival }));
  while (idx < q.length && q[idx].arrival <= t) { rq.push(q[idx]); events.push({ pid: q[idx].pid, state: 'READY', time: t }); idx++; }
  while (rq.length > 0) {
    const p = rq.shift(); const run = Math.min(quantum, p.remaining);
    events.push({ pid: p.pid, state: 'RUNNING', time: t }); gantt.push({ pid: p.pid, start: t, end: t + run }); t += run; p.remaining -= run;
    while (idx < q.length && q[idx].arrival <= t) { rq.push(q[idx]); events.push({ pid: q[idx].pid, state: 'READY', time: q[idx].arrival }); idx++; }
    if (p.remaining > 0) { events.push({ pid: p.pid, state: 'WAITING', time: t }); events.push({ pid: p.pid, state: 'READY', time: t }); rq.push(p); }
    else { events.push({ pid: p.pid, state: 'TERMINATED', time: t }); results.push({ pid: p.pid, arrival: p.arrival, burst: p.burst, completion: t, waiting: t - p.arrival - p.burst, turnaround: t - p.arrival }); }
  }
  return { events, gantt, results };
}

function algoPriority(procs) {
  const rem = procs.map(p => ({ ...p }));
  const events = [], gantt = [], results = [], done = []; let t = 0;
  while (done.length < procs.length) {
    const avail = rem.filter(p => p.arrival <= t && !done.includes(p.pid));
    if (!avail.length) { const na = Math.min(...rem.filter(p => !done.includes(p.pid)).map(p => p.arrival)); gantt.push({ pid: -1, start: t, end: na }); t = na; continue; }
    avail.sort((a, b) => a.priority - b.priority); const p = avail[0];
    events.push({ pid: p.pid, state: 'NEW', time: p.arrival }); events.push({ pid: p.pid, state: 'READY', time: p.arrival });
    events.push({ pid: p.pid, state: 'RUNNING', time: t }); gantt.push({ pid: p.pid, start: t, end: t + p.burst }); t += p.burst;
    events.push({ pid: p.pid, state: 'TERMINATED', time: t });
    results.push({ pid: p.pid, arrival: p.arrival, burst: p.burst, completion: t, waiting: t - p.arrival - p.burst, turnaround: t - p.arrival }); done.push(p.pid);
  }
  return { events, gantt, results };
}

// ==================== GANTT ====================
function renderGantt(ganttData) {
  ganttChart.innerHTML = ''; ganttTimeline.innerHTML = ''; ganttSection.style.display = 'block';
  if (!ganttData.length) return;
  const maxH = 70;
  ganttData.forEach((block, i) => {
    const div = document.createElement('div'); const dur = block.end - block.start;
    div.style.width = Math.max(48, dur * 52) + 'px'; div.style.height = maxH + 'px'; div.style.animationDelay = (i * .08) + 's';
    if (block.pid === -1) { div.className = 'gantt-block gantt-idle'; div.innerHTML = '<span class="g-pid">IDLE</span>'; }
    else { div.className = 'gantt-block gantt-c' + ((block.pid - 1) % 8); div.innerHTML = '<span class="g-pid">P' + block.pid + '</span>'; }
    ganttChart.appendChild(div);
  });
  ganttData.forEach((block, i) => {
    const span = document.createElement('span'); span.style.width = Math.max(48, (block.end - block.start) * 52) + 'px'; span.style.display = 'inline-block';
    span.textContent = block.start + (i === ganttData.length - 1 ? '-' + block.end : '');
    ganttTimeline.appendChild(span);
  });
}

// ==================== STATS ====================
function showStats(results) {
  statsSection.style.display = 'block'; statsBody.innerHTML = '';
  let totalWT = 0, totalTAT = 0;
  results.forEach(r => {
    totalWT += r.waiting; totalTAT += r.turnaround;
    const row = document.createElement('tr');
    row.innerHTML = '<td>' + r.pid + '</td><td>' + r.arrival + '</td><td>' + r.burst + '</td><td>' + r.completion + '</td><td>' + r.waiting + '</td><td>' + r.turnaround + '</td>';
    statsBody.appendChild(row);
  });
  statsSummary.innerHTML = '';
  [{ label: 'Avg Waiting Time', value: (totalWT / results.length).toFixed(2) },
   { label: 'Avg Turnaround Time', value: (totalTAT / results.length).toFixed(2) },
   { label: 'Total Processes', value: results.length },
   { label: 'Throughput', value: (results.length / results[results.length - 1].completion).toFixed(2) + '/u' }
  ].forEach(c => {
    const div = document.createElement('div'); div.className = 'stat-card';
    div.innerHTML = '<div class="stat-value">' + c.value + '</div><div class="stat-label">' + c.label + '</div>';
    statsSummary.appendChild(div);
  });
}

// ==================== ANIMATION ====================
function animateEvents(events, callback) {
  let i = 0; const delay = parseInt(speedSlider.value);
  animTimer = setInterval(function() {
    if (i >= events.length) { clearInterval(animTimer); animTimer = null; addLog('Done!', true); btnStart.disabled = false; if (callback) callback(); return; }
    const e = events[i]; addLog('PID ' + e.pid + ' -> ' + e.state + '  (t=' + e.time + ')');
    highlightState(e.state); updateBadge(e.pid, e.state); i++;
  }, delay);
}

// ==================== EVENTS ====================
algoSelect.addEventListener('change', function() { quantumRow.style.display = this.value === 'rr' ? 'flex' : 'none'; });
quantumRow.style.display = 'none';
speedSlider.addEventListener('input', function() { speedVal.textContent = this.value + 'ms'; });

btnStart.addEventListener('click', function() {
  if (processes.length === 0) { alert('Add at least one process!'); return; }
  btnStart.disabled = true; resetVisuals();
  const algo = algoSelect.value, quantum = parseInt(inpQuantum.value) || 2; let result;
  switch (algo) {
    case 'fcfs': result = algoFCFS(processes); addLog('FCFS Scheduling', true); break;
    case 'sjf': result = algoSJF(processes); addLog('SJF (Non-Preemptive)', true); break;
    case 'srtf': result = algoSRTF(processes); addLog('SRTF (Preemptive)', true); break;
    case 'rr': result = algoRR(processes, quantum); addLog('Round Robin (Q=' + quantum + ')', true); break;
    case 'priority': result = algoPriority(processes); addLog('Priority Scheduling', true); break;
  }
  renderGantt(result.gantt); animateEvents(result.events, function() { showStats(result.results); });
});

btnReset.addEventListener('click', function() {
  if (animTimer) { clearInterval(animTimer); animTimer = null; }
  processes = []; nextPid = 1; renderChips(); renderTable(); resetVisuals(); addLog('Reset complete.', false); btnStart.disabled = false;
});

function resetVisuals() {
  logBox.innerHTML = '<div class="log-entry" style="color:#4b5563;">Ready...</div>';
  Object.values(stateBoxes).forEach(b => b.classList.remove('active'));
  ganttSection.style.display = 'none'; ganttChart.innerHTML = ''; ganttTimeline.innerHTML = '';
  statsSection.style.display = 'none'; statsSummary.innerHTML = ''; statsBody.innerHTML = '';
  renderTable();
}

// ==================== SAMPLE DATA ====================
(function() {
  processes = [
    { pid: 1, arrival: 0, burst: 3, priority: 2 },
    { pid: 2, arrival: 1, burst: 5, priority: 1 },
    { pid: 3, arrival: 2, burst: 2, priority: 4 },
    { pid: 4, arrival: 3, burst: 4, priority: 3 },
  ];
  nextPid = 5; renderChips(); renderTable();
})();

// ==================== THEME ====================
(function() {
  const btn = document.getElementById('theme-toggle');
  if (localStorage.getItem('plv-theme') === 'light') { document.body.classList.add('light'); btn.textContent = '\u2600\uFE0F'; }
  btn.addEventListener('click', function() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    btn.textContent = isLight ? '\u2600\uFE0F' : '\uD83C\uDF19';
    localStorage.setItem('plv-theme', isLight ? 'light' : 'dark');
  });
})();
