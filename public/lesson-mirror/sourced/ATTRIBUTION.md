# Lesson Mirror artwork attribution

## Magic Learning Worlds (runtime)

Semantic experiences (sun heat, sea hunt, juice sip, drum beat, jacket wear)
are drawn locally on Canvas over the live camera. Face Landmarker is required;
Pose Landmarker is optional (`public/mediapipe/pose_landmarker_lite.task`) for
more accurate jackets. Image segmentation for full underwater cutouts is not
bundled yet — sea worlds use decorative water, fish, and bubbles without
claiming the real background was removed.

## Sheet-derived AR accessories (preferred)

PNG face accessories under `/public/lesson-mirror/wearables/` are sliced from the
Keyboard Adventure AR Accessories preview sheet. Preview faces are removed and
a transparent face opening is punched for the live camera.

Object icons under `/public/lesson-mirror/objects/` are sliced from the Keyboard
Adventure Object Art preview sheet (background, letter badge, and label cleared).
Hand-props such as juice/milk and body-wear such as jacket use these object
PNGs so drinking and dressing stay recognizable.

Reproduce with `node scripts/slice-art-sheets.mjs` when the preview sheets are
available locally.

## Legacy custom face-frame SVGs

Files under `/public/lesson-mirror/*.svg` (apple, jelly, and older drafts) are
original project artwork with transparent central face openings. Dedicated
costumes prefer wearables/objects PNGs when a sheet match exists.

## Companion props

Associations without a dedicated wearable show the in-app `LetterArt`
illustration as face-relative animated companions. No generic circular rings.

## Microsoft Fluent Emoji (reference / optional sourced)

Flat SVGs in this folder (`fluent-*.svg`) are from
https://github.com/microsoft/fluentui-emoji under the MIT license
(see `FLUENT_EMOJI_LICENSE.txt`). They are stored locally for reference.
Runtime costumes prefer sheet-derived PNGs and LetterArt companions — no
external image requests.

## Google Noto Color Emoji

License retained in `NOTO_EMOJI_LICENSE.txt` for approved sourcing. No Noto
runtime assets are currently wired into the mirror; companions use LetterArt.

## Modification notice

Fluent Flat SVGs are unmodified copies. Sheet-derived PNGs are cropped and
masked for AR use; custom SVGs are original and not derived from Fluent/Noto.
