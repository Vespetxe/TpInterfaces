// ===== Banco de imágenes =====
const BLOCKA_IMAGES = [
    "assets/img/blocka-1.jpg",
    "assets/img/blocka-2.jpg",
    "assets/img/blocka-3.jpg",
    "assets/img/blocka-4.jpg",
    "assets/img/blocka-5.jpg",
    "assets/img/blocka-6.jpg"
];
// Tiempo máximo del nivel en milisegundos (60 s); más adelante se puede definir por nivel
const BLOCKA_TIME_LIMIT = 60000;

// ===== Inicio =====
// Crea la capa del juego dentro del hero y muestra la selección de imagen.
function initBlocka(hero) {
    const root = document.createElement("div");
    root.className = "blocka";
    hero.appendChild(root);
    showSelection(root);
}

// ===== Selección de imagen =====
// Muestra las 6 miniaturas y el botón Start.
function showSelection(root) {
    root.innerHTML = `
        <div class="blocka__menu">
            <p class="blocka__logo">BLOCKA</p>
            <h2 class="blocka__heading">Your puzzle will be picked at random</h2>
            <ul class="blocka__thumbs">
                ${BLOCKA_IMAGES.map((src, i) => `
                    <li class="blocka__thumb"><img src="${src}" alt="Puzzle image ${i + 1}"></li>
                `).join("")}
            </ul>
            <button type="button" class="blocka__btn" id="blockaStart">Start</button>
        </div>
    `;

    root.querySelector("#blockaStart").addEventListener("click", (event) => {
        event.currentTarget.disabled = true;
        pickRandomImage(root);
    });
}

// Resalta las miniaturas una por una y se detiene en la imagen elegida al azar.
function pickRandomImage(root) {
    const thumbs = root.querySelectorAll(".blocka__thumb");
    root.querySelector(".blocka__thumbs").classList.add("is-drawing"); // atenúa las no elegidas
    const target = Math.floor(Math.random() * BLOCKA_IMAGES.length);
    const lastStep = thumbs.length * 2 + target; // dos vueltas completas y luego la elegida
    let step = 0;

    const interval = setInterval(() => {
        thumbs.forEach((thumb) => thumb.classList.remove("is-active"));
        thumbs[step % thumbs.length].classList.add("is-active");

        if (step === lastStep) {
            clearInterval(interval);
            // Pausa breve para ver cuál salió antes de empezar
            setTimeout(() => startLevel(root, BLOCKA_IMAGES[target]), 700);
        }
        step++;
    }, 120);
}

// ===== Nivel =====
// Carga la imagen elegida y arma el tablero cuando está lista.
function startLevel(root, src) {
    const img = new Image();
    img.onload = () => buildBoard(root, img);
    img.src = src;
}

// Devuelve el tiempo en formato mm:ss.
function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const minutes = String(Math.floor(total / 60)).padStart(2, "0");
    const seconds = String(total % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// Corta la imagen en 4 piezas (2x2), las rota al azar y activa el temporizador.
function buildBoard(root, img) {
    root.innerHTML = `
        <span class="blocka__timer" id="blockaTimer">00:00</span>
        <div class="blocka__board" id="blockaBoard"></div>
        <div class="blocka__result" id="blockaResult" hidden></div>
    `;

    const board = root.querySelector("#blockaBoard");
    const timerEl = root.querySelector("#blockaTimer");
    const resultEl = root.querySelector("#blockaResult");

    // Lado de cada pieza dentro de la imagen original
    const half = Math.floor(Math.min(img.naturalWidth, img.naturalHeight) / 2);
    const pieces = [];

    for (let i = 0; i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);

        const canvas = document.createElement("canvas");
        canvas.width = half;
        canvas.height = half;
        canvas.className = "blocka__piece";
        // Dibuja solo el cuarto de imagen que le corresponde a esta pieza
        canvas.getContext("2d").drawImage(img, col * half, row * half, half, half, 0, 0, half, half);

        // Rotación inicial de 1 a 3 giros de 90°, así ninguna empieza bien ubicada
        const piece = { canvas, rotation: 1 + Math.floor(Math.random() * 3) };
        canvas.dataset.index = i;
        canvas.style.transform = `rotate(${piece.rotation * 90}deg)`;

        board.appendChild(canvas);
        pieces.push(piece);
    }

    // ===== Temporizador (cuenta regresiva) =====
    let finished = false;
    const startedAt = performance.now();
    timerEl.textContent = formatTime(BLOCKA_TIME_LIMIT);

    const timer = setInterval(() => {
        const remaining = BLOCKA_TIME_LIMIT - (performance.now() - startedAt);

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
    // Muestra el mensaje final con el botón para volver al menú.
    function showResult(title, detail) {
        resultEl.innerHTML = `
            <p class="blocka__result-title">${title}</p>
            <p class="blocka__result-time">${detail}</p>
            <button type="button" class="blocka__btn" id="blockaMenu">Back to menu</button>
        `;
        resultEl.hidden = false;
        resultEl.querySelector("#blockaMenu").addEventListener("click", () => showSelection(root));
    }

    // Se acabó el tiempo: se bloquea el tablero y se pierde el nivel.
    function timeUp() {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        timerEl.textContent = "00:00";
        timerEl.classList.remove("is-low");
        showResult("Time's up", "The puzzle was not completed");
    }

    // Imagen completada a tiempo: se detiene el reloj y se muestra el tiempo empleado.
    function finishLevel() {
        finished = true;
        clearInterval(timer);
        const finalTime = formatTime(performance.now() - startedAt);
        timerEl.classList.remove("is-low");
        board.classList.add("is-solved"); // quita la separación entre piezas

        // Pausa breve para ver la imagen completa antes del mensaje
        setTimeout(() => showResult("Puzzle complete", `Time: ${finalTime}`), 900);
    }

    // ===== Rotación con el mouse =====

    // direction: -1 gira a la izquierda, +1 gira a la derecha
    function rotatePiece(event, direction) {
        const canvas = event.target.closest(".blocka__piece");
        if (!canvas || finished) return;

        const piece = pieces[canvas.dataset.index];
        piece.rotation += direction;
        canvas.style.transform = `rotate(${piece.rotation * 90}deg)`;

        if (pieces.every((p) => p.rotation % 4 === 0)) finishLevel();
    }

    board.addEventListener("click", (event) => rotatePiece(event, -1));
    board.addEventListener("contextmenu", (event) => {
        event.preventDefault(); // evita el menú contextual del navegador
        rotatePiece(event, 1);
    });

    
}