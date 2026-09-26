const API_URL = "https://vj.interfaces.jima.com.ar/api/v2";

/**
 * La API NO trae precio ni si el juego es free/paid (solo id, name, released,
 * background_image, background_image_low_res, rating, platforms, genres,
 * description). Como el diseño necesita esa distinción, se define acá una
 * regla propia y determinística (siempre da el mismo resultado para el mismo
 * juego, no cambia en cada recarga) para poder mostrar ambas variantes de card.
 * Es una decisión de diseño explícita: si mañana la API agrega precio real,
 * esta es la única función que hay que tocar.
 */
function assignPricing(raw) {
  const isFree = raw.id % 3 === 0; // 1 de cada 3 juegos, "al azar" pero fijo

    if (isFree) {
        return { type: "free" };
    }

    // Precio ficticio en base al rating (0-5) -> entre 5 y 55 aprox.
    const price = Math.max(5, Math.round((raw.rating || 3) * 12));
    // Descuento ficticio para algunos juegos, también determinístico.
    const discount = raw.id % 4 === 0 ? 20 + (raw.id % 5) * 10 : undefined;

    return { type: "paid", price, discount };
}

// Convierte un objeto tal como lo devuelve la API en un objeto con la forma
// que ya esperan createGameCard() y renderCarousel(): id, title, category,
// image, likes, type, price, discount.
function adaptGame(raw) {
    return {
        id: raw.id,
        title: raw.name,
        category: raw.genres?.[0]?.name || "Otros",
        genres: (raw.genres || []).map((genre) => genre.name),
        // low_res para las cards (listas); background_image original queda
        // disponible por si después se hace una vista de detalle del juego.
        image: raw.background_image_low_res || raw.background_image,
        fullImage: raw.background_image,
        description: raw.description || "",
        rating: raw.rating || 0,
        // No hay "likes" real en la API; se estima a partir del rating (0-5)
        // para tener un número creíble en el badge de likes.
        likes: Math.round((raw.rating || 0) * 3000),
        ...assignPricing(raw),
    };
}

// Pide los juegos a la API y devuelve la lista ya adaptada.
// Se usa async/await + try/catch para poder mostrar un error prolijo
// si la API no responde, en vez de que la página quede rota en silencio.
async function fetchGames() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`La API respondió con status ${response.status}`);
    }

    const raw = await response.json();
    return raw.map(adaptGame);
}
