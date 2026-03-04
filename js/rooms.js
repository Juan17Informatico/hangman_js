/* rooms.js — UI-only mockup for Create / Join room pages
   Modular, uses const/let and prepares placeholders for API integration. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const getQueryMode = () => {
  const params = new URLSearchParams(location.search);
  return params.get('mode') || 'create';
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const mockCreateRoomApi = async (payload) => {
  // Placeholder: replace with real API call later
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, code: generateRoomCode(), roomId: 'room_' + Date.now() };
};

const mockJoinRoomApi = async ({ code, name }) => {
  await new Promise((r) => setTimeout(r, 400));
  // Simulate not found when code starts with X
  if (code.toUpperCase().startsWith('X')) return { success: false, message: 'Sala no encontrada' };
  return { success: true, playerId: 'p_' + Math.floor(Math.random() * 99999) };
};

const setActiveTab = (mode) => {
  const tabs = $$('.tab-btn');
  tabs.forEach((t) => {
    const m = t.dataset.mode;
    const isActive = m === mode;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const panels = $$('.tab-panel');
  panels.forEach((p) => {
    const isPanelActive = p.dataset.mode === mode;
    // Use the hidden property for clean toggling and add a class for style hooks
    p.hidden = !isPanelActive;
    p.classList.toggle('active-panel', isPanelActive);
  });
};

const showCreateResult = (code) => {
  const block = $('#create-result');
  const codeEl = $('#room-code');
  codeEl.textContent = code;
  block.hidden = false;
};

const showJoinMessage = (msg) => {
  const block = $('#join-result');
  const msgEl = $('#join-message');
  msgEl.textContent = msg;
  block.hidden = false;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
};

const init = () => {
  // Tabs
  $$('.tab-btn').forEach((btn) => btn.addEventListener('click', () => setActiveTab(btn.dataset.mode)));

  // Initialize mode from query param
  const mode = getQueryMode();
  setActiveTab(mode);

  // Create form
  const createForm = $('#create-form');
  createForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const name = $('#creator-name').value.trim() || 'Anon';
    const roomName = $('#room-name').value.trim();
    const payload = {
      name,
      roomName,
      difficulty: parseInt($('#difficulty-select').value, 10),
      wordsCount: parseInt($('#words-count').value, 10),
      timePerWord: parseInt($('#time-per-word').value, 10),
      maxHints: parseInt($('#max-hints').value, 10),
      organizer: $('#organizer-toggle').checked
    };

    const btn = createForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Creando...';

    const res = await mockCreateRoomApi(payload);
    btn.disabled = false;
    btn.textContent = 'Crear sala';

    if (res && res.success) {
      showCreateResult(res.code);
    } else {
      alert('Error creando sala');
    }
  });

  // Generate code helper
  $('#create-random-code').addEventListener('click', () => {
    const code = generateRoomCode();
    showCreateResult(code);
  });

  $('#copy-link').addEventListener('click', async () => {
    const code = $('#room-code').textContent.trim();
    if (!code || code === '—') return;
    const url = `${location.origin}${location.pathname.replace(/[^\/]*$/, '')}index.html?join=${code}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      $('#copy-link').textContent = 'Copiado';
      setTimeout(() => ($('#copy-link').textContent = 'Copiar enlace'), 1400);
    } else {
      alert('No se pudo copiar al portapapeles');
    }
  });

  // Join form
  const joinForm = $('#join-form');
  joinForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const name = $('#join-name').value.trim() || 'Anon';
    const code = $('#join-code').value.trim().toUpperCase();
    if (!code) return showJoinMessage('Introduce un código válido');

    const btn = joinForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Uniéndose...';

    const res = await mockJoinRoomApi({ code, name });
    btn.disabled = false;
    btn.textContent = 'Unirse';

    if (res && res.success) {
      showJoinMessage('Conectado. Esperando inicio...');
      // Here you would navigate to the game lobby or call the real API
    } else {
      showJoinMessage(res.message || 'Error al unirse');
    }
  });

  $('#paste-code').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) $('#join-code').value = text.trim();
    } catch (e) {
      alert('No se pudo leer desde el portapapeles');
    }
  });

  // Accessibility: allow Enter to submit forms from input fields
  $$('input').forEach((el) => el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const form = el.closest('form');
      if (form) form.requestSubmit();
    }
  }));
};

document.addEventListener('DOMContentLoaded', init);
