import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, currentMeshGroup;
let currentMaterial;
let isDragging = false;
let prevMouseX = 0, prevMouseY = 0;
let velX = 0.003, velY = 0;

const models = {
  twisted_torus_knot: 'models/twisted_torus_knot.glb',
  faceted_shard: 'models/faceted_shard.glb',
  ribbed_vase: 'models/ribbed_vase.glb'
};

let activeModelKey = 'twisted_torus_knot';
const loader = new GLTFLoader();
const canvas = document.getElementById('stage-canvas');

function init() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 6.5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Physical Glass Material
  currentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    opacity: 1,
    transparent: true,
    roughness: 0.05,
    metalness: 0.0,
    ior: 1.52,
    reflectivity: 0.9,
    wireframe: false
  });

  currentMeshGroup = new THREE.Group();
  scene.add(currentMeshGroup);

  // Studio Lighting (Neutral Daylight & Subtle Silver Rim)
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  const silverRim = new THREE.DirectionalLight(0xdce2ec, 1.6);
  silverRim.position.set(-6, -4, -3);
  scene.add(silverRim);

  const softFill = new THREE.DirectionalLight(0x94a3b8, 0.8);
  softFill.position.set(0, -6, 4);
  scene.add(softFill);

  const amb = new THREE.AmbientLight(0x181b22, 1.0);
  scene.add(amb);

  loadActiveModel();
  bindUI();
  animate();
}

function loadActiveModel() {
  while (currentMeshGroup.children.length > 0) {
    const obj = currentMeshGroup.children[0];
    currentMeshGroup.remove(obj);
  }

  const modelPath = models[activeModelKey];
  loader.load(
    modelPath,
    (gltf) => {
      const root = gltf.scene;
      root.traverse((child) => {
        if (child.isMesh) {
          child.material = currentMaterial;
        }
      });
      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);

      currentMeshGroup.add(root);
    },
    undefined,
    (err) => {
      console.warn('Fallback to procedural geometry:', err);
      const geo = new THREE.TorusKnotGeometry(1.4, 0.4, 64, 16);
      const mesh = new THREE.Mesh(geo, currentMaterial);
      currentMeshGroup.add(mesh);
    }
  );
}

function bindUI() {
  const tabs = document.querySelectorAll('.obj-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeModelKey = tab.getAttribute('data-model');
      loadActiveModel();
    });
  });

  const sTrans = document.getElementById('slider-trans');
  const sIor = document.getElementById('slider-ior');
  const sRough = document.getElementById('slider-rough');
  const sMetal = document.getElementById('slider-metal');

  sTrans.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('val-trans').textContent = val.toFixed(2);
    currentMaterial.transmission = val;
    currentMaterial.needsUpdate = true;
  });

  sIor.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('val-ior').textContent = val.toFixed(2);
    currentMaterial.ior = val;
    currentMaterial.needsUpdate = true;
  });

  sRough.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('val-rough').textContent = val.toFixed(2);
    currentMaterial.roughness = val;
    currentMaterial.needsUpdate = true;
  });

  sMetal.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    document.getElementById('val-metal').textContent = val.toFixed(2);
    currentMaterial.metalness = val;
    currentMaterial.needsUpdate = true;
  });

  document.getElementById('preset-glass').addEventListener('click', () => {
    currentMaterial.color.setHex(0xffffff);
    currentMaterial.transmission = 0.96;
    currentMaterial.roughness = 0.05;
    currentMaterial.metalness = 0.0;
    currentMaterial.ior = 1.52;
    sTrans.value = 0.96; sIor.value = 1.52; sRough.value = 0.05; sMetal.value = 0.0;
    document.getElementById('val-trans').textContent = '0.96';
    document.getElementById('val-ior').textContent = '1.52';
    document.getElementById('val-rough').textContent = '0.05';
    document.getElementById('val-metal').textContent = '0.00';
    document.getElementById('mat-label').textContent = 'Optical Glass';
    currentMaterial.needsUpdate = true;
  });

  document.getElementById('preset-titanium').addEventListener('click', () => {
    currentMaterial.color.setHex(0xd0d5dd);
    currentMaterial.transmission = 0.0;
    currentMaterial.roughness = 0.22;
    currentMaterial.metalness = 0.95;
    sTrans.value = 0.0; sRough.value = 0.22; sMetal.value = 0.95;
    document.getElementById('val-trans').textContent = '0.00';
    document.getElementById('val-rough').textContent = '0.22';
    document.getElementById('val-metal').textContent = '0.95';
    document.getElementById('mat-label').textContent = 'Brushed Titanium';
    currentMaterial.needsUpdate = true;
  });

  document.getElementById('preset-emerald').addEventListener('click', () => {
    currentMaterial.color.setHex(0x10b981);
    currentMaterial.transmission = 0.88;
    currentMaterial.roughness = 0.12;
    currentMaterial.metalness = 0.1;
    currentMaterial.ior = 1.62;
    sTrans.value = 0.88; sIor.value = 1.62; sRough.value = 0.12; sMetal.value = 0.1;
    document.getElementById('val-trans').textContent = '0.88';
    document.getElementById('val-ior').textContent = '1.62';
    document.getElementById('val-rough').textContent = '0.12';
    document.getElementById('val-metal').textContent = '0.10';
    document.getElementById('mat-label').textContent = 'Emerald Crystal';
    currentMaterial.needsUpdate = true;
  });

  const wireBtn = document.getElementById('toggle-wireframe');
  wireBtn.addEventListener('click', () => {
    currentMaterial.wireframe = !currentMaterial.wireframe;
    wireBtn.classList.toggle('active', currentMaterial.wireframe);
    currentMaterial.needsUpdate = true;
  });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    velX = 0; velY = 0;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      velX = dx * 0.006;
      velY = dy * 0.006;
      currentMeshGroup.rotation.y += velX;
      currentMeshGroup.rotation.x += velY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (!isDragging) {
    velX = velX * 0.95 + 0.002 * 0.05;
    velY *= 0.95;
    currentMeshGroup.rotation.y += velX;
    currentMeshGroup.rotation.x += velY;
  }

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);
