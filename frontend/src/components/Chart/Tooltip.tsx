import { useRef } from "react";
import { Box, Typography } from "@mui/material";

type TooltipProps = {
  type: "changeinOpenInterest" | "openInterest";
  hovered: boolean;
  x: number;
  y: number;
  strikePrice: number | string;
  boundedHeight: number;
  boundedWidth: number;
  callOIValue: number;
  putOIValue: number;
};

const Tooltip = (props: TooltipProps) => {

  const tooltipRef = useRef<SVGForeignObjectElement>(null);

  const { type, x, y, strikePrice, boundedHeight, boundedWidth, hovered, callOIValue, putOIValue } = props;

  if (!hovered) return null;

  const xPos = x + 170 > boundedWidth ? x - 180 : x;
  const yPos = y + 80 > boundedHeight ? y - 80 : y;

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
    <foreignObject ref={tooltipRef} transform={`translate(${xPos}, ${yPos})`} 
      height={80} width={170} style={{ position: "relative", }}>
      <Box sx={{ backgroundColor: "white", opacity: 0.3, height: "100%", 
        width: "100%", position: "absolute", borderRadius: "5px" }}
      />
      <Box sx={{ backgroundColor: "transparent", height: "100%", position: "absolute", 
        width: "100%", backdropFilter: "blur(5px)", borderRadius: "5px", 
        border: 1, borderColor: "divider" }}
      />
      <Box sx={{ backgroundColor: "transparent", height: "100%", position: "relative",
        width: "100%", borderRadius: "5px", 
        border: 1, borderColor: "divider", zIndex: 9 }}
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
          <Box sx={{ height: "14px", width: "14px", backgroundColor: "#eb3434", 
            border: 1, borderColor: "text.primary", borderRadius: "2px" }}
          />
          <Typography sx={{ ml: "5px", fontSize: "14px" }}>{`${callOILabel}: ${callOIValue}`}</Typography>
        </div>
      </Box>
    </foreignObject>
  );
};

export default Tooltip;