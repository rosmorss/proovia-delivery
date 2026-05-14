const bookingItems = document.getElementById("bookingItems");
const categoriesContainer = document.getElementById("categories");
const searchInput = document.getElementById("searchItems");
const categoriesList = document.getElementById("categoriesList");
let allProducts = [];
let currentCategory = "all";

/* ------------------------ */
/* STORAGE */
/* ------------------------ */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ------------------------ */
/* LOAD DATA */
/* ------------------------ */

window.addEventListener("DOMContentLoaded", async () => {

    await loadCategories();
    await loadProducts();

});

/* ------------------------ */
/* LOAD CATEGORIES */
/* ------------------------ */

async function loadCategories() {

    const res = await fetch(
        "https://dummyjson.com/products/categories"
    );

    const categories = await res.json();

    categoriesContainer.innerHTML = "";

    // ALL BUTTON

    categoriesContainer.innerHTML += `
    
    <button class="category-card active"
            data-category="all">

        All Items

    </button>
    
    `;

    // API CATEGORIES

    categories.slice(0, 10).forEach(category => {

        categoriesContainer.innerHTML += `

        <button class="category-card"
                data-category="${category.slug}">

            ${category.name}

        </button>

        `;

    });

    setupCategoryListeners();

}

/* ------------------------ */
/* LOAD PRODUCTS */
/* ------------------------ */

async function loadProducts() {

    const res = await fetch(
        "https://dummyjson.com/products?limit=100"
    );

    const data = await res.json();

    allProducts = data.products;

    renderProducts(allProducts);

}

/* ------------------------ */
/* RENDER PRODUCTS */
/* ------------------------ */

function renderProducts(products) {

    bookingItems.innerHTML = "";

products.slice(0, 10).forEach(product => {

        bookingItems.innerHTML += `

        <div class="booking-item">

            <div class="booking-item-left">

                <img src="${product.thumbnail}" alt="">

                <div>
                    <h4>${product.title}</h4>

                    <span>
                        ${product.category}
                    </span>
                </div>

            </div>

            <button onclick="addToCart(${product.id})">

                Add

            </button>

        </div>

        `;

    });

}

/* ------------------------ */
/* CATEGORY FILTER */
/* ------------------------ */

function setupCategoryListeners() {

    const categoryButtons =
        document.querySelectorAll(".category-card");

    categoryButtons.forEach(button => {

        button.addEventListener("click", async () => {

            categoryButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const category = button.dataset.category;

            currentCategory = category;

            if (category === "all") {

                renderProducts(allProducts);

            } else {

                const res = await fetch(
                    `https://dummyjson.com/products/category/${category}`
                );

                const data = await res.json();

                renderProducts(data.products.slice(0, 10));

            }

        });

    });

}

/* ------------------------ */
/* SEARCH */
/* ------------------------ */

searchInput.addEventListener("input", async (e) => {

    const value = e.target.value.toLowerCase();

    // EMPTY SEARCH

    if (value.trim() === "") {

        if (currentCategory === "all") {

            renderProducts(allProducts);

        } else {

            const filtered = allProducts.filter(product =>
                product.category === currentCategory
            );

            renderProducts(filtered);

        }

        return;
    }

    // SEARCH API

    const res = await fetch(
        `https://dummyjson.com/products/search?q=${value}`
    );

    const data = await res.json();

    // FILTER CATEGORY + SEARCH

    let filteredProducts = data.products.slice(0, 10);

    if (currentCategory !== "all") {

        filteredProducts = filteredProducts.filter(product =>
            product.category === currentCategory
        );

    }

    renderProducts(filteredProducts);

});

/* ------------------------ */
/* ADD TO CART */
/* ------------------------ */

function addToCart(id) {

    const product = allProducts.find(p => p.id === id);

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    console.log("Cart:", cart);

}