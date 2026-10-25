// Interactive Panoramic World / Streetscape Exploration
// Horizontal explorable canvas with parallax depth, interactive stations, and procedural Web Audio synthesis.

import { sound } from './audio.ts';

export class PanoramaWorld {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;

  private scrollX: number = 0;
  private targetScrollX: number = 0;
  private maxScrollX: number = 3200;
  private isDragging: boolean = false;
  private startMouseX: number = 0;
  private startScrollX: number = 0;
  private dragVelocity: number = 0;
  private lastDragX: number = 0;

  private time: number = 0;
  private particles: { x: number; y: number; s: number; alpha: number; speed: number }[] = [];

  private stations = [
    {
      id: 'liquid-chrome',
      x: 280,
      title: 'LIQUID CHROME // GPU FLUID',
      subtitle: 'Real-Time GLSL Fluid Dispersion & Fresnel Optics',
      badge: 'CRAFT // GLSL SHADER',
      color: '#5ce1e6',
      link: '/projects/liquid-chrome/',
      icon: '💧'
    },
    {
      id: 'physics-playground',
      x: 820,
      title: '3D PHYSICS PLAYGROUND',
      subtitle: 'Rigid-Body Real-Time Impulse Destruction Engine',
      badge: 'CODE // RIGID BODY',
      color: '#ff0055',
      link: '/projects/physics-playground/',
      icon: '💥'
    },
    {
      id: 'particle-swarm',
      x: 1360,
      title: 'BIOLUMINESCENT SWARM',
      subtitle: '100K Particle Attractors & 3D Curl Noise Field',
      badge: 'CRAFT // GPGPU PARTICLES',
      color: '#00ffcc',
      link: '/projects/particle-swarm/',
      icon: '✨'
    },
    {
      id: 'cyber-tunnel',
      x: 1900,
      title: 'CYBER TUNNEL 4D',
      subtitle: 'Volumetric SDF Sphere Tracing & Non-Euclidean Shaders',
      badge: 'CRAFT // SDF RAYMARCH',
      color: '#ff0077',
      link: '/projects/cyber-tunnel/',
      icon: '🌌'
    },
    {
      id: 'vinyl-turntable',
      x: 2440,
      title: 'ANALOG DECK MK-II',
      subtitle: '3D Turntable Mechanics & Web Audio Scratch DSP',
      badge: 'CRAFT // 3D & DSP',
      color: '#ff9900',
      link: '/projects/vinyl-turntable/',
      icon: '🎧'
    },
    {
      id: 'cloth-origami',
      x: 2980,
      title: 'CLOTH & ORIGAMI',
      subtitle: '3D Verlet Integration & Soft-Body Tear Knife Simulation',
      badge: 'CODE // VERLET PHYSICS',
      color: '#8b5cf6',
      link: '/projects/cloth-origami/',
      icon: '🪁'
    }
  ];

  constructor(container: HTMLElement, canvas: HTMLCanvasElement) {
    this.container = container;
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context for panorama');
    this.ctx = ctx;

    this.initParticles();
    this.bindEvents();
    this.resize();
    this.render();
  }

  private initParticles() {
    this.particles = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.maxScrollX + 1600),
        y: Math.random() * 500,
        s: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.3 + 0.1
      });
    }
  }

  private resize() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight || 480;
  }

  private bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Dragging
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startMouseX = e.clientX;
      this.lastDragX = e.clientX;
      this.startScrollX = this.targetScrollX;
      this.dragVelocity = 0;
      this.canvas.style.cursor = 'grabbing';
      sound.playClick(1.2);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startMouseX;
      this.targetScrollX = this.startScrollX - dx * 1.5;
      this.targetScrollX = Math.max(0, Math.min(this.maxScrollX, this.targetScrollX));

      this.dragVelocity = (e.clientX - this.lastDragX);
      this.lastDragX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
      this.targetScrollX -= this.dragVelocity * 10;
      this.targetScrollX = Math.max(0, Math.min(this.maxScrollX, this.targetScrollX));
    });

    // Touch Support
    let touchStartX = 0;
    let touchStartScroll = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartScroll = this.targetScrollX;
        sound.playClick(1.2);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        this.targetScrollX = touchStartScroll - dx * 1.4;
        this.targetScrollX = Math.max(0, Math.min(this.maxScrollX, this.targetScrollX));
      }
    }, { passive: true });

    // Click on Station Cards to Launch Directly
    this.canvas.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - this.startMouseX) > 8) return;
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const groundY = this.canvas.height - 90;
      const cardW = 280;
      const cardH = 170;
      const cardY = groundY - cardH - 30;

      for (const st of this.stations) {
        const screenX = st.x - this.scrollX;
        if (
          clickX >= screenX - cardW / 2 &&
          clickX <= screenX + cardW / 2 &&
          clickY >= cardY &&
          clickY <= cardY + cardH
        ) {
          sound.playChime();
          window.location.href = st.link;
          break;
        }
      }
    });
  }

  public scrollToStation(xOffset: number) {
    this.targetScrollX = Math.max(0, Math.min(this.maxScrollX, xOffset));
    sound.playChime();
  }

  private render = () => {
    this.time += 0.016;

    // Smooth spring lerp for camera
    this.scrollX += (this.targetScrollX - this.scrollX) * 0.09;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Layer 0: Ambient Horizon Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#07080c');
    bgGrad.addColorStop(0.65, '#0e121b');
    bgGrad.addColorStop(1, '#171d2b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Layer 1: Floating Dust Particles (Far Parallax 0.2x)
    const farShift = this.scrollX * 0.2;
    ctx.fillStyle = '#ffffff';
    for (const p of this.particles) {
      const screenX = (p.x - farShift) % (w + 400);
      const drawX = screenX < -50 ? screenX + w + 450 : screenX;
      ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(this.time * 2 + p.x));
      ctx.beginPath();
      ctx.arc(drawX, p.y % h, p.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Layer 2: Grid Horizon Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const groundY = h - 90;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // Perspective Ground Grid (Parallax 1.0x)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    const gridStep = 60;
    const gridOffset = this.scrollX % gridStep;
    for (let x = -gridOffset; x < w + gridStep; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 80, h);
      ctx.stroke();
    }

    // Layer 3: Interactive World Stations (Parallax 1.0x)
    this.drawStations(groundY);

    this.animId = requestAnimationFrame(this.render);
  };

  private drawStations(groundY: number) {
    const ctx = this.ctx;
    const sx = this.scrollX;

    this.stations.forEach(st => {
      const screenX = st.x - sx;
      if (screenX < -320 || screenX > this.canvas.width + 320) return;

      const cardW = 280;
      const cardH = 170;
      const cardY = groundY - cardH - 30;

      // Card Background Glass
      ctx.save();
      ctx.fillStyle = 'rgba(17, 19, 24, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;

      // Rounded rect
      this.drawRoundedRect(screenX - cardW / 2, cardY, cardW, cardH, 14);
      ctx.fill();
      ctx.stroke();

      // Top Accent Rim Light
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX - cardW / 2 + 14, cardY);
      ctx.lineTo(screenX + cardW / 2 - 14, cardY);
      ctx.stroke();

      // Station Beacon Line down to ground
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(screenX, cardY + cardH);
      ctx.lineTo(screenX, groundY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ground Anchor Point
      ctx.fillStyle = st.color;
      ctx.beginPath();
      ctx.arc(screenX, groundY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Typography inside Station Card
      ctx.font = '600 10px "SF Mono", monospace';
      ctx.fillStyle = st.color;
      ctx.textAlign = 'left';
      ctx.fillText(st.badge, screenX - cardW / 2 + 16, cardY + 28);

      ctx.font = '700 13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(st.title, screenX - cardW / 2 + 16, cardY + 52);

      ctx.font = '400 11px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = '#8e95a0';
      ctx.fillText(st.subtitle, screenX - cardW / 2 + 16, cardY + 76);

      // Interactive Action Hint
      ctx.font = '600 11px "SF Mono", monospace';
      ctx.fillStyle = '#5ce1e6';
      ctx.fillText('Tap to Explore Artifact →', screenX - cardW / 2 + 16, cardY + 140);

      ctx.restore();
    });
  }

  private drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  public destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
