import { buildWordSequence } from "./wordBank.js";

const MAX_ATTEMPTS = 6;
const BONUS_PER_REMAINING_ATTEMPT = 10;
const BASE_SCORE_MULTIPLIER = 15;
const PERFECT_BONUS = 50;
const HINT_PENALTY_PERCENT = 0.3;

export const roomView = (room) => ({
  code: room.code,
  status: room.status,
  organizerId: room.organizerId,
  config: room.config,
  roundIndex: room.roundIndex,
  totalRounds: room.words.length,
  players: Array.from(room.players.values()).map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score,
    wins: player.wins,
    losses: player.losses
  })),
  currentWordState: room.currentRound
    ? {
        maskedWord: getMaskedWord(room.currentRound.word, room.currentRound.correctLetters),
        usedLetters: [...room.currentRound.usedLetters],
        wrongLetters: [...room.currentRound.wrongLetters],
        remainingAttempts: room.currentRound.remainingAttempts,
        hintsUsed: room.currentRound.hintsUsed,
        maxHints: room.config.maxHints
      }
    : null
});

export const createInitialRoomState = (code, config, organizerId, organizerName) => ({
  code,
  status: "lobby",
  config,
  players: new Map([
    [
      organizerId,
      { id: organizerId, name: organizerName || "Organizador", score: 0, wins: 0, losses: 0 }
    ]
  ]),
  organizerId,
  roundIndex: 0,
  words: [],
  currentRound: null,
  timerInterval: null,
  timerEndsAt: null
});

export const initializeGame = (room) => {
  room.status = "playing";
  room.roundIndex = 0;
  room.words = buildWordSequence(room.config.difficulty, room.config.wordsPerLevel);
  room.currentRound = null;
};

export const startNextRound = (room) => {
  if (room.roundIndex >= room.words.length) {
    room.status = "finished";
    room.currentRound = null;
    return null;
  }

  const wordData = room.words[room.roundIndex];
  room.currentRound = {
    ...wordData,
    usedLetters: new Set(),
    correctLetters: new Set(),
    wrongLetters: new Set(),
    remainingAttempts: MAX_ATTEMPTS,
    isOver: false,
    won: false,
    hintsUsed: 0,
    guessedBy: null
  };

  room.roundIndex += 1;
  return room.currentRound;
};

export const applyGuess = (room, playerId, rawGuess) => {
  if (!room.currentRound || room.currentRound.isOver) {
    return { ok: false, reason: "La ronda ya termino" };
  }

  const guess = String(rawGuess || "").trim().toUpperCase();
  if (!/^[A-Z]$/.test(guess)) {
    return { ok: false, reason: "Ingresa una letra valida (A-Z)" };
  }

  if (room.currentRound.usedLetters.has(guess)) {
    return { ok: false, reason: "Esa letra ya fue usada" };
  }

  room.currentRound.usedLetters.add(guess);
  const hit = room.currentRound.word.includes(guess);
  if (hit) {
    room.currentRound.correctLetters.add(guess);
  } else {
    room.currentRound.wrongLetters.add(guess);
    room.currentRound.remainingAttempts -= 1;
  }

  const won = [...room.currentRound.word].every((letter) => room.currentRound.correctLetters.has(letter));
  const lost = room.currentRound.remainingAttempts <= 0;

  if (won || lost) {
    room.currentRound.isOver = true;
    room.currentRound.won = won;
    room.currentRound.guessedBy = won ? playerId : null;
    const player = room.players.get(playerId);
    if (won && player) {
      const score = calculateRoundScore(room.config.difficulty, room.currentRound.remainingAttempts, room.currentRound.hintsUsed);
      player.score += score;
      player.wins += 1;
    } else {
      room.players.forEach((p) => {
        p.losses += 1;
      });
    }
  }

  return {
    ok: true,
    hit,
    isOver: room.currentRound.isOver,
    won: room.currentRound.won
  };
};

export const useHint = (room) => {
  if (!room.currentRound || room.currentRound.isOver) {
    return { ok: false, reason: "No hay ronda activa" };
  }

  if (room.currentRound.hintsUsed >= room.config.maxHints) {
    return { ok: false, reason: "Alcanzaste el máximo de pistas para esta ronda" };
  }

  room.currentRound.hintsUsed += 1;
  return {
    ok: true,
    hint: room.currentRound.hint,
    category: room.currentRound.category,
    hintsUsed: room.currentRound.hintsUsed,
    maxHints: room.config.maxHints
  };
};

export const getMaskedWord = (word, correctLetters) =>
  [...word].map((letter) => (correctLetters.has(letter) ? letter : "_")).join(" ");

const calculateRoundScore = (difficulty, remainingAttempts, hintsUsed) => {
  const rawScore =
    difficulty * BASE_SCORE_MULTIPLIER +
    remainingAttempts * BONUS_PER_REMAINING_ATTEMPT +
    (remainingAttempts === MAX_ATTEMPTS ? PERFECT_BONUS : 0);
  const penalty = Math.floor(rawScore * HINT_PENALTY_PERCENT * hintsUsed);
  return Math.max(0, rawScore - penalty);
};
