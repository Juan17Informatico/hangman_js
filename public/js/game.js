const MAX_ATTEMPTS = 6;

const createGameState = (wordData) => ({
  word: wordData.word,
  hint: wordData.hint,
  category: wordData.category,
  difficulty: wordData.difficulty,
  usedLetters: new Set(),
  correctLetters: new Set(),
  wrongLetters: new Set(),
  remainingAttempts: MAX_ATTEMPTS,
  maxAttempts: MAX_ATTEMPTS,
  isOver: false,
  isWon: false
});

const isValidLetter = (letter) => /^[A-Z]$/.test(letter);

const processGuess = (state, rawLetter) => {
  const letter = rawLetter.toUpperCase();

  if (!isValidLetter(letter)) {
    return { ...state, lastAction: "invalid" };
  }

  if (state.usedLetters.has(letter)) {
    return { ...state, lastAction: "repeated" };
  }

  if (state.isOver) {
    return { ...state, lastAction: "game_over" };
  }

  const newState = {
    ...state,
    usedLetters: new Set([...state.usedLetters, letter]),
    correctLetters: new Set(state.correctLetters),
    wrongLetters: new Set(state.wrongLetters),
    remainingAttempts: state.remainingAttempts
  };

  if (state.word.includes(letter)) {
    newState.correctLetters.add(letter);
    newState.lastAction = "correct";
  } else {
    newState.wrongLetters.add(letter);
    newState.remainingAttempts -= 1;
    newState.lastAction = "wrong";
  }

  newState.isWon = checkVictory(newState);
  newState.isOver = newState.isWon || checkDefeat(newState);

  return newState;
};

const checkVictory = (state) =>
  [...state.word].every((letter) => state.correctLetters.has(letter));

const checkDefeat = (state) => state.remainingAttempts <= 0;

const calculateScore = (difficulty, remainingAttempts, maxAttempts) => {
  const baseScore = difficulty * 15;
  const attemptBonus = remainingAttempts * 10;
  const perfectBonus = remainingAttempts === maxAttempts ? 50 : 0;
  return baseScore + attemptBonus + perfectBonus;
};

const getRevealedWord = (word, correctLetters) =>
  [...word].map((letter) => (correctLetters.has(letter) ? letter : "_"));

const getWrongCount = (state) => state.maxAttempts - state.remainingAttempts;

export {
  MAX_ATTEMPTS,
  createGameState,
  processGuess,
  checkVictory,
  checkDefeat,
  calculateScore,
  getRevealedWord,
  getWrongCount,
  isValidLetter
};
