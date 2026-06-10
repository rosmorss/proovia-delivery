let savedCollectionDate = localStorage.getItem("collectionDate");
let savedDeliveryDate = localStorage.getItem("deliveryDate");
import { bring } from "./fetch.js";
import { showToast } from "./toast.js";
import {
    calculateItemsSubtotal,
    calculatePlanQuote,
    formatMoney,
    loadCartItems
} from "./customerPricing.js";

const selectedPlanId = localStorage.getItem("selectedPlanId");
const cart = JSON.parse(localStorage.getItem("cart")) || [];

async function loadSelectedPlan() {
    if (!selectedPlanId) {
        showToast("Please select a delivery plan first.", "error");
        setTimeout(() => {
            window.location.href = "plans.html";
        }, 900);
        return;
    }

    const [plan, cartItems] = await Promise.all([
        bring(`/plans/${selectedPlanId}`),
        loadCartItems(bring, cart)
    ]);
    const itemsSubtotal = calculateItemsSubtotal(cartItems);
    const serviceDetails = JSON.parse(localStorage.getItem("serviceDetails")) || null;
    const quote = calculatePlanQuote(itemsSubtotal, plan, serviceDetails?.extraPrice || 0);

    document.getElementById("summaryPlanName").textContent = plan.name;
    document.getElementById("summaryPlanPrice").textContent = quote.planLabel.replace("Items + ", "");
    document.getElementById("summaryTotalPrice").textContent = formatMoney(quote.total);

    document.getElementById("summaryPlanDetails").innerHTML = `
        <li>Items subtotal ${formatMoney(quote.itemsSubtotal)}</li>
        <li>Plan increase ${formatMoney(quote.planFee)}</li>
        <li>Delivery timescale ${plan.deliveryTime || "—"}</li>
        <li>Two men team ${plan.twoMenTeam ? "✓" : "—"}</li>
        <li>Careful protection ${plan.carefulProtection || "—"}</li>
        <li>Level of service ${plan.levelOfService || "—"}</li>
        <li>Damage cover ${plan.damageCover || "—"}</li>
        <li>Time slot ${plan.timeSlot || "—"}</li>
        <li>Tracking ${plan.tracking ? "Real time tracking" : "—"}</li>
        <li>SMS updates ${plan.smsUpdates ? "✓" : "—"}</li>
    `;

    localStorage.setItem("selectedPlanQuote", JSON.stringify(quote));
    localStorage.setItem("totalPrice", quote.total);
}

loadSelectedPlan();
let collectionDate = savedCollectionDate
    ? new Date(savedCollectionDate)
    : new Date();

let deliveryDate = savedDeliveryDate
    ? new Date(savedDeliveryDate)
    : new Date();

if (!savedDeliveryDate) {
    deliveryDate.setDate(collectionDate.getDate() + 1);
}
let collectionViewDate = new Date(collectionDate);
let deliveryViewDate = new Date(deliveryDate);
// =========================
// REVEAL ANIMATION
// =========================

const revealProgram =
    document.querySelectorAll(".reveal-program");

const revealObserver =
    new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }

        });

    }, {
        threshold: 0.12
    });

revealProgram.forEach((card, index) => {

    card.style.transitionDelay =
        `${index * 0.08}s`;

    revealObserver.observe(card);

});

// =========================

// CHOICE BUTTONS
// =========================

const choiceGroups =
    document.querySelectorAll(".choice-group");

choiceGroups.forEach(group => {

    const buttons =
        group.querySelectorAll(".choice-btn");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

        });

    });

});

// =========================
// CONTINUE BUTTON EFFECT
// =========================

const continueBtn = document.querySelector(".continue-btn");

function saveDatesToLocalStorage() {
    localStorage.setItem("collectionDate", collectionDate.toISOString());
    localStorage.setItem("deliveryDate", deliveryDate.toISOString());
}

if (continueBtn) {
    continueBtn.addEventListener("click", (e) => {
        e.preventDefault();

        saveProgramDetails();
        saveDatesToLocalStorage();

        continueBtn.innerHTML = "Loading...";
        continueBtn.style.opacity = "0.85";

        setTimeout(() => {
            window.location.href = "checkout.html";
        }, 500);
    });
}

// =========================
// ROUTE CARD HOVER GLOW
// =========================

const routeCard =
    document.querySelector(".route-card");

if (routeCard) {

    routeCard.addEventListener("mousemove", (e) => {

        const rect =
            routeCard.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const y =
            e.clientY - rect.top;

        routeCard.style.background =
            `
            radial-gradient(
                circle at ${x}px ${y}px,
                rgba(178,34,34,0.10),
                transparent 45%
            ),
            var(--card-bg)
            `;

    });

    routeCard.addEventListener("mouseleave", () => {

        routeCard.style.background =
            "var(--card-bg)";

    });

}

// =========================
// SELECT ANIMATION
// =========================

const selects =
    document.querySelectorAll("select");

selects.forEach(select => {

    select.addEventListener("change", () => {

        select.style.transform =
            "scale(1.03)";

        setTimeout(() => {

            select.style.transform =
                "scale(1)";

        }, 180);

    });

});

const changeDatesBtn = document.querySelector(".route-line a");
const datesModal = document.querySelector("#datesModal");
const cancelDatesBtn = document.querySelector(".cancel-dates");
const saveDatesBtn = document.querySelector(".save-dates");
const datesOverlay = document.querySelector(".dates-overlay");

const collectionDateText = document.querySelector(
    ".route-point:first-child .route-box strong"
);

const deliveryDateText = document.querySelector(
    ".route-point:last-child .route-box strong"
);

const collectionCalendar = document.querySelector("#collectionCalendar");
const deliveryCalendar = document.querySelector("#deliveryCalendar");

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatDate(date) {
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDate(a, b) {
    return (
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    );
}

function renderCalendar(container, viewDate, selectedDate, type) {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();

    startDay = startDay === 0 ? 6 : startDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = `
        <div class="calendar-head">
            <button class="calendar-prev" data-type="${type}">‹</button>
            <span>${months[month]} ${year}</span>
            <button class="calendar-next" data-type="${type}">›</button>
        </div>

        <div class="calendar-grid days">
            ${weekDays.map(day => `<span>${day}</span>`).join("")}
        </div>

        <div class="calendar-grid calendar-dates">
    `;

    for (let i = startDay - 1; i >= 0; i--) {
        html += `<span class="muted">${daysInPrevMonth - i}</span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const active = isSameDate(currentDate, selectedDate)
            ? type === "collection"
                ? "active-orange"
                : "active-green"
            : "";

        html += `
            <button 
                class="date-btn ${active}" 
                data-type="${type}"
                data-day="${day}"
                data-month="${month}"
                data-year="${year}">
                ${day}
            </button>
        `;
    }

    const totalCells = startDay + daysInMonth;
    const nextDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    for (let i = 1; i <= nextDays; i++) {
        html += `<span class="muted">${i}</span>`;
    }

    html += `</div>`;

    container.innerHTML = html;
}

function renderAllCalendars() {
    renderCalendar(
        collectionCalendar,
        collectionViewDate,
        collectionDate,
        "collection"
    );

    renderCalendar(
        deliveryCalendar,
        deliveryViewDate,
        deliveryDate,
        "delivery"
    );
}

renderAllCalendars();
collectionDateText.textContent = formatDate(collectionDate);
deliveryDateText.textContent = formatDate(deliveryDate);

changeDatesBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    datesModal.classList.add("active");
});

function closeDatesModal() {
    datesModal.classList.remove("active");
}

cancelDatesBtn?.addEventListener("click", closeDatesModal);
datesOverlay?.addEventListener("click", closeDatesModal);

document.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("calendar-prev")) {
        const type = target.dataset.type;

        if (type === "collection") {
            collectionViewDate.setMonth(collectionViewDate.getMonth() - 1);
        } else {
            deliveryViewDate.setMonth(deliveryViewDate.getMonth() - 1);
        }

        renderAllCalendars();
    }

    if (target.classList.contains("calendar-next")) {
        const type = target.dataset.type;

        if (type === "collection") {
            collectionViewDate.setMonth(collectionViewDate.getMonth() + 1);
        } else {
            deliveryViewDate.setMonth(deliveryViewDate.getMonth() + 1);
        }

        renderAllCalendars();
    }

    if (target.classList.contains("date-btn")) {
        const type = target.dataset.type;
        const day = Number(target.dataset.day);
        const month = Number(target.dataset.month);
        const year = Number(target.dataset.year);

        if (type === "collection") {
            collectionDate = new Date(year, month, day);

            deliveryDate = new Date(collectionDate);
            deliveryDate.setDate(collectionDate.getDate() + 1);

            deliveryViewDate = new Date(deliveryDate);
        }

        if (type === "delivery") {
            const selectedDelivery = new Date(year, month, day);

            if (selectedDelivery > collectionDate) {
                deliveryDate = selectedDelivery;
            }
        }

        renderAllCalendars();
        collectionDateText.textContent = formatDate(collectionDate);
        deliveryDateText.textContent = formatDate(deliveryDate);
    }
});

saveDatesBtn.addEventListener("click", () => {
    collectionDateText.textContent = formatDate(collectionDate);
    deliveryDateText.textContent = formatDate(deliveryDate);


    localStorage.setItem("collectionDate", collectionDate.toISOString());
    localStorage.setItem("deliveryDate", deliveryDate.toISOString());

    closeDatesModal();
});
// =========================
// SAVE FORM DETAILS
// =========================

const saveKey = "programDetails";

function saveProgramDetails() {
    const data = {};

    document.querySelectorAll(".details-card").forEach((card, cardIndex) => {
        data[`card_${cardIndex}`] = {
            buttons: [],
            selects: []
        };

        card.querySelectorAll(".choice-group").forEach((group, groupIndex) => {
            const activeBtn = group.querySelector(".choice-btn.active");

            data[`card_${cardIndex}`].buttons[groupIndex] =
                activeBtn ? activeBtn.textContent.trim() : null;
        });

        card.querySelectorAll("select").forEach((select, selectIndex) => {
            data[`card_${cardIndex}`].selects[selectIndex] =
                select.value;
        });
    });

    if (!savedCollectionDate || !savedDeliveryDate) {
        localStorage.setItem("collectionDate", collectionDate.toISOString());
        localStorage.setItem("deliveryDate", deliveryDate.toISOString());
    }

    localStorage.setItem(saveKey, JSON.stringify(data));
}

function loadProgramDetails() {
    const saved = localStorage.getItem(saveKey);

    if (!saved) return;

    const data = JSON.parse(saved);

    document.querySelectorAll(".details-card").forEach((card, cardIndex) => {
        const cardData = data[`card_${cardIndex}`];

        if (!cardData) return;

        card.querySelectorAll(".choice-group").forEach((group, groupIndex) => {
            const savedText = cardData.buttons[groupIndex];

            if (!savedText) return;

            group.querySelectorAll(".choice-btn").forEach(btn => {
                btn.classList.remove("active");

                if (btn.textContent.trim() === savedText) {
                    btn.classList.add("active");
                }
            });
        });

        card.querySelectorAll("select").forEach((select, selectIndex) => {
            const savedValue = cardData.selects[selectIndex];

            if (savedValue) {
                select.value = savedValue;
            }
        });
    });
}

loadProgramDetails();

document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", saveProgramDetails);
});

document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", saveProgramDetails);
});
const summaryToggle = document.querySelector(".summary-toggle");
const summaryList = document.querySelector(".summary-list");

if (summaryToggle && summaryList) {
    summaryToggle.addEventListener("click", () => {
        summaryList.classList.toggle("summary-hidden");
        summaryList.classList.toggle("summary-open");

        const isOpen = summaryList.classList.contains("summary-open");

        summaryToggle.firstChild.textContent = isOpen
            ? "Hide details "
            : "See all details ";

        summaryToggle.querySelector("span").textContent = isOpen ? "−" : "+";
    });
}
document.querySelectorAll(".floor-options").forEach(group => {
    const buttons = group.querySelectorAll(".floor-btn");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });
});
