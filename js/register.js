import { showToast } from "./toast.js";

const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");

// =========================
// REGISTER FORM
// =========================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (password !== confirm) {
            showToast("Passwords do not match.", "error");
            return;
        }

        showToast("Account details look good. You can continue to sign in.", "success");
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
