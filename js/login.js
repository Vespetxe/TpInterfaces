const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const successOverlay = document.getElementById('successOverlay');

showRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

showLogin.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'home.html';
});

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

    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
});