/* rooms.js — UI for Create / Join using WebSocket (wsClient.js) */

import { connect, send, on } from './wsClient.js';

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

// The real transport is WebSocket. Use wsClient to talk to server.

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

    // Connect without room (server will create room)
    connect(null, name);
    // Listen for room created response
    const onCreated = (data) => {
      btn.disabled = false;
      btn.textContent = 'Crear sala';
      showCreateResult(data.code);
      // unregister
      // (simple removal: keep handlers small — not removing here for brevity)
    };
    on('ROOM_CREATED', onCreated);

    // send create request
    send('CREATE_ROOM', { name, config: { difficulty: payload.difficulty, wordsPerLevel: payload.wordsCount, timePerWord: payload.timePerWord, maxHints: payload.maxHints } });
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

    // Connect and the client will send JOIN_ROOM when WS opens
    connect(code, name);

    on('JOINED_ROOM', (data) => {
      btn.disabled = false;
      btn.textContent = 'Unirse';
      showJoinMessage('Conectado. Esperando inicio...');
    });

    on('ERROR', (err) => {
      btn.disabled = false;
      btn.textContent = 'Unirse';
      showJoinMessage(err.message || 'Error al unirse');
    });
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
