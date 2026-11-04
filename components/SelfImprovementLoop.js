// ABOUTME: The About page's self-improvement loop graphic: five labelled steps (real HTML list) beside an inline-SVG ring.
// ABOUTME: Server component: the markup is in the HTML before hydration; LoopMotion (client) plays the ~5 s motion once on entering view.

import LoopMotion from "@/components/LoopMotion";
import { LOOP_COPY } from "@/lib/aboutLoop";
import styles from "./SelfImprovementLoop.module.css";

// Ring geometry (SVG user units). Step k sits at angle -90 + 72k degrees, step 1 on top.
const C = 150;
const R = 110;
const NODE_R = 13;
const PAD = 9; // degrees trimmed from each arc end so lines stop at the node edge

const rad = (deg) => (deg * Math.PI) / 180;
const pt = (deg, r = R) => [
  +(C + r * Math.cos(rad(deg))).toFixed(2),
  +(C + r * Math.sin(rad(deg))).toFixed(2),
];
const stepAngle = (k) => -90 + 72 * k;
const arc = (from, to) => {
  const [x1, y1] = pt(from);
  const [x2, y2] = pt(to);
  return `M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}`;
};

const NODES = [0, 1, 2, 3, 4].map((k) => pt(stepAngle(k)));
// Segments 0-3 join steps k and k+1; segment 4 is the closing arrow back to step 1.
const SEGMENTS = [0, 1, 2, 3].map((k) =>
  arc(stepAngle(k) + PAD, stepAngle(k + 1) - PAD)
);
const HEAD_TIP_DEG = stepAngle(5) - PAD;
const HEAD_LEN_DEG = (8 / R) * (180 / Math.PI);
const CLOSING = arc(stepAngle(4) + PAD, HEAD_TIP_DEG - HEAD_LEN_DEG);
const ARROWHEAD = (() => {
  const [tx, ty] = pt(HEAD_TIP_DEG);
  const baseDeg = HEAD_TIP_DEG - HEAD_LEN_DEG;
  const [bx, by] = pt(baseDeg);
  const nx = Math.cos(rad(baseDeg));
  const ny = Math.sin(rad(baseDeg));
  const w = 4.5;
  return `M${tx} ${ty}L${+(bx + nx * w).toFixed(2)} ${+(by + ny * w).toFixed(2)}L${+(bx - nx * w).toFixed(2)} ${+(by - ny * w).toFixed(2)}Z`;
})();

// Motion schedule in seconds. Every start is a multiple of the 0.09 s half-beat.
// The ring head holds at step 4 while the tally lands, then runs on.
const T = {
  segment: [0.18, 0.72, 1.26, 3.42],
  closing: 4.32,
  node: [0, 0.72, 1.26, 1.8, 3.96],
  tick: [2.16, 2.43, 2.7],
  stamp: 3.06,
};
const labelDelay = (k) => `${(T.node[k] + 0.12).toFixed(2)}s`;
const s = (n) => `${n}s`;

// The tally sits inside the ring, above-right of step 4: three ticks that run past the
// edges of an outlined, slightly tilted "rule" stamp, which lands over them last.
const TICK_X = [106, 128, 150];
const TICK_Y = [178, 222];
const STAMP = { x: 92, y: 186, w: 72, h: 28 };

export default function SelfImprovementLoop({ locale }) {
  const copy = LOOP_COPY[locale] || LOOP_COPY.en;

  return (
    <LoopMotion
      className={styles.loop}
      data-testid="self-improvement-loop"
      style={{ "--stamp": s(T.stamp) }}
    >
      <div className={styles.ring}>
        <svg viewBox="0 0 300 300" className={styles.svg} aria-hidden="true">
          <circle cx={C} cy={C} r={R} className={styles.track} />
          {SEGMENTS.map((d, k) => (
            <path
              key={k}
              d={d}
              pathLength="1"
              className={styles.segment}
              style={{ "--delay": s(T.segment[k]) }}
            />
          ))}
          <path
            d={CLOSING}
            pathLength="1"
            className={styles.segment}
            style={{ "--delay": s(T.closing) }}
          />
          <path
            d={ARROWHEAD}
            className={styles.head}
            style={{ "--delay": s(T.closing + 0.45) }}
          />
          <g className={styles.marker}>
            <circle cx={NODES[0][0]} cy={NODES[0][1]} r="5" />
          </g>
          {NODES.map(([x, y], k) => (
            <g
              key={k}
              className={k < 3 ? `${styles.node} ${styles.early}` : styles.node}
              data-step={k + 1}
              style={{ "--delay": s(T.node[k]) }}
            >
              <circle
                cx={x}
                cy={y}
                r={NODE_R}
                className={k === 3 ? styles.discRule : styles.disc}
              />
              <text x={x} y={y} className={styles.digit}>
                {k + 1}
              </text>
            </g>
          ))}
          {TICK_X.map((x, i) => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1={TICK_Y[0]}
              y2={TICK_Y[1]}
              className={styles[`tick${i + 1}`]}
              style={{ "--delay": s(T.tick[i]) }}
            />
          ))}
          <rect
            x={STAMP.x}
            y={STAMP.y}
            width={STAMP.w}
            height={STAMP.h}
            rx="3"
            className={styles.pulse}
            style={{ "--delay": s(T.stamp) }}
          />
          <g
            className={styles.stamp}
            data-testid="loop-stamp"
            style={{ "--delay": s(T.stamp) }}
          >
            <rect
              x={STAMP.x}
              y={STAMP.y}
              width={STAMP.w}
              height={STAMP.h}
              rx="3"
            />
            <text x={STAMP.x + STAMP.w / 2} y={STAMP.y + STAMP.h / 2}>
              {copy.stamp}
            </text>
          </g>
        </svg>
      </div>
      <ol className={styles.steps} role="list" aria-label={copy.label}>
        {copy.steps.map((label, k) => (
          <li
            key={label}
            className={k < 3 ? `${styles.step} ${styles.early}` : styles.step}
            data-step={k + 1}
            data-rule={k === 3 ? "true" : undefined}
            style={{ "--delay": labelDelay(k) }}
          >
            {label}
          </li>
        ))}
      </ol>
    </LoopMotion>
  );
}
