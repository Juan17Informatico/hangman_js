// Minimal word bank stub — later migrate client words here
export const words = [
  'MANZANA', 'PROGRAMAR', 'JAVASCRIPT', 'DESARROLLO', 'AHORCADO'
];

export const randomWord = () => words[Math.floor(Math.random() * words.length)];
