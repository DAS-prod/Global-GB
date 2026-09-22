export const PACKAGING_WEIGHT_KG = 0.5;

// =========================================================
// TRANSPORT PRICING
// =========================================================
//
// 5 kg = $29
// Each additional started kilogram = +$6
//
// Transport is calculated using PRODUCT weight only.
// Packaging weight is NOT included in transport calculation.
//
// Examples:
// 5 kg  = $29
// 6 kg  = $35
// 7 kg  = $41
// 8 kg  = $47
// 9 kg  = $53
// 10 kg = $59
// 15 kg = $89
//

export const TRANSPORT_BASE_WEIGHT_KG = 5;

export const TRANSPORT_BASE_USD = 29;

export const TRANSPORT_EXTRA_USD_PER_KG = 6;

export function calculateTransportUsd(
  productWeightKg: number
) {
  if (productWeightKg <= 0) {
    return 0;
  }

  const billableWeight = Math.max(
    TRANSPORT_BASE_WEIGHT_KG,
    Math.ceil(
      productWeightKg - 0.000001
    )
  );

  return (
    TRANSPORT_BASE_USD +
    Math.max(
      0,
      billableWeight -
        TRANSPORT_BASE_WEIGHT_KG
    ) *
      TRANSPORT_EXTRA_USD_PER_KG
  );
}

// =========================================================
// CATEGORY TYPES
// =========================================================
//
// Categories are intentionally NOT hard-coded.
//
// They are derived from the live Google Sheet catalog so
// the Abroad storefront stays aligned with the catalog
// without maintaining another category list in code.
//

export type CategoryKey = string;

export type Category = {
  key: CategoryKey;

  name: string;

  kicker: string;

  description: string;

  image: string;

  accent?: string;

  subcategories?: string[];
};

// =========================================================
// BUNDLE TYPE
// =========================================================

export type Bundle = {
  id: string;

  category: CategoryKey;

  categoryName?: string;

  parentCategory?: string;

  subcategory?: string;

  name: string;

  subtitle: string;

  weightKg: number;

  priceInr: number;

  image: string;

  items: string[];

  tags?: string[];

  popular?: boolean;

  catalogType?:
    | "bundle"
    | "combo";
};

// =========================================================
// BOX SIZES
// =========================================================

export const boxSizes = [
  {
    kg: 5,
    name: "Personal",
    description:
      "A compact box of favourites",
  },

  {
    kg: 10,
    name: "Family",
    description:
      "A fuller mix for home",
    popular: true,
  },

  {
    kg: 15,
    name: "Stock Up",
    description:
      "More of what you miss",
  },

  {
    kg: 20,
    name: "Big Box",
    description:
      "Made for sharing",
  },
];

// =========================================================
// COUNTRY / CURRENCY
// =========================================================
//
// IMPORTANT:
//
// Previous USA rate:
//
// rate: 0.012
//
// That effectively treated:
//
// $1 ≈ ₹83.33
//
// The updated rate:
//
// rate: 0.01042
//
// approximately treats:
//
// $1 ≈ ₹95.97
//
// This removes the roughly 15% higher USD display caused
// by the old 0.012 conversion rate.
//

export const countries = [
  {
    code: "US",
    name: "USA",
    currency: "USD",
    symbol: "$",
    rate: 0.01042,
  },

  {
    code: "GB",
    name: "UK",
    currency: "GBP",
    symbol: "£",
    rate: 0.0092,
  },

  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    symbol: "C$",
    rate: 0.016,
  },

  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    symbol: "A$",
    rate: 0.018,
  },

  {
    code: "AE",
    name: "UAE",
    currency: "AED",
    symbol: "AED ",
    rate: 0.044,
  },

  {
    code: "IN",
    name: "India",
    currency: "INR",
    symbol: "₹",
    rate: 1,
  },
];
