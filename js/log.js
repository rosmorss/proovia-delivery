import { bring } from "./fetch.js";

const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer");
const loginForm = document.querySelector("#loginForm");

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



loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {};
    const formElements = loginForm.elements;
    for (let element of formElements) {
        if (element.tagName.toLowerCase() === "input") {
            console.log(element.name, element.value);
            body[element.name] = element.value;
        }
    }
    console.log(body);
    try {
        const response = await bring("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        console.log("RESPONSE:", response);

        window.location.href = "dashboard.html";
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Please check your credentials and try again.');
    }

});