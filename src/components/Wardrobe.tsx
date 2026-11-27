"use client";

import { COSTUMES, getCostume, type CostumeId } from "@/data/costumes";
import { Mascot } from "@/components/Mascot";

type WardrobeProps = {
  unlocked: CostumeId[];
  equipped: CostumeId[];
  childName: string;
  reducedMotion: boolean;
  onEquip: (ids: CostumeId[]) => void;
  onBack: () => void;
  onContinueTyping?: () => void;
};

export function Wardrobe({
  unlocked,
  equipped,
  childName,
  reducedMotion: _reducedMotion,
  onEquip,
  onBack,
  onContinueTyping,
}: WardrobeProps) {
  void _reducedMotion;
  const accessories = equipped.map((id) => getCostume(id).emoji);
  const hello = childName ? `${childName}'s treasures` : "Your treasures";

  function toggle(id: CostumeId) {
    if (!unlocked.includes(id)) return;
    if (equipped.includes(id)) {
      onEquip(equipped.filter((item) => item !== id));
      return;
    }
    onEquip([...equipped.filter((item) => getCostume(item).slot !== getCostume(id).slot), id].slice(-3));
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-5 py-4 text-center">
      <p className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-[#9AA0B8]">
        Magic Mirror · wardrobe
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#7657E8]">
        🎁 {hello}
      </h1>
      <Mascot
        line={equipped.length ? "Looking fancy!" : "Pick a treasure!"}
        mood="success"
        accessories={accessories}
      />
      <p className="max-w-sm text-base text-[#5A5C72]">
        Learn letters to unlock hats and ears for your bear!
      </p>

      <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Costume wardrobe">
        {COSTUMES.map((costume) => {
          const have = unlocked.includes(costume.id);
          const on = equipped.includes(costume.id);
          return (
            <li key={costume.id}>
              <button
                type="button"
                disabled={!have}
                data-testid={`costume-${costume.id}`}
                aria-pressed={on}
                aria-label={
                  have
                    ? `${costume.name}${on ? ", wearing" : ""}`
                    : `${costume.name}, locked. Learn letter ${costume.unlockLetter.toUpperCase()}.`
                }
                onClick={() => toggle(costume.id)}
                className={`pressable flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-3xl px-2 py-3 shadow-md ${
                  have
                    ? on
                      ? "bg-[#7657E8] text-white"
                      : "bg-white text-[#34364A]"
                    : "cursor-not-allowed bg-[#E8EAF2] text-[#9AA0B8]"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {have ? costume.emoji : "🔒"}
                </span>
                <span className="font-[family-name:var(--font-display)] text-base font-bold">
                  {have ? costume.name : "???"}
                </span>
                <span className="text-xs opacity-80">
                  {have ? costume.blurb : `Learn ${costume.unlockLetter.toUpperCase()}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        {onContinueTyping ? (
          <button
            type="button"
            onClick={onContinueTyping}
            className="pressable min-h-14 rounded-full bg-[#7657E8] px-8 font-[family-name:var(--font-display)] text-xl font-bold text-white shadow-lg"
          >
            Keep typing →
          </button>
        ) : null}
        <button
          type="button"
          onClick={onBack}
          className="pressable min-h-12 rounded-full bg-white px-6 font-[family-name:var(--font-display)] text-lg font-bold text-[#7657E8] shadow-md"
        >
          Back
        </button>
      </div>
    </div>
  );
}
