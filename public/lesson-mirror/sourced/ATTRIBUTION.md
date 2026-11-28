# Lesson Mirror artwork attribution

## Magic Learning Worlds (runtime)

Semantic experiences (sun heat, sea hunt, juice sip, drum beat, jacket wear)
are drawn locally on Canvas over the live camera. Face Landmarker is required;
Pose Landmarker is optional (`public/mediapipe/pose_landmarker_lite.task`) for
more accurate jackets. Image Segmenter is optional
(`public/mediapipe/selfie_segmenter.tflite`, MediaPipe Apache-2.0 model) and only
runs when a parent enables person cutout. Without that consent or on unsupported
devices, worlds keep the rectangular live-video overlay with decorative scenery.

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

## Microsoft Fluent Emoji (learning-panel recognition art)

Color SVGs in this folder (`fluent-*.svg`) are from
https://github.com/microsoft/fluentui-emoji under the MIT license
(see `FLUENT_EMOJI_LICENSE.txt`). Color (not Flat) variants are preferred for
association cards so children can recognize objects at a glance.
Runtime never fetches emoji from a CDN. Camera costumes still prefer
sheet-derived wearables/objects when those exist.

## Google Noto Color Emoji

License retained in `NOTO_EMOJI_LICENSE.txt` for approved sourcing. No Noto
runtime assets are currently wired into the mirror; companions use LetterArt.

## Modification notice

Fluent Flat SVGs are unmodified copies. Sheet-derived PNGs are cropped and
masked for AR use; custom SVGs are original and not derived from Fluent/Noto.
