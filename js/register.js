document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  alert("Account created successfully 🚀");
});


const html = document.documentElement;

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