/**
 * ============================================================================
 * Activity 7: Selector Forms and Live Interaction Using JavaScript
 * Course: Web Application Development (WAD)
 * Project: IPL 2026 Ticket Booking Portal
 *
 * Key Steps Implemented:
 *   1. Form Controls: <select> dropdowns for Match & Stand, number input for Quantity
 *   2. DOM Selectors: document.getElementById & document.querySelector
 *   3. Event Listeners: 'change' & 'input' events for live interactive reading
 *   4. Live Calculation: Unit price, ticket quantity, add-ons, and grand total
 *   5. Live DOM Updating: Real-time update of Booking Summary Card
 *   6. User Feedback: showToast() confirmation upon summary recalculation
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Activity 7: JavaScript loaded. Initializing live selector form...");

  // Initialize Core Components
  initToastContainer();
  initLiveBookingSummary();
  initScheduleBookButtons();
  initNavSmoothScroll();
  initBookingFormSubmission();
  initScheduleFilter();

  // Welcome Toast Notification
  setTimeout(() => {
    showToast(
      "Activity 7 Active: Select match, stand & quantity to see live summary calculation!",
      "info",
      4000
    );
  }, 400);
});

/* ==========================================================================
   MATCH & PRICING DATABASE
   ========================================================================== */
const MATCH_DATA = {
  "1": {
    id: "1",
    name: "CSK vs MI",
    fullTitle: "Match 1: Chennai Super Kings vs Mumbai Indians",
    venue: "M. A. Chidambaram Stadium, Chennai",
    datetime: "28 Mar 2026, 7:30 PM",
    prices: {
      General: 1200,
      Premium: 3500,
      VIP: 8000
    }
  },
  "2": {
    id: "2",
    name: "RCB vs CSK",
    fullTitle: "Match 2: Royal Challengers Bengaluru vs Chennai Super Kings",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    datetime: "29 Mar 2026, 7:30 PM",
    prices: {
      General: 1500,
      Premium: 4000,
      VIP: 9000
    }
  },
  "3": {
    id: "3",
    name: "MI vs KKR",
    fullTitle: "Match 3: Mumbai Indians vs Kolkata Knight Riders",
    venue: "Wankhede Stadium, Mumbai",
    datetime: "31 Mar 2026, 7:30 PM",
    prices: {
      General: 1300,
      Premium: 3800,
      VIP: 8500
    }
  },
  "4": {
    id: "4",
    name: "RCB vs MI",
    fullTitle: "Match 4: Royal Challengers Bengaluru vs Mumbai Indians",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    datetime: "02 Apr 2026, 7:30 PM",
    prices: {
      General: 1600,
      Premium: 4200,
      VIP: 9500
    }
  }
};

/* ==========================================================================
   STEP 2 & STEP 3 & STEP 4 & STEP 5: LIVE BOOKING SUMMARY INTERACTION
   ========================================================================== */

/**
 * Initializes DOM selectors and change event listeners for the booking form.
 * Directly addresses Activity 7 Steps 1 through 5.
 */
function initLiveBookingSummary() {
  // Step 2: Select form controls using DOM selectors (getElementById & querySelector)
  const matchSelect = document.getElementById("match");
  const standSelect = document.getElementById("stand");
  const quantityInput = document.getElementById("tickets");
  const addonCheckboxes = document.querySelectorAll('input[name="extras"]');

  // Summary Card Target Elements (using querySelector and getElementById)
  const summaryCard = document.querySelector("#booking-summary-card");
  const summaryMatch = document.getElementById("summary-match");
  const summaryVenue = document.getElementById("summary-venue");
  const summaryDateTime = document.getElementById("summary-datetime");
  const summaryStand = document.getElementById("summary-stand");
  const summaryUnitPrice = document.getElementById("summary-unit-price");
  const summaryQuantity = document.getElementById("summary-quantity");
  const summaryAddons = document.getElementById("summary-addons");
  const summaryTotalPrice = document.querySelector("#summary-total-price");
  const summaryStatusBadge = document.querySelector("#summary-status-badge");
  const summaryHelperText = document.getElementById("summary-helper-text");

  if (!matchSelect || !standSelect || !quantityInput || !summaryCard) {
    console.warn("Booking form controls or summary card elements missing.");
    return;
  }

  // Toast Debounce Timer to ensure pleasant notifications during rapid typing/clicking
  let toastDebounceTimer = null;

  /**
   * Reads selected form values, calculates pricing, updates the summary DOM,
   * and fires showToast() confirmation.
   *
   * @param {Event} event - The triggering DOM event.
   * @param {boolean} triggerToast - Whether to display a toast notification.
   */
  function updateBookingSummary(event = null, triggerToast = true) {
    // Read current form selections
    const selectedMatchId = matchSelect.value;
    const selectedStand = standSelect.value;
    let quantity = parseInt(quantityInput.value, 10);

    // Sanitize ticket quantity between 1 and 6
    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    } else if (quantity > 6) {
      quantity = 6;
      quantityInput.value = 6;
      showToast("Maximum 6 tickets per booking allowed.", "warning", 2500);
    }

    const matchData = MATCH_DATA[selectedMatchId];

    // Read optional add-ons
    let addonsTotalPerTicket = 0;
    const selectedAddonsList = [];
    addonCheckboxes.forEach((chk) => {
      if (chk.checked) {
        const addonPrice = parseInt(chk.getAttribute("data-price") || "0", 10);
        addonsTotalPerTicket += addonPrice;
        selectedAddonsList.push(`${chk.value} (+₹${addonPrice})`);
      }
    });

    // Step 4: Calculate total price and display selected details in Summary Card
    let unitPrice = 0;
    let totalPrice = 0;
    let isFullySelected = false;

    if (matchData && selectedStand && matchData.prices[selectedStand]) {
      unitPrice = matchData.prices[selectedStand];
      totalPrice = (unitPrice + addonsTotalPerTicket) * quantity;
      isFullySelected = true;
    }

    // Update DOM: Match, Venue, Date
    if (matchData) {
      summaryMatch.textContent = matchData.name;
      summaryVenue.textContent = matchData.venue;
      summaryDateTime.textContent = matchData.datetime;
    } else {
      summaryMatch.textContent = "No match selected";
      summaryVenue.textContent = "—";
      summaryDateTime.textContent = "—";
    }

    // Update DOM: Stand & Unit Price
    if (selectedStand) {
      const standNames = {
        General: "General Stand",
        Premium: "Premium Stand",
        VIP: "VIP Lounge"
      };
      summaryStand.textContent = standNames[selectedStand] || selectedStand;
      summaryUnitPrice.textContent = unitPrice > 0 ? `₹${unitPrice.toLocaleString("en-IN")}` : "—";
    } else {
      summaryStand.textContent = "—";
      summaryUnitPrice.textContent = "₹0";
    }

    // Update DOM: Quantity
    summaryQuantity.textContent = `${quantity} ${quantity === 1 ? "ticket" : "tickets"}`;

    // Update DOM: Add-ons
    if (selectedAddonsList.length > 0) {
      summaryAddons.textContent = selectedAddonsList.join(", ");
    } else {
      summaryAddons.textContent = "None";
    }

    // Update DOM: Total Price
    summaryTotalPrice.textContent = `₹${totalPrice.toLocaleString("en-IN")}`;

    // Add visual animations to highlight the live update
    summaryTotalPrice.classList.remove("price-bump");
    void summaryTotalPrice.offsetWidth; // Force DOM reflow
    summaryTotalPrice.classList.add("price-bump");

    summaryCard.classList.remove("summary-pulse");
    void summaryCard.offsetWidth; // Force DOM reflow
    summaryCard.classList.add("summary-pulse");

    // Update Status Badge and Helper Text
    if (isFullySelected) {
      summaryStatusBadge.textContent = "✓ Ready to Book";
      summaryStatusBadge.className = "summary-status-badge badge-active";
      summaryHelperText.textContent = `⚡ Live Total calculated for ${quantity} × ${selectedStand} stand (${matchData.name}).`;
    } else if (matchData) {
      summaryStatusBadge.textContent = "Stand Required";
      summaryStatusBadge.className = "summary-status-badge";
      summaryHelperText.textContent = "👉 Next: Select a Stand Category to see ticket price and total.";
    } else {
      summaryStatusBadge.textContent = "Awaiting Selection";
      summaryStatusBadge.className = "summary-status-badge";
      summaryHelperText.textContent = "💡 Select a match and stand category to calculate your live total instantly.";
    }

    // Step 5: Use showToast() to confirm when the summary updates
    if (triggerToast) {
      clearTimeout(toastDebounceTimer);
      toastDebounceTimer = setTimeout(() => {
        if (isFullySelected) {
          showToast(
            `Booking Summary updated: ${matchData.name} (${selectedStand}) × ${quantity} = ₹${totalPrice.toLocaleString("en-IN")}`,
            "info",
            3000
          );
        } else if (matchData && !selectedStand) {
          showToast(`Selected "${matchData.name}". Now choose a Stand Category.`, "info", 2500);
        } else if (!matchData && selectedStand) {
          showToast(`Selected "${selectedStand}" stand. Now choose a Match.`, "info", 2500);
        }
      }, 250);
    }
  }

  // Step 3: Add change event listeners that read the selected match, stand, and quantity
  matchSelect.addEventListener("change", (e) => updateBookingSummary(e, true));
  standSelect.addEventListener("change", (e) => updateBookingSummary(e, true));
  quantityInput.addEventListener("change", (e) => updateBookingSummary(e, true));
  quantityInput.addEventListener("input", (e) => updateBookingSummary(e, true));

  addonCheckboxes.forEach((chk) => {
    chk.addEventListener("change", (e) => updateBookingSummary(e, true));
  });

  // Export updater globally for programmatic triggers (e.g., schedule button clicks & reset)
  window.updateBookingSummary = updateBookingSummary;
}

/* ==========================================================================
   FEATURE: Reusable showToast() Notification System
   ========================================================================== */

/**
 * Ensures the toast container element exists in the DOM.
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
 * Displays an animated, customizable toast notification.
 *
 * @param {string} message - Notification text.
 * @param {string} [type='info'] - Style: 'info' | 'success' | 'warning' | 'error'.
 * @param {number} [duration=3500] - Duration in ms before auto-dismiss.
 * @returns {HTMLElement} The created toast element.
 */
function showToast(message, type = "info", duration = 3500) {
  const container = initToastContainer();

  const validTypes = ["info", "success", "warning", "error"];
  const toastType = validTypes.includes(type) ? type : "info";

  const icons = {
    info: "ℹ",
    success: "✓",
    warning: "⚠",
    error: "✕",
  };

  const titles = {
    info: "Live Notification",
    success: "Success",
    warning: "Attention",
    error: "Validation Notice",
  };

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

  container.appendChild(toast);

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

  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissToast();
  });

  if (duration > 0) {
    setTimeout(dismissToast, duration);
  }

  return toast;
}

/* ==========================================================================
   FEATURE: Match Schedule "Book" Button Click & Pre-Selection
   ========================================================================== */

/**
 * Attaches click event listeners to "Book" buttons in the schedule table.
 * Scrolls to booking form, pre-selects match, and triggers live summary update.
 */
function initScheduleBookButtons() {
  const bookButtons = document.querySelectorAll(".book-btn");
  const bookingSection = document.getElementById("booking");
  const matchSelect = document.getElementById("match");

  if (!bookingSection || !matchSelect) return;

  bookButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const matchId = btn.getAttribute("data-match-id");
      const matchName = btn.getAttribute("data-match-name") || "Selected Match";

      // 1. Smooth scroll to booking form
      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // 2. Pre-select match in dropdown
      matchSelect.value = matchId;

      // 3. Highlight booking form visually
      bookingSection.classList.remove("form-highlight");
      void bookingSection.offsetWidth;
      bookingSection.classList.add("form-highlight");

      // 4. Trigger Live Summary update and show toast
      if (typeof window.updateBookingSummary === "function") {
        window.updateBookingSummary(null, true);
      }
    });
  });
}

/* ==========================================================================
   FEATURE: Navigation Anchor Smooth Scrolling
   ========================================================================== */

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
   FEATURE: Form Submission Validation & My Bookings Table Insertion
   ========================================================================== */

function initBookingFormSubmission() {
  const form = document.getElementById("booking-form");
  const bookingsBody = document.getElementById("bookings-body");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");
    const matchEl = document.getElementById("match");
    const standEl = document.getElementById("stand");
    const ticketsEl = document.getElementById("tickets");
    const agreeEl = document.getElementById("agree");
    const deliveryEl = form.querySelector('input[name="delivery"]:checked');

    let isValid = true;

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

    // 1. Name validation
    const nameVal = nameEl.value.trim();
    validateField(
      nameEl,
      "name-error",
      "Please enter a valid full name (letters only, min 3 chars).",
      /^[A-Za-z ]{3,40}$/.test(nameVal)
    );

    // 2. Email validation
    const emailVal = emailEl.value.trim();
    validateField(
      emailEl,
      "email-error",
      "Please enter a valid email address.",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)
    );

    // 3. Phone validation
    const phoneVal = phoneEl.value.trim();
    validateField(
      phoneEl,
      "phone-error",
      "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      /^[6-9]\d{9}$/.test(phoneVal)
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

    // 6. Ticket quantity
    const ticketCount = parseInt(ticketsEl.value, 10);
    validateField(
      ticketsEl,
      "tickets-error",
      "Ticket quantity must be between 1 and 6.",
      ticketCount >= 1 && ticketCount <= 6
    );

    // 7. Agreement checkbox
    const agreeError = document.getElementById("agree-error");
    if (!agreeEl.checked) {
      if (agreeError) agreeError.textContent = "You must agree to stadium guidelines.";
      isValid = false;
    } else {
      if (agreeError) agreeError.textContent = "";
    }

    if (!isValid) {
      showToast("Please correct marked errors before submitting booking.", "error", 4000);
      return;
    }

    // Read calculated total directly from the summary card
    const summaryTotalEl = document.getElementById("summary-total-price");
    const totalPaidText = summaryTotalEl ? summaryTotalEl.textContent : "₹0";

    const bookingId = "IPL-" + Math.floor(1000 + Math.random() * 9000);
    const matchData = MATCH_DATA[matchEl.value];
    const matchName = matchData ? matchData.name : matchEl.options[matchEl.selectedIndex].text;
    const deliveryMethod = deliveryEl ? deliveryEl.value : "E-Ticket";

    // Confirmation Toast
    showToast(
      `🎉 Booking Confirmed! ID: ${bookingId} (${totalPaidText}). Confirmation sent to ${emailVal}.`,
      "success",
      5000
    );

    // Dynamic row insertion into My Bookings table
    if (bookingsBody) {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><strong>${bookingId}</strong></td>
        <td>${nameVal}</td>
        <td>${matchName}</td>
        <td>${standEl.value}</td>
        <td>${ticketCount}</td>
        <td>${deliveryMethod}</td>
        <td><strong>${totalPaidText}</strong></td>
        <td><span class="badge badge-success">Confirmed</span></td>
      `;
      bookingsBody.prepend(newRow);
    }

    // Reset form and summary
    form.reset();
    if (typeof window.updateBookingSummary === "function") {
      window.updateBookingSummary(null, false);
    }
  });

  // Handle Form Reset
  form.addEventListener("reset", () => {
    document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));

    setTimeout(() => {
      if (typeof window.updateBookingSummary === "function") {
        window.updateBookingSummary(null, false);
      }
      showToast("Booking form and summary have been reset.", "warning", 2500);
    }, 50);
  });
}

/* ==========================================================================
   FEATURE: Team Filter for Schedule Table
   ========================================================================== */

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
      showToast("Displaying all 4 scheduled IPL 2026 matches.", "info", 2000);
    } else {
      showToast(`Filtered schedule: ${matchCount} match(es) for ${selected}.`, "info", 2500);
    }
  });
}
