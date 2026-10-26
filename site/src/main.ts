import { GyroscopeScene } from './gyro.ts';
import { sound } from './audio.ts';
import { CoverplayEngine } from './coverflow.ts';

interface Project {
  id: string;
  title: string;
  side: 'code' | 'craft';
  summary: string;
  role: string;
  stack: string[];
  outcomes: string[];
  links: { label: string; url: string }[];
  media: { type: string; url: string; alt?: string }[];
  underTheHood: { type: string; assetPath: string };
  publish: boolean;
}

let allProjects: Project[] = [];
let gyroInstance: GyroscopeScene | null = null;
let coverplayInstance: CoverplayEngine | null = null;

document.addEventListener('DOMContentLoaded', async () => {
  initAudioControls();
  initHeroStage();
  initCoverplay();
  await loadProjects();
  initModals();
  initPortalTiltEffects();
  initGlobalSoundEffects();
  initSmoothScroll();
});

function initCoverplay() {
  try {
    coverplayInstance = new CoverplayEngine('coverplay');
    (window as unknown as { coverplayInstance: CoverplayEngine }).coverplayInstance = coverplayInstance;
  } catch (err) {
    console.warn('Coverplay init skipped or container not found:', err);
  }
}

// 1. Audio Controls & HUD Sound Toggle
function initAudioControls() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  const soundLabel = document.getElementById('sound-label');
  if (!soundBtn || !soundLabel) return;

  soundBtn.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    soundLabel.textContent = isMuted ? 'MUTE' : 'AUDIO ON';
    soundBtn.classList.toggle('active', !isMuted);
    if (!isMuted) sound.playChime();
  });
}

// 2. Hero Stage 3D Gyroscope & Sound Impulse
function initHeroStage() {
  const heroContainer = document.getElementById('hero');
  const gyroCanvas = document.getElementById('gyro-canvas') as HTMLCanvasElement;

  if (heroContainer && gyroCanvas) {
    try {
      gyroInstance = new GyroscopeScene(heroContainer, gyroCanvas);
    } catch (e) {
      console.warn('Failed to initialize 3D hero stage:', e);
    }
  }

  const pulseBtn = document.getElementById('hero-pulse-btn');
  if (pulseBtn) {
    pulseBtn.addEventListener('click', () => {
      sound.playSubBassTone(0.6);
      if (gyroInstance) {
        gyroInstance.setTiltByDiscipline(Math.random() > 0.5 ? 'code' : 'craft');
      }
    });
  }

  const hornBtn = document.getElementById('persona-horn-btn');
  if (hornBtn) {
    hornBtn.addEventListener('click', () => {
      sound.playTataHorn(0.75);
    });
  }

  const rhythmBtn = document.getElementById('persona-rhythm-btn');
  if (rhythmBtn) {
    rhythmBtn.addEventListener('click', () => {
      sound.playDesiSitarPluck();
    });
  }

  const chimeBtn = document.getElementById('persona-chime-btn');
  if (chimeBtn) {
    chimeBtn.addEventListener('click', () => {
      sound.playChime();
    });
  }

  // Quick City Navigation (if any present)
  document.querySelectorAll<HTMLButtonElement>('.hero-city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cityId = chip.getAttribute('data-city');
      if (cityId && coverplayInstance) {
        coverplayInstance.goToCity(cityId);
        sound.playStampThump();
        const coverplaySection = document.getElementById('coverplay');
        if (coverplaySection) {
          coverplaySection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// 3. Load Projects for Under the Hood Modals
async function loadProjects() {
  try {
    const res = await fetch('/data/projects.json');
    allProjects = await res.json();
    bindHoodButtons();
  } catch (err) {
    console.error('Failed to load projects.json:', err);
  }
}

function bindHoodButtons() {
  document.querySelectorAll<HTMLButtonElement>('.hood-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const project = allProjects.find(p => p.id === id);
      if (project) {
        sound.playClick(0.9);
        openHoodModal(project);
      }
    });
  });
}

// 4. Subtle 3D Card Tilt on Pointer Move
function initPortalTiltEffects() {
  const portals = document.querySelectorAll<HTMLElement>('.exhibition-portal');

  portals.forEach(portal => {
    portal.addEventListener('pointermove', (e) => {
      const rect = portal.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      portal.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateY(-4px)`;
    });

    portal.addEventListener('pointerleave', () => {
      portal.style.transform = '';
    });
  });
}

// 5. Smooth Anchor Scrolling
function initSmoothScroll() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href')?.slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        sound.playClick(1.2);
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// 6. Global Sound Effects
function initGlobalSoundEffects() {
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => sound.playHover(1450));
    el.addEventListener('click', () => sound.playClick(1.0));
  });
}

// 7. Modals: Project Builder & Under The Hood
function initModals() {
  const hireModal = document.getElementById('hire-modal');
  const openHireBtn = document.getElementById('open-hire-modal');
  const closeHireBtn = document.getElementById('close-hire-modal');

  const hoodModal = document.getElementById('hood-modal');
  const closeHoodBtn = document.getElementById('close-hood-modal');

  const cvModal = document.getElementById('cv-modal');
  const closeCvBtn = document.getElementById('close-cv-modal');

  const bragModal = document.getElementById('brag-modal');
  const closeBragBtn = document.getElementById('close-brag-modal');
  const copyBragBtn = document.getElementById('copy-brag-btn');

  document.querySelectorAll<HTMLElement>('.open-cv-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cvModal) {
        cvModal.removeAttribute('hidden');
        trapFocus(cvModal);
      }
    });
  });

  document.querySelectorAll<HTMLElement>('.open-brag-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (bragModal) {
        bragModal.removeAttribute('hidden');
        trapFocus(bragModal);
      }
    });
  });

  if (closeCvBtn && cvModal) {
    closeCvBtn.addEventListener('click', () => {
      cvModal.setAttribute('hidden', 'true');
    });
  }

  if (closeBragBtn && bragModal) {
    closeBragBtn.addEventListener('click', () => {
      bragModal.setAttribute('hidden', 'true');
    });
  }

  if (copyBragBtn) {
    copyBragBtn.addEventListener('click', () => {
      const shareText = `Vishwjeet Chavan — Architectural Spatial Systems Portfolio & WebGL Cover Flow
Engineered with Dembrandt design tokens, Genjutsu physical optics, and multi-device responsive calibration.
Live at: https://portfolio-spatial-eight.vercel.app`;
      navigator.clipboard.writeText(shareText).then(() => {
        const orig = copyBragBtn.textContent;
        copyBragBtn.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => { copyBragBtn.textContent = orig; }, 2000);
      });
    });
  }

  if (openHireBtn && hireModal) {
    openHireBtn.addEventListener('click', () => {
      hireModal.removeAttribute('hidden');
      trapFocus(hireModal);
      updateMailtoLink();
    });
  }

  if (closeHireBtn && hireModal) {
    closeHireBtn.addEventListener('click', () => {
      hireModal.setAttribute('hidden', 'true');
    });
  }

  if (closeHoodBtn && hoodModal) {
    closeHoodBtn.addEventListener('click', () => {
      hoodModal.setAttribute('hidden', 'true');
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (hireModal && !hireModal.hasAttribute('hidden')) hireModal.setAttribute('hidden', 'true');
      if (hoodModal && !hoodModal.hasAttribute('hidden')) hoodModal.setAttribute('hidden', 'true');
      if (cvModal && !cvModal.hasAttribute('hidden')) cvModal.setAttribute('hidden', 'true');
      if (bragModal && !bragModal.hasAttribute('hidden')) bragModal.setAttribute('hidden', 'true');
    }
  });

  [hireModal, hoodModal, cvModal, bragModal].forEach((m) => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) m.setAttribute('hidden', 'true');
      });
    }
  });

  const form = document.getElementById('project-builder-form');
  if (form) {
    form.addEventListener('input', updateMailtoLink);
    form.addEventListener('change', updateMailtoLink);
  }

  const copyBriefBtn = document.getElementById('copy-brief-btn');
  if (copyBriefBtn) {
    copyBriefBtn.addEventListener('click', () => {
      const brief = generateBriefText();
      navigator.clipboard.writeText(brief).then(() => {
        copyBriefBtn.textContent = 'Copied to Clipboard!';
        setTimeout(() => { copyBriefBtn.textContent = 'Copy Brief'; }, 2000);
      });
    });
  }
}

function generateBriefText(): string {
  const pType = (document.getElementById('project-type') as HTMLSelectElement)?.value || 'Interactive Web Experience';
  const pScope = (document.getElementById('project-scope') as HTMLSelectElement)?.value || 'Full Build';
  const pTimeline = (document.getElementById('project-timeline') as HTMLSelectElement)?.value || '2-4 Weeks';
  const pBudget = (document.getElementById('project-budget') as HTMLSelectElement)?.value || '$10k-$25k';
  const pNotes = (document.getElementById('project-notes') as HTMLTextAreaElement)?.value || 'None';

  return `=== CREATIVE INQUIRY FOR VISHWJEET CHAVAN ===\nType: ${pType}\nScope: ${pScope}\nTimeline: ${pTimeline}\nBudget: ${pBudget}\nContext: ${pNotes}\n`;
}

function updateMailtoLink() {
  const sendLink = document.getElementById('send-mail-link') as HTMLAnchorElement;
  if (!sendLink) return;

  const pType = (document.getElementById('project-type') as HTMLSelectElement)?.value || 'Interactive Web Experience';
  const brief = generateBriefText();
  const subject = encodeURIComponent(`Project Inquiry: ${pType}`);
  const body = encodeURIComponent(brief);
  sendLink.href = `mailto:vishwjeetchavan11@gmail.com?subject=${subject}&body=${body}`;
}

function openHoodModal(p: Project) {
  const hoodModal = document.getElementById('hood-modal');
  const diagramContainer = document.getElementById('hood-diagram-container');
  const detailsContainer = document.getElementById('hood-details');
  if (!hoodModal || !diagramContainer || !detailsContainer) return;

  diagramContainer.innerHTML = `<img src="${p.underTheHood.assetPath}" alt="${p.title} Architecture Preview" loading="lazy" style="max-width:100%; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.5);">`;

  const outcomesHtml = p.outcomes.map(o => `<li>${o}</li>`).join('');
  detailsContainer.innerHTML = `
    <h3 style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:8px;">${p.title} // Under The Hood</h3>
    <p style="color:var(--silver-400); margin-bottom:14px; font-size:0.88rem;"><strong>Role:</strong> ${p.role}</p>
    <ul style="color:var(--silver-200); font-size:0.88rem; line-height:1.65; padding-left:20px; display:flex; flex-direction:column; gap:6px;">${outcomesHtml}</ul>
    <div style="margin-top:20px;">
      <a href="${p.links[0]?.url || '#'}" class="portal-btn-primary" style="display:inline-flex;">Launch Full Interactive Lab ↗</a>
    </div>
  `;

  hoodModal.removeAttribute('hidden');
  trapFocus(hoodModal);
}

function trapFocus(modal: HTMLElement) {
  const focusables = modal.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  first.focus();

  modal.onkeydown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
}
