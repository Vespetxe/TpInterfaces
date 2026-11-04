// ===== Juego curado y datos de detalle =====
// Juego destacado curado para la sección Recommended For You / página de detalle.
// Se mantiene en el frontend porque la API de la cátedra es de solo lectura.
const RECOMMENDED_GAME = {
    id: 90001,
    title: "Peg Solitaire",
    category: "Puzzle",
    genres: ["Puzzle"],
    image: "assets/img/imgCards/Planktons petri puzzle card.jpg",
    fullImage: "assets/img/Planktons petri puzzle.jpg",
    description: "Jump over pieces, clear the board and try to leave just one character behind.",
    rating: 4.5,
    likes: 13500,
    type: "free",
    price: 0,

    // --- Datos para la página de detalle (game.html) ---
    longDescription: "Peg Solitaire is a single-player logic puzzle. Play with Bob and Plankton on one of three board shapes. Jump over neighboring pieces to remove them from the board and try to leave just one.",
    howToPlay: "Select a piece and click a highlighted empty space, or drag the piece there. It must jump horizontally or vertically over one neighboring piece. The jumped piece is removed. Leave one piece to win; the game ends when no legal moves remain.",
    features: [
        "Classic 33-space cross board",
        "Play with Bob and Plankton pieces together",
        "Animated hints show a legal move",
        "Restart and short victory/game-over demonstrations"
    ],
    faq: [
        { q: "How do I move a piece?", a: "Drag it over one neighboring piece and drop it in the empty space beyond." },
        { q: "What happens when no moves are left?", a: "The game ends. Leaving one piece is the best result." }
    ],
    controls: [
        "Click a piece and then click a highlighted empty space, or drag the piece there.",
        "The landing space must be empty and the move must be horizontal or vertical.",
        "Use Hint to see an animated example of a legal move.",
        "Use Restart to begin the selected board again."
    ],
    gallery: [
        "assets/img/pegsolitarie/fondo default.jpg",
        "assets/img/pegsolitarie/tablero-fondo.png",
        "assets/img/pegsolitarie/ficha-plankton-default.png",
        "assets/img/pegsolitarie/ficha-bob-default.png",
        "assets/img/pegsolitarie/ficha-plankton-hover.png",
        "assets/img/pegsolitarie/ficha-bob-hover.png"
    ]
};

// Segundo juego curado: usa la misma forma que RECOMMENDED_GAME
const BLOCKA_GAME = {
    id: 900001, // numérico y distinto al de RECOMMENDED_GAME y a los de la API
    title: "Blocka",
    category: "Puzzle",
    genres: ["Puzzle"],
    // Usa la segunda portada como fondo del hero detrás del botón Play.
    image: "assets/img/blocka-portada.png",
    fullImage: "assets/img/blocka-portada2.png",
    // Muestra las cinco capturas de ejemplo nuevas en la galería del detalle.
    gallery: Array.from({ length: 5 }, (_, index) => `assets/img/blocka-example${index + 1}.png`),
    likes: 0,
    rating: 4,
    type: "free",
    longDescription: "Blocka is an image puzzle. Each picture is split into four pieces that start rotated. Turn every piece until the full image is restored.",
    howToPlay: "Left click rotates a piece to the left and right click rotates it to the right. Press Play to start the timer and finish before it runs out.",
    features: ["Three levels with different filters", "Random image on every level", "Timer with best time per level"],
    faq: [
        { q: "How do I rotate a piece?", a: "Left click turns it left, right click turns it right." },
        { q: "When does the timer start?", a: "When you press Play." }
    ],
    // Resume el objetivo y los controles en una sola instrucción breve para el panel de ayuda.
    controls: [
        "Reassemble the scrambled image by rotating its pieces: left-click turns left; right-click turns right."
    ]
};

// Lista de juegos con página de detalle propia
const CURATED_GAMES = [RECOMMENDED_GAME, BLOCKA_GAME];
const CURATED_IDS = CURATED_GAMES.map((game) => game.id);
