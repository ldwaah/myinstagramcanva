(function () {
  "use strict";

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // My Posts grid — tap to play inline videos
  document.querySelectorAll(".post-cell--video").forEach(function (cell) {
    var video = cell.querySelector("video");
    if (!video) return;
    cell.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (video.paused) video.play();
      else video.pause();
    });
  });

  // Reel play buttons
  document.querySelectorAll(".reel-card").forEach(function (card) {
    var video = card.querySelector("video");
    var btn = card.querySelector(".reel-play");
    if (!video || !btn) return;
    btn.addEventListener("click", function () {
      if (video.paused) {
        video.play();
        btn.style.opacity = "0";
      } else {
        video.pause();
        btn.style.opacity = "1";
      }
    });
    video.addEventListener("click", function () {
      if (video.paused) video.play();
      else video.pause();
    });
  });

  // Lead capture forms — always POST to same-origin /api/leads
  function handleForm(form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }

      var fd = new FormData(form);
      var payload = {
        siteId: fd.get("siteId"),
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        message: fd.get("message") || undefined,
        source: fd.get("source") || "contact_form",
        smsOptIn: fd.get("smsOptIn") === "true",
        emailOptIn: fd.get("emailOptIn") !== "false",
      };

      try {
        var res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        var data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");

        if (status) {
          status.className = "form-status is-success";
          status.textContent = "Message sent! We'll be in touch soon.";
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.className = "form-status is-error";
          status.textContent = err.message || "Failed to send. Please try again.";
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = btn.dataset.label || "Send message";
        }
      }
    });
  }

  document.querySelectorAll(".contact-form, .lead-form").forEach(handleForm);

  // Booking calendar
  var cal = document.getElementById("booking-calendar");
  if (cal) {
    var siteId = cal.dataset.siteId;
    cal.innerHTML =
      '<form class="contact-form lead-form" id="book-form">' +
      '<input type="hidden" name="siteId" value="' + siteId + '" />' +
      '<input name="guestName" placeholder="Your name" required />' +
      '<input name="guestEmail" type="email" placeholder="Email" required />' +
      '<input name="startTime" type="datetime-local" required />' +
      '<button type="submit" class="btn btn-primary" data-label="Request booking">Request booking</button>' +
      '<p class="form-status"></p></form>';

    document.getElementById("book-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: fd.get("siteId"),
          guestName: fd.get("guestName"),
          guestEmail: fd.get("guestEmail"),
          startTime: fd.get("startTime"),
        }),
      });
      var status = e.target.querySelector(".form-status");
      if (res.ok) {
        status.className = "form-status is-success";
        status.textContent = "Booking request sent!";
        e.target.reset();
      } else {
        var data = await res.json();
        status.className = "form-status is-error";
        status.textContent = data.error || "Failed";
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
