// ===== Carga del layout compartido =====
// Inserta el header y el footer compartidos y avisa cuando la navegación está lista.
(async function loadSharedLayout() {
    const headerMount = document.getElementById("site-header");
    const footerMount = document.getElementById("site-footer");

    try {
        const [headerResponse, footerResponse] = await Promise.all([
            fetch("partials/header.html"),
            fetch("partials/footer.html"),
        ]);

        if (!headerResponse.ok || !footerResponse.ok) {
            throw new Error("No se pudieron cargar el encabezado o el footer.");
        }

        if (headerMount) headerMount.innerHTML = await headerResponse.text();
        if (footerMount) footerMount.innerHTML = await footerResponse.text();

        const navScript = document.createElement("script");
        navScript.src = "js/components/nav.js";
        // Notifica al resto de scripts cuando nav.js ya pudo inicializarse.
        navScript.onload = () => {
            window.siteLayoutReady = true;
            document.dispatchEvent(new Event("site:layout-ready"));
        };
        document.body.appendChild(navScript);
    } catch (error) {
        console.error("Error al cargar los elementos compartidos:", error);
    }
})();
