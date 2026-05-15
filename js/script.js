const cta = document.querySelector(".floating-cta");
const footer = document.querySelector("footer"); 
/* ── THEME ── */
function toggleTheme() {
    const html = document.documentElement;
    const thumb = document.getElementById('themeThumb');
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    thumb.textContent = newTheme === 'light' ? '🌙' : '☀️';
}

(function applyTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('theme') || 'dark';
    const thumb = document.getElementById('themeThumb');
    if (thumb) thumb.textContent = saved === 'light' ? '🌙' : '☀️';

    /* ── MOBILE HAMBURGER ── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function closeMenu() {
        hamburger?.classList.remove('open');
        mobileMenu?.classList.remove('open');
        mobileOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('open');
            mobileOverlay?.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        mobileOverlay?.addEventListener('click', closeMenu);
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    }

    /* ── NAVBAR SCROLL ── */
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const nav = document.getElementById('navbar');
                if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    /* ── REVEAL ANIMATIONS ── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
function initReveal() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
        .forEach(el => revealObserver.observe(el));
}

initReveal();
const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            mapObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const map = document.querySelector(".coverage-map-card");
if (map) mapObserver.observe(map);

    /* ── COUNTER ANIMATION ── */
    function animateCounter(el, target, suffix) {
        const isDecimal = target % 1 !== 0;
        const duration = 1600;
        const startTime = performance.now();
        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Hero stats counter
    const heroStatsEl = document.querySelector('.hero-stats');
    let heroStatsDone = false;
    if (heroStatsEl) {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !heroStatsDone) {
                heroStatsDone = true;
                heroStatsEl.querySelectorAll('.stat-num').forEach(num => {
                    const m = num.textContent.trim().match(/^([\d.]+)(.*)$/);
                    if (m) animateCounter(num, parseFloat(m[1]), m[2]);
                });
            }
        }, { threshold: 0.5 }).observe(heroStatsEl);
    }

    // Numbers section counter
    const numbersSection = document.querySelector('.numbers');
    let numbersDone = false;
    if (numbersSection) {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !numbersDone) {
                numbersDone = true;
                numbersSection.querySelectorAll('.number-val').forEach(num => {
                    const m = num.textContent.trim().match(/^([\d.]+)(.*)$/);
                    if (m) animateCounter(num, parseFloat(m[1]), m[2]);
                });
            }
        }, { threshold: 0.4 }).observe(numbersSection);
    }

    /* ── DASHBOARD TABS ── */
    document.querySelectorAll('.dash-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    document.querySelectorAll('.dash-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.dash-nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    /* ── ACTIVE NAV LINK ── */
    const navLinks = document.querySelectorAll('.nav-links a');
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('nav-active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px' }).observe(document.querySelector('section[id]') || document.body);

    document.querySelectorAll('section[id]').forEach(s => {
        new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const id = entries[0].target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('nav-active', link.getAttribute('href') === '#' + id);
                });
            }
        }, { rootMargin: '-40% 0px -40% 0px' }).observe(s);
    });

    /* ── SEARCH BUTTON ── */
    document.querySelector('.btn-search')?.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.hero-search-bar input');
        if (!inputs[0]?.value.trim() || !inputs[1]?.value.trim()) {
            showToast('Please enter both pickup and drop-off addresses.', 'error');
            return;
        }
        showToast('Getting your quote… 🚚', 'success');
    });

    /* ── TRACK BUTTON ── */
    document.querySelector('.track-btn')?.addEventListener('click', () => {
        const val = document.querySelector('.track-bar input')?.value.trim();
        if (!val) { showToast('Please enter a tracking number.', 'error'); return; }
        showToast('Searching for your parcel… 🔍', 'success');
    });

    /* ── CONTACT FORM ── */
    document.querySelector('.btn-submit')?.addEventListener('click', (e) => {
        e.preventDefault();
        const fields = document.querySelectorAll('.contact-form input, .contact-form textarea');
        let ok = true;
        fields.forEach(f => { if (!f.value.trim()) ok = false; });
        if (!ok) { showToast('Please fill in all required fields.', 'error'); return; }
        showToast("Message sent! We'll be in touch soon. ✅", 'success');
        fields.forEach(f => f.value = '');
    });

    /* ── FLOATING CTA visibility ── */
    const floatingCta = document.querySelector('.floating-cta');
    if (floatingCta) {
        floatingCta.classList.add('cta-hidden');
        window.addEventListener('scroll', () => {
            floatingCta.classList.toggle('cta-hidden', window.scrollY < 400);
        }, { passive: true });
    }
});

/* ── TOAST ── */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-show')));
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

window.addEventListener("load", () => {
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

        const prefs = JSON.parse(savedConsent);
        if (analytics) analytics.checked = prefs.analytics;
        if (marketing) marketing.checked = prefs.marketing;

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

        console.log("Saved cookie preferences:", preferences);
    }

    acceptBtn.onclick = () => saveConsent(true, true);
    rejectBtn.onclick = () => saveConsent(false, false);

    customizeBtn.onclick = () => {
        const saved = localStorage.getItem("cookieConsent");

        if (saved) {
            const prefs = JSON.parse(saved);
            analytics.checked = prefs.analytics;
            marketing.checked = prefs.marketing;
        }

        openModal();
    };

    acceptAllModalBtn.onclick = () => {
        analytics.checked = true;
        marketing.checked = true;
        saveConsent(true, true);
    };

    saveBtn.onclick = () => {
        saveConsent(analytics.checked, marketing.checked);
    };

    rejectModalBtn.onclick = () => {
        analytics.checked = false;
        marketing.checked = false;
        saveConsent(false, false);
    };

    closeBtn.onclick = closeModal;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
});