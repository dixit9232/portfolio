/* ============================================================
   projects.js — category filtering for the JSON cards
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initProjects() {
    const filters = App.$$(".filt");
    const grid = document.querySelector("[data-projects]");
    if (!grid) return;
    const cards = App.$$(".card", grid);

    cards.forEach((c) => {
      c.style.transition = "opacity 0.35s var(--ease-out), transform 0.35s var(--ease-out)";
    });

    function apply(key) {
      cards.forEach((card, i) => {
        const cat = card.getAttribute("data-cat");
        const show = key === "all" || cat === key || cat === "all";
        if (show) {
          card.classList.remove("is-hidden");
          card.style.transitionDelay = (App.prefersReduced() ? 0 : i * 0.03) + "s";
          requestAnimationFrame(() => {
            card.style.opacity = "1";
            card.style.transform = "";
          });
        } else {
          card.style.transitionDelay = "0s";
          card.style.opacity = "0";
          card.style.transform = "translateY(8px)";
          setTimeout(() => card.classList.add("is-hidden"), 240);
        }
      });
    }

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        apply(btn.getAttribute("data-filter"));
      });
    });
  });
})();
