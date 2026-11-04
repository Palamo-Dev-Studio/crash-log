// ABOUTME: Client wrapper for the loop graphic's <figure>: starts its one-shot motion when scrolled into view.
// ABOUTME: The graphic's markup is server-rendered children; with no JS or reduced motion nothing here runs and the final state shows.

"use client";

import { useEffect, useRef } from "react";

export default function LoopMotion({ children, ...figureProps }) {
  const ref = useRef(null);

  // Park the graphic at its first frame, then play once on entering view.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    el.dataset.motion = "ready";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.dataset.motion = "play";
        observer.disconnect();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.motion;
    };
  }, []);

  return (
    <figure ref={ref} {...figureProps}>
      {children}
    </figure>
  );
}
