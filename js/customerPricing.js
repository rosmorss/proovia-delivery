export function money(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

const PLAN_PERCENT = {
    eco: 1.5,
    ecoPlus: 5,
    standard: 8,
    premium: 10
};

const FIRST_CLASS_PERCENT = money((1 + PLAN_PERCENT.premium / 100) * 200 - 100);

function normalizePlanName(plan) {
    return String(plan?.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

export function formatPercent(value) {
    return Number(value || 0)
        .toFixed(2)
        .replace(/\.?0+$/, "");
}

function planPricingRule(plan) {
    const name = normalizePlanName(plan);

    if (name.includes("first") && name.includes("class")) {
        return {
            percent: FIRST_CLASS_PERCENT,
            label: "Premium x2"
        };
    }

    if (name.includes("eco") && name.includes("plus")) {
        return { percent: PLAN_PERCENT.ecoPlus };
    }

    if (name.includes("eco")) {
        return { percent: PLAN_PERCENT.eco };
    }

    if (name.includes("standard") || name.includes("standder")) {
        return { percent: PLAN_PERCENT.standard };
    }

    if (name.includes("premium")) {
        return { percent: PLAN_PERCENT.premium };
    }

    return null;
}

export function planPercent(plan) {
    const percent = planPricingRule(plan)?.percent ?? Number(plan?.price || 0);
    return Number.isFinite(percent) ? Math.max(0, percent) : 0;
}

export function planLabel(plan) {
    const rule = planPricingRule(plan);
    const percent = planPercent(plan);

    return rule?.label || `Items + ${formatPercent(percent)}%`;
}

export function calculateItemsSubtotal(items = []) {
    return money(items.reduce((sum, item) => {
        const quantity = Number(item.quantity || 1);
        const price = Number(item.basePrice || item.price || 0);
        return sum + price * quantity;
    }, 0));
}

export function calculatePlanQuote(itemsSubtotal, plan, extraPrice = 0) {
    const subtotal = money(itemsSubtotal);
    const percent = planPercent(plan);
    const planFee = money(subtotal * percent / 100);
    const extra = money(extraPrice);
    const total = money(subtotal + planFee + extra);

    return {
        itemsSubtotal: subtotal,
        planPercent: percent,
        planLabel: planLabel(plan),
        planFee,
        extraPrice: extra,
        total
    };
}

export function formatMoney(value) {
    return `£${money(value).toFixed(2)}`;
}

export async function loadCartItems(bring, cart = []) {
    const ids = cart
        .map(item => Number(item.id))
        .filter(id => Number.isInteger(id) && id > 0);

    if (!ids.length) return [];

    const catalogItems = await bring(`/items?items=${ids.join(",")}`);

    return catalogItems.map(item => ({
        ...item,
        quantity: cart.find(cartItem => Number(cartItem.id) === Number(item.id))?.quantity || 1
    }));
}
