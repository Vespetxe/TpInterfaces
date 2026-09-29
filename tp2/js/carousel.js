// Íconos de flecha en SVG (stroke="currentColor" hereda el color del botón,
// así el hover del botón también pinta el ícono sin tocar el SVG).
const ICON_CHEVRON_LEFT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
const ICON_CHEVRON_RIGHT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

// Crea el carrusel dentro de `mount`, agrega sus cards y configura navegación y animaciones.
function renderCarousel(mount, title, list) {
    const section = document.createElement("section");
    section.className = "carousel";
    section.id = `carousel-${title.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    section.innerHTML = `
        <h2 class="carousel__title">${title}</h2>
        <div class="carousel__body">
        <button class="carousel__arrow carousel__arrow--prev" aria-label="Anterior">${ICON_CHEVRON_LEFT}</button>
        <div class="carousel__viewport">
            <div class="carousel__track"></div>
        </div>
        <button class="carousel__arrow carousel__arrow--next" aria-label="Siguiente">${ICON_CHEVRON_RIGHT}</button>
        </div>
    `;

    const viewport = section.querySelector(".carousel__viewport");
    const track = section.querySelector(".carousel__track");
    const prev = section.querySelector(".carousel__arrow--prev");
    const next = section.querySelector(".carousel__arrow--next");

    // Crea y agrega una card por cada juego de la lista recibida.
    list.forEach((game) => track.appendChild(createGameCard(game)));
    mount.appendChild(section);

    let index = 0; // índice de la primera card visible

    // Lee del CSS cuántas cards deben verse según el ancho actual.
    function getCardsPerView() {
        const value = Number.parseInt(getComputedStyle(track).getPropertyValue("--cards-per-view"), 10);
        return Number.isFinite(value) && value > 0 ? value : 2;
    }

    // Calcula medidas y límites usando la cantidad de cards por vista que define el CSS.
    function measure() {
        const cardsPerView = getCardsPerView();
        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.columnGap) || 0;
        // El track tiene su propio margin-inline (el "aire" antes de la primera
        // card y después de la última). Ese margen le resta espacio real al
        // área disponible, así que hay que descontarlo antes de repartir el ancho.
        const trackMargin = parseFloat(trackStyle.marginLeft) + parseFloat(trackStyle.marginRight);
        const availableWidth = viewport.clientWidth - trackMargin;
        const cardWidth = (availableWidth - gap * (cardsPerView - 1)) / cardsPerView;
        const step = cardWidth + gap;
        const maxIndex = Math.max(0, list.length - cardsPerView);
        return { cardWidth, step, maxIndex, cardsPerView };
    }

    // Aplica las medidas al track y actualiza el estado de las flechas.
    function update() {
        const { cardWidth, step, maxIndex } = measure();
        index = Math.min(index, maxIndex); // por si el resize achicó el límite

        // Se pisa la variable CSS --card-w en el track: como las custom properties
        // se heredan hacia abajo, todas las .game-card de adentro (que usan
        // flex: 0 0 var(--card-w, ...)) toman este ancho calculado en vez del
        // fallback fijo del CSS.
        track.style.setProperty("--card-w", `${cardWidth}px`);
        track.style.transform = `translateX(${-index * step}px)`;
        prev.disabled = index === 0;
        next.disabled = index >= maxIndex;
    }

    // Reinicia el fade; leer offsetWidth fuerza a aplicar la clase quitada antes de volver a agregarla.
    function triggerFadeAnimation() {
        track.classList.remove("is-animating");
        void track.offsetWidth; // fuerza el reflow
        track.classList.add("is-animating");
    }

    // Retrocede un grupo de cards sin pasar del inicio.
    prev.addEventListener("click", () => {
        index = Math.max(0, index - getCardsPerView());
        triggerFadeAnimation();
        update();
    });

    // Avanza un grupo de cards sin superar el último grupo disponible.
    next.addEventListener("click", () => {
        const { maxIndex, cardsPerView } = measure();
        index = Math.min(maxIndex, index + cardsPerView);
        triggerFadeAnimation();
        update();
    });

    // Recalcula el tamaño de las cards y los límites al cambiar el viewport.
    window.addEventListener("resize", update);
    update();
}
