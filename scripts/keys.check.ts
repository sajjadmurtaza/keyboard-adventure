import assert from "node:assert/strict";
import { eventToKey, keysMatch, normalizeTarget, typedCharFromText } from "../src/utils/keys";

assert.equal(normalizeTarget("F"), "f");
assert.equal(normalizeTarget(" "), " ");
assert.equal(keysMatch("F", "f"), true);
assert.equal(keysMatch("d", "f"), false);
assert.equal(keysMatch(" ", " "), true);

const fake = (key: string, extra: Partial<KeyboardEvent> = {}) =>
  ({
    key,
    repeat: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...extra,
  }) as KeyboardEvent;

assert.equal(eventToKey(fake("F")), "f");
assert.equal(eventToKey(fake("f", { repeat: true })), null);
assert.equal(eventToKey(fake("Shift")), null);
assert.equal(eventToKey(fake(" ")), " ");
assert.equal(eventToKey(fake("ArrowLeft")), null);

assert.equal(typedCharFromText("J"), "j");
assert.equal(typedCharFromText("jk"), "k");
assert.equal(typedCharFromText(" "), " ");
assert.equal(typedCharFromText(""), null);

console.log("keys tests passed");
