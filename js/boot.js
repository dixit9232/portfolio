/* ============================================================
   boot.js — fake boot sequence → fires 'app:ready'
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;
  const reduce = App && App.prefersReduced();

  const fireReady = () => {
    if (window.App) window.App.readyFired = true;
    document.dispatchEvent(new Event("app:ready"));
  };

  const boot = document.getElementById("boot");
  if (!boot) {
    fireReady();
    return;
  }
  const log = document.getElementById("bootLog");
  const bar = document.getElementById("bootBar");
  document.body.style.overflow = "hidden";

  const LINES = [
    '<span class="dim">[</span> booting <span class="amber">portfolio.os</span> v5.0 <span class="dim">]</span>',
    '> loading modules <span class="dim">..........</span> <span class="ok">[ok]</span>',
    '> mounting <span class="dim">/experience</span> ..... <span class="ok">[ok]</span>',
    '> indexing <span class="dim">/projects</span> ....... <span class="ok">[ok]</span>',
    '> compiling <span class="dim">/skills</span> ........ <span class="ok">[ok]</span>',
    '> establishing uplink <span class="dim">......</span> <span class="ok">[ok]</span>',
    '<span class="ok">> ready.</span>',
  ];

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    document.body.style.overflow = "";
    boot.classList.add("is-done");
    boot.style.transition = "opacity 0.45s ease, transform 0.6s cubic-bezier(0.76,0,0.24,1)";
    boot.style.transform = "translateY(-101%)";
    boot.style.opacity = "0";
    document.body.classList.add("is-loaded");
    fireReady();
    setTimeout(() => boot.remove(), 700);
  }

  if (reduce) {
    log.innerHTML = LINES.join("\n");
    if (bar) bar.style.width = "100%";
    setTimeout(finish, 400);
    return;
  }

  let i = 0;
  const step = 150;
  function next() {
    if (i < LINES.length) {
      log.innerHTML = LINES.slice(0, i + 1).join("\n");
      if (bar) bar.style.width = Math.round(((i + 1) / LINES.length) * 100) + "%";
      i++;
      setTimeout(next, i === LINES.length ? 360 : step);
    } else {
      finish();
    }
  }
  setTimeout(next, 200);
  // hard cap: never trap behind the boot screen
  setTimeout(finish, 3600);
})();
