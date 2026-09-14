"use client";

import BundleCard from "@/components/BundleCard";
import BoxSizeSelector from "@/components/BoxSizeSelector";
import BuildForMe from "@/components/BuildForMe";
import Footer from "@/components/Footer";
import { CategoryKey } from "@/data/catalog";
import { useBox } from "@/components/BoxProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { useMemo, useState } from "react";

export default function BuildPage() {
  const [active, setActive] = useState<CategoryKey | "all">("all");
  const { bundles, categories, loading, source } = useCatalog();
  const { totalWeight, selectedBoxKg, minimumReached, setDrawerOpen } = useBox();
  const list = useMemo(() => active === "all" ? bundles : bundles.filter((bundle) => bundle.category === active), [active, bundles]);


  const target = Math.max(5, selectedBoxKg);
  const progress = Math.min(100, (totalWeight / target) * 100);

  return <main className="subPage">
    <section className="subHero buildHero"><div className="subHeroBackdrop" /><div className="shell subHeroInner"><div><span className="eyebrow light">BUILD YOUR GODAVARI BOX</span><h1>Choose what feels<br /><em>most like home.</em></h1><p>Mix bundles from different categories into one meaningful box. Start from 5 kg and make it entirely yours.</p></div><BuildForMe /></div></section>
    <section className="builderControl shell" data-reveal><div className="builderChoice"><span className="eyebrow">YOUR TARGET BOX</span><BoxSizeSelector /></div><button className="builderProgress" onClick={() => setDrawerOpen(true)}><span><b>{totalWeight.toFixed(1)} kg</b><small>of {selectedBoxKg} kg target</small></span><i><em style={{ width: `${progress}%` }} /></i><strong>{minimumReached ? "Your box is ready ✓" : `${Math.max(0, 5 - totalWeight).toFixed(1)} kg more to checkout`}</strong><span>View box →</span></button></section>
    <section id="catalog" className="section shell buildCatalog" data-reveal>
      <div className="categoryTabs"><button className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>All bundles <small>{bundles.length}</small></button>{categories.map((cat) => { const count = bundles.filter((bundle) => bundle.category === cat.key).length; return <button key={cat.key} className={active === cat.key ? "active" : ""} onClick={() => setActive(cat.key)}>{cat.name} <small>{count}</small></button>; })}</div>
      <div className="catalogHeading"><div><span className="eyebrow">MIX & MATCH</span><h2>{active === "all" ? "Build across the whole pantry" : categories.find((category) => category.key === active)?.name}</h2></div><p>Choose bundles from any category. Your box weight updates automatically as you build.</p></div>
      {loading ? <div className="catalogState"><span className="catalogSpinner" /><h3>Bringing the pantry together…</h3></div> : list.length ? <div className="catalogGrid">{list.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)}</div> : <div className="catalogState"><h3>{source === "google-sheet" ? "No bundles are available here yet." : "We couldn't load the catalog."}</h3><p>Please refresh the page or contact us on WhatsApp and we'll help you build your box.</p></div>}
    </section>
    <Footer />
  </main>;
}
