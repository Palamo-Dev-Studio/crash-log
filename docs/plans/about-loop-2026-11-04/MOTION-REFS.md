# Motion references: loop graphic

ABOUTME: Distilled technique brief from the motion reference scout (Sonnet, 2026-11-04) for the About page loop graphic.
ABOUTME: Source: the data file of github.com/yihui-dev/awesome-opus5-5-videos, read as data only; about the first 66 entries were covered.

## Borrow
1. Ring draw: `pathLength=1`, dasharray 1, dashoffset 1→0 over ~3.6 s, cubic-bezier(.4,0,.2,1).
2. Node pops: scale 0.6→1 + opacity, 280 ms, cubic-bezier(.2,.8,.2,1), delays pinned to the ring head (i × ~0.72 s).
3. Labels: fade + rise 6 px, 240 ms ease-out, 120 ms after each node. No per-letter animation.
4. Beat grid: every delay a multiple of one unit (e.g. 0.18 s).
5. Peak: three ticks drop 10 px and settle, 160 ms each at 0 / 260 / 520 ms; slight overshoot on the third only.
6. Snap to stamp: 140 ms hold, then the third tick scales 1.35→1 into the red rule box over 220 ms, cubic-bezier(.3,1.4,.5,1), with one 90 ms red ring pulse; the first two ticks dim to 40%.
7. Stillness around the peak: ring head and other labels hold ~400 ms.
8. Closure: final arrow draws back to step 1; step 1 pulses once (1→1.15→1, 300 ms); rest on the final state. IntersectionObserver adds a class once; reduced motion shows the final state.

## Avoid
- Infinite spin (reads as a loader).
- Elastic easing everywhere; overshoot only on the stamp.
- Glow, particles, gradient sweeps, parallax.
