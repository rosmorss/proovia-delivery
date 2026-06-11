const DASHBOARD_PAGE_TITLES = {
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

const dashboardLinks = {
    home: "dashboard.html",
    create: "dashboard-create.html",
    active: "dashboard-active.html",
    history: "dashboard-history.html",
    tracking: "dashboard-tracking.html",
    addresses: "dashboard-addresses.html",
    discount: "dashboard-discount.html",
    claim: "dashboard-claim.html",
    support: "dashboard-support.html",
    settings: "dashboard-settings.html"
};

const mobilePrimaryPages = new Set(["home", "create", "active"]);

const navGroups = [
    {
        label: "Main",
        items: [
            {
                page: "home",
                label: "Home",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`
            },
            {
                page: "create",
                label: "Create Order",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />`
            },
            {
                page: "active",
                label: "Active Orders",
                badgeId: "activeOrdersBadge",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />`
            },
            {
                page: "history",
                label: "Orders History",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />`
            },
            {
                page: "tracking",
                label: "Tracking",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />`
            },
            {
                page: "addresses",
                label: "My Addresses",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />`
            },
            {
                page: "discount",
                label: "My Discount",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />`
            }
        ]
    },
    {
        label: "Support",
        className: "support-label",
        items: [
            {
                page: "claim",
                label: "Report a Claim",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`
            },
            {
                page: "support",
                label: "Support",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />`
            },
            {
                page: "settings",
                label: "Settings",
                icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`
            }
        ]
    }
];

function allDashboardNavItems() {
    return navGroups.flatMap(group => group.items);
}

function currentDashboardPage() {
    return document.body.dataset.dashboardPage || "home";
}

function renderNavItem(item, currentPage) {
    const active = item.page === currentPage ? " active" : "";
    const mobilePrimary = mobilePrimaryPages.has(item.page) ? " mobile-primary" : "";
    const badge = item.badgeId ? `<span class="nav-badge" id="${item.badgeId}">0</span>` : "";

    return `
        <a class="nav-item${mobilePrimary}${active}" href="${dashboardLinks[item.page]}" data-dashboard-nav="${item.page}">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${item.icon}
            </svg>
            ${item.label}
            ${badge}
        </a>
    `;
}

function renderMobileMoreItem(item, currentPage) {
    const active = item.page === currentPage ? " active" : "";

    return `
        <a class="mobile-more-item${active}" href="${dashboardLinks[item.page]}" data-dashboard-nav="${item.page}">
            <svg class="mobile-more-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${item.icon}
            </svg>
            <span>${item.label}</span>
        </a>
    `;
}

function renderSidebar(currentPage) {
    const secondaryItems = allDashboardNavItems().filter(item => !mobilePrimaryPages.has(item.page));
    const mobileMoreActive = secondaryItems.some(item => item.page === currentPage) ? " active" : "";
    const nav = navGroups.map(group => `
        <div class="nav-section-label ${group.className || ""}">${group.label}</div>
        ${group.items.map(item => renderNavItem(item, currentPage)).join("")}
    `).join("");

    const createActive = currentPage === "create" ? " active" : "";

    return `
        <aside class="sidebar">
            <div class="sidebar-logo">
                <a href="index.html">
                    <img src="photo/logo.png" alt="Proovia" class="logo-img">
                </a>
                <span class="logo-sub">Business Portal</span>
            </div>

            <div class="sidebar-user">
                <div class="user-avatar" id="sidebarAvatar">U</div>
                <div>
                    <div class="user-name" id="sidebarUsername">Loading...</div>
                    <div class="user-role" id="sidebarUserRole">Business Account</div>
                </div>
            </div>

            <nav class="sidebar-nav">
                ${nav}
                <button class="nav-item mobile-more-toggle${mobileMoreActive}" type="button"
                    aria-expanded="false" aria-controls="dashboardMobileMore" data-mobile-more-toggle>
                    <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="5" cy="12" r="2.2" />
                        <circle cx="12" cy="12" r="2.2" />
                        <circle cx="19" cy="12" r="2.2" />
                    </svg>
                    More
                </button>
            </nav>

            <div class="mobile-more-panel" id="dashboardMobileMore" aria-hidden="true">
                <div class="mobile-more-title">More</div>
                <div class="mobile-more-grid">
                    ${secondaryItems.map(item => renderMobileMoreItem(item, currentPage)).join("")}
                </div>
            </div>

            <div class="sidebar-bottom">
                <a class="btn-new-order${createActive}" href="dashboard-create.html" data-dashboard-nav="create">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Order
                </a>
            </div>
        </aside>
    `;
}

function renderTopbar(currentPage) {
    const [title, subtitle] = DASHBOARD_PAGE_TITLES[currentPage] || DASHBOARD_PAGE_TITLES.home;

    return `
        <div class="topbar">
            <a href="index.html" class="mobile-top-logo">
                <img src="photo/logo.png" alt="Proovia">
            </a>
            <div class="topbar-greeting">
                <h2 id="topbar-title">${title}</h2>
                <p id="topbar-sub">${subtitle}</p>
            </div>

            <div class="topbar-right">
                <div class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
                    <div class="theme-toggle-thumb" id="themeThumb">Dark</div>
                </div>

                <div class="topbar-search">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" stroke-linecap="round" stroke-width="2" />
                    </svg>
                    <input type="text" id="ordersSearch" placeholder="Search orders...">
                </div>

                <div class="icon-btn" title="Notifications" onclick="showToast('No new notifications')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <div class="notif-dot"></div>
                </div>
            </div>
        </div>
    `;
}

function mountDashboardShell() {
    const currentPage = currentDashboardPage();
    const sidebarMount = document.getElementById("dashboardSidebarMount");
    const topbarMount = document.getElementById("dashboardTopbarMount");

    if (sidebarMount) sidebarMount.outerHTML = renderSidebar(currentPage);
    if (topbarMount) topbarMount.outerHTML = renderTopbar(currentPage);
}

mountDashboardShell();

function setupMobileMoreMenu() {
    const sidebar = document.querySelector(".sidebar");
    const toggle = sidebar?.querySelector("[data-mobile-more-toggle]");
    const panel = sidebar?.querySelector("#dashboardMobileMore");

    if (!sidebar || !toggle || !panel) return;

    const setOpen = open => {
        sidebar.classList.toggle("mobile-more-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        panel.setAttribute("aria-hidden", String(!open));
    };

    toggle.addEventListener("click", event => {
        event.preventDefault();
        setOpen(!sidebar.classList.contains("mobile-more-open"));
    });

    panel.addEventListener("click", event => {
        if (event.target.closest("a")) {
            setOpen(false);
        }
    });

    document.addEventListener("click", event => {
        if (!sidebar.contains(event.target)) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            setOpen(false);
        }
    });
}

setupMobileMoreMenu();

window.DASHBOARD_PAGE_TITLES = DASHBOARD_PAGE_TITLES;
