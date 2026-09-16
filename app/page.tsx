"use client";

import Link from "next/link";
import BundleCard from "@/components/BundleCard";
import BoxSizeSelector from "@/components/BoxSizeSelector";
import BuildForMe from "@/components/BuildForMe";
import Footer from "@/components/Footer";
import { useCatalog } from "@/components/CatalogProvider";

export default function Home() {
  const { bundles, categories, loading } = useCatalog();

  const popular = bundles
    .filter((bundle) => bundle.popular)
    .slice(0, 4);

  const featured =
    popular.length
      ? popular
      : bundles.slice(0, 4);

  return (
    <main>
      {/* =========================
          HERO
      ========================== */}
      <section className="homeHero">

        {/* DESKTOP + MOBILE HERO IMAGES */}
        <picture>
          <source
            media="(max-width: 560px)"
            srcSet="/images/abroad/hero-mobile.webp"
          />

          <img
            className="homeHeroImage"
            src="/images/abroad/hero-desktop.webp"
            alt="Authentic Godavari foods prepared for delivery abroad"
          />
        </picture>

        <div className="homeHeroShade" />

        <div className="shell homeHeroInner">
          <div className="homeHeroCopy">
            <span className="eyebrow light">
              GODAVARI BASKET · ABROAD
            </span>

            <h1>
              A little piece of
              <br />
              <em>
                Godavari, wherever you are.
              </em>
            </h1>

            <p>
              Choose curated bundles from the
              flavours, traditions and memories
              you grew up with. Build one meaningful
              box of 5 kg or more.
            </p>

            <div className="heroActions">
              <Link
                className="goldButton"
                href="/build"
              >
                Build your Godavari box
                <span>→</span>
              </Link>

              <BuildForMe />
            </div>

            <div className="heroTrust">
              <span>
                Authentic Godavari
              </span>

              <i />

              <span>
                5 kg+ boxes
              </span>

              <i />

              <span>
                WhatsApp support
              </span>
            </div>
          </div>
        </div>

        <div className="heroFloatCard">
          <span>
            Your box begins here
          </span>

          <strong>
            Pick · Combine · Send
          </strong>

          <small>
            From Godavari, With Love.
          </small>
        </div>
      </section>

      {/* =========================
          TRUST STRIP
      ========================== */}
      <section className="trustStrip">
        <div className="shell trustGrid">
          <div>
            <span>✦</span>
            <b>
              AUTHENTIC GODAVARI
            </b>
            <small>
              Familiar flavours,
              thoughtfully selected
            </small>
          </div>

          <div>
            <span>◎</span>
            <b>
              OVERSEAS-READY
            </b>
            <small>
              Built around practical
              box weights
            </small>
          </div>

          <div>
            <span>◇</span>
            <b>
              ONE BEAUTIFUL BOX
            </b>
            <small>
              Mix bundles across
              categories
            </small>
          </div>

          <div>
            <span>♡</span>
            <b>
              HUMAN SUPPORT
            </b>
            <small>
              WhatsApp concierge when
              you need us
            </small>
          </div>
        </div>
      </section>

      {/* =========================
          BOX SIZE
      ========================== */}
      <section
        className="section shell"
        data-reveal
      >
        <div className="sectionHeading split">
          <div>
            <span className="eyebrow">
              START WITH A BOX
            </span>

            <h2>
              How much Godavari
              <br />
              are we sending?
            </h2>
          </div>

          <p>
            Choose a box size, then start
            selecting bundles. Your box
            follows you while you explore
            and checkout unlocks once you
            reach 5 kg.
          </p>
        </div>

        <BoxSizeSelector />
      </section>

      {/* =========================
          CATEGORIES
      ========================== */}
      <section
        className="section shell categorySection"
        data-reveal
      >
        <div className="sectionHeading rowHeading">
          <div>
            <span className="eyebrow">
              EXPLORE THE GODAVARI PANTRY
            </span>

            <h2>
              Familiar favourites,
              grouped beautifully.
            </h2>
          </div>

          <Link href="/bundles">
            See all bundles →
          </Link>
        </div>

        <div className="categoryGrid">
          {categories.map(
            (category) => (
              <Link
                className="categoryCard"
                href={`/bundles?category=${category.key}`}
                key={category.key}
              >
                <div className="categoryImage">
                  <img
                    src={category.image}
                    alt={category.name}
                  />
                </div>

                <div className="categoryCopy">
                  <span>
                    {
                      bundles.filter(
                        (bundle) =>
                          bundle.category ===
                          category.key
                      ).length
                    }{" "}
                    curated bundles
                  </span>

                  <h3>
                    {category.name}
                  </h3>

                  <p>
                    {category.kicker}
                  </p>

                  <i>
                    Explore collection →
                  </i>
                </div>
              </Link>
            )
          )}
        </div>
      </section>

      {/* =========================
          GODAVARI STORY
      ========================== */}
      <section
        className="godavariStory"
        data-reveal
      >
        <div className="shell storyGrid">
          <div className="storyImage">
            <img
              src="/images/abroad/traditional-goodness.webp"
              alt="Traditional Godavari foods"
            />

            <span>
              ROOTED HERE
            </span>
          </div>

          <div className="storyCopy">
            <span className="eyebrow light">
              THE IDEA BEHIND GODAVARI BASKET
            </span>

            <h2>
              Godavari is not only a
              place.
              <br />
              <em>
                It is a feeling people
                carry.
              </em>
            </h2>

            <div className="goldDivider">
              <i>✦</i>
            </div>

            <p>
              The river, the fertile
              delta, coconut-lined roads,
              festival sweets, avakai in
              the kitchen, podi with hot
              rice, evening snacks and
              gifts carried when visiting
              family—these small things
              become part of how we
              remember home.
            </p>

            <p>
              <strong>
                Godavari Basket was
                created to bring those
                flavours, traditions,
                memories and
                craftsmanship together.
              </strong>{" "}
              The abroad experience takes
              that same idea one step
              further: choose the pieces
              of Godavari you miss,
              combine them into one box,
              and carry that feeling
              wherever life has taken
              you.
            </p>

            <Link
              className="outlineGoldButton"
              href="/about"
            >
              Know our Godavari story
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURED BUNDLES
      ========================== */}
      <section
        className="section featuredSection"
        data-reveal
      >
        <div className="shell">
          <div className="sectionHeading split lightHeading">
            <div>
              <span className="eyebrow light">
                HANDPICKED STARTERS
              </span>

              <h2>
                Start with a bundle.
                <br />
                Make the final box yours.
              </h2>
            </div>

            <p>
              Choose across categories,
              mix what you love and keep
              building until the box feels
              like home.
            </p>
          </div>

          {loading ? (
            <div className="catalogState dark">
              <span className="catalogSpinner" />

              <h3>
                Loading favourites…
              </h3>
            </div>
          ) : featured.length ? (
            <div className="featuredGrid">
              {featured.map(
                (bundle) => (
                  <BundleCard
                    bundle={bundle}
                    key={bundle.id}
                  />
                )
              )}
            </div>
          ) : (
            <div className="catalogState dark">
              <h3>
                Our catalog is being
                refreshed.
              </h3>

              <p>
                Please check again shortly
                or contact us on WhatsApp.
              </p>
            </div>
          )}

          <div className="centerCta">
            <Link
              className="creamButton"
              href="/build"
            >
              Explore the full catalog
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          MEMORIES
      ========================== */}
      <section
        className="memorySection"
        data-reveal
      >
        <div className="memoryPhoto">
          <img
            src="/images/abroad/90s-memories.webp"
            alt="90s memories from Godavari Basket"
          />
        </div>

        <div className="memoryCopy">
          <span className="eyebrow">
            FOR EVERYONE WHO MISSES HOME
          </span>

          <h2>
            Some tastes don't just fill
            a box.
            <br />
            <em>
              They bring a place back to
              you.
            </em>
          </h2>

          <p>
            That is why the abroad store
            is built around combinations,
            not a long grocery list. Pick
            the bundles that feel most
            like your home and let them
            travel together.
          </p>

          <Link
            className="goldButton"
            href="/build"
          >
            Taste home again
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* =========================
          CONCIERGE
      ========================== */}
      <section
        className="section shell"
        data-reveal
      >
        <div className="conciergeCard">
          <div>
            <span className="eyebrow light">
              GODAVARI CONCIERGE
            </span>

            <h2>
              Don't know what to add
              first?
            </h2>

            <p>
              Choose your box size,
              preference and the
              categories you miss. We'll
              prepare a balanced starting
              combination that you can
              edit.
            </p>

            <BuildForMe />
          </div>

          <div className="conciergeVisual">
            {categories
              .slice(0, 4)
              .map(
                (
                  category,
                  index
                ) => (
                  <span
                    className={`routeDot d${
                      index + 1
                    }`}
                    key={category.key}
                  >
                    {category.name}
                  </span>
                )
              )}

            <div className="readyBox">
              <b>5 kg+</b>

              <small>
                MADE YOUR WAY
              </small>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
