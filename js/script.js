/**
 * script.js — COMPATIBILITY SHIM
 * All functionality has been consolidated into animations.js.
 * This file exists only for pages that still reference it directly.
 * It is a no-op if animations.js has already initialized.
 *
 * DO NOT add new functionality here.
 * DO NOT include both script.js and animations.js on the same page.
 */
(function () {
  "use strict";
  // If animations.js already ran, bail out completely
  if (document.body.dataset.loaded) return;
  console.warn("[script.js] animations.js not detected — loading fallback. Consider removing script.js.");

  // Minimal fallback: navbar scroll
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 40);
    });
  }

  // Minimal fallback: hamburger
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    document.querySelectorAll(".mobile-link").forEach((l) =>
      l.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  // Minimal fallback: reveal
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("revealed"); revealObserver.unobserve(e.target); }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Minimal fallback: FAQ
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-question");
    if (!q) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("active"));
      if (!isOpen) item.classList.add("active");
    });
  });
})();


