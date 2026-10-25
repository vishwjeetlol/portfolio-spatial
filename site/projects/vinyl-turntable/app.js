// Analog Deck MK-II // Interactive 3D Vinyl Turntable & Scratch Engine
// Procedural Three.js 3D mechanical model, real-time friction physics, and Web Audio DSP

let scene, camera, renderer;
let chassisMesh, platterMesh, vinylMesh, tonearmGroup, tonearmPivot, needleMesh;
let isMotorRunning = false;
let isNeedleDown = false;
let targetRPM = 33.333;
let pitchPercent = 0.0;
let currentRPM = 0.0;
let targetAngularVelocity = 0.0;
let platterAngle = 0.0;
let platterAngularVelocity = 0.0;

// Scratching state
let isScratching = false;
let lastScratchAngle = 0.0;
let scratchAngularVelocity = 0.0;
let scratchSmoothRate = 1.0;

// Tonearm tracking
let tonearmAngle = 0.0;
const TONEARM_REST_ANGLE = -0.42;
const TONEARM_LEAD_IN = 0.12;
const TONEARM_RUN_OUT = 0.44;
let tonearmTargetAngle = TONEARM_REST_ANGLE;
let tonearmHeight = 0.6; // 0.6 = raised, 0.0 = on record
let tonearmTargetHeight = 0.6;

// Camera views
const cameraViews = {
  dj: { pos: new THREE.Vector3(0, 32, 8), target: new THREE.Vector3(0, 0, 0) },
  iso: { pos: new THREE.Vector3(24, 22, 24), target: new THREE.Vector3(0, 0, 0) },
  macro: { pos: new THREE.Vector3(9, 7, 7), target: new THREE.Vector3(3.5, 2.0, 1.0) }
};
let currentCamPos = new THREE.Vector3().copy(cameraViews.dj.pos);
let currentCamTarget = new THREE.Vector3().copy(cameraViews.dj.target);
let targetCamPos = new THREE.Vector3().copy(cameraViews.dj.pos);
let targetCamTarget = new THREE.Vector3().copy(cameraViews.dj.target);

// Audio Engine
let audioCtx = null;
let masterGain = null;
let crackleGain = null;
let beatInterval = null;
let currentStep = 0;
let isAudioInitialized = false;

// Telemetry & FPS
let fpsFrames = 0;
let fpsLastTime = performance.now();
const fpsElement = document.getElementById('fps-val');
const platterTelemetry = document.getElementById('platter-telemetry');
const rpmTelemetry = document.getElementById('rpm-telemetry');
const pitchTelemetry = document.getElementById('pitch-telemetry');

// Procedural Vinyl Grooves Canvas Texture
function createVinylTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Black vinyl base
  ctx.fillStyle = '#0d0d0f';
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro-groove rings
  ctx.lineWidth = 1;
  for (let r = 180; r < 500; r += 1.5) {
    const alpha = 0.04 + 0.07 * Math.sin(r * 0.8) * Math.cos(r * 0.3);
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.01, alpha)})`;
    ctx.beginPath();
    ctx.arc(512, 512, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Lead-in groove outer track
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(512, 512, 495, 0, Math.PI * 2);
  ctx.stroke();

  // Run-out groove inner ring
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.arc(512, 512, 185, 0, Math.PI * 2);
  ctx.stroke();

  // Center paper label
  ctx.beginPath();
  ctx.arc(512, 512, 175, 0, Math.PI * 2);
  ctx.fillStyle = '#d43f2a';
  ctx.fill();

  // Label inner concentric ring
  ctx.beginPath();
  ctx.arc(512, 512, 160, 0, Math.PI * 2);
  ctx.fillStyle = '#f0e6d2';
  ctx.fill();

  // Typography on center label
  ctx.fillStyle = '#111';
  ctx.font = 'bold 24px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ANALOG MK-II', 512, 490);
  ctx.font = '16px monospace';
  ctx.fillText('STEREO 33⅓ RPM', 512, 520);
  ctx.fillText('SIDE A', 512, 545);

  // Spindle center hole
  ctx.beginPath();
  ctx.arc(512, 512, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// Procedural Brushed Platter Rim Texture
function createPlatterRimTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#888b90';
  ctx.fillRect(0, 0, 512, 64);

  // Strobe dots
  ctx.fillStyle = '#222';
  for (let x = 0; x < 512; x += 16) {
    ctx.fillRect(x + 2, 8, 8, 18);
    ctx.fillRect(x + 4, 34, 6, 18);
  }
  return new THREE.CanvasTexture(canvas);
}

// --- 3D Scene Assembly ---
function buildTurntable() {
  const deckGroup = new THREE.Group();

  // 1. Chassis Plinth
  const plinthGeo = new THREE.BoxGeometry(26, 2.8, 22);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.35,
    metalness: 0.2
  });
  chassisMesh = new THREE.Mesh(plinthGeo, plinthMat);
  chassisMesh.position.y = -1.4;
  deckGroup.add(chassisMesh);

  // Chassis isolation feet
  const footGeo = new THREE.CylinderGeometry(1.4, 1.2, 0.8, 24);
  const footMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.8 });
  const feetOffsets = [
    [-11, -3.1, -9], [11, -3.1, -9],
    [-11, -3.1, 9], [11, -3.1, 9]
  ];
  feetOffsets.forEach(pos => {
    const foot = new THREE.Mesh(footGeo, footMat);
    foot.position.set(pos[0], pos[1], pos[2]);
    deckGroup.add(foot);
  });

  // 2. Aluminum Platter
  const platterBaseGeo = new THREE.CylinderGeometry(9.6, 9.6, 1.0, 64);
  const platterMat = new THREE.MeshStandardMaterial({
    color: 0xbbbfc6,
    metalness: 0.85,
    roughness: 0.25,
    map: createPlatterRimTexture()
  });
  platterMesh = new THREE.Mesh(platterBaseGeo, platterMat);
  platterMesh.position.set(-3.2, 0.5, 0);
  deckGroup.add(platterMesh);

  // 3. Vinyl Record Disc
  const vinylGeo = new THREE.CylinderGeometry(9.2, 9.2, 0.12, 64);
  const vinylTex = createVinylTexture();
  const vinylMat = new THREE.MeshStandardMaterial({
    map: vinylTex,
    roughness: 0.3,
    metalness: 0.15
  });
  vinylMesh = new THREE.Mesh(vinylGeo, vinylMat);
  vinylMesh.position.set(0, 0.55, 0);
  platterMesh.add(vinylMesh);

  // Center brass spindle
  const spindleGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16);
  const spindleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 });
  const spindle = new THREE.Mesh(spindleGeo, spindleMat);
  spindle.position.set(0, 0.8, 0);
  platterMesh.add(spindle);

  // 4. Tonearm Assembly
  tonearmGroup = new THREE.Group();
  tonearmGroup.position.set(8.5, 0.4, -6.5);

  // Tonearm base gimbal tower
  const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.8, 32);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x33363d, metalness: 0.8, roughness: 0.3 });
  const armBase = new THREE.Mesh(baseGeo, baseMat);
  tonearmGroup.add(armBase);

  // Tonearm horizontal pivot
  tonearmPivot = new THREE.Group();
  tonearmPivot.position.set(0, 1.2, 0);
  tonearmPivot.rotation.y = TONEARM_REST_ANGLE;
  tonearmGroup.add(tonearmPivot);

  // Counterweight
  const weightGeo = new THREE.CylinderGeometry(1.1, 1.1, 1.4, 24);
  const weightMat = new THREE.MeshStandardMaterial({ color: 0x111215, metalness: 0.7, roughness: 0.4 });
  const weight = new THREE.Mesh(weightGeo, weightMat);
  weight.rotation.x = Math.PI / 2;
  weight.position.set(0, 0, -2.2);
  tonearmPivot.add(weight);

  // S-shaped curved tonearm tube
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, 0.3, 3.5),
    new THREE.Vector3(-0.6, 0.2, 8.5),
    new THREE.Vector3(0.1, 0, 13.5)
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.2, 12, false);
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0xdddfec, metalness: 0.9, roughness: 0.15 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tonearmPivot.add(tube);

  // Cartridge & Headshell
  const headshellGeo = new THREE.BoxGeometry(0.9, 0.6, 1.6);
  const headshellMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.5 });
  const headshell = new THREE.Mesh(headshellGeo, headshellMat);
  headshell.position.set(0.1, -0.2, 14.2);
  tonearmPivot.add(headshell);

  // Needle Stylus Tip
  const stylusGeo = new THREE.ConeGeometry(0.15, 0.4, 8);
  const stylusMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  needleMesh = new THREE.Mesh(stylusGeo, stylusMat);
  needleMesh.position.set(0.1, -0.6, 14.5);
  needleMesh.rotation.x = Math.PI;
  tonearmPivot.add(needleMesh);

  // Cue Arm Rest Post
  const restGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.6, 12);
  const rest = new THREE.Mesh(restGeo, baseMat);
  rest.position.set(-2.2, 0.8, 1.5);
  tonearmGroup.add(rest);

  deckGroup.add(tonearmGroup);

  // 5. Controls on Chassis
  // Pitch fader track
  const pitchTrackGeo = new THREE.BoxGeometry(1.2, 0.1, 7.5);
  const pitchTrackMat = new THREE.MeshStandardMaterial({ color: 0x090a0c, roughness: 0.8 });
  const pitchTrack = new THREE.Mesh(pitchTrackGeo, pitchTrackMat);
  pitchTrack.position.set(10.5, 0.05, 3.5);
  deckGroup.add(pitchTrack);

  // Pitch fader slider knob
  const knobGeo = new THREE.BoxGeometry(1.4, 0.5, 0.8);
  const knobMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.2 });
  const pitchKnob = new THREE.Mesh(knobGeo, knobMat);
  pitchKnob.position.set(10.5, 0.35, 3.5);
  deckGroup.add(pitchKnob);

  // Start/Stop round metallic button
  const btnGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 24);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0xff9900, metalness: 0.5, roughness: 0.3 });
  const startBtn = new THREE.Mesh(btnGeo, btnMat);
  startBtn.position.set(-10.5, 0.15, 8.5);
  deckGroup.add(startBtn);

  // Target strobe light tower
  const lightTowerGeo = new THREE.CylinderGeometry(0.6, 0.7, 2.5, 16);
  const lightTowerMat = new THREE.MeshStandardMaterial({ color: 0x222, metalness: 0.8 });
  const lightTower = new THREE.Mesh(lightTowerGeo, lightTowerMat);
  lightTower.position.set(-11.5, 1.2, -8.5);
  deckGroup.add(lightTower);

  // Subtle warm amber target lamp
  const targetLight = new THREE.PointLight(0xffaa44, 1.5, 14);
  targetLight.position.set(-11.5, 2.4, -8.0);
  deckGroup.add(targetLight);

  scene.add(deckGroup);
}

// --- Procedural Audio DSP Scratch Synth ---
function initAudio() {
  if (isAudioInitialized) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);

  // Vinyl surface groove crackle generator
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Sparse dust pops + pink noise
    const isPop = Math.random() < 0.0008;
    output[i] = isPop ? (Math.random() * 0.8 - 0.4) : (Math.random() * 0.04 - 0.02);
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const crackleFilter = audioCtx.createBiquadFilter();
  crackleFilter.type = 'bandpass';
  crackleFilter.frequency.setValueAtTime(1400, audioCtx.currentTime);
  crackleFilter.Q.setValueAtTime(1.5, audioCtx.currentTime);

  crackleGain = audioCtx.createGain();
  crackleGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

  whiteNoise.connect(crackleFilter);
  crackleFilter.connect(crackleGain);
  crackleGain.connect(audioCtx.destination);
  whiteNoise.start();

  startSequencer();
  isAudioInitialized = true;
}

function playDrumKick(time, pitchMultiplier) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  const startFreq = 140 * pitchMultiplier;
  const endFreq = 38 * pitchMultiplier;

  osc.frequency.setValueAtTime(startFreq, time);
  osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), time + 0.14);

  gain.gain.setValueAtTime(0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(time);
  osc.stop(time + 0.28);
}

function playDrumSnare(time, pitchMultiplier) {
  if (!audioCtx) return;
  // White noise burst + tone
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();
  osc.frequency.setValueAtTime(190 * pitchMultiplier, time);
  oscGain.gain.setValueAtTime(0.3, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(time);
  osc.stop(time + 0.12);

  // Snare snap
  const noiseOsc = audioCtx.createOscillator();
  const noiseGain = audioCtx.createGain();
  noiseOsc.type = 'sawtooth';
  noiseOsc.frequency.setValueAtTime(320 * pitchMultiplier, time);
  noiseGain.gain.setValueAtTime(0.25, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
  noiseOsc.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseOsc.start(time);
  noiseOsc.stop(time + 0.18);
}

function playHiHat(time, pitchMultiplier) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.setValueAtTime(8000 * pitchMultiplier, time);

  filter.type = 'highpass';
  filter.frequency.setValueAtTime(6500, time);

  gain.gain.setValueAtTime(0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  osc.start(time);
  osc.stop(time + 0.05);
}

function playRhodesChord(notes, time, duration, pitchMultiplier) {
  if (!audioCtx) return;
  notes.forEach(note => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note * pitchMultiplier, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 * pitchMultiplier, time);

    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(time);
    osc.stop(time + duration);
  });
}

// Procedural Lo-fi Boom Bap Sequencer (80 BPM)
function startSequencer() {
  const tempo = 80;
  const stepTime = (60 / tempo) / 4; // 16th note in seconds

  const chords = [
    [146.83, 174.61, 220.00, 261.63], // Dm7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 233.08, 293.66, 349.23], // Gm7
    [220.00, 277.18, 329.63, 440.00]  // A7
  ];

  beatInterval = setInterval(() => {
    if (!audioCtx || audioCtx.state !== 'running') return;
    if (!isNeedleDown || (!isMotorRunning && !isScratching && currentRPM < 2)) {
      masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
      crackleGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.05);
      return;
    }

    const pitchRatio = Math.max(0.1, Math.min(3.0, scratchSmoothRate));
    masterGain.gain.setTargetAtTime(0.35, audioCtx.currentTime, 0.05);
    crackleGain.gain.setTargetAtTime(0.05 * pitchRatio, audioCtx.currentTime, 0.05);

    const now = audioCtx.currentTime;

    // Drum beat pattern: Kick on 0, 10; Snare on 4, 12; Hi-hat on every even step
    if (currentStep === 0 || currentStep === 10) playDrumKick(now, pitchRatio);
    if (currentStep === 4 || currentStep === 12) playDrumSnare(now, pitchRatio);
    if (currentStep % 2 === 0) playHiHat(now, pitchRatio);

    // Chords on steps 0, 8
    if (currentStep === 0 || currentStep === 8) {
      const chordIndex = Math.floor(currentStep / 8) % chords.length;
      playRhodesChord(chords[chordIndex], now, stepTime * 7, pitchRatio);
    }

    currentStep = (currentStep + 1) % 16;
  }, 187.5); // 16th note at 80 BPM
}

// --- Scratch Interaction Raycasting ---
function setupScratchEvents(canvas) {
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2();

  function getPlatterIntersection(e) {
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseVec, camera);
    const intersects = raycaster.intersectObject(vinylMesh, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  function getAngleFromHit(hit) {
    const localHit = platterMesh.worldToLocal(hit.point.clone());
    return Math.atan2(localHit.z, localHit.x);
  }

  canvas.addEventListener('pointerdown', (e) => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    const hit = getPlatterIntersection(e);
    if (hit) {
      isScratching = true;
      lastScratchAngle = getAngleFromHit(hit);
      scratchAngularVelocity = 0.0;
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isScratching) return;
    const hit = getPlatterIntersection(e);
    if (hit) {
      const currentAngle = getAngleFromHit(hit);
      let deltaAngle = currentAngle - lastScratchAngle;

      // Handle wraparound [-PI, PI]
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

      platterMesh.rotation.y += deltaAngle;
      scratchAngularVelocity = deltaAngle * 60.0; // instantaneous angular speed
      lastScratchAngle = currentAngle;
    }
  });

  window.addEventListener('pointerup', () => {
    if (isScratching) {
      isScratching = false;
      scratchAngularVelocity = 0.0;
    }
  });

  // Start / Stop Motor Button
  const startBtn = document.getElementById('start-stop-btn');
  startBtn.addEventListener('click', () => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    isMotorRunning = !isMotorRunning;
    if (isMotorRunning) {
      startBtn.textContent = 'Stop Platter';
      startBtn.classList.remove('primary');
      platterTelemetry.textContent = 'SPINNING';
      platterTelemetry.style.color = '#00ffcc';
    } else {
      startBtn.textContent = 'Start Platter';
      startBtn.classList.add('primary');
      platterTelemetry.textContent = 'STOPPED';
      platterTelemetry.style.color = 'var(--text-dim)';
    }
  });

  // Drop / Lift Needle Cue Button
  const cueBtn = document.getElementById('cue-btn');
  cueBtn.addEventListener('click', () => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    isNeedleDown = !isNeedleDown;
    if (isNeedleDown) {
      cueBtn.textContent = 'Lift Needle';
      cueBtn.classList.add('active');
      tonearmTargetAngle = TONEARM_LEAD_IN;
      tonearmTargetHeight = 0.0;
    } else {
      cueBtn.textContent = 'Drop Needle';
      cueBtn.classList.remove('active');
      tonearmTargetAngle = TONEARM_REST_ANGLE;
      tonearmTargetHeight = 0.6;
    }
  });

  // RPM Toggle
  document.querySelectorAll('.rpm-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rpm-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const rpm = parseFloat(btn.getAttribute('data-rpm'));
      targetRPM = rpm === 45 ? 45.0 : 33.333;
      rpmTelemetry.textContent = rpm === 45 ? '45.0 RPM' : '33.3 RPM';
    });
  });

  // Pitch Fader Slider
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchVal = document.getElementById('pitch-val');
  pitchSlider.addEventListener('input', (e) => {
    pitchPercent = parseFloat(e.target.value);
    pitchVal.textContent = (pitchPercent >= 0 ? '+' : '') + pitchPercent.toFixed(1) + '%';
    pitchTelemetry.textContent = (pitchPercent >= 0 ? '+' : '') + pitchPercent.toFixed(1) + '%';
  });

  // Camera Presets
  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const camKey = btn.getAttribute('data-cam');
      const preset = cameraViews[camKey] || cameraViews.dj;
      targetCamPos.copy(preset.pos);
      targetCamTarget.copy(preset.target);
    });
  });

  // Chassis Finish
  document.querySelectorAll('.chassis-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chassis-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const finish = btn.getAttribute('data-chassis');
      if (finish === 'walnut') {
        chassisMesh.material.color.setHex(0x5c3a21);
        chassisMesh.material.roughness = 0.6;
      } else if (finish === 'silver') {
        chassisMesh.material.color.setHex(0xd0d4dc);
        chassisMesh.material.roughness = 0.25;
        chassisMesh.material.metalness = 0.8;
      } else {
        chassisMesh.material.color.setHex(0x181a1f);
        chassisMesh.material.roughness = 0.35;
        chassisMesh.material.metalness = 0.2;
      }
    });
  });

  window.addEventListener('resize', onWindowResize);
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

// --- Setup & Animation Loop ---
function init() {
  const canvas = document.getElementById('stage-canvas');
  const width = canvas.parentElement.clientWidth || 960;
  const height = canvas.parentElement.clientHeight || 560;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111317);

  camera = new THREE.PerspectiveCamera(40, width / height, 1, 1000);
  camera.position.copy(cameraViews.dj.pos);
  camera.lookAt(cameraViews.dj.target);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
  mainLight.position.set(15, 30, 20);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x7799ff, 1.2);
  rimLight.position.set(-20, 15, -15);
  scene.add(rimLight);

  buildTurntable();
  setupScratchEvents(canvas);

  animate();
}

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // FPS Counter
  fpsFrames++;
  if (now - fpsLastTime >= 1000) {
    if (fpsElement) fpsElement.textContent = Math.round((fpsFrames * 1000) / (now - fpsLastTime)) + ' FPS';
    fpsFrames = 0;
    fpsLastTime = now;
  }

  // Motor & Platter Physics
  const nominalRPM = targetRPM * (1.0 + pitchPercent / 100.0);
  targetAngularVelocity = (nominalRPM * (2.0 * Math.PI)) / 60.0;

  if (isScratching) {
    // Under direct finger scrub: angular velocity driven by pointer drag
    platterAngularVelocity = scratchAngularVelocity;
    currentRPM = Math.abs((scratchAngularVelocity * 60.0) / (2.0 * Math.PI));
    scratchSmoothRate = THREE.MathUtils.lerp(scratchSmoothRate, Math.abs(scratchAngularVelocity / targetAngularVelocity), 0.2);
  } else if (isMotorRunning) {
    // Torque acceleration to nominal RPM
    platterAngularVelocity = THREE.MathUtils.lerp(platterAngularVelocity, targetAngularVelocity, dt * 3.5);
    platterMesh.rotation.y += platterAngularVelocity * dt;
    currentRPM = (platterAngularVelocity * 60.0) / (2.0 * Math.PI);
    scratchSmoothRate = THREE.MathUtils.lerp(scratchSmoothRate, currentRPM / nominalRPM, 0.15);
  } else {
    // Natural spindle friction spin-down
    platterAngularVelocity = THREE.MathUtils.lerp(platterAngularVelocity, 0.0, dt * 1.8);
    platterMesh.rotation.y += platterAngularVelocity * dt;
    currentRPM = (platterAngularVelocity * 60.0) / (2.0 * Math.PI);
    scratchSmoothRate = THREE.MathUtils.lerp(scratchSmoothRate, currentRPM / nominalRPM, 0.15);
  }

  // Tonearm tracking
  if (isNeedleDown && isMotorRunning) {
    // Slowly glide across the record tracks toward center
    tonearmTargetAngle = Math.min(TONEARM_RUN_OUT, tonearmTargetAngle + dt * 0.002);
  }

  tonearmAngle = THREE.MathUtils.lerp(tonearmPivot.rotation.y, tonearmTargetAngle, dt * 4.0);
  tonearmPivot.rotation.y = tonearmAngle;

  tonearmHeight = THREE.MathUtils.lerp(tonearmHeight, tonearmTargetHeight, dt * 5.0);
  tonearmPivot.position.y = 1.2 + tonearmHeight * 0.4;
  tonearmPivot.rotation.x = -tonearmHeight * 0.04;

  // Camera Interpolation
  currentCamPos.lerp(targetCamPos, dt * 4.0);
  currentCamTarget.lerp(targetCamTarget, dt * 4.0);
  camera.position.copy(currentCamPos);
  camera.lookAt(currentCamTarget);

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
