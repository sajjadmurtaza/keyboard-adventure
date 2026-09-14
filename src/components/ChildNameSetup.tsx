"use client";

import { useState } from "react";
import { Mascot } from "@/components/Mascot";
import { CHILD_NAME_MAX, parseChildName } from "@/utils/childName";

export function ChildNameSetup({ onSave }: { onSave: (name: string) => void }) {
  const [draft, setDraft] = useState("");
  const name = parseChildName(draft);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F4FBFF] px-4">
      <form
        className="flex w-full max-w-md flex-col items-center gap-5 rounded-[32px] bg-white p-8 text-center shadow-lg"
        onSubmit={(event) => {
          event.preventDefault();
          if (name) onSave(name);
        }}
      >
        <Mascot line="Who is learning today?" />
        <label className="flex w-full flex-col gap-2 text-left font-[family-name:var(--font-nunito)] text-lg">
          Child&apos;s first name
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, CHILD_NAME_MAX))}
            autoComplete="nickname"
            autoCapitalize="words"
            spellCheck={false}
            maxLength={CHILD_NAME_MAX}
            className="rounded-2xl border-2 border-[#E8E4F8] px-4 py-3 text-xl"
            placeholder="Fatima"
            data-testid="child-name-input"
          />
        </label>
        <button
          type="submit"
          disabled={!name}
          className="pressable min-h-16 w-full rounded-full bg-[#7657E8] font-[family-name:var(--font-display)] text-2xl font-bold text-white disabled:opacity-40"
        >
          LET&apos;S GO!
        </button>
        <p className="text-sm text-[#9AA0B8]">Saved only on this device.</p>
      </form>
    </div>
  );
}
