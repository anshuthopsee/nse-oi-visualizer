import { useEffect, useRef } from "react";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch } from "../../store";
import { fetchOIData, getUnderlying } from "../../features/selected/selectedSlice";
import { getDrawerState, setDrawerState } from "../../features/drawer/drawerSlice";
import { Grid, Box, Drawer, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Menu from "./Menu";
import OIChange from "./OIChange";
import OIHistorical from "./OITotal";

const OpenInterest = () => {
  const viewportTheme = useTheme();
  const isLargeScreen = useMediaQuery(viewportTheme.breakpoints.up("lg"));
  const controllerRef = useRef<AbortController | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const underlying = useSelector(getUnderlying);
  const drawerState = useSelector(getDrawerState);

  useEffect(() => {
    if (isLargeScreen) {
      dispatch(setDrawerState(false));
    };
  }, [isLargeScreen]);

  const callProxyAPI = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    };

    const time = new Date();
    console.log("called at", 
      time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
    );

    controllerRef.current = new AbortController();

    dispatch(fetchOIData({ 
      underlying: underlying, 
      controller: controllerRef.current 
    }));
  };

  // do I need to remove the worker?
  useEffect(() => {
    const IntervalWorker: Worker = new Worker(new URL("./worker/IntervalWorker.ts", import.meta.url));

    IntervalWorker.postMessage({ action: "start" });

    IntervalWorker.onmessage = (e) => {
      if (e.data === "get-oi") {
        callProxyAPI();
      };
    };

    return () => {
      IntervalWorker.postMessage({ action: "clear" });
      IntervalWorker.terminate();
    };

  }, [underlying]);

  return (
    <>
      <Grid container sx={{ height: "100%", width: "100%", p: 2, position: "relative", minWidth: "330px" }}>
        {isLargeScreen ? (
          <Grid item xs={0} lg={3} sx={{ pr: "15px" }}>
            <Box sx={{ height: "calc(100vh - 160px)", width: "100%", position: "sticky", top: "81px" }}>
              <Menu />
            </Box>
          </Grid>
        ) : null}
        <Grid item xs={12} lg={9} justifyContent="center">
          <Box sx={{ display: "flex", flexDirection: "column", rowGap: "15px", pb: "160px", position: "relative", top: { xs: "55px", sm: "65px" } }}>
            <OIChange />
            <OIHistorical />
          </Box>
        </Grid>
      </Grid>
      <Drawer
        anchor={"left"}
        open={drawerState}
        PaperProps={{
          sx: { maxWidth: {xs: "100%", md: "400px"} },
        }}
        onClose={() => dispatch(setDrawerState(false))}
      >
        <Box sx={{ height: "100dvh", display: "flex", rowGap: "10px", 
          flexDirection: "column", overflow: "auto", px: "10px", py: "10px", 
          position: "relative", minWidth: "330px" }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <IconButton onClick={() => dispatch(setDrawerState(false))}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
          <Box sx={{ pb: "10px" }}>
            <Menu/>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default OpenInterest;