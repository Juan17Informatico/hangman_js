// Simple WebSocket client wrapper used by rooms.js
let ws = null;
const handlers = {};
let lastRoom = null;
let lastName = null;

export const connect = (roomCode = null, playerName = 'Anon') => {
  lastRoom = roomCode;
  lastName = playerName;
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);

  ws.onopen = () => {
    // If joining directly, send JOIN_ROOM; otherwise wait for explicit CREATE_ROOM
    if (roomCode) send('JOIN_ROOM', { code: roomCode, name: playerName });
  };

  ws.onmessage = ({ data }) => {
    try {
      const { type, payload } = JSON.parse(data);
      if (handlers[type]) handlers[type].forEach((fn) => fn(payload));
    } catch (e) {
      console.error('WS parse error', e);
    }
  };

  ws.onclose = () => {
    // reconnect attempt
    setTimeout(() => connect(lastRoom, lastName), 1500);
  };
};

export const send = (type, payload = {}) => {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  } else {
    console.warn('WebSocket not open yet');
  }
};

export const on = (type, fn) => {
  if (!handlers[type]) handlers[type] = [];
  handlers[type].push(fn);
};

export const close = () => {
  try { ws?.close(); } catch (e) {}
};
