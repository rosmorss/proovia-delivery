
const revealCards = document.querySelectorAll(".terms-card");
const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");    
const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }

    });

},{
    threshold: 0.15
});

revealCards.forEach(card => {
    observer.observe(card);
});

const sidebarLinks = document.querySelectorAll(".sidebar-card a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const target = document.querySelector(
            link.getAttribute("href")
        );

        target.scrollIntoView({
            behavior: "smooth"
        });

    });

});

window.addEventListener("mousemove", (e) => {

    const glow1 = document.querySelector(".glow-1");
    const glow2 = document.querySelector(".glow-2");

    let x = e.clientX / window.innerWidth;
    let y = e.clientY / window.innerHeight;

    glow1.style.transform =
        `translate(${x * 40}px, ${y * 40}px)`;

    glow2.style.transform =
        `translate(${-x * 40}px, ${-y * 40}px)`;

});

window.addEventListener("scroll", () => {

    let sections = document.querySelectorAll(".terms-card");

    sections.forEach(section => {

        let top = window.scrollY;
        let offset = section.offsetTop - 200;
        let height = section.offsetHeight;
        let id = section.getAttribute("id");

        if(top >= offset && top < offset + height){

            sidebarLinks.forEach(link => {
                link.classList.remove("active");
            });

            const activeLink = document.querySelector(
                `.sidebar-card a[href="#${id}"]`
            );

            if(activeLink){
                activeLink.classList.add("active");
            }
        }

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