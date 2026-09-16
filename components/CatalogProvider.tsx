"use client";

import type { Bundle, Category } from "@/data/catalog";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CatalogSource =
  | "loading"
  | "google-sheet"
  | "cache"
  | "not-configured"
  | "error";

type CatalogContextValue = {
  bundles: Bundle[];
  categories: Category[];
  loading: boolean;
  source: CatalogSource;
  refreshedAt?: string;
  error?: string;
  refreshCatalog: () => Promise<void>;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);
const CATALOG_CACHE_KEY = "gb-abroad-catalog-v1";

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function deriveCategories(bundles: Bundle[]): Category[] {
  const map = new Map<string, Category>();

  bundles.forEach((bundle) => {
    const existing = map.get(bundle.category);
    const subcategory = bundle.subcategory?.trim();

    if (!existing) {
      map.set(bundle.category, {
        key: bundle.category,
        name: bundle.categoryName?.trim() || humanize(bundle.category),
        kicker: subcategory || "Explore the collection",
        description: "",
        image: bundle.image || "/images/brand/logo.webp",
        subcategories: subcategory ? [subcategory] : [],
      });
      return;
    }

    if (subcategory && !existing.subcategories?.includes(subcategory)) {
      existing.subcategories = [...(existing.subcategories || []), subcategory];
      existing.kicker = existing.subcategories.slice(0, 3).join(" · ");
    }
  });

  return Array.from(map.values());
}

function readCachedCatalog(): Bundle[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.bundles) ? parsed.bundles : [];
  } catch {
    return [];
  }
}

function writeCachedCatalog(bundles: Bundle[]) {
  if (typeof window === "undefined" || !bundles.length) return;

  try {
    window.localStorage.setItem(
      CATALOG_CACHE_KEY,
      JSON.stringify({ bundles, savedAt: Date.now() })
    );
  } catch {
    // Storage can be unavailable in private browsers. The live catalog still works.
  }
}

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<CatalogSource>("loading");
  const [refreshedAt, setRefreshedAt] = useState<string>();
  const [error, setError] = useState<string>();

  const refreshCatalog = useCallback(async () => {
    try {
      const response = await fetch(`/api/catalog?refresh=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      const data = await response.json().catch(() => ({}));
      const incoming = Array.isArray(data?.bundles) ? (data.bundles as Bundle[]) : [];

      if (incoming.length > 0) {
        setBundles(incoming);
        writeCachedCatalog(incoming);
      } else if (data?.source === "google-sheet" && Number(data?.sheetRows || 0) === 0) {
        setBundles([]);
      }

      setSource(
        data?.source === "google-sheet"
          ? "google-sheet"
          : data?.source === "not-configured"
          ? "not-configured"
          : "error"
      );
      setRefreshedAt(data?.refreshedAt);
      setError(data?.error);

      if (!response.ok && !incoming.length && !readCachedCatalog().length) {
        throw new Error(data?.error || "Unable to load catalog");
      }
    } catch (err) {
      setSource("error");
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't load the catalog. Please refresh or contact us on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCachedCatalog();
    if (cached.length) {
      setBundles(cached);
      setSource("cache");
    }

    void refreshCatalog();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshCatalog();
    };
    const refreshOnFocus = () => void refreshCatalog();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshCatalog();
    }, 60_000);

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [refreshCatalog]);

  const categories = useMemo(() => deriveCategories(bundles), [bundles]);
  const value = useMemo(
    () => ({ bundles, categories, loading, source, refreshedAt, error, refreshCatalog }),
    [bundles, categories, loading, source, refreshedAt, error, refreshCatalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside CatalogProvider");
  return value;
}
