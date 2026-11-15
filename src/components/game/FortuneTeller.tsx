import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

export type Phase = "closed" | "h" | "v";
type Point = [number, number];
const point = ([x, y]: Point) => `${x} ${y}`;
const COLOURS = ["navy", "deep", "dusk", "navy"];

// Every pocket shares its mouth vertices with the adjacent pocket and valley.
// Discrete geometry frames keep the sheet connected throughout each paper fold.
export function FortuneTeller({ labels, phase, disabled, onPick, inside = ["SPEND", "EARN", "REDEEM"] }: {
  labels: string[];
  inside?: string[];
  inner?: boolean;
  phase: Phase;
  disabled?: boolean;
  picked?: number | null;
  onPick?: (i: number) => void;
  advance?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [fold, setFold] = useState({ h: 0, v: 0 });
  useEffect(() => {
    const target = { h: phase === "h" ? 1 : 0, v: phase === "v" ? 1 : 0 };
    let frame = 0;
    // Functional updates allow a new phase to start from the actual paper pose.
    const timer = setInterval(() => {
      frame++;
      setFold((current) => ({
        h: current.h + (target.h - current.h) / (5 - frame),
        v: current.v + (target.v - current.v) / (5 - frame),
      }));
      if (frame === 4) clearInterval(timer);
    }, 75);
    return () => clearInterval(timer);
  }, [phase]);

  const { h, v } = fold;
  const top: Point = [100, 100 - 54 * h - 64 * v];
  const right: Point = [100 + 64 * h + 54 * v, 100];
  const bottom: Point = [100, 100 + 54 * h + 64 * v];
  const left: Point = [100 - 64 * h - 54 * v, 100];
  const tips = [top, right, bottom, left];
  const seams: Point[] = [[100, 38 - 18 * h], [162 + 18 * v, 100], [100, 162 + 18 * h], [38 - 18 * v, 100]];
  const corners: Point[] = [[16, 16], [184, 16], [184, 184], [16, 184]];
  const controls: Point[] = [[52, 10], [190, 52], [148, 190], [10, 148]];
  const endControls: Point[] = [[10, 52], [148, 10], [190, 148], [52, 190]];
  const opening = Math.max(h, v);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(380px,48dvh)] select-none">
      <svg viewBox="4 4 192 192" className="block h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          {COLOURS.slice(0, 3).map((colour) => (
            <radialGradient key={colour} id={`${id}-${colour}`} cx="28%" cy="18%" r="100%">
              <stop offset="0" stopColor={`var(--fold-${colour}-light)`} />
              <stop offset="0.48" stopColor={`var(--fold-${colour})`} />
              <stop offset="1" stopColor={`var(--fold-${colour}-dark)`} />
            </radialGradient>
          ))}
          <linearGradient id={`${id}-valley`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--fold-paper-highlight)" />
            <stop offset="0.65" stopColor="var(--fold-gold)" />
            <stop offset="1" stopColor="var(--fold-gold-dark)" />
          </linearGradient>
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="12" stitchTiles="stitch" result="noise" />
            <feColorMatrix in="noise" type="saturate" values="0" />
            <feComponentTransfer result="soft-noise"><feFuncA type="linear" slope="0.32" /></feComponentTransfer>
            <feComposite in="soft-noise" in2="SourceGraphic" operator="in" result="grain" />
            <feBlend in="SourceGraphic" in2="grain" mode="soft-light" />
          </filter>
        </defs>
        <g filter={`url(#${id}-grain)`}>
          {tips.map((tip, i) => (
            <path key={`valley-${i}`} d={`M${point(tip)} L${point(tips[(i + 1) % 4] ?? top)} L100 100Z`} fill={`url(#${id}-valley)`} />
          ))}
          {corners.map((corner, i) => {
            const previous = (i + 3) % 4;
            const seam = seams[i] ?? top;
            const lastSeam = seams[previous] ?? left;
            const tip = tips[i] ?? top;
            const lastTip = tips[previous] ?? left;
            const colour = COLOURS[i] ?? "navy";
            const label = labels[i] ?? "";
            const words = label.split(" ");
            const lines = label.length > 10 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [label];
            const x = i === 0 || i === 3 ? 56 - v * 5 : 144 + v * 5;
            const y = i < 2 ? 66 - h * 15 : 137 + h * 15;
            return (
              <g key={i}>
                <path d={`M${point(corner)} Q${point(controls[i] ?? corner)} ${point(seam)} L${point(tip)} L${point(lastTip)} L${point(lastSeam)} Q${point(endControls[i] ?? corner)} ${point(corner)}Z`} fill={`url(#${id}-${colour})`} />
                <path d={`M${point(corner)} Q${point(controls[i] ?? corner)} ${point(seam)} L${point(tip)} L${point(lastTip)}Z`} fill="var(--fold-sheen)" opacity="0.16" />
                <path d={`M${point(corner)} L${point(lastTip)} L${point(lastSeam)} Q${point(endControls[i] ?? corner)} ${point(corner)}Z`} fill="var(--fold-shade)" opacity="0.18" />
                <text x={x} y={y - (lines.length > 1 ? 5 : 0)} textAnchor="middle" dominantBaseline="middle" fontSize={label.length > 7 ? 8.5 : 10} className="font-display font-semibold" fill="var(--fold-ink)">
                  {lines.map((line, j) => <tspan key={j} x={x} dy={j ? 10 : 0}>{line}</tspan>)}
                </text>
              </g>
            );
          })}
        </g>
        {opening > 0.7 && inside.map((word, i) => {
          // Printed on the interior slopes, never a separate backdrop label.
          const offset = (i - (inside.length - 1) / 2) * 23;
          return <text key={word} x={v > h ? 100 : 100 + offset} y={v > h ? 100 + offset : 100} transform={`rotate(${v > h ? -8 : 8} ${v > h ? 100 : 100 + offset} ${v > h ? 100 + offset : 100})`} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" className="font-display font-bold fill-primary">{word}</text>;
        })}
      </svg>
      <div role="group" aria-label="Paper fortune teller" className="absolute inset-[10%] grid grid-cols-2 grid-rows-2 gap-1">
        {corners.map((_, i) => <Button key={i} variant="ghost" disabled={disabled || !onPick} aria-label={labels[i]} onClick={() => onPick?.(i)} className="h-full w-full rounded-[35%] border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-2" />)}
      </div>
    </div>
  );
}
