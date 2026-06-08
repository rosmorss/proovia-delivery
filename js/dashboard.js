import { bring, bringAuth } from "./fetch.js";

/* =========================
   STATE
========================= */

const CURRENCY = "\u00A3";
const USER_ORDER_FEE_PERCENT = 1.5;
const ACTIVE_STATUSES = new Set([
    "DRAFT",
    "PENDING_PAYMENT",
    "PAID",
    "PROCESSING",
    "COLLECTED",
    "IN_TRANSIT"
]);

let currentUser = null;
let userOrders = [];
let userAddresses = [];
let userClaims = [];
let catalogItems = [];
let selectedItems = new Map();

let collectionDate = new Date();
let deliveryDate = new Date();
deliveryDate.setDate(collectionDate.getDate() + 1);

let collectionViewDate = new Date(collectionDate);
let deliveryViewDate = new Date(deliveryDate);

const pageTitles = {
    home: ["Dashboard", "Track, Manage, and Forecast Deliveries with Ease."],
    create: ["Create New Order", "Fill in the details below to book your delivery."],
    active: ["Active Orders", "Shipments currently in progress."],
    history: ["Orders History", "Browse and search all your past orders."],
    "order-details": ["Order Details", "Items, route and delivery progress."],
    tracking: ["Tracking", "Find the current stage for a business order."],
    checkout: ["Checkout", "Complete payment for your business order."],
    addresses: ["My Addresses", "Manage your saved collection and delivery addresses."],
    discount: ["My Discount", "Your current pricing and discount level."],
    claim: ["Report a Claim", "Describe the issue and we'll look into it."],
    support: ["Support", "Get in touch with our team."],
    settings: ["Settings", "Manage your account and security settings."]
};

const pageUrls = {
    home: "dashboard.html",
    create: "dashboard-create.html",
    active: "dashboard-active.html",
    history: "dashboard-history.html",
    "order-details": "dashboard-order-details.html",
    tracking: "dashboard-tracking.html",
    checkout: "dashboard-checkout.html",
    addresses: "dashboard-addresses.html",
    discount: "dashboard-discount.html",
    claim: "dashboard-claim.html",
    support: "dashboard-support.html",
    settings: "dashboard-settings.html"
};

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const orderProgressSteps = [
    {
        status: "DRAFT",
        title: "Order received",
        description: "The booking has been created in your business account."
    },
    {
        status: "PENDING_PAYMENT",
        title: "Payment",
        description: "Payment must be confirmed before the order moves forward."
    },
    {
        status: "PROCESSING",
        title: "Preparing collection",
        description: "The delivery team is planning the collection route."
    },
    {
        status: "COLLECTED",
        title: "Collected",
        description: "The items have been collected from the pickup address."
    },
    {
        status: "IN_TRANSIT",
        title: "In transit",
        description: "The order is on the way to the delivery address."
    },
    {
        status: "DELIVERED",
        title: "Delivered",
        description: "The order has arrived at the delivery address."
    }
];
const orderStatusIndex = {
    DRAFT: 0,
    PENDING_PAYMENT: 1,
    PAID: 1,
    PROCESSING: 2,
    COLLECTED: 3,
    IN_TRANSIT: 4,
    DELIVERED: 5
};

let lastOrderListPage = "active";
let dashboardTrackingOrderId = null;
let isInitialDashboardTrackingRender = true;
let checkoutOrderId = null;
let checkoutReturnPage = "active";

/* =========================
   START
========================= */

window.addEventListener("DOMContentLoaded", async () => {
    initCalendar();
    initSearch();
    initCreateOrder();
    initOrderRows();
    initTrackingControls();
    initCheckoutControls();
    await loadDashboardData();
});

/* =========================
   DATA
========================= */

async function loadDashboardData() {
    try {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");

        if (!username || !token) {
            window.location.href = "log.html";
            return;
        }

        currentUser = await bringAuth(`/users/username/${encodeURIComponent(username)}`);

        const [ordersResult, addressesResult, claimsResult, itemsResult] = await Promise.allSettled([
            bringAuth(`/user-orders/user/${currentUser.id}`),
            bringAuth(`/user-addresses/user/${currentUser.id}`),
            bringAuth(`/user-claims/user/${currentUser.id}`),
            bring("/items?take=500")
        ]);

        userOrders = unwrapResult(ordersResult, []);
        userAddresses = unwrapResult(addressesResult, []);
        userClaims = unwrapResult(claimsResult, []);
        catalogItems = unwrapResult(itemsResult, []);

        renderAll();
    } catch (error) {
        console.error("Dashboard error:", error);
        showToast(error.message || "Dashboard data could not be loaded");
    }
}

function unwrapResult(result, fallback) {
    if (result.status === "fulfilled") return Array.isArray(result.value) ? result.value : fallback;

    console.error(result.reason);
    return fallback;
}

/* =========================
   RENDER
========================= */

function renderAll() {
    renderDashboardStats();
    renderOrders();
    renderAddresses();
    renderDiscount();
    renderItemDropdown();
    renderSelectedItems();
    renderTrackingPage();
    initChart();
    hydrateSettings();
    hydrateDashboardRoute();
}

function renderDashboardStats() {
    const name = currentUser?.username || "User";
    const activeOrders = userOrders.filter(isActiveOrder);
    const now = new Date();
    const thisMonthOrders = userOrders.filter(order => isSameMonth(orderDate(order), now));
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    const lastMonthOrders = userOrders.filter(order => isSameMonth(orderDate(order), lastMonth));
    const percentChange = lastMonthOrders.length > 0
        ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
        : thisMonthOrders.length > 0 ? 100 : 0;
    const pendingOrders = userOrders.filter(order => {
        return order.paymentStatus === "PENDING" || order.paymentStatus === "NOT_PAID";
    });
    const pendingTotal = pendingOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    renderDashboardTitle(name);
    setText("sidebarUsername", name);
    setText("sidebarAvatar", name.substring(0, 2).toUpperCase());
    setText("sidebarUserRole", currentUser?.companyName || currentUser?.role || "Business Account");
    setText("totalOrdersCount", userOrders.length);
    setText("totalOrdersDelta", `${percentChange >= 0 ? "+" : "-"}${Math.abs(percentChange).toFixed(0)}% this month`);
    setText("activeOrdersCount", activeOrders.length);
    setText("activeOrdersBadge", activeOrders.length);
    setText("quickActiveCount", `${activeOrders.length} active`);
    setText("pendingPaymentAmount", formatCurrency(pendingTotal));
    setText("pendingPaymentCount", `${pendingOrders.length} unpaid`);
}

function renderOrders() {
    const activeOrders = userOrders.filter(isActiveOrder);
    const historyOrders = userOrders.filter(order => !isActiveOrder(order));

    renderOrderList("recentOrdersContainer", userOrders.slice(0, 5), "No orders yet. Create your first business order.", true);
    renderOrderList("activeOrdersContainer", activeOrders, "No active orders right now.", true);
    renderOrderList("historyOrdersContainer", historyOrders.length ? historyOrders : userOrders, "No order history yet.", true);

    const activeSubNote = document.querySelector("#page-active .panel-sub-note");
    if (activeSubNote) {
        activeSubNote.textContent = `${activeOrders.length} in progress`;
    }
}

function renderOrderList(containerId, orders, emptyMessage, opensDetails = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!orders.length) {
        container.innerHTML = `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        const status = normalizeOrderStatus(order);
        const statusClass = orderStatusClass(status);
        const tracking = order.trackingNumber || "Tracking pending";
        const payment = order.paymentStatus === "PAID" ? "Paid" : "Payment pending";
        const itemSummary = orderItemSummary(order);
        const payAction = !hasConfirmedPayment(order)
            ? `<button class="row-pay-btn" type="button" data-pay-order data-order-id="${order.id}">Pay now</button>`
            : "";
        const detailsAttrs = opensDetails
            ? `data-open-details="true" tabindex="0" role="button" aria-label="Open order ${order.id} details"`
            : "";

        return `
            <div class="order-row ${opensDetails ? "is-clickable" : ""}" data-order-id="${order.id}" ${detailsAttrs}>
                <div class="order-num">#${order.id}</div>
                <div class="order-info">
                    <div class="order-item">${escapeHtml(itemSummary)}</div>
                    <div class="order-date">${formatDate(order.createdAt)} | ${formatCurrency(order.totalPrice)}</div>
                    <div class="order-track">${escapeHtml(tracking)}</div>
                </div>
                <div class="order-status">
                    <span class="status-badge ${statusClass}">${escapeHtml(formatStatus(status))}</span>
                    <div class="not-paid">${escapeHtml(payment)}</div>
                    ${payAction}
                </div>
            </div>
        `;
    }).join("");
}

function renderAddresses() {
    renderAddressList("homeAddressesContainer", userAddresses.slice(0, 3), "No saved addresses yet.");
    renderAddressList(
        "collectionAddressesContainer",
        userAddresses.filter(address => address.type === "PICKUP" || address.type === "BOTH"),
        "No collection addresses yet."
    );
    renderAddressList(
        "deliveryAddressesContainer",
        userAddresses.filter(address => address.type === "DROPOFF" || address.type === "BOTH"),
        "No delivery addresses yet."
    );
    hydrateAddressOptions();
}

function renderAddressList(containerId, addresses, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!addresses.length) {
        container.innerHTML = `<div class="empty-state compact">${escapeHtml(emptyMessage)}</div>`;
        return;
    }

    container.innerHTML = addresses.map(address => `
        <div class="addr-item" data-address-id="${address.id}">
            <div class="addr-icon">${address.type === "DROPOFF" ? "D" : "C"}</div>
            <div class="addr-text">
                ${escapeHtml(address.address)}
                ${address.city ? `<div>${escapeHtml(address.city)}</div>` : ""}
            </div>
            <div class="addr-flag">${escapeHtml(address.type || "BOTH")}</div>
        </div>
    `).join("");
}

function renderDiscount() {
    const discount = getDiscountPercent();
    const tariff = Number(currentUser?.personalTariff || 0);
    const label = tariff > 0
        ? `Personal discount (${formatPercent(discount)}) + custom tariff`
        : `Personal discount (${formatPercent(discount)})`;
    const progress = Math.min(100, Math.max(discount, userOrders.length * 10));
    const dash = (201 * progress / 100).toFixed(0);

    setText("discountPercent", formatPercent(discount));
    setText("discountPagePercent", formatPercent(discount));
    setText("createDiscountLabel", label);

    document.querySelectorAll(".ring-progress").forEach(circle => {
        circle.setAttribute("stroke-dasharray", `${dash} 201`);
    });

    const tip = document.querySelector(".discount-tip");
    if (tip) {
        tip.innerHTML = discount > 0
            ? `Your business account has a personalised ${formatPercent(discount)} discount applied automatically to dashboard orders.`
            : "Place regular business orders to unlock personalised pricing and automatic discounts.";
    }
}

function renderItemDropdown() {
    const select = document.getElementById("createItemSelect");
    if (!select) return;

    if (!catalogItems.length) {
        select.innerHTML = `<option value="">No items available</option>`;
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = `
        <option value="">Select an item...</option>
        ${catalogItems.map(item => `
            <option value="${item.id}">
                ${escapeHtml(item.name)} - ${formatCurrency(item.basePrice)}
            </option>
        `).join("")}
    `;
}

function renderSelectedItems() {
    const container = document.getElementById("selectedItemsContainer");
    if (!container) return;

    const selected = getSelectedItems();

    if (!selected.length) {
        container.classList.add("empty");
        container.innerHTML = "Select one or more items for this order.";
        updateCreateTotals();
        return;
    }

    container.classList.remove("empty");
    container.innerHTML = selected.map(({ item, quantity }) => {
        const lineTotal = Number(item.basePrice || 0) * quantity;

        return `
            <div class="selected-item-row" data-item-id="${item.id}">
                <div>
                    <div class="selected-item-name">${escapeHtml(item.name)}</div>
                    <div class="selected-item-meta">${formatCurrency(item.basePrice)} each | ${formatCurrency(lineTotal)}</div>
                </div>
                <div class="qty-control">
                    <button class="qty-btn" type="button" data-action="decrease">-</button>
                    <span class="qty-count">${quantity}</span>
                    <button class="qty-btn" type="button" data-action="increase">+</button>
                </div>
            </div>
        `;
    }).join("");

    updateCreateTotals();
}

function hydrateSettings() {
    setValue("settingsEmail", currentUser?.email || "");
    setValue("settingsPhone", currentUser?.phone || "");
    setValue("settingsUsername", currentUser?.username || "");
}

function hydrateAddressOptions() {
    const pickupOptions = document.getElementById("pickupAddressOptions");
    const dropoffOptions = document.getElementById("dropoffAddressOptions");

    if (pickupOptions) {
        pickupOptions.innerHTML = userAddresses
            .filter(address => address.type === "PICKUP" || address.type === "BOTH")
            .map(address => `<option value="${escapeHtml(address.address)}"></option>`)
            .join("");
    }

    if (dropoffOptions) {
        dropoffOptions.innerHTML = userAddresses
            .filter(address => address.type === "DROPOFF" || address.type === "BOTH")
            .map(address => `<option value="${escapeHtml(address.address)}"></option>`)
            .join("");
    }
}

/* =========================
   CREATE ORDER
========================= */

function initCreateOrder() {
    const addButton = document.getElementById("addItemButton");
    const selectedContainer = document.getElementById("selectedItemsContainer");
    const submitButton = document.getElementById("submitCreateOrder");
    const clearButton = document.getElementById("clearCreateOrder");

    addButton?.addEventListener("click", addItemFromDropdown);
    selectedContainer?.addEventListener("click", handleQuantityClick);
    submitButton?.addEventListener("click", submitCreateOrder);
    clearButton?.addEventListener("click", () => resetCreateOrderForm(true));
}

function addItemFromDropdown() {
    const select = document.getElementById("createItemSelect");
    const itemId = Number(select?.value);

    if (!Number.isInteger(itemId) || itemId <= 0) {
        showToast("Select an item first");
        return;
    }

    selectedItems.set(itemId, (selectedItems.get(itemId) || 0) + 1);
    select.value = "";
    renderSelectedItems();
}

function handleQuantityClick(event) {
    const button = event.target.closest(".qty-btn");
    if (!button) return;

    const row = button.closest(".selected-item-row");
    const itemId = Number(row?.dataset.itemId);
    const currentQuantity = selectedItems.get(itemId) || 0;

    if (!Number.isInteger(itemId)) return;

    if (button.dataset.action === "increase") {
        selectedItems.set(itemId, currentQuantity + 1);
    }

    if (button.dataset.action === "decrease") {
        if (currentQuantity <= 1) {
            selectedItems.delete(itemId);
        } else {
            selectedItems.set(itemId, currentQuantity - 1);
        }
    }

    renderSelectedItems();
}

async function submitCreateOrder() {
    const submitButton = document.getElementById("submitCreateOrder");
    const selected = getSelectedItems();
    const pickupAddress = getValue("createPickupAddress");
    const dropoffAddress = getValue("createDropoffAddress");

    if (!isBusinessUser()) {
        showToast("Only business users can create dashboard orders");
        return;
    }

    if (!pickupAddress || !dropoffAddress) {
        showToast("Collection and delivery addresses are required");
        return;
    }

    if (!selected.length) {
        showToast("Add at least one item");
        return;
    }

    const payload = {
        userId: currentUser.id,
        pickupAddress,
        dropoffAddress,
        pickupDate: collectionDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        collectionContact: getValue("collectionContact"),
        deliveryContact: getValue("deliveryContact"),
        referenceLabel: getValue("referenceLabel"),
        notes: getValue("createOrderNotes"),
        items: selected.map(({ item, quantity }) => ({
            itemId: item.id,
            quantity
        }))
    };

    try {
        submitButton.disabled = true;
        submitButton.textContent = "Creating...";

        const createdOrder = await bringAuth("/user-orders", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        userOrders = [createdOrder, ...userOrders.filter(order => order.id !== createdOrder.id)];
        userAddresses = await bringAuth(`/user-addresses/user/${currentUser.id}`);
        resetCreateOrderForm(false);
        renderAll();
        showToast(`Order created: ${createdOrder.trackingNumber || `#${createdOrder.id}`}`);
        openDashboardCheckout(createdOrder.id, "active");
    } catch (error) {
        console.error("Create order failed:", error);
        showToast(error.message || "Order could not be created");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create Order";
    }
}

function resetCreateOrderForm(showMessage) {
    selectedItems.clear();
    setValue("createPickupAddress", "");
    setValue("createDropoffAddress", "");
    setValue("collectionContact", "");
    setValue("deliveryContact", "");
    setValue("referenceLabel", "");
    setValue("createOrderNotes", "");
    renderSelectedItems();

    if (showMessage) {
        showToast("Create order form cleared");
    }
}

function updateCreateTotals() {
    const selected = getSelectedItems();
    const pieces = selected.reduce((sum, row) => sum + row.quantity, 0);
    const subtotal = selected.reduce((sum, row) => {
        return sum + Number(row.item.basePrice || 0) * row.quantity;
    }, 0);
    const discount = getDiscountPercent();
    const discountAmount = subtotal * discount / 100;
    const serviceFee = subtotal * USER_ORDER_FEE_PERCENT / 100;
    const total = subtotal - discountAmount + serviceFee;

    setValue("createPiecesTotal", pieces);
    setText("createSubtotal", formatCurrency(subtotal));
    setText("createDiscountAmount", `-${formatCurrency(discountAmount)}`);
    setText("createServiceFeeAmount", formatCurrency(serviceFee));
    setText("createOrderTotal", formatCurrency(total));
    setText("createDiscountLabel", `Personal discount (${formatPercent(discount)})`);
}

function getSelectedItems() {
    return [...selectedItems.entries()]
        .map(([itemId, quantity]) => ({
            item: catalogItems.find(item => Number(item.id) === Number(itemId)),
            quantity
        }))
        .filter(row => row.item && row.quantity > 0);
}

/* =========================
   ORDER DETAILS / TRACKING
========================= */

function initTrackingControls() {
    const trackingButton = document.getElementById("dashboardTrackingButton");
    const trackingInput = document.getElementById("dashboardTrackingInput");

    trackingButton?.addEventListener("click", trackDashboardOrderFromInput);
    trackingInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            trackDashboardOrderFromInput();
        }
    });

    document.addEventListener("click", event => {
        const chip = event.target.closest(".tracking-chip");
        if (chip) {
            const orderId = Number(chip.dataset.orderId);
            const order = findOrderById(orderId);

            if (order) {
                dashboardTrackingOrderId = order.id;
                setValue("dashboardTrackingInput", order.trackingNumber || "");
                renderTrackingPage();
            }
            return;
        }

        const backButton = event.target.closest("[data-order-back]");
        if (backButton) {
            showPage(backButton.dataset.orderBack || lastOrderListPage || "active", null);
            return;
        }

        const detailTrackButton = event.target.closest("[data-detail-track]");
        if (detailTrackButton) {
            const orderId = Number(detailTrackButton.dataset.orderId);
            const order = findOrderById(orderId);

            if (order) {
                const params = new URLSearchParams({ orderId: String(order.id) });
                showPage("tracking", null, params);
            }
        }
    });
}

function renderTrackingPage() {
    if (!dashboardTrackingOrderId && userOrders.length) {
        dashboardTrackingOrderId = userOrders[0].id;
    }

    renderTrackingRecentOrders();

    const resultContainer = document.getElementById("dashboardTrackingResult");
    if (!resultContainer) return;

    const selectedOrder = findOrderById(dashboardTrackingOrderId);

    if (!selectedOrder) {
        resultContainer.innerHTML = renderTrackingMessage(
            "No orders ready for tracking",
            "New business orders will appear here after they are created."
        );
        return;
    }

    if (isInitialDashboardTrackingRender) {
        setValue("dashboardTrackingInput", "");
        isInitialDashboardTrackingRender = false;
    } else {
        setValue("dashboardTrackingInput", selectedOrder.trackingNumber || "");
    }

    resultContainer.innerHTML = renderOrderInsight(selectedOrder, "tracking");
}

function renderTrackingRecentOrders() {
    const container = document.getElementById("dashboardTrackingRecent");
    if (!container) return;

    const latestOrders = userOrders.slice(0, 6);

    if (!latestOrders.length) {
        container.innerHTML = `<div class="empty-state compact">No recent orders yet.</div>`;
        return;
    }

    container.innerHTML = latestOrders.map(order => {
        const status = normalizeOrderStatus(order);
        const active = String(order.id) === String(dashboardTrackingOrderId) ? "active" : "";

        return `
            <button class="tracking-chip ${active}" type="button" data-order-id="${order.id}">
                <span>#${order.id}</span>
                <strong>${escapeHtml(order.trackingNumber || "Tracking pending")}</strong>
                <em>${escapeHtml(formatStatus(status))}</em>
            </button>
        `;
    }).join("");
}

function renderTrackingMessage(title, copy) {
    return `
        <div class="panel tracking-empty-card">
            <div class="tracking-empty-icon">?</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(copy)}</p>
        </div>
    `;
}

async function trackDashboardOrderFromInput() {
    const input = document.getElementById("dashboardTrackingInput");
    const button = document.getElementById("dashboardTrackingButton");
    const cleanNumber = input?.value.trim() || "";
    const resultContainer = document.getElementById("dashboardTrackingResult");

    if (!cleanNumber) {
        if (resultContainer) {
            resultContainer.innerHTML = renderTrackingMessage(
                "Tracking number required",
                "Use the tracking number generated for a business order."
            );
        }
        return;
    }

    let order = findOrderByTrackingNumber(cleanNumber);

    try {
        if (!order) {
            if (button) {
                button.disabled = true;
                button.textContent = "Checking...";
            }

            if (resultContainer) {
                resultContainer.innerHTML = renderTrackingMessage(
                    "Checking tracking",
                    "Loading the latest status for this order."
                );
            }

            order = await bringAuth(`/user-orders/tracking/${encodeURIComponent(cleanNumber)}`);
        }

        if (!order || !order.id || !canViewOrder(order)) {
            if (resultContainer) {
                resultContainer.innerHTML = renderTrackingMessage(
                    "Tracking number not found",
                    "Check the number and try again."
                );
            }
            return;
        }

        mergeOrder(order);
        dashboardTrackingOrderId = order.id;
        renderOrders();
        renderTrackingPage();
    } catch (error) {
        console.error("Dashboard tracking failed:", error);
        if (resultContainer) {
            resultContainer.innerHTML = renderTrackingMessage(
                "Tracking unavailable",
                error.message || "The order status could not be loaded."
            );
        }
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Track";
        }
    }
}

function initCheckoutControls() {
    document.addEventListener("click", event => {
        const payButton = event.target.closest("[data-pay-order]");
        if (payButton) {
            event.preventDefault();
            event.stopPropagation();

            const orderId = Number(payButton.dataset.orderId);
            const returnPage = currentDashboardPage();
            openDashboardCheckout(orderId, returnPage === "checkout" ? checkoutReturnPage : returnPage);
            return;
        }

        const checkoutBack = event.target.closest("[data-checkout-back]");
        if (checkoutBack) {
            event.preventDefault();
            const order = findOrderById(checkoutOrderId);

            if (checkoutReturnPage === "order-details" && order) {
                openOrderDetails(order.id);
            } else {
                showPage(checkoutReturnPage || "active", null);
            }
        }
    });

    document.addEventListener("submit", event => {
        const form = event.target.closest("#dashboardCheckoutForm");
        if (!form) return;

        event.preventDefault();
        submitDashboardPayment(form);
    });
}

function openDashboardCheckout(orderId, returnPage = "active") {
    const order = findOrderById(orderId);

    if (!order) {
        showToast("Order could not be found");
        return;
    }

    const container = document.getElementById("dashboardCheckoutContainer");
    if (currentDashboardPage() !== "checkout" || !container) {
        const params = new URLSearchParams({
            orderId: String(order.id),
            return: returnPage || "active"
        });
        navigateDashboardPage("checkout", params);
        return;
    }

    if (hasConfirmedPayment(order)) {
        showToast("This order is already paid");
        openOrderDetails(order.id);
        return;
    }

    checkoutOrderId = order.id;
    checkoutReturnPage = returnPage || "active";
    renderDashboardCheckout(order);
    showPage("checkout", null);
}

function renderDashboardCheckout(order) {
    const container = document.getElementById("dashboardCheckoutContainer");
    if (!container) return;

    const items = orderItems(order);

    container.innerHTML = `
        <div class="checkout-dashboard-grid">
            <article class="panel checkout-summary-panel">
                <div class="panel-header">
                    <div>
                        <span class="panel-title">Order #${order.id}</span>
                        <p class="panel-sub-copy">${escapeHtml(order.trackingNumber || "Tracking pending")}</p>
                    </div>
                    <span class="status-badge ${orderStatusClass(normalizeOrderStatus(order))}">
                        ${escapeHtml(formatStatus(normalizeOrderStatus(order)))}
                    </span>
                </div>

                <div class="checkout-summary-body">
                    <div class="checkout-amount">
                        <span>Total to pay</span>
                        <strong>${formatCurrency(order.totalPrice)}</strong>
                    </div>

                    <dl class="order-detail-list compact checkout-route-list">
                        ${renderDetailRow("Collection", getPickupAddress(order) || "Not set")}
                        ${renderDetailRow("Delivery", getDropoffAddress(order) || "Not set")}
                        ${renderDetailRow("Pickup date", order.pickupDate ? formatDate(order.pickupDate) : "Pending")}
                        ${renderDetailRow("Delivery date", order.deliveryDate ? formatDate(order.deliveryDate) : "Pending")}
                    </dl>

                    <div class="checkout-items-mini">
                        <div class="tracking-section-title">Items</div>
                        ${items.length ? items.map(item => `
                            <div class="checkout-mini-item">
                                <span>${escapeHtml(item.name)} x${item.quantity}</span>
                                <strong>${formatCurrency(item.price)}</strong>
                            </div>
                        `).join("") : `<div class="empty-state compact">No items recorded for this order.</div>`}
                    </div>
                </div>
            </article>

            <article class="panel checkout-payment-panel">
                <div class="panel-header">
                    <span class="panel-title">Card Payment</span>
                    <span class="panel-sub-note">Secure checkout</span>
                </div>

                <form id="dashboardCheckoutForm" class="dashboard-payment-form">
                    <div class="form-group">
                        <label class="form-label">Card number</label>
                        <input class="form-input" name="cardNumber" inputmode="numeric" autocomplete="cc-number"
                            placeholder="1234 1234 1234 1234" required>
                    </div>

                    <div class="payment-form-grid">
                        <div class="form-group">
                            <label class="form-label">Expiry date</label>
                            <input class="form-input" name="expiry" autocomplete="cc-exp"
                                placeholder="MM / YY" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Security code</label>
                            <input class="form-input" name="cvc" inputmode="numeric" autocomplete="cc-csc"
                                placeholder="CVC" required>
                        </div>
                    </div>

                    <label class="checkout-check-line">
                        <input type="checkbox" required>
                        <span>I confirm this payment for order #${order.id}.</span>
                    </label>

                    <div class="btn-row checkout-actions">
                        <button class="btn-submit" id="dashboardPayButton" type="submit">
                            Pay ${formatCurrency(order.totalPrice)}
                        </button>
                        <button class="btn-submit dark" type="button" data-checkout-back>Back</button>
                    </div>
                </form>
            </article>
        </div>
    `;
}

async function submitDashboardPayment(form) {
    const order = findOrderById(checkoutOrderId);
    const payButton = document.getElementById("dashboardPayButton");

    if (!order) {
        showToast("Order could not be found");
        return;
    }

    if (hasConfirmedPayment(order)) {
        showToast("This order is already paid");
        openOrderDetails(order.id);
        return;
    }

    const cardNumber = String(new FormData(form).get("cardNumber") || "").replace(/\D/g, "");

    if (cardNumber.length < 12) {
        showToast("Check the card number");
        return;
    }

    try {
        if (payButton) {
            payButton.disabled = true;
            payButton.textContent = "Processing...";
        }

        const result = await bringAuth("/user-payments", {
            method: "POST",
            body: JSON.stringify({
                orderId: order.id,
                method: "card",
                cardLast4: cardNumber.slice(-4)
            })
        });

        if (result?.order) {
            mergeOrder(result.order);
        }

        renderDashboardStats();
        renderOrders();
        renderTrackingPage();
        showToast("Payment completed");
        openOrderDetails(order.id);
    } catch (error) {
        console.error("Payment failed:", error);
        showToast(error.message || "Payment failed");
    } finally {
        if (payButton) {
            payButton.disabled = false;
            payButton.textContent = `Pay ${formatCurrency(order.totalPrice)}`;
        }
    }
}

function renderPaymentAction(order) {
    if (hasConfirmedPayment(order)) {
        return `<span class="payment-confirmed-pill">Paid</span>`;
    }

    return `
        <button class="hero-pay-btn" type="button" data-pay-order data-order-id="${order.id}">
            Pay now
        </button>
    `;
}

function openOrderDetails(orderId) {
    const order = findOrderById(orderId);

    if (!order) {
        showToast("Order could not be found");
        return;
    }

    const container = document.getElementById("orderDetailsContainer");
    if (currentDashboardPage() !== "order-details" || !container) {
        const params = new URLSearchParams({
            orderId: String(order.id),
            return: lastOrderListPage || "active"
        });
        navigateDashboardPage("order-details", params);
        return;
    }

    container.innerHTML = `
        <div class="order-detail-toolbar">
            <button class="detail-back-btn" type="button" data-order-back="${escapeHtml(lastOrderListPage)}">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>
            <button class="detail-track-btn" type="button" data-detail-track data-order-id="${order.id}">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Track
            </button>
            ${!hasConfirmedPayment(order) ? `
                <button class="detail-pay-btn" type="button" data-pay-order data-order-id="${order.id}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay now
                </button>
            ` : ""}
        </div>
        ${renderOrderInsight(order, "details")}
    `;

    showPage("order-details", null);
    setText("topbar-title", `Order #${order.id}`);
    setText("topbar-sub", `${order.trackingNumber || "Tracking pending"} | ${formatStatus(normalizeOrderStatus(order))}`);
}

function renderOrderInsight(order, mode) {
    const status = normalizeOrderStatus(order);
    const tracking = order.trackingNumber || "Tracking pending";
    const modeClass = mode === "tracking" ? "is-tracking" : "is-details";

    return `
        <div class="order-insight ${modeClass}">
            <article class="panel order-hero-panel">
                <div class="order-hero-main">
                    <div class="order-detail-kicker">${escapeHtml(tracking)}</div>
                    <h3 class="order-detail-heading">Order #${order.id}</h3>
                    <p class="order-current-location">${escapeHtml(getCurrentLocation(order, status))}</p>
                </div>
                <div class="order-hero-status">
                    <span class="status-badge ${orderStatusClass(status)}">${escapeHtml(formatStatus(status))}</span>
                    <strong>${formatCurrency(order.totalPrice)}</strong>
                    ${renderPaymentAction(order)}
                </div>
                <div class="order-detail-meta-grid">
                    ${renderMetaCell("ETA", getEta(order, status))}
                    ${renderMetaCell("Pickup", order.pickupDate ? formatDate(order.pickupDate) : "Pending")}
                    ${renderMetaCell("Delivery", order.deliveryDate ? formatDate(order.deliveryDate) : "Pending")}
                    ${renderMetaCell("Payment", getPaymentText(order))}
                </div>
            </article>

            <div class="order-detail-main-grid">
                <article class="panel order-progress-panel">
                    <div class="panel-header">
                        <span class="panel-title">Progress</span>
                        <span class="panel-sub-note">${escapeHtml(formatStatus(status))}</span>
                    </div>
                    <ol class="order-timeline">
                        ${renderOrderTimeline(order, status)}
                    </ol>
                </article>

                <div class="order-detail-side-grid">
                    <article class="panel">
                        <div class="panel-header">
                            <span class="panel-title">Route</span>
                        </div>
                        <dl class="order-detail-list">
                            ${renderDetailRow("Collection", getPickupAddress(order) || "Not set")}
                            ${renderDetailRow("Delivery", getDropoffAddress(order) || "Not set")}
                            ${renderDetailRow("Pieces", String(order.pieces || orderItems(order).length || 0))}
                            ${renderDetailRow("Last update", formatDateTime(order.updatedAt || order.createdAt))}
                        </dl>
                    </article>

                    <article class="panel">
                        <div class="panel-header">
                            <span class="panel-title">Items</span>
                        </div>
                        <div class="order-items-list">
                            ${renderOrderItems(order)}
                        </div>
                    </article>

                    <article class="panel">
                        <div class="panel-header">
                            <span class="panel-title">Notes</span>
                        </div>
                        <dl class="order-detail-list compact">
                            ${renderOrderNotes(order)}
                        </dl>
                    </article>
                </div>
            </div>
        </div>
    `;
}

function renderMetaCell(label, value) {
    return `
        <div>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value || "Pending")}</strong>
        </div>
    `;
}

function renderDetailRow(label, value) {
    return `
        <div>
            <dt>${escapeHtml(label)}</dt>
            <dd>${escapeHtml(value || "Pending")}</dd>
        </div>
    `;
}

function renderOrderTimeline(order, status) {
    if (status === "CANCELLED") {
        return `
            ${renderTimelineStep(0, orderProgressSteps[0], "is-complete", formatDateTime(order.createdAt))}
            ${renderTimelineStep(1, {
                title: "Order cancelled",
                description: "This business order is no longer active."
            }, "is-active is-cancelled", formatDateTime(order.updatedAt))}
        `;
    }

    const activeIndex = orderStatusIndex[status] ?? 0;

    return orderProgressSteps.map((step, index) => {
        const className = index < activeIndex
            ? "is-complete"
            : index === activeIndex
                ? "is-active"
                : "";
        const date = getStepDate(order, index, index <= activeIndex);

        return renderTimelineStep(index, getProgressStepForOrder(order, step, index), className, date);
    }).join("");
}

function getProgressStepForOrder(order, step, index) {
    if (index !== 1) return step;

    return hasConfirmedPayment(order)
        ? {
            ...step,
            title: "Payment confirmed",
            description: "Payment is confirmed and the order is ready for scheduling."
        }
        : {
            ...step,
            title: "Payment pending",
            description: "Payment has not been completed yet, so this order will not move forward."
        };
}

function renderTimelineStep(index, step, className, date) {
    const label = className.includes("is-complete")
        ? "Completed"
        : className.includes("is-active")
            ? "Current"
            : "Next";

    return `
        <li class="order-timeline-step ${className}">
            <div class="timeline-dot">${className.includes("is-complete") ? "" : index + 1}</div>
            <div class="timeline-copy-wrap">
                <div class="timeline-title-row">
                    <h4>${escapeHtml(step.title)}</h4>
                    <span>${escapeHtml(label)}</span>
                </div>
                <p>${escapeHtml(step.description)}</p>
                ${date ? `<div class="timeline-date">${escapeHtml(date)}</div>` : ""}
            </div>
        </li>
    `;
}

function renderOrderItems(order) {
    const items = orderItems(order);

    if (!items.length) {
        return `<div class="empty-state compact">No items recorded for this order.</div>`;
    }

    return items.map(item => `
        <div class="order-detail-item">
            <div>
                <div class="order-detail-item-name">${escapeHtml(item.name)}</div>
                <div class="order-detail-item-meta">${escapeHtml(item.category || "Item")} | Qty ${item.quantity}</div>
            </div>
            <strong>${formatCurrency(item.price)}</strong>
        </div>
    `).join("");
}

function renderOrderNotes(order) {
    const details = order.details || {};
    const rows = [
        ["Pickup parking", details.pickupParking],
        ["Dropoff parking", details.dropoffParking],
        ["Pickup floor", details.pickupFloor],
        ["Dropoff floor", details.dropoffFloor],
        ["Pickup steps", details.pickupSteps],
        ["Dropoff steps", details.dropoffSteps],
        ["Notes", details.notes]
    ].filter(([, value]) => value !== undefined && value !== null && value !== "");

    if (!rows.length) {
        return renderDetailRow("Details", "No extra notes for this order.");
    }

    return rows.map(([label, value]) => {
        const text = label === "Notes"
            ? String(value)
            : typeof value === "boolean"
                ? value ? "Yes" : "No"
                : formatEnum(value) || String(value);
        return renderDetailRow(label, text);
    }).join("");
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

    if (!order.itemName) return [];

    return [{
        name: order.itemName,
        category: "Business order",
        quantity: Number(order.pieces || 1),
        price: Number(order.totalPrice || 0)
    }];
}

function normalizeOrderStatus(order) {
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

function orderStatusClass(status) {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "CANCELLED") return "status-cancelled";
    if (normalized === "DELIVERED") return "status-delivered";
    if (normalized === "PENDING_PAYMENT" || normalized === "DRAFT") return "status-pending";

    return "status-processing";
}

function getCurrentLocation(order, status) {
    const pickup = getPickupAddress(order) || "the collection address";
    const dropoff = getDropoffAddress(order) || "the delivery address";

    switch (status) {
        case "DRAFT":
        case "PENDING_PAYMENT":
            return "The order is waiting for payment confirmation.";
        case "PAID":
            return `Payment is confirmed. The order is waiting for collection at ${pickup}.`;
        case "PROCESSING":
            return `The team is preparing collection from ${pickup}.`;
        case "COLLECTED":
            return "The items have been collected and are being prepared for transit.";
        case "IN_TRANSIT":
            return `The order is on the road to ${dropoff}.`;
        case "DELIVERED":
            return `The order has arrived at ${dropoff}.`;
        case "CANCELLED":
            return "This order has been cancelled.";
        default:
            return "The latest delivery status is being updated.";
    }
}

function getEta(order, status) {
    if (status === "CANCELLED") return "No ETA";
    if (status === "DELIVERED") return formatDate(order.deliveryDate || order.updatedAt) || "Delivered";
    if (order.deliveryDate) return `Expected ${formatDate(order.deliveryDate)}`;
    if (order.pickupDate) return `Collection ${formatDate(order.pickupDate)}`;

    return "Pending";
}

function getStepDate(order, index, isReached) {
    const latestPayment = getLatestPayment(order);

    if (index === 0) return formatDateTime(order.createdAt);
    if (index === 1 && !hasConfirmedPayment(order)) return "";
    if (index === 1) return formatDateTime(latestPayment?.paidAt || latestPayment?.createdAt);
    if (index === 3) return formatDate(order.pickupDate);
    if (index === 5) return formatDate(order.deliveryDate);
    if (isReached) return formatDateTime(order.updatedAt);

    return "";
}

function getPaymentText(order) {
    const status = formatStatus(order.paymentStatus || getLatestPayment(order)?.status || "NOT_PAID");
    const amount = Number(order.totalPrice || getLatestPayment(order)?.amount || 0);

    return amount > 0 ? `${status} | ${formatCurrency(amount)}` : status;
}

function hasConfirmedPayment(order) {
    const paymentStatus = String(order?.paymentStatus || getLatestPayment(order)?.status || "").toUpperCase();
    return paymentStatus === "PAID";
}

function getLatestPayment(order) {
    if (!Array.isArray(order.payments) || !order.payments.length) return null;

    return [...order.payments].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })[0];
}

function getPickupAddress(order) {
    return addressText(order.pickupAddress);
}

function getDropoffAddress(order) {
    return addressText(order.dropoffAddress);
}

function addressText(value) {
    if (!value) return "";
    if (typeof value === "string") return value;

    return [value.address, value.city, value.postcode]
        .filter(Boolean)
        .join(", ");
}

function formatEnum(value) {
    return String(value || "")
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatDateTime(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function findOrderById(orderId) {
    return userOrders.find(order => String(order.id) === String(orderId));
}

function findOrderByTrackingNumber(trackingNumber) {
    const cleanNumber = String(trackingNumber || "").trim().toLowerCase();

    return userOrders.find(order => {
        return String(order.trackingNumber || "").trim().toLowerCase() === cleanNumber;
    });
}

function canViewOrder(order) {
    if (!currentUser) return false;
    if (Number(order.userId) === Number(currentUser.id)) return true;

    const role = String(currentUser.role || "").toUpperCase();
    return role === "ADMIN";
}

function mergeOrder(order) {
    const existingIndex = userOrders.findIndex(item => String(item.id) === String(order.id));

    if (existingIndex >= 0) {
        userOrders = userOrders.map(item => String(item.id) === String(order.id) ? order : item);
    } else {
        userOrders = [order, ...userOrders];
    }
}

/* =========================
   NAVIGATION
========================= */

function currentDashboardPage() {
    return document.body.dataset.dashboardPage
        || document.querySelector(".page.active")?.id?.replace("page-", "")
        || "home";
}

function dashboardPageUrl(id, params = null) {
    const baseUrl = pageUrls[id] || pageUrls.home;
    const query = params instanceof URLSearchParams
        ? params.toString()
        : new URLSearchParams(params || {}).toString();

    return query ? `${baseUrl}?${query}` : baseUrl;
}

function navigateDashboardPage(id, params = null) {
    window.location.href = dashboardPageUrl(id, params);
}

function showPage(id, btn, params = null) {
    if (currentDashboardPage() !== id && pageUrls[id]) {
        navigateDashboardPage(id, params);
        return;
    }

    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));

    const page = document.getElementById("page-" + id);
    if (!page) return;

    page.classList.add("active");
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));

    if (btn) {
        btn.classList.add("active");
    } else {
        const navButton = document.querySelector(`.nav-item[data-dashboard-nav="${id}"]`);
        navButton?.classList.add("active");
    }

    const [title, subtitle] = pageTitles[id] || ["Dashboard", ""];
    setText("topbar-title", title);
    setText("topbar-sub", subtitle);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

window.showPage = showPage;

function renderDashboardTitle(name = "User") {
    const page = currentDashboardPage();

    if (page === "home") {
        setText("topbar-title", `Welcome back, ${name}`);
        setText("topbar-sub", "Track, Manage, and Forecast Deliveries with Ease.");
        return;
    }

    const [title, subtitle] = pageTitles[page] || pageTitles.home;
    setText("topbar-title", title);
    setText("topbar-sub", subtitle);
}

function hydrateDashboardRoute() {
    const page = currentDashboardPage();
    const params = new URLSearchParams(window.location.search);
    const orderId = Number(params.get("orderId"));
    const returnPage = params.get("return");

    if (returnPage && pageUrls[returnPage]) {
        lastOrderListPage = returnPage;
        checkoutReturnPage = returnPage;
    }

    if (page === "tracking") {
        const routeOrderId = Number(params.get("orderId"));
        if (routeOrderId) {
            dashboardTrackingOrderId = routeOrderId;
            renderTrackingPage();
        }
    }

    if (page === "order-details" && orderId) {
        openOrderDetails(orderId);
    }

    if (page === "checkout" && orderId) {
        openDashboardCheckout(orderId, returnPage || "active");
    }

    renderDashboardTitle(currentUser?.username || "User");
}

/* =========================
   CHART
========================= */

function initChart() {
    const chart = document.getElementById("chart1");
    if (!chart) return;

    const monthlyOrders = Array(12).fill(0);

    userOrders.forEach(order => {
        const date = orderDate(order);
        if (!date) return;
        monthlyOrders[date.getMonth()]++;
    });

    const max = Math.max(...monthlyOrders, 1);

    chart.innerHTML = monthlyOrders.map((value, index) => {
        const height = value === 0 ? 8 : Math.round((value / max) * 38);
        const active = index === new Date().getMonth() ? "active" : "";

        return `
            <div class="bar ${active}" style="height:${height}px">
                <div class="bar-tooltip">${value} orders</div>
            </div>
        `;
    }).join("");
}

/* =========================
   CALENDAR
========================= */

function renderMiniCalendar(containerId, viewDate, selectedDate, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    let html = `
        <div class="cal-header">
            <button class="cal-nav cal-prev" type="button" data-type="${type}">&lsaquo;</button>
            <span class="cal-month">${months[month]} ${year}</span>
            <button class="cal-nav cal-next" type="button" data-type="${type}">&rsaquo;</button>
        </div>

        <div class="cal-grid">
            ${weekDays.map(day => `<div class="cal-day-label">${day}</div>`).join("")}
    `;

    for (let i = startDay - 1; i >= 0; i--) {
        html += `<div class="cal-day grey">${daysInPrevMonth - i}</div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const isPast = currentDate < today;
        const active = isSameDate(currentDate, selectedDate)
            ? type === "collection" ? "active-orange" : "active-green"
            : "";
        const disabledClass = isPast ? "disabled-date" : "";
        const disabledAttr = isPast ? "disabled" : "";

        html += `
            <button
                class="date-btn ${active} ${disabledClass}"
                ${disabledAttr}
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
        html += `<div class="cal-day grey">${i}</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function renderCalendars() {
    renderMiniCalendar("collectionCalendar", collectionViewDate, collectionDate, "collection");
    renderMiniCalendar("deliveryCalendar", deliveryViewDate, deliveryDate, "delivery");
}

function initCalendar() {
    renderCalendars();

    document.addEventListener("click", event => {
        const target = event.target;

        if (target.classList.contains("cal-prev")) {
            const type = target.dataset.type;
            if (type === "collection") {
                collectionViewDate.setMonth(collectionViewDate.getMonth() - 1);
            } else {
                deliveryViewDate.setMonth(deliveryViewDate.getMonth() - 1);
            }
            renderCalendars();
        }

        if (target.classList.contains("cal-next")) {
            const type = target.dataset.type;
            if (type === "collection") {
                collectionViewDate.setMonth(collectionViewDate.getMonth() + 1);
            } else {
                deliveryViewDate.setMonth(deliveryViewDate.getMonth() + 1);
            }
            renderCalendars();
        }

        if (target.classList.contains("date-btn") && !target.classList.contains("disabled-date")) {
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
                const selectedDeliveryDate = new Date(year, month, day);
                if (selectedDeliveryDate > collectionDate) {
                    deliveryDate = selectedDeliveryDate;
                } else {
                    showToast("Delivery date must be after collection date");
                }
            }

            renderCalendars();
        }
    });
}

/* =========================
   SEARCH / ROW EVENTS
========================= */

function initOrderRows() {
    document.addEventListener("click", event => {
        if (event.target.closest("[data-pay-order]")) return;

        const row = event.target.closest(".order-row[data-open-details='true']");
        if (!row) return;

        const order = userOrders.find(item => String(item.id) === String(row.dataset.orderId));
        if (order) {
            lastOrderListPage = getOrderListPageFromRow(row);
            openOrderDetails(order.id);
        }
    });

    document.addEventListener("keydown", event => {
        const row = event.target.closest?.(".order-row[data-open-details='true']");
        if (!row || (event.key !== "Enter" && event.key !== " ")) return;

        event.preventDefault();
        const order = userOrders.find(item => String(item.id) === String(row.dataset.orderId));
        if (order) {
            lastOrderListPage = getOrderListPageFromRow(row);
            openOrderDetails(order.id);
        }
    });
}

function getOrderListPageFromRow(row) {
    if (row.closest("#recentOrdersContainer")) return "home";
    if (row.closest("#historyOrdersContainer")) return "history";

    return "active";
}

function initSearch() {
    const ordersSearch = document.getElementById("ordersSearch");
    if (!ordersSearch) return;

    ordersSearch.addEventListener("input", function () {
        const value = this.value.toLowerCase().trim();

        document.querySelectorAll(".order-row").forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(value) ? "" : "none";
        });
    });
}

/* =========================
   HELPERS
========================= */

function setText(id, value) {
    document.querySelectorAll(`[id="${id}"]`).forEach(element => {
        element.textContent = value;
    });
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || "";
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

window.showToast = showToast;

function formatCurrency(value) {
    return `${CURRENCY}${Number(value || 0).toFixed(2)}`;
}

function formatPercent(value) {
    const percent = Number(value || 0);
    return `${percent % 1 === 0 ? percent.toFixed(0) : percent.toFixed(2)}%`;
}

function formatDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return "No date";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatStatus(status) {
    return String(status || "")
        .toLowerCase()
        .split("_")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function orderDate(order) {
    const date = new Date(order.createdAt || order.created_at || order.date);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonth(date, monthDate) {
    if (!date) return false;

    return date.getMonth() === monthDate.getMonth()
        && date.getFullYear() === monthDate.getFullYear();
}

function isSameDate(a, b) {
    return a.getDate() === b.getDate()
        && a.getMonth() === b.getMonth()
        && a.getFullYear() === b.getFullYear();
}

function isActiveOrder(order) {
    return ACTIVE_STATUSES.has(order.status);
}

function orderItemSummary(order) {
    if (Array.isArray(order.items) && order.items.length) {
        return order.items
            .map(row => `${row.item?.name || "Item"} x${row.quantity}`)
            .join(", ");
    }

    return order.itemName || "Business order";
}

function getDiscountPercent() {
    const discount = Number(currentUser?.discountPercent || 0);
    if (!Number.isFinite(discount)) return 0;

    return Math.min(100, Math.max(0, discount));
}

function isBusinessUser() {
    const role = String(currentUser?.role || "").toUpperCase();
    return role.includes("BUSINESS") || role === "ADMIN";
}

/* =========================
   THEME SAFETY
========================= */

window.toggleTheme = window.toggleTheme || function () {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);

    const thumb = document.getElementById("themeThumb");
    if (thumb) {
        thumb.textContent = nextTheme === "dark" ? "Dark" : "Light";
    }
};
