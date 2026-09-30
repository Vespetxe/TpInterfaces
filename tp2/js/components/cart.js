// ===== Carrito compartido entre Home y la página de juego =====
const CART_STORAGE_KEY = "nexus-games-cart";
const cartMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Recupera el carrito guardado y conserva una sola entrada por juego.
function loadCart() {
    try {
        const savedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        if (!Array.isArray(savedItems)) return [];

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

// Dibuja los productos, el contador y el total dentro del panel compartido.
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
        price.textContent = cartMoney.format(unitPrice);
        details.append(title, price);

        const removeButton = document.createElement("button");
        removeButton.className = "shopping-cart__remove";
        removeButton.type = "button";
        removeButton.dataset.cartId = String(item.id);
        removeButton.setAttribute("aria-label", `Remove ${item.title} from cart`);
        // El SVG deja la X centrada sin depender de la métrica de una fuente.
        removeButton.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m4 4 8 8M12 4l-8 8"/></svg>';

        row.append(image, details, removeButton);
        itemsMount.appendChild(row);
    });

    const total = cartItems.reduce((sum, item) => sum + item.price * (1 - item.discount / 100), 0);
    totalMount.textContent = cartMoney.format(total);

    // Desactiva las cards de juegos que ya están en el carrito cuando existen en la página.
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

// Persiste el carrito para que el mismo contenido aparezca al cambiar de página.
function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.warn("No se pudo guardar el carrito:", error);
    }
    renderCart();
}

// Abre o cierra el panel y coordina los demás menús desplegables del header.
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

// Agrega cada juego como máximo una vez y abre el carrito para mostrarlo.
function addGameToCart(game) {
    if (cartItems.some((item) => item.id === game.id)) return;

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

// Expone las acciones que Home necesita para conectar sus cards con este componente.
window.siteCart = { addGameToCart, renderCart };
renderCart();

// Asocia el botón del header aunque el header se inyecte después de este script.
function configureCartButton() {
    const trigger = document.querySelector(".cart-btn");
    if (!trigger) return;
    trigger.setAttribute("aria-controls", "shopping-cart");
    trigger.setAttribute("aria-expanded", "false");
}

configureCartButton();
document.addEventListener("site:layout-ready", configureCartButton, { once: true });

// Quita un juego completo de la lista al pulsar su botón de eliminar.
document.getElementById("cart-items")?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-cart-id]");
    if (!removeButton) return;
    cartItems = cartItems.filter((item) => item.id !== Number(removeButton.dataset.cartId));
    saveCart();
});

// Alterna el panel al pulsar el icono y lo cierra con un clic fuera.
document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".cart-btn");
    const panel = document.getElementById("shopping-cart");
    if (!panel) return;

    if (trigger) {
        event.preventDefault();
        setCartOpen(panel.hidden);
        return;
    }

    // El botón de una card abre el panel al agregar y no debe cerrarlo después.
    if (event.target.closest('[data-action="add-to-cart"]')) return;
    if (!panel.hidden && !panel.contains(event.target)) setCartOpen(false);
});

// Cierra el carrito si se abre el perfil o el menú de categorías.
document.addEventListener("site:dropdown-open", (event) => {
    if (event.detail?.name !== "cart") setCartOpen(false);
});

// Permite cerrar el carrito con Escape y devuelve el foco a su botón.
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const panel = document.getElementById("shopping-cart");
    if (!panel || panel.hidden) return;
    setCartOpen(false);
    document.querySelector(".cart-btn")?.focus();
});
