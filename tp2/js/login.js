const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const successOverlay = document.getElementById('successOverlay');

// Cambia del formulario de inicio de sesión al de registro.
showRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

// Vuelve del formulario de registro al de inicio de sesión.
showLogin.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Evita el envío tradicional y lleva a la página principal.
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'home.html';
});

// Comprueba que ambas contraseñas coincidan y muestra la confirmación de registro.
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Animación de registro exitoso
    successOverlay.classList.add('show');

    // Espera a que termine la animación de éxito antes de abrir Home.
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
});
