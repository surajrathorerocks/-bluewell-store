/**
 * BLUEWELL VENTURES - MASTER CATALOG DATA
 * Edit, add, or remove products here. All pages read directly from this file.
 */

const PRODUCTS = [
  {
    id: 1,
    name: "Monsoon Malabar Dark Roast",
    category: "coffee",
    categoryLabel: "Artisanal Coffee",
    tagline: "Bold, earthy, and low-acidity Indian estate specialty.",
    description: "Harvested from the lush hills of the Western Ghats and exposed to damp monsoon winds for months, this legendary Indian brew develops a uniquely rich, mellow profile with thick crema, heavy body, and dark cocoa undertones.",
    tastingNotes: ["Dark Chocolate", "Smoky Spice", "Roasted Hazelnut"],
    badge: "Bestseller",
    rating: 4.9,
    reviewsCount: 128,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
    brewGuide: {
      equipment: "French Press / South Indian Filter / Moka Pot",
      ratio: "15g coffee to 220ml water",
      temp: "92°C – 94°C",
      time: "4 minutes steep time"
    },
    // Dynamic weight variants with respective prices
    variants: [
      { label: "250g Pack", weight: "250g", price: 449, default: true },
      { label: "500g Pack", weight: "500g", price: 849 },
      { label: "1 Kg Pack", weight: "1kg", price: 1599 },
      { label: "2.5 Kg Cafe Bulk", weight: "2.5kg", price: 3799 }
    ]
  },
  {
    id: 2,
    name: "Darjeeling First Flush Royal Black Tea",
    category: "tea",
    categoryLabel: "Single Estate Tea",
    tagline: "The Champagne of teas. Delicate muscatel and floral bouquet.",
    description: "Hand-plucked during the earliest days of spring from high-altitude misty slopes in Darjeeling. Boasts a luminous golden liquor, vibrant floral character, and the coveted natural muscatel grape sweetness with zero astringency.",
    tastingNotes: ["Muscatel Grape", "Spring Blossom", "Summer Peach"],
    badge: "Artisanal Reserve",
    rating: 4.8,
    reviewsCount: 94,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    brewGuide: {
      equipment: "Ceramic Teapot / Glass Infuser",
      ratio: "2.5g leaf to 200ml spring water",
      temp: "85°C (do not use boiling water)",
      time: "3 to 4 minutes"
    },
    variants: [
      { label: "100g Tin", weight: "100g", price: 499, default: true },
      { label: "250g Pack", weight: "250g", price: 1099 },
      { label: "500g Pack", weight: "500g", price: 1999 },
      { label: "1 Kg Estate Caddy", weight: "1kg", price: 3699 }
    ]
  },
  {
    id: 3,
    name: "Chikmagalur Arabica Medium Roast",
    category: "coffee",
    categoryLabel: "Artisanal Coffee",
    tagline: "Bright citrus acidity balanced by creamy salted caramel.",
    description: "Sourced from high-altitude shade-grown estates in the birthplace of Indian coffee. A balanced, smooth cup made for modern urban rituals, offering sparkling berry aromatics and a clean, lingering caramel finish.",
    tastingNotes: ["Salted Caramel", "Citrus Zest", "Toasted Almond"],
    badge: "Staff Pick",
    rating: 4.9,
    reviewsCount: 156,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    brewGuide: {
      equipment: "Pour-over (V60) / Aeropress / Drip Machine",
      ratio: "1:15 brew ratio (16g coffee to 240ml water)",
      temp: "90°C",
      time: "2 minutes 45 seconds"
    },
    variants: [
      { label: "250g Pack", weight: "250g", price: 429, default: true },
      { label: "500g Pack", weight: "500g", price: 799 },
      { label: "1 Kg Pack", weight: "1kg", price: 1499 },
      { label: "2.5 Kg Cafe Bulk", weight: "2.5kg", price: 3499 }
    ]
  },
  {
    id: 4,
    name: "Kashmiri Saffron Kahwa Green Tea",
    category: "tea",
    categoryLabel: "Specialty Herbal Tea",
    tagline: "Royal whole-leaf green tea with pure Kashmiri saffron & spices.",
    description: "An authentic regal formulation combining hand-rolled green tea leaves, pure red saffron threads, crushed green cardamom pods, and Ceylon cinnamon. Rich in antioxidants and deeply warming to the spirit.",
    tastingNotes: ["Pure Saffron", "Green Cardamom", "Sweet Cinnamon Bark"],
    badge: "New Release",
    rating: 4.9,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
    brewGuide: {
      equipment: "Traditional Samovar or Saucepan",
      ratio: "2g leaves to 180ml water",
      temp: "80°C – 85°C",
      time: "2 minutes gentle simmer (add almond slivers)"
    },
    variants: [
      { label: "150g Jar", weight: "150g", price: 549, default: true },
      { label: "300g Pack", weight: "300g", price: 999 },
      { label: "500g Pack", weight: "500g", price: 1599 },
      { label: "1 Kg Caddy", weight: "1kg", price: 2899 }
    ]
  }
];

// Available discount promo codes
const PROMO_CODES = {
  "BLUEWELL10": { type: "percent", value: 10, desc: "10% Off Storewide" },
  "WELCOME50": { type: "flat", value: 50, desc: "₹50 Flat Launch Discount" }
};

// Store contact & payment configurations (Update your WhatsApp number and UPI ID here)
const STORE_CONFIG = {
  name: "Bluewell Ventures",
  whatsappNumber: "919876543210", // Put your 10-digit WhatsApp phone number with country code (91)
  supportEmail: "hello@bluewellventures.com",
  upiId: "bluewellventures@okaxis", // Put your real UPI ID here
  freeShippingThreshold: 999,
  flatShippingFee: 70
};
