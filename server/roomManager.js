import { startNewRound, processGuess } from "./gameManager.js";

// In-memory rooms: code -> { code, config, players: Map(socketId->player), organizerId }
const rooms = new Map();

const makeCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
};

const send = (ws, type, payload = {}) => {
  try {
    ws.send(JSON.stringify({ type, payload }));
  } catch (e) {}
};

export const handleMessage = (ws, message, wss) => {
  const { type, payload } = message;
  switch (type) {
    case 'CREATE_ROOM': {
      const code = makeCode();
      const room = {
        code,
        config: Object.assign({ difficulty: 3, wordsPerLevel: 10, timePerWord: 30, maxHints: 3 }, payload.config || {}),
        players: new Map(),
        organizerId: ws._id || Date.now().toString()
      };
      ws._room = code;
      ws._id = room.organizerId;
      room.players.set(ws._id, { id: ws._id, name: payload.name || 'Organizador', score: 0 });
      rooms.set(code, room);
      send(ws, 'ROOM_CREATED', { code, config: room.config });
      break;
    }

    case 'JOIN_ROOM': {
      const { code, name } = payload;
      const room = rooms.get(code);
      if (!room) {
        send(ws, 'ERROR', { message: 'Sala no encontrada' });
        return;
      }
      const playerId = Date.now().toString() + Math.floor(Math.random() * 999);
      ws._room = code;
      ws._id = playerId;
      room.players.set(playerId, { id: playerId, name: name || 'Anon', score: 0 });

      // Notify joining client
      send(ws, 'JOINED_ROOM', { code, playerId, players: Array.from(room.players.values()), config: room.config });

      // Broadcast to others in room
      wss.clients.forEach((client) => {
        if (client !== ws && client._room === code && client.readyState === client.OPEN) {
          send(client, 'PLAYER_JOINED', { id: playerId, name: name });
        }
      });
      break;
    }

    case 'START_GAME': {
      const roomCode = ws._room;
      const room = rooms.get(roomCode);
      if (!room) return;
      if (ws._id !== room.organizerId) return send(ws, 'ERROR', { message: 'Solo el organizador puede iniciar' });
      startNewRound(room, wss);
      break;
    }

    case 'GUESS_LETTER': {
      const roomCode = ws._room;
      const room = rooms.get(roomCode);
      if (!room) return;
      processGuess(room, payload);
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
  room.players.delete(id);
  // Broadcast leave
  wss.clients.forEach((client) => {
    if (client._room === roomCode && client.readyState === client.OPEN) {
      try { client.send(JSON.stringify({ type: 'PLAYER_LEFT', payload: { id } })); } catch (e) {}
    }
  });
  // If room empty, delete
  if (room.players.size === 0) rooms.delete(roomCode);
};
