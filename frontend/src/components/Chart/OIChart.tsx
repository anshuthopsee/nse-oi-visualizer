import { useMemo, useState } from "react";
import * as d3 from "d3";
import { bisector } from "d3";
import { type DataItem } from "../../features/selected/types";
import useChartDimensions from "../../hooks/useChartDimensions";
import BarGroup from "./BarGroup";
import XAxis from "./XAxis";
import YAxis from "./YAxis";
import LoadingOverlay from "./LoadingOverlay";
import Tooltip from "./Tooltip";

export const bisectDate = (data: number[], x0: number) => {
  const dateBisector = bisector((d) => d).center;
  const index = dateBisector(data, x0, 1);
  const d0 = data[index - 1];
  const d1 = data[index];
  return d1 && (x0 - d0 > d1 - x0) ? d1 : d0;
};

type TooltipState = {
  show: boolean,
  strikePrice: string | null,
  callOI: number | null,
  putOI: number | null,
  callPrice: number | null,
  putPrice: number | null,
  callIV: number | null,
  putIV: number | null,
}

type OIChartProps = {
  data: DataItem[],
  type: "changeinOpenInterest" | "openInterest",
  isFetching: boolean,
  isError: boolean,
  spotPrice?: number | null,
};

const OIChart = ({ data, spotPrice, type, isFetching, isError }: OIChartProps) => {

  const [mouseXPos, setMouseXPos] = useState<number | null>(null);
  const [mouseYPos, setMouseYPos] = useState<number | null>(null);
  const [chartContainerRef, chartDimensions] = useChartDimensions();

  const [tooltipState, setTooltipState] = useState<TooltipState>({
    show: false,
    strikePrice: null,
    callOI: null,
    putOI: null,
    callPrice: null,
    putPrice: null,
    callIV: null,
    putIV: null,
  });

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
    return d3.scaleBand()
      .domain(data.map((d) => String(d.strikePrice)))
      .range([0, boundedWidth])
      .padding(0.3)
  }, [boundedWidth, data]);

  const xSubGroupScale = useMemo(() => {
    
    return d3.scaleBand()
      .domain(["PE", "CE"].map((d) => d))
      .range([0, xScale.bandwidth()])
  }, [boundedWidth, data]);

  const yScale = useMemo(() => {
 
    const [min, max] = [
      Math.min(
        d3.min(data, (d) => {
          if (!d.CE || !d.PE) return 0;
          
          return Math.min(
            d.CE[type] || -1, 
            d.PE[type] || -1, 
          );
        }) || 0,
        0
      ), 
      d3.max(
        data, (d) => {
          if (!d.CE || !d.PE) return 0;
    
          return Math.max(
            d.CE[type] || 1, 
            d.PE[type] || 1, 
          );
        }
      )
    ];

    return d3.scaleLinear()
      .domain([min || 0, max || 0])
      .range([boundedHeight, 0])
  }, [boundedHeight, data]);

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const [x, y] = d3.pointers(e)[0];

    // Iterate through the bands to find the one closest to the x position
    let nearestBandIndex = 0;
    let minDistance = xScale.range()[1];

    xScale.domain().forEach((band, index) => {
      const bandPosition = xScale(band) || 0;
      const distance = Math.abs(x - (bandPosition + xScale.bandwidth() / 2));

      if (distance < minDistance) {
        minDistance = distance;
        nearestBandIndex = index;
      };
    });

    const nearestStrikePrice = xScale.domain()[nearestBandIndex];

    const nearestStrikePriceData = data.find((d) => String(d.strikePrice) === nearestStrikePrice);

    if (nearestStrikePriceData) {
      setTooltipState({
        show: true,
        strikePrice: nearestStrikePrice,
        callOI: nearestStrikePriceData.CE?.[type] || 0,
        putOI: nearestStrikePriceData.PE?.[type] || 0,
        callPrice: nearestStrikePriceData.CE?.lastPrice || 0,
        putPrice: nearestStrikePriceData.PE?.lastPrice || 0,
        callIV: nearestStrikePriceData.CE?.impliedVolatility || 0,
        putIV: nearestStrikePriceData.PE?.impliedVolatility || 0,
      })
    };

    setMouseXPos(x + 10);
    setMouseYPos(y);
  };

  const handleMouseLeave = () => {
    setTooltipState({
      show: false,
      strikePrice: null,
      callOI: null,
      putOI: null,
      callPrice: null,
      putPrice: null,
      callIV: null,
      putIV: null,
    });

    setMouseXPos(null);
    setMouseYPos(null);
  };

  const bars = useMemo(() => data.map((d) => {
    const hovered = tooltipState.strikePrice === String(d.strikePrice);

    return <BarGroup
      key={d.strikePrice} 
      d={d} 
      xScale={xScale} 
      xSubGroupScale={xSubGroupScale} 
      yScale={yScale}
      boundedHeight={boundedHeight}
      type={type}
      hovered={hovered}
    />
  }), [data, xScale, xSubGroupScale, yScale, boundedHeight, type, tooltipState.strikePrice]);

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
        label="Strike Price"
        spotPrice={spotPrice}
      />
    </foreignObject>
  }, [xScale, yScale, boundedHeight, marginBottom, boundedWidth, spotPrice]);

  const yAxis = useMemo(() => {
    return <YAxis
      yScale={yScale}
      boundedWidth={boundedWidth}
      label={type === "changeinOpenInterest" ? "OI Change" : "OI Total"}
    />
  }, [yScale, type]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <LoadingOverlay isFetching={isFetching} isError={isError} />
      <svg width={width} height={height}>
        <g transform={`translate(${[
          marginLeft,
          marginTop
        ].join(",")})`}
        >
          {yAxis}
          {bars}
          {xAxis}
          <Tooltip
            type={type}
            show={tooltipState.show}
            x={mouseXPos || 0}
            y={mouseYPos || 0}
            strikePrice={tooltipState.strikePrice}
            callOIValue={tooltipState.callOI}
            putOIValue={tooltipState.putOI}
            callPrice={tooltipState.callPrice}
            putPrice={tooltipState.putPrice}
            callIV={tooltipState.callIV}
            putIV={tooltipState.putIV}
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

export default OIChart;