#!/usr/bin/env python3
"""Export lesson-mirror asset inventory from the association catalog."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    text = (ROOT / "src/data/letterAssociations.ts").read_text()
    ct = (ROOT / "src/data/lessonMirrorCostumes.ts").read_text()

    dedicated: dict[str, dict] = {}
    block = ct.split("LESSON_MIRROR_COSTUMES")[1].split("] as const")[0]
    for m in re.finditer(
        r'art:\s*"(?P<art>[^"]+)"[\s\S]*?assetPath:\s*(?P<path>[^\n,]+)'
        r'[\s\S]*?style:\s*"(?P<style>[^"]+)"',
        block,
    ):
        art = m.group("art")
        path_expr = m.group("path").strip()
        style = m.group("style")
        fname_m = re.search(r'"([^"]+)"', path_expr)
        fname = fname_m.group(1) if fname_m else ""
        if "wearableAsset" in path_expr:
            costume_path = f"lesson-mirror/wearables/{fname}"
            size_path = ROOT / "public" / "lesson-mirror" / "wearables" / fname
        elif "objectAsset" in path_expr:
            costume_path = f"lesson-mirror/objects/{fname}"
            size_path = ROOT / "public" / "lesson-mirror" / "objects" / fname
        elif "lessonAsset" in path_expr:
            costume_path = f"lesson-mirror/{fname}"
            size_path = ROOT / "public" / "lesson-mirror" / fname
        elif "dressUpAsset" in path_expr:
            costume_path = f"dress-up/{fname}"
            size_path = ROOT / "public" / "dress-up" / fname
        else:
            costume_path = path_expr
            size_path = Path()
        size = size_path.stat().st_size if size_path.is_file() else 0
        dedicated[art] = {"style": style, "costume": costume_path, "size": size}

    assoc: dict[str, list[tuple[str, str, str]]] = {}
    for m in re.finditer(
        r'\n\s*(?:"((?:\\.|[^"])*)"|([a-z])):\s*\[((?:[^\[\]]|\[[^\]]*\])*)\]',
        text,
    ):
        key = m.group(1) if m.group(1) is not None else m.group(2)
        body = m.group(3)
        items = re.findall(
            r'word: "([^"]+)", art: "([^"]+)", motion: "([^"]+)"', body
        )
        if items and key is not None:
            assoc[key] = items
    for m in re.finditer(r'\n\s*"([^"]+)":\s*\[(.*?)\]', text, re.S):
        key, body = m.group(1), m.group(2)
        items = re.findall(
            r'word: "([^"]+)", art: "([^"]+)", motion: "([^"]+)"', body
        )
        if items:
            assoc[key] = items

    rows = []
    missing = []
    for key in sorted(
        assoc.keys(),
        key=lambda k: (0, k) if len(k) == 1 and k.isalpha() else (1, k),
    ):
        for word, art, motion in assoc[key]:
            display_key = "Space" if key == " " else key
            if art in dedicated:
                d = dedicated[art]
                style = d["style"]
                costume = d["costume"]
                size = d["size"]
                required = None
                reusable = (
                    [costume] if costume.startswith("dress-up/") else []
                )
            else:
                style = "companion"
                costume = "LetterArt companion (no circle)"
                size = 0
                required = f"dedicated face-frame or accessory for {art}"
                reusable = []
                missing.append(
                    {"key": display_key, "word": word, "art": art}
                )
            rows.append(
                {
                    "key": display_key,
                    "word": word,
                    "art": art,
                    "illustration": f"LetterArt/{art}",
                    "costume": costume,
                    "style": style,
                    "requiredNew": required,
                    "reusable": reusable,
                    "animation": motion,
                    "sizeBytes": size,
                }
            )

    mirror_dir = ROOT / "public/lesson-mirror"
    mirror_svg = sum(p.stat().st_size for p in mirror_dir.glob("*.svg"))
    wearables = sum(
        p.stat().st_size for p in (mirror_dir / "wearables").glob("*.png")
    )
    objects = sum(
        p.stat().st_size for p in (mirror_dir / "objects").glob("*.png")
    )
    sourced = sum(
        p.stat().st_size
        for p in (mirror_dir / "sourced").rglob("*")
        if p.is_file()
    )

    out = {
        "summary": {
            "alphabetAssociations": sum(
                1
                for r in rows
                if len(r["key"]) == 1 and r["key"].isalpha()
            ),
            "specialAssociations": sum(
                1
                for r in rows
                if not (len(r["key"]) == 1 and r["key"].isalpha())
            ),
            "dedicatedFaceFrames": sum(
                1
                for r in rows
                if r["style"]
                in (
                    "face-frame",
                    "head-accessory",
                    "body-wear",
                    "hand-prop",
                    "eye-accessory",
                )
            ),
            "companionLetterArt": sum(
                1 for r in rows if r["style"] == "companion"
            ),
            "mirrorSvgBytes": mirror_svg,
            "wearablePngBytes": wearables,
            "objectPngBytes": objects,
            "sourcedReferenceBytes": sourced,
            "totalTrackedAssetBytes": mirror_svg
            + wearables
            + objects
            + sourced,
        },
        "missingDedicatedArtwork": missing,
        "items": rows,
    }
    (ROOT / "public/lesson-mirror/ASSET_INVENTORY.json").write_text(
        json.dumps(out, indent=2) + "\n"
    )
    (ROOT / "public/lesson-mirror/MISSING_ARTWORK.json").write_text(
        json.dumps({"count": len(missing), "items": missing}, indent=2) + "\n"
    )
    print(json.dumps(out["summary"], indent=2))
    print("missing", len(missing))


if __name__ == "__main__":
    main()
