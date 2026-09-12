// FILE: src/components/horse/HorseJourney.jsx
// Scroll-driven "journey companion" overlay. Draws a subtle path through
// the marketing site's sections and walks the FARIS horse along it as the
// visitor scrolls — position, scale, facing and pose all derive from
// scroll progress; nothing here is a fixed/looping video.
//
// pose lifecycle per stop: WALK -> SLOW (approaching) -> LOOK (paused,
// head toward the visitor) -> CONTINUE (brief transient as it moves off)
// -> WALK again; the final stop (contact) settles into ARRIVE and stays.
import { useCallback, useEffect, useRef, useState } from "react";
import HorseSVG from "./HorseSVG.jsx";
import { smoothPathD } from "./pathMath.js";

const STOPS = [
  { key: "about", xPct: 20 },
  { key: "services", xPct: 76 },
  { key: "packages", xPct: 24 },
  { key: "articles", xPct: 74 },
  { key: "faq", xPct: 30 },
  { key: "contact", xPct: 50 },
];

const LOOK_RADIUS = 60;
const SLOW_RADIUS = 210;
const PHASE_PER_PX = 0.018;
const CONTINUE_MS = 650;
// The path's y-coordinates track scroll depth almost 1:1 (by construction —
// see measure()), which puts the rendered token right at the wrap's top
// edge, i.e. under the fixed site header. Shift the drawn token down by a
// fixed viewport offset so it rides just below the header instead, without
// touching the path geometry or the stop-proximity math above (both stay in
// the original, un-shifted coordinate space).
const VIEWPORT_RIDE_OFFSET = 340;

export default function HorseJourney({ wrapRef, sectionRefs }) {
  const svgHostRef = useRef(null);
  const pathElRef = useRef(null);
  const tokenRef = useRef(null);
  const horseApiRef = useRef(null);

  const geomRef = useRef({ totalLength: 0, waypoints: [], journeyStartY: 0, journeyEndY: 1 });
  const rafRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const phaseRef = useRef(0);
  const facingRef = useRef(1);
  const reducedMotionRef = useRef(false);
  const continueTimerRef = useRef(null);

  const [pose, setPose] = useState("walk");
  const [continuing, setContinuing] = useState(false);
  const [simplified, setSimplified] = useState(false);

  const tick = useCallback(() => {
    rafRef.current = 0;
    const { totalLength, waypoints, journeyStartY, journeyEndY } = geomRef.current;
    const pathEl = pathElRef.current;
    if (!pathEl || !totalLength) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const span = Math.max(1, journeyEndY - journeyStartY);
    const progress = Math.min(1, Math.max(0, (scrollY - journeyStartY) / span));

    const pt = pathEl.getPointAtLength(progress * totalLength);
    const aheadLen = Math.min(totalLength, progress * totalLength + 14);
    const ptAhead = pathEl.getPointAtLength(aheadLen);
    const dx = ptAhead.x - pt.x;
    if (Math.abs(dx) > 2.5) facingRef.current = dx >= 0 ? 1 : -1;

    let nearestD = Infinity;
    for (const wp of waypoints) {
      const d = Math.hypot(pt.x - wp.x, pt.y - wp.y);
      if (d < nearestD) nearestD = d;
    }

    let nextPose = "walk";
    if (progress >= 0.992) nextPose = "arrive";
    else if (nearestD < LOOK_RADIUS) nextPose = "look";
    else if (nearestD < SLOW_RADIUS) nextPose = "slow";

    setPose((prev) => {
      if (prev === "look" && nextPose !== "look" && nextPose !== "arrive") {
        setContinuing(true);
        clearTimeout(continueTimerRef.current);
        continueTimerRef.current = setTimeout(() => setContinuing(false), CONTINUE_MS);
      }
      return prev === nextPose ? prev : nextPose;
    });

    if (!reducedMotionRef.current) {
      const deltaScroll = scrollY - lastScrollYRef.current;
      const speedFactor = nextPose === "look" || nextPose === "arrive" ? 0 : nextPose === "slow" ? 0.4 : 1;
      if (speedFactor > 0) {
        phaseRef.current += Math.abs(deltaScroll) * PHASE_PER_PX * speedFactor;
        horseApiRef.current?.setLegPhase(phaseRef.current);
      }
      if (nextPose === "arrive") {
        phaseRef.current = 0;
        horseApiRef.current?.setLegPhase(0);
      }
    }
    lastScrollYRef.current = scrollY;

    const scaleTable = [
      [0, 1.06],
      [0.15, 0.92],
      [0.5, 0.84],
      [0.85, 0.92],
      [1, 0.98],
    ];
    let scale = scaleTable[scaleTable.length - 1][1];
    for (let i = 0; i < scaleTable.length - 1; i++) {
      const [p0, s0] = scaleTable[i];
      const [p1, s1] = scaleTable[i + 1];
      if (progress >= p0 && progress <= p1) {
        const t = (progress - p0) / (p1 - p0 || 1);
        scale = s0 + (s1 - s0) * t;
        break;
      }
    }

    if (tokenRef.current) {
      const renderY = pt.y + VIEWPORT_RIDE_OFFSET;
      tokenRef.current.style.transform =
        `translate3d(${pt.x.toFixed(1)}px, ${renderY.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) scaleX(${facingRef.current})`;
    }

    pathEl.style.strokeDashoffset = String(totalLength * (1 - progress));
  }, []);

  const requestTick = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const measure = useCallback(() => {
    const wrapEl = wrapRef.current;
    const pathEl = pathElRef.current;
    if (!wrapEl || !pathEl) return;
    const wrapRect = wrapEl.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;

    const pts = [{ x: wrapRect.width * 0.5, y: 0 }];
    const waypoints = [];
    STOPS.forEach((s) => {
      const el = sectionRefs[s.key]?.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const y = r.top - wrapRect.top + r.height / 2;
      const x = (wrapRect.width * s.xPct) / 100;
      pts.push({ x, y });
      waypoints.push({ key: s.key, x, y, docY: r.top + scrollY + r.height / 2 });
    });
    const last = pts[pts.length - 1];
    pts.push({ x: last.x, y: last.y + 40 });

    const d = smoothPathD(pts);
    pathEl.setAttribute("d", d);
    const totalLength = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(totalLength);

    const journeyStartY = wrapRect.top + scrollY;
    const contact = waypoints.find((w) => w.key === "contact");
    const journeyEndY = contact ? contact.docY : journeyStartY + 1;

    geomRef.current = { totalLength, waypoints, journeyStartY, journeyEndY };

    if (svgHostRef.current) {
      svgHostRef.current.setAttribute("width", String(Math.round(wrapRect.width)));
      svgHostRef.current.setAttribute("height", String(Math.round(wrapRect.height)));
    }

    setSimplified(window.innerWidth < 640);
    tick();
  }, [wrapRef, sectionRefs, tick]);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    measure();
    const onScroll = () => requestTick();
    const onResize = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measure);

    let ro;
    if (typeof ResizeObserver !== "undefined" && wrapRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(wrapRef.current);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measure);
      if (ro) ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(continueTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, requestTick]);

  return (
    <div className="horse-journey-overlay" aria-hidden="true">
      <svg ref={svgHostRef} className="horse-journey-svg">
        <path ref={pathElRef} className="horse-journey-path" fill="none" />
      </svg>
      <div
        ref={tokenRef}
        className={`horse-token pose-${pose}${continuing ? " is-continuing" : ""}${simplified ? " is-simplified" : ""}`}
      >
        <HorseSVG ref={horseApiRef} />
      </div>
    </div>
  );
}
