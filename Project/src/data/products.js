/**
 * Static product catalog used by the Home category sliders.
 * These are decorative samples — the production data is fetched from the API.
 * Image URLs use a stable healthcare-friendly source.
 */

const placeholder = (q) =>
  `https://images.unsplash.com/${q}?q=80&w=600&auto=format&fit=crop`;

// Curated unsplash images (medicine, pharmacy, wellness feel)
const img = {
  she: placeholder("photo-1587854692152-cbe660dbde88"),
  diab: placeholder("photo-1576091160550-2173dba999ef"),
  cholesterol: placeholder("photo-1631549916768-4119b2e5f926"),
  shape: placeholder("photo-1559757148-5c350d0d3c56"),
  liver: placeholder("photo-1584308666744-24d5c474f2ae"),
  heart: placeholder("photo-1532938911079-1b06ac7ceec7"),
  vitamin: placeholder("photo-1550572017-edd951b55104"),
  child: placeholder("photo-1607619056574-7b8d3ee536b2"),
  women: placeholder("photo-1559757175-5700dde675bc"),
  skin: placeholder("photo-1571781926291-c477ebfd024b"),
  digest: placeholder("photo-1471864190281-a93a3070b6de"),
  immune: placeholder("photo-1607619056574-7b8d3ee536b2"),
  pain: placeholder("photo-1551601651-2a8555f1a136"),
  adult: placeholder("photo-1587854692152-cbe660dbde88"),
  supplement: placeholder("photo-1607619056574-7b8d3ee536b2"),
};

const make = (id, name, price, oldPrice, rating, reviews, image, opts = {}) => ({
  id,
  name,
  price,
  oldPrice,
  rating,
  reviews,
  image,
  discount: opts.discount || "Save ₹" + (oldPrice - price),
  badge: opts.badge,
});

export const featuredProducts = [
  make(1, "She Care Juice", 541, 543, 4.9, 8921, img.she, { badge: "Bestseller" }),
  make(2, "Diabetic Care Juice", 457, 459, 4.8, 8335, img.diab),
  make(3, "Cholesterol Care", 560, 562, 5.0, 6398, img.cholesterol, { badge: "New" }),
  make(4, "Shapefix Juice", 476, 478, 4.8, 7432, img.shape),
  make(5, "Liver Wellness", 599, 649, 4.9, 5911, img.liver, { discount: "Save ₹50" }),
  make(6, "Heart Care Drops", 489, 520, 4.7, 4123, img.heart),
  make(7, "Multivitamin Plus", 699, 799, 4.8, 9821, img.vitamin, { discount: "Save ₹100" }),
];

export const adultsMedicine = [
  make(101, "Adult Daily Multivitamin", 599, 699, 4.8, 12032, img.vitamin, { discount: "Save ₹100" }),
  make(102, "Calcium Plus Tablet", 349, 399, 4.7, 8821, img.adult),
  make(103, "Omega-3 Fish Oil", 749, 899, 4.9, 6543, img.heart, { discount: "Save ₹150" }),
  make(104, "Iron Supplement", 289, 349, 4.6, 5432, img.adult),
  make(105, "B-Complex Forte", 199, 249, 4.5, 4321, img.vitamin),
  make(106, "Adult Probiotic", 549, 649, 4.8, 3210, img.digest, { badge: "Bestseller" }),
  make(107, "Zinc & Selenium", 329, 399, 4.7, 2876, img.adult),
];

export const childrenMedicine = [
  make(201, "Kids Multivitamin Gummies", 449, 549, 4.9, 9876, img.child, { badge: "Bestseller" }),
  make(202, "Children's Cough Syrup", 199, 249, 4.7, 7654, img.child),
  make(203, "Kids Probiotic Drops", 349, 399, 4.8, 5432, img.child),
  make(204, "Calcium for Kids", 279, 329, 4.6, 4321, img.child, { discount: "Save ₹50" }),
  make(205, "Immunity Mix for Kids", 389, 449, 4.8, 6543, img.immune),
  make(206, "Kids Eye Health", 329, 399, 4.5, 3210, img.child),
];

export const diabetesCare = [
  make(301, "Diabetic Care Juice", 457, 599, 4.8, 8335, img.diab, { badge: "Bestseller" }),
  make(302, "Sugar Balance Drops", 549, 649, 4.7, 4321, img.diab),
  make(303, "Diabetic Multivitamin", 699, 799, 4.9, 3210, img.diab, { discount: "Save ₹100" }),
  make(304, "Chromium Picolinate", 449, 549, 4.6, 2876, img.diab),
  make(305, "Bitter Gourd Capsules", 379, 449, 4.7, 1987, img.diab),
  make(306, "Cinnamon Extract", 299, 399, 4.5, 1654, img.diab, { discount: "Save ₹100" }),
];

export const heartCare = [
  make(401, "Cholesterol Care", 560, 649, 5.0, 6398, img.cholesterol, { badge: "Top Rated" }),
  make(402, "Omega-3 Fish Oil", 749, 899, 4.9, 5432, img.heart, { discount: "Save ₹150" }),
  make(403, "CoQ10 Capsules", 899, 1099, 4.8, 3210, img.heart),
  make(404, "Arjuna Cardio Tonic", 399, 499, 4.7, 2876, img.heart),
  make(405, "BP Wellness Drops", 479, 579, 4.6, 1987, img.heart, { discount: "Save ₹100" }),
  make(406, "Garlic Extract", 249, 329, 4.5, 1654, img.heart),
];

export const womenWellness = [
  make(501, "She Care Juice", 541, 649, 4.9, 8921, img.she, { badge: "Bestseller" }),
  make(502, "Women's Iron Plus", 379, 449, 4.8, 5432, img.women),
  make(503, "Calcium & Vitamin D3", 449, 549, 4.7, 4321, img.women, { discount: "Save ₹100" }),
  make(504, "Folic Acid Daily", 199, 249, 4.6, 3210, img.women),
  make(505, "Shapefix Juice", 476, 549, 4.8, 7432, img.shape, { badge: "New" }),
  make(506, "PCOS Wellness Mix", 599, 749, 4.7, 2876, img.women, { discount: "Save ₹150" }),
];

export const skinCare = [
  make(601, "Glow Skin Serum", 699, 899, 4.8, 6543, img.skin, { badge: "Bestseller" }),
  make(602, "Acne Care Cream", 349, 449, 4.7, 4321, img.skin),
  make(603, "Vitamin E Capsules", 449, 549, 4.9, 5432, img.skin, { discount: "Save ₹100" }),
  make(604, "Anti-Aging Cream", 899, 1199, 4.8, 3210, img.skin, { badge: "Premium" }),
  make(605, "Sunscreen SPF 50", 549, 699, 4.7, 2876, img.skin),
  make(606, "Skin Detox Mix", 379, 449, 4.6, 1987, img.skin, { discount: "Save ₹70" }),
];

export const digestiveCare = [
  make(701, "Digestive Enzyme Drops", 399, 499, 4.8, 5432, img.digest, { badge: "Bestseller" }),
  make(702, "Probiotic Capsules", 549, 699, 4.9, 4321, img.digest, { discount: "Save ₹150" }),
  make(703, "Constipation Relief", 299, 379, 4.7, 3210, img.digest),
  make(704, "Acidity Care Syrup", 249, 329, 4.6, 2876, img.digest),
  make(705, "Liver Wellness", 599, 699, 4.8, 5911, img.liver, { badge: "Top Rated" }),
  make(706, "Triphala Powder", 199, 249, 4.7, 1987, img.digest, { discount: "Save ₹50" }),
];

export const immunityBoosters = [
  make(801, "Immunity Mix Daily", 449, 549, 4.9, 6543, img.immune, { badge: "Bestseller" }),
  make(802, "Vitamin C Chewable", 249, 299, 4.8, 5432, img.immune),
  make(803, "Giloy Tablets", 199, 249, 4.7, 4321, img.immune, { discount: "Save ₹50" }),
  make(804, "Elderberry Extract", 549, 699, 4.8, 3210, img.immune),
  make(805, "Ashwagandha Capsules", 399, 499, 4.9, 7654, img.immune, { badge: "Popular" }),
  make(806, "Zinc + Vitamin D3", 349, 449, 4.6, 2876, img.immune, { discount: "Save ₹100" }),
];

export const painRelief = [
  make(901, "Pain Relief Oil", 299, 399, 4.8, 5432, img.pain, { badge: "Bestseller" }),
  make(902, "Joint Care Capsules", 499, 599, 4.7, 4321, img.pain, { discount: "Save ₹100" }),
  make(903, "Muscle Relief Spray", 349, 449, 4.6, 3210, img.pain),
  make(904, "Arthritis Care Mix", 599, 749, 4.8, 2876, img.pain, { badge: "New" }),
  make(905, "Back Pain Drops", 379, 449, 4.7, 1987, img.pain),
  make(906, "Headache Roll-On", 199, 249, 4.5, 1654, img.pain, { discount: "Save ₹50" }),
];

export const vitaminsSupplements = [
  make(1001, "Multivitamin Plus", 699, 899, 4.9, 9821, img.vitamin, { badge: "Bestseller" }),
  make(1002, "Vitamin D3 60K", 199, 249, 4.8, 8765, img.vitamin),
  make(1003, "Vitamin B12 Drops", 349, 449, 4.7, 6543, img.vitamin, { discount: "Save ₹100" }),
  make(1004, "Biotin Hair Skin", 449, 549, 4.8, 5432, img.vitamin),
  make(1005, "Magnesium Glycinate", 549, 699, 4.9, 4321, img.vitamin, { badge: "Premium" }),
  make(1006, "Vitamin K2 + D3", 599, 749, 4.7, 3210, img.vitamin, { discount: "Save ₹150" }),
  make(1007, "Evening Primrose Oil", 449, 549, 4.6, 2876, img.vitamin),
];

export const allCategories = [
  { id: "adults", title: "Adults Medicine", subtitle: "Daily health essentials", products: adultsMedicine },
  { id: "children", title: "Children Medicine", subtitle: "Gentle care for kids", products: childrenMedicine },
  { id: "diabetes", title: "Diabetes Care", subtitle: "Manage sugar naturally", products: diabetesCare },
  { id: "heart", title: "Heart Care", subtitle: "Cardio wellness range", products: heartCare },
  { id: "women", title: "Women's Wellness", subtitle: "Health, beauty & balance", products: womenWellness },
  { id: "skin", title: "Skin Care", subtitle: "Glow from within", products: skinCare },
  { id: "digest", title: "Digestive Care", subtitle: "Better gut, better life", products: digestiveCare },
  { id: "immune", title: "Immunity Boosters", subtitle: "Stay strong every day", products: immunityBoosters },
  { id: "pain", title: "Pain Relief", subtitle: "Move freely, live fully", products: painRelief },
  { id: "vitamins", title: "Vitamins & Supplements", subtitle: "Daily nutrition made easy", products: vitaminsSupplements },
];
