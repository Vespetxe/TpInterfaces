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