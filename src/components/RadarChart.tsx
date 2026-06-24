export interface RadarAxis {
  label: string;
  value: number | null;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  max?: number;
  size?: number;
}

const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
const PADDING = 40;
const LABEL_OFFSET = 18;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pointAt(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function pointsToString(points: Array<{ x: number; y: number }>) {
  return points.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
}

function textAnchorFor(angle: number) {
  const x = Math.cos(angle);

  if (Math.abs(x) < 0.25) {
    return 'middle';
  }

  return x > 0 ? 'start' : 'end';
}

export function RadarChart({ axes, max = 10, size = 280 }: RadarChartProps) {
  const safeMax = max > 0 ? max : 10;
  const center = size / 2;
  const outerRadius = Math.max(0, center - PADDING);
  const axisCount = axes.length;
  const angles = axes.map((_, index) => -Math.PI / 2 + index * ((2 * Math.PI) / axisCount));
  const outerPoints = angles.map((angle) => pointAt(center, center, outerRadius, angle));
  const dataPoints = axes.map((axis, index) => {
    const value = axis.value === null ? 0 : clamp(axis.value, 0, safeMax);
    const radius = (value / safeMax) * outerRadius;

    return pointAt(center, center, radius, angles[index]);
  });

  return (
    <svg
      aria-label="Radar chart"
      role="img"
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ display: 'block', height: 'auto', maxWidth: `${size}px` }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={pointsToString(angles.map((angle) => pointAt(center, center, outerRadius * level, angle)))}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {outerPoints.map((point, index) => (
        <line
          key={axes[index].label}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      <polygon
        points={pointsToString(dataPoints)}
        fill="#3b82f6"
        fillOpacity="0.25"
        stroke="#2563eb"
        strokeWidth="2"
      />

      {dataPoints.map((point, index) => (
        <circle key={`${axes[index].label}-dot`} cx={point.x} cy={point.y} r="3" fill="#2563eb" />
      ))}

      {axes.map((axis, index) => {
        const angle = angles[index];
        const labelPoint = pointAt(center, center, outerRadius + LABEL_OFFSET, angle);
        const nearVertical = Math.abs(Math.cos(angle)) < 0.25;

        return (
          <text
            key={`${axis.label}-label`}
            x={labelPoint.x}
            y={labelPoint.y}
            fill={axis.value === null ? '#d1d5db' : '#4b5563'}
            fontSize="12"
            fontWeight="500"
            textAnchor={textAnchorFor(angle)}
            dominantBaseline={nearVertical ? 'middle' : 'central'}
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

export default RadarChart;
