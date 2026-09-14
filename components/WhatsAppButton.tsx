"use client";

import { useBox } from "./BoxProvider";

export default function WhatsAppButton() {
  const { totalWeight, selectedCountry } = useBox();
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919618851406";
  const text = encodeURIComponent(`Hi Godavari Basket, I need help building a box for ${selectedCountry.name}. My current box is ${totalWeight.toFixed(1)} kg.`);
  return <a className="whatsapp" href={`https://wa.me/${number}?text=${text}`} target="_blank" rel="noreferrer"><b>◉</b><span><small>Need help?</small>Godavari Concierge</span></a>;
}
