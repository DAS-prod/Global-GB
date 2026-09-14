export type CategoryKey =
  | "pickles"
  | "sweets"
  | "snacks"
  | "podis"
  | "cashews"
  | "essentials"
  | "memories";

export type Category = {
  key: CategoryKey;
  name: string;
  kicker: string;
  description: string;
  image: string;
  accent: string;
};

export type Bundle = {
  id: string;
  category: CategoryKey;
  name: string;
  subtitle: string;
  weightKg: number;
  priceInr: number;
  image: string;
  items: string[];
  tags?: string[];
  popular?: boolean;
};

export const categories: Category[] = [
  { key: "pickles", name: "Pickles", kicker: "The jar that tastes like home", description: "Andhra-style favourites curated for a balanced box.", image: "/images/categories/pickles.webp", accent: "#8b2f1d" },
  { key: "sweets", name: "Sweets", kicker: "Celebrations, packed", description: "Traditional Godavari sweets chosen for gifting and nostalgia.", image: "/images/categories/sweets.webp", accent: "#a56822" },
  { key: "snacks", name: "Snacks", kicker: "Tea-time, Godavari style", description: "Crunchy savouries and familiar evening favourites.", image: "/images/categories/snacks.webp", accent: "#b26116" },
  { key: "podis", name: "Podis", kicker: "Every meal, instantly familiar", description: "Roasted spice powders and everyday Andhra meal companions.", image: "/images/categories/podis.webp", accent: "#aa321f" },
  { key: "cashews", name: "Cashews", kicker: "Godavari's premium crunch", description: "Classic, roasted and flavoured cashew selections.", image: "/images/categories/cashews.webp", accent: "#9e742f" },
  { key: "essentials", name: "Essentials", kicker: "Everyday pantry, rooted here", description: "Traditional staples, millets and pantry favourites.", image: "/images/categories/essentials.webp", accent: "#466034" },
  { key: "memories", name: "90's Memories", kicker: "A little childhood in every box", description: "Nostalgic treats made for stories, sharing and smiles.", image: "/images/categories/memories.webp", accent: "#72553f" }
];

export const boxSizes = [
  { kg: 5, name: "Personal", description: "A compact box of favourites" },
  { kg: 10, name: "Family", description: "A fuller mix for home", popular: true },
  { kg: 15, name: "Stock Up", description: "More of what you miss" },
  { kg: 20, name: "Big Box", description: "Made for sharing" }
];

export const countries = [
  { code: "US", name: "USA", currency: "USD", symbol: "$", rate: 0.012 },
  { code: "GB", name: "UK", currency: "GBP", symbol: "£", rate: 0.0092 },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$", rate: 0.016 },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", rate: 0.018 },
  { code: "AE", name: "UAE", currency: "AED", symbol: "AED ", rate: 0.044 },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", rate: 1 }
];
