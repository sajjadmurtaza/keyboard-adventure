import type { ReactNode } from "react";
import type { LetterArtId } from "@/data/letterAssociations";

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full overflow-visible"
      aria-hidden
      fill="none"
    >
      {children}
    </svg>
  );
}

function StopSign() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <polygon
        points="100,28 158,58 158,122 100,152 42,122 42,58"
        fill="#FF5A5A"
        stroke="#C62828"
        strokeWidth="6"
      />
      <rect x="58" y="88" width="84" height="18" rx="6" fill="#FFF8F0" />
    </Frame>
  );
}

function Pause() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <circle cx="100" cy="96" r="58" fill="#7E57C2" stroke="#4527A0" strokeWidth="6" />
      <rect x="72" y="68" width="18" height="56" rx="6" fill="#FFF8F0" />
      <rect x="110" y="68" width="18" height="56" rx="6" fill="#FFF8F0" />
    </Frame>
  );
}

function Wink() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <circle cx="100" cy="100" r="58" fill="#FFD54A" stroke="#F9A825" strokeWidth="6" />
      <circle cx="78" cy="88" r="8" fill="#263238" />
      <path d="M114 88c8 10 20 10 28 0" stroke="#263238" strokeWidth="6" strokeLinecap="round" />
      <path d="M72 124c12 16 44 16 56 0" stroke="#263238" strokeWidth="6" strokeLinecap="round" />
    </Frame>
  );
}

function Breath() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <path
        d="M40 120c20-40 40-40 60 0s40 40 60 0"
        stroke="#4FC3F7"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <circle cx="148" cy="72" r="16" fill="#81D4FA" opacity="0.9" />
      <circle cx="168" cy="96" r="10" fill="#B3E5FC" />
    </Frame>
  );
}

function ListMarks() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <rect x="48" y="48" width="104" height="104" rx="18" fill="#FFF8E1" stroke="#F9A825" strokeWidth="6" />
      {[70, 100, 130].map((y) => (
        <g key={y}>
          <circle cx="72" cy={y} r="7" fill="#FF8A65" />
          <rect x="90" y={y - 5} width="48" height="10" rx="4" fill="#FFCC80" />
        </g>
      ))}
    </Frame>
  );
}

function Curve() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <path
        d="M48 64c8 56 40 88 88 88"
        stroke="#EC407A"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <circle cx="136" cy="152" r="12" fill="#EC407A" />
    </Frame>
  );
}

function Dot() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <circle cx="100" cy="108" r="42" fill="#5C6BC0" stroke="#303F9F" strokeWidth="6" />
      <circle cx="100" cy="100" r="16" fill="#E8EAF6" />
    </Frame>
  );
}

function Bullseye() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <circle cx="100" cy="100" r="58" fill="#FF8A80" stroke="#E53935" strokeWidth="5" />
      <circle cx="100" cy="100" r="38" fill="#FFF8F0" />
      <circle cx="100" cy="100" r="20" fill="#E53935" />
    </Frame>
  );
}

function FullStop() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <rect x="70" y="48" width="60" height="72" rx="12" fill="#90CAF9" stroke="#1565C0" strokeWidth="5" />
      <circle cx="100" cy="148" r="18" fill="#1565C0" />
    </Frame>
  );
}

function Path() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <path
        d="M48 148 L100 52 L152 148"
        stroke="#66BB6A"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="52" r="12" fill="#2E7D32" />
    </Frame>
  );
}

function Slide() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <path d="M40 60 L160 140" stroke="#29B6F6" strokeWidth="18" strokeLinecap="round" />
      <circle cx="52" cy="68" r="16" fill="#FFD54A" stroke="#F9A825" strokeWidth="4" />
    </Frame>
  );
}

function Divide() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <circle cx="100" cy="58" r="14" fill="#AB47BC" />
      <rect x="48" y="90" width="104" height="18" rx="9" fill="#AB47BC" />
      <circle cx="100" cy="142" r="14" fill="#AB47BC" />
    </Frame>
  );
}

function Jump() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <path d="M40 140c30-60 90-60 120 0" stroke="#FF7043" strokeWidth="10" strokeLinecap="round" />
      <circle cx="100" cy="72" r="28" fill="#FFCC80" stroke="#EF6C00" strokeWidth="5" />
      <circle cx="90" cy="68" r="4" fill="#263238" />
      <circle cx="110" cy="68" r="4" fill="#263238" />
      <path d="M90 84c6 8 14 8 20 0" stroke="#263238" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function SpaceCloud() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <ellipse cx="78" cy="110" rx="40" ry="28" fill="#E3F2FD" stroke="#64B5F6" strokeWidth="5" />
      <ellipse cx="118" cy="100" rx="36" ry="26" fill="#BBDEFB" stroke="#42A5F5" strokeWidth="5" />
      <ellipse cx="100" cy="120" rx="48" ry="24" fill="#E1F5FE" stroke="#29B6F6" strokeWidth="5" />
    </Frame>
  );
}

function Gap() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="9" fill="#263238" opacity="0.12" />
      <rect x="36" y="70" width="44" height="60" rx="12" fill="#7E57C2" />
      <rect x="120" y="70" width="44" height="60" rx="12" fill="#7E57C2" />
      <path d="M88 100h24" stroke="#FFD54A" strokeWidth="8" strokeLinecap="round" strokeDasharray="6 10" />
    </Frame>
  );
}

export const PUNCT_ART: Partial<Record<LetterArtId, () => ReactNode>> = {
  "stop-sign": StopSign,
  pause: Pause,
  wink: Wink,
  breath: Breath,
  list: ListMarks,
  curve: Curve,
  dot: Dot,
  bullseye: Bullseye,
  fullstop: FullStop,
  path: Path,
  slide: Slide,
  divide: Divide,
  jump: Jump,
  "space-cloud": SpaceCloud,
  gap: Gap,
};
