import { bring } from "./fetch.js";

const bookingItems = document.getElementById("bookingItems");
const categoriesContainer = document.getElementById("categoriesList");
const searchInput = document.getElementById("searchItems");

let allItems = [];
let currentCategory = "all";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await loadItems();
});

async function loadCategories() {
    const categories = await bring("/category");

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

    setupCategoryListeners();
}

async function loadItems() {
    allItems = await bring("/item");
    renderItems(allItems);
}

function renderItems(items) {
    bookingItems.innerHTML = "";

    items.forEach(item => {
        bookingItems.innerHTML += `
            <div class="booking-item">
                <div class="booking-item-left">
                    <img src="${item.image || "photo/no-image.png"}" alt="${item.name}">

                    <div>
                        <h4>${item.name}</h4>
                        <span>${item.category?.name || "No category"}</span>
                        <p>£${item.basePrice}</p>
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
}

function setupCategoryListeners() {
    const categoryButtons = document.querySelectorAll(".category-card");

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            currentCategory = button.dataset.category;

            if (currentCategory === "all") {
                renderItems(allItems);
                return;
            }

            const filteredItems = allItems.filter(item =>
                item.categoryId == currentCategory
            );

            renderItems(filteredItems);
        });
    });
}

searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();

    let filteredItems = allItems;

    if (currentCategory !== "all") {
        filteredItems = filteredItems.filter(item =>
            item.categoryId == currentCategory
        );
    }

    if (value !== "") {
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(value)
        );
    }

    renderItems(filteredItems);
});

window.addToCart = function(id) {
    const item = allItems.find(item => item.id === id);

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

const pickupAddress = localStorage.getItem("pickupAddress");
const dropoffAddress = localStorage.getItem("dropoffAddress");

console.log("Pickup:", pickupAddress);
console.log("Dropoff:", dropoffAddress);