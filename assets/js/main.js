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

  /** Generic order CTA (header button). */
  function generalOrderMessage() {
    return (
      "Hi Ontea! Saya mau pesan.\n\n" +
      "Minuman:\n- \n\n" +
      "Dikirim pada hari: \n" +
      "Alamat Saya: "
    );
  }

  /** Prefer a size named "regular", otherwise the first entry. */
  function defaultSize(prices) {
    for (var i = 0; i < prices.length; i++) {
      if (prices[i].name === "regular") return prices[i];
    }
    return prices[0];
  }

  /** Per-drink order message. Prefer regular size when present. */
  function drinkOrderMessage(item) {
    var size = defaultSize(item.prices || []);
    var sizeDisplay = size
      ? size.name.charAt(0).toUpperCase() + size.name.slice(1)
      : "";
    var sizePart = sizeDisplay ? " (" + sizeDisplay + ")" : "";
    return (
      "Hi Ontea! Saya mau pesan:\n" +
      "- " +
      item.name +
      sizePart +
      "\n\n" +
      "Dikirim pada hari: \n" +
      "Alamat Saya: "
    );
  }

  function renderPrices(prices) {
    var parts = [];
    var list = prices || [];
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      var label = entry.name.charAt(0).toUpperCase() + entry.name.slice(1);
      parts.push(
        '<span><span class="size">' +
          escapeHtml(label) +
          "</span>" +
          escapeHtml(formatPrice(entry.price)) +
          "</span>"
      );
    }
    return parts.join("");
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

  function renderCard(item) {
    var soldOut = !item.available;
    var orderHref = soldOut ? "#" : whatsappUrl(drinkOrderMessage(item));
    var actionHtml = soldOut
      ? '<span class="btn btn-ghost btn-sm btn-block" aria-disabled="true">Sold out</span>'
      : '<a class="btn btn-primary btn-sm btn-block" href="' +
        escapeHtml(orderHref) +
        '" target="_blank" rel="noopener noreferrer">Pesan ini</a>';

    return (
      '<article class="menu-card' +
      (soldOut ? " is-sold-out" : "") +
      '" data-category="' +
      escapeHtml(item.category) +
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
      '<span class="placeholder-label" aria-hidden="true">' +
      escapeHtml(item.name.charAt(0)) +
      "</span>" +
      "</div>" +
      '<div class="menu-card-body">' +
      "<h3>" +
      escapeHtml(item.name) +
      "</h3>" +
      '<p class="menu-card-desc">' +
      escapeHtml(item.description) +
      "</p>" +
      '<div class="menu-card-prices">' +
      renderPrices(item.prices) +
      "</div>" +
      '<div class="menu-card-actions">' +
      actionHtml +
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

  function renderMenu(category) {
    var grid = document.getElementById("menu-grid");
    if (!grid) return;

    var items = getFilteredMenu(category);
    if (items.length === 0) {
      grid.innerHTML =
        '<p class="menu-empty">Belum ada minuman di kategori ini untuk saat ini.</p>';
      return;
    }

    var html = "";
    for (var i = 0; i < items.length; i++) {
      html += renderCard(items[i]);
    }
    grid.innerHTML = html;
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

  function fillStaticContent() {
    var el;

    el = document.getElementById("hero-tagline");
    if (el) el.textContent = CONFIG.tagline;

    el = document.getElementById("footer-tagline");
    if (el) el.textContent = CONFIG.tagline;

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
        "Siap kirim-kirim ke area " +
        CONFIG.delivery.radiusKm +
        "km radius. Jika alamatmu terdapat disini kita bisa mengirimnya ke rumahmu ^_^.";
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

    // Delivery areas
    var areasList = document.getElementById("delivery-areas");
    if (areasList) {
      var areasHtml = "";
      for (var i = 0; i < CONFIG.delivery.areas.length; i++) {
        areasHtml += "<li>" + escapeHtml(CONFIG.delivery.areas[i]) + "</li>";
      }
      areasList.innerHTML = areasHtml;
    }

    // Hours
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

    // Social
    var social = document.getElementById("social-links");
    if (social) {
      var socialHtml = "";
      if (CONFIG.social.instagram) {
        socialHtml +=
          '<a href="' +
          escapeHtml(CONFIG.social.instagram) +
          '" target="_blank" rel="noopener noreferrer">Instagram</a>';
      }
      if (CONFIG.social.facebook) {
        socialHtml +=
          '<a href="' +
          escapeHtml(CONFIG.social.facebook) +
          '" target="_blank" rel="noopener noreferrer">Facebook</a>';
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
      url: typeof window !== "undefined" ? window.location.href.split("#")[0] : "",
    };

    if (CONFIG.social.instagram || CONFIG.social.facebook) {
      data.sameAs = [];
      if (CONFIG.social.instagram) data.sameAs.push(CONFIG.social.instagram);
      if (CONFIG.social.facebook) data.sameAs.push(CONFIG.social.facebook);
    }

    script.textContent = JSON.stringify(data, null, 2);
  }

  function init() {
    fillStaticContent();
    updateJsonLd();
    renderFilters("all");
    renderMenu("all");
    setupFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
