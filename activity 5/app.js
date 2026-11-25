/**
 * ============================================================================
 * Activity 5: JavaScript Basics and User Interaction
 * Course: Web Application Development (WAD)
 * Project: IPL 2026 Ticket Booking Portal
 *
 * Core Features:
 *   1. Reusable showToast() Notification System
 *   2. Smooth Scrolling from Match Schedule "Book" Buttons to Booking Form
 *   3. Dynamic Form Field Pre-selection and Visual Highlighting
 *   4. Form Validation & Dynamic "My Bookings" DOM Insertion
 *   5. Schedule Filtering with Toast Feedback
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Activity 5: JavaScript loaded and DOM ready.");

  // Initialize UI features
  initToastContainer();
  initSmoothScrollBooking();
  initNavSmoothScroll();
  initBookingForm();
  initScheduleFilter();

  // Initial welcome notification
  setTimeout(() => {
    showToast(
      "Welcome to IPL 2026 Ticket Booking! Click 'Book' on any match to reserve seats.",
      "info",
      4000
    );
  }, 400);
});

/* ==========================================================================
   FEATURE 1: Reusable showToast() Function
   ========================================================================== */

/**
 * Ensures the toast container element exists in the DOM.
 * If missing, dynamically creates and appends it to <body>.
 * @returns {HTMLElement} The toast container element.
 */
function initToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Displays a customizable, animated toast notification.
 *
 * @param {string} message  - Text message to display.
 * @param {string} [type='info'] - Notification style: 'info' | 'success' | 'warning' | 'error'.
 * @param {number} [duration=3500] - Duration in ms before auto-dismissal (0 to keep indefinitely).
 * @returns {HTMLElement} The created toast element.
 */
function showToast(message, type = "info", duration = 3500) {
  const container = initToastContainer();

  // Normalize toast type
  const validTypes = ["info", "success", "warning", "error"];
  const toastType = validTypes.includes(type) ? type : "info";

  // Icons corresponding to each notification type
  const icons = {
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✕",
  };

  // Titles for notification header
  const titles = {
    info: "Notification",
    success: "Success",
    warning: "Attention",
    error: "Error",
  };

  // Create toast card element
  const toast = document.createElement("div");
  toast.className = `toast toast-${toastType}`;
  toast.setAttribute("role", "alert");

  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${icons[toastType]}</span>
    <div class="toast-content">
      <div class="toast-title">${titles[toastType]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
  `;

  // Append toast to container
  container.appendChild(toast);

  // Helper function to dismiss and remove toast with smooth exit animation
  const dismissToast = () => {
    if (toast.classList.contains("toast-hide")) return;
    toast.classList.add("toast-hide");
    toast.addEventListener(
      "animationend",
      () => {
        if (toast.parentNode) {
          toast.remove();
        }
      },
      { once: true }
    );
  };

  // Close button click listener
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissToast();
  });

  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(dismissToast, duration);
  }

  return toast;
}

/* ==========================================================================
   FEATURE 2: Smooth Scrolling from Book Button to Booking Form
   ========================================================================== */

/**
 * Attaches click event listeners to all "Book" buttons in the match schedule table.
 * On click:
 *   1. Smoothly scrolls the window to the booking form section.
 *   2. Pre-selects the corresponding match in the booking dropdown.
 *   3. Adds a visual pulsing highlight to the booking form.
 *   4. Displays a confirmation toast notification.
 */
function initSmoothScrollBooking() {
  const bookButtons = document.querySelectorAll(".book-btn");
  const bookingSection = document.getElementById("booking");
  const matchSelect = document.getElementById("match");

  if (!bookingSection) {
    console.warn("Booking section #booking not found in DOM.");
    return;
  }

  bookButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // Read match metadata from data attributes
      const matchId = btn.getAttribute("data-match-id");
      const matchName = btn.getAttribute("data-match-name") || "Selected Match";

      // 1. Smoothly scroll down to the booking form
      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // 2. Pre-select the match in the form dropdown
      if (matchSelect && matchId) {
        matchSelect.value = matchId;
      }

      // 3. Add visual highlight effect to booking form
      bookingSection.classList.remove("form-highlight");
      // Trigger DOM reflow to re-trigger CSS keyframe animation
      void bookingSection.offsetWidth;
      bookingSection.classList.add("form-highlight");

      // 4. Focus on the next input field (Name)
      const nameInput = document.getElementById("name");
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 600);
      }

      // 5. Trigger Worked Example Toast: Notification of match selection
      showToast(
        `Selected "${matchName}". Booking form ready below!`,
        "info",
        3500
      );
    });
  });
}

/* ==========================================================================
   FEATURE 3: Smooth Navigation for Internal Anchor Links
   ========================================================================== */

/**
 * Enables smooth scrolling for all anchor links targeting page sections (#id).
 */
function initNavSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Update active class on nav links
        document.querySelectorAll("nav a").forEach((navLink) => {
          navLink.classList.remove("active");
        });
        if (link.classList.contains("nav-link")) {
          link.classList.add("active");
        }
      }
    });
  });
}

/* ==========================================================================
   FEATURE 4: Form Validation & Interactive Submission
   ========================================================================== */

/**
 * Handles booking form validation, submission, toast feedback, and table updates.
 */
function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const bookingsBody = document.getElementById("bookings-body");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Input elements
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");
    const matchEl = document.getElementById("match");
    const standEl = document.getElementById("stand");
    const ticketsEl = document.getElementById("tickets");
    const agreeEl = document.getElementById("agree");
    const deliveryEl = form.querySelector('input[name="delivery"]:checked');

    let isValid = true;

    // Helper validation function
    const validateField = (input, errorId, errorMsg, customCheck = true) => {
      const errorSpan = document.getElementById(errorId);
      if (!input.value.trim() || !customCheck) {
        input.classList.add("input-error");
        if (errorSpan) errorSpan.textContent = errorMsg;
        isValid = false;
      } else {
        input.classList.remove("input-error");
        if (errorSpan) errorSpan.textContent = "";
      }
    };

    // 1. Name validation (min 3 chars, letters only)
    const nameVal = nameEl.value.trim();
    const namePattern = /^[A-Za-z ]{3,40}$/;
    validateField(
      nameEl,
      "name-error",
      "Please enter a valid full name (letters only, min 3 chars).",
      namePattern.test(nameVal)
    );

    // 2. Email validation
    const emailVal = emailEl.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validateField(
      emailEl,
      "email-error",
      "Please enter a valid email address.",
      emailPattern.test(emailVal)
    );

    // 3. Phone number validation (10 digits starting with 6-9)
    const phoneVal = phoneEl.value.trim();
    const phonePattern = /^[6-9]\d{9}$/;
    validateField(
      phoneEl,
      "phone-error",
      "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      phonePattern.test(phoneVal)
    );

    // 4. Match selection
    validateField(
      matchEl,
      "match-error",
      "Please select a match.",
      matchEl.value !== ""
    );

    // 5. Stand category
    validateField(
      standEl,
      "stand-error",
      "Please choose a stadium stand category.",
      standEl.value !== ""
    );

    // 6. Number of tickets (1-6)
    const ticketCount = parseInt(ticketsEl.value, 10);
    validateField(
      ticketsEl,
      "tickets-error",
      "Tickets must be between 1 and 6.",
      ticketCount >= 1 && ticketCount <= 6
    );

    // 7. Policy agreement
    const agreeError = document.getElementById("agree-error");
    if (!agreeEl.checked) {
      if (agreeError) agreeError.textContent = "You must accept stadium guidelines.";
      isValid = false;
    } else {
      if (agreeError) agreeError.textContent = "";
    }

    // Abort if invalid
    if (!isValid) {
      showToast("Please fill all required fields correctly before submitting.", "error", 4000);
      return;
    }

    // Success workflow
    const bookingId = "IPL-" + Math.floor(1000 + Math.random() * 9000);
    const selectedMatchText = matchEl.options[matchEl.selectedIndex].text.replace(/^\d+:\s*/, "");
    const deliveryMethod = deliveryEl ? deliveryEl.value : "E-Ticket";

    // Show success confirmation toast
    showToast(
      `Booking Confirmed! ID: ${bookingId}. Confirmation sent to ${emailVal}.`,
      "success",
      5000
    );

    // Dynamically insert new booking row into "My Bookings" table
    if (bookingsBody) {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><strong>${bookingId}</strong></td>
        <td>${nameVal}</td>
        <td>${selectedMatchText}</td>
        <td>${standEl.value}</td>
        <td>${ticketCount}</td>
        <td>${deliveryMethod}</td>
        <td><span class="badge badge-success">Confirmed</span></td>
      `;
      bookingsBody.prepend(newRow);
    }

    // Reset the form
    form.reset();
  });

  // Handle form reset button
  form.addEventListener("reset", () => {
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
    showToast("Booking form has been reset.", "warning", 2500);
  });
}

/* ==========================================================================
   FEATURE 5: Interactive Schedule Filter
   ========================================================================== */

/**
 * Filters the match schedule table rows by selected team.
 */
function initScheduleFilter() {
  const filterSelect = document.getElementById("team-filter");
  const tableRows = document.querySelectorAll("#matches-table tbody tr");

  if (!filterSelect || tableRows.length === 0) return;

  filterSelect.addEventListener("change", (e) => {
    const selected = e.target.value;
    let matchCount = 0;

    tableRows.forEach((row) => {
      const teams = row.getAttribute("data-team") || "";
      if (selected === "all" || teams.includes(selected)) {
        row.style.display = "";
        matchCount++;
      } else {
        row.style.display = "none";
      }
    });

    if (selected === "all") {
      showToast("Showing all scheduled matches.", "info", 2000);
    } else {
      showToast(`Showing ${matchCount} match(es) for ${selected}.`, "info", 2500);
    }
  });
}
