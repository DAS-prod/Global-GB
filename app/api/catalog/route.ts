import { NextResponse } from "next/server";
import type {
  Bundle,
  CategoryKey,
} from "@/data/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseCsv(
  text: string
): Record<string, string>[] {
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (
    let i = 0;
    i < text.length;
    i += 1
  ) {
    const ch = text[i];
    const next = text[i + 1];

    if (
      ch === '"' &&
      quoted &&
      next === '"'
    ) {
      field += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      quoted = !quoted;
      continue;
    }

    if (
      ch === "," &&
      !quoted
    ) {
      row.push(field);
      field = "";
      continue;
    }

    if (
      (ch === "\n" ||
        ch === "\r") &&
      !quoted
    ) {
      if (
        ch === "\r" &&
        next === "\n"
      ) {
        i += 1;
      }

      row.push(field);
      field = "";

      if (
        row.some((value) =>
          value.trim()
        )
      ) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += ch;
  }

  row.push(field);

  if (
    row.some((value) =>
      value.trim()
    )
  ) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers =
    rows[0].map((header) =>
      header
        .trim()
        .toLowerCase()
    );

  return rows
    .slice(1)
    .map((cells) =>
      Object.fromEntries(
        headers.map(
          (header, index) => [
            header,
            (
              cells[index] || ""
            ).trim(),
          ]
        )
      )
    );
}

function getCategoryKey(
  value: string
): CategoryKey | null {
  const normalized = value
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );

  if (
    normalized.includes("pickle")
  ) {
    return "pickles";
  }

  if (
    normalized.includes("sweet")
  ) {
    return "sweets";
  }

  if (
    normalized.includes("snack")
  ) {
    return "snacks";
  }

  if (
    normalized.includes("podi") ||
    normalized.includes("powder")
  ) {
    return "podis";
  }

  if (
    normalized.includes("cashew")
  ) {
    return "cashews";
  }

  if (
    normalized.includes("essential") ||
    normalized.includes("millet") ||
    normalized.includes("oil")
  ) {
    return "essentials";
  }

  if (
    normalized.includes("90") ||
    normalized.includes("memor") ||
    normalized.includes("nostalg")
  ) {
    return "memories";
  }

  return null;
}

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

  return ![
    "0",
    "false",
    "no",
    "inactive",
    "disabled",
  ].includes(
    value
      .toLowerCase()
      .trim()
  );
}

function parseNumber(
  value?: string
) {
  if (!value) {
    return 0;
  }

  const cleaned = value
    .replace(/,/g, "")
    .replace(
      /[^\d.-]/g,
      ""
    );

  const number =
    Number(cleaned);

  return Number.isFinite(number)
    ? number
    : 0;
}

export async function GET() {
  const sheetUrl =
    process.env
      .GLOBAL_GOOGLE_SHEET_URL
      ?.trim();

  if (!sheetUrl) {
    return NextResponse.json(
      {
        bundles: [],
        source:
          "not-configured",
        refreshedAt:
          new Date().toISOString(),
        error:
          "Catalog is currently unavailable.",
      },
      {
        status: 503,
      }
    );
  }

  try {
    const freshSheetUrl =
      new URL(sheetUrl);

    freshSheetUrl.searchParams.set(
      "_refresh",
      Date.now().toString()
    );

    const response =
      await fetch(
        freshSheetUrl.toString(),
        {
          cache: "no-store",
          headers: {
            "User-Agent":
              "GodavariBasketGlobal/1.0",
            "Cache-Control":
              "no-cache",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        `Google Sheet returned ${response.status}`
      );
    }

    const csv =
      await response.text();

    const rows =
      parseCsv(csv);

    const bundles: Bundle[] =
      rows.flatMap(
        (row, index) => {
          if (
            !isTruthy(
              row.active,
              true
            )
          ) {
            return [];
          }

          const category =
            getCategoryKey(
              row.category ||
                row.parent_category ||
                row.catalog ||
                ""
            );

          if (!category) {
            return [];
          }

          const name =
            row.name ||
            row.bundle_name ||
            "";

          const weightKg =
            parseNumber(
              row.weight_kg ||
                row.weightkg ||
                row.weight ||
                row.kg
            );

          const priceInr =
            parseNumber(
              row.price_inr ||
                row.price ||
                row.bundle_price
            );

          if (
            !name ||
            weightKg <= 0
          ) {
            return [];
          }

          const items =
            (
              row.items ||
              row.products ||
              row.includes ||
              row.bundle_items ||
              ""
            )
              .split(
                /\s*[|;]\s*|\s*,\s*/
              )
              .map((item) =>
                item.trim()
              )
              .filter(Boolean);

          const tags =
            (row.tags || "")
              .split(
                /\s*[|;,]\s*/
              )
              .map((tag) =>
                tag.trim()
              )
              .filter(Boolean);

          const bundle: Bundle =
            {
              id:
                row.id ||
                `${category}-${index + 1}`,

              category,

              name,

              subtitle:
                row.subtitle ||
                row.description ||
                "",

              weightKg,

              priceInr,

              image:
                row.image ||
                `/images/categories/${category}.webp`,

              items,

              tags,

              popular:
                isTruthy(
                  row.popular,
                  false
                ),
            };

          return [bundle];
        }
      );

    return NextResponse.json(
      {
        bundles,
        source:
          "google-sheet",
        count:
          bundles.length,
        refreshedAt:
          new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",
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
        refreshedAt:
          new Date().toISOString(),
        error:
          "We couldn't load the catalog. Please refresh or contact us on WhatsApp.",
      },
      {
        status: 502,
      }
    );
  }
}
