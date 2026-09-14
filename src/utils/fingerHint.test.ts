import { fingerHint } from "@/utils/keys";
import { describe, expect, it } from "vitest";

describe("finger hints", () => {
  it("maps home-row keys", () => {
    expect(fingerHint("f").hand).toBe("left");
    expect(fingerHint("f").label).toMatch(/index/i);
    expect(fingerHint("j").hand).toBe("right");
    expect(fingerHint("j").label).toMatch(/index/i);
    expect(fingerHint("d").hand).toBe("left");
    expect(fingerHint("d").label).toMatch(/middle/i);
    expect(fingerHint("k").hand).toBe("right");
    expect(fingerHint("k").label).toMatch(/middle/i);
    expect(fingerHint(" ").hand).toBe("thumbs");
    expect(fingerHint("~").label).toBe("Find this key");
  });
});
