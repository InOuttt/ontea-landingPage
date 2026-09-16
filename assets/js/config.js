/**
 * Ontea site configuration.
 * TODO: Replace every placeholder marked below with your real details.
 */
const CONFIG = {
  // TODO: WhatsApp number in international format, digits only (no + or spaces).
  // Example for Indonesia: 6281234567890
  whatsappNumber: "6285190996964",

  shopName: "Ontea Thai Tea",
  tagline: "Premium Thai Tea, siap memanjakan Anda.",

  // TODO: Update with your real address and Google Maps link.
  address: "Malang Kota, Jawa Timur",
  mapsUrl: "https://maps.google.com/?q=Ontea",

  // TODO: Update phone display (can include spaces/dashes for readability).
  phoneDisplay: "+62 851-9099-6964",

  // TODO: Social links — leave empty string to hide.
  social: {
    instagram: "https://instagram.com/ontea.thaitea",
    threads: "https://threads.net/@ontea.thaitea",
    tiktok: "https://tiktok.com/@ontea.thaitea",
  },

  // TODO: Opening hours shown in the footer and JSON-LD.
  hours: [
    { days: "Senin – Minggu", time: "09:00 – 20:00" }
  ],

  // Pre-order rules shown in the "How it works" section.
  // TODO: Adjust cutoff and lead time to match how you operate.
  preorder: {
    cutoff: "Maksimum order harus dilakukan sebelum pukul 20:00 WIB H-1 Pemesanan.",
    leadTime: "Kami akan konfirmasi pesanan melalui WhatsApp, lalu kirimkan pada hari yang Anda pilih.",
    deliveryDays: "Setiap Hari",
  },

  // Delivery policy.
  delivery: {
    radiusKm: 10,
    fee: 15000,
    minimumOrder: 100000,
    currency: "IDR",
    locale: "id-ID",
    areas: ["Malang Kota", "Sawojajar", "Lowokwaru", "Kedungkandang", "Sukun", 
      "Karang Ploso", "Turen", "Singosari", "Tidar", "Tlogomas"],
  },
};
