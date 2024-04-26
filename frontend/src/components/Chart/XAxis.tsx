import { useMemo } from "react";
import { ScaleBand, ScaleLinear } from "d3";
import { getNearestStrikePrice } from "../../utils";

type XAxisProps = {
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  boundedHeight: number;
  label?: string;
  spotPrice?: number | null;
};

const XAxis = ({
  xScale,
  yScale,
  boundedHeight,
  label,
  spotPrice = null,
}: XAxisProps) => {

  const numberOfTicksToShow = Math.round(xScale.range()[xScale.range().length - 1] / 100);

  const strikePriceATM = useMemo(() => {
    if (spotPrice === null) return null;

    const strikePrices = xScale.domain().map((d) => Number(d));
    return getNearestStrikePrice(strikePrices, spotPrice);
  }, [xScale, spotPrice]);

  const strikePriceATMPosition = useMemo(() => {
    if (strikePriceATM === null || strikePriceATM === 0) return null;

    return (xScale(String(strikePriceATM)) || 0) + xScale.bandwidth() / 2;
  }, [xScale, strikePriceATM]);

  const range = useMemo(() => {
    return xScale.range();
  }, [xScale]);

  const ticks = useMemo(() => {
    const domain = xScale.domain();

    return domain
      .map((value) => ({
        value,
        xOffset: (xScale(value) || 0) + xScale.bandwidth() / 2
      }));
  }, [xScale]);

  return (
    <svg width={"100%"} height={"100%"} style={{ overflow: 'visible' }}>
      <path
        transform={`translate(0, ${-boundedHeight + yScale(0)})`}
        d={[
          "M", range[0], 0,
          "v", 0,
          "H", range[1],
          "v", 0,
        ].join(" ")}
        fill="none"
        stroke="currentColor"
        opacity={0.5}
      />
      {ticks.map(({ value, xOffset }, i) => {
        const interval = Math.floor(ticks.length / numberOfTicksToShow);
        const showTick = i % interval === 0;

        return (
          <g
            key={value}
            transform={`translate(${xOffset}, 0)`}
          >
            <line
              y2={-boundedHeight}
              stroke="currentColor"
              opacity={showTick ? 0.2 : 0}
            />
            <text
              key={value}
              fill="currentColor"
              opacity={showTick ? 0.5 : 0}
              style={{
                fontSize: "10px",
                textAnchor: "middle",
                transform: "translateY(20px)"
              }}>
              { value }
            </text>
          </g>
        )
      })}
      {spotPrice !== null && strikePriceATMPosition !== null && (
        <g
          transform={`translate(${strikePriceATMPosition}, 0)`}
        >
          <text 
            textAnchor="middle" 
            fill="currentColor"
            style={{
              fontSize: "11px",
              transform: `translateY(${-boundedHeight - 10}px)`
            }}
          >{`Spot- ${spotPrice}`}</text>
          <line
            y2={-boundedHeight}
            stroke="currentColor"
            strokeDasharray={"8 8"}
            strokeWidth={2.5}
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