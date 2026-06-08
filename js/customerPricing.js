export function money(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

export function planPercent(plan) {
    const percent = Number(plan?.price || 0);
    return Number.isFinite(percent) ? Math.max(0, percent) : 0;
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
