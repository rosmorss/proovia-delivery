import { bring } from "./fetch.js";

const bookingItems = document.getElementById("bookingItems");
const categoriesContainer = document.getElementById("categoriesList");
const searchInput = document.getElementById("searchItems");
const paginationContainer = document.getElementById("pagination");
const cartSummary = document.getElementById("bookingCartSummary");
const toastStack = document.getElementById("bookingToastStack");

let categories = [];
let currentCategory = "all";
let currentPage = 1;
let cart = readCart();
const imageCache = new Map();

const ITEMS_PER_PAGE = 5;
const TOAST_DURATION = 4500;
const toastTimers = new Map();

window.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    loadStateFromURL();
    renderCartSummary();
    setupReveal();
});

window.addEventListener("popstate", () => {
    loadStateFromURL();
});

bookingItems?.addEventListener("click", handleCartAction);
cartSummary?.addEventListener("click", handleCartAction);
toastStack?.addEventListener("click", handleCartAction);

searchInput?.addEventListener("input", () => {
    currentPage = 1;
    renderItems();
});

async function loadImageForItem(item) {
    if (item.image) return item.image;

    const cachedImage = imageCache.get(item.id);
    if (cachedImage) return cachedImage;

    const categoryName = getCategoryName(item.categoryId);

    const result = await bring(
        `/items/furniture-image?name=${encodeURIComponent(item.name)}&category=${encodeURIComponent(categoryName)}`
    );

    const image = result.image || "photo/no-image.png";

    imageCache.set(item.id, image);
    item.image = image;

    return image;
}

async function loadCategories() {
    categories = await bring("/categories");

    // for (const category of categories) {
    //     for (const item of category.items || []) {
    //         if (!item.image) {
    //             const result = await bring(
    //                 `/items/furniture-image?name=${encodeURIComponent(item.name)}&category=${encodeURIComponent(category.name)}`
    //             );

    //             item.image = result.image;
    //         }
    //     }
    // }

    renderCategories();
    setupCategoryListeners();
}

function renderCategories() {
    categoriesContainer.innerHTML = `
            <button class="category-card active" data-category="all">
                All Items
            </button>
        `;

    categories.forEach(category => {
        categoriesContainer.innerHTML += `
                <button class="category-card" data-category="${category.id}">
                    ${escapeHtml(category.name)}
                </button>
            `;
    });
}

async function loadImagesForDisplayedItems(itemsToDisplay) {
    for (const item of itemsToDisplay) {
        const imageUrl = await loadImageForItem(item);

        const img = document.querySelector(`[data-item-image="${item.id}"]`);

        if (img) {
            img.src = imageUrl;
        }
    }
}

function getAllItems() {
    if (currentCategory === "all") {
        return categories.flatMap(cat => cat.items || []);
    }

    const category = categories.find(cat => Number(cat.id) === Number(currentCategory));
    return category?.items || [];
}

function getFilteredItems() {
    let items = getAllItems();
    const searchValue = searchInput.value.toLowerCase().trim();

    if (searchValue !== "") {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchValue)
        );
    }

    return items;
}

function renderItems() {
    const filteredItems = getFilteredItems();
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const itemsToDisplay = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    bookingItems.innerHTML = "";

    if (!itemsToDisplay.length) {
        bookingItems.innerHTML = `<p class="booking-empty-state">No items found.</p>`;
        renderPagination(0);
        return;
    }

    bookingItems.innerHTML = itemsToDisplay.map(item => {
        const categoryName = getCategoryName(item.categoryId);

        return `
                <div class="booking-item">
                    <div class="booking-item-left">
                    <img 
                        src="${escapeAttribute(item.image || "photo/no-image.png")}" 
                        alt="${escapeAttribute(item.name)}"
                        data-item-image="${item.id}"
                        loading="lazy"
                    >
                        <div>
                            <h4>${escapeHtml(item.name)}</h4>
                            <span>${escapeHtml(categoryName)}</span>
                            <p>${formatMoney(item.basePrice)}</p>
                        </div>
                    </div>

                    ${renderItemAction(item.id)}
                </div>
            `;
    }).join("");
    loadImagesForDisplayedItems(itemsToDisplay);
    setTimeout(() => {
        document.querySelectorAll(".booking-item").forEach((item, index) => {
            setTimeout(() => {
                item.classList.add("show");
            }, index * 70);
        });
    }, 50);

    renderPagination(totalPages);
}

function renderItemAction(itemId) {
    const quantity = getCartQuantity(itemId);

    if (quantity > 0) {
        return renderQuantityControl(itemId, quantity, "booking-item-qty");
    }

    return `
            <button class="booking-add-btn" type="button" data-cart-action="increment" data-item-id="${itemId}">
                Add
            </button>
        `;
}

function renderQuantityControl(itemId, quantity, extraClass = "") {
    return `
            <div class="booking-qty-control ${extraClass}" role="group" aria-label="Item quantity">
                <button type="button" data-cart-action="decrement" data-item-id="${itemId}" aria-label="Remove one item">-</button>
                <span>${quantity}</span>
                <button type="button" data-cart-action="increment" data-item-id="${itemId}" aria-label="Add one item">+</button>
            </div>
        `;
}

function renderPagination(totalPages) {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    paginationContainer.appendChild(createPageButton("‹", currentPage - 1, {
        disabled: currentPage === 1,
        label: "Previous page",
        className: "pagination-arrow"
    }));

    getVisiblePages(totalPages).forEach(page => {
        if (page === "ellipsis") {
            const dots = document.createElement("span");
            dots.className = "pagination-ellipsis";
            dots.textContent = "...";
            paginationContainer.appendChild(dots);
            return;
        }

        paginationContainer.appendChild(createPageButton(String(page), page, {
            active: page === currentPage,
            className: "page-number",
            label: `Page ${page}`
        }));
    });

    paginationContainer.appendChild(createPageButton("›", currentPage + 1, {
        disabled: currentPage === totalPages,
        label: "Next page",
        className: "pagination-arrow"
    }));
}

function createPageButton(text, page, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;

    if (options.className) button.classList.add(options.className);
    if (options.active) button.classList.add("active");
    if (options.label) button.setAttribute("aria-label", options.label);
    button.disabled = Boolean(options.disabled);

    button.addEventListener("click", () => {
        if (!button.disabled) {
            goToPage(page);
        }
    });

    return button;
}

function getVisiblePages(totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages]);
    const range = currentPage <= 3 || currentPage >= totalPages - 2 ? 2 : 1;

    for (let page = currentPage - range; page <= currentPage + range; page += 1) {
        if (page > 1 && page < totalPages) {
            pages.add(page);
        }
    }

    if (currentPage <= 3) {
        [2, 3, 4].forEach(page => pages.add(page));
    }

    if (currentPage >= totalPages - 2) {
        [totalPages - 3, totalPages - 2, totalPages - 1].forEach(page => {
            if (page > 1) pages.add(page);
        });
    }

    const sortedPages = [...pages].sort((a, b) => a - b);
    const visible = [];

    sortedPages.forEach((page, index) => {
        if (index > 0 && page - sortedPages[index - 1] > 1) {
            visible.push("ellipsis");
        }

        visible.push(page);
    });

    return visible;
}

function goToPage(pageNum) {
    currentPage = pageNum;
    updateURL();
    renderItems();
    bookingItems.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupCategoryListeners() {
    const categoryButtons = document.querySelectorAll(".category-card");

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const categoryValue = button.dataset.category;
            selectCategory(categoryValue === "all" ? "all" : Number(categoryValue));
        });
    });
}

function selectCategory(categoryValue) {
    currentCategory = categoryValue;
    currentPage = 1;
    searchInput.value = "";
    updateURL();
    updateActiveCategoryButton();
    renderItems();
}

function updateActiveCategoryButton() {
    const categoryButtons = document.querySelectorAll(".category-card");

    categoryButtons.forEach(btn => {
        const btnCategory = btn.dataset.category === "all" ? "all" : Number(btn.dataset.category);
        const isActive = btnCategory === currentCategory || (currentCategory === "all" && btn.dataset.category === "all");
        btn.classList.toggle("active", isActive);
    });
}

function updateURL() {
    const params = new URLSearchParams();

    if (currentCategory !== "all") {
        params.set("category", currentCategory);
    }

    if (currentPage > 1) {
        params.set("page", currentPage);
    }

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({ category: currentCategory, page: currentPage }, "", newURL);
}

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const urlCategory = params.get("category");
    const urlPage = params.get("page");

    currentCategory = urlCategory ? Number(urlCategory) : "all";
    currentPage = urlPage ? Number(urlPage) : 1;

    updateActiveCategoryButton();
    renderItems();
}

function handleCartAction(event) {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const itemId = Number(button.dataset.itemId);
    const action = button.dataset.cartAction;

    if (action === "increment") {
        incrementCartItem(itemId);
    }

    if (action === "decrement") {
        decrementCartItem(itemId);
    }
}

function incrementCartItem(itemId, options = {}) {
    const item = findItemById(itemId);
    if (!item) return;

    const existingItem = cart.find(cartItem => Number(cartItem.id) === Number(itemId));

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: item.id, quantity: 1 });
    }

    syncCart();
    showCartToast(item);
}

function decrementCartItem(itemId) {
    const item = findItemById(itemId);
    const existingItem = cart.find(cartItem => Number(cartItem.id) === Number(itemId));

    if (!existingItem) return;

    existingItem.quantity -= 1;

    if (existingItem.quantity <= 0) {
        cart = cart.filter(cartItem => Number(cartItem.id) !== Number(itemId));
        removeCartToast(itemId);
    }

    syncCart();

    if (item && getCartQuantity(itemId) > 0) {
        showCartToast(item);
    }
}

function syncCart() {
    cart = cart
        .map(item => ({
            id: Number(item.id),
            quantity: Math.max(0, Number(item.quantity || 0))
        }))
        .filter(item => item.id > 0 && item.quantity > 0);

    localStorage.setItem("cart", JSON.stringify(cart));
    renderItems();
    renderCartSummary();
}

function renderCartSummary() {
    if (!cartSummary) return;

    const cartItems = getCartItemsWithData();
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (!cartItems.length) {
        cartSummary.innerHTML = `
                <div class="booking-cart-head">
                    <div>
                        <span>Shopping cart</span>
                        <strong>0 products</strong>
                    </div>
                    <p>No items selected yet.</p>
                </div>
            `;
        return;
    }

    cartSummary.innerHTML = `
            <div class="booking-cart-head">
                <div>
                    <span>Shopping cart</span>
                    <strong>${totalQuantity} ${totalQuantity === 1 ? "product" : "products"}</strong>
                </div>
                <p>${formatMoney(getCartSubtotal(cartItems))}</p>
            </div>

            <div class="booking-cart-list">
                ${cartItems.map(item => `
                    <div class="booking-cart-row">
                        <div>
                            <strong>${escapeHtml(item.name)}</strong>
                            <span>${escapeHtml(getCategoryName(item.categoryId))}</span>
                        </div>
                        ${renderQuantityControl(item.id, item.quantity, "booking-cart-qty")}
                    </div>
                `).join("")}
            </div>
        `;
}

function getFurnitureImage(item) {
    const category = encodeURIComponent(
        getCategoryName(item.categoryId)
    );

    return `https://source.unsplash.com/300x220/?${category},furniture`;
}

function showCartToast(item) {
    if (!toastStack) return;

    const quantity = getCartQuantity(item.id);
    if (quantity <= 0) return;

    const toastId = `booking-toast-${item.id}`;
    let toast = document.getElementById(toastId);

    if (!toast) {
        toast = document.createElement("div");
        toast.id = toastId;
        toast.className = "booking-toast";
        toast.dataset.toastId = String(item.id);
        toastStack.prepend(toast);
    }


    toast.innerHTML = `
            <div class="booking-toast-copy">
                <strong>${escapeHtml(item.name)}</strong>
                <span>Quantity: ${quantity}</span>
            </div>
            ${renderQuantityControl(item.id, quantity, "booking-toast-qty")}
        `;

    requestAnimationFrame(() => toast.classList.add("show"));

    clearTimeout(toastTimers.get(item.id));
    toastTimers.set(item.id, setTimeout(() => {
        removeCartToast(item.id);
    }, TOAST_DURATION));
}

function removeCartToast(itemId) {
    const toast = document.getElementById(`booking-toast-${itemId}`);
    clearTimeout(toastTimers.get(itemId));
    toastTimers.delete(itemId);

    if (!toast) return;

    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 180);
}

function getCartItemsWithData() {
    return cart
        .map(cartItem => {
            const item = findItemById(cartItem.id);
            if (!item) return null;

            return {
                ...item,
                quantity: Number(cartItem.quantity || 0)
            };
        })
        .filter(Boolean);
}

function getCartSubtotal(items) {
    return items.reduce((sum, item) => {
        return sum + Number(item.basePrice || 0) * Number(item.quantity || 0);
    }, 0);
}

function getCartQuantity(itemId) {
    return cart.find(cartItem => Number(cartItem.id) === Number(itemId))?.quantity || 0;
}

function findItemById(itemId) {
    for (const category of categories) {
        const item = category.items?.find(categoryItem => Number(categoryItem.id) === Number(itemId));
        if (item) return item;
    }

    return null;
}

function getCategoryName(categoryId) {
    return categories.find(cat => Number(cat.id) === Number(categoryId))?.name || "No category";
}

function readCart() {
    try {
        const parsedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        console.warn("Cart could not be parsed:", error);
        return [];
    }
}

function formatMoney(value) {
    return `£${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
}

window.addToCart = function (id) {
    incrementCartItem(Number(id));
};

function setupReveal() {
    document.querySelector(".booking-categories")?.classList.add("show");
    document.querySelector(".booking-top")?.classList.add("show");
    document.querySelector(".booking-actions")?.classList.add("show");
    document.querySelector(".booking-cart-summary")?.classList.add("show");
}

