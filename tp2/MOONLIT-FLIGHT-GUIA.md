# Moonlit Flight: guía de estudio

## Qué es

Moonlit Flight es un minijuego de vuelo lateral integrado en la pantalla de detalle de un juego. El jugador controla un murciélago, evita torres y fantasmas, recoge caramelos y trata de mantener sus vidas.

## Dónde está cada parte

- `js/pages/runner.js`: crea la interfaz y contiene el estado, las entradas, las reglas, la física y el ciclo de animación.
- `css/pages/runner.css`: define la presentación, las capas del escenario, los estados visuales y las animaciones.
- `js/pages/game-detail.js`: detecta cuándo se debe iniciar Moonlit Flight y llama a `initRunner(hero)`.
- `game.html`: carga el CSS y el JavaScript del minijuego.
- `assets/img/runner/`: imágenes del murciélago, caramelos, fantasmas y fondos.

## Recorrido de una partida

1. `initRunner(hero)` arma el HTML del juego, guarda referencias a sus elementos y registra los eventos.
2. `prepareGame()` espera a que `preloadAssets()` termine de cargar las imágenes.
3. El estado pasa de `loading` a `ready` y se habilita el botón.
4. `startGame()` reinicia puntaje, vidas, posición y obstáculos; luego pide el primer frame.
5. Un único ciclo `frame(now)` queda activo desde que termina la carga; calcula `dt` y atiende el estado actual. En `ready` y `over` solo dibuja; en `playing` llama a `update(dt)` y luego a `draw()`.
6. `update(dt)` mueve al personaje y los objetos, aplica colisiones, vidas y puntaje.
7. Al llegar a cero vidas, `endGame()` detiene el ciclo y presenta el puntaje final.
8. `resetGame()` permite volver a jugar; `leaveGame()` cambia al estado `closed`, cancela el próximo frame y desmonta el minijuego y sus eventos.

## Estados

| Estado | Qué significa |
| --- | --- |
| `loading` | Se están cargando los recursos visuales. |
| `ready` | El juego está listo y espera que el jugador empiece. |
| `playing` | Se ejecuta el bucle de animación y se aplican las reglas. |
| `over` | La partida terminó; se puede volver a jugar. |

## Funciones principales

| Función | Para qué sirve |
| --- | --- |
| `initRunner(hero)` | Punto de entrada: monta la interfaz y prepara todo el minijuego. |
| `preloadAssets()` | Carga imágenes antes de habilitar el comienzo. |
| `queueFlap()` | Registra una pulsación de vuelo para que la procese la física. |
| `startGame()` | Inicializa una partida y pone en marcha la animación. |
| `update(dt)` | Actualiza física, generación de objetos, colisiones y marcador. |
| `draw()` | Actualiza posiciones y desplazamiento visual del fondo. |
| `frame(now)` | Calcula `dt`, coordina el estado actual y solicita el siguiente frame. |
| `makeTower()` / `makeItem()` | Crean obstáculos y objetos con posiciones aleatorias. |
| `loseLife()` / `gainLife()` | Aplican cambios de vidas y actualizan la interfaz. |
| `overlaps(a, b)` | Comprueba si dos rectángulos de colisión se cruzan. |
| `endGame()` / `resetGame()` | Terminan o reinician la partida. |
| `leaveGame()` | Quita listeners y elementos al salir. |

## Ideas importantes para explicar

- **Bucle de juego:** hay un solo `requestAnimationFrame` mientras el minijuego está abierto. `dt` permite que el movimiento dependa del tiempo y no de la cantidad de cuadros por segundo; además se limita para evitar saltos grandes al volver a una pestaña pausada.
- **Estados en el loop:** `ready` (menú), `playing` (partida), `over` (fin) y `closed` (minijuego desmontado). El loop dibuja en los tres primeros y deja de pedir frames al salir.
- **Física simple:** la velocidad vertical aumenta por gravedad; al aletear se asigna una velocidad hacia arriba. `batY` guarda la posición vertical.
- **Parallax:** las capas del fondo se mueven con factores diferentes (`layerSpeeds`) para dar sensación de profundidad.
- **Colisiones:** el personaje, las torres y los objetos se representan con rectángulos. Se comprueban sus límites en `update`.
- **Dificultad y recompensas:** la abertura de las torres se achica gradualmente; pasarlas suma un punto, recoger caramelo suma cinco y una vida, y tocar un fantasma resta una vida.
- **Separación de responsabilidades:** JavaScript decide qué pasa; CSS presenta esos estados mediante clases como `is-hurt`, `is-rising`, `is-scoring` e `is-collected`.
- **Limpieza:** al salir se cancelan los eventos y la animación. Esto evita que una instancia anterior siga respondiendo en segundo plano.

## Guion corto para la defensa

> “El juego se inicializa desde `initRunner`, que crea la interfaz y conecta los eventos. Cuando las imágenes terminan de cargar, queda en estado `ready` y empieza un único ciclo con `requestAnimationFrame`. Cada vuelta calcula el tiempo transcurrido. En estado `playing`, actualiza física y colisiones en `update` y después la presentación en `draw`; en el menú y en la pantalla final solo dibuja. Las funciones de vidas, puntaje y generación de objetos aplican las reglas. Al salir, `leaveGame` cancela el ciclo y limpia los eventos.”

## Controles y reglas visibles

- `Space`, `↑`, `W` o clic/tap en el escenario: aletear.
- Caramelo: suma 5 puntos y recupera 1 vida, hasta un máximo de 10.
- Fantasma: resta 1 vida.
- Chocar con una torre o un borde: puede restar 1 vida. Hay un breve enfriamiento para evitar descontar varias vidas por un mismo choque continuo.
- Pasar una torre: suma 1 punto.
