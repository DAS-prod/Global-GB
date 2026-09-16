"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Price from "@/components/Price";
import { useBox } from "@/components/BoxProvider";

export default function CheckoutPage() {
  const { lines, getBundle, totalProductWeight, packagingWeight, totalWeight, totalInr, minimumReached, remainingToMinimum, selectedCountry, giftMode } = useBox();
  const [sending, setSending] = useState(false);
  const orderLines = useMemo(() => lines.map((line) => ({ ...line, bundle: getBundle(line.bundleId) })).filter((line) => line.bundle), [lines, getBundle]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!minimumReached || !orderLines.length) return;
    setSending(true);
    const form = new FormData(event.currentTarget);
    const details = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      country: String(form.get("country") || selectedCountry.name),
      address1: String(form.get("address1") || ""),
      address2: String(form.get("address2") || ""),
      city: String(form.get("city") || ""),
      state: String(form.get("state") || ""),
      postal: String(form.get("postal") || ""),
      notes: String(form.get("notes") || "")
    };

    const itemsText = orderLines.map((line, index) => {
      const bundle = line.bundle!;
      const lineWeight = bundle.weightKg * line.quantity;
      const lineTotal = bundle.priceInr * line.quantity;
      return `${index + 1}. ${bundle.name} x${line.quantity} — ${lineWeight.toFixed(1)} kg — INR ${lineTotal}\n   Includes: ${bundle.items.join(", ") || "As listed in catalog"}`;
    }).join("\n");

    const message = [
      "Hi Godavari Basket, I would like to continue this Godavari Basket Abroad order.",
      "",
      "ORDER DETAILS",
      itemsText,
      "",
      `Product weight: ${totalProductWeight.toFixed(1)} kg`,
      `Packaging weight: ${packagingWeight.toFixed(1)} kg`,
      `Total shipment weight: ${totalWeight.toFixed(1)} kg`,
      `Bundle subtotal: INR ${totalInr}`,
      `Gift order: ${giftMode ? "Yes" : "No"}`,
      "",
      "CUSTOMER DETAILS",
      `Name: ${details.name}`,
      `WhatsApp/Mobile: ${details.phone}`,
      `Email: ${details.email || "-"}`,
      `Country: ${details.country}`,
      `Address: ${[details.address1, details.address2, details.city, details.state, details.postal].filter(Boolean).join(", ")}`,
      `Notes: ${details.notes || "-"}`,
      "",
      "Please confirm availability, final packing/shipping and payment details."
    ].join("\n");

    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
    if (number) window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSending(false);
  };

  return <main className="subPage checkoutPage">
    <section className="checkoutHero"><div className="shell"><span className="eyebrow light">FINAL STEP</span><h1>Your Godavari Box,<br /><em>ready to continue.</em></h1><p>Review your bundles, add delivery details, then continue securely with our team on WhatsApp.</p></div></section>
    <section className="section shell checkoutLayout">
      <div className="checkoutMain">
        <div className="checkoutSectionHead"><span className="eyebrow">YOUR BOX</span><h2>Review your selection</h2></div>
        {!orderLines.length ? <div className="checkoutEmpty"><h3>Your box is empty.</h3><p>Choose your Godavari bundles before checkout.</p><Link className="goldButton" href="/build">Build your box <span>→</span></Link></div> : <div className="checkoutItems">{orderLines.map((line) => { const bundle = line.bundle!; return <article key={line.bundleId}><img src={bundle.image} alt={bundle.name} /><div><h3>{bundle.name}</h3><p>{bundle.items.slice(0, 4).join(" · ")}</p><small>{bundle.weightKg} kg × {line.quantity} = {(bundle.weightKg * line.quantity).toFixed(1)} kg</small></div><strong><Price inr={bundle.priceInr * line.quantity} /></strong></article>; })}</div>}

        <form className="checkoutForm" onSubmit={submit}>
          <div className="checkoutSectionHead"><span className="eyebrow">YOUR DETAILS</span><h2>Where is this box going?</h2><p>We'll use these details to continue the order with you on WhatsApp.</p></div>
          <div className="formGrid">
            <label><span>Full name *</span><input name="name" required autoComplete="name" placeholder="Your full name" /></label>
            <label><span>WhatsApp / Mobile *</span><input name="phone" required autoComplete="tel" inputMode="tel" placeholder="Country code + number" /></label>
            <label className="full"><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
            <label><span>Country *</span><input name="country" required defaultValue={selectedCountry.name} autoComplete="country-name" /></label>
            <label><span>Postal / ZIP code *</span><input name="postal" required autoComplete="postal-code" /></label>
            <label className="full"><span>Address line 1 *</span><input name="address1" required autoComplete="address-line1" /></label>
            <label className="full"><span>Address line 2</span><input name="address2" autoComplete="address-line2" /></label>
            <label><span>City *</span><input name="city" required autoComplete="address-level2" /></label>
            <label><span>State / Region *</span><input name="state" required autoComplete="address-level1" /></label>
            <label className="full"><span>Order notes</span><textarea name="notes" rows={4} placeholder="Anything we should know about this order?" /></label>
          </div>
          <button className="whatsappCheckout" type="submit" disabled={!minimumReached || !orderLines.length || sending}><span>Continue order on WhatsApp</span><b>→</b></button>
          {!minimumReached && orderLines.length > 0 && <p className="checkoutWarning">Add {remainingToMinimum.toFixed(1)} kg more to reach the 5 kg minimum.</p>}
        </form>
      </div>

      <aside className="checkoutSummary">
        <span className="eyebrow">ORDER SUMMARY</span>
        <h3>Your Godavari Box</h3>
        <div className="summaryRows"><p><span>Bundles</span><b>{lines.reduce((sum, line) => sum + line.quantity, 0)}</b></p><p><span>Products</span><b>{totalProductWeight.toFixed(1)} kg</b></p><p><span>Packaging</span><b>{packagingWeight.toFixed(1)} kg</b></p><p><span>Shipment weight</span><b>{totalWeight.toFixed(1)} kg</b></p><p><span>Minimum</span><b className={minimumReached ? "good" : "warn"}>{minimumReached ? "Reached ✓" : "5 kg"}</b></p><p><span>Bundle subtotal</span><b><Price inr={totalInr} /></b></p></div>
        <p className="checkoutNote">Final overseas shipping and payment are confirmed with our team on WhatsApp after reviewing destination, packing and availability.</p>
        <Link className="checkoutEdit" href="/build">← Continue shopping</Link>
      </aside>
    </section>
    <Footer />
  </main>;
}
