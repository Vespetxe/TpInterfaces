# 🎮 Nexus Games

## Ejercicio Entregable Nº2 — Desarrollo de Interfaz de Usuario

### 📋 Descripción

Este proyecto corresponde al **Ejercicio Entregable Nº2**, cuyo objetivo es continuar e implementar el trabajo realizado anteriormente mediante el desarrollo de una interfaz de usuario utilizando **HTML5, JavaScript y CSS3**.

Se deberán maquetar y diseñar en alta fidelidad las mismas páginas definidas en el trabajo anterior, implementando únicamente el frontend necesario para representar el flujo del sitio.

> **Nota:** No se requiere desarrollar el backend del sitio.

### 🛠️ Tecnologías

* HTML5
* CSS3
* JavaScript

> No se recomienda utilizar frameworks de JavaScript como Angular, React o Vue, ni frameworks de CSS como Bootstrap.

---

## ✅ Requisitos

### 1. Interacción con las páginas

El usuario deberá poder interactuar con las **3 páginas** descritas en el práctico anterior.

Por ejemplo:

* **Home:** revisar los juegos destacados y acceder a la página de ejecución de un juego, como *Peg Solitaire*.
* **Login / Registro:** aplicar animaciones en caso de registro correcto.

### 2. Animaciones Hover

Los botones deberán incluir animaciones `hover`.

* Se deberán implementar **al menos 3 animaciones diferentes**.

### 3. Loading de la Home

Al cargar la Home deberá ejecutarse siempre un **loading simulado de 5 segundos**.

El loading deberá:

* No utilizar un GIF.
* Mostrar un **porcentaje de avance**.
* Incluir una **animación de carga**, como un cuadrado, círculo o spinner.

### 4. Galería / Carrusel animado

El sitio deberá contener al menos **una galería o carrusel de imágenes animada**.

La transición entre las imágenes deberá contar con animaciones.

> No debe limitarse únicamente al desplazamiento de las imágenes, sino que deberá incluir transiciones animadas.

Puede implementarse, por ejemplo, en la página de descripción de un juego.

### 5. Contenido

Los datos mostrados no deberán ser genéricos ni utilizar **Lorem Ipsum**.

Se deberá:

* Utilizar imágenes diferentes para cada juego mostrado.
* Utilizar títulos de juegos reales.
* Utilizar títulos de diferentes longitudes para comprobar su adaptación al diseño.
* Utilizar imágenes de diferentes colores y variedades para comprobar cómo se adapta el diseño a distintas opciones.

#### ⭐ Plus

Utilizar la API propuesta por la cátedra para obtener datos y utilizarlos en el sitio.

**API:** https://github.com/jimartinezabadias/api-vj-interfaces

---

## 📱 Diseño Mobile First

Se deberá desarrollar el sitio siguiendo un enfoque **Mobile First**.

### Home

La Home deberá estar desarrollada para:

* 📱 Mobile
* 🖥️ Desktop

### Resto de las páginas

El resto de las páginas deberán desarrollarse para:

* 🖥️ Desktop

---

## 📂 Cómo está organizado el código

Las páginas HTML se mantienen en la raíz de `tp2` para que sus enlaces entre sí sean directos:

* `index.html`: acceso y registro.
* `home.html`: portada, destacados, carruseles y carrito.
* `game.html`: detalle y ejecución del juego.

### Estilos (`css/`)

* `base/`: variables de diseño, fuentes y reglas globales.
  * `base/variables.css`: colores, fuentes y medidas globales.
  * `base/base.css`: reglas comunes de página y botones.
* `components/`: estilos compartidos de la interfaz.
  * `components/components.css`: botones de acceso y redes sociales.
  * `components/cards.css`: cards normales y carruseles horizontales.
  * `components/hero-carousel.css`: cards destacadas grandes.
  * `components/header.css`: header, menú hamburguesa y perfil.
  * `components/fatfooter.css`: footer compartido.
* `pages/`: estilos específicos de cada pantalla: `login.css`, `home.css` y `game.css`.

### JavaScript (`js/`)

* `data/`: consulta a la API (`api.js`) y datos de categorías (`categories.js`) y del juego destacado (`recommendation.js`).
* `components/`: funciones reutilizables: `layout.js` inserta los partials; `nav.js` controla los menús; `cards.js`, `carousel.js` y `hero-carousel.js` construyen las cards y carruseles.
* `pages/`: comportamiento propio de cada pantalla: `login.js`, `home.js` y `game-detail.js`.

### Recursos compartidos

* `partials/`: HTML reutilizable del header y footer, insertado por `js/components/layout.js`.
* `assets/`: imágenes y tipografías utilizadas por el sitio.
* `api-vj-interfaces-main/`: carpeta entregada por la cátedra; se conserva separada del código de la interfaz.

### Orden recomendado para estudiar la Home

1. `home.html` muestra la estructura y el orden de carga.
2. `js/data/api.js` transforma los datos de la API al formato de las cards.
3. `js/components/cards.js` construye cada card y `carousel.js` / `hero-carousel.js` las organizan.
4. `js/pages/home.js` coordina la carga, los carruseles y el carrito.
5. En `css/`, empezar por `base/variables.css`, seguir con `components/` y terminar con `pages/home.css`.
