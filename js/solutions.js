import solutionsData from "./solutionsData.js";

// ── Category slug → filter tab value mapping ─────────────────────────────────
const CATEGORY_MAP = {
  "ai-automation": "ai-automation",
  "ai-voice":      "ai-voice",
  "web":           "web",
  "audit-strategy":"audit-strategy",
};

// ── Render ────────────────────────────────────────────────────────────────────
function buildCard(solution) {
  const {
    category,
    badge,
    title,
    subtitle,
    description,
    features = [],
    price,
    priceLabel = "one-time build",
  } = solution;

  const featureItems = features
    .map((f) => `<li>${f}</li>`)
    .join("\n            ");

  // Price block: "Custom" gets its own class, everything else uses acc-price
  const priceBlock =
    price === "Custom"
      ? `<p class="acc-price-custom">Custom Pricing</p>`
      : `<p class="acc-price"><span>${price}</span> / ${priceLabel}</p>`;

  return `
  <div class="acc-item" data-category="${CATEGORY_MAP[category] || category}">
    <button class="acc-header" aria-expanded="false">
      <div class="acc-top-row">
        <div class="acc-meta">
          <span class="acc-badge">${badge}</span>
          <p class="acc-title">${title}</p>
          <p class="acc-desc">${subtitle}</p>
        </div>
        <span class="acc-arrow" aria-hidden="true">▾</span>
      </div>
    </button>
    <div class="acc-body" role="region">
      <div class="acc-body-inner">
        <p>${description}</p>
        <p class="acc-features-label">WHAT'S INCLUDED</p>
        <ul class="acc-features">
          ${featureItems}
        </ul>
        <div class="acc-footer">
          ${priceBlock}
          <a href="contact.html" class="btn-primary">Get Started →</a>
        </div>
      </div>
    </div>
  </div>`.trim();
}

function render() {
  const accordionList = document.querySelector(".accordion-list");

  if (!accordionList) {
    console.error(
      "[solutions.js] Could not find .accordion-list container. " +
        "Make sure solutions.html contains <div class=\"accordion-list\"></div> " +
        "inside the .solutions-section."
    );
    return;
  }

  accordionList.innerHTML = solutionsData.map(buildCard).join("\n");
  console.log(`[solutions.js] Rendered ${solutionsData.length} solution cards.`);
}

// ── Accordion (one open at a time) ────────────────────────────────────────────
function initAccordion() {
  document.addEventListener("click", (e) => {
    const header = e.target.closest(".acc-header");
    if (!header) return;

    const item   = header.closest(".acc-item");
    const isOpen = item.classList.contains("open");

    // close all
    document.querySelectorAll(".acc-item.open").forEach((el) => {
      el.classList.remove("open");
      el.querySelector(".acc-header").setAttribute("aria-expanded", "false");
    });

    // toggle clicked
    if (!isOpen) {
      item.classList.add("open");
      header.setAttribute("aria-expanded", "true");
    }
  });
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
function initFilters() {
  const tabs = document.querySelectorAll(".filter-tab");

  if (!tabs.length) {
    console.warn("[solutions.js] No .filter-tab elements found.");
    return;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // update active state
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const filter = tab.dataset.filter;
      const items  = document.querySelectorAll(".acc-item");

      items.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.style.display = match ? "" : "none";
        if (!match) item.classList.remove("open");
      });
    });
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  render();
  initAccordion();
  initFilters();
});