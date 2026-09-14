import { NextResponse } from "next/server";
import type { Bundle, CategoryKey } from "@/data/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/* =========================================================
   CSV PARSER
========================================================= */

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    // Escaped quote inside quoted value
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    // Start/end quoted value
    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    // New column
    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    // New row
    if (
      (char === "\n" || char === "\r") &&
      !quoted
    ) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(field);
      field = "";

      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  // Final field / final row
  row.push(field);

  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  // Normalize headers
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

/* =========================================================
   CATEGORY NORMALIZER
========================================================= */

function getCategoryKey(
  value: string
): CategoryKey | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (normalized.includes("pickle")) {
    return "pickles";
  }

  if (normalized.includes("sweet")) {
    return "sweets";
  }

  if (normalized.includes("snack")) {
    return "snacks";
  }

  if (
    normalized.includes("podi") ||
    normalized.includes("powder")
  ) {
    return "podis";
  }

  if (normalized.includes("cashew")) {
    return "cashews";
  }

  if (
    normalized.includes("essential") ||
    normalized.includes("millet") ||
    normalized.includes("oil") ||
    normalized.includes("ghee")
  ) {
    return "essentials";
  }

  if (
    normalized.includes("90") ||
    normalized.includes("memory") ||
    normalized.includes("memories") ||
    normalized.includes("nostalgia") ||
    normalized.includes("nostalgic")
  ) {
    return "memories";
  }

  return null;
}

/* =========================================================
   TRUE / FALSE PARSER
========================================================= */

function isTruthy(
  value: string | undefined,
  defaultValue = true
) {
  if (
    value === undefined ||
    value === null ||
    value.trim() === ""
  ) {
    return defaultValue;
  }

  const normalized = value
    .toLowerCase()
    .trim();

  return ![
    "0",
    "false",
    "no",
    "inactive",
    "disabled",
    "off",
  ].includes(normalized);
}

/* =========================================================
   NUMBER PARSER
========================================================= */

function parseNumber(value?: string) {
  if (!value) {
    return 0;
  }

  const cleaned = value
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}

/* =========================================================
   SPLIT ITEMS / TAGS
========================================================= */

function splitValues(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(/\s*[|;]\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/* =========================================================
   API ROUTE
========================================================= */

export async function GET() {
  /*
   * IMPORTANT:
   * Reads ONLY from:
   *
   * .env.local
   *
   * GLOBAL_GOOGLE_SHEET_URL=...
   */

  const sheetUrl =
    process.env["GLOBAL_GOOGLE_SHEET_URL"]?.trim();

  /* ---------------------------------------------------------
     ENV CHECK
  --------------------------------------------------------- */

  if (!sheetUrl) {
    console.error(
      "GLOBAL_GOOGLE_SHEET_URL is missing."
    );

    return NextResponse.json(
      {
        bundles: [],
        source: "not-configured",
        envLoaded: false,
        refreshedAt: new Date().toISOString(),
        error:
          "GLOBAL_GOOGLE_SHEET_URL is not available.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

  try {
    /* -------------------------------------------------------
       CREATE FRESH GOOGLE SHEET REQUEST
    ------------------------------------------------------- */

    const url = new URL(sheetUrl);

    // Prevent Google/Vercel browser caching
    url.searchParams.set(
      "_gb_refresh",
      Date.now().toString()
    );

    console.log(
      "Global catalog environment loaded: true"
    );

    /* -------------------------------------------------------
       FETCH GOOGLE SHEET
    ------------------------------------------------------- */

    const response = await fetch(
      url.toString(),
      {
        method: "GET",
        cache: "no-store",

        headers: {
          "Cache-Control":
            "no-cache, no-store, must-revalidate",

          Pragma: "no-cache",

          "User-Agent":
            "GodavariBasketGlobal/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Google Sheet returned HTTP ${response.status}`
      );
    }

    /* -------------------------------------------------------
       READ CSV
    ------------------------------------------------------- */

    const csv = await response.text();

    if (!csv || csv.trim().length === 0) {
      throw new Error(
        "Google Sheet returned an empty response."
      );
    }

    /* -------------------------------------------------------
       PARSE CSV
    ------------------------------------------------------- */

    const rows = parseCsv(csv);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          bundles: [],
          source: "google-sheet",
          envLoaded: true,
          count: 0,
          refreshedAt:
            new Date().toISOString(),
          error:
            "The Google Sheet was loaded, but no catalog rows were found.",
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    /* -------------------------------------------------------
       CONVERT SHEET ROWS → BUNDLES
    ------------------------------------------------------- */

    const bundles: Bundle[] = [];

    rows.forEach((row, index) => {
      /* ACTIVE */

      if (!isTruthy(row.active, true)) {
        return;
      }

      /* CATEGORY */

      const category = getCategoryKey(
        row.category ||
          row.parent_category ||
          row.catalog ||
          ""
      );

      if (!category) {
        console.warn(
          `Skipping row ${
            index + 2
          }: invalid category`,
          row.category
        );

        return;
      }

      /* NAME */

      const name =
        row.name ||
        row.bundle_name ||
        "";

      if (!name.trim()) {
        console.warn(
          `Skipping row ${
            index + 2
          }: bundle name missing`
        );

        return;
      }

      /* WEIGHT */

      const weightKg = parseNumber(
        row.weight_kg ||
          row.weightkg ||
          row.weight ||
          row.kg
      );

      if (weightKg <= 0) {
        console.warn(
          `Skipping row ${
            index + 2
          }: invalid weight`,
          row.weight_kg
        );

        return;
      }

      /* PRICE */

      const priceInr = parseNumber(
        row.price_inr ||
          row.price ||
          row.bundle_price
      );

      /* ITEMS */

      const items = splitValues(
        row.items ||
          row.products ||
          row.includes ||
          row.bundle_items
      );

      /* TAGS */

      const tags = splitValues(
        row.tags
      );

      /* IMAGE */

      const image =
        row.image?.trim() ||
        `/images/categories/${category}.webp`;

      /* CREATE BUNDLE */

      const bundle: Bundle = {
        id:
          row.id?.trim() ||
          `${category}-${index + 1}`,

        category,

        name: name.trim(),

        subtitle:
          (
            row.subtitle ||
            row.description ||
            ""
          ).trim(),

        weightKg,

        priceInr,

        image,

        items,

        tags,

        popular: isTruthy(
          row.popular,
          false
        ),
      };

      bundles.push(bundle);
    });

    /* -------------------------------------------------------
       SUCCESS
    ------------------------------------------------------- */

    return NextResponse.json(
      {
        bundles,

        source: "google-sheet",

        envLoaded: true,

        count: bundles.length,

        sheetRows: rows.length,

        refreshedAt:
          new Date().toISOString(),
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",

          Pragma: "no-cache",

          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Global catalog error:",
      error
    );

    return NextResponse.json(
      {
        bundles: [],

        source: "error",

        envLoaded: true,

        refreshedAt:
          new Date().toISOString(),

        error:
          error instanceof Error
            ? error.message
            : "Unable to load the Google Sheet catalog.",
      },
      {
        status: 502,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
