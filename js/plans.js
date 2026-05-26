import { bring } from "./fetch.js";

const plansWrapper = document.getElementById("plansWrapper");

window.addEventListener("DOMContentLoaded", async () => {
    await loadPlans();
});

async function loadPlans() {
    try {
        const plans = await bring("/plans");

        plansWrapper.innerHTML = "";

        plans.forEach((plan) => {
            plansWrapper.innerHTML += `
                <div class="plan-card ${plan.isPopular ? "featured" : ""} ${plan.styleClass || ""}">
                    
                    ${plan.isPopular ? `<div class="popular-label">Most Popular</div>` : ""}

                    <h3>${plan.name}</h3>

                    <div class="plan-price">
                        £${Number(plan.price).toFixed(2)}
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

                    <button onclick="selectPlan(${plan.id})">
                        Select Plan
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

function selectPlan(planId) {
    localStorage.setItem("selectedPlanId", planId);
    window.location.href = "service.html";
}

window.selectPlan = selectPlan;

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