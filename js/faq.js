const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const overlay = document.getElementById("mobile-overlay");

const faqItems = document.querySelectorAll(".faq-item");
const faqHeader = document.querySelector(".faq-header");

const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");

window.addEventListener("DOMContentLoaded", () => {

    // =========================
    // FAQ ACCORDION
    // =========================

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

            icon.textContent =
                item.classList.contains("active")
                    ? "−"
                    : "+";
        });
    });

    // =========================
    // NAVBAR SCROLL
    // =========================

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });

    // =========================
    // MOBILE MENU
    // =========================

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

    // =========================
    // FAQ HEADER ANIMATION
    // =========================

    setTimeout(() => {

        faqHeader.style.opacity = "1";
        faqHeader.style.transform = "translateY(0)";

    }, 250);

    // =========================
    // FLOATING CTA
    // =========================

    window.addEventListener("scroll", () => {

        if (!footer || !cta) return;

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

    // =========================
    // PARALLAX EFFECT
    // =========================

    window.addEventListener("mousemove", (e) => {

        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        document.body.style.backgroundPosition =
            `${x * 10}px ${y * 10}px`;

    });

});

// =========================
// PAGE LOADED
// =========================

document.body.classList.add("page-loaded");

// =========================
// REVEAL ANIMATION
// =========================

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
    threshold: 0.08
});

revealElements.forEach((el, index) => {

    el.style.transitionDelay = `${index * 60}ms`;

    revealObserver.observe(el);

});