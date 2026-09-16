"use client";

import BundleCard from "@/components/BundleCard";
import BoxSizeSelector from "@/components/BoxSizeSelector";
import BuildForMe from "@/components/BuildForMe";
import Footer from "@/components/Footer";
import { CategoryKey } from "@/data/catalog";
import { useBox } from "@/components/BoxProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BuildPage() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<CategoryKey | "all">("all");
  const { bundles, categories, loading, source } = useCatalog();
  const {
    lines, getBundle, totalProductWeight, totalWeight,
    selectedBoxKg, minimumReached, remainingToMinimum, selectedCountry, setDrawerOpen, setSelectedBoxKg
  } = useBox();

  const list = useMemo(
    () => active === "all" ? bundles : bundles.filter((bundle) => bundle.category === active),
    [active, bundles]
  );

  const target = Math.max(5, selectedBoxKg);
  const progress = Math.min(100, (totalWeight / target) * 100);

  useEffect(() => {
    const requestedBox = Number(searchParams.get("box"));
    if ([5, 10, 15, 20].includes(requestedBox) && requestedBox !== selectedBoxKg) {
      setSelectedBoxKg(requestedBox);
    }
  }, [searchParams, selectedBoxKg, setSelectedBoxKg]);

  useEffect(() => {
    if (searchParams.get("catalog") !== "1") return;

    // Wait until there is something tangible to scroll to. Previously the browser
    // jumped to #catalog before the async cards were painted, leaving users on a
    // blank-looking part of the page.
    if (loading && bundles.length === 0) return;

    const timer = window.setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [searchParams, loading, bundles.length]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";
  const selectedBundles = lines.map((line) => {
    const bundle = getBundle(line.bundleId);
    return bundle ? `${bundle.name} x${line.quantity}` : null;
  }).filter(Boolean);
  const customMessage = encodeURIComponent([
    "Hi Godavari Basket, I would like help customizing my Godavari Basket Abroad box.",
    `Destination: ${selectedCountry.name}`,
    `Target box: ${selectedBoxKg} kg`,
    `Current bundles: ${selectedBundles.length ? selectedBundles.join(", ") : "Not selected yet"}`,
    `Product weight: ${totalProductWeight.toFixed(1)} kg`,
    `Current shipment weight: ${totalWeight.toFixed(1)} kg`,
    "Please help me customize the combination."
  ].join("\n"));

  return <main className="subPage buildPage">
    <section className="subHero buildHero">
      <div className="subHeroBackdrop" />
      <div className="heroAmbient heroAmbientOne" />
      <div className="heroAmbient heroAmbientTwo" />
      <div className="shell subHeroInner buildHeroInner">
        <div className="buildHeroCopy">
          <span className="eyebrow light heroLine heroLine1">BUILD YOUR GODAVARI BOX</span>
          <h1 className="heroLine heroLine2">Choose what feels<br /><em>most like home.</em></h1>
          <p className="heroLine heroLine3">Pick curated bundles from across the Godavari pantry and combine them into one box for delivery abroad.</p>
        </div>
        <div className="heroLine heroLine4"><BuildForMe /></div>
      </div>
    </section>

    <section className="builderControl shell" data-reveal>
      <div className="builderChoice">
        <span className="eyebrow">YOUR TARGET BOX</span>
        <BoxSizeSelector />
      </div>
      <button className="builderProgress" onClick={() => setDrawerOpen(true)}>
        <span><b>{totalWeight.toFixed(1)} kg</b><small>of {selectedBoxKg} kg target</small></span>
        <i className="animatedProgress"><em style={{ width: `${progress}%` }} /></i>
        <strong>{minimumReached ? "Minimum reached · keep building if you like" : `${remainingToMinimum.toFixed(1)} kg more to checkout`}</strong>
        <small className="weightBreakdown">Live shipment weight</small>
        <span>View box →</span>
      </button>
    </section>

    <section id="catalog" className="section shell buildCatalog">
      <div className="catalogUtilityRow">
        <div className="categoryTabs" aria-label="Bundle categories">
          <button className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>All <small>{bundles.length}</small></button>
          {categories.map((cat) => {
            const count = bundles.filter((bundle) => bundle.category === cat.key).length;
            return <button key={cat.key} className={active === cat.key ? "active" : ""} onClick={() => setActive(cat.key)}>{cat.name} <small>{count}</small></button>;
          })}
        </div>
      </div>

      <div className="catalogHeading">
        <div><span className="eyebrow">CURATED BUNDLES · MIX & MATCH</span><h2>{active === "all" ? "Build across the whole pantry" : categories.find((category) => category.key === active)?.name}</h2></div>
        <p>Each card is a ready bundle. Add several bundles together to create your larger Godavari Box.</p>
      </div>

      {loading && bundles.length === 0 ? (
        <div className="catalogGrid catalogSkeletonGrid" aria-label="Loading bundles">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="bundleCard catalogSkeleton" key={index} aria-hidden="true">
              <div className="skeletonImage" />
              <div className="skeletonBody">
                <i /><b /><span /><span /><button tabIndex={-1} />
              </div>
            </div>
          ))}
        </div>
      ) : list.length ? (
        <div className="catalogGrid">{list.map((bundle, index) => <BundleCard key={bundle.id} bundle={bundle} revealIndex={index % 8} immediateReveal />)}</div>
      ) : (
        <div className="catalogState"><h3>{source === "google-sheet" ? "No bundles are available here yet." : "We couldn't load the catalog."}</h3><p>Please refresh the page or contact us on WhatsApp and we'll help you build your box.</p></div>
      )}
    </section>

    <section className="shell customBuildSection" data-reveal>
      <div className="customBuildGlow" />
      <div className="customBuildIcon">◎</div>
      <div className="customBuildCopy">
        <span className="eyebrow light">YOUR BOX, YOUR WAY</span>
        <h2>Want a combination that isn't in the catalog?</h2>
        <p>Send us your preferences and we'll help tailor the bundles around your taste, gifting need or destination.</p>
      </div>
      {whatsappNumber ? <a className="customBuildButton" href={`https://wa.me/${whatsappNumber}?text=${customMessage}`} target="_blank" rel="noreferrer"><span>Customize on WhatsApp</span><b>→</b></a> : null}
    </section>

    <Footer />
  </main>;
}
