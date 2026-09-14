"use client";

import { useBox } from "./BoxProvider";

export default function FloatingBox() {
  const { totalWeight, selectedBoxKg, itemCount, setDrawerOpen } = useBox();
  const progress = Math.min(100, (totalWeight / Math.max(5, selectedBoxKg)) * 100);
  return (
    <button className="floatingBox" onClick={() => setDrawerOpen(true)} aria-label="View your Godavari box">
      <span className="floatingIcon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 8.2h10.4l1 11H5.8l1-11Z" /><path d="M9 9V6.8a3 3 0 0 1 6 0V9" /></svg></span>
      <span className="floatingCopy"><small>Your Godavari Box</small><b>{totalWeight.toFixed(1)} / {selectedBoxKg} kg</b><i><em style={{ width: `${progress}%` }} /></i></span>
      {itemCount > 0 && <span className="floatCount">{itemCount}</span>}
    </button>
  );
}
