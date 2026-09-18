/**
 * Ontea site configuration.
 */
const CONFIG = {
  whatsappNumber: "6285190996964",

  shopName: "Ontea Thai Tea",
  tagline: "Minuman segar dan nikmat siap memanjakan Anda.",
  footerTagline: "Auntie tunggu pesananmu",

  address: "Kota Malang, Jawa Timur",
  mapsUrl: "https://maps.google.com/?q=Malang",

  phoneDisplay: "+62 851-9099-6964",

  social: {
    instagram: "https://instagram.com/ontea.thaitea",
    threads: "https://threads.com/@ontea.thaitea",
    tiktok: "https://tiktok.com/@ontea.thaitea",
  },

  hours: [
    { days: "Senin – Minggu", time: "09:00 – 20:00" }
  ],

  preorder: {
    cutoff: "Pemesanan maksimal H-1 dan pukul 20.00 WIB setiap harinya",
    leadTime: "Kami akan konfirmasi pesanan melalui WhatsApp, kami akan mengirim pesanan tepat waktu.",
    deliveryDays: "Setiap Hari",
  },

  // Delivery policy.
  delivery: {
    radiusKm: 30,
    fee: 15000,
    minimumOrder: 100000,
    currency: "IDR",
    locale: "id-ID",
    areas: ["Malang Kota", "Sawojajar", "Blimbing", "Klojen", "Lowokwaru", "Kedungkandang ", "Sukun", 
      "Karang Ploso", "Tidar", "Tlogomas", "Turen", "Singosari", "Tumpang", "Pakis"],
  },
};
