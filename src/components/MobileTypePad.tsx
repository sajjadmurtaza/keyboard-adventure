"use client";

import { useRef } from "react";
import { typedCharFromText } from "@/utils/keys";

type MobileTypePadProps = {
  started: boolean;
  onStart: () => void;
  onKey: (key: string) => void;
  miss: boolean;
};

export function MobileTypePad({
  started,
  onStart,
  onKey,
  miss,
}: MobileTypePadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusPad() {
    onStart();
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-sm">
      <button
        type="button"
        onClick={focusPad}
        className={`flex min-h-16 w-full flex-col items-center justify-center rounded-[24px] border-4 px-4 py-3 font-[family-name:var(--font-display)] text-xl font-bold ${
          miss
            ? "border-[#FF7A7A] bg-[#FFE1E1]"
            : started
              ? "border-[#7657E8] bg-white"
              : "border-[#FFD85A] bg-[#FFF6C8]"
        }`}
      >
        {started ? "Find it on your keyboard 👇" : "Tap here to start typing 👇"}
        <span className="text-2xl" aria-hidden>
          👆
        </span>
      </button>
      <input
        ref={inputRef}
        aria-label="Type the letter shown above"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        enterKeyHint="done"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-[0.01]"
        onFocus={onStart}
        onInput={(event) => {
          const value = event.currentTarget.value;
          event.currentTarget.value = "";
          const key = typedCharFromText(value);
          if (key) onKey(key);
          window.requestAnimationFrame(() => inputRef.current?.focus());
        }}
      />
    </div>
  );
}
