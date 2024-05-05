import { useMemo } from "react";
import { type TransformedData } from "../../app/services/openInterest";
import { type Expiries, StrikeRange } from "../../features/selected/types";
import { combineSelectedExpiriesData, filterDataOnStrikeRange, getExpiryDatesHeader } from "../../utils";
import OIChangeDataBox from "./OIChangeDataBox";
import { Box, Typography } from "@mui/material";
import OIChart from "../Chart/OIChart";

type OIChangeProps = {
  data: TransformedData | null;
  expiries: Expiries;
  strikeRange: StrikeRange;
  isFetching: boolean;
  isError: boolean;
};

const OIChange = ({ data, expiries, strikeRange, isFetching, isError }: OIChangeProps) => {

  const expiryDates = useMemo(() => {
    switch (true) {
      case expiries !== null:
        const chosenExpiryDates = expiries.reduce<string[]>((acc, { chosen, date }) => {
          if (chosen) {
              acc.push(date.slice(0, -5));
          }
          return acc;
        }, []);

        return chosenExpiryDates;
      default:
        return null;
    };

  }, [expiries]);

  const formattedData = useMemo(() => {
    if (data && data.grouped) {
      switch (true) {
        case expiries !== null:
          const chosenExpiries = expiries.reduce<string[]>((acc, { chosen, date }) => {
            if (chosen) {
                acc.push(date);
            }
            return acc;
        }, []);
          return combineSelectedExpiriesData(data, chosenExpiries);
        default:
          return null;
      };
    };
    return null;
  }, [data, expiries]);

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
          {expiryDates && getExpiryDatesHeader("OI Change for", expiryDates)}
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
        <OIChart 
          data={filteredData || []} 
          spotPrice={underlyingPrice} 
          type="changeinOpenInterest"
          isFetching={isFetching}
          isError={isError}
        />
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