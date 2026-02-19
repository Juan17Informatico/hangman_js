const WORDS = [
  // Dificultad 1 — Palabras de 3 letras, muy comunes
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

  // Dificultad 2 — Palabras de 4 letras
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

  // Dificultad 3 — Palabras de 5 letras
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
  { word: "RELOJ", difficulty: 3, hint: "Instrumento para medir el tiempo", category: "Objetos" },

  // Dificultad 4 — Palabras de 6 letras
  { word: "CAMINO", difficulty: 4, hint: "Via o sendero para transitar", category: "Lugares" },
  { word: "PUERTA", difficulty: 4, hint: "Entrada o salida de un lugar", category: "Objetos" },
  { word: "MUSICA", difficulty: 4, hint: "Arte de combinar sonidos", category: "Arte" },
  { word: "TIEMPO", difficulty: 4, hint: "Magnitud que mide la duracion", category: "Ciencia" },
  { word: "CIUDAD", difficulty: 4, hint: "Poblacion grande y urbanizada", category: "Lugares" },
  { word: "COMIDA", difficulty: 4, hint: "Alimentos que se consumen", category: "Comida" },
  { word: "ESCUDO", difficulty: 4, hint: "Proteccion contra ataques", category: "Objetos" },
  { word: "BOSQUE", difficulty: 4, hint: "Terreno cubierto de arboles", category: "Naturaleza" },
  { word: "DRAGON", difficulty: 4, hint: "Criatura mitologica que escupe fuego", category: "Fantasia" },
  { word: "PIEDRA", difficulty: 4, hint: "Material solido y duro de la tierra", category: "Naturaleza" },
  { word: "OCEANO", difficulty: 4, hint: "Gran extension de agua salada", category: "Naturaleza" },
  { word: "VOLCAN", difficulty: 4, hint: "Montana que expulsa lava", category: "Naturaleza" },

  // Dificultad 5 — Palabras de 7 letras
  { word: "VENTANA", difficulty: 5, hint: "Abertura en la pared para luz y aire", category: "Objetos" },
  { word: "ESTRELLA", difficulty: 5, hint: "Cuerpo celeste que brilla en la noche", category: "Naturaleza" },
  { word: "MEMORIA", difficulty: 5, hint: "Capacidad de recordar", category: "Ciencia" },
  { word: "NATURAL", difficulty: 5, hint: "Que proviene de la naturaleza", category: "Naturaleza" },
  { word: "CABALLO", difficulty: 5, hint: "Animal equino de gran tamano", category: "Animales" },
  { word: "MOMENTO", difficulty: 5, hint: "Instante o periodo breve", category: "Tiempo" },
  { word: "TESORO", difficulty: 5, hint: "Conjunto de objetos valiosos", category: "Objetos" },
  { word: "PINTURA", difficulty: 5, hint: "Obra de arte o material para colorear", category: "Arte" },
  { word: "GALAXIA", difficulty: 5, hint: "Sistema de estrellas y planetas", category: "Ciencia" },
  { word: "CIRCULO", difficulty: 5, hint: "Figura geometrica redonda", category: "Ciencia" },
  { word: "TECLADO", difficulty: 5, hint: "Dispositivo de entrada con teclas", category: "Tecnologia" },
  { word: "PANTANO", difficulty: 5, hint: "Terreno inundado con vegetacion", category: "Naturaleza" },

  // Dificultad 6 — Palabras de 7-8 letras
  { word: "LIBERTAD", difficulty: 6, hint: "Derecho a actuar sin restricciones", category: "Filosofia" },
  { word: "AVENTURA", difficulty: 6, hint: "Experiencia emocionante e inusual", category: "Entretenimiento" },
  { word: "UNIVERSO", difficulty: 6, hint: "Todo lo que existe en el espacio", category: "Ciencia" },
  { word: "PROBLEMA", difficulty: 6, hint: "Situacion dificil que requiere solucion", category: "Filosofia" },
  { word: "ELEFANTE", difficulty: 6, hint: "Mamifero terrestre mas grande", category: "Animales" },
  { word: "VOLEIBOL", difficulty: 6, hint: "Deporte de red con balon", category: "Deportes" },
  { word: "PIRAMIDE", difficulty: 6, hint: "Construccion monumental de Egipto", category: "Historia" },
  { word: "CASCABEL", difficulty: 6, hint: "Bola metalica que suena al moverse", category: "Objetos" },
  { word: "TORMENTA", difficulty: 6, hint: "Fenomeno atmosferico violento", category: "Naturaleza" },
  { word: "MARIPOSA", difficulty: 6, hint: "Insecto con alas coloridas", category: "Animales" },

  // Dificultad 7 — Palabras de 9-10 letras
  { word: "DINOSAURIO", difficulty: 7, hint: "Reptil prehistorico extinto", category: "Animales" },
  { word: "TELESCOPIO", difficulty: 7, hint: "Instrumento para ver objetos lejanos", category: "Ciencia" },
  { word: "SUBMARINO", difficulty: 7, hint: "Nave que viaja bajo el agua", category: "Tecnologia" },
  { word: "ALGORITMO", difficulty: 7, hint: "Secuencia de pasos para resolver un problema", category: "Tecnologia" },
  { word: "CHOCOLATE", difficulty: 7, hint: "Dulce hecho de cacao", category: "Comida" },
  { word: "PERSONAJE", difficulty: 7, hint: "Ser ficticio en una historia", category: "Arte" },
  { word: "VIDEOJUEGO", difficulty: 7, hint: "Juego electronico interactivo", category: "Tecnologia" },
  { word: "NATURALEZA", difficulty: 7, hint: "Mundo fisico y sus fenomenos", category: "Naturaleza" },
  { word: "PERIODICO", difficulty: 7, hint: "Publicacion impresa de noticias", category: "Objetos" },
  { word: "LABERINTO", difficulty: 7, hint: "Estructura con caminos confusos", category: "Lugares" },

  // Dificultad 8 — Palabras de 10-11 letras
  { word: "JAVASCRIPT", difficulty: 8, hint: "Lenguaje de programacion para la web", category: "Tecnologia" },
  { word: "COMPUTADORA", difficulty: 8, hint: "Maquina electronica para procesar datos", category: "Tecnologia" },
  { word: "HELICOPTERO", difficulty: 8, hint: "Aeronave con helices horizontales", category: "Tecnologia" },
  { word: "TEMPERATURA", difficulty: 8, hint: "Medida de calor o frio", category: "Ciencia" },
  { word: "FOTOGRAFIA", difficulty: 8, hint: "Imagen capturada con una camara", category: "Arte" },
  { word: "ELECTRICIDAD", difficulty: 8, hint: "Forma de energia con electrones", category: "Ciencia" },
  { word: "ARQUITECTURA", difficulty: 8, hint: "Arte de disenar y construir edificios", category: "Arte" },
  { word: "RESTAURANTE", difficulty: 8, hint: "Lugar donde se sirve comida", category: "Lugares" },
  { word: "BALONCESTO", difficulty: 8, hint: "Deporte de canasta con balon", category: "Deportes" },
  { word: "RINOCERONTE", difficulty: 8, hint: "Mamifero grande con cuerno nasal", category: "Animales" },

  // Dificultad 9 — Palabras de 12+ letras
  { word: "PROGRAMACION", difficulty: 9, hint: "Proceso de escribir codigo para computadoras", category: "Tecnologia" },
  { word: "COMUNICACION", difficulty: 9, hint: "Intercambio de informacion entre personas", category: "Filosofia" },
  { word: "EXTRATERRESTRE", difficulty: 9, hint: "Ser de fuera del planeta Tierra", category: "Ciencia" },
  { word: "EXTRAORDINARIO", difficulty: 9, hint: "Algo fuera de lo comun y notable", category: "Filosofia" },
  { word: "CRIPTOGRAFIA", difficulty: 9, hint: "Ciencia de cifrar mensajes", category: "Tecnologia" },
  { word: "BIODIVERSIDAD", difficulty: 9, hint: "Variedad de seres vivos en un ecosistema", category: "Ciencia" },
  { word: "NEUROCIENCIA", difficulty: 9, hint: "Estudio del sistema nervioso", category: "Ciencia" },
  { word: "ASTRONOMIA", difficulty: 9, hint: "Ciencia que estudia los astros", category: "Ciencia" },

  // Dificultad 10 — Palabras largas y complejas
  { word: "RESPONSABILIDAD", difficulty: 10, hint: "Capacidad de cumplir compromisos", category: "Filosofia" },
  { word: "RETROALIMENTACION", difficulty: 10, hint: "Respuesta a un proceso para mejorarlo", category: "Tecnologia" },
  { word: "INCONDICIONAL", difficulty: 10, hint: "Sin condiciones ni limites", category: "Filosofia" },
  { word: "ELECTROMAGNETISMO", difficulty: 10, hint: "Fuerza que combina electricidad y magnetismo", category: "Ciencia" },
  { word: "DESCENTRALIZACION", difficulty: 10, hint: "Distribucion del poder o control", category: "Tecnologia" },
  { word: "MICROPROCESADOR", difficulty: 10, hint: "Chip que ejecuta instrucciones en una computadora", category: "Tecnologia" },
  { word: "INFRAESTRUCTURA", difficulty: 10, hint: "Base fisica para el funcionamiento de servicios", category: "Tecnologia" },
  { word: "SOSTENIBILIDAD", difficulty: 10, hint: "Capacidad de mantenerse sin agotar recursos", category: "Naturaleza" }
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
