import type { ReactNode } from "react";
import type { LetterArtId } from "@/data/letterAssociations";

const NAVY = "#263238";

function Frame({
  children,
}: {
  children: ReactNode;
}) {
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

function Apple() {
  return (
    <Frame>
      <ellipse cx="100" cy="168" rx="42" ry="10" fill="#263238" opacity="0.12" />
      <path d="M100 42c18-28 46-8 28 18" stroke="#2F8A4C" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="78" cy="108" rx="44" ry="50" fill="#FF786B" />
      <ellipse cx="122" cy="108" rx="44" ry="50" fill="#E85A54" />
      <ellipse cx="78" cy="96" rx="18" ry="22" fill="#FFB4A8" opacity="0.7" />
    </Frame>
  );
}

function Ball() {
  return (
    <Frame>
      <ellipse cx="100" cy="170" rx="40" ry="9" fill={NAVY} opacity="0.12" />
      <circle cx="100" cy="100" r="54" fill="#FF786B" />
      <path d="M58 78c28 18 56 18 84 0" stroke="white" strokeWidth="8" />
      <path d="M58 122c28-18 56-18 84 0" stroke="white" strokeWidth="8" />
      <path d="M100 46v108" stroke="white" strokeWidth="8" />
    </Frame>
  );
}

function Cat() {
  return (
    <Frame>
      <ellipse cx="100" cy="170" rx="46" ry="9" fill={NAVY} opacity="0.12" />
      <path d="M58 78l-8-36 32 22M142 78l8-36-32 22" fill="#F4C27A" />
      <ellipse cx="100" cy="108" rx="52" ry="48" fill="#F4C27A" />
      <circle cx="82" cy="104" r="8" fill={NAVY} />
      <circle cx="118" cy="104" r="8" fill={NAVY} />
      <circle cx="84" cy="102" r="2.5" fill="white" />
      <path d="M92 124c8 8 16 8 24 0" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
      <path d="M100 118l-6 10h12z" fill="#FF9AA2" />
    </Frame>
  );
}

function Dog() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="48" ry="9" fill={NAVY} opacity="0.12" />
      <ellipse cx="58" cy="108" rx="18" ry="28" fill="#C48A4A" />
      <ellipse cx="142" cy="108" rx="18" ry="28" fill="#C48A4A" />
      <ellipse cx="100" cy="110" rx="50" ry="46" fill="#E0A15C" />
      <ellipse cx="100" cy="128" rx="22" ry="16" fill="#F7D7B0" />
      <circle cx="84" cy="102" r="8" fill={NAVY} />
      <circle cx="116" cy="102" r="8" fill={NAVY} />
      <circle cx="86" cy="100" r="2.5" fill="white" />
      <ellipse cx="100" cy="118" rx="8" ry="6" fill="#263238" />
    </Frame>
  );
}

function Egg() {
  return (
    <Frame>
      <ellipse cx="100" cy="170" rx="36" ry="9" fill={NAVY} opacity="0.12" />
      <ellipse cx="100" cy="108" rx="42" ry="56" fill="#FFF4D2" stroke="#E8C96A" strokeWidth="4" />
      <ellipse cx="86" cy="92" rx="12" ry="16" fill="white" opacity="0.8" />
    </Frame>
  );
}

function Fish() {
  return (
    <Frame>
      <ellipse cx="100" cy="172" rx="40" ry="8" fill={NAVY} opacity="0.1" />
      <path d="M158 100l28-22v44z" fill="#FF9A3C" />
      <ellipse cx="96" cy="100" rx="58" ry="36" fill="#59C7F2" />
      <ellipse cx="96" cy="100" rx="58" ry="36" fill="#3AAEE0" opacity="0.35" />
      <path d="M88 72c12 8 12 20 0 28" fill="#FFD84D" />
      <circle cx="64" cy="94" r="10" fill="white" />
      <circle cx="62" cy="94" r="5" fill={NAVY} />
      <circle cx="60" cy="92" r="2" fill="white" />
      <circle cx="150" cy="70" r="6" fill="#B9ECFF" opacity="0.8" />
      <circle cx="168" cy="58" r="4" fill="#B9ECFF" opacity="0.7" />
    </Frame>
  );
}

function Grapes() {
  return (
    <Frame>
      <path d="M108 40c8 24-10 28-22 18" stroke="#2F8A4C" strokeWidth="8" strokeLinecap="round" />
      <circle cx="86" cy="92" r="18" fill="#7B5EA7" />
      <circle cx="114" cy="92" r="18" fill="#6A4C9A" />
      <circle cx="100" cy="114" r="18" fill="#8E6BBF" />
      <circle cx="78" cy="118" r="16" fill="#6A4C9A" />
      <circle cx="122" cy="118" r="16" fill="#7B5EA7" />
      <circle cx="100" cy="138" r="16" fill="#5B3D86" />
    </Frame>
  );
}

function Hat() {
  return (
    <Frame>
      <ellipse cx="100" cy="168" rx="50" ry="10" fill={NAVY} opacity="0.12" />
      <ellipse cx="100" cy="128" rx="70" ry="16" fill="#7657E8" />
      <rect x="62" y="62" width="76" height="68" rx="22" fill="#5B3ED0" />
      <rect x="62" y="108" width="76" height="14" fill="#FFD84D" />
    </Frame>
  );
}

function IceCream() {
  return (
    <Frame>
      <path d="M78 118h44l-22 62z" fill="#E0A15C" />
      <circle cx="100" cy="92" r="40" fill="#FF9FC8" />
      <circle cx="82" cy="80" r="10" fill="#FFD84D" />
    </Frame>
  );
}

function Juice() {
  return (
    <Frame>
      <rect x="70" y="58" width="60" height="88" rx="12" fill="#FFD84D" stroke={NAVY} strokeWidth="4" />
      <rect x="74" y="90" width="52" height="52" rx="8" fill="#FF9A3C" />
      <rect x="92" y="40" width="16" height="22" rx="6" fill="#B9ECFF" />
      <circle cx="100" cy="36" r="8" fill="#FF786B" />
    </Frame>
  );
}

function Kite() {
  return (
    <Frame>
      <path d="M100 28l52 72-52 28-52-28z" fill="#FF786B" />
      <path d="M100 28l52 72-52 28z" fill="#59C7F2" />
      <path d="M100 28v100M48 100h104" stroke="white" strokeWidth="4" />
      <path d="M100 128c12 16 8 28 20 40" stroke="#FFD84D" strokeWidth="5" fill="none" strokeLinecap="round" />
    </Frame>
  );
}

function Lion() {
  return (
    <Frame>
      <circle cx="100" cy="108" r="62" fill="#FFB347" />
      <circle cx="100" cy="112" r="40" fill="#FFE0A3" />
      <circle cx="84" cy="108" r="7" fill={NAVY} />
      <circle cx="116" cy="108" r="7" fill={NAVY} />
      <ellipse cx="100" cy="124" rx="8" ry="6" fill="#E07A5F" />
      <path d="M90 134c8 8 12 8 20 0" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function Moon() {
  return (
    <Frame>
      <circle cx="108" cy="96" r="54" fill="#FFE9A8" />
      <circle cx="130" cy="80" r="44" fill="#F4FBFF" />
      <circle cx="88" cy="110" r="8" fill="#F0D36C" />
      <circle cx="70" cy="86" r="5" fill="#F0D36C" />
    </Frame>
  );
}

function Nest() {
  return (
    <Frame>
      <ellipse cx="100" cy="128" rx="64" ry="28" fill="#C48A4A" />
      <ellipse cx="100" cy="120" rx="48" ry="16" fill="#8B5A2B" />
      <ellipse cx="88" cy="112" rx="14" ry="18" fill="#FFF4D2" />
      <ellipse cx="112" cy="112" rx="14" ry="18" fill="#FFF4D2" />
    </Frame>
  );
}

function Orange() {
  return (
    <Frame>
      <ellipse cx="100" cy="170" rx="40" ry="9" fill={NAVY} opacity="0.12" />
      <circle cx="100" cy="108" r="52" fill="#FF9A3C" />
      <path d="M100 56c10 10 8 18 0 22" stroke="#2F8A4C" strokeWidth="8" strokeLinecap="round" />
      <circle cx="80" cy="92" r="10" fill="#FFC58A" opacity="0.7" />
    </Frame>
  );
}

function Panda() {
  return (
    <Frame>
      <ellipse cx="68" cy="70" rx="22" ry="26" fill={NAVY} />
      <ellipse cx="132" cy="70" rx="22" ry="26" fill={NAVY} />
      <circle cx="100" cy="112" r="50" fill="#F7FBFF" stroke={NAVY} strokeWidth="4" />
      <ellipse cx="80" cy="108" rx="16" ry="18" fill={NAVY} />
      <ellipse cx="120" cy="108" rx="16" ry="18" fill={NAVY} />
      <circle cx="80" cy="108" r="6" fill="white" />
      <circle cx="120" cy="108" r="6" fill="white" />
      <ellipse cx="100" cy="128" rx="10" ry="8" fill={NAVY} />
    </Frame>
  );
}

function Queen() {
  return (
    <Frame>
      <path d="M58 86l14-32 14 24 14-32 14 24 14-32 14 32v12H58z" fill="#FFD84D" />
      <circle cx="72" cy="54" r="6" fill="#FF786B" />
      <circle cx="100" cy="46" r="6" fill="#59C7F2" />
      <circle cx="128" cy="54" r="6" fill="#7657E8" />
      <ellipse cx="100" cy="128" rx="46" ry="42" fill="#F7D7B0" />
      <circle cx="84" cy="124" r="6" fill={NAVY} />
      <circle cx="116" cy="124" r="6" fill={NAVY} />
      <path d="M90 144c8 8 12 8 20 0" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function Rainbow() {
  return (
    <Frame>
      <path d="M40 140c0-44 26-80 60-80s60 36 60 80" stroke="#FF786B" strokeWidth="14" fill="none" />
      <path d="M52 140c0-36 20-64 48-64s48 28 48 64" stroke="#FFD84D" strokeWidth="14" fill="none" />
      <path d="M64 140c0-26 14-48 36-48s36 22 36 48" stroke="#59C7F2" strokeWidth="14" fill="none" />
    </Frame>
  );
}

function Sun() {
  return (
    <Frame>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="100"
          x2={100 + Math.cos((deg * Math.PI) / 180) * 78}
          y2={100 + Math.sin((deg * Math.PI) / 180) * 78}
          stroke="#FFD84D"
          strokeWidth="10"
          strokeLinecap="round"
        />
      ))}
      <circle cx="100" cy="100" r="42" fill="#FFE66D" />
      <circle cx="86" cy="94" r="5" fill={NAVY} />
      <circle cx="114" cy="94" r="5" fill={NAVY} />
      <path d="M88 112c8 10 16 10 24 0" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
    </Frame>
  );
}

function Turtle() {
  return (
    <Frame>
      <ellipse cx="100" cy="120" rx="58" ry="40" fill="#2F8A4C" />
      <ellipse cx="100" cy="120" rx="36" ry="24" fill="#7BC47F" />
      <circle cx="154" cy="108" r="18" fill="#A8D5A2" />
      <circle cx="160" cy="104" r="3" fill={NAVY} />
      <ellipse cx="58" cy="148" rx="12" ry="8" fill="#A8D5A2" />
      <ellipse cx="142" cy="148" rx="12" ry="8" fill="#A8D5A2" />
    </Frame>
  );
}

function Umbrella() {
  return (
    <Frame>
      <path d="M36 108c0-44 28-70 64-70s64 26 64 70H36z" fill="#7657E8" />
      <path d="M100 108v52" stroke="#C48A4A" strokeWidth="8" strokeLinecap="round" />
      <path d="M100 160c12 0 16 8 8 12" stroke="#C48A4A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="40" r="8" fill="#FFD84D" />
    </Frame>
  );
}

function Van() {
  return (
    <Frame>
      <rect x="36" y="84" width="128" height="52" rx="14" fill="#59C7F2" />
      <rect x="108" y="64" width="48" height="32" rx="10" fill="#B9ECFF" />
      <circle cx="66" cy="140" r="14" fill={NAVY} />
      <circle cx="138" cy="140" r="14" fill={NAVY} />
      <circle cx="66" cy="140" r="6" fill="#D0D6DE" />
      <circle cx="138" cy="140" r="6" fill="#D0D6DE" />
    </Frame>
  );
}

function Whale() {
  return (
    <Frame>
      <ellipse cx="96" cy="112" rx="70" ry="36" fill="#67B8E8" />
      <path d="M160 100l28-24 4 40z" fill="#4A9FD4" />
      <circle cx="54" cy="104" r="8" fill="white" />
      <circle cx="52" cy="104" r="4" fill={NAVY} />
      <path d="M40 88c0-16 10-24 10-24" stroke="#B9ECFF" strokeWidth="6" fill="none" />
    </Frame>
  );
}

function Xylophone() {
  return (
    <Frame>
      <rect x="40" y="70" width="120" height="18" rx="6" fill="#FF786B" />
      <rect x="48" y="94" width="104" height="18" rx="6" fill="#FFD84D" />
      <rect x="56" y="118" width="88" height="18" rx="6" fill="#59C7F2" />
      <rect x="64" y="142" width="72" height="18" rx="6" fill="#7657E8" />
    </Frame>
  );
}

function YoYo() {
  return (
    <Frame>
      <path d="M100 28v54" stroke={NAVY} strokeWidth="4" />
      <circle cx="78" cy="118" r="40" fill="#FF786B" />
      <circle cx="122" cy="118" r="40" fill="#59C7F2" />
      <circle cx="100" cy="118" r="10" fill="#FFD84D" />
    </Frame>
  );
}

function Zebra() {
  return (
    <Frame>
      <ellipse cx="100" cy="116" rx="52" ry="46" fill="#F7FBFF" stroke={NAVY} strokeWidth="4" />
      <path d="M70 88v40M88 80v52M108 80v52M126 88v40" stroke={NAVY} strokeWidth="8" />
      <circle cx="84" cy="110" r="6" fill={NAVY} />
      <circle cx="116" cy="110" r="6" fill={NAVY} />
      <ellipse cx="100" cy="130" rx="8" ry="6" fill={NAVY} />
    </Frame>
  );
}

const ART: Record<LetterArtId, () => ReactNode> = {
  apple: Apple,
  ball: Ball,
  cat: Cat,
  dog: Dog,
  egg: Egg,
  fish: Fish,
  grapes: Grapes,
  hat: Hat,
  "ice-cream": IceCream,
  juice: Juice,
  kite: Kite,
  lion: Lion,
  moon: Moon,
  nest: Nest,
  orange: Orange,
  panda: Panda,
  queen: Queen,
  rainbow: Rainbow,
  sun: Sun,
  turtle: Turtle,
  umbrella: Umbrella,
  van: Van,
  whale: Whale,
  xylophone: Xylophone,
  "yo-yo": YoYo,
  zebra: Zebra,
};

export const ILLUSTRATIONS = ART;
export const LETTER_ART_IDS = Object.keys(ART) as LetterArtId[];

export function LetterArt({
  id,
  className,
}: {
  id: LetterArtId;
  className?: string;
}) {
  const Picture = ART[id];
  if (!Picture) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`Missing association illustration for target "${id}"`);
    }
    return (
      <div
        className={`grid place-items-center rounded-2xl bg-[#EEF3FF] font-[family-name:var(--font-display)] text-2xl font-bold text-[#7657E8] ${className ?? "h-full w-full"}`}
      >
        ?
      </div>
    );
  }
  return <div className={className ?? "h-full w-full"}>{Picture()}</div>;
}
