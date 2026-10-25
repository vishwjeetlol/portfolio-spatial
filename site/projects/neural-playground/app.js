// Neural Network from Scratch in Pure TypeScript / JavaScript
// Zero external ML dependencies. Implements matrix ops, forward pass, backpropagation, and SGD.

class MLP {
  constructor(layerSizes) {
    this.layerSizes = layerSizes; // e.g. [2, 8, 8, 1]
    this.weights = [];
    this.biases = [];

    // Xavier initialization
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const fanIn = layerSizes[l];
      const fanOut = layerSizes[l + 1];
      const limit = Math.sqrt(6 / (fanIn + fanOut));

      const w = [];
      for (let i = 0; i < fanOut; i++) {
        const row = [];
        for (let j = 0; j < fanIn; j++) {
          row.push((Math.random() * 2 - 1) * limit);
        }
        w.push(row);
      }
      this.weights.push(w);
      this.biases.push(new Array(fanOut).fill(0));
    }
  }

  tanh(x) { return Math.tanh(x); }
  tanhDeriv(x) { const t = Math.tanh(x); return 1 - t * t; }
  sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
  sigmoidDeriv(x) { const s = this.sigmoid(x); return s * (1 - s); }

  forward(x) {
    const activations = [x];
    const zs = [];

    let current = x;
    for (let l = 0; l < this.weights.length; l++) {
      const W = this.weights[l];
      const b = this.biases[l];
      const isOutput = (l === this.weights.length - 1);

      const z = [];
      const nextA = [];
      for (let i = 0; i < W.length; i++) {
        let sum = b[i];
        for (let j = 0; j < current.length; j++) {
          sum += W[i][j] * current[j];
        }
        z.push(sum);
        nextA.push(isOutput ? this.sigmoid(sum) : this.tanh(sum));
      }
      zs.push(z);
      activations.push(nextA);
      current = nextA;
    }

    return { activations, zs, output: current[0] };
  }

  trainBatch(batch, lr) {
    let totalLoss = 0;
    const numLayers = this.weights.length;

    // Accumulators for gradients
    const gradW = this.weights.map(W => W.map(row => new Array(row.length).fill(0)));
    const gradB = this.biases.map(b => new Array(b.length).fill(0));

    for (const { x, y } of batch) {
      const { activations, zs, output } = this.forward(x);
      const loss = 0.5 * Math.pow(output - y, 2);
      totalLoss += loss;

      // Output error
      const dOutput = (output - y) * this.sigmoidDeriv(zs[numLayers - 1][0]);
      let deltas = [dOutput];

      // Backprop through layers
      for (let l = numLayers - 1; l >= 0; l--) {
        const A_prev = activations[l];
        const currentDeltas = deltas;

        for (let i = 0; i < this.weights[l].length; i++) {
          gradB[l][i] += currentDeltas[i];
          for (let j = 0; j < A_prev.length; j++) {
            gradW[l][i][j] += currentDeltas[i] * A_prev[j];
          }
        }

        if (l > 0) {
          const nextDeltas = [];
          const W = this.weights[l];
          const z_prev = zs[l - 1];

          for (let j = 0; j < A_prev.length; j++) {
            let sum = 0;
            for (let i = 0; i < W.length; i++) {
              sum += W[i][j] * currentDeltas[i];
            }
            nextDeltas.push(sum * this.tanhDeriv(z_prev[j]));
          }
          deltas = nextDeltas;
        }
      }
    }

    // Apply SGD updates
    const N = batch.length;
    for (let l = 0; l < numLayers; l++) {
      for (let i = 0; i < this.weights[l].length; i++) {
        this.biases[l][i] -= (lr * gradB[l][i]) / N;
        for (let j = 0; j < this.weights[l][i].length; j++) {
          this.weights[l][i][j] -= (lr * gradW[l][i][j]) / N;
        }
      }
    }

    return totalLoss / N;
  }
}

// Data Generators
function generateSpiral(n = 100) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const r = i / n;
    const t = 1.75 * i / n * 2 * Math.PI;
    data.push({ x: [r * Math.sin(t), r * Math.cos(t)], y: 0 });
    data.push({ x: [r * Math.sin(t + Math.PI), r * Math.cos(t + Math.PI)], y: 1 });
  }
  return data;
}

function generateCircles(n = 100) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const r1 = Math.random() * 0.4;
    const r2 = 0.55 + Math.random() * 0.4;
    data.push({ x: [r1 * Math.cos(angle), r1 * Math.sin(angle)], y: 0 });
    data.push({ x: [r2 * Math.cos(angle), r2 * Math.sin(angle)], y: 1 });
  }
  return data;
}

function generateXOR(n = 100) {
  const data = [];
  for (let i = 0; i < n; i++) {
    const x = (Math.random() * 2 - 1) * 0.9;
    const y = (Math.random() * 2 - 1) * 0.9;
    const label = (x * y > 0) ? 1 : 0;
    data.push({ x: [x, y], y: label });
  }
  return data;
}

// Application State
let dataset = generateSpiral(80);
let mlp = new MLP([2, 8, 8, 1]);
let isRunning = true;
let epoch = 0;
let lossHistory = [];
let lr = 0.08;

const decCanvas = document.getElementById('decision-canvas');
const decCtx = decCanvas.getContext('2d');
const lossCanvas = document.getElementById('loss-canvas');
const lossCtx = lossCanvas.getContext('2d');

const epochEl = document.getElementById('epoch-counter');
const lossEl = document.getElementById('loss-val');

function renderDecisionBoundary() {
  const w = decCanvas.width;
  const h = decCanvas.height;
  const imgData = decCtx.createImageData(w, h);
  const data = imgData.data;

  const step = 4; // grid sample
  for (let px = 0; px < w; px += step) {
    for (let py = 0; py < h; py += step) {
      const x = (px / w) * 2 - 1;
      const y = (py / h) * 2 - 1;
      const out = mlp.forward([x, y]).output;

      // Color interpolation: class 0 (#5ce1e6) to class 1 (#cf005e)
      const r = Math.round(92 * (1 - out) + 207 * out);
      const g = Math.round(225 * (1 - out) + 0 * out);
      const b = Math.round(230 * (1 - out) + 94 * out);

      for (let dx = 0; dx < step && px + dx < w; dx++) {
        for (let dy = 0; dy < step && py + dy < h; dy++) {
          const idx = ((py + dy) * w + (px + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 200;
        }
      }
    }
  }

  decCtx.putImageData(imgData, 0, 0);

  // Plot Data Points
  for (const pt of dataset) {
    const px = ((pt.x[0] + 1) / 2) * w;
    const py = ((pt.x[1] + 1) / 2) * h;
    decCtx.beginPath();
    decCtx.arc(px, py, 4, 0, Math.PI * 2);
    decCtx.fillStyle = pt.y === 1 ? '#ffffff' : '#090a0f';
    decCtx.strokeStyle = pt.y === 1 ? '#cf005e' : '#5ce1e6';
    decCtx.lineWidth = 2;
    decCtx.fill();
    decCtx.stroke();
  }
}

function renderLossCurve() {
  const w = lossCanvas.width;
  const h = lossCanvas.height;
  lossCtx.fillStyle = '#0d1017';
  lossCtx.fillRect(0, 0, w, h);

  if (lossHistory.length < 2) return;

  lossCtx.strokeStyle = '#5ce1e6';
  lossCtx.lineWidth = 2;
  lossCtx.beginPath();

  const maxPoints = 80;
  const recent = lossHistory.slice(-maxPoints);

  for (let i = 0; i < recent.length; i++) {
    const x = (i / (maxPoints - 1)) * w;
    const y = h - (Math.min(recent[i], 0.5) / 0.5) * (h - 20) - 10;
    if (i === 0) lossCtx.moveTo(x, y);
    else lossCtx.lineTo(x, y);
  }
  lossCtx.stroke();
}

function loop() {
  if (isRunning) {
    // Train 4 sub-epochs per frame for smooth convergence
    let currentLoss = 0;
    for (let i = 0; i < 4; i++) {
      currentLoss = mlp.trainBatch(dataset, lr);
      epoch++;
    }
    lossHistory.push(currentLoss);
    if (lossHistory.length > 100) lossHistory.shift();

    epochEl.textContent = epoch.toString();
    lossEl.textContent = currentLoss.toFixed(4);

    renderDecisionBoundary();
    renderLossCurve();
  }
  requestAnimationFrame(loop);
}

// UI Bindings
document.getElementById('dataset-select').addEventListener('change', (e) => {
  const type = e.target.value;
  if (type === 'spiral') dataset = generateSpiral(80);
  else if (type === 'circles') dataset = generateCircles(80);
  else if (type === 'xor') dataset = generateXOR(80);
  resetModel();
});

function resetModel() {
  const numLayers = parseInt(document.getElementById('layers-slider').value, 10);
  const width = parseInt(document.getElementById('width-slider').value, 10);
  const arch = [2];
  for (let i = 0; i < numLayers; i++) arch.push(width);
  arch.push(1);

  mlp = new MLP(arch);
  epoch = 0;
  lossHistory = [];
  renderDecisionBoundary();
  renderLossCurve();
}

document.getElementById('layers-slider').addEventListener('input', (e) => {
  document.getElementById('layers-val').textContent = e.target.value;
  resetModel();
});

document.getElementById('width-slider').addEventListener('input', (e) => {
  document.getElementById('width-val').textContent = e.target.value;
  resetModel();
});

document.getElementById('lr-slider').addEventListener('input', (e) => {
  lr = parseFloat(e.target.value);
  document.getElementById('lr-val').textContent = lr.toFixed(2);
});

document.getElementById('btn-toggle').addEventListener('click', (e) => {
  isRunning = !isRunning;
  e.target.textContent = isRunning ? 'Pause' : 'Train Live';
});

document.getElementById('btn-reset').addEventListener('click', resetModel);

// Initial start
renderDecisionBoundary();
requestAnimationFrame(loop);
