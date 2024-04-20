import { useRef, useLayoutEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

type TooltipProps = {
  type: "changeinOpenInterest" | "openInterest";
  show: boolean;
  x: number;
  y: number;
  strikePrice: number | string | null;
  boundedHeight: number;
  boundedWidth: number;
  callOIValue: number | null;
  putOIValue: number | null;
  callPrice: number | null;
  putPrice: number | null;
  callIV: number | null;
  putIV: number | null;
};

const Tooltip = (props: TooltipProps) => {

  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const [tooltiplWidth, setTooltipWidth] = useState(0);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);

  const { 
    type, x, y, strikePrice, 
    boundedHeight, boundedWidth, show, 
    callOIValue, putOIValue, callPrice, 
    putPrice, callIV, putIV 
  } = props;

  useLayoutEffect(() => {
    if (!tooltipContentRef.current) return;

    const tooltipContent = tooltipContentRef.current;
    const { width, height } = tooltipContent.getBoundingClientRect();

    const xPos = x + width > boundedWidth ? x - width - 20 : x;
    const yPos = y + height > boundedHeight ? y - height : y;

    setTooltipWidth(width);
    setTooltipHeight(height);

    setXPos(xPos);
    setYPos(yPos);
  }, [x, y, boundedHeight, boundedWidth])

  if (!show) return null;

  let putOILabel = "";
  let callOILabel =  "";

  if (type === "changeinOpenInterest") {
    putOILabel = "Put OI Chg";
    callOILabel = "Call OI Chg";
  } else if (type === "openInterest") {
    putOILabel = "Put OI";
    callOILabel = "Call OI";
  };

  return (
    <foreignObject transform={`translate(${xPos}, ${yPos})`} 
      height={tooltipHeight} width={tooltiplWidth} style={{ position: "relative", }}>
      <div ref={tooltipContentRef} style={{ position: "relative", height: "max-content", width: "max-content", minWidth: "170px" }}>
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
          <Typography variant="body1" sx={{ fontWeight: "bold", mx: "5px" }}>
            Strike Price: {strikePrice}
          </Typography>
          <div style={{ display: "inline-flex", margin: "0px 5px", alignItems: "center" }}>
            <Box sx={{ height: "14px", width: "14px", backgroundColor: "#15d458", 
              border: 1, borderColor: "text.primary", borderRadius: "2px" }}
            />
            <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`${putOILabel}: ${putOIValue}`}</Typography>
          </div>
          <div style={{ display: "inline-flex", margin: "0px 5px", alignItems: "center" }}>
            <Box sx={{ height: "14px", width: "14px", backgroundColor: "#15d458", 
              border: 1, borderColor: "text.primary", borderRadius: "2px" }}
            />
            <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`Put Price: ₹${putPrice}`}</Typography>
          </div>
          <div style={{ display: "inline-flex", margin: "0px 5px", alignItems: "center" }}>
            <Box sx={{ height: "14px", width: "14px", backgroundColor: "#15d458", 
              border: 1, borderColor: "text.primary", borderRadius: "2px" }}
            />
            <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`Put IV: ${putIV}`}</Typography>
          </div>
          <div style={{ display: "inline-flex", margin: "0px 5px", alignItems: "center" }}>
            <Box sx={{ height: "14px", width: "14px", backgroundColor: "#eb3434", 
              border: 1, borderColor: "text.primary", borderRadius: "2px" }}
            />
            <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`${callOILabel}: ${callOIValue}`}</Typography>
          </div>
          <div style={{ display: "inline-flex", margin: "0px 5px", alignItems: "center" }}>
            <Box sx={{ height: "14px", width: "14px", backgroundColor: "#eb3434", 
              border: 1, borderColor: "text.primary", borderRadius: "2px" }}
            />
            <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`Call Price: ₹${callPrice}`}</Typography>
          </div>
          <div style={{ display: "inline-flex", margin: "0px 5px", alignItems: "center" }}>
            <Box sx={{ height: "14px", width: "14px", backgroundColor: "#eb3434", 
              border: 1, borderColor: "text.primary", borderRadius: "2px" }}
            />
            <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`Call IV: ${callIV}`}</Typography>
          </div>
        </Box>
      </div>
    </foreignObject>
  );
};

export default Tooltip;