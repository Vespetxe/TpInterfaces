// ===== Juego curado y datos de detalle =====
// Juego destacado curado para la sección Recommended For You / página de detalle.
// Se mantiene en el frontend porque la API de la cátedra es de solo lectura.
const RECOMMENDED_GAME = {
    id: 90001,
    title: "Plankton's Petri Puzzle",
    category: "Puzzle",
    genres: ["Puzzle"],
    image: "assets/img/imgCards/Planktons petri puzzle card.jpg",
    fullImage: "assets/img/Planktons petri puzzle.jpg",
    description: "Test your logic with Plankton in a collection of puzzle challenges inspired by his laboratory.",
    rating: 4.5,
    likes: 13500,
    type: "free",
    price: 0,

    // --- Datos para la página de detalle (game.html) ---
    longDescription: "Plankton's Petri Puzzle is a single-player logic game set inside the Chum Bucket laboratory. Plankton, always obsessed with cooking up the perfect scheme, got trapped alongside an army of his own clones inside a circular petri dish. Your mission: make him jump over his own clones until only one remains — the final \"mastermind,\" ready to steal the secret Krabby Patty formula.",
    howToPlay: "The board is circular, like a petri dish sitting on the lab table. Every space is filled with a Plankton clone, except the center, which starts empty. A clone can jump over an adjacent one (horizontally or vertically) into an empty space; the jumped clone disappears with a bubble-pop animation. The challenge: end up with as few clones as possible, ideally just one, right in the center.",
    features: [
        "Circular lab-themed board",
        "The center clone reacts with different expressions as you progress",
        "Chum Bucket ambient sound",
        "Hint mode to unlock clues if you get stuck",
        "Ages 13+, with the show's signature humor"
    ],
    faq: [
        { q: "Is it single-player?", a: "Yes, it's a 100% single-player puzzle against the board — no opponents." },
        { q: "Can I restart the game?", a: "Yes, you can restart the board anytime from the pause menu." }
    ],
    gallery: [
        "assets/img/gallery-1.jpg",
        "assets/img/gallery-2.jpg",
        "assets/img/gallery-3.jpg",
        "assets/img/gallery-4.jpg",
        "assets/img/gallery-5.jpg"
    ]
};

// Segundo juego curado: usa la misma forma que RECOMMENDED_GAME
const BLOCKA_GAME = {
    id: 900001, // numérico y distinto al de RECOMMENDED_GAME y a los de la API
    title: "Blocka",
    category: "Puzzle",
    genres: ["Puzzle"],
    image: "assets/img/blocka-cover.jpg",
    fullImage: "assets/img/blocka-cover.jpg",
    gallery: ["assets/img/blocka-1.jpg", "assets/img/blocka-2.jpg", "assets/img/blocka-3.jpg"],
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
    // Controles que se muestran en el panel de instrucciones
    controls: [
        "Left click = rotate piece to the left",
        "Right click = rotate piece to the right",
        "Play = start the level and the timer"
    ]
};

// Lista de juegos con página de detalle propia
const CURATED_GAMES = [RECOMMENDED_GAME, BLOCKA_GAME];
const CURATED_IDS = CURATED_GAMES.map((game) => game.id);