# Ontea — Thai Tea Menu (Static Landing Page)

A single-page, mobile-first menu site for **Ontea**. Customers browse drinks and pre-order via WhatsApp. Delivery is limited to a listed set of neighborhoods.

No build step. Open `index.html` in a browser.

## Files

```
index.html                 Page structure & SEO tags
assets/css/styles.css      Styles (palette in :root)
assets/js/config.js        Shop settings (phone, hours, delivery)
assets/js/menu-data.js     Drink list — edit this to change the menu
assets/js/main.js          Renders menu, filters, WhatsApp links
assets/img/                Drink photos (optional)
README.md                  This file
```

## Add a drink

Append an object to the `MENU` array in `assets/js/menu-data.js`:

```js
{
  id: "my-new-drink",          // unique slug
  category: "classic",         // classic | green | specials | addons
  name: "My New Drink",
  description: "Short blurb.",
  prices: [
    { name: "regular", price: 18000 },
    { name: "liter", price: 70000 },
  ],
  image: "assets/img/my-new-drink.jpg",
  tags: ["best seller"],       // or [] — also supports "no caffeine", etc.
  available: true,
},
```

Save and refresh the page. No HTML changes needed.

## Change a price

Edit the `prices` array on that drink in `menu-data.js` — each entry is `{ name, price }`. Amounts are whole rupiah numbers (e.g. `18000`). Currency/locale come from `CONFIG.delivery` in `config.js`.

## Mark a drink sold out

Set `available: false` on that item. It renders greyed out with a **Sold out** badge and no WhatsApp button.

```js
available: false,
```

## Set the WhatsApp number

In `config.js`:

```js
whatsappNumber: "6281234567890",  // no +, no spaces
```

Every “Order this” button and the header CTA open `https://wa.me/<number>?text=...` with a pre-filled message.

## Change delivery areas

Edit the `delivery.areas` array in `config.js`. Named neighborhoods reassure customers more than a bare radius claim.
