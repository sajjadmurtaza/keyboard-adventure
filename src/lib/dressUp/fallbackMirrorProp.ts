import type { LetterArtId } from "@/data/letterAssociations";
import type { LessonMirrorCostume } from "@/data/lessonMirrorCostumes";

/** Simple face-framing ring when a dedicated costume SVG is missing. */
export function fallbackMirrorProp(
  art: LetterArtId,
  name: string,
  accent = "#FFD85A",
): LessonMirrorCostume {
  const safe = accent.replace(/[^\w#(),.%\s-]/g, "") || "#FFD85A";
  const label = name.replace(/[<>&"']/g, "").slice(0, 18) || art;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <g>
    ${Array.from({ length: 10 }, (_, i) => {
      const a = (i * 36 * Math.PI) / 180;
      const cx = 160 + Math.cos(a) * 118;
      const cy = 160 + Math.sin(a) * 118;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="18" fill="${safe}" stroke="#FFFFFF" stroke-width="3"/>`;
    }).join("")}
  </g>
  <circle cx="160" cy="160" r="76" fill="none" stroke="${safe}" stroke-width="14"/>
  <circle cx="160" cy="160" r="68" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.7"/>
  <text x="160" y="300" text-anchor="middle" font-family="Nunito, system-ui, sans-serif" font-size="22" font-weight="700" fill="${safe}">${label}</text>
</svg>`;

  return {
    art,
    name,
    assetPath: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    anchor: "helmet",
    scale: 2.35,
    offsetY: 0,
    fallback: true,
  };
}
