// Digit Atlas - 2D t-SNE & Client-side Inference
// Pure static browser runtime using build-time t-SNE embedding and trained weights

const CLUSTER_COLORS = [
  '#5ce1e6', // 0: Cyan
  '#bdff52', // 1: Lime
  '#cf005e', // 2: Magenta
  '#f4a228', // 3: Orange
  '#a855f7', // 4: Purple
  '#3b82f6', // 5: Blue
  '#ec4899', // 6: Pink
  '#eab308', // 7: Yellow
  '#10b981', // 8: Emerald
  '#64748b'  // 9: Slate
];

let digitsData = [];
let modelWeights = null;
let hoveredPoint = null;

const atlasCanvas = document.getElementById('atlas-canvas');
const atlasCtx = atlasCanvas.getContext('2d');
const sampleCanvas = document.getElementById('sample-canvas');
const sampleCtx = sampleCanvas.getContext('2d');
const drawPad = document.getElementById('draw-pad');
const drawCtx = drawPad.getContext('2d');

let isDrawing = false;

async function init() {
  resizeAtlas();
  initDrawPad();

  try {
    const [dRes, wRes, mRes] = await Promise.all([
      fetch('tsne_digits.json'),
      fetch('model_weights.json'),
      fetch('metrics.json')
    ]);

    digitsData = await dRes.json();
    modelWeights = await wRes.json();
    const metrics = await mRes.json();

    document.getElementById('acc-text').textContent = `${metrics.testAccuracy}% (Measured Test)`;
    renderLegend();
    renderConfusionMatrix(metrics.confusionMatrix);
    drawAtlas();
    bindAtlasEvents();
  } catch (err) {
    console.error('Failed to load digit atlas data:', err);
  }
}

function resizeAtlas() {
  const rect = atlasCanvas.getBoundingClientRect();
  atlasCanvas.width = rect.width;
  atlasCanvas.height = rect.height;
}

function renderLegend() {
  const legend = document.getElementById('legend-row');
  legend.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="color-swatch" style="background:${CLUSTER_COLORS[i]};"></span><span>Digit ${i}</span>`;
    legend.appendChild(item);
  }
}

function renderConfusionMatrix(matrix) {
  const container = document.getElementById('conf-matrix');
  container.innerHTML = '';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const val = matrix[r][c];
      const cell = document.createElement('div');
      cell.className = 'matrix-cell';
      const isDiag = (r === c);
      cell.style.background = isDiag ? 'rgba(92, 225, 230, 0.25)' : (val > 0 ? 'rgba(207, 0, 94, 0.4)' : '#0f131c');
      cell.style.color = isDiag ? '#bdff52' : (val > 0 ? '#ff7a9e' : '#495057');
      cell.textContent = val > 0 ? val : '';
      cell.title = `Actual: ${r}, Pred: ${c} (${val})`;
      container.appendChild(cell);
    }
  }
}

function drawAtlas() {
  const w = atlasCanvas.width;
  const h = atlasCanvas.height;
  atlasCtx.fillStyle = '#080a0e';
  atlasCtx.fillRect(0, 0, w, h);

  const pad = 40;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;

  // Draw points
  for (const pt of digitsData) {
    const px = pad + ((pt.x + 1) / 2) * plotW;
    const py = pad + ((pt.y + 1) / 2) * plotH;

    const isHovered = (hoveredPoint && hoveredPoint.id === pt.id);
    const radius = isHovered ? 6 : 2.5;

    atlasCtx.beginPath();
    atlasCtx.arc(px, py, radius, 0, Math.PI * 2);
    atlasCtx.fillStyle = CLUSTER_COLORS[pt.label];
    atlasCtx.fill();

    if (isHovered) {
      atlasCtx.strokeStyle = '#fff';
      atlasCtx.lineWidth = 2;
      atlasCtx.stroke();
    }
  }
}

function bindAtlasEvents() {
  atlasCanvas.addEventListener('mousemove', (e) => {
    const rect = atlasCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const w = atlasCanvas.width;
    const h = atlasCanvas.height;
    const pad = 40;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;

    let closest = null;
    let minDist = 16; // pixel threshold

    for (const pt of digitsData) {
      const px = pad + ((pt.x + 1) / 2) * plotW;
      const py = pad + ((pt.y + 1) / 2) * plotH;
      const dist = Math.hypot(mx - px, my - py);
      if (dist < minDist) {
        minDist = dist;
        closest = pt;
      }
    }

    if (closest !== hoveredPoint) {
      hoveredPoint = closest;
      drawAtlas();
      if (hoveredPoint) renderSample(hoveredPoint);
    }
  });

  window.addEventListener('resize', () => {
    resizeAtlas();
    drawAtlas();
  });

  document.getElementById('hood-toggle').addEventListener('click', () => {
    const c = document.getElementById('hood-content');
    c.hidden = !c.hidden;
  });
}

function renderSample(pt) {
  // pt.pixels is 64 ints 0..16
  const imgData = sampleCtx.createImageData(8, 8);
  for (let i = 0; i < 64; i++) {
    const val = Math.round((pt.pixels[i] / 16) * 255);
    const idx = i * 4;
    imgData.data[idx] = val;
    imgData.data[idx + 1] = val;
    imgData.data[idx + 2] = val;
    imgData.data[idx + 3] = 255;
  }
  sampleCtx.putImageData(imgData, 0, 0);

  document.getElementById('sample-meta').innerHTML = `
    <strong>Sample ID:</strong> #${pt.id}<br>
    <strong>Ground Truth:</strong> Class ${pt.label}<br>
    <strong>Manifold:</strong> (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})
  `;
}

// Draw-a-digit & Realtime Inference
function initDrawPad() {
  drawCtx.fillStyle = '#000';
  drawCtx.fillRect(0, 0, 160, 160);
  drawCtx.lineWidth = 14;
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.strokeStyle = '#fff';

  function getPos(e) {
    const rect = drawPad.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  }

  function start(e) {
    isDrawing = true;
    const pos = getPos(e);
    drawCtx.beginPath();
    drawCtx.moveTo(pos.x, pos.y);
  }

  function move(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
  }

  function end() {
    if (isDrawing) {
      isDrawing = false;
      predictDrawnDigit();
    }
  }

  drawPad.addEventListener('mousedown', start);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);

  drawPad.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);

  document.getElementById('clear-btn').addEventListener('click', () => {
    drawCtx.fillStyle = '#000';
    drawCtx.fillRect(0, 0, 160, 160);
    document.getElementById('pred-result').textContent = 'Prediction: —';
  });

  document.getElementById('classify-btn').addEventListener('click', predictDrawnDigit);
}

function predictDrawnDigit() {
  if (!modelWeights) return;

  // Downsample 160x160 to 8x8 grid
  const temp = document.createElement('canvas');
  temp.width = 8;
  temp.height = 8;
  const tCtx = temp.getContext('2d');
  tCtx.drawImage(drawPad, 0, 0, 8, 8);

  const imgData = tCtx.getImageData(0, 0, 8, 8).data;
  const features = new Float32Array(64);

  // Map 0..255 brightness to 0..16 digit feature scale
  for (let i = 0; i < 64; i++) {
    const r = imgData[i * 4];
    features[i] = (r / 255) * 16.0;
  }

  // Linear inference: logits_c = sum(W[c][j] * x[j]) + b[c]
  let bestClass = 0;
  let maxLogit = -Infinity;

  for (let c = 0; c < 10; c++) {
    let logit = modelWeights.intercept[c];
    const w = modelWeights.coef[c];
    for (let j = 0; j < 64; j++) {
      logit += w[j] * features[j];
    }
    if (logit > maxLogit) {
      maxLogit = logit;
      bestClass = c;
    }
  }

  const resultEl = document.getElementById('pred-result');
  resultEl.textContent = `Predicted Digit: ${bestClass}`;
}

window.addEventListener('DOMContentLoaded', init);
