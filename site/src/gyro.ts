import * as THREE from 'three';

export class GyroscopeScene {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private ringOuter!: THREE.Mesh;
  private ringMid!: THREE.Mesh;
  private ringInner!: THREE.Mesh;
  private core!: THREE.Mesh;
  private coreLight!: THREE.PointLight;

  private targetTiltX: number = 0;
  private targetTiltY: number = 0;
  private currentTiltX: number = 0;
  private currentTiltY: number = 0;

  private isDragging: boolean = false;
  private previousMouseX: number = 0;
  private previousMouseY: number = 0;
  private dragVelocityX: number = 0;
  private dragVelocityY: number = 0;

  private animFrameId: number | null = null;
  private frameTimes: number[] = [];
  private lastTime: number = performance.now();
  private fpsElement: HTMLElement | null = null;

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;
    this.fpsElement = document.getElementById('hud-fps');
    this.init();
  }

  private init() {
    try {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 7.5);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Aerospace Titanium Outer Ring
      const titaniumMat = new THREE.MeshStandardMaterial({
        color: 0x3a3e47,
        metalness: 0.94,
        roughness: 0.22
      });

      // Warm Champagne Brass Mid Ring
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xc8a265,
        metalness: 0.92,
        roughness: 0.24
      });

      // Polished Platinum-Silver Inner Ring
      const platinumMat = new THREE.MeshStandardMaterial({
        color: 0xe8edf2,
        metalness: 0.96,
        roughness: 0.14
      });

      // Refractive Optical Crystal Core
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.98,
        opacity: 1,
        transparent: true,
        roughness: 0.04,
        ior: 1.52,
        reflectivity: 0.9
      });

      // Ring Geometries
      this.ringOuter = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.08, 24, 80), titaniumMat);
      this.ringMid = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.07, 20, 64), brassMat);
      this.ringInner = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 20, 64), platinumMat);
      this.core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 3), glassMat);

      // Subtle Warm Core Illumination
      this.coreLight = new THREE.PointLight(0xffecd1, 2.2, 6);
      this.scene.add(this.coreLight);

      this.scene.add(this.ringOuter);
      this.scene.add(this.ringMid);
      this.scene.add(this.ringInner);
      this.scene.add(this.core);

      // Architectural Studio Lighting
      const light1 = new THREE.DirectionalLight(0xfff8ee, 2.6);
      light1.position.set(5, 8, 5);
      this.scene.add(light1);

      const light2 = new THREE.DirectionalLight(0xd1e0ff, 1.4);
      light2.position.set(-6, -4, -3);
      this.scene.add(light2);

      const ambient = new THREE.AmbientLight(0x0f1115, 1.8);
      this.scene.add(ambient);

      this.bindEvents();
      this.animate();
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to static poster:', e);
      this.canvas.style.display = 'none';
      const poster = document.createElement('img');
      poster.src = '/img/gyro-poster.png';
      poster.className = 'hero-poster-fallback';
      poster.alt = 'Refractive Gyroscope 3D Hero';
      this.container.appendChild(poster);
    }
  }

  private bindEvents() {
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    this.canvas.addEventListener('dblclick', () => this.onCoreDoubleClick());
    window.addEventListener('resize', () => this.onResize());

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.isDragging = true;
        this.previousMouseX = e.touches[0].clientX;
        this.previousMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - this.previousMouseX;
        const deltaY = e.touches[0].clientY - this.previousMouseY;
        this.dragVelocityX = deltaX * 0.005;
        this.dragVelocityY = deltaY * 0.005;
        this.ringOuter.rotation.y += this.dragVelocityX;
        this.ringMid.rotation.x += this.dragVelocityY;
        this.previousMouseX = e.touches[0].clientX;
        this.previousMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  public setTiltByDiscipline(discipline: 'code' | 'craft') {
    this.targetTiltY = discipline === 'code' ? -0.45 : 0.45;
  }

  private onMouseMove(e: MouseEvent) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.previousMouseX;
      const deltaY = e.clientY - this.previousMouseY;
      this.dragVelocityX = deltaX * 0.005;
      this.dragVelocityY = deltaY * 0.005;
      this.ringOuter.rotation.y += this.dragVelocityX;
      this.ringMid.rotation.x += this.dragVelocityY;
      this.previousMouseX = e.clientX;
      this.previousMouseY = e.clientY;
    }

    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetTiltY = normX * 0.45;
    this.targetTiltX = -normY * 0.25;
  }

  private onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.previousMouseX = e.clientX;
    this.previousMouseY = e.clientY;
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onCoreDoubleClick() {
    let scale = 1.0;
    const pulseInterval = setInterval(() => {
      scale += 0.06;
      if (this.core) this.core.scale.set(scale, scale, scale);
      if (scale >= 1.4) {
        clearInterval(pulseInterval);
        const shrinkInterval = setInterval(() => {
          scale -= 0.05;
          if (this.core) this.core.scale.set(scale, scale, scale);
          if (scale <= 1.0) {
            if (this.core) this.core.scale.set(1, 1, 1);
            clearInterval(shrinkInterval);
          }
        }, 16);
      }
    }, 16);
  }

  private onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate() {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.frameTimes.push(1000 / delta);
    if (this.frameTimes.length > 30) this.frameTimes.shift();
    const avgFps = Math.round(this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length);
    if (this.fpsElement && avgFps) this.fpsElement.textContent = avgFps.toString();

    // Spring interpolation
    this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.06;
    this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.06;

    // Inertia decay
    if (!this.isDragging) {
      this.dragVelocityX *= 0.94;
      this.dragVelocityY *= 0.94;
      this.ringOuter.rotation.y += this.dragVelocityX;
      this.ringMid.rotation.x += this.dragVelocityY;
    }

    // Continuous ring differential spin
    this.ringOuter.rotation.z += 0.0025;
    this.ringMid.rotation.y += 0.005;
    this.ringInner.rotation.x += 0.008;
    this.core.rotation.y += 0.01;

    if (this.coreLight) {
      this.coreLight.intensity = 2.0 + Math.sin(now * 0.002) * 0.35;
    }

    this.scene.rotation.x = this.currentTiltX;
    this.scene.rotation.y = this.currentTiltY;

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.scene) {
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
