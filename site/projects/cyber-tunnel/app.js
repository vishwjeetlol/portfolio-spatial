// Cyber Tunnel // Volumetric 4D Raymarching & Non-Euclidean Shaders
// Pure GLSL Fragment Shader Sphere Tracing with Volumetric Glow

let scene, camera, renderer, material, mesh;
let mouse = new THREE.Vector2(0, 0);
let targetMouse = new THREE.Vector2(0, 0);
let isHyperdrive = false;
let hyperdriveMultiplier = 1.0;
let isInverted = false;

let fpsFrames = 0;
let fpsLastTime = performance.now();
const fpsElement = document.getElementById('fps-val');

const palettes = {
  synthwave: {
    colorA: new THREE.Color(0xff0077), // Neon Hot Pink
    colorB: new THREE.Color(0x00e5ff), // Electric Cyan
    ambient: new THREE.Color(0x100520)  // Deep Indigo
  },
  matrix: {
    colorA: new THREE.Color(0x00ff66), // Cyber Terminal Green
    colorB: new THREE.Color(0xaaffcc), // Bright Phosphor
    ambient: new THREE.Color(0x001408)  // Dark Matrix Void
  },
  hyper: {
    colorA: new THREE.Color(0xff8800), // Solar Orange
    colorB: new THREE.Color(0x8800ff), // Neon Violet
    ambient: new THREE.Color(0x1a0520)  // Deep Void
  }
};
let currentPalette = 'synthwave';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uSpeed;
  uniform float uTwist;
  uniform float uGlow;
  uniform float uInvert;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uAmbient;

  varying vec2 vUv;

  #define MAX_STEPS 72
  #define SURF_DIST 0.003
  #define MAX_DIST 42.0

  // 2D Rotation matrix
  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  // Scene Signed Distance Function (SDF)
  float mapScene(vec3 p) {
    // Non-Euclidean Z-axis rotational twist
    float twistAngle = p.z * (uTwist * 0.18);
    p.xy = rot(twistAngle) * p.xy;

    // Tunnel boundary cylinder
    float tunnel = -(length(p.xy) - 3.4);

    // Infinite 4D Gyroid periodic minimal lattice
    vec3 gp = p * 1.4;
    float gyroid = abs(dot(sin(gp), cos(gp.zxy))) - (0.28 + 0.1 * sin(p.z * 0.4 + uTime));

    // Repeating ribbed cyber conduits
    vec3 ribP = p;
    ribP.z = mod(ribP.z + 0.5, 1.0) - 0.5;
    float ribs = length(vec2(length(ribP.xy) - 3.2, ribP.z)) - 0.08;

    // Longitudinal conduit pipes
    float angle = atan(p.y, p.x);
    float sector = sin(angle * 6.0);
    float pipes = abs(length(p.xy) - 3.0) - 0.12 + abs(sector) * 0.1;

    // Combine structural features
    float structure = min(gyroid, min(ribs, pipes));
    float d = max(tunnel, structure * 0.65);

    if (uInvert > 0.5) {
      d = -d;
    }
    return d;
  }

  // Calculate surface normal
  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.003, 0.0);
    return normalize(vec3(
      mapScene(p + e.xyy) - mapScene(p - e.xyy),
      mapScene(p + e.yxy) - mapScene(p - e.yxy),
      mapScene(p + e.yyx) - mapScene(p - e.yyx)
    ));
  }

  void main() {
    // Normalized centered screen coordinates with aspect ratio
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

    // Ray origin (flight camera along Z)
    float travelZ = uTime * uSpeed * 3.8;
    vec3 ro = vec3(0.0, 0.0, travelZ);

    // Dynamic mouse camera steer
    vec2 steer = uMouse * 0.8;
    ro.x += steer.x * 1.2;
    ro.y += steer.y * 1.2;

    // Ray direction with perspective FOV
    vec3 rd = normalize(vec3(uv, 1.25));
    // Apply camera steer tilt
    rd.xy = rot(-steer.x * 0.4) * rd.xy;
    rd.yz = rot(steer.y * 0.3) * rd.yz;

    // Sphere Tracing Raymarch
    float dO = 0.0;
    vec3 glowAccum = vec3(0.0);
    float minDistance = 999.0;
    vec3 hitPos = vec3(0.0);
    bool hit = false;

    for (int i = 0; i < MAX_STEPS; i++) {
      vec3 currentPos = ro + rd * dO;
      float dS = mapScene(currentPos);

      // Track closest approach for volumetric fog glow
      minDistance = min(minDistance, abs(dS));

      // Color gradient along depth and z travel
      float colorMix = sin(currentPos.z * 0.2 + uTime) * 0.5 + 0.5;
      vec3 stepColor = mix(uColorA, uColorB, colorMix);

      // Volumetric glow accumulation
      glowAccum += stepColor * exp(-abs(dS) * 3.4) * (1.0 / float(MAX_STEPS)) * uGlow;

      if (abs(dS) < SURF_DIST) {
        hit = true;
        hitPos = currentPos;
        break;
      }
      dO += max(abs(dS) * 0.72, 0.035);
      if (dO > MAX_DIST) break;
    }

    // Shading
    vec3 col = uAmbient;
    if (hit) {
      vec3 normal = calcNormal(hitPos);
      vec3 lightDir = normalize(vec3(0.0, 0.0, -1.0));
      float diff = max(dot(normal, lightDir), 0.0);
      float fresnel = pow(1.0 - max(dot(-rd, normal), 0.0), 3.0);

      // Neon surface glow
      float pulse = sin(hitPos.z * 1.5 - uTime * 4.0) * 0.5 + 0.5;
      vec3 surfColor = mix(uColorA, uColorB, pulse);

      col = surfColor * (diff * 0.4 + 0.2);
      col += fresnel * uColorB * 1.8;
      // Depth fog
      col = mix(col, uAmbient, smoothstep(12.0, MAX_DIST, dO));
    }

    // Composite volumetric glow on top of scene
    col += glowAccum * 1.6;

    // Chromatic aberration at edge of viewport
    float distFromCenter = length(uv);
    col.r *= 1.0 + distFromCenter * 0.15;
    col.b *= 1.0 - distFromCenter * 0.1;

    // Vignette
    col *= smoothstep(1.4, 0.4, distFromCenter);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function init() {
  const canvas = document.getElementById('stage-canvas');
  const width = canvas.parentElement.clientWidth || 960;
  const height = canvas.parentElement.clientHeight || 560;

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const initialPal = palettes[currentPalette];

  material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uResolution: { value: new THREE.Vector2(width, height) },
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uSpeed: { value: 1.4 },
      uTwist: { value: 0.5 },
      uGlow: { value: 1.2 },
      uInvert: { value: 0.0 },
      uColorA: { value: initialPal.colorA },
      uColorB: { value: initialPal.colorB },
      uAmbient: { value: initialPal.ambient }
    }
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  setupControls(canvas);
  animate();
}

function setupControls(canvas) {
  // Mouse / Pointer Steering
  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetMouse.set(x, y);
  });

  canvas.addEventListener('pointerleave', () => {
    targetMouse.set(0, 0);
  });

  // Touch steering for mobile
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.set(x, y);
    }
  }, { passive: true });

  // Speed Slider
  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  speedSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    speedVal.textContent = val.toFixed(2);
    material.uniforms.uSpeed.value = val * hyperdriveMultiplier;
  });

  // Twist Slider
  const twistSlider = document.getElementById('twist-slider');
  const twistVal = document.getElementById('twist-val');
  twistSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    twistVal.textContent = val.toFixed(2);
    material.uniforms.uTwist.value = val;
  });

  // Glow Slider
  const glowSlider = document.getElementById('glow-slider');
  const glowVal = document.getElementById('glow-val');
  glowSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    glowVal.textContent = val.toFixed(2);
    material.uniforms.uGlow.value = val;
  });

  // Palette Buttons
  document.querySelectorAll('.palette-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pName = btn.getAttribute('data-palette');
      const pal = palettes[pName] || palettes.synthwave;
      material.uniforms.uColorA.value = pal.colorA;
      material.uniforms.uColorB.value = pal.colorB;
      material.uniforms.uAmbient.value = pal.ambient;
    });
  });

  // Hyperdrive Warp Button
  const hyperBtn = document.getElementById('hyperdrive-btn');
  hyperBtn.addEventListener('click', () => {
    isHyperdrive = !isHyperdrive;
    if (isHyperdrive) {
      hyperdriveMultiplier = 2.8;
      hyperBtn.textContent = 'Disengage Warp';
      hyperBtn.classList.add('active');
    } else {
      hyperdriveMultiplier = 1.0;
      hyperBtn.textContent = 'Hyperdrive Warp';
      hyperBtn.classList.remove('active');
    }
    const baseSpeed = parseFloat(speedSlider.value);
    material.uniforms.uSpeed.value = baseSpeed * hyperdriveMultiplier;
  });

  // Invert Field Button
  const invertBtn = document.getElementById('invert-btn');
  invertBtn.addEventListener('click', () => {
    isInverted = !isInverted;
    material.uniforms.uInvert.value = isInverted ? 1.0 : 0.0;
    invertBtn.textContent = isInverted ? 'Normal Field' : 'Invert Field';
  });

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  const canvas = document.getElementById('stage-canvas');
  if (!canvas || !renderer) return;
  const width = canvas.parentElement.clientWidth || 960;
  const height = canvas.parentElement.clientHeight || 560;

  renderer.setSize(width, height, false);
  if (material) {
    material.uniforms.uResolution.value.set(width, height);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();

  // FPS Tracking
  fpsFrames++;
  if (now - fpsLastTime >= 1000) {
    if (fpsElement) fpsElement.textContent = Math.round((fpsFrames * 1000) / (now - fpsLastTime)) + ' FPS';
    fpsFrames = 0;
    fpsLastTime = now;
  }

  // Smooth mouse steer interpolation
  mouse.x += (targetMouse.x - mouse.x) * 0.07;
  mouse.y += (targetMouse.y - mouse.y) * 0.07;
  material.uniforms.uMouse.value.copy(mouse);

  // Time progression
  material.uniforms.uTime.value = now * 0.001;

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
