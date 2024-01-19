import { Box } from "@mui/material";
import SelectUnderlying from "./SelectUnderlying";
import Expiries from "./Expiries";
import StrikeRange from "./StrikeRange";

const Menu = () => {
  return (
    <Box sx={{ height: "100%", borderRadius: "5px", border: 0, borderColor: "divider", display: "flex", rowGap: "15px", flexDirection: "column" }}>
      <SelectUnderlying/>
      <Expiries/>
      <StrikeRange/>
    </Box>
  );
};

export default Menu;