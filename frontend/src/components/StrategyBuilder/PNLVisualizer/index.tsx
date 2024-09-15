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
  const targetUnderlyingPrice = useSelector(getSBTargetUnderlyingPrice).value;
  const atmIVsPerExpiry = useSelector(getSBATMIVsPerExpiry);
  const futuresPerExpiry = useSelector(getSBFuturesPerExpiry);
  const optionLegs = useSelector(getSBOptionLegs);

  const activeOptionLegs = useMemo(() => {
    return getActiveOptionLegs(optionLegs);
  }, [optionLegs]);

  const targetDateTimeISOString = useSelector(getSBTargetDateTime).value;

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

  const { data: builderData, isFetching, isError } = useBuilderQuery(builderQueryParams, { skip });

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
      <Box sx={{ display: "inline-flex", height: "60px", borderBottom: 1, borderBottomColor: "divider",
        justifyContent: "space-between", alignItems: "center", width: "100%", px: 2, gap: 2 }}>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: "bold", fontSize: { xs: "12px", sm: "16px" }}}>Profit & Loss Visualizer</Typography>
        <Box sx={{ display: "flex", alignItems: "center", columnGap: "20px" }}>
          <div style={{ display: "inline-flex", columnGap: "10px", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              <Box sx={{ width: { xs: "20px", sm: "30px" }, height: { xs: "3px", sm: "4px" }, 
                backgroundColor: "primary.main", borderRadius: "5px",
                }} 
              />
            </div>
            <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }} variant="body2" color="text.primary" component="div">Target</Typography>
          </div>
          <div style={{ display: "inline-flex", columnGap: "10px", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              <Box sx={{ width: { xs: "10px", sm: "15px" }, height: { xs: "3px", sm: "4px" }, 
                backgroundColor: "payoffLine.itm", borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px", 
                }} 
              />
              <Box sx={{ width: { xs: "10px", sm: "15px" }, height: { xs: "3px", sm: "4px" }, 
                backgroundColor: "payoffLine.otm", borderRadius: "5px",
                borderTopRightRadius: "5px", borderBottomRightRadius: "5px", 
                }} 
              />
            </div>
            <Typography sx={{ fontSize: { xs: "12px", sm: "14px" } }} variant="body2" color="text.primary" component="div">Expiry</Typography>
          </div>
        </Box>
      </Box>
      <Box sx={{ display: "flex", flex: 1, width: "100%", position: "relative" }}>
        {content}
      </Box>
    </Box>
  );
};

export default PNLVisualizer