import { bringAuth } from "./fetch.js";

/* =========================
   DATABASE DATA
========================= */

let currentUser = null;
let userOrders = [];
let userAddresses = [];
let userClaims = [];

/* =========================
   PAGE TITLES
========================= */

const pageTitles = {
    home: ["Dashboard", "Track, Manage, and Forecast Deliveries with Ease."],
    create: ["Create New Order", "Fill in the details below to book your delivery."],
    active: ["Active Orders", "Shipments currently in progress."],
    history: ["Orders History", "Browse and search all your past orders."],
    addresses: ["My Addresses", "Manage your saved collection and delivery addresses."],
    discount: ["My Discount", "Your current pricing and discount level."],
    claim: ["Report a Claim", "Describe the issue and we'll look into it."],
    support: ["Support", "Get in touch with our team."],
    settings: ["Settings", "Manage your account and security settings."]
};

/* =========================
   START
========================= */

window.addEventListener("DOMContentLoaded", async () => {
    await loadDashboardData();

    initChart();
    initCalendar();
    initSearch();
    initOrderRows();
});

/* =========================
   LOAD DATA FROM DATABASE
========================= */

async function loadDashboardData() {
    try {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");

        if (!username || !token) {
            window.location.href = "log.html";
            return;
        }

        currentUser = await bringAuth(`/users/username/${username}`);
        userOrders = await bringAuth(`/user-orders/user/${currentUser.id}`);
        userAddresses = await bringAuth(`/user-addresses/user/${currentUser.id}`);
        userClaims = await bringAuth(`/user-claims/user/${currentUser.id}`);

        console.log("USER:", currentUser);
        console.log("ORDERS:", userOrders);
        console.log("ADDRESSES:", userAddresses);
        console.log("CLAIMS:", userClaims);

        renderDashboard();

    } catch (error) {
        console.error("Dashboard error:", error);
        showToast("Dashboard data could not be loaded");
    }
}

/* =========================
   RENDER DASHBOARD
========================= */

function renderDashboard() {
    const name = currentUser?.username || "User";

    setText("topbar-title", `Welcome back, ${name} 👋`);
    setText("topbar-sub", "Track, Manage, and Forecast Deliveries with Ease.");

    setText("sidebarUsername", name);
    setText("sidebarAvatar", name.substring(0, 2).toUpperCase());
    setText("sidebarUserRole", currentUser?.role || "Business Account");

    const activeOrders = userOrders.filter(order => order.status === "PROCESSING");

    setText("totalOrdersCount", userOrders.length);
    setText("activeOrdersCount", activeOrders.length);
    setText("activeOrdersBadge", activeOrders.length);
    setText("quickActiveCount", `${activeOrders.length} active`);

    const discount = Number(currentUser?.discountPercent || 0);

    setText("discountPercent", `${discount}%`);
    setText("discountPagePercent", `${discount}%`);

    const pendingOrders = userOrders.filter(order => {
        return order.isPaid === false || order.paymentStatus === "PENDING";
    });

    const pendingTotal = pendingOrders.reduce((sum, order) => {
        return sum + Number(order.totalPrice || order.total || order.price || 0);
    }, 0);

    setText("pendingPaymentAmount", `£${pendingTotal.toFixed(2)}`);
    setText("pendingPaymentCount", `${pendingOrders.length} unpaid`);
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

/* =========================
   PAGE NAVIGATION
========================= */

function showPage(id, btn) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById("page-" + id);

    if (!page) {
        console.error("Page not found:", "page-" + id);
        return;
    }

    page.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (btn) {
        btn.classList.add("active");
    } else {
        const navButton = document.querySelector(`.nav-item[onclick*="'${id}'"]`);

        if (navButton) {
            navButton.classList.add("active");
        }
    }

    const [title, subtitle] = pageTitles[id] || ["Dashboard", ""];

    setText("topbar-title", title);
    setText("topbar-sub", subtitle);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.showPage = showPage;

/* =========================
   MINI CHART
========================= */

function initChart() {
    const chart = document.getElementById("chart1");

    if (!chart) return;

    buildChart(chart, [38, 52, 45, 61, 55, 72, 69, 84, 77, 91, 88, 95]);
}

function buildChart(element, data) {
    const max = Math.max(...data);

    element.innerHTML = data.map((value, index) => {
        const height = Math.round((value / max) * 38);
        const active = index === data.length - 1 ? "active" : "";

        return `
            <div class="bar ${active}" style="height:${height}px">
                <div class="bar-tooltip">${value} orders</div>
            </div>
        `;
    }).join("");
}

/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

window.showToast = showToast;

/* =========================
   CALENDAR
========================= */

function initCalendar() {
    document.querySelectorAll(".cal-day:not(.grey)").forEach(day => {
        day.addEventListener("click", function () {
            const calendar = this.closest(".calendar-mini");

            if (!calendar) return;

            calendar.querySelectorAll(".cal-day").forEach(item => {
                item.classList.remove("today", "next-day");
            });

            const calendars = document.querySelectorAll(".calendar-mini");
            const selectedClass = calendar === calendars[0] ? "today" : "next-day";

            this.classList.add(selectedClass);
        });
    });
}

/* =========================
   ORDER ROW CLICK
========================= */

function initOrderRows() {
    document.querySelectorAll(".order-row").forEach(row => {
        row.addEventListener("click", () => {
            showToast("📋 Order details opened");
        });
    });
}

/* =========================
   SEARCH ORDERS
========================= */

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
        thumb.textContent = nextTheme === "dark" ? "🌙" : "☀️";
    }
};