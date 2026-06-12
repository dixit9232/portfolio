/* ============================================================
   content.js — single source of truth for profile content.
   Loads data/profile.json and renders Experience, Skills and
   Education into their section containers. Adding an entry to
   the JSON is all it takes — the page (and the shell commands)
   pick it up automatically.
   main.js awaits App.dataReady before running module inits, so
   every observer (reveals, skill bars) sees the rendered DOM.
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.data = null;
  App.dataReady = fetch("data/profile.json")
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then((data) => { App.data = data; })
    .catch((e) =>
      console.warn("[content] could not load data/profile.json (serve over http, not file://):", e)
    );

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- experience → git log commits ---------- */
  function renderExperience(jobs, root) {
    root.innerHTML = jobs
      .map((j) => {
        const ref = j.ref ? ` <span class="commit__ref">${esc(j.ref)}</span>` : "";
        const type = j.type ? ` <span class="commit__type">· ${esc(j.type)}</span>` : "";
        const loc = j.location ? ` <span class="comment"># ${esc(j.location)}</span>` : "";
        const points = (j.points || []).map((p) => `<li>${esc(p)}</li>`).join("");
        const tags = (j.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
        return `
          <li class="commit" data-reveal>
            <div class="commit__graph" aria-hidden="true"><span class="commit__node"></span></div>
            <div class="commit__body">
              <p class="commit__head">
                <span class="commit__hash">${esc(j.hash)}</span>${ref}
                <span class="commit__date">${esc(j.date)}</span>
              </p>
              <h3 class="commit__title">${esc(j.title)}${type}</h3>
              <p class="commit__org">${esc(j.org)}${loc}</p>
              <ul class="commit__points">${points}</ul>
              <p class="commit__tags">${tags}</p>
            </div>
          </li>`;
      })
      .join("");
  }

  /* ---------- skills → domain cards + note ---------- */
  function renderSkills(skills, root) {
    const cards = (skills.domains || []).map((d) => {
      const comment = d.comment ? ` <span class="comment"># ${esc(d.comment)}</span>` : "";
      const items = (d.items || [])
        .map(
          (it) => `
            <li data-skill data-level="${Number(it.level) || 0}">
              <span class="skl__name">${esc(it.name)}</span>
              <span class="skl__bar"><i></i></span>
              <span class="skl__lvl">${esc(it.label)}</span>
            </li>`
        )
        .join("");
      return `
        <article class="skl" data-reveal>
          <h3 class="skl__head">${esc(d.name)}${comment}</h3>
          <ul class="skl__list">${items}</ul>
        </article>`;
    });

    if (skills.note) {
      cards.push(`
        <article class="skl skl--note" data-reveal>
          <h3 class="skl__head">${esc(skills.note.head)}</h3>
          <p class="skl__note">${esc(skills.note.text)}</p>
        </article>`);
    }
    root.innerHTML = cards.join("");
  }

  /* ---------- education → ascii tree ---------- */
  function renderEducation(entries, root) {
    const dirs = entries.map((e) => e.name + "/");
    const width = Math.max(...dirs.map((d) => d.length)) + 3;
    const rows = entries.map((e, i) => {
      const branch = i === entries.length - 1 ? "└──" : "├──";
      const dir = dirs[i];
      const pad = " ".repeat(width - dir.length);
      const note = e.note ? " · " + e.note : "";
      return (
        `<span class="tree__branch">${branch}</span> ` +
        `<span class="tree__dir">${esc(dir)}</span>${pad}` +
        `<span class="comment"># ${esc(e.institution)} · ${esc(e.period)}${esc(note)}</span>`
      );
    });
    root.innerHTML = `<span class="tree__root">education/</span>\n` + rows.join("\n");
  }

  App.onReady(function renderContent() {
    const d = App.data;
    if (!d) return;
    const exp = document.querySelector("[data-experience]");
    const skl = document.querySelector("[data-skills]");
    const edu = document.querySelector("[data-education]");
    if (exp && d.experience) renderExperience(d.experience, exp);
    if (skl && d.skills) renderSkills(d.skills, skl);
    if (edu && d.education) renderEducation(d.education, edu);
  });
})();
