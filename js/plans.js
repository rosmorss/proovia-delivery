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

window.addEventListener("DOMContentLoaded", async () => {
    await loadPlans();
});


window.selectPlan = function (planId) {
    const plan = plansById.get(Number(planId));
    const quote = calculatePlanQuote(itemsSubtotal, plan);

    localStorage.setItem("selectedPlanId", planId);
    localStorage.setItem("selectedPlanQuote", JSON.stringify({
        planId: Number(planId),
        itemsSubtotal: quote.itemsSubtotal,
        planPercent: quote.planPercent,
        planFee: quote.planFee,
        total: quote.total
    }));
    localStorage.setItem("totalPrice", quote.total);

    window.location.href = "service.html";
}


async function loadPlans() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const [plans, loadedCartItems] = await Promise.all([
            bring("/plans"),
            loadCartItems(bring, cart)
        ]);

        plansWrapper.innerHTML = "";
        cartItems = loadedCartItems;
        itemsSubtotal = calculateItemsSubtotal(cartItems);
        plansById = new Map(plans.map(plan => [Number(plan.id), plan]));

        plans.forEach((plan) => {
            const quote = calculatePlanQuote(itemsSubtotal, plan);

            plansWrapper.innerHTML += `
                <div class="plan-card ${plan.isPopular ? "featured" : ""} ${plan.styleClass || ""}">
                    
                    ${plan.isPopular ? `<div class="popular-label">Most Popular</div>` : ""}

                    <h3>${plan.name}</h3>

                    <div class="plan-price">
                        ${formatMoney(quote.total)}
                        <span class="plan-percent">Items + ${quote.planPercent.toFixed(2).replace(/\.00$/, "")}%</span>
                    </div>

                    <div class="plan-cost-breakdown">
                        <div><span>Items</span><strong>${formatMoney(quote.itemsSubtotal)}</strong></div>
                        <div><span>Plan increase</span><strong>${formatMoney(quote.planFee)}</strong></div>
                    </div>

                    <div class="plan-date">
                        <span>Collection</span>
                        <strong>${plan.collectionLabel || "Available soon"}</strong>
                    </div>

                    <div class="plan-date">
                        <span>Delivery</span>
                        <strong class="green">${plan.deliveryLabel || "Available soon"}</strong>
                    </div>

                    <ul>
                        <li>
                            <span>Delivery timescale</span>
                            <b>${plan.deliveryTime || "—"}</b>
                        </li>

                        <li>
                            <span>Exclusivity</span>
                            <b class="${plan.exclusivity ? "yes" : "no"}">
                                ${plan.exclusivity ? "✓" : "—"}
                            </b>
                        </li>

                        <li>
                            <span>Two men team</span>
                            <b class="${plan.twoMenTeam ? "yes" : "no"}">
                                ${plan.twoMenTeam ? "✓" : "—"}
                            </b>
                        </li>

                        <li>
                            <span>Careful protection</span>
                            <b>${plan.carefulProtection || "—"}</b>
                        </li>

                        <li>
                            <span>Level of service</span>
                            <b>${plan.levelOfService || "—"}</b>
                        </li>

                        <li>
                            <span>Damage cover</span>
                            <b>${plan.damageCover || "—"}</b>
                        </li>

                        <li>
                            <span>Time slot</span>
                            <b>${plan.timeSlot || "—"}</b>
                        </li>

                        <li>
                            <span>Real time tracking</span>
                            <b class="${plan.tracking ? "yes" : "no"}">
                                ${plan.tracking ? "✓" : "—"}
                            </b>
                        </li>

                        <li>
                            <span>SMS updates</span>
                            <b class="${plan.smsUpdates ? "yes" : "no"}">
                                ${plan.smsUpdates ? "✓" : "—"}
                            </b>
                        </li>
                    </ul>

                    <button onclick="${itemsSubtotal > 0 ? `selectPlan(${plan.id})` : "window.location.href='booking.html'"}">
                        ${itemsSubtotal > 0 ? "Select Plan" : "Select items first"}
                    </button>

                    <button class="more-details-btn" type="button">
                        More details
                    </button>
                </div>
            `;
        });

        setupPlanButtons();
        setupPlanAnimations();

    } catch (error) {
        console.error("Plans loading failed:", error);
    }
}


function setupPlanButtons() {
    document.querySelectorAll(".more-details-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            btn.closest(".plan-card").classList.toggle("active");
        });
    });
}

function setupPlanAnimations() {
    const planCards = document.querySelectorAll(".plan-card");

    const plansObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, {
        threshold: 0.15
    });

    planCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.08}s`;
        plansObserver.observe(card);
    });
}
