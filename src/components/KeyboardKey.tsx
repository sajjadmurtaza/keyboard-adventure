"use client";

import { forwardRef } from "react";

type KeyTone = "idle" | "target" | "strong" | "success" | "miss";

type KeyboardKeyProps = {
  label: string;
  keyId: string;
  wide?: boolean;
  bump?: boolean;
  tone: KeyTone;
  point?: boolean;
};

export const KeyboardKey = forwardRef<HTMLDivElement, KeyboardKeyProps>(
  function KeyboardKey({ label, keyId, wide, bump, tone, point }, ref) {
    const toneClass =
      tone === "success"
        ? "keycap-success key-hit"
        : tone === "miss"
          ? "keycap-miss key-miss"
          : tone === "strong"
            ? "keycap-target key-glow-strong"
            : tone === "target"
              ? "keycap-target key-glow"
              : "keycap-idle";

    return (
      <div
        ref={ref}
        className={`relative ${wide ? "keyboard-space-wrap" : "keyboard-key-wrap"}`}
        data-testid={`key-${keyId === " " ? "space" : keyId}`}
        data-key={keyId === " " ? "space" : keyId}
        data-tone={tone}
      >
        {point ? (
          <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-xl" aria-hidden>
            👇
          </span>
        ) : null}
        <div className={`keycap ${toneClass} ${wide ? "keycap-space" : ""}`}>
          <span className="relative z-10 leading-none">{label}</span>
          {bump ? <span className="key-bump" aria-hidden /> : null}
        </div>
      </div>
    );
  },
);
