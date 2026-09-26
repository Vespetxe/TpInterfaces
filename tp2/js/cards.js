const ICON_LIKE = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 22V11m0 11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3m0 11h9.5a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 18 10H14V6a2 2 0 0 0-2-2l-2 6.6V22z"/></svg>`;

// 15000 -> "15K"
const compactNumber = new Intl.NumberFormat("en", { notation: "compact" });

// Acá está la lógica free vs paid: cada tipo devuelve badges y botón distintos.
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
