import React from 'react';
import Svg, { Circle, Rect, Polygon, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

const SIZE = 140;

export function CircleShape() {
  return (
    <Svg width={SIZE} height={SIZE}>
      <Defs>
        <RadialGradient id="cg" cx="40%" cy="35%" r="60%">
          <Stop offset="0%" stopColor="#FFB347" />
          <Stop offset="100%" stopColor="#FF6F00" />
        </RadialGradient>
      </Defs>
      <Circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 6} fill="url(#cg)" />
    </Svg>
  );
}

export function SquareShape() {
  return (
    <Svg width={SIZE} height={SIZE}>
      <Defs>
        <RadialGradient id="sg" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#64B5F6" />
          <Stop offset="100%" stopColor="#1565C0" />
        </RadialGradient>
      </Defs>
      <Rect x={6} y={6} width={SIZE - 12} height={SIZE - 12} rx={8} fill="url(#sg)" />
    </Svg>
  );
}

export function TriangleShape() {
  const pts = `${SIZE / 2},8 ${SIZE - 8},${SIZE - 8} 8,${SIZE - 8}`;
  return (
    <Svg width={SIZE} height={SIZE}>
      <Defs>
        <RadialGradient id="tg" cx="50%" cy="40%" r="60%">
          <Stop offset="0%" stopColor="#EF9A9A" />
          <Stop offset="100%" stopColor="#C62828" />
        </RadialGradient>
      </Defs>
      <Polygon points={pts} fill="url(#tg)" />
    </Svg>
  );
}

export function RectangleShape() {
  const W = SIZE * 1.6;
  const H = SIZE * 0.75;
  return (
    <Svg width={W} height={H}>
      <Defs>
        <RadialGradient id="rg" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#CE93D8" />
          <Stop offset="100%" stopColor="#6A1B9A" />
        </RadialGradient>
      </Defs>
      <Rect x={6} y={6} width={W - 12} height={H - 12} rx={8} fill="url(#rg)" />
    </Svg>
  );
}

export function StarShape() {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const outerR = SIZE / 2 - 6;
  const innerR = outerR * 0.42;
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
  return (
    <Svg width={SIZE} height={SIZE}>
      <Defs>
        <RadialGradient id="stg" cx="40%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#FFF176" />
          <Stop offset="100%" stopColor="#F9A825" />
        </RadialGradient>
      </Defs>
      <Polygon points={points} fill="url(#stg)" />
    </Svg>
  );
}

export function HeartShape() {
  const s = SIZE / 80;
  const d = `M ${40 * s},${68 * s} C ${40 * s},${68 * s} ${6 * s},${45 * s} ${6 * s},${24 * s} C ${6 * s},${13 * s} ${15 * s},${4 * s} ${26 * s},${4 * s} C ${32 * s},${4 * s} ${38 * s},${8 * s} ${40 * s},${13 * s} C ${42 * s},${8 * s} ${48 * s},${4 * s} ${54 * s},${4 * s} C ${65 * s},${4 * s} ${74 * s},${13 * s} ${74 * s},${24 * s} C ${74 * s},${45 * s} ${40 * s},${68 * s} ${40 * s},${68 * s} Z`;
  return (
    <Svg width={SIZE} height={SIZE * 0.9}>
      <Defs>
        <RadialGradient id="hg" cx="40%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#F48FB1" />
          <Stop offset="100%" stopColor="#C62828" />
        </RadialGradient>
      </Defs>
      <Path d={d} fill="url(#hg)" />
    </Svg>
  );
}

export const SHAPE_GRAPHICS: Record<string, React.ReactNode> = {
  Circle: <CircleShape />,
  Square: <SquareShape />,
  Triangle: <TriangleShape />,
  Rectangle: <RectangleShape />,
  Star: <StarShape />,
  Heart: <HeartShape />,
};
