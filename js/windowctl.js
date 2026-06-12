/* ============================================================
   windowctl.js — macOS-style window management.
   • App.dock — shared tray for minimized "windows"
   • page chrome (top bar traffic lights):
       red    → power-down screen (reboot to restore)
       yellow → minimize the page to the dock
       green  → real fullscreen toggle
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  /* ---------- shared dock ---------- */
  const dock = document.getElementById("dock");
  App.dock = {
    add(id, label, onRestore) {
      if (!dock) return null;
      let item = dock.querySelector('[data-dock-id="' + id + '"]');
      if (!item) {
        item = document.createElement("button");
        item.className = "dock__item";
        item.setAttribute("data-dock-id", id);
        item.setAttribute("data-cursor", "hover");
        item.innerHTML =
          '<span class="dock__dot"></span><span class="dock__label">' + label +
          '</span><span class="dock__hint">· restore</span>';
        item.addEventListener("click", () => {
          App.dock.remove(id);
          if (onRestore) onRestore();
        });
        dock.appendChild(item);
      }
      dock.setAttribute("aria-hidden", "false");
      return item;
    },
    remove(id) {
      if (!dock) return;
      const item = dock.querySelector('[data-dock-id="' + id + '"]');
      if (item) item.remove();
      if (!dock.children.length) dock.setAttribute("aria-hidden", "true");
    },
  };

  App.onReady(function initWindowControls() {
    const btnClose = document.getElementById("winClose");
    const btnMin = document.getElementById("winMin");
    const btnMax = document.getElementById("winMax");
    if (!btnClose || !btnMin || !btnMax) return;
    const group = btnClose.closest(".wc");
    const bar = document.getElementById("bar");
    const shutdown = document.getElementById("shutdown");
    const sdLog = document.getElementById("shutdownLog");
    const reboot = document.getElementById("rebootBtn");

    /* ----- minimize: send the whole page "window" to the dock ----- */
    function minimize() {
      if (document.body.classList.contains("win-min")) return;
      document.body.classList.add("win-min");
      if (App.lenis) App.lenis.stop();
      const item = App.dock.add("page", "dixit@portfolio: ~", restore);
      if (item) item.focus();
    }
    function restore() {
      if (!document.body.classList.contains("win-min")) return;
      document.body.classList.remove("win-min");
      if (App.lenis) App.lenis.start();
      App.dock.remove("page");
    }
    App.win = { isMin: () => document.body.classList.contains("win-min"), minimize, restore };

    /* ----- maximize: real fullscreen toggle ----- */
    const root = document.documentElement;
    const requestFs = root.requestFullscreen || root.webkitRequestFullscreen;
    const exitFs = document.exitFullscreen || document.webkitExitFullscreen;
    const fsOn = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
    function toggleMax() {
      if (!requestFs) return;
      try {
        if (fsOn()) exitFs.call(document);
        else requestFs.call(root);
      } catch (e) {}
    }
    ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) =>
      document.addEventListener(ev, () => {
        if (group) group.classList.toggle("is-zoomed", fsOn());
        btnMax.title = fsOn() ? "Restore" : "Maximize";
      })
    );
    if (!requestFs) {
      btnMax.disabled = true;
      btnMax.title = "Fullscreen not supported here";
    }

    /* ----- close: power down, with an obvious way back ----- */
    let sdTimers = [];
    const clearTimers = () => { sdTimers.forEach(clearTimeout); sdTimers = []; };
    const LINES = [
      '<span class="dim">~/dixit-pambhar $</span> shutdown -h now',
      '> stopping services <span class="dim">........</span> <span class="ok">[ok]</span>',
      '> saving session <span class="dim">...........</span> <span class="ok">[ok]</span>',
      '> unmounting <span class="dim">/portfolio</span> <span class="dim">.....</span> <span class="ok">[ok]</span>',
      '<span class="err">connection to dixit@portfolio closed.</span>',
    ];
    function powerDown() {
      if (!shutdown || shutdown.classList.contains("is-on")) return;
      window.close(); // honest attempt — only works for script-opened tabs
      shutdown.classList.add("is-on");
      shutdown.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (App.lenis) App.lenis.stop();
      sdLog.innerHTML = "";
      if (App.prefersReduced()) {
        sdLog.innerHTML = LINES.join("\n");
        shutdown.classList.add("is-ready");
        if (reboot) reboot.focus();
        return;
      }
      LINES.forEach((l, i) => {
        sdTimers.push(setTimeout(() => {
          sdLog.innerHTML = LINES.slice(0, i + 1).join("\n");
          if (i === LINES.length - 1) {
            sdTimers.push(setTimeout(() => {
              shutdown.classList.add("is-ready");
              if (reboot) reboot.focus();
            }, 260));
          }
        }, 170 * i + 120));
      });
    }
    function cancelShutdown() {
      if (!shutdown || !shutdown.classList.contains("is-on")) return;
      clearTimers();
      shutdown.classList.remove("is-on", "is-ready");
      shutdown.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (App.lenis) App.lenis.start();
    }

    btnClose.addEventListener("click", powerDown);
    btnMin.addEventListener("click", minimize);
    btnMax.addEventListener("click", toggleMax);
    if (reboot) reboot.addEventListener("click", () => location.reload());

    /* double-click on the titlebar background = zoom, like macOS */
    if (bar) {
      bar.addEventListener("dblclick", (e) => {
        if (e.target.closest("a, button, nav")) return;
        toggleMax();
      });
    }

    addEventListener("keydown", (e) => {
      if (shutdown && shutdown.classList.contains("is-on")) {
        if (e.key === "Enter") location.reload();
        else if (e.key === "Escape") cancelShutdown();
        return;
      }
      if (e.key === "Escape" && App.win.isMin()) restore();
    });
  });
})();
