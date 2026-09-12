// FILE: src/components/horse/HorseSVG.jsx
// The FARIS Arabian horse — layered vector companion (blue-ink brand style).
// Side-profile silhouette, split into animatable groups: far legs, tail,
// body, head-rig (neck + head + mane + ears + eye, the piece that turns
// and leans), near legs. Leg swing is driven imperatively (no re-renders)
// via the exposed setLegPhase/resetLegs API.
import { forwardRef, useImperativeHandle, useRef } from "react";

const HorseSVG = forwardRef(function HorseSVG({ className = "" }, ref) {
  const legFrontFar = useRef(null);
  const legFrontNear = useRef(null);
  const legHindFar = useRef(null);
  const legHindNear = useRef(null);

  useImperativeHandle(ref, () => ({
    setLegPhase(phase) {
      const a1 = Math.sin(phase) * 10;
      const a2 = Math.sin(phase + Math.PI) * 10;
      if (legFrontNear.current) legFrontNear.current.style.transform = `rotate(${a1}deg)`;
      if (legHindFar.current) legHindFar.current.style.transform = `rotate(${a1}deg)`;
      if (legFrontFar.current) legFrontFar.current.style.transform = `rotate(${a2}deg)`;
      if (legHindNear.current) legHindNear.current.style.transform = `rotate(${a2}deg)`;
    },
    resetLegs() {
      [legFrontFar, legFrontNear, legHindFar, legHindNear].forEach((r) => {
        if (r.current) r.current.style.transform = "rotate(0deg)";
      });
    },
  }));

  return (
    <svg className={`horse-svg ${className}`} viewBox="0 0 320 240" aria-hidden="true" focusable="false">
      <ellipse className="horse-shadow" cx="150" cy="218" rx="96" ry="9" />

      {/* far legs — behind the body, navy, slightly dimmed for depth */}
      <g ref={legFrontFar} className="horse-leg horse-leg-far" style={{ transformOrigin: "193px 148px" }}>
        <line x1="193" y1="148" x2="186" y2="208" />
      </g>
      <g ref={legHindFar} className="horse-leg horse-leg-far" style={{ transformOrigin: "82px 145px" }}>
        <line x1="82" y1="145" x2="73" y2="206" />
      </g>

      {/* flag tail — a few confident flowing strands */}
      <g className="horse-tail">
        <path d="M90,112 C74,122 58,134 50,156" />
        <path d="M88,117 C68,128 52,146 44,170" />
        <path d="M86,123 C64,136 48,154 42,180" />
      </g>

      {/* body — compact back, deep chest */}
      <path
        className="horse-body"
        d="M206,118 C216,122 220,136 211,150 L211,152 C196,162 150,166 118,162
           C100,160 92,154 90,147 L90,140 C90,120 98,107 112,101
           C134,94 168,92 192,97 C200,99 204,108 206,118 Z"
      />

      {/* head rig — neck + head is one continuous line, plus ears/eye/mane that move with it */}
      <g className="horse-head-rig" style={{ transformOrigin: "196px 104px" }}>
        <path
          className="horse-neckhead"
          d="M196,104 C215,70 238,40 255,34
             C260,26 264,26 268,32
             C272,42 276,50 280,52
             C288,58 296,68 300,78
             C300,83 298,87 294,88
             C276,92 264,90 256,86
             C244,96 232,104 222,110
             C216,114 210,116 206,118
             C204,113 200,108 196,104 Z"
        />

        <path className="horse-ear" d="M247,30 C245,20 249,12 256,10 C258,18 256,27 251,33 Z" />
        <path className="horse-ear" d="M259,29 C260,19 266,11 274,10 C275,19 271,28 264,33 Z" />

        <circle className="horse-eye" cx="269" cy="48" r="4.2" />
        <circle className="horse-eye-glint" cx="270.6" cy="46.3" r="1.2" />

        <path className="horse-nostril" d="M294,80 C296,82 296,85 293,86" />

        <g className="horse-mane">
          <path d="M245,45 C232,58 218,74 206,95" />
          <path d="M232,55 C220,66 208,80 198,100" />
          <path d="M220,66 C210,76 200,88 192,105" />
        </g>
      </g>

      {/* near legs — in front, brand blue, drawn on top */}
      <g ref={legHindNear} className="horse-leg horse-leg-near" style={{ transformOrigin: "98px 148px" }}>
        <line x1="98" y1="148" x2="103" y2="209" />
      </g>
      <g ref={legFrontNear} className="horse-leg horse-leg-near" style={{ transformOrigin: "206px 150px" }}>
        <line x1="206" y1="150" x2="214" y2="210" />
      </g>
    </svg>
  );
});

export default HorseSVG;
