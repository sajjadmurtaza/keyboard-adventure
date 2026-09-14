"use client";

import { forwardRef } from "react";
import { typedCharFromText } from "@/utils/keys";

type MobileTypingFieldProps = {
  enabled: boolean;
  onKey: (key: string) => void;
  onFocus?: () => void;
};

export const MobileTypingField = forwardRef<HTMLInputElement, MobileTypingFieldProps>(
  function MobileTypingField({ enabled, onKey, onFocus }, ref) {
    return (
      <input
        ref={ref}
        type="text"
        name="keyboard-adventure-typing"
        inputMode="text"
        enterKeyHint="done"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Type the letter shown on screen"
        disabled={false}
        onFocus={onFocus}
        onChange={(event) => {
          const value = event.currentTarget.value;
          event.currentTarget.value = "";
          const key = typedCharFromText(value);
          if (key && enabled) onKey(key);
          requestAnimationFrame(() => {
            const node = ref && typeof ref !== "function" ? ref.current : null;
            node?.focus();
          });
        }}
        className="pointer-events-none fixed z-50 border-0 bg-transparent p-0 text-base opacity-[0.01] outline-none"
        style={{
          left: "50%",
          bottom: 8,
          width: 1,
          height: 1,
          fontSize: 16,
        }}
      />
    );
  },
);

type StartTypingButtonProps = {
  miss: boolean;
  onPress: () => void;
};

export function StartTypingButton({ miss, onPress }: StartTypingButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`large-helper-card mt-2 flex min-h-14 w-full max-w-xs items-center justify-center rounded-[24px] border-4 px-4 py-3 font-[family-name:var(--font-display)] text-xl font-bold ${
        miss
          ? "border-[#FF4D5E] bg-[#FFE4E8]"
          : "border-[#FFD85A] bg-[#FFF6C8]"
      }`}
    >
      START TYPING 👇
    </button>
  );
}
