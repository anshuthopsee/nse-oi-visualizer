import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getData, getExpiries, getStrikeRange } from "../../features/selected/selectedSlice";
import { combineCurrentAndNextData, filterDataOnStrikeRange } from "../../utils";
import OIChangeDataBox from "./OIChangeDataBox";
import { Box, Typography } from "@mui/material";
import OIChart from "../Chart/OIChart";

// CONTROLS SHOULD GO IN SIDEBAR ON RESIZE

// Make a reusable bar chart that will work for OI Change, Historical OI and Total OI vs Time
// Which means, it should be configurable for negative values also and should be able to plot line over the bars

const OIChange = () => {
  const data = useSelector(getData);
  const expiries = useSelector(getExpiries);
  const strikeRange = useSelector(getStrikeRange);

  const expiryDates = useMemo(() => {
    switch (true) {
      case data && expiries.current && expiries.next:
        return [data.current?.expiryDate.slice(0, -5),
           data.next?.expiryDate.slice(0, -5)];
      case data && expiries.current && !expiries.next:
        return [data.current?.expiryDate.slice(0, -5)];
      case data && !expiries.current && expiries.next:
        return [data.next?.expiryDate.slice(0, -5)];
      default:
        return null;
    };

  }, [data, expiries.current, expiries.next]);

  const formattedData = useMemo(() => {
    if (data && data.current && data.next) {
      switch (true) {
        case expiries.current && expiries.next:
          return combineCurrentAndNextData(data);
        case expiries.current && !expiries.next:
          return data.current.data;
        case !expiries.current && expiries.next:
          return data.next.data;
        default:
          return null;
      };
    };
    return null;
  }, [data, expiries.current, expiries.next]);

  const filteredData = useMemo(() => {
    if (formattedData && strikeRange.min !== null && strikeRange.max !== null) {
      return filterDataOnStrikeRange(formattedData, strikeRange.min, strikeRange.max);
    } else {
      return null;
    };
  }, [formattedData, strikeRange.min, strikeRange.max]);

  const totalCallOIChange = useMemo(() => {
    if (filteredData) {
      return filteredData.reduce((acc, cur) => {
        return acc + (cur.CE?.changeinOpenInterest || 0);
      }, 0);
    } else {
      return null;
    };
  }, [filteredData]);

  const totalPutOIChange = useMemo(() => {
    if (filteredData) {
      return filteredData.reduce((acc, cur) => {
        return acc + (cur.PE?.changeinOpenInterest || 0);
      }, 0);
    } else {
      return null;
    };
  }, [filteredData]);

  const underlyingPrice = useMemo(() => {
    if (data) {
      return data.underlyingValue;
    } else {
      return null;
    };
  }, [filteredData]);

  return (
    <Box sx={{ height: "calc(100vh - 240px)", minHeight: "500px", 
      backgroundColor: "background.paper", borderRadius: "5px", border: 1, 
      borderColor: "divider", display: "flex", flexDirection: "column", 
      }}
    >
      <Box sx={{ height: "60px", minHeight: "60px", borderBottom: 1,
         borderBottomColor: "divider", display: "flex", alignItems: "center", 
         px: 2, justifyContent: "space-between" 
         }}
      >
        <Typography color="inherit" component="div" 
          sx={{ fontWeight: "bold", fontSize: { xs: "12px", sm: "16px" }}}
        >
          {`OI Change ${
            expiryDates ? 
              `For ${expiryDates.join(" & ").replace(/-/g, " ")} 
                ${expiryDates.length > 1 ? 
                  "Expiries" 
                    : 
                  "Expiry"
              }` 
            : 
              ""
          }`}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "inline-flex", columnGap: "10px", alignItems: "center" }}>
            <div style={{ width: "10px", height: "10px", 
              backgroundColor: "#15d458", borderRadius: "2px", 
              }} 
            />
            <Typography variant="body2" color="inherit" component="div" 
              sx={{ marginRight: "20px", whiteSpace: "nowrap" }}
            >
              Put OI
            </Typography>
          </div>
          <div style={{ display: "inline-flex", columnGap: "10px", alignItems: "center" }}>
            <div style={{ width: "10px", height: "10px", 
              backgroundColor: "#eb3434", borderRadius: "2px", 
              }} 
            />
            <Typography variant="body2" color="inherit" component="div"
              sx={{ whiteSpace: "nowrap" }}  
            >
              Call OI
            </Typography>
          </div>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <OIChart data={filteredData || []} spotPrice={underlyingPrice} type="changeinOpenInterest"/>
      </Box>
      <Box sx={{ height: "60px", width: "100%", minWidth: 0, 
        minHeight: 0, overflow: "hidden", borderTop: 1, 
        borderTopColor: "divider" 
        }}
      >
        <OIChangeDataBox 
          totalCallOIChange={totalCallOIChange} 
          totalPutOIChange={totalPutOIChange} 
          underlyingPrice={underlyingPrice}
        />
      </Box>
    </Box>
  );
};

export default OIChange;