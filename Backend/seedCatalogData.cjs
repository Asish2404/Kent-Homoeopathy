/**
 * =====================================================================
 *  Dr. Kent Homeopathy — Data-Driven Catalog Generator
 * =====================================================================
 *  Generates production-ready JSON data files:
 *
 *    Project/src/data/products.json    (~105 products, exact 31-field schema)
 *    Project/src/data/categories.json  (19 categories)
 *    Project/src/data/doctors.json     (10 doctors)
 *    Project/src/data/labtests.json    (individual tests + health packages)
 *
 *  Also writes self-contained SVG images under:
 *    Project/public/images/products/...
 *    Project/public/images/categories/...
 *    Project/public/images/doctors/...
 *
 *  Usage:  node Backend/seedCatalogData.cjs
 *  The script automatically validates the generated output.
 * =====================================================================
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "Project", "src", "data");
const PUBLIC_IMG = path.join(ROOT, "Project", "public", "images");

const PRODUCT_IMG_DIR = path.join(PUBLIC_IMG, "products");
const CATEGORY_IMG_DIR = path.join(PUBLIC_IMG, "categories");
const DOCTOR_IMG_DIR = path.join(PUBLIC_IMG, "doctors");

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const makeObjectId = (seed) =>
  crypto.createHash("sha1").update(seed).digest("hex").slice(0, 24);

const iso = (y, m, d) =>
  new Date(Date.UTC(y, m - 1, d, 10, 30, 0)).toISOString();

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 1) => {
  const v = min + Math.random() * (max - min);
  return Number(v.toFixed(dec));
};

// ---------------------------------------------------------------------
// SVG image generator (self-contained local assets)
// ---------------------------------------------------------------------
const COLORS = [
  ["#10b981", "#059669"],
  ["#14b8a6", "#0d9488"],
  ["#3b82f6", "#2563eb"],
  ["#8b5cf6", "#6d28d9"],
  ["#f59e0b", "#d97706"],
  ["#ef4444", "#b91c1c"],
  ["#f97316", "#ea580c"],
  ["#06b6d4", "#0891b2"],
  ["#84cc16", "#65a30d"],
  ["#ec4899", "#db2777"],
  ["#0ea5e9", "#0284c7"],
  ["#a855f7", "#7c3aed"],
  ["#14b8a6", "#0f766e"],
  ["#e11d48", "#be123c"],
  ["#d97706", "#b45309"],
];

function svgAsset(fileName, title, subtitle, emoji, idx) {
  const [c1, c2] = COLORS[idx % COLORS.length];
  const safeTitle = String(title).replace(/&/g, "&amp;").replace(/</g, "<");
  const safeSub = String(subtitle).replace(/&/g, "&amp;").replace(/</g, "<");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" rx="120" fill="url(#g)"/>
  <rect width="800" height="800" rx="120" fill="url(#halo)"/>
  <circle cx="640" cy="130" r="110" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="120" cy="700" r="150" fill="#ffffff" fill-opacity="0.07"/>
  <text x="400" y="380" font-size="190" text-anchor="middle">${emoji}</text>
  <text x="400" y="560" font-size="44" font-weight="700" font-family="Arial, sans-serif" fill="#ffffff" text-anchor="middle" max-width="640">${safeTitle}</text>
  <text x="400" y="620" font-size="28" font-weight="400" font-family="Arial, sans-serif" fill="#ffffff" fill-opacity="0.85" text-anchor="middle">${safeSub}</text>
</svg>`;
  ensureDir(path.dirname(fileName));
  fs.writeFileSync(fileName, svg, "utf8");
}

// ---------------------------------------------------------------------
// CATEGORIES — 19 categories
// ---------------------------------------------------------------------
const CATEGORY_SPECS = [
  { name: "Fever", icon: "🌡️", tagline: "Gentle, natural fever relief", description: "Trusted homeopathic remedies for the management of fever, body ache, and associated symptoms. Each remedy is selected based on the nature of fever for gentle, side-effect-free support." },
  { name: "Cold & Cough", icon: "🤧", tagline: "Soothe cold & cough naturally", description: "Effective homeopathic dilutions and tablets for common cold, runny nose, sneezing, and dry or productive cough — formulated to give quick symptomatic comfort." },
  { name: "Allergy", icon: "🌸", tagline: "Relief from allergic reactions", description: "Constitutional and acute homeopathic remedies that help manage allergic rhinitis, skin allergies, sneezing bouts, and environmental sensitivities." },
  { name: "Skin Care", icon: "🧴", tagline: "Healthy, glowing skin", description: "A complete range of homeopathic skin remedies and ointments for acne, eczema, dryness, rashes, and overall skin wellness." },
  { name: "Hair Care", icon: "💇", tagline: "Stronger, fuller hair", description: "Homeopathic support for hair fall, dandruff, and weakened hair roots — promoting natural hair growth and scalp health." },
  { name: "Digestive Care", icon: "🍃", tagline: "Better gut, better life", description: "Remedies for acidity, indigestion, constipation, bloating, and IBS. Supports healthy digestion and a balanced gut naturally." },
  { name: "Women's Health", icon: "👩", tagline: "Wellness for every stage", description: "Gentle homeopathic support for menstrual irregularities, PCOS, hormonal balance, pregnancy wellness, and overall women's health." },
  { name: "Children's Health", icon: "🧸", tagline: "Gentle care for kids", description: "Safe and child-friendly homeopathic remedies for teething, cough, fever, indigestion, and immunity building in children." },
  { name: "Joint & Muscle Pain", icon: "🦴", tagline: "Move freely, live fully", description: "Effective remedies for joint stiffness, arthritis, backache, muscle sprains, and rheumatic pains — for active, pain-free living." },
  { name: "Diabetes Care", icon: "🍬", tagline: "Manage sugar naturally", description: "Homeopathic support to help maintain healthy blood sugar levels and manage diabetes-related complaints alongside prescribed therapy." },
  { name: "Kidney Care", icon: "🫘", tagline: "Support kidney health", description: "Remedies for urinary complaints, kidney stones, burning micturition, and overall urinary tract wellness." },
  { name: "Liver Care", icon: "🧪", tagline: "Protect & detox your liver", description: "Homeopathic liver remedies for fatty liver support, jaundice recovery, sluggish digestion, and natural detoxification." },
  { name: "Immunity", icon: "🛡️", tagline: "Stay strong every day", description: "Immunity boosters and constitutional remedies that strengthen the body's natural defence system against seasonal infections." },
  { name: "Respiratory Care", icon: "🫁", tagline: "Breathe easier, live better", description: "Supportive homeopathic care for asthma, bronchitis, wheezing, and chronic respiratory discomfort." },
  { name: "Stress & Sleep", icon: "🌙", tagline: "Calm mind, restful sleep", description: "Natural remedies for stress, anxiety, restlessness, and insomnia — helping you relax and sleep better." },
  { name: "Heart Care", icon: "❤️", tagline: "Cardio wellness range", description: "Homeopathic support for palpitations, cholesterol balance, blood pressure, and overall cardiovascular health." },
  { name: "Eye Care", icon: "👁️", tagline: "Clear vision, healthy eyes", description: "Remedies for eye strain, dryness, burning, and vision fatigue caused by long screen hours and ageing." },
  { name: "Dental Care", icon: "🦷", tagline: "Healthy teeth & gums", description: "Homeopathic remedies for toothache, gum bleeding, sensitivity, and oral infections for complete dental wellness." },
  { name: "General Wellness", icon: "💚", tagline: "Everyday health essentials", description: "A broad range of general wellness remedies and supplements for daily vitality, nutrition, and overall well-being." },
];

// ---------------------------------------------------------------------
// PRODUCT DATA — 100+ realistic homeopathic products
// ---------------------------------------------------------------------

// Product templates organized by category
const PRODUCT_TEMPLATES = {
  "Fever": [
    { name: "Belladonna 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before or after meals. Avoid strong flavours." },
    { name: "Arsenic Album 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before or after meals. Avoid strong flavours." },
    { name: "Bryonia Alba 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before or after meals. Avoid strong flavours." },
    { name: "Rhus Tox 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before or after meals. Avoid strong flavours." },
    { name: "Gelsemium 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before or after meals. Avoid strong flavours." },
    { name: "Pyrogen 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
  ],
  "Cold & Cough": [
    { name: "Aconite Nap 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take at first sign of cold. Dissolve in water and sip slowly." },
    { name: "Allium Cepa 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Drosera 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Hepar Sulph 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Spongia Tosta 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
  ],
  "Allergy": [
    { name: "Histaminum 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Natrum Mur 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Sabadilla 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Apis Mellifica 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Urtica Urens 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
  ],
  "Skin Care": [
    { name: "Sulphur 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Graphites 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Antimonium Crudum 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Calendula Ointment", brand: "Dr. Kent", pack: "25g", quantity: 25, dosage: "Apply externally 2-3 times daily", usage: "Clean the affected area and apply a thin layer of ointment." },
    { name: "Berberis Aquifolium 6X", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Can be used for skin purifying." },
  ],
  "Hair Care": [
    { name: "Thuja Occidentalis 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Silicea 6X", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Hair Growth Oil", brand: "Dr. Kent", pack: "100ml", quantity: 100, dosage: "Apply 5-10 drops on scalp, massage gently", usage: "Apply on scalp before bedtime. Massage for 5 minutes." },
    { name: "Biotin Hair Tablets", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet twice daily after meals", usage: "Swallow whole with water after meals." },
    { name: "Lycopodium 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
  ],
  "Digestive Care": [
    { name: "Nux Vomica 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Pulsatilla 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Carbo Veg 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Lycopodium 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Digestive Enzyme Drops", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "10-15 drops in water before meals", usage: "Mix with water and consume 10 minutes before meals." },
    { name: "Triphala Powder", brand: "Dr. Kent", pack: "100g", quantity: 100, dosage: "1 teaspoon with warm water at bedtime", usage: "Mix 1 teaspoon in warm water and drink before sleeping." },
  ],
  "Women's Health": [
    { name: "Sepia 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Pulsatilla 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Sabina 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Caulophyllum 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Women's Wellness Tonic", brand: "Dr. Kent", pack: "200ml", quantity: 200, dosage: "10ml twice daily after meals", usage: "Shake well before use. Take with lukewarm water." },
    { name: "Folic Acid Plus", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet daily after meals", usage: "Swallow whole with water. Best taken with breakfast." },
  ],
  "Children's Health": [
    { name: "Chamomilla 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "2-3 drops in half cup water, 3 times daily", usage: "For children above 2 years. Mix with water." },
    { name: "Calcarea Phos 6X", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Borax 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "2-3 drops in half cup water, 3 times daily", usage: "For children above 2 years. Mix with water." },
    { name: "Cina 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "2-3 drops in half cup water, 3 times daily", usage: "For children above 2 years. Mix with water." },
    { name: "Kids Immunity Gummies", brand: "Dr. Kent", pack: "60 gummies", quantity: 60, dosage: "1 gummy daily for children 2-12 years", usage: "Chew thoroughly before swallowing. Supervise children." },
    { name: "Teething Relief Drops", brand: "Dr. Kent", pack: "15ml", quantity: 15, dosage: "2-3 drops on gums, 3 times daily", usage: "Apply directly on gums with clean fingers." },
  ],
  "Joint & Muscle Pain": [
    { name: "Rhus Tox 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Bryonia 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Arnica Montana 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Ruta Graveolens 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Joint Care Oil", brand: "Dr. Kent", pack: "100ml", quantity: 100, dosage: "Apply 5-10 drops on affected area, massage gently", usage: "Apply on affected joints and massage for 5-10 minutes." },
    { name: "Pain Relief Spray", brand: "Dr. Kent", pack: "60ml", quantity: 60, dosage: "Spray 2-3 times on affected area, 3 times daily", usage: "Spray on clean skin over the painful area and massage gently." },
  ],
  "Diabetes Care": [
    { name: "Uranium Nit 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Syzygium Jamb 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Phosphoric Acid 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Cephalandra Ind 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Diabetic Wellness Drops", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
  ],
  "Kidney Care": [
    { name: "Berberis Vulgaris 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Cantharis 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Lycopodium 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Solidago 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Kidney Care Drops", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
  ],
  "Liver Care": [
    { name: "Carduus Marianus 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Chelidonium Majus 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Nux Vomica 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Podophyllum 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Liver Detox Syrup", brand: "Dr. Kent", pack: "200ml", quantity: 200, dosage: "10ml twice daily after meals", usage: "Shake well before use. Take with lukewarm water." },
  ],
  "Immunity": [
    { name: "Arsenic Album 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Tuberculinum 1M", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3 drops in half cup water, once weekly", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Influenzinum 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Immunity Booster Syrup", brand: "Dr. Kent", pack: "200ml", quantity: 200, dosage: "10ml twice daily after meals", usage: "Shake well before use. Take with lukewarm water." },
    { name: "Vitamin C Zinc Tablets", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet daily after meals", usage: "Swallow whole with water. Best taken in the morning." },
    { name: "Giloy Tablets", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet twice daily after meals", usage: "Swallow whole with water after meals." },
  ],
  "Respiratory Care": [
    { name: "Arsenic Iod 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Natrum Sulph 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Antimonium Tart 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Ipecac 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Respiratory Syrup", brand: "Dr. Kent", pack: "200ml", quantity: 200, dosage: "10ml three times daily after meals", usage: "Shake well before use. Take with lukewarm water." },
  ],
  "Stress & Sleep": [
    { name: "Coffea Cruda 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Passiflora 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water at bedtime", usage: "Take 30 minutes before bedtime. Avoid strong flavours." },
    { name: "Kali Phos 6X", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Ignatia Amara 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Stress Relief Drops", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Restful Sleep Syrup", brand: "Dr. Kent", pack: "200ml", quantity: 200, dosage: "10ml before bedtime", usage: "Take 30 minutes before bedtime. Shake well before use." },
  ],
  "Heart Care": [
    { name: "Crataegus 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Arjuna 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Spigelia 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Aurum Met 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Heart Care Drops", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "5-10 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Omega-3 Fish Oil Capsules", brand: "Dr. Kent", pack: "60 capsules", quantity: 60, dosage: "1 capsule twice daily after meals", usage: "Swallow whole with water after meals." },
  ],
  "Eye Care": [
    { name: "Euphrasia 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Ruta Grav 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Physostigma 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Eye Strain Relief Drops", brand: "Dr. Kent", pack: "15ml", quantity: 15, dosage: "1-2 drops in each eye, 2-3 times daily", usage: "Tilt head back, drop into eyes, and blink gently." },
    { name: "Vision Support Tablets", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet twice daily after meals", usage: "Swallow whole with water after meals." },
  ],
  "Dental Care": [
    { name: "Plantago 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Mercurius Sol 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Coffea Cruda 200C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 2 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Kreosotum 30C", brand: "Dr. Kent", pack: "30ml", quantity: 30, dosage: "3-5 drops in half cup water, 3 times daily", usage: "Take 15 minutes before meals. Avoid strong flavours." },
    { name: "Toothache Relief Drops", brand: "Dr. Kent", pack: "15ml", quantity: 15, dosage: "2-3 drops on cotton, apply to affected tooth", usage: "Apply on cotton ball and place on affected tooth." },
  ],
  "General Wellness": [
    { name: "Multivitamin Plus", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet daily after meals", usage: "Swallow whole with water. Best taken with breakfast." },
    { name: "Calcium Magnesium Plus", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet twice daily after meals", usage: "Swallow whole with water after meals." },
    { name: "Iron Folic Acid", brand: "Dr. Kent", pack: "60 tablets", quantity: 60, dosage: "1 tablet daily after meals", usage: "Swallow whole with water. Best taken with breakfast." },
    { name: "Zinc Selenium Capsules", brand: "Dr. Kent", pack: "60 capsules", quantity: 60, dosage: "1 capsule daily after meals", usage: "Swallow whole with water after meals." },
    { name: "Shilajit Gold", brand: "Dr. Kent", pack: "30 capsules", quantity: 30, dosage: "1 capsule twice daily with milk", usage: "Swallow whole with milk or warm water after meals." },
    { name: "Ashwagandha Capsules", brand: "Dr. Kent", pack: "60 capsules", quantity: 60, dosage: "1 capsule twice daily after meals", usage: "Swallow whole with water after meals." },
  ],
};

// ---------------------------------------------------------------------
// Generate category descriptions
// ---------------------------------------------------------------------
function generateCategoryDescriptions(catName) {
  const shortDescs = {
    "Fever": "Homeopathic remedies for fever management and body ache relief.",
    "Cold & Cough": "Natural cold and cough remedies for quick symptomatic relief.",
    "Allergy": "Effective homeopathic allergy relief for seasonal and environmental sensitivities.",
    "Skin Care": "Complete skin care range for acne, eczema, and glowing skin.",
    "Hair Care": "Homeopathic hair care solutions for hair fall and scalp health.",
    "Digestive Care": "Natural digestive remedies for acidity, bloating, and gut health.",
    "Women's Health": "Gentle homeopathic support for women's wellness at every stage.",
    "Children's Health": "Safe and gentle homeopathic remedies for children's health.",
    "Joint & Muscle Pain": "Effective pain relief remedies for joints, muscles, and back.",
    "Diabetes Care": "Natural homeopathic support for healthy blood sugar levels.",
    "Kidney Care": "Homeopathic remedies for urinary tract and kidney health.",
    "Liver Care": "Liver detox and digestive support with homeopathic remedies.",
    "Immunity": "Immunity boosters to strengthen your natural defence system.",
    "Respiratory Care": "Respiratory support for asthma, bronchitis, and breathing issues.",
    "Stress & Sleep": "Natural stress relief and sleep support remedies.",
    "Heart Care": "Cardiovascular wellness with homeopathic heart care remedies.",
    "Eye Care": "Eye care remedies for strain, dryness, and vision support.",
    "Dental Care": "Homeopathic dental care for healthy teeth and gums.",
    "General Wellness": "Everyday wellness supplements and daily health essentials.",
  };
  return shortDescs[catName] || "Homeopathic remedies for wellness.";
}

// ---------------------------------------------------------------------
// Build categories
// ---------------------------------------------------------------------
function buildCategories() {
  return CATEGORY_SPECS.map((spec, i) => {
    const id = makeObjectId("cat-" + spec.name);
    const slug = slugify(spec.name);
    return {
      _id: id,
      id: id,
      category_name: spec.name,
      slug: slug,
      icon: spec.icon,
      image: `/images/categories/${slug}.svg`,
      tagline: spec.tagline,
      description: spec.description,
      short_description: generateCategoryDescriptions(spec.name),
      productCount: (PRODUCT_TEMPLATES[spec.name] || []).length,
      isActive: true,
      sortOrder: i + 1,
      createdAt: iso(2024, 1, i + 1),
      updatedAt: iso(2025, 1, i + 1),
    };
  });
}

// ---------------------------------------------------------------------
// Build products
// ---------------------------------------------------------------------
function buildProducts(categories) {
  let id = 1;
  const products = [];
  const usedNames = new Set();
  const usedSlugs = new Set();

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.category_name] = c;
  });

  CATEGORY_SPECS.forEach((spec) => {
    const cat = catMap[spec.name];
    if (!cat) return;
    const templates = PRODUCT_TEMPLATES[spec.name] || [];
    templates.forEach((tpl, idx) => {
      const baseName = tpl.name;
      let name = baseName;
      let slug = slugify(name);
      let counter = 1;
      while (usedSlugs.has(slug)) {
        slug = slugify(name) + "-" + counter;
        counter++;
      }
      while (usedNames.has(name)) {
        name = baseName + " " + counter;
        counter++;
      }
      usedNames.add(name);
      usedSlugs.add(slug);

      const mrp = rand(180, 1299);
      const discountPct = rand(5, 35);
      const discountPrice = Math.round(mrp * (1 - discountPct / 100));
      const rating = randFloat(4.0, 5.0, 1);
      const reviews = rand(50, 9500);
      const stock = rand(15, 500);
      const isFeatured = idx === 0 || idx === 1;
      const isBestSeller = idx === 0 || idx === 3;
      const isNewArrival = idx === 2 || idx === 4;

      const benefits = generateBenefits(spec.name, tpl.name);
      const ingredients = generateIngredients(spec.name, tpl.name);
      const tags = [
        spec.name.toLowerCase(),
        "homeopathy",
        ...(isFeatured ? ["featured"] : []),
        ...(isBestSeller ? ["best-seller"] : []),
        ...(isNewArrival ? ["new-arrival"] : []),
        "ayurvedic",
        "natural",
      ];

      const shortDesc = `${spec.name} remedy: ${tpl.name}. ${spec.tagline}.`;
      const longDesc = `Dr. Kent ${tpl.name} is a premium homeopathic preparation for ${spec.name.toLowerCase()}. ${spec.description}. This remedy is prepared using the highest quality homeopathic dilutions and follows strict GMP guidelines. Suitable for all age groups and safe for long-term use. Always consult a qualified homeopathic practitioner for personalized advice.`;

      products.push({
        id: id,
        _id: makeObjectId("prod-" + name),
        product_name: name,
        slug: slug,
        brand: tpl.brand || "Dr. Kent",
        category: cat._id,
        category_name: spec.name,
        product_image: `/images/products/${slug}.svg`,
        short_description: shortDesc,
        detailed_description: longDesc,
        benefits: benefits,
        ingredients: ingredients,
        usage: typeof tpl.usage === "string" ? tpl.usage : tpl.usage.join(". "),
        dosage: tpl.dosage,
        pack: tpl.pack,
        quantity: tpl.quantity || 30,
        stock: stock,
        mrp_price: mrp,
        discount_price: discountPrice,
        discount_percentage: discountPct,
        rating: rating,
        reviews: reviews,
        featured: isFeatured,
        bestSeller: isBestSeller,
        newArrival: isNewArrival,
        isKentProduct: true,
        prescriptionRequired: false,
        tags: tags,
        createdAt: iso(2024, rand(1, 6), rand(1, 28)),
        updatedAt: iso(2025, rand(1, 3), rand(1, 28)),
      });
      id++;
    });
  });

  return products;
}

function generateBenefits(category, name) {
  const base = [
    "Supports natural healing process",
    "Gentle and non-invasive remedy",
    "Safe for all age groups",
    "No known side effects",
    "Complements conventional treatment",
  ];
  const catBenefits = {
    "Fever": ["Helps reduce body temperature naturally", "Supports immune response during fever", "Relieves associated body aches"],
    "Cold & Cough": ["Provides quick relief from cold symptoms", "Soothes dry and productive cough", "Clears nasal congestion naturally"],
    "Allergy": ["Reduces allergic reactions naturally", "Supports respiratory health against allergens", "Helps manage seasonal allergy symptoms"],
    "Skin Care": ["Promotes clear and healthy skin", "Reduces inflammation and redness", "Supports natural skin healing"],
    "Hair Care": ["Strengthens hair roots naturally", "Reduces hair fall and breakage", "Promotes healthy hair growth"],
    "Digestive Care": ["Improves digestive function naturally", "Relieves bloating and gas", "Supports healthy bowel movements"],
    "Women's Health": ["Supports hormonal balance naturally", "Relieves menstrual discomfort", "Promotes overall feminine wellness"],
    "Children's Health": ["Gentle and safe for children", "Supports healthy growth and development", "Boosts children's natural immunity"],
    "Joint & Muscle Pain": ["Provides natural pain relief", "Reduces joint inflammation", "Improves mobility and flexibility"],
    "Diabetes Care": ["Helps maintain healthy blood sugar", "Supports pancreatic function", "Complements diabetes management"],
    "Kidney Care": ["Supports healthy kidney function", "Helps maintain urinary tract health", "Promotes natural detoxification"],
    "Liver Care": ["Supports liver detoxification", "Promotes healthy liver function", "Aids in digestive wellness"],
    "Immunity": ["Strengthens natural immune system", "Increases resistance to infections", "Supports overall vitality"],
    "Respiratory Care": ["Supports healthy breathing", "Relieves respiratory discomfort", "Promotes lung health naturally"],
    "Stress & Sleep": ["Promotes restful sleep naturally", "Reduces stress and anxiety", "Calms the mind naturally"],
    "Heart Care": ["Supports cardiovascular health", "Helps maintain healthy cholesterol", "Promotes heart function naturally"],
    "Eye Care": ["Reduces eye strain naturally", "Supports healthy vision", "Relieves eye dryness and fatigue"],
    "Dental Care": ["Relieves toothache naturally", "Supports healthy gums", "Promotes oral hygiene"],
    "General Wellness": ["Supports daily nutritional needs", "Promotes overall vitality", "Enhances general well-being"],
  };
  return [...new Set([...base, ...(catBenefits[category] || [])])];
}

function generateIngredients(category) {
  const base = [
    "Purified water",
    "Medicated homeopathic dilution",
    "Sugar of milk (lactose) for trituration",
    "Ethanol (preservative)",
  ];
  const catIngredients = {
    "Fever": ["Belladonna extract", "Aconite extract", "Gelsemium extract", "Ferrum Phos 3X"],
    "Cold & Cough": ["Allium Cepa extract", "Drosera extract", "Hepar Sulph extract", "Spongia extract"],
    "Allergy": ["Histaminum 30C", "Natrum Mur 30C", "Sabadilla extract", "Apis Mellifica extract"],
    "Skin Care": ["Sulphur extract", "Graphites extract", "Calendula extract", "Berberis Aquifolium"],
    "Hair Care": ["Thuja extract", "Silicea 6X", "Biotin", "Lycopodium extract"],
    "Digestive Care": ["Nux Vomica extract", "Pulsatilla extract", "Carbo Veg extract", "Triphala extract"],
    "Women's Health": ["Sepia extract", "Pulsatilla extract", "Sabina extract", "Folic acid"],
    "Children's Health": ["Chamomilla extract", "Calcarea Phos", "Borax extract", "Vitamin D"],
    "Joint & Muscle Pain": ["Rhus Tox extract", "Bryonia extract", "Arnica Montana extract", "Ruta Grav extract"],
    "Diabetes Care": ["Uranium Nit extract", "Syzygium Jamb extract", "Phosphoric acid", "Cephalandra Ind"],
    "Kidney Care": ["Berberis Vulgaris extract", "Cantharis extract", "Solidago extract", "Lycopodium extract"],
    "Liver Care": ["Carduus Marianus extract", "Chelidonium extract", "Nux Vomica extract", "Podophyllum extract"],
    "Immunity": ["Arsenic Album 200C", "Tuberculinum 1M", "Influenzinum extract", "Vitamin C", "Zinc"],
    "Respiratory Care": ["Arsenic Iod extract", "Natrum Sulph extract", "Antimonium Tart extract", "Ipecac extract"],
    "Stress & Sleep": ["Coffea Cruda extract", "Passiflora extract", "Kali Phos 6X", "Ignatia Amara extract"],
    "Heart Care": ["Crataegus extract", "Arjuna extract", "Spigelia extract", "Omega-3 fatty acids"],
    "Eye Care": ["Euphrasia extract", "Ruta Grav extract", "Physostigma extract", "Vitamin A"],
    "Dental Care": ["Plantago extract", "Mercurius Sol extract", "Coffea Cruda extract", "Kreosotum extract"],
    "General Wellness": ["Multivitamin complex", "Calcium magnesium", "Zinc selenium", "Ashwagandha extract"],
  };
  return [...new Set([...base, ...(catIngredients[category] || [])])];
}

// ---------------------------------------------------------------------
// DOCTORS — 10 experienced homeopathic doctors
// ---------------------------------------------------------------------
function buildDoctors() {
  const template = [
    { name: "Dr. Ananya Sen", spec: "Homoeopathy Specialist", qual: "BHMS, MD (Hom.)", exp: 12, hosp: "Dr. Kent Wellness Clinic", fee: 499, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Experienced homeopathy specialist with 12 years of practice. Dedicated to providing holistic and personalized care to every patient." },
    { name: "Dr. Raj Mehta", spec: "Chronic Care Expert", qual: "BHMS, FCCA", exp: 10, hosp: "City Care Centre", fee: 399, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Expert in chronic disease management with 10 years of clinical experience. Specializes in long-term care plans." },
    { name: "Dr. Priya Roy", spec: "Women Wellness", qual: "BHMS, Women Health Specialist", exp: 8, hosp: "CarePlus Women Clinic", fee: 449, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Dedicated women's health specialist with 8 years of experience. Providing comprehensive wellness care for women." },
    { name: "Dr. Suman Ghosh", spec: "General Physician", qual: "MBBS, Family Medicine", exp: 14, hosp: "Central Health Hub", fee: 349, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Experienced general physician with 14 years in family medicine. Committed to accessible healthcare for all ages." },
    { name: "Dr. Nisha Kapoor", spec: "Dermatologist", qual: "MD, Skin and Aesthetic Care", exp: 9, hosp: "SkinCare Studio", fee: 599, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Board-certified dermatologist with 9 years of experience in medical and aesthetic dermatology." },
    { name: "Dr. Arjun Verma", spec: "Cardiologist", qual: "DM, Cardiac Care", exp: 16, hosp: "Heartline Hospital", fee: 699, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Senior cardiologist with 16 years of experience. Specializing in preventive cardiology and heart disease management." },
    { name: "Dr. Kavita Sharma", spec: "Pediatric Homeopathy", qual: "BHMS, MD (Pediatrics)", exp: 11, hosp: "Little Hearts Clinic", fee: 449, days: "Mon-Sat", time: "10:00 AM - 06:00 PM", about: "Specialist pediatric homeopath with 11 years of experience. Gentle and caring approach to children's health." },
    { name: "Dr. Vikram Patel", spec: "Respiratory Specialist", qual: "BHMS, FCCP", exp: 13, hosp: "BreathEasy Clinic", fee: 549, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Experienced respiratory care specialist with 13 years of expertise in managing asthma, bronchitis, and allergies." },
    { name: "Dr. Meera Krishnan", spec: "Stress & Sleep Therapy", qual: "BHMS, Clinical Psychology", exp: 7, hosp: "MindBody Wellness Center", fee: 399, days: "Mon-Sat", time: "10:00 AM - 04:00 PM", about: "Dedicated stress and sleep therapist with 7 years of experience. Combines homeopathy with lifestyle counseling." },
    { name: "Dr. Rohan Das", spec: "Joint & Muscle Specialist", qual: "BHMS, Orthopedic Rehab", exp: 15, hosp: "MoveFree Joint Clinic", fee: 599, days: "Mon-Sat", time: "09:00 AM - 05:00 PM", about: "Senior joint and muscle specialist with 15 years of experience. Expert in managing arthritis, back pain, and sports injuries." },
  ];
  return template.map((t, i) => {
    const id = makeObjectId("doc-" + t.name);
    const slug = slugify(t.name);
    return {
      _id: id,
      id: id,
      doctor_name: t.name,
      slug: slug,
      specialization: t.spec,
      qualification: t.qual,
      experience: t.exp,
      hospital: t.hosp,
      consultation_fee: t.fee,
      offer_fee: 0,
      available_days: t.days,
      available_time: t.time,
      image: `/images/doctors/${slug}.svg`,
      about: t.about,
      averageRating: Number((4.5 + Math.random() * 0.5).toFixed(1)),
      totalReviews: rand(500, 8500),
      languages: i % 2 === 0 ? "English, Hindi, Bengali" : "English, Hindi",
      availableToday: i % 3 !== 0,
      isActive: true,
      createdAt: iso(2024, rand(1, 6), rand(1, 28)),
      updatedAt: iso(2025, rand(1, 3), rand(1, 28)),
    };
  });
}

// ---------------------------------------------------------------------
// LAB TESTS — individual tests + health packages
// ---------------------------------------------------------------------
function buildLabTests() {
  const tests = [
    { id: "cbc", cat: "Hematology", name: "Complete Blood Count (CBC)", desc: "Essential screening for blood cells and overall health.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Flat ₹100 Off", original: 499, discounted: 399, icon: "🩸" },
    { id: "thyroid", cat: "Endocrinology", name: "Thyroid Profile (T3, T4, TSH)", desc: "Helps evaluate thyroid function and related disorders.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save 20%", original: 999, discounted: 799, icon: "🧠" },
    { id: "diabetes", cat: "Metabolic", name: "Diabetes Screening (FBS, PPBS, HbA1c)", desc: "Track sugar levels with reliable lab diagnostics.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Limited Offer", original: 799, discounted: 599, icon: "🍬" },
    { id: "lipid", cat: "Cardiology", name: "Lipid Profile", desc: "Measures cholesterol and triglycerides for heart health.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save ₹150", original: 899, discounted: 749, icon: "❤️" },
    { id: "vitd", cat: "Nutrients", name: "Vitamin D (25-OH)", desc: "Assess vitamin D levels for bone and immunity health.", reportTime: "48–72 hrs", homeCollection: "Yes", badge: "Flat ₹120 Off", original: 1299, discounted: 1179, icon: "☀️" },
    { id: "vitb12", cat: "Nutrients", name: "Vitamin B12", desc: "Check B12 levels for energy, nerve health, and metabolism.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save 15%", original: 899, discounted: 764, icon: "💊" },
    { id: "lft", cat: "Liver", name: "Liver Function Test (LFT)", desc: "Check liver enzymes and function for early detection.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save 15%", original: 899, discounted: 764, icon: "🧪" },
    { id: "kft", cat: "Kidney", name: "Kidney Function Test (KFT)", desc: "Helps assess kidney health and filtering capacity.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Limited Offer", original: 999, discounted: 849, icon: "🩺" },
    { id: "iron", cat: "Hematology", name: "Iron Studies (Fe, TIBC, Ferritin)", desc: "Evaluate iron stores and detect anemia.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save ₹100", original: 699, discounted: 599, icon: "🩸" },
    { id: "ua", cat: "Metabolic", name: "Uric Acid Test", desc: "Helps diagnose gout and monitor kidney function.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Flat ₹50 Off", original: 399, discounted: 349, icon: "🦴" },
    { id: "ecg", cat: "Cardiology", name: "ECG (Electrocardiogram)", desc: "Records electrical activity of the heart for diagnosis.", reportTime: "2–4 hrs", homeCollection: "Yes", badge: "Limited Offer", original: 599, discounted: 499, icon: "❤️" },
    { id: "pcr", cat: "Infectious", name: "Covid RT-PCR", desc: "Accurate RT-PCR testing for COVID-19.", reportTime: "12–24 hrs", homeCollection: "Yes", badge: "Fast Results", original: 1999, discounted: 1599, icon: "🦠" },
    { id: "dengue", cat: "Infectious", name: "Dengue NS1 Antigen", desc: "Early detection of dengue virus infection.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save 20%", original: 1199, discounted: 959, icon: "🦟" },
    { id: "malaria", cat: "Infectious", name: "Malaria Antigen Test", desc: "Rapid detection of malaria parasites.", reportTime: "12–24 hrs", homeCollection: "Yes", badge: "Flat ₹80 Off", original: 499, discounted: 419, icon: "🦟" },
    { id: "hba1c", cat: "Metabolic", name: "HbA1c (Glycated Hemoglobin)", desc: "Monitor average blood sugar over 3 months.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save 15%", original: 699, discounted: 594, icon: "🍬" },
    { id: "crp", cat: "Inflammatory", name: "C-Reactive Protein (CRP)", desc: "Detects inflammation in the body.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Limited Offer", original: 599, discounted: 499, icon: "🔬" },
    { id: "esr", cat: "Hematology", name: "ESR (Erythrocyte Sedimentation Rate)", desc: "Helps detect inflammatory conditions.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Flat ₹50 Off", original: 299, discounted: 249, icon: "🩸" },
    { id: "calcium", cat: "Nutrients", name: "Serum Calcium", desc: "Assess calcium levels for bone and nerve health.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Save 10%", original: 399, discounted: 359, icon: "🦴" },
    { id: "magnesium", cat: "Nutrients", name: "Serum Magnesium", desc: "Check magnesium levels for muscle and nerve function.", reportTime: "24–48 hrs", homeCollection: "Yes", badge: "Flat ₹60 Off", original: 449, discounted: 389, icon: "💪" },
    { id: "allergy", cat: "Immunology", name: "Allergy Panel (Food & Inhalant)", desc: "Identifies common allergens causing reactions.", reportTime: "72–96 hrs", homeCollection: "Yes", badge: "Premium", original: 2499, discounted: 1999, icon: "🌸" },
  ];

  const packages = [
    { id: "fullbody", name: "Full Body Checkup - Essential", tests: 42, suitable: "Adults looking for a complete baseline check.", fasting: "8–10 hours", homeSample: "Yes", reportDelivery: "24–72 hrs", original: 2999, discounted: 2399, save: 600, mostPopular: true },
    { id: "diabetes", name: "Diabetes & Metabolic Care", tests: 18, suitable: "For sugar monitoring and metabolic risk.", fasting: "6–8 hours", homeSample: "Yes", reportDelivery: "24–48 hrs", original: 1899, discounted: 1499, save: 400, mostPopular: false },
    { id: "thyroid", name: "Thyroid Wellness Package", tests: 14, suitable: "Evaluate thyroid hormones and support health.", fasting: "No fasting required", homeSample: "Yes", reportDelivery: "24–48 hrs", original: 1599, discounted: 1299, save: 300, mostPopular: false },
    { id: "heart", name: "Heart Health Screening", tests: 20, suitable: "Cholesterol and cardiovascular risk assessment.", fasting: "8–10 hours", homeSample: "Yes", reportDelivery: "24–48 hrs", original: 2199, discounted: 1799, save: 400, mostPopular: false },
    { id: "women", name: "Women's Wellness Package", tests: 28, suitable: "Comprehensive health screening for women.", fasting: "8–10 hours", homeSample: "Yes", reportDelivery: "24–48 hrs", original: 2599, discounted: 2099, save: 500, mostPopular: false },
    { id: "child", name: "Child Health Checkup", tests: 22, suitable: "Essential health screening for children aged 2-12.", fasting: "6–8 hours", homeSample: "Yes", reportDelivery: "24–48 hrs", original: 1399, discounted: 1099, save: 300, mostPopular: false },
  ];

  return {
    lab_tests: tests.map((t) => ({
      _id: makeObjectId("lab-" + t.id),
      id: t.id,
      test_name: t.name,
      test_slug: slugify(t.name),
      category: t.cat,
      description: t.desc,
      report_time: t.reportTime,
      home_collection: t.homeCollection,
      discount_badge: t.badge,
      mrp_price: t.original,
      discount_price: t.discounted,
      discount_percentage: Math.round((1 - t.discounted / t.original) * 100),
      icon: t.icon,
      rating: randFloat(4.3, 5.0, 1),
      reviews: rand(200, 8000),
      isActive: true,
      createdAt: iso(2024, rand(1, 6), rand(1, 28)),
      updatedAt: iso(2025, rand(1, 3), rand(1, 28)),
    })),
    packages: packages.map((p) => ({
      _id: makeObjectId("pkg-" + p.id),
      id: p.id,
      package_name: p.name,
      package_slug: slugify(p.name),
      tests_included: p.tests,
      suitable_for: p.suitable,
      fasting: p.fasting,
      home_sample: p.homeSample,
      report_delivery: p.reportDelivery,
      mrp_price: p.original,
      discount_price: p.discounted,
      discount_percentage: Math.round((1 - p.discounted / p.original) * 100),
      save_amount: p.save,
      most_popular: p.mostPopular,
      rating: randFloat(4.4, 5.0, 1),
      reviews: rand(150, 6000),
      isActive: true,
      createdAt: iso(2024, rand(1, 6), rand(1, 28)),
      updatedAt: iso(2025, rand(1, 3), rand(1, 28)),
    })),
  };
}

// ---------------------------------------------------------------------
// Generate SVG image assets
// ---------------------------------------------------------------------
function generateImages(categories, products, doctors) {
  console.log("  Generating SVG images...");

  // Category images
  categories.forEach((cat, i) => {
    const filePath = path.join(CATEGORY_IMG_DIR, cat.slug + ".svg");
    svgAsset(filePath, cat.category_name, cat.tagline, cat.icon, i);
  });

  // Product images
  products.forEach((prod, i) => {
    const filePath = path.join(PRODUCT_IMG_DIR, prod.slug + ".svg");
    const emoji = CATEGORY_SPECS.find((c) => c.name === prod.category_name)?.icon || "💚";
    svgAsset(filePath, prod.product_name, prod.brand, emoji, i);
  });

  // Doctor images
  doctors.forEach((doc, i) => {
    const filePath = path.join(DOCTOR_IMG_DIR, doc.slug + ".svg");
    svgAsset(filePath, doc.doctor_name, doc.specialization, "👨‍⚕️", i);
  });

  console.log("  ✓ Generated " + (categories.length + products.length + doctors.length) + " SVG images");
}

// ---------------------------------------------------------------------
// Write JSON files
// ---------------------------------------------------------------------
function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  ensureDir(DATA_DIR);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log("  ✓ Wrote " + filePath);
}

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------
function validateData(products, categories, doctors, labTests) {
  console.log("\n  Validating generated data...");
  let errors = [];

  // Validate products
  const prodIds = products.map((p) => p.id);
  const prodNames = products.map((p) => p.product_name);
  const prodSlugs = products.map((p) => p.slug);
  const prodUniqueIds = new Set(prodIds);
  const prodUniqueNames = new Set(prodNames);
  const prodUniqueSlugs = new Set(prodSlugs);

  if (prodIds.length !== prodUniqueIds.size) errors.push("Duplicate product IDs found!");
  if (prodNames.length !== prodUniqueNames.size) errors.push("Duplicate product names found!");
  if (prodSlugs.length !== prodUniqueSlugs.size) errors.push("Duplicate product slugs found!");

  products.forEach((p) => {
    if (p.discount_price > p.mrp_price) errors.push(`Product ${p.product_name}: discount_price > mrp_price`);
    if (p.discount_percentage > 99) errors.push(`Product ${p.product_name}: discount_percentage > 99%`);
    if (p.rating < 4.0 || p.rating > 5.0) errors.push(`Product ${p.product_name}: rating out of range (${p.rating})`);
    if (!p._id) errors.push(`Product ${p.product_name}: missing _id`);
    if (!p.product_name) errors.push("Product missing name");
    if (!p.slug) errors.push(`Product ${p.product_name}: missing slug`);
    if (!p.category) errors.push(`Product ${p.product_name}: missing category`);
    if (!p.product_image) errors.push(`Product ${p.product_name}: missing product_image`);
    if (!p.short_description) errors.push(`Product ${p.product_name}: missing short_description`);
    if (!p.detailed_description) errors.push(`Product ${p.product_name}: missing detailed_description`);
    if (!Array.isArray(p.benefits)) errors.push(`Product ${p.product_name}: benefits not array`);
    if (!Array.isArray(p.ingredients)) errors.push(`Product ${p.product_name}: ingredients not array`);
    if (!Array.isArray(p.tags)) errors.push(`Product ${p.product_name}: tags not array`);
    if (!p.dosage) errors.push(`Product ${p.product_name}: missing dosage`);
    if (!p.usage) errors.push(`Product ${p.product_name}: missing usage`);
    if (!p.pack) errors.push(`Product ${p.product_name}: missing pack`);
    if (p.stock < 0) errors.push(`Product ${p.product_name}: negative stock`);
    if (p.mrp_price <= 0) errors.push(`Product ${p.product_name}: invalid mrp_price`);
    if (p.discount_price <= 0) errors.push(`Product ${p.product_name}: invalid discount_price`);
  });

  // Validate categories
  const catNames = categories.map((c) => c.category_name);
  const catUniqueNames = new Set(catNames);
  if (catNames.length !== catUniqueNames.size) errors.push("Duplicate category names found!");

  // Validate doctors
  const docNames = doctors.map((d) => d.doctor_name);
  const docUniqueNames = new Set(docNames);
  if (docNames.length !== docUniqueNames.size) errors.push("Duplicate doctor names found!");

  // Validate lab tests
  if (labTests.lab_tests && labTests.packages) {
    const labNames = labTests.lab_tests.map((t) => t.test_name);
    const labUniqueNames = new Set(labNames);
    if (labNames.length !== labUniqueNames.size) errors.push("Duplicate lab test names found!");
  }

  if (errors.length === 0) {
    console.log("  ✓ All validations passed! No errors found.");
  } else {
    console.log("  ✗ Validation errors found:");
    errors.forEach((e) => console.log("    - " + e));
  }

  return errors.length === 0;
}

// ---------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------
function main() {
  console.log("\n============================================");
  console.log("  Dr. Kent Homeopathy — Catalog Generator");
  console.log("============================================\n");

  // Step 1: Build categories
  console.log("  [1/5] Building categories...");
  const categories = buildCategories();
  console.log("  ✓ " + categories.length + " categories built");

  // Step 2: Build products
  console.log("\n  [2/5] Building products...");
  const products = buildProducts(categories);
  console.log("  ✓ " + products.length + " products built");

  // Step 3: Build doctors
  console.log("\n  [3/5] Building doctors...");
  const doctors = buildDoctors();
  console.log("  ✓ " + doctors.length + " doctors built");

  // Step 4: Build lab tests
  console.log("\n  [4/5] Building lab tests...");
  const labTests = buildLabTests();
  console.log("  ✓ " + labTests.lab_tests.length + " lab tests + " + labTests.packages.length + " packages built");

  // Step 5: Generate images
  console.log("\n  [5/5] Generating image assets...");
  generateImages(categories, products, doctors);

  // Write JSON files
  console.log("\n  Writing JSON files...");
  writeJSON("categories.json", categories);
  writeJSON("products.json", products);
  writeJSON("doctors.json", doctors);
  writeJSON("labtests.json", labTests);

  // Validate
  console.log("\n  Running validation...");
  const valid = validateData(products, categories, doctors, labTests);

  // Summary
  console.log("\n============================================");
  console.log("  GENERATION SUMMARY");
  console.log("============================================");
  console.log("  Categories:  " + categories.length);
  console.log("  Products:    " + products.length);
  console.log("  Doctors:     " + doctors.length);
  console.log("  Lab Tests:   " + labTests.lab_tests.length);
  console.log("  Packages:    " + labTests.packages.length);
  console.log("  Valid:       " + (valid ? "✓ YES" : "✗ NO"));
  console.log("============================================\n");

  if (!valid) {
    process.exit(1);
  }
}

main();
