import { formatAndAddSuffix } from "../../utils";
import { Box, Typography } from "@mui/material";

type OIChangeDataBoxProps = {
  totalCallOIChange: number | null;
  totalPutOIChange: number | null;
  underlyingPrice: number | null;
};

const OIChangeDataBox = ({ totalCallOIChange, totalPutOIChange, underlyingPrice }: OIChangeDataBoxProps) => {
  return (
    <Box sx={{ display: "flex", height: "100%", justifyContent: "flex-start", alignItems: "center", columnGap: "30px", px: "20px" }}>
      {totalCallOIChange !== null && totalPutOIChange !== null && underlyingPrice !== null && (
        <>
          <Box sx={{ height: "60px", width: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography color="inherit" component="div" sx={{ fontWeight: "bold", fontSize: "12px", opacity: 0.5 }}
            >
              Puts Change
            </Typography>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "bold" }}
            >
              {formatAndAddSuffix(totalPutOIChange || 0)}
            </Typography>
          </Box>
          <Box sx={{ height: "60px", width: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography color="inherit" component="div" sx={{ fontWeight: "bold", fontSize: "12px", opacity: 0.5 }}
            >
              Calls Change
            </Typography>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "bold" }}
            >
              {formatAndAddSuffix(totalCallOIChange || 0)}
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