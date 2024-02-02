import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { bisector } from "d3";
import { type DataItem } from "../../features/selected/types";
import { getRequestStatus } from "../../features/selected/selectedSlice";
import useChartDimensions from "../../hooks/useChartDimensions";
import BarGroup from "./Bar";
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

type OIChartProps = {
  data: DataItem[],
  type: "changeinOpenInterest" | "openInterest",
  spotPrice?: number | null,
};

const OIChart = ({ data, spotPrice, type }: OIChartProps) => {

  const [mouseXPos, setMouseXPos] = useState<number | null>(null);
  const [mouseYPos, setMouseYPos] = useState<number | null>(null);
  const [hoveredCallValue, setHoveredCallValue] = useState<number| null>(null);
  const [hoveredPutValue, setHoveredPutValue] = useState<number| null>(null);
  const [hoveredGroupStrike, setHoveredGroupStrike] = useState<string | null>(null);

  const requestStatus = useSelector(getRequestStatus);
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
      const nearestStrikePriceCE = nearestStrikePriceData.CE?.[type] || 0;
      const nearestStrikePricePE = nearestStrikePriceData.PE?.[type] || 0;

      setHoveredCallValue(nearestStrikePriceCE);
      setHoveredPutValue(nearestStrikePricePE);
    };

    setMouseXPos(x + 10);
    setMouseYPos(y);

    setHoveredGroupStrike(nearestStrikePrice);
  };

  const handleMouseLeave = () => {
    setHoveredGroupStrike(null);
    setHoveredCallValue(null);
    setHoveredPutValue(null);
  };

  const bars = useMemo(() => data.map((d, i) => {
    const hovered = hoveredGroupStrike === String(d.strikePrice);

    return <BarGroup
      key={i} 
      d={d} 
      xScale={xScale} 
      xSubGroupScale={xSubGroupScale} 
      yScale={yScale}
      boundedHeight={boundedHeight}
      type={type}
      hovered={hovered}
    />
  }), [data, xScale, xSubGroupScale, yScale, boundedHeight, type, hoveredGroupStrike]);

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
      label={type === "changeinOpenInterest" ? "OI Change" : "OI Total"}
    />
  }, [yScale, type]);

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <LoadingOverlay requestStatus={requestStatus} />
      <svg width={width} height={height}>
        <g transform={`translate(${[
          marginLeft,
          marginTop
        ].join(",")})`}
        >
          {bars}
          {xAxis}
          {yAxis}
          <Tooltip
            type={type}
            hovered={hoveredGroupStrike !== null}
            x={ mouseXPos || 0}
            y={ mouseYPos || 0}
            strikePrice={hoveredGroupStrike || 0}
            callOIValue={hoveredCallValue || 0}
            putOIValue={hoveredPutValue || 0}
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