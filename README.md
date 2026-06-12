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

Open <http://localhost:8000>. (A local server is **required** — Education, Skills and
Experience are fetched from `data/profile.json`, which browsers block over `file://`.)

## Structure

```text
index.html              # semantic markup + SEO/JSON-LD
robots.txt              # crawler rules + sitemap pointer
sitemap.xml             # single-URL sitemap
site.webmanifest        # PWA manifest (name, theme, icons)
data/
  profile.json          # education, skills & experience content — edit here, not in HTML
css/
  variables.css         # tokens — terminal palette, 8pt scale, mono type
  base.css              # reset, CRT layers, terminal primitives, reveal states
  components.css        # bar, drawer, cursor, run-buttons, filters, fields, status bar
  sections.css          # boot, hero, about, git-log, skills, JSON cards, tree, contact
  responsive.css        # mobile-first breakpoints, reduced-motion, print
js/
  utils.js              # shared namespace, helpers, capability flags
  content.js            # loads data/profile.json → renders experience/skills/education
  sound.js              # mechanical keyboard sfx — press/release samples (assets/sfx)
  boot.js               # boot sequence → fires `app:ready`
  cursor.js             # block-caret cursor
  navigation.js         # active-section sync, mobile drawer, smooth scroll, status path
  typewriter.js         # types the hero role line
  skills.js             # skill-bar fills + animated counters
  projects.js           # JSON-card category filtering
  contact.js            # accessible validation + mailto submission
  windowctl.js          # macOS-style window controls + dock
  terminal.js           # the interactive shell
  animations.js         # scroll reveals + GSAP parallax accent
  main.js               # boot: Lenis ↔ GSAP, clock, CRT toggle, back-to-top
assets/
  favicon.svg · og-cover.svg
  og-cover.png          # 1200×630 raster for social crawlers (og:image / twitter:image)
  apple-touch-icon.png · icon-192.png · icon-512.png
  sfx/                  # mechanical switch recordings: mxblue/ mxbrown/ cream/
  Dixit_Pambhar_Sr._Flutter_&_Full_Stack_Developer_Resume.pdf   # the downloadable résumé
```

> Typing sfx are real mechanical-switch recordings from the MIT-licensed
> [kbsim](https://github.com/tplai/kbsim) project: a **press** sound on keydown (five
> variants mapped to the key's physical row) and a softer **release** on keyup, with
> dedicated space/enter/backspace hits and pitch/gain humanization. Three sets ship —
> Cherry MX Blue (clicky, default), MX Brown (tactile) and NovelKeys Cream (thock) —
> switchable in the shell via `sound list` / `sound cream`; the choice persists.
>
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

- **Education / Skills / Experience** — `data/profile.json` is the single source of
  truth. Add or edit entries there and both the page sections *and* the shell commands
  (`skills`, `experience`, `education`) update automatically — no HTML/JS changes needed.
- **Social links** — `index.html`: GitHub points to the real profile; LinkedIn still
  points to the generic site — replace with the real profile URL (also add it to the
  JSON-LD `sameAs` array).
- **Domain** — `dixitpambhar.dev` appears in `canonical`, `og:*`/`twitter:*` image URLs,
  JSON-LD, `robots.txt` and `sitemap.xml`. Changing domains? Update all of them.
- **Contact** — `js/contact.js` composes a `mailto:`. Swap for Formspree / Netlify Forms /
  your own endpoint for server-side capture.
- **Theme** — all colors/spacing/type live in `css/variables.css`.

## Accessibility & performance

Semantic HTML, skip link, keyboard-navigable, ARIA labels, focus-visible styling,
`prefers-reduced-motion` honoured, custom cursor disabled on touch. No heavy canvas;
animations target 60fps.
