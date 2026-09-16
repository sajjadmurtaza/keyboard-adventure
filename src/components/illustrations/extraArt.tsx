import type { ReactNode } from "react";
import type { LetterArtId } from "@/data/letterAssociations";

const NAVY = "#263238";

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden fill="none">
      {children}
    </svg>
  );
}

function Ant() {
  return (
    <Frame>
      <ellipse cx="100" cy="108" rx="28" ry="18" fill="#5A3A2A" />
      <circle cx="132" cy="104" r="14" fill="#5A3A2A" />
      <path d="M72 100c-16-10-22-4-24 8M72 116c-16 8-20 2-18-10" stroke={NAVY} strokeWidth="4" />
      <path d="M144 92l12-16M148 96l16-8" stroke={NAVY} strokeWidth="3" />
    </Frame>
  );
}

function Airplane() {
  return (
    <Frame>
      <path d="M36 108h92l36-28v20l-20 16 28 8v16l-40-8-20 28h-16l12-28H52z" fill="#59C7F2" />
      <path d="M52 108h40l8 12H60z" fill="#FF786B" />
    </Frame>
  );
}

function Bear() {
  return (
    <Frame>
      <circle cx="68" cy="72" r="22" fill="#C48A4A" />
      <circle cx="132" cy="72" r="22" fill="#C48A4A" />
      <ellipse cx="100" cy="116" rx="52" ry="46" fill="#E0A15C" />
      <circle cx="84" cy="110" r="7" fill={NAVY} />
      <circle cx="116" cy="110" r="7" fill={NAVY} />
      <ellipse cx="100" cy="130" rx="12" ry="9" fill="#8B5A2B" />
    </Frame>
  );
}

function Bus() {
  return (
    <Frame>
      <rect x="28" y="70" width="144" height="64" rx="14" fill="#FFD84D" />
      <rect x="40" y="82" width="28" height="22" rx="4" fill="#B9ECFF" />
      <rect x="76" y="82" width="28" height="22" rx="4" fill="#B9ECFF" />
      <rect x="112" y="82" width="28" height="22" rx="4" fill="#B9ECFF" />
      <circle cx="58" cy="142" r="14" fill={NAVY} />
      <circle cx="142" cy="142" r="14" fill={NAVY} />
    </Frame>
  );
}

function Car() {
  return (
    <Frame>
      <path d="M40 118h120l-12-28H72z" fill="#FF786B" />
      <rect x="32" y="114" width="136" height="28" rx="10" fill="#E85A54" />
      <rect x="78" y="92" width="36" height="20" rx="6" fill="#B9ECFF" />
      <circle cx="62" cy="146" r="14" fill={NAVY} />
      <circle cx="140" cy="146" r="14" fill={NAVY} />
    </Frame>
  );
}

function Cake() {
  return (
    <Frame>
      <rect x="50" y="100" width="100" height="48" rx="10" fill="#FF9FC8" />
      <rect x="58" y="72" width="84" height="36" rx="10" fill="#FFF4D2" />
      <path d="M58 110c12 10 24 10 36 0s24 10 36 0 24 10 36 0" stroke="#E85A54" strokeWidth="6" fill="none" />
      <rect x="94" y="52" width="12" height="24" fill="#FFD84D" />
      <circle cx="100" cy="48" r="8" fill="#FF786B" />
    </Frame>
  );
}

function Duck() {
  return (
    <Frame>
      <ellipse cx="100" cy="120" rx="50" ry="32" fill="#FFD84D" />
      <circle cx="148" cy="96" r="22" fill="#FFE66D" />
      <path d="M168 96h22l-22 10z" fill="#FF9A3C" />
      <circle cx="156" cy="90" r="4" fill={NAVY} />
    </Frame>
  );
}

function Drum() {
  return (
    <Frame>
      <ellipse cx="100" cy="78" rx="54" ry="18" fill="#F7FBFF" stroke="#FF786B" strokeWidth="6" />
      <path d="M46 78v52c0 16 24 28 54 28s54-12 54-28V78" fill="#FF786B" />
      <path d="M70 90l60 48M130 90L70 138" stroke="#FFD84D" strokeWidth="5" />
    </Frame>
  );
}

function Elephant() {
  return (
    <Frame>
      <ellipse cx="96" cy="118" rx="54" ry="40" fill="#B7C4D4" />
      <circle cx="140" cy="100" r="28" fill="#C9D4E2" />
      <path d="M160 108c18 8 22 28 4 40" stroke="#B7C4D4" strokeWidth="14" fill="none" />
      <circle cx="150" cy="94" r="5" fill={NAVY} />
    </Frame>
  );
}

function Envelope() {
  return (
    <Frame>
      <rect x="36" y="64" width="128" height="80" rx="8" fill="#FFF4D2" stroke="#E8C96A" strokeWidth="4" />
      <path d="M36 70l64 48 64-48" stroke="#FF786B" strokeWidth="6" fill="none" />
    </Frame>
  );
}

function Frog() {
  return (
    <Frame>
      <ellipse cx="100" cy="122" rx="54" ry="36" fill="#2F8A4C" />
      <circle cx="72" cy="88" r="18" fill="#7BC47F" />
      <circle cx="128" cy="88" r="18" fill="#7BC47F" />
      <circle cx="72" cy="86" r="6" fill={NAVY} />
      <circle cx="128" cy="86" r="6" fill={NAVY} />
    </Frame>
  );
}

function Flower() {
  return (
    <Frame>
      <circle cx="100" cy="96" r="18" fill="#FFD84D" />
      <circle cx="64" cy="96" r="22" fill="#FF9FC8" />
      <circle cx="136" cy="96" r="22" fill="#FF9FC8" />
      <circle cx="100" cy="62" r="22" fill="#FF786B" />
      <circle cx="100" cy="130" r="22" fill="#FF786B" />
      <path d="M100 148v28" stroke="#2F8A4C" strokeWidth="8" />
    </Frame>
  );
}

function Goat() {
  return (
    <Frame>
      <ellipse cx="96" cy="120" rx="48" ry="36" fill="#E8E1D4" />
      <circle cx="142" cy="100" r="22" fill="#F3EEE6" />
      <path d="M152 78l8-22M132 78l-6-22" stroke="#C48A4A" strokeWidth="5" />
      <circle cx="150" cy="98" r="4" fill={NAVY} />
    </Frame>
  );
}

function Guitar() {
  return (
    <Frame>
      <ellipse cx="86" cy="128" rx="36" ry="42" fill="#C48A4A" />
      <ellipse cx="110" cy="96" rx="24" ry="28" fill="#E0A15C" />
      <rect x="120" y="40" width="14" height="64" rx="4" fill="#8B5A2B" />
      <circle cx="88" cy="130" r="10" fill={NAVY} />
    </Frame>
  );
}

function House() {
  return (
    <Frame>
      <path d="M36 108l64-52 64 52v56H36z" fill="#FF9A3C" />
      <rect x="84" y="120" width="32" height="44" fill="#8B5A2B" />
      <rect x="50" y="118" width="24" height="20" fill="#B9ECFF" />
    </Frame>
  );
}

function Horse() {
  return (
    <Frame>
      <ellipse cx="90" cy="118" rx="50" ry="32" fill="#C48A4A" />
      <path d="M128 108l28-36 10 8-22 40z" fill="#E0A15C" />
      <circle cx="158" cy="78" r="4" fill={NAVY} />
      <path d="M70 148v22M110 148v22" stroke="#8B5A2B" strokeWidth="8" />
    </Frame>
  );
}

function Igloo() {
  return (
    <Frame>
      <path d="M40 140c0-52 26-84 60-84s60 32 60 84H40z" fill="#E8F4FF" stroke="#9EC7E8" strokeWidth="6" />
      <rect x="84" y="112" width="32" height="28" rx="8" fill="#7BA3C4" />
    </Frame>
  );
}

function Insect() {
  return (
    <Frame>
      <ellipse cx="100" cy="116" rx="22" ry="36" fill="#7BC47F" />
      <circle cx="100" cy="74" r="16" fill="#2F8A4C" />
      <path d="M78 100c-24-20-20-8-18 8M122 100c24-20 20-8 18 8" stroke="#59C7F2" strokeWidth="6" />
    </Frame>
  );
}

function Jelly() {
  return (
    <Frame>
      <path d="M56 148c0-52 16-84 44-84s44 32 44 84" fill="#FF9FC8" />
      <ellipse cx="100" cy="148" rx="46" ry="12" fill="#FF786B" />
      <circle cx="86" cy="100" r="8" fill="white" opacity="0.7" />
    </Frame>
  );
}

function Jacket() {
  return (
    <Frame>
      <path d="M60 56l40 18 40-18 16 28v76H44V84z" fill="#7657E8" />
      <path d="M100 74v86" stroke="#FFD84D" strokeWidth="6" />
      <circle cx="88" cy="110" r="6" fill="#FFD84D" />
    </Frame>
  );
}

function Key() {
  return (
    <Frame>
      <circle cx="70" cy="100" r="28" fill="#FFD84D" />
      <circle cx="70" cy="100" r="10" fill="#F4FBFF" />
      <rect x="90" y="92" width="70" height="16" rx="6" fill="#E8C96A" />
      <rect x="140" y="108" width="10" height="18" fill="#E8C96A" />
    </Frame>
  );
}

function King() {
  return (
    <Frame>
      <path d="M62 80l14-28 12 22 12-28 12 22 12-28 14 28v10H62z" fill="#FFD84D" />
      <ellipse cx="100" cy="128" rx="44" ry="40" fill="#F7D7B0" />
      <circle cx="84" cy="122" r="6" fill={NAVY} />
      <circle cx="116" cy="122" r="6" fill={NAVY} />
    </Frame>
  );
}

function Leaf() {
  return (
    <Frame>
      <path d="M100 40c48 20 64 70 8 116-56-12-64-70-8-116z" fill="#2F8A4C" />
      <path d="M100 52c0 40-6 70-20 96" stroke="#7BC47F" strokeWidth="5" />
    </Frame>
  );
}

function Lamp() {
  return (
    <Frame>
      <path d="M64 96h72l-12 40H76z" fill="#FFD84D" />
      <rect x="92" y="136" width="16" height="28" fill="#8B5A2B" />
      <ellipse cx="100" cy="168" rx="28" ry="8" fill="#C48A4A" />
    </Frame>
  );
}

function Mouse() {
  return (
    <Frame>
      <circle cx="70" cy="78" r="22" fill="#D0D6DE" />
      <circle cx="130" cy="78" r="22" fill="#D0D6DE" />
      <ellipse cx="100" cy="118" rx="42" ry="36" fill="#E8ECF2" />
      <circle cx="88" cy="114" r="5" fill={NAVY} />
      <circle cx="112" cy="114" r="5" fill={NAVY} />
    </Frame>
  );
}

function Milk() {
  return (
    <Frame>
      <path d="M78 52h44l12 20v88H66V72z" fill="#F7FBFF" stroke="#B7C4D4" strokeWidth="4" />
      <rect x="70" y="96" width="60" height="60" fill="#EEF6FF" />
    </Frame>
  );
}

function Nose() {
  return (
    <Frame>
      <ellipse cx="100" cy="108" rx="36" ry="48" fill="#F7D7B0" />
      <ellipse cx="88" cy="124" rx="8" ry="10" fill="#E07A5F" />
      <ellipse cx="112" cy="124" rx="8" ry="10" fill="#E07A5F" />
    </Frame>
  );
}

function Nut() {
  return (
    <Frame>
      <ellipse cx="100" cy="112" rx="42" ry="36" fill="#C48A4A" />
      <ellipse cx="100" cy="108" rx="22" ry="16" fill="#E0A15C" />
      <path d="M100 76c8 8 8 16 0 20" stroke="#8B5A2B" strokeWidth="6" />
    </Frame>
  );
}

function Owl() {
  return (
    <Frame>
      <ellipse cx="100" cy="116" rx="48" ry="52" fill="#C48A4A" />
      <circle cx="80" cy="104" r="18" fill="#FFF4D2" />
      <circle cx="120" cy="104" r="18" fill="#FFF4D2" />
      <circle cx="80" cy="104" r="7" fill={NAVY} />
      <circle cx="120" cy="104" r="7" fill={NAVY} />
      <path d="M92 132l8 10 8-10z" fill="#FF9A3C" />
    </Frame>
  );
}

function Octopus() {
  return (
    <Frame>
      <circle cx="100" cy="86" r="40" fill="#FF9FC8" />
      <path d="M70 112c0 28-16 44-8 52M90 118c0 32-8 48 4 52M110 118c0 32 8 48-4 52M130 112c0 28 16 44 8 52" stroke="#E85A9A" strokeWidth="10" fill="none" />
      <circle cx="86" cy="82" r="6" fill={NAVY} />
      <circle cx="114" cy="82" r="6" fill={NAVY} />
    </Frame>
  );
}

function Pig() {
  return (
    <Frame>
      <ellipse cx="100" cy="112" rx="52" ry="42" fill="#FF9FC8" />
      <circle cx="64" cy="78" r="12" fill="#FF786B" />
      <circle cx="136" cy="78" r="12" fill="#FF786B" />
      <ellipse cx="100" cy="122" rx="16" ry="12" fill="#FF786B" />
      <circle cx="84" cy="104" r="6" fill={NAVY} />
      <circle cx="116" cy="104" r="6" fill={NAVY} />
    </Frame>
  );
}

function Pencil() {
  return (
    <Frame>
      <path d="M70 40h60v96l-30 32-30-32z" fill="#FFD84D" />
      <rect x="70" y="40" width="60" height="24" fill="#FF786B" />
      <path d="M88 136l12 20 12-20z" fill="#F7D7B0" />
    </Frame>
  );
}

function Quilt() {
  return (
    <Frame>
      <rect x="40" y="50" width="120" height="108" rx="12" fill="#F7FBFF" stroke="#7657E8" strokeWidth="4" />
      <rect x="40" y="50" width="60" height="54" fill="#FF9FC8" />
      <rect x="100" y="104" width="60" height="54" fill="#59C7F2" />
      <rect x="100" y="50" width="60" height="54" fill="#FFD84D" />
    </Frame>
  );
}

function Question() {
  return (
    <Frame>
      <circle cx="100" cy="100" r="58" fill="#7657E8" />
      <text x="100" y="122" textAnchor="middle" fontSize="92" fontWeight="700" fill="white">
        ?
      </text>
    </Frame>
  );
}

function Rocket() {
  return (
    <Frame>
      <path d="M100 28c28 28 32 88 0 132-32-44-28-104 0-132z" fill="#FF786B" />
      <circle cx="100" cy="88" r="14" fill="#B9ECFF" />
      <path d="M78 120l-18 28 28-10M122 120l18 28-28-10" fill="#FFD84D" />
    </Frame>
  );
}

function Robot() {
  return (
    <Frame>
      <rect x="58" y="56" width="84" height="70" rx="12" fill="#B7C4D4" />
      <rect x="70" y="128" width="60" height="28" rx="8" fill="#8AA0B8" />
      <circle cx="82" cy="88" r="10" fill="#59C7F2" />
      <circle cx="118" cy="88" r="10" fill="#59C7F2" />
    </Frame>
  );
}

function Star() {
  return (
    <Frame>
      <path d="M100 36l16 42h44l-34 28 12 44-38-24-38 24 12-44-34-28h44z" fill="#FFD84D" />
    </Frame>
  );
}

function Snake() {
  return (
    <Frame>
      <path d="M40 128c24-40 40-8 56-8s24-40 48-8 20 28 20 28" stroke="#2F8A4C" strokeWidth="18" fill="none" strokeLinecap="round" />
      <circle cx="160" cy="132" r="6" fill={NAVY} />
    </Frame>
  );
}

function Tree() {
  return (
    <Frame>
      <rect x="88" y="120" width="24" height="44" fill="#8B5A2B" />
      <circle cx="100" cy="88" r="48" fill="#2F8A4C" />
      <circle cx="72" cy="104" r="28" fill="#7BC47F" />
    </Frame>
  );
}

function Train() {
  return (
    <Frame>
      <rect x="36" y="88" width="56" height="48" rx="8" fill="#FF786B" />
      <rect x="96" y="100" width="68" height="36" rx="8" fill="#59C7F2" />
      <rect x="44" y="70" width="28" height="24" fill="#B9ECFF" />
      <circle cx="58" cy="144" r="12" fill={NAVY} />
      <circle cx="120" cy="144" r="12" fill={NAVY} />
      <circle cx="148" cy="144" r="12" fill={NAVY} />
    </Frame>
  );
}

function Unicorn() {
  return (
    <Frame>
      <ellipse cx="92" cy="120" rx="48" ry="34" fill="#F7FBFF" stroke="#FF9FC8" strokeWidth="4" />
      <path d="M128 104l24-40 8 14-18 36z" fill="#F7FBFF" stroke="#FF9FC8" strokeWidth="4" />
      <path d="M148 64l-4-28 16 20z" fill="#FFD84D" />
      <circle cx="154" cy="78" r="4" fill={NAVY} />
    </Frame>
  );
}

function Ukulele() {
  return (
    <Frame>
      <circle cx="86" cy="124" r="36" fill="#E0A15C" />
      <circle cx="118" cy="88" r="22" fill="#C48A4A" />
      <rect x="128" y="40" width="12" height="52" rx="4" fill="#8B5A2B" />
      <circle cx="86" cy="124" r="10" fill="#8B5A2B" />
    </Frame>
  );
}

function Violin() {
  return (
    <Frame>
      <ellipse cx="92" cy="120" rx="34" ry="48" fill="#8B5A2B" />
      <rect x="108" y="44" width="10" height="70" fill="#C48A4A" />
      <path d="M80 100c16 8 16 20 0 28" stroke="#FFD84D" strokeWidth="4" fill="none" />
    </Frame>
  );
}

function Volcano() {
  return (
    <Frame>
      <path d="M36 156l40-84h48l40 84z" fill="#8B5A2B" />
      <path d="M84 72l8-28 8 16 8-20 8 32" fill="#FF786B" />
      <circle cx="100" cy="48" r="10" fill="#FF9A3C" />
    </Frame>
  );
}

function Watch() {
  return (
    <Frame>
      <rect x="88" y="28" width="24" height="36" rx="8" fill="#7657E8" />
      <rect x="88" y="136" width="24" height="36" rx="8" fill="#7657E8" />
      <circle cx="100" cy="100" r="40" fill="#F7FBFF" stroke="#34364A" strokeWidth="8" />
      <path d="M100 100V72M100 100l18 12" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
    </Frame>
  );
}

function Wagon() {
  return (
    <Frame>
      <rect x="40" y="88" width="120" height="40" rx="8" fill="#FF786B" />
      <path d="M40 88l36-28" stroke="#8B5A2B" strokeWidth="8" />
      <circle cx="70" cy="140" r="16" fill={NAVY} />
      <circle cx="138" cy="140" r="16" fill={NAVY} />
    </Frame>
  );
}

function XRay() {
  return (
    <Frame>
      <rect x="54" y="40" width="92" height="128" rx="12" fill="#E8F4FF" stroke="#59C7F2" strokeWidth="6" />
      <path d="M100 64v80M84 88h32M84 128h32" stroke={NAVY} strokeWidth="8" />
    </Frame>
  );
}

function XMarks() {
  return (
    <Frame>
      <ellipse cx="100" cy="108" rx="70" ry="52" fill="#FFF4D2" stroke="#C48A4A" strokeWidth="4" />
      <path d="M70 80l60 56M130 80L70 136" stroke="#FF786B" strokeWidth="12" strokeLinecap="round" />
    </Frame>
  );
}

function Yarn() {
  return (
    <Frame>
      <circle cx="100" cy="108" r="52" fill="#FF9FC8" />
      <path d="M70 88c40 8 48 28 20 48M120 72c-8 36 8 56 28 48" stroke="white" strokeWidth="6" />
    </Frame>
  );
}

function Yacht() {
  return (
    <Frame>
      <path d="M40 128h120l-20 28H60z" fill="#59C7F2" />
      <path d="M100 48l44 76H100z" fill="#F7FBFF" />
      <path d="M100 56v96" stroke="#8B5A2B" strokeWidth="6" />
    </Frame>
  );
}

function Zoo() {
  return (
    <Frame>
      <rect x="36" y="48" width="128" height="104" rx="12" fill="#FFF4D2" stroke="#C48A4A" strokeWidth="6" />
      {[52, 76, 100, 124, 148].map((x) => (
        <rect key={x} x={x} y="56" width="10" height="88" fill="#8B5A2B" />
      ))}
    </Frame>
  );
}

function Zipper() {
  return (
    <Frame>
      <rect x="88" y="36" width="24" height="128" rx="8" fill="#B7C4D4" />
      {[52, 72, 92, 112, 132, 152].map((y) => (
        <rect key={y} x="80" y={y} width="40" height="10" rx="3" fill="#FFD84D" />
      ))}
    </Frame>
  );
}

export const EXTRA_ART: Partial<Record<LetterArtId, () => ReactNode>> = {
  ant: Ant,
  airplane: Airplane,
  bear: Bear,
  bus: Bus,
  car: Car,
  cake: Cake,
  duck: Duck,
  drum: Drum,
  elephant: Elephant,
  envelope: Envelope,
  frog: Frog,
  flower: Flower,
  goat: Goat,
  guitar: Guitar,
  house: House,
  horse: Horse,
  igloo: Igloo,
  insect: Insect,
  jelly: Jelly,
  jacket: Jacket,
  key: Key,
  king: King,
  leaf: Leaf,
  lamp: Lamp,
  mouse: Mouse,
  milk: Milk,
  nose: Nose,
  nut: Nut,
  owl: Owl,
  octopus: Octopus,
  pig: Pig,
  pencil: Pencil,
  quilt: Quilt,
  question: Question,
  rocket: Rocket,
  robot: Robot,
  star: Star,
  snake: Snake,
  tree: Tree,
  train: Train,
  unicorn: Unicorn,
  ukulele: Ukulele,
  violin: Violin,
  volcano: Volcano,
  watch: Watch,
  wagon: Wagon,
  "x-ray": XRay,
  "x-marks": XMarks,
  yarn: Yarn,
  yacht: Yacht,
  zoo: Zoo,
  zipper: Zipper,
};
