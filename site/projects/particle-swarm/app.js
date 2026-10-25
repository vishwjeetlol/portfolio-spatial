// Bioluminescent Swarm // 100,000 GPU Particle Attractors & Curl Noise
// High-performance WebGL shader computation with Web Audio reactivity

const PARTICLE_COUNT = 90000;

let scene, camera, renderer, particleGeometry, particleMaterial, particleSystem;
let currentTopology = 'lorenz';
let morphProgress = 1.0;
let morphStartTime = 0;
const MORPH_DURATION = 1.6;

let mousePos = new THREE.Vector3(9999, 9999, 9999);
let mouseScreen = new THREE.Vector2(-9999, -9999);
let isMouseDown = false;
let rotX = 0, rotY = 0;
let targetRotX = 0, targetRotY = 0;
let lastMouseX = 0, lastMouseY = 0;

let audioCtx = null;
let audioAnalyser = null;
let audioDataArray = null;
let isAudioActive = false;
let bassIntensity = 0.0;
let highIntensity = 0.0;

let fpsFrames = 0;
let fpsLastTime = performance.now();
const fpsElement = document.getElementById('fps-val');

// Topologies cache
const topologies = {};

// Palettes
const palettes = {
  cyan: {
    primary: new THREE.Color(0x00ffcc),
    secondary: new THREE.Color(0x0066ff),
    accent: new THREE.Color(0xffffff)
  },
  aurora: {
    primary: new THREE.Color(0x7000ff),
    secondary: new THREE.Color(0x00ff88),
    accent: new THREE.Color(0xff00bb)
  },
  solar: {
    primary: new THREE.Color(0xffaa00),
    secondary: new THREE.Color(0xff2200),
    accent: new THREE.Color(0xffff88)
  }
};
let currentPalette = 'cyan';

// --- Particle Shader Definition ---
const vertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uTurbulence;
  uniform float uPointSize;
  uniform float uAudioBass;
  uniform vec3 uMouseWorld;
  uniform float uMouseActive;

  attribute vec3 aTarget;
  attribute vec3 aColor;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vAlpha;

  // Analytic Divergence-Free 3D Curl Vector Field
  vec3 curlNoise(vec3 p) {
    float x = sin(p.y * 1.8 + uTime * 0.4) * cos(p.z * 1.4);
    float y = sin(p.z * 1.8 + uTime * 0.4) * cos(p.x * 1.4);
    float z = sin(p.x * 1.8 + uTime * 0.4) * cos(p.y * 1.4);
    return vec3(x, y, z);
  }

  void main() {
    // Interpolate between initial position and target topology
    vec3 basePos = mix(position, aTarget, uMorph);

    // Apply 3D curl field displacement
    vec3 curl = curlNoise(basePos * 0.12 + vec3(aSeed * 2.0));
    float turb = uTurbulence * (1.0 + uAudioBass * 1.4);
    vec3 animatedPos = basePos + curl * (turb * 3.5);

    // Interactive Mouse Repulsion & Swirl
    if (uMouseActive > 0.5) {
      float distToMouse = distance(animatedPos, uMouseWorld);
      if (distToMouse < 22.0) {
        float force = (1.0 - distToMouse / 22.0);
        vec3 dir = normalize(animatedPos - uMouseWorld);
        // Swirl tangential force
        vec3 tangent = cross(dir, vec3(0.0, 1.0, 0.0));
        animatedPos += dir * (force * 14.0) + tangent * (force * 8.0);
      }
    }

    // Pass color & calculate dynamic brightness
    vColor = aColor * (1.0 + uAudioBass * 0.8);
    vAlpha = 0.55 + 0.45 * sin(uTime * 2.0 + aSeed * 6.28);

    vec4 mvPosition = modelViewMatrix * vec4(animatedPos, 1.0);
    gl_PointSize = uPointSize * (280.0 / -mvPosition.z) * (1.0 + uAudioBass * 1.2);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Radial soft point circular mask
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Glowing gaussian falloff
    float glow = exp(-dist * 5.5);
    vec3 finalColor = vColor * (glow * 1.8);

    gl_FragColor = vec4(finalColor, glow * vAlpha);
  }
`;

// --- Topology Generators ---

function generateLorenz() {
  const points = new Float32Array(PARTICLE_COUNT * 3);
  let x = 0.1, y = 0.0, z = 0.0;
  const dt = 0.007;
  const sigma = 10.0;
  const rho = 28.0;
  const beta = 8.0 / 3.0;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Lorenz differential step
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx;
    y += dy;
    z += dz;

    // Occasionally perturb to explore alternate trajectories
    if (i % 250 === 0) {
      x += (Math.random() - 0.5) * 4.0;
      y += (Math.random() - 0.5) * 4.0;
      z += (Math.random() - 0.5) * 4.0;
    }

    // Scale and center in view
    points[i * 3 + 0] = x * 1.25;
    points[i * 3 + 1] = (z - 25.0) * 1.25;
    points[i * 3 + 2] = y * 1.25;
  }
  return points;
}

function generateHelix() {
  const points = new Float32Array(PARTICLE_COUNT * 3);
  const turns = 14;
  const height = 65;
  const radius = 14;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isStrandA = (i % 3 === 0);
    const isStrandB = (i % 3 === 1);
    const isRung = (i % 3 === 2);

    const t = Math.random();
    const y = (t - 0.5) * height;
    const theta = t * turns * Math.PI * 2;

    if (isStrandA) {
      const spread = (Math.random() - 0.5) * 1.8;
      points[i * 3 + 0] = Math.cos(theta) * radius + spread;
      points[i * 3 + 1] = y + (Math.random() - 0.5) * 1.2;
      points[i * 3 + 2] = Math.sin(theta) * radius + spread;
    } else if (isStrandB) {
      const spread = (Math.random() - 0.5) * 1.8;
      points[i * 3 + 0] = Math.cos(theta + Math.PI) * radius + spread;
      points[i * 3 + 1] = y + (Math.random() - 0.5) * 1.2;
      points[i * 3 + 2] = Math.sin(theta + Math.PI) * radius + spread;
    } else {
      // Connecting base pair rungs
      const rungAlpha = Math.random();
      const pAx = Math.cos(theta) * radius;
      const pAz = Math.sin(theta) * radius;
      const pBx = Math.cos(theta + Math.PI) * radius;
      const pBz = Math.sin(theta + Math.PI) * radius;

      points[i * 3 + 0] = THREE.MathUtils.lerp(pAx, pBx, rungAlpha) + (Math.random() - 0.5) * 0.8;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = THREE.MathUtils.lerp(pAz, pBz, rungAlpha) + (Math.random() - 0.5) * 0.8;
    }
  }
  return points;
}

function generateGalaxy() {
  const points = new Float32Array(PARTICLE_COUNT * 3);
  const arms = 4;
  const maxRadius = 38;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Radius with higher density near core
    const r = Math.pow(Math.random(), 2.2) * maxRadius;
    const armIndex = i % arms;
    const armAngle = (armIndex / arms) * Math.PI * 2;
    // Logarithmic spiral angle + jitter
    const spiralAngle = armAngle + Math.log(r + 1.0) * 3.5;
    const scatter = (Math.random() - 0.5) * (0.8 + r * 0.12);

    const x = Math.cos(spiralAngle + scatter) * r;
    const z = Math.sin(spiralAngle + scatter) * r;
    // Disk thickness decreases with radius
    const diskHeight = (1.0 - r / maxRadius) * 5.0 + 0.6;
    const y = (Math.random() - 0.5) * diskHeight * (Math.random() - 0.5) * 2.0;

    points[i * 3 + 0] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

function generateNeural() {
  const points = new Float32Array(PARTICLE_COUNT * 3);
  const radius = 22;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Fibonacci sphere distribution with dendritic spikes
    const phi = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    // Shell clustering
    const isCore = Math.random() < 0.35;
    const r = isCore ? (Math.random() * radius * 0.6) : (radius + Math.sin(phi * 8.0) * Math.cos(theta * 8.0) * 4.0);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    points[i * 3 + 0] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

function updateColors(paletteName) {
  const pal = palettes[paletteName] || palettes.cyan;
  const colors = particleGeometry.attributes.aColor.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ratio = Math.random();
    let col = new THREE.Color();
    if (ratio < 0.6) {
      col.copy(pal.primary).lerp(pal.secondary, Math.random());
    } else if (ratio < 0.9) {
      col.copy(pal.secondary).lerp(pal.accent, Math.random() * 0.5);
    } else {
      col.copy(pal.accent);
    }

    colors[i * 3 + 0] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  particleGeometry.attributes.aColor.needsUpdate = true;
}

function switchTopology(newTopo) {
  if (newTopo === currentTopology && morphProgress >= 1.0) return;

  const currentPositions = particleGeometry.attributes.position.array;
  const targetPositions = particleGeometry.attributes.aTarget.array;

  // Latch current interpolated state into position buffer
  const posA = particleGeometry.attributes.position.array;
  const posB = particleGeometry.attributes.aTarget.array;
  const p = Math.min(morphProgress, 1.0);

  for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
    currentPositions[i] = THREE.MathUtils.lerp(posA[i], posB[i], p);
  }

  // Load new target topology
  const newTarget = topologies[newTopo] || topologies.lorenz;
  for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
    targetPositions[i] = newTarget[i];
  }

  particleGeometry.attributes.position.needsUpdate = true;
  particleGeometry.attributes.aTarget.needsUpdate = true;

  currentTopology = newTopo;
  morphProgress = 0.0;
  morphStartTime = performance.now();

  const topoTelemetry = document.getElementById('topology-telemetry');
  if (topoTelemetry) {
    const titles = {
      lorenz: 'Lorenz Attractor',
      helix: 'DNA Double Helix',
      galaxy: 'Galaxy Vortex',
      neural: 'Neural Sphere'
    };
    topoTelemetry.textContent = titles[newTopo] || newTopo;
  }
}

// --- Audio Synthesizer Engine ---
function toggleAudio() {
  const btn = document.getElementById('audio-synth-btn');
  if (isAudioActive) {
    if (audioCtx) audioCtx.suspend();
    isAudioActive = false;
    btn.textContent = 'Audio Reactive: OFF';
    btn.classList.remove('active');
    return;
  }

  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    audioAnalyser = audioCtx.createAnalyser();
    audioAnalyser.fftSize = 64;
    audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount);

    // Procedural Ambient Cosmic Pad Synths
    const chordFrequencies = [65.41, 98.00, 130.81, 164.81, 196.00]; // C minor 7 ambient spread
    chordFrequencies.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350 + idx * 80, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioAnalyser);
      gain.connect(audioCtx.destination);
      osc.start();

      // Slow organic filter modulation
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(120, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    });

    // Rhythmic Arpeggiated Pulse Ping
    setInterval(() => {
      if (!isAudioActive || !audioCtx || audioCtx.state !== 'running') return;
      const arpFreqs = [261.63, 311.13, 392.00, 466.16, 523.25, 622.25];
      const noteFreq = arpFreqs[Math.floor(Math.random() * arpFreqs.length)];

      const arpOsc = audioCtx.createOscillator();
      const arpGain = audioCtx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(noteFreq, audioCtx.currentTime);

      arpGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

      arpOsc.connect(arpGain);
      arpGain.connect(audioAnalyser);
      arpGain.connect(audioCtx.destination);

      arpOsc.start();
      arpOsc.stop(audioCtx.currentTime + 0.8);
    }, 450);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isAudioActive = true;
  btn.textContent = 'Audio Reactive: ON';
  btn.classList.add('active');
}

// --- Setup & Initialization ---
function init() {
  const canvas = document.getElementById('stage-canvas');
  const width = canvas.parentElement.clientWidth || 960;
  const height = canvas.parentElement.clientHeight || 560;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.008);

  camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
  camera.position.set(0, 8, 75);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Compute all topology geometries once
  topologies.lorenz = generateLorenz();
  topologies.helix = generateHelix();
  topologies.galaxy = generateGalaxy();
  topologies.neural = generateNeural();

  // Create BufferGeometry
  particleGeometry = new THREE.BufferGeometry();
  const initialPos = new Float32Array(topologies.lorenz);
  const targetPos = new Float32Array(topologies.lorenz);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    seeds[i] = Math.random();
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(initialPos, 3));
  particleGeometry.setAttribute('aTarget', new THREE.BufferAttribute(targetPos, 3));
  particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  updateColors('cyan');

  // Shader Material
  particleMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uMorph: { value: 1.0 },
      uTurbulence: { value: 0.6 },
      uPointSize: { value: 2.2 },
      uAudioBass: { value: 0.0 },
      uMouseWorld: { value: new THREE.Vector3(9999, 9999, 9999) },
      uMouseActive: { value: 0.0 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Setup Event Listeners
  setupEvents(canvas);

  // Animation Loop
  animate();
}

function setupEvents(canvas) {
  // Mouse / Pointer Interaction for Orbit and Particle Swirling
  canvas.addEventListener('pointerdown', (e) => {
    isMouseDown = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    updatePointerCoords(e, canvas);
  });

  window.addEventListener('pointermove', (e) => {
    if (isMouseDown) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      targetRotY += deltaX * 0.005;
      targetRotX += deltaY * 0.005;
      targetRotX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetRotX));
    }
    updatePointerCoords(e, canvas);
  });

  window.addEventListener('pointerup', () => {
    isMouseDown = false;
  });

  canvas.addEventListener('pointerleave', () => {
    particleMaterial.uniforms.uMouseActive.value = 0.0;
  });

  // Topology buttons
  document.querySelectorAll('.topology-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.topology-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchTopology(btn.getAttribute('data-topo'));
    });
  });

  // Palette buttons
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPalette = btn.getAttribute('data-palette');
      updateColors(currentPalette);
    });
  });

  // Sliders
  const turbSlider = document.getElementById('turbulence-slider');
  const turbVal = document.getElementById('turbulence-val');
  turbSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    turbVal.textContent = val.toFixed(2);
    particleMaterial.uniforms.uTurbulence.value = val;
  });

  const sizeSlider = document.getElementById('size-slider');
  const sizeVal = document.getElementById('size-val');
  sizeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    sizeVal.textContent = val.toFixed(1);
    particleMaterial.uniforms.uPointSize.value = val;
  });

  // Audio Toggle
  document.getElementById('audio-synth-btn').addEventListener('click', toggleAudio);

  // Vortex / Gravity Pulse Button
  document.getElementById('vortex-btn').addEventListener('click', () => {
    // Pulse turbulence up briefly
    const curTurb = particleMaterial.uniforms.uTurbulence.value;
    particleMaterial.uniforms.uTurbulence.value = curTurb + 1.8;
    setTimeout(() => {
      particleMaterial.uniforms.uTurbulence.value = curTurb;
    }, 450);
  });

  // Resize Handler
  window.addEventListener('resize', onWindowResize);
}

function updatePointerCoords(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  if (x >= -1 && x <= 1 && y >= -1 && y <= 1) {
    mouseScreen.set(x, y);
    // Unproject to 3D world plane at z=0
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    particleMaterial.uniforms.uMouseWorld.value.copy(pos);
    particleMaterial.uniforms.uMouseActive.value = 1.0;
  } else {
    particleMaterial.uniforms.uMouseActive.value = 0.0;
  }
}

function onWindowResize() {
  const canvas = document.getElementById('stage-canvas');
  if (!canvas || !renderer || !camera) return;
  const width = canvas.parentElement.clientWidth || 960;
  const height = canvas.parentElement.clientHeight || 560;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

// --- Animation Loop ---
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  // FPS tracking
  fpsFrames++;
  if (now - fpsLastTime >= 1000) {
    if (fpsElement) fpsElement.textContent = Math.round((fpsFrames * 1000) / (now - fpsLastTime)) + ' FPS';
    fpsFrames = 0;
    fpsLastTime = now;
  }

  // Update morph progression
  if (morphProgress < 1.0) {
    const elapsed = (now - morphStartTime) / 1000;
    morphProgress = Math.min(elapsed / MORPH_DURATION, 1.0);
    // Smooth cubic easeInOut
    const eased = morphProgress < 0.5
      ? 4 * morphProgress * morphProgress * morphProgress
      : 1 - Math.pow(-2 * morphProgress + 2, 3) / 2;
    particleMaterial.uniforms.uMorph.value = eased;
  }

  // Audio analysis
  if (isAudioActive && audioAnalyser && audioDataArray) {
    audioAnalyser.getByteFrequencyData(audioDataArray);
    // Bass: low bins 0-4
    let bassSum = 0;
    for (let i = 0; i < 4; i++) bassSum += audioDataArray[i];
    bassIntensity = (bassSum / (4 * 255.0));

    // High: bins 16-30
    let highSum = 0;
    for (let i = 16; i < 30; i++) highSum += audioDataArray[i];
    highIntensity = (highSum / (14 * 255.0));

    particleMaterial.uniforms.uAudioBass.value = bassIntensity;
  } else {
    // Subtle ambient breathing when audio is inactive
    particleMaterial.uniforms.uAudioBass.value = 0.08 * (Math.sin(now * 0.003) * 0.5 + 0.5);
  }

  // Update time
  particleMaterial.uniforms.uTime.value = now * 0.001;

  // Smooth camera orbit
  rotX += (targetRotX - rotX) * 0.08;
  rotY += (targetRotY - rotY) * 0.08;

  // Gentle auto-rotation
  if (!isMouseDown) {
    targetRotY += 0.0015;
  }

  if (particleSystem) {
    particleSystem.rotation.y = rotY;
    particleSystem.rotation.x = rotX;
  }

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
