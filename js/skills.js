/* ============================================================
   skills.js — animate skill bars + numeric counters on view
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initSkills() {
    function fillBar(li) {
      const lvl = App.clamp(parseFloat(li.getAttribute("data-level")) || 0, 0, 100);
      const fill = li.querySelector(".skl__bar i");
      if (fill) fill.style.width = lvl + "%";
    }

    function count(el) {
      const to = parseFloat(el.getAttribute("data-to")) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      if (App.prefersReduced()) {
        el.textContent = to + suffix;
        return;
      }
      const dur = 1400;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      let start = null;
      (function step(ts) {
        if (start === null) start = ts;
        const p = App.clamp((ts - start) / dur, 0, 1);
        el.textContent = Math.round(to * ease(p)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = to + suffix;
      })(performance.now());
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            if (en.target.hasAttribute("data-skill")) fillBar(en.target);
            if (en.target.hasAttribute("data-counter")) count(en.target);
            obs.unobserve(en.target);
          });
        },
        { threshold: 0.35 }
      );
      App.$$("[data-skill], [data-counter]").forEach((el) => io.observe(el));
    } else {
      App.$$("[data-skill]").forEach(fillBar);
      App.$$("[data-counter]").forEach(count);
    }
  });
})();
