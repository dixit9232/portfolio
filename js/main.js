/* ============================================================
   main.js — boot: Lenis ↔ GSAP wiring, clock, CRT toggle,
   back-to-top, then run all modules
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;
  const reduce = App.prefersReduced();

  if (App.flags.hasGSAP && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* smooth scroll */
  if (App.flags.hasLenis && !reduce) {
    const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, smoothTouch: false });
    App.lenis = lenis;
    if (App.flags.hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => {
        lenis.raf(t);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  /* year */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* live clock */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const tick = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      clock.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* CRT toggle (persisted; defaults on) */
  const crtBtn = document.getElementById("crtToggle");
  let crtOn = true;
  try {
    const saved = localStorage.getItem("crt");
    if (saved !== null) crtOn = saved === "1";
  } catch (e) {}
  function setCrt(on) {
    crtOn = on;
    document.body.classList.toggle("crt", on);
    if (crtBtn) crtBtn.setAttribute("aria-pressed", String(on));
    try {
      localStorage.setItem("crt", on ? "1" : "0");
    } catch (e) {}
  }
  setCrt(crtOn);
  if (crtBtn) crtBtn.addEventListener("click", () => setCrt(!crtOn));

  /* back to top */
  const backTop = document.getElementById("backTop");
  if (backTop)
    backTop.addEventListener("click", () => {
      if (App.lenis) App.lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

  /* run modules — after profile data is loaded (content.js), so
     section renderers finish before observers query the DOM */
  Promise.resolve(App.dataReady).then(() => App.boot());

  if (App.flags.hasGSAP && window.ScrollTrigger) {
    window.addEventListener("load", () => window.ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => window.ScrollTrigger.refresh());
  }
})();
