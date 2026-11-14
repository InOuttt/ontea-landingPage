/**
 * Ontea cart — state, persistence, and WhatsApp message builder.
 * Depends on CONFIG and MENU (loaded before this file).
 * Exposes window.Cart.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "ontea-cart-v1";
  var listeners = [];
  var lines = [];
  var nextLineId = 1;

  function findMenuItem(productId) {
    for (var i = 0; i < MENU.length; i++) {
      if (MENU[i].id === productId) return MENU[i];
    }
    return null;
  }

  function findPrice(item, sizeName) {
    var prices = (item && item.prices) || [];
    for (var i = 0; i < prices.length; i++) {
      if (prices[i].name === sizeName) return prices[i];
    }
    return null;
  }

  function notify() {
    persist();
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i](getSnapshot());
      } catch (err) {
        /* ignore subscriber errors */
      }
    }
  }

  function getSnapshot() {
    return lines.map(function (line) {
      return {
        id: line.id,
        productId: line.productId,
        size: line.size,
        qty: line.qty,
        note: line.note,
      };
    });
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getSnapshot()));
    } catch (err) {
      /* private mode / quota */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      var restored = [];
      for (var i = 0; i < parsed.length; i++) {
        var row = parsed[i];
        if (!row || !row.productId || !row.size || !row.qty) continue;
        var item = findMenuItem(row.productId);
        if (!item || !item.available) continue;
        var price = findPrice(item, row.size);
        if (!price) continue;
        var qty = Math.max(1, Math.floor(Number(row.qty)) || 1);
        var id = nextLineId++;
        restored.push({
          id: id,
          productId: row.productId,
          size: row.size,
          qty: qty,
          note: typeof row.note === "string" ? row.note : "",
        });
      }
      lines = restored;
    } catch (err) {
      lines = [];
    }
  }

  function findLineByProductSize(productId, size, note) {
    var noteNorm = (note || "").trim();
    for (var i = 0; i < lines.length; i++) {
      if (
        lines[i].productId === productId &&
        lines[i].size === size &&
        (lines[i].note || "").trim() === noteNorm
      ) {
        return lines[i];
      }
    }
    return null;
  }

  function findLineById(lineId) {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].id === lineId) return lines[i];
    }
    return null;
  }

  function add(productId, size, qty) {
    var item = findMenuItem(productId);
    if (!item || !item.available) return null;
    var price = findPrice(item, size);
    if (!price) return null;

    var amount = Math.max(1, Math.floor(Number(qty)) || 1);
    var existing = findLineByProductSize(productId, size, "");
    if (existing) {
      existing.qty += amount;
      notify();
      return existing.id;
    }

    var id = nextLineId++;
    lines.push({
      id: id,
      productId: productId,
      size: size,
      qty: amount,
      note: "",
    });
    notify();
    return id;
  }

  function setQty(lineId, qty) {
    var line = findLineById(lineId);
    if (!line) return;
    var next = Math.floor(Number(qty));
    if (!next || next < 1) {
      remove(lineId);
      return;
    }
    line.qty = next;
    notify();
  }

  function setNote(lineId, note, options) {
    var line = findLineById(lineId);
    if (!line) return;
    line.note = String(note || "");
    if (options && options.silent) {
      persist();
      return;
    }
    notify();
  }

  /**
   * Split one unit into a new line so it can have a different note.
   * Returns the new line id, or null if the line has qty 1 (just clear note path).
   */
  function split(lineId) {
    var line = findLineById(lineId);
    if (!line) return null;
    if (line.qty <= 1) return line.id;

    line.qty -= 1;
    var id = nextLineId++;
    lines.push({
      id: id,
      productId: line.productId,
      size: line.size,
      qty: 1,
      note: "",
    });
    notify();
    return id;
  }

  function remove(lineId) {
    var removed = null;
    var next = [];
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].id === lineId) {
        removed = {
          id: lines[i].id,
          productId: lines[i].productId,
          size: lines[i].size,
          qty: lines[i].qty,
          note: lines[i].note,
        };
      } else {
        next.push(lines[i]);
      }
    }
    if (!removed) return null;
    lines = next;
    notify();
    return removed;
  }

  function restoreLine(snapshot) {
    if (!snapshot) return;
    var item = findMenuItem(snapshot.productId);
    if (!item || !item.available) return;
    if (!findPrice(item, snapshot.size)) return;
    var id = nextLineId++;
    lines.push({
      id: id,
      productId: snapshot.productId,
      size: snapshot.size,
      qty: Math.max(1, snapshot.qty || 1),
      note: snapshot.note || "",
    });
    notify();
    return id;
  }

  function clear() {
    lines = [];
    notify();
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function unsubscribe() {
      listeners = listeners.filter(function (l) {
        return l !== fn;
      });
    };
  }

  function enrichedLines() {
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var item = findMenuItem(line.productId);
      var priceEntry = item ? findPrice(item, line.size) : null;
      if (!item || !priceEntry) continue;
      result.push({
        id: line.id,
        productId: line.productId,
        name: item.name,
        image: item.image,
        size: line.size,
        sizeLabel: line.size.charAt(0).toUpperCase() + line.size.slice(1),
        unitPrice: priceEntry.price,
        qty: line.qty,
        note: line.note,
        lineTotal: priceEntry.price * line.qty,
      });
    }
    return result;
  }

  function itemCount() {
    var n = 0;
    var list = enrichedLines();
    for (var i = 0; i < list.length; i++) n += list[i].qty;
    return n;
  }

  function subtotal() {
    var sum = 0;
    var list = enrichedLines();
    for (var i = 0; i < list.length; i++) sum += list[i].lineTotal;
    return sum;
  }

  function deliveryFee() {
    return (CONFIG.delivery && CONFIG.delivery.fee) || 0;
  }

  function grandTotal() {
    if (itemCount() === 0) return 0;
    return subtotal() + deliveryFee();
  }

  function meetsMinimum() {
    var enforce =
      CONFIG.cart && CONFIG.cart.enforceMinimum !== false;
    if (!enforce) return true;
    var min = (CONFIG.delivery && CONFIG.delivery.minimumOrder) || 0;
    if (!min) return true;
    return subtotal() >= min;
  }

  function qtyForProductSize(productId, size) {
    var total = 0;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].productId === productId && lines[i].size === size) {
        total += lines[i].qty;
      }
    }
    return total;
  }

  /** Total qty for a product across all sizes. */
  function qtyForProduct(productId) {
    var total = 0;
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].productId === productId) total += lines[i].qty;
    }
    return total;
  }

  /**
   * Prefer a size already in the cart (first match by MENU price order),
   * otherwise fall back to regular / first priced size.
   */
  function preferredSize(productId) {
    var item = findMenuItem(productId);
    if (!item || !item.prices || !item.prices.length) return null;
    for (var i = 0; i < item.prices.length; i++) {
      if (qtyForProductSize(productId, item.prices[i].name) > 0) {
        return item.prices[i].name;
      }
    }
    for (var j = 0; j < item.prices.length; j++) {
      if (item.prices[j].name === "regular") return item.prices[j].name;
    }
    return item.prices[0].name;
  }

  /**
   * @param {object} checkout — { name, dateLabel, address, maps, note }
   */
  function buildMessage(checkout) {
    var formatPrice =
      (window.Ontea && window.Ontea.formatPrice) ||
      function (n) {
        return String(n);
      };

    var list = enrichedLines();
    var parts = ["Hi Ontea! Saya mau pesan:", ""];

    for (var i = 0; i < list.length; i++) {
      var line = list[i];
      parts.push(
        i +
          1 +
          ". " +
          line.name +
          " (" +
          line.sizeLabel +
          ") x" +
          line.qty +
          " - " +
          formatPrice(line.lineTotal)
      );
      if (line.note && line.note.trim()) {
        parts.push("   Catatan: " + line.note.trim());
      }
    }

    parts.push("");
    parts.push("Subtotal: " + formatPrice(subtotal()));
    parts.push("Ongkir: " + formatPrice(deliveryFee()));
    parts.push("Total: " + formatPrice(grandTotal()));
    parts.push("");

    var c = checkout || {};
    if (c.name) parts.push("Nama: " + c.name);
    if (c.dateLabel) parts.push("Dikirim pada hari: " + c.dateLabel);
    if (c.address) parts.push("Alamat: " + c.address);
    if (c.maps) parts.push("Maps: " + c.maps);
    if (c.note) parts.push("Catatan: " + c.note);

    return parts.join("\n");
  }

  load();

  window.Cart = {
    add: add,
    setQty: setQty,
    setNote: setNote,
    split: split,
    remove: remove,
    restoreLine: restoreLine,
    clear: clear,
    subscribe: subscribe,
    getLines: enrichedLines,
    getSnapshot: getSnapshot,
    itemCount: itemCount,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    grandTotal: grandTotal,
    meetsMinimum: meetsMinimum,
    qtyForProductSize: qtyForProductSize,
    qtyForProduct: qtyForProduct,
    preferredSize: preferredSize,
    buildMessage: buildMessage,
    findMenuItem: findMenuItem,
  };
})();
