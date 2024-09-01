import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

type LoadingOverlayProps = {
  message?: string;
  type?: "page" | "component";
  isError: boolean;
};

const LoadingOverlay = ({ message, type = "component", isError }: LoadingOverlayProps) => {

  if (type === "page") {
    return (
      <Box sx={{ display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth: "300px", height: "fit-content", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {isError ? (
          <>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "normal", m: 1 }}>Failed to fetch data. Refresh the page.</Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              {message || "Loading..."}
            </Typography>
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          </>
        )}
        </Box>
      </Box>
    );
  };
  
  return (
    <div style={{ position: "absolute", height: "100%", width: "100%", zIndex: 1, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(3px)" }}>
      <Box sx={{ position: "relative", height: "100%", width: "100%", backgroundColor: "background.paper", opacity: 0.7 }}/>
      <Box sx={{ position: "absolute", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        {isError ? (
          <>
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "normal", m: 1 }}>Failed to fetch data. Refresh the page.</Typography>
          </>
        ) : (
          <>
            <CircularProgress />
            <Typography variant="body1" color="inherit" component="div" sx={{ fontWeight: "normal", m: 1 }}>{message || "Fetching data..."}</Typography>
          </>
        )}
      </Box>
    </div>
  );
};

export default LoadingOverlay;