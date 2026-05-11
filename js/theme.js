const html = document.documentElement;

// =========================
// APPLY THEME IMMEDIATELY
// =========================

const savedTheme =
    localStorage.getItem("theme") || "dark";

html.setAttribute("data-theme", savedTheme);

// Prevent transition flash on load
html.classList.add("theme-preload");

// =========================
// DOM READY
// =========================

window.addEventListener("DOMContentLoaded", () => {

    const thumb =
        document.getElementById("themeThumb");

    const loader =
        document.getElementById("page-loader");

    // =========================
    // UPDATE ICON
    // =========================

    function updateThemeIcon(theme) {

        if (!thumb) return;

        thumb.textContent =
            theme === "dark"
                ? "☀️"
                : "🌙";
    }

    updateThemeIcon(savedTheme);

    // =========================
    // TOGGLE THEME
    // =========================

    window.toggleTheme = function () {

        const currentTheme =
            html.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark"
                ? "light"
                : "dark";

        // smooth switch
        html.classList.add("theme-transition");

        html.setAttribute("data-theme", newTheme);

        localStorage.setItem("theme", newTheme);

        updateThemeIcon(newTheme);

        setTimeout(() => {

            html.classList.remove("theme-transition");

        }, 400);
    };

    // =========================
    // REMOVE PRELOAD CLASS
    // =========================

    requestAnimationFrame(() => {

        html.classList.remove("theme-preload");

    });

    // =========================
    // PAGE LOADER
    // =========================

    if (loader) {

        window.addEventListener("load", () => {

            setTimeout(() => {

                loader.style.opacity = "0";
                loader.style.visibility = "hidden";

                document.body.style.overflow = "visible";

            }, 1200);

        });
    }
});