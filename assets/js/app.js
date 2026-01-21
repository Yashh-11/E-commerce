// -------------------- Helpers --------------------
function formatINR(num) {
    return "₹" + Number(num).toLocaleString("en-IN");
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById("cartBadge");
    if (badge) badge.textContent = totalQty;
}

function addToCart(productId) {
    const cart = getCart();
    const existing = cart.find((x) => x.id === productId);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, qty: 1 });
    }

    saveCart(cart);
    alert("Added to cart ✅");
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter((x) => x.id !== productId);
    saveCart(cart);
    renderCartPage();
}

function updateQty(productId, qty) {
    const cart = getCart();
    const item = cart.find((x) => x.id === productId);
    if (!item) return;

    item.qty = Math.max(1, Number(qty));
    saveCart(cart);
    renderCartPage();
}

function getProductById(id) {
    return PRODUCTS.find((p) => p.id === Number(id));
}

function renderStars(rating) {
    const full = Math.floor(rating);
    let stars = "";
    for (let i = 0; i < full; i++) stars += `<span class="star">★</span>`;
    return stars + `<span class="small-muted ms-1">(${rating})</span>`;
}

// -------------------- Scroll to Top --------------------
window.addEventListener("scroll", () => {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;

    if (window.scrollY > 200) btn.style.display = "block";
    else btn.style.display = "none";
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------- Home: Latest Products --------------------
function renderLatestProducts() {
    const container = document.getElementById("latestProducts");
    if (!container) return;

    const latest = PRODUCTS.slice(0, 6);

    container.innerHTML = latest
        .map(
            (p) => `
      <div class="col-12 col-sm-6 col-lg-3 mb-4">
        <div class="card p-3 h-100">
          <img src="${p.image}" class="product-img" alt="${p.title}">
          
          <div class="mt-3 d-flex justify-content-between align-items-start">
            <div>
              <span class="badge badge-soft">${p.category}</span>
              <h6 class="mt-2 mb-1 product-title">${p.title}</h6>
              <div>${renderStars(p.rating)}</div>
            </div>
            <div class="fw-bold">${formatINR(p.price)}</div>
          </div>

          <div class="mt-3 d-flex gap-2">
            <a href="product-view.html?id=${p.id}" class="btn btn-outline-primary w-50">View</a>
            <button class="btn btn-primary w-50" onclick="addToCart(${p.id})">Add</button>
          </div>
        </div>
      </div>
    `
        )
        .join("");
}


// -------------------- Products Page: Filters --------------------
function renderProductsPage() {
    const list = document.getElementById("productsList");
    const catSelect = document.getElementById("categoryFilter");
    const priceRange = document.getElementById("priceRange");
    const priceLabel = document.getElementById("priceLabel");

    if (!list || !catSelect) return;

    // Clear dropdown
    catSelect.innerHTML = "";

    // Create categories from PRODUCTS
    const dynamicCategories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

    dynamicCategories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
    });

    // Read URL category (products.html?cat=Fashion)
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get("cat");
    if (urlCat && dynamicCategories.includes(urlCat)) {
        catSelect.value = urlCat;
    }

    function applyFilters() {
        const selectedCat = catSelect.value;
        const maxPrice = priceRange ? Number(priceRange.value) : 999999;

        if (priceLabel) priceLabel.textContent = formatINR(maxPrice);

        const filtered = PRODUCTS.filter((p) => {
            const catOk = selectedCat === "All" ? true : p.category === selectedCat;
            const priceOk = p.price <= maxPrice;
            return catOk && priceOk;
        });

        if (filtered.length === 0) {
            list.innerHTML = `<div class="col-12"><div class="alert alert-warning">No products found.</div></div>`;
            return;
        }

        list.innerHTML = filtered
            .map(
                (p) => `
        <div class="col-12 col-sm-6 col-lg-4 mb-4">
          <div class="card p-3 h-100">
            <img src="${p.image}" class="product-img" alt="${p.title}">
            
            <div class="mt-3">
              <span class="badge badge-soft">${p.category}</span>
              <h6 class="mt-2 mb-1 product-title">${p.title}</h6>
              <div>${renderStars(p.rating)}</div>

              <p class="small-muted mt-2 mb-2">${p.desc.slice(0, 70)}...</p>

              <div class="d-flex justify-content-between align-items-center">
                <div class="fw-bold">${formatINR(p.price)}</div>
                <div class="d-flex gap-2">
                  <a href="product-view.html?id=${p.id}" class="btn btn-outline-primary btn-sm">View</a>
                  <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
            )
            .join("");
    }

    catSelect.addEventListener("change", applyFilters);

    if (priceRange) {
        priceRange.addEventListener("input", applyFilters);
    }

    applyFilters();
}


// -------------------- Product View Page --------------------
function renderProductViewPage() {
    const box = document.getElementById("productViewBox");
    if (!box) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = getProductById(id);

    if (!product) {
        box.innerHTML = `<div class="alert alert-danger">Product not found.</div>`;
        return;
    }

    const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

    box.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-5">
        <div class="card p-3">
          <img src="${product.image}" class="w-100" style="border-radius: 14px; height: 360px; object-fit: cover;" alt="${product.title}">
        </div>
      </div>

      <div class="col-lg-7">
        <div class="card p-4 h-100">
          <span class="badge badge-soft">${product.category}</span>
          <h3 class="mt-2">${product.title}</h3>
          <div class="mb-2">${renderStars(product.rating)}</div>
          <h4 class="fw-bold">${formatINR(product.price)}</h4>
          <p class="small-muted mt-3">${product.desc}</p>

          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            <a href="cart.html" class="btn btn-outline-primary">Go to Cart</a>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <h4 class="section-title">Related Products</h4>
      <div class="row mt-3">
        ${related
            .map(
                (p) => `
          <div class="col-md-6 col-lg-3 mb-4">
            <div class="card p-3 h-100">
              <img src="${p.image}" class="w-100 product-img" alt="${p.title}">
              <h6 class="mt-2 mb-1">${p.title}</h6>
              <div class="small-muted">${formatINR(p.price)}</div>
              <a href="product-view.html?id=${p.id}" class="btn btn-outline-primary btn-sm mt-3">View</a>
            </div>
          </div>
        `
            )
            .join("")}
      </div>
    </div>
  `;
}

// -------------------- Category Page --------------------
function renderCategoryPage() {
    const list = document.getElementById("categoryList");
    if (!list) return;

    const cards = [
        { name: "Electronics", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80", desc: "Smart gadgets & accessories" },
        { name: "Fashion", img: "https://thumbs.dreamstime.com/b/elegant-chic-women-s-clothing-boutique-showcasing-stylish-apparel-mannequins-racks-well-lit-boutique-showcases-391142229.jpg", desc: "Trendy outfits & footwear" },
        { name: "Home", img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&q=80", desc: "Home essentials & decor" },
        { name: "Beauty", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80", desc: "Skincare & fragrance" }
    ];

    list.innerHTML = cards  
        .map(
            (c) => `
      <div class="col-md-6 col-lg-3 mb-4">
        <div class="card p-3 h-100">
          <img src="${c.img}" class="w-100 product-img" alt="${c.name}">
          <h6 class="mt-3 mb-1">${c.name}</h6>
          <p class="small-muted mb-3">${c.desc}</p>
          <a href="products.html?cat=${encodeURIComponent(c.name)}" class="btn btn-primary btn-sm">Shop</a>
        </div>
      </div>
    `
        )
        .join("");
}

// -------------------- Cart Page --------------------
function renderCartPage() {
  const tbody = document.getElementById("cartTableBody");
  const totalBox = document.getElementById("cartTotalAmount");

  if (!tbody || !totalBox) return;

  const cart = getCart();

  if (cart.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 fw-semibold">
          Your cart is empty 🛒
        </td>
      </tr>
    `;
    totalBox.textContent = formatINR(0);
    return;
  }

  let total = 0;

  tbody.innerHTML = cart
    .map((item, index) => {
      const p = getProductById(item.id);

      // ✅ if product not found in PRODUCTS
      if (!p) {
        return `
          <tr>
            <td colspan="7" class="text-center text-danger fw-semibold py-3">
              Product not found for ID: ${item.id} ❌ <br/>
              (Fix: check PRODUCTS array in data.js)
            </td>
          </tr>
        `;
      }

      const qty = Number(item.qty);
      const subTotal = p.price * qty;
      total += subTotal;

      return `
        <tr>
          <td>${index + 1}</td>

          <td>
            <img src="${p.image}" alt="${p.title}"
              style="width:70px;height:55px;object-fit:cover;border-radius:10px;">
          </td>

          <td style="max-width:240px;">
            <div class="fw-semibold">${p.title}</div>
            <div class="small text-muted">${p.category}</div>
          </td>

          <td>${formatINR(p.price)}</td>

          <td style="width:120px;">
            <input type="number" min="1" value="${qty}" class="form-control"
              onchange="updateQty(${p.id}, this.value)">
          </td>

          <td class="fw-bold">${formatINR(subTotal)}</td>

          <td>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${p.id})">
              Remove
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  totalBox.textContent = formatINR(total);
}




// -------------------- Checkout Page --------------------
function renderCheckoutSummary() {
    const summary = document.getElementById("checkoutSummary");
    if (!summary) return;

    const cart = getCart();
    if (cart.length === 0) {
        summary.innerHTML = `<div class="alert alert-warning">Cart is empty. <a href="products.html">Shop now</a></div>`;
        return;
    }

    let total = 0;
    summary.innerHTML = cart
        .map((item) => {
            const p = getProductById(item.id);
            const sub = p.price * item.qty;
            total += sub;

            return `
        <div class="d-flex justify-content-between border-bottom py-2">
          <div>
            <div class="fw-semibold">${p.title}</div>
            <div class="small-muted">Qty: ${item.qty}</div>
          </div>
          <div class="fw-bold">${formatINR(sub)}</div>
        </div>
      `;
        })
        .join("");

    summary.innerHTML += `
    <div class="d-flex justify-content-between pt-3">
      <div class="fw-bold">Total</div>
      <div class="fw-bold">${formatINR(total)}</div>
    </div>
  `;
}

function placeOrder(e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const orderNo = "ORD" + Math.floor(Math.random() * 1000000);
    localStorage.setItem("orderNo", orderNo);
    localStorage.setItem("orderStatus", "Confirmed");
    localStorage.removeItem("cart");
    updateCartBadge();

    window.location.href = "order-confirmation.html";
}

// -------------------- Order Confirmation --------------------
function renderOrderConfirmation() {
    const orderNoBox = document.getElementById("orderNo");
    const statusBox = document.getElementById("orderStatus");

    if (!orderNoBox || !statusBox) return;

    orderNoBox.textContent = localStorage.getItem("orderNo") || "N/A";
    statusBox.textContent = localStorage.getItem("orderStatus") || "N/A";
}

// -------------------- Search Page --------------------
function renderSearchResults() {
    const list = document.getElementById("searchResults");
    const input = document.getElementById("searchInput");
    if (!list || !input) return;

    function doSearch() {
        const q = input.value.trim().toLowerCase();
        const filtered = PRODUCTS.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

        list.innerHTML = filtered
            .map(
                (p) => `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card p-3 h-100">
            <img src="${p.image}" class="w-100 product-img" alt="${p.title}">
            <h6 class="mt-2">${p.title}</h6>
            <div class="small-muted">${p.category} • ${formatINR(p.price)}</div>
            <div class="mt-3 d-flex gap-2">
              <a href="product-view.html?id=${p.id}" class="btn btn-outline-primary btn-sm w-50">View</a>
              <button class="btn btn-primary btn-sm w-50" onclick="addToCart(${p.id})">Add</button>
            </div>
          </div>
        </div>
      `
            )
            .join("");

        if (filtered.length === 0) {
            list.innerHTML = `<div class="col-12"><div class="alert alert-info">No products found.</div></div>`;
        }
    }

    input.addEventListener("input", doSearch);
    doSearch();
}

// -------------------- Contact Form Validation (JS + jQuery) --------------------
function setupContactValidation() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    $("#contactForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#name").val().trim();
        const email = $("#email").val().trim();
        const msg = $("#message").val().trim();

        if (name.length < 3) return alert("Name must be at least 3 characters");
        if (!email.includes("@")) return alert("Enter a valid email");
        if (msg.length < 10) return alert("Message must be at least 10 characters");

        alert("Message submitted successfully ✅");
        this.reset();
    });
}

// -------------------- Init --------------------
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
    renderLatestProducts();
    renderProductsPage();
    renderProductViewPage();
    renderCategoryPage();
    renderCartPage();
    renderCheckoutSummary();
    renderOrderConfirmation();
    renderSearchResults();
    setupContactValidation();
});
