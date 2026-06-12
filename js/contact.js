/* ============================================================
   contact.js — accessible validation + mailto submission
   ============================================================ */
(function () {
  "use strict";
  const App = window.App;

  App.onReady(function initContact() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const status = form.querySelector("[data-form-status]");
    const submitBtn = form.querySelector('button[type="submit"]');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fieldOf = (i) => i.closest(".ifield");
    function setError(input, msg) {
      const f = fieldOf(input);
      f.classList.add("has-error");
      const e = f.querySelector("[data-error]");
      if (e) e.textContent = msg;
      input.setAttribute("aria-invalid", "true");
    }
    function clearError(input) {
      const f = fieldOf(input);
      f.classList.remove("has-error");
      const e = f.querySelector("[data-error]");
      if (e) e.textContent = "";
      input.removeAttribute("aria-invalid");
    }
    function validate(input) {
      const v = input.value.trim();
      if (input.hasAttribute("required") && !v) return setError(input, "required field"), false;
      if (input.type === "email" && v && !EMAIL_RE.test(v)) return setError(input, "invalid email"), false;
      if (input.id === "cf-message" && v && v.length < 10) return setError(input, "min 10 characters"), false;
      clearError(input);
      return true;
    }

    App.$$("input, textarea", form).forEach((input) => {
      input.addEventListener("blur", () => validate(input));
      input.addEventListener("input", () => {
        if (fieldOf(input).classList.contains("has-error")) validate(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");

      let ok = true,
        firstBad = null;
      App.$$("[required]", form).forEach((input) => {
        if (!validate(input)) {
          ok = false;
          firstBad = firstBad || input;
        }
      });
      const email = form.querySelector("#cf-email");
      if (email && !validate(email)) {
        ok = false;
        firstBad = firstBad || email;
      }
      if (!ok) {
        status.textContent = "✗ fix the highlighted fields";
        status.classList.add("is-error");
        if (firstBad) firstBad.focus();
        return;
      }

      // static host: compose a real email. Swap for Formspree/Netlify/API.
      const data = {
        name: form.querySelector("#cf-name").value.trim(),
        email: form.querySelector("#cf-email").value.trim(),
        subject: form.querySelector("#cf-subject").value.trim(),
        message: form.querySelector("#cf-message").value.trim(),
      };
      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.classList.remove("is-loading");
        submitBtn.disabled = false;
        const subject = encodeURIComponent(data.subject || `Portfolio enquiry from ${data.name}`);
        const body = encodeURIComponent(`Hi Dixit,\n\n${data.message}\n\n— ${data.name}\n${data.email}`);
        window.location.href = `mailto:dixitpambhar9232@gmail.com?subject=${subject}&body=${body}`;
        form.reset();
        App.$$(".ifield", form).forEach((f) => f.classList.remove("has-error"));
        status.textContent = "✓ message ready in your mail app · or: dixitpambhar9232@gmail.com";
        status.classList.remove("is-error");
      }, 850);
    });
  });
})();
