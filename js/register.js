const html = document.documentElement;

const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");

// =========================
// REGISTER FORM
// =========================

document.getElementById("registerForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const password =
        document.getElementById("password").value;

    const confirm =
        document.getElementById("confirmPassword").value;

    if (password !== confirm) {

        alert("Passwords do not match!");
        return;
    }

    alert("Account created successfully 🚀");
});

// =========================
// THEME
// =========================

window.addEventListener("DOMContentLoaded", () => {

    const thumb = document.getElementById("themeThumb");

    const savedTheme =
        localStorage.getItem("theme") || "dark";

    html.setAttribute("data-theme", savedTheme);

    updateThemeIcon(savedTheme);

    window.toggleTheme = function () {

        const currentTheme =
            html.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        html.setAttribute("data-theme", newTheme);

        localStorage.setItem("theme", newTheme);

        updateThemeIcon(newTheme);
    };

    function updateThemeIcon(theme) {

        if (!thumb) return;

        thumb.textContent =
            theme === "dark"
                ? "☀️"
                : "🌙";
    }
});

// =========================
// FLOATING CTA HIDE
// =========================

window.addEventListener("scroll", () => {

    if (!cta || !footer) return;

    const footerTop =
        footer.getBoundingClientRect().top;

    const screenHeight =
        window.innerHeight;

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