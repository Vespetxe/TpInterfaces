const HERO_CHEVRON_LEFT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
const HERO_CHEVRON_RIGHT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

// Crea una card destacada usando la estructura común y su imagen de alta resolución.
function createHeroCard(game) {
    const card = createGameCard(game);
    card.classList.add("hero-card");
    card.setAttribute("aria-label", `${game.title} — Highlight of the week`);

    const image = card.querySelector(".game-card__img");
    image.src = game.fullImage || game.image;

    const highlight = document.createElement("span");
    highlight.className = "hero-card__highlight";
    highlight.textContent = "Highlight of the week";
    card.appendChild(highlight);

    return card;
}

// Construye el hero carousel, sus copias de borde y los controles de navegación.
function renderHeroCarousel(mount, games) {
    if (!mount || games.length === 0) return;

    const section = document.createElement("section");
    section.className = "hero-carousel";
    section.setAttribute("aria-label", "Weekly game highlights");
    section.innerHTML = `
        <div class="hero-carousel__body">
            <button class="carousel__arrow hero-carousel__arrow hero-carousel__arrow--prev" type="button" aria-label="Previous highlight">${HERO_CHEVRON_LEFT}</button>
            <div class="hero-carousel__viewport">
                <div class="hero-carousel__track"></div>
            </div>
            <button class="carousel__arrow hero-carousel__arrow hero-carousel__arrow--next" type="button" aria-label="Next highlight">${HERO_CHEVRON_RIGHT}</button>
        </div>
    `;

    const viewport = section.querySelector(".hero-carousel__viewport");
    const track = section.querySelector(".hero-carousel__track");
    const previous = section.querySelector(".hero-carousel__arrow--prev");
    const next = section.querySelector(".hero-carousel__arrow--next");

    const lastPreview = createHeroCard(games[games.length - 1]);
    lastPreview.classList.add("hero-card--preview");
    lastPreview.setAttribute("aria-hidden", "true");
    // Desactiva los botones de la copia para que solo se pueda interactuar con la slide real.
    lastPreview.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    track.appendChild(lastPreview);

    // Agrega las cards reales al track en el mismo orden que los datos recibidos.
    games.forEach((game) => track.appendChild(createHeroCard(game)));

    const firstPreview = createHeroCard(games[0]);
    firstPreview.classList.add("hero-card--preview");
    firstPreview.setAttribute("aria-hidden", "true");
    // Desactiva también los botones de la copia usada para cerrar el loop.
    firstPreview.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    track.appendChild(firstPreview);

    mount.replaceChildren(section);

    let index = 1;

    // Centra la slide activa y actualiza qué card recibe el estilo destacado.
    function update() {
        const card = track.querySelector(".hero-card");
        if (!card) return;

        // Marca como activa solo la slide que debe ocupar el centro.
        Array.from(track.children).forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });

        const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
        const cardWidth = card.offsetWidth;
        const step = cardWidth + gap;
        const centeredOffset = (viewport.clientWidth - cardWidth) / 2;

        track.style.transform = `translateX(${centeredOffset - index * step}px)`;
    }

    // Mueve el carrusel una posición hacia la slide anterior.
    previous.addEventListener("click", () => {
        index -= 1;
        update();
    });

    // Mueve el carrusel una posición hacia la slide siguiente.
    next.addEventListener("click", () => {
        index += 1;
        update();
    });

    // Salta de la copia de borde a la slide real para crear un loop continuo.
    track.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "transform") return;
        if (index !== 0 && index !== games.length + 1) return;

        index = index === 0 ? games.length : 1;
        track.style.transition = "none";
        update();
        track.offsetWidth;
        track.style.removeProperty("transition");
    });

    // Recalcula el centrado y el desplazamiento cuando cambia el ancho de pantalla.
    window.addEventListener("resize", update);
    update();
}
