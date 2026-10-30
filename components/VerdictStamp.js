// ABOUTME: Rubber-stamp verdict: mono caps, double terracotta border, tilted per index, inked edge via SVG filter.
// ABOUTME: Render <StampFilter /> once per page; every stamp references it by STAMP_FILTER_ID from its CSS.

import { Fragment } from "react";
import styles from "./VerdictStamp.module.css";

// Referenced from VerdictStamp.module.css (`filter: url(#cl-stamp-rough)`).
export const STAMP_FILTER_ID = "cl-stamp-rough";

// Deterministic tilt, -3deg to +2deg, so a card keeps its angle between renders.
const ROTATIONS = [-3, 2, -2, 1, -2.5, 1.5];

export function stampRotation(index) {
  return ROTATIONS[Math.abs(index) % ROTATIONS.length];
}

export function StampFilter() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id={STAMP_FILTER_ID}
          x="-6%"
          y="-12%"
          width="112%"
          height="124%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            seed="4"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="2.4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed="11"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.4 2.9"
            result="holes"
          />
          <feComposite in="d" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

// Break opportunity after each underscore (SNAKE_CASE verdicts). <wbr> adds no text, so
// the visible and accessible text are unchanged. Residual risk, accepted: one unbreakable
// word wider than the card still overflows; editorial verdicts are short words.
function withBreaks(text) {
  const parts = text.split("_");
  return parts.map((part, i) =>
    i < parts.length - 1 ? (
      <Fragment key={i}>
        {part}_<wbr />
      </Fragment>
    ) : (
      part
    )
  );
}

export default function VerdictStamp({ text, index = 0, className = "" }) {
  if (!text) return null;
  return (
    <span
      className={`${styles.stamp} ${className}`.trim()}
      style={{ "--rot": `${stampRotation(index)}deg` }}
    >
      {withBreaks(text)}
    </span>
  );
}
