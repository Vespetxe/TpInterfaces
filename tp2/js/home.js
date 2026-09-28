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

// Muestra un mensaje de carga, error o ausencia de juegos en el contenedor.
function showMessage(text) {
    carouselsMount.innerHTML = `<p class="carousels__message">${text}</p>`;
    }

// Evita iniciar la Home antes de que el header, el footer y la navegación estén listos.
const layoutReady = window.siteLayoutReady
    ? Promise.resolve()
    : new Promise((resolve) => document.addEventListener("site:layout-ready", resolve, { once: true }));

// Espera el layout, carga el catálogo y construye los carruseles de la Home.
async function init() {
    await layoutReady;
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
    renderHeroCarousel(document.getElementById("hero-carousel"), games.slice(0, 5));

    // Sin historial de usuario, recomendamos los juegos con mejor rating de la API.
    const recommendedGames = games
        // Descarta el juego curado y los registros sin imagen o sin calificación.
        .filter((game) => game.id !== RECOMMENDED_GAME.id && game.image && game.rating > 0)
        // Ordena de mayor a menor rating y toma los primeros once resultados.
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 11);
    renderCarousel(carouselsMount, "Recommended For You", [RECOMMENDED_GAME, ...recommendedGames]);

    CATEGORIES.forEach((category) => {
        // Selecciona los juegos que pertenecen a este género y los muestra en su carrusel.
        const categoryGames = games
            // Incluye juegos que tengan el género actual, sin distinguir mayúsculas.
            .filter((game) => game.genres?.some((genre) =>
                genre.toLocaleLowerCase() === category.toLocaleLowerCase()
            ))
            // Asigna el nombre de esta sección como categoría visible de cada card.
            .map((game) => ({ ...game, category }));
        if (categoryGames.length > 0) {
            renderCarousel(carouselsMount, category, categoryGames);
        }
    });

    refreshCategoryMenu();
}

init();

// Atiende los botones de todas las cards desde un único listener en el elemento main.
document.querySelector("main").addEventListener("click", (e) => {
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
        if (id === RECOMMENDED_GAME.id) {
            window.location.href = `game.html?id=${id}`;
        } else {
            console.log("Jugar:", game.title);
        }
    }
});
