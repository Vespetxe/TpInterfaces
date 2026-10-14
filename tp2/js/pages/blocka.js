// ===== Banco de imágenes =====
const BLOCKA_IMAGES = [
    "assets/img/blocka-1.png",
    "assets/img/blocka-2.png",
    "assets/img/blocka-3.png",
    "assets/img/blocka-4.png",
    "assets/img/blocka-5.png",
    "assets/img/blocka-6.png"
];
// Los filtros se procesan sobre píxeles con ImageData antes de cortar las piezas.
const BLOCKA_FILTERS = {
    original: { label: "Original RGB", apply: (red, green, blue) => [red, green, blue] },
    grayscale: {
        label: "Grayscale",
        apply: (red, green, blue) => {
            const gray = Math.round(0.299 * red + 0.587 * green + 0.114 * blue);
            return [gray, gray, gray];
        }
    },
    brightness: {
        label: "Brightness 30%",
        // El 30% se interpreta como conservar el 30% de la luminosidad original.
        apply: (red, green, blue) => [red * 0.3, green * 0.3, blue * 0.3]
    },
    negative: {
        label: "Negative",
        apply: (red, green, blue) => [255 - red, 255 - green, 255 - blue]
    }
};
// La dificultad competitiva crece con más piezas y menos tiempo disponible.
const BLOCKA_LEVELS = [
    { pieceCount: 4, filter: "grayscale", timeLimitMs: 30000 },
    { pieceCount: 6, filter: "brightness", timeLimitMs: 20000 },
    { pieceCount: 8, filter: "negative", timeLimitMs: 10000 }
];

// ===== Inicio =====
// Crea la capa del juego dentro del hero y muestra el menú de modos.
function initBlocka(hero) {
    const root = document.createElement("div");
    root.className = "blocka";
    hero.appendChild(root);
    showModeMenu(root);
}

// ===== Menú de modos =====
// El menú dirige al modo libre o inicia la campaña competitiva de tres niveles.
function showModeMenu(root) {
    root.innerHTML = `
        <div class="blocka__menu">
            <!-- Carga el logo del juego desde la carpeta de imágenes. -->
            <div class="blocka__logo"><img src="assets/img/blocka-logo.png" alt="Blocka"></div>
            <h2 class="blocka__heading">Choose a game mode</h2>
            <div class="blocka__modes">
                <button type="button" class="blocka__mode-card" id="blockaFreeMode">
                    <span class="blocka__mode-title">Free mode</span>
                    <span class="blocka__mode-description">Choose an image, filter and number of pieces. Play without a time limit.</span>
                </button>
                <button type="button" class="blocka__mode-card" id="blockaCompetitiveMode">
                    <span class="blocka__mode-title">Competitive mode</span>
                    <span class="blocka__mode-description">Complete three timed levels with increasing difficulty.</span>
                </button>
            </div>
        </div>
    `;

    root.querySelector("#blockaFreeMode").addEventListener("click", () => showFreeSetup(root));
    root.querySelector("#blockaCompetitiveMode").addEventListener("click", () => startCompetitiveLevel(root, 0));
}

// Presenta el sorteo de imágenes para el nivel competitivo seleccionado.
function startCompetitiveLevel(root, levelIndex, previousImageIndex = -1) {
    const level = BLOCKA_LEVELS[levelIndex];
    const availableImages = BLOCKA_IMAGES
        .map((src, imageIndex) => ({ src, imageIndex }))
        .filter((image) => image.imageIndex !== previousImageIndex);

    // Muestra todas las imágenes en una fila antes de sortear una para el nivel.
    root.innerHTML = `
        <div class="blocka__menu blocka__menu--competitive">
            <!-- Identifica el modo con la misma placa que Free mode y conserva el nivel actual. -->
            <h2 class="blocka__heading blocka__heading--boxed">Competitive Mode</h2>
            <h2 class="blocka__heading">Level ${levelIndex + 1}</h2>
            <ul class="blocka__roulette-list" aria-label="Images available for this level">
                ${BLOCKA_IMAGES.map((src, imageIndex) => `
                    <li class="blocka__roulette-item" data-image-index="${imageIndex}">
                        <img src="${src}" alt="Available puzzle image ${imageIndex + 1}">
                    </li>
                `).join("")}
            </ul>
            <p class="blocka__draw-status" id="blockaDrawStatus" role="status" aria-live="polite">Press Start to draw an image.</p>
            <div class="blocka__menu-actions">
                <button type="button" class="blocka__btn blocka__btn--secondary" id="blockaCompetitiveBack">Back</button>
                <button type="button" class="blocka__btn" id="blockaDrawStart">Start</button>
            </div>
        </div>
    `;

    const startButton = root.querySelector("#blockaDrawStart");
    const backButton = root.querySelector("#blockaCompetitiveBack");
    const status = root.querySelector("#blockaDrawStatus");
    const imageTiles = [...root.querySelectorAll(".blocka__roulette-item")];

    // Vuelve al selector de modos antes de iniciar el sorteo del nivel.
    backButton.addEventListener("click", () => showModeMenu(root));

    startButton.addEventListener("click", () => {
        // Elige una imagen al azar sin repetir la del nivel competitivo anterior.
        const selectedImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        // Respeta la preferencia de movimiento reducido y hace el sorteo sin recorrido animado.
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const route = reduceMotion
            ? [selectedImage.imageIndex]
            : Array.from({ length: 18 }, (_, step) => step % BLOCKA_IMAGES.length);
        let nextImageIndex = route[route.length - 1];
        while (nextImageIndex !== selectedImage.imageIndex) {
            nextImageIndex = (nextImageIndex + 1) % BLOCKA_IMAGES.length;
            route.push(nextImageIndex);
        }

        startButton.disabled = true;
        backButton.disabled = true;
        status.textContent = "Choosing an image…";

        // Recorre visualmente las miniaturas y va ralentizando hasta mostrar la elegida.
        const showSelection = (step = 0) => {
            imageTiles.forEach((tile) => tile.classList.remove("is-active", "is-selected"));
            const activeTile = imageTiles[route[step]];
            activeTile.classList.add("is-active");

            if (step === route.length - 1) {
                activeTile.classList.add("is-selected");
                status.textContent = `Image ${selectedImage.imageIndex + 1} selected`;
                window.setTimeout(() => {
                    // Arranca el reloj después del sorteo y carga el nivel con su imagen elegida.
                    startLevel(root, selectedImage.src, level.filter, performance.now(), {
                        mode: "competitive",
                        levelIndex,
                        pieceCount: level.pieceCount,
                        timeLimitMs: level.timeLimitMs,
                        imageSrc: selectedImage.src,
                        imageIndex: selectedImage.imageIndex
                    });
                }, 500);
                return;
            }

            window.setTimeout(() => showSelection(step + 1), 55 + step * 13);
        };

        showSelection();
    });
}

// ===== Configuración del modo libre =====
// El jugador elige una imagen del banco y configura filtro y cantidad de piezas.
function showFreeSetup(root) {
    root.innerHTML = `
        <div class="blocka__menu blocka__menu--setup">
            <!-- En Free mode se omite el logo para dar más espacio a la configuración. -->
            <h2 class="blocka__heading blocka__heading--boxed">Free mode</h2>
            <fieldset class="blocka__image-picker">
                <legend>Choose an image</legend>
                <ul class="blocka__thumbs">
                    ${BLOCKA_IMAGES.map((src, i) => `
                        <li>
                            <button type="button" class="blocka__thumb${i === 0 ? " is-selected" : ""}"
                                data-image-index="${i}" aria-label="Choose puzzle image ${i + 1}"
                                aria-pressed="${i === 0}">
                                <img src="${src}" alt="">
                            </button>
                        </li>
                    `).join("")}
                </ul>
            </fieldset>
            <div class="blocka__settings-row">
                <label class="blocka__setting">
                    <span>Image filter</span>
                    <select class="blocka__filter-select" id="blockaFilter">
                        ${Object.entries(BLOCKA_FILTERS).map(([value, filter]) => `
                            <option value="${value}">${filter.label}</option>
                        `).join("")}
                    </select>
                </label>
                <label class="blocka__setting">
                    <span>Number of pieces</span>
                    <select class="blocka__filter-select" id="blockaPieceCount">
                        <option value="4">4 pieces</option>
                        <option value="6">6 pieces</option>
                        <option value="8">8 pieces</option>
                    </select>
                </label>
            </div>
            <!-- Mantiene el selector despejado; las instrucciones se muestran durante el juego. -->
            <div class="blocka__menu-actions">
                <button type="button" class="blocka__btn blocka__btn--secondary" id="blockaBack">Back</button>
                <button type="button" class="blocka__btn" id="blockaStart">Start</button>
            </div>
        </div>
    `;

    // Guarda la miniatura elegida; el índice inicial corresponde a la primera imagen.
    let selectedImageIndex = 0;
    root.querySelectorAll(".blocka__thumb").forEach((button) => {
        button.addEventListener("click", () => {
            // Lee el índice guardado en el botón que se acaba de pulsar.
            selectedImageIndex = Number(button.dataset.imageIndex);
            // Actualiza el resaltado y el estado accesible de todas las miniaturas.
            root.querySelectorAll(".blocka__thumb").forEach((thumb) => {
                const selected = thumb === button;
                thumb.classList.toggle("is-selected", selected);
                thumb.setAttribute("aria-pressed", String(selected));
            });
        });
    });

    // Vuelve desde la configuración al menú donde se elige el modo.
    root.querySelector("#blockaBack").addEventListener("click", () => showModeMenu(root));
    root.querySelector("#blockaStart").addEventListener("click", (event) => {
        // Evita que un clic repetido inicie más de una partida.
        event.currentTarget.disabled = true;
        // Lee las opciones que eligió el jugador.
        const filter = root.querySelector("#blockaFilter").value;
        const pieceCount = Number(root.querySelector("#blockaPieceCount").value);
        // Inicia el reloj y pasa la imagen, el filtro y la cantidad de piezas al nivel.
        startLevel(root, BLOCKA_IMAGES[selectedImageIndex], filter, performance.now(), {
            mode: "free",
            pieceCount,
            imageSrc: BLOCKA_IMAGES[selectedImageIndex]
        });
    });
}

// ===== Nivel =====
// Carga la imagen elegida y arma el tablero cuando está lista.
function startLevel(root, src, filter, startedAt = performance.now(), options = {}) {
    const img = new Image();
    img.onload = () => buildBoard(root, img, filter, startedAt, options);
    img.onerror = () => {
        root.innerHTML = `
            <div class="blocka__menu">
                <p class="blocka__result-title">Image could not be loaded</p>
                <button type="button" class="blocka__btn" id="blockaRetry">Back to menu</button>
            </div>
        `;
        root.querySelector("#blockaRetry").addEventListener("click", () => showModeMenu(root));
    };
    img.src = src;
}

// Crea una versión procesada de la imagen usando los valores RGBA de ImageData.
function createFilteredImage(img, filterName, columns, rows) {
    const targetRatio = columns / rows;
    const imageRatio = img.naturalWidth / img.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.naturalWidth;
    let sourceHeight = img.naturalHeight;

    // Recorta al centro con la proporción del tablero para que cada pieza sea cuadrada.
    if (imageRatio > targetRatio) {
        sourceWidth = img.naturalHeight * targetRatio;
        sourceX = (img.naturalWidth - sourceWidth) / 2;
    } else {
        sourceHeight = img.naturalWidth / targetRatio;
        sourceY = (img.naturalHeight - sourceHeight) / 2;
    }

    const pieceSize = Math.max(1, Math.floor(Math.min(sourceWidth / columns, sourceHeight / rows)));
    const outputWidth = pieceSize * columns;
    const outputHeight = pieceSize * rows;
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D context is unavailable");

    context.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);

    const pixels = context.getImageData(0, 0, outputWidth, outputHeight);
    const transform = BLOCKA_FILTERS[filterName]?.apply || BLOCKA_FILTERS.original.apply;

    // Recorre la imagen por filas y columnas, igual que en los ejercicios de ImageData.
    for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidth; x++) {
            // Cada píxel ocupa cuatro posiciones consecutivas: R, G, B y A.
            const i = (x + y * outputWidth) * 4;
            const [red, green, blue] = transform(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
            pixels.data[i] = Math.max(0, Math.min(255, Math.round(red)));
            pixels.data[i + 1] = Math.max(0, Math.min(255, Math.round(green)));
            pixels.data[i + 2] = Math.max(0, Math.min(255, Math.round(blue)));
            // El canal alfa (i + 3) se conserva para mantener la transparencia original.
        }
    }

    context.putImageData(pixels, 0, 0);
    return { canvas, sourceX, sourceY, sourceWidth, sourceHeight, pieceSize, columns, rows };
}

// Devuelve el tiempo en formato mm:ss.
function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// Filtra, corta la imagen en piezas cuadradas, las rota y configura el reloj del modo.
function buildBoard(root, img, filterName = "original", startedAt = performance.now(), options = {}) {
    const mode = options.mode || "competitive";
    const pieceCount = options.pieceCount || 4;
    const timeLimitMs = options.timeLimitMs || BLOCKA_LEVELS[0].timeLimitMs;
    const levelIndex = options.levelIndex || 0;
    const columns = pieceCount / 2;
    const rows = 2;
    root.innerHTML = `
        <button type="button" class="blocka__exit-button" id="blockaExitGame">Exit game</button>
        ${mode === "competitive" ? `<span class="blocka__level-label">Level ${levelIndex + 1} / ${BLOCKA_LEVELS.length}</span>` : ""}
        <span class="blocka__timer" id="blockaTimer" role="timer" aria-live="off">00:00</span>
        <button type="button" class="blocka__help-button" id="blockaHint" aria-label="Fix one piece; adds five seconds to the clock">
            Hint <span>Fix one piece · +5 sec</span>
        </button>
        ${mode === "free" ? `<p class="blocka__piece-tip" id="blockaPieceTip" role="status" hidden><span>Left-click: rotate left</span><span>Right-click: rotate right</span></p>` : ""}
        <div class="blocka__board" id="blockaBoard"></div>
        <div class="blocka__result" id="blockaResult" hidden></div>
    `;

    const board = root.querySelector("#blockaBoard");
    const timerEl = root.querySelector("#blockaTimer");
    const helpButton = root.querySelector("#blockaHint");
    const pieceTip = root.querySelector("#blockaPieceTip");
    const resultEl = root.querySelector("#blockaResult");

    const filteredImage = createFilteredImage(img, filterName, columns, rows);
    const pieceSize = filteredImage.pieceSize;
    board.style.setProperty("--board-columns", columns);
    board.setAttribute("aria-label", `Puzzle board with ${pieceCount} pieces`);
    const pieces = [];

    for (let i = 0; i < pieceCount; i++) {
        const col = i % columns;
        const row = Math.floor(i / columns);

        const canvas = document.createElement("canvas");
        canvas.width = pieceSize;
        canvas.height = pieceSize;
        canvas.className = "blocka__piece";
        // Dibuja solo el cuarto de imagen que le corresponde a esta pieza
        canvas.getContext("2d").drawImage(filteredImage.canvas, col * pieceSize, row * pieceSize, pieceSize, pieceSize, 0, 0, pieceSize, pieceSize);

        // Rotación inicial de 1 a 3 giros de 90°, así ninguna empieza bien ubicada
        const piece = { canvas, rotation: 1 + Math.floor(Math.random() * 3), col, row, size: pieceSize, locked: false };
        canvas.dataset.index = i;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", `Puzzle piece ${i + 1}`);
        canvas.style.transform = `rotate(${piece.rotation * 90}deg)`;

        board.appendChild(canvas);
        pieces.push(piece);
    }

    // Fija celdas cuadradas y recalcula su tamaño si cambia el hero o entra en pantalla completa.
    function fitBoardToHero() {
        const gap = 6;
        const padding = 12;
        const availableWidth = root.clientWidth - 32;
        // Reserva una franja superior suficiente para que el tablero no toque el cronómetro.
        const availableHeight = root.clientHeight - 200;
        const widthBasedSize = (availableWidth - padding - gap * (columns - 1)) / columns;
        const heightBasedSize = (availableHeight - padding - gap) / rows;
        const displaySize = Math.max(1, Math.floor(Math.min(widthBasedSize, heightBasedSize)));
        board.style.setProperty("--piece-display-size", `${displaySize}px`);
    }

    fitBoardToHero();
    const boardResizeObserver = new ResizeObserver(fitBoardToHero);
    boardResizeObserver.observe(root);

    // ===== Temporizador según el modo =====
    let finished = false;
    let penaltyMs = 0;
    let freeModeMoves = 0;
    timerEl.textContent = formatTime(mode === "free" ? 0 : timeLimitMs);

    const timer = setInterval(() => {
        const elapsed = performance.now() - startedAt + penaltyMs;

        if (mode === "free") {
            // El modo libre muestra el tiempo transcurrido más las ayudas, sin límite de tiempo.
            timerEl.textContent = formatTime(elapsed);
            return;
        }

        const remaining = timeLimitMs - elapsed;

        if (remaining <= 0) {
            timeUp();
            return;
        }

        // Redondea hacia arriba para que el cero aparezca solo al terminar
        timerEl.textContent = formatTime(Math.ceil(remaining / 1000) * 1000);
        // En los últimos 10 segundos el contador se marca en alerta
        timerEl.classList.toggle("is-low", remaining <= 10000);
    }, 200);

    // Sale de cualquier modo, detiene sus recursos y vuelve al menú principal de Blocka.
    root.querySelector("#blockaExitGame").addEventListener("click", () => {
        clearInterval(timer);
        boardResizeObserver.disconnect();
        showModeMenu(root);
    });

    // ===== Resultado =====
    // Presenta acciones distintas según se haya ganado o perdido el nivel.
    function showResult(title, detail, resultType) {
        let actionButtons = `
            <button type="button" class="blocka__btn blocka__btn--secondary" id="blockaMenu">Game modes</button>
            <button type="button" class="blocka__btn" id="blockaAgain">Play again</button>
        `;

        if (mode === "competitive") {
            if (resultType === "win" && levelIndex < BLOCKA_LEVELS.length - 1) {
                actionButtons = `
                    <button type="button" class="blocka__btn blocka__btn--secondary" id="blockaMenu">Game modes</button>
                    <button type="button" class="blocka__btn" id="blockaNext">Next level</button>
                `;
            } else if (resultType === "win") {
                actionButtons = `<button type="button" class="blocka__btn" id="blockaMenu">Back to game modes</button>`;
            } else {
                actionButtons = `
                    <button type="button" class="blocka__btn blocka__btn--secondary" id="blockaMenu">Game modes</button>
                    <button type="button" class="blocka__btn" id="blockaRetryLevel">Try again</button>
                `;
            }
        }

        resultEl.innerHTML = `
            <p class="blocka__result-title">${title}</p>
            <p class="blocka__result-time">${detail}</p>
            <div class="blocka__menu-actions">${actionButtons}</div>
        `;
        resultEl.hidden = false;
        helpButton.disabled = true;
        resultEl.querySelector("#blockaMenu").addEventListener("click", () => showModeMenu(root));
        resultEl.querySelector("#blockaAgain")?.addEventListener("click", () => {
            // Repite la misma imagen y configuración, pero inicia un cronómetro nuevo.
            startLevel(root, options.imageSrc, filterName, performance.now(), options);
        });
        resultEl.querySelector("#blockaRetryLevel")?.addEventListener("click", () => {
            startLevel(root, options.imageSrc, filterName, performance.now(), options);
        });
        resultEl.querySelector("#blockaNext")?.addEventListener("click", () => {
            startCompetitiveLevel(root, levelIndex + 1, options.imageIndex);
        });
    }

    // Se acabó el tiempo: se bloquea el tablero y se pierde el nivel.
    function timeUp() {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        boardResizeObserver.disconnect();
        helpButton.disabled = true;
        timerEl.textContent = "00:00";
        timerEl.classList.remove("is-low");
        showResult("Time's up", `Level ${levelIndex + 1} was not completed`, "loss");
    }

    // Imagen completada a tiempo: se detiene el reloj y se muestra el tiempo empleado.
    function finishLevel() {
        finished = true;
        clearInterval(timer);
        boardResizeObserver.disconnect();
        helpButton.disabled = true;
        const finalTime = formatTime(performance.now() - startedAt + penaltyMs);
        timerEl.classList.remove("is-low");
        // Al resolver el puzzle, se reemplazan las piezas filtradas por la imagen original RGB.
        pieces.forEach((piece) => {
            const sourcePieceWidth = filteredImage.sourceWidth / columns;
            const sourcePieceHeight = filteredImage.sourceHeight / rows;
            piece.canvas.getContext("2d").drawImage(
                img,
                filteredImage.sourceX + piece.col * sourcePieceWidth,
                filteredImage.sourceY + piece.row * sourcePieceHeight,
                sourcePieceWidth,
                sourcePieceHeight,
                0,
                0,
                piece.size,
                piece.size
            );
        });
        board.classList.add("is-solved"); // quita la separación entre piezas

        // Pausa breve para ver la imagen completa antes del mensaje
        const isCampaignComplete = mode === "competitive" && levelIndex === BLOCKA_LEVELS.length - 1;
        const title = isCampaignComplete ? "Campaign complete" : "Puzzle complete";
        const detail = mode === "competitive" ? `Level ${levelIndex + 1} · Time: ${finalTime}` : `Time: ${finalTime}`;
        setTimeout(() => showResult(title, detail, "win"), 900);
    }

    // ===== Rotación con el mouse =====

    // direction: -1 gira a la izquierda, +1 gira a la derecha
    function rotatePiece(event, direction) {
        const canvas = event.target.closest(".blocka__piece");
        if (!canvas || finished) return;

        const piece = pieces[canvas.dataset.index];
        if (piece.locked) return;
        if (mode === "free") {
            // Retira la ayuda después de la primera rotación hecha por el jugador.
            freeModeMoves += 1;
            if (freeModeMoves >= 1) pieceTip.hidden = true;
        }
        piece.rotation += direction;
        canvas.style.transform = `rotate(${piece.rotation * 90}deg)`;

        if (pieces.every((p) => p.rotation % 4 === 0)) finishLevel();
    }

    board.addEventListener("click", (event) => rotatePiece(event, -1));
    board.addEventListener("contextmenu", (event) => {
        event.preventDefault(); // evita el menú contextual del navegador
        rotatePiece(event, 1);
    });

    if (mode === "free") {
        // Muestra las reglas junto a la pieza hasta la primera rotación.
        board.addEventListener("pointerover", (event) => {
            const canvas = event.target.closest(".blocka__piece");
            if (!canvas || freeModeMoves >= 1 || pieces[canvas.dataset.index].locked) return;

            const pieceRect = canvas.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            const tipWidth = pieceTip.offsetWidth || 260;
            const gap = 14;
            const left = pieceRect.left - rootRect.left - tipWidth - gap >= 0
                ? pieceRect.left - rootRect.left - tipWidth - gap
                : pieceRect.right - rootRect.left + gap;

            pieceTip.style.left = `${left}px`;
            pieceTip.style.top = `${pieceRect.top - rootRect.top + pieceRect.height / 2}px`;
            pieceTip.hidden = false;
        });

        board.addEventListener("pointerout", (event) => {
            if (event.target.closest(".blocka__piece") && freeModeMoves < 1) {
                pieceTip.hidden = true;
            }
        });
    }

    // Fija una pieza que sigue girada y aplica la penalización de cinco segundos.
    helpButton.addEventListener("click", () => {
        if (finished) return;

        const candidates = pieces.filter((piece) => !piece.locked && piece.rotation % 4 !== 0);
        if (candidates.length === 0) return;

        // Limita la ayudita a un solo uso por partida.
        helpButton.disabled = true;
        const piece = candidates[Math.floor(Math.random() * candidates.length)];
        piece.rotation = 0;
        piece.locked = true;
        piece.canvas.style.transform = "rotate(0deg)";
        piece.canvas.classList.add("is-locked");
        piece.canvas.setAttribute("aria-label", `Puzzle piece ${Number(piece.canvas.dataset.index) + 1}, fixed in the correct position`);
        penaltyMs += 5000;

        const elapsed = performance.now() - startedAt + penaltyMs;
        if (mode === "free") {
            timerEl.textContent = formatTime(elapsed);
        } else {
            const remaining = timeLimitMs - elapsed;
            if (remaining <= 0) {
                timeUp();
                return;
            }
            timerEl.textContent = formatTime(Math.ceil(remaining / 1000) * 1000);
            timerEl.classList.toggle("is-low", remaining <= 10000);
        }

        // Si la pista completó la última pieza, se resuelve el nivel inmediatamente.
        if (pieces.every((currentPiece) => currentPiece.rotation % 4 === 0)) finishLevel();
    });

    
}
