import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useOpenInterestQuery, openInterestApi } from "../../app/services/openInterest";
import { getUnderlying } from "../../features/selected/selectedSlice";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Menu from "./Menu";
import PNLVisualizer from "./PNLVisualizer";
import PNLControls from "./PNLControls";
import LoadingOverlay from "../Common/LoadingOverlay";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
import FloatingDrawer from "../Common/FloatingDrawer";

const StrategyBuilder = () => {
  const dispatch = useDispatch();
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

  useEffect(() => {
    const IntervalWorker: Worker = new Worker(new URL("../../worker/IntervalWorker.ts", import.meta.url));
    IntervalWorker.postMessage({ action: "start" });
    IntervalWorker.onmessage = (e: MessageEvent) => {
      if (e.data === "get-oi") {
        console.log("getting oi data");
        dispatch(openInterestApi.util.invalidateTags(["OpenInterest"]));
      };
    };

    return () => {
      console.log("terminating worker");
      IntervalWorker.terminate();
    };

  }, [underlying]);

  return (
    <>
      <Grid container sx={{ flex: 1, height: "100%", width: "100%", p: 2, minHeight: "100vh" }}>
        <>
          {(isFetching || isError) && (
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
        </>
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
  );
};

export default StrategyBuilder;