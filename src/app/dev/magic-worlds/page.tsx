import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MagicWorldPreview } from "@/components/dev/MagicWorldPreview";

/**
 * Internal association preview harness — not linked from the child UI.
 * Visit /dev/magic-worlds?art=orange
 */
export default function MagicWorldsDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return (
    <Suspense fallback={<p className="p-6">Loading preview…</p>}>
      <MagicWorldPreview />
    </Suspense>
  );
}
