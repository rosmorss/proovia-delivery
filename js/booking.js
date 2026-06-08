import { bring } from "./fetch.js";

const bookingItems = document.getElementById("bookingItems");
const categoriesContainer = document.getElementById("categoriesList");
const searchInput = document.getElementById("searchItems");

let categories = [];
let currentCategory = "all";
let currentPage = 1;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const ITEMS_PER_PAGE = 5;

window.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    loadStateFromURL();
    setupReveal();
});

window.addEventListener("popstate", () => {
    loadStateFromURL();
});

async function loadCategories() {
    categories = await bring("/categories");
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
                ${category.name}
            </button>
        `;
    });
}

function getAllItems() {
    if (currentCategory === "all") {
        return categories.flatMap(cat => cat.items || []);
    }

    const category = categories.find(cat => cat.id == currentCategory);
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

    // Ensure currentPage is valid
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

    bookingItems.innerHTML = "";

    if (!itemsToDisplay.length) {
        bookingItems.innerHTML = `<p>No items found.</p>`;
        renderPagination(0);
        return;
    }

    itemsToDisplay.forEach(item => {
        const categoryName = categories.find(cat => cat.id == item.categoryId)?.name || "No category";
        bookingItems.innerHTML += `
            <div class="booking-item">
                <div class="booking-item-left">
                    <img src="${item.image || "photo/no-image.png"}" alt="${item.name}">

                    <div>
                        <h4>${item.name}</h4>
                        <span>${categoryName}</span>
                        <p>£${Number(item.basePrice).toFixed(2)}</p>
                    </div>
                </div>

                <button onclick="addToCart(${item.id})">
                    Add
                </button>
            </div>
        `;
    });

    setTimeout(() => {
        document.querySelectorAll(".booking-item").forEach((item, index) => {
            setTimeout(() => {
                item.classList.add("show");
            }, index * 70);
        });
    }, 50);

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    let paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = "pagination";
        paginationContainer.className = "pagination";
        bookingItems.parentElement.appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });

    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("page-number");
        if (i === currentPage) {
            pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
            goToPage(i);
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });

    paginationContainer.appendChild(nextButton);
}

function goToPage(pageNum) {
    currentPage = pageNum;
    updateURL();
    renderItems();
    bookingItems.scrollIntoView({ behavior: "smooth" });
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
        if (btnCategory === currentCategory || (currentCategory === "all" && btn.dataset.category === "all")) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
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

searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderItems();
});

window.addToCart = function (id) {
    let item = null;
    for (const category of categories) {
        item = category.items?.find(i => i.id === id);
        if (item) break;
    }

    if (!item) return;

    const existingItem = cart.find(cartItem => cartItem.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            image: item.image,
            basePrice: item.basePrice,
            categoryId: item.categoryId,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart:", cart);
};

function setupReveal() {
    document.querySelector(".booking-categories")?.classList.add("show");
    document.querySelector(".booking-top")?.classList.add("show");
    document.querySelector(".booking-actions")?.classList.add("show");
}