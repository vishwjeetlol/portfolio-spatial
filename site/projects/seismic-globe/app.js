// Seismic Globe - Interactive Three.js USGS Earthquake Visualizer
// Pure static browser runtime reading build-time earthquakes.json

let scene, camera, renderer, globeGroup;
let earthquakes = [];
let markers = [];
let isDragging = false;
let prevMouseX = 0, prevMouseY = 0;
let velX = 0.002, velY = 0;

const canvas = document.getElementById('globe-canvas');
const tooltip = document.getElementById('tooltip');
const activeCountEl = document.getElementById('active-count');
const magFilterEl = document.getElementById('mag-filter');
const magValEl = document.getElementById('mag-val');
const timeFilterEl = document.getElementById('time-filter');
const timeValEl = document.getElementById('time-val');

async function init() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Globe Base Sphere
  const sphereGeo = new THREE.SphereGeometry(2, 48, 48);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x0c0f17,
    roughness: 0.8,
    metalness: 0.1
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(sphere);

  // 2. Graticule Wireframe Lines
  const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(2.002, 24, 24));
  const wireMat = new THREE.LineBasicMaterial({ color: 0x222a3d, transparent: true, opacity: 0.4 });
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  globeGroup.add(wire);

  // 3. Atmosphere Rim Glow
  const atmosGeo = new THREE.SphereGeometry(2.08, 32, 32);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x5ce1e6,
    transparent: true,
    opacity: 0.06,
    side: THREE.BackSide
  });
  globeGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

  // Lighting
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const ambLight = new THREE.AmbientLight(0x182030, 1.2);
  scene.add(ambLight);

  // Load Data
  await loadData();
  bindEvents();
  animate();
}

async function loadData() {
  try {
    const [eqRes, sumRes] = await Promise.all([
      fetch('earthquakes.json'),
      fetch('summary.json')
    ]);
    earthquakes = await eqRes.json();
    const summary = await sumRes.json();

    renderSummary(summary);
    plotEarthquakes();
  } catch (err) {
    console.error('Failed to load earthquake data:', err);
  }
}

function renderSummary(summary) {
  const container = document.getElementById('stats-container');
  if (!container) return;

  container.innerHTML = `
    <div class="stat-row"><span>Total Events (30d):</span><span class="stat-val">${summary.totalEvents}</span></div>
    <div class="stat-row"><span>Visualized Points:</span><span class="stat-val">${summary.exportedEvents}</span></div>
    <div class="stat-row"><span>Max Magnitude:</span><span class="stat-val">M ${summary.maxMagnitude}</span></div>
    <div class="stat-row"><span>Avg Magnitude:</span><span class="stat-val">M ${summary.avgMagnitude}</span></div>
    <div class="stat-row"><span>Max Depth:</span><span class="stat-val">${summary.maxDepthKm} km</span></div>
    <div class="stat-row"><span>Avg Depth:</span><span class="stat-val">${summary.avgDepthKm} km</span></div>
    <div class="stat-row"><span>Date Range:</span><span class="stat-val">${summary.earliestDate} &rarr; ${summary.latestDate}</span></div>
  `;
}

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function plotEarthquakes() {
  const R = 2.02;

  earthquakes.forEach((eq, idx) => {
    // Size based on magnitude
    const size = Math.max(0.02, (eq.mag - 2.0) * 0.025);
    const geom = new THREE.SphereGeometry(size, 8, 8);

    // Color based on geological hypocenter depth
    let colorHex = 0xf4a228; // shallow (<30km) Subduction Amber
    if (eq.depth >= 30 && eq.depth < 100) colorHex = 0xf97316; // intermediate (30-100km) Vermilion
    else if (eq.depth >= 100) colorHex = 0xdc2626; // deep mantle (>100km) Crimson

    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    const marker = new THREE.Mesh(geom, mat);

    const pos = latLonToVector3(eq.lat, eq.lon, R);
    marker.position.copy(pos);
    marker.userData = { ...eq, index: idx };

    globeGroup.add(marker);
    markers.push(marker);
  });

  filterMarkers();
}

function filterMarkers() {
  const minMag = parseFloat(magFilterEl.value);
  const maxDays = parseInt(timeFilterEl.value, 10);
  const now = Date.now();
  const cutoffTime = now - (maxDays * 24 * 60 * 60 * 1000);

  let visibleCount = 0;
  markers.forEach(m => {
    const data = m.userData;
    const matchMag = data.mag >= minMag;
    const matchTime = data.time >= cutoffTime;
    const visible = matchMag && matchTime;
    m.visible = visible;
    if (visible) visibleCount++;
  });

  if (activeCountEl) activeCountEl.textContent = `${visibleCount} events`;
}

function bindEvents() {
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    velX = 0;
    velY = 0;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      velX = dx * 0.005;
      velY = dy * 0.005;
      globeGroup.rotation.y += velX;
      globeGroup.rotation.x += velY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });

  magFilterEl.addEventListener('input', (e) => {
    magValEl.textContent = parseFloat(e.target.value).toFixed(1);
    filterMarkers();
  });

  timeFilterEl.addEventListener('input', (e) => {
    timeValEl.textContent = `${e.target.value} Days`;
    filterMarkers();
  });

  document.getElementById('toggle-hood').addEventListener('click', () => {
    const p = document.getElementById('hood-panel');
    p.hidden = !p.hidden;
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (!isDragging) {
    // Gentle auto-rotation
    velX = velX * 0.95 + 0.001 * 0.05;
    velY *= 0.95;
    globeGroup.rotation.y += velX;
    globeGroup.rotation.x += velY;
  }

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
