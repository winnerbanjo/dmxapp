/**
 * Comprehensive Harmonized System (HS) Tariff Code directory and auto-detection engine
 * Designed for DHL Express customs clearance and international air cargo.
 */

export interface HsCodeItem {
  code: string;
  name: string;
  category: string;
  description: string;
  keywords: string[];
}

export const POPULAR_HS_CATEGORIES = [
  {
    id: "clothing",
    name: "Clothes & Apparel",
    code: "6204.42",
    icon: "👗",
    sampleDescription: "Cotton clothing, dresses & apparel",
  },
  {
    id: "shoes",
    name: "Shoes & Footwear",
    code: "6403.99",
    icon: "👞",
    sampleDescription: "Leather & sports footwear, sneakers",
  },
  {
    id: "bags",
    name: "Bags & Leather",
    code: "4202.22",
    icon: "👜",
    sampleDescription: "Handbags, backpacks & travel luggage",
  },
  {
    id: "electronics",
    name: "Phones & Gadgets",
    code: "8517.13",
    icon: "📱",
    sampleDescription: "Smartphones, tablets & accessories",
  },
  {
    id: "food",
    name: "Foodstuffs & Dry Goods",
    code: "2106.90",
    icon: "🍲",
    sampleDescription: "Dried food provisions, spices & flours",
  },
  {
    id: "cosmetics",
    name: "Cosmetics & Skincare",
    code: "3304.99",
    icon: "💄",
    sampleDescription: "Beauty creams, lotions & perfumes",
  },
  {
    id: "wigs",
    name: "Hair & Wigs",
    code: "6704.20",
    icon: "💇",
    sampleDescription: "Human hair wigs, weaves & extensions",
  },
  {
    id: "documents",
    name: "Documents & Books",
    code: "4901.99",
    icon: "📄",
    sampleDescription: "Printed matter, books & legal documents",
  },
  {
    id: "jewelry",
    name: "Jewelry & Watches",
    code: "7117.90",
    icon: "💍",
    sampleDescription: "Fashion jewelry, beads & wristwatches",
  },
];

export const HS_DATABASE: HsCodeItem[] = [
  // Clothing & Apparel
  {
    code: "6109.10",
    name: "T-Shirts & Tops (Knitted)",
    category: "Clothing & Apparel",
    description: "T-shirts, singlets and casual tops, knitted or crocheted cotton",
    keywords: ["cloth", "clothes", "clothing", "tshirt", "t-shirt", "top", "tee", "polo", "vest", "singlet", "jersey"],
  },
  {
    code: "6204.42",
    name: "Dresses & Skirts",
    category: "Clothing & Apparel",
    description: "Women's or girls' dresses, skirts and gowns, woven cotton",
    keywords: ["cloth", "clothes", "dress", "gown", "skirt", "maxi", "midi", "evening dress", "women wear"],
  },
  {
    code: "6203.42",
    name: "Trousers & Jeans",
    category: "Clothing & Apparel",
    description: "Men's and boys' trousers, chinos, breeches and jeans of cotton",
    keywords: ["cloth", "clothes", "trouser", "pants", "jeans", "chinos", "cargo", "shorts"],
  },
  {
    code: "6205.20",
    name: "Shirts (Woven)",
    category: "Clothing & Apparel",
    description: "Men's or boys' formal and casual button-up shirts of cotton",
    keywords: ["cloth", "clothes", "shirt", "button up", "formal shirt", "office wear"],
  },
  {
    code: "5208.52",
    name: "African Print Fabrics (Ankara / Lace / Aso-Oke)",
    category: "Clothing & Apparel",
    description: "Printed woven cotton fabric, African wax print (Ankara), lace and traditional textiles",
    keywords: ["cloth", "ankara", "lace", "fabric", "textile", "aso oke", "material", "wax print", "wrapper"],
  },
  {
    code: "6211.42",
    name: "Traditional Garments / Native Attire",
    category: "Clothing & Apparel",
    description: "Traditional African garments, Kaftan, Agbada, Buba and native apparel",
    keywords: ["cloth", "native", "kaftan", "agbada", "senator", "buba", "traditional wear", "cultural attire"],
  },
  {
    code: "6201.40",
    name: "Jackets & Hoodies",
    category: "Clothing & Apparel",
    description: "Overcoats, car-coats, capes, cloaks, anoraks, wind-jackets, hoodies",
    keywords: ["cloth", "jacket", "hoodie", "coat", "sweater", "cardigan", "sweatshirt", "blazer"],
  },
  {
    code: "6212.10",
    name: "Undergarments & Lingerie",
    category: "Clothing & Apparel",
    description: "Brassieres, girdles, corsets, braces, suspenders and similar articles",
    keywords: ["cloth", "underwear", "bra", "lingerie", "boxers", "briefs", "panties"],
  },

  // Footwear & Shoes
  {
    code: "6403.99",
    name: "Leather Shoes & Loafers",
    category: "Footwear & Shoes",
    description: "Footwear with outer soles of rubber/plastics and leather uppers",
    keywords: ["shoe", "shoes", "leather shoe", "loafers", "brogues", "oxford", "formal shoes", "heels", "boots"],
  },
  {
    code: "6404.11",
    name: "Sneakers & Athletic Shoes",
    category: "Footwear & Shoes",
    description: "Sports footwear, tennis shoes, basketball shoes, sneakers with rubber soles",
    keywords: ["shoe", "shoes", "sneaker", "sneakers", "trainers", "running shoes", "kicks", "athletic shoes"],
  },
  {
    code: "6402.99",
    name: "Sandals & Slippers",
    category: "Footwear & Shoes",
    description: "Slide sandals, flip-flops, slippers with rubber or plastic soles",
    keywords: ["shoe", "sandals", "slippers", "slides", "flip flops", "crocs"],
  },

  // Bags & Luggage
  {
    code: "4202.22",
    name: "Handbags & Crossbody Bags",
    category: "Bags & Luggage",
    description: "Handbags with outer surface of sheeting of plastics or textile materials",
    keywords: ["bag", "bags", "handbag", "purse", "clutch", "tote", "crossbody"],
  },
  {
    code: "4202.12",
    name: "Backpacks & Travel Suitcases",
    category: "Bags & Luggage",
    description: "Trunks, suitcases, vanity cases, executive-cases, backpacks and traveling bags",
    keywords: ["bag", "backpack", "suitcase", "luggage", "travel bag", "duffel", "briefcase"],
  },
  {
    code: "4203.30",
    name: "Leather Belts",
    category: "Bags & Luggage",
    description: "Belts and bandoliers of leather or composition leather",
    keywords: ["belt", "leather belt", "waist belt"],
  },

  // Electronics & Gadgets
  {
    code: "8517.13",
    name: "Smartphones & Mobile Phones",
    category: "Electronics",
    description: "Smartphones and other cellular mobile phones",
    keywords: ["phone", "smartphone", "iphone", "samsung", "android", "cellphone", "mobile phone"],
  },
  {
    code: "8471.30",
    name: "Laptops & Tablets",
    category: "Electronics",
    description: "Portable automatic data processing machines (Laptops, MacBooks, iPads, Tablets)",
    keywords: ["laptop", "macbook", "computer", "tablet", "ipad", "notebook", "pc"],
  },
  {
    code: "8504.40",
    name: "Chargers & Power Banks",
    category: "Electronics",
    description: "Static converters, power adapters, phone chargers, power banks",
    keywords: ["charger", "power bank", "adapter", "cable", "usb cable"],
  },
  {
    code: "8518.30",
    name: "Headphones & Earphones",
    category: "Electronics",
    description: "Headphones and earphones, whether or not combined with a microphone (AirPods)",
    keywords: ["headphone", "earphone", "airpods", "earbuds", "headset"],
  },
  {
    code: "8528.52",
    name: "Monitors & Displays",
    category: "Electronics",
    description: "Computer monitors capable of directly connecting to processing machines",
    keywords: ["monitor", "screen", "display", "tv screen"],
  },

  // Cosmetics & Perfumery
  {
    code: "3303.00",
    name: "Perfumes & Fragrances",
    category: "Cosmetics & Beauty",
    description: "Perfumes and toilet waters (Eau de Parfum / Eau de Toilette)",
    keywords: ["perfume", "fragrance", "cologne", "body spray", "scent", "eau de parfum"],
  },
  {
    code: "3304.99",
    name: "Skincare Lotions & Creams",
    category: "Cosmetics & Beauty",
    description: "Beauty or make-up preparations, body lotions, face creams, serums",
    keywords: ["lotion", "cream", "skincare", "serum", "moisturizer", "sunscreen", "body butter", "cosmetics"],
  },
  {
    code: "3305.90",
    name: "Hair Care & Oils",
    category: "Cosmetics & Beauty",
    description: "Hair preparations, oils, shampoos, conditioners and treatments",
    keywords: ["hair oil", "shampoo", "conditioner", "hair cream", "pomade"],
  },

  // Hair, Wigs & Extensions
  {
    code: "6704.20",
    name: "Human Hair Wigs & Weaves",
    category: "Hair & Beauty",
    description: "Wigs, hair pieces and extensions of human hair",
    keywords: ["wig", "wigs", "hair", "human hair", "weave", "closure", "frontal", "bundle"],
  },
  {
    code: "6704.19",
    name: "Synthetic Wigs & Braids",
    category: "Hair & Beauty",
    description: "Wigs, false beards, braids and extensions of synthetic textile materials",
    keywords: ["braids", "synthetic hair", "kanekalon", "attachment", "synthetic wig"],
  },

  // Foodstuffs & Provisions
  {
    code: "2106.90",
    name: "Food Preparations & Provisions",
    category: "Foodstuffs",
    description: "Dry food preparations, dried soup condiments, stock cubes, dietary supplements",
    keywords: ["food", "provisions", "seasoning", "maggi", "suya pepper", "dry food", "condiments"],
  },
  {
    code: "1901.90",
    name: "Food Flours (Yam / Cassava / Plantain / Garri)",
    category: "Foodstuffs",
    description: "Flours, meal and starch preparations: Yam flour (Elubo), Garri, Plantain flour",
    keywords: ["garri", "yam flour", "elubo", "plantain flour", "flour", "cassava", "fufu", "amala"],
  },
  {
    code: "0910.99",
    name: "Spices & Dried Herbs",
    category: "Foodstuffs",
    description: "Spices, dry pepper, ginger, thyme, curry, local herbs and cooking spices",
    keywords: ["spice", "pepper", "dry pepper", "ginger", "curry", "thyme", "egusi", "ogbono"],
  },
  {
    code: "0305.59",
    name: "Dried Fish & Seafood",
    category: "Foodstuffs",
    description: "Dried, salted or smoked fish, dried stockfish, dried crayfish",
    keywords: ["dried fish", "stockfish", "crayfish", "smoked fish", "dry fish"],
  },

  // Documents & Printed Matter
  {
    code: "4901.99",
    name: "Books & Literature",
    category: "Documents & Books",
    description: "Printed books, brochures, leaflets, novels, textbooks and similar literature",
    keywords: ["book", "books", "textbook", "novel", "brochure", "manual", "magazine"],
  },
  {
    code: "4911.99",
    name: "Documents & Commercial Papers",
    category: "Documents & Books",
    description: "Commercial documents, contracts, certificates, statements, paper forms",
    keywords: ["document", "documents", "contract", "certificate", "papers", "paperwork", "deeds", "forms"],
  },

  // Jewelry & Watches
  {
    code: "7117.90",
    name: "Fashion & Costume Jewelry",
    category: "Jewelry",
    description: "Imitation jewelry, beaded necklaces, earrings, bracelets, non-precious rings",
    keywords: ["jewelry", "jewellery", "necklace", "earring", "bracelet", "beads", "bangle", "ring"],
  },
  {
    code: "9102.11",
    name: "Wristwatches",
    category: "Jewelry",
    description: "Wristwatches, battery or electrically operated with mechanical or opto-electronic display",
    keywords: ["watch", "wristwatch", "watches", "timepiece", "smartwatch"],
  },
];

/**
 * Automatically detects the best matching HS Tariff Code based on free-form input
 */
export function detectHsCode(query: string): HsCodeItem | null {
  if (!query || typeof query !== "string") return null;
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) return null;

  // 1. Direct match on code
  const codeMatch = HS_DATABASE.find((item) => item.code.replace(".", "").startsWith(normalized.replace(".", "")));
  if (codeMatch) return codeMatch;

  // 2. Keyword exact match
  for (const item of HS_DATABASE) {
    for (const kw of item.keywords) {
      if (normalized === kw || normalized.startsWith(kw + " ") || normalized.endsWith(" " + kw) || normalized.includes(" " + kw + " ")) {
        return item;
      }
    }
  }

  // 3. Partial keyword or description match
  for (const item of HS_DATABASE) {
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        return item;
      }
    }
  }

  // 4. Default fallback for cloth/garment if any apparel-related word
  if (normalized.includes("cloth") || normalized.includes("wear") || normalized.includes("fashion")) {
    return HS_DATABASE[0]; // 6109.10
  }

  return null;
}

/**
 * Searches the HS code database by query string (code, name, or keywords)
 */
export function searchHsCodes(query: string, limit = 8): HsCodeItem[] {
  if (!query || !query.trim()) return HS_DATABASE.slice(0, limit);
  const q = query.trim().toLowerCase();

  const results = HS_DATABASE.filter((item) => {
    return (
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some((kw) => kw.includes(q))
    );
  });

  return results.slice(0, limit);
}
