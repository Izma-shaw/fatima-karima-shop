// app.js
"use strict";

// 1) Mets ton numéro WhatsApp ici (format international SANS +, ex: 33612345678, 2246xxxxxxx)
const WHATSAPP_NUMBER = "224623178642";

// 2) Produits (modifie/ajoute facilement)
const PRODUCTS = [
  {
    id: "p1",
    name: "Produit 1",
    price: 35000,
    category: "Catégorie A",
    tags: ["Neuf", "Top"],
    desc: "Description courte : qualité, pratique, disponible.",
    image: "images/images1.png",
    popular: 1,
  },
  {
    id: "p2",
    name: "Produit 2",
    price: 25000,
    category: "Catégorie A",
    tags: ["Promo"],
    desc: "Description courte : bon rapport qualité/prix.",
    image: "images/images2.png",
    popular: 2,
  },
  {
    id: "p3",
    name: "Produit 3",
    price: 45000,
    category: "Catégorie B",
    tags: ["Best"],
    desc: "Description courte : recommandé.",
    image: "images/images3.png",
    popular: 3,
  },
];

function formatGNF(n) {
  // Adaptable si tu veux FCFA/EUR
  return new Intl.NumberFormat("fr-FR").format(n);
}

function waLink(message) {
  // Encode safe
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function productCard(p) {
  const message = `Bonjour, je souhaite commander : ${p.name} - ${formatGNF(p.price)}. Est-ce disponible ?`;
  return `
    <article class="card">
      <div class="thumb">
      <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="card-body">
        <div class="row">
          <div class="name">${p.name}</div>
          <div class="price">${formatGNF(p.price)}</div>
        </div>
        <div class="badges">
          ${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}
        </div>
        <p class="desc">${p.desc}</p>
        <div class="actions">
          <a class="btn btn-whatsapp" href="${waLink(message)}" rel="noopener">Commander</a>
          <button class="btn btn-ghost" data-copy="${message}">Copier msg</button>
        </div>
      </div>
    </article>
  `;
}

function uniqueCategories(items) {
  const cats = new Set(items.map(p => p.category));
  return ["Toutes", ...Array.from(cats)];
}

function applyFilters() {
  const q = (searchEl.value || "").trim().toLowerCase();
  const cat = categoryEl.value;
  const sort = sortEl.value;

  let items = PRODUCTS.slice();

  if (cat !== "Toutes") items = items.filter(p => p.category === cat);
  if (q) {
    items = items.filter(p =>
      (p.name + " " + p.desc + " " + p.tags.join(" ")).toLowerCase().includes(q)
    );
  }

  if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
  if (sort === "popular") items.sort((a, b) => a.popular - b.popular);

  render(items);
}

function render(items) {
  gridEl.innerHTML = items.map(productCard).join("");
  emptyEl.classList.toggle("hidden", items.length !== 0);

  // Copy buttons
  gridEl.querySelectorAll("button[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copié ✅";
        setTimeout(() => (btn.textContent = "Copier msg"), 1200);
      } catch {
        alert("Copie impossible. Sélectionne et copie manuellement.");
      }
    });
  });
}

// --- Init ---
const gridEl = document.getElementById("grid");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");
const sortEl = document.getElementById("sort");

document.getElementById("year").textContent = String(new Date().getFullYear());

// Global WhatsApp buttons
const globalMsg = "Bonjour, je souhaite commander. Pouvez-vous m’aider ?";
document.getElementById("wa-global").href = waLink(globalMsg);
document.getElementById("wa-contact").href = waLink("Bonjour, j’ai une question sur vos produits.");

// Categories select
uniqueCategories(PRODUCTS).forEach(c => {
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  categoryEl.appendChild(opt);
});

searchEl.addEventListener("input", applyFilters);
categoryEl.addEventListener("change", applyFilters);
sortEl.addEventListener("change", applyFilters);

// Basic guard
if (WHATSAPP_NUMBER === "TON_NUMERO") {
  console.warn("⚠️ Mets ton numéro WhatsApp dans app.js (WHATSAPP_NUMBER).");
}

applyFilters();
