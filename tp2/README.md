# Nexus Games

Nexus Games es una interfaz web para explorar videojuegos y acceder a sus páginas de detalle y ejecución. El proyecto se desarrolló con **HTML5, CSS3 y JavaScript**, con foco en el diseño visual, la navegación y las interacciones del usuario. No requiere un backend.

## Sobre el proyecto

El sitio reúne las páginas principales de una plataforma de videojuegos: inicio de sesión y registro, página de inicio y detalle de cada juego. La Home permite descubrir títulos destacados; desde la página de un juego se puede consultar información, ver imágenes de ejemplo e iniciar su experiencia interactiva.

El diseño contempla una experiencia adaptable para la página de inicio, además de animaciones de interfaz, estados hover y transiciones en galerías o carruseles. El contenido utiliza juegos e imágenes variadas para mostrar cómo responde la interfaz ante distintos títulos y estilos visuales.

## Videojuego Blocka

Blocka es un rompecabezas visual integrado en la página de detalle de un juego. El jugador recibe una imagen dividida en piezas rotadas y debe girarlas para reconstruirla. El clic izquierdo rota una pieza hacia la izquierda y el clic derecho hacia la derecha.

El juego incluye una experiencia libre y un modo competitivo de varios niveles. Cada nivel presenta una imagen elegida al azar y puede aplicar filtros visuales diferentes a sus piezas. Los filtros se procesan durante la preparación del nivel, antes de comenzar a jugar. Al completar el rompecabezas se muestra la imagen original.

## Requisitos principales

- Permitir la navegación e interacción con las páginas principales del sitio.
- Incluir animaciones de interfaz y estados hover en botones, además de una galería o carrusel con transiciones animadas.
- Mostrar una carga simulada en la Home con porcentaje de avance e indicador animado, sin utilizar un GIF.
- Usar contenido e imágenes variados, evitando textos genéricos o de relleno.
- Diseñar la Home para dispositivos móviles y escritorio.
- Incluir en Blocka instrucciones, imágenes representativas, un banco de al menos seis imágenes y un mínimo de tres niveles.
- Incorporar filtros de escala de grises, brillo y negativo, procesados durante la preparación del nivel.

## Funcionalidades adicionales de Blocka

El juego puede incluir una selección animada de imagen antes de cada nivel, opciones para jugar con 4, 6 u 8 piezas, una ayuda que ubica una pieza correctamente y límites de tiempo para aumentar la dificultad.

Las animaciones pueden realizarse con CSS y `@keyframes`; no se utilizan spritesheets. El menú hamburguesa no se considera uno de los botones para contabilizar animaciones hover.
