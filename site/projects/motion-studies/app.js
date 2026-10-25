// Motion Studies - 3 Kinetic Code Studies

const canvas = document.getElementById('motion-canvas');
const ctx = canvas.getContext('2d');
const captionEl = document.getElementById('hud-caption');

let activeStudy = 0;
let time = 0;
let particles = [];
let targetWords = ["SPATIAL", "OPTICS", "KINETIC"];
let currentWordIdx = 0;
let wordChangeTimer = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 130;
}

// 1. Kinetic Typography
function renderStudy0() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, w, h);

  const text = "KINETIC OPTICS";
  const numRows = 7;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let r = 0; r < numRows; r++) {
    const rowY = (h / (numRows + 1)) * (r + 1);
    const rowPhase = r * 0.45;
    const waveY = Math.sin(time * 2 + rowPhase) * 18;

    ctx.font = `${Math.round(36 + Math.sin(time * 3 + r) * 12)}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = r === 3 ? '#5ce1e6' : (r % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(207,0,94,0.7)');

    // Letter spacing expansion
    const spacing = 48 + Math.cos(time * 2 + rowPhase) * 14;
    const totalW = text.length * spacing;
    const startX = (w - totalW) / 2 + spacing / 2;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWave = Math.sin(time * 4 + i * 0.4 + rowPhase) * 15;
      ctx.fillText(char, startX + i * spacing, rowY + waveY + charWave);
    }
  }
}

// 2. Particle-Text Morph
function initParticles() {
  particles = [];
  const count = 1200;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: canvas.width / 2,
      targetY: canvas.height / 2,
      vx: 0,
      vy: 0,
      color: Math.random() > 0.5 ? '#5ce1e6' : '#bdff52'
    });
  }
  updateParticleTargets(targetWords[0]);
}

function updateParticleTargets(word) {
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const oCtx = offscreen.getContext('2d');

  oCtx.fillStyle = '#fff';
  oCtx.font = `900 ${Math.min(canvas.width / 6, 120)}px -apple-system, sans-serif`;
  oCtx.textAlign = 'center';
  oCtx.textBaseline = 'middle';
  oCtx.fillText(word, canvas.width / 2, canvas.height / 2);

  const imgData = oCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  const validPixels = [];

  const step = 8;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      if (imgData[idx + 3] > 128) {
        validPixels.push({ x, y });
      }
    }
  }

  for (let i = 0; i < particles.length; i++) {
    if (validPixels.length > 0) {
      const target = validPixels[i % validPixels.length];
      particles[i].targetX = target.x + (Math.random() * 4 - 2);
      particles[i].targetY = target.y + (Math.random() * 4 - 2);
    }
  }
}

function renderStudy1() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = 'rgba(7, 8, 12, 0.25)';
  ctx.fillRect(0, 0, w, h);

  wordChangeTimer += 0.016;
  if (wordChangeTimer > 2.5) {
    wordChangeTimer = 0;
    currentWordIdx = (currentWordIdx + 1) % targetWords.length;
    updateParticleTargets(targetWords[currentWordIdx]);
  }

  for (const p of particles) {
    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    p.vx = p.vx * 0.88 + dx * 0.05;
    p.vy = p.vy * 0.88 + dy * 0.05;
    p.x += p.vx;
    p.y += p.vy;

    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2.5, 2.5);
  }
}

// 3. 3D Origami Prism Unfold Sequence
function renderStudy2() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const unfold = (Math.sin(time * 1.5) + 1) / 2; // 0 to 1

  const vertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ];

  const edges = [
    [0,1], [1,2], [2,3], [3,0],
    [4,5], [5,6], [6,7], [7,4],
    [0,4], [1,5], [2,6], [3,7]
  ];

  const scale = 140 * (1 + unfold * 0.5);
  const rotX = time * 0.8;
  const rotY = time * 1.1;
  const rotZ = time * 0.4;

  const proj = vertices.map(v => {
    let [x, y, z] = v;

    // Apply unfold extrusion
    x *= (1 + unfold * Math.sin(y * 2));
    y *= (1 + unfold * Math.cos(x * 2));

    // Rotate 3D
    let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
    let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);

    let x2 = x * Math.cos(rotY) + z1 * Math.sin(rotY);
    let z2 = -x * Math.sin(rotY) + z1 * Math.cos(rotY);

    let x3 = x2 * Math.cos(rotZ) - y1 * Math.sin(rotZ);
    let y3 = x2 * Math.sin(rotZ) + y1 * Math.cos(rotZ);

    const fov = 400;
    const distance = 4;
    const pZ = z2 + distance;
    return {
      px: cx + (x3 * scale) / pZ,
      py: cy + (y3 * scale) / pZ,
      z: pZ
    };
  });

  ctx.lineWidth = 2.5;
  edges.forEach(([i, j], edgeIdx) => {
    ctx.strokeStyle = edgeIdx % 2 === 0 ? '#5ce1e6' : '#cf005e';
    ctx.beginPath();
    ctx.moveTo(proj[i].px, proj[i].py);
    ctx.lineTo(proj[j].px, proj[j].py);
    ctx.stroke();
  });

  proj.forEach(p => {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.px, p.py, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function animate() {
  time += 0.016;
  if (activeStudy === 0) renderStudy0();
  else if (activeStudy === 1) renderStudy1();
  else if (activeStudy === 2) renderStudy2();
  requestAnimationFrame(animate);
}

// UI Bindings
const tabs = document.querySelectorAll('.study-tab');
const captions = [
  "<strong>Study 1: Kinetic Wave Typography</strong><br>Continuous sinusoidal character baseline modulation & harmonic scale displacement.",
  "<strong>Study 2: Particle-Text Morph</strong><br>1,200 floating points calculating spring vectors towards changing word target matrices.",
  "<strong>Study 3: 3D Origami Prism Unfold</strong><br>3D topological wireframe unfolding on 3 axes with real-time perspective division."
];

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeStudy = parseInt(tab.getAttribute('data-study'), 10);
    captionEl.innerHTML = captions[activeStudy];
    if (activeStudy === 1 && particles.length === 0) initParticles();
  });
});

window.addEventListener('resize', resize);
window.addEventListener('DOMContentLoaded', () => {
  resize();
  initParticles();
  animate();
});
