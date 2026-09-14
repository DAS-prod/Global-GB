"use client";

import { Bundle, categories } from "@/data/catalog";
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
  | "not-configured"
  | "error";

type CatalogContextValue = {
  bundles: Bundle[];
  categories: typeof categories;
  loading: boolean;
  source: CatalogSource;
  refreshedAt?: string;
  error?: string;
  refreshCatalog: () => Promise<void>;
};

const CatalogContext =
  createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bundles, setBundles] =
    useState<Bundle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [source, setSource] =
    useState<CatalogSource>("loading");

  const [refreshedAt, setRefreshedAt] =
    useState<string>();

  const [error, setError] =
    useState<string>();

  const refreshCatalog = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/catalog?refresh=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok && !data?.source) {
        throw new Error(
          "Unable to load catalog"
        );
      }

      setBundles(
        Array.isArray(data?.bundles)
          ? data.bundles
          : []
      );

      setSource(
        data?.source === "google-sheet"
          ? "google-sheet"
          : data?.source ===
            "not-configured"
          ? "not-configured"
          : "error"
      );

      setRefreshedAt(
        data?.refreshedAt
      );

      setError(data?.error);
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
    void refreshCatalog();

    const refreshWhenVisible = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        void refreshCatalog();
      }
    };

    const refreshOnFocus = () => {
      void refreshCatalog();
    };

    const interval =
      window.setInterval(() => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          void refreshCatalog();
        }
      }, 60_000);

    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );

    window.addEventListener(
      "focus",
      refreshOnFocus
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );

      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
    };
  }, [refreshCatalog]);

  const value = useMemo(
    () => ({
      bundles,
      categories,
      loading,
      source,
      refreshedAt,
      error,
      refreshCatalog,
    }),
    [
      bundles,
      loading,
      source,
      refreshedAt,
      error,
      refreshCatalog,
    ]
  );

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const value =
    useContext(CatalogContext);

  if (!value) {
    throw new Error(
      "useCatalog must be used inside CatalogProvider"
    );
  }

  return value;
}
