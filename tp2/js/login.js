const authBrand = document.getElementById('authBrand');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const successOverlay = document.getElementById('successOverlay');
const successTitle = document.getElementById('successTitle');
const successMessage = document.getElementById('successMessage');
const regPassword = document.getElementById('regPassword');
const confirmPassword = document.getElementById('confirmPassword');
const passwordError = document.getElementById('passwordError');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Alterna la visibilidad de cada contraseña y sincroniza el icono y el estado accesible.
document.querySelectorAll('.toggle-password').forEach((button) => {
    const input = document.getElementById(button.dataset.target);
    if (!input) return;

    button.addEventListener('click', () => {
        const showPassword = input.type === 'password';
        input.type = showPassword ? 'text' : 'password';
        button.setAttribute('aria-pressed', String(showPassword));
        button.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
    });
});

// Muestra el aviso correspondiente y redirige a Home cuando termina su animación.
function showSuccessAndRedirect(title, message) {
    successTitle.textContent = title;
    successMessage.textContent = message;
    successOverlay.classList.add('show');

    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
}

// Simula el acceso con un proveedor social y usa la misma confirmación que Sign in.
document.querySelectorAll('.btn-social').forEach((button) => {
    button.addEventListener('click', () => {
        showSuccessAndRedirect('Welcome back!', 'Taking you to Home...');
    });
});

// Cambia del formulario de inicio de sesión al de registro.
showRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authBrand.style.display = 'none';
});

// Vuelve del formulario de registro al de inicio de sesión.
showLogin.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    authBrand.style.display = 'block';
});

// Evita el envío tradicional y muestra una confirmación antes de ir a Home.
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccessAndRedirect('Welcome back!', 'Taking you to Home...');
});

// --- Poblar los selects de fecha de nacimiento ---
const dobYear = document.getElementById('dobYear');
const dobMonth = document.getElementById('dobMonth');
const dobDay = document.getElementById('dobDay');

function fillSelect(select, placeholder, values) {
    select.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
        values.map(v => `<option value="${v}">${v}</option>`).join('');
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
fillSelect(dobYear, 'Year', years);
fillSelect(dobMonth, 'Month', ['January','February','March','April','May','June','July','August','September','October','November','December']);
fillSelect(dobDay, 'Day', Array.from({ length: 31 }, (_, i) => i + 1));

// --- Checkmarks de validación para todos los campos requeridos ---
function toggleCheck(id, condition) {
    const check = document.getElementById(id);
    if (check) check.classList.toggle('show', condition);
}

// Email
function checkEmail() {
    toggleCheck('emailCheck', emailPattern.test(regEmail.value));
}
regEmail.addEventListener('input', checkEmail);
regEmail.addEventListener('change', checkEmail);
regEmail.addEventListener('blur', checkEmail);

// First name / Last name: válido con solo que no esté vacío
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');

function checkFirstName() {
    toggleCheck('firstNameCheck', firstName.value.trim().length > 0);
}
firstName.addEventListener('input', checkFirstName);
firstName.addEventListener('change', checkFirstName);
firstName.addEventListener('blur', checkFirstName);

function checkLastName() {
    toggleCheck('lastNameCheck', lastName.value.trim().length > 0);
}
lastName.addEventListener('input', checkLastName);
lastName.addEventListener('change', checkLastName);
lastName.addEventListener('blur', checkLastName);

// Password: válida a partir de 8 caracteres
regPassword.addEventListener('input', () => {
    toggleCheck('passwordCheck', regPassword.value.length >= 8);
});

// Confirm password: válido cuando coincide y no está vacío
confirmPassword.addEventListener('input', () => {
    toggleCheck('confirmCheck', confirmPassword.value.length > 0 && confirmPassword.value === regPassword.value);
});

// Date of birth: válido cuando los 3 selects tienen un valor elegido
function checkDobComplete() {
    toggleCheck('dobCheck', dobYear.value && dobMonth.value && dobDay.value);
}
dobYear.addEventListener('change', checkDobComplete);
dobMonth.addEventListener('change', checkDobComplete);
dobDay.addEventListener('change', checkDobComplete);

function checkPasswordMatch() {
    const mismatch = confirmPassword.value.length > 0 && regPassword.value !== confirmPassword.value;
    confirmPassword.classList.toggle('input-error', mismatch);
    passwordError.classList.toggle('show', mismatch);
}

regPassword.addEventListener('input', checkPasswordMatch);
confirmPassword.addEventListener('input', checkPasswordMatch);

// Comprueba que ambas contraseñas coincidan y muestra la confirmación de registro.
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    checkPasswordMatch(); // por si el usuario nunca tocó el campo de confirmación

    if (regPassword.value !== confirmPassword.value) {
        return; // el borde rojo y el mensaje ya están visibles, no hace falta el alert
    }

    // Reutiliza el mismo aviso visual que se muestra al iniciar sesión.
    showSuccessAndRedirect('Account created!', 'Taking you to Home...');
});



