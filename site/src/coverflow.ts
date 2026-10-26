import { sound } from './audio.ts';

export interface CityStamp {
  id: string;
  city: string;
  state: string;
  pincode: string;
  price: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  deepColor: string;
  paperBg: string;
  svgArt: string;
  isCustom?: boolean;
  customImageData?: string;
  customTitle?: string;
  postmarkAngle?: number;
}

export const CITY_STAMPS: CityStamp[] = [
  {
    id: 'mumbai',
    city: 'BOMBAY',
    state: 'MAHARASHTRA',
    pincode: '400001',
    price: '₹25.00',
    tagline: 'Maximum City // Cutting Chai & Sea Breeze',
    primaryColor: '#ff007f', // Rani pink
    secondaryColor: '#ffd700', // Taxi gold
    deepColor: '#1a0826',
    paperBg: '#fffdf5',
    svgArt: `
      <g>
        <path d="M20,180 Q140,110 260,180" fill="none" stroke="#ffd700" stroke-width="4" opacity="0.6"/>
        <path d="M20,195 Q140,125 260,195" fill="none" stroke="#ff007f" stroke-width="3" opacity="0.8"/>
        <!-- Gateway Arch Silhouette -->
        <path d="M90,160 L90,95 Q140,80 190,95 L190,160 Z" fill="#ff007f" opacity="0.9"/>
        <path d="M115,160 L115,115 Q140,102 165,115 L165,160 Z" fill="#1a0826"/>
        <!-- Double Decker & Chai Glass -->
        <rect x="50" y="140" width="30" height="20" rx="3" fill="#ffd700"/>
        <line x1="50" y1="150" x2="80" y2="150" stroke="#1a0826" stroke-width="2"/>
        <polygon points="215,135 235,135 230,160 220,160" fill="#ffffff" opacity="0.85"/>
        <line x1="210" y1="130" x2="225" y2="115" stroke="#ffd700" stroke-width="2" stroke-linecap="round"/>
        <line x1="225" y1="130" x2="240" y2="115" stroke="#ff007f" stroke-width="2" stroke-linecap="round"/>
      </g>`
  },
  {
    id: 'dharwad',
    city: 'DHARWAD',
    state: 'KARNATAKA',
    pincode: '580009',
    price: '₹15.00',
    tagline: 'City of Sur & Pedagogy // IIIT Dharwad',
    primaryColor: '#d97706', // Sandalwood gold
    secondaryColor: '#059669', // Western Ghats emerald
    deepColor: '#1f160b',
    paperBg: '#fffbeb',
    svgArt: `
      <g>
        <!-- Western Ghats Rolling Terraces -->
        <path d="M10,180 Q70,120 140,170 T270,160 L270,200 L10,200 Z" fill="#059669" opacity="0.4"/>
        <path d="M10,185 Q90,135 180,185 T270,180 L270,200 L10,200 Z" fill="#d97706" opacity="0.6"/>
        <!-- IIIT Dharwad Futuristic Pavilion Roof -->
        <polygon points="70,135 140,75 210,135" fill="none" stroke="#d97706" stroke-width="3.5"/>
        <line x1="140" y1="75" x2="140" y2="155" stroke="#ffd700" stroke-width="2.5"/>
        <line x1="105" y1="105" x2="175" y2="105" stroke="#ffd700" stroke-width="2"/>
        <!-- Carnatic Tanpura Strings & Peda Tin -->
        <line x1="40" y1="80" x2="40" y2="170" stroke="#059669" stroke-width="2"/>
        <circle cx="40" cy="170" r="14" fill="#d97706"/>
        <circle cx="235" cy="150" r="16" fill="#ffd700" stroke="#d97706" stroke-width="2"/>
        <text x="235" y="154" font-size="8" font-family="sans-serif" font-weight="bold" fill="#1f160b" text-anchor="middle">PEDA</text>
      </g>`
  },
  {
    id: 'bengaluru',
    city: 'BENGALURU',
    state: 'KARNATAKA',
    pincode: '560001',
    price: '₹50.00',
    tagline: 'Silicon Garden // Filter Coffee & 60 FPS',
    primaryColor: '#00f0ff', // Electric peacock cyan
    secondaryColor: '#bdff52', // Neon lime
    deepColor: '#071626',
    paperBg: '#f0fdf4',
    svgArt: `
      <g>
        <!-- Cyber Banyan Circuit Grid -->
        <path d="M140,170 L140,110 M140,110 L90,80 M140,110 L190,80 M90,80 L60,50 M190,80 L220,50" 
              stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="60" cy="50" r="6" fill="#bdff52"/>
        <circle cx="220" cy="50" r="6" fill="#bdff52"/>
        <circle cx="140" cy="70" r="5" fill="#00f0ff"/>
        <!-- Steel Tumbler & Davarah Coffee Froth -->
        <polygon points="120,135 160,135 155,175 125,175" fill="#ffffff" stroke="#00f0ff" stroke-width="2"/>
        <ellipse cx="140" cy="135" rx="20" ry="6" fill="#bdff52"/>
        <!-- Vidhana Soudha Dome Silhouette -->
        <path d="M120,85 Q140,65 160,85 Z" fill="#00f0ff" opacity="0.8"/>
      </g>`
  },
  {
    id: 'delhi',
    city: 'DELHI',
    state: 'NCR',
    pincode: '110001',
    price: '₹30.00',
    tagline: 'Dilwalon Ki Dilli // Heritage & Architecture',
    primaryColor: '#dc2626', // Imperial crimson
    secondaryColor: '#eab308', // Zari gold
    deepColor: '#1c0a0a',
    paperBg: '#fef2f2',
    svgArt: `
      <g>
        <!-- India Gate Grand Arch -->
        <path d="M85,170 L85,90 L195,90 L195,170 L165,170 L165,125 Q140,110 115,125 L115,170 Z" fill="#dc2626" opacity="0.95"/>
        <rect x="95" y="78" width="90" height="12" fill="#eab308"/>
        <!-- Mughal Jali Floral Rosette -->
        <circle cx="140" cy="50" r="18" fill="none" stroke="#eab308" stroke-width="2"/>
        <circle cx="140" cy="50" r="10" fill="none" stroke="#dc2626" stroke-width="2"/>
        <path d="M140,32 L140,68 M122,50 L158,50 M127,37 L153,63 M127,63 L153,37" stroke="#eab308" stroke-width="1.5"/>
      </g>`
  },
  {
    id: 'varanasi',
    city: 'VARANASI',
    state: 'UTTAR PRADESH',
    pincode: '221001',
    price: '₹20.00',
    tagline: 'Timeless Ghats // Sub-Millisecond Eternity',
    primaryColor: '#ea580c', // Marigold saffron
    secondaryColor: '#fbbf24', // Brass gold
    deepColor: '#180e05',
    paperBg: '#fff7ed',
    svgArt: `
      <g>
        <!-- River Ghat Stepped Terraces -->
        <polygon points="20,185 260,185 260,140 220,140 220,150 180,150 180,160 140,160 140,170 20,170" fill="#ea580c" opacity="0.8"/>
        <!-- Multi-tiered Brass Aarti Lamp -->
        <polygon points="135,160 145,160 142,120 138,120" fill="#fbbf24"/>
        <circle cx="140" cy="115" r="5" fill="#ea580c"/>
        <circle cx="125" cy="125" r="4" fill="#fbbf24"/>
        <circle cx="155" cy="125" r="4" fill="#fbbf24"/>
        <circle cx="115" cy="135" r="3.5" fill="#ea580c"/>
        <circle cx="165" cy="135" r="3.5" fill="#ea580c"/>
        <!-- Crescent Moon & Temple Spire -->
        <path d="M210,60 A14,14 0 0,0 224,46 A14,14 0 1,1 210,60 Z" fill="#fbbf24"/>
        <polygon points="60,140 75,70 90,140" fill="#ea580c"/>
      </g>`
  },
  {
    id: 'kolkata',
    city: 'KOLKATA',
    state: 'WEST BENGAL',
    pincode: '700001',
    price: '₹10.00',
    tagline: 'City of Joy // Ambassador Taxi & Adda',
    primaryColor: '#facc15', // Cadmium yellow
    secondaryColor: '#b91c1c', // Terracotta red
    deepColor: '#171404',
    paperBg: '#fefce8',
    svgArt: `
      <g>
        <!-- Howrah Bridge Cantilever Truss Silhouette -->
        <polygon points="40,140 80,60 100,140" fill="none" stroke="#b91c1c" stroke-width="3"/>
        <polygon points="240,140 200,60 180,140" fill="none" stroke="#b91c1c" stroke-width="3"/>
        <line x1="80" y1="60" x2="200" y2="60" stroke="#facc15" stroke-width="4"/>
        <line x1="40" y1="120" x2="240" y2="120" stroke="#b91c1c" stroke-width="2"/>
        <!-- Classic Yellow Ambassador Taxi -->
        <rect x="95" y="145" width="90" height="25" rx="5" fill="#facc15" stroke="#171404" stroke-width="2"/>
        <path d="M115,145 L130,128 L165,128 L175,145 Z" fill="#ffffff" stroke="#171404" stroke-width="2"/>
        <circle cx="115" cy="170" r="8" fill="#171404"/>
        <circle cx="165" cy="170" r="8" fill="#171404"/>
      </g>`
  },
  {
    id: 'goa',
    city: 'GOA',
    state: 'COASTAL',
    pincode: '403001',
    price: '₹40.00',
    tagline: 'Susegad Coast // Palm Tides & Golden Hour',
    primaryColor: '#06b6d4', // Coastal ocean cyan
    secondaryColor: '#f97316', // Sunset orange
    deepColor: '#032029',
    paperBg: '#ecfeff',
    svgArt: `
      <g>
        <!-- Mandovi Waves & Golden Sunset Sun -->
        <circle cx="140" cy="100" r="32" fill="#f97316" opacity="0.85"/>
        <path d="M10,165 Q70,145 140,165 T270,165 L270,200 L10,200 Z" fill="#06b6d4" opacity="0.9"/>
        <path d="M10,180 Q80,160 150,180 T270,180 L270,200 L10,200 Z" fill="#032029" opacity="0.7"/>
        <!-- Coconut Palm Silhouette -->
        <path d="M50,175 Q60,110 85,80" fill="none" stroke="#032029" stroke-width="4"/>
        <path d="M85,80 Q50,70 30,85 M85,80 Q70,50 65,30 M85,80 Q105,55 125,50 M85,80 Q115,75 130,95" 
              fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
      </g>`
  },
  {
    id: 'jaipur',
    city: 'JAIPUR',
    state: 'RAJASTHAN',
    pincode: '302001',
    price: '₹35.00',
    tagline: 'The Pink City // Block Print & Palaces',
    primaryColor: '#e11d48', // Terracotta rose
    secondaryColor: '#1d4ed8', // Royal cobalt
    deepColor: '#210610',
    paperBg: '#fff1f2',
    svgArt: `
      <g>
        <!-- Hawa Mahal Honeycomb Jharokhas -->
        <path d="M80,170 L80,95 Q140,65 200,95 L200,170 Z" fill="#e11d48"/>
        <!-- Windows -->
        <path d="M100,110 Q115,95 130,110 L130,130 L100,130 Z" fill="#fff1f2"/>
        <path d="M150,110 Q165,95 180,110 L180,130 L150,130 Z" fill="#fff1f2"/>
        <path d="M125,135 Q140,120 155,135 L155,155 L125,155 Z" fill="#1d4ed8"/>
        <!-- Block Print Brass Elephant Profile -->
        <circle cx="230" cy="150" r="18" fill="none" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="230" cy="150" r="14" fill="#e11d48"/>
      </g>`
  }
];

export class CoverplayEngine {
  private container: HTMLElement;
  private track: HTMLElement;
  private currentIndex: number = 0;
  private stamps: CityStamp[] = [...CITY_STAMPS];
  private isDragging: boolean = false;
  private startX: number = 0;
  private currentDragX: number = 0;
  private userPhotoImg: HTMLImageElement | null = null;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Coverplay container #${containerId} not found`);
    this.container = el;
    this.track = document.getElementById('coverflow-track') as HTMLElement;

    this.renderStamps();
    this.initEvents();
    this.updateCoverFlow(0, false);
    this.initPhotoBooth();
  }

  // 1. Render all Stamp Cards inside 3D Track
  private renderStamps() {
    if (!this.track) return;
    this.track.innerHTML = '';

    this.stamps.forEach((stamp, index) => {
      const card = document.createElement('div');
      card.className = `coverflow-card ${stamp.isCustom ? 'custom-stamp' : ''}`;
      card.dataset.index = index.toString();
      card.dataset.id = stamp.id;

      card.innerHTML = `
        <div class="stamp-perforations"></div>
        <div class="stamp-inner" style="--stamp-primary: ${stamp.primaryColor}; --stamp-sec: ${stamp.secondaryColor}; --stamp-deep: ${stamp.deepColor}; background: ${stamp.paperBg};">
          <div class="stamp-header">
            <span class="stamp-post-brand">INDIA POST // भारत डाक</span>
            <span class="stamp-price">${stamp.price}</span>
          </div>

          <div class="stamp-art-stage">
            ${stamp.customImageData 
              ? `<img src="${stamp.customImageData}" class="stamp-custom-img" alt="${stamp.city} custom user portrait">`
              : `<svg viewBox="0 0 280 200" class="stamp-svg-illustration">${stamp.svgArt}</svg>`}
            
            <!-- Rubber Postal Cancellation Stamp -->
            <div class="rubber-postmark" style="transform: rotate(${stamp.postmarkAngle || -18}deg);">
              <div class="postmark-circle">
                <span class="pm-top">${stamp.city} G.P.O.</span>
                <span class="pm-mid">26 OCT 2026</span>
                <span class="pm-bot">${stamp.pincode} // AIR</span>
              </div>
              <div class="postmark-waves">
                <div class="pm-wave"></div>
                <div class="pm-wave"></div>
                <div class="pm-wave"></div>
              </div>
            </div>
          </div>

          <div class="stamp-footer">
            <div class="stamp-city-meta">
              <span class="stamp-city-name">${stamp.customTitle || stamp.city}</span>
              <span class="stamp-pincode">${stamp.state} &bull; ${stamp.pincode}</span>
            </div>
            <span class="stamp-ornament">✦</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (this.currentIndex !== index) {
          this.goToIndex(index);
        } else {
          // If already active, sync to Photo Booth
          this.loadStampIntoBooth(stamp);
        }
      });

      this.track.appendChild(card);
    });

    this.updateScrubber();
  }

  // 2. Apple Cover Flow 3D Matrix Transformations
  private updateCoverFlow(targetIndex: number, playSound: boolean = true) {
    this.currentIndex = Math.max(0, Math.min(this.stamps.length - 1, targetIndex));
    const cards = this.track.querySelectorAll<HTMLElement>('.coverflow-card');

    cards.forEach((card, i) => {
      const offset = i - this.currentIndex;

      if (offset === 0) {
        // Active Center Card
        card.style.transform = `translateX(0px) translateZ(140px) rotateY(0deg) scale(1.04)`;
        card.style.zIndex = '100';
        card.style.opacity = '1';
        card.style.filter = 'brightness(1.04) drop-shadow(0 20px 40px rgba(0,0,0,0.7))';
        card.classList.add('is-active');
      } else if (offset < 0) {
        // Left Stack (Tilted Away)
        const x = offset * 110 - 70;
        const z = -Math.abs(offset) * 60 - 50;
        card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(56deg) scale(0.92)`;
        card.style.zIndex = `${50 - Math.abs(offset)}`;
        card.style.opacity = `${Math.max(0.35, 1 - Math.abs(offset) * 0.18)}`;
        card.style.filter = 'brightness(0.65) drop-shadow(0 10px 20px rgba(0,0,0,0.5))';
        card.classList.remove('is-active');
      } else {
        // Right Stack (Tilted Away)
        const x = offset * 110 + 70;
        const z = -Math.abs(offset) * 60 - 50;
        card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(-56deg) scale(0.92)`;
        card.style.zIndex = `${50 - Math.abs(offset)}`;
        card.style.opacity = `${Math.max(0.35, 1 - Math.abs(offset) * 0.18)}`;
        card.style.filter = 'brightness(0.65) drop-shadow(0 10px 20px rgba(0,0,0,0.5))';
        card.classList.remove('is-active');
      }
    });

    this.updateActiveDetails();
    this.updateScrubber();

    if (playSound) {
      sound.playClick(1.2);
    }
  }

  public goToIndex(index: number) {
    this.updateCoverFlow(index, true);
  }

  public next() {
    if (this.currentIndex < this.stamps.length - 1) {
      this.goToIndex(this.currentIndex + 1);
    }
  }

  public prev() {
    if (this.currentIndex > 0) {
      this.goToIndex(this.currentIndex - 1);
    }
  }

  public goToCity(cityId: string) {
    const idx = this.stamps.findIndex(s => s.id.toLowerCase() === cityId.toLowerCase());
    if (idx !== -1) {
      this.goToIndex(idx);
    }
  }

  private updateActiveDetails() {
    const stamp = this.stamps[this.currentIndex];
    const titleEl = document.getElementById('coverplay-city-title');
    const metaEl = document.getElementById('coverplay-city-meta');
    const tagEl = document.getElementById('coverplay-city-tag');

    if (titleEl) titleEl.textContent = `${stamp.city} // ${stamp.price}`;
    if (metaEl) metaEl.textContent = `${stamp.state} • PIN ${stamp.pincode}`;
    if (tagEl) tagEl.textContent = stamp.tagline;
  }

  private updateScrubber() {
    const dotsContainer = document.getElementById('coverflow-dots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    this.stamps.forEach((s, idx) => {
      const dot = document.createElement('button');
      dot.className = `coverflow-dot ${idx === this.currentIndex ? 'active' : ''}`;
      dot.title = `${s.city} (PIN ${s.pincode})`;
      dot.setAttribute('aria-label', `Jump to ${s.city}`);
      dot.addEventListener('click', () => this.goToIndex(idx));
      dotsContainer.appendChild(dot);
    });
  }

  // 3. User Touch, Mouse Wheel & Keyboard Controls
  private initEvents() {
    const prevBtn = document.getElementById('coverflow-prev');
    const nextBtn = document.getElementById('coverflow-next');

    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());

    // Mouse wheel scrubbing
    this.container.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20) {
        e.preventDefault();
        if (e.deltaX > 20 || e.deltaY > 20) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: false });

    // Drag / Touch gestures
    this.track.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.currentDragX = e.clientX;
      this.track.setPointerCapture(e.pointerId);
    });

    this.track.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      this.currentDragX = e.clientX;
    });

    const endDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const deltaX = this.currentDragX - this.startX;
      if (deltaX < -40) {
        this.next();
      } else if (deltaX > 40) {
        this.prev();
      }
    };

    this.track.addEventListener('pointerup', endDrag);
    this.track.addEventListener('pointercancel', endDrag);

    // Keyboard navigation when near Coverplay
    window.addEventListener('keydown', (e) => {
      const rect = this.container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft') {
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.next();
      }
    });
  }

  // 4. Interactive Postal Stamp Photo Booth Engine
  private initPhotoBooth() {
    const boothCitySelect = document.getElementById('booth-city-select') as HTMLSelectElement;
    const boothNameInput = document.getElementById('booth-name-input') as HTMLInputElement;
    const boothPriceSelect = document.getElementById('booth-price-select') as HTMLSelectElement;
    const boothFilterSelect = document.getElementById('booth-filter-select') as HTMLSelectElement;
    const photoFileInput = document.getElementById('booth-file-input') as HTMLInputElement;
    const selfieCamBtn = document.getElementById('booth-cam-btn');
    const stampThumpBtn = document.getElementById('booth-thump-btn');
    const downloadStampBtn = document.getElementById('booth-download-btn');
    const addToCoverBtn = document.getElementById('booth-add-btn');

    let postmarkAngle = -15;

    // Populate City Select
    if (boothCitySelect) {
      boothCitySelect.innerHTML = '';
      this.stamps.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.city} (PIN ${s.pincode}) — ${s.price}`;
        boothCitySelect.appendChild(opt);
      });

      boothCitySelect.addEventListener('change', () => {
        this.renderBoothPreview();
      });
    }

    if (boothNameInput) {
      boothNameInput.addEventListener('input', () => this.renderBoothPreview());
    }

    if (boothPriceSelect) {
      boothPriceSelect.addEventListener('change', () => this.renderBoothPreview());
    }

    if (boothFilterSelect) {
      boothFilterSelect.addEventListener('change', () => this.renderBoothPreview());
    }

    // File Upload Handler
    if (photoFileInput) {
      photoFileInput.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              this.userPhotoImg = img;
              this.renderBoothPreview();
            };
            img.src = evt.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Live Webcam Selfie Snap
    if (selfieCamBtn) {
      selfieCamBtn.addEventListener('click', async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          const video = document.createElement('video');
          video.srcObject = stream;
          await video.play();

          // Quick snap after 500ms
          setTimeout(() => {
            const snapCanvas = document.createElement('canvas');
            snapCanvas.width = video.videoWidth || 640;
            snapCanvas.height = video.videoHeight || 480;
            const sctx = snapCanvas.getContext('2d');
            if (sctx) {
              sctx.drawImage(video, 0, 0);
              const img = new Image();
              img.onload = () => {
                this.userPhotoImg = img;
                this.renderBoothPreview();
                sound.playClick(1.5);
              };
              img.src = snapCanvas.toDataURL('image/png');
            }
            stream.getTracks().forEach(t => t.stop());
          }, 600);
        } catch (err) {
          alert('Camera access unavailable or declined. Please use the image upload button!');
        }
      });
    }

    // Thump Rubber Stamp button
    if (stampThumpBtn) {
      stampThumpBtn.addEventListener('click', () => {
        postmarkAngle = (Math.random() * 24 - 12);
        sound.playStampThump();
        this.renderBoothPreview(postmarkAngle);
      });
    }

    // Download Stamp PNG
    if (downloadStampBtn) {
      downloadStampBtn.addEventListener('click', () => {
        sound.playStampThump();
        const canvas = document.getElementById('booth-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const link = document.createElement('a');
        const cityId = boothCitySelect?.value || 'stamp';
        link.download = `IndiaPost_Stamp_${cityId.toUpperCase()}_2026.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }

    // Add Minted Stamp directly to 3D Cover Flow
    if (addToCoverBtn) {
      addToCoverBtn.addEventListener('click', () => {
        const canvas = document.getElementById('booth-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const cityId = boothCitySelect?.value || 'mumbai';
        const template = this.stamps.find(s => s.id === cityId) || this.stamps[0];

        const customStamp: CityStamp = {
          ...template,
          id: `custom-${Date.now()}`,
          city: (boothNameInput?.value || template.city).toUpperCase(),
          customTitle: (boothNameInput?.value || template.city).toUpperCase(),
          price: boothPriceSelect?.value || template.price,
          isCustom: true,
          customImageData: canvas.toDataURL('image/png'),
          postmarkAngle: postmarkAngle
        };

        this.stamps.splice(this.currentIndex + 1, 0, customStamp);
        this.renderStamps();
        this.goToIndex(this.currentIndex + 1);
        sound.playChime();
      });
    }

    // Initial render
    this.renderBoothPreview();
  }

  // Sync selected cover stamp to photo booth
  private loadStampIntoBooth(stamp: CityStamp) {
    const boothCitySelect = document.getElementById('booth-city-select') as HTMLSelectElement;
    if (boothCitySelect) {
      boothCitySelect.value = stamp.id.startsWith('custom') ? 'mumbai' : stamp.id;
      this.renderBoothPreview();
    }
    const boothSec = document.getElementById('photo-booth-workspace');
    if (boothSec) {
      boothSec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Draw High-Resolution Postal Stamp to Canvas
  private renderBoothPreview(angleOverride?: number) {
    const canvas = document.getElementById('booth-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 480;
    const height = 580;
    canvas.width = width;
    canvas.height = height;

    const cityId = (document.getElementById('booth-city-select') as HTMLSelectElement)?.value || 'mumbai';
    const stamp = this.stamps.find(s => s.id === cityId) || this.stamps[0];
    const nameText = ((document.getElementById('booth-name-input') as HTMLInputElement)?.value || stamp.city).toUpperCase();
    const priceText = (document.getElementById('booth-price-select') as HTMLSelectElement)?.value || stamp.price;
    const filter = (document.getElementById('booth-filter-select') as HTMLSelectElement)?.value || 'desi';

    // 1. Perforated Stamp Edge Base (Paper Background)
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, width, height);

    // Serrated Perforations (White Stamp Body with Punched Holes)
    ctx.save();
    ctx.fillStyle = stamp.paperBg || '#fffdf5';
    ctx.fillRect(16, 16, width - 32, height - 32);

    // Punch edge holes
    const holeRadius = 6;
    const step = 20;
    ctx.fillStyle = '#111318';

    // Top & Bottom holes
    for (let x = 16; x <= width - 16; x += step) {
      ctx.beginPath();
      ctx.arc(x, 16, holeRadius, 0, Math.PI * 2);
      ctx.arc(x, height - 16, holeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Left & Right holes
    for (let y = 16; y <= height - 16; y += step) {
      ctx.beginPath();
      ctx.arc(16, y, holeRadius, 0, Math.PI * 2);
      ctx.arc(width - 16, y, holeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Inner Decorative Border
    ctx.strokeStyle = stamp.primaryColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(34, 34, width - 68, height - 68);

    ctx.strokeStyle = stamp.secondaryColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 3. Stamp Header: India Post + Price
    ctx.fillStyle = stamp.deepColor;
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.fillText('INDIA POST // भारत डाक', 52, 68);

    ctx.fillStyle = stamp.primaryColor;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(priceText, width - 52, 70);
    ctx.textAlign = 'left';

    // 4. Center Artwork Stage
    const artX = 52;
    const artY = 90;
    const artW = width - 104;
    const artH = 340;

    // Fill art background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(artX, artY, artW, artH);

    // Apply Filter / Artwork
    if (this.userPhotoImg && this.userPhotoImg.complete && this.userPhotoImg.naturalWidth > 0) {
      ctx.drawImage(this.userPhotoImg, artX, artY, artW, artH);
      this.applyCanvasFilter(ctx, artX, artY, artW, artH, filter, stamp);
    } else {
      // Default City Art fallback
      ctx.fillStyle = stamp.primaryColor + '20';
      ctx.fillRect(artX, artY, artW, artH);
      ctx.fillStyle = stamp.deepColor;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stamp.city, width / 2, artY + 160);
      ctx.font = '13px monospace';
      ctx.fillText(stamp.tagline, width / 2, artY + 195);
      ctx.textAlign = 'left';
    }

    // 5. Postmark Rubber Stamp Overlay
    const angle = (angleOverride !== undefined ? angleOverride : -16) * Math.PI / 180;
    ctx.save();
    ctx.translate(width - 140, artY + 90);
    ctx.rotate(angle);

    ctx.strokeStyle = '#00000088';
    ctx.lineWidth = 2.5;

    // Double circle postmark
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#00000099';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${stamp.city} G.P.O.`, 0, -22);
    ctx.font = 'bold 10px monospace';
    ctx.fillText('26 OCT 2026', 0, 3);
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`AIR // PIN ${stamp.pincode}`, 0, 26);

    // Wavy Cancellation Lines
    ctx.beginPath();
    for (let wave = 0; wave < 3; wave++) {
      const wy = -10 + wave * 10;
      ctx.moveTo(55, wy);
      ctx.bezierCurveTo(70, wy - 5, 85, wy + 5, 100, wy);
      ctx.bezierCurveTo(115, wy - 5, 130, wy + 5, 145, wy);
    }
    ctx.stroke();
    ctx.restore();

    // 6. Stamp Footer: City Name & PIN
    ctx.fillStyle = stamp.deepColor;
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.fillText(nameText, 52, height - 76);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText(`${stamp.state} • PIN ${stamp.pincode} // COMMEMORATIVE`, 52, height - 54);

    ctx.fillStyle = stamp.primaryColor;
    ctx.font = '18px serif';
    ctx.fillText('✦ ❖ ✦', width - 110, height - 60);
  }

  private applyCanvasFilter(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    filter: string,
    _stamp: CityStamp
  ) {
    if (filter === 'normal') return;

    const imgData = ctx.getImageData(x, y, w, h);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

      if (filter === 'halftone') {
        // High contrast postal duotone
        const val = avg > 128 ? 255 : 30;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      } else if (filter === 'sepia') {
        // 1970s Vintage India Post Sepia
        d[i] = Math.min(255, (avg * 1.1) + 40);
        d[i + 1] = Math.min(255, (avg * 0.95) + 20);
        d[i + 2] = Math.min(255, (avg * 0.7));
      } else if (filter === 'desi') {
        // Vibrant Desi Pop Duotone
        const t = avg / 255;
        // Blend between secondary (dark) and primary (light)
        d[i] = Math.floor(t * 255);
        d[i + 1] = Math.floor((1 - t) * 80 + t * 180);
        d[i + 2] = Math.floor((1 - t) * 200 + t * 50);
      }
    }

    ctx.putImageData(imgData, x, y);
  }
}
