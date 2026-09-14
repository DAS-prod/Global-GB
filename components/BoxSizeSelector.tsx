"use client";

import { usePathname, useRouter } from "next/navigation";
import { boxSizes } from "@/data/catalog";
import { useBox } from "./BoxProvider";

export default function BoxSizeSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedBoxKg, setSelectedBoxKg } = useBox();

  const selectBox = (kg: number) => {
    setSelectedBoxKg(kg);

    if (pathname !== "/build") {
      router.push("/build#catalog");
      return;
    }

    window.setTimeout(() => {
      document.getElementById("catalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  return (
    <div className="boxSizeGrid">
      {boxSizes.map((box) => (
        <button
          key={box.kg}
          type="button"
          className={selectedBoxKg === box.kg ? "boxSize active" : "boxSize"}
          onClick={() => selectBox(box.kg)}
          aria-pressed={selectedBoxKg === box.kg}
        >
          {box.popular && <span className="popularFlag">Most Popular</span>}

          <div className="boxGlyph" aria-hidden="true">◆</div>

          <span className="boxSizeLabel">
            <span className="boxSizeWeight">
              <b>{box.kg}</b>
              <em>KG</em>
            </span>
            <strong>{box.name}</strong>
            <small>{box.description}</small>
          </span>

          <i aria-hidden="true">{selectedBoxKg === box.kg ? "✓" : "→"}</i>
        </button>
      ))}
    </div>
  );
}
