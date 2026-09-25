// Datos de los juegos. Para agregar una card nueva, se agrega un objeto acá.
// type: "free" | "paid"
// price: precio final que se muestra (solo para "paid")
// discount: porcentaje opcional (si no hay descuento, se omite)
const games = [
    { id: 1, title: "RV There Yet?", category: "Adventure", likes: 1200, type: "paid", price: 7,  image: "assets/img/imgCards/Rv-There-Yet.jpg" },
    { id: 2, title: "Angry Birds", category: "Adventure", likes: 5400, type: "free", image: "assets/img/imgCards/Angry Birds.png" },
    { id: 3, title: "Hollow Knight", category: "Adventure", likes: 9800, type: "paid", price: 25, discount: 35, image: "assets/img/imgCards/Hollow Knight.jpg" },
    { id: 4, title: "Minecraft Java & Bedrock", category: "Adventure", likes: 15000, type: "paid", price: 8, image: "assets/img/imgCards/Minecraft.jpg" },
    { id: 5, title: "Sonic Shadow Generations", category: "Adventure", likes: 3100, type: "free", image: "assets/img/imgCards/Sonic.jpg" },
    { id: 6, title: "Silksong", category: "Adventure", likes: 12500, type: "paid", price: 14, discount: 50, image: "assets/img/imgCards/Silksong.jpg" },
    { id: 7, title: "Crash Mind Over Mutant", category: "Adventure", likes: 2200, type: "free", image: "assets/img/imgCards/Crash.jpg" },
    { id: 9, title: "PEAK", category: "Adventure", likes: 4700, type: "paid", price: 14, discount: 50, image: "assets/img/imgCards/PEAK.png" },
    { id: 10, title: "PEAK", category: "Adventure", likes: 4700, type: "paid", price: 14, discount: 50, image: "assets/img/imgCards/PEAK.png" },
    { id: 11, title: "PEAK", category: "Adventure", likes: 4700, type: "paid", price: 14, discount: 50, image: "assets/img/imgCards/PEAK.png" },
    { id: 12, title: "PEAK", category: "Action", likes: 4700, type: "paid", price: 14, discount: 50, image: "assets/img/imgCards/PEAK.png" },
    { id: 13, title: "Hollow Knight", category: "Action", likes: 9800, type: "paid", price: 25, discount: 35, image: "assets/img/imgCards/Hollow Knight.jpg" },
];