"use client";

import { Bundle, categories } from "@/data/catalog";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CatalogSource = "loading" | "google-sheet" | "not-configured" | "error";
type CatalogContextValue = {
  bundles: Bundle[];
  categories: typeof categories;
  loading: boolean;
  source: CatalogSource;
  refreshedAt?: string;
  error?: string;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<CatalogSource>("loading");
  const [refreshedAt, setRefreshedAt] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;
    fetch("/api/catalog", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok && !data?.source) throw new Error("catalog");
        return data;
      })
      .then((data) => {
        if (!alive) return;
        setBundles(Array.isArray(data?.bundles) ? data.bundles : []);
        setSource(data?.source === "google-sheet" ? "google-sheet" : data?.source === "not-configured" ? "not-configured" : "error");
        setRefreshedAt(data?.refreshedAt);
        setError(data?.error);
      })
      .catch(() => {
        if (!alive) return;
        setBundles([]);
        setSource("error");
        setError("We couldn't load the catalog. Please refresh or contact us on WhatsApp.");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const value = useMemo(() => ({ bundles, categories, loading, source, refreshedAt, error }), [bundles, loading, source, refreshedAt, error]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside CatalogProvider");
  return value;
}
