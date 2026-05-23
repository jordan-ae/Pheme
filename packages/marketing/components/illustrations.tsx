/* ============================================================
   Pheme illustrations
   Hand-drawn-feeling SVG iconography built from simple primitives.
   Mythology vocabulary: winged messenger, scrolls, columns, stars,
   doves, oracle bowl, laurel, amphora, lyre, agora.
   All strokes share a deep navy ink; fills come from the pastel
   palette in globals.css. Pure SVG — safe as server components.
   ============================================================ */
import type { CSSProperties } from "react";

const INK = "#1c1b3d";

function Stroke({
  d,
  color = INK,
  width = 1.6,
  ...rest
}: {
  d: string;
  color?: string;
  width?: number;
} & React.SVGProps<SVGPathElement>) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    />
  );
}

/* Brand mark — a stylized winged trumpet (Pheme's attribute) */
export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" fill="#fbf6ee" stroke={INK} strokeWidth="1.4" />
      <path
        d="M9 23 L24 18 L33 14 Q36 18 33 24 L24 22 L9 25 Z"
        fill="#c9b8f0"
        stroke={INK}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M14 17 Q11 12 16 9 Q15 13 18 14 Q15 14 17 17 Z"
        fill="#f4b59c"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M35 19 l2 -2 M36 14 l1.5 -1 M37 22 l2 1" stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M34 9 l0.8 1.8 l1.8 0.6 l-1.8 0.6 l-0.8 1.8 l-0.8 -1.8 l-1.8 -0.6 l1.8 -0.6 z" fill={INK} />
    </svg>
  );
}

/* Wordmark — "Pheme" with the brand mark inline */
export function Wordmark() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <BrandMark size={34} />
      </span>
      <span>Pheme</span>
    </span>
  );
}

/* Hero centerpiece scenes — float behind the headline */
export function HeroSceneLeft() {
  return (
    <svg viewBox="0 0 360 420" width="100%" height="100%" fill="none">
      <g opacity="0.95">
        <path
          d="M30 170 Q90 140 170 160 Q220 175 200 210 Q160 230 90 220 Q40 215 30 170 Z"
          fill="#b9d1ea"
          stroke={INK}
          strokeWidth="1.4"
        />
        <Stroke d="M50 170 Q60 165 70 168 M90 174 Q100 170 110 175 M130 178 Q142 174 158 178" color="#5e7a98" width={1} />
        <g transform="translate(60 130)">
          <rect x="0" y="0" width="6" height="36" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <rect x="-2" y="-3" width="10" height="4" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <rect x="-2" y="34" width="10" height="4" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
        </g>
        <g transform="translate(80 138)">
          <rect x="0" y="0" width="6" height="30" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <rect x="-2" y="-3" width="10" height="4" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <rect x="-2" y="28" width="10" height="4" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
        </g>
        <g transform="translate(100 132)">
          <rect x="0" y="0" width="6" height="36" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <rect x="-2" y="-3" width="10" height="4" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <rect x="-2" y="34" width="10" height="4" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
        </g>
        <path d="M55 125 L114 125 L92 110 L78 110 Z" fill="#f4b59c" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        <g transform="translate(140 132)">
          <rect x="3" y="22" width="3" height="16" fill="#a07a52" stroke={INK} strokeWidth="1" />
          <circle cx="4.5" cy="18" r="14" fill="#a8d6c0" stroke={INK} strokeWidth="1.2" />
          <Stroke d="M-2 16 Q4 14 11 18 M-2 22 Q5 20 10 22" color="#588f74" width={0.9} />
        </g>
      </g>

      <Stroke
        d="M120 100 Q170 60 230 90 Q280 110 320 80"
        color={INK}
        width={1.4}
        strokeDasharray="0 6 18 6"
        className="march march-slow"
      />

      <g>
        <Stroke d="M180 50 L210 70 L246 58 L274 80" color={INK} width={0.9} />
        <g fill="#1c1b3d">
          <circle cx="180" cy="50" r="2" />
          <circle cx="210" cy="70" r="2" />
          <circle cx="246" cy="58" r="2.4" />
          <circle cx="274" cy="80" r="2" />
        </g>
        <g className="twinkle" style={{ transformOrigin: "246px 58px" }}>
          <path d="M246 50 l1.3 6 l6 1.3 l-6 1.3 l-1.3 6 l-1.3 -6 l-6 -1.3 l6 -1.3 z" fill="#8f7cd4" />
        </g>
      </g>

      <g transform="translate(40 300)">
        <path d="M0 18 Q60 -2 120 18 L110 50 Q60 60 10 50 Z" fill="#c9b8f0" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <ellipse cx="60" cy="18" rx="60" ry="8" fill="#fbf6ee" stroke={INK} strokeWidth="1.4" />
        <Stroke d="M20 18 Q35 14 50 18 M58 17 Q72 14 86 18 M92 18 Q100 16 108 18" color="#5e7a98" width={0.9} />
        <rect x="44" y="50" width="32" height="6" fill="#f4b59c" stroke={INK} strokeWidth="1.3" />
        <rect x="36" y="56" width="48" height="5" fill="#f4b59c" stroke={INK} strokeWidth="1.3" />
        <g transform="translate(54 -8)">
          <rect x="0" y="0" width="14" height="18" rx="2" fill="#fbf6ee" stroke={INK} strokeWidth="1.2" />
          <Stroke d="M3 5 H11 M3 9 H10 M3 13 H8" color="#5e7a98" width={0.9} />
        </g>
      </g>

      <g className="twinkle" style={{ transformOrigin: "320px 200px", animationDelay: "1.4s" }}>
        <path d="M320 192 l1.2 5.5 l5.5 1.2 l-5.5 1.2 l-1.2 5.5 l-1.2 -5.5 l-5.5 -1.2 l5.5 -1.2 z" fill="#e58a6e" />
      </g>
    </svg>
  );
}

export function HeroSceneRight() {
  return (
    <svg viewBox="0 0 360 420" width="100%" height="100%" fill="none">
      <g opacity="0.9">
        <path
          d="M40 60 Q60 30 100 38 Q120 18 156 30 Q190 14 210 40 Q236 36 240 60 Q220 80 180 76 Q150 90 120 80 Q90 92 70 80 Q48 84 40 60 Z"
          fill="#fbf6ee"
          stroke={INK}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="245" cy="44" r="22" fill="#f3d684" stroke={INK} strokeWidth="1.4" />
        <Stroke d="M270 30 l10 -6 M276 50 l12 0 M268 64 l8 8 M250 22 l4 -10 M232 22 l-3 -8" color="#aa7530" width={1.2} />
      </g>

      <g transform="translate(150 140)">
        <path d="M-30 30 Q-60 10 -70 40 Q-50 38 -34 50 Z" fill="#f4b59c" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <Stroke d="M-60 28 Q-55 32 -50 30 M-58 34 Q-52 38 -46 36 M-54 42 Q-48 44 -42 42" color="#a64f33" width={1} />
        <path
          d="M0 0 Q14 6 18 30 Q22 60 10 76 Q-12 76 -22 60 Q-18 30 -12 8 Q-4 -2 0 0 Z"
          fill="#c9b8f0"
          stroke={INK}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <Stroke d="M-10 20 Q-2 24 10 22 M-12 36 Q-2 40 14 36 M-14 52 Q-4 56 12 50" color="#5e7a98" width={0.9} />
        <circle cx="0" cy="-10" r="10" fill="#fbf6ee" stroke={INK} strokeWidth="1.4" />
        <path d="M-10 -14 Q0 -22 10 -14" stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="0" cy="-20" r="2" fill="#f3d684" stroke={INK} strokeWidth="1" />
        <g transform="translate(14 24)">
          <rect x="0" y="0" width="40" height="14" rx="3" fill="#fbf6ee" stroke={INK} strokeWidth="1.3" />
          <Stroke d="M5 4 H32 M5 8 H28 M5 11 H22" color="#5e7a98" width={0.9} />
          <circle cx="0" cy="7" r="3" fill="#f4b59c" stroke={INK} strokeWidth="1.2" />
          <circle cx="40" cy="7" r="3" fill="#f4b59c" stroke={INK} strokeWidth="1.2" />
        </g>
        <path d="M14 8 Q40 -8 50 18 Q34 16 18 32 Z" fill="#a8d6c0" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <Stroke d="M22 14 Q30 14 36 18 M24 22 Q32 22 38 26" color="#2f7a5e" width={1} />
      </g>

      <g transform="translate(280 220)" className="drift" style={{ "--r": "6deg" } as CSSProperties}>
        <path d="M0 0 Q12 -8 24 0 Q30 6 22 10 Q14 14 6 12 Q-4 10 0 0 Z" fill="#fbf6ee" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M14 -2 Q8 -10 0 -6 Q4 0 14 -2 Z" fill="#b9d1ea" stroke={INK} strokeWidth="1.2" />
        <circle cx="24" cy="2" r="1.4" fill={INK} />
        <path d="M28 4 l4 0" stroke="#aa7530" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      <Stroke d="M180 230 Q200 240 220 234 Q240 226 264 232" color={INK} width={1.2} strokeDasharray="2 6" className="march" />

      <g transform="translate(20 300)">
        <path
          d="M0 80 L40 30 Q60 20 80 30 L120 80 L140 80 L180 30 Q200 20 220 30 L260 80 L300 80 Q320 70 320 80 L320 100 L0 100 Z"
          fill="#f4b59c"
          stroke={INK}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M60 80 Q60 50 80 50 Q100 50 100 80" stroke={INK} strokeWidth="1.3" fill="#fbf6ee" />
        <path d="M180 80 Q180 50 200 50 Q220 50 220 80" stroke={INK} strokeWidth="1.3" fill="#fbf6ee" />
        <Stroke d="M30 40 Q40 36 50 40 M90 28 Q100 26 110 30 M210 28 Q220 26 230 30" color="#a64f33" width={1} />
      </g>

      <g className="twinkle" style={{ transformOrigin: "60px 200px" }}>
        <path d="M60 192 l1 4.8 l4.8 1 l-4.8 1 l-1 4.8 l-1 -4.8 l-4.8 -1 l4.8 -1 z" fill="#8f7cd4" />
      </g>
      <g className="twinkle" style={{ transformOrigin: "320px 120px", animationDelay: "2s" }}>
        <path d="M320 112 l1 4.8 l4.8 1 l-4.8 1 l-1 4.8 l-1 -4.8 l-4.8 -1 l4.8 -1 z" fill="#e58a6e" />
      </g>
    </svg>
  );
}

/* Squiggle accent under italic words */
export function Squiggle({ color = "var(--accent)", animated = false }: { color?: string; animated?: boolean }) {
  return (
    <svg className={"underline-swoosh" + (animated ? " squiggle-draw" : "")} viewBox="0 0 220 14" preserveAspectRatio="none">
      <path d="M2 9 Q22 1 44 8 T88 9 T132 8 T176 9 T218 6" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

type MotifProps = { size?: number };

export function MotifScroll({ size = 56 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <rect x="6" y="14" width="44" height="28" rx="3" fill="#fbf6ee" stroke={INK} strokeWidth="1.5" />
      <Stroke d="M12 22 H42 M12 28 H38 M12 34 H32" color="#5e7a98" width={1.1} />
      <ellipse cx="6" cy="28" rx="3" ry="14" fill="#f4b59c" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="50" cy="28" rx="3" ry="14" fill="#f4b59c" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

export function MotifAmphora({ size = 64 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M22 8 Q22 14 18 18 Q12 24 14 36 Q16 50 24 54 L40 54 Q48 50 50 36 Q52 24 46 18 Q42 14 42 8 Z" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M22 12 Q14 14 14 22" stroke={INK} strokeWidth="1.5" fill="none" />
      <path d="M42 12 Q50 14 50 22" stroke={INK} strokeWidth="1.5" fill="none" />
      <Stroke d="M20 30 Q32 36 44 30" color="#5e7a98" width={1.1} />
      <Stroke d="M20 40 Q32 46 44 40" color="#5e7a98" width={1.1} />
      <rect x="28" y="54" width="8" height="4" fill="#f4b59c" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

export function MotifColumn({ size = 64 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="22" y="14" width="20" height="38" fill="#fbf6ee" stroke={INK} strokeWidth="1.5" />
      <Stroke d="M26 18 V50 M30 18 V50 M34 18 V50 M38 18 V50" color="#aa9d80" width={1.1} />
      <rect x="18" y="10" width="28" height="6" fill="#f4b59c" stroke={INK} strokeWidth="1.5" />
      <rect x="14" y="52" width="36" height="6" fill="#f4b59c" stroke={INK} strokeWidth="1.5" />
      <rect x="18" y="6" width="28" height="4" fill="#a8d6c0" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}

export function MotifDove({ size = 64 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M8 36 Q22 18 42 26 Q56 30 56 38 Q48 44 36 42 Q24 50 14 46 Q4 44 8 36 Z" fill="#fbf6ee" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 26 Q22 12 14 18 Q18 28 30 28 Z" fill="#b9d1ea" stroke={INK} strokeWidth="1.4" />
      <circle cx="50" cy="33" r="1.8" fill={INK} />
      <path d="M56 36 l6 1" stroke="#aa7530" strokeWidth="1.6" strokeLinecap="round" />
      <Stroke d="M18 42 Q24 44 30 42 M32 44 Q38 46 44 44" color="#5e7a98" width={1} />
    </svg>
  );
}

export function MotifLyre({ size = 64 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M16 50 Q10 30 18 16 Q22 12 28 16" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M48 50 Q54 30 46 16 Q42 12 36 16" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <rect x="22" y="44" width="20" height="6" rx="2" fill="#f4b59c" stroke={INK} strokeWidth="1.5" />
      <Stroke d="M24 18 V44 M28 18 V44 M32 18 V44 M36 18 V44 M40 18 V44" color="#aa7530" width={0.9} />
      <ellipse cx="32" cy="14" rx="14" ry="3" fill="#a8d6c0" stroke={INK} strokeWidth="1.4" />
    </svg>
  );
}

export function MotifLaurel({ size = 80 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M40 70 Q14 56 14 30" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M40 70 Q66 56 66 30" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <ellipse cx={18 + i * 2} cy={56 - i * 7} rx="6" ry="3" fill="#a8d6c0" stroke={INK} strokeWidth="1.2" transform={`rotate(${-30 - i * 8} ${18 + i * 2} ${56 - i * 7})`} />
          <ellipse cx={62 - i * 2} cy={56 - i * 7} rx="6" ry="3" fill="#a8d6c0" stroke={INK} strokeWidth="1.2" transform={`rotate(${30 + i * 8} ${62 - i * 2} ${56 - i * 7})`} />
        </g>
      ))}
    </svg>
  );
}

export function MotifStar({ size = 24, color = "#f3d684" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 l2.4 6.6 l6.6 2.4 l-6.6 2.4 l-2.4 6.6 l-2.4 -6.6 l-6.6 -2.4 l6.6 -2.4 z" fill={color} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifKey({ size = 64 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="20" cy="32" r="10" fill="#f4b59c" stroke={INK} strokeWidth="1.5" />
      <circle cx="20" cy="32" r="3" fill="#fbf6ee" stroke={INK} strokeWidth="1.4" />
      <rect x="30" y="29" width="28" height="6" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" />
      <rect x="48" y="35" width="5" height="6" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" />
      <rect x="40" y="35" width="5" height="6" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}

export function MotifMap({ size = 80 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M6 18 L28 12 L52 20 L74 14 L74 64 L52 70 L28 62 L6 68 Z" fill="#fbf6ee" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 12 V62 M52 20 V70" stroke={INK} strokeWidth="1.4" />
      <Stroke d="M12 28 Q22 30 26 36 Q40 42 50 38 Q60 32 70 38" color="#e58a6e" width={1.4} strokeDasharray="3 3" />
      <circle cx="12" cy="28" r="2.5" fill="#e58a6e" stroke={INK} strokeWidth="1.2" />
      <path d="M70 36 l0 -6 l4 4 z" fill="#e58a6e" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function MotifPortal({ size = 80 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M20 64 Q20 24 40 12 Q60 24 60 64 Z" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 64 Q28 32 40 22 Q52 32 52 64 Z" fill="#fbf6ee" stroke={INK} strokeWidth="1.4" />
      <path d="M36 64 Q36 42 40 38 Q44 42 44 64 Z" fill="#a8d6c0" stroke={INK} strokeWidth="1.3" />
      <circle cx="40" cy="32" r="2" fill={INK} />
    </svg>
  );
}

export function MotifBranches({ size = 80 }: MotifProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Stroke d="M16 64 V32 Q16 22 28 22 H42" color={INK} width={1.6} />
      <Stroke d="M16 48 Q16 38 26 38 H38" color={INK} width={1.6} />
      <circle cx="16" cy="64" r="5" fill="#f4b59c" stroke={INK} strokeWidth="1.5" />
      <circle cx="42" cy="22" r="5" fill="#a8d6c0" stroke={INK} strokeWidth="1.5" />
      <circle cx="38" cy="38" r="5" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" />
      <circle cx="16" cy="20" r="5" fill="#fbf6ee" stroke={INK} strokeWidth="1.5" />
      <Stroke d="M16 20 V14" color={INK} width={1.4} />
    </svg>
  );
}

/* "Memory orchard" — trees with labeled fruit (decisions, constraints…) */
export function MemoryOrchard() {
  return (
    <svg viewBox="0 0 360 240" width="100%" height="100%" fill="none">
      <path d="M0 200 Q90 180 180 196 Q270 210 360 188 L360 240 L0 240 Z" fill="#a8d6c0" stroke={INK} strokeWidth="1.4" />
      <Stroke d="M20 200 H80 M120 196 H180 M220 200 H300" color="#588f74" width={1} />

      <g transform="translate(60 60)">
        <rect x="14" y="80" width="6" height="32" fill="#a07a52" stroke={INK} strokeWidth="1.4" />
        <circle cx="17" cy="60" r="38" fill="#c9b8f0" stroke={INK} strokeWidth="1.5" />
        <Stroke d="M-12 50 Q4 42 22 50 M4 70 Q20 64 36 72" color="#7a64c0" width={1} />
        <circle cx="0" cy="46" r="6" fill="#f4b59c" stroke={INK} strokeWidth="1.3" />
        <text x="0" y="49" textAnchor="middle" fontSize="6" fontFamily="ui-monospace" fill={INK}>AD-01</text>
        <circle cx="30" cy="40" r="6" fill="#f3d684" stroke={INK} strokeWidth="1.3" />
        <text x="30" y="43" textAnchor="middle" fontSize="6" fontFamily="ui-monospace" fill={INK}>AD-11</text>
        <circle cx="14" cy="72" r="6" fill="#a8d6c0" stroke={INK} strokeWidth="1.3" />
        <text x="14" y="75" textAnchor="middle" fontSize="6" fontFamily="ui-monospace" fill={INK}>AD-04</text>
      </g>

      <g transform="translate(220 80)">
        <rect x="22" y="64" width="6" height="32" fill="#a07a52" stroke={INK} strokeWidth="1.4" />
        <circle cx="25" cy="48" r="32" fill="#f4b59c" stroke={INK} strokeWidth="1.5" />
        <Stroke d="M-2 44 Q14 36 30 44 M14 60 Q28 56 44 60" color="#a64f33" width={1} />
        <circle cx="10" cy="40" r="6" fill="#c9b8f0" stroke={INK} strokeWidth="1.3" />
        <text x="10" y="43" textAnchor="middle" fontSize="6" fontFamily="ui-monospace" fill={INK}>AD-07</text>
        <circle cx="38" cy="44" r="6" fill="#f3d684" stroke={INK} strokeWidth="1.3" />
        <text x="38" y="47" textAnchor="middle" fontSize="6" fontFamily="ui-monospace" fill={INK}>AD-12</text>
      </g>

      <g transform="translate(150 158)">
        <path d="M0 18 L60 18 L54 42 L6 42 Z" fill="#a07a52" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        <Stroke d="M6 24 L54 24 M10 30 L50 30 M12 36 L48 36" color="#5a4226" width={0.9} />
        <path d="M0 18 Q30 4 60 18" stroke={INK} strokeWidth="1.4" fill="none" />
        <circle cx="14" cy="14" r="5" fill="#c9b8f0" stroke={INK} strokeWidth="1.2" />
        <circle cx="30" cy="10" r="5" fill="#f3d684" stroke={INK} strokeWidth="1.2" />
        <circle cx="46" cy="14" r="5" fill="#a8d6c0" stroke={INK} strokeWidth="1.2" />
      </g>

      <g className="twinkle" style={{ transformOrigin: "300px 50px" }}>
        <path d="M300 42 l1 5 l5 1 l-5 1 l-1 5 l-1 -5 l-5 -1 l5 -1 z" fill="#8f7cd4" />
      </g>
    </svg>
  );
}
