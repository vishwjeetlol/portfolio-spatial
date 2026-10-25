import { GyroscopeScene } from './gyro.ts';

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

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.hero-stage') as HTMLElement;
  const canvas = document.getElementById('gyro-canvas') as HTMLCanvasElement;
  if (container && canvas) {
    gyroInstance = new GyroscopeScene(container, canvas);
  }

  await loadProjects();
  initModals();
  initSearch();
  initMobileSwitch();
});

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
    const mediaHtml = p.media && p.media.length > 0
      ? `<a href="${projectUrl}" class="card-media-preview" style="display:block; text-decoration:none;"><img src="${p.media[0].url}" alt="${p.media[0].alt || p.title}" loading="lazy" width="600" height="380"></a>`
      : '';

    const tagsHtml = p.stack.map(s => `<span class="tag">${s}</span>`).join('');
    const linkHtml = p.links && p.links.length > 0
      ? `<a href="${projectUrl}" class="card-link" style="font-weight:600;">Launch Demo &rarr;</a>`
      : '';

    card.innerHTML = `
      <div class="card-top">
        <h3 class="card-title"><a href="${projectUrl}" style="color:inherit; text-decoration:none;">${p.title}</a></h3>
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
      hoodBtn.addEventListener('click', () => openHoodModal(p));
    }

    if (p.side === 'code') {
      codeContainer.appendChild(card);
    } else {
      craftContainer.appendChild(card);
    }
  });
}

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

function initModals() {
  const hireModal = document.getElementById('hire-modal');
  const openHireBtn = document.getElementById('open-hire-modal');
  const closeHireBtn = document.getElementById('close-hire-modal');

  const hoodModal = document.getElementById('hood-modal');
  const closeHoodBtn = document.getElementById('close-hood-modal');

  // Hire Modal open/close
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

  // Close modals on Esc or backdrop click
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

  // Hire Form Builder updates
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
  const pType = (document.getElementById('project-type') as HTMLSelectElement)?.value || '3D Experience';
  const pScope = (document.getElementById('project-scope') as HTMLSelectElement)?.value || 'Full Build';
  const pTimeline = (document.getElementById('project-timeline') as HTMLSelectElement)?.value || '2-4 Weeks';
  const pBudget = (document.getElementById('project-budget') as HTMLSelectElement)?.value || '$10k-$25k';
  const pNotes = (document.getElementById('project-notes') as HTMLTextAreaElement)?.value || 'None';

  return `=== SPATIAL PROJECT INQUIRY ===\nType: ${pType}\nScope: ${pScope}\nTimeline: ${pTimeline}\nBudget: ${pBudget}\nNotes: ${pNotes}\n`;
}

function updateMailtoLink() {
  const sendLink = document.getElementById('send-mail-link') as HTMLAnchorElement;
  if (!sendLink) return;

  const pType = (document.getElementById('project-type') as HTMLSelectElement)?.value || '3D Experience';
  const brief = generateBriefText();
  const subject = encodeURIComponent(`Spatial Studio Project: ${pType}`);
  const body = encodeURIComponent(brief);
  sendLink.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
}

function openHoodModal(p: Project) {
  const hoodModal = document.getElementById('hood-modal');
  const diagramContainer = document.getElementById('hood-diagram-container');
  const detailsContainer = document.getElementById('hood-details');
  if (!hoodModal || !diagramContainer || !detailsContainer) return;

  diagramContainer.innerHTML = `<img src="${p.underTheHood.assetPath}" alt="${p.title} Architecture Diagram" loading="lazy">`;

  const outcomesHtml = p.outcomes.map(o => `<li>${o}</li>`).join('');
  detailsContainer.innerHTML = `
    <h3>${p.title} // Technical Architecture</h3>
    <p style="color:var(--silver-400); margin-bottom:12px; font-size:0.9rem;"><strong>Role:</strong> ${p.role}</p>
    <ul>${outcomesHtml}</ul>
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
