import { showToast } from "./toast.js";
import {
    attachEmailValidation,
    attachNameValidation,
    validateEmailField,
    validateNameField
} from "./validation.js";

const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");

// =========================
// REGISTER FORM
// =========================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    attachEmailValidation(registerForm, showToast);
    attachNameValidation(registerForm, showToast);

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullName = registerForm.querySelector('[name="fullName"]');
        const email = registerForm.querySelector('input[type="email"]');
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (!validateNameField(fullName, showToast)) {
            return;
        }

        if (!validateEmailField(email, showToast)) {
            return;
        }

        if (password.length < 8) {
            showToast("Password must contain at least 8 characters.", "error");
            return;
        }

        if (password !== confirm) {
            showToast("Passwords do not match.", "error");
            return;
        }

        showToast("Account details look good. You can continue to sign in.", "success", { duration: 1200 });

        setTimeout(() => {
            window.location.href = "log.html";
        }, 700);
    });
}

// =========================
// FLOATING CTA HIDE
// =========================

window.addEventListener("scroll", () => {
    if (!cta || !footer) return;

    const footerTop = footer.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (footerTop < screenHeight - 100) {
        cta.style.opacity = "0";
        cta.style.pointerEvents = "none";
        cta.style.transform = "translateY(20px)";
    } else {
        cta.style.opacity = "1";
        cta.style.pointerEvents = "auto";
        cta.style.transform = "translateY(0)";
    }
});
