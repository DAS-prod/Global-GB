"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import { useBox } from "@/components/BoxProvider";

export default function GiftingPage() {
  const { setGiftMode } = useBox();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";
  const message = encodeURIComponent("Hi Godavari Basket, I'm interested in Godavari Basket Abroad gifting.");

  return <main className="subPage">
    <section className="subHero giftingHero"><div className="subHeroBackdrop" /><div className="shell subHeroInner"><div><span className="eyebrow light">ABROAD GIFTING</span><h1>Send someone<br /><em>a piece of Godavari.</em></h1><p>For festivals, birthdays, housewarmings, teams—or the days when someone simply misses home.</p><Link className="goldButton" href="/build" onClick={() => setGiftMode(true)}>Build a gift box <span>→</span></Link></div></div></section>
    <section className="section shell giftFeatures" data-reveal><div className="sectionHeading split"><div><span className="eyebrow">MAKE IT PERSONAL</span><h2>Thoughtful from the first bundle to the final note.</h2></div><p>Gift mode is already part of the persistent box builder, ready for your wrapping, greeting-card and occasion fields later.</p></div><div className="giftGrid"><article><span>01</span><h3>Choose their favourites</h3><p>Mix favourites from the live Godavari Basket catalog.</p></article><article><span>02</span><h3>Reach the box minimum</h3><p>The live weight tracker keeps the order clear and simple.</p></article><article><span>03</span><h3>Add a personal touch</h3><p>Premium presentation and greeting-message options can be connected to your checkout.</p></article><article><span>04</span><h3>Send it across borders</h3><p>Destination selection remains attached to the box for future country-specific rules.</p></article></div></section>
    <section className="giftBanner"><div className="shell"><span>✦</span><div><p>CORPORATE · FESTIVE · FAMILY</p><h2>Sending more than one box?</h2><small>Use our concierge for custom quantities, addresses and gifting requirements.</small></div>{whatsappNumber ? <a className="creamButton" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsappNumber}?text=${message}`}>Talk to us →</a> : null}</div></section>
    <Footer />
  </main>;
}
