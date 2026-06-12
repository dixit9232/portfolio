/* ============================================================
   typewriter.js — types [data-typewriter] text when revealed
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initTypewriter() {
    const els = App.$$("[data-typewriter]");
    if (!els.length) return;

    function type(el) {
      const text = el.getAttribute("data-text") || el.textContent;
      if (App.prefersReduced()) {
        el.textContent = text;
        return;
      }
      el.textContent = "";
      let i = 0;
      (function tick() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(tick, 38 + Math.random() * 40);
        }
      })();
    }

    // Hero typewriter should run on app:ready (after boot lifts)
    const run = () => els.forEach((el) => type(el));
    if (App.readyFired) run();
    else document.addEventListener("app:ready", run, { once: true });
  });
})();
