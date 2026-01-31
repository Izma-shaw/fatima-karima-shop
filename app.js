"use strict";

// 1) Mets ton numéro WhatsApp ici (format international SANS +)
const WHATSAPP_NUMBER = "224623178649";

// 2) Produits (chemins relatifs -> ok en file:// et Vercel)
// IMPORTANT: sur Vercel la casse compte (produit1.mp4 != Produit1.mp4)
const PRODUCTS = [
  {
    id: "p1",
    name: "Abaya élégante",
    price: 150000,
    category: "Abaya",
    tags: ["Abaya"],
    desc: "Nouvelle arrivage – Abaya élégante, coupe moderne et tissu de qualité.",
    video: "videos/Produit5.mp4",
  },
  {
    id: "p2",
    name: "Vidéo modèle A",
    price: 35000,
    category: "Souffour",
    tags: ["Nouvelle arrivage"],
    desc: "Nouvelle arrivage – modèle récemment disponible.",
    video: "videos/Produit3.mp4",
  },
  {
    id: "p3",
    name: "Vidéo modèle B",
    price: 35000,
    category: "Souffour",
    tags: ["Neuf"],
    desc: "Description courte : qualité, pratique, disponible.",
    video: "videos/Produit1.mp4",
  },
  {
    id: "p4",
    name: "Vidéo modèle C",
    price: 35000,
    category: "Souffour",
    tags: ["Neuf"],
    desc: "Description courte : qualité, pratique, disponible.",
    video: "videos/Produit2.mp4",
  },
];




function formatGNF(n) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function waLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function mediaBlock(p, index) {
  if (!p.video) return `<img src="${p.image || ""}" alt="${p.name}">`;

  // 1ère video = son par défaut (tentative)
  const defaultSound = index === 0 ? "1" : "0";

  return `
    <div class="media">
      <video
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        controls="true"
        data-default-sound="${defaultSound}"
      >
        <source src="${p.video}" type="video/mp4">
        Votre navigateur ne supporte pas la vidéo.
      </video>

      <button class="sound-btn" type="button" aria-label="Activer/Désactiver le son">
        🔊 Son
      </button>
    </div>
  `;
}

function productCard(p, index) {
  const message = `Bonjour, je souhaite commander : ${p.name} - ${formatGNF(p.price)}. Est-ce disponible ?`;

  return `
    <article class="card">
      <div class="thumb">
        ${mediaBlock(p, index)}
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

  render(items);
}

function render(items) {
  gridEl.innerHTML = items.map((p, i) => productCard(p, i)).join("");
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

  // --- Sound logic: une seule video avec son ---
  const videos = Array.from(gridEl.querySelectorAll("video"));
  const buttons = Array.from(gridEl.querySelectorAll(".sound-btn"));

  function refreshButtons() {
    buttons.forEach((btn, idx) => {
      const v = videos[idx];
      btn.textContent = v && !v.muted ? "🔇 Muet" : "🔊 Son";
    });
  }

  function setSoundOn(targetVideo) {
    videos.forEach(v => {
      if (!targetVideo) {
        v.muted = true;
      } else {
        v.muted = v !== targetVideo;
      }
      v.volume = 1;
    });
    refreshButtons();
  }

  // 1) Init: toutes muettes
  videos.forEach(v => {
    v.muted = true;
    v.volume = 1;
  });
  refreshButtons();

  // 2) Tentative: son sur la première (si existe)
  const first = videos.find(v => v.dataset.defaultSound === "1") || videos[0];
  if (first) {
    first.muted = false;
    first.volume = 1;

    // Certains navigateurs refusent autoplay avec son sans interaction
    first.play().then(() => {
      setSoundOn(first);
    }).catch(() => {
      first.muted = true;
      setSoundOn(null);
    });
  }

  // 3) Click: toggle son sur celle-ci + mute les autres
  buttons.forEach((btn, idx) => {
    btn.addEventListener("click", async () => {
      const v = videos[idx];
      if (!v) return;

      try {
        if (v.muted) {
          setSoundOn(v);
          await v.play();
        } else {
          v.muted = true;
          setSoundOn(null);
        }
      } catch {
        v.controls = true; // fallback si blocage navigateur
      }
    });
  });
}

// --- Init ---
const gridEl = document.getElementById("grid");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");
const categoryEl = document.getElementById("category");

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

// Basic guard
if (WHATSAPP_NUMBER === "TON_NUMERO") {
  console.warn("⚠️ Mets ton numéro WhatsApp dans app.js (WHATSAPP_NUMBER).");
}

applyFilters();
