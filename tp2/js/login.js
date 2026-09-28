const authBrand = document.getElementById('authBrand');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const successOverlay = document.getElementById('successOverlay');
const regPassword = document.getElementById('regPassword');
const confirmPassword = document.getElementById('confirmPassword');
const passwordError = document.getElementById('passwordError');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

// Evita el envío tradicional y lleva a la página principal.
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'home.html';
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

// --- Toggle mostrar/ocultar para los dos campos de contraseña del registro ---
document.getElementById('toggleRegPwd').addEventListener('click', () => {
    const input = document.getElementById('regPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
});
document.getElementById('toggleConfirmPwd').addEventListener('click', () => {
    const input = document.getElementById('confirmPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
});


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

    // Animación de registro exitoso
    successOverlay.classList.add('show');

    // Espera a que termine la animación de éxito antes de abrir Home.
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
});



