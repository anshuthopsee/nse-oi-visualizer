import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useDeepMemo from "../../../hooks/useDeepMemo";
import { getUnderlying, setNextUpdateAt, setSBOptionLegs, getSBOptionLegs, getSBExpiry, setSBExpiry, 
  setSBATMIVsPerExpiry, setSBFuturesPerExpiry, setSBUnderlyingPrice, setSBTargetUnderlyingPrice
} from "../../../features/selected/selectedSlice";
import { useOpenInterestQuery, openInterestApi } from "../../../app/services/openInterest";
import { type DataItem } from "../../../features/selected/types";
import { getNearestStrikePrice, getNextTime } from "../../../utils";
import { Box, Typography, Button, Drawer } from "@mui/material";
import OptionLeg, { type Leg } from "./OptionLeg";
import AddEditLegs from "../AddEditLegs";
import StrategyInfo from "./StrategyInfo";

const formatData = (data: DataItem[]) => {
  return data.map((item) => {
    return {
      strike: item.strikePrice,
      callPrice: item.CE ? item.CE.lastPrice : null,
      callOI: item.CE ? item.CE.openInterest : null,
      putPrice: item.PE ? item.PE.lastPrice : null,
      putOI: item.PE ? item.PE.openInterest : null,
      syntheticFuturesPrice: item.syntheticFuturesPrice,
      iv: item.iv,
      ceGreeks: item.CE?.greeks || null,
      peGreeks: item.PE?.greeks || null
    };
  });
};

const Strategy = () => {
  const dispatch = useDispatch();
  const underlying = useSelector(getUnderlying);
  const expiry = useSelector(getSBExpiry);
  const optionLegs = useSelector(getSBOptionLegs);
  const filteredOptionLegs = useMemo(() => optionLegs.filter((leg) => leg.active), [optionLegs]);
  const memoizedOptionLegs = useDeepMemo(optionLegs);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { data, isFetching, isError } = useOpenInterestQuery({ underlying: underlying });
  const filteredExpiries = useDeepMemo(data?.filteredExpiries);
  const rows = (data && expiry) ? formatData(data.grouped[expiry]?.data || []) : [];

  const strikePrices = useMemo(() => {
    return rows.map((row) => row.strike);
  }, [rows]);

  const syntheticFuturesPrice = useMemo(() => {
    if (rows.length === 0) return null;
    return rows[0].syntheticFuturesPrice;
  }, [rows])

  const strikePriceATM = useMemo(() => {
    if (syntheticFuturesPrice === null) return null;

    return getNearestStrikePrice(strikePrices, syntheticFuturesPrice);
  }, [rows, strikePrices, syntheticFuturesPrice]);

  const handleAddEditBtnClick = () => {
    setDrawerOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const IntervalWorker: Worker = new Worker(new URL("../../../worker/IntervalWorker.ts", import.meta.url));
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

  useEffect(() => {
    if (!isFetching && !isError) {
      const now = new Date();
      const nextTime = getNextTime(now);
      dispatch(setNextUpdateAt(nextTime));
    };
  }, [isFetching, isError]);

  useEffect(() => {
    if (data && memoizedOptionLegs) {
      const updatedOptionLegs = memoizedOptionLegs.map((optionLeg) => {
        const expiryData = data.grouped[optionLeg.expiry].data;
        for (const item of expiryData) {
          if (item.strikePrice === optionLeg.strike) {
            const contractData = item[optionLeg.type];
            if (contractData) {
              return {
                ...optionLeg, 
                price: contractData.lastPrice,
                iv: item.iv
              };
            };
          };
        };
        return optionLeg;
      });
      dispatch(setSBOptionLegs({
        type: "set",
        optionLegs: updatedOptionLegs
      }));
    };

  }, [data, memoizedOptionLegs]);

  useEffect(() => {
    if (data) {
      const { grouped, underlyingValue } = data;
      const atmIVsPerExpiry: { [key: string]: number } = {};
      const futuresPerExpiry: { [key: string]: number } = {};
      Object.keys(grouped).forEach((key) => {
        atmIVsPerExpiry[key] = grouped[key].atmIV || 0;
        futuresPerExpiry[key] = grouped[key].syntheticFuturesPrice || 0;
      });
      dispatch(setSBUnderlyingPrice(underlyingValue));
      dispatch(setSBTargetUnderlyingPrice(underlyingValue));
      dispatch(setSBATMIVsPerExpiry(atmIVsPerExpiry));
      dispatch(setSBFuturesPerExpiry(futuresPerExpiry));
    };

  }, [data]);

  useEffect(() => {
    if (filteredExpiries) {
      dispatch(setSBExpiry(filteredExpiries[0]));
    };
  }, [filteredExpiries]);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSBExpiry(e.target.value));
  };

  const hanldeOptionLegChange = useCallback(
    (optionLeg: Leg, legIndexPos: number) => {
      dispatch(setSBOptionLegs({
        optionLeg: optionLeg,
        type: "replace",
        optionLegIndex: legIndexPos
      }));
    },
    [dispatch]
  );
  
  const handleOptionLegDelete = useCallback(
    (legIndexPos: number) => {
      dispatch(setSBOptionLegs({
        type: "delete",
        optionLegIndex: legIndexPos
      }));
    },
    [dispatch]
  );
  return (
    <Box sx={{ height: "auto", borderRadius: "5px", backgroundColor: "background.paper", border: 1, borderColor: "divider", px: 1.5, py: 1 }}>
      <Typography sx={{ fontSize: "15px", width: "100%", height: "fit-content",  py: 1, fontWeight: "bold" }}>Strategy</Typography>
      {optionLegs.length !== 0 && (<Box sx={{ flexDirection: "column", overflowX: "scroll" }}>
        {data && optionLegs.map((optionLeg, i) => {
          const key = String(optionLeg.strike) + optionLeg.type + optionLeg.expiry + 
          optionLeg.action + optionLeg.lots + optionLeg.price + optionLeg.iv;

          return (
            <OptionLeg
              showHeader={i === 0}
              active={optionLeg.active}
              key={key}
              data={data}
              legIndexPos={i} 
              action={optionLeg.action} 
              expiries={filteredExpiries || []} 
              expiry={optionLeg.expiry}
              strike={optionLeg.strike} 
              type={optionLeg.type} 
              lots={optionLeg.lots} 
              price={optionLeg.price || 0}
              iv={optionLeg.iv} 
              onChange={hanldeOptionLegChange}
              onDelete={handleOptionLegDelete}
            />
          )
        })}
      </Box>)}
      <Box sx={{ display: "flex", justifyContent: "start", alignItems: "center", p: 1, px: 0 }}>
        <StrategyInfo optionLegs={filteredOptionLegs} underlying={underlying} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "start", alignItems: "center", p: 1, px: 0.5 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ width: "100px", height: "40px", fontSize: "14px", textTransform: "none" }}
          onClick={handleAddEditBtnClick}
        >
          Add/Edit
        </Button>
      </Box>
      <Drawer
        anchor={"left"}
        open={drawerOpen}
        PaperProps={{
          sx: { width: "100%", maxWidth: {xs: "100%", sm: "530px"} },
        }}
        closeAfterTransition
        hideBackdrop
      >
        <Box sx={{ height: "100dvh", display: "flex", rowGap: "10px", flex: 1,
          flexDirection: "column", overflow: "auto", width: "100%",
          position: "relative" }}
        >
          <AddEditLegs 
            rows={rows}
            selectedExpiry={expiry}
            expiries={filteredExpiries || []}
            strikePriceATM={strikePriceATM}
            onExpiryChange={handleExpiryChange}
            onDrawerClose={() => setDrawerOpen(false)} 
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default Strategy;