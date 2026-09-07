/* DJ Firstclass Events — small progressive-enhancement helpers.
   The page works with zero JS; this only improves the booking form. */
(function () {
  "use strict";

  // Current year in the footer.
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // AJAX booking submit so the visitor never leaves the page.
  // Falls back to a normal POST if fetch is unavailable, and the
  // "Or just email us" button always works regardless.
  var form = document.getElementById("booking-form");
  var status = document.getElementById("form-status");
  if (!form || !status || !window.fetch) return;

  var action = form.getAttribute("action") || "";
  var configured = action.indexOf("formspree.io/f/") !== -1 &&
                   action.indexOf("REPLACE_WITH_FORM_ID") === -1;

  form.addEventListener("submit", function (e) {
    // If Formspree isn't wired yet, let the mailto path carry the load.
    if (!configured) {
      e.preventDefault();
      setStatus("Booking form isn’t connected yet — tap “Or just email us” and we’ll get right back to you.", "err");
      return;
    }

    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var original = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    setStatus("", "");

    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus("Got it — your request is in. We’ll reply, usually same day.", "ok");
        } else {
          return res.json().then(function (data) {
            var msg = data && data.errors ? data.errors.map(function (x) { return x.message; }).join(", ")
                                          : "Something went wrong.";
            setStatus(msg + " You can also email bookings@dj1stclass.com directly.", "err");
          });
        }
      })
      .catch(function () {
        setStatus("Network hiccup — please email bookings@dj1stclass.com and we’ll lock your date.", "err");
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
      });
  });

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "form-status" + (kind ? " " + kind : "");
  }
})();
