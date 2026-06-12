/* ============================================================
   animations.js — scroll reveals (IO-driven, GSAP-independent)
   with optional GSAP parallax accent on the hero name
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;
  const reduce = App.prefersReduced();

  App.onReady(function initReveals() {
    const items = App.$$("[data-reveal]");
    if (!items.length) return;

    // grouped stagger for siblings
    const groups = new Map();
    items.forEach((el) => {
      const p = el.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach((arr) => {
      if (arr.length > 1)
        arr.forEach((el, i) => (el.style.transitionDelay = Math.min(i * 0.06, 0.36) + "s"));
    });

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            obs.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    items.forEach((el) => io.observe(el));
  });

  App.onReady(function initParallax() {
    if (!App.flags.hasGSAP || !window.ScrollTrigger || reduce) return;
    const gsap = window.gsap;
    const name = document.querySelector(".hero__name");
    if (name) {
      gsap.to(name, {
        yPercent: -10,
        opacity: 0.85,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }
  });
})();
