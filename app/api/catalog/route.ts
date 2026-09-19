import { NextResponse } from "next/server";
import type { Bundle } from "@/data/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      field = "";

      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) =>
    header
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
  );

  return rows.slice(1).map((cells) => {
    const object: Record<string, string> = {};

    headers.forEach((header, index) => {
      object[header] = (cells[index] || "").trim();
    });

    return object;
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isTruthy(value: string | undefined, defaultValue = true) {
  if (value === undefined || value === null || value.trim() === "") return defaultValue;
  const normalized = value.toLowerCase().trim();
  return !["0", "false", "no", "inactive", "disabled", "off"].includes(normalized);
}

function parseNumber(value?: string) {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function parseWeightKg(value?: string) {
  if (!value) return 0;
  const normalized = value.trim().toLowerCase().replace(/,/g, "");
  const number = parseNumber(normalized);

  if (!number) return 0;
  if (normalized.includes("mg")) return number / 1_000_000;

  if (
    normalized.includes("gram") ||
    /\d+(?:\.\d+)?\s*(?:g|gm)\b/.test(normalized)
  ) {
    return number / 1000;
  }

  return number;
}

function splitValues(value?: string) {
  if (!value) return [];

  return value
    .split(/\s*[|;]\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]?.trim();
    if (value) return value;
  }

  return "";
}

function isComboRow(row: Record<string, string>) {
  const type = firstValue(row, [
    "catalog_type",
    "catalogtype",
    "page_type",
    "page",
    "type",
    "section",
  ])
    .toLowerCase()
    .trim();

  if (["combo", "combos", "combo-pack", "combo-packages", "combo packs"].includes(type)) {
    return true;
  }

  if (isTruthy(firstValue(row, ["is_combo", "combo"]), false)) {
    return true;
  }

  const category = firstValue(row, ["category", "parent_category", "catalog", "collection"])
    .toLowerCase()
    .trim();

  return ["combo", "combos", "combo pack", "combo packs", "combo packages"].includes(category);
}

export async function GET() {
  const sheetUrl =
    process.env.ABROAD_GOOGLE_SHEET_URL?.trim() ||
    process.env.GLOBAL_GOOGLE_SHEET_URL?.trim() ||
    "";

  if (!sheetUrl) {
    return NextResponse.json(
      {
        bundles: [],
        combos: [],
        source: "not-configured",
        envLoaded: false,
        refreshedAt: new Date().toISOString(),
        error: "ABROAD_GOOGLE_SHEET_URL is not configured.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

  try {
    const url = new URL(sheetUrl);
    url.searchParams.set("_gb_refresh", Date.now().toString());

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        "User-Agent": "GodavariBasketAbroad/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheet returned HTTP ${response.status}`);
    }

    const csv = await response.text();

    if (!csv || csv.trim().length === 0) {
      throw new Error("Google Sheet returned an empty response.");
    }

    const rows = parseCsv(csv);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          bundles: [],
          combos: [],
          source: "google-sheet",
          envLoaded: true,
          count: 0,
          comboCount: 0,
          sheetRows: 0,
          refreshedAt: new Date().toISOString(),
          error: "The Google Sheet was loaded, but no catalog rows were found.",
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    const bundles: Bundle[] = [];
    const combos: Bundle[] = [];

    rows.forEach((row, index) => {
      if (!isTruthy(row.active, true)) return;

      const comboRow = isComboRow(row);
      const categoryName = firstValue(row, [
        "category",
        "parent_category",
        "catalog",
        "collection",
      ]);

      const category = slugify(categoryName || (comboRow ? "Combos" : ""));
      if (!category) return;

      const name = firstValue(row, ["name", "bundle_name", "product_name", "combo_name"]);
      if (!name) return;

      const rawWeight = firstValue(row, [
        "weight_kg",
        "weightkg",
        "bundle_weight_kg",
        "bundle_weight",
        "combo_weight_kg",
        "combo_weight",
        "combo_size",
        "weight",
        "kg",
        "size",
      ]);

      const weightKg = parseWeightKg(rawWeight);

      if (weightKg <= 0) {
        console.warn(`Skipping sheet row ${index + 2}: valid weight is required for ${name}`);
        return;
      }

      const priceInr = parseNumber(
        firstValue(row, [
          "price_inr",
          "combo_price_inr",
          "bundle_price",
          "combo_price",
          "price",
          "seller_price",
          "1kg",
        ])
      );

      if (priceInr <= 0) {
        console.warn(`Skipping sheet row ${index + 2}: valid price is required for ${name}`);
        return;
      }

      const items = splitValues(
        firstValue(row, ["items", "products", "includes", "bundle_items", "combo_items"])
      );
      const tags = splitValues(row.tags);
      const subcategory = firstValue(row, ["subcategory", "sub_category"]);
      const parentCategory = row.parent_category?.trim() || "";
      const image =
        firstValue(row, ["image", "image_url", "photo", "photo_url"]) ||
        "/images/brand/logo.webp";

      const catalogItem: Bundle = {
        id: row.id?.trim() || `${comboRow ? "combo" : category}-${index + 1}`,
        category,
        categoryName: categoryName || (comboRow ? "Combos" : undefined),
        parentCategory: parentCategory || undefined,
        subcategory: subcategory || undefined,
        name,
        subtitle: firstValue(row, ["subtitle", "description"]),
        weightKg,
        priceInr,
        image,
        items: items.length ? items : [name],
        tags,
        popular: isTruthy(row.popular || row.featured, false),
        catalogType: comboRow ? "combo" : "bundle",
      };

      if (comboRow) {
        combos.push(catalogItem);
      } else {
        bundles.push(catalogItem);
      }
    });

    combos.sort((a, b) => a.weightKg - b.weightKg || a.name.localeCompare(b.name));

    return NextResponse.json(
      {
        bundles,
        combos,
        source: "google-sheet",
        envLoaded: true,
        count: bundles.length,
        comboCount: combos.length,
        sheetRows: rows.length,
        refreshedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Abroad catalog error:", error);

    return NextResponse.json(
      {
        bundles: [],
        combos: [],
        source: "error",
        envLoaded: true,
        refreshedAt: new Date().toISOString(),
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the Google Sheet catalog.",
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
