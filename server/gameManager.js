export const startNewRound = (room, wss) => {
  // Minimal starter: broadcast GAME_STARTED with basic state
  const payload = { message: 'Round started', timestamp: Date.now() };
  wss.clients.forEach((client) => {
    if (client._room === room.code && client.readyState === client.OPEN) {
      client.send(JSON.stringify({ type: 'GAME_STARTED', payload }));
    }
  });
};

export const processGuess = (room, payload) => {
  // Stub: broadcast GUESS_PROCESSED
  const data = { guess: payload.guess, ok: true };
  // In a real impl we'd update state, scores, and send updated board
  room.players.forEach(() => {});
  // Broadcast to players would be done by caller (roomManager)
};
