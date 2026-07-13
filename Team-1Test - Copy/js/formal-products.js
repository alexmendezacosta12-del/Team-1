// Formal Collection — 10 products based on real Clerks formal photography
// Images reference the provided shoe photographs saved as formal-shoe-{n}.jpg
// Names derived from each shoe's visible style, colour, and detailing.

const formalProducts = [
  {
    id: 101,
    name: "Clerks Hartfield — Tan Wingtip Brogue",
    category: "Derby",
    colorway: "Tan/Chestnut",
    price: 149,
    image: "formal-shoe-1.jpg",
    description:
      "Full-brogue wingtip Derby in rich tan leather with chestnut stitching. The medallion toecap and brogued wing tips carry the Clerks name embossed along the vamp — a timeless statement in any boardroom.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "warm",
    style: ["derby", "brogue", "classic", "formal"],
    featured: true,
    releaseDate: "2026-01-10",
  },
  {
    id: 102,
    name: "Clerks Nightfield — Blackout Plain Derby",
    category: "Derby",
    colorway: "Black/Black",
    price: 139,
    image: "formal-shoe-2.jpg",
    description:
      "Clean-lined plain-toe Derby in mirror-polished black leather. No ornamentation — just perfection of form. The Clerks monogram is heat-stamped on the heel counter. Pairs with everything from a dark suit to black tie.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "dark",
    style: ["derby", "classic", "formal", "premium"],
    featured: true,
    releaseDate: "2026-01-20",
  },
  {
    id: 103,
    name: "Clerks Aldgate — Cognac Cap-Toe Oxford",
    category: "Oxford",
    colorway: "Cognac/Tan",
    price: 159,
    image: "formal-shoe-3.jpg",
    description:
      "Cap-toe Oxford in warm cognac leather with a contrasting tan brogued cap. The Clerks crest is engraved on the insole. An elegant hybrid of the traditional Oxford and the open Derby — suited to weddings and formal dining.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "warm",
    style: ["oxford", "brogue", "formal", "wedding"],
    featured: true,
    releaseDate: "2026-02-01",
  },
  {
    id: 104,
    name: "Clerks Brompton — Dark Brown Cap-Toe",
    category: "Oxford",
    colorway: "Dark Brown/Mahogany",
    price: 155,
    image: "formal-shoe-4.jpg",
    description:
      "A sleek cap-toe Oxford in deep mahogany leather with a smooth, burnished finish. Subtle Clerks insignia on the heel. The understated choice that speaks volumes — business or black-tie, it delivers.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "dark",
    style: ["oxford", "classic", "formal", "business"],
    featured: false,
    releaseDate: "2026-02-10",
  },
  {
    id: 105,
    name: "Clerks Indigocraft — Navy Plain Derby",
    category: "Derby",
    colorway: "Navy/Ivory",
    price: 149,
    image: "formal-shoe-5.jpg",
    description:
      "A standout plain-toe Derby in deep navy leather with a contrasting ivory crepe sole. The Clerks name is embossed in tone-on-tone on the vamp. Sharp, confident, and unmistakably current — smart casual at its finest.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "bold",
    style: ["derby", "smart-casual", "statement", "summer-formal"],
    featured: false,
    releaseDate: "2026-02-20",
  },
  {
    id: 106,
    name: "Clerks Blackmoor — Onyx Moc-Toe Slip-On",
    category: "Loafer",
    colorway: "Black/Black",
    price: 129,
    image: "formal-shoe-6.jpg",
    description:
      "A sleek moc-stitched slip-on in polished black leather. The apron toe adds a casual edge while the leather lining and leather sole maintain formality. Clerks branding embossed on the outer vamp. Effortless to wear, impossible to ignore.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "dark",
    style: ["loafer", "smart-casual", "classic"],
    featured: false,
    releaseDate: "2026-03-01",
  },
  {
    id: 107,
    name: "Clerks Barlow — Dark Brown Penny Loafer",
    category: "Loafer",
    colorway: "Dark Brown/Cognac",
    price: 139,
    image: "formal-shoe-7.jpg",
    description:
      "A full-grained dark brown penny loafer with a raised saddle strap and cognac interior lining. The Clerks wordmark is stitched into the instep. Wears brilliantly with chinos or tailored trousers — the smart-casual benchmark.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "warm",
    style: ["loafer", "smart-casual", "classic", "summer-formal"],
    featured: true,
    releaseDate: "2026-03-10",
  },
  {
    id: 108,
    name: "Clerks Oceanside — Navy Moc-Toe Derby",
    category: "Derby",
    colorway: "Navy/Ivory",
    price: 145,
    image: "formal-shoe-8.jpg",
    description:
      "A lace-up moc-toe derby in soft navy leather set on an ivory rubber sole. Contrast stitching around the apron toe and the Clerks emboss on the toe cap give this casual-formal hybrid its distinctive character. For those who dress smart without following convention.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "bold",
    style: ["derby", "smart-casual", "statement", "summer-formal"],
    featured: false,
    releaseDate: "2026-03-20",
  },
  {
    id: 109,
    name: "Clerks Nocturne — Black Full-Brogue Wingtip",
    category: "Oxford",
    colorway: "Black/Black",
    price: 169,
    image: "formal-shoe-9.jpg",
    description:
      "The definitive black brogue Oxford — full wingtip perforations, medallion cap, and a high-shine finish. The Clerks seal is blind-embossed on the toe box. As at home at a black-tie event as it is on a sharp city suit. Our most formal statement shoe.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "dark",
    style: ["oxford", "brogue", "formal", "premium", "wedding", "black-tie"],
    featured: true,
    releaseDate: "2026-04-01",
  },
  {
    id: 110,
    name: "Clerks Greyford — Espresso Moc-Toe Slip-On",
    category: "Loafer",
    colorway: "Espresso/Dark Brown",
    price: 135,
    image: "formal-shoe-10.jpg",
    description:
      "A rich espresso-brown leather slip-on with a moc-toe apron and elasticated gusset for ease. The Clerks name is laser-engraved on the outer flank. A versatile smart-casual shoe that transitions from desk to dinner without missing a beat.",
    sizes: [6, 7, 8, 9, 10, 11, 12],
    color: "warm",
    style: ["loafer", "smart-casual", "classic", "business"],
    featured: false,
    releaseDate: "2026-04-10",
  },
];

// Update filter price range to match new products
const formalPriceRange = { min: 129, max: 169 };

// Size conversion chart
const formalSizeChart = {
  6:  { uk: 6,  us: 7,  eu: 40 },
  7:  { uk: 7,  us: 8,  eu: 41 },
  8:  { uk: 8,  us: 9,  eu: 42 },
  9:  { uk: 9,  us: 10, eu: 43 },
  10: { uk: 10, us: 11, eu: 44 },
  11: { uk: 11, us: 12, eu: 45 },
  12: { uk: 12, us: 13, eu: 46 },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { formalProducts, formalSizeChart };
}
