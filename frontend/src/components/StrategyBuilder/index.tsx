import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useOpenInterestQuery } from "../../app/services/openInterest";
import { getUnderlying } from "../../features/selected/selectedSlice";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Menu from "./Menu";
import PNLVisualizer from "./PNLVisualizer";
import PNLControls from "./PNLControls";
import LoadingOverlay from "../LoadingOverlay";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
import FloatingDrawer from "../FloatingDrawer";

const StrategyBuilder = () => {
  const viewportTheme = useTheme();
  const isLargeScreen = useMediaQuery(viewportTheme.breakpoints.up("lg"));
  const underlying = useSelector(getUnderlying);
  const { isFetching, isError } = useOpenInterestQuery({ underlying: underlying });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isLargeScreen) {
      setDrawerOpen(false);
    };
  }, [isLargeScreen]);

  return (
    <Grid container sx={{ flex: 1, height: "100%", width: "100%", p: 2, minHeight: "100vh" }}>
      <>
        {isFetching && (
          <Box sx={{ position: "absolute", inset: 0, zIndex: (theme) => theme.zIndex.drawer + 1, height: "100dvh", width: "100%", }}>
            <LoadingOverlay type="page" isError={isError} message="Fetching IVs and Prices" />
          </Box>
        )}
        {isLargeScreen ? (
          <Grid item xs={0} lg={3.7} sx={{ pr: "15px" }}>
            <Box sx={{ height: "calc(100vh - 160px)", width: "100%", position: "sticky", top: "81px" }}>
              <Menu />
            </Box>
          </Grid>
        ) : null}
        <Grid item xs={12} lg={8.3} justifyContent="center">
          <Box 
            sx={{ display: "flex", flexDirection: "column", backgroundColor: "background.paper", borderRadius: 1,
            border: 1, borderColor: "divider", rowGap: "15px", position: "relative", top: { xs: "55px", sm: "65px" } }}
          >
            <PNLVisualizer />
            <PNLControls />
          </Box>
        </Grid>
        <div style={{ top: "100px", position: "absolute", left: 0 }}>
          <FloatingDrawer
            showButton={!isLargeScreen} 
             open={drawerOpen} 
             onChange={setDrawerOpen}
          >
            <Menu />
          </FloatingDrawer>
        </div>
      </>
    </Grid>
  );
};

export default StrategyBuilder;