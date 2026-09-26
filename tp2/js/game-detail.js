const detailMount = document.getElementById("game-detail");
const requestedId = Number(new URLSearchParams(window.location.search).get("id"));

if (requestedId !== RECOMMENDED_GAME.id) {
    detailMount.innerHTML = `
        <p class="game-detail__message">No se encontró el juego solicitado.</p>
        <a class="game-detail__back" href="home.html">Volver a los juegos</a>
    `;
} else {
    document.title = `${RECOMMENDED_GAME.title} | Nexus Games`;
    detailMount.innerHTML = `
        <a class="game-detail__back" href="home.html">← Volver a la Home</a>
        <article class="game-detail__content">
            <img class="game-detail__image" src="${RECOMMENDED_GAME.fullImage}" alt="${RECOMMENDED_GAME.title}">
            <div class="game-detail__info">
                <p class="game-detail__category">${RECOMMENDED_GAME.category}</p>
                <h1>${RECOMMENDED_GAME.title}</h1>
                <p class="game-detail__description">${RECOMMENDED_GAME.description}</p>
                <p class="game-detail__rating">★ ${RECOMMENDED_GAME.rating.toFixed(1)} · ${RECOMMENDED_GAME.likes.toLocaleString("es-AR")} likes</p>
                <span class="game-detail__price">USD ${RECOMMENDED_GAME.price.toFixed(2)}</span>
            </div>
        </article>
    `;
}
