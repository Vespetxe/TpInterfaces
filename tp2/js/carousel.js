// Íconos de flecha en SVG (stroke="currentColor" hereda el color del botón,
// así el hover del botón también pinta el ícono sin tocar el SVG).
const ICON_CHEVRON_LEFT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
const ICON_CHEVRON_RIGHT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

// Crea un carousel dentro de `mount` con el título y la lista de juegos.
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

    list.forEach((game) => track.appendChild(createGameCard(game)));
    mount.appendChild(section);

  const CARDS_PER_VIEW = 8; // siempre entran 8, sea cual sea el ancho de pantalla
  let index = 0; // índice de la primera card visible

  // En vez de medir "cuántas entran" (como antes), ahora es al revés:
  // ya sabemos que queremos 8, así que calculamos qué ancho le toca a
  // cada una para que esas 8 llenen justo el espacio real del viewport
  // (viewport.clientWidth ya viene correcto solo por tener flex: 1).
    function measure() {
        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.columnGap) || 0;
        // El track tiene su propio margin-inline (el "aire" antes de la primera
        // card y después de la última). Ese margen le resta espacio real al
        // área disponible, así que hay que descontarlo antes de repartir el
        // ancho entre las 8 cards -- si no, quedan calculadas un poco más
        // anchas de lo que en verdad entra, y la última se corta un poco.
        const trackMargin = parseFloat(trackStyle.marginLeft) + parseFloat(trackStyle.marginRight);
        const availableWidth = viewport.clientWidth - trackMargin;
        const cardWidth = (availableWidth - gap * (CARDS_PER_VIEW - 1)) / CARDS_PER_VIEW;
        const step = cardWidth + gap;
        const maxIndex = Math.max(0, list.length - CARDS_PER_VIEW);
        return { cardWidth, step, maxIndex };
    }

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

  // Reinicia la animación de fade del track. Sacar y volver a poner la MISMA
  // clase no alcanza: el navegador junta los dos cambios y no pasa nada.
  // Por eso, entre sacarla y ponerla, se lee track.offsetWidth: leer esa
  // propiedad obliga al navegador a recalcular el layout en ese instante
  // (un "reflow" forzado), lo que separa el "sacar" del "poner" en dos pasos
  // reales. Recién ahí, al agregar la clase de nuevo, @keyframes arranca
  // desde cero. Es un truco conocido para reiniciar animaciones CSS por JS.
    function triggerFadeAnimation() {
        track.classList.remove("is-animating");
        void track.offsetWidth; // fuerza el reflow
        track.classList.add("is-animating");
    }

    prev.addEventListener("click", () => {
        index = Math.max(0, index - CARDS_PER_VIEW);
        triggerFadeAnimation();
        update();
    });

    next.addEventListener("click", () => {
        const { maxIndex } = measure();
        index = Math.min(maxIndex, index + CARDS_PER_VIEW);
        triggerFadeAnimation();
        update();
    });

    window.addEventListener("resize", update);
    update();
}
