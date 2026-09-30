const carouselsMount = document.getElementById("carousels");

// ===== Carrito =====
const CART_STORAGE_KEY = "nexus-games-cart";
const cartMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Recupera los juegos guardados y elimina duplicados al recargar la Home.
function loadCart() {
    try {
        const savedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        if (!Array.isArray(savedItems)) return [];

        // Deduplica los registros guardados y conserva una entrada por juego.
        const uniqueItems = new Map();
        savedItems.forEach((item) => {
            if (!item || !Number.isFinite(Number(item.id)) || !item.title) return;
            const id = Number(item.id);
            if (uniqueItems.has(id)) return;

            uniqueItems.set(id, {
                id,
                title: String(item.title),
                image: String(item.image || ""),
                price: Math.max(0, Number(item.price) || 0),
                discount: Math.min(100, Math.max(0, Number(item.discount) || 0)),
            });
        });
        return [...uniqueItems.values()];
    } catch (error) {
        console.warn("No se pudo recuperar el carrito guardado:", error);
        return [];
    }
}

let cartItems = loadCart();

// ===== Estado compartido de Home =====
// Se guarda el catálogo recibido para que el listener pueda buscar juegos.
let games = [];

// ===== Mensajes y loading de Home =====
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

// Dibuja los juegos y el total en la sección del carrito.
function renderCart() {
    const itemsMount = document.getElementById("cart-items");
    const emptyMessage = document.getElementById("cart-empty");
    const countMount = document.getElementById("cart-count");
    const summary = document.getElementById("cart-summary");
    const totalMount = document.getElementById("cart-total");
    if (!itemsMount || !emptyMessage || !countMount || !summary || !totalMount) return;

    const itemCount = cartItems.length;
    countMount.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
    emptyMessage.hidden = itemCount > 0;
    summary.hidden = itemCount === 0;
    itemsMount.replaceChildren();

    cartItems.forEach((item) => {
        const row = document.createElement("li");
        row.className = "shopping-cart__item";

        const image = document.createElement("img");
        image.className = "shopping-cart__image";
        image.src = item.image;
        image.alt = "";
        image.loading = "lazy";

        const details = document.createElement("div");
        details.className = "shopping-cart__details";

        const title = document.createElement("h3");
        title.className = "shopping-cart__title";
        title.textContent = item.title;

        const unitPrice = item.price * (1 - item.discount / 100);
        const price = document.createElement("p");
        price.className = "shopping-cart__price";
        price.textContent = `${cartMoney.format(unitPrice)} `;
        details.append(title, price);

        const removeButton = document.createElement("button");
        removeButton.className = "shopping-cart__remove";
        removeButton.type = "button";
        removeButton.dataset.cartId = String(item.id);
        removeButton.setAttribute("aria-label", `Remove ${item.title} from cart`);
        // El SVG mantiene la X centrada sin depender de la métrica de una fuente.
        removeButton.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>';

        row.append(image, details, removeButton);
        itemsMount.appendChild(row);
    });

    const total = cartItems.reduce((sum, item) => {
        return sum + item.price * (1 - item.discount / 100);
    }, 0);
    totalMount.textContent = cartMoney.format(total);

    // Marca y desactiva todas las copias de un juego que ya está en el carrito.
    const cartIds = new Set(cartItems.map((item) => item.id));
    document.querySelectorAll(".game-card").forEach((card) => {
        const addButton = card.querySelector('[data-action="add-to-cart"]');
        if (!addButton) return;

        const isInCart = cartIds.has(Number(card.dataset.id));
        addButton.disabled = isInCart;
        addButton.setAttribute("aria-pressed", String(isInCart));
        addButton.setAttribute("aria-label", isInCart ? "Already in cart" : "Add to cart");
        addButton.querySelector(".badge__label-full").textContent = isInCart ? "Added to cart" : "Add to cart";
        addButton.querySelector(".badge__label-short").textContent = isInCart ? "Added" : "Cart";
    });
}

// Guarda una versión pequeña del catálogo y actualiza la sección visible.
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.warn("No se pudo guardar el carrito:", error);
    }
    renderCart();
}

// Abre/cierra el panel junto al botón y lo ubica para que no salga de la pantalla.
function setCartOpen(isOpen) {
    const panel = document.getElementById("shopping-cart");
    const trigger = document.querySelector(".cart-btn");
    if (!panel) return;

    panel.hidden = !isOpen;
    panel.setAttribute("aria-hidden", String(!isOpen));
    trigger?.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
        document.dispatchEvent(new CustomEvent("site:dropdown-open", { detail: { name: "cart" } }));
    }
}

// Agrega el juego solo si no existe y abre el panel del carrito.
function addGameToCart(game) {
    const existingItem = cartItems.find((item) => item.id === game.id);
    if (existingItem) return;

    cartItems.push({
        id: game.id,
        title: game.title,
        image: game.image,
        price: Number(game.price) || 0,
        discount: Number(game.discount) || 0,
    });

    saveCart();
    setCartOpen(true);
}

renderCart();

// Relaciona el botón inyectado del header con el panel desplegable del carrito.
function configureCartButton() {
    const trigger = document.querySelector(".cart-btn");
    if (!trigger) return;
    trigger.setAttribute("aria-controls", "shopping-cart");
    trigger.setAttribute("aria-expanded", "false");
}

configureCartButton();
document.addEventListener("site:layout-ready", configureCartButton, { once: true });

// Quita un producto entero de la lista cuando se pulsa su botón de eliminar.
document.getElementById("cart-items")?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-cart-id]");
    if (!removeButton) return;

    const removedId = Number(removeButton.dataset.cartId);
    cartItems = cartItems.filter((item) => item.id !== removedId);
    saveCart();
});

// El icono del header alterna el panel y los clics externos lo cierran.
document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".cart-btn");
    const panel = document.getElementById("shopping-cart");
    if (!panel) return;

    if (trigger) {
        event.preventDefault();
        setCartOpen(panel.hidden);
        return;
    }

    // El clic de agregar actualiza y abre el panel durante el mismo evento.
    if (event.target.closest('[data-action="add-to-cart"]')) return;
    if (!panel.hidden && !panel.contains(event.target)) setCartOpen(false);
});

// Cierra el carrito cuando se abre otro panel desplegable del sitio.
document.addEventListener("site:dropdown-open", (event) => {
    if (event.detail?.name !== "cart") setCartOpen(false);
});

// Permite cerrar el panel con Escape y devolver el foco al botón del header.
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const panel = document.getElementById("shopping-cart");
    if (!panel || panel.hidden) return;
    setCartOpen(false);
    document.querySelector(".cart-btn")?.focus();
});

// ===== Carga del catálogo y armado de carruseles =====
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

    // Sincroniza los botones recién creados con los productos ya guardados.
    renderCart();
    refreshCategoryMenu();
}

init();

// ===== Acciones de las cards =====
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

    // La card conecta su acción de carrito con el estado persistido de Home.
    if (btn.dataset.action === "add-to-cart") {
        if (game) addGameToCart(game);
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
