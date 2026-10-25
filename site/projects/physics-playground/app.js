// Physics Playground - Real-Time 3D Rigid-Body Dynamics & Destruction
// Native Three.js rigid-body physics integrator with spatial pointer manipulation

let scene, camera, renderer;
let bodies = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let dragPlane = new THREE.Plane();
let dragIntersection = new THREE.Vector3();
let selectedBody = null;
let springLine = null;

let gravity = -9.8;
let restitution = 0.75;
let friction = 0.96;
let timeScale = 1.0;
let lastTime = performance.now();

// Arena boundary box
const bounds = {
  minX: -4.0, maxX: 4.0,
  minY: -2.8, maxY: 4.2,
  minZ: -3.5, maxZ: 3.5
};

const colors = [
  0xf4a228, // Solar Amber
  0x5ce1e6, // Cyan
  0xff4757, // Crimson
  0xced4da, // Titanium
  0x2ed573  // Neon Emerald
];

function init() {
  const canvas = document.getElementById('stage-canvas');
  const w = canvas.parentElement.clientWidth;
  const h = 560;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 1.5, 9.5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Arena Lighting
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
  dirLight.position.set(6, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x5ce1e6, 1.0);
  fillLight.position.set(-8, -4, -4);
  scene.add(fillLight);

  const ambLight = new THREE.AmbientLight(0x181e2b, 1.4);
  scene.add(ambLight);

  // Wireframe Arena Cage
  const cageGeo = new THREE.BoxGeometry(
    bounds.maxX - bounds.minX,
    bounds.maxY - bounds.minY,
    bounds.maxZ - bounds.minZ
  );
  const cageEdges = new THREE.EdgesGeometry(cageGeo);
  const cageLine = new THREE.LineSegments(
    cageEdges,
    new THREE.LineBasicMaterial({ color: 0x2a3346, transparent: true, opacity: 0.6 })
  );
  cageLine.position.set(0, (bounds.maxY + bounds.minY) / 2, 0);
  scene.add(cageLine);

  // Floor Grid
  const gridHelper = new THREE.GridHelper(8, 16, 0x5ce1e6, 0x1f2638);
  gridHelper.position.y = bounds.minY;
  scene.add(gridHelper);

  // Spring Line
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  springLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }));
  springLine.visible = false;
  scene.add(springLine);

  // Spawn initial 45 bodies
  spawnBatch(45);

  bindEvents(canvas);
  animate();
}

function spawnBody(x, y, z) {
  const types = ['sphere', 'box', 'dodeca', 'cylinder', 'torus'];
  const type = types[Math.floor(Math.random() * types.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * 0.25 + 0.25;

  let geo;
  let radius = size;

  if (type === 'sphere') {
    geo = new THREE.SphereGeometry(size, 20, 20);
  } else if (type === 'box') {
    geo = new THREE.BoxGeometry(size * 1.6, size * 1.6, size * 1.6);
    radius = size * 1.1;
  } else if (type === 'dodeca') {
    geo = new THREE.DodecahedronGeometry(size);
    radius = size * 1.0;
  } else if (type === 'cylinder') {
    geo = new THREE.CylinderGeometry(size * 0.7, size * 0.7, size * 1.4, 16);
    radius = size * 1.0;
  } else {
    geo = new THREE.TorusGeometry(size * 0.8, size * 0.3, 12, 24);
    radius = size * 1.1;
  }

  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.85,
    roughness: 0.25
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const body = {
    mesh,
    pos: mesh.position,
    vel: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
    rotVel: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
    radius,
    mass: radius * 3,
    invMass: 1.0 / (radius * 3)
  };

  bodies.push(body);
}

function spawnBatch(count) {
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 6;
    const y = Math.random() * 3 + 0.5;
    const z = (Math.random() - 0.5) * 4;
    spawnBody(x, y, z);
  }
  const el = document.getElementById('body-count-val');
  if (el) el.textContent = bodies.length;
}

function bindEvents(canvas) {
  let isDown = false;
  let prevMousePos = new THREE.Vector3();
  let mouseVel = new THREE.Vector3();

  canvas.addEventListener('mousedown', (e) => {
    isDown = true;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = bodies.map(b => b.mesh);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0];
      selectedBody = bodies.find(b => b.mesh === hit.object);
      dragPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), hit.point);
      springLine.visible = true;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    if (selectedBody && raycaster.ray.intersectPlane(dragPlane, dragIntersection)) {
      mouseVel.copy(dragIntersection).sub(prevMousePos);
      prevMousePos.copy(dragIntersection);

      // Spring pull towards pointer
      const pull = new THREE.Vector3().subVectors(dragIntersection, selectedBody.pos).multiplyScalar(14.0);
      selectedBody.vel.add(pull.multiplyScalar(0.016));

      // Update spring line
      const positions = springLine.geometry.attributes.position.array;
      positions[0] = selectedBody.pos.x;
      positions[1] = selectedBody.pos.y;
      positions[2] = selectedBody.pos.z;
      positions[3] = dragIntersection.x;
      positions[4] = dragIntersection.y;
      positions[5] = dragIntersection.z;
      springLine.geometry.attributes.position.needsUpdate = true;
    }
  });

  window.addEventListener('mouseup', () => {
    if (selectedBody) {
      selectedBody.vel.add(mouseVel.multiplyScalar(40.0));
      selectedBody = null;
      springLine.visible = false;
    }
    isDown = false;
  });

  // UI Sliders
  document.getElementById('gravity-slider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravity-val').textContent = `${gravity.toFixed(1)} m/s²`;
  });

  document.getElementById('restitution-slider').addEventListener('input', (e) => {
    restitution = parseFloat(e.target.value);
    document.getElementById('restitution-val').textContent = restitution.toFixed(2);
  });

  document.getElementById('friction-slider').addEventListener('input', (e) => {
    friction = parseFloat(e.target.value);
    document.getElementById('friction-val').textContent = friction.toFixed(2);
  });

  // Buttons
  document.getElementById('blast-btn').addEventListener('click', () => {
    bodies.forEach(b => {
      const dir = new THREE.Vector3().copy(b.pos).normalize();
      dir.y = Math.max(0.4, dir.y);
      b.vel.add(dir.multiplyScalar(Math.random() * 15 + 10));
      b.rotVel.add(new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8));
    });
  });

  document.getElementById('spawn-btn').addEventListener('click', () => {
    spawnBatch(20);
  });

  const slowBtn = document.getElementById('slow-mo-btn');
  slowBtn.addEventListener('click', () => {
    timeScale = timeScale === 1.0 ? 0.2 : 1.0;
    slowBtn.textContent = timeScale === 1.0 ? 'Toggle Slow Motion (0.2x)' : 'Restore Real-Time (1.0x)';
  });

  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = 560;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

function updatePhysics(dt) {
  const scaledDt = dt * timeScale;

  for (let i = 0; i < bodies.length; i++) {
    const b1 = bodies[i];

    // Gravity force
    b1.vel.y += gravity * scaledDt;

    // Air resistance / friction
    b1.vel.multiplyScalar(Math.pow(friction, scaledDt * 60));
    b1.rotVel.multiplyScalar(Math.pow(0.98, scaledDt * 60));

    // Position integration
    b1.pos.addScaledVector(b1.vel, scaledDt);
    b1.mesh.rotation.x += b1.rotVel.x * scaledDt;
    b1.mesh.rotation.y += b1.rotVel.y * scaledDt;
    b1.mesh.rotation.z += b1.rotVel.z * scaledDt;

    // Boundary Collisions
    const r = b1.radius;
    if (b1.pos.x - r < bounds.minX) { b1.pos.x = bounds.minX + r; b1.vel.x = -b1.vel.x * restitution; }
    if (b1.pos.x + r > bounds.maxX) { b1.pos.x = bounds.maxX - r; b1.vel.x = -b1.vel.x * restitution; }
    if (b1.pos.y - r < bounds.minY) { b1.pos.y = bounds.minY + r; b1.vel.y = -b1.vel.y * restitution; }
    if (b1.pos.y + r > bounds.maxY) { b1.pos.y = bounds.maxY - r; b1.vel.y = -b1.vel.y * restitution; }
    if (b1.pos.z - r < bounds.minZ) { b1.pos.z = bounds.minZ + r; b1.vel.z = -b1.vel.z * restitution; }
    if (b1.pos.z + r > bounds.maxZ) { b1.pos.z = bounds.maxZ - r; b1.vel.z = -b1.vel.z * restitution; }

    // Body-to-Body Elastic Collision Resolution
    for (let j = i + 1; j < bodies.length; j++) {
      const b2 = bodies[j];
      const delta = new THREE.Vector3().subVectors(b2.pos, b1.pos);
      const dist = delta.length();
      const minDist = b1.radius + b2.radius;

      if (dist < minDist && dist > 0.0001) {
        const normal = delta.divideScalar(dist);
        const overlap = (minDist - dist) * 0.5;

        b1.pos.addScaledVector(normal, -overlap);
        b2.pos.addScaledVector(normal, overlap);

        const relVel = new THREE.Vector3().subVectors(b2.vel, b1.vel);
        const velAlongNormal = relVel.dot(normal);

        if (velAlongNormal < 0) {
          const impulseMag = -(1 + restitution) * velAlongNormal / (b1.invMass + b2.invMass);
          const impulse = normal.clone().multiplyScalar(impulseMag);

          b1.vel.addScaledVector(impulse, -b1.invMass);
          b2.vel.addScaledVector(impulse, b2.invMass);
        }
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  updatePhysics(dt);
  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
