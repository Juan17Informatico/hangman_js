/* ui.js — Enhanced UI with GSAP animations & noir-neon arcade aesthetic */

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

// ── Difficulty labels & neon colors ──
const DIFF_CONFIG = {
  1:  { label: "FÁCIL",    color: "var(--neon-green)",   badgeColor: "rgba(0,255,136,0.15)",  border: "var(--neon-green)" },
  2:  { label: "FÁCIL",    color: "var(--neon-green)",   badgeColor: "rgba(0,255,136,0.15)",  border: "var(--neon-green)" },
  3:  { label: "FÁCIL",    color: "var(--neon-green)",   badgeColor: "rgba(0,255,136,0.15)",  border: "var(--neon-green)" },
  4:  { label: "MEDIO",    color: "var(--neon-cyan)",    badgeColor: "rgba(0,245,255,0.12)",  border: "var(--neon-cyan)" },
  5:  { label: "MEDIO",    color: "var(--neon-cyan)",    badgeColor: "rgba(0,245,255,0.12)",  border: "var(--neon-cyan)" },
  6:  { label: "MEDIO",    color: "var(--neon-cyan)",    badgeColor: "rgba(0,245,255,0.12)",  border: "var(--neon-cyan)" },
  7:  { label: "DIFÍCIL",  color: "var(--neon-yellow)",  badgeColor: "rgba(255,230,0,0.1)",   border: "var(--neon-yellow)" },
  8:  { label: "DIFÍCIL",  color: "var(--neon-yellow)",  badgeColor: "rgba(255,230,0,0.1)",   border: "var(--neon-yellow)" },
  9:  { label: "EXPERTO",  color: "var(--neon-pink)",    badgeColor: "rgba(255,45,120,0.12)", border: "var(--neon-pink)" },
  10: { label: "EXPERTO",  color: "var(--neon-red)",     badgeColor: "rgba(255,51,51,0.12)",  border: "var(--neon-red)" },
};

// ── GSAP helper — graceful fallback if not loaded ──
const gsap = window.gsap;

const animate = (el, props, opts = {}) => {
  if (!el) return;
  if (gsap) {
    gsap.to(el, { ...props, ...opts });
  }
};

const animateFrom = (el, from, to, opts = {}) => {
  if (!el) return;
  if (gsap) {
    gsap.fromTo(el, from, { ...to, ...opts });
  }
};

// ── Screen Management ──

const showScreen = (screenId) => {
  $$(".screen").forEach((s) => s.classList.remove("active"));
  const target = $(`#${screenId}`);
  if (!target) return;
  target.classList.add("active");

  if (gsap) {
    gsap.fromTo(
      target,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }
};

const showModal = (modalId) => {
  const modal = $(`#${modalId}`);
  if (!modal) return;
  modal.classList.add("active");

  if (gsap) {
    const content = modal.querySelector(".modal-content");
    gsap.fromTo(
      content,
      { scale: 0.92, y: 28, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
    );
  }
};

const hideModal = (modalId) => {
  const modal = $(`#${modalId}`);
  if (!modal) return;

  if (gsap) {
    const content = modal.querySelector(".modal-content");
    gsap.to(content, {
      scale: 0.95, y: 16, opacity: 0, duration: 0.25,
      ease: "power2.in",
      onComplete: () => modal.classList.remove("active")
    });
  } else {
    modal.classList.remove("active");
  }
};

// ── Word Display ──

const renderWord = (revealedLetters) => {
  const container = $("#word-display");
  if (!container) return;
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

  // Staggered entrance animation
  if (gsap) {
    gsap.fromTo(
      container.querySelectorAll(".letter-slot"),
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
    );
  }
};

const animateRevealedLetters = (letter) => {
  $$(".letter-slot").forEach((slot) => {
    if (slot.textContent.trim() === letter && slot.classList.contains("revealed")) {
      if (gsap) {
        gsap.fromTo(
          slot,
          { scale: 1 },
          {
            scale: 1.5,
            color: "var(--neon-cyan)",
            duration: 0.15,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              gsap.to(slot, { scale: 1, color: "var(--text-bright)", duration: 0.2 });
            }
          }
        );
      } else {
        slot.classList.add("bounce");
        setTimeout(() => slot.classList.remove("bounce"), 600);
      }
    }
  });
};

const shakeWord = () => {
  const container = $("#word-display");
  if (!container) return;

  if (gsap) {
    gsap.to(container, {
      keyframes: [
        { x: -14, duration: 0.07 },
        { x: 14, duration: 0.07 },
        { x: -10, duration: 0.06 },
        { x: 10, duration: 0.06 },
        { x: -5, duration: 0.05 },
        { x: 0, duration: 0.05 },
      ],
      ease: "none"
    });
  } else {
    container.classList.add("shake");
    setTimeout(() => container.classList.remove("shake"), 500);
  }
};

// ── Keyboard ──

const renderKeyboard = (onLetterClick) => {
  const container = $("#keyboard");
  if (!container) return;
  container.innerHTML = "";

  KEYBOARD_ROWS.forEach((row, rowIndex) => {
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

  // Staggered keyboard entrance
  if (gsap) {
    gsap.fromTo(
      container.querySelectorAll(".key-btn"),
      { opacity: 0, y: 16, scale: 0.85 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.3, stagger: 0.018,
        ease: "back.out(1.2)",
        delay: 0.2
      }
    );
  }
};

const updateKeyButton = (letter, isCorrect) => {
  const btn = $(`.key-btn[data-letter="${letter}"]`);
  if (!btn) return;

  btn.disabled = true;
  btn.classList.add(isCorrect ? "correct" : "wrong");

  if (gsap) {
    if (isCorrect) {
      gsap.fromTo(
        btn,
        { scale: 1 },
        { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    } else {
      gsap.to(btn, {
        keyframes: [
          { x: -5, duration: 0.05 },
          { x: 5, duration: 0.05 },
          { x: 0, duration: 0.05 },
        ]
      });
    }
  }
};

const disableAllKeys = () => {
  $$(".key-btn").forEach((btn) => {
    btn.disabled = true;
  });
};

// ── Hangman SVG ──

const resetHangman = () => {
  HANGMAN_PARTS.forEach((partId) => {
    const el = $(`#${partId}`);
    if (!el) return;
    el.classList.remove("visible");
    el.style.opacity = "0";
  });

  const svg = $("#hangman-svg");
  if (svg) svg.classList.remove("dead");

  // Reset wrong count display
  const wc = $("#wrong-count");
  if (wc) wc.textContent = "0 / 6";

  // Reset missed letters
  updateMissedLetters([]);
};

const revealHangmanPart = (wrongCount) => {
  if (wrongCount < 1 || wrongCount > HANGMAN_PARTS.length) return;

  const partId = HANGMAN_PARTS[wrongCount - 1];
  const el = $(`#${partId}`);
  if (!el) return;

  el.classList.add("visible");
  el.style.opacity = "1";

  // Update wrong count display
  const wc = $("#wrong-count");
  if (wc) wc.textContent = `${wrongCount} / 6`;

  if (gsap) {
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.3 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
    );
  }

  if (wrongCount === HANGMAN_PARTS.length) {
    setTimeout(() => {
      const svg = $("#hangman-svg");
      if (!svg) return;
      svg.classList.add("dead");

      if (gsap) {
        gsap.to(svg, {
          keyframes: [
            { rotation: -6, duration: 0.08 },
            { rotation: 6, duration: 0.1 },
            { rotation: -4, duration: 0.08 },
            { rotation: 4, duration: 0.08 },
            { rotation: -2, duration: 0.07 },
            { rotation: 0, duration: 0.07 },
          ]
        });
      } else {
        setTimeout(() => svg.classList.remove("dead"), 800);
      }
    }, 300);
  }
};

// ── Hearts / Attempts ──

const renderHearts = (remaining, max) => {
  const container = $("#hearts");
  if (!container) return;
  let html = "";

  for (let i = 0; i < max; i++) {
    const isFilled = i < remaining;
    html += `<span class="heart ${isFilled ? "filled" : "empty"}">${isFilled ? "❤️" : "🖤"}</span>`;
  }

  container.innerHTML = html;

  // Animate hearts in
  if (gsap) {
    gsap.fromTo(
      container.querySelectorAll(".heart"),
      { scale: 0 },
      { scale: 1, duration: 0.3, stagger: 0.04, ease: "back.out(1.5)" }
    );
  }
};

// ── Missed Letters (new UI feature) ──

const updateMissedLetters = (missedArr) => {
  const list = $("#missed-list");
  if (!list) return;

  if (!missedArr || missedArr.length === 0) {
    list.textContent = "—";
    return;
  }

  list.textContent = missedArr.join("  ");
};

// ── Player Info ──

const updatePlayerInfo = (name, score) => {
  const nameEl = $("#current-player");
  const scoreNumEl = document.querySelector("#current-score .score-num");

  if (nameEl) nameEl.textContent = name;

  if (scoreNumEl) {
    if (gsap) {
      // Count-up animation for score
      const current = parseInt(scoreNumEl.textContent) || 0;
      gsap.fromTo(
        { val: current },
        { val: score, duration: 0.6, ease: "power2.out",
          onUpdate: function() {
            scoreNumEl.textContent = Math.round(this.targets()[0].val);
          }
        },
        {} // empty 'to' — already in first arg
      );
      // Simpler approach:
      gsap.to({ val: current }, {
        val: score, duration: 0.6, ease: "power2.out",
        onUpdate: function() {
          scoreNumEl.textContent = Math.round(this.targets()[0].val);
        }
      });
    } else {
      scoreNumEl.textContent = score;
    }
  }

  // Update avatar initials
  const avatar = $("#player-avatar");
  if (avatar && name) {
    avatar.textContent = name.slice(0, 2).toUpperCase();
  }
};

const updateDifficultyBadge = (difficulty, label, color) => {
  const badge = $("#diff-badge");
  if (!badge) return;

  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG[5];
  badge.textContent = `NIVEL ${difficulty < 10 ? "0" + difficulty : difficulty} — ${cfg.label}`;
  badge.style.borderColor = cfg.border;
  badge.style.color = cfg.border;
  badge.style.background = cfg.badgeColor;
  badge.style.boxShadow = `0 0 10px ${cfg.badgeColor}`;
  badge.style.textShadow = `0 0 8px ${cfg.border}`;
};

// ── Difficulty display on setup ──

const updateDifficultyDisplay = (value) => {
  const valEl = $("#difficulty-value");
  const nameEl = $("#diff-name");
  const cfg = DIFF_CONFIG[value] || DIFF_CONFIG[5];

  if (valEl) {
    valEl.textContent = value < 10 ? "0" + value : value;
    valEl.style.color = cfg.border;
    valEl.style.textShadow = `0 0 20px ${cfg.border}`;
  }

  if (nameEl) {
    nameEl.textContent = cfg.label;
    nameEl.style.color = cfg.border;
  }
};

// ── Category display ──

const setCategory = (category) => {
  const strip = $("#category-strip");
  const val = $("#category-value");

  if (strip && val && category) {
    val.textContent = category.toUpperCase();
    strip.hidden = false;
  } else if (strip) {
    strip.hidden = true;
  }
};

// ── Hint ──

const showHint = (hint, category) => {
  const display = $("#hint-display");
  const text = $("#hint-text");
  if (!display || !text) return;

  text.textContent = hint || `Categoría: ${category}`;
  display.hidden = false;

  if (gsap) {
    gsap.fromTo(
      display,
      { opacity: 0, y: -8, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.2)" }
    );
  } else {
    display.classList.add("fade-in");
  }
};

const hideHint = () => {
  const display = $("#hint-display");
  if (display) display.hidden = true;
};

// ── Result Modal ──

const showResult = (isWon, word, score) => {
  const iconEl = $("#result-icon");
  const titleEl = $("#result-title");
  const msgEl = $("#result-message");
  const wordEl = $("#result-word");
  const scoreEl = $("#result-score-value");

  if (iconEl) iconEl.textContent = isWon ? "🎉" : "💀";
  if (titleEl) {
    titleEl.textContent = isWon ? "VICTORIA!" : "DERROTA";
    titleEl.className = isWon ? "result-win" : "result-lose";
  }
  if (msgEl) msgEl.textContent = isWon ? "Has adivinado la palabra" : "La palabra era:";
  if (wordEl) wordEl.textContent = word;
  if (scoreEl) scoreEl.textContent = score;

  showModal("result-modal");

  if (isWon && typeof confetti === "function") {
    // Multi-burst celebration
    const colors = ["#00f5ff", "#ff2d78", "#00ff88", "#ffe600"];

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        angle: 60,
        origin: { x: 0, y: 0.7 },
        colors
      });
      confetti({
        particleCount: 80,
        spread: 120,
        angle: 120,
        origin: { x: 1, y: 0.7 },
        colors
      });
    }, 400);
  }
};

// ── Leaderboard ──

const renderLeaderboard = (players) => {
  const tbody = $("#leaderboard-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (players.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="empty-message">— NO HAY PUNTUACIONES REGISTRADAS —</td>`;
    tbody.appendChild(row);
    return;
  }

  players.forEach((player, index) => {
    const row = document.createElement("tr");
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;

    const winRate = player.gamesPlayed > 0
      ? Math.round((player.wins / player.gamesPlayed) * 100) + "%"
      : "—";

    row.innerHTML = `
      <td class="rank">${medal}</td>
      <td class="player-name-cell">${player.name}</td>
      <td class="score-cell">${player.totalScore.toLocaleString()}</td>
      <td style="color:var(--neon-green)">${player.wins}</td>
      <td style="color:var(--neon-red)">${player.losses}</td>
      <td>${player.gamesPlayed}</td>
    `;

    if (index < 3) row.classList.add("top-three");
    tbody.appendChild(row);
  });

  // Stagger rows
  if (gsap) {
    gsap.fromTo(
      tbody.querySelectorAll("tr"),
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }
};

// ── Turn Indicator (2 players) ──

const showTurnIndicator = (playerName, callback) => {
  const overlay = document.createElement("div");
  overlay.className = "turn-overlay";
  overlay.innerHTML = `
    <div class="turn-card">
      <h2>— TURNO DE —</h2>
      <p class="turn-player-name">${playerName.toUpperCase()}</p>
      <button class="btn btn-primary turn-start-btn">
        <span class="btn-content">
          <span class="btn-icon">▶</span>
          <span>LISTO!</span>
        </span>
        <span class="btn-glow"></span>
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  if (gsap) {
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      overlay.querySelector(".turn-card"),
      { scale: 0.85, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.3)", delay: 0.1 }
    );
  } else {
    requestAnimationFrame(() => overlay.classList.add("active"));
  }

  const btn = overlay.querySelector(".turn-start-btn");
  btn.addEventListener("click", () => {
    if (gsap) {
      gsap.to(overlay, {
        opacity: 0, duration: 0.3, ease: "power2.in",
        onComplete: () => { overlay.remove(); callback(); }
      });
    } else {
      overlay.classList.remove("active");
      setTimeout(() => { overlay.remove(); callback(); }, 300);
    }
  });
};

// ── Setup screen difficulty slider live update ──
// (call this from app.js or wire up directly)
const initDifficultySlider = () => {
  const slider = $("#difficulty");
  if (!slider) return;

  const update = () => updateDifficultyDisplay(Number(slider.value));
  slider.addEventListener("input", update);
  update(); // initial
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
  updateDifficultyDisplay,
  updateMissedLetters,
  setCategory,
  showHint,
  hideHint,
  showResult,
  renderLeaderboard,
  showTurnIndicator,
  initDifficultySlider,
  DIFF_CONFIG
};