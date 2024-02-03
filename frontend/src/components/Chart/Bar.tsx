import { type ScaleBand, type ScaleLinear } from "d3";
import { type DataItem } from "../../features/selected/types";

type BarProps = {
  d: DataItem,
  xScale: ScaleBand<string>,
  xSubGroupScale: ScaleBand<string>,
  yScale: ScaleLinear<number, number>,
  boundedHeight: number,
  type: "changeinOpenInterest" | "openInterest",
  hovered: boolean,
};

const Bar = ({ d, xScale, xSubGroupScale, yScale, boundedHeight, type, hovered }: BarProps) => {

  if (!d.CE || !d.PE) return null;

  const yCESign = Math.sign(d.CE[type] || 0);
  const yCE = yScale(d.CE[type] || 0);
  
  const yPESign = Math.sign(d.PE[type] || 0);
  const yPE = yScale(d.PE[type] || 0);

  return (
    <g>
      <rect
        x={xSubGroupScale("PE")}
        y={Math.min(yPE, yScale(0))}
        width={xSubGroupScale.bandwidth()}
        height={((yScale(0) - yPE) * yPESign)}
        opacity={hovered ? 0.6 : 1}
        stroke="#15d458"
        fill="#15d458"
        fillOpacity={1}
        strokeWidth={1}
        transform={"translate(" + xScale(String(d.strikePrice)) + ", 0)"}
        rx={1}
      />
      <rect
        x={xSubGroupScale("CE")}
        y={Math.min(yCE, yScale(0))}
        width={xSubGroupScale.bandwidth()}
        height={((yScale(0) - yCE) * yCESign)}
        opacity={hovered ? 0.6 : 1}
        stroke="#eb3434"
        fill="#eb3434"
        fillOpacity={1}
        strokeWidth={1}
        transform={"translate(" + xScale(String(d.strikePrice)) + ", 0)"}
        rx={1}
      />
      {hovered && (
        <line
          x1={(xScale(String(d.strikePrice)) || 0) + xSubGroupScale.bandwidth()}
          x2={(xScale(String(d.strikePrice)) || 0) + xSubGroupScale.bandwidth()}
          y1={0}
          y2={boundedHeight}
          strokeWidth={0.7}
          stroke="currentColor"
        />
      )}
    </g>
  );
};

export default Bar;