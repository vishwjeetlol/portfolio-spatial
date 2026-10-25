// Liquid Chrome - Real-Time GPU Fluid Simulation & Refraction
// Custom Three.js GLSL displacement & Fresnel chromatic dispersion

let scene, camera, renderer, fluidMesh, material;
let mouse = new THREE.Vector2(0.5, 0.5);
let targetMouse = new THREE.Vector2(0.5, 0.5);
let clock = new THREE.Clock();
let pulseStrength = 0;

const palettes = [
  new THREE.Color(0xdce2ec), // Mercury Silver
  new THREE.Color(0x5ce1e6), // Cyber Cyan
  new THREE.Color(0xf4a228)  // Solar Gold
];
let activePalette = 0;

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uViscosity;
  uniform float uSpeed;
  uniform float uPulse;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Ambient sinusoidal fluid waves
    float wave1 = sin(pos.x * 3.5 + uTime * uSpeed) * cos(pos.y * 3.5 + uTime * uSpeed);
    float wave2 = sin(pos.x * 6.0 - uTime * uSpeed * 0.7) * 0.5;

    // Interactive pointer ripple
    float d = distance(uv, uMouse);
    float ripple = sin(d * 32.0 - uTime * 8.0) * exp(-d * 6.0 * uViscosity);

    // Impact shockwave
    float pulseWave = sin(d * 40.0 - uTime * 12.0) * exp(-d * 4.0) * uPulse;

    pos.z += (wave1 * 0.18 + wave2 * 0.08 + ripple * 0.35 + pulseWave * 0.6);

    // Calculate dynamic normal perturbation
    vec3 perturbedNormal = normalize(normal + vec3(
      cos(pos.x * 4.0) * 0.15 + (uv.x - uMouse.x) * ripple * 2.0,
      sin(pos.y * 4.0) * 0.15 + (uv.y - uMouse.y) * ripple * 2.0,
      1.0
    ));

    vNormal = normalMatrix * perturbedNormal;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uDispersion;
  uniform vec3 uAccent;
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel reflection
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

    // Chromatic dispersion ray splitting
    vec3 rReflect = reflect(-viewDir, normal + vec3(uDispersion * 0.05, 0.0, 0.0));
    vec3 gReflect = reflect(-viewDir, normal);
    vec3 bReflect = reflect(-viewDir, normal - vec3(uDispersion * 0.05, 0.0, 0.0));

    // Metallic environment reflection mapping
    vec3 col;
    col.r = sin(rReflect.x * 4.0 + uTime * 0.5) * 0.5 + 0.5;
    col.g = sin(gReflect.y * 4.0 + uTime * 0.6) * 0.5 + 0.5;
    col.b = cos(bReflect.z * 4.0 + uTime * 0.7) * 0.5 + 0.5;

    // Iridescent metallic blend
    vec3 chrome = mix(vec3(0.1, 0.12, 0.16), vec3(0.95, 0.98, 1.0), col.r * 0.6 + col.g * 0.4);
    chrome += fresnel * uAccent * 1.6;

    // Specular highlight
    vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 32.0);
    chrome += vec3(spec * 1.2);

    gl_FragColor = vec4(chrome, 1.0);
  }
`;

function init() {
  const canvas = document.getElementById('stage-canvas');
  const w = canvas.parentElement.clientWidth;
  const h = 560;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 3.2);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // High-density subdivided mesh plane
  const geometry = new THREE.PlaneGeometry(3.6, 2.6, 128, 128);

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uViscosity: { value: 0.45 },
      uDispersion: { value: 0.80 },
      uSpeed: { value: 1.20 },
      uPulse: { value: 0.0 },
      uAccent: { value: palettes[activePalette] }
    },
    wireframe: false
  });

  fluidMesh = new THREE.Mesh(geometry, material);
  scene.add(fluidMesh);

  bindEvents(canvas);
  animate();
}

function bindEvents(canvas) {
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    targetMouse.x = (e.clientX - rect.left) / rect.width;
    targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
  });

  canvas.addEventListener('click', (e) => {
    pulseStrength = 1.0;
  });

  // Touch Support
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = (e.touches[0].clientX - rect.left) / rect.width;
      targetMouse.y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
    }
  }, { passive: true });

  // Sliders
  const sVisc = document.getElementById('viscosity-slider');
  sVisc.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('viscosity-val').textContent = val.toFixed(2);
    material.uniforms.uViscosity.value = val;
  });

  const sDisp = document.getElementById('dispersion-slider');
  sDisp.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('dispersion-val').textContent = val.toFixed(2);
    material.uniforms.uDispersion.value = val;
  });

  const sSpeed = document.getElementById('speed-slider');
  sSpeed.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('speed-val').textContent = val.toFixed(2);
    material.uniforms.uSpeed.value = val;
  });

  // Palette switcher
  const palBtns = document.querySelectorAll('.palette-btn');
  palBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      palBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePalette = parseInt(btn.getAttribute('data-palette'), 10);
      material.uniforms.uAccent.value = palettes[activePalette];
    });
  });

  // Buttons
  document.getElementById('pulse-btn').addEventListener('click', () => {
    pulseStrength = 1.5;
  });

  // Audio Pulse Synthesizer
  document.getElementById('audio-react-btn').addEventListener('click', () => {
    pulseStrength = 2.0;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  });

  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = 560;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Smooth mouse interpolation
  mouse.lerp(targetMouse, 0.08);

  // Damping shockwave pulse
  if (pulseStrength > 0.01) {
    pulseStrength *= 0.94;
  } else {
    pulseStrength = 0;
  }

  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uMouse.value.copy(mouse);
  material.uniforms.uPulse.value = pulseStrength;

  // Gentle floating tilt
  fluidMesh.rotation.x = (mouse.y - 0.5) * 0.2;
  fluidMesh.rotation.y = (mouse.x - 0.5) * 0.25;

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
