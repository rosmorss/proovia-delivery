
const html = document.documentElement;
const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer"); 

window.addEventListener("DOMContentLoaded", () => {

    const thumb = document.getElementById("themeThumb");

    // =========================
    // LOAD SAVED THEME
    // =========================

    const savedTheme = localStorage.getItem("theme") || "dark";

    html.setAttribute("data-theme", savedTheme);

    updateThemeIcon(savedTheme);

    // =========================
    // TOGGLE THEME
    // =========================

    window.toggleTheme = function () {

        const currentTheme = html.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        html.setAttribute("data-theme", newTheme);

        localStorage.setItem("theme", newTheme);

        updateThemeIcon(newTheme);
    };

    // =========================
    // ICON UPDATE
    // =========================

    function updateThemeIcon(theme) {

        if (!thumb) return;

        thumb.textContent =
            theme === "dark"
                ? "☀️"
                : "🌙";
    }
});
 window.addEventListener("scroll", () => {

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