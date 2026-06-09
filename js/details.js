import { bring } from "./fetch.js";

const saveKey = "orderDraft";

// =========================
// REVEAL ANIMATION
// =========================

const revealSections =
    document.querySelectorAll(".order-section, .order-header");

const revealObserver =
    new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("show-order");
            }

        });

    }, {
        threshold: 0.12
    });

revealSections.forEach((section, index) => {

    section.style.transitionDelay =
        `${index * 0.08}s`;

    revealObserver.observe(section);

});

// =========================
// SAME AS CUSTOMER
// =========================

const customerInputs =
    document.querySelectorAll(
        ".order-section:first-of-type input"
    );

const sameCustomerCheckboxes =
    document.querySelectorAll(".same-customer");

sameCustomerCheckboxes.forEach(check => {

    check.addEventListener("change", () => {

        const target =
            check.dataset.target;

        const targetFields =
            document.querySelectorAll(
                `.${target}-fields input`
            );

        if (check.checked) {

            targetFields.forEach((input, index) => {

                input.value =
                    customerInputs[index].value;

                input.setAttribute(
                    "readonly",
                    true
                );

            });

        } else {

            targetFields.forEach(input => {

                input.removeAttribute(
                    "readonly"
                );

                input.value = "";

            });

        }

        saveOrderData();

    });

});

// =========================
// NOTES TOGGLE
// =========================

const notesCheckboxes =
    document.querySelectorAll(".notes-check");

notesCheckboxes.forEach(check => {

    check.addEventListener("change", () => {

        const target =
            document.querySelector(
                `#${check.dataset.target}`
            );

        if (!target) return;

        target.classList.toggle(
            "active",
            check.checked
        );

        saveOrderData();

    });

});

// =========================
// INPUT FOCUS GLOW
// =========================

const formInputs =
    document.querySelectorAll(
        ".order-form input, .notes-area"
    );

formInputs.forEach(input => {

    input.addEventListener("input", () => {
        saveOrderData();
    });

});

// =========================
// BUTTON EFFECT
// =========================

const orderForm = document.querySelector(".order-form");
const nextBtn = document.querySelector(".next-btn");

function cleanFieldValue(formData, key) {
    return String(formData.get(key) || "").trim();
}

orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(orderForm);

    const orderDetails = {
        customerFullName: cleanFieldValue(formData, "customerFullName"),
        customerEmail: cleanFieldValue(formData, "customerEmail"),
        customerPhone: cleanFieldValue(formData, "customerPhone"),

        collectionFullName: cleanFieldValue(formData, "collectionFullName"),
        collectionEmail: cleanFieldValue(formData, "collectionEmail"),
        collectionPhone: cleanFieldValue(formData, "collectionPhone"),

        deliveryFullName: cleanFieldValue(formData, "deliveryFullName"),
        deliveryEmail: cleanFieldValue(formData, "deliveryEmail"),
        deliveryPhone: cleanFieldValue(formData, "deliveryPhone"),

        collectionNotes: document.getElementById("collection-notes").value.trim(),
        deliveryNotes: document.getElementById("delivery-notes").value.trim()
    };

    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));

    try {
        nextBtn.innerHTML = "Saving...";
        nextBtn.style.opacity = "0.85";

        const customer = await bring("/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: orderDetails.customerFullName,
                email: orderDetails.customerEmail,
                phone: orderDetails.customerPhone
            })
        });

        localStorage.setItem("customerId", customer.id);

        window.location.href = "checkout.html";
} catch (error) {
    console.error("Customer save failed:", error);
    alert(error.message || "Could not save customer details.");
    nextBtn.innerHTML = "Continue";
    nextBtn.style.opacity = "1";
}
});

// =========================
// SAVE DATA
// =========================

function saveOrderData() {

    const data = {};

    document.querySelectorAll(
        ".order-form input, .notes-area"
    ).forEach((field, index) => {

        if (field.type === "checkbox") {

            data[`field_${index}`] = field.checked;

        } else {

            data[`field_${index}`] = field.value;

        }

    });

    localStorage.setItem(
        saveKey,
        JSON.stringify(data)
    );

}

// =========================
// CLEAN DATA
// =========================

function cleanDetailsInputs() {
    localStorage.removeItem(saveKey);
    localStorage.removeItem("orderDetails");
    localStorage.removeItem("customerId");

    orderForm?.reset();

    document.querySelectorAll(".order-form input").forEach(input => {
        input.removeAttribute("readonly");
        input.setAttribute("autocomplete", "off");

        if (input.type === "checkbox") {
            input.checked = false;
            input.defaultChecked = false;
            return;
        }

        input.value = "";
        input.defaultValue = "";
    });

    document.querySelectorAll(".notes-area").forEach(area => {
        area.value = "";
        area.defaultValue = "";
        area.classList.remove("active");
        area.setAttribute("autocomplete", "off");
    });
}

cleanDetailsInputs();
requestAnimationFrame(cleanDetailsInputs);

window.addEventListener("pageshow", event => {
    if (event.persisted) {
        cleanDetailsInputs();
    }
});

// =========================
// SHOW ANIMATION CLASS
// =========================

document.querySelectorAll(
    ".order-section, .order-header"
).forEach(el => {

    el.style.opacity = "0";
    el.style.transform =
        "translateY(40px)";
    el.style.transition =
        "0.8s ease";

});

document.addEventListener(
    "scroll",
    () => {

        document.querySelectorAll(
            ".order-section, .order-header"
        ).forEach(el => {

            const top =
                el.getBoundingClientRect().top;

            if (top < window.innerHeight - 80) {

                el.classList.add(
                    "show-order"
                );

            }

        });

    }
);

// =========================
// SHOW CLASS CSS SUPPORT
// =========================

const style =
    document.createElement("style");

style.innerHTML = `
.show-order{
    opacity:1 !important;
    transform:translateY(0) !important;
}
`;

document.head.appendChild(style);
