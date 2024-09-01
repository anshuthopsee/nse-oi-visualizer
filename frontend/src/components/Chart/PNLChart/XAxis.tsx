import { useMemo } from "react";
import { type ScaleLinear } from "d3";

type XAxisProps = {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  boundedHeight: number;
  label?: string;
  spotPrice: number | null;
  targetUnderlyingPrice: number;
  payoffAtTarget: number;
};

const XAxis = ({
  xScale,
  yScale,
  boundedHeight,
  label,
  spotPrice,
  targetUnderlyingPrice,
  payoffAtTarget
}: XAxisProps) => {

  const spotPricePosition = useMemo(() => {
    if (spotPrice === null || spotPrice === 0) return null;

    return (xScale(spotPrice) || 0);
  }, [xScale, spotPrice]);

  const targetUnderlyingPricePosition = useMemo(() => {
    if (!targetUnderlyingPrice) return null;

    return (xScale(targetUnderlyingPrice) || 0);
  }, [xScale, targetUnderlyingPrice]);

  const ticks = useMemo(() => {
    return xScale.ticks(7).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [xScale]);

  const range = useMemo(() => {
    return xScale.range();
  }, [xScale]);

  return (
    <svg width={"100%"} height={"100%"} style={{ overflow: 'visible' }}>
      <line
        x1={range[0]}
        y1={-boundedHeight + yScale(0)}
        x2={range[1]}
        y2={-boundedHeight + yScale(0)}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {ticks.map(({ value, xOffset }) => {
        return (
          <g
            key={value}
            transform={`translate(${xOffset}, 0)`}
          >
            <line
              y2={-boundedHeight}
              stroke="currentColor"
              opacity={0.2}
            />
            <text
              key={value}
              fill="currentColor"
              opacity={0.7}
              style={{
                fontSize: "10px",
                textAnchor: "middle",
                transform: "translateY(30px)"
              }}>
              { value }
            </text>
          </g>
        )
      })}
      {spotPrice !== null && (
        <g
          transform={`translate(${spotPricePosition}, 0)`}
        >
          <text 
            textAnchor="middle" 
            fill="currentColor"
            style={{
              fontSize: "11px",
              transform: `translateY(${-boundedHeight - 5}px)`
            }}
          >{`Spot: ${spotPrice}`}</text>
          <line
            y2={-boundedHeight}
            stroke="currentColor"
            strokeDasharray={"8 8"}
            strokeWidth={1.5}
            opacity={0.5}
          />
        </g>
      )}
      {targetUnderlyingPrice !== null && (
        <g
          transform={`translate(${targetUnderlyingPricePosition}, 0)`}
        >
          <text 
            textAnchor="middle" 
            fill="currentColor"
            style={{
              fontSize: "11px",
              transform: `translateY(${15}px)`
            }}
          >{`Payoff: ${payoffAtTarget.toFixed(2)}`}</text>
          <line
            y2={-boundedHeight}
            stroke={payoffAtTarget > 0 ? "#3ede59" : "#de2150"}
            strokeWidth={1}
            opacity={0.5}
          />
        </g>
      )}
      <text
        fill="currentColor"
        opacity={0.5}
        style={{
          fontSize: "12px",
          textAnchor: "middle",
          transform: `translate(${range[0] + (range[1] - range[0]) / 2}px, 45px)`
        }}>
        {label}
      </text>
    </svg>
  );
};

export default XAxis;