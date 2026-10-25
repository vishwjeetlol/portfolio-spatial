// Glass UI Lab - Spatial Component Physics & Interactions

document.addEventListener('DOMContentLoaded', () => {
  initTiltCard();
  initDraggableSheet();
  initSpatialSwitches();
  initCommandPalette();
});

// 1. Tilt Card 3D Perspective
function initTiltCard() {
  const card = document.getElementById('tilt-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;
    const rotX = -normY * 18;
    const rotY = normX * 18;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04, 1.04, 1.04)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

// 2. Draggable Bottom Sheet with Momentum
function initDraggableSheet() {
  const handle = document.getElementById('sheet-handle');
  if (!handle) return;

  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let velocity = 0;
  let prevY = 0;
  let animId = null;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY - currentY;
    prevY = e.clientY;
    cancelAnimationFrame(animId);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentY = e.clientY - startY;
    if (currentY > 40) currentY = 40;
    if (currentY < -60) currentY = -60;
    velocity = e.clientY - prevY;
    prevY = e.clientY;
    handle.style.transform = `translateY(${currentY}px)`;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    // Apply inertia and snap
    function snapLoop() {
      if (Math.abs(velocity) > 0.5) {
        currentY += velocity;
        velocity *= 0.85;
        if (currentY > 40) currentY = 40;
        if (currentY < -60) currentY = -60;
        handle.style.transform = `translateY(${currentY}px)`;
        animId = requestAnimationFrame(snapLoop);
      } else {
        // Snap to nearest zone (0 or -50)
        currentY = currentY < -20 ? -50 : 0;
        handle.style.transform = `translateY(${currentY}px)`;
      }
    }
    snapLoop();
  });
}

// 3. Spatial Switches
function initSpatialSwitches() {
  const switches = document.querySelectorAll('.spatial-switch');
  switches.forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('on');
    });
  });
}

// 4. Command Palette Keyboard Navigation
function initCommandPalette() {
  const trigger = document.getElementById('open-cmd');
  const overlay = document.getElementById('cmd-overlay');
  const input = document.getElementById('cmd-input');
  if (!trigger || !overlay || !input) return;

  function toggle(open) {
    overlay.hidden = !open;
    if (open) input.focus();
  }

  trigger.addEventListener('click', () => toggle(overlay.hidden));

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggle(overlay.hidden);
    } else if (e.key === 'Escape' && !overlay.hidden) {
      toggle(false);
    } else if (!overlay.hidden) {
      const items = Array.from(overlay.querySelectorAll('.cmd-item'));
      const activeIdx = items.findIndex(item => item.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (activeIdx + 1) % items.length;
        items.forEach((it, idx) => it.classList.toggle('active', idx === next));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (activeIdx - 1 + items.length) % items.length;
        items.forEach((it, idx) => it.classList.toggle('active', idx === prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = items[activeIdx];
        if (active) {
          alert(`Executed: ${active.textContent}`);
          toggle(false);
        }
      }
    }
  });
}
