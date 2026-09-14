import {
  pickFriendlyVoice,
  preferredEnglishLang,
  rankVoices,
  scoreVoice,
  type RankableVoice,
} from "@/lib/audio/voiceSelect";
import { describe, expect, it } from "vitest";

function voice(partial: Partial<RankableVoice> & Pick<RankableVoice, "name">): RankableVoice {
  return {
    lang: "en-US",
    localService: true,
    voiceURI: partial.name,
    ...partial,
  };
}

describe("friendly voice ranking", () => {
  it("prefers known friendly English voices over novelty or first-in-list", () => {
    const voices = [
      voice({ name: "Zarvox", lang: "en-US" }),
      voice({ name: "Daniel", lang: "en-GB" }),
      voice({ name: "Samantha", lang: "en-US" }),
      voice({ name: "Google Deutsch", lang: "de-DE" }),
    ];
    const ranked = rankVoices(voices, true);
    expect(ranked[0]?.name).toBe("Samantha");
    expect(pickFriendlyVoice(voices, "", true)?.name).toBe("Samantha");
    expect(pickFriendlyVoice(voices, "Daniel", true)?.name).toBe("Daniel");
    expect(pickFriendlyVoice([], "", true)).toBeNull();
  });

  it("boosts female-labelled English voices and local voices", () => {
    const zira = voice({ name: "Microsoft Zira", lang: "en-US", localService: true });
    const male = voice({ name: "Microsoft David", lang: "en-US", localService: true });
    expect(scoreVoice(zira, "en-us", true)).toBeGreaterThan(scoreVoice(male, "en-us", true));
    expect(scoreVoice(voice({ name: "Google UK English Female", lang: "en-GB" }), "en-gb", false)).toBeGreaterThan(
      scoreVoice(voice({ name: "Google UK English Male", lang: "en-GB" }), "en-gb", false),
    );
    expect(preferredEnglishLang("ja-JP")).toBe("en-US");
    expect(preferredEnglishLang("en-GB")).toBe("en-GB");
  });
});
