"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [hide, setHide] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setHide(true), 1250);
    const b = window.setTimeout(() => setGone(true), 1750);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, []);
  if (gone) return null;
  return (
    <div className={hide ? "introScreen leaving" : "introScreen"}>
      <div className="introEmblem"><span>G</span><i /></div>
      <strong>GODAVARI BASKET</strong>
      <small>FROM GODAVARI, WITH LOVE.</small>
      <div className="introLine"><i /></div>
    </div>
  );
}
