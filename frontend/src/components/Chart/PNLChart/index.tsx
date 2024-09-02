import { useMemo, useState } from "react";
import * as d3 from "d3";
import { bisector } from "d3";
import useChartDimensions from "../../../hooks/useChartDimensions";
import { type PayoffAt } from "../../../features/selected/types";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import PNLAtTargetLine from "./PNLAtTarrgetLine";
import PNLAtExpiryLine from "./PNLAtExpiryLine";
import LoadingOverlay from "../../LoadingOverlay";
import Tooltip from "./Tooltip";
import Crosshair from "./Crosshair";

type TooltipState = {
  underlyingPriceAt: number | null,
  payoffAtTarget: number | null,
  payoffAtExpiry: number | null,
}

type PNLChartProps = {
  payoffsAtTarget: PayoffAt[];
  payoffsAtExpiry: PayoffAt[];
  underlyingPrice: number;
  targetUnderlyingPrice: number;
  payoffAtTarget: number;
  isFetching: boolean;
  isError: boolean;
  error: string | null;
};

const PNLChart = ({ payoffsAtTarget, payoffsAtExpiry, underlyingPrice, targetUnderlyingPrice, payoffAtTarget, isFetching, isError }: PNLChartProps) => {
  
  const [mouseXPos, setMouseXPos] = useState<number | null>(null);
  const [mouseYPos, setMouseYPos] = useState<number | null>(null);
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const [chartContainerRef, chartDimensions] = useChartDimensions();

  const { 
    width, 
    height, 
    marginTop,
    marginBottom, 
    marginLeft, 
    boundedWidth, 
    boundedHeight 
  } = chartDimensions;

  const xScale = useMemo(() => {
    const xMin = d3.min(payoffsAtTarget, (d) => d.at) || 0;
    const xMax = d3.max(payoffsAtTarget, (d) => d.at) || 0;
    return d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, boundedWidth])
  }, [boundedWidth, payoffsAtTarget]);

  const yScale = useMemo(() => {
    const yMinAtTarget = Math.min(d3.min(payoffsAtTarget, (d) => d.payoff) || 0, 0);
    const yMaxAtTarget = d3.max(payoffsAtTarget, (d) => d.payoff) || 0;
    const yMinAtExpiry = Math.min(d3.min(payoffsAtExpiry, (d) => d.payoff) || 0, 0);
    const yMaxAtExpiry = d3.max(payoffsAtExpiry, (d) => d.payoff) || 0;
    const yMin = Math.min(yMinAtTarget, yMinAtExpiry);
    const yMax = Math.max(yMaxAtTarget, yMaxAtExpiry);
    return d3.scaleLinear()
      .domain([yMin, yMax])
      .range([boundedHeight, 0])
      .nice();
  }, [boundedHeight, payoffsAtTarget]);

  const xAxis = useMemo(() => {
    return <foreignObject
      id="g" 
      transform={`translate(${[
      0,
      boundedHeight,
    ].join(",")})`}
      width={boundedWidth}
      height={marginBottom}
      style={{ overflow: "visible" }}
    >
      <XAxis
        xScale={xScale}
        yScale={yScale}
        boundedHeight={boundedHeight}
        spotPrice={underlyingPrice}
        targetUnderlyingPrice={targetUnderlyingPrice}
        payoffAtTarget={payoffAtTarget}
      />
    </foreignObject>
  }, [xScale, yScale, boundedHeight, marginBottom, boundedWidth]);

  const yAxis = useMemo(() => {
    return <YAxis
      yScale={yScale}
      boundedWidth={boundedWidth}
      label={"Profit & Loss"}
    />
  }, [yScale]);

  const pnlAtTargetLine = useMemo(() => {
    return <PNLAtTargetLine
      xScale={xScale}
      yScale={yScale}
      boundedHeight={boundedHeight}
      payoffsAtTarget={payoffsAtTarget}
    />
  }, [xScale, yScale, boundedHeight, payoffsAtTarget]);

  const pnlAtExpiryLine = useMemo(() => {
    return <PNLAtExpiryLine
      xScale={xScale}
      yScale={yScale}
      boundedHeight={boundedHeight}
      payoffsAtExpiry={payoffsAtExpiry}
    />
  }, [xScale, yScale, boundedHeight, payoffsAtExpiry]);

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const [x, _y] = d3.pointers(e)[0];
    const bisect = bisector((d: PayoffAt) => d.at).left;
    const x0 = xScale.invert(x);
    const nearestBandIndex = bisect(payoffsAtTarget, x0, 1);
    const nearestUnderlyingPrice = payoffsAtTarget[nearestBandIndex].at;
    const nearestPayoffAtTarget = payoffsAtTarget[nearestBandIndex].payoff;
    const nearestPayoffAtExpiry = payoffsAtExpiry[nearestBandIndex].payoff;
    const xPos = xScale(nearestUnderlyingPrice);
    const yPos = yScale(nearestPayoffAtTarget);

    if (nearestPayoffAtTarget && nearestPayoffAtExpiry) {
      setTooltipState({
        underlyingPriceAt: nearestUnderlyingPrice,
        payoffAtTarget: nearestPayoffAtTarget,
        payoffAtExpiry: nearestPayoffAtExpiry,
      })
    };

    setMouseXPos(xPos);
    setMouseYPos(yPos);
  };

  const handleMouseLeave = () => {
    setTooltipState(null);
    setMouseXPos(null);
    setMouseYPos(null);
  };

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      {isFetching && <LoadingOverlay isError={isError} />}
      <svg width={width} height={height}>
        <g transform={`translate(${[
          marginLeft,
          marginTop
        ].join(",")})`}
        >
          {yAxis}
          {pnlAtTargetLine}
          {pnlAtExpiryLine}
          {xAxis}
          <Crosshair 
            show={!!tooltipState} 
            x={mouseXPos || 0} 
            y={mouseYPos || 0} 
            boundedHeight={boundedHeight} 
            boundedWidth={boundedWidth}
          />
          <Tooltip
            show={!!tooltipState}
            underlyingPriceAt={tooltipState?.underlyingPriceAt || null}
            payoffAtTarget={tooltipState?.payoffAtTarget || null}
            payoffAtExpiry={tooltipState?.payoffAtExpiry || null}
            x={mouseXPos || 0}
            y={mouseYPos || 0}
            boundedHeight={boundedHeight}
            boundedWidth={boundedWidth}
          />
          <rect
            width={boundedWidth}
            height={boundedHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </g>
      </svg>
    </div>
  );
};

export default PNLChart;