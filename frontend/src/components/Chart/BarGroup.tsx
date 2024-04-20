import { useMemo } from "react";
import { type ScaleBand, type ScaleLinear } from "d3";
import { type DataItem } from "../../features/selected/types";

type BarGroupProps = {
  d: DataItem,
  xScale: ScaleBand<string>,
  xSubGroupScale: ScaleBand<string>,
  yScale: ScaleLinear<number, number>,
  boundedHeight: number,
  type: "changeinOpenInterest" | "openInterest",
  hovered: boolean,
};

const BarGroup = ({ d, xScale, xSubGroupScale, yScale, boundedHeight, type, hovered }: BarGroupProps) => {

  if (!d.CE || !d.PE) return null;

  const yCESign = Math.sign(d.CE[type] || 0);
  const yCE = yScale(d.CE[type] || 0);
  
  const yPESign = Math.sign(d.PE[type] || 0);
  const yPE = yScale(d.PE[type] || 0);

  const barGroupBackroundRect = useMemo(() => {
    return (
      <rect
        x={0}
        y={-5}
        width={((xSubGroupScale.bandwidth() * 2 + xScale.step() * 0.3))}
        height={boundedHeight + 5}
        stroke="transparent"
        fill={`${hovered ? "currentColor" : "transparent"}`}
        fillOpacity={1}
        strokeWidth={0}
        filter={"invert(1)"}
        transform={"translate(" + ((xScale(String(d.strikePrice)) || 0) - xScale.step() * 0.15) + ", 0)"}
        rx={1}
      />
    )
  }, [xSubGroupScale, xScale, boundedHeight, hovered, d.strikePrice]);

  const putBarRect = (
      <rect
        x={xSubGroupScale("PE")}
        y={Math.min(yPE, yScale(0))}
        width={xSubGroupScale.bandwidth()}
        height={((yScale(0) - yPE) * yPESign)}
        opacity={1}
        stroke="#15d458"
        fill="#15d458"
        fillOpacity={1}
        strokeWidth={1}
        transform={"translate(" + xScale(String(d.strikePrice)) + ", 0)"}
        rx={1}
      />
    );

  const callBarRect = (
      <rect
        x={xSubGroupScale("CE")}
        y={Math.min(yCE, yScale(0))}
        width={xSubGroupScale.bandwidth()}
        height={((yScale(0) - yCE) * yCESign)}
        opacity={1}
        stroke="#eb3434"
        fill="#eb3434"
        fillOpacity={1}
        strokeWidth={1}
        transform={"translate(" + xScale(String(d.strikePrice)) + ", 0)"}
        rx={1}
      />
    );

  const barGroupLine = (
      hovered && <line
        x1={(xScale(String(d.strikePrice)) || 0) + xSubGroupScale.bandwidth()}
        x2={(xScale(String(d.strikePrice)) || 0) + xSubGroupScale.bandwidth()}
        y1={0}
        y2={boundedHeight}
        strokeWidth={0.7}
        stroke="currentColor"
      />
    );

  return (
    <g>
      {barGroupBackroundRect}
      {putBarRect}
      {callBarRect}
      {barGroupLine}
    </g>
  );
};

export default BarGroup;