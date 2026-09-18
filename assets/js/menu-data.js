/**
 * Ontea menu data.
 * TODO: Replace with your real drinks, prices, and image paths.
 * Set available: false to show a sold-out badge instead of an order button.
 *
 * Categories: "classic" | "green" | "specials" | "addons"
 *
 * prices: [{ name: "regular", price: 18000 }, ...]
 */
const MENU = [
  // —— Classic ——
  {
    id: "classic-thai-tea",
    category: "classic",
    name: "Original Thai Tea",
    description: "Diseduh menggunakan teh asli dari Thailand yang menghasilkan aroma khas. Teh diolah dengan sepenuh hati dan menghasilkan rasa manis, creamy dan wangi.",
    prices: [
      { name: "regular", price: 18000 },
      { name: "1 Liter", price: 70000 },
    ],
    image: "assets/img/original-thai-tea.jpeg",
    tags: ["best seller"],
    available: true,
  },
  // —— Green Tea
  {
    id: "thai-green-tea",
    category: "green",
    name: "Thai Green Tea",
    description: "Diseduh menggunakan teh asli dari Thailand yang menghasilkan aroma khas. Teh diolah dengan sepenuh hati dan menghasilkan rasa manis, creamy dan wangi.",
    prices: [
      { name: "regular", price: 20000 },
      { name: "1 Liter", price: 75000 },
    ],
    image: "assets/img/thai-green-tea.jpeg",
    tags: [],
    available: true,
  },
  {
    id: "roasted-milk-tea",
    category: "roastedMilkTea",
    name: "Roasted Milk Tea",
    description: "Diseduh menggunakan teh lokal Malang yang menghasilkan aroma khas. Teh diolah dengan sepenuh hati dan menghasilkan rasa manis, creamy dan wangi.",
    prices: [
      { name: "regular", price: 18000 },
      { name: "1 Liter", price: 70000 },
    ],
    image: "assets/img/roasted-milk-tea.png",
    tags: [],
    available: true,
  },
  {
    id: "custom-event",
    category: "specials",
    name: "Pesan untuk acara khusus",
    description: "Anda dapat memesan dalam jumlah banyak atau bulk order, kami siap memenuhi kebutuhan acara spesial anda",
    prices: [

    ],
    image: "assets/img/all-tea.png",
    tags: [],
    available: true,
  },
];

/** Category labels used by the filter bar and card badges. */
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "classic", label: "Klasik" },
  { id: "green", label: "Green Tea" },
  { id: "roastedMilkTea", label: "Roasted Milk Tea" },
];
