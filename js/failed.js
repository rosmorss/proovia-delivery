import { showQueuedToast } from "./toast.js";

function readFailedData() {
    try {
        return JSON.parse(localStorage.getItem("checkoutFailed") || "{}");
    } catch {
        localStorage.removeItem("checkoutFailed");
        return {};
    }
}

function setText(id, value, fallback = "Pending") {
    const element = document.getElementById(id);
    if (!element) return;

    element.textContent = value || fallback;
}

function formatMoney(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || value === "" || value === null || value === undefined) {
        return "";
    }

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

showQueuedToast();

const failedData = readFailedData();
const reason = failedData.reason || "Payment failed. Please check your details and try again.";
const retryCheckoutBtn = document.getElementById("retryCheckoutBtn");

setText("failedReason", reason);
setText("failedTotalDue", formatMoney(failedData.totalPrice));
setText("failedPlan", failedData.planName);
setText("failedItems", failedData.itemCount ? `${failedData.itemCount} selected` : "");

const route =
    failedData.pickupAddress || failedData.dropoffAddress
        ? `${failedData.pickupAddress || "Pickup pending"} to ${failedData.dropoffAddress || "Dropoff pending"}`
        : "";
setText("failedRoute", route);

const dates =
    failedData.collectionDate || failedData.deliveryDate
        ? `${formatDate(failedData.collectionDate) || "Collection pending"} - ${formatDate(failedData.deliveryDate) || "Delivery pending"}`
        : "";
setText("failedDates", dates);
setText("failedAt", formatDateTime(failedData.failedAt));

if (retryCheckoutBtn) {
    const hasCheckoutData = localStorage.getItem("customerId") && localStorage.getItem("selectedPlanId");
    retryCheckoutBtn.href = hasCheckoutData ? "checkout.html" : "details.html";
}
