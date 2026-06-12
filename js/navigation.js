/* ============================================================
   navigation.js — active-section sync, mobile drawer,
   smooth anchor scroll, status-bar path
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initNavigation() {
    const navLinks = App.$$("[data-navlink]");
    const drawer = document.getElementById("drawer");
    const menuToggle = document.getElementById("menuToggle");
    const statusPath = document.querySelector("[data-status-section]");
    const sections = App.$$("main section[id]");

    /* active link + status path via IntersectionObserver */
    if (sections.length && "IntersectionObserver" in window) {
      const byId = {};
      navLinks.forEach((a) => (byId[a.getAttribute("href").slice(1)] = a));
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const id = en.target.id;
            navLinks.forEach((l) => l.classList.remove("is-active"));
            if (byId[id]) byId[id].classList.add("is-active");
            if (statusPath) statusPath.textContent = "~/" + id;
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((s) => io.observe(s));
    }

    /* drawer */
    function setDrawer(open) {
      if (!drawer) return;
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
      if (App.lenis) open ? App.lenis.stop() : App.lenis.start();
    }
    if (menuToggle && drawer) {
      menuToggle.addEventListener("click", () =>
        setDrawer(!drawer.classList.contains("is-open"))
      );
      App.$$("[data-drawerlink]").forEach((a) =>
        a.addEventListener("click", () => setDrawer(false))
      );
      addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false);
      });
    }

    /* smooth anchor scroll */
    App.$$('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      a.addEventListener("click", (e) => {
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (drawer && drawer.classList.contains("is-open")) setDrawer(false);
        App.scrollTo(target, { offset: -56 });
        history.replaceState(null, "", id);
      });
    });
  });
})();
