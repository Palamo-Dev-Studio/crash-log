// ABOUTME: The Crash Log roundel mark as inline SVG, in a simple and a stamp variant.
// ABOUTME: size <= 32 renders the simple mark; size >= 48 adds the CRASH LOG · FILED ring and ink finish.

import { useId } from "react";
import { SYMBOL_PATH, SYMBOL_ORIGIN } from "@/components/roundelSymbol";

const STAMP_MIN_SIZE = 48;
const LEGEND = "CRASH LOG · FILED · CRASH LOG · FILED · ";

export default function Roundel({ size = 32, className }) {
  const uid = useId().replace(/:/g, "");
  const isStamp = size >= STAMP_MIN_SIZE;

  if (!isStamp) {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="Crash Log"
      >
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="4"
        />
        <path
          transform={`translate(24 24) scale(0.02351) ${SYMBOL_ORIGIN}`}
          fill="var(--terra-ink)"
          d={SYMBOL_PATH}
        />
      </svg>
    );
  }

  const filterId = `roundel-ink-${uid}`;
  const arcId = `roundel-arc-${uid}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Crash Log"
    >
      <defs>
        <filter id={filterId} x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="2"
            seed="7"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="1.2"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="5"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 3.05"
            result="holes"
          />
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
        <path
          id={arcId}
          d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"
        />
      </defs>
      <g filter={`url(#${filterId})`}>
        <circle
          cx="60"
          cy="60"
          r="56.5"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="4"
        />
        <text
          fontFamily="var(--font-mono), 'DM Mono', monospace"
          fontSize="10.5"
          fontWeight="500"
          fill="var(--ink)"
          dy="3.6"
        >
          <textPath href={`#${arcId}`} textLength="271" lengthAdjust="spacing">
            {LEGEND}
          </textPath>
        </text>
        <circle
          cx="60"
          cy="60"
          r="36"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.8"
        />
        <path
          transform={`translate(60 60) scale(0.04436) ${SYMBOL_ORIGIN}`}
          fill="var(--terra)"
          d={SYMBOL_PATH}
        />
      </g>
    </svg>
  );
}
