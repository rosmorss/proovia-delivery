import { bring } from "./fetch.js";

const planNameEl = document.getElementById("checkoutPlanName");
const datesEl = document.getElementById("checkoutDates");
const pickupEl = document.getElementById("checkoutPickupAddress");
const dropoffEl = document.getElementById("checkoutDropoffAddress");
const itemsEl = document.getElementById("checkoutItems");
const payBtn = document.getElementById("payBtn");
const checkoutForm = document.getElementById("checkoutForm");

const customerId = localStorage.getItem("customerId");
const selectedPlanId = localStorage.getItem("selectedPlanId");

const cart = JSON.parse(localStorage.getItem("cart")) || [];
const serviceDetails = JSON.parse(localStorage.getItem("serviceDetails")) || null;

const pickupAddress = localStorage.getItem("pickupAddress");
const dropoffAddress = localStorage.getItem("dropoffAddress");

const collectionDate = localStorage.getItem("collectionDate");
const deliveryDate = localStorage.getItem("deliveryDate");

let totalPrice = Number(localStorage.getItem("totalPrice")) || 0;

function formatDate(dateString) {
    if (!dateString) return "Not selected";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

async function renderCheckout() {
    if (!customerId || !selectedPlanId) {
        alert("Missing booking data. Please start again.");
        window.location.href = "index.html";
        return;
    }

    const cartItems = await bring("/items?items=" + cart.map(i => i.id).join(","))
    console.log("Cart items from server:", cartItems);
    const selectedPlan = await bring(`/plans/${selectedPlanId}`);

    totalPrice = Number(selectedPlan.price || 0) + cartItems.reduce((sum, item) => {
        const quantity = cart.find(i => i.id === item.id)?.quantity || 1;
        return sum + Number(item.basePrice || item.price || 0) * Number(quantity);
    }, 0);

    planNameEl.textContent = selectedPlan.name || "Selected Plan";

    datesEl.textContent = `${formatDate(collectionDate)} - ${formatDate(deliveryDate)}`;

    pickupEl.textContent = pickupAddress || "Pickup address missing";
    dropoffEl.textContent = dropoffAddress || "Dropoff address missing";

    itemsEl.innerHTML = "";

    cartItems.forEach(item => {
        const itemPrice = Number(item.basePrice || item.price || 0);
        const quantity = cart.find(i => i.id === item.id)?.quantity || 1;

        itemsEl.innerHTML += `
            <div class="checkout-item">
                <span>${item.name} × ${quantity}</span>
                <strong>£${(itemPrice * quantity).toFixed(2)}</strong>
            </div>
        `;
    });

    if (!totalPrice) {
        const planPrice = Number(selectedPlan?.price || 0);

        const itemsTotal = cartItems.reduce((sum, item) => {
            const quantity = cart.find(i => i.id === item.id)?.quantity || 1;
            return sum + Number(item.basePrice || item.price || 0) * Number(quantity);
        }, 0);

        totalPrice = planPrice + itemsTotal;
    }

    payBtn.textContent = `Pay £${totalPrice.toFixed(2)}`;
}

checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        payBtn.textContent = "Processing...";
        payBtn.disabled = true;

        const booking = await bring("/customer-bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customerId: Number(customerId),
                planId: Number(selectedPlanId),

                pickupAddress: pickupAddress,
                dropoffAddress: dropoffAddress,

                pickupDate: collectionDate ? new Date(collectionDate).toISOString() : null,
                deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,

                totalPrice: totalPrice,
                status: "PENDING_PAYMENT",
                paymentStatus: "PENDING"
            })
        });

        for (const item of cart) {
            await bring("/customer-booking-items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bookingId: booking.id,
                    itemId: item.id,
                    quantity: item.quantity || 1,
                    price: Number(item.basePrice || item.price || 0)
                })
            });
        }

        if (serviceDetails) {
            await bring("/customer-service-details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    bookingId: booking.id,

                    pickupParking: serviceDetails.pickupParking,
                    dropoffParking: serviceDetails.dropoffParking,

                    pickupFloor: serviceDetails.pickupFloor,
                    dropoffFloor: serviceDetails.dropoffFloor,

                    pickupSteps: serviceDetails.pickupSteps,
                    dropoffSteps: serviceDetails.dropoffSteps,

                    assemblyRequired: serviceDetails.assemblyRequired || false,
                    extraPrice: Number(serviceDetails.extraPrice || 0)
                })
            });
        }

        await bring("/customer-payments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                bookingId: booking.id,
                amount: Math.round(totalPrice * 100),
                method: "card",
                status: "PAID",
                transactionId: `TX-${Date.now()}`,
                paidAt: new Date().toISOString()
            })
        });

        localStorage.setItem("bookingId", booking.id);
        localStorage.setItem("trackingNumber", booking.trackingNumber || "");

        alert("Payment successful!");

        window.location.href = "success.html";

    } catch (error) {
        console.error("Checkout error:", error);
        alert(error.message || "Payment failed.");

        payBtn.textContent = `Pay £${totalPrice.toFixed(2)}`;
        payBtn.disabled = false;
    }
});

await renderCheckout();
