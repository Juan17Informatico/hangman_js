import {
  applyGuess,
  createInitialRoomState,
  getMaskedWord,
  initializeGame,
  roomView,
  startNextRound,
  useHint
} from "./gameManager.js";

const rooms = new Map();

const makeCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
};

const createUniqueCode = () => {
  let code = makeCode();
  while (rooms.has(code)) code = makeCode();
  return code;
};

const send = (ws, type, payload = {}) => {
  try {
    ws.send(JSON.stringify({ type, payload }));
  } catch (e) {}
};

const roomClients = (wss, code) =>
  [...wss.clients].filter((client) => client._room === code && client.readyState === 1);

const broadcast = (wss, code, type, payload = {}) => {
  roomClients(wss, code).forEach((client) => send(client, type, payload));
};

const broadcastRoomState = (room, wss) => {
  broadcast(wss, room.code, "ROOM_STATE", roomView(room));
  broadcast(wss, room.code, "SCOREBOARD_UPDATE", {
    players: roomView(room).players.sort((a, b) => b.score - a.score)
  });
};

const clearRoundTimer = (room) => {
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.timerInterval = null;
  room.timerEndsAt = null;
};

const finishRound = (room, wss, reason = "completed") => {
  clearRoundTimer(room);
  if (!room.currentRound) return;

  const payload = {
    reason,
    word: room.currentRound.word,
    guessedBy: room.currentRound.guessedBy,
    won: room.currentRound.won
  };
  broadcast(wss, room.code, "ROUND_RESULT", payload);
  broadcastRoomState(room, wss);

  const next = startNextRound(room);
  if (!next) {
    broadcast(wss, room.code, "GAME_COMPLETED", {
      leaderboard: roomView(room).players.sort((a, b) => b.score - a.score)
    });
    return;
  }

  announceRound(room, wss);
};

const announceRound = (room, wss) => {
  const round = room.currentRound;
  if (!round) return;
  broadcast(wss, room.code, "ROUND_STARTED", {
    round: room.roundIndex,
    totalRounds: room.words.length,
    maskedWord: getMaskedWord(round.word, round.correctLetters),
    remainingAttempts: round.remainingAttempts,
    usedLetters: [],
    wrongLetters: [],
    category: round.category
  });

  room.timerEndsAt = Date.now() + room.config.timePerWord * 1000;
  room.timerInterval = setInterval(() => {
    if (!room.currentRound || room.currentRound.isOver) {
      clearRoundTimer(room);
      return;
    }
    const remainingSeconds = Math.max(0, Math.ceil((room.timerEndsAt - Date.now()) / 1000));
    broadcast(wss, room.code, "TIMER_TICK", { remainingSeconds });
    if (remainingSeconds <= 0) {
      room.currentRound.isOver = true;
      room.currentRound.won = false;
      room.players.forEach((p) => {
        p.losses += 1;
      });
      finishRound(room, wss, "time_up");
    }
  }, 1000);

  broadcastRoomState(room, wss);
};

export const handleMessage = (ws, message, wss) => {
  const { type, payload } = message;
  switch (type) {
    case 'CREATE_ROOM': {
      const code = createUniqueCode();
      const organizerId = Date.now().toString();
      const roomConfig = Object.assign(
        { difficulty: 3, wordsPerLevel: 10, timePerWord: 30, maxHints: 3 },
        payload.config || {}
      );
      roomConfig.maxHints = Math.min(3, Math.max(0, roomConfig.maxHints));
      roomConfig.wordsPerLevel = Math.max(1, roomConfig.wordsPerLevel);
      roomConfig.timePerWord = Math.max(5, roomConfig.timePerWord);

      const room = createInitialRoomState(code, roomConfig, organizerId, payload.name);
      ws._room = code;
      ws._id = room.organizerId;
      rooms.set(code, room);
      send(ws, 'ROOM_CREATED', { code, config: room.config, organizerId, playerId: organizerId });
      broadcastRoomState(room, wss);
      break;
    }

    case 'JOIN_ROOM': {
      const { code, name } = payload;
      const room = rooms.get(code);
      if (!room) {
        send(ws, 'ERROR', { message: 'Sala no encontrada' });
        return;
      }
      if (room.status === "finished") {
        send(ws, "ERROR", { message: "La sala ya finalizo" });
        return;
      }
      const playerId = Date.now().toString() + Math.floor(Math.random() * 999);
      ws._room = code;
      ws._id = playerId;
      room.players.set(playerId, { id: playerId, name: name || 'Anon', score: 0, wins: 0, losses: 0 });

      send(ws, 'JOINED_ROOM', { code, playerId, config: room.config, organizerId: room.organizerId });
      broadcast(wss, code, 'PLAYER_JOINED', { id: playerId, name: name || "Anon" });
      broadcastRoomState(room, wss);
      break;
    }

    case 'START_GAME': {
      const roomCode = ws._room;
      const room = rooms.get(roomCode);
      if (!room) return;
      if (ws._id !== room.organizerId) return send(ws, 'ERROR', { message: 'Solo el organizador puede iniciar' });
      initializeGame(room);
      startNextRound(room);
      announceRound(room, wss);
      break;
    }

    case 'GUESS_LETTER': {
      const roomCode = ws._room;
      const room = rooms.get(roomCode);
      if (!room) return;
      const result = applyGuess(room, ws._id, payload.letter);
      if (!result.ok) return send(ws, "ERROR", { message: result.reason });
      broadcast(wss, room.code, "ROUND_UPDATE", {
        hit: result.hit,
        playerId: ws._id,
        maskedWord: getMaskedWord(room.currentRound.word, room.currentRound.correctLetters),
        usedLetters: [...room.currentRound.usedLetters],
        wrongLetters: [...room.currentRound.wrongLetters],
        remainingAttempts: room.currentRound.remainingAttempts
      });
      if (result.isOver) finishRound(room, wss);
      else broadcastRoomState(room, wss);
      break;
    }

    case "USE_HINT": {
      const roomCode = ws._room;
      const room = rooms.get(roomCode);
      if (!room) return;
      const result = useHint(room);
      if (!result.ok) return send(ws, "ERROR", { message: result.reason });
      send(ws, "HINT_RESPONSE", result);
      broadcastRoomState(room, wss);
      break;
    }

    case "REQUEST_ROOM_STATE": {
      const roomCode = ws._room;
      const room = rooms.get(roomCode);
      if (!room) return;
      send(ws, "ROOM_STATE", roomView(room));
      break;
    }

    default:
      send(ws, 'ERROR', { message: 'Tipo no soportado' });
  }
};

export const handleDisconnect = (ws, wss) => {
  const roomCode = ws._room;
  const id = ws._id;
  if (!roomCode) return;
  const room = rooms.get(roomCode);
  if (!room) return;
  if (id === room.organizerId) {
    const nextOrganizer = [...room.players.keys()].find((pid) => pid !== id);
    room.organizerId = nextOrganizer || null;
  }
  room.players.delete(id);
  broadcast(wss, roomCode, "PLAYER_LEFT", { id, organizerId: room.organizerId });
  if (room.players.size === 0) {
    clearRoundTimer(room);
    rooms.delete(roomCode);
  } else {
    broadcastRoomState(room, wss);
  }
};
