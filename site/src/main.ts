import { GyroscopeScene } from './gyro.ts';
import { PanoramaWorld } from './panorama.ts';
import { sound } from './audio.ts';

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
let currentStageMode: 'panorama' | 'gyro' | 'manifesto' = 'panorama';
let gyroInstance: GyroscopeScene | null = null;
let panoramaInstance: PanoramaWorld | null = null;

document.addEventListener('DOMContentLoaded', async () => {
  initAudioControls();
  initStageModes();
  initPlayroom();
  await loadProjects();
  initSearch();
  initMobileSwitch();
  initModals();
  initGlobalSoundEffects();
});

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

// 2. Stage Mode Switcher (Panorama vs Gyro vs Manifesto)
function initStageModes() {
  const panoramaContainer = document.getElementById('panorama-stage');
  const panoramaCanvas = document.getElementById('panorama-canvas') as HTMLCanvasElement;
  const gyroContainer = document.getElementById('gyro-stage');
  const gyroCanvas = document.getElementById('gyro-canvas') as HTMLCanvasElement;
  const manifestoSection = document.getElementById('manifesto-section');

  const modeButtons = document.querySelectorAll('.mode-toggle-btn');

  // Initialize Panorama
  if (panoramaContainer && panoramaCanvas) {
    try {
      panoramaInstance = new PanoramaWorld(panoramaContainer, panoramaCanvas);
    } catch (e) {
      console.warn('Failed to initialize panorama:', e);
    }
  }

  // Initialize Gyro
  if (gyroContainer && gyroCanvas) {
    try {
      gyroInstance = new GyroscopeScene(gyroContainer, gyroCanvas);
    } catch (e) {
      console.warn('Failed to initialize gyro:', e);
    }
  }

  // Station jump buttons
  const stationButtons = document.querySelectorAll('.station-jump-btn');
  stationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const offset = parseInt(btn.getAttribute('data-offset') || '0', 10);
      if (panoramaInstance) {
        panoramaInstance.scrollToStation(offset);
      }
    });
  });

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode') as 'panorama' | 'gyro' | 'manifesto';
      currentStageMode = mode;
      sound.playClick(1.1);

      if (panoramaContainer) panoramaContainer.hidden = (mode !== 'panorama');
      if (gyroContainer) gyroContainer.hidden = (mode !== 'gyro');
      if (manifestoSection) manifestoSection.hidden = (mode !== 'manifesto');

      if (currentStageMode === 'gyro' && gyroInstance) {
        gyroInstance.setTiltByDiscipline('code');
      }

      if (currentStageMode === 'manifesto') {
        manifestoSection?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// 3. Interactive Playroom: The Tata Truck Cabin Controls
function initPlayroom() {
  const hornBtn = document.getElementById('play-horn-btn');
  const revBtn = document.getElementById('play-rev-btn');
  const needle = document.getElementById('speedo-needle');

  if (hornBtn) {
    hornBtn.addEventListener('click', () => {
      sound.playTataHorn();
      if (needle) {
        needle.style.transform = 'rotate(75deg)';
        setTimeout(() => { needle.style.transform = 'rotate(-45deg)'; }, 450);
      }
    });
  }

  if (revBtn) {
    revBtn.addEventListener('click', () => {
      sound.playEngineRev();
      if (needle) {
        needle.style.transform = 'rotate(95deg)';
        setTimeout(() => { needle.style.transform = 'rotate(-45deg)'; }, 650);
      }
    });
  }
}

// 4. Load & Render Projects
async function loadProjects() {
  try {
    const res = await fetch('/data/projects.json');
    allProjects = await res.json();
    renderCards(allProjects);
  } catch (err) {
    console.error('Failed to load projects.json:', err);
  }
}

function renderCards(projects: Project[]) {
  const codeContainer = document.getElementById('cards-code');
  const craftContainer = document.getElementById('cards-craft');
  if (!codeContainer || !craftContainer) return;

  codeContainer.innerHTML = '';
  craftContainer.innerHTML = '';

  projects.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('data-id', p.id);

    const projectUrl = p.links && p.links.length > 0 ? p.links[0].url : '#';
    const isExternal = projectUrl.startsWith('http');
    const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

    const mediaHtml = p.media && p.media.length > 0
      ? `<a href="${projectUrl}" ${targetAttr} class="card-media-preview" style="display:block; text-decoration:none;"><img src="${p.media[0].url}" alt="${p.media[0].alt || p.title}" loading="lazy" width="600" height="380"></a>`
      : '';

    const tagsHtml = p.stack.map(s => `<span class="tag">${s}</span>`).join('');
    const linkHtml = p.links && p.links.length > 0
      ? `<a href="${projectUrl}" ${targetAttr} class="card-link" style="font-weight:600;">Launch Demo &rarr;</a>`
      : '';

    card.innerHTML = `
      <div class="card-top">
        <h3 class="card-title"><a href="${projectUrl}" ${targetAttr} style="color:inherit; text-decoration:none;">${p.title}</a></h3>
        <span class="card-badge">${p.side.toUpperCase()}</span>
      </div>
      ${mediaHtml}
      <p class="card-summary">${p.summary}</p>
      <div class="stack-tags">${tagsHtml}</div>
      <div class="card-actions">
        ${linkHtml}
        <button type="button" class="hood-btn" data-id="${p.id}">Under the Hood</button>
      </div>
    `;

    // Attach click for Under the Hood
    const hoodBtn = card.querySelector('.hood-btn');
    if (hoodBtn) {
      hoodBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick(0.9);
        openHoodModal(p);
      });
    }

    // Audio hover
    card.addEventListener('mouseenter', () => {
      sound.playHover(1300);
    });

    if (p.side === 'code') {
      codeContainer.appendChild(card);
    } else {
      craftContainer.appendChild(card);
    }
  });
}

// 5. Search Filtering
function initSearch() {
  const searchInput = document.getElementById('project-search') as HTMLInputElement;
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase().trim();
    if (!q) {
      renderCards(allProjects);
      return;
    }

    const filtered = allProjects.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchSummary = p.summary.toLowerCase().includes(q);
      const matchStack = p.stack.some(s => s.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchStack;
    });

    renderCards(filtered);
  });
}

// 6. Global Sound Effects for links & buttons
function initGlobalSoundEffects() {
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => sound.playHover(1500));
    el.addEventListener('click', () => sound.playClick(1.0));
  });
}

function initMobileSwitch() {
  const tabs = document.querySelectorAll('.mobile-switcher .switch-btn');
  const codeCol = document.getElementById('view-code');
  const craftCol = document.getElementById('view-craft');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const target = tab.getAttribute('data-target');
      sound.playClick(1.0);
      if (target === 'code') {
        if (codeCol) codeCol.removeAttribute('hidden');
        if (craftCol) craftCol.setAttribute('hidden', 'true');
        if (gyroInstance) gyroInstance.setTiltByDiscipline('code');
      } else {
        if (codeCol) codeCol.setAttribute('hidden', 'true');
        if (craftCol) craftCol.removeAttribute('hidden');
        if (gyroInstance) gyroInstance.setTiltByDiscipline('craft');
      }
    });
  });
}

// 7. Modals
function initModals() {
  const hireModal = document.getElementById('hire-modal');
  const openHireBtn = document.getElementById('open-hire-modal');
  const closeHireBtn = document.getElementById('close-hire-modal');

  const hoodModal = document.getElementById('hood-modal');
  const closeHoodBtn = document.getElementById('close-hood-modal');

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
    }
  });

  [hireModal, hoodModal].forEach((m) => {
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
  const pType = (document.getElementById('project-type') as HTMLSelectElement)?.value || 'Digital Experience';
  const pScope = (document.getElementById('project-scope') as HTMLSelectElement)?.value || 'Full Build';
  const pTimeline = (document.getElementById('project-timeline') as HTMLSelectElement)?.value || '2-4 Weeks';
  const pBudget = (document.getElementById('project-budget') as HTMLSelectElement)?.value || '$10k-$25k';
  const pNotes = (document.getElementById('project-notes') as HTMLTextAreaElement)?.value || 'None';

  return `=== CREATIVE INQUIRY FOR VISHWJEET CHAVAN ===\nType: ${pType}\nScope: ${pScope}\nTimeline: ${pTimeline}\nBudget: ${pBudget}\nContext: ${pNotes}\n`;
}

function updateMailtoLink() {
  const sendLink = document.getElementById('send-mail-link') as HTMLAnchorElement;
  if (!sendLink) return;

  const pType = (document.getElementById('project-type') as HTMLSelectElement)?.value || 'Digital Experience';
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

  diagramContainer.innerHTML = `<img src="${p.underTheHood.assetPath}" alt="${p.title} Architecture Diagram" loading="lazy" style="max-width:100%; border-radius:8px;">`;

  const outcomesHtml = p.outcomes.map(o => `<li>${o}</li>`).join('');
  detailsContainer.innerHTML = `
    <h3 style="font-size:1.1rem; color:#fff; margin-bottom:8px;">${p.title} // Technical Architecture</h3>
    <p style="color:var(--silver-400); margin-bottom:12px; font-size:0.85rem;"><strong>Role:</strong> ${p.role}</p>
    <ul style="color:var(--silver-200); font-size:0.85rem; line-height:1.6; padding-left:18px;">${outcomesHtml}</ul>
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
