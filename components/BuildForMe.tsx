"use client";

import { CategoryKey } from "@/data/catalog";
import { useBox } from "./BoxProvider";
import { useCatalog } from "./CatalogProvider";
import { useEffect, useState } from "react";

const interests: { key: CategoryKey; label: string }[] = [
  { key: "pickles", label: "Pickles" },
  { key: "snacks", label: "Snacks" },
  { key: "sweets", label: "Sweets" },
  { key: "podis", label: "Podis" },
  { key: "cashews", label: "Cashews" },
  { key: "essentials", label: "Essentials" },
];

export default function BuildForMe() {
  const { bundles } = useCatalog();
  const { selectedBoxKg, setSelectedBoxKg, replaceBox } = useBox();
  const [open, setOpen] = useState(false);
  const [vegOnly, setVegOnly] = useState(true);
  const [chosen, setChosen] = useState<CategoryKey[]>(["pickles", "snacks", "podis"]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const toggle = (key: CategoryKey) => {
    setChosen((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const build = () => {
    const pool = bundles.filter(
      (bundle) =>
        chosen.includes(bundle.category) &&
        !(
          vegOnly &&
          bundle.tags?.some((tag) =>
            tag.toLowerCase().replace(/\s/g, "").includes("non-veg") ||
            tag.toLowerCase().replace(/\s/g, "").includes("nonveg")
          )
        )
    );

    if (!pool.length) return;

    const picked: string[] = [];
    let weight = 0;
    let cursor = 0;
    const target = Math.max(5, selectedBoxKg);

    while (weight < target && cursor < 30) {
      const candidate = pool[cursor % pool.length];
      picked.push(candidate.id);
      weight += candidate.weightKg;
      cursor += 1;
    }

    replaceBox(picked);
    setOpen(false);

    window.setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <>
      <button className="outlineButton" onClick={() => setOpen(true)}>
        ✦ Build for me
      </button>

      {open && (
        <div
          className="modalLayer"
          role="dialog"
          aria-modal="true"
          aria-label="Godavari Concierge"
          onMouseDown={() => setOpen(false)}
        >
          <div className="quizModal" onMouseDown={(event) => event.stopPropagation()}>
            <button
              className="modalClose"
              type="button"
              aria-label="Close concierge"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <span className="eyebrow">GODAVARI CONCIERGE</span>
            <h2>Tell us what feels like home.</h2>
            <p>We'll create a balanced starting box. You can change every bundle afterwards.</p>

            <div className="quizSection">
              <label>Box size</label>
              <div className="segmented conciergeSizes">
                {[5, 10, 15, 20].map((kg) => (
                  <button
                    type="button"
                    key={kg}
                    className={selectedBoxKg === kg ? "active" : ""}
                    onClick={() => setSelectedBoxKg(kg)}
                  >
                    <span>{kg}</span>
                    <small>kg</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="quizSection">
              <label>Preference</label>
              <div className="segmented two">
                <button type="button" className={vegOnly ? "active" : ""} onClick={() => setVegOnly(true)}>
                  Vegetarian
                </button>
                <button type="button" className={!vegOnly ? "active" : ""} onClick={() => setVegOnly(false)}>
                  Mixed
                </button>
              </div>
            </div>

            <div className="quizSection">
              <label>What do you miss most?</label>
              <div className="chips">
                {interests.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={chosen.includes(item.key) ? "active" : ""}
                    onClick={() => toggle(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="quizAction">
              <button className="goldButton full" type="button" onClick={build} disabled={!chosen.length || !bundles.length}>
                Create my box <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
