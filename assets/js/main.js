(function () {
  "use strict";

  var priceFormatter = new Intl.NumberFormat(
    CONFIG.delivery.locale || "id-ID",
    {
      style: "currency",
      currency: CONFIG.delivery.currency || "IDR",
      maximumFractionDigits: 0,
    }
  );

  function formatPrice(amount) {
    if (!amount && amount !== 0) return "Tanyakan";
    return priceFormatter.format(amount);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Build a wa.me URL with an optional pre-filled message. */
  function whatsappUrl(message) {
    var base = "https://wa.me/" + CONFIG.whatsappNumber;
    if (!message) return base;
    return base + "?text=" + encodeURIComponent(message);
  }

  window.Ontea = {
    formatPrice: formatPrice,
    escapeHtml: escapeHtml,
    whatsappUrl: whatsappUrl,
  };

  /** Generic order CTA (header button). */
  function generalOrderMessage() {
    return (
      "Hi Ontea! Saya mau pesan.\n\n" +
      "Minuman:\n- \n\n" +
      "Dikirim pada hari: \n" +
      "Alamat Saya: "
    );
  }

  function eventInquiryMessage(item) {
    return (
      "Hi Ontea! Saya mau tanya tentang " +
      item.name +
      ".\n\n" +
      "Detail acara / jumlah: \n" +
      "Tanggal: \n" +
      "Alamat: "
    );
  }

  /** Prefer a size named "regular", otherwise the first entry. */
  function defaultSize(prices) {
    for (var i = 0; i < prices.length; i++) {
      if (prices[i].name === "regular") return prices[i];
    }
    return prices[0];
  }

  function sizeLabel(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  function hasPricedSizes(item) {
    return item.prices && item.prices.length > 0;
  }

  function renderTags(item) {
    var html = "";
    if (!item.available) {
      html += '<span class="tag tag-sold">Sold out</span>';
    }
    var tags = item.tags || [];
    for (var i = 0; i < tags.length; i++) {
      html += '<span class="tag">' + escapeHtml(tags[i]) + "</span>";
    }
    return html;
  }

  function activeSizeForCard(item) {
    return (
      Cart.preferredSize(item.id) ||
      (defaultSize(item.prices) && defaultSize(item.prices).name)
    );
  }

  function renderSizeChips(item) {
    var prices = item.prices || [];
    if (!prices.length) return "";

    var active = activeSizeForCard(item);
    var html = '<div class="size-chips" role="group" aria-label="Pilih ukuran">';
    for (var i = 0; i < prices.length; i++) {
      var entry = prices[i];
      var selected = entry.name === active;
      var inCart = Cart.qtyForProductSize(item.id, entry.name) > 0;
      html +=
        '<button type="button" class="size-chip' +
        (selected ? " is-selected" : "") +
        (inCart ? " has-cart" : "") +
        '" data-action="select-size" data-product-id="' +
        escapeHtml(item.id) +
        '" data-size="' +
        escapeHtml(entry.name) +
        '" aria-pressed="' +
        (selected ? "true" : "false") +
        '">' +
        '<span class="size-chip-label">' +
        escapeHtml(sizeLabel(entry.name)) +
        "</span>" +
        '<span class="size-chip-price">' +
        escapeHtml(formatPrice(entry.price)) +
        "</span>" +
        "</button>";
    }
    html += "</div>";
    return html;
  }

  function renderStepperHtml(productId, size, qty) {
    return (
      '<div class="qty-stepper" data-product-id="' +
      escapeHtml(productId) +
      '" data-size="' +
      escapeHtml(size) +
      '">' +
      '<button type="button" class="qty-btn" data-action="card-qty-dec" aria-label="Kurangi">−</button>' +
      '<span class="qty-value" aria-live="polite">' +
      qty +
      "</span>" +
      '<button type="button" class="qty-btn" data-action="card-qty-inc" aria-label="Tambah">+</button>' +
      "</div>"
    );
  }

  function renderAddButtonHtml(productId, size) {
    return (
      '<button type="button" class="btn btn-primary btn-sm btn-block" data-action="add-to-cart" data-product-id="' +
      escapeHtml(productId) +
      '" data-size="' +
      escapeHtml(size) +
      '">Tambah</button>'
    );
  }

  function renderCardActions(item) {
    if (!item.available) {
      return (
        '<span class="btn btn-ghost btn-sm btn-block" aria-disabled="true">Sold out</span>'
      );
    }

    if (!hasPricedSizes(item)) {
      var href = whatsappUrl(eventInquiryMessage(item));
      return (
        '<a class="btn btn-primary btn-sm btn-block" href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">Tanya via WhatsApp</a>'
      );
    }

    var size = activeSizeForCard(item);
    var qty = Cart.qtyForProductSize(item.id, size);

    if (qty > 0) {
      return renderStepperHtml(item.id, size, qty);
    }

    return renderAddButtonHtml(item.id, size);
  }

  function renderCard(item, index) {
    var soldOut = !item.available;
    var priced = hasPricedSizes(item);

    return (
      '<article class="menu-card' +
      (soldOut ? " is-sold-out" : "") +
      '" data-category="' +
      escapeHtml(item.category) +
      '" data-product-id="' +
      escapeHtml(item.id) +
      '" style="--i: ' +
      (index || 0) +
      '">' +
      '<div class="menu-card-image">' +
      '<div class="card-tags">' +
      renderTags(item) +
      "</div>" +
      '<img src="' +
      escapeHtml(item.image) +
      '" alt="' +
      escapeHtml(item.name) +
      '" loading="lazy" width="400" height="300" onerror="this.style.display=\'none\'" />' +
      "</div>" +
      '<div class="menu-card-body">' +
      "<h3>" +
      escapeHtml(item.name) +
      "</h3>" +
      '<p class="menu-card-desc">' +
      escapeHtml(item.description) +
      "</p>" +
      (priced ? renderSizeChips(item) : "") +
      '<div class="menu-card-actions" data-card-actions>' +
      renderCardActions(item) +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderFilters(activeCategory) {
    var container = document.getElementById("menu-filters");
    if (!container) return;

    var html = "";
    for (var i = 0; i < CATEGORIES.length; i++) {
      var cat = CATEGORIES[i];
      var pressed = cat.id === activeCategory ? "true" : "false";
      html +=
        '<button type="button" class="filter-btn" data-category="' +
        escapeHtml(cat.id) +
        '" aria-pressed="' +
        pressed +
        '">' +
        escapeHtml(cat.label) +
        "</button>";
    }
    container.innerHTML = html;
  }

  function getFilteredMenu(category) {
    if (!category || category === "all") return MENU.slice();
    return MENU.filter(function (item) {
      return item.category === category;
    });
  }

  var activeMenuCategory = "all";

  function renderMenu(category) {
    var grid = document.getElementById("menu-grid");
    if (!grid) return;

    activeMenuCategory = category || "all";
    var items = getFilteredMenu(activeMenuCategory);
    if (items.length === 0) {
      grid.innerHTML =
        '<p class="menu-empty">Belum ada minuman di kategori ini untuk saat ini.</p>';
      return;
    }

    var html = "";
    for (var i = 0; i < items.length; i++) {
      html += renderCard(items[i], i);
    }
    grid.innerHTML = html;
  }

  function getSelectedSize(card) {
    var selected = card.querySelector(".size-chip.is-selected");
    if (selected) return selected.getAttribute("data-size");
    return null;
  }

  function setSelectedSizeChip(card, sizeName) {
    var chips = card.querySelectorAll(".size-chip");
    for (var i = 0; i < chips.length; i++) {
      var on = chips[i].getAttribute("data-size") === sizeName;
      chips[i].classList.toggle("is-selected", on);
      chips[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function markSizeChipsInCart(card, productId) {
    var chips = card.querySelectorAll(".size-chip");
    for (var i = 0; i < chips.length; i++) {
      var size = chips[i].getAttribute("data-size");
      chips[i].classList.toggle(
        "has-cart",
        Cart.qtyForProductSize(productId, size) > 0
      );
    }
  }

  /**
   * @param {Element} card
   * @param {{ syncSizeFromCart?: boolean }} [options]
   *   syncSizeFromCart: when true (cart-driven refresh), if the selected
   *   size has qty 0 but another size is in the cart, switch the chip to it.
   */
  function updateCardActions(card, options) {
    var productId = card.getAttribute("data-product-id");
    var item = Cart.findMenuItem(productId);
    if (!item) return;
    var actions = card.querySelector("[data-card-actions]");
    if (!actions) return;

    if (!hasPricedSizes(item) || !item.available) {
      actions.innerHTML = renderCardActions(item);
      return;
    }

    var size = getSelectedSize(card) || defaultSize(item.prices).name;
    var qty = Cart.qtyForProductSize(item.id, size);

    if (
      qty === 0 &&
      options &&
      options.syncSizeFromCart &&
      Cart.qtyForProduct(item.id) > 0
    ) {
      var preferred = Cart.preferredSize(item.id);
      if (preferred) {
        setSelectedSizeChip(card, preferred);
        size = preferred;
        qty = Cart.qtyForProductSize(item.id, size);
      }
    }

    markSizeChipsInCart(card, item.id);

    if (qty > 0) {
      actions.innerHTML = renderStepperHtml(item.id, size, qty);
    } else {
      actions.innerHTML = renderAddButtonHtml(item.id, size);
    }
  }

  function refreshAllCardActions() {
    var cards = document.querySelectorAll(".menu-card[data-product-id]");
    for (var i = 0; i < cards.length; i++) {
      updateCardActions(cards[i], { syncSizeFromCart: true });
    }
  }

  function adjustProductSizeQty(productId, size, delta) {
    var lines = Cart.getLines();
    var matching = [];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].productId === productId && lines[i].size === size) {
        matching.push(lines[i]);
      }
    }

    if (delta > 0) {
      if (matching.length === 0) {
        Cart.add(productId, size, 1);
      } else {
        var last = matching[matching.length - 1];
        Cart.setQty(last.id, last.qty + 1);
      }
      return;
    }

    if (matching.length === 0) return;
    var target = matching[matching.length - 1];
    if (target.qty <= 1) {
      Cart.remove(target.id);
    } else {
      Cart.setQty(target.id, target.qty - 1);
    }
  }

  function setupFilters() {
    var container = document.getElementById("menu-filters");
    if (!container) return;

    container.addEventListener("click", function (event) {
      var btn = event.target.closest(".filter-btn");
      if (!btn) return;

      var category = btn.getAttribute("data-category") || "all";
      renderFilters(category);
      renderMenu(category);
    });
  }

  function setupMenuDelegation() {
    var grid = document.getElementById("menu-grid");
    if (!grid) return;

    grid.addEventListener("click", function (event) {
      var target = event.target.closest("[data-action]");
      if (!target) return;

      var action = target.getAttribute("data-action");
      var card = target.closest(".menu-card");
      if (!card) return;

      if (action === "select-size") {
        var chips = card.querySelectorAll(".size-chip");
        for (var i = 0; i < chips.length; i++) {
          var on = chips[i] === target;
          chips[i].classList.toggle("is-selected", on);
          chips[i].setAttribute("aria-pressed", on ? "true" : "false");
        }
        updateCardActions(card);
        return;
      }

      if (action === "add-to-cart") {
        var size =
          getSelectedSize(card) || target.getAttribute("data-size");
        var productId = card.getAttribute("data-product-id");
        Cart.add(productId, size, 1);
        return;
      }

      if (action === "card-qty-inc" || action === "card-qty-dec") {
        var stepper = target.closest(".qty-stepper");
        if (!stepper) return;
        adjustProductSizeQty(
          stepper.getAttribute("data-product-id"),
          stepper.getAttribute("data-size"),
          action === "card-qty-inc" ? 1 : -1
        );
      }
    });
  }

  /* —— Cart UI: bar, drawer, toast —— */

  var drawerOpen = false;
  var lastFocusEl = null;
  var undoTimer = null;
  var lastRemoved = null;
  var prevItemCount = Cart.itemCount();

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function toDateInputValue(date) {
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate())
    );
  }

  /** Earliest delivery: tomorrow, or day after tomorrow past cutoffHour WIB. */
  function earliestDeliveryDate() {
    var now = new Date();
    var cutoffHour =
      (CONFIG.cart && CONFIG.cart.cutoffHour != null
        ? CONFIG.cart.cutoffHour
        : 20);
    var daysAhead = 1;
    if (now.getHours() >= cutoffHour) daysAhead = 2;
    var d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysAhead
    );
    return d;
  }

  function formatDeliveryDateLabel(isoDate) {
    if (!isoDate) return "";
    var parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    var d = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );
    try {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch (err) {
      return isoDate;
    }
  }

  function getFocusable(container) {
    return container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function openDrawer() {
    var drawer = document.getElementById("cart-drawer");
    var backdrop = document.getElementById("cart-backdrop");
    if (!drawer || !backdrop) return;

    lastFocusEl = document.activeElement;
    drawerOpen = true;
    drawer.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add("cart-open");
    requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    drawer.setAttribute("aria-hidden", "false");

    var focusables = getFocusable(drawer);
    if (focusables.length) focusables[0].focus();
  }

  function closeDrawer() {
    var drawer = document.getElementById("cart-drawer");
    var backdrop = document.getElementById("cart-backdrop");
    if (!drawer || !backdrop) return;

    drawerOpen = false;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.classList.remove("cart-open");
    drawer.setAttribute("aria-hidden", "true");

    function hide() {
      if (drawerOpen) return;
      drawer.hidden = true;
      backdrop.hidden = true;
    }

    drawer.addEventListener("transitionend", hide, { once: true });
    setTimeout(hide, 350);

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
  }

  function showToast(message, withUndo) {
    var toast = document.getElementById("cart-toast");
    if (!toast) return;

    toast.innerHTML =
      '<span class="cart-toast-msg">' +
      escapeHtml(message) +
      "</span>" +
      (withUndo
        ? '<button type="button" class="cart-toast-undo" data-action="undo-remove">Batal</button>'
        : "");
    toast.hidden = false;
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.hidden = true;
        lastRemoved = null;
      }, 250);
    }, 4500);
  }

  function renderQuickNotes(lineId, currentNote) {
    var notes =
      (CONFIG.cart && CONFIG.cart.quickNotes) || [];
    if (!notes.length) return "";

    var html = '<div class="note-chips">';
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      var active =
        currentNote &&
        currentNote.toLowerCase().indexOf(note.toLowerCase()) !== -1;
      html +=
        '<button type="button" class="note-chip' +
        (active ? " is-active" : "") +
        '" data-action="quick-note" data-line-id="' +
        lineId +
        '" data-note="' +
        escapeHtml(note) +
        '">' +
        escapeHtml(note) +
        "</button>";
    }
    html += "</div>";
    return html;
  }

  function renderCartLines() {
    var container = document.getElementById("cart-lines");
    if (!container) return;

    var list = Cart.getLines();
    if (list.length === 0) {
      container.innerHTML =
        '<p class="cart-empty">Keranjang masih kosong. Pilih minuman dari menu.</p>';
      return;
    }

    var html = "";
    for (var i = 0; i < list.length; i++) {
      var line = list[i];
      html +=
        '<article class="cart-line" data-line-id="' +
        line.id +
        '">' +
        '<div class="cart-line-thumb">' +
        '<img src="' +
        escapeHtml(line.image) +
        '" alt="" width="64" height="64" loading="lazy" onerror="this.style.display=\'none\'" />' +
        "</div>" +
        '<div class="cart-line-body">' +
        '<div class="cart-line-top">' +
        "<div>" +
        '<h3 class="cart-line-name">' +
        escapeHtml(line.name) +
        "</h3>" +
        '<p class="cart-line-size">' +
        escapeHtml(line.sizeLabel) +
        "</p>" +
        "</div>" +
        '<button type="button" class="cart-line-remove" data-action="remove-line" data-line-id="' +
        line.id +
        '" aria-label="Hapus">' +
        "×</button>" +
        "</div>" +
        '<div class="cart-line-mid">' +
        '<div class="qty-stepper qty-stepper-sm">' +
        '<button type="button" class="qty-btn" data-action="line-qty-dec" data-line-id="' +
        line.id +
        '" aria-label="Kurangi">−</button>' +
        '<span class="qty-value">' +
        line.qty +
        "</span>" +
        '<button type="button" class="qty-btn" data-action="line-qty-inc" data-line-id="' +
        line.id +
        '" aria-label="Tambah">+</button>' +
        "</div>" +
        '<span class="cart-line-price">' +
        escapeHtml(formatPrice(line.lineTotal)) +
        "</span>" +
        "</div>" +
        '<label class="cart-note-label" for="note-' +
        line.id +
        '">Catatan</label>' +
        '<textarea class="cart-note-input" id="note-' +
        line.id +
        '" rows="2" data-action="line-note" data-line-id="' +
        line.id +
        '" placeholder="Contoh: less sugar">' +
        escapeHtml(line.note) +
        "</textarea>" +
        renderQuickNotes(line.id, line.note) +
        (line.qty > 1
          ? '<button type="button" class="cart-split-btn" data-action="split-line" data-line-id="' +
            line.id +
            '">+ Tambah dengan catatan lain</button>'
          : "") +
        "</div>" +
        "</article>";
    }
    container.innerHTML = html;
  }

  function updateCartTotals() {
    var count = Cart.itemCount();
    var sub = Cart.subtotal();
    var fee = Cart.deliveryFee();
    var total = Cart.grandTotal();
    var min = (CONFIG.delivery && CONFIG.delivery.minimumOrder) || 0;
    var enforce = CONFIG.cart && CONFIG.cart.enforceMinimum !== false;
    var meets = Cart.meetsMinimum();

    var els = {
      barCount: document.getElementById("cart-bar-count"),
      barTotal: document.getElementById("cart-bar-total"),
      headerBadge: document.getElementById("cart-header-badge"),
      live: document.getElementById("cart-live"),
      subtotal: document.getElementById("cart-subtotal"),
      fee: document.getElementById("cart-fee"),
      total: document.getElementById("cart-total"),
      progressWrap: document.getElementById("cart-min-progress"),
      progressBar: document.getElementById("cart-min-bar"),
      progressText: document.getElementById("cart-min-text"),
      checkout: document.getElementById("cart-checkout"),
      bar: document.getElementById("cart-bar"),
    };

    if (els.barCount) els.barCount.textContent = String(count);
    if (els.barTotal) els.barTotal.textContent = formatPrice(total);
    if (els.headerBadge) {
      els.headerBadge.textContent = String(count);
      els.headerBadge.hidden = count === 0;
    }
    if (els.subtotal) els.subtotal.textContent = formatPrice(sub);
    if (els.fee) els.fee.textContent = formatPrice(fee);
    if (els.total) els.total.textContent = formatPrice(total);

    if (els.bar) {
      els.bar.classList.toggle("is-visible", count > 0);
      els.bar.hidden = count === 0;
    }

    if (els.progressWrap && els.progressBar && els.progressText) {
      if (enforce && min > 0 && count > 0) {
        els.progressWrap.hidden = false;
        var pct = Math.min(100, Math.round((sub / min) * 100));
        els.progressBar.style.width = pct + "%";
        els.progressBar.setAttribute("aria-valuenow", String(pct));
        if (meets) {
          els.progressText.textContent = "Minimum pemesanan terpenuhi";
          els.progressWrap.classList.add("is-met");
        } else {
          els.progressWrap.classList.remove("is-met");
          els.progressText.textContent =
            "Tambah " +
            formatPrice(min - sub) +
            " lagi untuk minimum pemesanan";
        }
      } else {
        els.progressWrap.hidden = true;
      }
    }

    if (els.checkout) {
      els.checkout.disabled = count === 0 || (enforce && !meets);
    }

    if (els.live) {
      els.live.textContent =
        count === 0
          ? "Keranjang kosong"
          : count +
            " item, total " +
            formatPrice(total);
    }

    if (count !== prevItemCount && els.barCount) {
      els.barCount.classList.remove("is-bump");
      void els.barCount.offsetWidth;
      els.barCount.classList.add("is-bump");
    }
    prevItemCount = count;
  }

  function onCartChange() {
    renderCartLines();
    updateCartTotals();
    refreshAllCardActions();
  }

  function collectCheckout() {
    return {
      name: (document.getElementById("checkout-name") || {}).value || "",
      date: (document.getElementById("checkout-date") || {}).value || "",
      address: (document.getElementById("checkout-address") || {}).value || "",
      maps: (document.getElementById("checkout-maps") || {}).value || "",
      note: (document.getElementById("checkout-note") || {}).value || "",
    };
  }

  function setFieldError(id, message) {
    var field = document.getElementById(id);
    var err = document.getElementById(id + "-error");
    if (field) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
      field.classList.toggle("is-invalid", !!message);
    }
    if (err) {
      err.textContent = message || "";
      err.hidden = !message;
    }
  }

  function validateCheckout() {
    var data = collectCheckout();
    var ok = true;

    if (!data.name.trim()) {
      setFieldError("checkout-name", "Nama wajib diisi");
      ok = false;
    } else {
      setFieldError("checkout-name", "");
    }

    var minDate = toDateInputValue(earliestDeliveryDate());
    if (!data.date) {
      setFieldError("checkout-date", "Tanggal kirim wajib diisi");
      ok = false;
    } else if (data.date < minDate) {
      setFieldError(
        "checkout-date",
        "Tanggal terlalu dekat. Pilih mulai " + formatDeliveryDateLabel(minDate)
      );
      ok = false;
    } else {
      setFieldError("checkout-date", "");
    }

    if (!data.address.trim()) {
      setFieldError("checkout-address", "Alamat wajib diisi");
      ok = false;
    } else {
      setFieldError("checkout-address", "");
    }

    return ok;
  }

  function setupCheckoutDate() {
    var input = document.getElementById("checkout-date");
    if (!input) return;
    var min = toDateInputValue(earliestDeliveryDate());
    input.min = min;
    if (!input.value || input.value < min) input.value = min;
  }

  function setupCartUI() {
    var bar = document.getElementById("cart-bar");
    var headerBtn = document.getElementById("header-cart");
    var closeBtn = document.getElementById("cart-drawer-close");
    var backdrop = document.getElementById("cart-backdrop");
    var drawer = document.getElementById("cart-drawer");
    var toast = document.getElementById("cart-toast");
    var form = document.getElementById("checkout-form");
    var checkoutBtn = document.getElementById("cart-checkout");

    function openFrom(el) {
      lastFocusEl = el || document.activeElement;
      setupCheckoutDate();
      openDrawer();
    }

    if (bar) {
      bar.addEventListener("click", function () {
        openFrom(bar);
      });
    }
    if (headerBtn) {
      headerBtn.addEventListener("click", function () {
        openFrom(headerBtn);
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeDrawer);
    }
    if (backdrop) {
      backdrop.addEventListener("click", closeDrawer);
    }

    document.addEventListener("keydown", function (event) {
      if (!drawerOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key === "Tab" && drawer) {
        var focusables = getFocusable(drawer);
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    if (drawer) {
      drawer.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-action]");
        if (!btn) return;
        var action = btn.getAttribute("data-action");
        var lineId = Number(btn.getAttribute("data-line-id"));

        if (action === "remove-line") {
          lastRemoved = Cart.remove(lineId);
          if (lastRemoved) showToast("Item dihapus", true);
          return;
        }
        if (action === "line-qty-inc") {
          var lineInc = null;
          var lines = Cart.getLines();
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].id === lineId) lineInc = lines[i];
          }
          if (lineInc) Cart.setQty(lineId, lineInc.qty + 1);
          return;
        }
        if (action === "line-qty-dec") {
          var lineDec = null;
          var lines2 = Cart.getLines();
          for (var j = 0; j < lines2.length; j++) {
            if (lines2[j].id === lineId) lineDec = lines2[j];
          }
          if (!lineDec) return;
          if (lineDec.qty <= 1) {
            lastRemoved = Cart.remove(lineId);
            if (lastRemoved) showToast("Item dihapus", true);
          } else {
            Cart.setQty(lineId, lineDec.qty - 1);
          }
          return;
        }
        if (action === "split-line") {
          Cart.split(lineId);
          return;
        }
        if (action === "quick-note") {
          var chipNote = btn.getAttribute("data-note") || "";
          var current = "";
          var lines3 = Cart.getLines();
          for (var k = 0; k < lines3.length; k++) {
            if (lines3[k].id === lineId) current = lines3[k].note || "";
          }
          var next = current.trim();
          if (next.toLowerCase().indexOf(chipNote.toLowerCase()) !== -1) {
            return;
          }
          next = next ? next + ", " + chipNote : chipNote;
          Cart.setNote(lineId, next);
        }
      });

      drawer.addEventListener("input", function (event) {
        var ta = event.target.closest('[data-action="line-note"]');
        if (!ta) return;
        var id = Number(ta.getAttribute("data-line-id"));
        Cart.setNote(id, ta.value, { silent: true });
      });
    }

    if (toast) {
      toast.addEventListener("click", function (event) {
        var undo = event.target.closest('[data-action="undo-remove"]');
        if (!undo || !lastRemoved) return;
        Cart.restoreLine(lastRemoved);
        lastRemoved = null;
        toast.classList.remove("is-visible");
        toast.hidden = true;
        if (undoTimer) clearTimeout(undoTimer);
      });
    }

    function doCheckout(event) {
      if (event) event.preventDefault();
      if (Cart.itemCount() === 0) return;
      if (!Cart.meetsMinimum()) {
        showToast("Belum memenuhi minimum pemesanan", false);
        return;
      }
      if (!validateCheckout()) return;

      var data = collectCheckout();
      var message = Cart.buildMessage({
        name: data.name.trim(),
        dateLabel: formatDeliveryDateLabel(data.date),
        address: data.address.trim(),
        maps: data.maps.trim(),
        note: data.note.trim(),
      });
      window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
    }

    if (form) {
      form.addEventListener("submit", doCheckout);
    }
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", doCheckout);
    }

    Cart.subscribe(onCartChange);
    onCartChange();
  }

  function fillStaticContent() {
    var el;

    el = document.getElementById("hero-tagline");
    if (el) el.textContent = CONFIG.tagline;

    el = document.getElementById("footer-tagline");
    if (el) el.textContent = CONFIG.footerTagline;

    el = document.getElementById("how-lead-time");
    if (el) el.textContent = CONFIG.preorder.leadTime;

    el = document.getElementById("preorder-cutoff");
    if (el) el.textContent = CONFIG.preorder.cutoff;

    el = document.getElementById("preorder-days");
    if (el) el.textContent = CONFIG.preorder.deliveryDays;

    el = document.getElementById("meta-days");
    if (el) el.textContent = CONFIG.preorder.deliveryDays;

    el = document.getElementById("meta-fee");
    if (el) el.textContent = formatPrice(CONFIG.delivery.fee);

    el = document.getElementById("meta-minimum");
    if (el) el.textContent = formatPrice(CONFIG.delivery.minimumOrder);

    el = document.getElementById("meta-radius");
    if (el) el.textContent = CONFIG.delivery.radiusKm + " km";

    el = document.getElementById("delivery-intro");
    if (el) {
      el.textContent =
        "Siap kirim-kirim ke area di radius " +
        CONFIG.delivery.radiusKm +
        " km. Jika alamatmu terdapat disini kami bisa mengirimnya ke rumahmu ^_^.";
    }

    el = document.getElementById("footer-address");
    if (el) el.textContent = CONFIG.address;

    el = document.getElementById("footer-maps");
    if (el) {
      el.href = CONFIG.mapsUrl;
    }

    el = document.getElementById("footer-phone");
    if (el) {
      el.textContent = CONFIG.phoneDisplay;
      el.href = "tel:+" + CONFIG.whatsappNumber;
    }

    el = document.getElementById("header-whatsapp");
    if (el) {
      el.href = whatsappUrl(generalOrderMessage());
    }

    el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());

    var areasList = document.getElementById("delivery-areas");
    if (areasList) {
      var areasHtml = "";
      for (var i = 0; i < CONFIG.delivery.areas.length; i++) {
        areasHtml += "<li>" + escapeHtml(CONFIG.delivery.areas[i]) + "</li>";
      }
      areasList.innerHTML = areasHtml;
    }

    var hoursList = document.getElementById("footer-hours");
    if (hoursList) {
      var hoursHtml = "";
      for (var h = 0; h < CONFIG.hours.length; h++) {
        var row = CONFIG.hours[h];
        hoursHtml +=
          '<li class="hours-row"><span class="days">' +
          escapeHtml(row.days) +
          '</span><span class="time">' +
          escapeHtml(row.time) +
          "</span></li>";
      }
      hoursList.innerHTML = hoursHtml;
    }

    var social = document.getElementById("social-links");
    if (social) {
      var platforms = [
        {
          key: "instagram",
          label: "Instagram",
          icon:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zm9.25 1.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>',
        },
        {
          key: "threads",
          label: "Threads",
          icon:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-threads" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>',
        },
        {
          key: "tiktok",
          label: "TikTok",
          icon:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.6 7.5a5.5 5.5 0 0 1-3.2-1V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.7a2.8 2.8 0 1 0 2 2.7V2h2.6a5.5 5.5 0 0 0 3.2 3.2v2.3z"/></svg>',
        },
      ];

      var socialHtml = "";
      for (var s = 0; s < platforms.length; s++) {
        var platform = platforms[s];
        var href = CONFIG.social[platform.key];
        if (!href) continue;
        socialHtml +=
          '<a class="social-icon" href="' +
          escapeHtml(href) +
          '" target="_blank" rel="noopener noreferrer" aria-label="' +
          escapeHtml(platform.label) +
          '" title="' +
          escapeHtml(platform.label) +
          '">' +
          platform.icon +
          "</a>";
      }
      social.innerHTML = socialHtml;
    }
  }

  function updateJsonLd() {
    var script = document.getElementById("local-business-jsonld");
    if (!script) return;

    var openingHours = [];
    for (var i = 0; i < CONFIG.hours.length; i++) {
      openingHours.push(CONFIG.hours[i].days + ": " + CONFIG.hours[i].time);
    }

    var data = {
      "@context": "https://schema.org",
      "@type": "CafeOrCoffeeShop",
      name: CONFIG.shopName,
      description:
        "Thai tea cafe offering pre-order drinks with delivery within " +
        CONFIG.delivery.radiusKm +
        "km.",
      servesCuisine: "Thai tea",
      priceRange: "$$",
      telephone: "+" + CONFIG.whatsappNumber,
      address: {
        "@type": "PostalAddress",
        streetAddress: CONFIG.address,
      },
      openingHours: openingHours,
      url:
        typeof window !== "undefined"
          ? window.location.href.split("#")[0]
          : "",
    };

    var sameAs = [];
    if (CONFIG.social.instagram) sameAs.push(CONFIG.social.instagram);
    if (CONFIG.social.threads) sameAs.push(CONFIG.social.threads);
    if (CONFIG.social.tiktok) sameAs.push(CONFIG.social.tiktok);
    if (sameAs.length) data.sameAs = sameAs;

    script.textContent = JSON.stringify(data, null, 2);
  }

  function setupStepsReveal() {
    var steps = document.querySelector(".steps");
    if (!steps || !("IntersectionObserver" in window)) {
      if (steps) steps.classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          steps.classList.add("is-visible");
          observer.disconnect();
          break;
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(steps);
  }

  function init() {
    document.documentElement.classList.add("js-motion");
    fillStaticContent();
    updateJsonLd();
    renderFilters("all");
    renderMenu("all");
    setupFilters();
    setupMenuDelegation();
    setupCartUI();
    setupStepsReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
