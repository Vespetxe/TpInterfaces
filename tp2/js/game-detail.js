const detailMount = document.getElementById("game-detail");
const requestedId = Number(new URLSearchParams(window.location.search).get("id")) || RECOMMENDED_GAME.id;
const ICON_LIKE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 22V11m0 11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3m0 11h9.5a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 18 10H14V6a2 2 0 0 0-2-2l-2 6.6V22z"/></svg>`;
const ICON_DISLIKE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2v11m0-11h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3m0-11H7.5a2 2 0 0 0-2 1.6L4.1 21.6A2 2 0 0 0 6 24h4V17.4L12 11H17z"/></svg>`;
const ICON_BOOKMARK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
const ICON_SHARE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;
const ICON_FULLSCREEN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
const GAME_COMMENTS = [
    { user: "PixelVex", time: "12 min ago", text: "Surprisingly addictive. I thought I'd solve it in a few moves, but that last clone always gets me.", likes: 3, avatar: "assets/img/pixelvex.png" },
    { user: "NeonGamer", time: "1 hour ago", text: "Okay, this is WAY harder than it looks. Finally got down to one clone after ten attempts.", likes: 123, avatar: "assets/img/neongamer.png" },
    { user: "ByteWitch", time: "3 hours ago", text: "The petri dish theme is such a fun twist on a classic puzzle. The little clone animations make every move feel satisfying.", likes: 37, avatar: "assets/img/bytewitch.png" },
    { user: "VoidRunner", time: "5 hours ago", text: "Simple rules, but surprisingly deep. I kept making moves that looked right and completely ruined the board.", likes: 29, avatar: "assets/img/voidrunner.png" }
];

if (requestedId !== RECOMMENDED_GAME.id) {
    detailMount.innerHTML = `
        <p class="game-detail__message">Game not found.</p>
        <a class="game-detail__back" href="home.html">Back to games</a>
    `;
} else {
    const game = RECOMMENDED_GAME;
    document.title = `${game.title} | Nexus Games`;

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
                <button aria-label="Like">${ICON_LIKE}</button>
                <button aria-label="Dislike">${ICON_DISLIKE}</button>
                <button aria-label="Save">${ICON_BOOKMARK}</button>
                <button aria-label="Share">${ICON_SHARE}</button>
                <button aria-label="Fullscreen" id="fullscreenBtn">${ICON_FULLSCREEN}</button>
            </div>
        </div>
        <section class="game-gallery">
            <h2 class="game-gallery__title">See It in Action</h2>
            <div class="game-gallery__grid">
                ${game.gallery.map((src, i) => `
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
                    ${game.features.map(f => `<li>${f}</li>`).join("")}
                </ul>

                <h2>FAQ</h2>
                <dl class="game-info__faq">
                    ${game.faq.map(item => `<dt>${item.q}</dt><dd>${item.a}</dd>`).join("")}
                </dl>
            </article>

            <aside class="game-comments">
                <h2 class="game-comments__title">${GAME_COMMENTS.length} comments</h2>
                <form class="game-comments__form" id="commentForm">
                    <img class="comment__avatar" src="assets/img/foto-perfil.png" alt="Your avatar">
                    <input type="text" placeholder="Write a comment..." required>
                    <button type="submit">Post Comment</button>
                </form>
                <ul class="game-comments__list" id="commentsList">
                    ${GAME_COMMENTS.map(c => `
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

    // Comentario nuevo: se agrega arriba de la lista en memoria (sin backend, no persiste)
    document.getElementById("commentForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = e.target.querySelector("input");
        if (!input.value.trim()) return;

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
    });

    // Placeholder hasta que exista la página de gameplay real
    document.querySelector(".game-hero__play").addEventListener("click", () => {
        alert("Peg Solitaire gameplay isn't implemented yet in this delivery.");
    });
    document.getElementById("fullscreenBtn").addEventListener("click", () => {
        const hero = document.querySelector(".game-hero");
        if (!document.fullscreenElement) {
            hero.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}