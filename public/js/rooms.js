import { connect, once, send, on } from "./wsClient.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const getQueryMode = () => {
  const params = new URLSearchParams(location.search);
  return params.get('mode') || 'create';
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

const goToLivePanel = () => {
  setActiveTab("live");
  const liveTab = $("#live-panel");
  if (liveTab) {
    liveTab.hidden = false;
    liveTab.classList.add("active-panel");
  }
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

const appState = {
  roomCode: null,
  playerId: null,
  organizerId: null,
  name: "",
  maxHints: 3
};
let joinTimeoutId = null;
let createTimeoutId = null;
let createBtnRef = null;
let joinBtnRef = null;

const clearJoinTimeout = () => {
  if (joinTimeoutId) {
    clearTimeout(joinTimeoutId);
    joinTimeoutId = null;
  }
};

const clearCreateTimeout = () => {
  if (createTimeoutId) {
    clearTimeout(createTimeoutId);
    createTimeoutId = null;
  }
};

const updateLobby = (state) => {
  const roomCodeEl = $("#live-room-code");
  const roleEl = $("#live-role");
  const playersEl = $("#live-players");
  const scoreEl = $("#live-scoreboard");
  const startBtn = $("#start-game-btn");
  const organizerPanel = $("#organizer-panel");
  const adminStatus = $("#admin-room-status");
  const adminCount = $("#admin-player-count");
  const adminJoinedList = $("#admin-joined-list");
  const adminStartHelp = $("#admin-start-help");

  if (!state) return;
  appState.organizerId = state.organizerId;
  appState.maxHints = state.config.maxHints;
  const isOrganizer = appState.playerId === state.organizerId;
  const enoughPlayersToStart = state.players.length >= 2;

  if (roomCodeEl) roomCodeEl.textContent = state.code;
  if (roleEl) roleEl.textContent = isOrganizer ? "Organizador" : "Jugador";
  if (organizerPanel) organizerPanel.hidden = !isOrganizer;
  if (adminStatus) adminStatus.textContent = state.status;
  if (adminCount) adminCount.textContent = String(state.players.length);
  if (startBtn) {
    const canStart = isOrganizer && state.status !== "playing" && enoughPlayersToStart;
    startBtn.disabled = !canStart;
    startBtn.textContent = canStart ? "Iniciar partida" : "No disponible";
  }
  if (adminStartHelp) {
    if (!isOrganizer) {
      adminStartHelp.textContent = "";
    } else if (!enoughPlayersToStart) {
      adminStartHelp.textContent = "Se requiere minimo 2 jugadores para iniciar.";
    } else if (state.status === "playing") {
      adminStartHelp.textContent = "Partida en curso.";
    } else {
      adminStartHelp.textContent = "Todo listo para iniciar.";
    }
  }

  if (playersEl) {
    playersEl.innerHTML = "";
    state.players.forEach((player) => {
      const li = document.createElement("li");
      li.className = "live-player-item";
      li.textContent = `${player.name} ${player.id === state.organizerId ? "(ORG)" : ""}`;
      playersEl.appendChild(li);
    });
  }
  if (adminJoinedList) {
    adminJoinedList.innerHTML = "";
    state.players.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = `${player.name}${player.id === state.organizerId ? " (Organizador)" : ""}`;
      adminJoinedList.appendChild(li);
    });
  }

  if (scoreEl) {
    scoreEl.innerHTML = "";
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    sorted.forEach((player, idx) => {
      const li = document.createElement("li");
      li.className = "live-score-item";
      li.textContent = `${idx + 1}. ${player.name}: ${player.score} pts`;
      scoreEl.appendChild(li);
    });
  }
};

const renderWord = (maskedWord) => {
  const board = $("#live-word");
  if (!board) return;
  board.textContent = maskedWord || "—";
};

const renderLetters = (usedLetters, wrongLetters) => {
  $("#live-used-letters").textContent = usedLetters?.length ? usedLetters.join(" ") : "—";
  $("#live-wrong-letters").textContent = wrongLetters?.length ? wrongLetters.join(" ") : "—";
};

const enableGuessInput = (enabled) => {
  $("#guess-letter").disabled = !enabled;
  $("#send-guess-btn").disabled = !enabled;
  $("#hint-btn-live").disabled = !enabled;
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
    createBtnRef = btn;
    btn.disabled = true;
    btn.textContent = 'Creando...';
    clearCreateTimeout();

    connect(null, name, { reconnect: true });
    once("ROOM_CREATED", (data) => {
      clearCreateTimeout();
      btn.disabled = false;
      btn.textContent = 'Crear sala';
      showCreateResult(data.code);
      appState.roomCode = data.code;
      appState.playerId = data.playerId || data.organizerId || null;
      appState.organizerId = data.organizerId || appState.playerId;
      appState.name = name;
      $("#join-code").value = data.code;
      showJoinMessage("Sala creada y conectada como organizador.");
      goToLivePanel();
      $("#hint-limit").textContent = String(data.config.maxHints);
      $("#live-room-code").textContent = data.code;
      $("#live-role").textContent = "Organizador";
      $("#live-status").textContent = "Lobby abierto. Esperando jugadores...";
      send("REQUEST_ROOM_STATE");
    });

    createTimeoutId = setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "Crear sala";
      showJoinMessage("No fue posible crear la sala. Verifica que el servidor Node este encendido.");
    }, 10000);

    send('CREATE_ROOM', { name, config: { difficulty: payload.difficulty, wordsPerLevel: payload.wordsCount, timePerWord: payload.timePerWord, maxHints: payload.maxHints } });
  });

  $('#copy-link').addEventListener('click', async () => {
    const code = $('#room-code').textContent.trim();
    if (!code || code === '—') return;
    const url = `${location.origin}/sala/${code}`;
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
    joinBtnRef = btn;
    btn.disabled = true;
    btn.textContent = 'Uniéndose...';

    clearJoinTimeout();

    const onJoined = (data) => {
      clearJoinTimeout();
      clearCreateTimeout();
      btn.disabled = false;
      btn.textContent = 'Unirse';
      appState.roomCode = data.code;
      appState.playerId = data.playerId;
      appState.organizerId = data.organizerId;
      appState.maxHints = data.config.maxHints;
      showJoinMessage('Conectado correctamente a la sala.');
      goToLivePanel();
      $("#hint-limit").textContent = String(data.config.maxHints);
      $("#live-room-code").textContent = data.code;
      send("REQUEST_ROOM_STATE");
    };

    if (appState.roomCode === code && appState.playerId) {
      onJoined({ code, playerId: appState.playerId, organizerId: appState.organizerId, config: { maxHints: appState.maxHints } });
      return;
    }

    once("JOINED_ROOM", onJoined);

    joinTimeoutId = setTimeout(() => {
      btn.disabled = false;
      btn.textContent = "Unirse";
      showJoinMessage("No se pudo unir a tiempo. Reintenta.");
    }, 10000);

    connect(code, name, { reconnect: true });

    on('ERROR', (err) => {
      clearJoinTimeout();
      btn.disabled = false;
      btn.textContent = 'Unirse';
      showJoinMessage(err.message || 'Error al unirse');
    });
  });

  $("#start-game-btn").addEventListener("click", () => {
    send("START_GAME");
  });

  $("#send-guess-btn").addEventListener("click", () => {
    const letter = $("#guess-letter").value.trim().toUpperCase();
    if (!letter) return;
    send("GUESS_LETTER", { letter });
    $("#guess-letter").value = "";
  });

  $("#guess-letter").addEventListener("input", () => {
    const value = $("#guess-letter").value.trim().toUpperCase();
    $("#guess-letter").value = value.slice(0, 1).replace(/[^A-Z]/g, "");
  });

  $("#hint-btn-live").addEventListener("click", () => {
    send("USE_HINT");
  });

  on("ROOM_STATE", (state) => {
    updateLobby(state);
    if (state.status === "lobby") {
      $("#live-status").textContent = "Lobby activo. Esperando inicio del organizador.";
    }
    const current = state.currentWordState;
    if (current) {
      renderWord(current.maskedWord);
      renderLetters(current.usedLetters, current.wrongLetters);
      $("#live-attempts").textContent = String(current.remainingAttempts);
      $("#live-hints-used").textContent = String(current.hintsUsed);
      enableGuessInput(state.status === "playing");
    }
  });

  on("ROUND_STARTED", (payload) => {
    $("#live-round").textContent = `${payload.round}/${payload.totalRounds}`;
    $("#live-status").textContent = "Ronda activa";
    renderWord(payload.maskedWord);
    renderLetters(payload.usedLetters, payload.wrongLetters);
    $("#live-attempts").textContent = String(payload.remainingAttempts);
    $("#live-hint-text").textContent = "—";
    $("#live-hints-used").textContent = "0";
    enableGuessInput(true);
  });

  on("ROUND_UPDATE", (payload) => {
    renderWord(payload.maskedWord);
    renderLetters(payload.usedLetters, payload.wrongLetters);
    $("#live-attempts").textContent = String(payload.remainingAttempts);
  });

  on("TIMER_TICK", ({ remainingSeconds }) => {
    $("#live-timer").textContent = `${remainingSeconds}s`;
  });

  on("ROUND_RESULT", (payload) => {
    enableGuessInput(false);
    if (payload.won) {
      $("#live-status").textContent = `Palabra adivinada: ${payload.word}`;
    } else {
      $("#live-status").textContent = `Ronda perdida. Palabra: ${payload.word}`;
    }
  });

  on("HINT_RESPONSE", ({ hint, category, hintsUsed }) => {
    $("#live-hint-text").textContent = `${hint} (${category})`;
    $("#live-hints-used").textContent = String(hintsUsed);
  });

  on("GAME_COMPLETED", () => {
    enableGuessInput(false);
    $("#live-status").textContent = "Partida terminada";
  });

  on("WS_STATUS", ({ state }) => {
    if (state !== "error" && state !== "closed") return;
    clearCreateTimeout();
    clearJoinTimeout();
    if (createBtnRef) {
      createBtnRef.disabled = false;
      createBtnRef.textContent = "Crear sala";
    }
    if (joinBtnRef) {
      joinBtnRef.disabled = false;
      joinBtnRef.textContent = "Unirse";
    }
    showJoinMessage("Sin conexion con el servidor. Ejecuta npm start y recarga la pagina.");
  });

  $('#paste-code').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) $('#join-code').value = text.trim();
    } catch (e) {
      alert('No se pudo leer desde el portapapeles');
    }
  });

  $("#live-copy-code-btn").addEventListener("click", async () => {
    const code = $("#live-room-code").textContent.trim();
    if (!code || code === "—") return;
    const ok = await copyToClipboard(code);
    if (ok) {
      $("#live-copy-code-btn").textContent = "Código copiado";
      setTimeout(() => ($("#live-copy-code-btn").textContent = "Copiar código"), 1200);
    }
  });

  $("#live-copy-link-btn").addEventListener("click", async () => {
    const code = $("#live-room-code").textContent.trim();
    if (!code || code === "—") return;
    const url = `${location.origin}/sala/${code}`;
    const ok = await copyToClipboard(url);
    if (ok) {
      $("#live-copy-link-btn").textContent = "Enlace copiado";
      setTimeout(() => ($("#live-copy-link-btn").textContent = "Copiar enlace"), 1200);
    }
  });

  // Accessibility: allow Enter to submit forms from input fields
  $$('input').forEach((el) => el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const form = el.closest('form');
      if (form) form.requestSubmit();
    }
  }));

  const pathMatch = location.pathname.match(/^\/sala\/([A-Z0-9]{4,10})$/);
  if (pathMatch) {
    setActiveTab("join");
    $("#join-code").value = pathMatch[1];
  }
};

document.addEventListener('DOMContentLoaded', init);
