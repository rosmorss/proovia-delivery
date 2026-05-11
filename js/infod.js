const reveals = document.querySelectorAll(
  ".card, .step, .info-box, .apply-section, .section-header"
);
const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");  
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

window.addEventListener("load", () => {
  const hero = document.querySelector(".hero-content");
  if (!hero) return;

  hero.style.opacity = "0";
  hero.style.transform = "translateY(40px)";

  setTimeout(() => {
    hero.style.transition = "all 1s ease";
    hero.style.opacity = "1";
    hero.style.transform = "translateY(0)";
  }, 300);
});
const buttons = document.querySelectorAll(".btn-primary, .btn-outline");

buttons.forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const circle = document.createElement("span");
    const diameter = Math.max(this.clientWidth, this.clientHeight);

    circle.style.width = circle.style.height = diameter + "px";
    circle.style.left = e.offsetX - diameter / 2 + "px";
    circle.style.top = e.offsetY - diameter / 2 + "px";
    circle.classList.add("ripple");

    const ripple = this.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    this.appendChild(circle);
  });
});
const steps = document.querySelectorAll(".step");

steps.forEach((step) => {
  step.addEventListener("mouseenter", () => {
    step.style.transform = "translateY(-8px) scale(1.03)";
  });

  step.addEventListener("mouseleave", () => {
    step.style.transform = "translateY(0) scale(1)";
  });
});
const form = document.querySelector(".apply-form");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const button = form.querySelector("button");
    button.innerText = "Submitting...";
    button.disabled = true;

    setTimeout(() => {
      button.innerText = "Application Sent ✅";
      button.style.background = "#22c55e";
    }, 1200);
  });
}

document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("#apply")?.scrollIntoView({
      behavior: "smooth",
    });
  });
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