// ===== Banco de imágenes =====
// El banco completo usa imágenes PNG para el menú, los niveles y las miniaturas.
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
    { pieceCount: 4, filter: "grayscale", timeLimitMs: 60000 },
    { pieceCount: 6, filter: "brightness", timeLimitMs: 50000 },
    { pieceCount: 8, filter: "negative", timeLimitMs: 40000 }
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
            <!-- Marca del juego: reemplaza el título de texto en el menú de modos. -->
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

// Inicia el nivel indicado y evita repetir la imagen del nivel competitivo anterior.
function startCompetitiveLevel(root, levelIndex, previousImageIndex = -1) {
    const level = BLOCKA_LEVELS[levelIndex];
    const availableImages = BLOCKA_IMAGES
        .map((src, imageIndex) => ({ src, imageIndex }))
        .filter((image) => image.imageIndex !== previousImageIndex);
    const selectedImage = availableImages[Math.floor(Math.random() * availableImages.length)];

    // Reemplaza la pantalla anterior enseguida y evita iniciar el mismo nivel varias veces.
    root.innerHTML = `
        <div class="blocka__menu">
            <!-- Mantiene la identidad visual al preparar cada nivel competitivo. -->
            <div class="blocka__logo"><img src="assets/img/blocka-logo.png" alt="Blocka"></div>
            <h2 class="blocka__heading">Preparing level ${levelIndex + 1}…</h2>
        </div>
    `;

    startLevel(root, selectedImage.src, level.filter, performance.now(), {
        mode: "competitive",
        levelIndex,
        pieceCount: level.pieceCount,
        timeLimitMs: level.timeLimitMs,
        imageSrc: selectedImage.src,
        imageIndex: selectedImage.imageIndex
    });
}

// ===== Configuración del modo libre =====
// El jugador elige una imagen del banco y configura filtro y cantidad de piezas.
function showFreeSetup(root) {
    root.innerHTML = `
        <div class="blocka__menu blocka__menu--setup">
            <!-- La configuración prioriza los controles y deja el logo para la pantalla de modos. -->
            <h2 class="blocka__heading">Free mode</h2>
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
            <p class="blocka__hint">Left click rotates left · Right click rotates right · No time limit</p>
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
        ${mode === "competitive" ? `<span class="blocka__level-label">Level ${levelIndex + 1} / ${BLOCKA_LEVELS.length}</span>` : ""}
        <span class="blocka__timer" id="blockaTimer" role="timer" aria-live="off">00:00</span>
        <button type="button" class="blocka__help-button" id="blockaHint" aria-label="Fix one piece; adds five seconds to the clock">
            Hint <span>Fix one piece · +5 sec</span>
        </button>
        <div class="blocka__board" id="blockaBoard"></div>
        <div class="blocka__result" id="blockaResult" hidden></div>
    `;

    const board = root.querySelector("#blockaBoard");
    const timerEl = root.querySelector("#blockaTimer");
    const helpButton = root.querySelector("#blockaHint");
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
        // Reserva espacio para los controles y aprovecha más alto para agrandar el tablero.
        const availableHeight = root.clientHeight - 90;
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
        piece.rotation += direction;
        canvas.style.transform = `rotate(${piece.rotation * 90}deg)`;

        if (pieces.every((p) => p.rotation % 4 === 0)) finishLevel();
    }

    board.addEventListener("click", (event) => rotatePiece(event, -1));
    board.addEventListener("contextmenu", (event) => {
        event.preventDefault(); // evita el menú contextual del navegador
        rotatePiece(event, 1);
    });

    // Fija una pieza que sigue girada y aplica la penalización de cinco segundos.
    helpButton.addEventListener("click", () => {
        if (finished) return;

        const candidates = pieces.filter((piece) => !piece.locked && piece.rotation % 4 !== 0);
        if (candidates.length === 0) return;

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
