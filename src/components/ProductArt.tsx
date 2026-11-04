import type { ReactNode } from 'react';

/**
 * Locally rendered SVG artwork. Every catalog item references an art key, so the
 * storefront needs no external image CDN, licensing or network fetches.
 */
type Motif =
  | 'drop'
  | 'hoop'
  | 'tassel'
  | 'cascade'
  | 'bells'
  | 'bangle'
  | 'necklace'
  | 'box'
  | 'set'
  | 'slab';

const MOTIFS: Record<string, Motif> = {
  drop: 'drop',
  'pearl-gungur': 'drop',
  dome: 'drop',
  hoop: 'hoop',
  petal: 'hoop',
  filigree: 'hoop',
  tassel: 'tassel',
  lariat: 'tassel',
  cascade: 'cascade',
  choker: 'cascade',
  bridal: 'cascade',
  bells: 'bells',
  'chain-bells': 'bells',
  kada: 'bangle',
  'bangle-set': 'bangle',
  'gungur-set': 'bangle',
  pendant: 'necklace',
  kundan: 'necklace',
  noir: 'necklace',
  'chocolate-box': 'box',
  truffle: 'box',
  hamper: 'box',
  resin: 'box',
  'heritage-set': 'set',
  'minimal-set': 'set',
  celebration: 'set',
  slab: 'slab',
  rosewood: 'slab',
};

function frame(id: string) {
  return (
    <>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F7F1E6" />
          <stop offset="52%" stopColor="#EFE4D2" />
          <stop offset="100%" stopColor="#E3D4BC" />
        </linearGradient>
        <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#E7CF9B" />
          <stop offset="38%" stopColor="#C6A15B" />
          <stop offset="72%" stopColor="#A8853F" />
          <stop offset="100%" stopColor="#8C6B2E" />
        </linearGradient>
        <linearGradient id={`pearl-${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="60%" stopColor="#F2E7D6" />
          <stop offset="100%" stopColor="#D9C4A6" />
        </linearGradient>
        <radialGradient id={`glow-${id}`} cx="50%" cy="34%" r="58%">
          <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#bg-${id})`} />
      <rect width="400" height="400" fill={`url(#glow-${id})`} />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#C6A15B" strokeOpacity="0.22" />
      <circle cx="200" cy="200" r="138" fill="none" stroke="#C6A15B" strokeOpacity="0.14" />
    </>
  );
}

function motifFor(key: string, id: string): ReactNode {
  const gold = `url(#gold-${id})`;
  const pearl = `url(#pearl-${id})`;
  const motif = MOTIFS[key] ?? 'drop';

  switch (motif) {
    case 'hoop':
      return (
        <g fill="none" stroke={gold} strokeWidth="4" strokeLinecap="round">
          <circle cx="156" cy="196" r="42" />
          <circle cx="244" cy="196" r="42" />
          <path d="M156 154v-34M244 154v-34" strokeWidth="2.4" />
          <path d="M144 214c8 10 16 10 24 0" strokeWidth="1.6" opacity="0.7" />
          <path d="M232 214c8 10 16 10 24 0" strokeWidth="1.6" opacity="0.7" />
          <circle cx="156" cy="154" r="3.6" fill={gold} stroke="none" />
          <circle cx="244" cy="154" r="3.6" fill={gold} stroke="none" />
        </g>
      );
    case 'tassel':
      return (
        <g>
          <circle cx="200" cy="118" r="9" fill="none" stroke={gold} strokeWidth="3" />
          <path d="M200 127v36" stroke={gold} strokeWidth="2.4" />
          <path d="M200 163c26 0 34 22 34 48" stroke={gold} strokeWidth="2" fill="none" />
          <path d="M200 163c-26 0-34 22-34 48" stroke={gold} strokeWidth="2" fill="none" />
          <ellipse cx="200" cy="196" rx="20" ry="26" fill={pearl} />
          <g stroke={gold} strokeWidth="2.2" strokeLinecap="round">
            <path d="M182 224v52M192 226v58M200 227v62M208 226v58M218 224v52" />
          </g>
          <circle cx="200" cy="214" r="4" fill={gold} />
        </g>
      );
    case 'cascade':
      return (
        <g>
          <path d="M136 128c34 30 94 30 128 0" fill="none" stroke={gold} strokeWidth="3" />
          <circle cx="200" cy="160" r="16" fill={pearl} />
          <circle cx="200" cy="160" r="16" fill="none" stroke={gold} strokeWidth="1.6" />
          {[0, 1, 2].map((row) =>
            [-2, -1, 0, 1, 2].map((col) => {
              const cx = 200 + col * 30 + (row % 2 ? 6 : 0);
              const cy = 190 + row * 34 + Math.abs(col) * 5;
              return (
                <g key={`${row}-${col}`}>
                  <path d={`M${cx} ${cy - 26}V${cy - 12}`} stroke={gold} strokeWidth="1.2" opacity="0.55" />
                  <circle cx={cx} cy={cy} r={row === 1 && col === 0 ? 10 : 7} fill={pearl} />
                </g>
              );
            }),
          )}
        </g>
      );
    case 'bells':
      return (
        <g>
          <path d="M108 168c58 26 126 26 184 0" fill="none" stroke={gold} strokeWidth="3" />
          {[0, 1, 2, 3, 4].map((index) => {
            const cx = 122 + index * 39;
            const drop = index % 2 === 0 ? 0 : 10;
            return (
              <g key={index}>
                <path d={`M${cx} 180v${18 + drop}`} stroke={gold} strokeWidth="1.4" />
                <path
                  d={`M${cx - 11} ${226 + drop}c0-12 5-20 11-20s11 8 11 20z`}
                  fill={gold}
                  opacity="0.92"
                />
                <circle cx={cx} cy={234 + drop} r="3.4" fill={pearl} />
              </g>
            );
          })}
          <circle cx="200" cy="196" r="12" fill={pearl} />
        </g>
      );
    case 'bangle':
      return (
        <g fill="none">
          <ellipse cx="200" cy="188" rx="78" ry="26" stroke={gold} strokeWidth="7" />
          <ellipse cx="200" cy="188" rx="78" ry="26" stroke="#7E5F2A" strokeOpacity="0.35" strokeWidth="1.4" />
          <ellipse cx="206" cy="214" rx="66" ry="23" stroke={gold} strokeWidth="6" opacity="0.86" />
          <ellipse cx="194" cy="238" rx="54" ry="19" stroke={`url(#pearl-${id})`} strokeWidth="7" />
          <g fill="#7E5F2A" opacity="0.5">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <circle key={index} cx={140 + index * 24} cy={163 + Math.abs(2.5 - index) * 4} r="1.8" />
            ))}
          </g>
        </g>
      );
    case 'necklace':
      return (
        <g fill="none">
          <path d="M118 132c6 56 40 96 82 96s76-40 82-96" stroke={gold} strokeWidth="3" />
          <path
            d="M118 132c6 56 40 96 82 96s76-40 82-96"
            stroke="#7E5F2A"
            strokeOpacity="0.25"
            strokeWidth="8"
            strokeDasharray="1 9"
          />
          <path d="M200 228v18" stroke={gold} strokeWidth="2" />
          <ellipse cx="200" cy="266" rx="26" ry="30" fill={pearl} stroke={gold} strokeWidth="2" />
          <path d="M200 236v-4" stroke={gold} strokeWidth="1.4" />
          <circle cx="200" cy="212" r="5" fill={gold} />
        </g>
      );
    case 'box':
      return (
        <g>
          <rect x="118" y="176" width="164" height="96" rx="6" fill="#4A3527" />
          <rect x="118" y="176" width="164" height="22" rx="6" fill="#5C4433" />
          <rect x="188" y="176" width="24" height="96" fill={`url(#gold-${id})`} opacity="0.9" />
          <path d="M200 176c-22-18-44-16-48-2 4 12 30 14 48 2z" fill={`url(#gold-${id})`} />
          <path d="M200 176c22-18 44-16 48-2-4 12-30 14-48 2z" fill={`url(#gold-${id})`} opacity="0.86" />
          <circle cx="200" cy="176" r="7" fill="#E7CF9B" />
          <g fill="#EFE4D2" opacity="0.55">
            <rect x="140" y="216" width="32" height="2.4" />
            <rect x="140" y="226" width="22" height="2.4" />
          </g>
        </g>
      );
    case 'set':
      return (
        <g>
          <path d="M132 148c14 42 42 62 68 62s54-20 68-62" fill="none" stroke={gold} strokeWidth="2.6" />
          <circle cx="200" cy="215" r="15" fill={pearl} stroke={gold} strokeWidth="1.6" />
          <circle cx="128" cy="150" r="5" fill={gold} />
          <circle cx="272" cy="150" r="5" fill={gold} />
          <g fill="none" stroke={gold} strokeWidth="3">
            <circle cx="138" cy="252" r="16" />
            <circle cx="262" cy="252" r="16" />
          </g>
          <g stroke={gold} strokeWidth="1.4" opacity="0.6">
            <path d="M138 236v-18M262 236v-18" />
          </g>
          <circle cx="200" cy="248" r="9" fill={pearl} />
        </g>
      );
    case 'slab':
    default:
      return (
        <g>
          <rect x="118" y="150" width="164" height="112" rx="4" fill="#4A3527" />
          <rect x="118" y="150" width="164" height="112" rx="4" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.6" />
          <rect x="134" y="166" width="132" height="80" rx="2" fill="#3A281D" />
          <g fill={`url(#gold-${id})`}>
            <rect x="150" y="182" width="44" height="48" rx="2" opacity="0.9" />
            <rect x="204" y="182" width="44" height="48" rx="2" opacity="0.6" />
          </g>
          <rect x="150" y="182" width="44" height="48" rx="2" fill="none" stroke="#EFE4D2" strokeOpacity="0.4" />
          <rect x="204" y="182" width="44" height="48" rx="2" fill="none" stroke="#EFE4D2" strokeOpacity="0.4" />
          <path d="M118 150h164" stroke="#E7CF9B" strokeWidth="0.8" opacity="0.6" />
        </g>
      );
  }
}

export function ProductArt({
  art,
  name,
  className = '',
  priority = false,
}: {
  art: string;
  name: string;
  className?: string;
  priority?: boolean;
}) {
  const id = art.replace(/[^a-z0-9-]/gi, '') || 'default';
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={`${name} — WARAN ZONE`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      // Decorative brand artwork; the product name is always announced in text too.
      focusable="false"
      data-priority={priority ? 'true' : undefined}
    >
      <title>{name}</title>
      {frame(id)}
      {motifFor(art, id)}
    </svg>
  );
}
