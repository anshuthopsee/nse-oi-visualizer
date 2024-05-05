import { useEffect, useLayoutEffect } from "react";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import { useOpenInterestQuery, openInterestApi } from "../../app/services/openInterest";
import { type AppDispatch } from "../../store";
import { getUnderlying, getExpiries, setExpiries, getStrikeRange, getStrikeDistanceFromATM, 
  setMinMaxStrike, setNextUpdateAt } from "../../features/selected/selectedSlice";
import { getMinAndMaxStrikePrice, getNextTime, haveExpiriesChanged } from "../../utils";
import { getDrawerState, setDrawerState } from "../../features/drawer/drawerSlice";
import { Grid, Box, Drawer, IconButton } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Menu from "./Menu";
import OIChange from "./OIChange";
import OITotal from "./OITotal";

const OpenInterest = () => {
  const viewportTheme = useTheme();
  const isLargeScreen = useMediaQuery(viewportTheme.breakpoints.up("lg"));
  const dispatch = useDispatch<AppDispatch>();
  const underlying = useSelector(getUnderlying);
  const expiries = useSelector(getExpiries);
  const strikeRange = useSelector(getStrikeRange);
  const strikeDistanceFromATM = useSelector(getStrikeDistanceFromATM);
  const drawerState = useSelector(getDrawerState);
  const { data, isFetching, isError } = useOpenInterestQuery({ underlying: underlying });

  useEffect(() => {
    if (isLargeScreen) {
      dispatch(setDrawerState(false));
    };
  }, [isLargeScreen]);

  useLayoutEffect(() => {
    if (data) {

      const { strikePrices, underlyingValue } = data;
      
      if (strikeDistanceFromATM === null) return;

      const { minStrike, maxStrike } = getMinAndMaxStrikePrice(
        strikePrices, 
        underlyingValue, 
        strikeDistanceFromATM
      );

      dispatch(setMinMaxStrike({ min: minStrike, max: maxStrike }));
    };

  }, [data, strikeDistanceFromATM]);

  useLayoutEffect(() => {
    if (data && data.underlying) {
      const { filteredExpiries } = data;
      const updatedExpiries = filteredExpiries.map((expiry, i) => {
        return {
          date: expiry,
          chosen: i < 2
        }
      });
      dispatch(setExpiries(updatedExpiries));
    };
  }, [data?.underlying]);

  useLayoutEffect(() => {
    if (data) {
      const { filteredExpiries } = data;

      if (!isFetching && !isError) {

        if (haveExpiriesChanged((expiries || []).map((expiry) => expiry.date), filteredExpiries)) {
          
          const updatedExpiries = filteredExpiries.map((expiry, i) => {
            return {
              date: expiry,
              chosen: i < 2
            }
          });
  
          dispatch(setExpiries(updatedExpiries));
        };
      };
    };
  }, [data, isFetching, isError]);

  useLayoutEffect(() => {
    const IntervalWorker: Worker = new Worker(new URL("./worker/IntervalWorker.ts", import.meta.url));

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

  useLayoutEffect(() => {
    if (!isFetching && !isError) {
      const now = new Date();
      const nextTime = getNextTime(now);
      dispatch(setNextUpdateAt(nextTime));
    };

  }, [isFetching, isError]);

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
            <OIChange 
              data={data || null}
              expiries={expiries}
              strikeRange={strikeRange}
              isFetching={isFetching}
              isError={isError}
            />
            <OITotal 
              data={data || null}
              expiries={expiries}
              strikeRange={strikeRange}
              isFetching={isFetching}
              isError={isError}
            />
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