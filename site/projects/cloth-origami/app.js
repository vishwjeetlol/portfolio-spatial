// Cloth & Origami // 3D Verlet Integration & Soft-Body Simulation
// Position-based dynamics, interactive tear knife, and origami fold geometry

const NX = 44;
const NY = 44;
const CLOTH_WIDTH = 26;
const CLOTH_HEIGHT = 26;
const REST_DIST_X = CLOTH_WIDTH / (NX - 1);
const REST_DIST_Y = CLOTH_HEIGHT / (NY - 1);
const DAMPING = 0.985;

let scene, camera, renderer, clothMesh, clothGeometry;
let particles = [];
let constraints = [];
let currentFold = 'flat';
let currentMaterial = 'silk';
let currentTool = 'drag'; // 'drag' or 'tear'
let stiffnessIterations = 5;
let windStrength = 0.75;

let isMouseDown = false;
let draggedParticle = null;
let lastMouseWorld = new THREE.Vector3();
let currentMouseWorld = new THREE.Vector3();

let fpsFrames = 0;
let fpsLastTime = performance.now();
const fpsElement = document.getElementById('fps-val');

// Particle Class
class Particle {
  constructor(x, y, z, mass = 1.0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.oldX = x;
    this.oldY = y;
    this.oldZ = z;
    this.ax = 0;
    this.ay = 0;
    this.az = 0;
    this.invMass = mass === 0 ? 0 : 1 / mass;
    this.isPinned = mass === 0;
  }

  applyForce(fx, fy, fz) {
    if (this.invMass === 0) return;
    this.ax += fx * this.invMass;
    this.ay += fy * this.invMass;
    this.az += fz * this.invMass;
  }

  integrate(dt2) {
    if (this.invMass === 0) return;

    const vx = (this.x - this.oldX) * DAMPING;
    const vy = (this.y - this.oldY) * DAMPING;
    const vz = (this.z - this.oldZ) * DAMPING;

    this.oldX = this.x;
    this.oldY = this.y;
    this.oldZ = this.z;

    this.x += vx + this.ax * dt2;
    this.y += vy + this.ay * dt2;
    this.z += vz + this.az * dt2;

    this.ax = 0;
    this.ay = 0;
    this.az = 0;
  }
}

// Constraint Class
class DistanceConstraint {
  constructor(p1, p2, dist) {
    this.p1 = p1;
    this.p2 = p2;
    this.dist = dist !== undefined ? dist : Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
    this.broken = false;
  }

  solve() {
    if (this.broken) return;

    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dz = this.p2.z - this.p1.z;
    const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (currentDist === 0) return;

    const diff = (currentDist - this.dist) / currentDist;
    const totalInvMass = this.p1.invMass + this.p2.invMass;
    if (totalInvMass === 0) return;

    const offsetX = dx * diff;
    const offsetY = dy * diff;
    const offsetZ = dz * diff;

    if (this.p1.invMass > 0) {
      this.p1.x += offsetX * (this.p1.invMass / totalInvMass);
      this.p1.y += offsetY * (this.p1.invMass / totalInvMass);
      this.p1.z += offsetZ * (this.p1.invMass / totalInvMass);
    }
    if (this.p2.invMass > 0) {
      this.p2.x -= offsetX * (this.p2.invMass / totalInvMass);
      this.p2.y -= offsetY * (this.p2.invMass / totalInvMass);
      this.p2.z -= offsetZ * (this.p2.invMass / totalInvMass);
    }
  }
}

function getIndex(i, j) {
  return j * NX + i;
}

// Build Mesh & Particle Lattice
function buildClothSystem(foldType) {
  particles = [];
  constraints = [];

  const startX = -CLOTH_WIDTH / 2;
  const startY = CLOTH_HEIGHT / 2 + 2;

  // 1. Initialize Particles based on Fold Topology
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      let x = startX + i * REST_DIST_X;
      let y = startY - j * REST_DIST_Y;
      let z = 0;
      let isPinned = false;

      if (foldType === 'flat') {
        // Pinned top row
        isPinned = (j === 0 && (i === 0 || i === NX - 1 || i % 6 === 0));
      } else if (foldType === 'canopy') {
        // 4 corners pinned high, middle sagging like a hammock canopy
        y = 6.0;
        z = -CLOTH_HEIGHT / 2 + j * REST_DIST_Y;
        isPinned = ((i === 0 || i === NX - 1) && (j === 0 || j === NY - 1));
      } else if (foldType === 'fan') {
        // Pleated accordion fan folds along Z
        z = Math.sin((i / (NX - 1)) * Math.PI * 10) * 3.5;
        isPinned = (j === 0);
      } else if (foldType === 'origami') {
        // Origami crane / wing geometry
        const u = (i / (NX - 1)) * 2 - 1; // [-1, 1]
        const v = (j / (NY - 1));
        z = -Math.abs(u) * 6.5 + v * 4.0;
        y = startY - j * REST_DIST_Y * 0.8 + Math.abs(u) * 2.0;
        isPinned = (j === 0 && (i === Math.floor(NX / 2) || i === 0 || i === NX - 1));
      }

      particles.push(new Particle(x, y, z, isPinned ? 0 : 1.0));
    }
  }

  // 2. Structural & Shear Constraints
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const idx = getIndex(i, j);

      // Horizontal neighbor
      if (i < NX - 1) {
        constraints.push(new DistanceConstraint(particles[idx], particles[getIndex(i + 1, j)], REST_DIST_X));
      }
      // Vertical neighbor
      if (j < NY - 1) {
        constraints.push(new DistanceConstraint(particles[idx], particles[getIndex(i, j + 1)], REST_DIST_Y));
      }
      // Diagonal shear springs
      if (i < NX - 1 && j < NY - 1) {
        const diagDist = Math.hypot(REST_DIST_X, REST_DIST_Y);
        constraints.push(new DistanceConstraint(particles[idx], particles[getIndex(i + 1, j + 1)], diagDist));
        constraints.push(new DistanceConstraint(particles[getIndex(i + 1, j)], particles[getIndex(i, j + 1)], diagDist));
      }
      // Bending / Flexion springs (2 hops)
      if (i < NX - 2) {
        constraints.push(new DistanceConstraint(particles[idx], particles[getIndex(i + 2, j)], REST_DIST_X * 2));
      }
      if (j < NY - 2) {
        constraints.push(new DistanceConstraint(particles[idx], particles[getIndex(i, j + 2)], REST_DIST_Y * 2));
      }
    }
  }

  // 3. Create Three.js BufferGeometry
  if (!clothGeometry) {
    clothGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(NX * NY * 3);
    const uvs = new Float32Array(NX * NY * 2);
    const indices = [];

    let pIdx = 0;
    let uvIdx = 0;
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        positions[pIdx * 3 + 0] = particles[pIdx].x;
        positions[pIdx * 3 + 1] = particles[pIdx].y;
        positions[pIdx * 3 + 2] = particles[pIdx].z;

        uvs[uvIdx * 2 + 0] = i / (NX - 1);
        uvs[uvIdx * 2 + 1] = 1 - (j / (NY - 1));

        pIdx++;
        uvIdx++;
      }
    }

    for (let j = 0; j < NY - 1; j++) {
      for (let i = 0; i < NX - 1; i++) {
        const a = getIndex(i, j);
        const b = getIndex(i + 1, j);
        const c = getIndex(i + 1, j + 1);
        const d = getIndex(i, j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    clothGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    clothGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    clothGeometry.setIndex(indices);
  }

  updateGeometryPositions();
  clothGeometry.computeVertexNormals();
}

function updateGeometryPositions() {
  const posArray = clothGeometry.attributes.position.array;
  for (let i = 0; i < particles.length; i++) {
    posArray[i * 3 + 0] = particles[i].x;
    posArray[i * 3 + 1] = particles[i].y;
    posArray[i * 3 + 2] = particles[i].z;
  }
  clothGeometry.attributes.position.needsUpdate = true;
  clothGeometry.computeVertexNormals();
}

// Fabric Material presets
function getMaterial(type) {
  if (type === 'gold') {
    return new THREE.MeshStandardMaterial({
      color: 0xffcc33,
      metalness: 0.85,
      roughness: 0.22,
      side: THREE.DoubleSide
    });
  } else if (type === 'wireframe') {
    return new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true
    });
  } else {
    // Violet Silk
    return new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      metalness: 0.15,
      roughness: 0.35,
      side: THREE.DoubleSide
    });
  }
}

// Slice / Tear Knife intersection check
function cutConstraintsNear(pA, pB) {
  const cutRadius = 1.4;
  for (let c of constraints) {
    if (c.broken) continue;

    // Check distance between spring midpoint and cutting segment
    const midX = (c.p1.x + c.p2.x) * 0.5;
    const midY = (c.p1.y + c.p2.y) * 0.5;
    const midZ = (c.p1.z + c.p2.z) * 0.5;

    const distA = Math.hypot(midX - pA.x, midY - pA.y, midZ - pA.z);
    const distB = Math.hypot(midX - pB.x, midY - pB.y, midZ - pB.z);

    if (distA < cutRadius || distB < cutRadius) {
      c.broken = true;
    }
  }
}

// Pointer Raycasting & Interaction
function setupInteraction(canvas) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getMouseRayPoint(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Intersect plane at z=0 or cloth
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);
    return targetPoint;
  }

  function findClosestParticle(worldPoint) {
    let closest = null;
    let minDist = 4.0;
    for (let p of particles) {
      const d = Math.hypot(p.x - worldPoint.x, p.y - worldPoint.y, p.z - worldPoint.z);
      if (d < minDist) {
        minDist = d;
        closest = p;
      }
    }
    return closest;
  }

  canvas.addEventListener('pointerdown', (e) => {
    isMouseDown = true;
    const pt = getMouseRayPoint(e);
    lastMouseWorld.copy(pt);
    currentMouseWorld.copy(pt);

    if (currentTool === 'drag') {
      draggedParticle = findClosestParticle(pt);
      if (draggedParticle) {
        draggedParticle.oldX = pt.x;
        draggedParticle.oldY = pt.y;
        draggedParticle.oldZ = pt.z;
        draggedParticle.x = pt.x;
        draggedParticle.y = pt.y;
        draggedParticle.z = pt.z;
      }
    } else if (currentTool === 'tear') {
      cutConstraintsNear(pt, pt);
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isMouseDown) return;
    const pt = getMouseRayPoint(e);
    currentMouseWorld.copy(pt);

    if (currentTool === 'drag' && draggedParticle) {
      draggedParticle.x = pt.x;
      draggedParticle.y = pt.y;
      draggedParticle.z = pt.z;
      draggedParticle.oldX = pt.x;
      draggedParticle.oldY = pt.y;
      draggedParticle.oldZ = pt.z;
    } else if (currentTool === 'tear') {
      cutConstraintsNear(lastMouseWorld, currentMouseWorld);
    }
    lastMouseWorld.copy(pt);
  });

  window.addEventListener('pointerup', () => {
    isMouseDown = false;
    draggedParticle = null;
  });

  // Tool Selection (Drag vs Tear)
  const dragBtn = document.getElementById('tool-drag-btn');
  const tearBtn = document.getElementById('tool-tear-btn');
  dragBtn.addEventListener('click', () => {
    currentTool = 'drag';
    dragBtn.classList.add('active');
    tearBtn.classList.remove('active');
    canvas.classList.remove('cut-mode');
  });
  tearBtn.addEventListener('click', () => {
    currentTool = 'tear';
    tearBtn.classList.add('active');
    dragBtn.classList.remove('active');
    canvas.classList.add('cut-mode');
  });

  // Fold Topology Selection
  document.querySelectorAll('.fold-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fold-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFold = btn.getAttribute('data-fold');
      buildClothSystem(currentFold);
    });
  });

  // Wind Slider
  const windSlider = document.getElementById('wind-slider');
  const windVal = document.getElementById('wind-val');
  windSlider.addEventListener('input', (e) => {
    windStrength = parseFloat(e.target.value);
    windVal.textContent = windStrength.toFixed(2);
  });

  // Stiffness Slider
  const stiffSlider = document.getElementById('stiffness-slider');
  const stiffVal = document.getElementById('stiffness-val');
  stiffSlider.addEventListener('input', (e) => {
    stiffnessIterations = parseInt(e.target.value, 10);
    stiffVal.textContent = stiffnessIterations;
  });

  // Material Buttons
  document.querySelectorAll('.mat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMaterial = btn.getAttribute('data-mat');
      clothMesh.material = getMaterial(currentMaterial);
    });
  });

  // Wind Gust Button
  document.getElementById('gust-btn').addEventListener('click', () => {
    const origWind = windStrength;
    windStrength = origWind + 3.5;
    setTimeout(() => {
      windStrength = origWind;
    }, 600);
  });

  // Reset Mesh Button
  document.getElementById('reset-cloth-btn').addEventListener('click', () => {
    buildClothSystem(currentFold);
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
  scene.background = new THREE.Color(0x090a0f);

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
  camera.position.set(0, 4, 38);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(20, 30, 25);
  scene.add(keyLight);

  const backLight = new THREE.DirectionalLight(0x7799ff, 1.4);
  backLight.position.set(-20, -10, -20);
  scene.add(backLight);

  // Initialize Cloth Mesh
  buildClothSystem(currentFold);
  clothMesh = new THREE.Mesh(clothGeometry, getMaterial(currentMaterial));
  scene.add(clothMesh);

  setupInteraction(canvas);
  animate();
}

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = 0.016; // Stable fixed time step
  const dt2 = dt * dt;
  lastTime = now;

  // FPS Tracking
  fpsFrames++;
  if (now - fpsLastTime >= 1000) {
    if (fpsElement) fpsElement.textContent = Math.round((fpsFrames * 1000) / (now - fpsLastTime)) + ' FPS';
    fpsFrames = 0;
    fpsLastTime = now;
  }

  // Aerodynamic Wind Vector Field
  const time = now * 0.002;
  const windX = (Math.sin(time * 2.2) * 0.5 + 0.5) * windStrength * 16.0;
  const windY = Math.sin(time * 3.1) * windStrength * 4.0;
  const windZ = (Math.cos(time * 1.8) * 0.8 + 0.8) * windStrength * 18.0;

  // Apply Forces & Verlet Integration
  const gravityY = -9.8 * 8.0;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (p.invMass === 0) continue;

    // Apply gravity
    p.applyForce(0, gravityY, 0);

    // Apply turbulent aerodynamic wind
    if (windStrength > 0.05) {
      const gust = Math.sin(p.x * 0.3 + time * 4.0) * Math.cos(p.y * 0.3 + time * 3.0);
      p.applyForce(windX * (0.8 + gust * 0.4), windY, windZ * (0.8 + gust * 0.4));
    }

    p.integrate(dt2);
  }

  // Pin dragged particle to mouse
  if (isMouseDown && currentTool === 'drag' && draggedParticle) {
    draggedParticle.x = currentMouseWorld.x;
    draggedParticle.y = currentMouseWorld.y;
    draggedParticle.z = currentMouseWorld.z;
    draggedParticle.oldX = currentMouseWorld.x;
    draggedParticle.oldY = currentMouseWorld.y;
    draggedParticle.oldZ = currentMouseWorld.z;
  }

  // Relax Distance Constraints
  for (let iter = 0; iter < stiffnessIterations; iter++) {
    for (let c = 0; c < constraints.length; c++) {
      constraints[c].solve();
    }
  }

  updateGeometryPositions();
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
