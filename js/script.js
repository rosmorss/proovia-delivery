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

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });

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

/* page faq*/
const items = document.querySelectorAll(".faq-item");

items.forEach(item => {
  const question = item.querySelector(".faq-question");
  if (!question) return;

  question.onclick = () => {
    items.forEach(i => {
      if(i !== item){
        i.classList.remove("active");
        const span = i.querySelector("span");
        if (span) span.textContent = "+";
      }
    });

    item.classList.toggle("active");

    const icon = item.querySelector("span");
    if (icon) {
      icon.textContent = item.classList.contains("active") ? "−" : "+";
    }
  };
});

//terms
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;

    // close others
    document.querySelectorAll(".faq-item").forEach(i => {
      if (i !== item) i.classList.remove("active");
    });

    item.classList.toggle("active");
  });
});

// cookie
document.addEventListener("DOMContentLoaded", () => {

  const banner = document.getElementById("cookie-banner");
  const modal = document.getElementById("cookie-modal");

  const acceptAll = document.getElementById("acceptAll");
  const declineAll = document.getElementById("declineAll");
  const customizeBtn = document.getElementById("customizeBtn");

  const savePrefs = document.getElementById("savePrefs");
  const rejectAllModal = document.getElementById("rejectAllModal");

  const analyticsToggle = document.getElementById("analyticsToggle");
  const marketingToggle = document.getElementById("marketingToggle");

  if (!banner) return; // protecție

  if (localStorage.getItem("cookieConsent")) {
    banner.style.display = "none";
  }

  acceptAll.onclick = () => {
    localStorage.setItem("cookieConsent", "all");
    banner.style.display = "none";
  };

  declineAll.onclick = () => {
    localStorage.setItem("cookieConsent", "none");
    banner.style.display = "none";
  };

  customizeBtn.onclick = () => {
    modal.classList.add("active");
  };

  savePrefs.onclick = () => {
    const prefs = {
      analytics: analyticsToggle.checked,
      marketing: marketingToggle.checked
    };

    localStorage.setItem("cookieConsent", JSON.stringify(prefs));

    modal.classList.remove("active");
    banner.style.display = "none";
  };

  rejectAllModal.onclick = () => {
    localStorage.setItem("cookieConsent", "none");

    analyticsToggle.checked = false;
    marketingToggle.checked = false;

    modal.classList.remove("active");
    banner.style.display = "none";
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

});
window.addEventListener("load", () => {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 400);
  }
});

//log
const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = {
    email: "driver@proovia.co.uk",
    password: "123456"
  };

  if (email === user.email && password === user.password) {

    localStorage.setItem("loggedIn", "true");

    showToast("Login successful 🚚", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } else {
    showToast("Invalid credentials ❌", "error");
  }
});

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = type === "success" ? "#22c55e" : "#ef4444";
  toast.style.color = "white";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}