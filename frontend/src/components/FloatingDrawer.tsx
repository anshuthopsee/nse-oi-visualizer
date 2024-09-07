import { type ReactNode } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type FloatingDrawerProps = {
  showButton: boolean;
  open: boolean;
  onChange: (open: boolean) => void;
  children: ReactNode;
};

const FloatingDrawer = ({ showButton, open, onChange, children }: FloatingDrawerProps) => {
  return (
    <>
      {showButton && <ButtonBase 
        sx={{ display: "flex", flexDirection: "column", gap: 1, backgroundColor: "primary.main", color: "primary.contrastText",
        position: "absolute", textOrientation: "sideways", writingMode: "vertical-rl", justifyContent: "center", alignItems: "center",
        height: "60px", width: "20px", borderTopRightRadius: 5, borderBottomRightRadius: 5 }}
        onClick={() => onChange(true)}
      >
        Open
      </ButtonBase>}
      <Drawer
        anchor={"left"}
        open={open}
        PaperProps={{
          sx: { maxWidth: {xs: "100%", sm: "450px"} },
        }}
        onClose={() => onChange(false)}
      >
        <Box sx={{ height: "100dvh", display: "flex", rowGap: "10px", backgroundColor: "background.default",
            flexDirection: "column", overflow: "auto", px: "10px", py: "10px", 
            position: "relative", width: "100%", minWidth: "330px" }}
          >
            <Box sx={{ pt: "60px", pb: "10px", width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>
              <Box sx={{ display: "flex", width: "100%", flex: 1, height: "auto", overflowY: "auto" }}>
                {children}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", height: "fit-content", bottom: 0, position: "relative" }}>
                <IconButton onClick={() => onChange(false)}>
                  <ArrowBackIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
      </Drawer>
    </>
  );
};

export default FloatingDrawer;