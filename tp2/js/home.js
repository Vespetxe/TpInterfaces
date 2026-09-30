const carouselsMount = document.getElementById("carousels");

// Se guarda el catálogo recibido para que el listener pueda buscar juegos.
let games = [];

// Muestra un mensaje de carga, error o ausencia de juegos en el contenedor.
function showMessage(text) {
    carouselsMount.innerHTML = `<p class="carousels__message">${text}</p>`;
}

// Anima la barra de progreso durante cinco segundos, independientemente de la API.
function animateHomeLoader() {
    const loader = document.getElementById("homeLoader");
    const progress = document.getElementById("homeLoaderProgress");
    const fill = document.getElementById("homeLoaderFill");
    const percentage = document.getElementById("homeLoaderPercent");
    const duration = 5000;

    if (!loader || !progress || !fill || !percentage) return Promise.resolve();

    const startedAt = performance.now();

    return new Promise((resolve) => {
        function updateProgress(now) {
            const amount = Math.min((now - startedAt) / duration, 1);
            const percent = Math.floor(amount * 100);

            fill.style.width = `${percent}%`;
            percentage.textContent = `${percent}%`;
            progress.setAttribute("aria-valuenow", String(percent));

            if (amount === 1) {
                resolve();
                return;
            }

            requestAnimationFrame(updateProgress);
        }

        requestAnimationFrame(updateProgress);
    });
}

// Oculta el loader al completar el progreso y permite ver la Home.
function hideHomeLoader() {
    const loader = document.getElementById("homeLoader");
    if (!loader) return;

    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");
}

// Evita iniciar la Home antes de que el header, el footer y la navegación estén listos.
const layoutReady = window.siteLayoutReady
    ? Promise.resolve()
    : new Promise((resolve) => document.addEventListener("site:layout-ready", resolve, { once: true }));

// Espera el layout, carga el catálogo y construye los carruseles de la Home.
async function init() {
    showMessage("Cargando juegos...");

    // La carga visual avanza mientras se obtiene el catálogo de la API.
    const loadingComplete = animateHomeLoader();
    const gamesRequest = fetchGames()
        .then((apiGames) => ({ apiGames }))
        .catch((error) => ({ error }));

    await loadingComplete;
    hideHomeLoader();
    await layoutReady;

    const result = await gamesRequest;
    if (result.error) {
        console.error("Error al traer los juegos de la API:", result.error);
        showMessage("No se pudieron cargar los juegos. Probá recargar la página.");
        return;
    }

    games = [RECOMMENDED_GAME, ...result.apiGames];

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

// Contrae la etiqueta del botón y deja el ícono visible por un momento al hacer clic.
function animateBadgeClick(button) {
    if (button.classList.contains("is-clicked")) return false;

    button.style.setProperty("--badge-start-width", `${button.getBoundingClientRect().width}px`);
    void button.offsetWidth; // Registra el ancho inicial para que CSS pueda animar el cambio.
    button.classList.add("is-clicked");

    window.setTimeout(() => {
        button.classList.remove("is-clicked");
        // Deja terminar la expansión de vuelta antes de restaurar el ancho automático.
        window.setTimeout(() => button.style.removeProperty("--badge-start-width"), 300);
    }, 950);

    return true;
}

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

    // Anima solo las acciones que muestran un botón de Play o carrito.
    if ((btn.dataset.action === "play" || btn.dataset.action === "add-to-cart") && !animateBadgeClick(btn)) return;

    const game = games.find((g) => g.id === id);

    if (btn.dataset.action === "add-to-cart") {
        console.log("Agregar al carrito:", game.title); // acá va tu lógica del carrito
    } else if (btn.dataset.action === "play") {
        if (id === RECOMMENDED_GAME.id) {
            // Da tiempo a ver el ícono antes de navegar al juego.
            window.setTimeout(() => {
                window.location.href = `game.html?id=${id}`;
            }, 320);
        } else {
            console.log("Jugar:", game.title);
        }
    }
});
