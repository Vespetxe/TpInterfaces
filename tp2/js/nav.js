const hamburgerBtn = document.querySelector('.hamburger-btn');
const categoryMenu = document.getElementById('category-menu');
const categoryMenuBackdrop = document.querySelector('.category-menu-backdrop');
const categoryMenuList = document.getElementById('category-menu-list');

// Abre o cierra el menú de categorías y sincroniza su estado visual y accesible.
function setCategoryMenuOpen(isOpen) {
    if (!categoryMenu || !categoryMenuBackdrop || !hamburgerBtn) return;

    categoryMenu.hidden = !isOpen;
    categoryMenuBackdrop.hidden = !isOpen;
    hamburgerBtn.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    hamburgerBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('category-menu-open', isOpen);

    // Coordina el menú lateral con los demás desplegables del header.
    if (isOpen) {
        document.dispatchEvent(new CustomEvent('site:dropdown-open', { detail: { name: 'categories' } }));
    }
}

// Al abrir un panel, cierra los otros para evitar que queden superpuestos.
document.addEventListener('site:dropdown-open', (event) => {
    const openedMenu = event.detail?.name;
    if (openedMenu !== 'categories' && categoryMenu && !categoryMenu.hidden) {
        setCategoryMenuOpen(false);
    }

    const profileMenu = document.getElementById('profileMenu');
    if (openedMenu !== 'profile' && profileMenu) profileMenu.hidden = true;
});

if (hamburgerBtn) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    // Alterna el menú de categorías al pulsar el botón hamburguesa.
    hamburgerBtn.addEventListener('click', () => {
        if (!categoryMenu) {
            hamburgerBtn.classList.toggle('active');
            return;
        }
        setCategoryMenuOpen(categoryMenu.hidden);
    });
}

if (categoryMenuBackdrop) {
    // Cierra el menú cuando se pulsa el fondo que lo cubre.
    categoryMenuBackdrop.addEventListener('click', () => setCategoryMenuOpen(false));
}

if (categoryMenu) {
    // Cierra el menú y desplaza la página hasta la categoría elegida.
    categoryMenu.addEventListener('click', (event) => {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        event.preventDefault();
        setCategoryMenuOpen(false);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

document.addEventListener('keydown', (event) => {
    // Permite cerrar el menú con Escape y devuelve el foco al botón.
    if (event.key === 'Escape' && categoryMenu && !categoryMenu.hidden) {
        setCategoryMenuOpen(false);
        hamburgerBtn?.focus();
    }
});

// Arma los enlaces del menú desde los carruseles visibles para no ofrecer géneros vacíos.
function refreshCategoryMenu() {
    if (!categoryMenuList) return;

    const sections = document.querySelectorAll('#carousels .carousel');
    // Convierte cada carrusel con título e ID en un enlace del menú.
    categoryMenuList.innerHTML = [...sections].map((section) => {
        const title = section.querySelector('.carousel__title')?.textContent?.trim();
        if (!title || !section.id) return '';
        return `<li><a href="#${section.id}">${title}</a></li>`;
    }).join('');
}
// barra lateral desplegable menu perfil
// Configura el menú del perfil: lo abre con el avatar y lo cierra al salir o con Escape.
(() => {
    const avatarBtn = document.querySelector('.avatar-btn');
    const profileMenu = document.getElementById('profileMenu');
    if (!avatarBtn || !profileMenu) return;

    // Evita que el clic en el avatar se interprete también como clic fuera del menú.
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const shouldOpen = profileMenu.hidden;
        if (shouldOpen) {
            document.dispatchEvent(new CustomEvent('site:dropdown-open', { detail: { name: 'profile' } }));
        }
        profileMenu.hidden = shouldOpen ? false : true;
    });

    // Cierra el menú cuando se pulsa fuera de él.
    document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target)) profileMenu.hidden = true;
    });
    // Oculta el menú del perfil cuando se presiona Escape.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') profileMenu.hidden = true;
    });
})();

document.addEventListener('site:layout-ready', refreshCategoryMenu);

