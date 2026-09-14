"use client";

import { Bundle, countries } from "@/data/catalog";
import { useCatalog } from "./CatalogProvider";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type CartLine = { bundleId: string; quantity: number };
type BoxContextValue = {
  lines: CartLine[];
  selectedBoxKg: number;
  countryCode: string;
  giftMode: boolean;
  drawerOpen: boolean;
  toastMessage: string;
  totalWeight: number;
  totalInr: number;
  itemCount: number;
  minimumReached: boolean;
  remainingToMinimum: number;
  selectedCountry: (typeof countries)[number];
  setSelectedBoxKg: (kg: number) => void;
  setCountryCode: (code: string) => void;
  setGiftMode: (value: boolean) => void;
  setDrawerOpen: (value: boolean) => void;
  addBundle: (bundleId: string) => void;
  removeBundle: (bundleId: string) => void;
  decrementBundle: (bundleId: string) => void;
  clearBox: () => void;
  replaceBox: (bundleIds: string[]) => void;
  getBundle: (id: string) => Bundle | undefined;
};

const BoxContext = createContext<BoxContextValue | null>(null);
const STORAGE_KEY = "gb-global-builder-v3";

export function BoxProvider({ children }: { children: React.ReactNode }) {
  const { bundles } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [selectedBoxKg, setSelectedBoxKg] = useState(10);
  const [countryCode, setCountryCode] = useState("US");
  const [giftMode, setGiftMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(""), 2200);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setLines(Array.isArray(saved.lines) ? saved.lines : []);
        setSelectedBoxKg(saved.selectedBoxKg || 10);
        setCountryCode(saved.countryCode || "US");
        setGiftMode(Boolean(saved.giftMode));
      }
    } catch {}
    setHydrated(true);
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, selectedBoxKg, countryCode, giftMode }));
  }, [lines, selectedBoxKg, countryCode, giftMode, hydrated]);

  const getBundle = (id: string) => bundles.find((bundle) => bundle.id === id);
  const totalWeight = useMemo(() => lines.reduce((sum, line) => sum + (getBundle(line.bundleId)?.weightKg || 0) * line.quantity, 0), [lines, bundles]);
  const totalInr = useMemo(() => lines.reduce((sum, line) => sum + (getBundle(line.bundleId)?.priceInr || 0) * line.quantity, 0), [lines, bundles]);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const minimumReached = totalWeight >= 5;
  const remainingToMinimum = Math.max(0, Number((5 - totalWeight).toFixed(2)));
  const selectedCountry = countries.find((country) => country.code === countryCode) || countries[0];

  const addBundle = (bundleId: string) => {
    const bundle = getBundle(bundleId);
    setLines((current) => {
      const existing = current.find((line) => line.bundleId === bundleId);
      return existing
        ? current.map((line) => line.bundleId === bundleId ? { ...line, quantity: line.quantity + 1 } : line)
        : [...current, { bundleId, quantity: 1 }];
    });
    showToast(bundle ? `${bundle.name} added to your Godavari Box ✓` : "Added to your Godavari Box ✓");
  };

  const decrementBundle = (bundleId: string) => setLines((current) => current.map((line) => line.bundleId === bundleId ? { ...line, quantity: line.quantity - 1 } : line).filter((line) => line.quantity > 0));
  const removeBundle = (bundleId: string) => setLines((current) => current.filter((line) => line.bundleId !== bundleId));
  const clearBox = () => setLines([]);
  const replaceBox = (bundleIds: string[]) => {
    const counts = new Map<string, number>();
    bundleIds.forEach((id) => counts.set(id, (counts.get(id) || 0) + 1));
    setLines(Array.from(counts, ([bundleId, quantity]) => ({ bundleId, quantity })));
    showToast("Your suggested Godavari Box is ready ✓");
  };

  return (
    <BoxContext.Provider value={{ lines, selectedBoxKg, countryCode, giftMode, drawerOpen, toastMessage, totalWeight, totalInr, itemCount, minimumReached, remainingToMinimum, selectedCountry, setSelectedBoxKg, setCountryCode, setGiftMode, setDrawerOpen, addBundle, removeBundle, decrementBundle, clearBox, replaceBox, getBundle }}>
      {children}
    </BoxContext.Provider>
  );
}

export function useBox() {
  const context = useContext(BoxContext);
  if (!context) throw new Error("useBox must be used inside BoxProvider");
  return context;
}
