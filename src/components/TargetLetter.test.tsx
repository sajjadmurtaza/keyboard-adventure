import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { objectLetterGlow, TargetLetter } from "@/components/TargetLetter";

describe("TargetLetter object accent", () => {
  it("keeps a black idle letter with an object-colored outer glow", () => {
    render(
      <TargetLetter
        target="o"
        mood="idle"
        reducedMotion
        burst={false}
        size="stage"
        accentColor="#F57C00"
      />,
    );
    const root = screen.getByTestId("target-letter");
    expect(root.getAttribute("data-accent")).toBe("#F57C00");
    const glyph = root.querySelector("p");
    expect(glyph?.className).toContain("text-[#303047]");
    expect(glyph?.getAttribute("style") ?? "").toMatch(/#F57C00/);
  });

  it("builds a soft object glow for idle letters", () => {
    expect(objectLetterGlow("#F57C00", "idle")).toContain("#F57C00");
    expect(objectLetterGlow(null, "idle")).toBe("none");
  });
});
