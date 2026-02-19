const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
];

const HANGMAN_PARTS = [
  "head",
  "body",
  "left-arm",
  "right-arm",
  "left-leg",
  "right-leg"
];

// --- Screen Management ---

const showScreen = (screenId) => {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  $(`#${screenId}`).classList.add("active");
};

const showModal = (modalId) => {
  $(`#${modalId}`).classList.add("active");
};

const hideModal = (modalId) => {
  $(`#${modalId}`).classList.remove("active");
};

// --- Word Display ---

const renderWord = (revealedLetters) => {
  const container = $("#word-display");
  container.innerHTML = "";

  revealedLetters.forEach((letter, index) => {
    const span = document.createElement("span");
    span.className = "letter-slot";
    span.dataset.index = index;

    if (letter !== "_") {
      span.textContent = letter;
      span.classList.add("revealed");
    } else {
      span.textContent = "\u00A0";
    }

    container.appendChild(span);
  });
};

const animateRevealedLetters = (letter) => {
  $$(".letter-slot.revealed").forEach((slot) => {
    if (slot.textContent === letter) {
      slot.classList.add("bounce");
      setTimeout(() => slot.classList.remove("bounce"), 600);
    }
  });
};

const shakeWord = () => {
  const container = $("#word-display");
  container.classList.add("shake");
  setTimeout(() => container.classList.remove("shake"), 500);
};

// --- Keyboard ---

const renderKeyboard = (onLetterClick) => {
  const container = $("#keyboard");
  container.innerHTML = "";

  KEYBOARD_ROWS.forEach((row) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyboard-row";

    row.forEach((letter) => {
      const btn = document.createElement("button");
      btn.className = "key-btn";
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener("click", () => onLetterClick(letter));
      rowDiv.appendChild(btn);
    });

    container.appendChild(rowDiv);
  });
};

const updateKeyButton = (letter, isCorrect) => {
  const btn = $(`.key-btn[data-letter="${letter}"]`);
  if (!btn) return;

  btn.disabled = true;
  btn.classList.add(isCorrect ? "correct" : "wrong");
};

const disableAllKeys = () => {
  $$(".key-btn").forEach((btn) => {
    btn.disabled = true;
  });
};

// --- Hangman SVG ---

const resetHangman = () => {
  HANGMAN_PARTS.forEach((partId) => {
    const el = $(`#${partId}`);
    if (el) {
      el.classList.remove("visible");
      el.style.opacity = "0";
    }
  });
};

const revealHangmanPart = (wrongCount) => {
  if (wrongCount < 1 || wrongCount > HANGMAN_PARTS.length) return;

  const partId = HANGMAN_PARTS[wrongCount - 1];
  const el = $(`#${partId}`);
  if (!el) return;

  el.classList.add("visible");
  el.style.opacity = "1";

  if (wrongCount === HANGMAN_PARTS.length) {
    setTimeout(() => {
      const svg = $("#hangman-svg");
      svg.classList.add("dead");
      setTimeout(() => svg.classList.remove("dead"), 800);
    }, 300);
  }
};

// --- Hearts / Attempts ---

const renderHearts = (remaining, max) => {
  const container = $("#hearts");
  let html = "";

  for (let i = 0; i < max; i++) {
    const isFilled = i < remaining;
    html += `<span class="heart ${isFilled ? "filled" : "empty"}">${isFilled ? "❤️" : "🖤"}</span>`;
  }

  container.innerHTML = html;
};

// --- Player Info ---

const updatePlayerInfo = (name, score) => {
  $("#current-player").textContent = name;
  $("#current-score").textContent = `${score} pts`;
};

const updateDifficultyBadge = (difficulty, label, color) => {
  const badge = $("#diff-badge");
  badge.textContent = `Nivel ${difficulty} — ${label}`;
  badge.style.background = color;
};

// --- Hint ---

const showHint = (hint, category) => {
  const display = $("#hint-display");
  const text = $("#hint-text");
  text.textContent = `${category}: ${hint}`;
  display.hidden = false;
  display.classList.add("fade-in");
};

const hideHint = () => {
  $("#hint-display").hidden = true;
};

// --- Result Modal ---

const showResult = (isWon, word, score) => {
  $("#result-icon").textContent = isWon ? "🎉" : "💀";
  $("#result-title").textContent = isWon ? "Victoria!" : "Derrota";
  $("#result-title").className = isWon ? "result-win" : "result-lose";
  $("#result-message").textContent = isWon
    ? "Has adivinado la palabra"
    : "La palabra era:";
  $("#result-word").textContent = word;
  $("#result-score-value").textContent = score;

  showModal("result-modal");

  if (isWon && typeof confetti === "function") {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
};

// --- Leaderboard ---

const renderLeaderboard = (players) => {
  const tbody = $("#leaderboard-body");
  tbody.innerHTML = "";

  if (players.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="empty-message">No hay puntuaciones registradas</td>`;
    tbody.appendChild(row);
    return;
  }

  players.forEach((player, index) => {
    const row = document.createElement("tr");
    const medal =
      index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

    row.innerHTML = `
      <td class="rank">${medal} ${index + 1}</td>
      <td class="player-name-cell">${player.name}</td>
      <td class="score-cell">${player.totalScore}</td>
      <td>${player.wins}</td>
      <td>${player.losses}</td>
      <td>${player.gamesPlayed}</td>
    `;

    if (index < 3) row.classList.add("top-three");
    tbody.appendChild(row);
  });
};

// --- Turn Indicator (2 players) ---

const showTurnIndicator = (playerName, callback) => {
  const overlay = document.createElement("div");
  overlay.className = "turn-overlay";
  overlay.innerHTML = `
    <div class="turn-card">
      <h2>Turno de</h2>
      <p class="turn-player-name">${playerName}</p>
      <button class="btn btn-primary turn-start-btn">Listo!</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("active"));

  const btn = overlay.querySelector(".turn-start-btn");
  btn.addEventListener("click", () => {
    overlay.classList.remove("active");
    setTimeout(() => {
      overlay.remove();
      callback();
    }, 300);
  });
};

export {
  $,
  $$,
  showScreen,
  showModal,
  hideModal,
  renderWord,
  animateRevealedLetters,
  shakeWord,
  renderKeyboard,
  updateKeyButton,
  disableAllKeys,
  resetHangman,
  revealHangmanPart,
  renderHearts,
  updatePlayerInfo,
  updateDifficultyBadge,
  showHint,
  hideHint,
  showResult,
  renderLeaderboard,
  showTurnIndicator
};
