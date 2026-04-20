import { describe, it, expect } from "vitest";
import { scaleToFit } from "./image";

describe("scaleToFit", () => {
  it("is identity when both sides are already within cap", () => {
    expect(scaleToFit(800, 600, 4000)).toEqual({ width: 800, height: 600 });
    expect(scaleToFit(4000, 3000, 4000)).toEqual({ width: 4000, height: 3000 });
  });

  it("scales landscape images down to cap on the longer side", () => {
    // 8000×4000 landscape → 4000×2000 (ratio 0.5)
    expect(scaleToFit(8000, 4000, 4000)).toEqual({ width: 4000, height: 2000 });
  });

  it("scales portrait images down to cap on the longer side", () => {
    // 3000×9000 portrait → 1333×4000 (ratio 4000/9000 ≈ 0.444)
    expect(scaleToFit(3000, 9000, 4000)).toEqual({ width: 1333, height: 4000 });
  });

  it("preserves aspect ratio within rounding", () => {
    const r1 = scaleToFit(6000, 4000, 4000);
    // 6000×4000 → 4000×2667 (3:2 ratio)
    expect(r1.width).toBe(4000);
    expect(r1.height).toBe(2667);
  });

  it("handles square images", () => {
    expect(scaleToFit(5000, 5000, 4000)).toEqual({ width: 4000, height: 4000 });
  });
});
