import { useMemo, useEffect, type ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useBuilderQuery } from "../../../app/services/openInterest";
import { getSBUnderlyingPrice, getSBTargetUnderlyingPrice, getSBTargetDateTime, getUnderlying,
  getSBFuturesPerExpiry, getSBATMIVsPerExpiry, getSBOptionLegs, setSBProjectedFuturePrices,
} from "../../../features/selected/selectedSlice";
import { LOTSIZES } from "../../../identifiers";
import { getUnderlyingType, getActiveOptionLegs } from "../../../utils";
import PNLChart from "../../Chart/PNLChart";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LineAxisIcon from '@mui/icons-material/LineAxis';

const PNLVisualizer = () => {
  const dispatch = useDispatch();
  const underlying = useSelector(getUnderlying);
  const lotSize = LOTSIZES.get(underlying) || null;
  const isIndex = getUnderlyingType(underlying);
  const underlyingPrice = useSelector(getSBUnderlyingPrice);
  const targetUnderlyingPrice = useSelector(getSBTargetUnderlyingPrice);
  const atmIVsPerExpiry = useSelector(getSBATMIVsPerExpiry);
  const futuresPerExpiry = useSelector(getSBFuturesPerExpiry);
  const optionLegs = useSelector(getSBOptionLegs);

  const activeOptionLegs = useMemo(() => {
    return getActiveOptionLegs(optionLegs);
  }, [optionLegs]);

  const targetDateTimeISOString = useSelector(getSBTargetDateTime);

  const builderQueryParams = useMemo(() => ({ 
    underlyingPrice, targetUnderlyingPrice, targetDateTimeISOString, atmIVsPerExpiry, 
    futuresPerExpiry, optionLegs: activeOptionLegs, lotSize, isIndex }),
    [
      underlyingPrice, targetUnderlyingPrice, targetDateTimeISOString, atmIVsPerExpiry, 
      futuresPerExpiry, activeOptionLegs, lotSize, isIndex
    ]
  );

  const skip = ((activeOptionLegs.length === 0) || 
  !underlyingPrice || !targetUnderlyingPrice || !targetDateTimeISOString || 
  !atmIVsPerExpiry || !futuresPerExpiry || !lotSize);

  const { data: builderData, isFetching, isError, error } = useBuilderQuery(builderQueryParams, { skip });

  const filteredPayoffsAtTarget = useMemo(() => {

    if (!builderData) return [];

    const filtered = builderData.payoffsAtTarget.filter((item) => (
      item.at >= builderData.xMin &&
      item.at <= builderData.xMax
    ));

    return filtered;

  }, [builderData]);

  const filteredPayoffsAtExpiry = useMemo(() => {

    if (!builderData) return [];

    const filtered = builderData.payoffsAtExpiry.filter((item) => (
      item.at >= builderData.xMin &&
      item.at <= builderData.xMax
    ));

    return filtered;
    
  }, [builderData]);

  let content: ReactNode = null;

  if (activeOptionLegs.length === 0) {
    content = (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", 
        justifyContent: "center", p: 1, height: "100%", width: "100%", rowGap: 2 }}
      >
        <LineAxisIcon sx={{ fontSize: 60, color: "text.disabled" }} />
        <Typography variant="body2" color="text.primary">Add or enable option legs to visualize payoff</Typography>
      </Box>
    );
  } else {
    content = (
      <PNLChart 
        payoffsAtTarget={filteredPayoffsAtTarget}
        payoffsAtExpiry={filteredPayoffsAtExpiry}
        underlyingPrice={builderData?.underlyingPrice || 0}
        targetUnderlyingPrice={builderData?.targetUnderlyingPrice || 0}
        payoffAtTarget={builderData?.payoffAtTarget || 0}
        isFetching={isFetching}
        isError={isError}
        error={"Something went wrong"} 
      />
    );
  };


  useEffect(() => {
    if (builderData) {
      dispatch(setSBProjectedFuturePrices(builderData.projectedFuturesPrices));
    };
  }
  , [builderData]);

  return (
    <Box sx={{ display: "flex", height: "500px", width: "100%", position: "relative", 
      borderRadius: "5px", backgroundColor: "background.paper", flexDirection: "column" }}
    >
      <Box sx={{ display: "flex", height: "60px", borderBottom: 1, borderBottomColor: "divider", alignItems: "center", width: "100%", px: 2 }}>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: "bold", fontSize: { xs: "12px", sm: "16px" }}}>Profit & Loss Visualizer</Typography>
      </Box>
      <Box sx={{ display: "flex", flex: 1, width: "100%", position: "relative" }}>
        {content}
      </Box>
    </Box>
  );
};

export default PNLVisualizer