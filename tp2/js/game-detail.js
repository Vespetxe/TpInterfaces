const detailMount = document.getElementById("game-detail");
const requestedId = Number(new URLSearchParams(window.location.search).get("id")) || RECOMMENDED_GAME.id;
// Mantiene los iconos del toolbar en el mismo estilo outline; el Like también se usa en comentarios.
const ICON_LIKE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.27a2 2 0 0 0 1.8-1.1l2.04-4.08A2 2 0 0 1 16 5.7c0 .23-.02.45-.08.67Z"/></svg>`;
const ICON_DISLIKE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(180 12 12)"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3.27a2 2 0 0 0 1.8-1.1l2.04-4.08A2 2 0 0 1 16 5.7c0 .23-.02.45-.08.67Z"/></g></svg>`;
const ICON_BOOKMARK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z"/></svg>`;
const ICON_SHARE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.1M8.7 13.3l6.6 4.1"/></svg>`;
const ICON_FULLSCREEN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
const GAME_COMMENTS = [
    { user: "PixelVex", time: "12 min ago", text: "Surprisingly addictive. I thought I'd solve it in a few moves, but that last clone always gets me.", likes: 3, avatar: "assets/img/pixelvex.png" },
    { user: "NeonGamer", time: "1 hour ago", text: "Okay, this is WAY harder than it looks. Finally got down to one clone after ten attempts.", likes: 123, avatar: "assets/img/neongamer.png" },
    { user: "ByteWitch", time: "3 hours ago", text: "The petri dish theme is such a fun twist on a classic puzzle. The little clone animations make every move feel satisfying.", likes: 37, avatar: "assets/img/bytewitch.png" },
    { user: "VoidRunner", time: "5 hours ago", text: "Simple rules, but surprisingly deep. I kept making moves that looked right and completely ruined the board.", likes: 29, avatar: "assets/img/voidrunner.png" }
];

// Escapa caracteres HTML para mostrar texto externo sin que se interprete como etiquetas.
function escapeDetailText(value = "") {
    // Convierte cada carácter especial en su entidad HTML segura.
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

// Dibuja la página de detalle para un juego recibido desde la API.
    /*function renderApiGameDetail(game) {
        const title = escapeDetailText(game.title);
        const image = escapeDetailText(game.fullImage || game.image || "");
        const description = escapeDetailText(game.description || "No description is available for this game yet.");
        const category = escapeDetailText(game.genres?.join(", ") || game.category || "Game");
        const release = escapeDetailText(game.released || "Not listed");
        const platforms = escapeDetailText(game.platforms?.join(", ") || "Not listed");

        document.title = `${title} | Nexus Games`;
        detailMount.innerHTML = `
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="home.html">Home</a>
                <span class="breadcrumb__sep">›</span>
                <span class="breadcrumb__current">${title}</span>
            </nav>
            <div class="game-hero">
                <img class="game-hero__image" src="${image}" alt="${title}">
            </div>
            <div class="game-hero__toolbar">
                <span class="game-hero__name">${title}</span>
                <span class="api-game-detail__rating">★ ${Number(game.rating || 0).toFixed(1)}</span>
            </div>
            <article class="api-game-detail">
                <h1>${title}</h1>
                <p>${description}</p>
                <dl>
                    <div><dt>Genres</dt><dd>${category}</dd></div>
                    <div><dt>Release date</dt><dd>${release}</dd></div>
                    <div><dt>Platforms</dt><dd>${platforms}</dd></div>
                </dl>
                <a class="game-detail__back" href="home.html">Back to Home</a>
            </article>
        `;
        }

    if (requestedId !== RECOMMENDED_GAME.id) {
        detailMount.innerHTML = `<p class="game-detail__message">Loading game...</p>`;
        // Busca en la API el juego indicado por la URL y dibuja su detalle si existe.
        fetchGames()
            .then((apiGames) => {
                // Encuentra el juego cuyo identificador coincide con el parámetro de la URL.
                const game = apiGames.find((item) => item.id === requestedId);
                if (game) {
                    renderApiGameDetail(game);
                } else {
                    detailMount.innerHTML = `
                        <p class="game-detail__message">Game not found.</p>
                        <a class="game-detail__back" href="home.html">Back to games</a>
                    `;
                }
            })
            // Muestra un mensaje alternativo si falla la carga de la API.
            .catch(() => {
                detailMount.innerHTML = `
                    <p class="game-detail__message">The game could not be loaded.</p>
                    <a class="game-detail__back" href="home.html">Back to games</a>
                `;
            });
    } else {*/
        const game = RECOMMENDED_GAME;
        document.title = `${game.title} | Nexus Games`;

    // Renderiza el detalle local y convierte sus listas en secciones HTML.
    detailMount.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="home.html">Home</a>
            <span class="breadcrumb__sep">›</span>
            <a href="home.html">${game.category}</a>
            <span class="breadcrumb__sep">›</span>
            <span class="breadcrumb__current">${game.title}</span>
        </nav>

        <div class="game-hero">
            <img class="game-hero__image" src="${game.fullImage}" alt="${game.title}">
            <button class="game-hero__play" type="button">Play</button>
        </div>
        <div class="game-hero__toolbar">
            <span class="game-hero__name">${game.title}</span>
            <div class="game-hero__actions">
                <button type="button" data-action="like" aria-label="Like" aria-pressed="false" title="Like">${ICON_LIKE}</button>
                <button type="button" data-action="dislike" aria-label="Dislike" aria-pressed="false" title="Dislike">${ICON_DISLIKE}</button>
                <button type="button" data-action="save" aria-label="Save" aria-pressed="false" title="Save">${ICON_BOOKMARK}</button>
                <button type="button" aria-label="Share" title="Share">${ICON_SHARE}</button>
                <button type="button" aria-label="Fullscreen" id="fullscreenBtn" title="Fullscreen">${ICON_FULLSCREEN}</button>
            </div>
        </div>
        <section class="game-gallery">
            <h2 class="game-gallery__title">See It in Action</h2>
            <div class="game-gallery__grid">
                ${/* Crea una miniatura por cada imagen de la galería. */ game.gallery.map((src, i) => `
                    <div class="game-gallery__thumb">
                        <img src="${src}" alt="Screenshot ${i + 1} of ${game.title}">
                    </div>
                `).join("")}
            </div>
        </section>

        <div class="game-body">
            <article class="game-info">
                <h1 class="game-info__title">${game.title}</h1>
                <p class="game-info__description">${game.longDescription}</p>

                <h2>How to Play</h2>
                <p class="game-info__description">${game.howToPlay}</p>

                <h2>Features</h2>
                <ul class="game-info__features">
                    ${/* Convierte cada característica en un elemento de lista. */ game.features.map(f => `<li>${f}</li>`).join("")}
                </ul>

                <h2>FAQ</h2>
                <dl class="game-info__faq">
                    ${/* Muestra cada pregunta frecuente junto con su respuesta. */ game.faq.map(item => `<dt>${item.q}</dt><dd>${item.a}</dd>`).join("")}
                </dl>
            </article>

            <aside class="game-comments">
                <h2 class="game-comments__title">${GAME_COMMENTS.length} comments</h2>
                <form class="game-comments__form" id="commentForm">
                    <img class="comment__avatar" src="assets/img/foto-perfil.png" alt="Your avatar">
                    <input type="text" placeholder="Write a comment..." required>
                    <button class="comment-submit" type="submit" aria-label="Post comment">
                        <span class="comment-submit__text">Post Comment</span>
                        <svg class="comment-submit__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                    </button>
                </form>
                <ul class="game-comments__list" id="commentsList">
                    ${/* Genera un bloque visual por cada comentario de ejemplo. */ GAME_COMMENTS.map(c => `
                        <li class="comment">
                            <img class="comment__avatar" src="${c.avatar}" alt="${c.user}">
                            <div class="comment__body">
                                <div class="comment__header">
                                    <span class="comment__user">@${c.user}</span>
                                    <span class="comment__time">${c.time}</span>
                                </div>
                                <p class="comment__text">${c.text}</p>
                                <span class="comment__likes">${ICON_LIKE} ${c.likes}</span>
                            </div>
                        </li>
                    `).join("")}
                </ul>
            </aside>
        </div>
    `;

    // Agrega el comentario enviado al inicio de la lista; queda solo en memoria.
    document.getElementById("commentForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = e.target.querySelector("input");
        if (!input.value.trim()) return;

        // Contrae el botón a un sobre al enviar y lo restablece después de insertar el comentario.
        const submitButton = e.target.querySelector(".comment-submit");
        submitButton.classList.add("is-posted");

        const li = document.createElement("li");
        li.className = "comment";
        li.innerHTML = `
        <img class="comment__avatar" src="assets/img/foto-perfil.png" alt="You">
        <div class="comment__body">
            <div class="comment__header">
                <span class="comment__user">@You</span>
                <span class="comment__time">just now</span>
            </div>
            <p class="comment__text">${input.value}</p>
            <span class="comment__likes">${ICON_LIKE} 0</span>
        </div>
    `;
        document.getElementById("commentsList").prepend(li);
        input.value = "";
        window.setTimeout(() => submitButton.classList.remove("is-posted"), 450);
    });

    // Like y Dislike son excluyentes; Save alterna de forma independiente en esta página.
    document.querySelector(".game-hero__actions").addEventListener("click", (event) => {
        const button = event.target.closest('button[aria-pressed]');
        if (!button) return;

        const nextState = button.getAttribute("aria-pressed") !== "true";
        const action = button.dataset.action;

        if (action === "like" || action === "dislike") {
            document.querySelectorAll('[data-action="like"], [data-action="dislike"]').forEach((reaction) => {
                reaction.setAttribute("aria-pressed", "false");
            });
        }

        button.setAttribute("aria-pressed", String(nextState));
    });

    // Al pulsar Play, quita el aspecto atenuado de la imagen principal.
    document.querySelector(".game-hero__play").addEventListener("click", () => {
        document.querySelector(".game-hero").classList.add("game-hero--enabled");
    });
    // Alterna el modo de pantalla completa para la imagen principal del juego.
    document.getElementById("fullscreenBtn").addEventListener("click", () => {
        const hero = document.querySelector(".game-hero");
        if (!document.fullscreenElement) {
            hero.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
