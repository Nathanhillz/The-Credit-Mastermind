/* ==========================================================================
   Credit Mastermind — interactions
   ========================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Preloader
     ------------------------------------------------------------------ */
  const preloader = $("#preloader");
  const hidePreloader = () => {
    if (!preloader || !preloader.isConnected) return;
    preloader.classList.add("is-done");
    setTimeout(() => preloader.remove(), 700);
  };
  window.addEventListener("load", () => setTimeout(hidePreloader, 650));
  setTimeout(hidePreloader, 3500);

  /* ------------------------------------------------------------------
     Sticky nav
     ------------------------------------------------------------------ */
  const nav = $("#nav");
  if (nav) {
    const onScrollNav = () => nav.classList.toggle("is-stuck", window.scrollY > 40);
    onScrollNav();
    window.addEventListener("scroll", onScrollNav, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const navToggle = $("#navToggle");
  const navLinks  = $("#navLinks");

  const closeMenu = () => {
    if (!navToggle || !navLinks) return;
    navToggle.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    $$(".nav__link, .nav__cta").forEach((el) => el.addEventListener("click", closeMenu));
  }

  /* ------------------------------------------------------------------
     Theme — light / dark
     ------------------------------------------------------------------ */
  const root       = document.documentElement;
  const themeBtn   = $("#themeToggle");
  const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = (theme, persist) => {
    root.setAttribute("data-theme", theme);

    if (themeBtn) {
      const goingDark = theme !== "dark";
      themeBtn.setAttribute("aria-label", goingDark ? "Switch to dark mode" : "Switch to light mode");
      themeBtn.setAttribute("title", goingDark ? "Dark mode" : "Light mode");
    }

    // Logo marks are colour-specific — swap so they stay legible on the new surface.
    const mark = theme === "dark" ? "logo-mark-light.svg" : "logo-mark.svg";
    $$(".nav__mark, .preloader__mark img").forEach((img) => {
      const next = img.src.replace(/logo-mark(?:-light)?\.svg$/, mark);
      if (next !== img.src) img.src = next;
    });

    if (persist) {
      try { localStorage.setItem("cm-theme", theme); } catch (e) { /* private mode */ }
    }
  };

  applyTheme(root.getAttribute("data-theme") || "light", false);

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  const onSchemeChange = (e) => {
    let saved = null;
    try { saved = localStorage.getItem("cm-theme"); } catch (err) { /* ignore */ }
    if (!saved) applyTheme(e.matches ? "dark" : "light", false);
  };
  if (themeMedia.addEventListener) themeMedia.addEventListener("change", onSchemeChange);
  else if (themeMedia.addListener) themeMedia.addListener(onSchemeChange);

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  const revealEls = $$(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------
     Active nav link on scroll
     ------------------------------------------------------------------ */
  const sections = $$("main section[id]");
  const navAnchors = $$('.nav__link[href^="#"]');

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navAnchors.forEach((a) =>
            a.classList.toggle("is-current", a.getAttribute("href") === "#" + id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ------------------------------------------------------------------
     Inject hover overlay into work cards
     ------------------------------------------------------------------ */
  $$("#workGrid .card").forEach((card) => {
    const media = card.querySelector(".card__media");
    if (media && !media.querySelector(".card__overlay")) {
      const overlay = document.createElement("div");
      overlay.className = "card__overlay";
      overlay.innerHTML = "<span>View engagement</span>";
      media.appendChild(overlay);
    }
  });

  /* ------------------------------------------------------------------
     Scoped filtering — each .filters group owns one grid
     ------------------------------------------------------------------ */
  $$(".filters").forEach((group) => {
    const grid = document.getElementById(group.dataset.grid);
    if (!grid) return;

    const items = $$(".card, .post", grid);
    const buttons = $$(".filter", group);

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const target = btn.dataset.filter;

        items.forEach((item) => {
          const match = target === "all" || item.dataset.category === target;
          item.classList.toggle("is-hidden", !match);

          if (match) {
            item.style.transitionDelay = "0ms";
            item.style.opacity = "0";
            item.style.transform = "translateY(14px)";
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                item.style.opacity = "1";
                item.style.transform = "none";
              })
            );
          }
        });
      });
    });
  });

  /* ------------------------------------------------------------------
     Engagement detail (lightbox) — work grid only
     ------------------------------------------------------------------ */
  const lightbox = $("#lightbox");
  const workCards = $$("#workGrid .card");
  const lb = {
    catSide:  $("#lbCatSide"),
    cat:      $("#lbCat"),
    title:    $("#lbTitle"),
    client:   $("#lbClient"),
    year:     $("#lbYear"),
    services: $("#lbServices"),
    body:     $("#lbBody"),
  };
  let lastFocused = null;

  const openLightbox = (card) => {
    if (!lightbox) return;
    lastFocused = document.activeElement;

    const catEl = card.querySelector(".card__cat");
    const catText = catEl ? catEl.textContent : "";

    if (lb.catSide) lb.catSide.textContent = catText;
    if (lb.cat)     lb.cat.textContent     = catText;
    lb.title.textContent    = card.dataset.title || "";
    lb.client.textContent   = card.dataset.client || "";
    lb.year.textContent     = card.dataset.year || "";
    lb.services.textContent = card.dataset.services || "";
    lb.body.textContent     = card.dataset.body || "";

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".lightbox__close").focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  };

  workCards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("click", () => openLightbox(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (lightbox) {
    $$("[data-close]", lightbox).forEach((el) =>
      el.addEventListener("click", closeLightbox)
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ------------------------------------------------------------------
     Counter animation
     ------------------------------------------------------------------ */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target   = Number(el.dataset.count);
    const suffix   = el.dataset.suffix || "";
    const duration = 1400;
    const start    = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && !prefersReduced) {
    const countObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
  }

  /* ------------------------------------------------------------------
     Testimonial slider
     ------------------------------------------------------------------ */
  const voices    = $$(".voice");
  const dots      = $$(".voices__dot");
  const voiceWrap = $("#voiceStage");
  let voiceIndex = 0;
  let voiceTimer = null;

  const showVoice = (i) => {
    voiceIndex = (i + voices.length) % voices.length;
    voices.forEach((v, n) => v.classList.toggle("is-active", n === voiceIndex));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === voiceIndex));
  };

  const startRotation = () => {
    if (prefersReduced || voices.length < 2) return;
    stopRotation();
    voiceTimer = setInterval(() => showVoice(voiceIndex + 1), 6500);
  };
  const stopRotation = () => voiceTimer && clearInterval(voiceTimer);

  dots.forEach((dot) =>
    dot.addEventListener("click", () => {
      showVoice(Number(dot.dataset.index));
      startRotation();
    })
  );

  if (voiceWrap) {
    voiceWrap.addEventListener("mouseenter", stopRotation);
    voiceWrap.addEventListener("mouseleave", startRotation);
  }
  startRotation();

  /* ------------------------------------------------------------------
     Consultation form (front-end validation / demo submit)
     ------------------------------------------------------------------ */
  const form   = $("#contactForm");
  const status = $("#formStatus");

  const validateField = (input) => {
    const field = input.closest(".field");
    let valid = true;

    if (input.hasAttribute("required")) {
      const value = input.value.trim();
      if (!value) valid = false;
      if (input.type === "email" && value) {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      }
    }
    field.classList.toggle("is-invalid", !valid);
    return valid;
  };

  if (form) {
    $$("#contactForm [required]").forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        const field = input.closest(".field");
        if (field.classList.contains("is-invalid")) validateField(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const inputs = $$("#contactForm [required]");
      const allValid = inputs.map(validateField).every(Boolean);

      if (!allValid) {
        status.textContent = "Please complete the highlighted fields.";
        status.classList.add("is-visible");
        const firstInvalid = $(".field.is-invalid input, .field.is-invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      btn.textContent = "Sending…";

      // Demo only — connect this to your form handler, email service,
      // or a booking tool (Calendly, Acuity, etc.) before launch.
      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.textContent = "Book a Free Consultation";
        status.textContent = "Thank you — we'll be in touch within one business day.";
        status.classList.add("is-visible");
        setTimeout(() => status.classList.remove("is-visible"), 7000);
      }, 1100);
    });
  }

  /* ------------------------------------------------------------------
     Misc
     ------------------------------------------------------------------ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
