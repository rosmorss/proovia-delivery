
const html = document.documentElement;


window.addEventListener("DOMContentLoaded", () => {

    const thumb = document.getElementById("themeThumb");
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    const overlay = document.getElementById("mobile-overlay");
    const faqItems = document.querySelectorAll(".faq-item");
    const faqHeader = document.querySelector(".faq-header");
    const cta = document.querySelector(".floating-cta");
    const footer = document.querySelector("footer");


   
    const savedTheme = localStorage.getItem("theme") || "dark";

    html.setAttribute("data-theme", savedTheme);

    if (savedTheme === "light") {
        thumb.textContent = "🌙";
    } else {
        thumb.textContent = "☀️";
    }


    window.toggleTheme = function () {

        const currentTheme = html.getAttribute("data-theme");

        if (currentTheme === "dark") {

            html.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
            thumb.textContent = "🌙";

        } else {

            html.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            thumb.textContent = "☀️";
        }
    };


    window.addEventListener("load", () => {

        const loader = document.getElementById("page-loader");

        setTimeout(() => {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            document.body.style.overflow = "visible";

        }, 1200);

    });


    faqItems.forEach(item => {

        const question = item.querySelector(".faq-question");
        const icon = question.querySelector("span");

        question.addEventListener("click", () => {

            faqItems.forEach(otherItem => {

                if (otherItem !== item) {

                    otherItem.classList.remove("active");

                    const otherIcon =
                        otherItem.querySelector(".faq-question span");

                    otherIcon.textContent = "+";
                }
            });

            item.classList.toggle("active");

            if (item.classList.contains("active")) {
                icon.textContent = "−";
            } else {
                icon.textContent = "+";
            }
        });
    });


    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });


    hamburger.addEventListener("click", () => {

        hamburger.classList.toggle("open");
        mobileMenu.classList.toggle("open");
        overlay.classList.toggle("show");

    });

    overlay.addEventListener("click", () => {

        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open");
        overlay.classList.remove("show");

    });


    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("faq-show");
            }

        });

    }, {
        threshold: 0.15
    });

    faqItems.forEach(item => {
        observer.observe(item);
    });


    setTimeout(() => {

        faqHeader.style.opacity = "1";
        faqHeader.style.transform = "translateY(0)";

    }, 400);

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

    window.addEventListener("mousemove", (e) => {

        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        document.body.style.backgroundPosition =
            `${x * 10}px ${y * 10}px`;

    });

});

document.body.classList.add("page-loaded");

const revealElements = document.querySelectorAll(
    ".faq-item, .faq-header, .footer-col, .footer-brand"
);

const revealObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show-element");

        }

    });

}, {
    threshold: 0.12
});

revealElements.forEach((el, index) => {

    el.style.transitionDelay = `${index * 100}ms`;

    revealObserver.observe(el);

});