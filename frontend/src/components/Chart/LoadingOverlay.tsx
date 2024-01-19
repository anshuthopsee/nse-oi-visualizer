import { Box, CircularProgress, Typography } from "@mui/material";
import { type RequestStatus } from "../../features/selected/selectedSlice";

type LoadingOverlayProps = {
  requestStatus: RequestStatus,
};

const LoadingOverlay = ({ requestStatus }: LoadingOverlayProps) => {
  
  if (requestStatus === "succeeded") return;

  return (
    <div style={{ position: "absolute", height: "100%", width: "100%", zIndex: 9, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(3px)" }}>
      <Box sx={{ position: "relative", height: "100%", width: "100%", backgroundColor: "background.paper", opacity: 0.7 }}/>
      <Box sx={{ position: "absolute", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        {requestStatus === "loading" && (
          <>
            <CircularProgress />
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "normal", m: 1 }}>Fetching data...</Typography>
          </>
        )}
        {requestStatus === "failed" && (
          <>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "normal", m: 1 }}>Failed to fetch data. Refresh the page.</Typography>
          </>
        )}
      </Box>
    </div>
  );
};

export default LoadingOverlay;