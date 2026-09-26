const hamburgerBtn = document.querySelector('.hamburger-btn');
const categoryMenu = document.getElementById('category-menu');
const categoryMenuBackdrop = document.querySelector('.category-menu-backdrop');
const categoryMenuList = document.getElementById('category-menu-list');

function setCategoryMenuOpen(isOpen) {
    if (!categoryMenu || !categoryMenuBackdrop || !hamburgerBtn) return;

    categoryMenu.hidden = !isOpen;
    categoryMenuBackdrop.hidden = !isOpen;
    hamburgerBtn.classList.toggle('active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    hamburgerBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('category-menu-open', isOpen);
}

if (hamburgerBtn) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.addEventListener('click', () => {
        if (!categoryMenu) {
            hamburgerBtn.classList.toggle('active');
            return;
        }
        setCategoryMenuOpen(categoryMenu.hidden);
    });
}

if (categoryMenuBackdrop) {
    categoryMenuBackdrop.addEventListener('click', () => setCategoryMenuOpen(false));
}

if (categoryMenu) {
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
    if (event.key === 'Escape' && categoryMenu && !categoryMenu.hidden) {
        setCategoryMenuOpen(false);
        hamburgerBtn?.focus();
    }
});

// La lista se arma desde los carruseles visibles para no ofrecer géneros vacíos.
function refreshCategoryMenu() {
    if (!categoryMenuList) return;

    const sections = document.querySelectorAll('#carousels .carousel');
    categoryMenuList.innerHTML = [...sections].map((section) => {
        const title = section.querySelector('.carousel__title')?.textContent?.trim();
        if (!title || !section.id) return '';
        return `<li><a href="#${section.id}">${title}</a></li>`;
    }).join('');
}
