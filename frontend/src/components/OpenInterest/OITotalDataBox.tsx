import { formatAndAddSuffix } from "../../utils";
import { Box, Typography } from "@mui/material";

type OITotalDataBoxProps = {
  totalCallOI: number | null;
  totalPutOI: number | null;
  pcr: number | null;
  underlyingPrice: number | null;
};

const OIChangeDataBox = ({ totalCallOI, totalPutOI, pcr, underlyingPrice }: OITotalDataBoxProps) => {
  return (
    <Box sx={{ display: "flex", height: "100%", justifyContent: "flex-start", alignItems: "center", columnGap: "30px", px: "20px" }}>
      {totalCallOI !== null && totalPutOI !== null && underlyingPrice !== null && pcr !== null && (
        <>
          <Box sx={{ height: "60px", width: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography color="inherit" component="div" sx={{ fontWeight: "bold", fontSize: "12px", opacity: 0.5 }}
            >
              Puts
            </Typography>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "bold" }}
            >
              {formatAndAddSuffix(totalPutOI || 0)}
            </Typography>
          </Box>
          <Box sx={{ height: "60px", width: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography color="inherit" component="div" sx={{ fontWeight: "bold", fontSize: "12px", opacity: 0.5 }}
            >
              Calls
            </Typography>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "bold" }}
            >
              {formatAndAddSuffix(totalCallOI || 0)}
            </Typography>
          </Box>
          <Box sx={{ height: "60px", width: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography color="inherit" component="div" sx={{ fontWeight: "bold", fontSize: "12px", opacity: 0.5 }}
            >
              PCR
            </Typography>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "bold" }}
            >
              {pcr}
            </Typography>
          </Box>
          <Box sx={{ height: "60px", width: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography color="inherit" component="div" sx={{ fontWeight: "bold", fontSize: "12px", opacity: 0.5 }}
            >
              Spot Price
            </Typography>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "bold" }}
            >
              {underlyingPrice}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default OIChangeDataBox;