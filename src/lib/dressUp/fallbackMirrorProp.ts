import type { LetterArtId } from "@/data/letterAssociations";
import type { LessonMirrorCostume } from "@/data/lessonMirrorCostumes";

/**
 * Temporary companion prop when no dedicated face-frame SVG exists.
 * Uses the real LetterArt illustration beside the live face — never a generic ring.
 */
export function fallbackMirrorProp(
  art: LetterArtId,
  name: string,
  _accent = "#FFD85A",
): LessonMirrorCostume {
  void _accent;
  return {
    art,
    name,
    assetPath: "",
    anchor: "helmet",
    scale: 1,
    offsetY: 0,
    style: "companion",
    fallback: true,
  };
}
