"use client";

import { CategoryKey, PACKAGING_WEIGHT_KG } from "@/data/catalog";
import { useBox } from "./BoxProvider";
import { useCatalog } from "./CatalogProvider";
import { useEffect, useState } from "react";

export default function BuildForMe() {
  const { bundles, categories } = useCatalog();
  const { selectedBoxKg, setSelectedBoxKg, replaceBox } = useBox();
  const [open, setOpen] = useState(false);
  const [vegOnly, setVegOnly] = useState(true);
  const [chosen, setChosen] = useState<CategoryKey[]>([]);
  const [buildError, setBuildError] = useState("");

  useEffect(() => {
    if (!categories.length) return;
    setChosen((current) => {
      const valid = current.filter((key) => categories.some((category) => category.key === key));
      return valid.length ? valid : categories.slice(0, 3).map((category) => category.key);
    });
  }, [categories]);

  useEffect(() => {
    if (!open) return;

    // Use a single scrolling surface (the modal layer). Locking the body with
    // position:fixed created a second viewport on iOS and could make the
    // concierge feel frozen after a short swipe.
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overscrollBehavior = bodyOverscroll;
      window.removeEventListener("keydown", onKeyDown);
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
    setBuildError("");

    const isNonVeg = (bundle: (typeof bundles)[number]) => {
      const searchable = [
        bundle.name,
        bundle.categoryName,
        bundle.parentCategory,
        bundle.subcategory,
        ...(bundle.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

      return searchable.includes("nonveg") || searchable.includes("nonvegetarian");
    };

    const pool = bundles.filter(
      (bundle) =>
        chosen.includes(bundle.category) &&
        (!vegOnly || !isNonVeg(bundle)) &&
        Number.isFinite(bundle.weightKg) &&
        bundle.weightKg > 0
    );

    if (!pool.length) {
      setBuildError(
        vegOnly
          ? "No vegetarian bundles match those categories yet. Try Mixed or choose another category."
          : "No bundles match those categories yet. Please choose another category."
      );
      return;
    }

    // The selected box is a shipment target. Packaging is 0.3 kg once per
    // order, so Build for Me fills products to target minus packaging.
    const shipmentTarget = Math.max(5, selectedBoxKg);
    const productTarget = Math.max(0, shipmentTarget - PACKAGING_WEIGHT_KG);

    // Round-robin by selected category so the result feels balanced instead
    // of repeatedly adding the first bundle from the Sheet.
    const grouped = chosen
      .map((category) => pool.filter((bundle) => bundle.category === category))
      .filter((group) => group.length > 0);

    const picked: string[] = [];
    let productWeight = 0;
    let round = 0;
    const MAX_LINES = 48;

    while (productWeight < productTarget && picked.length < MAX_LINES) {
      let addedThisRound = false;

      for (const group of grouped) {
        if (productWeight >= productTarget || picked.length >= MAX_LINES) break;
        const candidate = group[round % group.length];
        if (!candidate) continue;

        picked.push(candidate.id);
        productWeight += candidate.weightKg;
        addedThisRound = true;
      }

      if (!addedThisRound) break;
      round += 1;
    }

    if (!picked.length) {
      setBuildError("We couldn't create a box from those preferences. Please try another combination.");
      return;
    }

    replaceBox(picked);
    setOpen(false);

    window.setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 180);
  };

  return (
    <>
      <button className="outlineButton" onClick={() => { setBuildError(""); setOpen(true); }}>
        ✦ Build for me
      </button>

      {open && (
        <div
          className="modalLayer"
          role="dialog"
          aria-modal="true"
          aria-label="Godavari Concierge"
          onClick={() => setOpen(false)}
        >
          <div className="quizModal" onClick={(event) => event.stopPropagation()}>
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
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={chosen.includes(item.key) ? "active" : ""}
                    onClick={() => toggle(item.key)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {buildError ? <p className="conciergeError" role="alert">{buildError}</p> : null}

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
