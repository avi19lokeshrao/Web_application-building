/**
 * ============================================================================
 * Activity 8: Responsive Layout Using CSS Grid and Flexbox
 * Course: Web Application Development (WAD)
 * Project: IPL 2026 Ticket Booking Portal
 *
 * Core Technical Requirements Implemented:
 *   1. Flexbox Navigation Bar with Brand Logo & Links Alignment
 *   2. CSS Grid Match Schedule Cards & 3-Column Guidelines Section
 *   3. JavaScript Dynamic Team Filtering (Dropdown + Pills)
 *   4. JavaScript Grid vs List View Toggle
 *   5. Mobile Hamburger Navigation Drawer using JS Class Toggle
 *   6. Responsive Layout Reflow across Desktop, Tablet, and Mobile Viewports
 *   7. Interactive Match Card Booking Integration & Live Summary Recalculation
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Activity 8: Responsive Layout script loaded successfully.");

  // Initialize all interactive modules
  initToastContainer();
  initHamburgerMenu();
  initMatchFiltering();
  initViewToggle();
  initCardBookingTriggers();
  initQuantityControls();
  initLiveBookingSummary();
  initBookingForm();
  initSmoothScrollLinks();

  // Welcome user feedback toast
  setTimeout(() => {
    showToast(
      "Activity 8 Active: Test responsive resizing, team filter, grid/list toggle & hamburger menu!",
      "info",
      4500
    );
  }, 350);
});

/* ==========================================================================
   FIXTURE DATABASE & STAND PRICING
   ========================================================================== */
const FIXTURE_DATA = {
  "1": {
    name: "CSK vs MI",
    fullTitle: "Match 1: Chennai Super Kings vs Mumbai Indians",
    venue: "M. A. Chidambaram Stadium, Chennai",
    datetime: "28 Mar 2026, 7:30 PM",
    prices: { General: 1200, Premium: 3500, VIP: 8000 }
  },
  "2": {
    name: "RCB vs CSK",
    fullTitle: "Match 2: Royal Challengers Bengaluru vs Chennai Super Kings",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    datetime: "29 Mar 2026, 7:30 PM",
    prices: { General: 1500, Premium: 4000, VIP: 9000 }
  },
  "3": {
    name: "MI vs KKR",
    fullTitle: "Match 3: Mumbai Indians vs Kolkata Knight Riders",
    venue: "Wankhede Stadium, Mumbai",
    datetime: "31 Mar 2026, 7:30 PM",
    prices: { General: 1300, Premium: 3800, VIP: 8500 }
  },
  "4": {
    name: "RCB vs MI",
    fullTitle: "Match 4: Royal Challengers Bengaluru vs Mumbai Indians",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    datetime: "02 Apr 2026, 7:30 PM",
    prices: { General: 1600, Premium: 4200, VIP: 9500 }
  },
  "5": {
    name: "KKR vs CSK",
    fullTitle: "Match 5: Kolkata Knight Riders vs Chennai Super Kings",
    venue: "Eden Gardens, Kolkata",
    datetime: "05 Apr 2026, 7:30 PM",
    prices: { General: 1250, Premium: 3600, VIP: 8200 }
  },
  "6": {
    name: "GT vs RR",
    fullTitle: "Match 6: Gujarat Titans vs Rajasthan Royals",
    venue: "Narendra Modi Stadium, Ahmedabad",
    datetime: "07 Apr 2026, 7:30 PM",
    prices: { General: 1100, Premium: 3400, VIP: 7800 }
  }
};

/* ==========================================================================
   STEP 4: HAMBURGER MENU USING JS CLASS TOGGLE
   Toggles mobile drawer navigation on small screen sizes.
   ========================================================================== */
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navLinks = document.getElementById("nav-links");

  if (!hamburgerBtn || !navLinks) return;

  function toggleMenu(forceClose = false) {
    const isCurrentlyOpen = navLinks.classList.contains("open");
    const shouldOpen = forceClose ? false : !isCurrentlyOpen;

    if (shouldOpen) {
      navLinks.classList.add("open");
      hamburgerBtn.classList.add("open");
      hamburgerBtn.setAttribute("aria-expanded", "true");
    } else {
      navLinks.classList.remove("open");
      hamburgerBtn.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    }
  }

  // Hamburger button click event
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any nav link
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      toggleMenu(true);
    });
  });

  // Close when clicking anywhere outside
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      toggleMenu(true);
    }
  });

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      toggleMenu(true);
    }
  });

  // Reset menu state when resizing back to desktop width (> 768px)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navLinks.classList.contains("open")) {
      toggleMenu(true);
    }
  });
}

/* ==========================================================================
   STEP 3 (Part A): FILTER MATCH CARDS BY TEAM
   Allows users to filter cards by franchise via dropdown & quick pills.
   ========================================================================== */
function initMatchFiltering() {
  const teamFilterSelect = document.getElementById("team-filter");
  const quickPillsContainer = document.getElementById("quick-pills");
  const matchCards = document.querySelectorAll(".match-card");
  const counterText = document.getElementById("match-counter-text");
  const noMatchesBox = document.getElementById("no-matches-msg");
  const resetFilterBtn = document.getElementById("reset-filter-btn");

  if (!teamFilterSelect || matchCards.length === 0) return;

  const totalCards = matchCards.length;

  function applyTeamFilter(selectedTeam, source = "select") {
    let visibleCount = 0;

    matchCards.forEach(card => {
      const cardTeams = (card.getAttribute("data-teams") || "").split(" ");
      const matches = (selectedTeam === "all" || cardTeams.includes(selectedTeam));

      if (matches) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Sync select dropdown if triggered by pill
    if (source === "pill" && teamFilterSelect.value !== selectedTeam) {
      // Find matching option or default to all
      const optionExists = Array.from(teamFilterSelect.options).some(opt => opt.value === selectedTeam);
      teamFilterSelect.value = optionExists ? selectedTeam : "all";
    }

    // Sync quick pills
    if (quickPillsContainer) {
      quickPillsContainer.querySelectorAll(".pill-btn").forEach(btn => {
        if (btn.getAttribute("data-team") === selectedTeam) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    // Update counter text
    if (counterText) {
      counterText.innerHTML = `Showing <strong>${visibleCount}</strong> of <strong>${totalCards}</strong> scheduled fixtures`;
    }

    // Toggle empty state
    if (noMatchesBox) {
      noMatchesBox.style.display = (visibleCount === 0) ? "block" : "none";
    }

    // Toast feedback
    const filterLabel = selectedTeam === "all" ? "All Teams" : selectedTeam;
    showToast(`Filter applied: Showing ${visibleCount} matches for ${filterLabel}`, "info", 2000);
  }

  // Dropdown change listener
  teamFilterSelect.addEventListener("change", (e) => {
    applyTeamFilter(e.target.value, "select");
  });

  // Quick pills click listeners
  if (quickPillsContainer) {
    quickPillsContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill-btn");
      if (!pill) return;
      const team = pill.getAttribute("data-team");
      applyTeamFilter(team, "pill");
    });
  }

  // Reset filter button listener
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener("click", () => {
      applyTeamFilter("all", "select");
    });
  }
}

/* ==========================================================================
   STEP 3 (Part B): TOGGLE BETWEEN GRID AND LIST VIEWS
   Switches #matches-container between CSS Grid and List layouts.
   ========================================================================== */
function initViewToggle() {
  const gridBtn = document.getElementById("grid-view-btn");
  const listBtn = document.getElementById("list-view-btn");
  const matchesContainer = document.getElementById("matches-container");
  const layoutBadge = document.getElementById("layout-badge");

  if (!gridBtn || !listBtn || !matchesContainer) return;

  function setView(viewType) {
    if (viewType === "list") {
      matchesContainer.classList.add("list-view");
      listBtn.classList.add("active");
      listBtn.setAttribute("aria-pressed", "true");
      gridBtn.classList.remove("active");
      gridBtn.setAttribute("aria-pressed", "false");

      if (layoutBadge) {
        layoutBadge.textContent = "View: List Layout (Row Cards)";
        layoutBadge.style.background = "#eef2ff";
        layoutBadge.style.color = "#4338ca";
      }
      showToast("Layout switched: Compact List View ☰", "info", 1800);
    } else {
      matchesContainer.classList.remove("list-view");
      gridBtn.classList.add("active");
      gridBtn.setAttribute("aria-pressed", "true");
      listBtn.classList.remove("active");
      listBtn.setAttribute("aria-pressed", "false");

      if (layoutBadge) {
        layoutBadge.textContent = "View: Grid Layout (CSS Grid)";
        layoutBadge.style.background = "#e0f2fe";
        layoutBadge.style.color = "#0369a1";
      }
      showToast("Layout switched: Responsive CSS Grid View 🔲", "info", 1800);
    }
  }

  gridBtn.addEventListener("click", () => setView("grid"));
  listBtn.addEventListener("click", () => setView("list"));
}

/* ==========================================================================
   MATCH CARD BOOKING ACTION TRIGGER
   Clicking "Book Tickets" on any match card auto-selects the fixture.
   ========================================================================== */
function initCardBookingTriggers() {
  const bookButtons = document.querySelectorAll(".book-trigger");
  const matchSelect = document.getElementById("match");
  const bookingSection = document.getElementById("booking");

  bookButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const matchId = btn.getAttribute("data-match-id");
      const matchTitle = btn.getAttribute("data-match-title") || "Selected Match";

      if (matchSelect) {
        matchSelect.value = matchId;
        // Trigger live calculation update
        updateLiveSummary();
      }

      showToast(`Selected: ${matchTitle}. Fill in your details below to confirm booking.`, "success", 3000);

      // Smoothly scroll down to booking section
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ==========================================================================
   QUANTITY STEPPER CONTROLS (+ / -)
   ========================================================================== */
function initQuantityControls() {
  const minusBtn = document.getElementById("qty-minus");
  const plusBtn = document.getElementById("qty-plus");
  const qtyInput = document.getElementById("tickets");

  if (!minusBtn || !plusBtn || !qtyInput) return;

  minusBtn.addEventListener("click", () => {
    let current = parseInt(qtyInput.value, 10) || 1;
    if (current > 1) {
      qtyInput.value = current - 1;
      updateLiveSummary();
    }
  });

  plusBtn.addEventListener("click", () => {
    let current = parseInt(qtyInput.value, 10) || 1;
    if (current < 6) {
      qtyInput.value = current + 1;
      updateLiveSummary();
    } else {
      showToast("Maximum 6 tickets permitted per reservation.", "warning", 2500);
    }
  });
}

/* ==========================================================================
   LIVE BOOKING SUMMARY CALCULATION
   Recalculates pricing and updates DOM elements in the summary card live.
   ========================================================================== */
function updateLiveSummary() {
  const matchSelect = document.getElementById("match");
  const standSelect = document.getElementById("stand");
  const qtyInput = document.getElementById("tickets");
  const addonBoxes = document.querySelectorAll('input[name="extras"]:checked');

  const summaryCard = document.getElementById("booking-summary-card");
  const summaryMatch = document.getElementById("summary-match");
  const summaryVenue = document.getElementById("summary-venue");
  const summaryDatetime = document.getElementById("summary-datetime");
  const summaryStand = document.getElementById("summary-stand");
  const summaryUnitPrice = document.getElementById("summary-unit-price");
  const summaryQuantity = document.getElementById("summary-quantity");
  const summaryAddons = document.getElementById("summary-addons");
  const summaryTotal = document.getElementById("summary-total-price");
  const summaryPill = document.getElementById("summary-state-pill");
  const summaryTip = document.getElementById("summary-tip-text");

  const matchId = matchSelect ? matchSelect.value : "";
  const standTier = standSelect ? standSelect.value : "";
  const quantity = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

  // Selected add-ons total
  let addonsSum = 0;
  const addonNames = [];

  addonBoxes.forEach(box => {
    const price = parseInt(box.getAttribute("data-price"), 10) || 0;
    if (box.value === "Food Combo") {
      addonsSum += price * quantity; // Food combo per ticket
      addonNames.push(`Food Combo (₹${price} × ${quantity})`);
    } else {
      addonsSum += price; // Flat add-on
      addonNames.push(`${box.value} (₹${price})`);
    }
  });

  const fixture = FIXTURE_DATA[matchId];

  if (fixture) {
    if (summaryMatch) summaryMatch.textContent = fixture.name;
    if (summaryVenue) summaryVenue.textContent = fixture.venue;
    if (summaryDatetime) summaryDatetime.textContent = fixture.datetime;
  } else {
    if (summaryMatch) summaryMatch.textContent = "No match selected";
    if (summaryVenue) summaryVenue.textContent = "—";
    if (summaryDatetime) summaryDatetime.textContent = "—";
  }

  if (standTier) {
    if (summaryStand) summaryStand.textContent = `${standTier} Stand`;
  } else {
    if (summaryStand) summaryStand.textContent = "—";
  }

  if (summaryQuantity) {
    summaryQuantity.textContent = `${quantity} ${quantity === 1 ? "ticket" : "tickets"}`;
  }

  if (summaryAddons) {
    summaryAddons.textContent = addonNames.length > 0 ? addonNames.join(", ") : "None";
  }

  // Price Calculation
  if (fixture && standTier && fixture.prices[standTier]) {
    const unitPrice = fixture.prices[standTier];
    const ticketTotal = unitPrice * quantity;
    const grandTotal = ticketTotal + addonsSum;

    if (summaryUnitPrice) summaryUnitPrice.textContent = `₹${unitPrice.toLocaleString("en-IN")}`;
    if (summaryTotal) summaryTotal.textContent = `₹${grandTotal.toLocaleString("en-IN")}`;

    if (summaryPill) {
      summaryPill.textContent = "Ready to Reserve";
      summaryPill.className = "summary-state-pill ready";
    }

    if (summaryCard) summaryCard.classList.add("active-card");
    if (summaryTip) summaryTip.textContent = `Live total computed: ₹${unitPrice.toLocaleString("en-IN")} × ${quantity} + Add-ons = ₹${grandTotal.toLocaleString("en-IN")}`;
  } else {
    if (summaryUnitPrice) summaryUnitPrice.textContent = "₹0";
    if (summaryTotal) summaryTotal.textContent = "₹0";

    if (summaryPill) {
      summaryPill.textContent = "Awaiting Selection";
      summaryPill.className = "summary-state-pill";
    }

    if (summaryCard) summaryCard.classList.remove("active-card");
    if (summaryTip) summaryTip.textContent = "Choose a match and stand category to calculate your live total instantly.";
  }
}

function initLiveBookingSummary() {
  const matchSelect = document.getElementById("match");
  const standSelect = document.getElementById("stand");
  const qtyInput = document.getElementById("tickets");
  const addonBoxes = document.querySelectorAll('input[name="extras"]');

  if (matchSelect) matchSelect.addEventListener("change", updateLiveSummary);
  if (standSelect) standSelect.addEventListener("change", updateLiveSummary);
  if (qtyInput) qtyInput.addEventListener("input", updateLiveSummary);

  addonBoxes.forEach(box => {
    box.addEventListener("change", updateLiveSummary);
  });

  // Initial calculation check
  updateLiveSummary();
}

/* ==========================================================================
   BOOKING FORM VALIDATION & SUBMISSION
   Appends newly submitted reservation directly to My Bookings table.
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById("booking-form");
  const bookingsBody = document.getElementById("bookings-body");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const matchSelect = document.getElementById("match");
    const standSelect = document.getElementById("stand");
    const qtyInput = document.getElementById("tickets");
    const agreeCheck = document.getElementById("agree");
    const deliveryRadio = document.querySelector('input[name="delivery"]:checked');

    let isValid = true;

    // Reset error messages
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
      document.getElementById("name-error").textContent = "Please enter a valid full name (minimum 3 characters).";
      isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      document.getElementById("email-error").textContent = "Please enter a valid email address.";
      isValid = false;
    }

    // Validate Phone (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneInput.value.trim())) {
      document.getElementById("phone-error").textContent = "Please enter a valid 10-digit Indian phone number (starting with 6-9).";
      isValid = false;
    }

    // Validate Match
    if (!matchSelect.value) {
      document.getElementById("match-error").textContent = "Please select a match fixture.";
      isValid = false;
    }

    // Validate Stand
    if (!standSelect.value) {
      document.getElementById("stand-error").textContent = "Please select a stand tier.";
      isValid = false;
    }

    // Validate Quantity
    const qty = parseInt(qtyInput.value, 10);
    if (isNaN(qty) || qty < 1 || qty > 6) {
      document.getElementById("tickets-error").textContent = "Tickets quantity must be between 1 and 6.";
      isValid = false;
    }

    // Validate Guidelines Agreement
    if (!agreeCheck.checked) {
      document.getElementById("agree-error").textContent = "You must accept the stadium guidelines before booking.";
      isValid = false;
    }

    if (!isValid) {
      showToast("Please fix the highlighted errors before submitting.", "error", 3500);
      return;
    }

    // Generate Booking Record
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `IPL-${randomId}`;
    const fixture = FIXTURE_DATA[matchSelect.value];
    const matchName = fixture ? fixture.name : "Match";
    const standName = standSelect.value;
    const deliveryMode = deliveryRadio ? deliveryRadio.value : "E-Ticket";

    const totalStr = document.getElementById("summary-total-price").textContent;

    // Append to Bookings Table
    if (bookingsBody) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><span class="id-tag">${bookingId}</span></td>
        <td><strong>${nameInput.value.trim()}</strong></td>
        <td>${matchName}</td>
        <td>${standName}</td>
        <td>${qty}</td>
        <td>${deliveryMode}</td>
        <td><span class="price-val">${totalStr}</span></td>
        <td><span class="badge badge-success">Confirmed</span></td>
      `;
      bookingsBody.prepend(row);
    }

    showToast(`Success! Booking confirmed with ID ${bookingId}. Confirmation dispatched to ${emailInput.value.trim()}.`, "success", 6000);

    // Reset Form & Live Summary
    form.reset();
    qtyInput.value = 1;
    updateLiveSummary();

    // Scroll to bookings table
    const myBookingsSec = document.getElementById("my-bookings");
    if (myBookingsSec) {
      setTimeout(() => {
        myBookingsSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      document.getElementById("tickets").value = 1;
      document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
      updateLiveSummary();
      showToast("Booking form has been reset.", "info", 2000);
    }, 50);
  });
}

/* ==========================================================================
   SMOOTH SCROLLING NAVIGATION LINKS
   ========================================================================== */
function initSmoothScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId.length <= 1) return;

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}

/* ==========================================================================
   TOAST NOTIFICATION COMPONENT
   ========================================================================== */
function initToastContainer() {
  if (!document.getElementById("toast-container")) {
    const container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }
}

function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warning") icon = "⚠️";
  if (type === "error") icon = "❌";

  toast.innerHTML = `
    <span>${icon} ${message}</span>
  `;

  container.appendChild(toast);

  // Trigger smooth entrance animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Auto remove toast after duration
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, duration);
}
