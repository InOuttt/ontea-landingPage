# Ontea — Thai Tea Menu (Static Landing Page)

A single-page, mobile-first menu site for **Ontea**. Customers browse drinks and pre-order via WhatsApp. Delivery is limited to a 30km radius (listed as named neighborhoods).

No build step. Open `index.html` in a browser, or drop the folder onto Netlify / Cloudflare Pages / GitHub Pages.

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

## Before you go live

1. Open [`assets/js/config.js`](assets/js/config.js) and replace every `TODO` value:
   - `whatsappNumber` — digits only, international format (e.g. `6281234567890`)
   - `address`, `mapsUrl`, `phoneDisplay`
   - `hours`, `preorder` cutoff / lead time / delivery days
   - `delivery.fee`, `delivery.minimumOrder`, `delivery.areas`
2. Open [`assets/js/menu-data.js`](assets/js/menu-data.js) and replace the placeholder drinks with your real menu and prices.
3. Drop photos into `assets/img/` using the same filenames as in `menu-data.js` (or update the `image` paths). Missing images fall back to a colored placeholder.

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

Edit the `delivery.areas` array in `config.js`. Named neighborhoods reassure customers more than a bare “30km” claim.

## Deploy

Any static host works:

- **Netlify / Cloudflare Pages:** drag the project folder into the dashboard, or connect the git repo (publish directory = project root).
- **GitHub Pages:** push the repo and enable Pages on the root branch.
- **Local preview:** double-click `index.html`, or from this folder run:

  ```bash
  python3 -m http.server 8080
  ```

  then open http://localhost:8080

## Design notes

- Palette lives in CSS custom properties at the top of `styles.css` (`--color-tea`, `--color-cream`, `--color-brown`).
- Menu grid uses `repeat(auto-fill, minmax(260px, 1fr))` so it reflows without many media queries.
- Filter buttons use `aria-pressed` for accessibility; images use `loading="lazy"` and alt text from the drink name.
