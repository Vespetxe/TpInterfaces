/*
 * MOONLIT FLIGHT
 * Minijuego estilo "Flappy Bird" integrado en la página de detalle.
 *
 * Orden para estudiar el archivo:
 * 1. Recursos y construcción de la interfaz.
 * 2. Estado del juego y referencias al HTML.
 * 3. Entrada del jugador y eventos.
 * 4. Reglas (vidas, puntaje, obstáculos y objetos).
 * 5. Bucle principal: frame -> update -> draw.
 * 6. Preparación inicial.
 *
 * Todo queda dentro de initRunner para que las variables del juego no
 * contaminen el ámbito global. game-detail.js llama a esta función.
 */

// Imágenes que se cargan antes de habilitar el botón de inicio.
const RUNNER_ASSETS = [
    "assets/img/runner/murcielago_playing.png",
    "assets/img/runner/murcielago_playing_aleteo.png",
    "assets/img/runner/murcielago_hurt.png",
    "assets/img/runner/murcielago_lose.png",
    "assets/img/runner/caramelo.png",
    "assets/img/runner/fantasmita.png",
    "assets/img/runner/clouds.svg?v=3",
    "assets/img/runner/hills.svg?v=3",
    "assets/img/runner/castles.svg?v=3",
    "assets/img/runner/foreground.svg?v=3"
];

// Constantes de física y movimiento (pixeles y segundos).
// Centralizarlas facilita entender y ajustar la dificultad.
const RUNNER_GRAVITY = 1120;
const RUNNER_FLAP_IMPULSE = -405;
const RUNNER_MAX_FALL_SPEED = 690;
const RUNNER_WORLD_SPEED = 225;

function initRunner(hero) {
    // ----- 1. Interfaz del juego -----
    // La estructura se crea desde JavaScript y se inserta dentro del hero.
    const root = document.createElement("section");
    root.className = "runner";
    root.setAttribute("aria-label", "Moonlit Flight runner game");
    root.innerHTML = `
        <div class="runner__topbar">
            <div class="runner__brand"><span aria-hidden="true">☾</span> Moonlit Flight</div>
        </div>
        <div class="runner__stage" id="runnerStage" tabindex="0" role="application" aria-label="Game area. Press Space or Arrow Up to flap">
            <div class="runner__stats" aria-live="polite">
                <span class="runner__lives" aria-label="Lives"><strong id="runnerLives"></strong></span>
                <span class="runner__score">Score <strong id="runnerScore">0</strong></span>
            </div>
            <div class="runner__layer runner__layer--clouds" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--hills" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--castles" aria-hidden="true"></div>
            <div class="runner__layer runner__layer--foreground" aria-hidden="true"></div>
            <div class="runner__towers" id="runnerTowers" aria-hidden="true"></div>
            <div class="runner__items" id="runnerItems" aria-hidden="true"></div>
            <div class="runner__bat" id="runnerBat" role="img" aria-label="Kawaii bat">
                <img class="runner__bat-pose runner__bat-pose--base" src="assets/img/runner/murcielago_playing.png" alt="">
                <img class="runner__bat-pose runner__bat-pose--flap" src="assets/img/runner/murcielago_playing_aleteo.png" alt="">
                <img class="runner__bat-state" src="assets/img/runner/murcielago_hurt.png" alt="">
            </div>
            <div class="runner__overlay" id="runnerOverlay" aria-live="polite">
                <div class="runner__card">
                    <p class="runner__eyebrow">A tiny Halloween adventure</p>
                    <h2 id="runnerOverlayTitle">Ready to fly?</h2>
                    <p id="runnerOverlayText">Use up to 10 lives to fly through the night. Collect candy, avoid ghosts and towers.</p>
                    <button type="button" class="runner__button" id="runnerMainButton" disabled>Loading the moonlight…</button>
                    <p class="runner__hint">Space / ↑ / click to flap</p>
                </div>
            </div>
        </div>
        <div class="runner__legend" aria-label="Game rules">
            <span><i class="runner__legend-icon runner__legend-icon--candy" aria-hidden="true">🍬</i> Candy +1 life</span>
            <span><i class="runner__legend-icon runner__legend-icon--ghost" aria-hidden="true">👻</i> Ghost −1 life</span>
            <span>Tower and edge hits −1 life</span>
        </div>
        <button type="button" class="runner__exit" id="runnerExit">Back to game page</button>
    `;
    hero.appendChild(root);

    // ----- 2. Referencias a elementos de la interfaz -----
    // Guardamos los nodos una sola vez para reutilizarlos durante la partida.
    const stage = root.querySelector("#runnerStage");
    const bat = root.querySelector("#runnerBat");
    const batStateImage = root.querySelector(".runner__bat-state");
    const towersLayer = root.querySelector("#runnerTowers");
    const itemsLayer = root.querySelector("#runnerItems");
    const scoreOutput = root.querySelector("#runnerScore");
    const livesOutput = root.querySelector("#runnerLives");
    const overlay = root.querySelector("#runnerOverlay");
    const overlayTitle = root.querySelector("#runnerOverlayTitle");
    const overlayText = root.querySelector("#runnerOverlayText");
    const mainButton = root.querySelector("#runnerMainButton");
    const exitButton = root.querySelector("#runnerExit");
    const layers = [...root.querySelectorAll(".runner__layer")];
    // Cada capa del fondo se mueve a distinta velocidad para crear profundidad.
    const layerSpeeds = [0.12, 0.24, 0.48, 0.82];

    // ----- 3. Estado del juego -----
    // input conserva una acción pendiente hasta que update la procesa.
    const input = { flap: false };
    // Obstáculos y objetos activos en pantalla.
    const towers = [];
    const items = [];
    // Variables del único ciclo requestAnimationFrame y del estado general.
    let animationFrame = 0;
    let previousFrame = 0;
    let state = "loading";
    let elapsed = 0;
    let score = 0;
    const maxLives = 10;
    let lives = maxLives;
    let hitCooldown = 0;
    let batY = 0;
    let batVelocity = 0;
    let distance = 0;
    let nextTowerIn = 0.8;
    let lastStageWidth = 0;
    let lastStageHeight = 0;

    // ----- 4. Entrada del jugador -----
    // Teclado: Space, flecha arriba o W inician la partida y hacen volar.
    const onKeyDown = (event) => {
        if (!["Space", "ArrowUp", "KeyW"].includes(event.code)) return;
        event.preventDefault();
        if (event.repeat) return;
        if (state === "ready") startGame();
        if (state === "playing") queueFlap();
    };
    // Mouse/pantalla táctil: tocar el escenario hace lo mismo que el teclado.
    const onPointerDown = (event) => {
        if (event.target.closest("button")) return;
        if (state === "ready") startGame();
        if (state === "playing") queueFlap();
    };
    // Al soltar la tecla se limpia la acción para que cada pulsación sea un aleteo.
    const onKeyUp = (event) => {
        if (["Space", "ArrowUp", "KeyW"].includes(event.code)) input.flap = false;
    };
    const onBlur = () => { input.flap = false; };

    // Registra un aleteo. La física se aplica luego en update().
    function queueFlap() {
        input.flap = true;
        bat.classList.add("is-rising");
        bat.classList.remove("is-falling");
    }

    // Cambia la imagen principal del murciélago (normal, herido o derrotado).
    function setBatImage(src) {
        batStateImage.src = src;
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    stage.addEventListener("pointerdown", onPointerDown);
    mainButton.addEventListener("click", () => {
        if (state === "ready") { startGame(); queueFlap(); }
        else if (state === "over") resetGame();
    });
    exitButton.addEventListener("click", leaveGame);

    // Espera la carga de todos los recursos. Si alguno falla, el juego igual continúa.
    function preloadAssets() {
        return Promise.all(RUNNER_ASSETS.map((src) => new Promise((resolve) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = src;
        })));
    }

    // Refleja el valor numérico de vidas como corazones y texto accesible.
    function renderLives() {
        livesOutput.textContent = "♥".repeat(lives) + "♡".repeat(maxLives - lives);
        livesOutput.setAttribute("aria-label", `${lives} of ${maxLives} lives`);
    }

    // Quita una vida. El enfriamiento evita perder muchas por un mismo choque.
    // ignoreCooldown se usa con fantasmas, que siempre descuentan una vida.
    function loseLife(ignoreCooldown = false) {
        if ((!ignoreCooldown && hitCooldown > 0) || state !== "playing") return false;
        lives = Math.max(0, lives - 1);
        hitCooldown = 0.8;
        renderLives();
        bat.classList.remove("is-hurt", "is-dead");
        void bat.offsetWidth;
        if (lives === 0) bat.classList.add("is-dead");
        else bat.classList.add("is-hurt");
        setBatImage(lives === 0 ? "assets/img/runner/murcielago_lose.png" : "assets/img/runner/murcielago_hurt.png");
        window.setTimeout(() => {
            bat.classList.remove("is-hurt");
            if (state === "playing" && lives > 0) setBatImage("assets/img/runner/murcielago_playing.png");
        }, 480);
        if (lives === 0) endGame();
        return true;
    }

    // Suma una vida sin superar el máximo permitido.
    function gainLife() {
        lives = Math.min(maxLives, lives + 1);
        renderLives();
    }

    // Inicializa una partida nueva; el ciclo activo continuará con el estado playing.
    function startGame() {
        if (state !== "ready") return;
        state = "playing";
        elapsed = 0;
        score = 0;
        lives = maxLives;
        hitCooldown = 0;
        bat.classList.remove("is-hurt", "is-rising", "is-falling");
        setBatImage("assets/img/runner/murcielago_playing.png");
        distance = 0;
        batVelocity = 0;
        batY = stage.clientHeight * 0.46;
        nextTowerIn = 0.65;
        towers.splice(0).forEach((tower) => tower.node.remove());
        items.splice(0).forEach((item) => item.node.remove());
        scoreOutput.textContent = "0";
        renderLives();
        overlay.hidden = true;
        stage.focus({ preventScroll: true });
        // El ciclo ya está activo desde que termina la carga; solo reiniciamos su reloj.
        previousFrame = performance.now();
    }

    // Prepara la pantalla de inicio y vuelve a comenzar tras una derrota.
    function resetGame() {
        state = "ready";
        overlayTitle.textContent = "Ready to fly?";
        overlayText.textContent = "Use up to 10 lives to fly through the night. Collect candy, avoid ghosts and towers.";
        mainButton.textContent = "Start flight";
        overlay.hidden = false;
        startGame();
        queueFlap();
    }

    // Cambia al estado de fin y muestra el resultado cuando las vidas llegan a cero.
    function endGame() {
        if (state !== "playing") return;
        state = "over";
        overlayTitle.textContent = "The bat needs a little rest";
        overlayText.textContent = `Final score: ${score}. The bat ran out of lives. Try again and collect more candy.`;
        mainButton.textContent = "Fly again";
        overlay.hidden = false;
    }

    // Quita los eventos y la interfaz para regresar a la página del juego.
    function leaveGame() {
        // Cerramos el estado antes de cancelar el próximo frame.
        state = "closed";
        cancelAnimationFrame(animationFrame);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
        stage.removeEventListener("pointerdown", onPointerDown);
        root.remove();
        hero.classList.remove("game-hero--runner-started", "game-hero--enabled");
        const playButton = hero.querySelector(".game-hero__play");
        if (playButton) playButton.style.display = "";
    }

    // Crea un par de torres con una abertura aleatoria por la que debe pasar el bat.
    function makeTower() {
        const stageHeight = stage.clientHeight;
        const gapSize = Math.max(132, 202 - elapsed * 1.05);
        const gapCenter = stageHeight * (0.34 + Math.random() * 0.34);
        const node = document.createElement("div");
        node.className = "runner__tower-pair";
        node.setAttribute("aria-hidden", "true");
        node.innerHTML = `
            <div class="runner__tower runner__tower--top"></div>
            <div class="runner__tower runner__tower--bottom"></div>
        `;
        const top = node.firstElementChild;
        const bottom = node.lastElementChild;
        top.style.height = `${Math.max(24, gapCenter - gapSize / 2)}px`;
        bottom.style.top = `${gapCenter + gapSize / 2}px`;
        bottom.style.height = `${Math.max(24, stageHeight - gapCenter - gapSize / 2)}px`;
        towersLayer.appendChild(node);
        const tower = { node, x: stage.clientWidth + 30, gapTop: gapCenter - gapSize / 2, gapBottom: gapCenter + gapSize / 2, gapCenter, gapSize, bonked: false, passed: false };
        towers.push(tower);
        return tower;
    }

    // Crea un caramelo (premio) o fantasma (peligro) entre dos obstáculos.
    function makeItem(tower, type, spacingToNextTower) {
        const isCandy = type === "candy";
        const node = document.createElement("div");
        node.className = `runner__pickup runner__pickup--${isCandy ? "candy" : "ghost"}`;
        node.setAttribute("aria-hidden", "true");
        node.innerHTML = `<img src="assets/img/runner/${isCandy ? "caramelo.png" : "fantasmita.png"}" alt="">`;
        itemsLayer.appendChild(node);
        const pickupHeight = 42;
        const routeRange = Math.max(0, (tower.gapSize - pickupHeight) / 2 - 8);
        const yOffset = (Math.random() * 2 - 1) * routeRange;
        const offsetMagnitude = isCandy ? Math.random() * routeRange : routeRange * (0.65 + Math.random() * 0.3);
        const signedOffset = isCandy ? yOffset : offsetMagnitude * (Math.random() < 0.5 ? -1 : 1);
        items.push({ node, type: isCandy ? "candy" : "ghost", x: tower.x + spacingToNextTower / 2, y: tower.gapCenter + signedOffset - pickupHeight / 2, collected: false });
    }

    // Actualiza el marcador y dispara una animación según el evento que sumó puntos.
    function setScore(nextScore, pickupType) {
        score = nextScore;
        scoreOutput.textContent = String(score);
        root.classList.remove("is-scoring", "is-spooked", "is-candy-pickup");
        void root.offsetWidth;
        root.classList.add(pickupType === "ghost" ? "is-spooked" : "is-scoring");
        if (pickupType === "candy") root.classList.add("is-candy-pickup");
        window.setTimeout(() => root.classList.remove("is-scoring", "is-spooked", "is-candy-pickup"), 420);
    }

    // Colisión de rectángulos: true cuando ambos rectángulos se superponen.
    function overlaps(a, b) {
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    }

    // Un frame mide el tiempo transcurrido, actualiza la lógica y vuelve a programarse.
    function frame(now) {
        if (state === "closed") return;

        // Convertimos milisegundos a segundos y limitamos dt para evitar saltos grandes
        // si la pestaña estuvo pausada o el navegador perdió cuadros.
        const dt = Math.min((now - previousFrame) / 1000, 0.05);
        previousFrame = now;

        // El mismo ciclo atiende los tres estados principales de la interfaz.
        // Solo durante la partida se actualizan física, obstáculos y colisiones.
        switch (state) {
            case "ready": // Menú de inicio
            case "over":  // Pantalla de fin
                draw();
                break;
            case "playing": // Partida activa
                update(dt);
                draw();
                break;
        }

        // Se solicita exactamente un nuevo frame mientras el minijuego siga montado.
        if (state !== "closed") animationFrame = requestAnimationFrame(frame);
    }

    // ----- 5. Actualización: física, generación y colisiones -----
    // dt es el tiempo desde el frame anterior, expresado en segundos.
    function update(dt) {
        const width = stage.clientWidth;
        const height = stage.clientHeight;
        if (width !== lastStageWidth || height !== lastStageHeight) {
            lastStageWidth = width;
            lastStageHeight = height;
            batY = Math.min(Math.max(batY, 32), height - 32);
        }

        elapsed += dt;
        hitCooldown = Math.max(0, hitCooldown - dt);

        // Física vertical: la gravedad acelera la caída y el aleteo impulsa hacia arriba.
        if (input.flap) {
            batVelocity = RUNNER_FLAP_IMPULSE;
            bat.classList.add("is-rising");
            bat.classList.remove("is-falling");
            input.flap = false;
        }
        batVelocity = Math.min(RUNNER_MAX_FALL_SPEED, batVelocity + RUNNER_GRAVITY * dt);
        batY += batVelocity * dt;
        distance += RUNNER_WORLD_SPEED * dt;
        if (batVelocity > 45) {
            bat.classList.add("is-falling");
            bat.classList.remove("is-rising");
        }

        // Los límites superior e inferior rebotan al murciélago y pueden quitar vida.
        if (batY < 12) {
            batY = 12;
            batVelocity = Math.max(180, Math.abs(batVelocity) * 0.72);
            bat.classList.add("is-falling");
            bat.classList.remove("is-rising");
            loseLife();
        } else if (batY > height - 70) {
            batY = height - 70;
            batVelocity = -Math.max(245, Math.abs(batVelocity) * 0.62);
            bat.classList.add("is-rising");
            bat.classList.remove("is-falling");
            loseLife();
        }

        // Cuenta regresiva para generar la próxima torre y, a veces, un objeto.
        nextTowerIn -= dt;
        if (nextTowerIn <= 0) {
            const tower = makeTower();
            nextTowerIn = Math.max(1.15, 1.55 - elapsed * 0.004) + Math.random() * 0.45;
            if (Math.random() < 0.5) {
                const type = Math.random() < 0.5 ? "ghost" : "candy";
                makeItem(tower, type, RUNNER_WORLD_SPEED * nextTowerIn);
            }
        }

        // Caja de colisión reducida respecto del dibujo para que el juego se sienta justo.
        const batBounds = { left: width * 0.22 + 13, right: width * 0.22 + 47, top: batY + 10, bottom: batY + 38 };
        // Mover torres, sumar por superarlas, comprobar choque y retirar las fuera de pantalla.
        // Se recorre al revés para poder borrar elementos del array sin saltear ninguno.
        for (let i = towers.length - 1; i >= 0; i--) {
            const tower = towers[i];
            tower.x -= RUNNER_WORLD_SPEED * dt;
            tower.node.style.transform = `translate3d(${tower.x}px, 0, 0)`;
            const towerLeft = tower.x + 10;
            const towerRight = towerLeft + 56;
            if (!tower.passed && tower.x + 82 < batBounds.left) {
                tower.passed = true;
                setScore(score + 1, "pass");
            }
            const hitsTower = batBounds.right > towerLeft && batBounds.left < towerRight
                && (batBounds.top < tower.gapTop || batBounds.bottom > tower.gapBottom);
            if (hitsTower && !tower.bonked) {
                tower.bonked = true;
                if (loseLife()) {
                    batVelocity = batY < (tower.gapTop + tower.gapBottom) / 2 ? -260 : 260;
                    bat.classList.toggle("is-rising", batVelocity < 0);
                    bat.classList.toggle("is-falling", batVelocity >= 0);
                }
            }
            if (tower.x < -100) {
                tower.node.remove();
                towers.splice(i, 1);
            }
        }

        // Mover caramelos/fantasmas, aplicar sus efectos y limpiar los que ya pasaron.
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.x -= RUNNER_WORLD_SPEED * dt;
            item.node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
            const pickupBounds = { left: item.x + 7, right: item.x + 39, top: item.y + 7, bottom: item.y + 39 };
            if (overlaps(batBounds, pickupBounds)) {
                if (!item.collected) {
                    item.collected = true;
                    item.node.classList.add("is-collected");
                    if (item.type === "candy") {
                        setScore(score + 5, "candy");
                        gainLife();
                    } else {
                        loseLife(true);
                        root.classList.add("is-spooked");
                        window.setTimeout(() => root.classList.remove("is-spooked"), 420);
                    }
                    window.setTimeout(() => item.node.remove(), 380);
                }
                items.splice(i, 1);
                continue;
            }
            if (item.x < -50) {
                item.node.remove();
                items.splice(i, 1);
            }
        }
    }

    // ----- 6. Dibujo -----
    // Mueve las capas del fondo y ubica al murciélago en su posición calculada.
    function draw() {
        const offsets = layerSpeeds.map((factor, index) => `${-(distance * factor % (index === 3 ? 1800 : 900))}px 0px`);
        layers.forEach((layer, index) => { layer.style.backgroundPosition = offsets[index]; });
        bat.style.left = `${stage.clientWidth * 0.22}px`;
        bat.style.top = `${batY}px`;
    }

    // ----- 7. Preparación -----
    // Espera recursos, cambia de loading a ready y dibuja la pantalla inicial.
    function prepareGame() {
        const preload = preloadAssets();
        preload.then(() => {
            if (!root.isConnected || state !== "loading") return;
            state = "ready";
            mainButton.disabled = false;
            mainButton.textContent = "Start flight";
            batY = stage.clientHeight * 0.46;
            lastStageWidth = stage.clientWidth;
            lastStageHeight = stage.clientHeight;
            draw();
            // El ciclo comienza una vez, al quedar listo, y atiende menú/juego/fin.
            previousFrame = performance.now();
            animationFrame = requestAnimationFrame(frame);
        });
    }

    mainButton.disabled = true;
    prepareGame();
}
