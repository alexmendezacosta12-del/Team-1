// Product data for Clerks shoes
const products = [
  {
    id: 1,
    name: "Clerks Rush - White/Navy",
    colorway: "White/Navy",
    price: 89,
    image: "Clerks Rush.png",
    description:
      "The iconic Clerks Rush in classic white and navy. Perfect for everyday wear with premium comfort.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "light",
    footType: ["narrow", "regular"],
    featured: true,
    releaseDate: "2026-01-15",
  },
  {
    id: 2,
    name: "Clerks Rush - Blackout",
    colorway: "Black/White",
    price: 99,
    image: "Clerks Rush Blackout.png",
    description:
      "Bold and striking Blackout edition. Make a statement with this sleek black and white design.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "dark",
    footType: ["regular", "wide"],
    featured: true,
    releaseDate: "2026-02-01",
  },
  {
    id: 3,
    name: "Clerks Rush - Midnight Navy",
    colorway: "Navy/White",
    price: 109,
    image: "Clerks Rush Midnight Navy.png",
    description:
      "Deep midnight navy with crisp white accents. Sophisticated style meets performance.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "dark",
    footType: ["narrow", "regular"],
    featured: false,
    releaseDate: "2026-03-10",
  },
  {
    id: 4,
    name: "Clerks Rush - Sunset",
    colorway: "Orange/Grey",
    price: 129,
    image: "Clerks Rush.png", // Using placeholder - will need actual image
    description:
      "Limited edition Sunset colorway. Bold orange and grey for those who dare to stand out.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "bold",
    footType: ["regular", "wide"],
    featured: false,
    releaseDate: "2026-04-20",
  },
];

// Size conversion chart
const sizeChart = {
  6: { uk: 6, us: 7, eu: 40 },
  7: { uk: 7, us: 8, eu: 41 },
  8: { uk: 8, us: 9, eu: 42 },
  9: { uk: 9, us: 10, eu: 43 },
  10: { uk: 10, us: 11, eu: 44 },
  11: { uk: 11, us: 12, eu: 45 },
  12: { uk: 12, us: 13, eu: 46 },
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { products, sizeChart };
}

// Made with Bob
