import React from 'react';

interface KhataGhrLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'full';
}

export const KhataGhrLogo: React.FC<KhataGhrLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  variant = 'full',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* House + Ledger Board + Pen Vector Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-md"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="houseGradient" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="roofGradient" x1="10" y1="10" x2="190" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="boardGradient" x1="60" y1="70" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          <linearGradient id="penGradient" x1="120" y1="70" x2="175" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 1. Outer House Foundation & Walls */}
        <path
          d="M32 92 L100 32 L168 92 V170 C168 176.627 162.627 182 156 182 H44 C37.373 182 32 176.627 32 170 V92 Z"
          fill="url(#houseGradient)"
          stroke="#3b82f6"
          strokeWidth="4"
          filter="url(#softGlow)"
        />

        {/* Chimney / Modern Skylight */}
        <path d="M142 62 V42 H158 V76 L142 62 Z" fill="#1e40af" />

        {/* House Modern Overhanging Roof Trim */}
        <path
          d="M16 94 L100 20 L184 94 L170 106 L100 44 L30 106 L16 94 Z"
          fill="url(#roofGradient)"
        />
        {/* Golden Roof Peak Crown Accent */}
        <circle cx="100" cy="22" r="5" fill="url(#goldAccent)" />

        {/* 2. Inside: Ledger Board / Takhti / Clipboard */}
        <g transform="translate(0, 5)">
          {/* Clipboard Board Body */}
          <rect
            x="58"
            y="76"
            width="84"
            height="96"
            rx="8"
            fill="url(#boardGradient)"
            stroke="#94a3b8"
            strokeWidth="3"
          />

          {/* Clipboard Metal Clip at Top */}
          <path
            d="M82 72 C82 68.686 84.686 66 88 66 H112 C115.314 66 118 68.686 118 72 V79 H82 V72 Z"
            fill="url(#goldAccent)"
          />
          <circle cx="100" cy="71" r="2.5" fill="#ffffff" />

          {/* Ledger Ruled Transaction Lines */}
          <line x1="70" y1="92" x2="114" y2="92" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="106" x2="130" y2="106" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="70" y1="120" x2="126" y2="120" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="70" y1="134" x2="120" y2="134" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="70" y1="148" x2="108" y2="148" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

          {/* Verified Checkmark on Ledger */}
          <path
            d="M124 144 L129 149 L138 140"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 3. Sleek Fountain Pen / Qalam (Angled across board) */}
        <g transform="rotate(-38 145 125)">
          {/* Pen Barrel */}
          <rect x="135" y="45" width="14" height="68" rx="4" fill="url(#penGradient)" stroke="#065f46" strokeWidth="1.5" />
          {/* Golden Ring Trim */}
          <rect x="134" y="60" width="16" height="4" fill="url(#goldAccent)" />
          {/* Pen Grip Section */}
          <polygon points="135,113 149,113 146,132 138,132" fill="#0f172a" />
          {/* Golden Nib */}
          <polygon points="138,132 146,132 142,148" fill="url(#goldAccent)" stroke="#b45309" strokeWidth="1" />
          {/* Nib Ink Slit & Breather Hole */}
          <line x1="142" y1="133" x2="142" y2="145" stroke="#047857" strokeWidth="1.5" />
          <circle cx="142" cy="138" r="1" fill="#047857" />
        </g>
      </svg>

      {/* Typography Branding (Optional side-by-side) */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight text-white font-sans">
              Khata<span className="text-blue-500">GHR</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
              v1.0
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400 tracking-wide">
            کھاتہ گھر • Enterprise POS & Khata
          </span>
        </div>
      )}
    </div>
  );
};
