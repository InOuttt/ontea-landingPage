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
    description: "Chatramu yang khas dari Thailand.",
    prices: [
      { name: "regular", price: 18000 },
      { name: "1 Liter", price: 70000 },
    ],
    image: "assets/img/classic-thai-tea.jpg",
    tags: ["best seller"],
    available: true,
  },
  // —— Green Tea
  {
    id: "thai-green-tea",
    category: "green",
    name: "Thai Green Tea",
    description: "Thai Green tea enak mantab .",
    prices: [
      { name: "regular", price: 18000 },
      { name: "1 Liter", price: 70000 },
    ],
    image: "assets/img/thai-green-tea.jpg",
    tags: [],
    available: true,
  },
  {
    id: "roasted-milk-tea",
    category: "specials",
    name: "Roasted Milk Tea",
    description: "Roasted Milk Tea enak mantab.",
    prices: [
      { name: "regular", price: 18000 },
      { name: "1 Liter", price: 70000 },
    ],
    image: "assets/img/thai-green-tea.jpg",
    tags: [],
    available: true,
  },
];

/** Category labels used by the filter bar and card badges. */
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "classic", label: "Klasik" },
  { id: "green", label: "Green Tea" },
  { id: "specials", label: "Spesial" },
];
