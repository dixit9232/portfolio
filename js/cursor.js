/* ============================================================
   cursor.js — block caret cursor with hover / text states
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initCursor() {
    if (App.flags.coarsePointer || App.prefersReduced()) return;
    const cursor = document.getElementById("cursor");
    if (!cursor) return;

    let mx = innerWidth / 2,
      my = innerHeight / 2,
      cx = mx,
      cy = my,
      active = false;

    addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!active) {
          active = true;
          cursor.classList.add("is-active");
        }
      },
      { passive: true }
    );

    (function render() {
      cx = App.lerp(cx, mx, 0.28);
      cy = App.lerp(cy, my, 0.28);
      cursor.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
      requestAnimationFrame(render);
    })();

    document.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    document.addEventListener("mouseenter", () => cursor.classList.add("is-active"));

    function setState(kind) {
      cursor.classList.remove("is-hover", "is-text", "is-dot");
      if (kind === "text") cursor.classList.add("is-text");
      else if (kind === "dot") cursor.classList.add("is-dot");
      else if (kind) cursor.classList.add("is-hover");
    }
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest && e.target.closest("[data-cursor]");
      if (t) setState(t.getAttribute("data-cursor"));
    });
    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest && e.target.closest("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) setState(null);
    });
  });
})();
