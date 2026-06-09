import { bring } from "./fetch.js";
import {
    calculateItemsSubtotal,
    calculatePlanQuote,
    formatMoney,
    loadCartItems
} from "./customerPricing.js";

const plansWrapper = document.getElementById("plansWrapper");

let cartItems = [];
let itemsSubtotal = 0;
let plansById = new Map();

window.addEventListener("DOMContentLoaded", () => {
    loadPlans();
});

plansWrapper?.addEventListener("click", (event) => {
    const toggleButton = event.target.closest("[data-plan-toggle]");
    const selectButton = event.target.closest("[data-plan-id]");
    const reloadButton = event.target.closest("[data-reload-plans]");

    if (toggleButton) {
        togglePlanDetails(toggleButton);
        return;
    }

    if (selectButton) {
        selectPlan(selectButton.dataset.planId);
        return;
    }

    if (reloadButton) {
        loadPlans();
    }
});

window.selectPlan = selectPlan;

async function loadPlans() {
    if (!plansWrapper) return;

    plansWrapper.innerHTML = `<div class="plans-state">Loading delivery plans...</div>`;

    try {
        const cart = readCart();
        const [plans, loadedCartItems] = await Promise.all([
            bring("/plans"),
            loadCartItems(bring, cart)
        ]);

        if (!Array.isArray(plans)) {
            throw new Error("Invalid plans response");
        }

        cartItems = loadedCartItems;
        itemsSubtotal = calculateItemsSubtotal(cartItems);
        plansById = new Map(plans.map(plan => [Number(plan.id), plan]));

        if (!plans.length) {
            plansWrapper.innerHTML = `<div class="plans-state">No delivery plans are available right now.</div>`;
            return;
        }

        plansWrapper.innerHTML = plans.map(renderPlanCard).join("");
        setupPlanAnimations();
    } catch (error) {
        console.error("Plans loading failed:", error);

        plansWrapper.innerHTML = `
            <div class="plans-state plans-state-error">
                <strong>Plans could not be loaded.</strong>
                <span>Please check the connection and try again.</span>
                <button type="button" data-reload-plans>Try again</button>
            </div>
        `;
    }
}

function selectPlan(planId) {
    const numericPlanId = Number(planId);
    const plan = plansById.get(numericPlanId);

    if (!plan) return;

    if (itemsSubtotal <= 0) {
        window.location.href = "booking.html";
        return;
    }

    const quote = calculatePlanQuote(itemsSubtotal, plan);

    localStorage.setItem("selectedPlanId", String(numericPlanId));
    localStorage.setItem("selectedPlanQuote", JSON.stringify({
        planId: numericPlanId,
        itemsSubtotal: quote.itemsSubtotal,
        planPercent: quote.planPercent,
        planFee: quote.planFee,
        total: quote.total
    }));
    localStorage.setItem("totalPrice", String(quote.total));

    window.location.href = "service.html";
}

function renderPlanCard(plan) {
    const planId = Number(plan.id);
    const quote = calculatePlanQuote(itemsSubtotal, plan);
    const percent = quote.planPercent.toFixed(2).replace(/\.00$/, "");
    const detailsId = `plan-details-${planId}`;
    const cardClasses = getPlanClasses(plan);
    const canSelect = itemsSubtotal > 0;

    return `
        <article class="${cardClasses}">
            ${plan.isPopular ? `<div class="popular-label">Most Popular</div>` : ""}

            <div class="plan-card-head">
                <h3>${escapeHtml(plan.name || "Delivery plan")}</h3>

                <div class="plan-price">
                    ${formatMoney(quote.total)}
                    <span class="plan-percent">Items + ${percent}%</span>
                </div>
            </div>

            <div class="plan-cost-breakdown" aria-label="Plan cost summary">
                <div>
                    <span>Items</span>
                    <strong>${formatMoney(quote.itemsSubtotal)}</strong>
                </div>
                <div>
                    <span>Plan increase</span>
                    <strong>${formatMoney(quote.planFee)}</strong>
                </div>
            </div>

            <div class="plan-dates">
                <div class="plan-date">
                    <span>Collection</span>
                    <strong>${escapeHtml(plan.collectionLabel || "Available soon")}</strong>
                </div>

                <div class="plan-date">
                    <span>Delivery</span>
                    <strong class="green">${escapeHtml(plan.deliveryLabel || "Available soon")}</strong>
                </div>
            </div>

            <ul class="plan-details" id="${detailsId}">
                ${renderDetail("Delivery timescale", plan.deliveryTime)}
                ${renderBooleanDetail("Exclusivity", plan.exclusivity)}
                ${renderBooleanDetail("Two men team", plan.twoMenTeam)}
                ${renderDetail("Careful protection", plan.carefulProtection)}
                ${renderDetail("Level of service", plan.levelOfService)}
                ${renderDetail("Damage cover", plan.damageCover)}
                ${renderDetail("Time slot", plan.timeSlot)}
                ${renderBooleanDetail("Real time tracking", plan.tracking)}
                ${renderBooleanDetail("SMS updates", plan.smsUpdates)}
            </ul>

            <div class="plan-card-actions">
                <button
                    class="more-details-btn"
                    type="button"
                    data-plan-toggle
                    aria-expanded="false"
                    aria-controls="${detailsId}">
                    See more
                </button>

                <button class="select-plan-btn" type="button" data-plan-id="${planId}">
                    ${canSelect ? "Select Plan" : "Select items first"}
                </button>
            </div>
        </article>
    `;
}

function renderDetail(label, value) {
    const displayValue = value ? escapeHtml(value) : "&mdash;";

    return `
        <li>
            <span>${label}</span>
            <b>${displayValue}</b>
        </li>
    `;
}

function renderBooleanDetail(label, value) {
    return `
        <li>
            <span>${label}</span>
            <b class="${value ? "yes" : "no"}">${value ? "Yes" : "No"}</b>
        </li>
    `;
}

function togglePlanDetails(button) {
    const card = button.closest(".plan-card");
    if (!card) return;

    const isOpen = card.classList.toggle("active");

    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "See less" : "See more";
}

function setupPlanAnimations() {
    const planCards = document.querySelectorAll(".plan-card");

    if (!("IntersectionObserver" in window)) {
        planCards.forEach(card => card.classList.add("show"));
        return;
    }

    const plansObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    planCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.06}s`;
        plansObserver.observe(card);
    });
}

function getPlanClasses(plan) {
    const classes = ["plan-card"];

    if (plan.isPopular) classes.push("featured");
    if (plan.styleClass) classes.push(String(plan.styleClass).replace(/[^\w-]/g, ""));

    return classes.join(" ");
}

function readCart() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        console.warn("Cart could not be parsed:", error);
        return [];
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}
