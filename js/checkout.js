import { bring } from "./fetch.js";
import { queueToast, showToast } from "./toast.js";
import {
    setupPaymentInputFormatting,
    validatePaymentFields
} from "./validation.js";
import {
    calculateItemsSubtotal,
    calculatePlanQuote,
    formatMoney,
    loadCartItems
} from "./customerPricing.js";

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
let checkoutSummary = null;

setupPaymentInputFormatting(checkoutForm, showToast);

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
        showToast("Missing booking data. Please start again.", "error");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
        return;
    }

    const [cartItems, selectedPlan] = await Promise.all([
        loadCartItems(bring, cart),
        bring(`/plans/${selectedPlanId}`)
    ]);
    const itemsSubtotal = calculateItemsSubtotal(cartItems);
    const quote = calculatePlanQuote(itemsSubtotal, selectedPlan, serviceDetails?.extraPrice || 0);

    totalPrice = quote.total;

    planNameEl.textContent = selectedPlan.name || "Selected Plan";

    datesEl.textContent = `${formatDate(collectionDate)} - ${formatDate(deliveryDate)}`;

    pickupEl.textContent = pickupAddress || "Pickup address missing";
    dropoffEl.textContent = dropoffAddress || "Dropoff address missing";

    itemsEl.innerHTML = "";

    cartItems.forEach(item => {
        const itemPrice = Number(item.basePrice || item.price || 0);

        itemsEl.innerHTML += `
            <div class="checkout-item">
                <span>${item.name} × ${item.quantity}</span>
                <strong>£${(itemPrice * item.quantity).toFixed(2)}</strong>
            </div>
        `;
    });

    itemsEl.innerHTML += `
        <div class="checkout-item">
            <span>${selectedPlan.name || "Selected plan"} (${quote.planLabel})</span>
            <strong>${formatMoney(quote.planFee)}</strong>
        </div>
    `;

    if (quote.extraPrice > 0) {
        itemsEl.innerHTML += `
            <div class="checkout-item">
                <span>Service extras</span>
                <strong>${formatMoney(quote.extraPrice)}</strong>
            </div>
        `;
    }

    checkoutSummary = {
        planName: selectedPlan.name || "Selected Plan",
        totalPrice,
        pickupAddress: pickupAddress || "",
        dropoffAddress: dropoffAddress || "",
        collectionDate: collectionDate || "",
        deliveryDate: deliveryDate || "",
        itemCount: cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
    };

    localStorage.setItem("selectedPlanQuote", JSON.stringify(quote));
    localStorage.setItem("totalPrice", totalPrice);

    payBtn.textContent = `Pay ${formatMoney(totalPrice)}`;
}

checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paymentFields = validatePaymentFields(checkoutForm, showToast);
    if (!paymentFields.valid) return;

    try {
        showToast("Processing payment...", "info", { duration: 1400 });
        payBtn.textContent = "Processing...";
        payBtn.disabled = true;

        const order = await bring("/customer-bookings/all", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                booking: {
                    customerId: Number(customerId),
                    planId: Number(selectedPlanId),

                    pickupAddress: pickupAddress,
                    dropoffAddress: dropoffAddress,

                    pickupDate: collectionDate ? new Date(collectionDate).toISOString() : null,
                    deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : null,

                    totalPrice: totalPrice,
                    status: "PAID",
                    paymentStatus: "PAID"
                },
                items: cart.map(item => ({
                    itemId: item.id,
                    quantity: item.quantity || 1,
                })),
                serviceDetails: serviceDetails,
                payment: {
                    method: "card",
                    status: "PAID",
                    transactionId: `TX-${Date.now()}`,
                    paidAt: new Date().toISOString()
                }
            })
        });

        // for (const item of cart) {
        //     await bring("/customer-booking-items", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             bookingId: booking.id,
        //             itemId: item.id,
        //             quantity: item.quantity || 1,
        //             price: Number(item.basePrice || item.price || 0)
        //         })
        //     });
        // }

        // if (serviceDetails) {
        //     await bring("/customer-service-details", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         body: JSON.stringify({
        //             bookingId: booking.id,

        //             pickupParking: serviceDetails.pickupParking,
        //             dropoffParking: serviceDetails.dropoffParking,

        //             pickupFloor: serviceDetails.pickupFloor,
        //             dropoffFloor: serviceDetails.dropoffFloor,

        //             pickupSteps: serviceDetails.pickupSteps,
        //             dropoffSteps: serviceDetails.dropoffSteps,

        //             assemblyRequired: serviceDetails.assemblyRequired || false,
        //             extraPrice: Number(serviceDetails.extraPrice || 0)
        //         })
        //     });
        // }

        // await bring("/customer-payments", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         bookingId: booking.id,
        //         amount: Math.round(totalPrice * 100),
        //         method: "card",
        //         status: "PAID",
        //         transactionId: `TX-${Date.now()}`,
        //         paidAt: new Date().toISOString()
        //     })
        // });
        const booking = order.booking || order;
        const bookingId = booking.id || "";
        const trackingNumber = booking.trackingNumber || "";
        const successData = {
            ...(checkoutSummary || {}),
            bookingId,
            trackingNumber,
            totalPrice: Number(booking.totalPrice || totalPrice || 0),
            paidAt: new Date().toISOString()
        };

        [
            "cart",
            "serviceDetails",
            "pickupAddress",
            "dropoffAddress",
            "collectionDate",
            "deliveryDate",
            "totalPrice",
            "selectedPlanId",
            "selectedPlanQuote",
            "orderDetails"
        ].forEach(key => localStorage.removeItem(key));

        localStorage.setItem("bookingId", String(bookingId));
        localStorage.setItem("trackingNumber", trackingNumber);
        localStorage.setItem("checkoutSuccess", JSON.stringify(successData));

        const params = new URLSearchParams();
        if (trackingNumber) params.set("trackingNumber", trackingNumber);
        if (bookingId) params.set("bookingId", bookingId);

        queueToast("Payment completed. Your booking is confirmed.", "success");
        showToast("Payment completed. Booking confirmed.", "success", { duration: 1200 });

        setTimeout(() => {
            window.location.href = `success.html${params.toString() ? `?${params.toString()}` : ""}`;
        }, 650);

    } catch (error) {
        console.error("Checkout error:", error);
        const failureMessage = error.message || "Payment failed. Please try again.";
        const failedData = {
            ...(checkoutSummary || {}),
            totalPrice: Number(totalPrice || 0),
            reason: failureMessage,
            failedAt: new Date().toISOString()
        };

        payBtn.textContent = `Pay ${formatMoney(totalPrice)}`;
        payBtn.disabled = false;

        localStorage.setItem("checkoutFailed", JSON.stringify(failedData));
        queueToast("Payment failed. Please review the details and try again.", "error");

        setTimeout(() => {
            window.location.href = "failed.html";
        }, 650);
    }
});

renderCheckout().catch(error => {
    console.error("Checkout render error:", error);
    showToast(error.message || "Checkout data could not be loaded.", "error");
});
