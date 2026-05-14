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

const nextBtn =
    document.querySelector(".next-btn");

if (nextBtn) {

    nextBtn.addEventListener("click", (e) => {

        e.preventDefault();

        nextBtn.innerHTML =
            "Saving...";

        nextBtn.style.opacity =
            "0.85";

        setTimeout(() => {

            nextBtn.innerHTML =
                "Continue";

            nextBtn.style.opacity =
                "1";

        }, 1200);

    });

}

// =========================
// SAVE DATA
// =========================

function saveOrderData() {

    const data = {};

    document.querySelectorAll(
        ".order-form input, .notes-area"
    ).forEach((field, index) => {

        if (field.type === "checkbox") {

            data[`field_${index}`] =
                field.checked;

        } else {

            data[`field_${index}`] =
                field.value;

        }

    });

    localStorage.setItem(
        "orderDetails",
        JSON.stringify(data)
    );

}

// =========================
// LOAD DATA
// =========================

function loadOrderData() {

    const saved =
        localStorage.getItem(
            "orderDetails"
        );

    if (!saved) return;

    const data =
        JSON.parse(saved);

    document.querySelectorAll(
        ".order-form input, .notes-area"
    ).forEach((field, index) => {

        const value =
            data[`field_${index}`];

        if (value === undefined) return;

        if (field.type === "checkbox") {

            field.checked = value;

            if (
                field.classList.contains(
                    "notes-check"
                )
            ) {

                const target =
                    document.querySelector(
                        `#${field.dataset.target}`
                    );

                if (target && value) {
                    target.classList.add(
                        "active"
                    );
                }

            }

        } else {

            field.value = value;

        }

    });

}

loadOrderData();

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