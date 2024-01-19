import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Grid, Typography } from "@mui/material";
import { getUnderlying, setUnderlying } from "../../features/selected/selectedSlice";

type IndexIdentifiers = "NIFTY - Weekly" | "BANKNIFTY - Weekly" | "NIFTY - Monthly" | "BANKNIFTY - Monthly";

const SelectIndices = () => {
  const dispatch = useDispatch();
  const underlying = useSelector(getUnderlying);

  const handleClick = (selected: IndexIdentifiers) => {
    dispatch(setUnderlying(selected));
  };

  return (
    <Grid container sx={{ width: "100%" }}>
      <Grid item xs={6} sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRight: 1, borderRightColor: "divider" }}>
        <Box sx={{ height: "100%", display: "flex", mx: 1.5, flexDirection: "column" }}>
          <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", pt: 1 }}>NIFTY</Typography>
          <Box sx={{ width: "100%", height: "70px", alignItems: "center", display: "flex", columnGap: 1 }}>
            <Button size="small" disableElevation variant={underlying === "NIFTY - Weekly" ? "contained" : "outlined"}
              sx={{ fontSize: { xs: "12px", md: "11px", xl: "12px" }, minWidth: "40px", textTransform: "none" }}
              onClick={() => handleClick("NIFTY - Weekly")}
            >
              Weekly
            </Button>
            <Button size="small" disableElevation variant={underlying === "NIFTY - Monthly" ? "contained" : "outlined"}
              sx={{ fontSize: { xs: "12px", md: "11px", xl: "12px" }, minWidth: "40px", textTransform: "none" }}
              onClick={() => handleClick("NIFTY - Monthly")}
            >
              Monthly
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={6} sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ height: "100%", display: "flex", mx: 1.5, flexDirection: "column" }}>
          <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content", pt: 1 }}>BANKNIFTY</Typography>
          <Box sx={{ width: "100%", height: "70px", alignItems: "center", display: "flex", columnGap: 1 }}>
            <Button size="small" disableElevation variant={underlying === "BANKNIFTY - Weekly" ? "contained" : "outlined"}
              sx={{ fontSize: { xs: "12px", md: "11px", xl: "12px" }, minWidth: "40px", textTransform: "none" }}
              onClick={() => handleClick("BANKNIFTY - Weekly")}
            >
                Weekly
              </Button>
            <Button size="small" disableElevation variant={underlying === "BANKNIFTY - Monthly" ? "contained" : "outlined"}
              sx={{ fontSize: { xs: "12px", md: "11px", xl: "12px" }, minWidth: "40px", textTransform: "none" }}
              onClick={() => handleClick("BANKNIFTY - Monthly")}
            >
              Monthly
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default SelectIndices;