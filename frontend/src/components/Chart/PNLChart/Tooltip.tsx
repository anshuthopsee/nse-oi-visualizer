import { useState, useLayoutEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type TooltipProps = {
  show: boolean;
  underlyingPriceAt: number | null;
  payoffAtTarget: number | null;
  payoffAtExpiry: number | null;
  x: number;
  y: number;
  boundedHeight: number;
  boundedWidth: number;
};

const Tooltip = (props: TooltipProps) => {

  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const [tooltiplWidth, setTooltipWidth] = useState(0);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);

  const { 
    x, y, 
    boundedHeight, boundedWidth, show,
    underlyingPriceAt, payoffAtTarget, payoffAtExpiry 
  } = props;

  useLayoutEffect(() => {
    if (!tooltipContentRef.current) return;

    const tooltipContent = tooltipContentRef.current;
    const { width, height } = tooltipContent.getBoundingClientRect();

    const xPos = x + width > boundedWidth ? x - width : x;
    const yPos = y + height > boundedHeight ? y - height : y;

    setTooltipWidth(width);
    setTooltipHeight(height);

    setXPos(xPos);
    setYPos(yPos);
  }, [x, y, boundedHeight, boundedWidth])

  if (!show) return null;

  return (
    <foreignObject transform={`translate(${xPos}, ${yPos})`} 
      height={tooltipHeight} width={tooltiplWidth} style={{ position: "relative", }}>
      <div ref={tooltipContentRef} style={{ position: "relative", height: "max-content", width: "max-content", minWidth: "170px", }}>
        <Box sx={{ backgroundColor: "white", opacity: 0.1, height: "100%", 
          width: "100%", position: "absolute", borderRadius: "5px" }}
        />
        <Box sx={{ backgroundColor: "transparent", height: "100%", position: "absolute", 
          width: "100%", backdropFilter: "blur(5px)", borderRadius: "5px", 
          border: 1, borderColor: "divider" }}
        />
        <Box sx={{ backgroundColor: "transparent", height: "100%", position: "relative",
          width: "100%", borderRadius: "5px", display: "flex", flexDirection: "column", 
          border: 1, borderColor: "divider", zIndex: 9, pb: "5px" }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold", mx: "5px" }}>When price is at: {underlyingPriceAt?.toFixed(2)}</Typography>
          <Typography sx={{ px: "5px", fontSize: "14px" }}>Payoff at target: {payoffAtTarget?.toFixed(2)}</Typography>
          <Typography sx={{ px: "5px", fontSize: "14px" }}>Payoff at expiry: {payoffAtExpiry?.toFixed(2)}</Typography>
        </Box>
      </div>
    </foreignObject>
  );
};

export default Tooltip;