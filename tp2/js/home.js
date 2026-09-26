/*const carouselsMount = document.getElementById("carousels");

// Un carousel por categoría, filtrando el array de datos.
const categories = [...new Set(games.map((g) => g.category))];
categories.forEach((cat) => {
    renderCarousel(carouselsMount, cat, games.filter((g) => g.category === cat));
});

// Event delegation: un solo listener para todos los botones de todas las cards.
carouselsMount.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const id = Number(btn.closest(".game-card").dataset.id);
    const game = games.find((g) => g.id === id);

    if (btn.dataset.action === "add-to-cart") {
        console.log("Agregar al carrito:", game.title); // acá va tu lógica del carrito
    } else if (btn.dataset.action === "play") {
        console.log("Jugar:", game.title);
    }
});*/

const carouselsMount = document.getElementById("carousels");

// Se guarda el catálogo recibido para que el listener pueda buscar juegos.
let games = [];

    function showMessage(text) {
    carouselsMount.innerHTML = `<p class="carousels__message">${text}</p>`;
    }

async function init() {
    showMessage("Cargando juegos...");

    try {
        games = [RECOMMENDED_GAME, ...await fetchGames()];
    } catch (err) {
        console.error("Error al traer los juegos de la API:", err);
        showMessage("No se pudieron cargar los juegos. Probá recargar la página.");
        return;
    }

    if (games.length === 0) {
        showMessage("No hay juegos para mostrar.");
        return;
    }

    carouselsMount.innerHTML = ""; // saca el mensaje de "Cargando..."
    renderCarousel(carouselsMount, "Recommended For You", [RECOMMENDED_GAME]);

    CATEGORIES.forEach((category) => {
        const categoryGames = games
            .filter((game) => game.genres?.some((genre) =>
                genre.toLocaleLowerCase() === category.toLocaleLowerCase()
            ))
            .map((game) => ({ ...game, category }));
        if (categoryGames.length > 0) {
            renderCarousel(carouselsMount, category, categoryGames);
        }
    });

    refreshCategoryMenu();
}

init();

// Event delegation: un solo listener para todos los botones de todas las cards.
carouselsMount.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    const card = e.target.closest(".game-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    if (!btn && id === RECOMMENDED_GAME.id) {
        window.location.href = `game.html?id=${RECOMMENDED_GAME.id}`;
        return;
    }
    if (!btn) return;

    const game = games.find((g) => g.id === id);

    if (btn.dataset.action === "add-to-cart") {
        console.log("Agregar al carrito:", game.title); // acá va tu lógica del carrito
    } else if (btn.dataset.action === "play") {
        console.log("Jugar:", game.title);
    }
});
