"use strict";

// 1) Mets ton numéro WhatsApp ici (format international SANS +)
const WHATSAPP_NUMBER = "224623178649";

// 2) Produits
// ✅ Chemins relatifs -> marche en file:// et en déploiement (Vercel)
const PRODUCTS = [
  {
    id: "p1",
    name: "Produit 1",
    price: 35000,
    category: "Catégorie A",
    tags: ["Neuf", "Top"],
    desc: "Description courte : qualité, pratique, disponible.",
    video: "videos/Produit1.mp4",
    popular: 1,
  },
  {
    id: "p2",
    name: "Produit 2",
    price: 25000,
    category: "Catégorie A",
    tags: ["Promo"],
    desc: "Description courte : bon rapport qualité/prix.",
    video: "videos/Produit2.mp4",
    popular: 2,
  }
];

function formatGNF(n) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function waLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function mediaBlock(p) {
  if (p.video) {
    // ✅ <source type="video/mp4"> pour compat
    // ✅ controls temporaire pour debug (tu peux retirer après)
    return `
      <video autoplay muted loop playsinline preload="metadata" controls>
        <source src="${p.video}" type="video/mp4">
        Votre navigateur ne supporte pas la vidéo.
      </video>
    `;
  }
  return `<img src="${p.image || ""}" alt="${p.name}">`;
}

function productCard(p) {
  const message = `Bonjour, je souhaite commander : ${p.name} - ${formatGNF(p.price)}. Est-ce disponible ?`;
  return `
    <article class="card">
      <div class="thumb">
        ${mediaBlock(p)}
      </div>
      <div class="card-body">
        <div class="row">
          <div class="name">${p.name}</div>
          <div class="price">${formatGNF(p.price)}</div>
        </div>
        <div class="badges">
          ${(p.tags || []).map(t => `<span class="badge">${t}</span>`).join("")}
        </div>
        <p class="desc">${p.desc || ""}</p>
        <div class="actions">
          <a class="btn btn-whatsapp" href="${waLink(message)}" rel="noopener">Commander</a>
          <button class="btn btn-ghost" data-copy="${message}">Copier msg</button>
        </div>
      </div>
    </article>
  `;
}

function uniqueCategories(items) {
  const cats = new Set(items.map(p => p.category).filter(Boolean));
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
      (
        (p.name || "") + " " +
        (p.desc || "") + " " +
        ((p.tags || []).join(" "))
      ).toLowerCase().includes(q)
    );
  }

  if (sort === "price-asc") items.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sort === "price-desc") items.sort((a, b) => (b.price || 0) - (a.price || 0));
  if (sort === "popular") items.sort((a, b) => (a.popular || 999999) - (b.popular || 999999));

  render(items);
}

function render(items) {
  gridEl.innerHTML = items.map(productCard).join("");
  emptyEl.classList.toggle("hidden", items.length !== 0);

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

const globalMsg = "Bonjour, je souhaite commander. Pouvez-vous m’aider ?";
document.getElementById("wa-global").href = waLink(globalMsg);
document.getElementById("wa-contact").href = waLink("Bonjour, j’ai une question sur vos produits.");

uniqueCategories(PRODUCTS).forEach(c => {
  const opt = document.createElement("option");
  opt.value = c;
  opt.textContent = c;
  categoryEl.appendChild(opt);
});

searchEl.addEventListener("input", applyFilters);
categoryEl.addEventListener("change", applyFilters);
sortEl.addEventListener("change", applyFilters);

applyFilters();
