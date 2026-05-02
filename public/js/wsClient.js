// Simple WebSocket client wrapper used by rooms.js
let ws = null;
const handlers = {};
let lastRoom = null;
let lastName = null;
let shouldReconnect = true;
let reconnectDelayMs = 1500;
let queuedMessages = [];

const emit = (type, payload = {}) => {
  if (!handlers[type]) return;
  handlers[type].forEach((fn) => fn(payload));
};

export const connect = (roomCode = null, playerName = 'Anon', options = {}) => {
  lastRoom = roomCode;
  lastName = playerName;
  shouldReconnect = options.reconnect !== false;
  reconnectDelayMs = options.reconnectDelayMs || 1500;

  // If there is already an open/connecting socket, reuse it.
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    // Joining can happen after creating room; ensure JOIN_ROOM is still emitted.
    if (roomCode) {
      send('JOIN_ROOM', { code: roomCode, name: playerName });
    }
    return;
  }
  
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${proto}://${location.host}`);

  ws.onopen = () => {
    emit("WS_STATUS", { state: "open" });
    if (queuedMessages.length > 0) {
      queuedMessages.forEach((msg) => ws.send(msg));
      queuedMessages = [];
    }
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

  ws.onerror = () => {
    emit("WS_STATUS", { state: "error" });
  };

  ws.onclose = () => {
    emit("WS_STATUS", { state: "closed" });
    if (shouldReconnect) {
      setTimeout(() => connect(lastRoom, lastName, { reconnect: true, reconnectDelayMs }), reconnectDelayMs);
    }
  };
};

export const send = (type, payload = {}) => {
  const encoded = JSON.stringify({ type, payload });
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(encoded);
  } else if (ws?.readyState === WebSocket.CONNECTING) {
    queuedMessages.push(encoded);
  } else {
    queuedMessages.push(encoded);
    connect(lastRoom, lastName, { reconnect: shouldReconnect, reconnectDelayMs });
  }
};

export const on = (type, fn) => {
  if (!handlers[type]) handlers[type] = [];
  handlers[type].push(fn);
};

export const off = (type, fn) => {
  if (!handlers[type]) return;
  handlers[type] = handlers[type].filter((handler) => handler !== fn);
};

export const once = (type, fn) => {
  const wrapper = (payload) => {
    off(type, wrapper);
    fn(payload);
  };
  on(type, wrapper);
};

export const close = () => {
  shouldReconnect = false;
  queuedMessages = [];
  try { ws?.close(); } catch (e) {}
};
