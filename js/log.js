const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");

// =========================
// FLOATING CTA
// =========================

window.addEventListener("scroll", () => {

    if (!footer || !cta) return;

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