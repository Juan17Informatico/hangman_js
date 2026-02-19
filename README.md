# Hangman — El Ahorcado

Juego clasico del Ahorcado desarrollado con HTML, CSS y JavaScript vanilla.

## Descripcion

El jugador debe adivinar una palabra secreta letra por letra antes de quedarse sin intentos. Cuenta con sistema de dificultad (niveles 1-10), soporte para 1 o 2 jugadores, y tabla de puntuaciones persistente.

## Caracteristicas

- **Palabra aleatoria** seleccionada de un banco de +120 palabras categorizadas
- **10 niveles de dificultad** basados en la complejidad y longitud de las palabras
- **Sistema de intentos** con 6 oportunidades (clasico del ahorcado)
- **Registro de letras usadas** — las repetidas no penalizan
- **Deteccion de victoria y derrota** automatica
- **Reinicio de partida** en cualquier momento
- **Modo 1 o 2 jugadores** con turnos alternados
- **Tabla de puntuaciones** guardada en localStorage
- **Sistema de pistas** con penalizacion en el puntaje
- **Interfaz visual moderna** con tema oscuro y animaciones
- **Soporte de teclado fisico** y teclado virtual en pantalla
- **Confetti** en victorias usando canvas-confetti
- **Diseno responsivo** para escritorio, tablet y movil

## Logica del Juego

1. Se selecciona una palabra aleatoria segun la dificultad elegida
2. El jugador ingresa letras usando el teclado fisico o virtual
3. Si la letra es correcta: se revela en todas sus posiciones
4. Si es incorrecta: se reduce el numero de intentos y se dibuja una parte del ahorcado
5. El jugador **gana** si descubre todas las letras
6. El jugador **pierde** si se queda sin intentos (6 errores)
7. Las letras repetidas **no** penalizan

## Sistema de Puntuacion

```
Puntuacion = (dificultad * 15) + (intentos restantes * 10) + bonus perfecto (50)
```

- Usar la pista reduce el puntaje un 30%
- Perder otorga 0 puntos

## Estructura del Proyecto

```
hangman_js/
├── index.html          # Pagina principal
├── css/
│   └── styles.css      # Estilos con tema oscuro
├── js/
│   ├── app.js          # Controlador principal y eventos
│   ├── game.js         # Logica pura del juego
│   ├── ui.js           # Manipulacion del DOM y renderizado
│   ├── storage.js      # Operaciones con localStorage
│   └── words.js        # Banco de palabras con dificultad
└── README.md
```

## Como Ejecutar

Este proyecto usa ES Modules (`type="module"`), por lo que necesita servirse desde un servidor HTTP. Opciones:

### Opcion 1 — VS Code Live Server
Instala la extension "Live Server" en VS Code y haz clic en "Go Live".

### Opcion 2 — Servidor con Python
```bash
python -m http.server 8080
```

### Opcion 3 — Servidor con Node.js
```bash
npx serve .
```

Luego abre `http://localhost:8080` en tu navegador.

## Tecnologias

- **HTML5** — Estructura semantica
- **CSS3** — Variables CSS, Flexbox, Grid, animaciones, glassmorphism
- **JavaScript ES6+** — Modules, arrow functions, const/let, Set, spread operator, template literals
- **canvas-confetti** — Animacion de confetti en victorias (CDN)
- **Google Fonts** — Tipografia Inter

## Compatibilidad

Navegadores modernos que soporten ES Modules:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+
