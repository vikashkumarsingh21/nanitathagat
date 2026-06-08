/**
 * animations.js — Global animation system for nani.tathagat
 * Controls all animations: particles, parallax, scroll reveals,
 * card effects, button interactions, and page-level effects.
 * Vanilla JS only. No GSAP, no jQuery.
 */

(function () {
  "use strict";

  /* ─── Utilities ──────────────────────────────────────────────────────────── */
  const raf = window.requestAnimationFrame.bind(window);
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const isMobile = () => window.innerWidth <= 768;
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── Page Load Fade ────────────────────────────────────────────────────── */
  function initPageLoad() {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.55s ease";
    raf(() =>
      raf(() => {
        document.body.style.opacity = "1";
      })
    );
  }

  /* ─── Floating Particles ────────────────────────────────────────────────── */
  function initParticles() {
    if (prefersReducedMotion() || isMobile()) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const canvas = document.createElement("canvas");
    canvas.id = "particles-canvas";
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext("2d");
    let W, H, particles;

    function resize() {
      const rect = hero.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = rect.height;
    }

    function createParticles(count) {
      return Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      }));
    }

    resize();
    particles = createParticles(60);
    window.addEventListener("resize", () => {
      resize();
      particles = createParticles(60);
    });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir * 0.002;
        if (p.alpha > 0.5 || p.alpha < 0.05) p.alphaDir *= -1;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });
      raf(draw);
    }
    draw();
  }

  /* ─── Mouse Parallax on Hero ────────────────────────────────────────────── */
  function initHeroParallax() {
    if (prefersReducedMotion() || isMobile()) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let animating = false;

    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!animating) { animating = true; tick(); }
    });

    hero.addEventListener("mouseleave", () => {
      targetX = 0; targetY = 0;
    });

    function tick() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      const orbs = hero.querySelectorAll(".floating-orb");
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 14;
        orb.style.transform = `translate(${currentX * depth}px, ${currentY * depth}px)`;
      });

      const osCanvas = hero.querySelector("#osCanvas");
if (osCanvas) osCanvas.style.transform = `translate(${currentX * 5}px, ${currentY * 5}px)`;

      const gridBg = hero.querySelector(".hero-grid-bg");
      if (gridBg) gridBg.style.transform = `translate(${currentX * 4}px, ${currentY * 4}px)`;

      const dist = Math.abs(currentX - targetX) + Math.abs(currentY - targetY);
      if (dist > 0.001) raf(tick);
      else animating = false;
    }
  }

  /* ─── Scroll Reveal (Intersection Observer) ─────────────────────────────── */
  function initScrollReveal() {
    const els = document.querySelectorAll(
      ".reveal-up, .reveal-left, .reveal-right"
    );
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );

    els.forEach((el) => observer.observe(el));

    // Trigger hero elements immediately
    setTimeout(() => {
      document.querySelectorAll(".hero .reveal-left, .hero .reveal-right").forEach((el) =>
        el.classList.add("revealed")
      );
    }, 200);
  }

  /* ─── Stagger Children (solutions accordion, etc.) ──────────────────────── */
  function initStaggerReveal() {
    const containers = document.querySelectorAll(".stagger-children");
    if (!containers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    containers.forEach((c) => observer.observe(c));
  }

  /* ─── Card Mouse-Glow Effect ────────────────────────────────────────────── */
  function initCardGlow() {
    const cards = document.querySelectorAll(
      ".problem-card, .system-card, .solution-card, .why-item, .acc-item"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", x + "px");
        card.style.setProperty("--mouse-y", y + "px");
      });
    });
  }

  /* ─── Card Lift on Hover ────────────────────────────────────────────────── */
  function initCardHover() {
    if (prefersReducedMotion()) return;
    const cards = document.querySelectorAll(
      ".problem-card, .system-card, .solution-card"
    );

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.willChange = "transform, box-shadow";
      });
      card.addEventListener("mouseleave", () => {
        card.style.willChange = "";
      });
    });
  }

  /* ─── Button Magnetic Effect ────────────────────────────────────────────── */
  function initMagneticButtons() {
    if (prefersReducedMotion() || isMobile()) return;

    const btns = document.querySelectorAll(
      ".btn-primary, .btn-cta-primary, .btn-audit-nav"
    );

    btns.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clamp((e.clientX - cx) * 0.25, -8, 8);
        const dy = clamp((e.clientY - cy) * 0.25, -5, 5);
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
        btn.style.transition = "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)";
        setTimeout(() => { btn.style.transition = ""; }, 450);
      });
    });
  }

  /* ─── Button Ripple Click Effect ────────────────────────────────────────── */
  function initButtonRipple() {
    const btns = document.querySelectorAll(
      ".btn-primary, .btn-secondary, .btn-cta-primary, .btn-cta-secondary, .btn-audit-nav"
    );

    btns.forEach((btn) => {
      btn.style.position = btn.style.position || "relative";
      btn.style.overflow = btn.style.overflow || "hidden";

      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement("span");

        const size = Math.max(rect.width, rect.height) * 2.5;
        ripple.style.cssText = `
          position: absolute;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
          width: ${size}px;
          height: ${size}px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          transform: scale(0);
          animation: rippleEffect 0.55s linear;
          pointer-events: none;
        `;

        // Inject keyframes once
        if (!document.getElementById("ripple-style")) {
          const style = document.createElement("style");
          style.id = "ripple-style";
          style.textContent = `@keyframes rippleEffect {
            to { transform: scale(1); opacity: 0; }
          }`;
          document.head.appendChild(style);
        }

        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /* ─── Button Press Scale ────────────────────────────────────────────────── */
  function initButtonPress() {
    const btns = document.querySelectorAll(
      ".btn-primary, .btn-secondary, .btn-cta-primary, .btn-cta-secondary"
    );
    btns.forEach((btn) => {
      btn.addEventListener("mousedown", () => {
        btn.style.transform = "translateY(0) scale(0.97)";
      });
      ["mouseup", "mouseleave"].forEach((evt) =>
        btn.addEventListener(evt, () => { btn.style.transform = ""; })
      );
    });
  }

  /* ─── Counter Animation ─────────────────────────────────────────────────── */
  function initCounters() {
    const els = document.querySelectorAll("[data-target]");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          const suffix = el.dataset.suffix || "";
          const duration = 1600;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) raf(update);
          }
          raf(update);
        });
      },
      { threshold: 0.5 }
    );

    els.forEach((el) => observer.observe(el));
  }

  /* ─── Industries Marquee Pause on Hover ─────────────────────────────────── */
  function initMarquee() {
    const track = document.querySelector(".industries-track");
    if (!track) return;
    track.addEventListener("mouseenter", () => (track.style.animationPlayState = "paused"));
    track.addEventListener("mouseleave", () => (track.style.animationPlayState = "running"));
  }

  /* ─── Navbar Scroll State ────────────────────────────────────────────────── */
  function initNavbar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        raf(() => {
          navbar.classList.toggle("scrolled", window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ─── Hamburger Menu ────────────────────────────────────────────────────── */
  function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    document.body.classList.toggle("menu-open");
});
    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => mobileMenu.classList.remove("open"));
    });
  }

  /* ─── FAQ Accordion ─────────────────────────────────────────────────────── */
  function initFAQ() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach((item) => {
      const question = item.querySelector(".faq-question");
      if (!question) return;
      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("active");
        items.forEach((i) => i.classList.remove("active"));
        if (!isOpen) item.classList.add("active");
      });
    });
  }

  /* ─── Theme Toggle (decorative) ─────────────────────────────────────────── */
  function initThemeToggle() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.style.color = "#818cf8";
      btn.style.borderColor = "rgba(99,102,241,0.45)";
      btn.style.transform = "rotate(20deg) scale(1.1)";
      setTimeout(() => {
        btn.style.color = "";
        btn.style.borderColor = "";
        btn.style.transform = "";
      }, 350);
    });
  }

  /* ─── Smooth Scroll for Anchor Links ────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ─── Active Nav Link on Scroll ─────────────────────────────────────────── */
  function initActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".nav-link");
    if (!sections.length || !links.length) return;

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        raf(() => {
          let current = "";
          sections.forEach((s) => {
            if (window.scrollY >= s.offsetTop - 140) current = s.id;
          });
          links.forEach((l) => {
            l.classList.remove("active");
            if (l.getAttribute("href") === "#" + current) l.classList.add("active");
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ─── Solutions Page: Accordion & Filters ───────────────────────────────── */
  function initSolutionAccordion() {
    // Delegated — works with dynamically rendered cards from solutions.js
    document.addEventListener("click", (e) => {
      const header = e.target.closest(".acc-header");
      if (!header) return;

      const item = header.closest(".acc-item");
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".acc-item.open").forEach((el) => {
        el.classList.remove("open");
        el.querySelector(".acc-header")?.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("open");
        header.setAttribute("aria-expanded", "true");
        // Smooth scroll into view if needed
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.top < 80) item.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 480);
      }
    });
  }

  function initSolutionFilters() {
    const tabs = document.querySelectorAll(".filter-tab");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const filter = tab.dataset.filter;
        const items = document.querySelectorAll(".acc-item");

        items.forEach((item, i) => {
          const match = filter === "all" || item.dataset.category === filter;
          if (match) {
            item.style.display = "";
            item.style.opacity = "0";
            item.style.transform = "translateY(10px)";
            setTimeout(() => {
              item.style.transition = `opacity 0.3s ease ${i * 0.04}s, transform 0.3s ease ${i * 0.04}s`;
              item.style.opacity = "1";
              item.style.transform = "translateY(0)";
            }, 10);
          } else {
            item.style.display = "none";
            item.classList.remove("open");
          }
        });
      });
    });
  }


  /* ─── OS Graphic — Premium AI Operating System Canvas ───────────────────── */
function initNetworkDiagram() {
  const canvas = document.getElementById("osCanvas");
  const leakBadge = document.getElementById("leakBadge");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const ACCENT = { r: 99,  g: 102, b: 241 };
  const RED    = { r: 239, g: 68,  b: 68  };
  const NODE_LABELS = ["Sales", "Marketing", "Support", "Operations", "Reporting", "Scheduling"];
  const REPORTING_IDX = 4;

  let W, H, CX, CY, R_ORBIT, R_CENTER, R_NODE;
  let dpr = window.devicePixelRatio || 1;
  let t = 0;
  let lastTime = null;
  let particles = [];
  let orbitAngle = 0;

  const LEAK = {
    phase: "idle", phaseT: 0,
    px: 0, py: 0, progress: 0,
    active: false,
    cycleDelay: 5,
    cycleTimer: 2,
  };

  let nodeHit    = Array(6).fill(0);
  let centerPulse   = 0;
  let centerGlowLeak = 0;

  function lerpVal(a, b, f) { return a + (b - a) * f; }

  function resize() {
    const wrap = canvas.parentElement;
    W = wrap.offsetWidth;
    H = wrap.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);
    CX = W * 0.50;
    CY = H * 0.49;
    R_ORBIT  = Math.min(W, H) * 0.345;
    R_CENTER = Math.min(W, H) * 0.155;
    R_NODE   = Math.min(W, H) * 0.083;
    particles = [];
    for (let i = 0; i < 6; i++) {
      for (let k = 0; k < 3; k++) {
        particles.push({
          nodeIdx: i,
          t: k / 3,
          speed: 0.09 + Math.random() * 0.07,
          size: 1.2 + Math.random() * 1.2,
          opacity: 0.3 + Math.random() * 0.45,
          dir: Math.random() > 0.45 ? 1 : -1,
        });
      }
    }
  }

  function nodePos(i, angle) {
    const base = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const a = base + angle;
    return { x: CX + Math.cos(a) * R_ORBIT, y: CY + Math.sin(a) * R_ORBIT };
  }

  function tickLeak(dt) {
    const L = LEAK;
    if (L.phase === "idle") {
      L.cycleTimer -= dt;
      if (L.cycleTimer <= 0) { L.phase = "pulse"; L.phaseT = 0; }
      return;
    }
    L.phaseT += dt;

    if (L.phase === "pulse") {
      centerPulse = Math.sin(L.phaseT * Math.PI / 1.2);
      if (L.phaseT > 1.2) { L.phase = "emerge"; L.phaseT = 0; centerPulse = 0; }
    }
    if (L.phase === "emerge") {
      centerGlowLeak = Math.max(0, 1 - L.phaseT / 0.6);
      if (L.phaseT > 0.5) {
        L.phase = "travel"; L.phaseT = 0; L.progress = 0; L.active = true;
        if (leakBadge) leakBadge.classList.add("visible");
      }
    }
    if (L.phase === "travel") {
      L.progress = Math.min(1, L.phaseT / 1.8);
      const np = nodePos(REPORTING_IDX, orbitAngle);
      L.px = CX + (np.x - CX) * L.progress;
      L.py = CY + (np.y - CY) * L.progress;
      if (L.progress >= 1) {
        L.phase = "hit"; L.phaseT = 0; L.active = false;
        nodeHit[REPORTING_IDX] = 1.0;
      }
    }
    if (L.phase === "hit") {
      nodeHit[REPORTING_IDX] = Math.max(0, 1 - L.phaseT / 1.4);
      if (L.phaseT > 1.4) {
        L.phase = "fade"; L.phaseT = 0;
        if (leakBadge) leakBadge.classList.remove("visible");
      }
    }
    if (L.phase === "fade" && L.phaseT > 0.6) {
      L.phase = "idle"; L.phaseT = 0; L.cycleTimer = L.cycleDelay;
    }
  }

  function drawCenter() {
    const glowMult = 1 + centerPulse * 0.55;

    // Ambient bloom
    const bloom = ctx.createRadialGradient(CX, CY, 0, CX, CY, R_CENTER * 2.5 * glowMult);
    bloom.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.07 + centerPulse * 0.07})`);
    bloom.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bloom;
    ctx.beginPath(); ctx.arc(CX, CY, R_CENTER * 2.5 * glowMult, 0, Math.PI * 2); ctx.fill();

    // Outer ring
    const outerR = R_CENTER * (1.22 + 0.04 * Math.sin(t * 1.2));
    const ringGrad = ctx.createRadialGradient(CX, CY, outerR * 0.88, CX, CY, outerR);
    ringGrad.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.22 + centerPulse * 0.22})`);
    ringGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI * 2);
    ctx.fillStyle = ringGrad; ctx.fill();

    // Spinning arc
    ctx.save();
    ctx.translate(CX, CY); ctx.rotate(t * 0.25); ctx.translate(-CX, -CY);
    ctx.beginPath(); ctx.arc(CX, CY, R_CENTER * 1.18, 0, Math.PI * 1.55);
    ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.28 + centerPulse * 0.18})`;
    ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(CX, CY); ctx.rotate(-t * 0.18); ctx.translate(-CX, -CY);
    ctx.beginPath(); ctx.arc(CX, CY, R_CENTER * 1.28, 0.6, Math.PI * 1.2);
    ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.12)`;
    ctx.lineWidth = 1; ctx.setLineDash([4, 12]); ctx.stroke();
    ctx.restore();

    // Core fill
    const coreFill = ctx.createRadialGradient(CX, CY - R_CENTER * 0.15, R_CENTER * 0.1, CX, CY, R_CENTER);
    coreFill.addColorStop(0, "#131328"); coreFill.addColorStop(0.7, "#0a0a18"); coreFill.addColorStop(1, "#06060f");
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(CX, CY, R_CENTER, 0, Math.PI * 2);
    ctx.fillStyle = coreFill; ctx.fill();

    // Core border
    const lk = centerGlowLeak;
    const bc = lk > 0
      ? `rgba(${lerpVal(ACCENT.r,RED.r,lk)},${lerpVal(ACCENT.g,RED.g,lk)},${lerpVal(ACCENT.b,RED.b,lk)},${0.65+lk*0.35})`
      : `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.55+centerPulse*0.28})`;
    ctx.beginPath(); ctx.arc(CX, CY, R_CENTER, 0, Math.PI * 2);
    ctx.strokeStyle = bc; ctx.lineWidth = 1.5;
    ctx.shadowColor = bc; ctx.shadowBlur = 16 + centerPulse * 18;
    ctx.stroke(); ctx.shadowBlur = 0;

    // Scan line
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, R_CENTER, 0, Math.PI * 2); ctx.clip();
    const scanY = CY - R_CENTER * 0.7 + (R_CENTER * 1.4) * ((t * 0.28) % 1);
    const sg = ctx.createLinearGradient(CX - R_CENTER, scanY, CX + R_CENTER, scanY + 4);
    sg.addColorStop(0, "rgba(99,102,241,0)");
    sg.addColorStop(0.5, "rgba(99,102,241,0.07)");
    sg.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = sg; ctx.fillRect(CX - R_CENTER, scanY, R_CENTER * 2, 4);
    ctx.restore();

    // Inner indicator dots
    const angleInds = [Math.PI*0.25, Math.PI*0.75, Math.PI*1.25, Math.PI*1.75];
    angleInds.forEach((a) => {
      const ix = CX + Math.cos(a) * R_CENTER * 0.72;
      const iy = CY + Math.sin(a) * R_CENTER * 0.72;
      ctx.beginPath(); ctx.arc(ix, iy, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.3+0.2*Math.sin(t*1.8+a)})`;
      ctx.fill();
    });

    // Text
    const fs = Math.max(10, R_CENTER * 0.22);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.5)`; ctx.shadowBlur = 10;
    ctx.font = `700 ${fs}px 'Syne', 'DM Sans', sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.52)"; ctx.fillText("YOUR", CX, CY - fs * 0.72);
    ctx.font = `800 ${fs*1.05}px 'Syne', 'DM Sans', sans-serif`;
    ctx.fillStyle = "#fff"; ctx.fillText("BUSINESS", CX, CY + fs * 0.62);
    ctx.shadowBlur = 0;
  }

  function drawNode(x, y, label, hit) {
    const gc = hit > 0.05
      ? { r: lerpVal(ACCENT.r,RED.r,hit), g: lerpVal(ACCENT.g,RED.g,hit), b: lerpVal(ACCENT.b,RED.b,hit) }
      : ACCENT;

    // Bloom
    const outerBloom = ctx.createRadialGradient(x, y, 0, x, y, R_NODE * 2);
    outerBloom.addColorStop(0, `rgba(${gc.r},${gc.g},${gc.b},${0.08+hit*0.3})`);
    outerBloom.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = outerBloom; ctx.beginPath(); ctx.arc(x, y, R_NODE*2, 0, Math.PI*2); ctx.fill();

    // Fill
    const fill = ctx.createRadialGradient(x, y-R_NODE*0.2, R_NODE*0.1, x, y, R_NODE);
    fill.addColorStop(0, "#111124"); fill.addColorStop(1, "#07070f");
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, R_NODE, 0, Math.PI*2);
    ctx.fillStyle = fill; ctx.fill();

    // Rotating dashed border
    ctx.save();
    ctx.translate(x, y); ctx.rotate(t * 0.35); ctx.translate(-x, -y);
    ctx.beginPath(); ctx.arc(x, y, R_NODE, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(${gc.r},${gc.g},${gc.b},${0.3+hit*0.55})`;
    ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]);
    ctx.shadowColor = `rgba(${gc.r},${gc.g},${gc.b},${0.5+hit*0.5})`; ctx.shadowBlur = 10+hit*22;
    ctx.stroke(); ctx.restore(); ctx.shadowBlur = 0;

    // Inner ring
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, R_NODE*0.72, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(${gc.r},${gc.g},${gc.b},${0.1+hit*0.2})`; ctx.lineWidth = 0.8; ctx.stroke();

    // Dot
    ctx.beginPath(); ctx.arc(x, y, R_NODE*0.12, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${gc.r},${gc.g},${gc.b},${0.5+hit*0.5})`; ctx.fill();

    // Label
    const fs = Math.max(8.5, R_NODE * 0.38);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `600 ${fs}px 'DM Sans', sans-serif`;
    ctx.fillStyle = hit > 0.2
      ? `rgba(248,${lerpVal(200,120,hit)},${lerpVal(200,120,hit)},${0.75+hit*0.25})`
      : `rgba(255,255,255,${0.55+hit*0.3})`;
    ctx.fillText(label, x, y);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const radGlow = ctx.createRadialGradient(CX, CY, 0, CX, CY, R_ORBIT * 1.4);
    radGlow.addColorStop(0, `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.06)`);
    radGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radGlow; ctx.fillRect(0, 0, W, H);

    const nodePts = NODE_LABELS.map((_, i) => nodePos(i, orbitAngle));

    // Connection lines
    nodePts.forEach((np, i) => {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(np.x, np.y);
      ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${0.18+nodeHit[i]*0.1})`;
      ctx.lineWidth = 0.8; ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -t * 18; ctx.stroke(); ctx.restore();

      // Red glow on reporting line during travel
      if (i === REPORTING_IDX && LEAK.phase === "travel") {
        const gl = ctx.createLinearGradient(CX, CY, np.x, np.y);
        gl.addColorStop(0, `rgba(${RED.r},${RED.g},${RED.b},0.0)`);
        gl.addColorStop(LEAK.progress, `rgba(${RED.r},${RED.g},${RED.b},0.35)`);
        gl.addColorStop(1, `rgba(${RED.r},${RED.g},${RED.b},0.0)`);
        ctx.save(); ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(np.x, np.y);
        ctx.strokeStyle = gl; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke(); ctx.restore();
      }
    });

    // Particles
    particles.forEach((p) => {
      const np = nodePts[p.nodeIdx];
      const frac = p.dir === 1 ? p.t : 1 - p.t;
      const px = CX + (np.x - CX) * frac;
      const py = CY + (np.y - CY) * frac;
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${p.opacity})`;
      ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.7)`; ctx.shadowBlur = 6;
      ctx.fill(); ctx.shadowBlur = 0;
    });

    // Leak particle
    if (LEAK.active && LEAK.phase === "travel") {
      const pulse = 0.5 + 0.5 * Math.sin(t * 14);
      ctx.beginPath(); ctx.arc(LEAK.px, LEAK.py, 3+pulse, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${RED.r},${RED.g},${RED.b},0.92)`;
      ctx.shadowColor = `rgba(${RED.r},${RED.g},${RED.b},0.9)`; ctx.shadowBlur = 18;
      ctx.fill(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(LEAK.px, LEAK.py, 6+pulse*2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${RED.r},${RED.g},${RED.b},0.1)`; ctx.fill();
    }

    // Satellite nodes
    nodePts.forEach((np, i) => drawNode(np.x, np.y, NODE_LABELS[i], nodeHit[i]));

    // Center
    drawCenter();

    // Orbit rings
    ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R_ORBIT, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.04)`;
    ctx.lineWidth = 1; ctx.setLineDash([3, 16]); ctx.lineDashOffset = t * 8; ctx.stroke(); ctx.restore();

    ctx.save(); ctx.beginPath(); ctx.arc(CX, CY, R_ORBIT*1.12, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.02)`;
    ctx.lineWidth = 1; ctx.setLineDash([2, 22]); ctx.lineDashOffset = -t * 5; ctx.stroke(); ctx.restore();
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    t += dt;
    orbitAngle += dt * 0.055;

    particles.forEach((p) => {
      p.t += p.speed * dt * p.dir;
      if (p.t > 1) p.t -= 1;
      if (p.t < 0) p.t += 1;
    });

    for (let i = 0; i < 6; i++) {
      if (nodeHit[i] > 0 && LEAK.phase !== "hit") {
        nodeHit[i] = Math.max(0, nodeHit[i] - dt * 0.8);
      }
    }

    tickLeak(dt);
    draw();
    raf(loop);
  }

  resize();
  window.addEventListener("resize", () => resize());
  raf(loop);
}

  /* ─── Navbar Link Ripple ─────────────────────────────────────────────────── */
  function initNavLinkPress() {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        this.style.transform = "scale(0.94)";
        setTimeout(() => (this.style.transform = ""), 140);
      });
    });
  }

  /* ─── About Page: Timeline Reveal ───────────────────────────────────────── */
  function initTimelineReveal() {
    const items = document.querySelectorAll(".timeline-item");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateX(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-16px)";
      item.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
      observer.observe(item);
    });
  }

  /* ─── Contact Form Animation ─────────────────────────────────────────────── */
  function initContactForm() {
    const inputs = document.querySelectorAll(
      ".contact-form input, .contact-form textarea, .contact-form select"
    );
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        const label = input.closest(".form-group")?.querySelector("label");
        if (label) {
          label.style.color = "#818cf8";
          label.style.transition = "color 0.2s";
        }
      });
      input.addEventListener("blur", () => {
        const label = input.closest(".form-group")?.querySelector("label");
        if (label) label.style.color = "";
      });
    });
  }

  /* ─── Orb Ambient Animation on Scroll ────────────────────────────────────── */
  function initOrbParallax() {
    if (prefersReducedMotion() || isMobile()) return;
    const orbs = document.querySelectorAll(".floating-orb");
    if (!orbs.length) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        raf(() => {
          const scroll = window.scrollY;
          const delta = scroll - lastScroll;
          lastScroll = scroll;
          orbs.forEach((orb, i) => {
            const currentTransform = orb.style.transform || "";
            const speed = (i + 1) * 0.06;
            // Adjust the translateY part only when no mouse parallax is active
            if (!currentTransform.includes("translate(")) {
              orb.style.transform = `translateY(${scroll * speed * -1}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  function setActiveNavPage() {
    const currentPage = window.location.pathname.split('/').pop();

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');

        const href = link.getAttribute('href');

        if (href === currentPage) {
            link.classList.add('active');
        }

        if (
            currentPage === '' ||
            currentPage === 'index.html'
        ) {
            const homeLink = document.querySelector(
                '.nav-link[href="index.html"]'
            );

            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
    });
}

  /* ─── Bootstrap ─────────────────────────────────────────────────────────── */
  function init() {
    initPageLoad();
    initNavbar();
    initHamburger();
    initNavLinkPress();
    initActiveNav();
    initSmoothScroll();
    initScrollReveal();
    initStaggerReveal();
    initParticles();
    initHeroParallax();
    initOrbParallax();
    initCardGlow();
    initCardHover();
    initMagneticButtons();
    initButtonRipple();
    initButtonPress();
    initCounters();
    initMarquee();
    initFAQ();
    initThemeToggle();
    initNetworkDiagram();
    initSolutionAccordion();
    initSolutionFilters();
    initTimelineReveal();
    initContactForm();
    setActiveNavPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();



/* THEME TOGGLE */

const themeToggle =
document.getElementById("themeToggle");

if(themeToggle){

    const savedTheme =
    localStorage.getItem("theme");

    if(savedTheme){
        document.documentElement.setAttribute(
            "data-theme",
            savedTheme
        );
    }

    updateThemeIcon();

    themeToggle.addEventListener(
        "click",
        () => {

            const current =
            document.documentElement.getAttribute(
                "data-theme"
            );

            const newTheme =
            current === "light"
            ? "dark"
            : "light";

            document.documentElement.setAttribute(
                "data-theme",
                newTheme
            );

            localStorage.setItem(
                "theme",
                newTheme
            );

            updateThemeIcon();
        }
    );

    function updateThemeIcon(){

        const current =
        document.documentElement.getAttribute(
            "data-theme"
        );

        themeToggle.innerHTML =
        current === "light"
        ? "☀️"
        : "🌙";
    }
}

if(!localStorage.getItem("theme")){

    const prefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    document.documentElement.setAttribute(
      "data-theme",
      prefersDark
      ? "dark"
      : "light"
    );
}