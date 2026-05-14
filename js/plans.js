document.querySelectorAll(".more-details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        btn.closest(".plan-card").classList.toggle("active");
    });
});
const planCards = document.querySelectorAll(".plan-card");

const plansObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.15
});

planCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.08}s`;
    plansObserver.observe(card);
});