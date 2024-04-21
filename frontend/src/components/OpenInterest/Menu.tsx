import { useSelector } from "react-redux";
import { getNextUpdateAt } from "../../features/selected/selectedSlice";
import { Box, Typography } from "@mui/material";
import SelectUnderlying from "./SelectUnderlying";
import Expiries from "./Expiries";
import StrikeRange from "./StrikeRange";

const LastUpdateAt = () => {
  const nextUpdateAt = useSelector(getNextUpdateAt);

  return (
    <Box sx={{ minHeight: "50px", borderRadius: "5px", backgroundColor: "background.paper", border: 1, borderColor: "divider" }}>
      <Box sx={{ display: "flex", justifyContent: "left", alignItems: "center", height: "fit-content", p: 1.5, columnGap: 1 }}>
        {nextUpdateAt && (
          <Typography variant="body1" color="textSecondary" component="div" sx={{ fontWeight: "normal" }}>Next update at {nextUpdateAt}</Typography>
        )}
      </Box>
    </Box>
  )
};

const Menu = () => {
  return (
    <Box sx={{ height: "100%", borderRadius: "5px", border: 0, borderColor: "divider", display: "flex", rowGap: "15px", flexDirection: "column" }}>
      <SelectUnderlying/>
      <Expiries/>
      <StrikeRange/>
      <LastUpdateAt/>
    </Box>
  );
};

export default Menu;