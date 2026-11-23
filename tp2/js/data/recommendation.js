// ===== Juego curado y datos de detalle =====
// Juego destacado curado para la sección Recommended For You / página de detalle.
// Se mantiene en el frontend porque la API de la cátedra es de solo lectura.
const RECOMMENDED_GAME = {
    id: 90001,
    title: "Plan Z: Plankton’s Solitaire",
    category: "Puzzle",
    genres: ["Puzzle"],
    image: "assets/img/pegsolitarie/Plan Z planktons Solitaire card.jpg",
    fullImage: "assets/img/pegsolitarie/Plan Z Planktons Solitaire.jpg",
    description: "Plankton and SpongeBob battle for the secret formula. Eliminate every piece on the opposing team to win.",
    rating: 4.5,
    likes: 13500,
    type: "free",
    price: 0,

    // --- Datos para la página de detalle (game.html) ---
    longDescription: "Plan Z: Plankton’s Solitaire is a single-player puzzle where Plankton and SpongeBob compete for the secret formula. Jump horizontally or vertically over one adjacent opposing piece to capture it. Your pieces cannot capture members of their own team. Eliminate every piece on the opposing team to win. If no legal moves remain before either team is eliminated, the game ends without a winner.",
    howToPlay: "Select a piece and click a highlighted empty space, or drag the piece there. Jump horizontally or vertically over one adjacent piece to capture it. You can only capture a piece from the opposing team. Eliminate all opposing pieces to win; if no legal moves remain first, the game ends without a winner.",
    features: [
        "Classic 33-space cross board",
        "Play with Bob and Plankton pieces together",
        "Animated hints show a legal move",
        "Restart and short victory/game-over demonstrations"
    ],
    faq: [
        { q: "How do I move a piece?", a: "Drag it over one neighboring piece and drop it in the empty space beyond." },
        { q: "How do I win?", a: "Capture every piece on the opposing team. If no legal moves remain before that happens, the game ends without a winner." }
    ],
    controls: [
        "Click a piece and then click a highlighted empty space, or drag the piece there.",
        "Jump horizontally or vertically over one adjacent opposing piece into the empty space beyond it; your own team cannot be captured.",
        "Capture every opposing piece to win. If no legal moves remain first, the game ends without a winner.",
        "Use Hint to see an animated example of a legal move.",
        "Use Restart to begin the selected board again."
    ],
    gallery: [
        "assets/img/pegsolitarie/seeitinaction1.png",
        "assets/img/pegsolitarie/seeitinaction2.png",
        "assets/img/pegsolitarie/seeitinaction3.png",
        "assets/img/pegsolitarie/seeitinaction4.png",
        "assets/img/pegsolitarie/seeitinaction5.png"
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

// Nuevo juego curado de arcade integrado en la página de detalle.
const RUNNER_GAME = {
    id: 900002,
    title: "Moonlit Flight",
    category: "Arcade",
    genres: ["Arcade"],
    likes: 0,
    rating: 4.5,
    type: "free",
    price: 0,
    image: "assets/img/runner/cover.svg",
    fullImage: "assets/img/runner/cover.svg",
    gallery: [
        "assets/img/runner/gallery-candy.svg",
        "assets/img/runner/gallery-ghost.svg",
        "assets/img/runner/gallery-castle.svg"
    ],
    description: "A kawaii Halloween flight through a moonlit castle town.",
    longDescription: "Fly through a cozy Halloween night as a tiny kawaii bat. Weave between enchanted castle towers, collect sweet treats and watch out for mischievous ghosts.",
    howToPlay: "Press Space, Arrow Up, W or click inside the game to flap upward. Start with 10 lives: candy restores one life, while ghosts, towers and the top or bottom edge cost one. Candy adds 5 points; passing a tower pair adds 1 point. The flight continues until all lives are lost.",
    features: [
        "A responsive runner with four parallax scenery layers",
        "Haunted towers with changing gaps and heights",
        "Animated candy and ghosts with different effects",
        "A 10-life system, collectible rewards and live score"
    ],
    faq: [
        { q: "How do I fly?", a: "Press Space, Arrow Up or W, or click inside the game to flap upward." },
        { q: "What do candy and ghosts do?", a: "Candy adds 5 points and restores one life, up to 10. A ghost costs one life." },
        { q: "How do I score points?", a: "Each tower pair you pass adds one point. Collecting candy adds five points." },
        { q: "When does a flight end?", a: "The flight ends when the bat loses all 10 lives. Tower and screen-edge collisions cost one life and bounce the bat back into play." }
    ],
    controls: [
        "Press Space, Arrow Up or W, or click inside the game to flap upward.",
        "Tower, ceiling and floor collisions cost one life and bounce the bat back into play.",
        "Pass a tower pair for +1 point. Candy gives +5 points and +1 life; ghosts cost one life.",
        "The flight ends when all 10 lives are lost."
    ]
};

// Lista de juegos con página de detalle propia.
const CURATED_GAMES = [RECOMMENDED_GAME, BLOCKA_GAME, RUNNER_GAME];
const CURATED_IDS = CURATED_GAMES.map((game) => game.id);
