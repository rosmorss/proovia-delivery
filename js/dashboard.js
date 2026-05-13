// ── PAGE NAVIGATION ──
const pageTitles = {
    home: ['Welcome back, Test Snow 👋', 'Track, Manage, and Forecast Deliveries with Ease.'],
    create: ['Create New Order', 'Fill in the details below to book your delivery.'],
    active: ['Active Orders', '3 shipments currently in progress.'],
    history: ['Orders History', 'Browse and search all your past orders.'],
    addresses: ['My Addresses', 'Manage your saved collection and delivery addresses.'],
    discount: ['My Discount', 'Your current pricing and discount level.'],
    claim: ['Report a Claim', 'Describe the issue and we\'ll look into it.'],
    support: ['Support', 'Get in touch with our team.'],
    settings: ['Settings', 'Manage your account and security settings.'],
};

function showPage(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const [h, p] = pageTitles[id] || ['Dashboard', ''];
    document.getElementById('topbar-title').textContent = h;
    document.getElementById('topbar-sub').textContent = p;
}

// ── MINI BARS CHART ──
function buildChart(el, data) {
    const max = Math.max(...data);
    el.innerHTML = data.map((v, i) => {
        const h = Math.round((v / max) * 38);
        const active = i === data.length - 1 ? 'active' : '';
        return `<div class="bar ${active}" style="height:${h}px"><div class="bar-tooltip">${v} orders</div></div>`;
    }).join('');
}

const c1 = document.getElementById('chart1');
if (c1) buildChart(c1, [38, 52, 45, 61, 55, 72, 69, 84, 77, 91, 88, 95]);

// ── TOAST ──
let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── CALENDAR CLICK INTERACTION ──
document.querySelectorAll('.cal-day:not(.grey)').forEach(d => {
    d.addEventListener('click', function () {
        const cal = this.closest('.calendar-mini');
        cal.querySelectorAll('.cal-day').forEach(x => {
            x.classList.remove('today', 'next-day');
        });
        this.classList.add(cal === document.querySelectorAll('.calendar-mini')[0] ? 'today' : 'next-day');
    });
});

// ── ORDER ROW EXPAND (fake) ──
document.querySelectorAll('.order-row').forEach(row => {
    row.addEventListener('click', () => {
        showToast('📋 Order details opened');
    });
});