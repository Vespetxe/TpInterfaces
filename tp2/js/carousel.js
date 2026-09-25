    // Crea un carousel dentro de `mount` con el título y la lista de juegos.
    function renderCarousel(mount, title, list) {
    const section = document.createElement("section");
    section.className = "carousel";
    section.innerHTML = `
        <h2 class="carousel__title">${title}</h2>
        <div class="carousel__body">
        <button class="carousel__arrow carousel__arrow--prev" aria-label="Anterior">&#8249;</button>
        <div class="carousel__viewport">
            <div class="carousel__track"></div>
        </div>
        <button class="carousel__arrow carousel__arrow--next" aria-label="Siguiente">&#8250;</button>
        </div>
    `;

    const viewport = section.querySelector(".carousel__viewport");
    const track = section.querySelector(".carousel__track");
    const prev = section.querySelector(".carousel__arrow--prev");
    const next = section.querySelector(".carousel__arrow--next");

    list.forEach((game) => track.appendChild(createGameCard(game)));
    mount.appendChild(section);

    let index = 0; // índice de la primera card visible

    // Mide cuánto ocupa una card (ancho + gap) y cuántas entran en pantalla.
    // Se mide en cada uso porque cambia con el tamaño de la ventana.
    function measure() {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const step = track.firstElementChild.offsetWidth + gap;
        const visible = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
        const maxIndex = Math.max(0, list.length - visible);
        return { step, visible, maxIndex };
    }

    function update() {
        const { step, maxIndex } = measure();
        index = Math.min(index, maxIndex); // por si el resize achicó el límite
        track.style.transform = `translateX(${-index * step}px)`;
        prev.disabled = index === 0;
        next.disabled = index >= maxIndex;
    }

    prev.addEventListener("click", () => {
        const { visible } = measure();
        index = Math.max(0, index - visible);
        update();
    });

    next.addEventListener("click", () => {
        const { visible, maxIndex } = measure();
        index = Math.min(maxIndex, index + visible);
        update();
    });

    window.addEventListener("resize", update);
    update();
}
