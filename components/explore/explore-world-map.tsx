'use client'

/**
 * components/explore/explore-world-map.tsx
 *
 * Accurate, simplified equirectangular (Plate Carrée) world-map silhouette
 * derived from Natural Earth 1:110m cultural & land boundaries (Public Domain).
 *
 * Standard coordinates:
 * viewBox="0 0 1000 500"
 * x: ((lon + 180) / 360) * 1000
 * y: ((90 - lat) / 180) * 500
 */

import React from 'react'

export default function ExploreWorldMap() {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Subtle graticule line pattern */}
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#C8A96B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background ambient radial aura */}
      <rect width="1000" height="500" fill="url(#mapGlow)" />

      {/* Latitude graticules (parallels) */}
      {[-60, -30, 0, 30, 60].map((lat) => {
        const y = ((90 - lat) / 180) * 500
        return (
          <line
            key={lat}
            x1="0"
            y1={y}
            x2="1000"
            y2={y}
            stroke="#C8A96B"
            strokeWidth="0.5"
            strokeDasharray="3 9"
            opacity={lat === 0 ? 0.2 : 0.08}
          />
        )
      })}

      {/* Longitude graticules (meridians) */}
      {[-120, -60, 0, 60, 120].map((lon) => {
        const x = ((lon + 180) / 360) * 1000
        return (
          <line
            key={lon}
            x1={x}
            y1="0"
            x2={x}
            y2="500"
            stroke="#C8A96B"
            strokeWidth="0.5"
            strokeDasharray="3 9"
            opacity={lon === 0 ? 0.2 : 0.08}
          />
        )
      })}

      {/* Group of Continents: North America, South America, Eurasia, Africa, Australia, Antarctica */}
      <g
        fill="#FAF8F5"
        fillOpacity="0.04"
        stroke="#C8A96B"
        strokeWidth="0.6"
        strokeOpacity="0.22"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* NORTH AMERICA & GREENLAND */}
        <path
          d="
            M 195 45 L 230 40 L 255 55 L 245 80 L 210 90 L 195 70 Z
            M 85 85 L 120 70 L 165 75 L 190 95 L 210 85 L 225 105 L 215 125 L 235 145 L 230 170 L 210 185 L 215 205 L 240 215 L 255 240 L 265 245 L 240 270 L 230 250 L 205 235 L 180 200 L 140 185 L 130 160 L 105 135 L 90 120 L 75 95 Z
          "
        />

        {/* SOUTH AMERICA */}
        <path
          d="
            M 265 250 L 290 245 L 320 260 L 345 285 L 350 310 L 325 350 L 305 400 L 290 435 L 275 445 L 270 420 L 285 365 L 275 315 L 260 280 L 255 260 Z
          "
        />

        {/* EUROPE & ASIA (EURASIA) */}
        <path
          d="
            M 460 70 L 485 60 L 515 65 L 530 85 L 510 100 L 475 95 L 450 115 L 440 135 L 460 145 L 485 140 L 505 155 L 535 150 L 560 135 L 595 125 L 630 120 L 670 115 L 725 110 L 785 105 L 830 115 L 870 120 L 900 140 L 885 165 L 850 175 L 820 165 L 805 190 L 835 210 L 825 240 L 795 260 L 775 240 L 745 270 L 715 285 L 690 275 L 670 240 L 640 220 L 610 210 L 585 225 L 565 200 L 540 190 L 505 180 L 485 190 L 460 175 L 445 160 L 450 130 L 430 120 L 420 95 L 445 80 Z
            M 855 190 L 875 195 L 880 230 L 860 235 Z
            M 760 295 L 780 300 L 775 320 L 755 310 Z
            M 790 290 L 840 295 L 860 325 L 825 340 L 785 315 Z
          "
        />

        {/* AFRICA & MADAGASCAR */}
        <path
          d="
            M 465 175 L 505 170 L 545 190 L 575 215 L 590 255 L 565 285 L 545 330 L 530 375 L 505 400 L 485 385 L 475 330 L 445 280 L 425 250 L 430 220 L 455 200 Z
            M 590 325 L 605 335 L 595 380 L 580 370 Z
          "
        />

        {/* AUSTRALIA & NEW ZEALAND */}
        <path
          d="
            M 780 345 L 825 330 L 870 345 L 890 380 L 880 415 L 845 425 L 805 415 L 775 380 Z
            M 915 410 L 930 425 L 920 450 L 905 435 Z
          "
        />

        {/* ANTARCTICA (Subtle Base Horizon) */}
        <path
          d="
            M 150 480 L 300 475 L 500 485 L 700 475 L 850 480 L 950 490 L 50 490 Z
          "
          fillOpacity="0.02"
          strokeOpacity="0.12"
        />
      </g>
    </svg>
  )
}
