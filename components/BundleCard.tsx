"use client";

import { Bundle } from "@/data/catalog";
import { useMemo, useState, type CSSProperties } from "react";
import { useBox } from "./BoxProvider";
import { useCatalog } from "./CatalogProvider";
import Price from "./Price";
import BundleQuickView from "./BundleQuickView";

export default function BundleCard({ bundle, compact = false, revealIndex = 0, immediateReveal = false }: { bundle: Bundle; compact?: boolean; revealIndex?: number; immediateReveal?: boolean }) {
  const { addBundle, decrementBundle, getQuantity } = useBox();
  const { bundles } = useCatalog();
  const [quickView, setQuickView] = useState(false);
  const quantity = getQuantity(bundle.id);

  const pairing = useMemo(() => {
    return bundles.find((candidate) => candidate.id !== bundle.id && candidate.category !== bundle.category) || bundles.find((candidate) => candidate.id !== bundle.id);
  }, [bundles, bundle.id, bundle.category]);

  return (
    <>
      <article
        className={`${compact ? "bundleCard compact" : "bundleCard"} ${immediateReveal ? "catalogCardEnter" : "premiumReveal"}`}
        {...(!immediateReveal ? { "data-reveal": "" } : {})}
        style={{ "--reveal-order": revealIndex } as CSSProperties}
      >
        <button className="bundleImageButton" onClick={() => setQuickView(true)} aria-label={`View ${bundle.name} details`}>
          <div className="bundleImageWrap">
            <img src={bundle.image} alt={bundle.name} className="bundleImage" loading="lazy" />
            {bundle.popular && <span className="pill">Most loved</span>}
            <span className="weightBadge">{bundle.weightKg} kg</span>
            <span className="imageViewCue">View bundle <b>↗</b></span>
            <div className="imageGlow" />
          </div>
        </button>

        <div className="bundleBody">
          <div>
            <p className="eyebrow">{bundle.items.length} curated favourites</p>
            <button className="bundleTitleButton" onClick={() => setQuickView(true)}><h3>{bundle.name}</h3></button>
            <p className="bundleSubtitle">{bundle.subtitle}</p>
          </div>

          {!compact && (
            <div className="bundleItems">
              {bundle.items.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
              {bundle.items.length > 3 && <span>+{bundle.items.length - 3} more</span>}
            </div>
          )}

          {!compact && pairing && (
            <button className="pairingHint" onClick={() => setQuickView(true)}>
              <span>Pairs well with</span><b>{pairing.name}</b><i>→</i>
            </button>
          )}

          <div className="bundleFooter">
            <strong><Price inr={bundle.priceInr} /></strong>
            {quantity > 0 ? (
              <div className="cardQty" aria-label={`${bundle.name} quantity`}>
                <button onClick={() => decrementBundle(bundle.id)} aria-label={`Decrease ${bundle.name}`}>−</button>
                <span>{quantity}</span>
                <button onClick={() => addBundle(bundle.id)} aria-label={`Increase ${bundle.name}`}>+</button>
              </div>
            ) : (
              <button className="addBundleButton" onClick={() => addBundle(bundle.id)}>Add to box <span>＋</span></button>
            )}
          </div>
        </div>
      </article>

      {quickView && <BundleQuickView bundle={bundle} onClose={() => setQuickView(false)} />}
    </>
  );
}
