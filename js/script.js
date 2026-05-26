document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       REVEAL ANIMATIONS
    ========================= */

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -50px 0px"
    });

    document
        .querySelectorAll(".reveal, .reveal-left, .reveal-right")
        .forEach(el => revealObserver.observe(el));


    /* =========================
       COVERAGE MAP ANIMATION
    ========================= */

    const map = document.querySelector(".coverage-map-card");

    if (map) {
        const mapObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                map.classList.add("visible");
                mapObserver.unobserve(map);
            }
        }, {
            threshold: 0.3
        });

        mapObserver.observe(map);
    }


    /* =========================
       COUNTER ANIMATION
    ========================= */

    function animateCounter(el, target, suffix = "") {
        const isDecimal = target % 1 !== 0;
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            el.textContent =
                (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    function initCounters(sectionSelector, numberSelector, threshold = 0.5) {
        const section = document.querySelector(sectionSelector);
        let done = false;

        if (!section) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !done) {
                done = true;

                section.querySelectorAll(numberSelector).forEach(num => {
                    const match = num.textContent.trim().match(/^([\d.]+)(.*)$/);

                    if (match) {
                        animateCounter(
                            num,
                            parseFloat(match[1]),
                            match[2]
                        );
                    }
                });
            }
        }, {
            threshold
        });

        observer.observe(section);
    }

    initCounters(".hero-stats", ".stat-num", 0.5);
    initCounters(".numbers", ".number-val", 0.4);


    /* =========================
       DASHBOARD TABS
    ========================= */

    document.querySelectorAll(".dash-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document
                .querySelectorAll(".dash-tab")
                .forEach(t => t.classList.remove("active"));

            tab.classList.add("active");
        });
    });

    document.querySelectorAll(".dash-nav-item").forEach(item => {
        item.addEventListener("click", () => {
            document
                .querySelectorAll(".dash-nav-item")
                .forEach(i => i.classList.remove("active"));

            item.classList.add("active");
        });
    });


    /* =========================
       SEARCH BUTTON
    ========================= */

    document.querySelector(".btn-search")?.addEventListener("click", () => {
        const inputs = document.querySelectorAll(".hero-search-bar input");

        if (!inputs[0]?.value.trim() || !inputs[1]?.value.trim()) {
            showToast("Please enter both pickup and drop-off addresses.", "error");
            return;
        }

        showToast("Getting your quote… 🚚", "success");
    });


    /* =========================
       TRACK BUTTON
    ========================= */

    document.querySelector(".track-btn")?.addEventListener("click", () => {
        const input = document.querySelector(".track-bar input");
        const value = input?.value.trim();

        if (!value) {
            showToast("Please enter a tracking number.", "error");
            return;
        }

        showToast("Searching for your parcel… 🔍", "success");
    });


    /* =========================
       CONTACT FORM
    ========================= */

    document.querySelector(".btn-submit")?.addEventListener("click", (e) => {
        e.preventDefault();

        const fields = document.querySelectorAll(
            ".contact-form input, .contact-form textarea"
        );

        let isValid = true;

        fields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
            }
        });

        if (!isValid) {
            showToast("Please fill in all required fields.", "error");
            return;
        }

        showToast("Message sent! We'll be in touch soon. ✅", "success");

        fields.forEach(field => {
            field.value = "";
        });
    });


    /* =========================
       COOKIE BANNER
    ========================= */

    initCookieBanner();
});


/* =========================
   TOAST
========================= */

function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");

    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add("toast-show");
        });
    });

    setTimeout(() => {
        toast.classList.remove("toast-show");

        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 3500);
}


/* =========================
   COOKIE LOGIC
========================= */

function initCookieBanner() {
    const banner = document.getElementById("cookieBanner");
    const modal = document.getElementById("cookieModal");

    const acceptBtn = document.getElementById("cookieAccept");
    const rejectBtn = document.getElementById("cookieReject");
    const customizeBtn = document.getElementById("cookieCustomize");

    const closeBtn = document.getElementById("cookieClose");
    const saveBtn = document.getElementById("cookieSave");
    const rejectModalBtn = document.getElementById("cookieRejectModal");
    const acceptAllModalBtn = document.getElementById("cookieAcceptAll");

    const analytics = document.getElementById("cookieAnalytics");
    const marketing = document.getElementById("cookieMarketing");

    if (!banner || !modal) return;

    const savedConsent = localStorage.getItem("cookieConsent");

    if (savedConsent) {
        banner.classList.add("hide");

        try {
            const prefs = JSON.parse(savedConsent);

            if (analytics) analytics.checked = prefs.analytics;
            if (marketing) marketing.checked = prefs.marketing;
        } catch {
            localStorage.removeItem("cookieConsent");
        }

        return;
    }

    function openModal() {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }

    function saveConsent(analyticsValue, marketingValue) {
        const preferences = {
            essential: true,
            analytics: analyticsValue,
            marketing: marketingValue,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem("cookieConsent", JSON.stringify(preferences));

        banner.classList.add("hide");
        closeModal();
    }

    acceptBtn?.addEventListener("click", () => {
        saveConsent(true, true);
    });

    rejectBtn?.addEventListener("click", () => {
        saveConsent(false, false);
    });

    customizeBtn?.addEventListener("click", openModal);

    acceptAllModalBtn?.addEventListener("click", () => {
        if (analytics) analytics.checked = true;
        if (marketing) marketing.checked = true;

        saveConsent(true, true);
    });

    saveBtn?.addEventListener("click", () => {
        saveConsent(
            analytics?.checked || false,
            marketing?.checked || false
        );
    });

    rejectModalBtn?.addEventListener("click", () => {
        if (analytics) analytics.checked = false;
        if (marketing) marketing.checked = false;

        saveConsent(false, false);
    });

    closeBtn?.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}
/* Database connection*/
const getQuoteBtn = document.getElementById("getQuoteBtn");

getQuoteBtn.addEventListener("click", () => {
    const pickupAddress = document.getElementById("pickupAddress").value.trim();
    const dropoffAddress = document.getElementById("dropoffAddress").value.trim();

    if (!pickupAddress || !dropoffAddress) {
        alert("Please enter both pickup and drop off addresses.");
        return;
    }

    localStorage.setItem("pickupAddress", pickupAddress);
    localStorage.setItem("dropoffAddress", dropoffAddress);

    window.location.href = "booking.html";
});