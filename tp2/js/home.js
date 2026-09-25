const carouselsMount = document.getElementById("carousels");

// Un carousel por categoría, filtrando el array de datos.
const categories = [...new Set(games.map((g) => g.category))];
categories.forEach((cat) => {
    renderCarousel(carouselsMount, cat, games.filter((g) => g.category === cat));
});

// Event delegation: un solo listener para todos los botones de todas las cards.
carouselsMount.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const id = Number(btn.closest(".game-card").dataset.id);
    const game = games.find((g) => g.id === id);

    if (btn.dataset.action === "add-to-cart") {
        console.log("Agregar al carrito:", game.title); // acá va tu lógica del carrito
    } else if (btn.dataset.action === "play") {
        console.log("Jugar:", game.title);
    }
});