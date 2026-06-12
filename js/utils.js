/* ============================================================
   utils.js — shared namespace, helpers, capability flags
   ============================================================ */
(function () {
  "use strict";
  const App = (window.App = window.App || {});

  App.flags = {
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    coarsePointer: window.matchMedia("(hover: none)").matches,
    hasGSAP: typeof window.gsap !== "undefined",
    hasLenis: typeof window.Lenis !== "undefined",
  };

  App.$ = (s, c = document) => c.querySelector(s);
  App.$$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  App.clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  App.lerp = (a, b, t) => a + (b - a) * t;
  App.prefersReduced = () => App.flags.reduceMotion;

  App.raf = (fn) => {
    let t = false;
    return (...a) => {
      if (t) return;
      t = true;
      requestAnimationFrame(() => {
        fn(...a);
        t = false;
      });
    };
  };

  App.lenis = null;
  App.readyFired = false;

  App.scrollTo = (target, opts = {}) => {
    const el = typeof target === "string" ? App.$(target) : target;
    if (!el) return;
    if (App.lenis) App.lenis.scrollTo(el, { offset: opts.offset ?? -56, duration: 1.05 });
    else {
      const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? -56);
      window.scrollTo({ top, behavior: App.prefersReduced() ? "auto" : "smooth" });
    }
  };

  App._inits = [];
  App.onReady = (fn) => App._inits.push(fn);
  App.boot = () =>
    App._inits.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("[App] init failed:", e);
      }
    });
})();
