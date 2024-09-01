import { useSelector } from "react-redux";
import { getSBProjectedFuturePrices } from "../../../features/selected/selectedSlice";
import Box from "@mui/material/Box";
import TargetDateTimeSelector from "./TargetDateTimeSelector";
import TargetUnderlyingPriceSelector from "./TargetUnderlyingPriceSelector";
import Info from "./Info";

const PNLControls = () => {
  const projectedFuturePrices = useSelector(getSBProjectedFuturePrices);

  // WHEN UNERLYING IS CHANGED, EVERYTHING SHOULD BE SET TO NULL, DO IT IN THE 
  // SET UNDERLYING REDUCER

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "fit-content", }}>
      <Box sx={{borderBottom: 1, borderBottomColor: "divider" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", 
          alignItems: { xs: "flex-start", md: "center" }, p: 2, width: "100%", height: "fit-content", columnGap: "20px" }}
        >
          <TargetDateTimeSelector />
          <Box sx={{ display: "flex", flex: 1, width: "100%" }}>
            <TargetUnderlyingPriceSelector />
          </Box>
        </Box>
      </Box>
      <Info projectedFuturePrices={projectedFuturePrices} />
    </Box>
  );
};

export default PNLControls;