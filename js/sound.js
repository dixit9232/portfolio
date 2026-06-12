/* ============================================================
   sound.js — mechanical keyboard sounds, the way keyboard
   simulators (kbsim, Mechvibes) do it:

     • real switch recordings, not synthesis — sets from the
       MIT-licensed kbsim project (github.com/tplai/kbsim)
     • PRESS sound on keydown + softer RELEASE sound on keyup —
       a real switch clicks twice
     • five press variants mapped to the key's physical keyboard
       row (number row ≠ home row ≠ bottom row)
     • dedicated SPACE / ENTER / BACKSPACE recordings where the
       set provides them, pitched-down generics otherwise
     • ±4% pitch and gain humanization, key-repeat suppressed
     • plays ONLY for the user's own keystrokes (shell input) —
       auto-typed animations stay silent

   Sets in assets/sfx/: mxblue (clicky) · mxbrown (tactile) ·
   cream (thock). Pick one in the shell: `sound list`,
   `sound cream`. On/off + chosen set persist in localStorage.
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  const SFX_DIR = "assets/sfx/";
  const SWITCHES = {
    mxblue:  { label: "cherry mx blue — clicky",   specials: false },
    mxbrown: { label: "cherry mx brown — tactile", specials: true },
    cream:   { label: "novelkeys cream — thock",   specials: true },
  };
  const DEFAULT_SWITCH = "mxblue";
  const PRESS_GENERICS = ["GENERIC_R0", "GENERIC_R1", "GENERIC_R2", "GENERIC_R3", "GENERIC_R4"];
  const SPECIALS = ["SPACE", "ENTER", "BACKSPACE"];

  /* physical row of each key (KeyboardEvent.code → R0–R4),
     so the number row sounds different from the home row */
  const ROW_OF = { Escape: 0, Backquote: 1, Tab: 2, CapsLock: 3, Space: 4 };
  "1234567890".split("").forEach((d) => (ROW_OF["Digit" + d] = 1));
  ["Minus", "Equal", "Backspace"].forEach((c) => (ROW_OF[c] = 1));
  "QWERTYUIOP".split("").forEach((l) => (ROW_OF["Key" + l] = 2));
  ["BracketLeft", "BracketRight", "Backslash"].forEach((c) => (ROW_OF[c] = 2));
  "ASDFGHJKL".split("").forEach((l) => (ROW_OF["Key" + l] = 3));
  ["Semicolon", "Quote", "Enter"].forEach((c) => (ROW_OF[c] = 3));
  "ZXCVBNM".split("").forEach((l) => (ROW_OF["Key" + l] = 4));
  ["Comma", "Period", "Slash", "ShiftLeft", "ShiftRight"].forEach((c) => (ROW_OF[c] = 4));

  /* ---------------- state ---------------- */
  let ctx = null;
  let master = null;
  let current = DEFAULT_SWITCH;
  let bank = null;           // decoded buffers of the active set
  let loadToken = 0;         // invalidates stale loads on quick switching
  const cache = {};          // set name → bank
  const held = new Set();    // codes with a pending release
  let lastRow = -1;
  let enabled = true;
  try {
    enabled = localStorage.getItem("sfx") !== "0";
    const saved = localStorage.getItem("sfx-switch");
    if (saved && SWITCHES[saved]) current = saved;
  } catch (e) {}

  /* ---------------- audio plumbing ---------------- */
  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.85;
    /* gentle bus compression keeps key-mashing from clipping */
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 14;
    comp.ratio.value = 4;
    comp.attack.value = 0.002;
    comp.release.value = 0.09;
    master.connect(comp);
    comp.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    const c = ensure();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  }
  ["pointerdown", "keydown", "touchstart"].forEach((ev) =>
    addEventListener(ev, unlock, { capture: true, passive: true })
  );

  function ready() {
    if (!enabled) return null;
    const c = ensure();
    return c && c.state === "running" ? c : null;
  }

  function decode(url) {
    const c = ensure();
    if (!c) return Promise.resolve(null);
    return fetch(url)
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.arrayBuffer(); })
      .then((ab) => c.decodeAudioData(ab))
      .catch(() => null);
  }

  /* fetch + decode one switch set:
     { press: [R0…R4], pressSpecial: {SPACE,…}, release, releaseSpecial } */
  function loadSet(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    const dir = SFX_DIR + name + "/";
    const withSpecials = SWITCHES[name].specials;
    const jobs = [
      Promise.all(PRESS_GENERICS.map((f) => decode(dir + "press/" + f + ".mp3"))),
      decode(dir + "release/GENERIC.mp3"),
      withSpecials
        ? Promise.all(SPECIALS.map((f) => decode(dir + "press/" + f + ".mp3")))
        : Promise.resolve([]),
      withSpecials
        ? Promise.all(SPECIALS.map((f) => decode(dir + "release/" + f + ".mp3")))
        : Promise.resolve([]),
    ];
    return Promise.all(jobs).then(([press, release, pSpec, rSpec]) => {
      const b = {
        press: press.filter(Boolean),
        release: release,
        pressSpecial: {},
        releaseSpecial: {},
      };
      SPECIALS.forEach((k, i) => {
        if (pSpec[i]) b.pressSpecial[k] = pSpec[i];
        if (rSpec[i]) b.releaseSpecial[k] = rSpec[i];
      });
      if (!b.press.length) {
        console.warn("[sound] could not load sfx set '" + name + "' (serve over http)");
        return null;
      }
      cache[name] = b;
      return b;
    });
  }

  function activate(name) {
    const token = ++loadToken;
    return loadSet(name).then((b) => {
      if (b && token === loadToken) { current = name; bank = b; }
      return !!b;
    });
  }
  activate(current); // decode the saved set up front — first keystroke is instant

  /* ---------------- playback ---------------- */
  function play(buf, rate, gain, at) {
    const c = ready();
    if (!c || !buf) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate * (0.96 + Math.random() * 0.08);
    const g = c.createGain();
    g.gain.value = gain * (0.85 + Math.random() * 0.3);
    src.connect(g);
    g.connect(master);
    src.start(at ? c.currentTime + at : 0);
  }

  function genericPress(row) {
    if (!bank) return null;
    const n = bank.press.length;
    let i = Math.min(row, n - 1);
    if (i < 0 || row === undefined) {
      i = 1 + ((Math.random() * (n - 1)) | 0);     // unknown key: any non-Esc row
      if (n > 2 && i === lastRow) i = (i % (n - 1)) + 1;
    }
    lastRow = i;
    return bank.press[i];
  }

  /* special keys: dedicated recording, or a deep-pitched bottom-row generic */
  function specialOf(kind, table, fallbackRate) {
    if (!bank) return { buf: null };
    if (table[kind]) return { buf: table[kind], rate: 1 };
    const generic = kind === "BACKSPACE" ? bank.press[1] : bank.press[bank.press.length - 1];
    return { buf: generic, rate: fallbackRate };
  }

  const KIND = { " ": "SPACE", Enter: "ENTER", Backspace: "BACKSPACE" };

  function pressFor(e) {
    const kind = KIND[e.key];
    if (kind) {
      const s = specialOf(kind, bank ? bank.pressSpecial : {}, kind === "BACKSPACE" ? 1.03 : 0.85);
      return { buf: s.buf, rate: s.rate };
    }
    if (e.key.length !== 1) return null;          // modifiers, arrows, F-keys: silent
    return { buf: genericPress(ROW_OF[e.code]), rate: 1 };
  }

  /* ---------------- public API ---------------- */
  App.sound = {
    isOn: () => enabled,
    toggle() {
      enabled = !enabled;
      try { localStorage.setItem("sfx", enabled ? "1" : "0"); } catch (e) {}
      if (enabled) { unlock(); play(genericPress(3), 1, 0.9); }
      return enabled;
    },

    /* keydown — the press ("click") */
    down(e) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const p = pressFor(e);
      if (!p || !p.buf) return;
      play(p.buf, p.rate, 1);
      held.add(e.code);
    },
    /* keyup — the softer release ("clack") */
    up(e) {
      if (!held.delete(e.code) || !bank) return;
      const kind = KIND[e.key];
      if (kind && bank.releaseSpecial[kind]) return play(bank.releaseSpecial[kind], 1, 0.7);
      play(bank.release, kind === "SPACE" || kind === "ENTER" ? 0.85 : 1, 0.7);
    },
    key(e) { this.down(e); }, // back-compat alias

    /* switch sets: App.sound.use("cream") */
    use(name) {
      name = String(name || "").toLowerCase();
      if (!SWITCHES[name]) return Promise.resolve(false);
      try { localStorage.setItem("sfx-switch", name); } catch (e) {}
      return activate(name).then((ok) => {
        if (ok) { unlock(); play(genericPress(3), 1, 0.9); }
        return ok;
      });
    },
    current: () => current,
    list: () => Object.keys(SWITCHES).map((k) => ({ name: k, label: SWITCHES[k].label, active: k === current })),
  };
})();
