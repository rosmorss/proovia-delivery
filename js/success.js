const params = new URLSearchParams(window.location.search);

const trackingNumberEl = document.getElementById("successTrackingNumber");
const trackingBox = document.getElementById("trackingBox");
const copyTrackingBtn = document.getElementById("copyTrackingBtn");
const trackOrderBtn = document.getElementById("trackOrderBtn");

function readSuccessData() {
    try {
        return JSON.parse(localStorage.getItem("checkoutSuccess") || "{}");
    } catch {
        localStorage.removeItem("checkoutSuccess");
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

async function copyText(value) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
}

const successData = readSuccessData();
const trackingNumber =
    params.get("trackingNumber") ||
    successData.trackingNumber ||
    localStorage.getItem("trackingNumber") ||
    "";
const bookingId =
    params.get("bookingId") ||
    successData.bookingId ||
    localStorage.getItem("bookingId") ||
    "";

if (trackingNumber) {
    trackingNumberEl.textContent = trackingNumber;
    localStorage.setItem("trackingNumber", trackingNumber);
} else {
    trackingNumberEl.textContent = "Tracking number pending";
    trackingBox?.classList.add("is-missing");
    if (copyTrackingBtn) copyTrackingBtn.disabled = true;
}

setText("successBookingId", bookingId ? `#${bookingId}` : "");
setText("successTotalPaid", formatMoney(successData.totalPrice));
setText("successPlan", successData.planName);
setText(
    "successItems",
    successData.itemCount ? `${successData.itemCount} selected` : ""
);

const route =
    successData.pickupAddress || successData.dropoffAddress
        ? `${successData.pickupAddress || "Pickup pending"} to ${successData.dropoffAddress || "Dropoff pending"}`
        : "";
setText("successRoute", route);

const dates =
    successData.collectionDate || successData.deliveryDate
        ? `${formatDate(successData.collectionDate) || "Collection pending"} - ${formatDate(successData.deliveryDate) || "Delivery pending"}`
        : "";
setText("successDates", dates);
setText("successPaidAt", formatDateTime(successData.paidAt));

if (trackOrderBtn) {
    trackOrderBtn.href = trackingNumber
        ? `tracking.html?trackingNumber=${encodeURIComponent(trackingNumber)}`
        : "tracking.html";
}

copyTrackingBtn?.addEventListener("click", async () => {
    if (!trackingNumber) return;

    const defaultText = copyTrackingBtn.textContent;

    try {
        await copyText(trackingNumber);
        copyTrackingBtn.textContent = "Copied";
    } catch (error) {
        console.error("Copy tracking number failed:", error);
        copyTrackingBtn.textContent = "Copy failed";
    }

    setTimeout(() => {
        copyTrackingBtn.textContent = defaultText;
    }, 1600);
});
