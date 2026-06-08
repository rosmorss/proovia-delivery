import { bring, bringAuth } from "./fetch.js";

const params = new URLSearchParams(window.location.search);
const form = document.getElementById("trackingForm");
const input = document.getElementById("trackingInput");

const panels = {
    empty: document.getElementById("trackingEmpty"),
    loading: document.getElementById("trackingLoading"),
    notFound: document.getElementById("trackingNotFound"),
    content: document.getElementById("trackingContent")
};

const statusSteps = [
    {
        status: "BOOKED",
        title: "Booking received",
        description: "Your order details have been received by Proovia."
    },
    {
        status: "PAID",
        title: "Payment",
        description: "Payment must be confirmed before the booking moves forward."
    },
    {
        status: "PROCESSING",
        title: "Preparing collection",
        description: "The delivery team is preparing the collection route."
    },
    {
        status: "COLLECTED",
        title: "Collected",
        description: "Your items have been collected from the pickup address."
    },
    {
        status: "IN_TRANSIT",
        title: "In transit",
        description: "Your order is on the road to the delivery address."
    },
    {
        status: "DELIVERED",
        title: "Delivered",
        description: "The order has arrived at the delivery address."
    }
];

const statusIndex = {
    DRAFT: 0,
    PENDING_PAYMENT: 1,
    PAID: 1,
    PROCESSING: 2,
    COLLECTED: 3,
    IN_TRANSIT: 4,
    DELIVERED: 5
};

function clearTrackingInput() {
    if (!input) return;

    input.value = "";
    input.defaultValue = "";
}

function removeStoredTrackingNumber() {
    localStorage.removeItem("trackingNumber");

    const url = new URL(window.location.href);
    if (!url.searchParams.has("trackingNumber")) return;

    url.searchParams.delete("trackingNumber");
    window.history.replaceState({}, "", url);
}

function showPanel(name) {
    Object.entries(panels).forEach(([key, panel]) => {
        panel?.classList.toggle("is-hidden", key !== name);
    });
}

function setText(id, value, fallback = "Pending") {
    const element = document.getElementById(id);
    if (!element) return;

    element.textContent = value || fallback;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatStatus(value) {
    return String(value || "PENDING")
        .toLowerCase()
        .split("_")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatEnum(value) {
    if (typeof value === "boolean") return value ? "Yes" : "No";

    return String(value || "")
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatMoney(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "";

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP"
    }).format(amount);
}

function normalizeStatus(order) {
    const status = String(order?.status || "PROCESSING").toUpperCase();

    if (status === "CANCELLED") {
        return status;
    }

    if (!hasConfirmedPayment(order)) {
        return "PENDING_PAYMENT";
    }

    if (status === "DRAFT" || status === "PENDING_PAYMENT") {
        return "PAID";
    }

    return status;
}

function hasConfirmedPayment(order) {
    const paymentStatus = String(order?.paymentStatus || order?.payment?.status || "").toUpperCase();
    return paymentStatus === "PAID";
}

function addressText(value) {
    if (!value) return "";
    if (typeof value === "string") return value;

    return [value.address, value.city, value.postcode]
        .filter(Boolean)
        .join(", ");
}

function getPickupAddress(order) {
    return addressText(order.pickupAddress);
}

function getDropoffAddress(order) {
    return addressText(order.dropoffAddress);
}

function getCustomerName(order, type) {
    if (type === "business") {
        return order.user?.companyName || order.user?.username || "";
    }

    return order.customer?.fullName || "";
}

function getPlanName(order, type) {
    if (type === "business") return "Business delivery";

    return order.plan?.name || "Selected service";
}

function getPaymentText(order) {
    const status = formatStatus(order.paymentStatus || order.payment?.status || "Pending");
    const amount = formatMoney(order.totalPrice || order.payment?.amount);

    return amount ? `${status} - ${amount}` : status;
}

function getEta(order, status) {
    if (status === "CANCELLED") return "No arrival scheduled";
    if (status === "DELIVERED") return formatDate(order.deliveryDate || order.updatedAt) || "Delivered";

    if (order.deliveryDate) {
        return `Expected ${formatDate(order.deliveryDate)}`;
    }

    if (order.pickupDate) {
        return `Collection ${formatDate(order.pickupDate)}`;
    }

    return "ETA will be confirmed";
}

function getCurrentLocation(order, status) {
    const pickup = getPickupAddress(order) || "the collection address";
    const dropoff = getDropoffAddress(order) || "the delivery address";

    switch (status) {
        case "DRAFT":
        case "PENDING_PAYMENT":
            return "The booking is received and waiting for payment confirmation.";
        case "PAID":
            return `Payment is confirmed. The order is waiting for collection at ${pickup}.`;
        case "PROCESSING":
            return `The team is preparing collection from ${pickup}.`;
        case "COLLECTED":
            return "The order has been collected and is being prepared for transit.";
        case "IN_TRANSIT":
            return `The order is currently on the road to ${dropoff}.`;
        case "DELIVERED":
            return `The order has arrived at ${dropoff}.`;
        case "CANCELLED":
            return "This order has been cancelled. Contact support if you need help.";
        default:
            return "The latest delivery status is being updated.";
    }
}

function stepDate(order, index, isComplete) {
    if (index === 0) return formatDateTime(order.createdAt);
    if (index === 1 && !hasConfirmedPayment(order)) return "";
    if (index === 1) return formatDateTime(order.payment?.paidAt || order.payment?.createdAt);
    if (index === 3) return formatDate(order.pickupDate);
    if (index === 5) return formatDate(order.deliveryDate);
    if (isComplete) return formatDateTime(order.updatedAt);

    return "";
}

function renderTimeline(order, status) {
    const timeline = document.getElementById("trackingTimeline");
    if (!timeline) return;

    if (status === "CANCELLED") {
        const paid = String(order.paymentStatus || order.payment?.status || "").toUpperCase() === "PAID";
        timeline.innerHTML = `
            ${renderStep(0, statusSteps[0], "is-complete", formatDateTime(order.createdAt))}
            ${paid ? renderStep(1, statusSteps[1], "is-complete", formatDateTime(order.payment?.paidAt || order.payment?.createdAt)) : ""}
            ${renderStep(2, {
                title: "Order cancelled",
                description: "This booking is no longer active."
            }, "is-active is-cancelled", formatDateTime(order.updatedAt))}
        `;
        return;
    }

    const activeIndex = statusIndex[status] ?? 0;

    timeline.innerHTML = statusSteps.map((step, index) => {
        const className = index < activeIndex
            ? "is-complete"
            : index === activeIndex
                ? "is-active"
                : "";
        const date = stepDate(order, index, index <= activeIndex);

        return renderStep(index, getProgressStepForOrder(order, step, index), className, date);
    }).join("");
}

function getProgressStepForOrder(order, step, index) {
    if (index !== 1) return step;

    return hasConfirmedPayment(order)
        ? {
            ...step,
            title: "Payment confirmed",
            description: "Payment is confirmed and the booking is ready for scheduling."
        }
        : {
            ...step,
            title: "Payment pending",
            description: "Payment has not been completed yet, so this booking will not move forward."
        };
}

function renderStep(index, step, className, date) {
    return `
        <li class="timeline-step ${className}">
            <div class="timeline-dot">${className.includes("is-complete") ? "" : index + 1}</div>
            <div>
                <h3 class="timeline-title">${escapeHtml(step.title)}</h3>
                <p class="timeline-copy">${escapeHtml(step.description)}</p>
                ${date ? `<div class="timeline-meta">${escapeHtml(date)}</div>` : ""}
            </div>
        </li>
    `;
}

function orderItems(order) {
    if (Array.isArray(order.items) && order.items.length) {
        return order.items.map(row => {
            const item = row.item || {};
            const quantity = Number(row.quantity || 1);
            const unitPrice = Number(row.unitPrice || row.price || item.basePrice || 0);
            const lineTotal = Number(row.lineTotal || unitPrice * quantity || 0);

            return {
                name: item.name || row.name || order.itemName || "Item",
                category: item.category?.name || "",
                quantity,
                price: lineTotal
            };
        });
    }

    return [{
        name: order.itemName || "Shipment",
        category: "",
        quantity: Number(order.pieces || 1),
        price: Number(order.totalPrice || 0)
    }];
}

function renderItems(order) {
    const container = document.getElementById("trackingItems");
    if (!container) return;

    const items = orderItems(order);

    container.innerHTML = items.map(item => `
        <div class="tracking-item">
            <div>
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-meta">
                    ${escapeHtml(item.category || "Item")} | Quantity ${escapeHtml(item.quantity)}
                </div>
            </div>
            <div class="item-price">${escapeHtml(formatMoney(item.price))}</div>
        </div>
    `).join("");
}

function renderServiceDetails(order) {
    const container = document.getElementById("trackingServiceDetails");
    if (!container) return;

    const details = order.serviceDetails || order.details || {};
    const rows = [
        ["Pickup parking", details.pickupParking],
        ["Dropoff parking", details.dropoffParking],
        ["Pickup floor", details.pickupFloor],
        ["Dropoff floor", details.dropoffFloor],
        ["Pickup steps", details.pickupSteps],
        ["Dropoff steps", details.dropoffSteps],
        ["Assembly required", details.assemblyRequired],
        ["Extra service price", details.extraPrice ? formatMoney(details.extraPrice) : ""],
        ["Notes", details.notes]
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");

    if (!rows.length) {
        container.innerHTML = `
            <div>
                <dt>Details</dt>
                <dd>No extra access notes for this order.</dd>
            </div>
        `;
        return;
    }

    container.innerHTML = rows.map(([label, value]) => `
        <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(formatServiceValue(label, value))}</dd>
        </div>
    `).join("");
}

function formatServiceValue(label, value) {
    if (label === "Notes" || label === "Extra service price") {
        return String(value);
    }

    return formatEnum(value) || String(value);
}

function renderTracking(result, trackingNumber) {
    const { order, type } = result;
    const status = normalizeStatus(order);
    const statusBadge = document.getElementById("trackingStatusBadge");
    const customerName = getCustomerName(order, type);

    setText("trackingStatusText", formatStatus(status));
    setText("trackingCurrentLocation", getCurrentLocation(order, status));
    setText("trackingNumberDisplay", order.trackingNumber || trackingNumber);
    setText("trackingEta", getEta(order, status));
    setText("trackingUpdated", formatDateTime(order.updatedAt || order.createdAt));
    setText("trackingPickup", getPickupAddress(order));
    setText("trackingDropoff", getDropoffAddress(order));
    setText("trackingPickupDate", formatDate(order.pickupDate));
    setText("trackingDeliveryDate", formatDate(order.deliveryDate));
    setText("trackingPlan", customerName ? `${getPlanName(order, type)} - ${customerName}` : getPlanName(order, type));
    setText("trackingPayment", getPaymentText(order));

    if (statusBadge) {
        statusBadge.textContent = formatStatus(status);
        statusBadge.classList.toggle("is-delivered", status === "DELIVERED");
        statusBadge.classList.toggle("is-cancelled", status === "CANCELLED");
    }

    renderTimeline(order, status);
    renderItems(order);
    renderServiceDetails(order);
    showPanel("content");
}

async function findTracking(number) {
    let customerResult = null;

    try {
        customerResult = await bring(`/customer-bookings/tracking/${encodeURIComponent(number)}`);
    } catch (error) {
        console.error("Customer tracking failed:", error);
    }

    if (customerResult) {
        return { type: "customer", order: customerResult };
    }

    if (!localStorage.getItem("token")) {
        return null;
    }

    try {
        const businessResult = await bringAuth(`/user-orders/tracking/${encodeURIComponent(number)}`);

        if (businessResult) {
            return { type: "business", order: businessResult };
        }
    } catch (error) {
        console.error("Business tracking failed:", error);
    }

    return null;
}

async function loadTracking(number, options = {}) {
    const cleanNumber = String(number || "").trim();
    const { syncInput = true } = options;

    if (!cleanNumber) {
        showPanel("empty");
        return;
    }

    if (syncInput && input) {
        input.value = cleanNumber;
    }

    removeStoredTrackingNumber();
    showPanel("loading");

    const result = await findTracking(cleanNumber);

    if (!result) {
        const text = !localStorage.getItem("token")
            ? "Check the tracking number and try again. Business orders can be tracked after signing in to the dashboard."
            : "Check the tracking number and try again. The order may still be syncing.";

        setText("trackingNotFoundText", text);
        showPanel("notFound");
        return;
    }

    renderTracking(result, cleanNumber);
}

form?.addEventListener("submit", event => {
    event.preventDefault();
    loadTracking(input?.value, { syncInput: false });
});

const initialTrackingNumber = params.get("trackingNumber") || "";

clearTrackingInput();
removeStoredTrackingNumber();

window.addEventListener("pageshow", event => {
    if (event.persisted) {
        clearTrackingInput();
    }
});

if (initialTrackingNumber) {
    loadTracking(initialTrackingNumber, { syncInput: false });
} else {
    showPanel("empty");
}
