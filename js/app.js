import { getRandomWord, getDifficultyLabel, getDifficultyColor } from "./words.js";
import { findOrCreatePlayer, updatePlayerScore, getTopPlayers, clearLeaderboard } from "./storage.js";
import { createGameState, processGuess, calculateScore, getRevealedWord, getWrongCount } from "./game.js";
import {
  $, showScreen, showModal, hideModal,
  renderWord, animateRevealedLetters, shakeWord,
  renderKeyboard, updateKeyButton, disableAllKeys,
  resetHangman, revealHangmanPart,
  renderHearts, updatePlayerInfo, updateDifficultyBadge,
  showHint, hideHint, showResult,
  renderLeaderboard, showTurnIndicator
} from "./ui.js";

// --- App State ---

const appState = {
  players: [],
  currentPlayerIndex: 0,
  difficulty: 3,
  playerCount: 1,
  gameState: null,
  hintUsed: false,
  roundScores: []
};

// --- Setup Handlers ---

const initSetup = () => {
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      appState.playerCount = parseInt(btn.dataset.count);
      $("#player2-group").hidden = appState.playerCount === 1;
    });
  });

  const diffSlider = $("#difficulty");
  const diffValue = $("#difficulty-value");
  diffSlider.addEventListener("input", () => {
    const val = parseInt(diffSlider.value);
    appState.difficulty = val;
    diffValue.textContent = val;
    diffValue.style.color = getDifficultyColor(val);
  });

  $("#start-btn").addEventListener("click", handleStartGame);
};

const handleStartGame = () => {
  const name1 = $("#player1-name").value.trim() || "Jugador 1";
  const player1 = findOrCreatePlayer(name1);
  appState.players = [player1];

  if (appState.playerCount === 2) {
    const name2 = $("#player2-name").value.trim() || "Jugador 2";
    const player2 = findOrCreatePlayer(name2);
    appState.players.push(player2);
  }

  appState.currentPlayerIndex = 0;
  appState.roundScores = [];

  if (appState.playerCount === 2) {
    showScreen("game-screen");
    showTurnIndicator(appState.players[0].name, () => startNewRound());
  } else {
    showScreen("game-screen");
    startNewRound();
  }
};

// --- Game Flow ---

const startNewRound = () => {
  const wordData = getRandomWord(appState.difficulty);
  appState.gameState = createGameState(wordData);
  appState.hintUsed = false;

  const currentPlayer = appState.players[appState.currentPlayerIndex];
  const revealed = getRevealedWord(appState.gameState.word, appState.gameState.correctLetters);

  resetHangman();
  renderWord(revealed);
  renderKeyboard(handleLetterClick);
  renderHearts(appState.gameState.remainingAttempts, appState.gameState.maxAttempts);
  updatePlayerInfo(currentPlayer.name, currentPlayer.totalScore);
  updateDifficultyBadge(
    appState.difficulty,
    getDifficultyLabel(appState.difficulty),
    getDifficultyColor(appState.difficulty)
  );
  hideHint();
};

const handleLetterClick = (letter) => {
  if (!appState.gameState || appState.gameState.isOver) return;

  const prevState = appState.gameState;
  appState.gameState = processGuess(prevState, letter);
  const { lastAction } = appState.gameState;

  if (lastAction === "repeated" || lastAction === "invalid") return;

  if (lastAction === "correct") {
    updateKeyButton(letter, true);
    const revealed = getRevealedWord(appState.gameState.word, appState.gameState.correctLetters);
    renderWord(revealed);
    animateRevealedLetters(letter);
  } else if (lastAction === "wrong") {
    updateKeyButton(letter, false);
    shakeWord();
    const wrongCount = getWrongCount(appState.gameState);
    revealHangmanPart(wrongCount);
    renderHearts(appState.gameState.remainingAttempts, appState.gameState.maxAttempts);
  }

  if (appState.gameState.isOver) {
    handleGameOver();
  }
};

const handleGameOver = () => {
  disableAllKeys();

  const { isWon, word, difficulty, remainingAttempts, maxAttempts } = appState.gameState;
  const score = isWon ? calculateScore(difficulty, remainingAttempts, maxAttempts) : 0;
  const hintPenalty = appState.hintUsed ? Math.floor(score * 0.3) : 0;
  const finalScore = Math.max(0, score - hintPenalty);

  const currentPlayer = appState.players[appState.currentPlayerIndex];
  const updatedPlayer = updatePlayerScore(currentPlayer.id, finalScore, isWon, difficulty, word);

  if (updatedPlayer) {
    appState.players[appState.currentPlayerIndex] = updatedPlayer;
  }

  appState.roundScores.push({ playerIndex: appState.currentPlayerIndex, score: finalScore, won: isWon });

  setTimeout(() => {
    showResult(isWon, word, finalScore);
  }, 800);
};

// --- Post-Game Actions ---

const handlePlayAgain = () => {
  hideModal("result-modal");

  if (appState.playerCount === 2) {
    const nextIndex = (appState.currentPlayerIndex + 1) % appState.players.length;
    const bothPlayed = appState.roundScores.length % 2 === 0 && appState.roundScores.length > 0;

    if (bothPlayed) {
      appState.currentPlayerIndex = 0;
      showTurnIndicator(appState.players[0].name, () => startNewRound());
    } else {
      appState.currentPlayerIndex = nextIndex;
      showTurnIndicator(appState.players[nextIndex].name, () => startNewRound());
    }
  } else {
    startNewRound();
  }
};

const handleBackToMenu = () => {
  hideModal("result-modal");
  showScreen("setup-screen");
};

// --- Hint ---

const handleHintClick = () => {
  if (!appState.gameState || appState.gameState.isOver) return;

  appState.hintUsed = true;
  showHint(appState.gameState.hint, appState.gameState.category);
};

// --- Leaderboard ---

const handleShowLeaderboard = () => {
  const topPlayers = getTopPlayers(10);
  renderLeaderboard(topPlayers);
  showModal("leaderboard-modal");
};

const handleClearScores = () => {
  if (confirm("Estas seguro de que quieres borrar todas las puntuaciones?")) {
    clearLeaderboard();
    renderLeaderboard([]);
  }
};

// --- Keyboard Support ---

const handleKeyPress = (event) => {
  if (!appState.gameState || appState.gameState.isOver) return;

  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen || activeScreen.id !== "game-screen") return;

  const key = event.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) {
    handleLetterClick(key);
  }
};

// --- Init ---

const init = () => {
  initSetup();

  $("#hint-btn").addEventListener("click", handleHintClick);
  $("#menu-btn").addEventListener("click", handleBackToMenu);
  $("#play-again-btn").addEventListener("click", handlePlayAgain);
  $("#back-menu-btn").addEventListener("click", handleBackToMenu);
  $("#leaderboard-btn").addEventListener("click", handleShowLeaderboard);
  $("#close-leaderboard-btn").addEventListener("click", () => hideModal("leaderboard-modal"));
  $("#clear-scores-btn").addEventListener("click", handleClearScores);

  document.addEventListener("keydown", handleKeyPress);
};

document.addEventListener("DOMContentLoaded", init);
