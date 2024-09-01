import { useSelector } from "react-redux";
import { getSBOptionLegs } from "../../../features/selected/selectedSlice";
import { type BuilderData } from "../../../features/selected/types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type InfoProps = {
  projectedFuturePrices: BuilderData["projectedFuturesPrices"];
};

const Info = ({ projectedFuturePrices }: InfoProps) => {
  const optionLegs = useSelector(getSBOptionLegs);
  const filteredOptionLegs = optionLegs.filter((leg) => leg.active);
  const show = filteredOptionLegs.length > 0 && projectedFuturePrices?.length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2, width: "100%", height: "fit-content", rowGap: 2 }}>
      {show && (
        <>
          <Typography variant="body2" color="text.primary">Target Datetime Futures Prices</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", gap: "10px", width: "100%", flexWrap: "wrap"}}>
            {projectedFuturePrices.map((item, i) => (
              <Box key={i} sx={{ display: "flex", flexDirection: "row", columnGap: "10px", py: 1, px: 1, backgroundColor: "color-mix(in srgb, currentColor 3%, transparent)",
                width: "240px", justifyContent: "space-between", border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="body2" color="text.primary" sx={{ fontSize: "14px", opacity: 0.5 }}>{item.expiry}</Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontSize: "14px" }}>{item.price.toFixed(2)}</Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Info;