const STORAGE_KEY = "hangman_leaderboard";

const generateId = () =>
  `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getLeaderboard = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLeaderboard = (leaderboard) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
  } catch (error) {
    console.warn("No se pudo guardar en localStorage:", error.message);
  }
};

const findOrCreatePlayer = (name) => {
  const leaderboard = getLeaderboard();
  const normalizedName = name.trim().toUpperCase();
  const existing = leaderboard.find(
    (p) => p.name.toUpperCase() === normalizedName
  );

  if (existing) return existing;

  const newPlayer = {
    id: generateId(),
    name: name.trim(),
    totalScore: 0,
    wins: 0,
    losses: 0,
    gamesPlayed: 0,
    history: []
  };

  leaderboard.push(newPlayer);
  saveLeaderboard(leaderboard);
  return newPlayer;
};

const updatePlayerScore = (playerId, score, won, difficulty, word) => {
  const leaderboard = getLeaderboard();
  const playerIndex = leaderboard.findIndex((p) => p.id === playerId);

  if (playerIndex === -1) return;

  const player = leaderboard[playerIndex];
  player.totalScore += score;
  player.gamesPlayed += 1;

  if (won) {
    player.wins += 1;
  } else {
    player.losses += 1;
  }

  player.history.push({
    score,
    won,
    difficulty,
    word,
    date: new Date().toISOString()
  });

  if (player.history.length > 50) {
    player.history = player.history.slice(-50);
  }

  leaderboard[playerIndex] = player;
  saveLeaderboard(leaderboard);
  return player;
};

const getTopPlayers = (limit = 10) => {
  const leaderboard = getLeaderboard();
  return leaderboard
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
};

const clearLeaderboard = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export {
  generateId,
  getLeaderboard,
  findOrCreatePlayer,
  updatePlayerScore,
  getTopPlayers,
  clearLeaderboard
};
