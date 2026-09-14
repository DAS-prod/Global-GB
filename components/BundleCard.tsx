"use client";

import { Bundle } from "@/data/catalog";
import { useBox } from "./BoxProvider";
import Price from "./Price";

export default function BundleCard({ bundle, compact = false }: { bundle: Bundle; compact?: boolean }) {
  const { addBundle } = useBox();
  return (
    <article className={compact ? "bundleCard compact" : "bundleCard"} data-reveal>
      <div className="bundleImageWrap"><img src={bundle.image} alt={bundle.name} className="bundleImage" loading="lazy" />{bundle.popular && <span className="pill">Most loved</span>}<span className="weightBadge">{bundle.weightKg} kg</span><div className="imageGlow" /></div>
      <div className="bundleBody"><div><p className="eyebrow">{bundle.items.length} curated favourites</p><h3>{bundle.name}</h3><p className="bundleSubtitle">{bundle.subtitle}</p></div>{!compact && <div className="bundleItems">{bundle.items.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div>}<div className="bundleFooter"><strong><Price inr={bundle.priceInr} /></strong><button onClick={() => addBundle(bundle.id)}>Add to my box <span>＋</span></button></div></div>
    </article>
  );
}
