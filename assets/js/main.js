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
    if (!amount) return "Tanyakan";
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
          escapeHtml(formatPrice(entry.price) || "Tanyakan") +
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

    // Social — icon links for Instagram, Threads, TikTok
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
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-threads" viewBox="0 0 16 16"><path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/></svg>'
        },
        {
          key: "tiktok",
          label: "TikTok",
          icon:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.6 7.5a5.5 5.5 0 0 1-3.2-1V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.7a2.8 2.8 0 1 0 2 2.7V2h2.6a5.5 5.5 0 0 0 3.2 3.2v2.3z"/></svg>',
        },
      ];

      var socialHtml = "";
      for (var i = 0; i < platforms.length; i++) {
        var platform = platforms[i];
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
      url: typeof window !== "undefined" ? window.location.href.split("#")[0] : "",
    };

    var sameAs = [];
    if (CONFIG.social.instagram) sameAs.push(CONFIG.social.instagram);
    if (CONFIG.social.threads) sameAs.push(CONFIG.social.threads);
    if (CONFIG.social.tiktok) sameAs.push(CONFIG.social.tiktok);
    if (sameAs.length) data.sameAs = sameAs;

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
