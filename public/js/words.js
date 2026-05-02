const WORDS = [
  { word: "SOL", difficulty: 1, hint: "Estrella que ilumina el dia", category: "Naturaleza" },
  { word: "MAR", difficulty: 1, hint: "Gran masa de agua salada", category: "Naturaleza" },
  { word: "PAN", difficulty: 1, hint: "Alimento basico hecho de harina", category: "Comida" },
  { word: "LUZ", difficulty: 1, hint: "Lo que permite ver en la oscuridad", category: "Ciencia" },
  { word: "RIO", difficulty: 1, hint: "Corriente natural de agua", category: "Naturaleza" },
  { word: "PIE", difficulty: 1, hint: "Parte del cuerpo al final de la pierna", category: "Cuerpo" },
  { word: "OJO", difficulty: 1, hint: "Organo de la vision", category: "Cuerpo" },
  { word: "REY", difficulty: 1, hint: "Monarca de un reino", category: "Historia" },
  { word: "PEZ", difficulty: 1, hint: "Animal acuatico con aletas", category: "Animales" },
  { word: "RED", difficulty: 1, hint: "Malla para atrapar o conectar", category: "Objetos" },
  { word: "GAS", difficulty: 1, hint: "Estado de la materia", category: "Ciencia" },
  { word: "SAL", difficulty: 1, hint: "Condimento blanco para la comida", category: "Comida" },
  { word: "CASA", difficulty: 2, hint: "Lugar donde vives", category: "Lugares" },
  { word: "MESA", difficulty: 2, hint: "Mueble con patas para apoyar cosas", category: "Objetos" },
  { word: "GATO", difficulty: 2, hint: "Felino domestico", category: "Animales" },
  { word: "LUNA", difficulty: 2, hint: "Satelite natural de la Tierra", category: "Naturaleza" },
  { word: "AMOR", difficulty: 2, hint: "Sentimiento profundo de afecto", category: "Emociones" },
  { word: "VIDA", difficulty: 2, hint: "Lo opuesto a la muerte", category: "Filosofia" },
  { word: "AGUA", difficulty: 2, hint: "Liquido esencial para vivir", category: "Naturaleza" },
  { word: "HORA", difficulty: 2, hint: "Unidad de tiempo de 60 minutos", category: "Tiempo" },
  { word: "ROPA", difficulty: 2, hint: "Prendas que usamos para vestirnos", category: "Objetos" },
  { word: "DATO", difficulty: 2, hint: "Informacion o hecho concreto", category: "Tecnologia" },
  { word: "NUBE", difficulty: 2, hint: "Masa de vapor de agua en el cielo", category: "Naturaleza" },
  { word: "LOBO", difficulty: 2, hint: "Canino salvaje que vive en manada", category: "Animales" },
  { word: "ARBOL", difficulty: 3, hint: "Planta grande con tronco y ramas", category: "Naturaleza" },
  { word: "PLAYA", difficulty: 3, hint: "Franja de arena junto al mar", category: "Lugares" },
  { word: "LIBRO", difficulty: 3, hint: "Conjunto de paginas con texto", category: "Objetos" },
  { word: "NOCHE", difficulty: 3, hint: "Periodo de oscuridad del dia", category: "Tiempo" },
  { word: "VERDE", difficulty: 3, hint: "Color de la hierba y las hojas", category: "Colores" },
  { word: "MUNDO", difficulty: 3, hint: "El planeta Tierra", category: "Naturaleza" },
  { word: "CAMPO", difficulty: 3, hint: "Terreno extenso fuera de la ciudad", category: "Lugares" },
  { word: "JUEGO", difficulty: 3, hint: "Actividad recreativa", category: "Entretenimiento" },
  { word: "FUEGO", difficulty: 3, hint: "Combustion que produce calor y llamas", category: "Naturaleza" },
  { word: "TIGRE", difficulty: 3, hint: "Gran felino con rayas", category: "Animales" },
  { word: "CLAVE", difficulty: 3, hint: "Algo esencial o una contrasena", category: "Objetos" },
  { word: "RELOJ", difficulty: 3, hint: "Instrumento para medir el tiempo", category: "Objetos" }
];

const normalizeWord = (word) =>
  word
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getWordsByDifficulty = (difficulty) => {
  const min = Math.max(1, difficulty - 1);
  const max = Math.min(10, difficulty + 1);
  return WORDS.filter((w) => w.difficulty >= min && w.difficulty <= max);
};

const getRandomWord = (difficulty) => {
  const pool = getWordsByDifficulty(difficulty);
  const selected = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...selected,
    word: normalizeWord(selected.word)
  };
};

const getDifficultyLabel = (difficulty) => {
  if (difficulty <= 2) return "Facil";
  if (difficulty <= 4) return "Medio";
  if (difficulty <= 6) return "Dificil";
  if (difficulty <= 8) return "Avanzado";
  return "Experto";
};

const getDifficultyColor = (difficulty) => {
  if (difficulty <= 2) return "#00b894";
  if (difficulty <= 4) return "#00cec9";
  if (difficulty <= 6) return "#fdcb6e";
  if (difficulty <= 8) return "#e17055";
  return "#d63031";
};

export { WORDS, getRandomWord, getDifficultyLabel, getDifficultyColor, normalizeWord };
