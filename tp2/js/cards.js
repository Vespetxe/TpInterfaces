// Reutiliza el mismo dibujo outline del Like de game-detail, reducido para el contador de cada card.
const ICON_LIKE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.27a2 2 0 0 0 1.8-1.1l2.04-4.08A2 2 0 0 1 16 5.7c0 .23-.02.45-.08.67Z"/></svg>`;

// 15000 -> "15K"
const compactNumber = new Intl.NumberFormat("en", { notation: "compact" });

// Devuelve las etiquetas y el botón que corresponden según el juego sea gratis o pago.
function createBadges(game) {
    if (game.type === "free") {
        return `<button class="badge badge--free" data-action="play">Play Free</button>`;
    }

    const discount = game.discount
        ? `<span class="badge badge--discount">-${game.discount}%</span>`
        : "";

        return `
        ${discount}
        <span class="badge badge--price">USD ${game.price}</span>
        <button class="badge badge--cart" data-action="add-to-cart"><span class="badge__label-full">Add to cart</span><span class="badge__label-short">Cart</span></button>
    `;
}

// Construye el HTML de una card con portada, etiquetas, título, género y likes.
function createGameCard(game) {
    const card = document.createElement("article");
    card.className = `game-card game-card--${game.type}`;
    card.dataset.id = game.id;

    card.innerHTML = `
        <div class="game-card__media">
        <img class="game-card__img" src="${game.image}" alt="Portada de ${game.title}" loading="lazy">
        <div class="game-card__badges">${createBadges(game)}</div>
        </div>
        <div class="game-card__footer">
        <h3 class="game-card__title">${game.title}</h3>
        <div class="game-card__meta">
            <span class="game-card__category">${game.category}</span>
            <span class="game-card__likes">${ICON_LIKE} ${compactNumber.format(game.likes)}</span>
        </div>
        </div>
    `;

    return card;
}
