# dixit pambhar — portfolio `// terminal edition`

A handcrafted **developer-console / terminal** themed portfolio for **Dixit Pambhar**,
Senior Flutter & Full-Stack Developer. Pure HTML, CSS and JavaScript — no build step.
Phosphor-green + amber on near-black, monospace throughout, with a command-line motif:
a boot sequence, `git log` experience, JSON project cards, a `tree` for education, and a
toggleable CRT scanline effect.

## Run it

```bash
python3 -m http.server 8000     # or:  npx serve .
```

Open <http://localhost:8000>. (A local server is recommended so the CDN libraries and
fonts load cleanly; `file://` also works.)

## Structure

```
index.html              # semantic markup + SEO/JSON-LD
css/
  variables.css         # tokens — terminal palette, 8pt scale, mono type
  base.css              # reset, CRT layers, terminal primitives, reveal states
  components.css        # bar, drawer, cursor, run-buttons, filters, fields, status bar
  sections.css          # boot, hero, about, git-log, skills, JSON cards, tree, contact
  responsive.css        # mobile-first breakpoints, reduced-motion, print
js/
  utils.js              # shared namespace, helpers, capability flags
  boot.js               # boot sequence → fires `app:ready`
  cursor.js             # block-caret cursor
  navigation.js         # active-section sync, mobile drawer, smooth scroll, status path
  typewriter.js         # types the hero role line
  skills.js             # skill-bar fills + animated counters
  projects.js           # JSON-card category filtering
  contact.js            # accessible validation + mailto submission
  animations.js         # scroll reveals + GSAP parallax accent
  main.js               # boot: Lenis ↔ GSAP, clock, CRT toggle, back-to-top
assets/
  favicon.svg · og-cover.svg
  Dixit_Pambhar_Sr._Flutter_&_Full_Stack_Developer_Resume.pdf   # the downloadable résumé
```

> The résumé download links are URL-encoded (`%26` for the `&` in the filename). If you
> swap in a new file, update the three references in `index.html` (hero + drawer) and
> `js/terminal.js` (`resume` command) — or rename the file to avoid special characters.

## Libraries (CDN)

GSAP + ScrollTrigger and Lenis (smooth scroll). Everything degrades gracefully: reveals
fall back to IntersectionObserver + CSS, smooth scroll falls back to native, the boot
sequence always lifts (hard-capped), and `prefers-reduced-motion` disables the typewriter,
flicker and animations.

## Notable touches

- **Interactive shell** — the headline feature. Open it from the `>_ shell` button, the
  hero hint, the **`` ` ``** key, or **⌘/Ctrl-K**. It's a real REPL with command history
  (↑/↓), tab-completion and easter eggs. Commands actually drive the site:
  `help · whoami · about · ls projects · cat neon · open cheetah · skills · experience ·
  education · contact · resume · goto <section> · crt · neofetch · matrix · clear · exit`
  (`open`/`goto` scroll the page and filter projects). Logic lives in `js/terminal.js`.
- **Boot sequence** types module-load lines, then hands off to the page.
- **CRT toggle** (top bar) flips subtle scanlines + flicker; the choice is persisted.
- **Live clock + status bar** (vim/tmux style) tracks the current section as `~/section`.
- **Projects** render as syntax-highlighted `*.json` files with `--flag` filtering.
- **Experience** is a `git log --graph` with commit hashes, refs and `+` change lines.

## Customize

- **Social links** — `index.html`: LinkedIn/GitHub currently point to the generic sites;
  replace with the real profile URLs.
- **Domain** — update `canonical`, `og:url` and JSON-LD `url` (`dixitpambhar.dev`).
- **Contact** — `js/contact.js` composes a `mailto:`. Swap for Formspree / Netlify Forms /
  your own endpoint for server-side capture.
- **Theme** — all colors/spacing/type live in `css/variables.css`.

## Accessibility & performance

Semantic HTML, skip link, keyboard-navigable, ARIA labels, focus-visible styling,
`prefers-reduced-motion` honoured, custom cursor disabled on touch. No heavy canvas;
animations target 60fps.
