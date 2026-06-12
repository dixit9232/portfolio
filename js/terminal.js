/* ============================================================
   terminal.js — a real interactive shell.
   Open with the bar button, the hero hint, ` (backtick) or ⌘/Ctrl-K.
   Commands navigate the site, print info, and hide a few easter eggs.
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initTerminal() {
    const term = document.getElementById("term");
    if (!term) return;
    const out = document.getElementById("termOut");
    const input = document.getElementById("termInput");
    const screen = document.getElementById("termScreen");
    const openers = [document.getElementById("termOpen"), document.getElementById("termOpenHero")];
    const matrix = document.getElementById("matrix");

    const history = [];
    let hIdx = -1;
    let lastFocus = null;
    let booted = false;

    /* ---------- helpers ---------- */
    const esc = (s) =>
      String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    function print(html, cls) {
      const row = document.createElement("div");
      row.className = "row" + (cls ? " " + cls : "");
      row.innerHTML = html;
      out.appendChild(row);
      screen.scrollTop = screen.scrollHeight;
    }
    const gap = () => print("&nbsp;");

    /* ---------- project data ---------- */
    const PROJECTS = {
      "parking-system": { cat: "saas", desc: "officer-side parking SaaS · 190+ client configs from one codebase", stack: "flutter · dynamic-theming · rest · multi-tenant" },
      neon: { cat: "gaming", desc: "multiplayer board games (checkers, dots & boxes, nine men's morris) + IAP", stack: "flutter · socket.io · iap" },
      cheetah: { cat: "edtech", desc: "grades 5–7 learning app · quizzes, mock exams, badges, recommendations", stack: "flutter · firebase · analytics" },
      "rocket-chess": { cat: "gaming", desc: "online/offline competitive chess · skill-only mode, chat", stack: "flutter · realtime" },
      studyak: { cat: "edtech", desc: "multi-field course platform · assessments, offline, user-created courses", stack: "flutter · offline-first" },
      "talk-about-it": { cat: "health", desc: "mental-health telehealth · chat / video / messaging", stack: "flutter · webrtc" },
      "marquel-wrecking": { cat: "ondemand", desc: "on-demand towing (jamaica) · distance pricing, live dispatch", stack: "flutter · maps · geolocation · payments" },
    };
    const ALIASES = { rocketchess: "rocket-chess", talkaboutit: "talk-about-it", marquel: "marquel-wrecking", parking: "parking-system", "parking-management-system": "parking-system" };
    const resolveProject = (n) => {
      n = (n || "").replace(/\.json$/, "").toLowerCase();
      return PROJECTS[n] ? n : ALIASES[n] || null;
    };

    const SECTIONS = { home: "#hero", hero: "#hero", about: "#about", experience: "#experience", log: "#experience", skills: "#skills", work: "#work", projects: "#work", education: "#education", edu: "#education", contact: "#contact" };

    /* ---------- commands ---------- */
    const COMMANDS = {
      help() {
        const list = [
          ["help", "show this list"],
          ["whoami / about", "who is dixit"],
          ["ls [projects]", "list files / projects"],
          ["cat &lt;project&gt;", "inspect a project"],
          ["open &lt;project&gt;", "jump to a project"],
          ["skills", "the toolkit"],
          ["experience", "work history (git log)"],
          ["education", "the foundations"],
          ["contact / resume", "get in touch / download CV"],
          ["goto &lt;section&gt;", "navigate the page"],
          ["crt", "toggle the CRT effect"],
          ["neofetch", "system info"],
          ["clear", "clear the screen"],
          ["exit", "close the shell"],
        ];
        print('<span class="dim">available commands — try tab-completion:</span>');
        list.forEach(([c, d]) => print(`  <span class="ok">${c}</span>  <span class="dim">— ${d}</span>`));
        print('<span class="dim">psst… there are a few easter eggs in here too.</span>');
      },
      whoami() {
        print('<span class="ok">dixit pambhar</span> <span class="dim">—</span> senior flutter &amp; full-stack developer');
        print('<span class="dim">5+ yrs building cross-platform apps &amp; resilient backends. surat, IN.</span>');
      },
      about() {
        this.whoami();
        gap();
        print("started as an intern writing UI, grew into leading flutter architecture for");
        print("products shipping to <span class=\"ok\">hundreds of client configurations</span>. full-stack by");
        print("habit, mobile-first by heart. currently leading flutter dev @ <span class=\"cy\">DecodeUp</span>.");
      },
      ls(args) {
        if ((args[0] || "").indexOf("project") === 0) return this.projects();
        print('<span class="cy">about.md  experience/  skills/  projects/  education/  contact.sh  resume.pdf</span>');
      },
      projects() {
        print('<span class="dim">total ' + Object.keys(PROJECTS).length + ' + NDA</span>');
        Object.keys(PROJECTS).forEach((k) => {
          const p = PROJECTS[k];
          print(`  <span class="amb">${k}.json</span>  <span class="dim">[${p.cat}]</span>  ${p.desc}`);
        });
        print('  <span class="err">*.nda</span>  <span class="dim">[restricted]</span>  permission denied — ask for access');
        gap();
        print('<span class="dim">tip: <span class="ok">cat neon</span> or <span class="ok">open cheetah</span></span>');
      },
      cat(args) {
        const file = args[0] || "";
        if (file === "about.md" || file === "about") return this.about();
        if (file === "resume.pdf") return this.resume();
        const key = resolveProject(file);
        if (!key) {
          print('<span class="err">cat: ' + esc(file || "(nothing)") + ": no such file</span>");
          print('<span class="dim">try <span class="ok">ls projects</span></span>');
          return;
        }
        const p = PROJECTS[key];
        print('<span class="punc">{</span>');
        print('  <span class="key">"name"</span>: <span class="str">"' + key + '"</span>,');
        print('  <span class="key">"category"</span>: <span class="str">"' + p.cat + '"</span>,');
        print('  <span class="key">"summary"</span>: <span class="str">"' + esc(p.desc) + '"</span>,');
        print('  <span class="key">"stack"</span>: <span class="str">"' + p.stack + '"</span>,');
        print('  <span class="key">"status"</span>: <span class="vi">"shipped"</span>');
        print('<span class="punc">}</span>');
        print('<span class="dim">→ <span class="ok">open ' + key + "</span> to view it on the page</span>");
      },
      open(args) {
        const key = resolveProject(args[0]);
        if (!key) {
          print('<span class="err">open: unknown project. try <span class="ok">ls projects</span></span>');
          return;
        }
        print('<span class="ok">opening ' + key + " →</span> filtering projects…");
        const filterBtn = document.querySelector('.filt[data-filter="' + PROJECTS[key].cat + '"]');
        close(() => {
          App.scrollTo("#work", { offset: -56 });
          if (filterBtn) setTimeout(() => filterBtn.click(), 700);
        });
      },
      skills() {
        const rows = [
          ["mobile", "dart · flutter · riverpod · bloc · getx · kotlin · java"],
          ["frontend", "javascript · typescript · react · next · redux · tanstack · tailwind"],
          ["backend", "node · express · python · laravel · fastapi · flask · graphql · socket.io"],
          ["data/cloud", "firebase · supabase · mongo · mysql · postgres · aws · cloudflare"],
          ["tooling", "git · ci/cd · unit-testing · postman · figma · webhooks"],
        ];
        rows.forEach(([k, v]) => print('<span class="cy">' + k.padEnd(11) + "</span> " + v));
      },
      experience() {
        const jobs = [
          ["a1f0c2e", "DecodeUp (P) Limited", "Senior Flutter Developer · contract", "Jan 2026 — present"],
          ["9c4be71", "Anantkaal LLP", "Senior Flutter & Full-Stack Developer", "Nov 2021 — Jan 2026"],
          ["3e8a05d", "Shubhchintak Technology", "Flutter Developer Intern · remote", "May 2021 — Nov 2021"],
        ];
        jobs.forEach(([h, org, role, date]) => {
          print('<span class="amb">' + h + '</span> <span class="ok">' + role + "</span>");
          print('         <span class="dim">' + org + " · " + date + "</span>");
        });
      },
      education() {
        print('<span class="cy">education/</span>');
        print('<span class="dim">├──</span> <span class="ok">flutter-development-course/</span> <span class="dim"># CDMI · 2020–21</span>');
        print('<span class="dim">├──</span> <span class="ok">bsc-science/</span>                <span class="dim"># Navyug · 2018–20 · dropout</span>');
        print('<span class="dim">└──</span> <span class="ok">higher-secondary/</span>           <span class="dim"># Krishna · 2016–18</span>');
      },
      contact() {
        print('<span class="cy">email</span>  <a href="mailto:dixitpambhar9232@gmail.com">dixitpambhar9232@gmail.com</a>');
        print('<span class="cy">phone</span>  <a href="tel:+919510261318">+91 95102 61318</a>');
        print('<span class="cy">loc  </span>  surat, gujarat · india');
        print('<span class="dim">→ <span class="ok">goto contact</span> for the form</span>');
      },
      social() {
        print('<a href="https://www.linkedin.com/" target="_blank" rel="noopener">linkedin</a>  ·  <a href="https://github.com/" target="_blank" rel="noopener">github</a>');
      },
      resume() {
        print('<span class="ok">↓ downloading resume.pdf…</span>');
        const a = document.createElement("a");
        a.href = "assets/Dixit_Pambhar_Sr._Flutter_%26_Full_Stack_Developer_Resume.pdf";
        a.download = "Dixit_Pambhar_Resume.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      },
      goto(args) {
        const sel = SECTIONS[(args[0] || "").toLowerCase()];
        if (!sel) {
          print('<span class="err">goto: unknown section. try: about, skills, projects, contact</span>');
          return;
        }
        print('<span class="ok">→ ' + args[0] + "</span>");
        close(() => App.scrollTo(sel, { offset: -56 }));
      },
      crt() {
        const btn = document.getElementById("crtToggle");
        if (btn) btn.click();
        print('<span class="dim">crt effect ' + (document.body.classList.contains("crt") ? "enabled" : "disabled") + "</span>");
      },
      neofetch() {
        const logo = [
          '<span class="ok"> ╔═════════╗</span>',
          '<span class="ok"> ║  &gt;_ DP  ║</span>   <span class="cy">dixit</span>@<span class="cy">portfolio</span>',
          '<span class="ok"> ╚═════════╝</span>   <span class="dim">─────────────────</span>',
          '              <span class="cy">role</span>     senior flutter &amp; full-stack dev',
          '              <span class="cy">loc</span>      surat, gujarat · india',
          '              <span class="cy">uptime</span>   5+ years in production',
          '              <span class="cy">projects</span> 7+ shipped (+ NDA)',
          '              <span class="cy">shell</span>    portfolio.sh v5.0',
          '              <span class="cy">stack</span>    dart flutter react node python laravel',
        ];
        logo.forEach((l) => print(l));
      },
      echo(args) { print(esc(args.join(" ")) || "&nbsp;"); },
      date() { print('<span class="dim">' + esc(new Date().toString()) + "</span>"); },
      pwd() { print("/home/dixit/portfolio"); },
      sudo() { print('<span class="err">dixit is not in the sudoers file. this incident will be reported.</span>'); },
      rm(args) {
        if (args.join(" ").indexOf("-rf") >= 0) { print('<span class="ok">nice try.</span> <span class="dim">everything is committed to git anyway. 🙂</span>'); }
        else print('<span class="err">rm: refusing to remove anything important</span>');
      },
      vim() { print('<span class="dim">entering vim… just kidding. to exit vim irl: smash esc, pray, type :q!</span>'); },
      coffee() { print('<span class="amb">☕ brewing… HTTP 418: i\'m a teapot.</span>'); },
      sl() { print('<span class="amb">🚂💨  choo choo — you typed sl instead of ls, didn\'t you?</span>'); },
      matrix() { startMatrix(); },
      clear() { out.innerHTML = ""; },
      exit() { close(); },
    };
    const ALIAS_CMD = { "?": "help", info: "neofetch", history: "experience", log: "experience", edu: "education", cv: "resume", download: "resume", links: "social", cls: "clear", quit: "exit", q: "exit", close: "exit", theme: "crt", cd: "goto", nano: "vim", emacs: "vim" };

    /* ---------- run ---------- */
    function run(raw) {
      const line = raw.trim();
      print('<span class="cmdline"><span class="ps">~/dixit-pambhar</span> <span class="sg">$</span> ' + esc(raw) + "</span>");
      if (!line) return;
      history.push(line);
      hIdx = history.length;
      const parts = line.split(/\s+/);
      let cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      cmd = ALIAS_CMD[cmd] || cmd;
      if (COMMANDS[cmd]) {
        try { COMMANDS[cmd](args); } catch (e) { print('<span class="err">error: ' + esc(e.message) + "</span>"); }
      } else {
        print('<span class="err">command not found: ' + esc(parts[0]) + "</span> <span class=\"dim\">— type <span class=\"ok\">help</span></span>");
      }
      gap();
    }

    /* ---------- open / close ---------- */
    function open() {
      if (term.classList.contains("is-open")) return input.focus();
      lastFocus = document.activeElement;
      term.classList.add("is-open");
      term.setAttribute("aria-hidden", "false");
      if (App.lenis) App.lenis.stop();
      if (!booted) {
        booted = true;
        print('<span class="ok">portfolio.sh v5.0</span> <span class="dim">— interactive shell</span>');
        print('<span class="dim">type <span class="ok">help</span> for commands · <span class="ok">exit</span> or <kbd>esc</kbd> to close</span>');
        gap();
      }
      setTimeout(() => input.focus(), 80);
    }
    function close(after) {
      term.classList.remove("is-open");
      term.setAttribute("aria-hidden", "true");
      if (App.lenis) App.lenis.start();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (typeof after === "function") setTimeout(after, 260);
    }

    openers.forEach((b) => b && b.addEventListener("click", open));
    App.$$("[data-term-close]", term).forEach((b) => b.addEventListener("click", () => close()));

    /* keep clicks inside the screen focusing the input */
    screen.addEventListener("click", (e) => {
      if (!e.target.closest("a")) input.focus();
    });

    /* ---------- input keys ---------- */
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hIdx > 0) input.value = history[--hIdx] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hIdx < history.length - 1) input.value = history[++hIdx] || "";
        else { hIdx = history.length; input.value = ""; }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const cur = input.value.trim().toLowerCase();
        if (!cur) return;
        const names = Object.keys(COMMANDS).concat(Object.keys(ALIAS_CMD));
        const matches = names.filter((n) => n.indexOf(cur) === 0);
        if (matches.length === 1) input.value = matches[0] + " ";
        else if (matches.length > 1) { print('<span class="dim">' + matches.join("   ") + "</span>"); }
      }
    });

    /* ---------- global shortcuts ---------- */
    addEventListener("keydown", (e) => {
      const editable = /^(input|textarea|select)$/i.test((e.target.tagName || "")) && e.target !== input;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        term.classList.contains("is-open") ? close() : open();
      } else if (e.key === "`" && !editable && !term.classList.contains("is-open")) {
        e.preventDefault();
        open();
      } else if (e.key === "Escape") {
        if (matrix && matrix.classList.contains("is-on")) return stopMatrix();
        if (term.classList.contains("is-open")) close();
      }
    });

    /* ---------- matrix easter egg ---------- */
    let mRAF = 0;
    function startMatrix() {
      if (!matrix) return;
      if (App.prefersReduced()) {
        print('<span class="dim">the matrix needs motion — you\'ve got reduced-motion on. taking the blue pill. 💊</span>');
        return;
      }
      print('<span class="ok">wake up, neo…</span> <span class="dim">(click / any key / esc to exit)</span>');
      const ctx = matrix.getContext("2d");
      let W, H, cols, drops;
      function size() {
        W = matrix.width = innerWidth;
        H = matrix.height = innerHeight;
        cols = Math.floor(W / 16);
        drops = Array(cols).fill(0).map(() => Math.floor((Math.random() * H) / 16));
      }
      size();
      const chars = "01<>/\\|=+*アイウエオカキdixitpambhar{}();".split("");
      function draw() {
        ctx.fillStyle = "rgba(8,11,9,0.08)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#4ef08a";
        ctx.font = "14px monospace";
        for (let i = 0; i < drops.length; i++) {
          const ch = chars[(Math.random() * chars.length) | 0];
          ctx.fillText(ch, i * 16, drops[i] * 16);
          if (drops[i] * 16 > H && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
        mRAF = requestAnimationFrame(draw);
      }
      matrix.classList.add("is-on");
      draw();
      const stop = () => stopMatrix();
      matrix.addEventListener("click", stop, { once: true });
      addEventListener("keydown", stop, { once: true });
      addEventListener("resize", size);
      matrix._size = size;
      clearTimeout(matrix._t);
      matrix._t = setTimeout(stopMatrix, 8000);
    }
    function stopMatrix() {
      if (!matrix) return;
      cancelAnimationFrame(mRAF);
      matrix.classList.remove("is-on");
      if (matrix._size) removeEventListener("resize", matrix._size);
      clearTimeout(matrix._t);
    }
  });
})();
