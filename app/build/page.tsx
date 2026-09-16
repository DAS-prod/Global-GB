"use client";

import BundleCard from "@/components/BundleCard";
import BoxSizeSelector from "@/components/BoxSizeSelector";
import BuildForMe from "@/components/BuildForMe";
import Footer from "@/components/Footer";
import { CategoryKey } from "@/data/catalog";
import { useBox } from "@/components/BoxProvider";
import { useCatalog } from "@/components/CatalogProvider";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

function BuildPageContent() {
  const searchParams = useSearchParams();

  const [active, setActive] = useState<CategoryKey | "all">("all");

  const {
    bundles,
    categories,
    loading,
    source,
  } = useCatalog();

  const {
    lines,
    getBundle,
    totalProductWeight,
    totalWeight,
    selectedBoxKg,
    minimumReached,
    remainingToMinimum,
    selectedCountry,
    setDrawerOpen,
    setSelectedBoxKg,
  } = useBox();

  const list = useMemo(() => {
    if (active === "all") {
      return bundles;
    }

    return bundles.filter(
      (bundle) => bundle.category === active
    );
  }, [active, bundles]);

  const target = Math.max(5, selectedBoxKg);

  const progress = Math.min(
    100,
    (totalWeight / target) * 100
  );

  /*
   * Read box size from URL.
   *
   * Example:
   * /build?box=10&catalog=1
   */
  useEffect(() => {
    const requestedBox = Number(
      searchParams.get("box")
    );

    if (
      [5, 10, 15, 20].includes(requestedBox) &&
      requestedBox !== selectedBoxKg
    ) {
      setSelectedBoxKg(requestedBox);
    }
  }, [
    searchParams,
    selectedBoxKg,
    setSelectedBoxKg,
  ]);

  /*
   * Scroll to catalog only after catalog data
   * has actually rendered.
   *
   * This prevents the old issue where selecting
   * 5 KG / 10 KG navigated down but the product
   * area still appeared blank.
   */
  useEffect(() => {
    const shouldScroll =
      searchParams.get("catalog") === "1";

    if (!shouldScroll) {
      return;
    }

    /*
     * Wait while Google Sheet catalog is still
     * loading and nothing has been rendered yet.
     */
    if (loading && bundles.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      const catalog =
        document.getElementById("catalog");

      if (!catalog) {
        return;
      }

      catalog.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 180);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    searchParams,
    loading,
    bundles.length,
  ]);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() ||
    "";

  const selectedBundles = lines
    .map((line) => {
      const bundle = getBundle(line.bundleId);

      if (!bundle) {
        return null;
      }

      return `${bundle.name} x${line.quantity}`;
    })
    .filter(Boolean);

  const customMessage = encodeURIComponent(
    [
      "Hi Godavari Basket, I would like help customizing my Godavari Basket Abroad box.",
      `Destination: ${selectedCountry.name}`,
      `Target box: ${selectedBoxKg} kg`,
      `Current bundles: ${
        selectedBundles.length
          ? selectedBundles.join(", ")
          : "Not selected yet"
      }`,
      `Product weight: ${totalProductWeight.toFixed(
        1
      )} kg`,
      `Current shipment weight: ${totalWeight.toFixed(
        1
      )} kg`,
      "Please help me customize the combination.",
    ].join("\n")
  );

  return (
    <main className="subPage buildPage">
      {/* HERO */}
      <section className="subHero buildHero">
        <div className="subHeroBackdrop" />

        <div className="heroAmbient heroAmbientOne" />
        <div className="heroAmbient heroAmbientTwo" />

        <div className="shell subHeroInner buildHeroInner">
          <div className="buildHeroCopy">
            <span className="eyebrow light heroLine heroLine1">
              BUILD YOUR GODAVARI BOX
            </span>

            <h1 className="heroLine heroLine2">
              Choose what feels
              <br />
              <em>most like home.</em>
            </h1>

            <p className="heroLine heroLine3">
              Pick curated bundles from across the
              Godavari pantry and combine them into
              one box for delivery abroad.
            </p>
          </div>

          <div className="heroLine heroLine4">
            <BuildForMe />
          </div>
        </div>
      </section>

      {/* BOX SIZE + PROGRESS */}
      <section
        className="builderControl shell"
        data-reveal
      >
        <div className="builderChoice">
          <span className="eyebrow">
            YOUR TARGET BOX
          </span>

          <BoxSizeSelector />
        </div>

        <button
          type="button"
          className="builderProgress"
          onClick={() => setDrawerOpen(true)}
        >
          <span>
            <b>
              {totalWeight.toFixed(1)} kg
            </b>

            <small>
              of {selectedBoxKg} kg target
            </small>
          </span>

          <i className="animatedProgress">
            <em
              style={{
                width: `${progress}%`,
              }}
            />
          </i>

          <strong>
            {minimumReached
              ? "Minimum reached · keep building if you like"
              : `${remainingToMinimum.toFixed(
                  1
                )} kg more to checkout`}
          </strong>

          <small className="weightBreakdown">
            Live shipment weight
          </small>

          <span>View box →</span>
        </button>
      </section>

      {/* GOOGLE SHEET CATALOG */}
      <section
        id="catalog"
        className="section shell buildCatalog"
      >
        <div className="catalogUtilityRow">
          <div
            className="categoryTabs"
            aria-label="Bundle categories"
          >
            <button
              type="button"
              className={
                active === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActive("all")
              }
            >
              All{" "}
              <small>
                {bundles.length}
              </small>
            </button>

            {categories.map((cat) => {
              const count = bundles.filter(
                (bundle) =>
                  bundle.category === cat.key
              ).length;

              return (
                <button
                  type="button"
                  key={cat.key}
                  className={
                    active === cat.key
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActive(cat.key)
                  }
                >
                  {cat.name}{" "}
                  <small>{count}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="catalogHeading">
          <div>
            <span className="eyebrow">
              CURATED BUNDLES · MIX & MATCH
            </span>

            <h2>
              {active === "all"
                ? "Build across the whole pantry"
                : categories.find(
                    (category) =>
                      category.key === active
                  )?.name}
            </h2>
          </div>

          <p>
            Each card is a ready bundle. Add
            several bundles together to create
            your larger Godavari Box.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading && bundles.length === 0 ? (
          <div
            className="catalogGrid catalogSkeletonGrid"
            aria-label="Loading bundles"
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                className="bundleCard catalogSkeleton"
                key={index}
                aria-hidden="true"
              >
                <div className="skeletonImage" />

                <div className="skeletonBody">
                  <i />
                  <b />
                  <span />
                  <span />

                  <button
                    type="button"
                    tabIndex={-1}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : list.length > 0 ? (
          /* REAL GOOGLE SHEET BUNDLES */
          <div className="catalogGrid">
            {list.map(
              (bundle, index) => (
                <BundleCard
                  key={bundle.id}
                  bundle={bundle}
                  revealIndex={index % 8}
                  immediateReveal
                />
              )
            )}
          </div>
        ) : (
          /* EMPTY / ERROR STATE */
          <div className="catalogState">
            <h3>
              {source === "google-sheet"
                ? "No bundles are available here yet."
                : "We couldn't load the catalog."}
            </h3>

            <p>
              Please refresh the page or
              contact us on WhatsApp and
              we'll help you build your box.
            </p>
          </div>
        )}
      </section>

      {/* CUSTOM WHATSAPP BOX */}
      <section
        className="shell customBuildSection"
        data-reveal
      >
        <div className="customBuildGlow" />

        <div className="customBuildIcon">
          ◎
        </div>

        <div className="customBuildCopy">
          <span className="eyebrow light">
            YOUR BOX, YOUR WAY
          </span>

          <h2>
            Want a combination that isn't
            in the catalog?
          </h2>

          <p>
            Send us your preferences and
            we'll help tailor the bundles
            around your taste, gifting need
            or destination.
          </p>
        </div>

        {whatsappNumber ? (
          <a
            className="customBuildButton"
            href={`https://wa.me/${whatsappNumber}?text=${customMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            <span>
              Customize on WhatsApp
            </span>

            <b>→</b>
          </a>
        ) : null}
      </section>

      <Footer />
    </main>
  );
}

/*
 * IMPORTANT:
 *
 * useSearchParams() must exist below a Suspense
 * boundary in Next.js 14 when this page can be
 * prerendered.
 *
 * This fixes the Vercel error:
 *
 * "useSearchParams() should be wrapped in a
 * suspense boundary at page /build"
 */
export default function BuildPage() {
  return (
    <Suspense
      fallback={<BuildPageLoading />}
    >
      <BuildPageContent />
    </Suspense>
  );
}

/*
 * Very small fallback while Next.js resolves
 * the URL search parameters.
 *
 * Avoid a large loading screen because this
 * normally lasts only a moment.
 */
function BuildPageLoading() {
  return (
    <main className="subPage buildPage">
      <section className="subHero buildHero">
        <div className="subHeroBackdrop" />

        <div className="heroAmbient heroAmbientOne" />
        <div className="heroAmbient heroAmbientTwo" />

        <div className="shell subHeroInner buildHeroInner">
          <div className="buildHeroCopy">
            <span className="eyebrow light">
              BUILD YOUR GODAVARI BOX
            </span>

            <h1>
              Choose what feels
              <br />
              <em>most like home.</em>
            </h1>

            <p>
              Curating your Godavari
              favourites…
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
