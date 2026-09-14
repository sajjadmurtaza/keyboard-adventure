import { getWrongInstruction, spokenKey } from "@/lib/audio/speechPhrases";
import { pickFreshItem, pickItem } from "@/lib/random";
import { jsonLd, siteUrl } from "@/lib/seo";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("speech phrases", () => {
  it("stays silent on the first miss", () => {
    expect(getWrongInstruction("j", 1)).toBeNull();
    expect(getWrongInstruction("j", 2)).toContain("jay");
    expect(getWrongInstruction("j", 3)).toContain("You can do it");
    expect(spokenKey(" ")).toBe("space bar");
  });
});

describe("random", () => {
  it("picks without repeating when possible", () => {
    expect(pickItem(["a"], () => 0)).toBe("a");
    expect(pickFreshItem(["a", "b"], "a", () => 0)).toBe("b");
    expect(pickFreshItem(["a", "b"], "z", () => 0)).toBe("a");
    expect(() => pickItem([])).toThrow(/at least one item/);
  });
});

describe("seo", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("describes the app without child data", () => {
    const data = jsonLd();
    expect(data.name).toBe("Keyboard Adventure");
    expect(JSON.stringify(data)).not.toMatch(/Fatima|progress|score/i);
    expect(siteUrl()).toMatch(/^https?:\/\//);
  });

  it("rejects unsafe site URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "javascript:alert(1)");
    expect(siteUrl()).toBe("https://keyboard-adventure.app");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not a url");
    expect(siteUrl()).toBe("https://keyboard-adventure.app");
    vi.unstubAllEnvs();
  });
});
