import { bring } from "./fetch.js";
import { showToast } from "./toast.js";
import {
    attachEmailValidation,
    clearFieldError,
    showFieldError,
    validateEmailField
} from "./validation.js";

const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");

// =========================
// REGISTER FORM
// =========================

const registerForm = document.getElementById("registerForm");
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

if (registerForm) {
    attachEmailValidation(registerForm, showToast);

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!validateRegisterForm()) {
            return;
        }

        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton?.textContent.trim() || "Create Account";
        const body = buildRegisterBody();

        setSubmitState(submitButton, true, "Creating account...");

        try {
            await bring("/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            showToast("Account created. You can sign in now.", "success", { duration: 1200 });

            setTimeout(() => {
                window.location.href = "log.html";
            }, 700);
        } catch (error) {
            console.error("Registration failed:", error);
            showToast(getRegisterErrorMessage(error), "error");
        } finally {
            setSubmitState(submitButton, false, originalText);
        }
    });
}

function buildRegisterBody() {
    const body = {};

    Array.from(registerForm.elements).forEach(element => {
        if (element.tagName?.toLowerCase() === "input" && element.name) {
            body[element.name] = element.value.trim();
        }
    });

    return body;
}

function validateRegisterForm() {
    const username = registerForm.querySelector('[name="username"]');
    const email = registerForm.querySelector('[name="email"]');
    const password = registerForm.querySelector('[name="password"]');
    const confirmPassword = registerForm.querySelector('[name="confpassword"]');

    if (!validateRequiredField(username, "Please enter a username.")) {
        return false;
    }

    if (!validateEmailField(email, showToast)) {
        return false;
    }

    const passwordValue = password.value.trim();
    const confirmValue = confirmPassword.value.trim();

    if (!passwordPattern.test(passwordValue)) {
        const message = "Password must be at least 8 characters and include letters and numbers.";
        showFieldError(password, message);
        showToast(message, "error");
        password.focus();
        return false;
    }

    clearFieldError(password);

    if (passwordValue !== confirmValue) {
        const message = "Passwords do not match.";
        showFieldError(confirmPassword, message);
        showToast(message, "error");
        confirmPassword.focus();
        return false;
    }

    clearFieldError(confirmPassword);
    password.value = passwordValue;
    confirmPassword.value = confirmValue;

    return true;
}

function validateRequiredField(field, message) {
    if (field.value.trim()) {
        clearFieldError(field);
        return true;
    }

    showFieldError(field, message);
    showToast(message, "error");
    field.focus();
    return false;
}

function setSubmitState(button, isLoading, text) {
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = text;
}

function getRegisterErrorMessage(error) {
    const message = error?.message || "";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("unique") && lowerMessage.includes("email")) {
        return "This email address is already registered.";
    }

    if (lowerMessage.includes("unique") && lowerMessage.includes("username")) {
        return "This username is already taken.";
    }

    if (lowerMessage.includes("unique")) {
        return "This username or email is already registered.";
    }

    if (lowerMessage.includes("already registered") || lowerMessage.includes("already taken")) {
        return message;
    }

    if (lowerMessage.includes("invalid password")) {
        return "Password must be at least 8 characters and include letters and numbers.";
    }

    if (lowerMessage.includes("invalid email")) {
        return "Please enter a valid email address.";
    }

    if (message) {
        return message;
    }

    return "Registration failed. Please try again.";
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
